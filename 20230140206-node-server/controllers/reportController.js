const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggal } = req.query;

    let options = {
      where: {},
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nama", "email", "role"],
          where: {}, 
          required: false,
        },
      ],
    };

    if (nama) {
      options.include[0].where.nama = { [Op.like]: `%${nama}%` };
      options.include[0].required = true;
    }

    if (tanggal) {
      const validDate = /^\d{4}-\d{2}-\d{2}$/;

      if (!validDate.test(tanggal)) {
        return res.status(400).json({
          message: "Format tanggal tidak valid, gunakan format YYYY-MM-DD",
        });
      }

      const startDate = new Date(tanggal + "T00:00:00");
      const endDate = new Date(tanggal + "T23:59:59");

      options.where.checkIn = {
        [Op.between]: [startDate, endDate],
      };
    }

    const records = await Presensi.findAll(options);

    return res.json({
      message: "Laporan berhasil diambil",
      filter: {
        nama: nama || null,
        tanggal: tanggal || null,
      },
      total: records.length,
      data: records,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengambil laporan",
      error: error.message,
    });
  }
};
