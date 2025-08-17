// Khai báo biến và hằng số
const API_URL = "http://localhost:3000/api/dich-vu";
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;
// Kiểm tra token trong localStorage

// Load dữ liệu dịch vụ
// async function loadServices(page = 1) {
//   try {
//     showLoading();
//     const response = await fetch(
//       `${API_URL}?page=${page}&limit=${itemsPerPage}`
//     );
//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Không thể tải dữ liệu dịch vụ");
//     }

//     let services;
//     if (Array.isArray(data)) {
//       services = data;
//       totalPages = 1;
//     } else {
//       services = data.services || [];
//       totalPages = Math.ceil((data.total || services.length) / itemsPerPage);
//     }

//     // Cập nhật bảng dịch vụ
//     const tbody = document.getElementById("servicesTableBody");
//     tbody.innerHTML = "";

//     services.forEach((service) => {
//       const row = document.createElement("tr");
//       row.innerHTML = `
//                 <td>${service.TenDichVu}</td>
//                 <td>${formatCurrency(service.GiaDichVu)}</td>
//                 <td>
//                     <div class="actions">
//                         <button class="btn btn-info btn-sm" onclick="viewService(${
//                           service.ID_DichVu
//                         })">
//                             <i class="fas fa-eye"></i>
//                         </button>
//                         <button class="btn btn-primary btn-sm" onclick="editService(${
//                           service.ID_DichVu
//                         })">
//                             <i class="fas fa-edit"></i>
//                         </button>
//                         <button class="btn btn-danger btn-sm" onclick="deleteService(${
//                           service.ID_DichVu
//                         })">
//                             <i class="fas fa-trash"></i>
//                         </button>
//                     </div>
//                 </td>
//             `;
//       tbody.appendChild(row);
//     });

//     // Cập nhật phân trang
//     updatePagination();
//   } catch (error) {
//     showNotification(error.message, "error");
//   } finally {
//     hideLoading();
//   }
// }

async function loadServices(page = 1) {
  try {
    showLoading();
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_URL}?page=${page}&limit=${itemsPerPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể tải dữ liệu dịch vụ");
    }

    let services;
    if (Array.isArray(data)) {
      services = data;
      totalPages = 1;
    } else {
      services = data.services || [];
      totalPages = Math.ceil((data.total || services.length) / itemsPerPage);
    }

    const tbody = document.getElementById("servicesTableBody");
    tbody.innerHTML = "";

    services.forEach((service) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${service.TenDichVu}</td>
          <td>${formatCurrency(service.GiaDichVu)}</td>
          <td>
              <div class="actions">
                  <button class="btn btn-info btn-sm" onclick="viewService(${
                    service.ID_DichVu
                  })">
                      <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-primary btn-sm" onclick="editService(${
                    service.ID_DichVu
                  })">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="deleteService(${
                    service.ID_DichVu
                  })">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </td>`;
      tbody.appendChild(row);
    });

    updatePagination();
  } catch (error) {
    showNotification(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Format tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Cập nhật phân trang
function updatePagination() {
  document.getElementById("currentPage").textContent = currentPage;
  document.getElementById("totalPages").textContent = totalPages;

  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Xử lý phân trang
document.getElementById("prevPage")?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadServices(currentPage);
  }
});

document.getElementById("nextPage")?.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadServices(currentPage);
  }
});

// Mở modal thêm dịch vụ
function openAddServiceModal() {
  const modal = document.getElementById("serviceModal");
  const form = document.getElementById("serviceForm");
  const title = document.getElementById("modalTitle");

  title.textContent = "Thêm dịch vụ mới";
  form.reset();
  document.getElementById("serviceId").value = "";
  modal.style.display = "block";
}

// Đóng modal
function closeServiceModal() {
  const modal = document.getElementById("serviceModal");
  modal.style.display = "none";
}

// Xem chi tiết dịch vụ
async function viewService(id) {
  try {
    showLoading();
    const response = await fetch(`${API_URL}/${id}`);
    const service = await response.json();

    if (!response.ok) {
      throw new Error(service.message || "Không thể tải thông tin dịch vụ");
    }

    const content = `
            <div class="details-grid">
                <div class="detail-item">
                    <label>ID Dịch vụ:</label>
                    <span>${service.ID_DichVu}</span>
                </div>
                <div class="detail-item">
                    <label>Tên dịch vụ:</label>
                    <span>${service.TenDichVu}</span>
                </div>
                <div class="detail-item">
                    <label>Giá dịch vụ:</label>
                    <span>${formatCurrency(service.GiaDichVu)}</span>
                </div>
                <div class="detail-item">
                    <label>Admin tạo:</label>
                    <span>${service.ID_Admin}</span>
                </div>
            </div>
        `;

    showDetailsModal("Chi tiết dịch vụ", content);
  } catch (error) {
    showNotification(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Sửa dịch vụ
async function editService(id) {
  try {
    showLoading();
    const response = await fetch(`${API_URL}/${id}`);
    const service = await response.json();

    if (!response.ok) {
      throw new Error(service.message || "Không thể tải thông tin dịch vụ");
    }

    const modal = document.getElementById("serviceModal");
    const form = document.getElementById("serviceForm");
    const title = document.getElementById("modalTitle");

    title.textContent = "Sửa dịch vụ";
    document.getElementById("serviceId").value = service.ID_DichVu;
    document.getElementById("tenDichVu").value = service.TenDichVu;
    document.getElementById("giaDichVu").value = service.GiaDichVu;

    modal.style.display = "block";
  } catch (error) {
    showNotification(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Xóa dịch vụ
async function deleteService(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
    return;
  }

  try {
    showLoading();
    console.log(
      "Header Authorization:",
      `Bearer ${localStorage.getItem("adminToken")}`
    );
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể xóa dịch vụ");
    }

    showNotification("Xóa dịch vụ thành công", "success");
    loadServices(currentPage);
  } catch (error) {
    showNotification(error.message, "error");
  } finally {
    hideLoading();
  }
}

// Xử lý form thêm/sửa dịch vụ
document
  .getElementById("serviceForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const serviceId = document.getElementById("serviceId").value;
    const tenDichVu = document.getElementById("tenDichVu").value;
    const giaDichVu = document.getElementById("giaDichVu").value;

    const data = {
      TenDichVu: tenDichVu,
      GiaDichVu: parseInt(giaDichVu),
    };

    console.log("Dữ liệu gửi đi:", data);

    try {
      showLoading();
      const url = serviceId ? `${API_URL}/${serviceId}` : `${API_URL}`;

      const response = await fetch(url, {
        method: serviceId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Không thể lưu dịch vụ");
      }

      showNotification(
        serviceId ? "Cập nhật dịch vụ thành công" : "Thêm dịch vụ thành công",
        "success"
      );

      closeServiceModal();
      loadServices(currentPage);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      hideLoading();
    }
  });

// Xử lý tìm kiếm
document.getElementById("searchService")?.addEventListener(
  "input",
  debounce((e) => {
    const searchTerm = e.target.value.trim();
    // Reset về trang 1 khi tìm kiếm
    currentPage = 1;
    loadServices(currentPage, searchTerm);
  }, 500)
);

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Load dữ liệu khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
  loadServices();
});
