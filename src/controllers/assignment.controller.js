const db = require('../config/db');
const { sendSuccess, sendCreated, sendNotFound } = require('../utils/responses');

// Get all assignments with JOINs
const getAllAssignments = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        aa.*,
        a.asset_tag,
        a.name as asset_name,
        a.brand as asset_brand,
        a.model as asset_model,
        u.full_name as user_name,
        u.email as user_email,
        u.department as user_department,
        u.job_title as user_job_title
      FROM asset_assignments aa
      LEFT JOIN assets a ON aa.asset_id = a.id
      LEFT JOIN users u ON aa.user_id = u.id
      ORDER BY aa.id DESC
    `);
    sendSuccess(res, result.rows);
  } catch (error) {
    next(error);
  }
};

// Get assignment by ID with JOINs
const getAssignmentById = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query(`
      SELECT 
        aa.*,
        a.asset_tag,
        a.name as asset_name,
        a.brand as asset_brand,
        a.model as asset_model,
        a.serial_number as asset_serial,
        u.full_name as user_name,
        u.email as user_email,
        u.employee_id as user_employee_id,
        u.department as user_department,
        u.job_title as user_job_title,
        u1.full_name as created_by_name,
        u2.full_name as updated_by_name
      FROM asset_assignments aa
      LEFT JOIN assets a ON aa.asset_id = a.id
      LEFT JOIN users u ON aa.user_id = u.id
      LEFT JOIN users u1 ON aa.created_by = u1.id
      LEFT JOIN users u2 ON aa.updated_by = u2.id
      WHERE aa.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Assignment');
    }
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Create new assignment
const createAssignment = async (req, res, next) => {
  const { asset_id, user_id, assigned_date, expected_return_date, notes, created_by } = req.body;
  
  try {
    // Check if asset is already assigned
    const existingAssignment = await db.query(
      `SELECT id FROM asset_assignments 
       WHERE asset_id = $1 AND status = 'active'`,
      [asset_id]
    );
    
    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Asset is already assigned',
        message: 'This asset has an active assignment. Please return it before assigning to another user.'
      });
    }
    
    const result = await db.query(
      `INSERT INTO asset_assignments (
        asset_id, user_id, assigned_date, expected_return_date, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [asset_id, user_id, assigned_date, expected_return_date, notes, created_by]
    );
    sendCreated(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update assignment
const updateAssignment = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const {
    asset_id, user_id, assigned_date, expected_return_date, return_date,
    status, notes, updated_by
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE asset_assignments SET
        asset_id = $1, user_id = $2, assigned_date = $3, expected_return_date = $4,
        return_date = $5, status = $6, notes = $7, updated_by = $8, updated_at = NOW()
      WHERE id = $9 RETURNING *`,
      [
        asset_id, user_id, assigned_date, expected_return_date,
        return_date, status, notes, updated_by, id
      ]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Assignment');
    }
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete assignment
const deleteAssignment = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('DELETE FROM asset_assignments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Assignment');
    }
    sendSuccess(res, { message: 'Assignment deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
