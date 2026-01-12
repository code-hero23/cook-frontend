const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
    try {
        const project = await prisma.project.findUnique({
            where: { projectCode: 'PRJ-001' }
        });

        if (!project) {
            console.log("Project PRJ-001 not found.");
            return;
        }

        console.log("Project found:", project.name);
        const isValid = await bcrypt.compare('leo001', project.clientPassword);
        console.log("Password 'leo001' is valid:", isValid);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
