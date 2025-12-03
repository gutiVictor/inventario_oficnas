const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responses');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Bearer TOKEN
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 401, 'Acceso denegado. Token no proporcionado.');
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return sendError(res, 403, 'Token inválido o expirado.');
  }
};

module.exports = { authenticateToken };
