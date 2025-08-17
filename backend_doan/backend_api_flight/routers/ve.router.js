const express = require("express");
const router = express.Router();
const VeController = require("../controllers/ve.controller");
const { authAdmin } = require("../middleware/authmidleware");
const { authUser } = require("../middleware/authmidleware");
// Routes không cần xác thực (cho user)

// Lấy vé theo hành khách
router.get("/hanh-khach/:hanhKhachId", VeController.getVeByHanhKhach);

// Lấy vé theo user (với xác thực)
router.get("/user", authUser, VeController.getVeByUser);

// Lấy chi tiết vé
router.get("/chi-tiet/:id", VeController.getChiTietVe);

// Tạo vé mới
router.post("/", VeController.createVe);

// Routes cần xác thực admin
// Lấy tất cả vé
router.get("/", authAdmin, VeController.getAllVe);

// Lấy vé theo ID
router.get("/:id", authAdmin, VeController.getVeById);

// Lấy vé theo chuyến bay
router.get(
  "/chuyen-bay/:chuyenBayId",
  authAdmin,
  VeController.getVeByChuyenBay
);
// Cập nhật vé
router.put("/:id", authAdmin, VeController.updateVe);

// Xóa vé
router.delete("/:id", authAdmin, VeController.deleteVe);

module.exports = router;
