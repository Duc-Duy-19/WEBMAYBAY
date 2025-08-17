const express = require("express");
const router = express.Router();
const HanhKhachController = require("../controllers/hanhkhach.controller");
const { authAdmin } = require("../middleware/authmidleware");
const { authUser } = require("../middleware/authmidleware");
// Routes cần xác thực admin
router.get("/", authAdmin, HanhKhachController.getAllHanhKhach);

// Routes công khai/hoặc cần xác thực người dùng
router.get("/:id", HanhKhachController.getHanhKhachById);
router.post("/", HanhKhachController.createHanhKhach);
router.put("/:id", HanhKhachController.updateHanhKhach);
router.delete("/:id", HanhKhachController.deleteHanhKhach);

// Get hành khách by user ID - Cần đặt route này sau route /:id để tránh xung đột
router.get("/user/:userId", HanhKhachController.getHanhKhachByUserId);

module.exports = router;
