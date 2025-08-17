document.addEventListener('DOMContentLoaded', function() {
    const adminForm = document.querySelector('form');
    const saveButton = document.querySelector('.btn-save-admin');

    // Kiểm tra mật khẩu trùng khớp
    function validatePassword() {
        const password = document.querySelector('input[name="password"]').value;
        const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
        return password === confirmPassword;
    }

    // Kiểm tra form hợp lệ
    function validateForm() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('invalid');
            } else {
                field.classList.remove('invalid');
            }
        });

        if (!validatePassword()) {
            isValid = false;
            document.querySelector('input[name="confirmPassword"]').classList.add('invalid');
        }

        return isValid;
    }

    // Xử lý sự kiện submit form
    adminForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            alert('Vui lòng điền đầy đủ thông tin và đảm bảo mật khẩu trùng khớp!');
            return;
        }

        const formData = {
            fullName: document.querySelector('input[name="fullName"]').value,
            email: document.querySelector('input[name="email"]').value,
            phone: document.querySelector('input[name="phone"]').value,
            role: document.querySelector('select[name="role"]').value,
            password: document.querySelector('input[name="password"]').value,
            address: document.querySelector('input[name="address"]').value,
            status: document.querySelector('select[name="status"]').value
        };

        try {
            const response = await fetch('/api/admin/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...addAuthHeader()
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Thêm quản trị viên thành công!');
                window.location.href = '/admins.html';
            } else {
                alert(data.message || 'Có lỗi xảy ra khi thêm quản trị viên!');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Đã có lỗi xảy ra. Vui lòng thử lại sau!');
        }
    });

    // Xử lý sự kiện input để kiểm tra form realtime
    adminForm.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', () => {
            validateForm();
            // Enable/disable nút lưu dựa trên trạng thái form
            saveButton.disabled = !validateForm();
        });
    });
}); 