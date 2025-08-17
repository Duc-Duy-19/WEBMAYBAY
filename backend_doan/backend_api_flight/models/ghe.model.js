const { connectDB, sql } = require("../config/db");

class Ghe {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM Ghe`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result = await sql.query`SELECT * FROM Ghe WHERE ID_Ghe = ${id}`;
    return result.recordset[0];
  }

  static async getByAircraftId(aircraftId) {
    try {
      const result =
        await sql.query`SELECT * FROM Ghe WHERE ID_MayBay = ${aircraftId}`;
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableSeats(chuyenBayId) {
    await connectDB();
    const result = await sql.query`
      SELECT g.ID_Ghe, g.SoGhe, g.Hang, 
             lg.TenLoai, lg.HeSoGia, 
             cb.GiaCoSo,
             (cb.GiaCoSo * lg.HeSoGia) AS GiaVe
      FROM Ghe g
      JOIN LoaiGhe lg ON g.ID_LoaiGhe = lg.ID_LoaiGhe
      JOIN MayBay mb ON g.ID_MayBay = mb.ID_MayBay
      JOIN ChuyenBay cb ON cb.ID_MayBay = mb.ID_MayBay
      WHERE cb.ID_ChuyenBay = ${chuyenBayId}
      AND g.ID_Ghe NOT IN (
          SELECT v.ID_Ghe 
          FROM Ve v 
          WHERE v.ID_ChuyenBay = ${chuyenBayId} 
          AND v.TrangThai IN (N'Đã đặt', N'Đã thanh toán', N'Đã sử dụng')
      )
      ORDER BY g.Hang, g.SoGhe`;

    return result.recordset;
  }

  static async create(gheData) {
    await connectDB();
    const result = await sql.query`
        INSERT INTO Ghe (SoGhe, Hang, ID_LoaiGhe, ID_MayBay) 
        VALUES (${gheData.soGhe}, ${gheData.hang}, ${gheData.idLoaiGhe}, ${gheData.idMayBay}); 
        SELECT SCOPE_IDENTITY() AS ID_Ghe;`;
    return result.recordset[0];
  }

  static async update(id, gheData) {
    await connectDB();
    const result = await sql.query`
        UPDATE Ghe 
        SET SoGhe = ${gheData.soGhe}, 
            Hang = ${gheData.hang}, 
            ID_LoaiGhe = ${gheData.idLoaiGhe}, 
            ID_MayBay = ${gheData.idMayBay} 
        WHERE ID_Ghe = ${id}; 
        SELECT * FROM Ghe WHERE ID_Ghe = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM Ghe WHERE ID_Ghe = ${id}`;
    return result.rowsAffected[0];
  }
}

module.exports = Ghe;
