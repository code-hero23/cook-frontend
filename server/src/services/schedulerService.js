const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to check overdue tasks and send notifications
const checkOverdueTasks = async () => {
    console.log('[Scheduler] Checking for overdue tasks...');
    try {
        const now = new Date();

        // Find tasks that are NOT completed and due date is in the past
        const overdueTasks = await prisma.task.findMany({
            where: {
                status: { not: 'COMPLETED' },
                dueDate: { lt: now }, // lt = less than now
                employeeId: { not: null } // Only if assigned
            },
            include: {
                employee: true,
                project: true
            }
        });

        if (overdueTasks.length === 0) {
            console.log('[Scheduler] No overdue tasks found.');
            return { count: 0, message: "No overdue tasks found" };
        }

        console.log(`[Scheduler] Found ${overdueTasks.length} overdue tasks.`);

        // Find a system sender (Admin)
        const sender = await prisma.user.findFirst({
            where: { role: { in: ['SUPER_ADMIN', 'MANAGER', 'ADMIN'] } }
        });

        if (!sender) {
            console.error('[Scheduler] No Admin found to send emails.');
            return { count: 0, error: "No admin found" };
        }

        let emailCount = 0;

        for (const task of overdueTasks) {
            // Check if we already sent a notification recently? 
            // For MVP, we'll just send it. In a real app, maybe check if email was sent today.
            // But let's assume this runs once a day, so it's fine.

            await prisma.email.create({
                data: {
                    senderId: sender.id,
                    receiverId: task.employeeId,
                    subject: `Overdue Task Alert: ${task.title}`,
                    content: `ACTION REQUIRED\n\nThe task "${task.title}" for project "${task.project.name}" was due on ${new Date(task.dueDate).toLocaleDateString()}.\n\nPlease update the status or complete it immediately.\n\nTask ID: ${task.project.projectCode}-${task.id}`,
                    isRead: false
                }
            });
            emailCount++;
        }

        console.log(`[Scheduler] Sent ${emailCount} overdue notifications.`);
        return { count: emailCount, message: `Sent ${emailCount} notifications` };

    } catch (error) {
        console.error('[Scheduler] Error checking overdue tasks:', error);
        return { error: error.message };
    }
};

// Initialize Scheduler
const initScheduler = () => {
    // 0 5 * * * = At 05:00 AM everyday
    cron.schedule('0 5 * * *', () => {
        console.log('[Scheduler] Running daily overdue task check...');
        checkOverdueTasks();
    });
    console.log('[Scheduler] Overdue Task Job Initialized (Daily at 5:00 AM)');
};

module.exports = {
    initScheduler,
    checkOverdueTasks
};
