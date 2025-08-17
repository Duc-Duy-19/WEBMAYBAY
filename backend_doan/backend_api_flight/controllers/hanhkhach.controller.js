const HanhKhachModel = require("../models/hanhkhach.model"); // Đổi tên biến import

class HanhKhachController {
  static async getAllHanhKhach(req, res) {
    try {
      const hanhKhachs = await HanhKhachModel.getAll(); // Dùng tên model đã đổi
      res.json(hanhKhachs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getHanhKhachById(req, res) {
    try {
      const hanhKhach = await HanhKhachModel.getById(req.params.id);
      if (!hanhKhach) {
        return res.status(404).json({ message: "Hành khách không tồn tại" });
      }
      res.json(hanhKhach);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createHanhKhach(req, res) {
    try {
      const hanhKhachData = {
        hoTen: req.body.hoTen,
        ngaySinh: req.body.ngaySinh,
        gioiTinh: req.body.gioiTinh,
        soHoChieu_CCCD: req.body.soHoChieu_CCCD,
        sdt: req.body.sdt,
        email: req.body.email,
        diaChi: req.body.diaChi,
        idUser: req.body.idUser,
      };
      const newHanhKhach = await HanhKhachModel.create(hanhKhachData);
      res.status(201).json(newHanhKhach);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateHanhKhach(req, res) {
    try {
      const hanhKhachData = {
        hoTen: req.body.hoTen,
        ngaySinh: req.body.ngaySinh,
        gioiTinh: req.body.gioiTinh,
        soHoChieu_CCCD: req.body.soHoChieu_CCCD,
        sdt: req.body.sdt,
        email: req.body.email,
        diaChi: req.body.diaChi,
        idUser: req.body.idUser,
      };
      const updatedHanhKhach = await HanhKhachModel.update(
        req.params.id,
        hanhKhachData
      );
      if (!updatedHanhKhach) {
        return res.status(404).json({ message: "Hành khách không tồn tại" });
      }
      res.json(updatedHanhKhach);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteHanhKhach(req, res) {
    try {
      const result = await HanhKhachModel.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "Hành khách không tồn tại" });
      }
      res.json({ message: "Xóa hành khách thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getHanhKhachByUserId(req, res) {
    try {
      const hanhKhachs = await HanhKhachModel.getByUserId(req.params.userId);
      res.json(hanhKhachs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = HanhKhachController;
