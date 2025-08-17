// Định nghĩa API URL
const API_URL = 'http://localhost:3000';

// Aircraft Management JavaScript
let currentPage = 1;
let totalPages = 1;
let aircraftData = [];
let filteredData = [];
let airlines = [];

// Document ready function to initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xác thực
    if (!checkAuth()) return;
    
    // Tải dữ liệu
    loadAircraft();
    
    // Khởi tạo event listeners
    initializeEventListeners();
    
    // Khởi tạo modal Bootstrap
    const aircraftModal = document.getElementById('aircraftModal');
    if (aircraftModal) {
        try {
            const bsModal = new bootstrap.Modal(aircraftModal);
            
            // Lưu tham chiếu modal để sử dụng sau này
            window.aircraftBsModal = bsModal;
            console.log('Đã khởi tạo Bootstrap modal thành công');
        } catch (error) {
            console.error('Lỗi khi khởi tạo Bootstrap modal:', error);
        }
    } else {
        console.error('Không tìm thấy element aircraftModal');
    }
});

// Load aircraft data
async function loadAircraft() {
    try {
        console.log('Đang tải dữ liệu máy bay...'); // Debug log
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
            // Tạo token demo
            localStorage.setItem('adminToken', 'demo_token');
        }
        
        // Thử gọi API
        try {
            const response = await fetch(`${API_URL}/api/may-bay?page=${currentPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Không thể tải dữ liệu máy bay');
            
            const result = await response.json();
            console.log('Dữ liệu máy bay đã tải:', result); // Debug log
            
            aircraftData = Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            
            // Nếu không thể kết nối API, sử dụng dữ liệu demo
            console.log('Đang sử dụng dữ liệu demo...');
            aircraftData = createDemoAircraftData();
            showNotification('Đang sử dụng dữ liệu demo do không kết nối được API', 'warning');
        }
        
        filteredData = [...aircraftData];
        
        // Render and update UI
        renderAircraftTable();
        updatePagination();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu máy bay:', error);
        
        // Nếu có lỗi khác, sử dụng dữ liệu demo
        aircraftData = createDemoAircraftData();
        filteredData = [...aircraftData];
        renderAircraftTable();
        updatePagination();
        
        showNotification('Đang sử dụng dữ liệu demo', 'warning');
    }
}

// Load airlines for dropdown
async function loadAirlines() {
    try {
        airlines = await apiCall('/airlines');
        
        // Populate airline filter
        const filterSelect = document.getElementById('filterAirline');
        filterSelect.innerHTML = '<option value="">All Airlines</option>';
        airlines.forEach(airline => {
            filterSelect.innerHTML += `<option value="${airline.id}">${airline.name}</option>`;
        });
        
        // Populate airline select in form
        const airlineSelect = document.getElementById('airlineId');
        airlineSelect.innerHTML = '<option value="">-- Select Airline --</option>';
        airlines.forEach(airline => {
            airlineSelect.innerHTML += `<option value="${airline.id}">${airline.name} (${airline.code})</option>`;
        });
    } catch (error) {
        console.error('Error loading airlines:', error);
    }
}

// Hàm để chuẩn hóa trạng thái máy bay
function normalizeAircraftStatus(status) {
    if (!status || status === 'N/A' || status.trim() === '') {
        return 'Sẵn sàng';
    }
    
    const statusLower = status.toLowerCase().trim();
    
    // Log để debug
    console.log('Đang chuẩn hóa trạng thái:', status, 'thành dạng lowercase:', statusLower);
    
    if (statusLower.includes('sẵn sàng') || (statusLower.includes('hoạt động') && !statusLower.includes('không'))) {
        return 'Sẵn sàng';
    } else if (statusLower.includes('bảo trì')) {
        return 'Bảo trì';
    } else if (statusLower.includes('không hoạt động') || statusLower === 'không') {
        return 'Không hoạt động';
    }
    
    return 'Sẵn sàng'; // Mặc định
}

// Render aircraft table
function renderAircraftTable() {
    const tbody = document.getElementById('aircraftTableBody');
    if (!tbody) {
        console.error('Không tìm thấy element aircraftTableBody');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không tìm thấy máy bay</td></tr>';
        return;
    }
    
    filteredData.forEach(aircraft => {
        // Lấy tình trạng từ cả hai trường có thể có
        let TinhTrang = aircraft.TinhTrang || aircraft.TinhTrang;
        
        // Chuẩn hóa trạng thái
        TinhTrang = normalizeAircraftStatus(TinhTrang);
        
        // Debug log
        console.log(`Máy bay ${aircraft.ID_MayBay} (${aircraft.LoaiMayBay}): trạng thái đã chuẩn hóa = ${TinhTrang}`);
        
        // Xác định CSS class dựa trên trạng thái
        let statusClass = '';
        switch(TinhTrang.toLowerCase()) {
            case 'sẵn sàng':
                statusClass = 'status-active';
                break;
            case 'bảo trì':
                statusClass = 'status-maintenance';
                break;
            case 'không hoạt động':
                statusClass = 'status-inactive';
                break;
            default:
                statusClass = 'status-active';
                TinhTrang = 'Sẵn sàng';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="row-select" value="${aircraft.ID_MayBay}"></td>
            <td>${aircraft.ID_MayBay}</td>
            <td>${aircraft.LoaiMayBay || 'N/A'}</td>
            <td>${aircraft.SoLuongGhe || 'N/A'}</td>
            <td>${aircraft.HangSanXuat || 'N/A'}</td>
            <td><span class="status-badge ${statusClass}">${TinhTrang}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-info" onclick="editAircraft(${aircraft.ID_MayBay})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAircraft(${aircraft.ID_MayBay})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Search and filter functionality
function applyFilters() {
    const searchTerm = document.getElementById('searchAircraft')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    
    filteredData = aircraftData.filter(aircraft => {
        const matchesSearch = 
            aircraft.LoaiMayBay.toLowerCase().includes(searchTerm) ||
            aircraft.HangSanXuat.toLowerCase().includes(searchTerm);
            
        const matchesStatus = !statusFilter || 
            normalizeAircraftStatus(aircraft.TinhTrang || aircraft.TinhTrang) === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderAircraftTable();
}

// Initialize event listeners
function initializeEventListeners() {
    const searchInput = document.getElementById('searchAircraft');
    const statusFilter = document.getElementById('filterStatus');
    
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Đảm bảo modal được khởi tạo đúng
    const modal = document.getElementById('aircraftModal');
    if (modal) {
        const closeButtons = modal.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', closeAircraftModal);
        });
    }
    
    // Khởi tạo dropdown trạng thái nếu chưa có
    initStatusDropdown();
}

// Khởi tạo dropdown trạng thái trong form
function initStatusDropdown() {
    const statusDropdown = document.getElementById('TinhTrang');
    if (!statusDropdown) {
        console.error('Không tìm thấy dropdown trạng thái');
        return;
    }
    
    // Xóa các option hiện có
    statusDropdown.innerHTML = '';
    
    // Thêm các option mới
    const statusOptions = [
        { value: 'Sẵn sàng', text: 'Sẵn sàng' },
        { value: 'Bảo trì', text: 'Đang bảo trì' },
        { value: 'Không hoạt động', text: 'Không hoạt động' }
    ];
    
    statusOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        statusDropdown.appendChild(optionElement);
    });
    
    console.log('Đã khởi tạo dropdown trạng thái với các giá trị:', statusOptions.map(o => o.value).join(', '));
}

// Update pagination
function updatePagination() {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Pagination handlers
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadAircraft();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadAircraft();
    }
});

// Open Add Aircraft Modal
function openAddAircraftModal() {
    document.getElementById('modalTitle').textContent = 'Thêm máy bay mới';
    
    // Reset form
    const form = document.getElementById('aircraftForm');
    if (form) {
        form.reset();
        
        // Đặt giá trị ID thành rỗng để đánh dấu là thêm mới
        const idField = document.getElementById('aircraftId');
        if (idField) idField.value = '';
        
        // Đảm bảo dropdown trạng thái được khởi tạo
        initStatusDropdown();
        
        // Đặt giá trị mặc định là "Sẵn sàng"
        const statusSelect = document.getElementById('TinhTrang');
        if (statusSelect) {
            const options = statusSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value.toLowerCase().includes('sẵn sàng') || 
                    options[i].value.toLowerCase().includes('hoạt động') && 
                    !options[i].value.toLowerCase().includes('không')) {
                    statusSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Thêm kiểm tra trạng thái format
        console.log('Modal mở với trạng thái ban đầu:', statusSelect ? statusSelect.value : 'không có trường trạng thái');
    } else {
        console.error('Không tìm thấy form máy bay');
    }
    
    // Hiển thị modal bằng Bootstrap
    const modalElement = document.getElementById('aircraftModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Đặt focus vào trường đầu tiên
        const firstField = document.getElementById('loaiMayBay');
        if (firstField) setTimeout(() => firstField.focus(), 100);
        
        // Thêm log kiểm tra
        console.log('Đã mở modal thêm máy bay mới với Bootstrap, reset form thành công');
    } else {
        console.error('Không tìm thấy modal máy bay');
    }
}

// Close Aircraft Modal
function closeAircraftModal() {
    // Đóng modal bằng Bootstrap
    const modalElement = document.getElementById('aircraftModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
            console.log('Đã đóng modal máy bay bằng Bootstrap');
        } else {
            console.warn('Không tìm thấy instance Bootstrap Modal, thử đóng theo cách thông thường');
            modalElement.style.display = 'none';
        }
    } else {
        console.error('Không tìm thấy modal máy bay khi đóng');
    }
}

// Thêm sự kiện để tự động reset form khi modal mở
document.addEventListener('DOMContentLoaded', function() {
    const aircraftModal = document.getElementById('aircraftModal');
    if (aircraftModal) {
        aircraftModal.addEventListener('show.bs.modal', function (event) {
            // Kiểm tra nếu modal được mở từ nút "Thêm máy bay mới"
            const button = event.relatedTarget;
            if (button && button.classList.contains('btn-primary') && !button.classList.contains('btn-info')) {
                // Đây là trường hợp thêm mới
                document.getElementById('modalTitle').textContent = 'Thêm máy bay mới';
                document.getElementById('aircraftForm').reset();
                document.getElementById('aircraftId').value = '';
                
                // Đảm bảo dropdown trạng thái được khởi tạo
                initStatusDropdown();
                
                // Đặt giá trị mặc định
                const statusSelect = document.getElementById('TinhTrang');
                if (statusSelect && statusSelect.options.length > 0) {
                    statusSelect.selectedIndex = 0; // Chọn option đầu tiên (Sẵn sàng)
                }
                
                console.log('Modal Bootstrap mở để thêm máy bay mới');
            }
            // Không làm gì nếu là chỉnh sửa, vì hàm editAircraft đã thiết lập tiêu đề và dữ liệu
        });
    }
});

// Save aircraft
document.getElementById('aircraftForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const aircraftId = document.getElementById('aircraftId').value;
    
    // Lấy giá trị từ form
    const loaiMayBay = document.getElementById('loaiMayBay').value;
    const soLuongGhe = parseInt(document.getElementById('soLuongGhe').value);
    const hangSanXuat = document.getElementById('hangSanXuat').value;
    const TinhTrang = document.getElementById('TinhTrang').value;
    
    // Log để debug
    console.log('Dữ liệu form:', {
        loaiMayBay,
        soLuongGhe,
        hangSanXuat,
        TinhTrang
    });
    
    // Kiểm tra dữ liệu
    if (!loaiMayBay || soLuongGhe <= 0 || !hangSanXuat || !TinhTrang) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    // Chuẩn hóa trạng thái
    const normalizedStatus = normalizeAircraftStatus(TinhTrang);
    console.log('Trạng thái sau khi chuẩn hóa:', normalizedStatus);
    
    const formData = {
        loaiMayBay,
        soLuongGhe,
        hangSanXuat,
        TinhTrang: normalizedStatus
    };
    
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
        }
        
        if (aircraftId) {
            // Update existing aircraft
            try {
                const response = await fetch(`${API_URL}/api/may-bay/${aircraftId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error response:', errorText);
                    throw new Error('Lỗi khi cập nhật máy bay: ' + errorText);
                }
                
                // Thử đọc phản hồi JSON
                let updatedAircraft;
                try {
                    updatedAircraft = await response.json();
                    console.log('Phản hồi API cập nhật:', updatedAircraft);
                } catch (jsonError) {
                    console.warn('Không thể parse phản hồi JSON:', jsonError);
                }
                
                // Cập nhật dữ liệu local
                const index = aircraftData.findIndex(a => a.ID_MayBay.toString() === aircraftId.toString());
                if (index !== -1) {
                    aircraftData[index] = {
                        ...aircraftData[index],
                        LoaiMayBay: formData.loaiMayBay,
                        SoLuongGhe: formData.soLuongGhe,
                        HangSanXuat: formData.hangSanXuat,
                        TinhTrang: formData.TinhTrang
                    };
                    
                    // Log debug để kiểm tra dữ liệu đã cập nhật
                    console.log('Đã cập nhật dữ liệu máy bay ID', aircraftId, 'với trạng thái:', formData.TinhTrang);
                    
                    // Đảm bảo filtered data cũng được cập nhật
                    filteredData = [...aircraftData];
                }
                
                showNotification('Cập nhật máy bay thành công');
            } catch (error) {
                console.error('Lỗi API cập nhật:', error);
                
                // Cập nhật dữ liệu local trong trường hợp lỗi API
                const index = aircraftData.findIndex(a => a.ID_MayBay.toString() === aircraftId.toString());
                if (index !== -1) {
                    aircraftData[index] = {
                        ...aircraftData[index],
                        LoaiMayBay: formData.loaiMayBay,
                        SoLuongGhe: formData.soLuongGhe,
                        HangSanXuat: formData.hangSanXuat,
                        TinhTrang: formData.TinhTrang
                    };
                    
                    // Log debug để kiểm tra dữ liệu đã cập nhật
                    console.log('Đã cập nhật dữ liệu máy bay ID', aircraftId, 'với trạng thái (demo):', formData.TinhTrang);
                    
                    // Đảm bảo filtered data cũng được cập nhật
                    filteredData = [...aircraftData];
                    showNotification('Đã cập nhật máy bay (chế độ demo)', 'success');
                } else {
                    throw error;
                }
            }
        } else {
            // Tạo máy bay mới
            try {
                console.log('Gửi request API thêm mới máy bay với data:', JSON.stringify(formData));
                
                const response = await fetch(`${API_URL}/api/may-bay`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error response:', errorText);
                    throw new Error('Lỗi khi thêm máy bay: ' + errorText);
                }
                
                // Thử đọc phản hồi JSON
                let newAircraft;
                try {
                    newAircraft = await response.json();
                    console.log('Phản hồi API thêm mới:', newAircraft);
                } catch (jsonError) {
                    console.warn('Không thể parse phản hồi JSON:', jsonError);
                }
                
                // Nếu không có dữ liệu máy bay từ API, tạo dữ liệu giả
                if (!newAircraft || !newAircraft.ID_MayBay) {
                    newAircraft = {
                        ID_MayBay: aircraftData.length > 0 ? Math.max(...aircraftData.map(a => parseInt(a.ID_MayBay) || 0)) + 1 : 1,
                        LoaiMayBay: formData.loaiMayBay,
                        SoLuongGhe: formData.soLuongGhe,
                        HangSanXuat: formData.hangSanXuat,
                        TinhTrang: formData.TinhTrang
                    };
                    console.log('Tạo dữ liệu máy bay giả:', newAircraft);
                }
                
                // Thêm máy bay mới vào danh sách
                aircraftData.push(newAircraft);
                filteredData = [...aircraftData];
                
                console.log('Danh sách máy bay sau khi thêm mới:', aircraftData);
                showNotification('Thêm máy bay thành công');
            } catch (error) {
                console.error('Lỗi API thêm mới:', error);
                
                // Tạo dữ liệu giả cho trường hợp demo
                const newAircraft = {
                    ID_MayBay: aircraftData.length > 0 ? Math.max(...aircraftData.map(a => parseInt(a.ID_MayBay) || 0)) + 1 : 1,
                    LoaiMayBay: formData.loaiMayBay,
                    SoLuongGhe: formData.soLuongGhe,
                    HangSanXuat: formData.hangSanXuat,
                    TinhTrang: formData.TinhTrang
                };
                
                // Thêm vào danh sách dữ liệu
                aircraftData.push(newAircraft);
                filteredData = [...aircraftData];
                
                console.log('Đã thêm máy bay vào danh sách (demo mode):', newAircraft);
                showNotification('Đã thêm máy bay (chế độ demo)', 'success');
            }
        }
        
        // Đóng modal và cập nhật UI
        closeAircraftModal();
        renderAircraftTable();
        updatePagination();
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification(error.message, 'error');
    }
});

