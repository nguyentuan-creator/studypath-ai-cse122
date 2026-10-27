/* StudyPath AI — áp chế độ sáng/tối đã lưu cho mọi màn hình.
   Nạp trong <head> trước CSS để trang không nháy nền sáng khi tải. */
(function () {
  "use strict";

  var STORAGE_KEY = "studypath-settings";

  function readSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) || {} : {};
    } catch (err) {
      return {};
    }
  }

  function getTheme() {
    return readSettings().theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function setTheme(theme) {
    var next = theme === "dark" ? "dark" : "light";
    var settings = readSettings();
    settings.theme = next;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      /* Bộ nhớ bị chặn: vẫn áp dụng cho phiên hiện tại */
    }

    applyTheme(next);
    return next;
  }

  applyTheme(getTheme());

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      applyTheme(getTheme());
    }
  });

  window.StudyPathTheme = {
    get: getTheme,
    set: setTheme,
    apply: applyTheme
  };
})();
