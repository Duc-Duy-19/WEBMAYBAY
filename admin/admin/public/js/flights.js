// Khai báo biến và hằng số
const API_URL = "http://localhost:3000";
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;
let flightsData = [];
let filteredData = [];
let sanBayList = [];
let mayBayList = [];

// Load danh sách sân bay
async function loadSanBayList() {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_URL}/api/san-bay`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    sanBayList = await response.json();
    console.log("Dữ liệu sân bay:", sanBayList);
  } catch (error) {
    console.error("Lỗi khi tải danh sách sân bay:", error);
    showNotification("Không thể tải danh sách sân bay", "error");
  }
}

// Load danh sách máy bay
async function loadMayBayList() {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_URL}/api/may-bay`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    mayBayList = await response.json();
    console.log("Dữ liệu máy bay:", mayBayList);
  } catch (error) {
    console.error("Lỗi khi tải danh sách máy bay:", error);
    showNotification("Không thể tải danh sách máy bay", "error");
  }
}

// Load dữ liệu chuyến bay
async function loadFlights(page = 1) {
  try {
    showLoading();
    const token = localStorage.getItem("adminToken");
    if (!token) {
      throw new Error("Bạn chưa đăng nhập");
    }

    const response = await fetch(`${API_URL}/api/chuyen-bay`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "./login.html";
        return;
      }
      throw new Error("Không thể tải dữ liệu chuyến bay");
    }

    const flights = await response.json();
    flightsData = flights;
    console.log("Dữ liệu chuyến bay:", flights);

    filteredData = [...flightsData];
    applyFilters();

    hideLoading();
  } catch (error) {
    hideLoading();
    console.error("Lỗi khi tải dữ liệu chuyến bay:", error);
    showNotification("Không thể tải dữ liệu chuyến bay", "error");
  }
}

