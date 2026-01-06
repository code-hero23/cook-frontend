const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// Initialize Transporter
const createTransporter = () => {
    // Only create if credentials exist to avoid crashing
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('[EmailService] SMTP credentials missing. Email sending disabled.');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail', // Built-in support for Gmail
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS, // App Password
        },
    });
};

const sendBackupEmail = async (filePath, filename) => {
    const transporter = createTransporter();
    if (!transporter) {
        return { success: false, error: "SMTP credentials missing" };
    }

    const recipient = process.env.BACKUP_EMAIL_RECIPIENT || process.env.SMTP_USER;

    try {
        console.log(`[EmailService] Sending backup email to ${recipient}...`);

        const info = await transporter.sendMail({
            from: `"Orbix Projects Backup Bot" <${process.env.SMTP_USER}>`,
            to: recipient,
            subject: `[Backup] Daily Data Backup - ${filename}`,
            text: `Attached is the daily system data backup file generated on ${new Date().toLocaleString()}.`,
            attachments: [
                {
                    filename: filename,
                    path: filePath
                }
            ]
        });

        console.log('[EmailService] Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendBackupEmail };
