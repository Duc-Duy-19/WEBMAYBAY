const Ve = require("../models/ve.model");
const ChuyenBay = require("../models/chuyenBay.model");
const HoaDon = require("../models/hoadon.model");
const CT_HoaDon = require("../models/ct_hoadon.model");
const CT_DV = require("../models/ct_dv.model");
const DichVu = require("../models/dichvu.model");
const HanhKhach = require("../models/hanhkhach.model");
const Ghe = require("../models/ghe.model");
const LoaiGhe = require("../models/loaiGhe.model");
const SanBay = require("../models/sanBay.model");
const { connectDB, sql } = require("../config/db");
const axios = require("axios");
const crypto = require("crypto");

class DatVeController {
  // Tìm kiếm chuyến bay
  static async timChuyenBay(req, res) {
    try {
      const { idSanBayDi, idSanBayDen, ngayKhoiHanh } = req.query;

      await connectDB();
      const result = await sql.query`
        SELECT cb.ID_ChuyenBay, cb.ID_SanBayDi, cb.ID_SanBayDen,
          FORMAT(cb.ThoiGianKhoiHanh, 'yyyy-MM-dd HH:mm') AS ThoiGianKhoiHanh,
          FORMAT(cb.ThoiGianHaCanh, 'yyyy-MM-dd HH:mm') AS ThoiGianHaCanh,
          cb.GiaCoSo, cb.TrangThai,
          sbDi.TenSanBay AS TenSanBayDi, sbDi.ThanhPho AS ThanhPhoDi,
          sbDen.TenSanBay AS TenSanBayDen, sbDen.ThanhPho AS ThanhPhoDen,
          mb.LoaiMayBay, mb.HangSanXuat
        FROM ChuyenBay cb
        JOIN SanBay sbDi ON cb.ID_SanBayDi = sbDi.ID_SanBay
        JOIN SanBay sbDen ON cb.ID_SanBayDen = sbDen.ID_SanBay
        JOIN MayBay mb ON cb.ID_MayBay = mb.ID_MayBay
        WHERE cb.ID_SanBayDi = ${idSanBayDi}
          AND cb.ID_SanBayDen = ${idSanBayDen}
          AND CONVERT(date, cb.ThoiGianKhoiHanh) = ${ngayKhoiHanh}
          AND cb.TrangThai = N'Đang mở bán'
        ORDER BY cb.ThoiGianKhoiHanh`;

      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tính giá vé
  static async tinhGiaVe(req, res) {
    try {
      const { chuyenBayId, gheId, dichVus } = req.body;

      // Lấy thông tin chuyến bay
      const chuyenBay = await ChuyenBay.getById(chuyenBayId);
      if (!chuyenBay) {
        return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
      }

      // Lấy thông tin ghế và loại ghế
      const ghe = await Ghe.getById(gheId);
      if (!ghe) {
        return res.status(404).json({ message: "Không tìm thấy ghế" });
      }

      const loaiGhe = await LoaiGhe.getById(ghe.ID_LoaiGhe);

      // Tính giá vé
      const giaVe = parseFloat(chuyenBay.GiaCoSo) * parseFloat(loaiGhe.HeSoGia);
      const phuThuGhe = giaVe - parseFloat(chuyenBay.GiaCoSo);

      // Tính giá dịch vụ bổ sung
      let giaDichVu = 0;
      let chiTietDichVu = [];

      if (dichVus && dichVus.length > 0) {
        for (const dv of dichVus) {
          const dichVu = await DichVu.getById(dv.idDichVu);
          if (dichVu) {
            const thanhTien = parseFloat(dichVu.GiaDichVu);
            giaDichVu += thanhTien;

            chiTietDichVu.push({
              id: dichVu.ID_DichVu,
              ten: dichVu.TenDichVu,
              giaDichVu: dichVu.GiaDichVu,
              thanhTien: thanhTien,
            });
          }
        }
      }

      // Tính tổng tiền
      const tongTien = giaVe + giaDichVu;

      res.json({
        giaVe: giaVe,
        giaDichVu: giaDichVu,
        phuThuGhe: phuThuGhe,
        tongTien: tongTien,
        chiTietDichVu: chiTietDichVu,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Đặt vé
  static async datVe(req, res) {
    try {
      const { userId, chuyenBayId, dsVe, dichVus, idPhuongThuc } = req.body;

      if (!dsVe || dsVe.length === 0) {
        return res
          .status(400)
          .json({ message: "Vui lòng chọn ít nhất một vé" });
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
        const giaVe =
          parseFloat(chuyenBay.GiaCoSo) * parseFloat(loaiGhe.HeSoGia);

        let tongTienDichVu = 0;
        if (dichVus && dichVus.length > 0) {
          for (const dv of dichVus) {
            const dichVu = await DichVu.getById(dv.idDichVu);
            tongTienDichVu += parseFloat(dichVu.GiaDichVu);
          }
        }

        tongTien += giaVe + tongTienDichVu;
      }

      // Add conditional logic based on idPhuongThuc
      if (idPhuongThuc === 1) { // MoMo payment
        // ========== TÍCH HỢP MOMO ==========

        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const requestId = `${partnerCode}${Date.now()}`;
        const orderId = `${partnerCode}${Date.now()}`;
        const orderInfo = "Thanh toán vé máy bay";
        const redirectUrl = process.env.MOMO_RETURN_URL;
        const ipnUrl = process.env.MOMO_NOTIFY_URL;
        const amount = tongTien.toString();
        const requestType = "captureWallet";
        const extraData = Buffer.from(
          JSON.stringify({
            userId,
            chuyenBayId,
            dsVe,
            dichVus,
            idPhuongThuc,
          })
        ).toString("base64");

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto
          .createHmac("sha256", secretKey)
          .update(rawSignature)
          .digest("hex");

        const momoRequest = {
          partnerCode,
          accessKey,
          requestId,
          amount,
          orderId,
          orderInfo,
          redirectUrl,
          ipnUrl,
          extraData,
          requestType,
          signature,
          lang: "vi",
        };

        const response = await axios.post(
          process.env.MOMO_API_ENDPOINT,
          momoRequest,
          { headers: { "Content-Type": "application/json" } }
        );

        const { payUrl } = response.data;
        return res.json({ payUrl });
      } else if (idPhuongThuc === 2) { // Cash payment
        let createdVes = [];

        // Process each ticket
        for (const veInfo of dsVe) {
           // Lấy thông tin ghế và loại ghế
           const ghe = await Ghe.getById(veInfo.idGhe);
           const loaiGhe = await LoaiGhe.getById(ghe.ID_LoaiGhe);

           // Tính giá vé (already calculated above)

          // Create new ticket
          const veData = {
            trangThai: "Đã thanh toán", // Use "Đã thanh toán" for cash payment
            ngayDatVe: new Date(),
            idChuyenBay: chuyenBayId,
            idGhe: veInfo.idGhe,
            idHanhKhach: veInfo.idHanhKhach,
          };
          const newVe = await Ve.create(veData);
          createdVes.push(newVe);

          // Handle services if any
          if (dichVus && dichVus.length > 0) {
             for (const dv of dichVus) {
               const dichVu = await DichVu.getById(dv.idDichVu);
               const thanhTien = parseFloat(dichVu.GiaDichVu);

               await CT_DV.create({
                 idVe: newVe.ID_Ve,
                 idDichVu: dv.idDichVu,
                 thanhTien: thanhTien,
               });
             }
           }
        }

        const idVe = createdVes[0]?.ID_Ve || null; // Link HoaDon to the first created ticket

        // Create Invoice (HoaDon)
        const newHoaDon = await HoaDon.create({
          idUser: req.user.ID_User, // Assuming user is available in req.user
          ngayThanhToan: new Date(),
          tongTien: tongTien,
          idAdmin: null, // Or appropriate admin ID if applicable
          idVe: idVe, // Link to one of the created tickets
        });

        // Create Invoice Detail (CT_HoaDon)
        await CT_HoaDon.create({
          idPhuongThuc: idPhuongThuc,
          idHoaDon: newHoaDon.ID_HoaDon,
          soTien: tongTien,
        });

        // Ticket status is set to "Đã thanh toán" during creation

        return res.json({
          message: "Đặt vé và thanh toán tiền mặt thành công",
          ves: createdVes,
          hoaDon: newHoaDon,
          tongTien: tongTien,
        });

      } else {
        // Handle other payment methods or invalid idPhuongThuc
        return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
      }

    } catch (error) {
      console.error("Lỗi khi xử lý đặt vé:", error);
      // Differentiate error logging based on payment method if needed
      // if (idPhuongThuc === 1) {
      //   console.error("Lỗi khi tạo yêu cầu thanh toán MoMo:", error);
      // } else if (idPhuongThuc === 2) {
      //   console.error("Lỗi khi xử lý thanh toán tiền mặt:", error);
      // }
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }

  // Hủy vé
  static async huyVe(req, res) {
    try {
      const veId = req.params.id;
      console.log(`Đang xử lý hủy vé ID: ${veId}`);

      // Kiểm tra vé tồn tại
      const ve = await Ve.getById(veId);
      if (!ve) {
        return res.status(404).json({ message: "Không tìm thấy vé" });
      }
      console.log(`Thông tin vé:`, ve);

      // Kiểm tra trạng thái vé
      if (ve.TrangThai == "Đã hủy") {
        return res.status(400).json({ message: "Vé đã được hủy trước đó" });
      }

      if (ve.TrangThai == "Đã sử dụng") {
        return res.status(400).json({ message: "Không thể hủy vé đã sử dụng" });
      }

      // Kiểm tra thời gian chuyến bay
      const chuyenBay = await ChuyenBay.getById(ve.ID_ChuyenBay);
      console.log(`Thông tin chuyến bay:`, chuyenBay);

      const thoiGianKhoiHanh = new Date(chuyenBay.ThoiGianKhoiHanh);
      const now = new Date();
      console.log(
        `Thời gian khởi hành: ${thoiGianKhoiHanh}, Thời gian hiện tại: ${now}`
      );

      // Tính số giờ còn lại trước khi bay
      const hoursDiff = (thoiGianKhoiHanh - now) / (1000 * 60 * 60);
      console.log(`Số giờ còn lại: ${hoursDiff}`);

      // Kiểm tra chuyến bay đã qua chưa
      if (hoursDiff < 0) {
        return res.status(400).json({
          message: "Không thể hủy vé cho chuyến bay đã khởi hành",
        });
      }

      // Kiểm tra điều kiện hủy vé (phải hủy trước 24 giờ)
      if (hoursDiff < 24) {
        return res.status(400).json({
          message: "Không thể hủy vé trong vòng 24 giờ trước khi bay",
        });
      }

      // Cập nhật trạng thái vé - đảm bảo đúng key name
      console.log(`Đang cập nhật trạng thái vé ${veId} thành "Đã hủy"`);
      await Ve.update(veId, { trangThai: "Đã hủy" });

      res.json({ message: "Hủy vé thành công" });
    } catch (error) {
      console.error(`Lỗi hủy vé: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = DatVeController;
