const express = require('express');
const router = express.Router();
const walkinController = require('../controllers/walkinController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Base authenticate for all routes
router.use(authenticate);

// Walkin Hub CRUD
router.get('/hub', walkinController.getWalkins);
router.post('/hub', walkinController.createWalkin);
router.patch('/hub/:id', walkinController.updateWalkin);
router.delete('/hub/:id', authorize('SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'), walkinController.deleteWalkin);
router.post('/hub/bulk-import', authorize('SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'), walkinController.bulkImportWalkins);

// Work Reports CRUD
router.get('/reports', walkinController.getWorkReports);
router.post('/reports', walkinController.createWorkReport);
router.patch('/reports/:id', walkinController.updateWorkReport);
router.post('/reports/bulk-import', authorize('SUPER_ADMIN', 'MANAGER', 'BUSINESS_HEAD'), walkinController.bulkImportWorkReports);

module.exports = router;
