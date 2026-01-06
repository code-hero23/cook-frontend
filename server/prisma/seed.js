const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Database...");

    // 1. Create/Update Super Admin (Safe Operation)
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Using upsert ensures we don't duplicate or error if admin exists
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cookscape.com' },
        update: {}, // No updates if exists
        create: {
            email: 'admin@cookscape.com',
            name: 'Super Admin',
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    });

    // 2. Create/Update Manager (Safe Operation)
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.upsert({
        where: { email: 'manager@cookscape.com' },
        update: {},
        create: {
            email: 'manager@cookscape.com',
            name: 'Default Manager',
            passwordHash: managerPassword,
            role: 'MANAGER',
        },
    });

    // 3. Create Specific Admin (Arun)
    const arunPassword = await bcrypt.hash('password123', 10);
    const arun = await prisma.user.upsert({
        where: { email: 'arun@cookscape.com' },
        update: {},
        create: {
            email: 'arun@cookscape.com',
            name: 'Arun Admin',
            passwordHash: arunPassword,
            role: 'SUPER_ADMIN',
        },
    });

    // 4. Create Specific Employee (Asvanth)
    const asvanthPassword = await bcrypt.hash('password123', 10);
    const asvanth = await prisma.user.upsert({
        where: { email: 'asvanth@cookscape.com' },
        update: {},
        create: {
            email: 'asvanth@cookscape.com',
            name: 'Asvanth',
            passwordHash: asvanthPassword,
            role: 'EMPLOYEE',
            department: 'Civil',
            phone: '9876543210'
        },
    });

    console.log("✅ Seeding Complete.");
    console.log({ admin, manager, arun, asvanth });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
