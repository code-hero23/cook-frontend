
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function testFlow() {
    try {
        console.log("🔍 Fetching test data...");
        const employee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
        const project = await prisma.project.findFirst();

        if (!employee || !project) {
            console.error("❌ Need at least one employee and one project in DB.");
            return;
        }

        console.log(`✅ Using Employee: ${employee.name} (${employee.email})`);
        console.log(`✅ Using Project: ${project.name}`);

        const payload = {
            title: "Email Flow Test Task",
            description: "Testing non-blocking background email notifications.",
            projectId: project.id,
            employeeId: employee.id,
            priority: "HIGH",
            type: "TASK",
            startDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000).toISOString()
        };

        console.log("🚀 Sending createTask request to http://localhost:5000/api/tasks...");
        const response = await axios.post('http://localhost:5000/api/tasks', payload);

        console.log("📥 API Response:", response.status, response.data);
        console.log("⌛ Waiting 10 seconds for background logs...");

        await new Promise(r => setTimeout(r, 10000));
        console.log("✅ Flow test complete. Check server terminal for [EmailService] logs.");

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        if (error.response) console.error("Data:", error.response.data);
    } finally {
        await prisma.$disconnect();
    }
}

testFlow();
