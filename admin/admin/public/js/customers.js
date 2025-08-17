// Các biến và đối tượng toàn cục
let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
let customers = [];

// Hàm chạy khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực trước khi làm bất cứ điều gì
    if (!checkAuth()) return;
    
    // Tải dữ liệu ban đầu
    loadCustomers();
    
    // Thiết lập các sự kiện
    setupEventListeners();
});

// Thiết lập các sự kiện
function setupEventListeners() {
    // Sự kiện khi thay đổi tìm kiếm
    document.getElementById('searchCustomer').addEventListener('input', function() {
        currentPage = 1;
        loadCustomers();
    });
    
    // Sự kiện khi thay đổi bộ lọc giới tính
    document.getElementById('filterGender').addEventListener('change', function() {
        currentPage = 1;
        loadCustomers();
    });
    
    // Sự kiện nút trang trước
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadCustomers();
        }
    });
    
    // Sự kiện nút trang sau
    document.getElementById('nextPage').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadCustomers();
        }
    });
}

// Tải danh sách khách hàng từ API
async function loadCustomers() {
    try {
        showLoading();
        
        // Lấy các giá trị bộ lọc
        const searchQuery = document.getElementById('searchCustomer').value;
        const genderFilter = document.getElementById('filterGender').value;
        
        // Ghi log giá trị tìm kiếm và lọc
        console.log('Tìm kiếm với:', {searchQuery, genderFilter});
        
        // Xây dựng query string
        let queryParams = `page=${currentPage}&limit=${pageSize}`;
        if (searchQuery) queryParams += `&search=${encodeURIComponent(searchQuery)}`;
        if (genderFilter) queryParams += `&gender=${encodeURIComponent(genderFilter)}`;
        
        // Gọi API
        console.log('Đang tải dữ liệu khách hàng...');
        console.log('Query params:', queryParams);
        const apiUrl = `/api/hanhkhach?${queryParams}`;
        console.log('Đường dẫn API đầy đủ:', `${API_BASE_URL}${apiUrl}`);
        const response = await apiCall(apiUrl);
        console.log('Dữ liệu nhận được:', JSON.stringify(response));
        
        // Kiểm tra cấu trúc dữ liệu chi tiết
        if (Array.isArray(response)) {
            console.log('Dữ liệu là mảng, mẫu item đầu tiên:', response[0]);
            customers = response;
            totalPages = 1;
        } else if (response.data && Array.isArray(response.data)) {
            console.log('Dữ liệu có định dạng {data: []}, mẫu item đầu tiên:', response.data[0]);
            customers = response.data;
            totalPages = response.totalPages || 1;
        } else if (response.recordset && Array.isArray(response.recordset)) {
            console.log('Dữ liệu có định dạng {recordset: []}, mẫu item đầu tiên:', response.recordset[0]);
            customers = response.recordset;
            totalPages = 1;
        } else {
            console.error('Cấu trúc dữ liệu không mong đợi:', response);
            // Kiểm tra xem dữ liệu có phải là object duy nhất
            if (response && typeof response === 'object' && !Array.isArray(response)) {
                console.log('Dữ liệu là một object đơn, thử chuyển thành mảng:', response);
                customers = [response];
                totalPages = 1;
            } else {
                customers = [];
                totalPages = 1;
                showNotification('Định dạng dữ liệu không đúng. Vui lòng kiểm tra server.', 'error');
            }
        }
        
        console.log('Danh sách khách hàng trước khi lọc:', customers.length);
        
        // Xử lý tìm kiếm và lọc phía client nếu cần
        if (searchQuery || genderFilter) {
            const filteredCustomers = filterCustomersLocally(customers, searchQuery, genderFilter);
            console.log('Danh sách khách hàng sau khi lọc:', filteredCustomers.length);
            customers = filteredCustomers;
        }
        
        // Cập nhật UI
        renderCustomers();
        updatePagination();
    } catch (error) {
        console.error('Lỗi khi tải danh sách khách hàng:', error);
        showNotification('Không thể tải danh sách khách hàng. Vui lòng thử lại sau.', 'error');
        
        // Hiển thị một số khách hàng mẫu trong trường hợp lỗi
        customers = mockCustomerData();
        
        console.log('Danh sách khách hàng mẫu:', customers.length);
        
        // Xử lý tìm kiếm và lọc phía client
        const searchQuery = document.getElementById('searchCustomer').value;
        const genderFilter = document.getElementById('filterGender').value;
        if (searchQuery || genderFilter) {
            const filteredCustomers = filterCustomersLocally(customers, searchQuery, genderFilter);
            console.log('Danh sách khách hàng mẫu sau khi lọc:', filteredCustomers.length);
            customers = filteredCustomers;
        }
        
        renderCustomers();
    } finally {
        hideLoading();
    }
}

