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
        service: 'gmail',
        pool: true, // Reuse connections
        maxConnections: 5,
        maxMessages: 100,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
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

// Generic Notification Sender
const sendNotificationEmail = async (to, subject, text, html = null, cc = null, attachments = []) => {
    const transporter = createTransporter();
    if (!transporter) {
        return { success: false, error: "SMTP credentials missing" };
    }

    try {
        console.log(`[EmailService v3-PROD] Sending notification to ${to} (CC: ${cc || 'None'})...`);

        const mailOptions = {
            from: `"Orbix Projects" <${process.env.SMTP_USER}>`,
            to: to,
            subject: subject,
            text: text, // Fallback plain text
            html: html || text.replace(/\n/g, '<br>') // Simple HTML conversion if not provided
        };

        if (cc) {
            mailOptions.cc = cc;
        }

        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        const info = await transporter.sendMail(mailOptions);

        console.log(`[EmailService] SUCCESS: Notification delivered to ${to} (MessageID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

// Standard HTML Template
const getEmailTemplate = (title, content) => {
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #ea580c; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Orbix Projects</h1>
        </div>
        <div style="padding: 32px; color: #334155; line-height: 1.6;">
            <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 24px; font-size: 20px; font-weight: 600; border-bottom: 2px solid #ea580c; display: inline-block; padding-bottom: 8px;">${title}</h2>
            <div style="font-size: 16px;">
                ${content}
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0; font-weight: 600;">&copy; ${new Date().getFullYear()} Orbix Projects. All rights reserved.</p>
            <p style="margin: 8px 0 0;">This is an automated system notification. Please do not reply directly unless specified.</p>
        </div>
    </div>
    `;
};

module.exports = { sendBackupEmail, sendNotificationEmail, getEmailTemplate };
