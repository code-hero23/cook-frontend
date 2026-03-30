const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.upsertReport = async (req, res) => {
    try {
        const { month, year, calls, srv, proposals, orders, value, creId: bodyCreId } = req.body;
        const { role, id: userId } = req.user;
        
        // Use creId from body if admin, otherwise use logged in user id
        const targetCreId = (['SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'].includes(role) && bodyCreId) 
            ? bodyCreId 
            : userId;

        // Ensure these are integers/floats
        const data = {
            calls: parseInt(calls) || 0,
            srv: parseInt(srv) || 0,
            proposals: parseInt(proposals) || 0,
            orders: parseInt(orders) || 0,
            value: parseFloat(value) || 0
        };

        const report = await prisma.cREMonthlyReport.upsert({
            where: {
                creId_month_year: {
                    creId: targetCreId,
                    month: parseInt(month),
                    year: parseInt(year)
                }
            },
            update: data,
            create: {
                creId: targetCreId,
                month: parseInt(month),
                year: parseInt(year),
                ...data
            }
        });

        res.status(200).json(report);
    } catch (error) {
        console.error('[MonthlyReport] Upsert Error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const { month, year } = req.query;
        const { role, id: userId } = req.user;
        const filter = {};

        if (month) filter.month = parseInt(month);
        if (year) filter.year = parseInt(year);

        // If not admin, only show user's own reports
        if (!['SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'].includes(role)) {
            filter.creId = userId;
        }

        const reports = await prisma.cREMonthlyReport.findMany({
            where: filter,
            include: {
                cre: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: "Month and Year required" });

        const aggregates = await prisma.cREMonthlyReport.aggregate({
            where: {
                month: parseInt(month),
                year: parseInt(year)
            },
            _sum: {
                calls: true,
                srv: true,
                proposals: true,
                orders: true,
                value: true
            }
        });

        res.json(aggregates._sum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