// Hiển thị dữ liệu chuyến bay
function displayFlights() {
  const tableBody = document.getElementById("flightsTableBody");
  tableBody.innerHTML = "";

  if (filteredData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="10" class="text-center">Không có dữ liệu chuyến bay</td></tr>`;
    return;
  }

  // Tính toán phân trang
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  paginatedData.forEach((flight) => {
    const row = document.createElement("tr");
    // Format giá tiền
    const formattedPrice =
      parseInt(flight.GiaCoSo || 0).toLocaleString("vi-VN") + " VND";

    // Tìm tên sân bay đi và đến
    const sanBayDi = sanBayList.find(
      (sb) => sb.ID_SanBay === flight.ID_SanBayDi
    ) || { TenSanBay: "Không xác định" };
    const sanBayDen = sanBayList.find(
      (sb) => sb.ID_SanBay === flight.ID_SanBayDen
    ) || { TenSanBay: "Không xác định" };

    // Tìm thông tin máy bay
    const mayBay = mayBayList.find(
      (mb) => mb.ID_MayBay === flight.ID_MayBay
    ) || { ID_MayBay: 0 };

    // Lấy tên hiển thị cho máy bay
    let tenMayBay = "Không xác định";
    if (mayBay) {
      if (mayBay.LoaiMayBay) {
        tenMayBay = mayBay.LoaiMayBay;
        if (mayBay.HangSanXuat) {
          tenMayBay += ` - ${mayBay.HangSanXuat}`;
        }
      } else if (mayBay.TenMayBay) {
        tenMayBay = mayBay.TenMayBay;
      } else if (mayBay.loaiMayBay) {
        tenMayBay = mayBay.loaiMayBay;
      }
    }

    // Format thời gian
    const khoiHanh = new Date(flight.ThoiGianKhoiHanh).toLocaleString("vi-VN");
    const haCanh = new Date(flight.ThoiGianHaCanh).toLocaleString("vi-VN");

    // Trạng thái chuyến bay
    let trangThaiClass = "badge ";
    switch (flight.TrangThai) {
      case "Đang mở bán":
        trangThaiClass += "bg-success";
        break;
      case "Đã khởi hành":
        trangThaiClass += "bg-primary";
        break;
      case "Đã hủy":
        trangThaiClass += "bg-danger";
        break;
      case "Hoàn thành":
        trangThaiClass += "bg-info";
        break;
      default:
        trangThaiClass += "bg-secondary";
    }

    row.innerHTML = `
            <td><input type="checkbox" class="select-row"></td>
            <td>${flight.ID_ChuyenBay}</td>
            <td>${sanBayDi.TenSanBay}</td>
            <td>${sanBayDen.TenSanBay}</td>
            <td>${tenMayBay}</td>
            <td>${khoiHanh}</td>
            <td>${haCanh}</td>
            <td>${formattedPrice}</td>
            <td><span class="${trangThaiClass}">${flight.TrangThai}</span></td>
            <td class="actions">
                <button class="btn btn-sm btn-info" onclick="viewFlight(${flight.ID_ChuyenBay})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-primary" onclick="editFlight(${flight.ID_ChuyenBay})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteFlight(${flight.ID_ChuyenBay})"><i class="fas fa-trash"></i></button>
            </td>
        `;
    tableBody.appendChild(row);
  });

  updatePagination();
}

// Cập nhật thông tin phân trang
function updatePagination() {
  totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  document.getElementById("currentPage").textContent = currentPage;
  document.getElementById("totalPages").textContent = totalPages;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Lọc dữ liệu theo các tiêu chí
function applyFilters() {
  const searchTerm = document
    .getElementById("searchFlight")
    .value.toLowerCase();
  const statusFilter = document.getElementById("filterStatus").value;

  filteredData = flightsData.filter((flight) => {
    // Tìm sân bay đi và đến để lọc tên
    const sanBayDi = sanBayList.find(
      (sb) => sb.ID_SanBay === flight.ID_SanBayDi
    );
    const sanBayDen = sanBayList.find(
      (sb) => sb.ID_SanBay === flight.ID_SanBayDen
    );

    // Lọc theo tìm kiếm (ID, tên sân bay, tên máy bay, trạng thái)
    const searchMatch =
      searchTerm === "" ||
      flight.ID_ChuyenBay.toString().includes(searchTerm) ||
      (sanBayDi && sanBayDi.TenSanBay.toLowerCase().includes(searchTerm)) ||
      (sanBayDen && sanBayDen.TenSanBay.toLowerCase().includes(searchTerm)) ||
      flight.TrangThai.toLowerCase().includes(searchTerm);

    // Lọc theo trạng thái
    const statusMatch =
      statusFilter === "" || flight.TrangThai === statusFilter;

    return searchMatch && statusMatch;
  });

  currentPage = 1; // Reset lại trang đầu tiên khi lọc
  displayFlights();
}

// Xem chi tiết chuyến bay
function viewFlight(id) {
  const flight = flightsData.find((f) => f.ID_ChuyenBay === id);
  if (!flight) {
    showNotification("Không tìm thấy chuyến bay!", "error");
    return;
  }

  // Tìm thông tin sân bay và máy bay
  const sanBayDi = sanBayList.find(
    (sb) => sb.ID_SanBay === flight.ID_SanBayDi
  ) || { TenSanBay: "Không xác định", MaSanBay: "" };
  const sanBayDen = sanBayList.find(
    (sb) => sb.ID_SanBay === flight.ID_SanBayDen
  ) || { TenSanBay: "Không xác định", MaSanBay: "" };

  // Xử lý hiển thị thông tin máy bay
  const mayBay = mayBayList.find((mb) => mb.ID_MayBay === flight.ID_MayBay);
  let tenMayBay = "Không xác định";
  let maMayBay = "";

  if (mayBay) {
    // Tên máy bay
    if (mayBay.LoaiMayBay) {
      tenMayBay = mayBay.LoaiMayBay;
      if (mayBay.HangSanXuat) {
        tenMayBay += ` - ${mayBay.HangSanXuat}`;
      }
    } else if (mayBay.TenMayBay) {
      tenMayBay = mayBay.TenMayBay;
    } else if (mayBay.loaiMayBay) {
      tenMayBay = mayBay.loaiMayBay;
    }

    // Mã máy bay
    maMayBay = mayBay.MaMayBay || mayBay.ID_MayBay || "";
  }

  // Format thời gian
  const khoiHanh = new Date(flight.ThoiGianKhoiHanh).toLocaleString("vi-VN");
  const haCanh = new Date(flight.ThoiGianHaCanh).toLocaleString("vi-VN");

  // Format giá tiền
  const formattedPrice =
    parseInt(flight.GiaCoSo).toLocaleString("vi-VN") + " VND";

  // Tính thời gian bay
  const thoiGianKhoiHanh = new Date(flight.ThoiGianKhoiHanh);
  const thoiGianHaCanh = new Date(flight.ThoiGianHaCanh);
  const diffMs = thoiGianHaCanh - thoiGianKhoiHanh;
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
  const flightDuration = `${diffHrs} giờ ${diffMins} phút`;

  const modalBody = document.getElementById("flightModalBody");
  modalBody.innerHTML = `
        <div class="flight-detail">
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>ID chuyến bay:</strong> ${flight.ID_ChuyenBay}
                </div>
                <div class="col-md-6">
                    <strong>Trạng thái:</strong> <span class="badge ${
                      flight.TrangThai === "Đang mở bán"
                        ? "bg-success"
                        : flight.TrangThai === "Đã hủy"
                        ? "bg-danger"
                        : "bg-info"
                    }">${flight.TrangThai}</span>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Sân bay đi:</strong> ${sanBayDi.TenSanBay} ${
    sanBayDi.MaSanBay ? `(${sanBayDi.MaSanBay})` : ""
  }
                </div>
                <div class="col-md-6">
                    <strong>Sân bay đến:</strong> ${sanBayDen.TenSanBay} ${
    sanBayDen.MaSanBay ? `(${sanBayDen.MaSanBay})` : ""
  }
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Khởi hành:</strong> ${khoiHanh}
                </div>
                <div class="col-md-6">
                    <strong>Hạ cánh:</strong> ${haCanh}
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Máy bay:</strong> ${tenMayBay} ${
    maMayBay ? `(${maMayBay})` : ""
  }
                </div>
                <div class="col-md-6">
                    <strong>Thời gian bay:</strong> ${flightDuration}
                </div>
            </div>
            
            <div class="row">
                <div class="col-12">
                    <strong>Giá cơ sở:</strong> ${formattedPrice}
                </div>
            </div>
        </div>
    `;

  // Hiển thị modal
  const modal = new bootstrap.Modal(
    document.getElementById("flightDetailModal")
  );
  document.getElementById(
    "flightModalTitle"
  ).textContent = `Chi tiết chuyến bay #${flight.ID_ChuyenBay}`;
  modal.show();
}

