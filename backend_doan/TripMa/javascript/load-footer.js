// javascript/load-footer.js
document.addEventListener("DOMContentLoaded", () => {
    fetch("html/footer/footer.html")
      .then(res => res.text())
      .then(data => {
        document.getElementById("footer-placeholder").innerHTML = data;
      })
      .catch(err => console.error("Lỗi tải footer:", err));
  });
  
const signupBtn = document.querySelector(".btn-signup");
if (signupBtn) {
  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loadRegisterForm();
  });
}
  