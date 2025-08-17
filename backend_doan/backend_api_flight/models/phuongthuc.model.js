const { connectDB, sql } = require("../config/db");

class PhuongThuc {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM PhuongThuc`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM PhuongThuc WHERE ID_PhuongThuc = ${id}`;
    return result.recordset[0];
  }

  static async create(phuongThucData) {
    await connectDB();
    const result = await sql.query`
      INSERT INTO PhuongThuc (TenPhuongThuc) 
      VALUES (${phuongThucData.tenPhuongThuc}); 
      SELECT SCOPE_IDENTITY() AS ID_PhuongThuc;`;
    return result.recordset[0];
  }
}

module.exports = PhuongThuc;
