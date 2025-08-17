// Vé Management JavaScript
const API_URL = "http://localhost:3000";
let currentPage = 1;
let totalPages = 1;
let veData = [];
let filteredData = [];

// Load vé data
async function loadVe() {
  try {
    showLoading();
    // Gọi API để lấy dữ liệu vé
    const response = await apiCall(`/api/ve`);
    console.log("Dữ liệu vé nhận được:", response);
    
    // Xử lý dữ liệu vé
    veData = Array.isArray(response) ? response : [];
    
    // Lấy thông tin hành khách cho mỗi vé nếu chưa có
    for (let i = 0; i < veData.length; i++) {
      if (!veData[i].TenHanhKhach) {
        try {
          const hanhKhach = await apiCall(`/api/hanhkhach/${veData[i].ID_HanhKhach}`);
          veData[i].TenHanhKhach = hanhKhach ? hanhKhach.HoTen : "Không xác định";
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin hành khách cho vé ${veData[i].ID_Ve}:`, error);
          veData[i].TenHanhKhach = "Không xác định";
        }
      }
    }
    
    console.log("Dữ liệu vé đã xử lý:", veData);
    filteredData = [...veData];
    
    // Tính toán phân trang đơn giản
    totalPages = Math.ceil(veData.length / 10);
    if (totalPages === 0) totalPages = 1;
    
    applyFilters();
    updatePagination();
    hideLoading();
  } catch (error) {
    hideLoading();
    showNotification("Lỗi khi tải dữ liệu vé: " + error.message, "error");
  }
}

// Render vé table
function renderVeTable() {
  const tbody = document.getElementById("veTableBody");
  tbody.innerHTML = "";

  if (filteredData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center">Không tìm thấy vé nào</td></tr>';
    return;
  }
  
  // Tính toán phân trang thủ công
  const startIndex = (currentPage - 1) * 10;
  const endIndex = Math.min(startIndex + 10, filteredData.length);
  const currentPageData = filteredData.slice(startIndex, endIndex);

  currentPageData.forEach((ve) => {
    // Format ngày đặt vé
    const ngayDatVe = new Date(ve.NgayDatVe).toLocaleDateString("vi-VN");
    
    // Tạo class cho trạng thái vé
    let statusClass = "";
    switch(ve.TrangThai) {
      case "Đã thanh toán":
        statusClass = "status-active";
        break;
      case "Đã đặt":
        statusClass = "status-pending";
        break;
      case "Đã hủy":
        statusClass = "status-inactive";
        break;
    }
    
    const row = `
      <tr>
        <td>${ve.ID_Ve}</td>
        <td>${ve.TenHanhKhach || "Không xác định"}</td>
        <td><span class="${statusClass}">${ve.TrangThai || "N/A"}</span></td>
        <td>${ngayDatVe}</td>
        <td>${ve.ID_ChuyenBay || "N/A"}</td>
        <td>${ve.ID_Ghe || "N/A"}</td>
        <td class="actions">
          <button class="btn btn-sm btn-success" onclick="editVe(${ve.ID_Ve})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-info" onclick="viewVe(${ve.ID_Ve})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteVe(${ve.ID_Ve})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Search and filter functionality
function applyFilters() {
  const searchTerm = document.getElementById("searchVe").value.toLowerCase();
  const statusFilter = document.getElementById("filterStatus").value;

  filteredData = veData.filter((ve) => {
    const matchesSearch = 
      (ve.TenHanhKhach && ve.TenHanhKhach.toLowerCase().includes(searchTerm)) || 
      (ve.ID_Ve && ve.ID_Ve.toString().includes(searchTerm));
    
    const matchesStatus = !statusFilter || ve.TrangThai === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Cập nhật lại phân trang khi lọc
  currentPage = 1;
  totalPages = Math.ceil(filteredData.length / 10);
  if (totalPages === 0) totalPages = 1;
  
  renderVeTable();
  updatePagination();
}

// Event listeners for search and filter
document.getElementById("searchVe").addEventListener("input", applyFilters);
document.getElementById("filterStatus").addEventListener("change", applyFilters);

// Update pagination
function updatePagination() {
  document.getElementById("currentPage").textContent = currentPage;
  document.getElementById("totalPages").textContent = totalPages;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Pagination handlers
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderVeTable();
    updatePagination();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    renderVeTable();
    updatePagination();
  }
});

// Load flights for dropdown
async function loadFlights() {
  try {
    const flights = await apiCall("/api/chuyen-bay");
    const flightSelect = document.getElementById("flightId");
    flightSelect.innerHTML = '<option value="">-- Chọn chuyến bay --</option>';
    
    flights.forEach(flight => {
      const departureTime = new Date(flight.ThoiGianKhoiHanh).toLocaleString("vi-VN");
      flightSelect.innerHTML += `<option value="${flight.ID_ChuyenBay}">${flight.ID_ChuyenBay} - ${departureTime}</option>`;
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách chuyến bay:", error);
  }
}

// Load seats for dropdown
async function loadSeats() {
  try {
    const seats = await apiCall("/api/ghe");
    const seatSelect = document.getElementById("seatId");
    seatSelect.innerHTML = '<option value="">-- Chọn ghế --</option>';
    
    seats.forEach(seat => {
      seatSelect.innerHTML += `<option value="${seat.ID_Ghe}">${seat.SoGhe} - Hàng ${seat.Hang}</option>`;
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách ghế:", error);
  }
}

// Load passengers for dropdown
async function loadPassengers() {
  try {
    const passengers = await apiCall("/api/hanhkhach");
    const passengerSelect = document.getElementById("passengerId");
    passengerSelect.innerHTML = '<option value="">-- Chọn hành khách --</option>';
    
    passengers.forEach(passenger => {
      passengerSelect.innerHTML += `<option value="${passenger.ID_HanhKhach}">${passenger.HoTen}</option>`;
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách hành khách:", error);
  }
}

// Open Add Vé Modal
function openAddVeModal() {
  document.getElementById("modalTitle").textContent = "Thêm vé mới";
  document.getElementById("veForm").reset();
  document.getElementById("veId").value = "";
  
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("veDate").value = today;
  
  // Load dropdowns
  loadFlights();
  loadSeats();
  loadPassengers();
  
  document.getElementById("veModal").style.display = "block";
}

// Close Vé Modal
function closeVeModal() {
  document.getElementById("veModal").style.display = "none";
}

// Save vé
async function saveVe() {
  const veId = document.getElementById("veId").value;
  const formData = {
    trangThai: document.getElementById("veStatus").value,
    ngayDatVe: document.getElementById("veDate").value,
    idChuyenBay: document.getElementById("flightId").value,
    idGhe: document.getElementById("seatId").value,
    idHanhKhach: document.getElementById("passengerId").value,
  };
  
  try {
    if (veId) {
      await apiCall(`/api/ve/${veId}`, "PUT", formData);
      showNotification("Cập nhật vé thành công");
    } else {
      await apiCall("/api/ve", "POST", formData);
      showNotification("Thêm vé thành công");
    }
    closeVeModal();
    await loadVe();
  } catch (error) {
    showNotification("Lỗi khi lưu vé: " + error.message, "error");
  }
}

// Edit vé
async function editVe(id) {
  try {
    const ve = await apiCall(`/api/ve/${id}`);
    document.getElementById("modalTitle").textContent = "Sửa vé";
    document.getElementById("veId").value = ve.ID_Ve;
    document.getElementById("veStatus").value = ve.TrangThai;
    
    // Format date for input
    const ngayDatVe = new Date(ve.NgayDatVe).toISOString().split('T')[0];
    document.getElementById("veDate").value = ngayDatVe;
    
    // Load dropdowns
    await loadFlights();
    await loadSeats();
    await loadPassengers();
    
    // Set selected values
    document.getElementById("flightId").value = ve.ID_ChuyenBay;
    document.getElementById("seatId").value = ve.ID_Ghe;
    document.getElementById("passengerId").value = ve.ID_HanhKhach;
    
    document.getElementById("veModal").style.display = "block";
  } catch (error) {
    showNotification("Lỗi khi tải dữ liệu vé", "error");
  }
}

// View vé details
async function viewVe(id) {
  try {
    // Sử dụng API chi tiết vé
    const veDetail = await apiCall(`/api/ve/chi-tiet/${id}`);
    
    // Format ngày đặt vé
    const ngayDatVe = new Date(veDetail.ve.NgayDatVe).toLocaleDateString("vi-VN");
    const thoiGianKhoiHanh = new Date(veDetail.chuyenBay.ThoiGianKhoiHanh).toLocaleString("vi-VN");
    const thoiGianHaCanh = new Date(veDetail.chuyenBay.ThoiGianHaCanh).toLocaleString("vi-VN");
    
    const detailsHTML = `
      <div class="details-grid">
        <div class="detail-item">
          <label>Mã vé:</label>
          <span>${veDetail.ve.ID_Ve}</span>
        </div>
        <div class="detail-item">
          <label>Trạng thái:</label>
          <span>${veDetail.ve.TrangThai || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>Ngày đặt vé:</label>
          <span>${ngayDatVe}</span>
        </div>
        <div class="detail-item">
          <label>Tên hành khách:</label>
          <span>${veDetail.hanhKhach.HoTen}</span>
        </div>
        <div class="detail-item">
          <label>CMND/CCCD:</label>
          <span>${veDetail.hanhKhach.CMND || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>Số điện thoại:</label>
          <span>${veDetail.hanhKhach.SDT || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>Email:</label>
          <span>${veDetail.hanhKhach.Email || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>Chuyến bay:</label>
          <span>${veDetail.chuyenBay.ID_ChuyenBay}</span>
        </div>
        <div class="detail-item">
          <label>Sân bay đi:</label>
          <span>${veDetail.sanBayDi.TenSanBay}</span>
        </div>
        <div class="detail-item">
          <label>Sân bay đến:</label>
          <span>${veDetail.sanBayDen.TenSanBay}</span>
        </div>
        <div class="detail-item">
          <label>Thời gian khởi hành:</label>
          <span>${thoiGianKhoiHanh}</span>
        </div>
        <div class="detail-item">
          <label>Thời gian hạ cánh:</label>
          <span>${thoiGianHaCanh}</span>
        </div>
        <div class="detail-item">
          <label>Ghế:</label>
          <span>${veDetail.ghe.SoGhe} - Hàng ${veDetail.ghe.Hang} (${veDetail.ghe.loaiGhe.TenLoai})</span>
        </div>
      </div>
      
      ${veDetail.dichVus && veDetail.dichVus.length > 0 ? `
        <div class="detail-section">
          <h4>Dịch vụ đã đặt</h4>
          <ul class="service-list">
            ${veDetail.dichVus.map(dv => `<li>${dv.TenDichVu} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dv.Gia)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${veDetail.hoaDon ? `
        <div class="detail-section">
          <h4>Thông tin thanh toán</h4>
          <p>Mã hóa đơn: ${veDetail.hoaDon.ID_HoaDon}</p>
          <p>Ngày thanh toán: ${new Date(veDetail.hoaDon.NgayThanhToan).toLocaleString("vi-VN")}</p>
          <p>Tổng tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(veDetail.hoaDon.TongTien)}</p>
        </div>
      ` : ''}
    `;

    document.getElementById("veDetails").innerHTML = detailsHTML;
    document.getElementById("viewVeModal").style.display = "block";
  } catch (error) {
    console.error("Lỗi khi tải chi tiết vé:", error);
    showNotification("Lỗi khi tải thông tin chi tiết vé", "error");
  }
}

// Close view modal
function closeViewModal() {
  document.getElementById("viewVeModal").style.display = "none";
}

// Delete vé
async function deleteVe(id) {
  if (confirm("Bạn có chắc chắn muốn xóa vé này không?")) {
    try {
      await apiCall(`/api/ve/${id}`, "DELETE");
      showNotification("Xóa vé thành công");
      loadVe();
    } catch (error) {
      // Hiển thị thông báo lỗi chi tiết
      const errorMessage = error.message || "Đã xảy ra lỗi khi xóa vé";
      showNotification("Lỗi khi xóa vé: " + errorMessage, "error");
    }
  }
}

// Form submit handler
document.getElementById("veForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveVe();
});

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra đăng nhập
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  
  loadVe();
}); 