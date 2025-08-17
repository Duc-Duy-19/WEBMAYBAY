-- Tạo cơ sở dữ liệu
CREATE DATABASE HETHONGQLBANVEMB
GO

USE HETHONGQLBANVEMB
GO

-- Bảng Admin
CREATE TABLE Admin (
    ID_Admin INT IDENTITY(1,1) PRIMARY KEY,
    TaiKhoan NVARCHAR(50) UNIQUE NOT NULL,
    MatKhau NVARCHAR(255) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    SDT NVARCHAR(20) UNIQUE NOT NULL
);

-- Bảng Users
CREATE TABLE Users (
    ID_User INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    MatKhau NVARCHAR(255) NOT NULL,
    SDT NVARCHAR(20) UNIQUE NOT NULL
);

-- Bảng HanhKhach
CREATE TABLE HanhKhach (
    ID_HanhKhach INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE NOT NULL,
    GioiTinh NVARCHAR(10) CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),
    SoHoChieu_CCCD NVARCHAR(50) UNIQUE NOT NULL,
    SDT NVARCHAR(20) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    DiaChi NVARCHAR(255),
    ID_User INT FOREIGN KEY REFERENCES Users(ID_User)
);

-- Bảng SanBay
CREATE TABLE SanBay (
    ID_SanBay INT IDENTITY(1,1) PRIMARY KEY,
    TenSanBay NVARCHAR(100) NOT NULL,
    ThanhPho NVARCHAR(100) NOT NULL,
    DiaChi NVARCHAR(255),
    MaSanBay NVARCHAR(10)
);

-- Bảng MayBay
CREATE TABLE MayBay (
    ID_MayBay INT IDENTITY(1,1) PRIMARY KEY,
    LoaiMayBay NVARCHAR(100) NOT NULL,
    SoLuongGhe INT NOT NULL CHECK (SoLuongGhe > 0),
    HangSanXuat NVARCHAR(100) NOT NULL,
    TinhTrang NVARCHAR(50) CHECK (TinhTrang IN (N'Sẵn sàng', N'Bảo trì', N'Không hoạt động'))
);

-- Bảng LoaiGhe
CREATE TABLE LoaiGhe (
    ID_LoaiGhe INT IDENTITY(1,1) PRIMARY KEY,
    TenLoai NVARCHAR(50) UNIQUE NOT NULL,
    HeSoGia FLOAT NOT NULL DEFAULT 1.0
);

-- Bảng Ghe
CREATE TABLE Ghe (
    ID_Ghe INT IDENTITY(1,1) PRIMARY KEY,
    SoGhe NVARCHAR(10) NOT NULL,
    Hang NVARCHAR(10),
    ID_MayBay INT FOREIGN KEY REFERENCES MayBay(ID_MayBay),
    ID_LoaiGhe INT FOREIGN KEY REFERENCES LoaiGhe(ID_LoaiGhe),
    CONSTRAINT UQ_Ghe_MayBay UNIQUE (SoGhe, ID_MayBay)
);

-- Bảng ChuyenBay
CREATE TABLE ChuyenBay (
    ID_ChuyenBay INT IDENTITY(1,1) PRIMARY KEY,
    ID_SanBayDi INT NOT NULL FOREIGN KEY REFERENCES SanBay(ID_SanBay),
    ID_SanBayDen INT NOT NULL FOREIGN KEY REFERENCES SanBay(ID_SanBay),
    ThoiGianKhoiHanh DATETIME NOT NULL,
    ThoiGianHaCanh DATETIME NOT NULL,
    TrangThai NVARCHAR(50) CHECK (TrangThai IN (N'Đang mở bán', N'Đã khởi hành', N'Đã hủy')),
    ID_MayBay INT FOREIGN KEY REFERENCES MayBay(ID_MayBay),
    GiaCoSo DECIMAL(18, 2) NOT NULL,
    CONSTRAINT CHK_SanBayKhacNhau CHECK (ID_SanBayDi <> ID_SanBayDen),
    CONSTRAINT CHK_ThoiGianHopLe CHECK (ThoiGianHaCanh > ThoiGianKhoiHanh)
);

