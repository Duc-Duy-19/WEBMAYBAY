const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
require("dotenv").config();

// Import routes
const userRouter = require("./routers/user.router");
const adminRouter = require("./routers/admin.router");
const hanhkhachRouter = require("./routers/hanhkhach.router");
const sanBayRouter = require("./routers/sanBay.router");
const mayBayRouter = require("./routers/mayBay.router");
const loaiGheRouter = require("./routers/loaiGhe.router");
const gheRouter = require("./routers/ghe.router");
const chuyenBayRouter = require("./routers/chuyenBay.router");
const veRouter = require("./routers/ve.router");
const dichVuRouter = require("./routers/dichvu.router");
const phuongThucRouter = require("./routers/phuongthuc.router");
const datVeRouter = require("./routers/datve.router");
const hoaDonRouter = require("./routers/hoadon.router");
const revenueRouter = require("./routers/revenueRouter");
const thanhToanRoute = require("./routers/thanhToanRoute");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRouter);
app.use("/api/admins", adminRouter);
app.use("/api/hanhkhach", hanhkhachRouter);
app.use("/api/san-bay", sanBayRouter);
app.use("/api/may-bay", mayBayRouter);
app.use("/api/loai-ghe", loaiGheRouter);
app.use("/api/ghe", gheRouter);
app.use("/api/chuyen-bay", chuyenBayRouter);
app.use("/api/ve", veRouter);
app.use("/api/dich-vu", dichVuRouter);
app.use("/api/phuong-thuc", phuongThucRouter);
app.use("/api/dat-ve", datVeRouter);
app.use("/api/hoa-don", hoaDonRouter);
app.use("/api/revenue", revenueRouter);
app.use("/api/thanh-toan", thanhToanRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Kết nối DB rồi mới chạy server
const PORT = 3000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Không thể khởi động server do lỗi kết nối DB:", err);
  });

module.exports = app;
