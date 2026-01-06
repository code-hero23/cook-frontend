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
        const data = { ...rawData };

        // Sanitize types
        if (data.budget) data.budget = parseFloat(data.budget);
        if (data.timelineDuration) data.timelineDuration = parseInt(data.timelineDuration, 10);
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.deadline) data.deadline = new Date(data.deadline);

        // Clean empty optional fields
        ['cpNumber', 'gstin', 'spouseName', 'spousePhone', 'location'].forEach(field => {
            if (data[field] === "") delete data[field];
        });

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

// Delete project
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

// Generate Secure Access Link
exports.generateAccessLink = async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Generate Token (Valid for 7 Days for "Access Links")
        const token = jwt.sign(
            { id: project.id, role: 'CLIENT', projectCode: project.projectCode, name: project.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/login?token=${token}` });

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