// Populate dữ liệu sân bay và máy bay vào các dropdown
function populateDropdowns() {
  console.log("Đang tạo dropdown với dữ liệu:", { sanBayList, mayBayList });

  // Populate sân bay đi và đến
  const sanBayOptions = sanBayList
    .map(
      (sb) =>
        `<option value="${sb.ID_SanBay}">${sb.TenSanBay} (${
          sb.MaSanBay || "Không xác định"
        })</option>`
    )
    .join("");

  // Populate cho modal thêm mới
  document.getElementById("addSanBayDi").innerHTML =
    '<option value="">-- Chọn sân bay đi --</option>' + sanBayOptions;
  document.getElementById("addSanBayDen").innerHTML =
    '<option value="">-- Chọn sân bay đến --</option>' + sanBayOptions;

  // Populate cho modal chỉnh sửa
  document.getElementById("editSanBayDi").innerHTML =
    '<option value="">-- Chọn sân bay đi --</option>' + sanBayOptions;
  document.getElementById("editSanBayDen").innerHTML =
    '<option value="">-- Chọn sân bay đến --</option>' + sanBayOptions;

  // Populate máy bay - Kiểm tra và sử dụng các trường dữ liệu có sẵn trong API
  const mayBayOptions = mayBayList
    .map((mb) => {
      // Kiểm tra các trường có thể có của máy bay
      const tenHienThi =
        mb.LoaiMayBay || mb.TenMayBay || mb.loaiMayBay || "Máy bay";
      const maHienThi = mb.MaMayBay || "";
      const hangSanXuat = mb.HangSanXuat || mb.hangSanXuat || "";

      // Tạo text hiển thị cho option
      let displayText = tenHienThi;
      if (hangSanXuat) {
        displayText += ` - ${hangSanXuat}`;
      }
      if (maHienThi) {
        displayText += ` (${maHienThi})`;
      }

      return `<option value="${mb.ID_MayBay}">${displayText}</option>`;
    })
    .join("");

  // In ra console để debug
  console.log("Tạo options máy bay:", mayBayOptions);

  // Populate cho modal thêm mới
  document.getElementById("addMayBay").innerHTML =
    '<option value="">-- Chọn máy bay --</option>' + mayBayOptions;

  // Populate cho modal chỉnh sửa
  document.getElementById("editMayBay").innerHTML =
    '<option value="">-- Chọn máy bay --</option>' + mayBayOptions;
}

