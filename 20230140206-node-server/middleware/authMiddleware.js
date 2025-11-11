const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Fetch user data from database
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token tidak valid.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token sudah kadaluarsa.' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada autentikasi.', error: error.message });
  }
};