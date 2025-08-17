const express = require("express");
const router = express.Router();
const LoaiGheController = require("../controllers/loaiGhe.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Routes công khai
// Get all seat types
router.get("/", LoaiGheController.getAllLoaiGhe);

// Get seat type by ID
router.get("/:id", LoaiGheController.getLoaiGheById);

// Routes cần xác thực admin
// Create new seat type
router.post("/", authAdmin, LoaiGheController.createLoaiGhe);

// Update seat type
router.put("/:id", authAdmin, LoaiGheController.updateLoaiGhe);

// Delete seat type
router.delete("/:id", authAdmin, LoaiGheController.deleteLoaiGhe);

module.exports = router;
