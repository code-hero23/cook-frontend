const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                department: true,
                role: true,
                status: true,
                phone: true,
                createdAt: true
            }
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new employee
exports.createEmployee = async (req, res) => {
    try {
        const { password, ...data } = req.body;

        // Hash password if provided, else use default 'cookscape123'
        const passwordHash = await bcrypt.hash(password || 'cookscape123', 10);

        const employee = await prisma.user.create({
            data: {
                ...data,
                passwordHash,
                role: data.role || 'EMPLOYEE'
            }
        });

        // Remove hash from response
        const { passwordHash: _, ...result } = employee;
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        const { password, ...data } = req.body;
        const updateData = { ...data };

        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const employee = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData
        });

        const { passwordHash: _, ...result } = employee;
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
