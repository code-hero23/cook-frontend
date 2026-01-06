const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Searching for 'Modular Kitchen' projects...");

        // Find projects
        const projects = await prisma.project.findMany({
            where: {
                name: { contains: 'Modular Kitchen', mode: 'insensitive' }
            }
        });

        console.log(`Found ${projects.length} projects.`);

        for (const p of projects) {
            console.log(`Updating Project: ${p.name} (${p.id})`);
            console.log(`Current Location: ${p.location}`);

            const updated = await prisma.project.update({
                where: { id: p.id },
                data: { location: 'Vadapalani, Chennai' }
            });

            console.log(`New Location: ${updated.location}`);
        }

    } catch (error) {
        console.error("Error updating project:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
