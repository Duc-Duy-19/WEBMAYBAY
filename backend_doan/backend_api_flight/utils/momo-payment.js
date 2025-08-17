// utils/momo-payment.js

const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config(); // Đảm bảo đã load biến môi trường ở đây

const MOMO_CONFIG = {
  // Đảm bảo tất cả các giá trị đều lấy từ biến môi trường
  endpoint: process.env.MOMO_API_ENDPOINT,
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  redirectUrl: process.env.MOMO_RETURN_URL, // Sử dụng RETURN_URL làm default redirect
  ipnUrl: process.env.MOMO_NOTIFY_URL,
};

async function createPayment({ amount, orderId, returnUrl }) {
  const requestId = orderId;
  const orderInfo = "Thanh toán đặt vé máy bay";
  const requestType = "captureWallet";
  const extraData = ""; // Nếu cần truyền thêm gì đó (đã được xử lý ở bước datVe)

  // Xây dựng rawSignature theo đúng công thức của MoMo cho yêu cầu khởi tạo thanh toán
  const rawSignature = `accessKey=${
    MOMO_CONFIG.accessKey
  }&amount=${amount}&extraData=${extraData}&ipnUrl=${
    MOMO_CONFIG.ipnUrl
  }&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${
    MOMO_CONFIG.partnerCode
  }&redirectUrl=${
    returnUrl || MOMO_CONFIG.redirectUrl
  }&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto
    .createHmac("sha256", MOMO_CONFIG.secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: MOMO_CONFIG.partnerCode,
    accessKey: MOMO_CONFIG.accessKey,
    requestId,
    amount: amount.toString(),
    orderId,
    orderInfo,
    redirectUrl: returnUrl || MOMO_CONFIG.redirectUrl,
    ipnUrl: MOMO_CONFIG.ipnUrl,
    extraData,
    requestType,
    signature,
    lang: "vi",
  };

  try {
    const res = await axios.post(MOMO_CONFIG.endpoint, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("MoMo API Response:", res.data); // Thêm log để xem phản hồi từ MoMo
    return res.data.payUrl;
  } catch (error) {
    console.error(
      "Lỗi khi gọi API MoMo:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Không thể tạo yêu cầu thanh toán MoMo.");
  }
}

module.exports = {
  createPayment,
};