// Chuẩn bị modal thêm chuyến bay
function handleAddFlight(e) {
  e.preventDefault();

  const form = document.getElementById("flightAddForm");
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  // Lấy raw datetime từ input (có dạng "YYYY-MM-DDTHH:mm" hoặc "YYYY-MM-DDTHH:mm:ss")
  const rawKhoiHanh = document.getElementById("addKhoiHanh").value;
  const rawHaCanh = document.getElementById("addHaCanh").value;

  // Chuyển sang định dạng "YYYY-MM-DD HH:mm:ss"
  const formatDateTime = (dtStr) => {
    if (!dtStr) return null;
    return (
      dtStr.replace("T", " ") +
      ":00".slice(0, Math.max(0, 3 - dtStr.length + 16))
    );
    // Ví dụ "2025-05-15T08:00" => "2025-05-15 08:00:00"
    // Nếu có giây rồi thì giữ nguyên
  };

  const ThoiGianKhoiHanh = formatDateTime(rawKhoiHanh);
  const ThoiGianHaCanh = formatDateTime(rawHaCanh);

  // Validation logic:
  if (
    parseInt(document.getElementById("addSanBayDi").value) ===
    parseInt(document.getElementById("addSanBayDen").value)
  ) {
    showNotification(
      "Sân bay đi và sân bay đến không được trùng nhau!",
      "error"
    );
    return;
  }

  // Kiểm tra thời gian
  const khoiHanh = new Date(ThoiGianKhoiHanh);
  const haCanh = new Date(ThoiGianHaCanh);
  if (haCanh <= khoiHanh) {
    showNotification(
      "Thời gian hạ cánh phải sau thời gian khởi hành!",
      "error"
    );
    return;
  }

  // Chuẩn bị data
  const data = {
    ID_SanBayDi: parseInt(document.getElementById("addSanBayDi").value),
    ID_SanBayDen: parseInt(document.getElementById("addSanBayDen").value),
    ID_MayBay: parseInt(document.getElementById("addMayBay").value),
    ThoiGianKhoiHanh,
    ThoiGianHaCanh,
    GiaCoSo: parseFloat(document.getElementById("addGiaCoSo").value),
    TrangThai: document.getElementById("addTrangThai").value,
  };

  const token = localStorage.getItem("adminToken");

  fetch(`${API_URL}/api/chuyen-bay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Thêm chuyến bay thất bại");
      }
      return response.json();
    })
    .then((result) => {
      showNotification("Thêm chuyến bay thành công!");
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("flightAddModal")
      );
      modal.hide();
      loadFlights();
    })
    .catch((error) => {
      console.error("Lỗi:", error);
      showNotification(error.message, "error");
    });
}

// Chuẩn bị và hiển thị modal chỉnh sửa chuyến bay
function editFlight(id) {
  const flight = flightsData.find((f) => f.ID_ChuyenBay === id);
  if (!flight) {
    showNotification("Không tìm thấy chuyến bay!", "error");
    return;
  }

  // Reset form
  document.getElementById("flightEditForm").reset();

  // Điền dữ liệu vào form
  document.getElementById("editFlightId").value = flight.ID_ChuyenBay;
  document.getElementById("editSanBayDi").value = flight.ID_SanBayDi;
  document.getElementById("editSanBayDen").value = flight.ID_SanBayDen;
  document.getElementById("editMayBay").value = flight.ID_MayBay;
  document.getElementById("editTrangThai").value = flight.TrangThai;
  document.getElementById("editGiaCoSo").value = flight.GiaCoSo;

  // Format thời gian
  const khoiHanh = new Date(flight.ThoiGianKhoiHanh);
  const khoiHanhStr = khoiHanh.toISOString().slice(0, 16);
  document.getElementById("editKhoiHanh").value = khoiHanhStr;

  const haCanh = new Date(flight.ThoiGianHaCanh);
  const haCanhStr = haCanh.toISOString().slice(0, 16);
  document.getElementById("editHaCanh").value = haCanhStr;

  // Hiển thị modal
  const modal = new bootstrap.Modal(document.getElementById("flightEditModal"));
  modal.show();
}

// Xử lý cập nhật chuyến bay
function handleUpdateFlight(e) {
  e.preventDefault();

  const form = document.getElementById("flightEditForm");
  if (!form.checkValidity()) {
    // Highlight các trường không hợp lệ
    form.classList.add("was-validated");
    return;
  }

  const id = document.getElementById("editFlightId").value;

  try {
    // Lấy dữ liệu từ form
    const rawData = {
      ID_SanBayDi: parseInt(document.getElementById("editSanBayDi").value),
      ID_SanBayDen: parseInt(document.getElementById("editSanBayDen").value),
      ID_MayBay: parseInt(document.getElementById("editMayBay").value),
      ThoiGianKhoiHanh: document.getElementById("editKhoiHanh").value,
      ThoiGianHaCanh: document.getElementById("editHaCanh").value,
      GiaCoSo: parseInt(document.getElementById("editGiaCoSo").value),
      TrangThai: document.getElementById("editTrangThai").value,
    };

    // Kiểm tra dữ liệu đầu vào
    console.log("Dữ liệu chỉnh sửa trước khi xử lý:", rawData);

    // Validation
    if (!rawData.ID_SanBayDi || !rawData.ID_SanBayDen || !rawData.ID_MayBay) {
      showNotification(
        "Vui lòng chọn đủ sân bay đi, sân bay đến và máy bay!",
        "error"
      );
      return;
    }

    if (rawData.ID_SanBayDi === rawData.ID_SanBayDen) {
      showNotification(
        "Sân bay đi và sân bay đến không được trùng nhau!",
        "error"
      );
      return;
    }

    // Xử lý đặc biệt cho ngày giờ - đảm bảo định dạng ngày giờ đúng
    const khoiHanh = new Date(rawData.ThoiGianKhoiHanh);
    const haCanh = new Date(rawData.ThoiGianHaCanh);

    if (isNaN(khoiHanh.getTime()) || isNaN(haCanh.getTime())) {
      showNotification("Thời gian không hợp lệ!", "error");
      console.error(
        "Thời gian không hợp lệ:",
        rawData.ThoiGianKhoiHanh,
        rawData.ThoiGianHaCanh
      );
      return;
    }

    if (haCanh <= khoiHanh) {
      showNotification(
        "Thời gian hạ cánh phải sau thời gian khởi hành!",
        "error"
      );
      return;
    }

    // Chuyển đổi định dạng thời gian thành ISO string đầy đủ
    const data = {
      ...rawData,
      ThoiGianKhoiHanh: khoiHanh.toISOString(),
      ThoiGianHaCanh: haCanh.toISOString(),
    };

    console.log("Dữ liệu chỉnh sửa sau khi xử lý:", data);

    // Gửi request API
    const token = localStorage.getItem("adminToken");

    fetch(`${API_URL}/api/chuyen-bay/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        console.log(
          "API Response status (update):",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          // Đọc nội dung lỗi từ response
          return response.text().then((text) => {
            console.error("API Error Response:", text);
            throw new Error(
              `Cập nhật chuyến bay thất bại: ${response.status} - ${text}`
            );
          });
        }

        // Xác nhận thành công ngay cả khi không có dữ liệu JSON trả về
        return response.text().then((text) => {
          try {
            // Thử parse JSON nếu có
            return text ? JSON.parse(text) : {};
          } catch (e) {
            // Nếu không phải JSON, trả về object trống
            console.log(
              "Phản hồi không phải JSON, nhưng cập nhật vẫn thành công"
            );
            return {};
          }
        });
      })
      .then((result) => {
        console.log("API Response data (update):", result);

        // Cập nhật dữ liệu local
        const index = flightsData.findIndex(
          (f) => f.ID_ChuyenBay.toString() === id.toString()
        );
        if (index !== -1) {
          flightsData[index] = {
            ...flightsData[index],
            ID_SanBayDi: data.ID_SanBayDi,
            ID_SanBayDen: data.ID_SanBayDen,
            ID_MayBay: data.ID_MayBay,
            ThoiGianKhoiHanh: data.ThoiGianKhoiHanh,
            ThoiGianHaCanh: data.ThoiGianHaCanh,
            GiaCoSo: data.GiaCoSo,
            TrangThai: data.TrangThai,
          };

          // Cập nhật filtered data
          filteredData = [...flightsData];

          // Hiển thị lại dữ liệu
          displayFlights();
        }

        showNotification("Cập nhật chuyến bay thành công!");

        // Đóng modal
        try {
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("flightEditModal")
          );
          if (modal) {
            modal.hide();
          } else {
            // Đóng modal theo cách khác nếu không lấy được instance
            const modalElement = document.getElementById("flightEditModal");
            if (modalElement) {
              modalElement.classList.remove("show");
              modalElement.style.display = "none";
              document.body.classList.remove("modal-open");
              const backdrop = document.querySelector(".modal-backdrop");
              if (backdrop) backdrop.remove();
            }
          }
        } catch (error) {
          console.error("Lỗi khi đóng modal:", error);
        }
      })
      .catch((error) => {
        console.error("Lỗi cập nhật chuyến bay:", error);
        showNotification(error.message, "error");
      });
  } catch (error) {
    console.error("Lỗi xử lý form:", error);
    showNotification(
      "Có lỗi xảy ra khi xử lý dữ liệu form: " + error.message,
      "error"
    );
  }
}

