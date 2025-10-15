function loadRegisterForm() {
  toggleAuthButtons({ showLogin: true, showRegister: false });
  fetch("html/dangky/dangky.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("search-flight-placeholder").innerHTML = html;
      const form = document.querySelector(".tripma-form");
      if (form) {
        form.addEventListener("submit", async function (e) {
          e.preventDefault();
          const email = form.email.value;
          const sdt = form.sdt.value;
          const hoTen = form.hoTen.value;
          const matKhau = form.matKhau.value;
          const terms = form.querySelector("#terms").checked;

          if (!terms) {
            alert("Vui lòng đồng ý với điều khoản và chính sách");
            return;
          }

          const userData = { email, sdt, hoTen, matKhau };

          try {
            const response = await fetch(
              "http://localhost:3000/api/users/register",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
              }
            );

            const result = await response.json();

            if (response.ok) {
              alert("Đăng ký thành công!");
              localStorage.setItem("user", JSON.stringify(result));
              form.reset();
              if (typeof updateUIAfterLogin == "function") updateUIAfterLogin();
            } else {
              alert(`Lỗi: ${result.message}`);
            }
          } catch (error) {
            alert(`Lỗi: ${error.message}`);
          }
        });
      }
    })
    .catch((err) => console.error("Lỗi tải form đăng ký:", err));
}
