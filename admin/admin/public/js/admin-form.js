// Admin Form JavaScript

// Handle admin form submission
document.getElementById('adminForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('adminName').value,
        email: document.getElementById('adminEmail').value,
        phone: document.getElementById('adminPhone').value,
        role: document.getElementById('adminRole').value,
        password: document.getElementById('adminPassword').value,
        confirmPassword: document.getElementById('adminConfirmPassword').value,
        address: document.getElementById('adminAddress').value,
        status: document.getElementById('adminStatus').value
    };
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    // Remove confirmPassword before sending to API
    delete formData.confirmPassword;
    
    try {
        // Check if we're editing (URL contains ID) or creating new
        const urlParams = new URLSearchParams(window.location.search);
        const adminId = urlParams.get('id');
        
        if (adminId) {
            // Update existing admin
            await apiCall(`/admins/${adminId}`, 'PUT', formData);
            showNotification('Admin updated successfully');
        } else {
            // Create new admin
            await apiCall('/admins', 'POST', formData);
            showNotification('Admin created successfully');
        }
        
        // Redirect to admins list
        setTimeout(() => {
            window.location.href = 'admins.html';
        }, 1000);
        
    } catch (error) {
        showNotification('Error saving admin: ' + error.message, 'error');
    }
});

// Load admin data if editing
async function loadAdminData() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminId = urlParams.get('id');
    
    if (adminId) {
        try {
            const admin = await apiCall(`/admins/${adminId}`);
            
            // Populate form fields
            document.getElementById('adminName').value = admin.name || '';
            document.getElementById('adminEmail').value = admin.email || '';
            document.getElementById('adminPhone').value = admin.phone || '';
            document.getElementById('adminRole').value = admin.role || '';
            document.getElementById('adminAddress').value = admin.address || '';
            document.getElementById('adminStatus').value = admin.status || 'active';
            
            // Update page title
            document.querySelector('.page-title').textContent = 'Edit Admin';
            document.querySelector('.page-header h2').textContent = 'Edit Administrator';
            
            // Make password fields optional for editing
            document.getElementById('adminPassword').removeAttribute('required');
            document.getElementById('adminConfirmPassword').removeAttribute('required');
            
        } catch (error) {
            showNotification('Error loading admin data', 'error');
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadAdminData();
});