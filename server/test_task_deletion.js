const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("1. Finding a project...");
    const project = await prisma.project.findFirst();
    if (!project) {
        console.log("No projects found.");
        return;
    }

    console.log("2. Creating a test task...");
    const task = await prisma.task.create({
        data: {
            title: "Task To Delete",
            projectId: project.id,
            description: "Temp task"
        }
    });
    console.log("Task created:", task.id);

    console.log("3. Deleting the task...");
    try {
        await prisma.task.delete({
            where: { id: task.id }
        });
        console.log("SUCCESS: Task deleted.");
    } catch (error) {
        console.error("FAILURE: Could not delete task.");
        console.error(error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
