const { PrismaClient } = require('@prisma/client');
const { logActivity } = require('./activityController');
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

        // ------------------------------------------------------------------
        // NEW: Auto-Close Project Logic
        // ------------------------------------------------------------------
        // When "Completion Certificate" is COMPLETED, set Project Status to COMPLETED
        if (task.title === "Completion Certificate" && task.status === "COMPLETED") {
            await prisma.project.update({
                where: { id: task.projectId },
                data: {
                    status: "COMPLETED",
                    handoverDate: new Date()
                }
            });
            console.log(`[Auto-Close] Project ${task.projectId} marked as COMPLETED via Task ${task.id}`);
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

        // 3. Log Activity if completed
        if (task.status === "COMPLETED") {
            await logActivity(task.projectId, `${task.title} marked as completed`, "TASK", task.id);

            // 4. Notify Admins
            try {
                // Fetch full task details with Project and Employee info for the email content
                const fullTask = await prisma.task.findUnique({
                    where: { id: task.id },
                    include: {
                        project: true,
                        employee: true
                    }
                });

                if (fullTask) {
                    const admins = await prisma.user.findMany({
                        where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] }, status: 'ACTIVE' }
                    });

                    // Determine who completed it (Employee or system)
                    const completorName = fullTask.employee ? fullTask.employee.name : "An employee";
                    const projectName = fullTask.project ? fullTask.project.name : "Unknown Project";

                    for (const admin of admins) {
                        // Don't send email to the person who did the action (e.g. if Admin marked it completed themselves)
                        if (fullTask.employeeId && admin.id === fullTask.employeeId) continue;

                        await prisma.email.create({
                            data: {
                                senderId: fullTask.employeeId || admin.id, // If no employee, sender is self (internal system msg) - or better, use the first admin found as sender if needed, but here senderId references User table.
                                // Actually, senderId MUST exist. If employeeId is null, use the admin themselves or a system user?
                                // Let's use the admin being notified as the "sender" if employee is missing (system notification), or reuse a known system ID if we had one.
                                // Safe fallback: if fullTask.employeeId exists, use it. If not, use admin.id (internal note to self).
                                senderId: fullTask.employeeId || admin.id,
                                receiverId: admin.id,
                                subject: `Task Completed: ${fullTask.title} (${projectName})`,
                                content: `Task Completion Report:\n\nTask: ${fullTask.title}\nProject: ${projectName}\nCompleted By: ${completorName}\nTime: ${new Date().toLocaleString()}\n\nThe task has been successfully marked as completed.`,
                                isRead: false
                            }
                        });
                    }
                    console.log(`[Notification] Task Completion email sent to ${admins.length} admins.`);
                }
            } catch (emailErr) {
                console.error("[Notification] Failed to send admin completion email:", emailErr);
            }
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
