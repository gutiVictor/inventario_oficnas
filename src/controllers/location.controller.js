const db = require('../config/db');

const getAllLocations = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM locations ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getLocationById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('SELECT * FROM locations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createLocation = async (req, res) => {
  const { name, code, address, city, country, created_by } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO locations (name, code, address, city, country, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, code, address, city, country || 'MX', created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateLocation = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, code, address, city, country, active, updated_by } = req.body;
  try {
    const result = await db.query(
      'UPDATE locations SET name = $1, code = $2, address = $3, city = $4, country = $5, active = $6, updated_by = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [name, code, address, city, country, active, updated_by, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteLocation = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('DELETE FROM locations WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getAllLocations, getLocationById, createLocation, updateLocation, deleteLocation };
