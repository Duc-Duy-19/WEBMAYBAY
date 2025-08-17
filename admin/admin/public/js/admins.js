// Trang quản lý tổng quan người dùng đã được cập nhật
// Không còn chức năng quản lý admin

document.addEventListener('DOMContentLoaded', function() {
    checkAuth(); // Kiểm tra xác thực từ auth.js
    
    // Hiệu ứng sidebar
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
});

// Hàm toggle sidebar (nếu chưa được định nghĩa trong main.js)
function toggleSidebar() {
    document.querySelector('.admin-container').classList.toggle('sidebar-collapsed');
}

// Hàm đăng xuất (nếu chưa được định nghĩa trong auth.js)
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
} 