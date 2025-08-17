# Hướng dẫn thêm ghế cho máy bay

## Tổng quan
Dự án này bao gồm các script SQL để thêm ghế cho 3 máy bay theo sơ đồ ghế chuẩn.

## Cấu trúc ghế theo sơ đồ
- **Hàng 1-5**: Thương gia (Business Class) - 30 ghế/máy bay
- **Hàng 6-24**: Phổ thông (Economy Class) - 114 ghế/máy bay
- **Tổng**: 144 ghế/máy bay × 3 máy bay = 432 ghế

## Các file script

### 1. `check-missing-seats.sql`
**Mục đích**: Kiểm tra ghế hiện tại và xác định ghế còn thiếu
**Sử dụng**: Chạy trước khi thêm ghế để biết tình trạng hiện tại

```sql
-- Chạy script này để kiểm tra
```

### 2. `add-missing-seats.sql`
**Mục đích**: Thêm tất cả ghế còn thiếu cho 3 máy bay
**Sử dụng**: Script chính để thêm ghế

```sql
-- Chạy script này để thêm ghế
```

## Hướng dẫn sử dụng

### Bước 1: Kiểm tra tình trạng hiện tại
```sql
-- Chạy file check-missing-seats.sql
```

### Bước 2: Thêm ghế còn thiếu
```sql
-- Chạy file add-missing-seats.sql
```

### Bước 3: Kiểm tra kết quả
```sql
-- Chạy lại check-missing-seats.sql để xác nhận
```

## Dữ liệu hiện tại (từ thông tin bạn cung cấp)

### Máy bay 1 (Airbus A321 - Vietnam Airlines)
- Ghế hiện có: ~115 ghế
- Ghế còn thiếu: ~29 ghế
- Thiếu chủ yếu: 1C-1F, 2C-2F, 3B-3F, hàng 21-24

### Máy bay 2 (Boeing 787 - Bamboo Airways)  
- Ghế hiện có: ~70 ghế
- Ghế còn thiếu: ~74 ghế
- Thiếu chủ yếu: 1C-1F, 2C-2F, 3B-3F, hàng 19-24

### Máy bay 3 (Airbus A320 - VietJet Air)
- Ghế hiện có: 0 ghế
- Ghế còn thiếu: 144 ghế (tất cả)

## Cấu trúc bảng Ghe

```sql
CREATE TABLE Ghe (
    ID_Ghe INT IDENTITY(1,1) PRIMARY KEY,
    SoGhe NVARCHAR(10),      -- Ví dụ: '1A', '2B', '24F'
    Hang NVARCHAR(1),        -- A, B, C, D, E, F
    ID_ChuyenBay INT,        -- 1, 2, 3
    ID_LoaiGhe INT           -- 1: Phổ thông, 2: Thương gia
);
```

## Lưu ý quan trọng

1. **Backup dữ liệu**: Luôn backup trước khi chạy script
2. **Kiểm tra ràng buộc**: Đảm bảo không có ràng buộc khóa ngoại cản trở
3. **Quyền truy cập**: Cần quyền INSERT vào bảng Ghe
4. **Kiểm tra kết quả**: Luôn kiểm tra sau khi chạy script

## Kết quả mong đợi sau khi chạy

```
Máy bay 1: 144 ghế (30 thương gia + 114 phổ thông)
Máy bay 2: 144 ghế (30 thương gia + 114 phổ thông)  
Máy bay 3: 144 ghế (30 thương gia + 114 phổ thông)
Tổng cộng: 432 ghế
```

## Troubleshooting

### Lỗi thường gặp:
1. **Duplicate key**: Ghế đã tồn tại - Script có xử lý NOT EXISTS
2. **Foreign key constraint**: Kiểm tra bảng LoaiGhe
3. **Permission denied**: Cần quyền INSERT

### Giải pháp:
- Chạy script kiểm tra trước
- Đảm bảo có đủ quyền
- Kiểm tra cấu trúc bảng

## Liên hệ
Nếu có vấn đề, vui lòng kiểm tra log và thông báo lỗi chi tiết. 