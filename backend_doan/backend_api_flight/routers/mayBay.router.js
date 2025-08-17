const express = require("express");
const router = express.Router();
const MayBayController = require("../controllers/mayBay.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Routes công khai
// Get all aircrafts
router.get("/", MayBayController.getAllMayBay);

// Get aircraft by ID
router.get("/:id", MayBayController.getMayBayById);

// Routes cần xác thực admin
// Create new aircraft
router.post("/", authAdmin, MayBayController.createMayBay);

// Update aircraft
router.put("/:id", authAdmin, MayBayController.updateMayBay);

// Delete aircraft
router.delete("/:id", authAdmin, MayBayController.deleteMayBay);

module.exports = router;
