const db = require('../config/db');
const { sendSuccess } = require('../utils/responses');

// Get dashboard summary KPIs
const getDashboardSummary = async (req, res, next) => {
  try {
    // Total Asset Value
    const totalValueQuery = `
      SELECT SUM(acquisition_value) as total_value 
      FROM assets 
      WHERE status = 'active'
    `;
    const totalValueResult = await db.query(totalValueQuery);
    const totalValue = parseFloat(totalValueResult.rows[0].total_value || 0);

    // Maintenance Costs (YTD)
    const maintenanceCostsQuery = `
      SELECT SUM(cost_parts + cost_labor) as total_cost 
      FROM maintenance_orders 
      WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `;
    const maintenanceCostsResult = await db.query(maintenanceCostsQuery);
    const maintenanceCosts = parseFloat(maintenanceCostsResult.rows[0].total_cost || 0);

    // Assignment Rate
    const totalAssetsQuery = `SELECT COUNT(*) as count FROM assets WHERE status = 'active'`;
    const assignedAssetsQuery = `SELECT COUNT(*) as count FROM asset_assignments WHERE status = 'active'`;
    
    const [totalAssetsResult, assignedAssetsResult] = await Promise.all([
      db.query(totalAssetsQuery),
      db.query(assignedAssetsQuery)
    ]);

    const totalAssets = parseInt(totalAssetsResult.rows[0].count || 0);
    const assignedAssets = parseInt(assignedAssetsResult.rows[0].count || 0);
    const assignmentRate = totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0;

    // Assets to Replace
    const assetsToReplaceQuery = `
      SELECT COUNT(*) as count 
      FROM assets 
      WHERE (acquisition_date + (useful_life_months || ' months')::interval) < CURRENT_DATE
      AND status = 'active'
    `;
    const assetsToReplaceResult = await db.query(assetsToReplaceQuery);
    const assetsToReplace = parseInt(assetsToReplaceResult.rows[0].count || 0);

    sendSuccess(res, {
      totalValue,
      maintenanceCosts,
      assignmentRate,
      assetsToReplace
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

// Get asset value by category
const getAssetValueByCategory = async (req, res, next) => {
  try {
    const query = `
      SELECT c.name, SUM(a.acquisition_value) as value 
      FROM assets a 
      JOIN categories c ON a.category_id = c.id 
      WHERE a.status = 'active'
      GROUP BY c.name
      ORDER BY value DESC
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
  getAssetValueByCategory,
  getMaintenanceCosts,
  getAssetsByLocation
};
