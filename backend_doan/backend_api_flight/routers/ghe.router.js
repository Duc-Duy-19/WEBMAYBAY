const express = require("express");
const router = express.Router();
const GheController = require("../controllers/ghe.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Routes công khai (không cần xác thực)
// Get all seats
router.get("/", GheController.getAllGhe);

// Lấy danh sách ghế trống của một chuyến bay
router.get("/ghe-trong/:chuyenBayId", GheController.getGheTrong);
// Get seat by ID
router.get("/:id", GheController.getGheById);

// Get seats by aircraft ID
router.get("/may-bay/:mayBayId", GheController.getGheByMayBayId);

// Routes cần xác thực admin
// Create new seat
router.post("/", authAdmin, GheController.createGhe);

// Update seat
router.put("/:id", authAdmin, GheController.updateGhe);

// Delete seat
router.delete("/:id", authAdmin, GheController.deleteGhe);

module.exports = router;
