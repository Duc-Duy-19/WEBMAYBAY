// Các biến và đối tượng toàn cục
let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
let users = [];

// Hàm chạy khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (!checkAuth()) return;
    
    // Xóa dữ liệu mẫu để đảm bảo lấy từ API
    localStorage.removeItem('mockUsers');
    
    // Lấy dữ liệu người dùng
    fetchUsers();
    
    // Khởi tạo tìm kiếm
    setupSearch();
    
    // Khởi tạo nút thêm mới
    document.querySelector('#addUser').addEventListener('click', function() {
        window.location.href = 'user-create.html';
    });
});

// Hàm lấy dữ liệu người dùng
async function fetchUsers() {
    try {
        showLoading();
        
        console.log('Đang tải dữ liệu người dùng từ API...');
        const response = await apiCall('/api/users');
        console.log('Dữ liệu nhận được từ API:', response);
        
        // Với API thực tế, dữ liệu có thể trả về trực tiếp hoặc trong thuộc tính data
        let userData = response;
        if (response && response.data) {
            userData = response.data;
        } else if (Array.isArray(response)) {
            userData = response;
        } else if (response && response.recordset) {
            userData = response.recordset;
        }
        
        if (userData && userData.length > 0) {
            console.log('Số lượng người dùng:', userData.length);
            updateUsersTable(userData);
            document.getElementById('userCount').textContent = userData.length;
        } else {
            console.log('Không có dữ liệu người dùng từ API');
            updateUsersTable([]);
            document.getElementById('userCount').textContent = 0;
            showNotification('Không có dữ liệu người dùng', 'warning');
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
        showNotification(`Lỗi kết nối API: ${error.message}`, 'error');
        updateUsersTable([]);
        document.getElementById('userCount').textContent = 0;
    } finally {
        hideLoading();
    }
}

// Hàm cập nhật bảng người dùng
function updateUsersTable(users) {
    const tableBody = document.querySelector('#usersTable tbody');
    
    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';
    
    if (!users || users.length === 0) {
        // Hiển thị thông báo nếu không có dữ liệu
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="text-center">Không có người dùng nào</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Thêm dữ liệu mới
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Kiểm tra trường dữ liệu - hỗ trợ cả viết hoa và viết thường
        const id = user.ID_User || user.id_User || user.id;
        const email = user.Email || user.email || '';
        const hoTen = user.HoTen || user.hoTen || '';
        const matKhau = user.MatKhau || user.matKhau || '';
        const sdt = user.SDT || user.sdt || '';
        
        row.innerHTML = `
            <td><input type="checkbox" class="row-select"></td>
            <td>${id}</td>
            <td>${email}</td>
            <td>${hoTen || '-'}</td>
            <td>${matKhau || '-'}</td>
            <td>${sdt || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewUser(${id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteUser(${id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Thiết lập chức năng tìm kiếm
function setupSearch() {
    const searchInput = document.querySelector('#searchInput');
    const searchNameCb = document.querySelector('#searchName');
    const searchEmailCb = document.querySelector('#searchEmail');
    const searchPhoneCb = document.querySelector('#searchPhone');
    
    if (!searchInput) {
        console.error('Không tìm thấy #searchInput');
        return;
    }
    
    // Lưu trữ danh sách tất cả người dùng để tìm kiếm phía client
    let allUsers = [];
    
    // Tải danh sách người dùng ban đầu
    apiCall('/api/users')
        .then(response => {
            // Với API thực tế, dữ liệu có thể trả về trực tiếp hoặc trong thuộc tính data
            if (response && response.data) {
                allUsers = response.data;
            } else if (Array.isArray(response)) {
                allUsers = response;
            } else if (response && response.recordset) {
                allUsers = response.recordset;
            }
            console.log('Đã tải danh sách người dùng cho tìm kiếm:', allUsers.length);
        })
        .catch(error => {
            console.error('Không thể lấy danh sách người dùng cho tìm kiếm:', error);
        });
    
    // Hàm thực hiện tìm kiếm
    const performSearch = async () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const searchInName = searchNameCb.checked;
        const searchInEmail = searchEmailCb.checked;
        const searchInPhone = searchPhoneCb.checked;
        
        if (!searchTerm) {
            // Nếu ô tìm kiếm trống, hiển thị toàn bộ danh sách
            try {
                const response = await apiCall('/api/users');
                let userData = [];
                
                if (response && response.data) {
                    userData = response.data;
                } else if (Array.isArray(response)) {
                    userData = response;
                } else if (response && response.recordset) {
                    userData = response.recordset;
                }
                
                updateUsersTable(userData);
                document.getElementById('userCount').textContent = userData.length;
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu người dùng:', error);
                showNotification('Lỗi khi tải dữ liệu người dùng', 'error');
            }
            return;
        }
        
        try {
            showLoading();
            
            let userData = [];
            
            // Thử tìm kiếm qua API trước
            try {
                const response = await apiCall(`/api/users?search=${searchTerm}`);
                
                // Xử lý dữ liệu từ API
                if (response && response.data) {
                    userData = response.data;
                } else if (Array.isArray(response)) {
                    userData = response;
                } else if (response && response.recordset) {
                    userData = response.recordset;
                }
                
                // Luôn lọc kết quả tại client để đảm bảo tìm đúng
                // vì API có thể trả về tất cả kết quả không lọc
                userData = searchClientsideUsers(searchTerm, userData, searchInName, searchInEmail, searchInPhone);
                
            } catch (apiError) {
                console.warn('Không thể tìm kiếm qua API, chuyển sang tìm kiếm phía client:', apiError);
                userData = searchClientsideUsers(searchTerm, allUsers, searchInName, searchInEmail, searchInPhone);
            }
            
            // Hiển thị kết quả tìm kiếm
            updateUsersTable(userData);
            document.getElementById('userCount').textContent = userData.length;
            
            if (userData.length === 0) {
                showNotification('Không tìm thấy kết quả nào phù hợp', 'warning');
            } else {
                console.log(`Tìm thấy ${userData.length} người dùng phù hợp`);
                
                // Hiển thị thông báo tìm kiếm
                const searchOptions = [];
                if (searchInName) searchOptions.push('tên');
                if (searchInEmail) searchOptions.push('email');
                if (searchInPhone) searchOptions.push('số điện thoại');
                
                const searchMsg = `Tìm thấy ${userData.length} người dùng có ${searchOptions.join('/')} chứa "${searchTerm}"`;
                showNotification(searchMsg, 'success');
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
            showNotification(`Lỗi khi tìm kiếm: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    };
    
    // Sử dụng timeout để không tìm kiếm ngay lập tức khi người dùng gõ
    let searchTimeout;
    
    // Xử lý sự kiện khi nhập vào ô tìm kiếm
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 500); // Chờ 500ms sau khi người dùng không gõ
    });
    
    // Xử lý sự kiện khi nhấn Enter trong ô tìm kiếm
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            clearTimeout(searchTimeout);
            performSearch();
        }
    });
    
    // Xử lý sự kiện khi thay đổi các ô checkbox
    [searchNameCb, searchEmailCb, searchPhoneCb].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', performSearch);
        }
    });
}

