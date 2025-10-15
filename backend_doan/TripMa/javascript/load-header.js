// javascript/load-header.js
fetch("html/header/header.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("header-placeholder").innerHTML = data;

    // Đăng ký
    const signupBtn = document.querySelector(".btn-signup");
    if (signupBtn) {
      signupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        loadRegisterForm();
      });
    }

    // Đăng nhập
    const loginBtn = document.querySelector(".btn-login");
    if (loginBtn) {
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        loadLoginForm();
      });
    }

    // Menu mobile
    const menuItems = document.querySelectorAll(".menu-list");
    menuItems.forEach((item) => {
      const action = item.getAttribute("data-action");
      if (action == "signup") {
        item.addEventListener("click", () => loadRegisterForm());
      } else if (action == "login") {
        item.addEventListener("click", () => loadLoginForm());
      }
    });

    // Update UI after header is loaded
    updateUIAfterLogin();
  })
  .catch((err) => console.error("Lỗi tải form đăng ký:", err));

function updateUIAfterLogin() {
  let user = JSON.parse(localStorage.getItem("user"));
  // Nếu user là object lồng (user.user)
  if (user && user.user) user = user.user;
  // Kiểm tra các trường phổ biến
  if (user && (user.HoTen || user.Email || user.email)) {
    const loginBtn = document.querySelector(".btn-login");
    const registerBtn = document.querySelector(".btn-signup");
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";

    let profileHTML = `
      <div class="profile-header" style="position: relative; display: inline-block;">
        <span id="avatar-btn" style="cursor:pointer;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#444"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
        </span>
        <div id="profile-dropdown" style="display:none; position:absolute; right:0; top:36px; background:#fff; border:1px solid #ddd; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.15); padding:12px; min-width:200px; z-index:100;">
          <div><b>Email:</b> ${user.Email || user.email || ""}</div>
          <div><b>SĐT:</b> ${user.SDT || user.sdt || ""}</div>
        
          <button class="logout-btn" style="margin-top:10px;">Đăng xuất</button>
        </div>
      </div>
    `;
    const profilePlaceholder = document.querySelector(
      ".header-profile-placeholder"
    );
    if (profilePlaceholder) {
      profilePlaceholder.innerHTML = profileHTML;

      // Toggle dropdown khi nhấn vào avatar
      const avatarBtn = document.getElementById("avatar-btn");
      const dropdown = document.getElementById("profile-dropdown");
      if (avatarBtn && dropdown) {
        avatarBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.style.display =
            dropdown.style.display == "block" ? "none" : "block";
        });
        // Ẩn dropdown khi click ra ngoài
        document.addEventListener("click", () => {
          dropdown.style.display = "none";
        });
        dropdown.addEventListener("click", (e) => e.stopPropagation());
      }

      // Đăng xuất
      const logoutBtn = document.querySelector(".logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("user");
          window.location.reload();
        });
      }
    }
  } else {
    // Nếu chưa đăng nhập, hiện lại nút đăng nhập/đăng ký, ẩn profile
    const profilePlaceholder = document.querySelector(
      ".header-profile-placeholder"
    );
    if (profilePlaceholder) profilePlaceholder.innerHTML = "";
    const loginBtn = document.querySelector(".btn-login");
    const registerBtn = document.querySelector(".btn-signup");
    if (loginBtn) loginBtn.style.display = "";
    if (registerBtn) registerBtn.style.display = "";
    const ticketsBtn = document.querySelector(".btn-tickets");
    if (user && (user.HoTen || user.Email || user.email)) {
      if (ticketsBtn) ticketsBtn.style.display = "inline-block";
    } else {
      if (ticketsBtn) ticketsBtn.style.display = "none";
    }
  }
}
function toggleAuthButtons({ showLogin, showRegister }) {
  const loginBtn = document.querySelector(".btn-login");
  const registerBtn = document.querySelector(".btn-signup");
  if (loginBtn) loginBtn.style.display = showLogin ? "inline-block" : "none";
  if (registerBtn)
    registerBtn.style.display = showRegister ? "inline-block" : "none";
}
