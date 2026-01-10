const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const projectId = "076c09ac-a662-4d80-8654-46a8adf49ff0";

    const completedTasks = await prisma.task.findMany({
        where: {
            projectId: projectId,
            status: "COMPLETED"
        }
    });

    console.log(`Backfilling ${completedTasks.length} tasks...`);

    for (const task of completedTasks) {
        // Check if log already exists
        const exists = await prisma.activityLog.findFirst({
            where: { taskId: task.id }
        });

        if (!exists) {
            await prisma.activityLog.create({
                data: {
                    projectId: task.projectId,
                    message: `${task.title} marked as completed`,
                    category: "TASK",
                    taskId: task.id,
                    createdAt: task.updatedAt // Use the task's update time as the log time
                }
            });
            console.log(`Created log for: ${task.title}`);
        } else {
            console.log(`Log already exists for: ${task.title}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
