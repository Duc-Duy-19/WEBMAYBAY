// Common JavaScript functionality

// API Configuration
const API_BASE_URL = "http://localhost:3000";
const USE_MOCK_DATA = false; // Đặt thành true để sử dụng dữ liệu mẫu

// Thêm liên kết đến trang quản lý vé vào sidebar khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra xem sidebar có tồn tại không
  const sidebar = document.querySelector(".sidebar-menu");
  if (sidebar) {
    // Kiểm tra xem liên kết đến trang vé đã tồn tại chưa
    const existingVeLink = Array.from(sidebar.querySelectorAll("a")).find(a => 
      a.getAttribute("href") === "ve.html" || a.getAttribute("href") === "./ve.html"
    );
    
    // Nếu chưa có liên kết đến trang vé, thêm vào
    if (!existingVeLink) {
      // Tìm vị trí để chèn (trước liên kết đến hóa đơn)
      const hoadonItem = Array.from(sidebar.querySelectorAll("li")).find(li => {
        const link = li.querySelector("a");
        return link && (link.getAttribute("href") === "hoadon.html" || link.getAttribute("href") === "./hoadon.html");
      });
      
      if (hoadonItem) {
        // Tạo phần tử mới cho menu vé
        const veMenuItem = document.createElement("li");
        veMenuItem.className = "menu-item";
        veMenuItem.innerHTML = `
          <a href="ve.html">
            <i class="fas fa-ticket-alt"></i>
            <span>Vé máy bay</span>
          </a>
        `;
        
        // Chèn trước mục hóa đơn
        sidebar.insertBefore(veMenuItem, hoadonItem);
      }
    }
  }
});

// Toggle Sidebar
function toggleSidebar() {
  document
    .querySelector(".admin-container")
    .classList.toggle("sidebar-collapsed");
}

// Toggle Submenu
document.addEventListener("DOMContentLoaded", function () {
  // Tìm tất cả các menu-item có submenu bằng cách kiểm tra con
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    const submenu = item.querySelector(".submenu");
    if (!submenu) return; // Bỏ qua nếu không có submenu

    const menuLink = item.querySelector("a");

    // Mặc định hiển thị submenu nếu menu cha đang active
    if (item.classList.contains("active")) {
      submenu.style.display = "block";
    } else {
      submenu.style.display = "none";
    }

    menuLink.addEventListener("click", function (e) {
      e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ a

      // Toggle hiển thị submenu
      if (submenu.style.display === "none" || submenu.style.display === "") {
        submenu.style.display = "block";
      } else {
        submenu.style.display = "none";
      }
    });
  });
});

// Kiểm tra đăng nhập
function checkAuth() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Logout function
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

// Generic API call function
async function apiCall(endpoint, method = "GET", data = null) {
  const token = localStorage.getItem("adminToken");

  try {
    const config = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    };

    if (data && method !== "GET") {
      config.body = JSON.stringify(data);
    }

    console.log(
      `Đang gọi API: ${API_BASE_URL}${endpoint}`,
      method,
      data ? data : ""
    );

    // Thực hiện request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Kiểm tra và log response
    if (!response.ok) {
      console.error(`Lỗi API HTTP ${response.status}: ${response.statusText}`);

      // Thử đọc thông tin lỗi chi tiết từ response
      try {
        const errorBody = await response.text();
        console.error("Chi tiết lỗi:", errorBody);
        
        // Phân tích JSON nếu có thể
        let errorMessage = `Lỗi API: ${response.status} ${response.statusText}`;
        try {
          // Kiểm tra xem errorBody có phải JSON không
          if (errorBody.trim().startsWith('{') && errorBody.trim().endsWith('}')) {
            const errorJson = JSON.parse(errorBody);
            if (errorJson && errorJson.message) {
              errorMessage = errorJson.message;
            }
          } else {
            // Nếu không phải JSON format, sử dụng text gốc
            if (errorBody && errorBody.length < 200) {
              errorMessage = errorBody;
            }
          }
        } catch (jsonError) {
          console.error("Lỗi parse JSON từ error response:", jsonError);
        }
        
        throw new Error(errorMessage);
      } catch (textError) {
        throw new Error(`Lỗi API: ${response.status} ${response.statusText}`);
      }
    }

    // Parse response body
    try {
      const jsonData = await response.json();
      console.log("Phản hồi API thành công:", jsonData);
      return jsonData;
    } catch (jsonError) {
      console.error("Lỗi khi parse JSON:", jsonError);
      const text = await response.text();
      console.log("Phản hồi text:", text);
      return text || {};
    }
  } catch (error) {
    console.error(`Lỗi khi gọi API ${endpoint}:`, error);

    if (USE_MOCK_DATA) {
      console.warn(`Chuyển sang dữ liệu mẫu cho ${endpoint}`);
      return await mockApiCall(endpoint, method, data);
    } else {
      throw error;
    }
  }
}

