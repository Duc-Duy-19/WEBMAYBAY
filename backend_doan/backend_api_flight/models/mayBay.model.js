const { connectDB, sql } = require("../config/db");

class MayBay {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM MayBay`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM MayBay WHERE ID_MayBay = ${id}`;
    return result.recordset[0];
  }

  static async create(mayBayData) {
    await connectDB();
    const result = await sql.query`
        INSERT INTO MayBay (LoaiMayBay, SoLuongGhe, HangSanXuat, TinhTrang) 
        VALUES (${mayBayData.loaiMayBay}, ${mayBayData.soLuongGhe}, ${mayBayData.hangSanXuat}, ${mayBayData.tinhTrang}); 
        SELECT SCOPE_IDENTITY() AS ID_MayBay;`;
    return result.recordset[0];
  }

  static async update(id, mayBayData) {
    await connectDB();
    const result = await sql.query`
        UPDATE MayBay 
        SET LoaiMayBay = ${mayBayData.loaiMayBay}, 
            SoLuongGhe = ${mayBayData.soLuongGhe}, 
            HangSanXuat = ${mayBayData.hangSanXuat}, 
            TinhTrang = ${mayBayData.tinhTrang} 
        WHERE ID_MayBay = ${id}; 
        SELECT * FROM MayBay WHERE ID_MayBay = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM MayBay WHERE ID_MayBay = ${id}`;
    return result.rowsAffected[0];
  }
}

module.exports = MayBay;