-- Bảng Ve
CREATE TABLE Ve (
    ID_Ve INT IDENTITY(1,1) PRIMARY KEY,
    TrangThai NVARCHAR(50) CHECK (TrangThai IN (N'Đã đặt', N'Đã thanh toán', N'Đã hủy', N'Đã sử dụng')),
    NgayDatVe DATE,
    ID_ChuyenBay INT FOREIGN KEY REFERENCES ChuyenBay(ID_ChuyenBay),
    ID_Ghe INT FOREIGN KEY REFERENCES Ghe(ID_Ghe),
    ID_HanhKhach INT FOREIGN KEY REFERENCES HanhKhach(ID_HanhKhach),
    CONSTRAINT UQ_Ghe_ChuyenBay UNIQUE (ID_ChuyenBay, ID_Ghe)
);

-- Bảng DichVu
CREATE TABLE DichVu (
    ID_DichVu INT IDENTITY(1,1) PRIMARY KEY,
    TenDichVu NVARCHAR(100) NOT NULL,
    GiaDichVu DECIMAL(18,2) NOT NULL,
);

-- Bảng CT_DV
CREATE TABLE CT_DV (
    ID_Ve INT FOREIGN KEY REFERENCES Ve(ID_Ve),
    ID_DichVu INT FOREIGN KEY REFERENCES DichVu(ID_DichVu),
    ThanhTien DECIMAL(18,2) NOT NULL,
    PRIMARY KEY(ID_Ve, ID_DichVu)
);

-- Bảng PhuongThuc
CREATE TABLE PhuongThuc (
    ID_PhuongThuc INT IDENTITY(1,1) PRIMARY KEY,
    TenPhuongThuc NVARCHAR(50) NOT NULL
);

-- Bảng HoaDon
CREATE TABLE HoaDon (
    ID_HoaDon INT IDENTITY(1,1) PRIMARY KEY,
    NgayThanhToan DATE,
    TongTien DECIMAL(18, 2) NOT NULL,
    ID_Admin INT FOREIGN KEY REFERENCES Admin(ID_Admin),
    ID_User INT FOREIGN KEY REFERENCES Users(ID_User),
    ID_Ve INT FOREIGN KEY REFERENCES Ve(ID_Ve)
);

-- Bảng CT_HoaDon
CREATE TABLE CT_HoaDon (
    ID_PhuongThuc INT FOREIGN KEY REFERENCES PhuongThuc(ID_PhuongThuc),
    ID_HoaDon INT FOREIGN KEY REFERENCES HoaDon(ID_HoaDon),
    SoTien DECIMAL(18, 2) NOT NULL,
    PRIMARY KEY(ID_PhuongThuc, ID_HoaDon)
);

-- Bảng DanhGia
CREATE TABLE DanhGia (
    ID_DanhGia INT IDENTITY(1,1) PRIMARY KEY,
    NoiDung NVARCHAR(500),
    NgayDanhGia DATE,
    ID_HanhKhach INT FOREIGN KEY REFERENCES HanhKhach(ID_HanhKhach),
    ID_ChuyenBay INT FOREIGN KEY REFERENCES ChuyenBay(ID_ChuyenBay)
);

SET IDENTITY_INSERT SanBay ON;
INSERT INTO SanBay (ID_SanBay, TenSanBay, ThanhPho, DiaChi) VALUES
(1, N'Tân Sơn Nhất', N'TP. Hồ Chí Minh', N'Phường 2, Quận Tân Bình'),
(2, N'Nội Bài', N'Hà Nội', N'Phú Minh, Sóc Sơn'),
(3, N'Đà Nẵng', N'Đà Nẵng', N'Hòa Thuận Tây, Hải Châu'),
(4, N'Cam Ranh', N'Nha Trang', N'Cam Nghĩa, Cam Ranh'),
(5, N'Côn Đảo', N'Côn Đảo', N'Cỏ Ống, Côn Đảo'),
(6, N'Liên Khương', N'Đà Lạt', N'Liên Nghĩa, Đức Trọng'),
(7, N'Cà Mau', N'Cà Mau', N'Phường 6, TP. Cà Mau');
SET IDENTITY_INSERT SanBay OFF;

SET IDENTITY_INSERT MayBay ON;
INSERT INTO MayBay (ID_MayBay, LoaiMayBay, SoLuongGhe, HangSanXuat, TinhTrang) VALUES
(1, N'Airbus A321', 180, N'Vietnam Airlines', N'Sẵn sàng'),
(2, N'Boeing 787', 250, N'Bamboo Airways', N'Sẵn sàng'),
(3, N'Airbus A320', 180, N'VietJet Air', N'Sẵn sàng');
SET IDENTITY_INSERT MayBay OFF;

