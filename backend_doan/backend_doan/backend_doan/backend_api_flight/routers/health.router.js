const express = require("express");
const router = express.Router();
const HealthController = require("../controllers/health.controller");

// Kiểm tra sức khỏe tổng thể
router.get("/", HealthController.checkHealth);

module.exports = router; 