const db = require('../config/db');

const getAllAuditLogs = async (req, res) => {
  try {
    const { table_name, action, changed_by, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        al.*,
        u.full_name as changed_by_name
      FROM audit_logs al
      LEFT JOIN users u ON al.changed_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (table_name) {
      query += ` AND al.table_name = $${paramCount}`;
      params.push(table_name);
      paramCount++;
    }

    if (action) {
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (changed_by) {
      query += ` AND al.changed_by = $${paramCount}`;
      params.push(parseInt(changed_by));
      paramCount++;
    }

    if (start_date) {
      query += ` AND al.changed_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND al.changed_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ` ORDER BY al.changed_at DESC, al.id DESC LIMIT 500`;

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAuditLogById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query(`
      SELECT 
        al.*,
        u.full_name as changed_by_name
      FROM audit_logs al
      LEFT JOIN users u ON al.changed_by = u.id
      WHERE al.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllAuditLogs,
  getAuditLogById
};
