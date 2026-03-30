const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🛡️ Starting ZERO-DATA-LOSS schema initialization...');
  try {
    // 1. Create WalkinHubEntry Table (Safely)
    console.log('🏗️ Creating WalkinHubEntry table if not exists...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "WalkinHubEntry" (
        "id" TEXT NOT NULL,
        "creId" TEXT NOT NULL,
        "architect" TEXT,
        "bhId" TEXT,
        "bhName" TEXT,
        "clientName" TEXT NOT NULL,
        "contactNumber" TEXT NOT NULL,
        "project" TEXT,
        "status" TEXT DEFAULT 'ACTIVE',
        "dateOfVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "dayOfVisit" TEXT,
        "tentativeTime" TEXT,
        "showroom" TEXT NOT NULL,
        "visitStatusMonday" TEXT,
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "WalkinHubEntry_pkey" PRIMARY KEY ("id")
      );
    `);

    // 2. Create WorkReport Table (Safely)
    console.log('🏗️ Creating WorkReport table if not exists...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "WorkReport" (
        "id" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "nextFD" TIMESTAMP(3),
        "clientName" TEXT NOT NULL,
        "contact" TEXT NOT NULL,
        "source" TEXT,
        "showroom" TEXT NOT NULL,
        "status" TEXT DEFAULT 'Y',
        "faName" TEXT,
        "bhId" TEXT,
        "bhName" TEXT,
        "creId" TEXT,
        "site" TEXT,
        "star" INTEGER NOT NULL DEFAULT 0,
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "WorkReport_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log('✨ All missing tables created/verified successfully!');
    console.log('🚀 Your existing data (Users, Projects, etc.) is safe.');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
