const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Data Cleanup Script
 * Removed unwanted " text-slate-900" from Walkin Hub status entries
 */
async function cleanup() {
    console.log('🚀 Starting Data Cleanup...');
    
    try {
        // 1. Find all entries that contain the unwanted string
        const entries = await prisma.walkinHubEntry.findMany({
            where: {
                OR: [
                    { status: { contains: 'text-slate-900' } },
                    { status: { contains: 'slate-900' } }
                ]
            }
        });

        console.log(`🔍 Found ${entries.length} entries to fix.`);

        let fixCount = 0;
        for (const entry of entries) {
            // Clean the string: "COMPLETED text-slate-900" -> "COMPLETED"
            let cleanStatus = entry.status
                .replace(/text-slate-900/g, '')
                .replace(/slate-900/g, '')
                .trim();
            
            // Further normalization
            if (cleanStatus.includes('COMPLETED')) cleanStatus = 'COMPLETED';
            if (cleanStatus.includes('ACTIVE')) cleanStatus = 'ACTIVE';

            await prisma.walkinHubEntry.update({
                where: { id: entry.id },
                data: { status: cleanStatus }
            });
            fixCount++;
        }

        console.log(`✅ Successfully cleaned ${fixCount} entries!`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
