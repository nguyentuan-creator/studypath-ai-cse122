/* =========================================================
   StudyPath AI — shell dùng chung
   Điền thông tin người dùng từ session, dựng điều hướng theo
   vai trò và xử lý drawer trên màn hình nhỏ.
   Nạp sau js/api.js và trước JS của từng màn.
   ========================================================= */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  var ICONS = {
    dashboard: [
      ["rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }],
      ["rect", { x: "14", y: "3", width: "7", height: "7", rx: "1.5" }],
      ["rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" }],
      ["rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" }]
    ],
    plan: [
      ["rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }],
      ["line", { x1: "16", y1: "2", x2: "16", y2: "6" }],
      ["line", { x1: "8", y1: "2", x2: "8", y2: "6" }],
      ["line", { x1: "3", y1: "10", x2: "21", y2: "10" }]
    ],
    roadmap: [
      ["polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }]
    ],
    notifications: [
      ["path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }],
      ["path", { d: "M13.73 21a2 2 0 0 1-3.46 0" }]
    ],
    profile: [
      ["path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }],
      ["circle", { cx: "12", cy: "7", r: "4" }]
    ],
    settings: [
      ["circle", { cx: "12", cy: "12", r: "3" }],
      ["path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" }]
    ],
    review: [
      ["rect", { x: "8", y: "2", width: "8", height: "4", rx: "1" }],
      ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }],
      ["path", { d: "m9 14 2 2 4-4" }]
    ],
    feedback: [
      ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]
    ],
    students: [
      ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
      ["circle", { cx: "9", cy: "7", r: "4" }],
      ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
      ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }]
    ]
  };

  var NAV_BY_ROLE = {
    student: [
      { key: "dashboard", href: "student-dashboard.html", label: "Tổng quan", icon: "dashboard", i18n: "nav.overview" },
      { key: "plan", href: "student-semester-plan.html", label: "Kế hoạch học kỳ", icon: "plan", i18n: "nav.plan" },
      { key: "roadmap", href: "student-ai-roadmap.html", label: "Lộ trình AI", icon: "roadmap", i18n: "nav.roadmap" },
      { key: "notifications", href: "notifications.html", label: "Thông báo", icon: "notifications", i18n: "nav.notifications" },
      { key: "profile", href: "profile.html", label: "Hồ sơ", icon: "profile", i18n: "nav.profile" },
      { key: "settings", href: "settings.html", label: "Cài đặt", icon: "settings", i18n: "nav.settings" }
    ],
    advisor: [
      { key: "advisor-dashboard", href: "advisor-dashboard.html", label: "Tổng quan", icon: "dashboard" },
      { key: "advisor-review", label: "Xem xét kế hoạch", icon: "review", disabled: true },
      { key: "advisor-feedback", label: "Quản lý góp ý", icon: "feedback", disabled: true },
      { key: "advisor-students", label: "Hồ sơ sinh viên", icon: "students", disabled: true },
      { key: "notifications", href: "notifications.html", label: "Thông báo", icon: "notifications" },
      { key: "profile", href: "profile.html", label: "Hồ sơ", icon: "profile" },
      { key: "settings", href: "settings.html", label: "Cài đặt", icon: "settings" }
    ]
  };

  var HOME_BY_ROLE = {
    student: "student-dashboard.html",
    advisor: "advisor-dashboard.html"
  };

  function getCurrentUser() {
    if (!window.StudyPathAPI || typeof window.StudyPathAPI.getCurrentUser !== "function") {
      return null;
    }
    return window.StudyPathAPI.getCurrentUser();
  }

  function getInitials(name) {
    var parts = String(name || "").trim().split(/\s+/);
    var last = parts[parts.length - 1] || "";
    return last.charAt(0).toUpperCase() || "?";
  }

  function buildIcon(name) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    (ICONS[name] || []).forEach(function (shape) {
      var node = document.createElementNS(SVG_NS, shape[0]);
      Object.keys(shape[1]).forEach(function (attr) {
        node.setAttribute(attr, shape[1][attr]);
      });
      svg.appendChild(node);
    });

    return svg;
  }

  function renderHeaderUser() {
    var user = getCurrentUser();
    var name = String(user.name || "").trim();
    var meta = String(user.roleLabel || "").trim();

    if (user.studentId) {
      meta += " · " + user.studentId;
    }

    document.querySelectorAll("[data-shell-user='name']").forEach(function (el) {
      el.textContent = name;
    });
    document.querySelectorAll("[data-shell-user='meta']").forEach(function (el) {
      el.textContent = meta;
    });
    document.querySelectorAll("[data-shell-user='avatar']").forEach(function (el) {
      el.textContent = getInitials(name);
    });

    if (HOME_BY_ROLE[user.role]) {
      document.querySelectorAll("[data-shell='brand']").forEach(function (link) {
        link.setAttribute("href", HOME_BY_ROLE[user.role]);
      });
    }
  }

  function renderNav() {
    var nav = document.querySelector("[data-shell='nav']");
    if (!nav) {
      return;
    }

    var user = getCurrentUser();
    var role = user.role || "";
    var items = NAV_BY_ROLE[role] || [];
    var page = document.body.getAttribute("data-page") || "";

    nav.textContent = "";

    items.forEach(function (item) {
      var link = document.createElement(item.disabled ? "span" : "a");
      link.className = "nav-item";

      if (item.disabled) {
        link.classList.add("nav-item--disabled");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("title", "Màn hình chưa hoàn thiện");
      } else {
        link.setAttribute("href", item.href);
        if (item.key === page) {
          link.classList.add("active");
          link.setAttribute("aria-current", "page");
        }
      }

      link.appendChild(buildIcon(item.icon));

      var label = document.createElement("span");
      label.textContent = item.label;
      if (item.i18n) {
        label.setAttribute("data-i18n", item.i18n);
      }
      link.appendChild(label);

      nav.appendChild(link);
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-shell='menu']");
    var sidebar = document.getElementById("app-sidebar");
    var overlay = document.querySelector("[data-shell='overlay']");

    if (!button || !sidebar || !overlay) {
      return;
    }

    function setOpen(open) {
      document.body.classList.toggle("sidebar-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      overlay.hidden = !open;
    }

    button.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("sidebar-open"));
    });

    overlay.addEventListener("click", function () {
      setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) {
        setOpen(false);
      }
    });
  }

  function requireSession() {
    if (getCurrentUser()) {
      return true;
    }

    document.documentElement.style.visibility = "hidden";
    window.location.replace("login.html");
    return false;
  }

  if (!requireSession()) {
    return;
  }

  renderHeaderUser();
  renderNav();
  initMenu();
})();