// Mock API call khi chưa có kết nối API thực tế
async function mockApiCall(endpoint, method, data) {
  console.log(`Đang dùng dữ liệu mẫu cho: ${endpoint} (${method})`, data);

  // Mock người dùng
  if (endpoint.includes("users")) {
    // Lấy dữ liệu người dùng từ localStorage hoặc dùng dữ liệu mẫu
    let mockUsers = JSON.parse(localStorage.getItem("mockUsers")) || [
      {
        ID_User: 1,
        Email: "user1@gmail.com",
        HoTen: "Đỗ Văn Phúc",
        MatKhau: "123",
        SDT: "0956789012",
      },
      {
        ID_User: 2,
        Email: "user2@gmail.com",
        HoTen: "Ngô Thị Giang",
        MatKhau: "1234",
        SDT: "0967890123",
      },
      {
        ID_User: 3,
        Email: "user3@gmail.com",
        HoTen: "Vũ Văn Hùng",
        MatKhau: "12345",
        SDT: "0978901234",
      },
      {
        ID_User: 4,
        Email: "user4@gmail.com",
        HoTen: "Đặng Thị Lan",
        MatKhau: "123456",
        SDT: "0989012345",
      },
      {
        ID_User: 5,
        Email: "user5@gmail.com",
        HoTen: "Bùi Văn Minh",
        MatKhau: "1234567",
        SDT: "0990123456",
      },
      {
        ID_User: 6,
        Email: "user6@gmail.com",
        HoTen: "Lê Toàn Thắng",
        MatKhau: "123",
        SDT: "0816242664",
      },
    ];

    // Thêm người dùng mới
    if (
      method === "POST" &&
      (endpoint === "/api/users" || endpoint === "/users")
    ) {
      // Kiểm tra dữ liệu đầu vào
      if (!data || !data.Email || !data.MatKhau) {
        throw new Error("Dữ liệu không hợp lệ");
      }

      // Kiểm tra trùng email
      const existingUser = mockUsers.find(
        (user) => user.Email.toLowerCase() === data.Email.toLowerCase()
      );
      if (existingUser) {
        const error = new Error("Email đã tồn tại trong hệ thống");
        error.message = "duplicate";
        throw error;
      }

      // Tạo ID mới
      const newId =
        mockUsers.length > 0
          ? Math.max(...mockUsers.map((user) => user.ID_User)) + 1
          : 1;

      // Tạo người dùng mới
      const newUser = {
        ID_User: newId,
        Email: data.Email,
        HoTen: data.HoTen || "",
        MatKhau: data.MatKhau,
        SDT: data.SDT || "",
        ThoiGianTao: new Date().toISOString(),
      };

      // Thêm vào danh sách
      mockUsers.push(newUser);

      // Lưu vào localStorage
      localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
      console.log("Đã lưu người dùng mới vào localStorage:", newUser);

      // Trả về kết quả
      return newUser;
    }

    // Lấy danh sách người dùng
    if (endpoint === "/api/users" || endpoint === "/users") {
      return {
        data: mockUsers,
        totalPages: 1,
      };
    } else if (
      endpoint.match(/\/api\/users\/\d+$/) ||
      endpoint.match(/\/users\/\d+$/)
    ) {
      const id = parseInt(endpoint.split("/").pop());
      const user = mockUsers.find((user) => user.ID_User === id);

      if (user) {
        return user;
      } else {
        return {
          ID_User: id,
          Email: `user${id}@gmail.com`,
          HoTen: `Người dùng ${id}`,
          MatKhau: `123${id}`,
          SDT: `09${id}0123456`,
        };
      }
    }
  }

  // Mock khách hàng
  if (endpoint.includes("hanhkhach")) {
    // Xử lý tham số tìm kiếm và lọc nếu có
    let searchParam = "";
    let genderParam = "";

    if (endpoint.includes("?")) {
      const queryString = endpoint.split("?")[1];
      const params = new URLSearchParams(queryString);
      searchParam = params.get("search") || "";
      genderParam = params.get("gender") || "";
      console.log("Tìm thấy tham số tìm kiếm và lọc:", {
        searchParam,
        genderParam,
      });
    }

    if (
      endpoint.includes("/api/hanhkhach") ||
      endpoint.includes("/hanhkhach")
    ) {
      // Dữ liệu mẫu cơ bản
      let mockData = [
        {
          MaKH: 1,
          ID_User: 1,
          TenKH: "Đỗ Văn Phúc",
          Email: "user1@gmail.com",
          SDT: "0956789012",
          NgaySinh: "1990-05-15",
          GioiTinh: "nam",
          DiaChi: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        },
        {
          MaKH: 2,
          ID_User: 2,
          TenKH: "Ngô Thị Giang",
          Email: "user2@gmail.com",
          SDT: "0967890123",
          NgaySinh: "1985-08-20",
          GioiTinh: "nữ",
          DiaChi: "456 Lê Lợi, Quận 3, TP.HCM",
        },
        {
          MaKH: 3,
          ID_User: 3,
          TenKH: "Vũ Văn Hùng",
          Email: "user3@gmail.com",
          SDT: "0978901234",
          NgaySinh: "1992-03-10",
          GioiTinh: "nam",
          DiaChi: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
        },
        {
          MaKH: 4,
          ID_User: 4,
          TenKH: "Đặng Thị Lan",
          Email: "user4@gmail.com",
          SDT: "0989012345",
          NgaySinh: "1988-11-25",
          GioiTinh: "nữ",
          DiaChi: "101 Nguyễn Du, Quận 1, TP.HCM",
        },
        {
          MaKH: 5,
          ID_User: 5,
          TenKH: "Bùi Văn Minh",
          Email: "user5@gmail.com",
          SDT: "0990123456",
          NgaySinh: "1995-07-30",
          GioiTinh: "nam",
          DiaChi: "202 Võ Văn Tần, Quận 3, TP.HCM",
        },
        {
          MaKH: 6,
          ID_User: 6,
          TenKH: "Ngô Thị Phương",
          Email: "user6@gmail.com",
          SDT: "0956789012",
          NgaySinh: "1993-01-15",
          GioiTinh: "nữ",
          DiaChi: "Hải Phòng",
        },
        {
          MaKH: 7,
          ID_User: 7,
          TenKH: "Vũ Văn Giàu",
          Email: "user7@gmail.com",
          SDT: "0967890123",
          NgaySinh: "1987-09-22",
          GioiTinh: "nam",
          DiaChi: "Nam Định",
        },
      ];

      // Áp dụng bộ lọc nếu có
      if (searchParam || genderParam) {
        console.log(
          `Lọc dữ liệu với searchParam='${searchParam}', genderParam='${genderParam}'`
        );
        mockData = mockData.filter((customer) => {
          let matchSearch = true;
          let matchGender = true;

          // Lọc theo tên
          if (searchParam && searchParam.trim() !== "") {
            const lowerName = customer.TenKH.toLowerCase().trim();
            const lowerSearch = searchParam.toLowerCase().trim();
            console.log(`So sánh tên: '${lowerName}' có chứa '${lowerSearch}'`);

            // Sử dụng indexOf thay vì includes
            matchSearch = lowerName.indexOf(lowerSearch) !== -1;
            console.log(`Kết quả so sánh tên (indexOf): ${matchSearch}`);

            // Nếu không tìm thấy, kiểm tra từng từ
            if (!matchSearch) {
              const nameParts = lowerName.split(" ");
              for (const part of nameParts) {
                if (part === lowerSearch || part.startsWith(lowerSearch)) {
                  matchSearch = true;
                  console.log(
                    `Tìm thấy từ '${part}' khớp với '${lowerSearch}'`
                  );
                  break;
                }
              }
            }
          }

          // Lọc theo giới tính
          if (genderParam) {
            const lowerGender = customer.GioiTinh.toLowerCase();
            if (genderParam === "male") {
              matchGender = lowerGender === "nam";
            } else if (genderParam === "female") {
              matchGender = lowerGender === "nữ" || lowerGender === "nu";
            }
            console.log(`Kết quả so sánh giới tính: ${matchGender}`);
          }

          const result = matchSearch && matchGender;
          console.log(`Kết quả lọc cho ${customer.TenKH}: ${result}`);
          return result;
        });

        console.log(`Dữ liệu sau khi lọc: ${mockData.length} khách hàng`);
      }

      if (
        !endpoint.includes("?") ||
        endpoint.includes("/api/hanhkhach?") ||
        endpoint.includes("/hanhkhach?")
      ) {
        return {
          data: mockData,
          totalPages: 1,
        };
      }
    } else if (
      endpoint.match(/\/api\/hanhkhach\/\d+$/) ||
      endpoint.match(/\/hanhkhach\/\d+$/)
    ) {
      const id = parseInt(endpoint.split("/").pop());
      return {
        MaKH: id,
        ID_User: id,
        TenKH: `Khách hàng ${id}`,
        Email: `user${id}@gmail.com`,
        SDT: `09${id}345678`,
        NgaySinh: "1990-05-15",
        GioiTinh: id % 2 === 0 ? "nữ" : "nam",
        DiaChi: "Việt Nam",
      };
    }
  }

  // Mock admin
  if (endpoint.includes("admin")) {
    if (
      endpoint === "/admin" ||
      endpoint === "/admin/all" ||
      endpoint === "/api/admins" ||
      endpoint === "/api/admin"
    ) {
      return {
        data: [
          {
            ID_Admin: 1,
            TaiKhoan: "admin1",
            MatKhau: "ad12345",
            HoTen: "Nguyễn Quản Trị",
            Email: "admin1@gmail.com",
            SDT: "0901234567",
          },
          {
            ID_Admin: 2,
            TaiKhoan: "admin2",
            MatKhau: "ad67890",
            HoTen: "Trần Văn Quyền",
            Email: "admin2@gmail.com",
            SDT: "0912345678",
          },
          {
            ID_Admin: 3,
            TaiKhoan: "superadmin",
            MatKhau: "super123",
            HoTen: "Lê Thị Quản Lý",
            Email: "superadmin@gmail.com",
            SDT: "0923456789",
          },
        ],
        totalPages: 1,
      };
    } else if (
      endpoint.match(/\/admin\/\d+$/) ||
      endpoint.match(/\/api\/admins\/\d+$/) ||
      endpoint.match(/\/api\/admin\/\d+$/)
    ) {
      const id = parseInt(endpoint.split("/").pop());
      return {
        ID_Admin: id,
        TaiKhoan: `admin${id}`,
        MatKhau: `password${id}`,
        HoTen: `Quản trị viên ${id}`,
        Email: `admin${id}@gmail.com`,
        SDT: `09${id}1234567`,
      };
    }
  }

  // Trả về dữ liệu trống nếu không có mock nào phù hợp
  console.warn(`Không có dữ liệu mẫu phù hợp cho endpoint: ${endpoint}`);
  return { data: [], totalPages: 0 };
}

