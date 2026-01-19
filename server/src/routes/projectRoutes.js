const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.put('/:id/payment', projectController.updateProjectPayment);
router.get('/:id/payments', projectController.getProjectPayments);
router.delete('/:id', projectController.deleteProject);
router.post('/parse-location', projectController.parseLocation);
// Magic Link
router.get('/:id/access-link', projectController.generateAccessLink);
router.get('/magic-link/:code', projectController.verifyMagicLink);

module.exports = router;