SET IDENTITY_INSERT LoaiGhe ON;
INSERT INTO LoaiGhe (ID_LoaiGhe, TenLoai, HeSoGia) VALUES
(1, N'Phổ thông', 1.0),
(2, N'Thương gia', 1.5);
SET IDENTITY_INSERT LoaiGhe OFF;

SET IDENTITY_INSERT Ghe ON;
INSERT INTO Ghe (ID_Ghe, SoGhe, Hang, ID_MayBay, ID_LoaiGhe) VALUES
(1, N'1A', N'A', 1, 1),
(2, N'1B', N'A', 1, 1),
(3, N'2A', N'B', 1, 2),
(4, N'2B', N'B', 1, 2),
(5, N'3A', N'C', 1, 1),
(6, N'1A', N'A', 2, 1),
(7, N'1B', N'A', 2, 1),
(8, N'2A', N'B', 2, 2),
(9, N'2B', N'B', 2, 2),
(10, N'3A', N'C', 2, 1);
SET IDENTITY_INSERT Ghe OFF;

SET IDENTITY_INSERT ChuyenBay ON;
INSERT INTO ChuyenBay (ID_ChuyenBay, ID_SanBayDi, ID_SanBayDen, ThoiGianKhoiHanh, ThoiGianHaCanh, TrangThai, ID_MayBay, GiaCoSo) VALUES
(1, 1, 2, '2025-05-15 08:00:00', '2025-05-15 10:00:00', N'Đang mở bán', 1, 1500000),
(2, 2, 1, '2025-05-15 13:00:00', '2025-05-15 15:00:00', N'Đang mở bán', 2, 1400000),
(3, 1, 4, '2025-05-16 09:00:00', '2025-05-16 11:00:00', N'Đang mở bán', 3, 1200000),
(4, 4, 1, '2025-05-17 14:00:00', '2025-05-17 16:00:00', N'Đang mở bán', 1, 1300000);
SET IDENTITY_INSERT ChuyenBay OFF;

SET IDENTITY_INSERT Users ON;
INSERT INTO Users (ID_User, Email, HoTen, MatKhau, SDT) VALUES
(1, N'user1@gmail.com', N'Nguyễn Văn A', N'123456', N'0909123456'),
(2, N'user2@gmail.com', N'Lê Thị B', N'123456', N'0909234567');
SET IDENTITY_INSERT Users OFF;


SELECT 
  FORMAT(ThoiGianKhoiHanh, 'yyyy-MM-dd HH:mm') AS ThoiGianKhoiHanh,
  FORMAT(ThoiGianHaCanh, 'yyyy-MM-dd HH:mm') AS ThoiGianHaCanh
FROM ChuyenBay;


 SELECT cb.ID_ChuyenBay, cb.ID_SanBayDi, cb.ID_SanBayDen,
           FORMAT(cb.ThoiGianKhoiHanh, 'yyyy-MM-dd HH:mm') AS ThoiGianKhoiHanh,
           FORMAT(cb.ThoiGianHaCanh, 'yyyy-MM-dd HH:mm') AS ThoiGianHaCanh,
           cb.GiaCoSo, cb.TrangThai,
           sbDi.TenSanBay AS TenSanBayDi, sbDi.ThanhPho AS ThanhPhoDi,
           sbDen.TenSanBay AS TenSanBayDen, sbDen.ThanhPho AS ThanhPhoDen,
           mb.LoaiMayBay, mb.HangSanXuat
    FROM ChuyenBay cb
    JOIN SanBay sbDi ON cb.ID_SanBayDi = sbDi.ID_SanBay
    JOIN SanBay sbDen ON cb.ID_SanBayDen = sbDen.ID_SanBay
    JOIN MayBay mb ON cb.ID_MayBay = mb.ID_MayBay
    WHERE cb.ID_SanBayDi = @idSanBayDi
      AND cb.ID_SanBayDen = @idSanBayDen
      AND CONVERT(date, cb.ThoiGianKhoiHanh) = @ngayKhoiHanh
      AND cb.TrangThai = N'Đang mở bán'
    ORDER BY cb.ThoiGianKhoiHanh;