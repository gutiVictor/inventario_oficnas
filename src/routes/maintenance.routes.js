const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');

router.get('/', maintenanceController.getAllMaintenanceOrders);
router.get('/:id', maintenanceController.getMaintenanceOrderById);
router.post('/', maintenanceController.createMaintenanceOrder);
router.put('/:id', maintenanceController.updateMaintenanceOrder);
router.delete('/:id', maintenanceController.deleteMaintenanceOrder);

module.exports = router;
