const db = require('../config/db');
const { sendSuccess, sendCreated, sendNotFound } = require('../utils/responses');

// Get all maintenance orders with JOINs
const getAllMaintenanceOrders = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        mo.*,
        a.asset_tag,
        a.name as asset_name,
        a.brand as asset_brand,
        a.model as asset_model,
        u.full_name as technician_name,
        u.email as technician_email
      FROM maintenance_orders mo
      LEFT JOIN assets a ON mo.asset_id = a.id
      LEFT JOIN users u ON mo.technician_id = u.id
      ORDER BY mo.planned_date DESC
    `);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

// Get maintenance order by ID with JOINs
const getMaintenanceOrderById = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query(`
      SELECT 
        mo.*,
        a.asset_tag,
        a.name as asset_name,
        a.brand as asset_brand,
        a.model as asset_model,
        a.serial_number as asset_serial,
        a.location_id,
        l.name as location_name,
        u.full_name as technician_name,
        u.email as technician_email,
        u.phone as technician_phone,
        u1.full_name as created_by_name,
        u2.full_name as updated_by_name
      FROM maintenance_orders mo
      LEFT JOIN assets a ON mo.asset_id = a.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN users u ON mo.technician_id = u.id
      LEFT JOIN users u1 ON mo.created_by = u1.id
      LEFT JOIN users u2 ON mo.updated_by = u2.id
      WHERE mo.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Maintenance Order');
    }
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Create new maintenance order
const createMaintenanceOrder = async (req, res, next) => {
  const {
    asset_id, type, status, planned_date, start_date, end_date,
    cost_parts, cost_labor, technician_id, notes, created_by
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO maintenance_orders (
        asset_id, type, status, planned_date, start_date, end_date,
        cost_parts, cost_labor, technician_id, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        asset_id, type, status || 'scheduled', planned_date, start_date, end_date,
        cost_parts || 0, cost_labor || 0, technician_id, notes, created_by
      ]
    );
    sendCreated(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update maintenance order
const updateMaintenanceOrder = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const {
    asset_id, type, status, planned_date, start_date, end_date,
    cost_parts, cost_labor, technician_id, notes, updated_by
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE maintenance_orders SET
        asset_id = $1, type = $2, status = $3, planned_date = $4, start_date = $5, end_date = $6,
        cost_parts = $7, cost_labor = $8, technician_id = $9, notes = $10, updated_by = $11, updated_at = NOW()
      WHERE id = $12 RETURNING *`,
      [
        asset_id, type, status, planned_date, start_date, end_date,
        cost_parts, cost_labor, technician_id, notes, updated_by, id
      ]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Maintenance Order');
    }
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete maintenance order
const deleteMaintenanceOrder = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('DELETE FROM maintenance_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Maintenance Order');
    }
    sendSuccess(res, { message: 'Maintenance Order deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenanceOrders,
  getMaintenanceOrderById,
  createMaintenanceOrder,
  updateMaintenanceOrder,
  deleteMaintenanceOrder
};
