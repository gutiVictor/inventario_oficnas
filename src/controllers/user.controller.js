const db = require('../config/db');

const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, full_name, email, employee_id, department, job_title, status, created_at FROM users ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('SELECT id, full_name, email, employee_id, department, job_title, status, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createUser = async (req, res) => {
  const { full_name, email, password, employee_id, department, job_title, created_by } = req.body;
  try {
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const result = await db.query(
      'INSERT INTO users (full_name, email, password, employee_id, department, job_title, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, full_name, email, employee_id, department, job_title, status, created_at',
      [full_name, email, hashedPassword, employee_id, department, job_title, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { full_name, email, password, employee_id, department, job_title, active, updated_by } = req.body;
  try {
    let query = 'UPDATE users SET full_name = $1, email = $2, employee_id = $3, department = $4, job_title = $5, active = $6, updated_by = $7, updated_at = NOW()';
    let values = [full_name, email, employee_id, department, job_title, active, updated_by];
    let paramCount = 8;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += `, password = $${paramCount}`;
      values.push(hashedPassword);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount - 1} RETURNING id, full_name, email, employee_id, department, job_title, status, created_at`;
    values.push(id);

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
