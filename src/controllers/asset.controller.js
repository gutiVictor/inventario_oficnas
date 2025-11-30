const db = require('../config/db');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/responses');

// Get all assets with pagination, filtering, and JOINs
const getAllAssets = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category_id, 
      location_id, 
      status, 
      condition,
      search 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause dynamically
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (category_id) {
      conditions.push(`a.category_id = $${paramCount++}`);
      params.push(category_id);
    }
    if (location_id) {
      conditions.push(`a.location_id = $${paramCount++}`);
      params.push(location_id);
    }
    if (status) {
      conditions.push(`a.status = $${paramCount++}`);
      params.push(status);
    }
    if (condition) {
      conditions.push(`a.condition = $${paramCount++}`);
      params.push(condition);
    }
    if (search) {
      conditions.push(`(
        a.name ILIKE $${paramCount} OR 
        a.brand ILIKE $${paramCount} OR 
        a.model ILIKE $${paramCount} OR 
        a.asset_tag ILIKE $${paramCount} OR 
        a.serial_number ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM assets a ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results with JOINs
    params.push(limit, offset);
    const dataQuery = `
      SELECT 
        a.*,
        c.name as category_name,
        l.name as location_name,
        l.code as location_code,
        l.city as location_city,
        s.name as supplier_name,
        s.contact_person as supplier_contact
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN suppliers s ON a.supplier_id = s.id
      ${whereClause}
      ORDER BY a.id DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    
    const result = await db.query(dataQuery, params);
    sendPaginated(res, result.rows, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// Get asset by ID with JOINs
const getAssetById = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query(`
      SELECT 
        a.*,
        c.name as category_name,
        c.parent_id as category_parent_id,
        l.name as location_name,
        l.code as location_code,
        l.address as location_address,
        l.city as location_city,
        l.country as location_country,
        s.name as supplier_name,
        s.email as supplier_email,
        s.phone as supplier_phone,
        s.contact_person as supplier_contact,
        u1.full_name as created_by_name,
        u2.full_name as updated_by_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN suppliers s ON a.supplier_id = s.id
      LEFT JOIN users u1 ON a.created_by = u1.id
      LEFT JOIN users u2 ON a.updated_by = u2.id
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Asset');
    }
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Create new asset
const createAsset = async (req, res, next) => {
  const {
    category_id, location_id, supplier_id, asset_tag, serial_number,
    name, brand, model, acquisition_date, acquisition_value,
    useful_life_months, residual_value, status, condition, specs, notes, created_by
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO assets (
        category_id, location_id, supplier_id, asset_tag, serial_number,
        name, brand, model, acquisition_date, acquisition_value,
        useful_life_months, residual_value, status, condition, specs, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        category_id, location_id, supplier_id, asset_tag, serial_number,
        name, brand, model, acquisition_date, acquisition_value,
        useful_life_months || 60, residual_value || 0, status, condition, 
        specs ? JSON.stringify(specs) : null, notes, created_by
      ]
    );
    sendCreated(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update asset
const updateAsset = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const {
    category_id, location_id, supplier_id, asset_tag, serial_number,
    name, brand, model, acquisition_date, acquisition_value,
    useful_life_months, residual_value, status, condition, specs, notes, updated_by
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE assets SET
        category_id = $1, location_id = $2, supplier_id = $3, asset_tag = $4, serial_number = $5,
        name = $6, brand = $7, model = $8, acquisition_date = $9, acquisition_value = $10,
        useful_life_months = $11, residual_value = $12, status = $13, condition = $14,
        specs = $15, notes = $16, updated_by = $17, updated_at = NOW()
      WHERE id = $18 RETURNING *`,
      [
        category_id, location_id, supplier_id, asset_tag, serial_number,
        name, brand, model, acquisition_date, acquisition_value,
        useful_life_months, residual_value, status, condition, 
        specs ? JSON.stringify(specs) : null, notes, updated_by, id
      ]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Asset');
    }
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete asset
const deleteAsset = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return sendNotFound(res, 'Asset');
    }
    sendSuccess(res, { message: 'Asset deleted successfully', id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
