const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        console.log("--- Debugging Data ---");

        // 1. Find User Asvanth
        const user = await prisma.user.findFirst({
            where: { name: { contains: 'Asvanth' } }
        });
 
        if (!user) {
            console.log("❌ User 'Asvanth' not found in DB.");
            return;
        }

        console.log(`✅ Found User: ${user.name} (Role: ${user.role})`);

        // 2. Group by Type
        const grouped = await prisma.task.groupBy({
            by: ['type'],
            where: { employeeId: user.id },
            _count: { type: true }
        });

        console.log(`info: Task Breakdown for ${user.name}:`);
        console.log(grouped);

        // 3. Raw List sample
        const allRaw = await prisma.task.findMany({
            where: { employeeId: user.id },
            select: { id: true, title: true, type: true }
        });
        console.log("Raw Items (First 20):", allRaw.slice(0, 20));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
