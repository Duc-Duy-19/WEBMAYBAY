const ChuyenBay = require("../models/chuyenBay.model");

class ChuyenBayController {
  // Get all flights
  static async getAllChuyenBay(req, res) {
    try {
      const chuyenBay = await ChuyenBay.getAll();
      res.json(chuyenBay);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get flight by ID
  static async getChuyenBayById(req, res) {
    try {
      const chuyenBay = await ChuyenBay.getById(req.params.id);
      if (!chuyenBay) {
        return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
      }
      res.json(chuyenBay);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new flight
  static async createChuyenBay(req, res) {
    try {
      const chuyenBayData = {
        ID_SanBayDi: req.body.ID_SanBayDi,
        ID_SanBayDen: req.body.ID_SanBayDen,
        ID_MayBay: req.body.ID_MayBay,
        ThoiGianKhoiHanh: req.body.ThoiGianKhoiHanh,
        ThoiGianHaCanh: req.body.ThoiGianHaCanh,
        GiaCoSo: req.body.GiaCoSo,
        TrangThai: req.body.TrangThai,
      };

      const newChuyenBay = await ChuyenBay.create(chuyenBayData);
      res.status(201).json(newChuyenBay);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update flight
  static async updateChuyenBay(req, res) {
    try {
      const chuyenBayData = {
        ID_ChuyenBay: req.body.ID_ChuyenBay,
        ID_SanBayDi: req.body.ID_SanBayDi,
        ID_SanBayDen: req.body.ID_SanBayDen,
        ID_MayBay: req.body.ID_MayBay,
        ThoiGianKhoiHanh: req.body.ThoiGianKhoiHanh,
        ThoiGianHaCanh: req.body.ThoiGianHaCanh,
        GiaCoSo: req.body.GiaCoSo,
        TrangThai: req.body.TrangThai,
      };
      const updatedChuyenBay = await ChuyenBay.update(
        req.params.id,
        chuyenBayData
      );
      if (!updatedChuyenBay) {
        return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
      }
      res.json(updatedChuyenBay);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete flight
  static async deleteChuyenBay(req, res) {
    try {
      const result = await ChuyenBay.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
      }
      res.json({ message: "Xóa chuyến bay thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ChuyenBayController;
