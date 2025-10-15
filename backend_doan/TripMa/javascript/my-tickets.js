// Biến toàn cục
let currentUser = null;
let allTickets = [];
let filteredTickets = [];
let currentEditingPassenger = null;

// API endpoints
const API_BASE = "http://localhost:3000/api";

// Hàm format tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
}

// Hàm format thời gian
function formatTime(dateString) {
  const date = new Date(dateString);
  date.setHours(date.getHours() - 7); // 👈 Trừ 7 tiếng để đưa về giờ VN gốc
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  date.setHours(date.getHours() - 7); // 👈 Trừ luôn
  return date.toLocaleDateString("vi-VN");
}
// Hàm xác định trạng thái vé
function getTicketStatus(departureTime) {
  if (!departureTime) return "unknown";

  const now = new Date();
  const departure = new Date(departureTime);

  if (departure > now) {
    return "upcoming";
  } else {
    return "completed";
  }
}

// Hàm lấy thông tin user
function getCurrentUser() {
  try {
    // Debug: In ra tất cả dữ liệu trong localStorage
    console.log("=== DEBUG USER DATA ===");
    console.log("localStorage.user:", localStorage.getItem("user"));
    console.log("localStorage.userId:", localStorage.getItem("userId"));
    console.log("sessionStorage.user:", sessionStorage.getItem("user"));
    console.log("sessionStorage.userId:", sessionStorage.getItem("userId"));

    let user = JSON.parse(localStorage.getItem("user") || "{}");

    // Xử lý cấu trúc dữ liệu user có thể là { user: {...} } hoặc trực tiếp {...}
    if (user && user.user) {
      user = user.user;
    }

    // Nếu không có user trong localStorage, thử sessionStorage
    if (!user || Object.keys(user).length === 0) {
      console.log(
        "Không tìm thấy user trong localStorage, thử sessionStorage..."
      );
      user = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (user && user.user) {
        user = user.user;
      }
    }

    // Kiểm tra user có hợp lệ không
    if (!user || Object.keys(user).length === 0) {
      console.log("Không tìm thấy thông tin user trong storage");
      return null;
    }

    // Đảm bảo có ID_NguoiDung
    if (!user.ID_NguoiDung && !user.id) {
      const userId =
        localStorage.getItem("userId") || sessionStorage.getItem("userId");
      if (userId) {
        user.ID_NguoiDung = parseInt(userId);
      } else {
        console.log("Không tìm thấy ID user");
        return null;
      }
    }

    // Đảm bảo có ID_NguoiDung từ user.id nếu cần
    if (!user.ID_NguoiDung && user.id) {
      user.ID_NguoiDung = user.id;
    }

    console.log("Final user object:", user);
    return user;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return null;
  }
}

// Hàm cập nhật thông tin user trong header
function updateUserInfo() {
  currentUser = getCurrentUser();

  const userNameEl = document.getElementById("user-name");
  const userEmailEl = document.getElementById("user-email");
  const userAvatarEl = document.getElementById("user-avatar");

  if (currentUser && (currentUser.hoTen || currentUser.HoTen)) {
    const fullName = currentUser.hoTen || currentUser.HoTen || "";
    const email = currentUser.email || currentUser.Email || "";

    if (userNameEl) userNameEl.textContent = fullName;
    if (userEmailEl) userEmailEl.textContent = email || "Chưa có email";
    if (userAvatarEl) {
      const firstLetter = fullName.charAt(0).toUpperCase();
      userAvatarEl.textContent = firstLetter || "U";
    }
  } else {
    if (userNameEl) userNameEl.textContent = "Khách";
    if (userEmailEl) userEmailEl.textContent = "Chưa đăng nhập";
    if (userAvatarEl) userAvatarEl.textContent = "K";
  }
}

