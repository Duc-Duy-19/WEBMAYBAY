const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_jwt_secret_key";
class UserController {
  // Get all users
  static async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const user = await User.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new user
  static async createUser(req, res) {
    try {
      const userData = {
        email: req.body.email,
        hoTen: req.body.hoTen,
        matKhau: req.body.matKhau,
        sdt: req.body.sdt,
      };
      const newUser = await User.create(userData);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const userData = {
        email: req.body.email,
        hoTen: req.body.hoTen,
        matKhau: req.body.matKhau,
        sdt: req.body.sdt,
      };
      const updatedUser = await User.update(req.params.id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const result = await User.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, matKhau } = req.body;

      // Kiểm tra thông tin đăng nhập
      const user = await User.login(email, matKhau);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Thông tin đăng nhập không hợp lệ" });
      }

      // Tạo token JWT
      const token = jwt.sign(
        { id: user.ID_User, email: user.Email, role: "user" },
        JWT_SECRET,
        { expiresIn: "24h" } // Token hết hạn sau 24 giờ
      );

      // Trả về thông tin người dùng (loại bỏ mật khẩu) và token
      const userInfo = {
        id: user.ID_User,
        email: user.Email,
        hoTen: user.HoTen,
        sdt: user.SDT,
      };

      res.json({
        user: userInfo,
        token,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = UserController;
