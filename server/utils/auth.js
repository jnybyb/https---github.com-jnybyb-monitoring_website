const jwt = require('jsonwebtoken');
const { getPromisePool } = require('../config/database');
const BaseController = require('../controllers/baseController');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_EXPIRES_IN = '7d';

const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return BaseController.sendUnauthorized(res, 'Missing token');
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return BaseController.sendUnauthorized(res, 'Invalid or expired token');
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return BaseController.sendForbidden(res, 'Admin access required');
  }
  next();
};

const findAdminByUsername = async (username) => {
  const [rows] = await getPromisePool().query('SELECT id, username, password_hash, role FROM admins WHERE username = ?', [username]);
  return rows[0] || null;
};

module.exports = {
  signToken,
  verifyToken,
  authenticate,
  requireAdmin,
  findAdminByUsername
};