// Format date time
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN")
  );
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Select all checkboxes
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra đăng nhập trước khi làm bất cứ điều gì
  if (!checkAuth()) return;

  const selectAllCheckbox = document.querySelector(".select-all");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      const checkboxes = document.querySelectorAll(".row-select");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = this.checked;
      });
    });
  }
});

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
};

// Show details modal
function showDetailsModal(title, content) {
  // Create modal if not exists
  let modal = document.getElementById("detailsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "detailsModal";
    modal.className = "modal modal-details";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="detailsModalTitle"></h3>
                    <span class="close" onclick="closeDetailsModal()">&times;</span>
                </div>
                <div class="modal-body" id="detailsModalBody">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeDetailsModal()">Close</button>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  }

  document.getElementById("detailsModalTitle").textContent = title;
  document.getElementById("detailsModalBody").innerHTML = content;
  modal.style.display = "block";
}

// Close details modal
function closeDetailsModal() {
  const modal = document.getElementById("detailsModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Xử lý lỗi chung
window.addEventListener("error", function (e) {
  console.error("Lỗi:", e.error);
  // Hiển thị thông báo lỗi cho người dùng nếu cần
});

// Bắt lỗi Promise rejection
window.addEventListener("unhandledrejection", function (event) {
  // Kiểm tra nếu là lỗi EMPTY_TEXT
  if (event.reason && event.reason.error === "EMPTY_TEXT") {
    // Ngăn lỗi hiển thị trong console
    event.preventDefault();
    console.log("Đã chặn lỗi EMPTY_TEXT không quan trọng");
    return;
  }

  console.error("Unhandled Promise Rejection:", event.reason);
});

// Utility functions
function showLoading() {
  // Thêm class loading vào body
  document.body.classList.add("loading");
}

function hideLoading() {
  // Xóa class loading khỏi body
  document.body.classList.remove("loading");
}

// Thêm sự kiện click cho các menu item
document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".feature-card");
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const href = this.getAttribute("onclick")?.match(/'([^']+)'/)?.[1];
      if (href) {
        window.location.href = href;
      }
    });
  });
});
