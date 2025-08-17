const { connectDB, sql } = require("../config/db");

class Ve {
  static async getAll() {
    await connectDB();
    const result = await sql.query`SELECT * FROM Ve`;
    return result.recordset;
  }

  static async getById(id) {
    await connectDB();
    const result = await sql.query`SELECT * FROM Ve WHERE ID_Ve = ${id}`;
    return result.recordset[0];
  }

  static async getByChuyenBayId(chuyenBayId) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM Ve WHERE ID_ChuyenBay = ${chuyenBayId}`;
    return result.recordset;
  }

  static async getByHanhKhachId(hanhKhachId) {
    await connectDB();
    const result =
      await sql.query`SELECT * FROM Ve WHERE ID_HanhKhach = ${hanhKhachId}`;
    return result.recordset;
  }

  static async create(veData) {
    await connectDB();
    const result = await sql.query`
      INSERT INTO Ve (TrangThai, NgayDatVe, ID_ChuyenBay, ID_Ghe, ID_HanhKhach) 
      VALUES (${veData.trangThai}, ${veData.ngayDatVe}, ${veData.idChuyenBay}, ${veData.idGhe}, ${veData.idHanhKhach}); 
      SELECT SCOPE_IDENTITY() AS ID_Ve;`;
    return result.recordset[0];
  }

  static async update(id, veData) {
    await connectDB();
    const result = await sql.query`
      UPDATE Ve 
      SET TrangThai = ${veData.trangThai}
      WHERE ID_Ve = ${id}; 
      SELECT * FROM Ve WHERE ID_Ve = ${id}`;
    return result.recordset[0];
  }

  static async delete(id) {
    await connectDB();
    const result = await sql.query`DELETE FROM Ve WHERE ID_Ve = ${id}`;
    return result.rowsAffected[0];
  }

  static async getByUserId(userId) {
    await connectDB();

    console.log("Đang query vé cho userId:", userId);

    const result = await sql.query`
      SELECT 
        v.ID_Ve,
        v.TrangThai,
        v.NgayDatVe,
        v.ID_ChuyenBay,
        v.ID_Ghe,
        v.ID_HanhKhach,
        DATEADD(HOUR, +0, cb.ThoiGianKhoiHanh) AS ThoiGianKhoiHanh,
        DATEADD(HOUR, +0, cb.ThoiGianHaCanh) AS ThoiGianHaCanh,
        cb.GiaCoSo,
        sd.ID_SanBay AS ID_SanBayDi,
        sd.TenSanBay AS TenSanBayDi, 
        sd.ThanhPho AS ThanhPhoDi,
        sa.ID_SanBay AS ID_SanBayDen,
        sa.TenSanBay AS TenSanBayDen, 
        sa.ThanhPho AS ThanhPhoDen,
        g.SoGhe,
        g.Hang,
        lg.TenLoai AS LoaiGhe,
        lg.HeSoGia,
        hk.ID_HanhKhach,
        hk.HoTen,
        hk.NgaySinh,
        hk.GioiTinh,
        hk.SoHoChieu_CCCD,
        hk.SDT,
        hk.Email,
        hk.DiaChi
      FROM Ve v
      JOIN ChuyenBay cb ON v.ID_ChuyenBay = cb.ID_ChuyenBay
      LEFT JOIN SanBay sd ON cb.ID_SanBayDi = sd.ID_SanBay
      LEFT JOIN SanBay sa ON cb.ID_SanBayDen = sa.ID_SanBay
      JOIN Ghe g ON v.ID_Ghe = g.ID_Ghe
      JOIN LoaiGhe lg ON g.ID_LoaiGhe = lg.ID_LoaiGhe
      JOIN HanhKhach hk ON v.ID_HanhKhach = hk.ID_HanhKhach
      WHERE hk.ID_User = ${userId}
      ORDER BY cb.ThoiGianKhoiHanh DESC`;

    console.log("Query result:", result.recordset);

    // Format dữ liệu để phù hợp với frontend
    return result.recordset.map((row) => ({
      ID_Ve: row.ID_Ve,
      ID_ChuyenBay: row.ID_ChuyenBay,
      ThoiGianKhoiHanh: row.ThoiGianKhoiHanh,
      ThoiGianHaCanh: row.ThoiGianHaCanh,
      ID_SanBayDi: row.ID_SanBayDi,
      ID_SanBayDen: row.ID_SanBayDen,
      TenSanBayDi: row.TenSanBayDi,
      TenSanBayDen: row.TenSanBayDen,
      ThanhPhoDi: row.ThanhPhoDi,
      ThanhPhoDen: row.ThanhPhoDen,
      GiaVe: row.GiaCoSo * row.HeSoGia,
      TrangThai: row.TrangThai,
      HanhKhach: {
        ID_HanhKhach: row.ID_HanhKhach,
        HoTen: row.HoTen,
        NgaySinh: row.NgaySinh,
        GioiTinh: row.GioiTinh,
        SoHoChieu_CCCD: row.SoHoChieu_CCCD,
        SDT: row.SDT,
        Email: row.Email,
        DiaChi: row.DiaChi,
      },
      Ghe: {
        SoGhe: row.SoGhe,
        Hang: row.Hang,
        LoaiGhe: row.LoaiGhe,
      },
    }));
  }
}

module.exports = Ve;
