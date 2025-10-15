function loadLoginForm() {
  toggleAuthButtons({ showLogin: false, showRegister: true });
  fetch("html/dangnhap/dangnhap.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("search-flight-placeholder").innerHTML = html;
      const form = document.querySelector(".tripma-form");
      if (form) {
        form.addEventListener("submit", async function (e) {
          e.preventDefault();
          const email = this.email.value;
          const matKhau = this.matKhau.value;

          try {
            const res = await fetch("http://localhost:3000/api/users/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, matKhau }),
            });
            const data = await res.json();
            if (res.ok) {
              // Lưu thông tin cơ bản
              localStorage.setItem("user", JSON.stringify(data));
              localStorage.setItem("userId", data.user.id);
              localStorage.setItem("token", data.token);

              showNotification("Đăng nhập thành công!", "success");

              setTimeout(() => {
                window.location.href = "index.html";
              }, 1);
            } else {
              showNotification(data.message || "Đăng nhập thất bại!", "error");
            }
          } catch (err) {
            showNotification("Lỗi kết nối server!", "error");
          }
        });
      }
    })
    .catch((err) => console.error("Lỗi tải form đăng nhập:", err));
}
function showNotification(message, type = "success") {
  let noti = document.createElement("div");
  noti.className = `custom-notification ${type}`;
  noti.textContent = message;
  noti.style.position = "fixed";
  noti.style.top = "30px";
  noti.style.right = "30px";
  noti.style.background = type === "success" ? "#4caf50" : "#f44336";
  noti.style.color = "#fff";
  noti.style.padding = "12px 24px";
  noti.style.borderRadius = "6px";
  noti.style.zIndex = 9999;
  noti.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  document.body.appendChild(noti);
  setTimeout(() => noti.remove(), 2000);
}
