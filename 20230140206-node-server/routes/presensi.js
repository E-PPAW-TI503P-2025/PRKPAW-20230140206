const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { addUserData } = require('../middleware/permissionMiddleware');

const upload = require('../middleware/upload');

router.use(addUserData);

router.get('/', presensiController.getAllPresensi);

router.get('/:id', presensiController.getPresensiById);

// router.post('/check-in', presensiController.CheckIn); // Removed duplicate
router.post('/check-out', presensiController.CheckOut);

router.delete('/:id', presensiController.deletePresensi);
router.put('/:id', presensiController.updatePresensi);

router.post('/check-in', upload.single('image'), presensiController.CheckIn);

module.exports = router;