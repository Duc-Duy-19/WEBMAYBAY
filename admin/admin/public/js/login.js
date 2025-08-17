// Login handling
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/admins/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ taiKhoan: username, matKhau: password })
        });
        
        if (!response.ok) {
            throw new Error('Đăng nhập thất bại');
        }
        
        const data = await response.json();
        
        // Lưu token vào localStorage
        localStorage.setItem('authToken', data.token);
        
        // Chuyển hướng đến trang chủ
        window.location.href = 'index.html';
        
    } catch (error) {
        // Hiển thị lỗi
        document.getElementById('errorMessage').textContent = 
            error.message || 'Lỗi không xác định: Server không trả về JSON. Vui lòng kiểm tra API endpoint.';
    }
}); 