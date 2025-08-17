const { connectDB, sql } = require("../config/db");

class Users {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM Users`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result = await sql.query`SELECT * FROM Users WHERE ID_User = ${id}`;
    return result.recordset[0];
  }

  static async create(userData) {
    await connectDB();
    const result = await sql.query`
        INSERT INTO Users (Email, HoTen, MatKhau, SDT) 
        VALUES (${userData.email}, ${userData.hoTen}, ${userData.matKhau}, ${userData.sdt}); 
        SELECT SCOPE_IDENTITY() AS ID_User;`;
    return result.recordset[0];
  }

  static async update(id, userData) {
    await connectDB();
    const result = await sql.query`
        UPDATE Users 
        SET Email = ${userData.email}, 
            HoTen = ${userData.hoTen}, 
            MatKhau = ${userData.matKhau}, 
            SDT = ${userData.sdt} 
        WHERE ID_User = ${id}; 
        SELECT * FROM Users WHERE ID_User = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM Users WHERE ID_User = ${id}`;
    return result.rowsAffected[0];
  }

  static async login(email, matKhau) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM Users WHERE Email = ${email} AND MatKhau = ${matKhau}`;
    return result.recordset[0];
  }
}

module.exports = Users;