// Edit aircraft
async function editAircraft(id) {
    try {
        console.log('Bắt đầu chỉnh sửa máy bay ID:', id);
        
        // Kiểm tra xem form có đầy đủ trường không
        const form = document.getElementById('aircraftForm');
        const TinhTrangField = document.getElementById('TinhTrang');
        
        if (!form || !TinhTrangField) {
            showNotification('Thiếu trường trong form máy bay', 'error');
            console.error('Form hoặc trường trạng thái không tồn tại', {
                form: !!form,
                TinhTrangField: !!TinhTrangField
            });
            return;
        }
        
        // Tìm máy bay trong dữ liệu hiện có trước khi gọi API
        let aircraft = aircraftData.find(a => a.ID_MayBay.toString() === id.toString());
        
        if (!aircraft) {
            // Thử gọi API để lấy thông tin máy bay
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
            }
            
            try {
                const response = await fetch(`${API_URL}/api/may-bay/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error('Không thể tải thông tin máy bay');
                
                aircraft = await response.json();
            } catch (error) {
                console.error('Lỗi khi gọi API lấy thông tin:', error);
                showNotification('Không thể tải thông tin máy bay từ API', 'error');
                
                // Nếu không tìm thấy trong API, tiếp tục sử dụng dữ liệu đã tìm thấy trong bộ nhớ
                if (!aircraft) {
                    throw new Error('Không tìm thấy thông tin máy bay');
                }
            }
        }
        
        // Đảm bảo dropdown trạng thái được khởi tạo
        initStatusDropdown();
        
        // Điền dữ liệu vào form
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa máy bay';
        document.getElementById('aircraftId').value = aircraft.ID_MayBay;
        document.getElementById('loaiMayBay').value = aircraft.LoaiMayBay || '';
        document.getElementById('soLuongGhe').value = aircraft.SoLuongGhe || '';
        document.getElementById('hangSanXuat').value = aircraft.HangSanXuat || '';
        
        // Chuẩn hóa và điền trạng thái
        const normalizedStatus = normalizeAircraftStatus(aircraft.TinhTrang || aircraft.TinhTrang);
        document.getElementById('TinhTrang').value = normalizedStatus;
        
        console.log('Đã điền dữ liệu vào form, trạng thái:', normalizedStatus);
        
        // Hiển thị modal bằng Bootstrap
        const modalElement = document.getElementById('aircraftModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error('Lỗi khi chỉnh sửa máy bay:', error);
        showNotification('Không thể tải thông tin máy bay: ' + error.message, 'error');
    }
}

// View aircraft details
async function viewAircraft(id) {
    try {
        const aircraft = await apiCall(`/aircraft/${id}`);
        const airline = airlines.find(a => a.id === aircraft.airline_id);
        
        // Create detailed view
        const detailsHTML = `
            <div class="aircraft-details">
                <h4>${aircraft.registration} - ${aircraft.model}</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Airline:</label>
                        <span>${airline ? airline.name : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Manufacturer:</label>
                        <span>${aircraft.manufacturer}</span>
                    </div>
                    <div class="detail-item">
                        <label>Model:</label>
                        <span>${aircraft.model}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge status-${aircraft.status}">${aircraft.status}</span>
                    </div>
                    <div class="detail-item">
                        <label>Year:</label>
                        <span>${aircraft.manufacture_year}</span>
                    </div>
                    <div class="detail-item">
                        <label>Total Seats:</label>
                        <span>${aircraft.total_seats}</span>
                    </div>
                    <div class="detail-item">
                        <label>Configuration:</label>
                        <span>E: ${aircraft.economy_seats}, B: ${aircraft.business_seats}, F: ${aircraft.first_class_seats || 0}</span>
                    </div>
                    <div class="detail-item">
                        <label>Last Service:</label>
                        <span>${aircraft.last_service_date ? formatDate(aircraft.last_service_date) : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Next Service:</label>
                        <span>${aircraft.next_service_date ? formatDate(aircraft.next_service_date) : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Engine Type:</label>
                        <span>${aircraft.engine_type || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Cruise Speed:</label>
                        <span>${aircraft.cruise_speed ? aircraft.cruise_speed + ' km/h' : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Range:</label>
                        <span>${aircraft.range ? aircraft.range + ' km' : 'N/A'}</span>
                    </div>
                </div>
                ${aircraft.notes ? `<div class="notes-section"><h5>Notes:</h5><p>${aircraft.notes}</p></div>` : ''}
            </div>
        `;
        
        // Show in modal or dedicated view
        showDetailsModal('Aircraft Details', detailsHTML);
    } catch (error) {
        showNotification('Error loading aircraft details', 'error');
    }
}

// Delete aircraft
async function deleteAircraft(id) {
    if (confirm('Bạn có chắc chắn muốn xóa máy bay này?')) {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
            }
            
            try {
                const response = await fetch(`${API_URL}/api/may-bay/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) throw new Error('Không thể xóa máy bay');
                
                // Xóa máy bay khỏi dữ liệu local
                aircraftData = aircraftData.filter(a => a.ID_MayBay.toString() !== id.toString());
                filteredData = [...aircraftData];
                
                showNotification('Xóa máy bay thành công');
            } catch (error) {
                console.error('Lỗi API xóa:', error);
                
                // Xử lý xóa trong chế độ demo
                aircraftData = aircraftData.filter(a => a.ID_MayBay.toString() !== id.toString());
                filteredData = [...aircraftData];
                
                showNotification('Đã xóa máy bay (chế độ demo)', 'success');
            }
            
            renderAircraftTable();
        } catch (error) {
            console.error('Lỗi:', error);
            showNotification('Không thể xóa máy bay: ' + error.message, 'error');
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification ${type}`;
    notificationDiv.textContent = message;
    
    document.body.appendChild(notificationDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notificationDiv.remove();
    }, 3000);
}