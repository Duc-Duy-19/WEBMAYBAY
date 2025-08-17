const { connectDB, sql } = require("../config/db");

class HanhKhach {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM HanhKhach`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM HanhKhach WHERE ID_HanhKhach = ${id}`;
    return result.recordset[0];
  }

  static async create(hanhKhachData) {
    await connectDB();
    const result = await sql.query`
        INSERT INTO HanhKhach (HoTen, NgaySinh, GioiTinh, SoHoChieu_CCCD, SDT, Email, DiaChi, ID_User) 
        VALUES (${hanhKhachData.hoTen}, ${hanhKhachData.ngaySinh}, ${hanhKhachData.gioiTinh}, 
                ${hanhKhachData.soHoChieu_CCCD}, ${hanhKhachData.sdt}, ${hanhKhachData.email}, 
                ${hanhKhachData.diaChi}, ${hanhKhachData.idUser}); 
        SELECT SCOPE_IDENTITY() AS ID_HanhKhach;`;
    return result.recordset[0];
  }

  static async update(id, hanhKhachData) {
    await connectDB();
    const result = await sql.query`
        UPDATE HanhKhach 
        SET HoTen = ${hanhKhachData.hoTen}, 
            NgaySinh = ${hanhKhachData.ngaySinh}, 
            GioiTinh = ${hanhKhachData.gioiTinh}, 
            SoHoChieu_CCCD = ${hanhKhachData.soHoChieu_CCCD}, 
            SDT = ${hanhKhachData.sdt}, 
            Email = ${hanhKhachData.email}, 
            DiaChi = ${hanhKhachData.diaChi}, 
            ID_User = ${hanhKhachData.idUser} 
        WHERE ID_HanhKhach = ${id}; 
        SELECT * FROM HanhKhach WHERE ID_HanhKhach = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result =
      await sql.query`DELETE FROM HanhKhach WHERE ID_HanhKhach = ${id}`;
    return result.rowsAffected[0];
  }

  static async getByUserId(userId) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM HanhKhach WHERE ID_User = ${userId}`;
    return result.recordset;
  }
}

module.exports = HanhKhach;
