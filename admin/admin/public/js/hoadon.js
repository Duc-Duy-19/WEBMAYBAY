// Kiểm tra trạng thái đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Tải dữ liệu hóa đơn 
    try {
        loadHoaDonData();
        
        // Xử lý sự kiện tìm kiếm
        document.getElementById('searchHoaDon').addEventListener('input', function() {
            currentPage = 1;
            loadHoaDonData();
        });
        
        // Xử lý sự kiện lọc theo người dùng
        document.getElementById('filterUser').addEventListener('change', function() {
            currentPage = 1;
            loadHoaDonData();
        });
        
        // Xử lý sự kiện lọc theo ngày
        document.getElementById('filterDate').addEventListener('change', function() {
            currentPage = 1;
            loadHoaDonData();
        });
        
        // Xử lý phân trang
        document.getElementById('prevPage').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadHoaDonData();
            }
        });
        
        document.getElementById('nextPage').addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                loadHoaDonData();
            }
        });
        
        // Tải danh sách người dùng cho bộ lọc
        loadUsers();
    } catch (error) {
        console.error("Lỗi khi khởi tạo trang:", error);
    }
});

// Biến quản lý phân trang
let currentPage = 1;
let totalPages = 1;
let itemsPerPage = 10;
let hoaDonData = [];

// Tạo dữ liệu giả nếu không có kết nối API
function createMockData() {
    return [
        {
            ID_HoaDon: 1,
            NgayThanhToan: new Date().toISOString(),
            TongTien: 1500000,
            ID_Admin: 1,
            ID_User: 2,
            ID_Ve: 3,
            TenNguoiDung: "Ngô Thị Giang",
            TenKhachHang: "Vũ Văn Hùng"
        },
        {
            ID_HoaDon: 2,
            NgayThanhToan: new Date().toISOString(),
            TongTien: 2500000,
            ID_Admin: 1,
            ID_User: 3,
            ID_Ve: 4,
            TenNguoiDung: "Vũ Văn Hùng",
            TenKhachHang: "Đặng Thị Lan"
        },
        {
            ID_HoaDon: 3,
            NgayThanhToan: new Date(Date.now() - 86400000).toISOString(), // Hôm qua
            TongTien: 3000000,
            ID_Admin: 2,
            ID_User: 1,
            ID_Ve: 5,
            TenNguoiDung: "Đỗ Văn Phúc",
            TenKhachHang: "Bùi Văn Minh"
        },
        {
            ID_HoaDon: 4,
            NgayThanhToan: new Date(Date.now() - 172800000).toISOString(), // 2 ngày trước
            TongTien: 3800000,
            ID_Admin: 3,
            ID_User: 4,
            ID_Ve: 4,
            TenNguoiDung: "Đặng Thị Lan",
            TenKhachHang: "Đặng Thị Lan"
        },
        {
            ID_HoaDon: 5,
            NgayThanhToan: new Date(Date.now() - 259200000).toISOString(), // 3 ngày trước
            TongTien: 7000000,
            ID_Admin: 5,
            ID_User: 5,
            ID_Ve: 5,
            TenNguoiDung: "Bùi Văn Minh",
            TenKhachHang: "Bùi Văn Minh"
        },
        {
            ID_HoaDon: 6,
            NgayThanhToan: new Date(Date.now() - 345600000).toISOString(), // 4 ngày trước
            TongTien: 111111111,
            ID_Admin: 6,
            ID_User: 6,
            ID_Ve: 1,
            TenNguoiDung: "Lê Toàn Thắng",
            TenKhachHang: "Đỗ Văn Phúc"
        }
    ];
}

// Hàm tải dữ liệu hóa đơn từ API
async function loadHoaDonData() {
    showLoading();
    try {
        // Sử dụng hàm apiCall từ main.js thay vì fetch trực tiếp
        const data = await apiCall('/api/hoa-don');
        
        if (Array.isArray(data)) {
            hoaDonData = data;
        } else if (data && Array.isArray(data.data)) {
            hoaDonData = data.data;
        } else {
            console.warn('Định dạng dữ liệu API không như mong đợi:', data);
            throw new Error('Định dạng dữ liệu không hợp lệ');
        }
        
        // Lấy thông tin tên khách hàng và người dùng
        await loadUserNames();
        
        // Áp dụng tìm kiếm và lọc
        applyFilters();
        
        // Hiển thị dữ liệu
        displayHoaDonData();
        hideLoading();
    } catch (error) {
        console.error('Lỗi API:', error);
        // Sử dụng dữ liệu giả nếu API không hoạt động
        hoaDonData = createMockData();
        applyFilters();
        displayHoaDonData();
        hideLoading();
        showNotification('Sử dụng dữ liệu demo do không kết nối được đến API', 'warning');
    }
}

