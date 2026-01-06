const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Get Site Supervisor
        const supervisor = await prisma.user.findUnique({
            where: { email: 'supervisor@cookscape.com' }
        });

        if (!supervisor) {
            console.error("Supervisor not found!");
            return;
        }

        // 2. Create Project in Vadapalani
        // Using upsert to avoid duplicates if run multiple times
        const project = await prisma.project.upsert({
            where: { projectCode: 'PRJ-VAD-001' },
            update: {},
            create: {
                projectCode: 'PRJ-VAD-001',
                name: 'Vadapalani Residential UI Fix',
                clientPassword: 'clientpassword123',
                clientFirstName: 'Ramesh',
                clientLastName: 'Kumar',
                clientEmail: 'ramesh.kumar@example.com',
                clientPhone: '9876543210',
                location: 'Vadapalani, Chennai',
                status: 'ONGOING'
            }
        });

        console.log("Project ensured:", project.name);

        // 3. Create Task "FM take by AE"
        const task = await prisma.task.create({
            data: {
                title: 'FM take by AE',
                description: 'Final measurement (FM) to be taken by Assistant Engineer (AE) at site.',
                type: 'TASK',
                status: 'PENDING',
                priority: 'HIGH',
                stage: 'Preparation',
                projectId: project.id,
                dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Due in 2 days
                employeeId: supervisor.id // Assign to supervisor to appear in "My Tasks"
            }
        });

        console.log("Task created successfully:", task);

    } catch (error) {
        console.error("Error creating task:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
