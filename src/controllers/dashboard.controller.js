const db = require('../config/db');
const { sendSuccess } = require('../utils/responses');

// Get dashboard summary KPIs
const getDashboardSummary = async (req, res, next) => {
  try {
    // Total Assets Count (current and previous period)
    const totalAssetsQuery = `SELECT COUNT(*) as current_count FROM assets`;
    const totalAssetsResult = await db.query(totalAssetsQuery);
    const totalAssets = parseInt(totalAssetsResult.rows[0].current_count || 0);
    
    const previousAssetsQuery = `
      SELECT COUNT(*) as previous_count 
      FROM assets 
      WHERE created_at < NOW() - INTERVAL '30 days'
    `;
    const previousAssetsResult = await db.query(previousAssetsQuery);
    const previousTotalAssets = parseInt(previousAssetsResult.rows[0].previous_count || 0);
    const totalAssetsTrend = previousTotalAssets > 0 
      ? ((totalAssets - previousTotalAssets) / previousTotalAssets) * 100 
      : 0;

    // Active Assets Count
    const activeAssetsQuery = `
      SELECT COUNT(*) as current_count
      FROM assets 
      WHERE status = 'active'
    `;
    const activeAssetsResult = await db.query(activeAssetsQuery);
    const activeAssets = parseInt(activeAssetsResult.rows[0].current_count || 0);
    
    const previousActiveQuery = `
      SELECT COUNT(*) as previous_count
      FROM assets 
      WHERE status = 'active' AND created_at < NOW() - INTERVAL '30 days'
    `;
    const previousActiveResult = await db.query(previousActiveQuery);
    const previousActiveAssets = parseInt(previousActiveResult.rows[0].previous_count || 0);
    const activeAssetsTrend = previousActiveAssets > 0 
      ? ((activeAssets - previousActiveAssets) / previousActiveAssets) * 100 
      : 0;

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

    // Total Asset Value
    const totalValueQuery = `
      SELECT COALESCE(SUM(acquisition_value), 0) as total_value
      FROM assets
      WHERE status = 'active'
    `;
    const totalValueResult = await db.query(totalValueQuery);
    const totalAssetValue = parseFloat(totalValueResult.rows[0].total_value || 0);

    // Average Asset Age (in years)
    const avgAgeQuery = `
      SELECT AVG(EXTRACT(YEAR FROM AGE(NOW(), acquisition_date))) as avg_age
      FROM assets
      WHERE acquisition_date IS NOT NULL AND status = 'active'
    `;
    const avgAgeResult = await db.query(avgAgeQuery);
    const averageAssetAge = parseFloat(avgAgeResult.rows[0].avg_age || 0);

    // Assets Needing Maintenance (with pending or in-progress maintenance orders)
    const maintenanceNeededQuery = `
      SELECT COUNT(DISTINCT asset_id) as count
      FROM maintenance_orders
      WHERE status IN ('pending', 'in_progress')
    `;
    const maintenanceNeededResult = await db.query(maintenanceNeededQuery);
    const assetsNeedingMaintenance = parseInt(maintenanceNeededResult.rows[0].count || 0);

    sendSuccess(res, {
      totalAssets,
      totalAssetsTrend,
      activeAssets,
      activeAssetsTrend,
      assignmentRate,
      totalCategories,
      totalAssetValue,
      averageAssetAge,
      assetsNeedingMaintenance
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

// Get asset value trends over last 12 months
const getAssetValueTrends = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', acquisition_date), 'YYYY-MM') as month,
        SUM(acquisition_value) as total_value,
        COUNT(*) as asset_count
      FROM assets
      WHERE acquisition_date >= NOW() - INTERVAL '12 months'
        AND acquisition_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', acquisition_date)
      ORDER BY month ASC
    `;
    const result = await db.query(query);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

// Get top 5 suppliers by number of assets supplied
const getTopSuppliers = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        s.name,
        s.contact_person,
        COUNT(a.id) as asset_count,
        COALESCE(SUM(a.acquisition_value), 0) as total_value
      FROM suppliers s
      LEFT JOIN assets a ON a.supplier_id = s.id
      GROUP BY s.id, s.name, s.contact_person
      HAVING COUNT(a.id) > 0
      ORDER BY asset_count DESC
      LIMIT 5
    `;
    const result = await db.query(query);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

// Get recent activity from audit logs
const getRecentActivity = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        al.action,
        al.table_name,
        al.record_id,
        al.changed_at as created_at,
        u.full_name as user_name,
        u.email as user_email,
        a.name as asset_name
      FROM audit_logs al
      LEFT JOIN users u ON al.changed_by = u.id
      LEFT JOIN assets a ON al.table_name = 'assets' AND al.record_id = a.id
      ORDER BY al.changed_at DESC
      LIMIT 10
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
  getAssetsByLocation,
  getAssetValueTrends,
  getTopSuppliers,
  getRecentActivity
};
