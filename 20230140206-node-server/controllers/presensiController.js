// 1. Ganti sumber data dari array ke model Sequelize
const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

exports.getAllPresensi = async (req, res) => {
  try {
    const allRecords = await Presensi.findAll({
      order: [['checkIn', 'DESC']]
    });

    const formattedRecords = allRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      checkIn: format(record.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: record.checkOut ? format(record.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }) : null,
    }));

    res.json({
      data: formattedRecords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error mengambil data presensi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data presensi.",
      error: error.message,
    });
  }
};

exports.CheckIn = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const waktuSekarang = new Date();
    const { latitude, longitude } = req.body;

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId,
      checkIn: waktuSekarang,
      checkOut: null,
      latitude,
      longitude,
      buktiFoto: req.file ? req.file.path : null
    });

    const formattedData = {
      id: newRecord.id,
      userId: newRecord.userId,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: newRecord.checkOut,
    };

    console.log(
      `DATA TERUPDATE: Karyawan (ID: ${userId}) melakukan check-in.`
    );

    res.status(201).json({
      message: `Check-in berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error saat check-in:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat melakukan check-in.",
      error: error.message,
    });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
    };

    res.json({
      message: `Check-out berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.getPresensiById = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const record = await Presensi.findByPk(presensiId);

    if (!record) {
      return res.status(404).json({ message: "Data presensi tidak ditemukan." });
    }

    const formattedData = {
      id: record.id,
      userId: record.userId,
      nama: record.nama,
      checkIn: format(record.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: record.checkOut ? format(record.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }) : null,
    };

    res.json({
      data: formattedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error mengambil data presensi:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengambil data presensi.",
      error: error.message,
    });
  }
};

exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id; // Fixed: was incorrectly destructuring
    const recordToDelete = await Presensi.findByPk(presensiId);
    if (!recordToDelete) {
      return res.status(404).json({ message: "Data presensi tidak ditemukan." });
    }
    if (recordToDelete.userId !== userId) {
      return res.status(403).json({ message: "Anda tidak berhak menghapus data ini." });
    }
    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.updatePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body;

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res.status(404).json({ message: "Data presensi tidak ditemukan." });
    }
    if (recordToUpdate.userId !== userId) {
      return res.status(403).json({ message: "Anda tidak berhak mengubah data ini." });
    }

    if (checkIn) recordToUpdate.checkIn = new Date(checkIn);
    if (checkOut) recordToUpdate.checkOut = new Date(checkOut);

    await recordToUpdate.save();

    const formattedData = {
      id: recordToUpdate.id,
      userId: recordToUpdate.userId,
      nama: recordToUpdate.nama,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: recordToUpdate.checkOut ? format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }) : null,
    };

    res.json({
      message: "Data presensi berhasil diperbarui",
      data: formattedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });