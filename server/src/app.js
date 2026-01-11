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
    const net = require('net');
    const dns = require('dns').promises;
    const { createTransporter } = require('./services/emailService');

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT) || 465;

    // 1. DNS Test
    const getDnsStatus = async () => {
        try {
            const result = await dns.lookup(host);
            return { status: 'ok', address: result.address };
        } catch (err) {
            return { status: 'error', message: `DNS Lookup failed: ${err.message}` };
        }
    };

    // 2. Raw Socket Test
    const socketTest = () => new Promise((resolve) => {
        const socket = new net.Socket();
        const start = Date.now();

        socket.setTimeout(10000);

        socket.on('connect', () => {
            const duration = Date.now() - start;
            socket.destroy();
            resolve({ status: 'ok', message: `TCP Connected in ${duration}ms` });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ status: 'error', message: `TCP Connection timed out after 10s` });
        });

        socket.on('error', (err) => {
            socket.destroy();
            resolve({ status: 'error', message: `TCP Connection failed: ${err.message || 'Unknown error'}` });
        });

        socket.connect(port, host);
    });

    try {
        const dnsStatus = await getDnsStatus();
        const networkStatus = await socketTest();

        const transporter = createTransporter();
        if (!transporter) {
            return res.status(500).json({
                status: 'error',
                message: 'SMTP credentials missing',
                dns: dnsStatus,
                network: networkStatus
            });
        }

        // 3. Full SMTP Verify
        const verifyPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SMTP Handshake timed out after 50s')), 50000)
        );

        await Promise.race([verifyPromise, timeoutPromise]);

        res.json({
            status: 'ok',
            message: 'SMTP connection verified successfully',
            dns: dnsStatus,
            network: networkStatus,
            diagnostic: {
                transporter: 'Created',
                port,
                host
            }
        });
    } catch (error) {
        console.error('[HealthCheck] SMTP verification failed:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            dns: await getDnsStatus(),
            network: await socketTest(),
            diagnostic: {
                error: error.code || 'TIMEOUT',
                port,
                host
            }
        });
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
