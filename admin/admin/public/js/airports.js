// Airports Management JavaScript
const API_URL = "http://localhost:3000";
let currentPage = 1;
let totalPages = 1;
let airportsData = [];
let filteredData = [];

// Load airports data
async function loadAirports() {
  try {
    const data = await apiCall(`/api/san-bay?page=${currentPage}`);
    console.log("Dữ liệu sân bay nhận được:", data);
    
    airportsData = (Array.isArray(data) ? data : data.airports || []).map(
      (a) => {
        console.log("Xử lý sân bay:", a);
        return {
          MaSanBay: a.MaSanBay || a.maSanBay || a.code || "N/A",
          TenSanBay: a.TenSanBay || a.tenSanBay || a.name || "Chưa đặt tên",
          ThanhPho: a.ThanhPho || a.thanhPho || a.city || "N/A",
          DiaChi: a.DiaChi || a.diaChi || a.address || "N/A",
          ID_SanBay: a.ID_SanBay || a.id_SanBay || a.id || 0,
        };
      }
    );

    console.log("Dữ liệu sân bay đã xử lý:", airportsData);
    filteredData = [...airportsData];
    totalPages = 1;
    applyFilters();
    updatePagination();
  } catch (error) {
    showNotification("Error loading airports: " + error.message, "error");
  }
}

// Render airports table
function renderAirportsTable() {
  const tbody = document.getElementById("airportsTableBody");
  tbody.innerHTML = "";

  if (filteredData.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="text-center">No airports found</td></tr>';
    return;
  }

  filteredData.forEach((airport) => {
    const row = `
            <tr>
                <td>${airport.TenSanBay}</td>
                <td>${airport.ThanhPho}</td>
                <td>${airport.DiaChi || ""}</td>
                <td><span class="airport-code">${airport.MaSanBay}</span></td>
                <td class="actions">
                    <button class="btn btn-sm btn-success" onclick="editAirport(${
                      airport.ID_SanBay
                    })">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="viewAirport(${
                      airport.ID_SanBay
                    })">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAirport(${
                      airport.ID_SanBay
                    })">
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
  const searchTerm = document
    .getElementById("searchAirport")
    .value.toLowerCase();
  const countryFilter = document.getElementById("filterCountry").value;

  filteredData = airportsData.filter((airport) => {
    const matchesSearch =
      airport.TenSanBay.toLowerCase().includes(searchTerm) ||
      airport.MaSanBay.toLowerCase().includes(searchTerm) ||
      airport.ThanhPho.toLowerCase().includes(searchTerm);

    const matchesCountry = !countryFilter || airport.country === countryFilter;

    return matchesSearch && matchesCountry;
  });

  renderAirportsTable();
}

// Event listeners for search and filter
document
  .getElementById("searchAirport")
  .addEventListener("input", applyFilters);
document
  .getElementById("filterCountry")
  .addEventListener("change", applyFilters);

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
    loadAirports();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadAirports();
  }
});

// Open Add Airport Modal
function openAddAirportModal() {
  document.getElementById("modalTitle").textContent = "Add New Airport";
  document.getElementById("airportForm").reset();
  document.getElementById("airportId").value = "";
  document.getElementById("airportModal").style.display = "block";
}

// Close Airport Modal
function closeAirportModal() {
  document.getElementById("airportModal").style.display = "none";
}

// Save airport
async function saveAirport() {
  const airportId = document.getElementById("airportId").value;
  const formData = {
    maSanBay: document.getElementById("airportCode").value.trim().toUpperCase(),
    tenSanBay: document.getElementById("airportName").value.trim(),
    thanhPho: document.getElementById("airportCity").value.trim(),
    diaChi: document.getElementById("airportAddress").value.trim(),
  };
  try {
    if (airportId) {
      await apiCall(`/api/san-bay/${airportId}`, "PUT", formData);
      showNotification("Cập nhật sân bay thành công");
    } else {
      await apiCall("/api/san-bay", "POST", formData);
      showNotification("Thêm sân bay thành công");
    }
    closeAirportModal();
    currentPage = 1;
    await loadAirports();
  } catch (error) {
    showNotification("Lỗi khi lưu sân bay", "error");
  }
}

// Edit airport
async function editAirport(id) {
  try {
    const airport = await apiCall(`/api/san-bay/${id}`);
    document.getElementById("modalTitle").textContent = "Edit Airport";
    document.getElementById("airportId").value =
      airport.ID_SanBay || airport.id;
    document.getElementById("airportCode").value =
      airport.MaSanBay || airport.code;
    document.getElementById("airportName").value =
      airport.TenSanBay || airport.name;
    document.getElementById("airportCity").value =
      airport.ThanhPho || airport.city;
    document.getElementById("airportAddress").value =
      airport.DiaChi || airport.address || "";
    document.getElementById("airportModal").style.display = "block";
  } catch (error) {
    showNotification("Error loading airport data", "error");
  }
}

// View airport details
async function viewAirport(id) {
  try {
    const airport = await apiCall(`/api/san-bay/${id}`);

    const detailsHTML = `
            <div class="details-grid">
                <div class="detail-item">
                    <label>Tên sân bay:</label>
                    <span>${airport.TenSanBay || "undefined"}</span>
                </div>
                <div class="detail-item">
                    <label>Thành phố:</label>
                    <span>${airport.ThanhPho || "undefined"}</span>
                </div>
                <div class="detail-item">
                    <label>Địa chỉ:</label>
                    <span>${airport.DiaChi || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <label>Mã sân bay:</label>
                    <span>${airport.MaSanBay || "undefined"}</span>
                </div>
            </div>
        `;

    document.getElementById("airportDetails").innerHTML = detailsHTML;
    document.getElementById("viewAirportModal").style.display = "block";
  } catch (error) {
    showNotification("Lỗi khi tải thông tin chi tiết sân bay", "error");
  }
}

// Close view modal
function closeViewModal() {
  document.getElementById("viewAirportModal").style.display = "none";
}

// Delete airport
async function deleteAirport(id) {
  if (confirm("Bạn có chắc chắn muốn xóa sân bay này không?")) {
    try {
      await apiCall(`/api/san-bay/${id}`, "DELETE");
      showNotification("Xóa sân bay thành công");
      loadAirports();
    } catch (error) {
      console.error("Lỗi khi xóa sân bay:", error);
      
      // Kiểm tra lỗi ràng buộc khóa ngoại (FK constraint)
      if (error.message && error.message.includes("FK__ChuyenBay") && error.message.includes("REFERENCE constraint")) {
        showNotification(
          "Không thể xóa sân bay này vì đang được sử dụng trong bảng ChuyenBay. Sân bay này đang là điểm đến của một số chuyến bay.",
          "error"
        );
      } else if (error.message && error.message.includes("REFERENCE constraint")) {
        showNotification(
          "Không thể xóa sân bay này vì đang được sử dụng trong dữ liệu khác. Hãy cập nhật thông tin thay vì xóa.",
          "error"
        );
      } else {
        showNotification("Lỗi khi xóa sân bay: " + error.message, "error");
      }
    }
  }
}

// Format airport code input
if (document.getElementById("airportCode")) {
  document
    .getElementById("airportCode")
    .addEventListener("input", function (e) {
      this.value = this.value.toUpperCase();
    });
}

// Gán sự kiện submit cho form thêm/sửa sân bay
if (document.getElementById("airportForm")) {
  document
    .getElementById("airportForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      saveAirport();
    });
}

// Initialize page
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadAirports();
  });
} else {
  loadAirports();
}
