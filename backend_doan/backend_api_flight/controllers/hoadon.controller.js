const HoaDon = require("../models/hoadon.model");
const CT_HoaDon = require("../models/ct_hoadon.model");

class HoaDonController {
  // Lấy tất cả hóa đơn
  async getAll(req, res) {
    try {
      const hoaDons = await HoaDon.getAll();
      res.json(hoaDons);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy hóa đơn theo ID
  async getById(req, res) {
    try {
      const hoaDon = await HoaDon.getById(req.params.id);
      if (!hoaDon) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }
      res.json(hoaDon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy hóa đơn theo ID User
  async getByUserId(req, res) {
    try {
      const hoaDons = await HoaDon.getByUserId(req.params.userId);
      res.json(hoaDons);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy hóa đơn theo ID Vé
  async getByVeId(req, res) {
    try {
      const hoaDon = await HoaDon.getByVeId(req.params.veId);
      if (!hoaDon) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }
      res.json(hoaDon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tạo hóa đơn mới
  async create(req, res) {
    try {
      console.log("req.user khi tạo hóa đơn:", req.user);
      const hoaDonData = {
        ngayThanhToan: new Date(),
        tongTien: req.body.tongTien,
        idAdmin: req.body.idAdmin,
        idUser : req.user.ID_User, 
        idVe: req.body.idVe,
      };

      const newHoaDon = await HoaDon.create(hoaDonData);
      res.status(201).json(newHoaDon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Cập nhật hóa đơn
  async update(req, res) {
    try {
      const hoaDonData = {
        ngayThanhToan: req.body.ngayThanhToan,
        tongTien: req.body.tongTien,
      };

      const updatedHoaDon = await HoaDon.update(req.params.id, hoaDonData);
      if (!updatedHoaDon) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }
      res.json(updatedHoaDon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Xóa hóa đơn
  async delete(req, res) {
    try {
      const result = await HoaDon.delete(req.params.id);
      if (result === 0) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
      }
      res.json({ message: "Xóa hóa đơn thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy chi tiết hóa đơn
  async getChiTietHoaDon(req, res) {
    try {
      const chiTietHoaDon = await CT_HoaDon.getByHoaDonId(req.params.id);
      res.json(chiTietHoaDon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new HoaDonController();
