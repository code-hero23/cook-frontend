const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = '7c2f608c-ed7a-415d-8f81-1aec4618e05a';
        console.log(`Checking project assignments for user: ${userId}`);

        // 1. Get tasks assigned to this user
        const tasks = await prisma.task.findMany({
            where: { employeeId: userId },
            select: { id: true, title: true, projectId: true }
        });

        const projectIdsFromTasks = [...new Set(tasks.map(t => t.projectId))];
        console.log(`User has tasks in ${projectIdsFromTasks.length} projects:`, projectIdsFromTasks);

        // 2. Get projects where user is in assignedEmployees
        const assignedProjects = await prisma.project.findMany({
            where: {
                assignedEmployees: {
                    some: { id: userId }
                }
            },
            select: { id: true, name: true }
        });
        const assignedProjectIds = assignedProjects.map(p => p.id);
        console.log(`User is explicitly assigned to ${assignedProjects.length} projects:`, assignedProjectIds);

        // 3. Find mismatch
        const missingProjects = projectIdsFromTasks.filter(id => !assignedProjectIds.includes(id));

        if (missingProjects.length > 0) {
            console.log('MISMATCH FOUND! User has tasks in these projects but is NOT in the team:', missingProjects);
        } else {
            console.log('No mismatch found. User is assigned to all projects where they have tasks.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
