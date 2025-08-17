const Ve = require("../models/ve.model");
const ChuyenBay = require("../models/chuyenBay.model");
const HanhKhach = require("../models/hanhkhach.model");
const SanBay = require("../models/sanBay.model");
const Ghe = require("../models/ghe.model");
const LoaiGhe = require("../models/loaiGhe.model");
const HoaDon = require("../models/hoadon.model");
const CT_DV = require("../models/ct_dv.model");
const CT_HoaDon = require("../models/ct_hoadon.model");

class VeController {
  // Lấy tất cả vé
  static async getAllVe(req, res) {
    try {
      const ves = await Ve.getAll();
      res.json(ves);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy vé theo ID
  static async getVeById(req, res) {
    try {
      const ve = await Ve.getById(req.params.id);
      if (!ve) {
        return res.status(404).json({ message: "Không tìm thấy vé" });
      }
      res.json(ve);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy vé theo mã chuyến bay
  static async getVeByChuyenBay(req, res) {
    try {
      const ves = await Ve.getByChuyenBayId(req.params.chuyenBayId);
      res.json(ves);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy vé theo mã hành khách
  static async getVeByHanhKhach(req, res) {
    try {
      const ves = await Ve.getByHanhKhachId(req.params.hanhKhachId);
      res.json(ves);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy vé theo user
  static async getVeByUser(req, res) {
    try {
      // Lấy user ID từ token đã được xác thực (được set bởi authUser middleware)
      const userId = req.user.ID_User || req.user.id;

      console.log("User object từ middleware:", req.user);
      console.log("User ID từ token:", userId);

      if (!userId) {
        return res
          .status(400)
          .json({ message: "Không tìm thấy thông tin user" });
      }

      const ves = await Ve.getByUserId(userId);
      console.log("Số lượng vé tìm thấy:", ves.length);

      res.json(ves);
    } catch (error) {
      console.error("Lỗi getVeByUser:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // Tạo vé mới
  static async createVe(req, res) {
    try {
      const veData = {
        trangThai: req.body.trangThai || "Đã đặt",
        ngayDatVe: req.body.ngayDatVe || new Date(),
        idChuyenBay: req.body.idChuyenBay,
        idGhe: req.body.idGhe,
        idHanhKhach: req.body.idHanhKhach,
      };

      // Kiểm tra ghế có trống không
      const availableSeats = await Ve.getAvailableSeats(veData.idChuyenBay);
      const seatAvailable = availableSeats.some(
        (seat) => seat.ID_Ghe == veData.idGhe
      );

      if (!seatAvailable) {
        return res.status(400).json({ message: "Ghế này đã được đặt" });
      }

      const newVe = await Ve.create(veData);
      res.status(201).json(newVe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Cập nhật vé
  static async updateVe(req, res) {
    try {
      const veData = {
        trangThai: req.body.trangThai,
      };
      const updatedVe = await Ve.update(req.params.id, veData);
      if (!updatedVe) {
        return res.status(404).json({ message: "Không tìm thấy vé" });
      }
      res.json(updatedVe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Xóa vé
  static async deleteVe(req, res) {
    try {
      const result = await Ve.delete(req.params.id);
      if (result == 0) {
        return res.status(404).json({ message: "Không tìm thấy vé" });
      }
      res.json({ message: "Xóa vé thành công" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getChiTietVe(req, res) {
    try {
      const veId = req.params.id;

      // Lấy thông tin vé
      const ve = await Ve.getById(veId);
      if (!ve) {
        console.error("Không tìm thấy vé với ID:", veId);
        return res.status(404).json({ message: "Không tìm thấy vé" });
      }

      // Lấy thông tin chuyến bay
      const chuyenBay = await ChuyenBay.getById(ve.ID_ChuyenBay);
      console.log("Dữ liệu chuyến bay trả về từ DB:", chuyenBay);
      if (!chuyenBay) {
        console.error("Không tìm thấy chuyến bay với ID:", ve.ID_ChuyenBay);
        return res.status(404).json({ message: "Không tìm thấy chuyến bay" });
      }

      // Xử lý định dạng thời gian
      try {
        chuyenBay.ThoiGianKhoiHanh = chuyenBay.ThoiGianKhoiHanh
          ? new Date(chuyenBay.ThoiGianKhoiHanh).toISOString()
          : null;

        chuyenBay.ThoiGianHaCanh = chuyenBay.ThoiGianHaCanh
          ? new Date(chuyenBay.ThoiGianHaCanh).toISOString()
          : null;
      } catch (error) {
        console.warn("Lỗi khi chuyển đổi thời gian:", error.message);
        chuyenBay.ThoiGianKhoiHanh = null;
        chuyenBay.ThoiGianHaCanh = null;
      }

      // Lấy thông tin sân bay đi/đến
      const sanBayDi = await SanBay.getById(chuyenBay.ID_SanBayDi);
      const sanBayDen = await SanBay.getById(chuyenBay.ID_SanBayDen);
      if (!sanBayDi || !sanBayDen) {
        console.error(
          "Không tìm thấy sân bay đi/đến:",
          chuyenBay.ID_SanBayDi,
          chuyenBay.ID_SanBayDen
        );
        return res.status(404).json({ message: "Không tìm thấy sân bay" });
      }

      // Lấy thông tin ghế
      const ghe = await Ghe.getById(ve.ID_Ghe);
      const loaiGhe = ghe ? await LoaiGhe.getById(ghe.ID_LoaiGhe) : null;

      // Lấy thông tin hành khách
      const hanhKhach = await HanhKhach.getById(ve.ID_HanhKhach);
      if (!hanhKhach) {
        console.error("Không tìm thấy hành khách với ID:", ve.ID_HanhKhach);
        return res.status(404).json({ message: "Không tìm thấy hành khách" });
      }

      // Lấy danh sách dịch vụ
      const dichVus = await CT_DV.getByVeId(veId);

      // Lấy thông tin hóa đơn
      const hoaDon = await HoaDon.getByVeId(veId);
      let chiTietThanhToan = [];
      if (hoaDon) {
        chiTietThanhToan = await CT_HoaDon.getByHoaDonId(hoaDon.ID_HoaDon);
      }

      // Trả về dữ liệu
      res.json({
        ve: ve,
        chuyenBay: chuyenBay,
        sanBayDi: sanBayDi,
        sanBayDen: sanBayDen,
        ghe: {
          ...ghe,
          loaiGhe: loaiGhe,
        },
        hanhKhach: hanhKhach,
        dichVus: dichVus,
        hoaDon: hoaDon,
        chiTietThanhToan: chiTietThanhToan,
      });
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết vé:", error.message, error.stack); // Log lỗi chi tiết
      res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu" });
    }
  }

  // Lấy chi tiết vé
}

module.exports = VeController;
