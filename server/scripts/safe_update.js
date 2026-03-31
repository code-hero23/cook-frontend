const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findTableName(baseName) {
  // Query to find the actual table name regardless of case in PostgreSQL
  const result = await prisma.$queryRaw`
    SELECT tablename 
    FROM pg_catalog.pg_tables 
    WHERE schemaname = 'public' 
    AND LOWER(tablename) = LOWER(${baseName})
    LIMIT 1;
  `;
  return result[0]?.tablename;
}

async function main() {
  try {
    const tablesToUpdate = ['WalkinHubEntry', 'WorkReport'];
    
    for (const modelName of tablesToUpdate) {
      const actualTableName = await findTableName(modelName);
      
      if (!actualTableName) {
        console.warn(`⚠️ Warning: Table for model "${modelName}" not found in database. Skipping.`);
        continue;
      }
      
      console.log(`✅ Found table: "${actualTableName}" for model "${modelName}"`);
      
      // Use double quotes for safety in PostgreSQL to preserve exact case
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "${actualTableName}" 
        ADD COLUMN IF NOT EXISTS "bhName" TEXT,
        ADD COLUMN IF NOT EXISTS "inTime" TEXT,
        ADD COLUMN IF NOT EXISTS "outTime" TEXT,
        ADD COLUMN IF NOT EXISTS "remarks" TEXT,
        ADD COLUMN IF NOT EXISTS "status" TEXT,
        ADD COLUMN IF NOT EXISTS "dateOfVisit" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log(`✨ Successfully checked/updated columns in table "${actualTableName}"`);
    }
    
    console.log('🚀 Database schema check completed successfully.');
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
