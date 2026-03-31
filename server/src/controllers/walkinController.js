const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendUserPushNotification } = require('../services/notificationService');

// --- Helper for Sanitization ---
const sanitizeData = (data) => {
    const cleaned = { ...data };
    ['bhId', 'creId', 'architectId'].forEach(field => {
        if (cleaned[field] === '') {
            cleaned[field] = null;
        }
    });
    return cleaned;
};

// --- Walkin Hub Entries ---

exports.getWalkins = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const filter = {};

        // Role-based filtering
        if (!['SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'].includes(role)) {
            filter.OR = [
                { creId: userId },
                { bhId: userId },
                { architectId: userId }
            ];
        }

        const walkins = await prisma.walkinHubEntry.findMany({
            where: filter,
            include: {
                cre: { select: { id: true, name: true } },
                bh: { select: { id: true, name: true } },
                architect: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(walkins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createWalkin = async (req, res) => {
    try {
        const { 
            clientName, contactNumber, showroom, architectName, architectId, bhId, bhName, 
            project, dayOfVisit, tentativeTime, creId: bodyCreId,
            inTime, outTime, remarks, dateOfVisit, status
        } = req.body;
        const { role, id: loggedInUserId } = req.user;

        // Allow Admin/Manager/BH to set creId explicitly
        const creId = (['SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'].includes(role) && bodyCreId) 
            ? bodyCreId 
            : loggedInUserId;

        // 1. Duplicate Prevention (Contact + Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await prisma.walkinHubEntry.findFirst({
            where: {
                contactNumber,
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: "Duplicate entry: This contact has already visited today." });
        }

        // 2. Create Entry
        const entry = await prisma.walkinHubEntry.create({
            data: sanitizeData({
                creId,
                clientName,
                contactNumber,
                showroom,
                architectName,
                architectId,
                bhId,
                bhName,
                project,
                dayOfVisit,
                tentativeTime,
                inTime,
                outTime,
                remarks,
                dateOfVisit: dateOfVisit ? new Date(dateOfVisit) : today,
                status: status || 'ACTIVE'
            })
        });

        // 3. Notifications
        // Notify BH if assigned
        if (bhId) {
            await sendUserPushNotification(
                bhId,
                'New Walk-in Assigned',
                `Client ${clientName} is visiting ${showroom} showroom.`,
                '/walkin-hub'
            );
        }

        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateWalkin = async (req, res) => {
    try {
        const { id } = req.params;
        const { dateOfVisit, ...rest } = req.body;
        
        const updated = await prisma.walkinHubEntry.update({
            where: { id },
            data: {
                ...sanitizeData(rest),
                dateOfVisit: dateOfVisit ? new Date(dateOfVisit) : undefined
            }
        });
        res.json(updated);
    } catch (error) {
        console.error('[Walkin] Update Error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.deleteWalkin = async (req, res) => {
    try {
        await prisma.walkinHubEntry.delete({ where: { id: req.params.id } });
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Work Reports ---

exports.getWorkReports = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const filter = {};

        if (!['SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'].includes(role)) {
            filter.OR = [
                { creId: userId },
                { bhId: userId },
                { architectId: userId }
            ];
        }

        const reports = await prisma.workReport.findMany({
            where: filter,
            include: { 
                bh: { select: { id: true, name: true } },
                cre: { select: { id: true, name: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createWorkReport = async (req, res) => {
    try {
        const { role, id: loggedInUserId } = req.user;
        const { creId: bodyCreId, ...rest } = req.body;

        // Allow Admin/Manager/BH to set creId explicitly
        const creId = (['SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'].includes(role) && bodyCreId) 
            ? bodyCreId 
            : loggedInUserId;

        const report = await prisma.workReport.create({
            data: sanitizeData({
                ...rest,
                date: rest.date ? new Date(rest.date) : new Date(),
                creId,
                bhName: req.body.bhName // Explicitly include if passed
            })
        });
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateWorkReport = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.workReport.update({
            where: { id },
            data: sanitizeData({
                ...req.body,
                date: req.body.date ? new Date(req.body.date) : undefined
            })
        });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- Bulk Imports ---

exports.bulkImportWalkins = async (req, res) => {
    try {
        const data = req.body; // Array of objects
        if (!Array.isArray(data)) return res.status(400).json({ error: "Expected an array" });

        const result = await prisma.walkinHubEntry.createMany({
            data: data.map(item => ({
                ...item,
                creId: item.creId || req.user.id
            }))
        });
        res.json({ success: true, count: result.count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.bulkImportWorkReports = async (req, res) => {
    try {
        const data = req.body;
        if (!Array.isArray(data)) return res.status(400).json({ error: "Expected an array" });

        const result = await prisma.workReport.createMany({
            data: data.map(item => ({
                ...item,
                creId: item.creId || req.user.id
            }))
        });
        res.json({ success: true, count: result.count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
