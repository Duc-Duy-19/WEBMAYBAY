const DichVu = require("../models/dichvu.model");

class DichVuController {
  // Lấy tất cả dịch vụ
  static async getAllDichVu(req, res) {
    try {
      const dichVus = await DichVu.getAll();
      res.json(dichVus);
    } catch (error) {
      res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
  }

  // Lấy dịch vụ theo ID
  static async getDichVuById(req, res) {
    try {
      const dichVu = await DichVu.getById(req.params.id);
      if (!dichVu) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }
      res.json(dichVu);
    } catch (error) {
      res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
  }

  // Tạo dịch vụ mới
  static async createDichVu(req, res) {
    try {
      // Lấy dữ liệu từ req.body
      const dichVuData = {
        TenDichVu: req.body.TenDichVu,
        GiaDichVu: req.body.GiaDichVu,
      };

      console.log("Dữ liệu nhận được từ frontend:", dichVuData);

      // Kiểm tra dữ liệu
      if (
        !dichVuData.TenDichVu ||
        typeof dichVuData.TenDichVu !== "string" ||
        dichVuData.TenDichVu.trim() === ""
      ) {
        return res.status(400).json({ message: "Tên dịch vụ không hợp lệ" });
      }

      const parsedGiaDichVu = parseFloat(dichVuData.GiaDichVu);
      if (isNaN(parsedGiaDichVu) || parsedGiaDichVu < 0) {
        return res.status(400).json({ message: "Giá dịch vụ không hợp lệ" });
      }

      // Tạo dịch vụ mới
      const newDichVu = await DichVu.create({
        tenDichVu: dichVuData.TenDichVu,
        giaDichVu: parsedGiaDichVu,
      });

      res
        .status(201)
        .json({ message: "Tạo dịch vụ thành công", data: newDichVu });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Tạo dịch vụ thất bại", error: error.message });
    }
  }

  // Cập nhật dịch vụ
  static async updateDichVu(req, res) {
    try {
      // Lấy dữ liệu từ req.body
      const dichVuData = {
        TenDichVu: req.body.TenDichVu,
        GiaDichVu: req.body.GiaDichVu,
      };

      console.log("Dữ liệu nhận được từ frontend:", dichVuData);

      // Kiểm tra dữ liệu
      if (
        !dichVuData.TenDichVu ||
        typeof dichVuData.TenDichVu !== "string" ||
        dichVuData.TenDichVu.trim() === ""
      ) {
        return res.status(400).json({ message: "Tên dịch vụ không hợp lệ" });
      }

      const parsedGiaDichVu = parseFloat(dichVuData.GiaDichVu);
      if (isNaN(parsedGiaDichVu) || parsedGiaDichVu < 0) {
        return res.status(400).json({ message: "Giá dịch vụ không hợp lệ" });
      }

      // Cập nhật dịch vụ
      const updatedDichVu = await DichVu.update(req.params.id, {
        tenDichVu: dichVuData.TenDichVu,
        giaDichVu: parsedGiaDichVu,
      });

      if (!updatedDichVu) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }

      res
        .status(200)
        .json({ message: "Cập nhật thành công", data: updatedDichVu });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Cập nhật thất bại", error: error.message });
    }
  }

  // Xóa dịch vụ
  static async deleteDichVu(req, res) {
    try {
      const result = await DichVu.delete(req.params.id);
      if (result === 0) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }

      res.json({ message: "Xóa dịch vụ thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
  }
}

module.exports = DichVuController;
