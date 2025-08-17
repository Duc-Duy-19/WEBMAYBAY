// routes/thanhToanRoute.js

const express = require("express");
const router = express.Router();
const momo = require("../utils/momo-payment");
const crypto = require("crypto");

// Import necessary models
const HoaDon = require("../models/hoadon.model");
const Ve = require("../models/ve.model");
const CT_HoaDon = require("../models/ct_hoadon.model");
const CT_DV = require("../models/ct_dv.model");
const Ghe = require("../models/ghe.model");
const DichVu = require("../models/dichvu.model"); // <-- ĐÃ THÊM DÒNG NÀY
const ChuyenBay = require("../models/chuyenBay.model"); // <-- Đảm bảo import nếu dùng
const LoaiGhe = require("../models/loaiGhe.model"); // <-- Đảm bảo import nếu dùng

// Load environment variables (đã load ở main index.js hoặc app.js thì không cần ở đây nữa)
// require('dotenv').config();

// POST /api/thanh-toan/momo
router.post("/momo", async (req, res) => {
  try {
    const { userId, chuyenBayId, dsVe, dichVus, idPhuongThuc } = req.body;

    if (!dsVe || dsVe.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất một vé" });
    }

    const chuyenBay = await ChuyenBay.getById(chuyenBayId);
    if (!chuyenBay) {
      return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
    }

    const availableSeats = await Ghe.getAvailableSeats(chuyenBayId);
    const availableSeatIds = availableSeats.map((s) => s.ID_Ghe);

    for (const veInfo of dsVe) {
      if (!availableSeatIds.includes(veInfo.idGhe)) {
        return res.status(400).json({
          message: `Ghế ${veInfo.idGhe} đã được đặt hoặc không tồn tại`,
        });
      }
    }

    let tongTien = 0;
    for (const veInfo of dsVe) {
      const ghe = await Ghe.getById(veInfo.idGhe);
      const loaiGhe = await LoaiGhe.getById(ghe.ID_LoaiGhe);
      const giaVe = parseFloat(chuyenBay.GiaCoSo) * parseFloat(loaiGhe.HeSoGia);

      let tongTienDichVu = 0;
      if (dichVus && dichVus.length > 0) {
        for (const dv of dichVus) {
          const dichVu = await DichVu.getById(dv.idDichVu);
          if (dichVu) {
            tongTienDichVu += parseFloat(dichVu.GiaDichVu);
          } else {
            console.warn(`Dịch vụ với ID ${dv.idDichVu} không tìm thấy.`);
          }
        }
      }
      tongTien += giaVe + tongTienDichVu;
    }

    // ========== TÍCH HỢP MOMO ==========
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    // const accessKey = process.env.MOMO_ACCESS_KEY; // Không cần lấy ở đây, đã có trong momo.createPayment
    // const secretKey = process.env.MOMO_SECRET_KEY; // Không cần lấy ở đây, đã có trong momo.createPayment
    const requestId = `${partnerCode}${Date.now()}`; // Có vẻ bạn đang tạo orderId và requestId khác nhau
    const orderId = `${partnerCode}${Date.now()}`; // Nên dùng chung orderId cho cả request và extraData nếu cần
    const orderInfo = "Thanh toán vé máy bay";
    const redirectUrl = process.env.MOMO_RETURN_URL; // URL MoMo sẽ redirect về sau thanh toán
    const ipnUrl = process.env.MOMO_NOTIFY_URL; // URL MoMo sẽ gọi về để thông báo kết quả (server-to-server)

    // ExtraData sẽ chứa các thông tin cần thiết để lưu vào DB khi MoMo trả về
    const extraData = Buffer.from(
      JSON.stringify({
        userId,
        chuyenBayId,
        dsVe,
        dichVus,
        idPhuongThuc,
        originalOrderId: orderId, // Lưu orderId gốc nếu cần liên kết
      })
    ).toString("base64");

    // Gửi yêu cầu thanh toán MoMo qua hàm đã tạo
    const payUrl = await momo.createPayment({
      amount: tongTien,
      orderId: orderId, // Sử dụng orderId đã tạo
      returnUrl: redirectUrl, // Truyền redirectUrl cho momo-payment utility
      ipnUrl: ipnUrl, // Truyền ipnUrl cho momo-payment utility
      extraData: extraData, // Truyền extraData
    });

    return res.json({ payUrl }); // Trả về payUrl để frontend chuyển hướng
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu thanh toán MoMo:", error);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống hoặc không thể tạo yêu cầu thanh toán" });
  }
});

