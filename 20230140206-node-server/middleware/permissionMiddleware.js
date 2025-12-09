const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

/**
 * Middleware - autentikasi dan tambahkan user data dari JWT token
 */
exports.addUserData = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
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

/**
 * Middleware - cek apakah user adalah admin
 */
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        console.log('Middleware: Izin admin diberikan.');
        return next();
    }

    console.log('Middleware: Gagal! Pengguna bukan admin.');
    return res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin' });
};