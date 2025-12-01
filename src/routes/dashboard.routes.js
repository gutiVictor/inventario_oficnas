const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAssetStatusDistribution,
  getAssetCountByCategory,
  getMaintenanceCosts,
  getAssetsByLocation
} = require('../controllers/dashboard.controller');

router.get('/summary', getDashboardSummary);
router.get('/status-distribution', getAssetStatusDistribution);
router.get('/count-by-category', getAssetCountByCategory);
router.get('/maintenance-costs', getMaintenanceCosts);
router.get('/assets-by-location', getAssetsByLocation);

module.exports = router;
