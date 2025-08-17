const { connectDB, sql } = require("../config/db");

class LoaiGhe {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM LoaiGhe`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM LoaiGhe WHERE ID_LoaiGhe = ${id}`;
    return result.recordset[0];
  }

  static async create(loaiGheData) {
    await connectDB();
    const result = await sql.query`
        INSERT INTO LoaiGhe (TenLoai, HeSoGia) 
        VALUES (${loaiGheData.TenLoai}, ${loaiGheData.HeSoGia}); 
        SELECT SCOPE_IDENTITY() AS ID_LoaiGhe;`;
    return result.recordset[0];
  }

  static async update(id, loaiGheData) {
    await connectDB();
    const result = await sql.query`
        UPDATE LoaiGhe 
        SET TenLoai = ${loaiGheData.TenLoai}, 
            HeSoGia = ${loaiGheData.HeSoGia} 
        WHERE ID_LoaiGhe = ${id}; 
        SELECT * FROM LoaiGhe WHERE ID_LoaiGhe = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result =
      await sql.query`DELETE FROM LoaiGhe WHERE ID_LoaiGhe = ${id}`;
    return result.rowsAffected[0];
  }
}

module.exports = LoaiGhe;
