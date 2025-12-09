const { Presensi, User } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";
exports.CheckIn = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { latitude, longitude } = req.body;
    const waktuSekarang = new Date();

    // Validasi latitude dan longitude
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude dan longitude harus disertakan.",
      });
    }

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({
        message: "Anda sudah melakukan check-in hari ini.",
      });
    }

    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: latitude,
      longitude: longitude,
    });

    const recordWithUser = await Presensi.findByPk(newRecord.id, {
      include: ["user"],
    });

    res.status(201).json({
      message: `Halo ${recordWithUser.user.nama}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: {
        userId: recordWithUser.userId,
        checkIn: format(recordWithUser.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
          timeZone,
        }),
        checkOut: null,
        latitude: recordWithUser.latitude,
        longitude: recordWithUser.longitude,
        user: {
          id: recordWithUser.user.id,
          nama: recordWithUser.user.nama,
          email: recordWithUser.user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.CheckOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
      include: ["user"],
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    res.json({
      message: `Selamat jalan ${recordToUpdate.user.nama}, check-out berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: {
        userId: recordToUpdate.userId,
        checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
          timeZone,
        }),
        checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", {
          timeZone,
        }),
        latitude: recordToUpdate.latitude,
        longitude: recordToUpdate.longitude,
        user: {
          id: recordToUpdate.user.id,
          nama: recordToUpdate.user.nama,
          email: recordToUpdate.user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.deletePresensi = async (req, res) => {
  try {
    const userId = req.user.id;
    const presensiId = req.params.id;

    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({
        message: "Catatan presensi tidak ditemukan.",
      });
    }

    if (recordToDelete.userId !== userId) {
      return res.status(403).json({
        message: "Akses ditolak: Anda bukan pemilik catatan ini.",
      });
    }

    await recordToDelete.destroy();

    res.status(200).json({
      message: `Data presensi dengan ID ${presensiId} berhasil dihapus.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body;

    const recordToUpdate = await Presensi.findByPk(presensiId);

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Catatan presensi tidak ditemukan.",
      });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;

    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
