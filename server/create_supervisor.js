const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'supervisor@cookscape.com';
    const password = 'password123';
    const name = 'Site Supervisor';
    const role = 'SITE_SUPERVISOR';

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                role: role,
                passwordHash: hashedPassword,
                name: name
            },
            create: {
                email: email,
                passwordHash: hashedPassword,
                name: name,
                role: role,
                department: 'Operations',
                phone: '9876543210'
            },
        });

        console.log('Created Site Supervisor:', user);
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
