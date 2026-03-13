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
            include: {
                tasks: true,
                assignedEmployees: true,
                businessHead: { select: { id: true, name: true, email: true } },
                fa: { select: { id: true, name: true, email: true } },
                la: { select: { id: true, name: true, email: true } }
            } // Include tasks for stats and related users
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

        // Clean up empty/whitespace strings for optional fields to avoid Unique Constraint errors
        ['cpNumber', 'gstin', 'spouseName', 'spousePhone', 'location', 'businessHeadId', 'propertyType', 'scopeOfWork', 'leadSource', 'salesRep', 'faId', 'laId', 'unitNumber', 'block', 'floor', 'area'].forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === "") || data[field] === "null" || data[field] === "undefined") {
                data[field] = null; // Explicitly set to null to avoid Prisma unique constraint errors for empty strings
            } else if (typeof data[field] === 'string') {
                data[field] = data[field].trim();
            }
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
            include: {
                tasks: true,
                assignedEmployees: true,
                businessHead: { select: { id: true, name: true, email: true } },
                fa: { select: { id: true, name: true, email: true } },
                la: { select: { id: true, name: true, email: true } }
            } // Include for consistency
        });

        // Seed Predefined Tasks
        // await seedProjectTasks(project.id);

        res.status(201).json(project);
    } catch (error) {
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            return res.status(400).json({ error: `Unique constraint failed: A project with this ${target.join(', ')} already exists.` });
        }
        res.status(400).json({ error: error.message });
    }
};

// Get single project
exports.getProjectById = async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                tasks: true,
                assignedEmployees: true,
                businessHead: { select: { id: true, name: true, email: true } },
                fa: { select: { id: true, name: true, email: true } },
                la: { select: { id: true, name: true, email: true } }
            }
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
            businessHead,
            fa,
            la,
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
        ['cpNumber', 'gstin', 'spouseName', 'spousePhone', 'location', 'businessHeadId', 'propertyType', 'scopeOfWork', 'leadSource', 'salesRep', 'faId', 'laId', 'unitNumber', 'block', 'floor', 'area'].forEach(field => {
            if (data[field] === "" || (typeof data[field] === 'string' && data[field].trim() === "") || data[field] === "null" || data[field] === "undefined") {
                data[field] = null;
            } else if (typeof data[field] === 'string') {
                data[field] = data[field].trim();
            }
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
            include: {
                tasks: true,
                assignedEmployees: true,
                businessHead: { select: { id: true, name: true, email: true } },
                fa: { select: { id: true, name: true, email: true } },
                la: { select: { id: true, name: true, email: true } }
            } // Include for consistency
        });
        res.json(project);
    } catch (error) {
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            return res.status(400).json({ error: `Unique constraint failed: A project with this ${target.join(', ')} already exists.` });
        }
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

