const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fixing 'Initial Estimate Options' task...");

        // 1. Find the task
        const task = await prisma.task.findFirst({
            where: { title: { contains: 'Initial Estimate Options' } },
            include: { project: true }
        });

        if (!task) {
            console.log("Task not found.");
            return;
        }

        console.log(`Found Task: ${task.title} (Project: ${task.project?.name})`);

        // 2. Update Evidence
        const lat = 13.0490;
        const lng = 80.2116;

        const evidenceUpdate = await prisma.taskEvidence.updateMany({
            where: { taskId: task.id },
            data: { latitude: lat, longitude: lng }
        });

        console.log(`Updated ${evidenceUpdate.count} evidence records to Vadapalani.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
