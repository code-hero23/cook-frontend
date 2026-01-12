const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const images = await prisma.projectImage.findMany({
        include: {
            project: {
                select: {
                    projectCode: true,
                    name: true
                }
            }
        }
    });
    console.log(JSON.stringify(images, null, 2));
    await prisma.$disconnect();
}

main();