// Bulk Create Projects
exports.bulkCreateProjects = async (req, res) => {
    try {
        const projectsData = req.body;
        if (!Array.isArray(projectsData) || projectsData.length === 0) {
            return res.status(400).json({ error: "Invalid data format. Expected an array of projects." });
        }

        const stats = { added: 0, skipped: 0, errors: [] };

        // 1. Fetch all users to create a lookup map for name/email to ID
        const allUsers = await prisma.user.findMany({
            select: { id: true, email: true, name: true }
        });

        const userLookup = {};
        allUsers.forEach(u => {
            if (u.email) userLookup[u.email.toLowerCase()] = u.id;
            if (u.name) userLookup[u.name.toLowerCase()] = u.id;
            userLookup[u.id.toLowerCase()] = u.id; // Also allow raw ID if provided
        });

        const resolveUserId = (input) => {
            if (!input) return null;
            const key = String(input).trim().toLowerCase();
            return userLookup[key] || null;
        };

        // 1. Get latest project code to start incrementing
        const lastProject = await prisma.project.findFirst({
            orderBy: { projectCode: 'desc' },
            select: { projectCode: true }
        });

        let lastCodeNum = 0;
        if (lastProject && lastProject.projectCode) {
            const matches = lastProject.projectCode.match(/PRJ-(\d+)/);
            if (matches && matches[1]) {
                lastCodeNum = parseInt(matches[1], 10);
            }
        }

        // 2. Process projects one by one
        for (const data of projectsData) {
            try {
                // Validation
                if (!data.name || !data.clientFirstName || !data.clientLastName || !data.clientEmail || !data.clientPhone) {
                    stats.errors.push(`Row missing required fields: ${data.name || 'Unnamed'}`);
                    continue;
                }

                // Check for existing CP Number to avoid crash
                if (data.cpNumber) {
                    const existing = await prisma.project.findUnique({ where: { cpNumber: data.cpNumber } });
                    if (existing) {
                        stats.errors.push(`Duplicate CP Number ${data.cpNumber} for project: ${data.name}`);
                        continue;
                    }
                }

                // Auto-generate Code
                lastCodeNum++;
                const projectCode = `PRJ-${String(lastCodeNum).padStart(3, '0')}`;

                const sanitizedData = { ...data };

                // Resolve Foreign Keys (BH, FA, LA)
                sanitizedData.businessHeadId = resolveUserId(sanitizedData.businessHeadId);
                sanitizedData.faId = resolveUserId(sanitizedData.faId);
                sanitizedData.laId = resolveUserId(sanitizedData.laId);

                // Cleanup empty optional strings
                const optionalFields = [
                    'cpNumber', 'gstin', 'spouseName', 'spousePhone', 'location',
                    'businessHeadId', 'propertyType', 'scopeOfWork', 'leadSource',
                    'salesRep', 'faId', 'laId', 'billingName', 'billingAddress',
                    'billingPhone', 'handingOverMonth', 'handingOverYear', 'status',
                    'unitNumber', 'block', 'floor', 'area'
                ];

                optionalFields.forEach(field => {
                    if (!sanitizedData[field] || (typeof sanitizedData[field] === 'string' && sanitizedData[field].trim() === "") || sanitizedData[field] === "null" || sanitizedData[field] === "undefined") {
                        sanitizedData[field] = null;
                    } else if (typeof sanitizedData[field] === 'string') {
                        sanitizedData[field] = sanitizedData[field].trim();
                    }
                });

                // Numeric Types
                if (sanitizedData.budget) sanitizedData.budget = parseFloat(sanitizedData.budget) || null;
                if (sanitizedData.timelineDuration) sanitizedData.timelineDuration = parseInt(sanitizedData.timelineDuration, 10) || 45;
                if (sanitizedData.latitude) sanitizedData.latitude = parseFloat(sanitizedData.latitude) || null;
                if (sanitizedData.longitude) sanitizedData.longitude = parseFloat(sanitizedData.longitude) || null;
                if (sanitizedData.paymentPercentage) sanitizedData.paymentPercentage = parseInt(sanitizedData.paymentPercentage, 10) || 0;
                if (sanitizedData.executionPercentage) sanitizedData.executionPercentage = parseInt(sanitizedData.executionPercentage, 10) || 0;

                // Date Types
                const dateFields = ['startDate', 'deadline', 'handoverDate'];
                dateFields.forEach(field => {
                    if (sanitizedData[field]) {
                        const d = new Date(sanitizedData[field]);
                        sanitizedData[field] = !isNaN(d.getTime()) ? d : null;
                    } else {
                        sanitizedData[field] = null;
                    }
                });

                // Password
                const passwordHash = await bcrypt.hash(data.clientPassword || 'cookscape123', 10);

                await prisma.project.create({
                    data: {
                        ...sanitizedData,
                        projectCode,
                        clientPassword: passwordHash
                    }
                });

                stats.added++;

            } catch (error) {
                console.error("Bulk Item Error:", error);
                if (error.code === 'P2002') {
                    stats.errors.push(`Duplicate value error (Project Code or CP Number) for: ${data.name}`);
                } else if (error.code === 'P2003') {
                    stats.errors.push(`Invalid User Reference (BH, FA, or LA not found) for: ${data.name}`);
                } else {
                    stats.errors.push(`Row error: ${data.name} - ${error.message}`);
                }
            }
        }

        res.json({ success: true, ...stats });

    } catch (error) {
        console.error("Bulk Import Error:", error);
        res.status(500).json({ error: "Bulk import failed: " + error.message });
    }
};
