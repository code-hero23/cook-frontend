const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Searching for 'PDI Reports' tasks...");

        const tasks = await prisma.task.findMany({
            where: {
                title: { contains: 'PDI Reports', mode: 'insensitive' }
            },
            include: {
                evidence: true,
                project: true
            }
        });

        console.log(`Found ${tasks.length} tasks.`);

        for (const t of tasks) {
            console.log(`\nTask: ${t.title} (${t.id})`);
            console.log(`Status: ${t.status}`);
            console.log(`Project Location: ${t.project?.location}`);
            console.log(`Evidence Count: ${t.evidence.length}`);

            if (t.evidence.length > 0) {
                t.evidence.forEach((e, i) => {
                    console.log(`  Evidence ${i + 1}: Lat ${e.latitude}, Lng ${e.longitude}`);
                });
            } else {
                console.log("  No evidence found.");
            }
        }

    } catch (error) {
        console.error("Error inspecting task:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