// Hàm lấy danh sách vé từ API
async function loadUserTickets() {
  try {
    console.log("=== BẮT ĐẦU TẢI VÉ ===");

    // Cập nhật thông tin user trước
    currentUser = getCurrentUser();

    if (!currentUser) {
      console.error("getCurrentUser trả về null");
      showEmptyState();
      return;
    }

    console.log("Đang tải vé cho user:", currentUser);
    showLoadingState();

    // Lấy token từ localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const token = userData.token;

    if (!token) {
      console.error("Không tìm thấy token");
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      window.location.href = "../dangnhap/dangnhap.html";
      return;
    }

    const apiUrl = `${API_BASE}/ve/user`;
    console.log("API URL:", apiUrl);
    console.log("User ID:", currentUser.ID_User);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../dangnhap/dangnhap.html";
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      if (response.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "../dangnhap/dangnhap.html";
        return;
      }
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const tickets = await response.json();
    console.log("Danh sách vé từ API:", tickets);
    console.log(
      "Số lượng vé:",
      Array.isArray(tickets) ? tickets.length : "Không phải array"
    );

    // Kiểm tra cấu trúc dữ liệu vé
    if (Array.isArray(tickets) && tickets.length > 0) {
      console.log("Cấu trúc vé đầu tiên:", JSON.stringify(tickets[0], null, 2));
    }

    allTickets = Array.isArray(tickets) ? tickets : [];
    filteredTickets = [...allTickets];

    hideLoadingState();

    if (allTickets.length === 0) {
      console.log("Không có vé nào, hiển thị empty state");
      showEmptyState();
    } else {
      console.log("Hiển thị", allTickets.length, "vé");
      renderTickets(filteredTickets);
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách vé:", error);
    hideLoadingState();

    const errorMessage = error.message.includes("Failed to fetch")
      ? "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
      : `Có lỗi xảy ra: ${error.message}`;

    alert(errorMessage);
    showEmptyState();
  }
}

// Hiển thị trạng thái loading
function showLoadingState() {
  const loadingEl = document.getElementById("loading-state");
  const emptyEl = document.getElementById("empty-state");
  const ticketsListEl = document.getElementById("tickets-list");

  if (loadingEl) loadingEl.style.display = "block";
  if (emptyEl) emptyEl.style.display = "none";
  if (ticketsListEl) ticketsListEl.style.display = "none";
}

// Ẩn trạng thái loading
function hideLoadingState() {
  const loadingEl = document.getElementById("loading-state");
  if (loadingEl) loadingEl.style.display = "none";
}

// Hiển thị trạng thái empty
function showEmptyState() {
  const emptyEl = document.getElementById("empty-state");
  const ticketsListEl = document.getElementById("tickets-list");

  if (emptyEl) emptyEl.style.display = "block";
  if (ticketsListEl) ticketsListEl.style.display = "none";
}

// Render danh sách vé
function renderTickets(tickets) {
  const ticketsListEl = document.getElementById("tickets-list");
  const emptyEl = document.getElementById("empty-state");

  if (!ticketsListEl) return;

  if (tickets.length === 0) {
    showEmptyState();
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  ticketsListEl.style.display = "block";

  ticketsListEl.innerHTML = tickets
    .map((ticket) => createTicketCard(ticket))
    .join("");

  // Gắn event listeners cho các nút
  attachTicketEventListeners();
}

// Tạo card vé
function createTicketCard(ticket) {
  const status = getTicketStatus(ticket.ThoiGianKhoiHanh);
  const statusClass = `status-${status}`;
  const statusText =
    ticket.TrangThai ||
    (status === "upcoming"
      ? "Sắp tới"
      : status === "completed"
      ? "Đã bay"
      : "Đã hủy");

  const departureTime = formatTime(ticket.ThoiGianKhoiHanh);
  const arrivalTime = formatTime(ticket.ThoiGianHaCanh);
  const departureDate = formatDate(ticket.ThoiGianKhoiHanh);
  const arrivalDate = formatDate(ticket.ThoiGianHaCanh);
  const services = ticket.DichVu
    ? ticket.DichVu.map(
        (service) =>
          `<li>${service.TenDichVu} - ${formatCurrency(service.GiaDichVu)}</li>`
      ).join("")
    : "<li>Không có dịch vụ bổ sung</li>";
  return `
        <div class="ticket-card" data-ticket-id="${ticket.ID_Ve}">
            <div class="ticket-header">
                <div class="ticket-info">
                    <div class="ticket-number">${ticket.ID_Ve}</div>
                    <div class="flight-route">
                        <span>${ticket.ThanhPhoDi}</span>
                        <span class="flight-arrow">✈️</span>
                        <span>${ticket.ThanhPhoDen}</span>
                    </div>
                </div>
                <div class="ticket-status ${statusClass}">${statusText}</div>
            </div>

            <div class="ticket-body">
                <div class="flight-details">
                    <div class="flight-time">
                        <div class="time">${departureTime}</div>
                        <div class="date">${departureDate}</div>
                        <div class="airport">${ticket.TenSanBayDi}</div>
                    </div>

                    <div class="flight-duration">
                        <span>Chuyến bay ${ticket.ID_ChuyenBay}</span>
                    </div>

                    <div class="flight-time">
                        <div class="time">${arrivalTime}</div>
                        <div class="date">${arrivalDate}</div>
                        <div class="airport">${ticket.TenSanBayDen}</div>
                    </div>
                </div>

                <div class="passengers-section">
                    <div class="section-title">👤 Hành khách</div>
                    <div class="passengers-list">
                        <div class="passenger-item">
                            <div class="passenger-info">
                                <div class="passenger-avatar">${
                                  ticket.HanhKhach?.HoTen?.charAt(0) || "H"
                                }</div>
                                <div class="passenger-details">
                                    <h4>${
                                      ticket.HanhKhach?.HoTen || "Chưa có tên"
                                    }</h4>
                                    <div class="passenger-meta">
                                        ${
                                          ticket.HanhKhach?.SoHoChieu_CCCD
                                            ? "CCCD: " +
                                              ticket.HanhKhach.SoHoChieu_CCCD
                                            : ""
                                        }
                                        ${
                                          ticket.HanhKhach?.SDT
                                            ? " • SĐT: " + ticket.HanhKhach.SDT
                                            : ""
                                        }
                                    </div>
                                </div>
                            </div>
                            <div class="seat-info">
                                <div class="seat-number">Số Ghế: ${
                                  ticket.Ghe?.SoGhe || "N/A"
                                }</div>
                                <div class="hang">Hàng: ${
                                  ticket.Ghe?.Hang || "N/A"
                                }</div>
                                <div class="seat-class">Loại Ghế: ${
                                  ticket.Ghe?.LoaiGhe || "Phổ thông"
                                }</div>
                               
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ticket-actions">
                    <div class="price-info">${formatCurrency(
                      ticket.GiaVe || 0
                    )}</div>
                    <div class="action-buttons">
                        <button class="btn btn-outline" onclick="viewTicketDetail('${
                          ticket.ID_Ve
                        }')">
                            📄 Chi tiết
                        </button>
                        ${
                          status === "upcoming"
                            ? `
                            <button class="btn btn-primary" onclick="downloadTicket('${ticket.ID_Ve}')">
                                📥 Tải vé
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Gắn event listeners
function attachTicketEventListeners() {
  // Event listeners đã được gắn thông qua onclick trong HTML
  console.log("Event listeners đã được gắn cho các vé");
}

// Hàm chỉnh sửa thông tin hành khách
async function editPassenger(passengerId, ticketId) {
  try {
    console.log("Chỉnh sửa hành khách:", passengerId, "của vé:", ticketId);

    // Tìm thông tin hành khách từ danh sách vé
    const ticket = allTickets.find((t) => t.ID_Ve === ticketId);
    if (!ticket || !ticket.HanhKhach) {
      alert("Không tìm thấy thông tin hành khách!");
      return;
    }

    const passenger = ticket.HanhKhach;
    currentEditingPassenger = { ...passenger, ticketId };

    // Điền thông tin vào form
    document.getElementById("edit-fullname").value = passenger.HoTen || "";
    document.getElementById("edit-dob").value = passenger.NgaySinh
      ? passenger.NgaySinh.split("T")[0]
      : "";
    document.getElementById("edit-gender").value = passenger.GioiTinh || "";
    document.getElementById("edit-id-number").value =
      passenger.SoHoChieu_CCCD || "";
    document.getElementById("edit-phone").value = passenger.SDT || "";
    document.getElementById("edit-email").value = passenger.Email || "";
    document.getElementById("edit-address").value = passenger.DiaChi || "";

    // Hiển thị modal
    const modal = document.getElementById("edit-passenger-modal");
    if (modal) modal.style.display = "flex";
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa hành khách:", error);
    alert("Có lỗi xảy ra khi tải thông tin hành khách!");
  }
}

// Hàm lưu thông tin hành khách đã chỉnh sửa
async function savePassengerEdit() {
  try {
    if (!currentEditingPassenger) {
      alert("Không có thông tin hành khách để lưu!");
      return;
    }

    const formData = {
      hoTen: document.getElementById("edit-fullname").value.trim(),
      ngaySinh: document.getElementById("edit-dob").value,
      gioiTinh: document.getElementById("edit-gender").value,
      soHoChieu_CCCD: document.getElementById("edit-id-number").value.trim(),
      sdt: document.getElementById("edit-phone").value.trim(),
      email: document.getElementById("edit-email").value.trim(),
      diaChi: document.getElementById("edit-address").value.trim(),
    };

    // Validate dữ liệu
    if (!formData.hoTen) {
      alert("Vui lòng nhập họ tên!");
      return;
    }

    if (
      formData.soHoChieu_CCCD &&
      !/^\d{9}$|^\d{12}$/.test(formData.soHoChieu_CCCD)
    ) {
      alert("Số CMND/CCCD phải gồm 9 hoặc 12 chữ số!");
      return;
    }

    if (formData.sdt && !/^0\d{9}$/.test(formData.sdt)) {
      alert("Số điện thoại phải gồm 10 số và bắt đầu bằng số 0!");
      return;
    }

    // Gửi API cập nhật
    const response = await fetch(
      `${API_BASE}/hanhkhach/${currentEditingPassenger.ID_HanhKhach}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }

    const result = await response.json();
    console.log("Cập nhật thành công:", result);

    // Cập nhật dữ liệu local
    const ticketIndex = allTickets.findIndex(
      (t) => t.ID_Ve === currentEditingPassenger.ticketId
    );
    if (ticketIndex !== -1) {
      allTickets[ticketIndex].HanhKhach = {
        ...allTickets[ticketIndex].HanhKhach,
        ...formData,
      };

      // Cập nhật filteredTickets nếu cần
      const filteredIndex = filteredTickets.findIndex(
        (t) => t.ID_Ve === currentEditingPassenger.ticketId
      );
      if (filteredIndex !== -1) {
        filteredTickets[filteredIndex].HanhKhach = {
          ...filteredTickets[filteredIndex].HanhKhach,
          ...formData,
        };
      }
    }

    // Đóng modal và render lại
    closeEditModal();
    renderTickets(filteredTickets);

    alert("Cập nhật thông tin hành khách thành công!");
  } catch (error) {
    console.error("Lỗi khi lưu thông tin hành khách:", error);
    alert("Có lỗi xảy ra khi cập nhật thông tin: " + error.message);
  }
}

// Đóng modal chỉnh sửa
function closeEditModal() {
  const modal = document.getElementById("edit-passenger-modal");
  if (modal) modal.style.display = "none";
  currentEditingPassenger = null;
}

// Xem chi tiết vé
async function viewTicketDetail(ticketId) {
  try {
    const apiUrl = `${API_BASE}/ve/chi-tiet/${ticketId}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const ticketDetail = await response.json();
    console.log("Chi tiết vé:", ticketDetail);

    // Hiển thị thông tin trong modal
    const modal = document.getElementById("ticket-detail-modal");
    const content = document.getElementById("ticket-detail-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="ticket-detail">
        <div class="detail-section">
          <h4>Thông tin vé</h4>
          <div class="detail-grid">
            <div class="detail-item"><label>Mã vé:</label><span>${
              ticketDetail.ve.ID_Ve
            }</span></div>
            <div class="detail-item"><label>Giá vé:</label><span>${formatCurrency(
              ticketDetail.chuyenBay.GiaCoSo
            )}</span></div>
            <div class="detail-item"><label>Trạng thái:</label><span>${
              ticketDetail.ve.TrangThai
            }</span></div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Thông tin chuyến bay</h4>
          <div class="detail-grid">
            <div class="detail-item"><label>Mã chuyến bay:</label><span>${
              ticketDetail.chuyenBay.ID_ChuyenBay
            }</span></div>
            <div class="detail-item"><label>Khởi hành:</label><span>${formatTime(
              ticketDetail.chuyenBay.ThoiGianKhoiHanh
            )} - ${formatDate(
      ticketDetail.chuyenBay.ThoiGianKhoiHanh
    )}</span></div>
            <div class="detail-item"><label>Hạ cánh:</label><span>${formatTime(
              ticketDetail.chuyenBay.ThoiGianHaCanh
            )} - ${formatDate(
      ticketDetail.chuyenBay.ThoiGianHaCanh
    )}</span></div>
            <div class="detail-item"><label>Sân bay đi:</label><span>${
              ticketDetail.sanBayDi.TenSanBay
            } (${ticketDetail.sanBayDi.ThanhPho})</span></div>
            <div class="detail-item"><label>Sân bay đến:</label><span>${
              ticketDetail.sanBayDen.TenSanBay
            } (${ticketDetail.sanBayDen.ThanhPho})</span></div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Thông tin ghế</h4>
          <div class="detail-grid">
            <div class="detail-item"><label>Số ghế:</label><span>${
              ticketDetail.ghe.SoGhe
            }</span></div>
            <div class="detail-item"><label>Loại ghế:</label><span>${
              ticketDetail.ghe?.loaiGhe?.TenLoai || "Không xác định"
            }</span></div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Thông tin hành khách</h4>
          <div class="detail-grid">
            <div class="detail-item"><label>Họ tên:</label><span>${
              ticketDetail.hanhKhach.HoTen
            }</span></div>
            <div class="detail-item"><label>Ngày sinh:</label><span>${formatDate(
              ticketDetail.hanhKhach.NgaySinh
            )}</span></div>
            <div class="detail-item"><label>CMND/CCCD:</label><span>${
              ticketDetail.hanhKhach.SoHoChieu_CCCD
            }</span></div>
            <div class="detail-item"><label>Số điện thoại:</label><span>${
              ticketDetail.hanhKhach.SDT
            }</span></div>
            <div class="detail-item"><label>Email:</label><span>${
              ticketDetail.hanhKhach.Email
            }</span></div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Dịch vụ bổ sung</h4>
          <ul>
            ${ticketDetail.dichVus
              .map(
                (dv) =>
                  `<li>${dv.TenDichVu} - ${formatCurrency(dv.GiaDichVu)}</li>`
              )
              .join("")}
          </ul>
        </div>

        <div class="detail-section">
          <h4>Thông tin hóa đơn</h4>
          <div class="detail-grid">
            <div class="detail-item"><label>Mã hóa đơn:</label><span>${
              ticketDetail.hoaDon?.ID_HoaDon || "N/A"
            }</span></div>
            <div class="detail-item"><label>Tổng tiền:</label><span>${formatCurrency(
              ticketDetail.hoaDon?.TongTien || 0
            )}</span></div>
          </div>
          <h5>Chi tiết thanh toán</h5>
          <ul>
            ${ticketDetail.chiTietThanhToan
              .map(
                (ct) =>
                  `<li>${ct.TenPhuongThuc} - ${formatCurrency(ct.SoTien)}</li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
    `;

    modal.style.display = "flex";
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết vé:", error);
    alert("Không thể tải chi tiết vé. Vui lòng thử lại sau.");
  }
}
// Tải vé
function downloadTicket(ticketId) {
  // Tạm thời chỉ hiển thị thông báo
  alert(
    `Tính năng tải vé ${ticketId} sẽ được phát triển trong phiên bản tiếp theo!`
  );
}

// Hàm tìm kiếm và lọc
function setupSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // Tìm kiếm
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase().trim();
      filterTickets(searchTerm, getActiveFilter());
    });
  }

  // Lọc theo trạng thái
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Cập nhật active state
      filterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const status = this.dataset.status;
      const searchTerm = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";
      filterTickets(searchTerm, status);
    });
  });
}

