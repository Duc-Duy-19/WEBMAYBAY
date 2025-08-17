const SanBay = require('../models/sanBay.model');

class SanBayController {
    // Get all airports
    static async getAllSanBay(req, res) {
        try {
            const sanBay = await SanBay.getAll();
            res.json(sanBay);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get airport by ID
    static async getSanBayById(req, res) {
        try {
            const sanBay = await SanBay.getById(req.params.id);
            if (!sanBay) {
                return res.status(404).json({ message: 'Không tìm thấy sân bay' });
            }
            res.json(sanBay);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Create new airport
    static async createSanBay(req, res) {
        try {
            const sanBayData = {
                tenSanBay: req.body.tenSanBay,
                thanhPho: req.body.thanhPho,
                diaChi: req.body.diaChi,
                maSanBay: req.body.maSanBay
            };
            const newSanBay = await SanBay.create(sanBayData);
            res.status(201).json(newSanBay);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Update airport
    static async updateSanBay(req, res) {
        try {
            const sanBayData = {
                tenSanBay: req.body.tenSanBay,
                thanhPho: req.body.thanhPho,
                diaChi: req.body.diaChi
            };
            const updatedSanBay = await SanBay.update(req.params.id, sanBayData);
            if (!updatedSanBay) {
                return res.status(404).json({ message: 'Không tìm thấy sân bay' });
            }
            res.json(updatedSanBay);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete airport
    static async deleteSanBay(req, res) {
        try {
            const result = await SanBay.delete(req.params.id);
            if (result == 0) {
                return res.status(404).json({ message: 'Không tìm thấy sân bay' });
            }
            res.json({ message: 'Xóa sân bay thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = SanBayController; 