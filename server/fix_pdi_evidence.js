const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const taskId = '81e4b13e-d896-4ef7-8c7f-31692b34bafd';
        // Vadapalani Coords
        const lat = 13.0490;
        const lng = 80.2116;

        console.log(`Updating evidence for Task ${taskId} to Vadapalani...`);

        const result = await prisma.taskEvidence.updateMany({
            where: { taskId: taskId },
            data: {
                latitude: lat,
                longitude: lng
            }
        });

        console.log(`Updated ${result.count} evidence records.`);

    } catch (error) {
        console.error("Error updating evidence:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
