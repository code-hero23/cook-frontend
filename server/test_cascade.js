const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("1. Finding a project...");
    const project = await prisma.project.findFirst();
    if (!project) return;

    console.log("2. Creating a task with evidence...");
    const task = await prisma.task.create({
        data: {
            title: "Task With Evidence",
            projectId: project.id,
            evidence: {
                create: {
                    url: "http://example.com/evidence.jpg",
                    latitude: 0,
                    longitude: 0,
                    capturedAt: new Date()
                }
            }
        }
    });
    console.log("Task created:", task.id);

    console.log("3. Deleting the task (expecting cascade)...");
    try {
        await prisma.task.delete({
            where: { id: task.id }
        });
        console.log("SUCCESS: Task (and evidence) deleted.");
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
