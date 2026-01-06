const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to generate Ticket ID
const generateTicketId = () => {
    return `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Create a new ticket
exports.createTicket = async (req, res) => {
    try {
        const { subject, description, category, priority, email, projectId, attachment } = req.body;

        if (!projectId || !description) {
            return res.status(400).json({ error: "Project ID and Description are required" });
        }

        const ticket = await prisma.ticket.create({
            data: {
                ticketId: generateTicketId(),
                subject: subject || "New Support Request",
                description,
                category: category || "Support",
                priority: priority || "Medium",
                clientEmail: email,
                projectId,
                attachmentUrl: attachment?.url,
                attachmentName: attachment?.name,
                attachmentType: attachment?.type
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error("Create Ticket Error:", error);
        res.status(500).json({
            error: "Failed to create ticket",
            details: error.message
        });
    }
};

// Get tickets (with filters)
exports.getTickets = async (req, res) => {
    try {
        const { projectId, status } = req.query;

        let where = {};
        if (projectId) where.projectId = projectId;
        if (status && status !== 'All') where.status = status;

        const tickets = await prisma.ticket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: { name: true, projectCode: true }
                },
                comments: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        res.json(tickets);
    } catch (error) {
        console.error("Get Tickets Error:", error);
        res.status(500).json({
            error: "Failed to fetch tickets",
            details: error.message,
            stack: error.stack
        });
    }
};

// Update Ticket Status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { status }
        });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
};

// Get Comments for a Ticket
exports.getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await prisma.ticketComment.findMany({
            where: { ticketId: id },
            orderBy: { createdAt: 'asc' }
        });
        res.json(comments);
    } catch (error) {
        console.error("Get Comments Error:", error);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};

// Add Comment to Ticket
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, role, senderId } = req.body; // role: 'ADMIN' or 'CLIENT'

        if (!content) return res.status(400).json({ error: "Content is required" });

        const comment = await prisma.ticketComment.create({
            data: {
                ticketId: id,
                content,
                role,
                senderId
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error("Add Comment Error:", error);
        res.status(500).json({ error: "Failed to add comment" });
    }
};

// Convert Ticket to Issue (Task)
exports.convertToIssue = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find Ticket
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: { project: true }
        });

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });
        if (ticket.taskId) return res.status(400).json({ error: "Ticket already converted to issue" });

        // 2. Create Task (Issue)
        // We set type to "ISSUE".
        const { employeeId, dueDate, priority } = req.body;

        const newTask = await prisma.task.create({
            data: {
                title: `[Effect of Ticket ${ticket.ticketId}] ${ticket.subject}`,
                description: `Source Ticket: ${ticket.ticketId}\nClient Email: ${ticket.clientEmail}\nOriginal Description:\n${ticket.description}`,
                type: "Issue",
                priority: priority ? priority.toUpperCase() : ticket.priority.toUpperCase(),
                status: "PENDING",
                projectId: ticket.projectId,
                employeeId: employeeId || null,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            }
        });

        // 3. Update Ticket (Link + Status)
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                status: "In Progress",
                taskId: newTask.id
            }
        });

        res.json({ ticket: updatedTicket, task: newTask });

    } catch (error) {
        console.error("Convert Error:", error);
        res.status(500).json({ error: "Failed to convert ticket to issue", details: error.message });
    }
};
