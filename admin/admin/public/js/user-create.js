// Hàm chạy khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực
    if (!checkAuth()) return;
    
    // Thiết lập form submit
    setupForm();
    
    // Xóa dữ liệu mẫu trong localStorage
    localStorage.removeItem('mockUsers');
    console.log('Đã xóa dữ liệu mẫu từ localStorage');
});

// Thiết lập form
function setupForm() {
    const form = document.getElementById('createUserForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            showLoading();
            
            // Lấy dữ liệu từ form - sử dụng tên trường viết thường để khớp với API backend
            const userData = {
                email: document.getElementById('email').value.trim(),
                hoTen: document.getElementById('hoTen').value.trim(),
                matKhau: document.getElementById('matKhau').value.trim(),
                sdt: document.getElementById('sdt').value.trim()
            };
            
            // Validate dữ liệu
            if (!userData.email || !userData.matKhau) {
                showNotification('Email và mật khẩu không được để trống', 'error');
                hideLoading();
                return;
            }
            
            console.log('Dữ liệu người dùng mới sẽ gửi đến API:', userData);
            
            // Gọi API để tạo người dùng mới - sử dụng endpoint /api/users/register đúng với router
            try {
                // Tạo config cho fetch API
                const config = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('adminToken') ? `Bearer ${localStorage.getItem('adminToken')}` : ''
                    },
                    body: JSON.stringify(userData)
                };
                
                console.log(`Đang gọi API: ${API_BASE_URL}/api/users/register`, config);
                
                // Gọi API trực tiếp
                const response = await fetch(`${API_BASE_URL}/api/users/register`, config);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Lỗi API ${response.status}:`, errorText);
                    throw new Error(`API trả về lỗi ${response.status}: ${errorText || response.statusText}`);
                }
                
                const result = await response.json();
                console.log('Kết quả tạo người dùng từ API:', result);
                
                // Hiển thị thông báo thành công
                showNotification('Thêm người dùng mới thành công!');
                
                // Chuyển hướng về trang danh sách người dùng sau 1 giây
                setTimeout(function() {
                    window.location.href = 'users.html';
                }, 1000);
            } catch (apiError) {
                console.error('Lỗi khi gọi API thêm người dùng:', apiError);
                
                const errorMsg = apiError.message.toLowerCase();
                const userData = {
                    email: document.getElementById('email').value.trim().toLowerCase()
                };
                
                // Kiểm tra các loại lỗi cụ thể
                if (errorMsg.includes('409') || 
                    errorMsg.includes('a9d105349f44cf62') || // Mã constraint của email
                    (errorMsg.includes('duplicate') && errorMsg.includes('email')) ||
                    (errorMsg.includes('unique key') && errorMsg.includes('@')) ||
                    (errorMsg.includes('unique key') && errorMsg.includes(userData.email))) {
                    showNotification('Email đã tồn tại trong hệ thống', 'error');
                } else if (errorMsg.includes('unique key') && 
                          (errorMsg.includes('ca1930a5c9872913') || // Mã constraint của số điện thoại
                           errorMsg.includes('sdt'))) {
                    showNotification('Số điện thoại đã được sử dụng trong hệ thống', 'error');
                } else {
                    showNotification(`Lỗi khi thêm người dùng: ${apiError.message}`, 'error');
                }
            }
        } catch (error) {
            console.error('Lỗi tổng quát:', error);
            showNotification(`Lỗi: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    });
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hiển thị loading
function showLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
    `;
    document.body.appendChild(loadingOverlay);
}

// Ẩn loading
function hideLoading() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Xử lý khi API không kết nối được
async function handleMockCreateUser(userData) {
    // Mô phỏng việc tạo người dùng mới
    console.log('Mô phỏng tạo người dùng mới:', userData);
    
    // Lấy danh sách người dùng từ localStorage
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers')) || mockUserData();
    
    // Kiểm tra xem email đã tồn tại chưa
    const isDuplicate = mockUsers.some(user => user.Email.toLowerCase() === userData.Email.toLowerCase());
    
    if (isDuplicate) {
        throw new Error('Email đã tồn tại trong hệ thống.');
    }
    
    // Tạo ID mới
    const newId = mockUsers.length > 0 ? Math.max(...mockUsers.map(user => user.ID_User)) + 1 : 1;
    
    // Tạo người dùng mới
    const newUser = {
        ID_User: newId,
        Email: userData.Email,
        HoTen: userData.HoTen,
        MatKhau: userData.MatKhau,
        SDT: userData.SDT,
        ThoiGianTao: new Date().toISOString()
    };
    
    // Thêm vào danh sách
    mockUsers.push(newUser);
    
    // Lưu vào localStorage
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    console.log('Đã lưu người dùng mới vào localStorage:', newUser);
    
    return newUser;
}

// Dữ liệu mẫu người dùng
function mockUserData() {
    return [
        { ID_User: 1, Email: 'user1@gmail.com', HoTen: 'Đỗ Văn Phúc', MatKhau: '123', SDT: '0956789012' },
        { ID_User: 2, Email: 'user2@gmail.com', HoTen: 'Ngô Thị Giang', MatKhau: '1234', SDT: '0967890123' },
        { ID_User: 3, Email: 'user3@gmail.com', HoTen: 'Vũ Văn Hùng', MatKhau: '12345', SDT: '0978901234' },
        { ID_User: 4, Email: 'user4@gmail.com', HoTen: 'Đặng Thị Lan', MatKhau: '123456', SDT: '0989012345' },
        { ID_User: 5, Email: 'user5@gmail.com', HoTen: 'Bùi Văn Minh', MatKhau: '1234567', SDT: '0990123456' },
        { ID_User: 6, Email: 'user6@gmail.com', HoTen: 'Lê Toàn Thắng', MatKhau: '123', SDT: '0816242664' }
    ];
} 