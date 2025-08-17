const express = require("express");
const router = express.Router();
const SanBayController = require("../controllers/sanBay.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Routes công khai (không cần xác thực)
// Get all airports
router.get("/", SanBayController.getAllSanBay);

// Get airport by ID
router.get("/:id", SanBayController.getSanBayById);

// Routes cần xác thực admin (cần JWT token)
// Create new airport
router.post("/", authAdmin, SanBayController.createSanBay);

// Update airport
router.put("/:id", authAdmin, SanBayController.updateSanBay);

// Delete airport
router.delete("/:id", authAdmin, SanBayController.deleteSanBay);

module.exports = router;
