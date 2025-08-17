const { connectDB, sql } = require("../config/db");

class Admin {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM Admin`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result = await sql.query`SELECT * FROM Admin WHERE ID_Admin = ${id}`;
    return result.recordset[0];
  }

  static async create(adminData) {
    await connectDB();
    const result =
      await sql.query`INSERT INTO Admin (TaiKhoan, MatKhau, HoTen, Email, SDT) 
        VALUES (${adminData.taiKhoan}, ${adminData.matKhau}, ${adminData.hoTen}, ${adminData.email}, ${adminData.sdt}); 
        SELECT SCOPE_IDENTITY() AS ID_Admin;`;
    return result.recordset[0];
  }

  static async update(id, adminData) {
    await connectDB();
    const result = await sql.query`UPDATE Admin 
        SET TaiKhoan = ${adminData.taiKhoan}, MatKhau = ${adminData.matKhau}, 
        HoTen = ${adminData.hoTen}, Email = ${adminData.email}, SDT = ${adminData.sdt} 
        WHERE ID_Admin = ${id}; 
        SELECT * FROM Admin WHERE ID_Admin = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM Admin WHERE ID_Admin = ${id}`;
    return result.rowsAffected[0];
  }

  static async login(taiKhoan, matKhau) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM Admin WHERE TaiKhoan = ${taiKhoan} AND MatKhau = ${matKhau}`;
    return result.recordset[0];
  }
}

module.exports = Admin;
