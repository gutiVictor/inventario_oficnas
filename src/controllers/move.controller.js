const db = require('../config/db');

const getAllMoves = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        am.*,
        a.name as asset_name,
        a.asset_tag,
        l1.name as from_location,
        l2.name as to_location,
        u.full_name as moved_by_name
      FROM asset_moves am
      LEFT JOIN assets a ON am.asset_id = a.id
      LEFT JOIN locations l1 ON am.from_location_id = l1.id
      LEFT JOIN locations l2 ON am.to_location_id = l2.id
      LEFT JOIN users u ON am.moved_by = u.id
      ORDER BY am.move_date DESC, am.id DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMoveById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('SELECT * FROM asset_moves WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createMove = async (req, res) => {
  const { asset_id, from_location_id, to_location_id, moved_by, move_date, reason, created_by } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO asset_moves (
        asset_id, from_location_id, to_location_id, moved_by, move_date, reason, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [asset_id, from_location_id, to_location_id, moved_by, move_date, reason, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Moves are usually historical records, but we'll allow updates if needed
const updateMove = async (req, res) => {
  const id = parseInt(req.params.id);
  const { asset_id, from_location_id, to_location_id, moved_by, move_date, reason } = req.body;
  try {
    const result = await db.query(
      `UPDATE asset_moves SET
        asset_id = $1, from_location_id = $2, to_location_id = $3, moved_by = $4,
        move_date = $5, reason = $6
      WHERE id = $7 RETURNING *`,
      [asset_id, from_location_id, to_location_id, moved_by, move_date, reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteMove = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db.query('DELETE FROM asset_moves WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    res.status(200).json({ message: 'Move deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllMoves,
  getMoveById,
  createMove,
  updateMove,
  deleteMove
};
