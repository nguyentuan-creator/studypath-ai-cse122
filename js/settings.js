/* Settings page logic — đọc/ghi cài đặt vào localStorage + theme + i18n */
(function () {
  "use strict";

  var STORAGE_KEY = "studypath-settings";

  /* Từ điển Anh; tiếng Việt là chuỗi gốc trong HTML */
  var I18N = {
    en: {
      "meta.title": "Settings | StudyPath AI",
      "nav.overview": "Overview",
      "nav.plan": "Semester plan",
      "nav.roadmap": "AI roadmap",
      "nav.notifications": "Notifications",
      "nav.profile": "Profile",
      "nav.settings": "Settings",
      "bell.label": "Notifications",
      "page.title": "Settings",
      "page.sub": "Customize notifications and display",
      "alert.saved": "Settings saved successfully.",
      "section.app": "Application",
      "set.email.title": "Email notifications",
      "set.email.desc": "Receive an email when a plan gets feedback",
      "set.remind.title": "Plan deadline reminder",
      "set.remind.desc": "Remind 3 days before the approval deadline",
      "set.lang.title": "Language",
      "set.lang.desc": "Interface language",
      "set.lang.label": "Language",
      "set.theme.title": "Display mode",
      "set.theme.desc": "Light or dark interface",
      "set.theme.label": "Display mode",
      "theme.light": "Light",
      "theme.dark": "Dark",
      "foot.note": "Changes are applied after saving",
      "btn.reset": "Reset",
      "btn.save": "Save settings"
    }
  };

  var form = document.getElementById("settings-form");
  var successAlert = document.getElementById("save-success");
  var resetBtn = document.getElementById("btn-reset");
  var langSelect = form.elements.language;

  /* Chuỗi tiếng Việt gốc trong HTML, cache trước khi dịch để còn khôi phục */
  var originals = {};

  function cacheOriginals() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      originals["t:" + el.getAttribute("data-i18n")] = el.textContent;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      originals["p:" + el.getAttribute("data-i18n-placeholder")] = el.getAttribute("placeholder");
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      originals["a:" + el.getAttribute("data-i18n-aria-label")] = el.getAttribute("aria-label");
    });
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function applyLanguage(lang) {
    var dict = I18N[lang] || {};
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = dict[key] || originals["t:" + key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", dict[key] || originals["p:" + key]);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria-label");
      el.setAttribute("aria-label", dict[key] || originals["a:" + key]);
    });
  }

  function loadSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return;

      if (typeof saved.emailNoti === "boolean") {
        form.elements.emailNoti.checked = saved.emailNoti;
      }
      if (typeof saved.deadlineRemind === "boolean") {
        form.elements.deadlineRemind.checked = saved.deadlineRemind;
      }
      if (saved.language) {
        form.elements.language.value = saved.language;
      }
      if (saved.theme) {
        form.elements.theme.value = saved.theme;
      }
    } catch (err) {
      /* dữ liệu lỗi thì bỏ qua, dùng mặc định */
    }
  }

  function showSuccess() {
    successAlert.classList.remove("hidden");
  }

  function hideSuccess() {
    successAlert.classList.add("hidden");
  }

  loadSettings();
  cacheOriginals();
  applyLanguage(langSelect.value);
  applyTheme(form.elements.theme.value);

  form.addEventListener("change", function () {
    hideSuccess();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var settings = {
      emailNoti: form.elements.emailNoti.checked,
      deadlineRemind: form.elements.deadlineRemind.checked,
      language: form.elements.language.value,
      theme: form.elements.theme.value
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyTheme(settings.theme);
    applyLanguage(settings.language);
    showSuccess();
  });

  resetBtn.addEventListener("click", function () {
    form.reset();
    hideSuccess();
  });
})();
