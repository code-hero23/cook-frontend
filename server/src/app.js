const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
        res.set('Content-Disposition', 'attachment');
    }
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const clientRoutes = require('./routes/clientRoutes');
// const userRoutes = require('./routes/userRoutes'); // Removed non-existent route
const messageRoutes = require('./routes/messageRoutes');
const projectDataRoutes = require('./routes/projectDataRoutes');
const adminRoutes = require('./routes/adminRoutes'); // New Admin Routes

const { initScheduler: initBackupScheduler } = require('./services/backupService');
const { initScheduler: initTaskScheduler } = require('./services/schedulerService');
const { initKeepAlive } = require('./services/keepAliveService');

// Init Schedulers
initBackupScheduler();
initTaskScheduler();
initKeepAlive();

app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes); // Removed
app.use('/api/projects', projectRoutes);
app.use('/api/employees', employeeRoutes); // Keep existing employee routes
app.use('/api/client', clientRoutes); // Keep existing client routes
app.use('/api/tasks', (req, res, next) => { console.log('Route /api/tasks access'); next(); }, taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/project-data', projectDataRoutes);
app.use('/api/admin', adminRoutes); // Register Admin Routes
app.use('/api/emails', require('./routes/emailRoutes')); // Register Email Routes
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Cookscape Backend is running' });
});

app.get('/api/env-debug', (req, res) => {
    res.json({
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY ? 'PRESENT' : 'MISSING',
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ? 'PRESENT' : 'MISSING',
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV
    });
});

app.get('/api/health/smtp', async (req, res) => {
    const { sendNotificationEmail } = require('./services/emailService');
    try {
        const { createTransporter } = require('./services/emailService');
        const transporter = createTransporter();
        if (!transporter) {
            return res.status(500).json({ status: 'error', message: 'SMTP credentials missing' });
        }
        await transporter.verify();
        res.json({ status: 'ok', message: 'SMTP connection verified successfully' });
    } catch (error) {
        console.error('[HealthCheck] SMTP verification failed:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Serve Static Frontend (Production)
// Serve Static Frontend (Production)
// Serve static files from the React app (assuming build output is in ../../dist due to current folder structure: root/server/src/app.js)
const buildPath = path.join(__dirname, '../../dist');
app.use(express.static(buildPath));

// Catch-all handler for any request that doesn't match an API route
// Server Restart Triggered: VAPID Key Alignment
app.get('*', (req, res) => {
    // Ticket Comments Fix
    res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
