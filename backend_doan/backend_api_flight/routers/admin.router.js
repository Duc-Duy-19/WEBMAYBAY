// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Route đăng nhập - không cần xác thực
router.post("/login", AdminController.login);
// Tạo admin mới
router.post("/", AdminController.createAdmin);

// Tất cả các routes khác đều cần xác thực JWT
router.use(authAdmin);

// Lấy tất cả admin
router.get("/", AdminController.getAllAdmins);

// Lấy admin theo ID
router.get("/:id", AdminController.getAdminById);

// Cập nhật admin
router.put("/:id", AdminController.updateAdmin);

// Xóa admin
router.delete("/:id", AdminController.deleteAdmin);

module.exports = router;
