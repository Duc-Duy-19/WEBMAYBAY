const express = require("express");
const router = express.Router();
const DichVuController = require("../controllers/dichvu.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Routes công khai (không cần xác thực)
// Lấy tất cả dịch vụ
router.get("/", DichVuController.getAllDichVu);

// Lấy dịch vụ theo ID
router.get("/:id", DichVuController.getDichVuById);

// Routes cần xác thực admin
// Tạo dịch vụ mới
router.post("/", authAdmin, DichVuController.createDichVu);

// Cập nhật dịch vụ
router.put("/:id", authAdmin, DichVuController.updateDichVu);

// Xóa dịch vụ
router.delete("/:id", authAdmin, DichVuController.deleteDichVu);

module.exports = router;
