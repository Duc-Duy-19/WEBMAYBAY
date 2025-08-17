const LoaiGhe = require("../models/loaiGhe.model");

class LoaiGheController {
  // Get all seat types
  static async getAllLoaiGhe(req, res) {
    try {
      const loaiGhe = await LoaiGhe.getAll();
      res.json(loaiGhe);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get seat type by ID
  static async getLoaiGheById(req, res) {
    try {
      const loaiGhe = await LoaiGhe.getById(req.params.id);
      if (!loaiGhe) {
        return res.status(404).json({ message: "Không tìm thấy loại ghế" });
      }
      res.json(loaiGhe);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new seat type
  static async createLoaiGhe(req, res) {
    try {
      const loaiGheData = {
        TenLoai: req.body.TenLoai,
        HeSoGia: req.body.HeSoGia,
      };
      const newLoaiGhe = await LoaiGhe.create(loaiGheData);
      res.status(201).json(newLoaiGhe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update seat type
  static async updateLoaiGhe(req, res) {
    try {
      const loaiGheData = {
        TenLoai: req.body.TenLoai,

        HeSoGia: req.body.HeSoGia,
      };
      const updatedLoaiGhe = await LoaiGhe.update(req.params.id, loaiGheData);
      if (!updatedLoaiGhe) {
        return res.status(404).json({ message: "Không tìm thấy loại ghế" });
      }
      res.json(updatedLoaiGhe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete seat type
  static async deleteLoaiGhe(req, res) {
    try {
      const result = await LoaiGhe.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "Không tìm thấy loại ghế" });
      }
      res.json({ message: "Xóa loại ghế thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = LoaiGheController;
