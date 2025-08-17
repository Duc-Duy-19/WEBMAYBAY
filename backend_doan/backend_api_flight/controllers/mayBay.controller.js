const MayBay = require("../models/mayBay.model");

class MayBayController {
  // Get all aircrafts
  static async getAllMayBay(req, res) {
    try {
      const mayBay = await MayBay.getAll();
      res.json(mayBay);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get aircraft by ID
  static async getMayBayById(req, res) {
    try {
      const mayBay = await MayBay.getById(req.params.id);
      if (!mayBay) {
        return res.status(404).json({ message: "Không tìm thấy máy bay" });
      }
      res.json(mayBay);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new aircraft
  static async createMayBay(req, res) {
    try {
      const mayBayData = {
        loaiMayBay: req.body.loaiMayBay,
        soLuongGhe: req.body.soLuongGhe,
        hangSanXuat: req.body.hangSanXuat,
        TrangThai: req.body.TrangThai,
      };
      const newMayBay = await MayBay.create(mayBayData);
      res.status(201).json(newMayBay);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update aircraft
  static async updateMayBay(req, res) {
    try {
      const mayBayData = {
        loaiMayBay: req.body.loaiMayBay,
        soLuongGhe: req.body.soLuongGhe,
        hangSanXuat: req.body.hangSanXuat,
        TrangThai: req.body.TrangThai,
      };
      const updatedMayBay = await MayBay.update(req.params.id, mayBayData);
      if (!updatedMayBay) {
        return res.status(404).json({ message: "Không tìm thấy máy bay" });
      }
      res.json(updatedMayBay);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete aircraft
  static async deleteMayBay(req, res) {
    try {
      const result = await MayBay.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "Không tìm thấy máy bay" });
      }
      res.json({ message: "Xóa máy bay thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = MayBayController;
