const PhuongThuc = require("../models/phuongthuc.model");

class PhuongThucController {
  // Lấy tất cả phương thức thanh toán
  static async getAllPhuongThuc(req, res) {
    try {
      const phuongThucs = await PhuongThuc.getAll();
      res.json(phuongThucs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy phương thức thanh toán theo ID
  static async getPhuongThucById(req, res) {
    try {
      const phuongThuc = await PhuongThuc.getById(req.params.id);
      if (!phuongThuc) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy phương thức thanh toán" });
      }
      res.json(phuongThuc);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tạo phương thức thanh toán mới
  static async createPhuongThuc(req, res) {
    try {
      const phuongThucData = {
        tenPhuongThuc: req.body.tenPhuongThuc,
      };
      const newPhuongThuc = await PhuongThuc.create(phuongThucData);
      res.status(201).json(newPhuongThuc);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = PhuongThucController;
