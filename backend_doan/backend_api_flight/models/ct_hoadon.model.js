const { connectDB, sql } = require("../config/db");

class CT_HoaDon {
  static async getByHoaDonId(hoaDonId) {
    await connectDB();
    const result = await sql.query`
      SELECT ct.*, pt.TenPhuongThuc
      FROM CT_HoaDon ct
      JOIN PhuongThuc pt ON ct.ID_PhuongThuc = pt.ID_PhuongThuc
      WHERE ct.ID_HoaDon = ${hoaDonId}`;
    return result.recordset;
  }

  static async create(ctHoaDonData) {
    await connectDB();
    const result = await sql.query`
      INSERT INTO CT_HoaDon (ID_PhuongThuc, ID_HoaDon, SoTien) 
      VALUES (${ctHoaDonData.idPhuongThuc}, ${ctHoaDonData.idHoaDon}, ${ctHoaDonData.soTien})`;
    return result.rowsAffected[0] > 0;
  }
}

module.exports = CT_HoaDon;
