const { connectDB, sql } = require("../config/db");

class SanBay {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM SanBay`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM SanBay WHERE ID_SanBay = ${id}`;
    return result.recordset[0];
  }

  static async create(sanBayData) {
    await connectDB();
    const result = await sql.query`
        INSERT INTO SanBay (TenSanBay, ThanhPho, DiaChi,MaSanBay) 
        VALUES (${sanBayData.tenSanBay}, ${sanBayData.thanhPho}, ${sanBayData.diaChi}, ${sanBayData.maSanBay}); 
        SELECT SCOPE_IDENTITY() AS ID_SanBay;`;
    return result.recordset[0];
  }

  static async update(id, sanBayData) {
    await connectDB();
    const result = await sql.query`
        UPDATE SanBay 
        SET TenSanBay = ${sanBayData.tenSanBay}, 
            ThanhPho = ${sanBayData.thanhPho}, 
            DiaChi = ${sanBayData.diaChi},
            MaSanBay = ${sanBayData.maSanBay}
        WHERE ID_SanBay = ${id}; 
        SELECT * FROM SanBay WHERE ID_SanBay = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM SanBay WHERE ID_SanBay = ${id}`;
    return result.rowsAffected[0];
  }
}

module.exports = SanBay;
