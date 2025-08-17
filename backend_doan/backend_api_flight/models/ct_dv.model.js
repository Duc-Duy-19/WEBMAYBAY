const { connectDB, sql } = require("../config/db");

class CT_DV {
  static async getByVeId(veId) {
    await connectDB();
    const result = await sql.query`
      SELECT ct.*, dv.TenDichVu, dv.GiaDichVu
      FROM CT_DV ct
      JOIN DichVu dv ON ct.ID_DichVu = dv.ID_DichVu
      WHERE ct.ID_Ve = ${veId}`;
    return result.recordset;
  }

  static async create(ctDvData) {
    await connectDB();
    const result = await sql.query`
      INSERT INTO CT_DV (ID_Ve, ID_DichVu, ThanhTien) 
      VALUES (${ctDvData.idVe}, ${ctDvData.idDichVu}, ${ctDvData.thanhTien})`;
    return result.rowsAffected[0] > 0;
  }

  static async update(veId, dichVuId, ctDvData) {
    await connectDB();
    const result = await sql.query`
      UPDATE CT_DV 
      SET 
          ThanhTien = ${ctDvData.thanhTien} 
      WHERE ID_Ve = ${veId} AND ID_DichVu = ${dichVuId}`;
    return result.rowsAffected[0] > 0;
  }

  static async delete(veId, dichVuId) {
    await connectDB();
    const result =
      await sql.query`DELETE FROM CT_DV WHERE ID_Ve = ${veId} AND ID_DichVu = ${dichVuId}`;
    return result.rowsAffected[0] > 0;
  }
}

module.exports = CT_DV;
