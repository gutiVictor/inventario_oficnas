const express = require('express');
const router = express.Router();
const {
  exportAssetsToExcel,
  exportUsersToExcel,
  exportCategoriesToExcel,
  exportSuppliersToExcel,
  exportDashboardToPDF
} = require('../controllers/export.controller');

// Excel export routes
router.get('/assets/excel', exportAssetsToExcel);
router.get('/users/excel', exportUsersToExcel);
router.get('/categories/excel', exportCategoriesToExcel);
router.get('/suppliers/excel', exportSuppliersToExcel);

// PDF export routes
router.get('/dashboard/pdf', exportDashboardToPDF);

module.exports = router;
