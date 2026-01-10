const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendUserPushNotification } = require('../services/notificationService');

exports.subscribe = async (req, res) => {
    try {
        const { subscription, userId } = req.body;
        if (!subscription || !subscription.endpoint || !userId) {
            return res.status(400).json({ error: "Invalid subscription or missing userId" });
        }

        // Upsert based on endpoint
        const saved = await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                keys: subscription.keys,
                userId: userId,
            },
            create: {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                userId: userId
            }
        });

        res.json({ message: "Subscribed successfully", id: saved.id });
    } catch (error) {
        console.error("Subscription error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getVapidKey = (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

exports.testNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const result = await sendUserPushNotification(userId, "Test Notification", message || "Hello from Orbix!");
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
