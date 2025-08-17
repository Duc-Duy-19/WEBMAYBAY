const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const { authAdmin } = require("../middleware/authmidleware");
const { authUser } = require("../middleware/authmidleware");

// Routes cần xác thực admin (quản lý tất cả người dùng)
// Get all users
router.get("/", authAdmin, UserController.getAllUsers);

// Routes công khai
// Create new user (đăng ký)
router.post("/register", UserController.createUser);

// Login
router.post("/login", UserController.login);

// Routes có thể cần kiểm tra quyền riêng (người dùng chỉ cập nhật/xem thông tin của chính họ)
// Get user by ID
router.get("/:id", UserController.getUserById);

// Update user
router.put("/:id", UserController.updateUser);

// Delete user
router.delete("/:id", authAdmin, UserController.deleteUser);

module.exports = router;
