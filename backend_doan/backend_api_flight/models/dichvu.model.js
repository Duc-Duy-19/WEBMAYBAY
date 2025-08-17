const { connectDB, sql } = require("../config/db");

class DichVu {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM DichVu`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM DichVu WHERE ID_DichVu = ${id}`;
    return result.recordset[0];
  }

  static async create({ tenDichVu, giaDichVu }) {
    await connectDB();
    const result = await sql.query`
      INSERT INTO DichVu (TenDichVu, GiaDichVu)
      VALUES (${tenDichVu}, ${giaDichVu});
      SELECT SCOPE_IDENTITY() AS ID_DichVu;
    `;
    return {
      ID_DichVu: result.recordset[0].ID_DichVu,
      tenDichVu,
      giaDichVu,
    };
  }

  static async update(id, { tenDichVu, giaDichVu }) {
    await connectDB();
    await sql.query`
      UPDATE DichVu
      SET TenDichVu = ${tenDichVu}, GiaDichVu = ${giaDichVu}
      WHERE ID_DichVu = ${id}
    `;
    const result =
      await sql.query`SELECT * FROM DichVu WHERE ID_DichVu = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM DichVu WHERE ID_DichVu = ${id}`;
    return result.rowsAffected[0];
  }
}

module.exports = DichVu;