// Lấy filter đang active
function getActiveFilter() {
  const activeBtn = document.querySelector(".filter-btn.active");
  return activeBtn ? activeBtn.dataset.status : "all";
}

// Lọc vé
function filterTickets(searchTerm, statusFilter) {
  let filtered = [...allTickets];

  // Lọc theo tìm kiếm
  if (searchTerm) {
    filtered = filtered.filter((ticket) => {
      return (
        ticket.ID_Ve.toString().toLowerCase().includes(searchTerm) ||
        ticket.ID_ChuyenBay.toString().toLowerCase().includes(searchTerm) ||
        (ticket.HanhKhach?.HoTen || "").toLowerCase().includes(searchTerm) ||
        (ticket.SanBayDi?.ThanhPho || "").toLowerCase().includes(searchTerm) ||
        (ticket.SanBayDen?.ThanhPho || "").toLowerCase().includes(searchTerm)
      );
    });
  }

  // Lọc theo trạng thái
  if (statusFilter !== "all") {
    filtered = filtered.filter((ticket) => {
      if (statusFilter === "upcoming") {
        return new Date(ticket.ThoiGianKhoiHanh) > new Date();
      } else if (statusFilter === "completed") {
        return new Date(ticket.ThoiGianKhoiHanh) <= new Date();
      } else if (statusFilter === "cancelled") {
        return ticket.TrangThai === "Đã hủy";
      }
      return true;
    });
  }

  filteredTickets = filtered;
  renderTickets(filteredTickets);
}

