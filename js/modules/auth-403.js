/* =========================================================
   StudyPath AI — màn hình 403 Forbidden
   Chức năng: "Đăng nhập bằng tài khoản khác" sẽ xóa phiên
   người dùng hiện tại rồi chuyển về trang đăng nhập.
   "Về trang chủ" giữ nguyên phiên đăng nhập.
   ========================================================= */
(function () {
  "use strict";

  const CURRENT_USER_KEY = "studypath.currentUser";
  const switchBtn = document.getElementById("switchAccount");

  if (!switchBtn) {
    return;
  }

  switchBtn.addEventListener("click", function () {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "login.html";
  });
})();
