const { PrismaClient } = require('@prisma/client');
const { logActivity } = require('./activityController');
const { sendNotificationEmail, getEmailTemplate } = require('../services/emailService');
const { sendUserPushNotification } = require('../services/notificationService');
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

                    // [GMAIL INTEGRATION] Send Real Email
                    const emp = await prisma.user.findUnique({ where: { id: req.body.employeeId } });
                    if (emp && emp.email) {
                        await sendNotificationEmail(
                            emp.email,
                            `New Task Assigned: ${task.title}`,
                            `You have been assigned a new task.\n\nPriority: ${task.priority}\nDue: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}`,
                            getEmailTemplate(
                                `New Task Assigned: ${task.title}`,
                                `<p style="font-size: 16px;">You have been assigned a new task by <strong>${sender.name}</strong>.</p>
                                 <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0 0 10px;"><strong>Type:</strong> ${task.type}</p>
                                    <p style="margin: 0 0 10px;"><strong>Priority:</strong> <span style="color: ${task.priority === 'HIGH' ? 'red' : 'orange'};">${task.priority}</span></p>
                                    <p style="margin: 0;"><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}</p>
                                 </div>
                                 <p style="font-weight: bold; margin-bottom: 5px;">Description:</p>
                                 <p style="background-color: #fff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-style: italic;">${task.description || 'No description provided.'}</p>
                                 <div style="text-align: center; margin-top: 24px;">
                                    <a href="#" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Task in Dashboard</a>
                                 </div>`
                            ),
                            "admin@orbix.com"
                        );
                    }

                    // [PUSH NOTIFICATION]
                    try {
                        await sendUserPushNotification(
                            req.body.employeeId,
                            `New Task Assigned!`,
                            `Task: ${task.title} (${task.priority})`
                        );
                    } catch (pushErr) {
                        console.error("[Notification] Push failed:", pushErr);
                    }

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

                        // [GMAIL INTEGRATION] Send Real Email
                        if (admin.email) {
                            await sendNotificationEmail(
                                admin.email,
                                `Task Completed: ${fullTask.title}`,
                                `Project: ${projectName}\nCompleted By: ${completorName}\n\nThe task has been marked as completed.`,
                                getEmailTemplate(
                                    `Task Completed: ${fullTask.title}`,
                                    `<p style="font-size: 16px; margin-bottom: 24px;">The task has been marked as <strong>COMPLETED</strong>.</p>
                                     <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Project</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${projectName}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Completed By</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${completorName}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Completion Time</td>
                                            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${new Date().toLocaleString()}</td>
                                        </tr>
                                     </table>
                                     <div style="text-align: center;">
                                        <a href="#" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review Task</a>
                                     </div>`
                                ),
                                "admin@orbix.com"
                            );
                        }
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
