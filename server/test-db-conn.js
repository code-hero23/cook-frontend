const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to connect to database...');
        console.log('URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');
        await prisma.$connect();
        console.log('Successfully connected to the database!');
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        // Also list one project to be sure
        const project = await prisma.project.findFirst();
        if (project) {
            console.log('First Project:', project.name);
        } else {
            console.log('No projects found.');
        }

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
