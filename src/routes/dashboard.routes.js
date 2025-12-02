const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAssetStatusDistribution,
  getAssetCountByCategory,
  getMaintenanceCosts,
  getAssetsByLocation,
  getAssetValueTrends,
  getTopSuppliers,
  getRecentActivity
} = require('../controllers/dashboard.controller');

router.get('/summary', getDashboardSummary);
router.get('/status-distribution', getAssetStatusDistribution);
router.get('/count-by-category', getAssetCountByCategory);
router.get('/maintenance-costs', getMaintenanceCosts);
router.get('/assets-by-location', getAssetsByLocation);
router.get('/asset-value-trends', getAssetValueTrends);
router.get('/top-suppliers', getTopSuppliers);
router.get('/recent-activity', getRecentActivity);

module.exports = router;
