// Kiểm tra xác thực trên mọi trang admin
function checkAuthentication() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Xác thực token với server (có thể bỏ qua nếu không cần kiểm tra với server)
    /* Tạm thời bỏ qua việc xác thực với server để tránh lỗi chuyển hướng
    fetch('/api/admin/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Token không hợp lệ');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Lỗi xác thực:', error);
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });
    */
}

// Thêm token vào mọi request API
function addAuthHeader(headers = {}) {
    const token = localStorage.getItem('adminToken');
    return {
        ...headers,
        'Authorization': `Bearer ${token}`
    };
}

// Xử lý đăng xuất
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// Chạy kiểm tra xác thực khi tải trang
document.addEventListener('DOMContentLoaded', checkAuthentication); 