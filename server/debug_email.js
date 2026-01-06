const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = '7c2f608c-ed7a-415d-8f81-1aec4618e05a'; // existing user ID from error log
        console.log(`Checking unread count for user: ${userId}`);

        const count = await prisma.email.count({
            where: {
                receiverId: userId,
                isRead: false,
                isDeleted: false,
                isDraft: false
            }
        });

        console.log('Success! Count:', count);
    } catch (error) {
        console.error('Error fetching unread count:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