// Xóa chuyến bay
function deleteFlight(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa chuyến bay này?")) return;
  const token = localStorage.getItem("adminToken");
  fetch(`${API_URL}/api/chuyen-bay/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Xóa chuyến bay thất bại!");
      showNotification("Đã xóa chuyến bay!");
      loadFlights(currentPage);
    })
    .catch((err) => showNotification(err.message, "error"));
}

// Khởi tạo trang
document.addEventListener("DOMContentLoaded", async () => {
  try {
    showLoading();

    // Kiểm tra đăng nhập bằng token
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "./login.html";
      return;
    }

    // Hiển thị tên admin (nếu có)
    const adminName = localStorage.getItem("adminName");
    if (adminName) {
      document.getElementById("adminName").textContent = adminName;
    }

    // Tải song song danh sách sân bay và máy bay
    await Promise.all([loadSanBayList(), loadMayBayList()]);

    // Populate dropdowns sau khi có dữ liệu sân bay và máy bay
    populateDropdowns();

    // Tải dữ liệu chuyến bay
    await loadFlights();

    // Cài đặt sự kiện cho các nút phân trang
    document.getElementById("prevPage").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        displayFlights();
      }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayFlights();
      }
    });

    // Cài đặt sự kiện cho ô tìm kiếm
    document.getElementById("searchFlight").addEventListener("input", () => {
      applyFilters();
    });

    // Cài đặt sự kiện cho bộ lọc trạng thái
    document.getElementById("filterStatus").addEventListener("change", () => {
      applyFilters();
    });

    // Setup event listeners cho form thêm chuyến bay
    const addFlightModal = document.getElementById("flightAddModal");
    if (addFlightModal) {
      addFlightModal.addEventListener("show.bs.modal", function () {
        prepareAddFlightModal();
      });

      document
        .getElementById("flightAddForm")
        .addEventListener("submit", handleAddFlight);
    }

    // Setup event listeners cho form chỉnh sửa chuyến bay
    document
      .getElementById("flightEditForm")
      .addEventListener("submit", handleUpdateFlight);

    hideLoading();
  } catch (error) {
    hideLoading();
    console.error("Lỗi khởi tạo trang:", error);
    showNotification(error.message, "error");
  }
});
