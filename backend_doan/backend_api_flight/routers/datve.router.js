const express = require("express");
const router = express.Router();
const DatVeController = require("../controllers/datve.controller");

const { authUser } = require("../middleware/authmidleware");

// Tìm kiếm chuyến bay
router.get("/tim-chuyen-bay", DatVeController.timChuyenBay);

// Tính giá vé tạm tính
router.post("/tinh-gia", DatVeController.tinhGiaVe);

// Đặt vé
router.post("/dat-ve",authUser, DatVeController.datVe);

// Hủy vé
router.post("/huy-ve/:id", DatVeController.huyVe);



module.exports = router;
