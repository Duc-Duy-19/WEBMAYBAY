// Health Check Controller - Kiểm tra sức khỏe API và Database
const db = require("../config/db"); // Import module kết nối DB

class HealthController {
  // GET /api/health - Kiểm tra sức khỏe tổng thể của API
  static async checkHealth(req, res) {
    try {
      // Kiểm tra kết nối database
      let dbStatus = "disconnected";
      let dbError = null;

      try {
        // Thực hiện truy vấn đơn giản để kiểm tra kết nối
        await db.query("SELECT 1");
        dbStatus = "connected";
      } catch (err) {
        dbStatus = "error";
        dbError = err.message;
      }

      // Thông tin về hệ thống
      const systemInfo = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };

      // Trả về thông tin trạng thái
      res.json({
        status: "ok",
        message: "API hoạt động bình thường",
        database: {
          status: dbStatus,
          error: dbError
        },
        system: systemInfo
      });
    } catch (error) {
      // Log lỗi và trả về lỗi server nếu có
      console.error('Lỗi health check:', error);
      res.status(500).json({ 
        status: "error", 
        message: "Lỗi kiểm tra sức khỏe hệ thống",
        error: error.message
      });
    }
  }
}

module.exports = HealthController; 