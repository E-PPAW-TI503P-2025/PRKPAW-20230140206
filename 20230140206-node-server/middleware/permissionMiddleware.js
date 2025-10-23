/**
 * Middleware - tambahkan data user dummy ke request
 */
exports.addUserData = (req, res, next) => {
    console.log('Middleware: Menambahkan data user dummy...');
    req.user = {
        id: 1206,
        nama: 'Farhad Dipta Utama',
        role: 'admin'
    };
    next();
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