// Hàm thực hiện tìm kiếm phía client
function searchClientsideUsers(searchTerm, users, searchInName = true, searchInEmail = true, searchInPhone = true) {
    if (!searchTerm) return users;
    
    console.log(`Tìm kiếm phía client với từ khóa: "${searchTerm}", tùy chọn: tên=${searchInName}, email=${searchInEmail}, sđt=${searchInPhone}`);
    
    return users.filter(user => {
        // Lấy tất cả dữ liệu người dùng, hỗ trợ cả viết hoa và viết thường
        const email = (user.Email || user.email || '').toLowerCase();
        const hoTen = (user.HoTen || user.hoTen || '').toLowerCase();
        const sdt = (user.SDT || user.sdt || '').toLowerCase();
        
        // Kiểm tra theo tùy chọn đã chọn
        const matchEmail = searchInEmail && email.includes(searchTerm);
        const matchName = searchInName && hoTen.includes(searchTerm);
        const matchPhone = searchInPhone && sdt.includes(searchTerm);
        
        return matchEmail || matchName || matchPhone;
    });
}

// Xem chi tiết người dùng
function viewUser(userId) {
    console.log('Xem chi tiết người dùng:', userId);
    
    // Gọi API để lấy thông tin chi tiết
    apiCall(`/api/users/${userId}`)
        .then(user => {
            if (user) {
                // Kiểm tra trường dữ liệu - hỗ trợ cả viết hoa và viết thường
                const id = user.ID_User || user.id_User || user.id;
                const email = user.Email || user.email || '';
                const hoTen = user.HoTen || user.hoTen || '';
                const matKhau = user.MatKhau || user.matKhau || '';
                const sdt = user.SDT || user.sdt || '';
                
                let content = `
                    <div class="user-details">
                        <div class="detail-item">
                            <strong>ID:</strong> ${id}
                        </div>
                        <div class="detail-item">
                            <strong>Email:</strong> ${email || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Họ tên:</strong> ${hoTen || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Mật khẩu:</strong> ${matKhau || '-'}
                        </div>
                        <div class="detail-item">
                            <strong>Số điện thoại:</strong> ${sdt || '-'}
                        </div>
                    </div>
                `;
                
                showDetailsModal('Chi tiết người dùng', content);
            } else {
                showNotification('Không tìm thấy thông tin người dùng', 'error');
            }
        })
        .catch(error => {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            showNotification('Lỗi khi lấy thông tin người dùng', 'error');
        });
}

// Xóa người dùng
function deleteUser(userId) {
    console.log('Xóa người dùng:', userId);
    
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
        try {
            showLoading();
            
            // Gọi API để xóa
            apiCall(`/api/users/${userId}`, 'DELETE')
                .then(response => {
                    showNotification('Xóa người dùng thành công');
                    fetchUsers(); // Tải lại dữ liệu
                })
                .catch(error => {
                    console.error('Lỗi khi xóa người dùng:', error);
                    showNotification(`Lỗi khi xóa người dùng: ${error.message}`, 'error');
                })
                .finally(() => {
                    hideLoading();
                });
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            showNotification('Lỗi khi gọi API xóa người dùng', 'error');
            hideLoading();
        }
    }
}

// Dữ liệu mẫu người dùng - không còn sử dụng nhưng giữ lại để tham khảo
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

// Đóng modal chi tiết
function closeViewModal() {
    const modal = document.getElementById('viewUserModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type || 'success'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hiển thị modal chi tiết
function showDetailsModal(title, content) {
    // Sử dụng modal có sẵn nếu có
    const existingModal = document.getElementById('viewUserModal');
    
    if (existingModal) {
        document.getElementById('userDetails').innerHTML = content;
        existingModal.style.display = 'block';
        return;
    }
    
    // Nếu không có modal có sẵn, tạo mới
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Đóng</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Hiển thị loading
function showLoading() {
    // Kiểm tra xem đã có loading overlay chưa
    if (document.querySelector('.loading-overlay')) return;
    
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