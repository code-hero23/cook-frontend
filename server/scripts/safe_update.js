const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeUpdate() {
  console.log('🚀 Starting safe database update...');

  try {
    // 1. Update WalkinHubEntry table
    console.log('📅 Adding bhName to WalkinHubEntry...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WalkinHubEntry" 
      ADD COLUMN IF NOT EXISTS "bhName" TEXT;
    `);

    // 2. Update WorkReport table
    console.log('📊 Adding bhName to WorkReport...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "WorkReport" 
      ADD COLUMN IF NOT EXISTS "bhName" TEXT;
    `);

    console.log('✅ Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    // We don't exit with error if the column already exists (handled by IF NOT EXISTS)
  } finally {
    await prisma.$disconnect();
  }
}

safeUpdate();
