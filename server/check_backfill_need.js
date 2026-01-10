const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const projectId = "076c09ac-a662-4d80-8654-46a8adf49ff0"; // From previous context

    const completedTasks = await prisma.task.findMany({
        where: {
            projectId: projectId,
            status: "COMPLETED"
        }
    });

    console.log(`Found ${completedTasks.length} completed tasks for project ${projectId}.`);

    const existingLogs = await prisma.activityLog.count({
        where: { projectId: projectId }
    });
    console.log(`Found ${existingLogs} existing activity logs.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
