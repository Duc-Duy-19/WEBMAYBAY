const Ghe = require("../models/ghe.model");

class GheController {
  // Get all seats
  static async getAllGhe(req, res) {
    try {
      const ghe = await Ghe.getAll();
      res.json(ghe);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get seat by ID
  static async getGheById(req, res) {
    try {
      const ghe = await Ghe.getById(req.params.id);
      if (!ghe) {
        return res.status(404).json({ message: "Không tìm thấy ghế" });
      }
      res.json(ghe);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy danh sách ghế trống của một chuyến bay
  static async getGheTrong(req, res) {
    try {
      const ghesTrong = await Ghe.getAvailableSeats(req.params.chuyenBayId);
      res.json(ghesTrong);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get seats by aircraft ID
  static async getGheByMayBayId(req, res) {
    try {
      const ghe = await Ghe.getByAircraftId(req.params.mayBayId);
      res.json(ghe);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new seat
  static async createGhe(req, res) {
    try {
      const gheData = {
        soGhe: req.body.soGhe,
        hang: req.body.hang, // 👈 thêm dòng này
        idMayBay: req.body.idMayBay,
        idLoaiGhe: req.body.idLoaiGhe,
        TrangThai: req.body.TrangThai,
      };

      const newGhe = await Ghe.create(gheData);
      res.status(201).json(newGhe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update seat
  static async updateGhe(req, res) {
    try {
      const gheData = {
        soGhe: req.body.soGhe,
        hang: req.body.hang,
        idMayBay: req.body.idMayBay,
        idLoaiGhe: req.body.idLoaiGhe,
        TrangThai: req.body.TrangThai,
      };
      const updatedGhe = await Ghe.update(req.params.id, gheData);
      if (!updatedGhe) {
        return res.status(404).json({ message: "Không tìm thấy ghế" });
      }
      res.json(updatedGhe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete seat
  static async deleteGhe(req, res) {
    try {
      const result = await Ghe.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "Không tìm thấy ghế" });
      }
      res.json({ message: "Xóa ghế thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = GheController;
