// middleware/authmiddleware.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Users = require("../models/user.model");

const JWT_SECRET = "your_jwt_secret_key"; // Dùng một giá trị cụ thể

exports.authAdmin = async (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Không có token xác thực" });
    }

    // Xác minh token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Kiểm tra xem người dùng có phải là admin
    const admin = await Admin.getById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Xác thực thất bại" });
    }

    // Lưu thông tin admin vào request
    req.admin = admin;
    req.token = token;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Xác thực thất bại", error: error.message });
  }
};

exports.authUser = async (req, res, next) => {
  try {
    console.log('=== AUTH USER MIDDLEWARE ===');
    
    // Lấy token từ header
    const authHeader = req.header("Authorization");
    console.log('Authorization header:', authHeader);
    
    const token = authHeader?.replace("Bearer ", "");
    console.log('Extracted token:', token ? 'Token có' : 'Không có token');

    if (!token) {
      console.log('Không có token, trả về 401');
      return res.status(401).json({ message: "Không có token xác thực" });
    }

    // Xác minh token
    console.log('Đang verify token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Kiểm tra xem người dùng có tồn tại
    console.log('Đang tìm user với ID:', decoded.id);
    const user = await Users.getById(decoded.id);
    console.log('User tìm thấy:', user);

    if (!user) {
      console.log('Không tìm thấy user, trả về 401');
      return res.status(401).json({ message: "Xác thực thất bại" });
    }

    // Lưu thông tin user vào request
    req.user = user;
    req.token = token;
    
    console.log('Auth thành công, user được set:', req.user);
    console.log('=== END AUTH USER MIDDLEWARE ===');

    next();
  } catch (error) {
    console.error('Lỗi trong authUser middleware:', error);
    res
      .status(401)
      .json({ message: "Xác thực thất bại", error: error.message });
  }
};
