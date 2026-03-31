const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const monthlyReportController = require('../controllers/monthlyReportController');

router.use(authenticate);

// Upsert current CRE's monthly record
router.post('/', monthlyReportController.upsertReport);

// Get monthly records (filtered by CRE/Month/Year)
router.get('/', monthlyReportController.getReports);

// Get monthly totals for admin
router.get('/summary', monthlyReportController.getSummary);

// Sync stats from activity hubs
router.post('/sync', monthlyReportController.syncReports);

module.exports = router;