// Hiển thị danh sách khách hàng
function renderCustomers() {
    const tableBody = document.getElementById('customersTableBody');
    tableBody.innerHTML = '';
    
    if (customers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="10" class="text-center">Không có dữ liệu khách hàng</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        
        // Ghi log để kiểm tra dữ liệu
        console.log('Dữ liệu khách hàng:', customer);
        
        // Đảm bảo tương thích với nhiều cấu trúc dữ liệu khác nhau
        const id = customer.MaKH || customer.maKH || customer.ID_KhachHang || customer.ID_HanhKhach || customer.id_khachhang || customer.id || customer.ID || 'N/A';
        const userId = customer.ID_User || customer.id_user || customer.IdUser || customer.userId || 'N/A';
        const name = customer.TenKH || customer.tenKH || customer.HoTen || customer.hoTen || customer.ten || '-';
        const email = customer.Email || customer.email || '';
        const phone = customer.SDT || customer.sdt || customer.SoDienThoai || customer.soDienThoai || '';
        const birthDate = formatDate(customer.NgaySinh || customer.ngaySinh || customer.DOB);
        const gender = translateGender(customer.GioiTinh || customer.gioiTinh || customer.Gender);
        const address = customer.DiaChi || customer.diaChi || customer.Address || '';
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-select" value="${id}"></td>
            <td>${id}</td>
            <td>${userId}</td>
            <td>${name}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td>${birthDate}</td>
            <td>${gender}</td>
            <td>${address}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewCustomer('${id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Format date để hiển thị
function formatDate(dateString) {
    if (!dateString) return 'Chưa cập nhật';
    
    try {
        const date = new Date(dateString);
        // Kiểm tra nếu là Invalid Date
        if (isNaN(date.getTime())) return 'Chưa cập nhật';
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        console.error('Lỗi khi format ngày:', e);
        return 'Chưa cập nhật';
    }
}

// Cập nhật phân trang
function updatePagination() {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    // Cập nhật trạng thái nút
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// Xem chi tiết khách hàng
async function viewCustomer(customerId) {
    try {
        showLoading();
        
        console.log('Đang xem chi tiết khách hàng ID:', customerId);
        
        // Gọi API để lấy thông tin chi tiết
        const response = await apiCall(`/api/hanhkhach/${customerId}`);
        console.log('Chi tiết khách hàng nhận được:', response);
        let customer;
        
        // Kiểm tra cấu trúc dữ liệu
        if (response && typeof response === 'object') {
            customer = response;
        } else {
            throw new Error('Dữ liệu khách hàng không hợp lệ');
        }
        
        // Đảm bảo tương thích với nhiều cấu trúc dữ liệu khác nhau
        const id = customer.MaKH || customer.maKH || customer.ID_KhachHang || customer.ID_HanhKhach || customer.id_khachhang || customer.id || customer.ID || 'N/A';
        const userId = customer.ID_User || customer.id_user || customer.IdUser || customer.userId || 'N/A';
        const name = customer.TenKH || customer.tenKH || customer.HoTen || customer.hoTen || customer.ten || '-';
        const email = customer.Email || customer.email || 'Chưa cập nhật';
        const phone = customer.SDT || customer.sdt || customer.SoDienThoai || customer.soDienThoai || 'Chưa cập nhật';
        const birthDate = formatDate(customer.NgaySinh || customer.ngaySinh || customer.DOB);
        const gender = translateGender(customer.GioiTinh || customer.gioiTinh || customer.Gender);
        const address = customer.DiaChi || customer.diaChi || customer.Address || 'Chưa cập nhật';
        
        // Hiển thị thông tin trong modal
        const detailsContainer = document.getElementById('customerDetails');
        
        detailsContainer.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${id}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">ID người dùng:</span>
                <span class="detail-value">${userId}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Họ tên:</span>
                <span class="detail-value">${name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${email}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Số điện thoại:</span>
                <span class="detail-value">${phone}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Ngày sinh:</span>
                <span class="detail-value">${birthDate}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Giới tính:</span>
                <span class="detail-value">${gender}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Địa chỉ:</span>
                <span class="detail-value">${address}</span>
            </div>
        `;
        
        // Hiển thị modal
        document.getElementById('viewCustomerModal').style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi tải thông tin chi tiết khách hàng:', error);
        showNotification('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.', 'error');
    } finally {
        hideLoading();
    }
}

// Đóng modal chi tiết
function closeViewModal() {
    document.getElementById('viewCustomerModal').style.display = 'none';
}

// Xóa khách hàng
async function deleteCustomer(customerId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        return;
    }
    
    try {
        showLoading();
        
        console.log('Đang xóa khách hàng ID:', customerId);
        
        // Gọi API để xóa khách hàng
        const response = await apiCall(`/api/hanhkhach/${customerId}`, 'DELETE');
        console.log('Kết quả xóa khách hàng:', response);
        
        // Hiển thị thông báo thành công
        showNotification('Xóa khách hàng thành công', 'success');
        
        // Tải lại danh sách khách hàng
        loadCustomers();
    } catch (error) {
        console.error('Lỗi khi xóa khách hàng:', error);
        showNotification('Không thể xóa khách hàng. Vui lòng thử lại sau.', 'error');
    } finally {
        hideLoading();
    }
}

// Hàm tiện ích - Dịch giới tính
function translateGender(gender) {
    if (!gender) return 'Chưa cập nhật';
    
    switch(gender.toLowerCase()) {
        case 'male':
        case 'nam':
            return 'Nam';
        case 'female':
        case 'nữ':
        case 'nu':
            return 'Nữ';
        default:
            return 'Khác';
    }
}

// Dữ liệu mẫu khách hàng
function mockCustomerData() {
    return [
        { MaKH: 1, ID_User: 1, TenKH: 'Đỗ Văn Phúc', Email: 'user1@gmail.com', SDT: '0956789012', NgaySinh: '1990-05-15', GioiTinh: 'nam', DiaChi: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
        { MaKH: 2, ID_User: 2, TenKH: 'Ngô Thị Giang', Email: 'user2@gmail.com', SDT: '0967890123', NgaySinh: '1985-08-20', GioiTinh: 'nữ', DiaChi: '456 Lê Lợi, Quận 3, TP.HCM' },
        { MaKH: 3, ID_User: 3, TenKH: 'Vũ Văn Hùng', Email: 'user3@gmail.com', SDT: '0978901234', NgaySinh: '1992-03-10', GioiTinh: 'nam', DiaChi: '789 Trần Hưng Đạo, Quận 5, TP.HCM' },
        { MaKH: 4, ID_User: 4, TenKH: 'Đặng Thị Lan', Email: 'user4@gmail.com', SDT: '0989012345', NgaySinh: '1988-11-25', GioiTinh: 'nữ', DiaChi: '101 Nguyễn Du, Quận 1, TP.HCM' },
        { MaKH: 5, ID_User: 5, TenKH: 'Bùi Văn Minh', Email: 'user5@gmail.com', SDT: '0990123456', NgaySinh: '1995-07-30', GioiTinh: 'nam', DiaChi: '202 Võ Văn Tần, Quận 3, TP.HCM' }
    ];
}

// Hàm lọc khách hàng phía client
function filterCustomersLocally(customersArray, searchQuery, genderFilter) {
    console.log('Lọc khách hàng phía client:', {searchQuery, genderFilter});
    
    if (!searchQuery && !genderFilter) {
        return customersArray;
    }
    
    return customersArray.filter(customer => {
        // Lấy dữ liệu khách hàng từ nhiều trường hợp
        const name = customer.TenKH || customer.tenKH || customer.HoTen || customer.hoTen || customer.ten || '';
        const gender = (customer.GioiTinh || customer.gioiTinh || customer.Gender || '').toLowerCase();
        
        // In ra để debug
        console.log(`Đang so sánh: '${name}' với '${searchQuery}'`);
        
        // Kiểm tra điều kiện tìm kiếm theo tên - sửa lỗi tìm kiếm
        let nameMatch = true;
        if (searchQuery && searchQuery.trim() !== '') {
            // Chuẩn hóa chuỗi tìm kiếm - loại bỏ dấu cách thừa
            const normalizedName = name.toLowerCase().trim();
            const normalizedSearch = searchQuery.toLowerCase().trim();
            
            // Sử dụng phương pháp indexOf thay vì includes
            nameMatch = normalizedName.indexOf(normalizedSearch) !== -1;
            
            // Log chi tiết
            console.log(`So sánh '${normalizedName}' có chứa '${normalizedSearch}': ${nameMatch}`);
            
            // Kiểm tra so sánh từng từ trong tên
            if (!nameMatch) {
                const nameParts = normalizedName.split(' ');
                for (const part of nameParts) {
                    if (part === normalizedSearch || part.startsWith(normalizedSearch)) {
                        nameMatch = true;
                        console.log(`Tìm thấy từ '${part}' khớp với '${normalizedSearch}'`);
                        break;
                    }
                }
            }
        }
        
        // Kiểm tra điều kiện lọc theo giới tính
        let genderMatch = true;
        if (genderFilter) {
            if (genderFilter === 'male') {
                genderMatch = gender === 'nam' || gender === 'male';
            } else if (genderFilter === 'female') {
                genderMatch = gender === 'nữ' || gender === 'nu' || gender === 'female';
            } else if (genderFilter === 'other') {
                genderMatch = gender !== 'nam' && gender !== 'male' && 
                             gender !== 'nữ' && gender !== 'nu' && gender !== 'female';
            }
        }
        
        // Trả về true nếu thỏa mãn cả hai điều kiện
        const result = nameMatch && genderMatch;
        console.log(`Kết quả lọc cuối cùng cho ${name}: ${result}`);
        return result;
    });
} 