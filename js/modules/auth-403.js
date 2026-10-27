/* Trang 403: "Đăng nhập bằng tài khoản khác" xóa phiên hiện tại
   để tài khoản mới không bị đưa ngược lại trang này. */
(function () {
  "use strict";

  const switchBtn = document.getElementById("switchAccount");
  if (!switchBtn) return;

  switchBtn.addEventListener("click", () => {
    sessionStorage.removeItem("studypath.currentUser");
    window.location.href = "login.html";
  });
})();
