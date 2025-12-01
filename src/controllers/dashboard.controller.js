const db = require('../config/db');
const { sendSuccess } = require('../utils/responses');

// Get dashboard summary KPIs
const getDashboardSummary = async (req, res, next) => {
  try {
    // Total Assets Count
    const totalAssetsQuery = `SELECT COUNT(*) as count FROM assets`;
    const totalAssetsResult = await db.query(totalAssetsQuery);
    const totalAssets = parseInt(totalAssetsResult.rows[0].count || 0);

    // Active Assets Count
    const activeAssetsQuery = `SELECT COUNT(*) as count FROM assets WHERE status = 'active'`;
    const activeAssetsResult = await db.query(activeAssetsQuery);
    const activeAssets = parseInt(activeAssetsResult.rows[0].count || 0);

    // Assignment Rate
    const assignedAssetsQuery = `SELECT COUNT(*) as count FROM asset_assignments WHERE status = 'active'`;
    const assignedAssetsResult = await db.query(assignedAssetsQuery);
    const assignedAssets = parseInt(assignedAssetsResult.rows[0].count || 0);
    const assignmentRate = activeAssets > 0 ? (assignedAssets / activeAssets) * 100 : 0;

    // Total Categories
    const totalCategoriesQuery = `
      SELECT COUNT(DISTINCT category_id) as count 
      FROM assets
      WHERE category_id IS NOT NULL
    `;
    const totalCategoriesResult = await db.query(totalCategoriesQuery);
    const totalCategories = parseInt(totalCategoriesResult.rows[0].count || 0);

    sendSuccess(res, {
      totalAssets,
      activeAssets,
      assignmentRate,
      totalCategories
    });
  } catch (error) {
    next(error);
  }
};

// Get asset status distribution
const getAssetStatusDistribution = async (req, res, next) => {
  try {
    const query = `
      SELECT status, COUNT(*) as count 
      FROM assets 
      GROUP BY status
    `;
    const result = await db.query(query);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

// Get asset count by category
const getAssetCountByCategory = async (req, res, next) => {
  try {
    const query = `
      SELECT c.name, COUNT(*) as count 
      FROM assets a 
      JOIN categories c ON a.category_id = c.id 
      WHERE a.status = 'active'
      GROUP BY c.name
      ORDER BY count DESC
    `;
    const result = await db.query(query);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

// Get maintenance costs history
const getMaintenanceCosts = async (req, res, next) => {
  try {
    const query = `
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(cost_parts + cost_labor) as total 
      FROM maintenance_orders 
      GROUP BY month 
      ORDER BY month ASC 
      LIMIT 12
    `;
    const result = await db.query(query);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

// Get assets by location
const getAssetsByLocation = async (req, res, next) => {
  try {
    const query = `
      SELECT l.name, COUNT(*) as count 
      FROM assets a 
      JOIN locations l ON a.location_id = l.id 
      WHERE a.status = 'active'
      GROUP BY l.name
      ORDER BY count DESC
    `;
    const result = await db.query(query);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getAssetStatusDistribution,
  getAssetCountByCategory,
  getMaintenanceCosts,
  getAssetsByLocation
};
