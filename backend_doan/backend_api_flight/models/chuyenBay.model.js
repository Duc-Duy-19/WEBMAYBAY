const { connectDB, sql } = require("../config/db");

class ChuyenBay {
  static async getAll() {
    await connectDB();
    const result = await sql.query`
      SELECT 
        ID_ChuyenBay,
        ID_SanBayDi,
        ID_SanBayDen,
        ID_MayBay,
        FORMAT(ThoiGianKhoiHanh, 'yyyy-MM-dd HH:mm') AS ThoiGianKhoiHanh,
        FORMAT(ThoiGianHaCanh, 'yyyy-MM-dd HH:mm') AS ThoiGianHaCanh,
        GiaCoSo,
        TrangThai
      FROM ChuyenBay
    `;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result = await sql.query`
   SELECT 
  cb.*
FROM ChuyenBay cb
WHERE cb.ID_ChuyenBay = ${id}
  `;
    console.log("Dữ liệu trả về từ DB trong getById:", result.recordset[0]);
    return result.recordset[0];
  }

  static async create(chuyenBayData) {
    await connectDB();
    const result =
      await sql.query`INSERT INTO ChuyenBay (ID_SanBayDi, ID_SanBayDen, ID_MayBay, ThoiGianKhoiHanh, ThoiGianHaCanh, GiaCoSo , TrangThai) 
      VALUES (${chuyenBayData.ID_SanBayDi}, ${chuyenBayData.ID_SanBayDen}, ${chuyenBayData.ID_MayBay}, 
                ${chuyenBayData.ThoiGianKhoiHanh}, ${chuyenBayData.ThoiGianHaCanh}, 
                ${chuyenBayData.GiaCoSo}, ${chuyenBayData.TrangThai}); 
        SELECT SCOPE_IDENTITY() AS ID_ChuyenBay;`;
    return result.recordset[0];
  }

  static async update(id, chuyenBayData) {
    await connectDB();
    const result =
      await sql.query`UPDATE ChuyenBay SET  ID_SanBayDi = ${chuyenBayData.ID_SanBayDi}, ID_SanBayDen = ${chuyenBayData.ID_SanBayDen}, ID_MayBay = ${chuyenBayData.ID_MayBay}, ThoiGianKhoiHanh = ${chuyenBayData.ThoiGianKhoiHanh}, ThoiGianHaCanh = ${chuyenBayData.ThoiGianHaCanh}, GiaCoSo  = ${chuyenBayData.GiaCoSo}, TrangThai= ${chuyenBayData.TrangThai} WHERE ID_ChuyenBay = ${id}; SELECT * FROM ChuyenBay WHERE ID_ChuyenBay = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result =
      await sql.query`DELETE FROM ChuyenBay WHERE ID_ChuyenBay = ${id}`;
    return result.rowsAffected[0];
  }
}

module.exports = ChuyenBay;

function formatFlightTime(timeString) {
  if (!timeString) return "00:00";
  // Nếu là dạng "YYYY-MM-DD HH:mm"
  if (timeString.includes(" ")) {
    return timeString.split(" ")[1].slice(0, 5);
  }
  return timeString;
}

function parseDateTimeString(str) {
  if (!str) return null;
  if (str.includes(" ")) {
    const [datePart, timePart] = str.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }
  return new Date(str);
}