// GET /api/thanh-toan/momo-return - Handle MoMo return (redirect sau khi thanh toán)
router.get("/momo-return", async (req, res) => {
  console.log("MoMo Return Data (req.query):", req.query);

  const momoData = req.query;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const accessKey = process.env.MOMO_ACCESS_KEY; // <-- Lấy accessKey từ biến môi trường

  // 1. Verify signature (Quan trọng nhất)
  // Xây dựng rawSignature theo đúng công thức của MoMo cho việc xác thực callback
  // (Được sắp xếp theo thứ tự bảng chữ cái của tên tham số, KHÔNG bao gồm 'signature')
  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${momoData.amount}` +
    `&extraData=${momoData.extraData || ""}` + // Đảm bảo xử lý trường hợp extraData rỗng
    `&message=${momoData.message}` +
    `&orderId=${momoData.orderId}` +
    `&orderInfo=${momoData.orderInfo}` +
    `&partnerCode=${momoData.partnerCode}` +
    `&requestId=${momoData.requestId}` +
    `&responseTime=${momoData.responseTime}` +
    `&resultCode=${momoData.resultCode}` +
    `&transId=${momoData.transId}`;

  console.log("Raw Signature generated for verification:", rawSignature);
  console.log("Secret Key used:", secretKey); // In ra để kiểm tra Secret Key

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  console.log("Calculated Signature:", expectedSignature);
  console.log("MoMo Provided Signature:", momoData.signature);

  if (expectedSignature !== momoData.signature) {
    console.error("MoMo return signature mismatch!");
    // Chuyển hướng về trang vé đã đặt với trạng thái lỗi
    return res.redirect(
      "http://127.0.0.1:5501/TripMa/html/body/vedadat/my-tickets.html?status=failed&message=Xác%20thực%20chữ%20ký%20MoMo%20thất%20bại"
    );
  }

  // 2. Check payment result code
  if (momoData.resultCode == 0) {
    // resultCode 0 nghĩa là thanh toán thành công
    console.log("MoMo payment successful!");
    let bookingDetails;
    try {
      // 3. Decode and parse extraData
      const decodedExtraData = Buffer.from(
        momoData.extraData,
        "base64"
      ).toString();
      bookingDetails = JSON.parse(decodedExtraData);
      console.log("Decoded Booking Details:", bookingDetails);

      const { userId, chuyenBayId, dsVe, dichVus, idPhuongThuc } =
        bookingDetails;
      const tongTien = parseFloat(momoData.amount); // Sử dụng amount từ dữ liệu MoMo trả về

      // 4. Save booking details to database (Logic tương tự hàm datVe gốc)
      let createdVeIds = [];
      for (const veInfo of dsVe) {
        // Kiểm tra lại trạng thái ghế trước khi đặt (quan trọng để tránh trùng lặp)
        const seat = await Ghe.getById(veInfo.idGhe);
        if (!seat || seat.TrangThai !== "Trong") {
          // Giả sử 'Trong' là trạng thái ghế trống
          console.error(
            `Ghế ${veInfo.idGhe} không còn trống hoặc không tồn tại.`
          );
          // Xử lý trường hợp này: có thể hoàn tiền, hoặc ghi nhận vé này lỗi và thông báo cho admin
          continue; // Bỏ qua vé này và tiếp tục xử lý các vé khác
        }

        const veData = {
          trangThai: "Đã thanh toán", // Đặt trạng thái vé đã thanh toán
          ngayDatVe: new Date(),
          idChuyenBay: chuyenBayId,
          idGhe: veInfo.idGhe,
          idHanhKhach: veInfo.idHanhKhach,
        };
        const newVe = await Ve.create(veData);
        createdVeIds.push(newVe.ID_Ve);

        // Cập nhật trạng thái ghế sang 'Đã đặt'
        await Ghe.update(veInfo.idGhe, { TrangThai: "DaDat" });
      }

      // Kiểm tra xem có vé nào được tạo thành công không
      if (createdVeIds.length === 0) {
        console.error(
          "Không có vé nào được tạo sau khi thanh toán thành công."
        );
        // Xử lý lỗi: có thể hoàn tiền hoặc yêu cầu kiểm tra thủ công
        return res.redirect(
          "http://127.0.0.1:5501/TripMa/html/body/vedadat/my-tickets.html?status=failed&message=Thanh%20toán%20thành%20công%20nhưng%20đặt%20vé%20thất%20bại"
        );
      }

      // Tạo Hóa Đơn (Invoice)
      const hoaDonData = {
        ngayThanhToan: new Date(),
        tongTien: tongTien,
        idAdmin: null, // Hoặc lấy từ người dùng đã xác thực nếu áp dụng
        idUser: userId, // User ID từ extraData
        idVe: createdVeIds[0], // Liên kết Hóa Đơn với ID của vé đầu tiên được tạo (hoặc logic phù hợp với DB của bạn)
      };
      const newHoaDon = await HoaDon.create(hoaDonData);

      // Tạo CT_HoaDon (Chi tiết Hóa Đơn)
      const ctHoaDonData = {
        idPhuongThuc: idPhuongThuc, // ID phương thức thanh toán từ extraData
        idHoaDon: newHoaDon.ID_HoaDon,
        soTien: tongTien,
      };
      await CT_HoaDon.create(ctHoaDonData);

      // Tạo CT_DV (Chi tiết Dịch Vụ) nếu có
      if (dichVus && dichVus.length > 0) {
        for (const dv of dichVus) {
          const dichVuInfo = await DichVu.getById(dv.idDichVu);
          if (dichVuInfo) {
            const thanhTien = parseFloat(dichVuInfo.GiaDichVu);
            await CT_DV.create({
              idVe: createdVeIds[0], // Liên kết với ID của vé đầu tiên được tạo (hoặc logic phù hợp với DB của bạn)
              idDichVu: dv.idDichVu,
              thanhTien: thanhTien,
            });
          }
        }
      }

      // 5. Chuyển hướng người dùng đến trang vé đã đặt thành công
      res.redirect(
        "http://127.0.0.1:5501/TripMa/html/body/vedadat/my-tickets.html?status=success"
      );
    } catch (error) {
      console.error(
        "Lỗi khi xử lý thanh toán MoMo thành công và lưu dữ liệu:",
        error
      );
      // Xử lý lỗi nghiêm trọng: có thể cần hoàn tiền hoặc kiểm tra thủ công
      res.redirect(
        "http://127.0.0.1:5501/TripMa/html/body/vedadat/my-tickets.html?status=failed&message=Thanh%20toán%20thành%20công%20nhưng%20lưu%20thông%20tin%20thất%20bại"
      );
    }
  } else {
    // Thanh toán thất bại hoặc đang chờ xử lý
    console.warn(
      "Thanh toán MoMo thất bại hoặc đang chờ xử lý. Mã kết quả:",
      momoData.resultCode
    );
    console.warn("Thông báo:", momoData.message);
    // Chuyển hướng người dùng đến trang vé đã đặt với trạng thái lỗi
    res.redirect(
      // Redirect back to the seat selection/confirmation page (choose-flight-seat.html) on cancellation or failure
      "http://127.0.0.1:5501/TripMa/html/body/chonghechuyenbay/choose-flight-seat.html?status=cancelled&message=Thanh%20toán%20đã%20bị%20hủy"
    );
  }
});

module.exports = router;
