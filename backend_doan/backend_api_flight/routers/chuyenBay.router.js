// routes/chuyenBay.routes.js
const express = require("express");
const router = express.Router();
const ChuyenBayController = require("../controllers/chuyenBay.controller");
const { authAdmin } = require("../middleware/authmidleware");

// Routes không cần xác thực (có thể truy cập công khai)
router.get("/", ChuyenBayController.getAllChuyenBay);
router.get("/:id", ChuyenBayController.getChuyenBayById);

// Routes cần xác thực admin
router.post("/", authAdmin, ChuyenBayController.createChuyenBay);
router.put("/:id", authAdmin, ChuyenBayController.updateChuyenBay);
router.delete("/:id", authAdmin, ChuyenBayController.deleteChuyenBay);

module.exports = router;
