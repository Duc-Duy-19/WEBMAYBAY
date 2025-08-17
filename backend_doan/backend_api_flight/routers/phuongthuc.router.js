const express = require("express");
const router = express.Router();
const PhuongThucController = require("../controllers/phuongthuc.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Lấy tất cả phương thức thanh toán
router.get("/", PhuongThucController.getAllPhuongThuc);

// Lấy phương thức thanh toán theo ID
router.get("/:id", PhuongThucController.getPhuongThucById);

// Tạo phương thức thanh toán (chỉ admin)
router.post("/", authAdmin, PhuongThucController.createPhuongThuc);

module.exports = router;
