const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get tasks (with optional filtering)
exports.getTasks = async (req, res) => {
    try {
        console.log("GET /api/tasks hit with query:", req.query);
        const { projectId, employeeId, type } = req.query;

        const filter = {};
        if (projectId) filter.projectId = projectId;
        if (employeeId) filter.employeeId = employeeId;
        if (type) filter.type = type;

        const tasks = await prisma.task.findMany({
            where: filter,
            include: {
                project: true, // Fetch full project details including location
                employee: { select: { name: true } },
                evidence: true, // Fetch evidence for real completion location
                documents: true // Fetch linked documents
            }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new task
exports.createTask = async (req, res) => {
    try {
        const { startDate, dueDate, ...otherData } = req.body;

        const taskData = {
            ...otherData,
            startDate: startDate ? new Date(startDate) : undefined,
            dueDate: dueDate ? new Date(dueDate) : undefined
        };

        const task = await prisma.task.create({
            data: taskData
        });

        // Notify employee via Email System
        if (req.body.employeeId) {
            try {
                // Find a sender (Admin or Manager)
                const sender = await prisma.user.findFirst({
                    where: { role: { in: ['SUPER_ADMIN', 'MANAGER', 'ADMIN'] } } // Added ADMIN just in case
                });

                if (sender) {
                    await prisma.email.create({
                        data: {
                            senderId: sender.id,
                            receiverId: req.body.employeeId,
                            subject: `New Task Assigned: ${task.title}`,
                            content: `You have been assigned a new task.\n\nType: ${task.type}\nPriority: ${task.priority}\nDue Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}\n\nDescription: ${task.description || 'No description provided.'}`,
                            isRead: false
                        }
                    });
                    console.log(`[Notification] Email sent to Employee ${req.body.employeeId} from ${sender.name}`);
                } else {
                    console.warn(`[Notification] Could not find an admin to send the notification email.`);
                }
            } catch (notifyError) {
                console.error(`[Notification] Failed to send email notification:`, notifyError);
            }
        }

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const {
            completionFileUrl,
            completionFileName,
            id,
            createdAt,
            updatedAt,
            project,
            employee,
            ticket,
            evidence,
            completedAt, // if handled separately
            ...allowedUpdates
        } = req.body;

        // 1. Update the task
        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: {
                ...allowedUpdates,
                completionFileUrl,
                completionFileName,
                // Ensure dates are parsed if string
                startDate: allowedUpdates.startDate ? new Date(allowedUpdates.startDate) : undefined,
                dueDate: allowedUpdates.dueDate ? new Date(allowedUpdates.dueDate) : undefined,
            }
        });

        // ------------------------------------------------------------------
        // NEW: Auto-Start Project Timeline Logic
        // ------------------------------------------------------------------
        // When "Approval of Finalized Designs" is COMPLETED, set Project Start Date
        if (task.title === "Approval of Finalized Designs" && task.status === "COMPLETED") {
            await prisma.project.update({
                where: { id: task.projectId },
                data: { startDate: new Date() }
            });
            console.log(`[Auto-Start] Project ${task.projectId} timeline started via Task ${task.id}`);
        }

        // 2. If a file was uploaded as proof, auto-add to Project Documents so Client sees it
        if (completionFileUrl && completionFileName) {
            await prisma.projectDocument.create({
                data: {
                    name: `Proof: ${task.title}`,
                    url: completionFileUrl,
                    projectId: task.projectId
                }
            });
            console.log(`[Auto-Doc] Created ProjectDocument for Task ${task.id}`);
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        await prisma.task.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Simulate Overdue Check (Dev/Admin Tool)
const { checkOverdueTasks } = require('../services/schedulerService');
exports.simulateOverdue = async (req, res) => {
    try {
        const result = await checkOverdueTasks();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
