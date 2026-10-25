/* =========================================================
   StudyPath AI — chặn truy cập theo vai trò (mock auth)
   Cách dùng trong một trang cần đăng nhập:
     const user = window.StudyPathGuard.requireRole("advisor");
     if (!user) { hiện khối "bị từ chối"; return; }
   - Chưa có phiên: đưa về pages/login.html (trang đã tồn tại ở dev).
   - Sai vai trò: không chuyển hướng, trả về null để trang tự hiển thị
     trạng thái "bị từ chối". 403.html sẽ được dùng làm đích chuyển
     hướng ngay khi màn đó merge vào dev.
   ========================================================= */
(function () {
  "use strict";

  const LOGIN_PAGE = "login.html";

  function getUser() {
    if (!window.StudyPathAPI || typeof window.StudyPathAPI.getCurrentUser !== "function") {
      return null;
    }
    return window.StudyPathAPI.getCurrentUser();
  }

  function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const user = getUser();

    if (user === null) {
      window.location.replace(LOGIN_PAGE);
      return null;
    }

    if (roles.indexOf(user.role) === -1) {
      return null;
    }

    return user;
  }

  function signOut() {
    if (window.StudyPathAPI && typeof window.StudyPathAPI.signOut === "function") {
      window.StudyPathAPI.signOut();
      return;
    }
    sessionStorage.removeItem("studypath.currentUser");
  }

  window.StudyPathGuard = {
    requireRole: requireRole,
    getUser: getUser,
    signOut: signOut
  };
})();
