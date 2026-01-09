
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const docs = await prisma.projectDocument.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, taskId: true }
        });
        console.log("Recent Documents:", docs);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
