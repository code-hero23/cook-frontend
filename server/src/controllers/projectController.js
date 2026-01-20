const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all projects
// Get all projects (Optional: Filter by employee)
exports.getProjects = async (req, res) => {
    try {
        const { employeeId } = req.query;

        const filter = {};
        if (employeeId) {
            filter.OR = [
                {
                    assignedEmployees: {
                        some: {
                            id: employeeId
                        }
                    }
                },
                {
                    tasks: {
                        some: {
                            employeeId: employeeId
                        }
                    }
                }
            ];
        }

        const projects = await prisma.project.findMany({
            where: filter,
            include: { tasks: true, assignedEmployees: true } // Include tasks for stats
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Correct import
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

// Create new project
exports.createProject = async (req, res) => {
    try {
        const rawData = req.body;

        // Sanitize Data (Backend Hardening)
        const data = { ...rawData };

        if (data.budget) data.budget = parseFloat(data.budget);
        if (data.timelineDuration) data.timelineDuration = parseInt(data.timelineDuration, 10);
        if (data.latitude) data.latitude = parseFloat(data.latitude);
        if (data.longitude) data.longitude = parseFloat(data.longitude);

        // Handle Dates
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.deadline) data.deadline = new Date(data.deadline);

        // Clean up empty strings for optional/unique fields to avoid Prisma errors
        ['cpNumber', 'gstin', 'spouseName', 'spousePhone', 'location'].forEach(field => {
            if (data[field] === "") delete data[field];
        });

        // Auto-generate Project Code (Robust Collision Handling)
        let nextCode = 'PRJ-001';
        let isUnique = false;

        // 1. Try to guess based on latest project code
        const lastProject = await prisma.project.findFirst({
            orderBy: { projectCode: 'desc' }, // Use projectCode instead of createdAt
            select: { projectCode: true }
        });

        if (lastProject && lastProject.projectCode) {
            const matches = lastProject.projectCode.match(/PRJ-(\d+)/);
            if (matches && matches[1]) {
                const nextNum = parseInt(matches[1], 10) + 1;
                nextCode = `PRJ-${String(nextNum).padStart(3, '0')}`;
            }
        }

        // 2. Verify uniqueness loop (Fail-safe)
        while (!isUnique) {
            const existing = await prisma.project.findUnique({
                where: { projectCode: nextCode }
            });

            if (!existing) {
                isUnique = true;
            } else {
                // If collision, increment
                const matches = nextCode.match(/PRJ-(\d+)/);
                if (matches && matches[1]) {
                    const nextNum = parseInt(matches[1], 10) + 1;
                    nextCode = `PRJ-${String(nextNum).padStart(3, '0')}`;
                } else {
                    // Fallback if parsing fails weirdly
                    nextCode = `PRJ-${Date.now().toString().slice(-4)}`; // Emergency fallback
                    isUnique = true;
                }
            }
        }

        data.projectCode = nextCode;

        if (data.clientPassword) {
            data.clientPassword = await bcrypt.hash(data.clientPassword, 10);
        }
        const project = await prisma.project.create({
            data: data,
            include: { tasks: true, assignedEmployees: true } // Include for consistency
        });

        // Seed Predefined Tasks
        // await seedProjectTasks(project.id);

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get single project
exports.getProjectById = async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { tasks: true }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const rawData = req.body;

        // Remove known relation/system fields that cause Prisma update errors
        const {
            tasks,
            assignedEmployees,
            id,
            createdAt,
            updatedAt,
            ...cleanData
        } = rawData;

        const data = { ...cleanData };

        // Sanitize types
        if (data.budget) data.budget = parseFloat(data.budget);
        if (data.timelineDuration) data.timelineDuration = parseInt(data.timelineDuration, 10);
        if (data.latitude) data.latitude = parseFloat(data.latitude);
        if (data.longitude) data.longitude = parseFloat(data.longitude);
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.deadline) data.deadline = new Date(data.deadline);

        // Sanitization: Unify Status Casing
        if (data.status) {
            data.status = data.status.toUpperCase();
        }

        // Clean empty optional fields
        ['cpNumber', 'gstin', 'spouseName', 'spousePhone', 'location'].forEach(field => {
            if (data[field] === "") delete data[field];
        });

        // Prevent updating projectCode to the same value (Prisma bug/quirk avoidance)
        // or attempting to hijack another project code
        if (data.projectCode) {
            const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
            if (existing && existing.projectCode === data.projectCode) {
                delete data.projectCode; // Don't update if same
            } else {
                // If changing, ensure new code is unique
                const duplicate = await prisma.project.findUnique({ where: { projectCode: data.projectCode } });
                if (duplicate) {
                    return res.status(400).json({ error: `Project Code ${data.projectCode} is already taken.` });
                }
            }
        }

        if (data.clientPassword) {
            data.clientPassword = await bcrypt.hash(data.clientPassword, 10);
        }
        const project = await prisma.project.update({
            where: { id: req.params.id },
            data: data,
            include: { tasks: true, assignedEmployees: true } // Include for consistency
        });
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



// Update Project Payment & Log Transaction
exports.updateProjectPayment = async (req, res) => {
    console.log("updateProjectPayment called with body:", req.body);
    try {
        const { percentage, amount, date, time, mode, verifiedBy } = req.body;
        const projectId = req.params.id;

        // Validation
        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }
        if (percentage === undefined || percentage === null || !date || !mode || !verifiedBy) {
            console.error("Missing required fields:", { percentage, date, mode, verifiedBy });
            return res.status(400).json({ error: "Missing required payment details (Percentage, Date, Mode, Verified By)" });
        }

        const parsedPercentage = parseInt(percentage);
        if (isNaN(parsedPercentage)) {
            return res.status(400).json({ error: "Invalid percentage value" });
        }

        const parsedAmount = amount ? parseFloat(amount) : null;
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        console.log(`Processing payment for Project ${projectId}: ${parsedPercentage}%`);

        // Transaction: Update Project + Create Log
        const result = await prisma.$transaction([
            prisma.project.update({
                where: { id: projectId },
                data: { paymentPercentage: parsedPercentage }
            }),
            prisma.paymentTransaction.create({
                data: {
                    projectId,
                    percentage: parsedPercentage,
                    amount: parsedAmount,
                    date: parsedDate,
                    time,
                    mode,
                    verifiedBy
                }
            })
        ]);

        console.log("Payment updated successfully:", result);
        res.json({ message: "Payment recorded and project phase updated", project: result[0] });

    } catch (error) {
        console.error("Payment Update Error (Detailed):", error);
        // Check for specific Prisma errors
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Project not found" });
        }
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};



// Get Project Payment History
exports.getProjectPayments = async (req, res) => {
    try {
        const projectId = req.params.id;
        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        const payments = await prisma.paymentTransaction.findMany({
            where: { projectId: projectId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payments);
    } catch (error) {
        console.error("Get Payment History Error:", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

// Start of DELETE
exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        // 1. Manually clean up relations that don't have onDelete: Cascade in schema
        // Specifically: TaskEvidence linked to Tasks linked to this Project

        // Find all tasks for this project
        const projectTasks = await prisma.task.findMany({
            where: { projectId: projectId },
            select: { id: true }
        });

        const taskIds = projectTasks.map(t => t.id);

        if (taskIds.length > 0) {
            // Delete all evidence for these tasks
            await prisma.taskEvidence.deleteMany({
                where: { taskId: { in: taskIds } }
            });
        }

        // 2. Now delete the project (Cascade should handle the rest: Tasks, Tickets, etc.)
        await prisma.project.delete({
            where: { id: projectId }
        });

        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Generate Secure Access Link (Magic Code)
exports.generateAccessLink = async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Generate Random 8-char Code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Expire in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.magicLink.create({
            data: {
                code,
                projectId: project.id,
                expiresAt
            }
        });

        // Return ONLY the code (Frontend constructs the URL)
        // URL format: domain.com/client/login?code=CODE
        res.json({ code });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify Magic Link
exports.verifyMagicLink = async (req, res) => {
    try {
        const { code } = req.params;

        const magicLink = await prisma.magicLink.findUnique({
            where: { code },
            include: { project: true }
        });

        if (!magicLink) {
            return res.status(404).json({ message: 'Invalid or expired link' });
        }

        if (new Date() > magicLink.expiresAt) {
            return res.status(410).json({ message: 'Link has expired' });
        }

        // Return Project Data (Same as login response)
        const token = jwt.sign(
            { id: magicLink.projectId, role: 'CLIENT', projectCode: magicLink.project.projectCode, name: magicLink.project.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            project: magicLink.project
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper to seed tasks
async function seedProjectTasks(projectId) {
    const STAGES = {
        "Freezing Mail": [
            "Client Details", "Floor Plan", "Initial Estimate Options",
            "Finalized Variants & Initial Quote", "Initial Schematic Proposal",
            "Blurred DWG", "Payment Gateway", "Booking Docs"
        ],
        "Approval of finalized designs": [
            "PDI Reports", "FM taken by AE", "2D Drawing",
            "3D Rendered Images", "Production Payment", "Approval of Finalized Designs"
        ],
        "Production": [
            "Quality Check Process"
        ],
        "Installation": [
            "Installation Work", "Completion Certificate"
        ]
    };

    const tasksToCreate = [];

    Object.entries(STAGES).forEach(([stage, taskTitles]) => {
        taskTitles.forEach(title => {
            tasksToCreate.push({
                projectId,
                title,
                stage,
                status: "PENDING",
                priority: "MEDIUM",
                type: "TASK"
            });
        });
    });

    if (tasksToCreate.length > 0) {
        await prisma.task.createMany({ data: tasksToCreate });
    }
};

// Parse Google Maps Link
const axios = require('axios');

exports.parseLocation = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        console.log(`[GeoParser] resolving: ${url}`);

        // 1. Resolve Short URL (e.g. maps.app.goo.gl)
        let resolvedUrl = url;
        if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
            try {
                const response = await axios.head(url, { maxRedirects: 5, validateStatus: null });
                resolvedUrl = response.request.res.responseUrl || url;
                console.log(`[GeoParser] resolved to: ${resolvedUrl}`);
            } catch (err) {
                console.warn("[GeoParser] Failed to resolve short URL:", err.message);
            }
        }

        // 2. Extract Coordinates via Regex
        const patterns = [
            /@(-?\d+\.\d+),(-?\d+\.\d+)/,       // https://.../@12.34,56.78...
            /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,  // https://...?q=12.34,56.78
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/    // Data parameters in embed URLs
        ];

        let lat, lng;
        for (let pattern of patterns) {
            const match = resolvedUrl.match(pattern);
            if (match) {
                lat = parseFloat(match[1]);
                lng = parseFloat(match[2]);
                break;
            }
        }

        if (lat && lng) {
            res.json({ latitude: lat, longitude: lng, resolvedUrl });
        } else {
            res.status(422).json({ error: "Could not extract coordinates from this link." });
        }

    } catch (error) {
        console.error("[GeoParser] Error:", error);
        res.status(500).json({ error: error.message });
    }
};
