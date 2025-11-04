const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggal } = req.query;
    let options = { where: {} };

    if (nama) {
      options.where.nama = { [Op.like]: `%${nama}%` };
    }

    if (tanggal) {
      const validDate = /^\d{4}-\d{2}-\d{2}$/;
      if (!validDate.test(tanggal)) {
        return res.status(400).json({
          message: "Format tanggal tidak valid, gunakan format YYYY-MM-DD",
        });
      }
      
      const startDate = new Date(tanggal);
      const endDate = new Date(tanggal);
      endDate.setHours(23, 59, 59, 999);

      options.where.checkIn = {
        [Op.between]: [startDate, endDate],
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};