const { connectDB, sql } = require("../config/db");

class HoaDon {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM HoaDon`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM HoaDon WHERE ID_HoaDon = ${id}`;
    return result.recordset[0];
  }

  static async getByUserId(userId) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM HoaDon WHERE ID_User = ${userId}`;
    return result.recordset;
  }

  static async getByVeId(veId) {
    await connectDB();
    const result = await sql.query`SELECT * FROM HoaDon WHERE ID_Ve = ${veId}`;
    return result.recordset[0];
  }

  static async create(hoaDonData) {
    await connectDB();
    const result = await sql.query`
      INSERT INTO HoaDon (NgayThanhToan, TongTien, ID_Admin, ID_User, ID_Ve) 
      VALUES (${hoaDonData.ngayThanhToan}, ${hoaDonData.tongTien}, ${hoaDonData.idAdmin}, ${hoaDonData.idUser}, ${hoaDonData.idVe}); 
      SELECT SCOPE_IDENTITY() AS ID_HoaDon;`;
    return result.recordset[0];
  }

  static async update(id, hoaDonData) {
    await connectDB();
    const result = await sql.query`
      UPDATE HoaDon 
      SET NgayThanhToan = ${hoaDonData.ngayThanhToan}, 
          TongTien = ${hoaDonData.tongTien} 
      WHERE ID_HoaDon = ${id}; 
      SELECT * FROM HoaDon WHERE ID_HoaDon = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM HoaDon WHERE ID_HoaDon = ${id}`;
    return result.rowsAffected[0];
  }
}

module.exports = HoaDon;
