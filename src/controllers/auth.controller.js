const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/responses');

// Secret key for JWT (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Register a new user
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, employee_id, department, job_title } = req.body;

    // Check if user already exists
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return sendError(res, 400, 'El usuario ya existe con este correo electrónico');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const query = `
      INSERT INTO users (full_name, email, password, employee_id, department, job_title, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING id, full_name, email, employee_id, department, job_title, status, created_at
    `;
    
    const values = [full_name, email, hashedPassword, employee_id, department, job_title];
    const result = await db.query(query, values);
    const newUser = result.rows[0];

    // Generate token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    sendSuccess(res, 201, 'Usuario registrado exitosamente', {
      user: newUser,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return sendError(res, 401, 'Credenciales inválidas');
    }

    // Check password
    // If user has no password (migrated users), they might need to reset or use default
    if (!user.password) {
        // For security, migrated users without password should not be able to login until password is set
        // Or we could allow a specific flow. For now, fail.
        return sendError(res, 401, 'Cuenta sin contraseña configurada. Contacte al administrador.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Credenciales inválidas');
    }

    if (user.status !== 'active') {
      return sendError(res, 403, 'Su cuenta está desactivada. Contacte al administrador.');
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // Remove password from response
    delete user.password;

    sendSuccess(res, 200, 'Inicio de sesión exitoso', {
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, full_name, email, employee_id, department, job_title, status, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return sendError(res, 404, 'Usuario no encontrado');
    }

    sendSuccess(res, 200, 'Información de usuario recuperada', user);
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user password
        const result = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];

        if (!user) {
            return sendError(res, 404, 'Usuario no encontrado');
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return sendError(res, 400, 'La contraseña actual es incorrecta');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        sendSuccess(res, 200, 'Contraseña actualizada exitosamente');
    } catch (error) {
        next(error);
    }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword
};
