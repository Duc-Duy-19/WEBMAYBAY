// controllers/admin.controller.js
const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");

// Khóa bí mật JWT -
const JWT_SECRET = "your_jwt_secret_key";

class AdminController {
  // Lấy tất cả admin
  static async getAllAdmins(req, res) {
    try {
      const admins = await Admin.getAll();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy admin theo ID
  static async getAdminById(req, res) {
    try {
      const admin = await Admin.getById(req.params.id);
      if (!admin) {
        return res.status(404).json({ message: "Không tìm thấy admin" });
      }
      res.json(admin);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tạo admin mới
  static async createAdmin(req, res) {
    try {
      const adminData = {
        taiKhoan: req.body.taiKhoan,
        matKhau: req.body.matKhau,
        hoTen: req.body.hoTen,
        email: req.body.email,
        sdt: req.body.sdt,
      };
      const newAdmin = await Admin.create(adminData);
      res.status(201).json(newAdmin);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Cập nhật admin
  static async updateAdmin(req, res) {
    try {
      const adminData = {
        taiKhoan: req.body.taiKhoan,
        matKhau: req.body.matKhau,
        hoTen: req.body.hoTen,
        email: req.body.email,
        sdt: req.body.sdt,
      };
      const updatedAdmin = await Admin.update(req.params.id, adminData);
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Không tìm thấy admin" });
      }
      res.json(updatedAdmin);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Xóa admin
  static async deleteAdmin(req, res) {
    try {
      const result = await Admin.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "Không tìm thấy admin" });
      }
      res.json({ message: "Xóa admin thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Đăng nhập với JWT
  static async login(req, res) {
    try {
      const { taiKhoan, matKhau } = req.body;
      const admin = await Admin.login(taiKhoan, matKhau);
      if (!admin) {
        return res
          .status(401)
          .json({ message: "Thông tin đăng nhập không hợp lệ" });
      }

      // Tạo token JWT
      const token = jwt.sign(
        {
          id: admin.ID_Admin,
          taiKhoan: admin.TaiKhoan,
          role: "admin",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Trả về thông tin admin và token
      res.json({
        admin: {
          id: admin.ID_Admin,
          taiKhoan: admin.TaiKhoan,
          hoTen: admin.HoTen,
          email: admin.Email,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AdminController;