// Hàm lấy thông tin tên khách hàng và người dùng
async function loadUserNames() {
    try {
        // Tạo một bản sao của dữ liệu hóa đơn để không ảnh hưởng đến dữ liệu gốc
        const updatedHoaDonData = [...hoaDonData];
        
        // Lấy danh sách người dùng
        const users = await apiCall('/api/users');
        const userData = Array.isArray(users) ? users : (users.data || []);
        
        // Lấy danh sách khách hàng
        const customers = await apiCall('/api/hanhkhach');
        const customerData = Array.isArray(customers) ? customers : (customers.data || []);
        
        // Tạo map để tra cứu nhanh
        const userMap = {};
        userData.forEach(user => {
            userMap[user.ID_User] = user.HoTen || user.Email || 'Người dùng ' + user.ID_User;
        });
        
        const customerMap = {};
        customerData.forEach(customer => {
            customerMap[customer.ID_HanhKhach || customer.MaKH] = customer.TenKH || customer.HoTen || 'Khách hàng ' + (customer.ID_HanhKhach || customer.MaKH);
        });
        
        // Cập nhật thông tin tên người dùng và khách hàng vào dữ liệu hóa đơn
        for (let i = 0; i < updatedHoaDonData.length; i++) {
            const hoadon = updatedHoaDonData[i];
            
            // Thêm tên người dùng
            if (hoadon.ID_User && userMap[hoadon.ID_User]) {
                hoadon.TenNguoiDung = userMap[hoadon.ID_User];
            }
            
            // Tìm thông tin khách hàng từ ID vé
            if (hoadon.ID_Ve) {
                try {
                    // Lấy thông tin vé
                    const ticket = await apiCall(`/api/ve/${hoadon.ID_Ve}`);
                    if (ticket && ticket.ID_HanhKhach) {
                        if (customerMap[ticket.ID_HanhKhach]) {
                            hoadon.TenKhachHang = customerMap[ticket.ID_HanhKhach];
                        } else {
                            // Nếu không có trong map, thử lấy trực tiếp
                            try {
                                const customer = await apiCall(`/api/hanhkhach/${ticket.ID_HanhKhach}`);
                                if (customer) {
                                    hoadon.TenKhachHang = customer.TenKH || customer.HoTen || 'Khách hàng ' + ticket.ID_HanhKhach;
                                }
                            } catch (error) {
                                console.error(`Không thể lấy thông tin khách hàng cho vé ${hoadon.ID_Ve}:`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Không thể lấy thông tin vé ${hoadon.ID_Ve}:`, error);
                }
            }
        }
        
        // Cập nhật dữ liệu hóa đơn với thông tin đã bổ sung
        hoaDonData = updatedHoaDonData;
    } catch (error) {
        console.error('Lỗi khi tải thông tin tên người dùng và khách hàng:', error);
        // Thêm dữ liệu demo nếu không lấy được từ API
        addDemoNames();
    }
}

// Hàm thêm tên demo cho dữ liệu mẫu
function addDemoNames() {
    for (let i = 0; i < hoaDonData.length; i++) {
        const hoadon = hoaDonData[i];
        hoadon.TenNguoiDung = `Người dùng ${hoadon.ID_User || i + 1}`;
        hoadon.TenKhachHang = `Khách hàng ${hoadon.ID_Ve || i + 1}`;
    }
}

// Hàm áp dụng các bộ lọc
function applyFilters() {
    const searchTerm = document.getElementById('searchHoaDon').value.toLowerCase();
    const filterUser = document.getElementById('filterUser').value;
    const filterDate = document.getElementById('filterDate').value;
    
    // Tạo bản sao của dữ liệu để lọc
    const filteredData = [...hoaDonData].filter(hoadon => {
        // Tìm kiếm theo ID hoặc thông tin người dùng hoặc tên khách hàng
        const searchMatch = 
            hoadon.ID_HoaDon.toString().includes(searchTerm) ||
            (hoadon.ID_User && hoadon.ID_User.toString().includes(searchTerm)) ||
            (hoadon.TenKhachHang && hoadon.TenKhachHang.toLowerCase().includes(searchTerm)) ||
            (hoadon.TenNguoiDung && hoadon.TenNguoiDung.toLowerCase().includes(searchTerm));
        
        // Lọc theo người dùng
        const userMatch = !filterUser || (hoadon.ID_User && hoadon.ID_User.toString() === filterUser);
        
        // Lọc theo ngày
        let dateMatch = true;
        if (filterDate) {
            const hoaDonDate = new Date(hoadon.NgayThanhToan).toISOString().split('T')[0];
            dateMatch = hoaDonDate === filterDate;
        }
        
        return searchMatch && userMatch && dateMatch;
    });
    
    // Cập nhật dữ liệu đã lọc
    const paginatedData = filteredData;
    
    // Cập nhật tổng số trang
    totalPages = Math.ceil(paginatedData.length / itemsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('currentPage').textContent = currentPage;
    
    // Kiểm tra nút phân trang
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
    
    // Tính toán dữ liệu cho trang hiện tại
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    // Lưu dữ liệu đã lọc và phân trang
    hoaDonData = filteredData;
}

// Hàm hiển thị dữ liệu hóa đơn
function displayHoaDonData() {
    const tableBody = document.getElementById('hoadonTableBody');
    tableBody.innerHTML = '';
    
    // Tính toán dữ liệu cho trang hiện tại
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = hoaDonData.slice(start, end);
    
    if (paginatedData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Không có dữ liệu</td></tr>`;
        return;
    }
    
    // Tạo hàng cho mỗi hóa đơn
    paginatedData.forEach(hoadon => {
        const row = document.createElement('tr');
        
        // Format ngày thanh toán
        const ngayThanhToan = new Date(hoadon.NgayThanhToan).toLocaleDateString('vi-VN');
        
        // Format tổng tiền
        const tongTien = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hoadon.TongTien);
        
        row.innerHTML = `
            <td><input type="checkbox" class="select-item"></td>
            <td>${hoadon.ID_HoaDon}</td>
            <td>${ngayThanhToan}</td>
            <td>${tongTien}</td>
            <td>${hoadon.TenKhachHang || 'N/A'}</td>
            <td>${hoadon.ID_Admin || 'N/A'}</td>
            <td>${hoadon.ID_User || 'N/A'}</td>
            <td>${hoadon.ID_Ve || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="viewHoaDon(${hoadon.ID_HoaDon})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteHoaDon(${hoadon.ID_HoaDon})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Hàm tải danh sách người dùng cho bộ lọc
async function loadUsers() {
    try {
        const users = await apiCall('/api/users');
        const filterUser = document.getElementById('filterUser');
        
        // Xử lý dữ liệu người dùng
        const userData = Array.isArray(users) ? users : (users.data || []);
        
        // Thêm các tùy chọn người dùng vào select
        userData.forEach(user => {
            const option = document.createElement('option');
            option.value = user.ID_User;
            option.textContent = `${user.ID_User} - ${user.HoTen || user.Email || 'Người dùng'}`;
            filterUser.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi API:', error);
        // Tạo dữ liệu demo cho danh sách người dùng
        const demoUsers = [
            { ID_User: 1, HoTen: 'Người dùng demo 1' },
            { ID_User: 2, HoTen: 'Người dùng demo 2' },
            { ID_User: 3, HoTen: 'Người dùng demo 3' },
            { ID_User: 4, HoTen: 'Người dùng demo 4' },
            { ID_User: 5, HoTen: 'Người dùng demo 5' },
            { ID_User: 6, HoTen: 'Người dùng demo 6' }
        ];
        
        const filterUser = document.getElementById('filterUser');
        demoUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.ID_User;
            option.textContent = `${user.ID_User} - ${user.HoTen}`;
            filterUser.appendChild(option);
        });
    }
}

// Hàm xem chi tiết hóa đơn
async function viewHoaDon(id) {
    try {
        showLoading();
        // Sử dụng apiCall thay vì fetch trực tiếp
        const hoadon = await apiCall(`/api/hoa-don/${id}`);
        
        if (!hoadon) {
            throw new Error('Không tìm thấy thông tin hóa đơn');
        }
        
        // Format ngày thanh toán
        const ngayThanhToan = new Date(hoadon.NgayThanhToan).toLocaleDateString('vi-VN');
        
        // Format tổng tiền
        const tongTien = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(hoadon.TongTien);
        
        // Tạo nội dung chi tiết
        const detailsContent = `
            <div class="details-container">
                <div class="details-group">
                    <strong>ID Hóa đơn:</strong> ${hoadon.ID_HoaDon}
                </div>
                <div class="details-group">
                    <strong>Ngày thanh toán:</strong> ${ngayThanhToan}
                </div>
                <div class="details-group">
                    <strong>Tổng tiền:</strong> ${tongTien}
                </div>
                <div class="details-group">
                    <strong>ID Admin:</strong> ${hoadon.ID_Admin || 'N/A'}
                </div>
                <div class="details-group">
                    <strong>Người dùng:</strong> ${hoadon.TenNguoiDung || 'N/A'} (ID: ${hoadon.ID_User || 'N/A'})
                </div>
                <div class="details-group">
                    <strong>Khách hàng:</strong> ${hoadon.TenKhachHang || 'N/A'}
                </div>
                <div class="details-group">
                    <strong>ID Vé:</strong> ${hoadon.ID_Ve || 'N/A'}
                </div>
            </div>
        `;
        
        // Hiển thị modal
        document.getElementById('hoaDonDetails').innerHTML = detailsContent;
        document.getElementById('viewHoaDonModal').style.display = 'block';
        hideLoading();
    } catch (error) {
        console.error('Lỗi khi xem chi tiết hóa đơn:', error);
        hideLoading();
        
        // Tạo dữ liệu giả cho demo
        const mockHoaDon = {
            ID_HoaDon: id,
            NgayThanhToan: new Date().toISOString(),
            TongTien: id * 1000000,
            ID_Admin: 1,
            ID_User: id,
            ID_Ve: id,
            TenNguoiDung: `Người dùng ${id}`,
            TenKhachHang: `Khách hàng ${id}`
        };
        
        // Format ngày thanh toán
        const ngayThanhToan = new Date(mockHoaDon.NgayThanhToan).toLocaleDateString('vi-VN');
        
        // Format tổng tiền
        const tongTien = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(mockHoaDon.TongTien);
        
        // Tạo nội dung chi tiết
        const detailsContent = `
            <div class="details-container">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> Đang hiển thị dữ liệu demo do không kết nối được đến API
                </div>
                <div class="details-group">
                    <strong>ID Hóa đơn:</strong> ${mockHoaDon.ID_HoaDon}
                </div>
                <div class="details-group">
                    <strong>Ngày thanh toán:</strong> ${ngayThanhToan}
                </div>
                <div class="details-group">
                    <strong>Tổng tiền:</strong> ${tongTien}
                </div>
                <div class="details-group">
                    <strong>ID Admin:</strong> ${mockHoaDon.ID_Admin || 'N/A'}
                </div>
                <div class="details-group">
                    <strong>Người dùng:</strong> ${mockHoaDon.TenNguoiDung || 'N/A'} (ID: ${mockHoaDon.ID_User || 'N/A'})
                </div>
                <div class="details-group">
                    <strong>Khách hàng:</strong> ${mockHoaDon.TenKhachHang || 'N/A'}
                </div>
                <div class="details-group">
                    <strong>ID Vé:</strong> ${mockHoaDon.ID_Ve || 'N/A'}
                </div>
            </div>
        `;
        
        // Hiển thị modal với dữ liệu demo
        document.getElementById('hoaDonDetails').innerHTML = detailsContent;
        document.getElementById('viewHoaDonModal').style.display = 'block';
        showNotification('Đang hiển thị dữ liệu demo do không kết nối được đến API', 'warning');
    }
}

// Hàm xóa hóa đơn
async function deleteHoaDon(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) {
        return;
    }
    
    try {
        showLoading();
        // Sử dụng apiCall thay vì fetch trực tiếp
        await apiCall(`/api/hoa-don/${id}`, 'DELETE');
        
        // Tải lại dữ liệu
        await loadHoaDonData();
        hideLoading();
        showNotification('Xóa hóa đơn thành công', 'success');
    } catch (error) {
        console.error('Lỗi khi xóa hóa đơn:', error);
        hideLoading();
        
        // Giả lập xóa thành công với dữ liệu demo
        hoaDonData = hoaDonData.filter(hoadon => hoadon.ID_HoaDon !== id);
        applyFilters();
        displayHoaDonData();
        showNotification('Đã xóa hóa đơn (chế độ demo)', 'info');
    }
}

// Đóng modal xem chi tiết
function closeViewModal() {
    document.getElementById('viewHoaDonModal').style.display = 'none';
}

// Hàm hiển thị thông báo
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Hiển thị thông báo
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 