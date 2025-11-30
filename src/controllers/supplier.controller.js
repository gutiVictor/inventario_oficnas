const db = require('../config/db');

const getAllSuppliers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM suppliers ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getSupplierById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createSupplier = async (req, res) => {
  const { name, tax_id, email, phone, contact_person, created_by } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO suppliers (name, tax_id, email, phone, contact_person, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, tax_id, email, phone, contact_person, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateSupplier = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, tax_id, email, phone, contact_person, active, updated_by } = req.body;
  try {
    const result = await db.query(
      'UPDATE suppliers SET name = $1, tax_id = $2, email = $3, phone = $4, contact_person = $5, active = $6, updated_by = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [name, tax_id, email, phone, contact_person, active, updated_by, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteSupplier = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