// Khởi tạo khi DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Trang vé đã đặt đã tải");

  // Kiểm tra user
  const user = getCurrentUser();
  if (!user) {
    console.log("Không có thông tin user, cần đăng nhập");
    alert("Vui lòng đăng nhập để xem vé đã đặt");
    // Redirect về trang đăng nhập hoặc trang chủ
    window.location.href = "html/dangnhap/dangnhap.html";
    return;
  }

  // Cập nhật thông tin user
  updateUserInfo();

  // Thiết lập event listeners
  setupEventListeners();

  // Thiết lập tìm kiếm và lọc
  setupSearchAndFilter();

  // Tải danh sách vé
  loadUserTickets();
});

// Thiết lập event listeners
function setupEventListeners() {
  // Nút quay lại
  const backBtn = document.getElementById("back-button");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.history.back();
    });
  }

  // Đóng modal chỉnh sửa
  const closeEditBtn = document.getElementById("close-edit-modal");
  const cancelEditBtn = document.getElementById("cancel-edit");
  if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditModal);

  // Đóng modal chi tiết
  const closeDetailBtn = document.getElementById("close-detail-modal");
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener("click", function () {
      const modal = document.getElementById("ticket-detail-modal");
      if (modal) modal.style.display = "none";
    });
  }

  // Form chỉnh sửa hành khách
  const editForm = document.getElementById("edit-passenger-form");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();
      savePassengerEdit();
    });
  }

  // Đóng modal khi click outside
  window.addEventListener("click", function (e) {
    const editModal = document.getElementById("edit-passenger-modal");
    const detailModal = document.getElementById("ticket-detail-modal");

    if (e.target === editModal) {
      closeEditModal();
    }

    if (e.target === detailModal) {
      detailModal.style.display = "none";
    }
  });
}

// Export các hàm để sử dụng trong HTML
window.editPassenger = editPassenger;
window.viewTicketDetail = viewTicketDetail;
window.downloadTicket = downloadTicket;
