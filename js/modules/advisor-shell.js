(function () {
  "use strict";

  var NAV = [
    { key: "dashboard", href: "advisor-dashboard.html", label: "Tổng quan", icon: '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>' },
    { key: "review", href: "advisor-student-plan-review.html", label: "Xem xét kế hoạch", icon: '<rect x="8" y="2" width="8" height="4" rx="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path>' },
    { key: "feedback", href: "advisor-feedback-management.html", label: "Quản lý góp ý", icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' },
    { key: "students", href: "advisor-students.html", label: "Hồ sơ sinh viên", icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
    { key: "settings", href: "settings.html", label: "Cài đặt", icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' }
  ];

  var currentPage = document.body.dataset.screen || "dashboard";
  var currentUser = window.StudyPathAPI && StudyPathAPI.getCurrentUser ? StudyPathAPI.getCurrentUser() : null;

  if (currentUser && currentUser.role && currentUser.role !== "advisor") {
    window.location.replace("403.html");
    return;
  }

  currentUser = currentUser || { name: "Phạm Thu Hà", roleLabel: "Cố vấn học tập", role: "advisor" };
  document.querySelectorAll("[data-user-name]").forEach(function (element) {
    element.textContent = currentUser.name || "Cố vấn học tập";
  });
  document.querySelectorAll("[data-user-role]").forEach(function (element) {
    element.textContent = currentUser.roleLabel || "Cố vấn học tập";
  });
  document.querySelectorAll("[data-avatar]").forEach(function (element) {
    var words = String(currentUser.name || "Phạm Thu Hà").trim().split(/\s+/);
    element.textContent = (words[words.length - 1] || "H").charAt(0).toUpperCase();
  });

  var nav = document.querySelector("[data-shell='nav']");
  if (nav) {
    nav.innerHTML = NAV.map(function (item) {
      var active = item.key === currentPage;
      return '<a class="nav-item' + (active ? ' active' : '') + '" href="' + item.href + '"' + (active ? ' aria-current="page"' : '') + '><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + item.icon + '</svg><span>' + item.label + '</span></a>';
    }).join("");
  }

  var menuButton = document.querySelector("[data-shell='menu']");
  var sidebar = document.getElementById("app-sidebar");
  var overlay = document.querySelector("[data-shell='overlay']");
  if (menuButton && sidebar && overlay) {
    function setMenu(open) {
      document.body.classList.toggle("sidebar-open", open);
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      overlay.hidden = !open;
    }
    menuButton.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("sidebar-open"));
    });
    overlay.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }
})();
