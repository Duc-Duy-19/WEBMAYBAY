const express = require("express");
const router = express.Router();
const hoadonController = require("../controllers/hoadon.controller");
const { authAdmin } = require("../middleware/authmidleware");
const { authUser } = require("../middleware/authmidleware");

// Lấy tất cả hóa đơn (chỉ admin)
router.get("/", authAdmin, hoadonController.getAll);

// Lấy hóa đơn theo ID
router.get("/:id", hoadonController.getById);

// Lấy hóa đơn theo ID User
router.get("/user/:userId", hoadonController.getByUserId);

// Lấy hóa đơn theo ID Vé
router.get("/ve/:veId", hoadonController.getByVeId);

// Tạo hóa đơn mới
router.post("/",authUser, hoadonController.create);

// Cập nhật hóa đơn (chỉ admin)
router.put("/:id", authAdmin, hoadonController.update);

// Xóa hóa đơn (chỉ admin)
router.delete("/:id", authAdmin, hoadonController.delete);

// Lấy chi tiết hóa đơn
router.get("/:id/chitiet", hoadonController.getChiTietHoaDon);

module.exports = router;
