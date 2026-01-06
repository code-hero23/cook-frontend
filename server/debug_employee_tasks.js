const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = '7c2f608c-ed7a-415d-8f81-1aec4618e05a';
        console.log(`Checking tasks for employee: ${userId}`);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        console.log('User found:', user ? `${user.name} (${user.role})` : 'User NOT found');

        if (!user) return;

        const tasks = await prisma.task.findMany({
            where: {
                employeeId: userId
            }
        });

        console.log(`Found ${tasks.length} tasks for this employee.`);
        if (tasks.length > 0) {
            console.log('Sample Task Title:', tasks[0].title);
            console.log('Sample Task Type:', tasks[0].type);

            // Count types
            const types = tasks.reduce((acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + 1;
                return acc;
            }, {});
            console.log('Task Types Distribution:', types);
        } else {
            console.log("No tasks found. Retrieving 5 unassigned tasks to potentially assign...");
            const unassigned = await prisma.task.findMany({
                where: { employeeId: null },
                take: 5
            });
            console.log(`Found ${unassigned.length} unassigned tasks.`);
            if (unassigned.length > 0) {
                console.log('Unassigned ID:', unassigned[0].id);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
