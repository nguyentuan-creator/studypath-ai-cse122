/* AI Roadmap page logic — AI-1: hồ sơ mục tiêu + kết quả gợi ý lộ trình */
(function () {
  "use strict";

  var ICONS = {
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  };

  var SEMESTERS = [
    { id: "HK1", credits: 14, courses: "IT1010 · MA1010 · PH1010 · EN1010" },
    { id: "HK2", credits: 16, courses: "IT1020 · MA2010 · MA1020 · EN1020" },
    { id: "HK3", credits: 20, courses: "IT2020 · IT2030 · IT2040 · ST2010 · SO1010", risk: true },
    { id: "HK4", credits: 16, courses: "IT3060 · IT4040 · IT3050 · IT5060" },
    { id: "HK5", credits: 18, courses: "IT4050 · IT4060 · IT3070 · IT4070 · EN2030" },
    { id: "HK6", credits: 18, courses: "IT5010 · IT5020 · IT5030 · IT5040 · MA3010" },
    { id: "HK7", credits: 16, courses: "IT5050 · IT5070 · IT6010 · IT6020" },
    { id: "HK8", credits: 14, courses: "IT6030 · IT6040 · IT6050 · IT6060" }
  ];

  var TIME_MAP = {
    low: { label: "< 10 giờ / tuần", note: "Mức chọn hiện tại cho phép học 12–14 tín chỉ / học kỳ." },
    mid: { label: "10–20 giờ / tuần", note: "Mức chọn hiện tại cho phép học 14–16 tín chỉ / học kỳ." },
    high: { label: "> 20 giờ / tuần", note: "Mức chọn hiện tại cho phép học 16–20 tín chỉ / học kỳ." }
  };

  var resultCard = document.getElementById("result-card");
  var resultTag = document.getElementById("result-tag");
  var resultMeta = document.getElementById("result-meta");
  var fitValue = document.getElementById("fit-value");
  var rejectNote = document.getElementById("reject-note");
  var semGrid = document.getElementById("sem-grid");
  var semGridMore = document.getElementById("sem-grid-more");
  var btnMoreSems = document.getElementById("btn-more-sems");
  var careerSelect = document.getElementById("career-select");
  var prefChips = document.getElementById("pref-chips");
  var timeNote = document.getElementById("time-note");
  var timeReason = document.getElementById("time-reason");
  var updatedDate = document.getElementById("updated-date");
  var profileCard = document.getElementById("profile-card");
  var acceptBtn = document.getElementById("btn-accept");
  var editBtn = document.getElementById("btn-edit");
  var rejectBtn = document.getElementById("btn-reject");
  var regenBtn = document.getElementById("btn-regen");
  var generateBtn = document.getElementById("btn-generate");
  var toastEl = document.getElementById("toast");

  var isLoading = false;
  var toastTimer = null;

  /* Đồng bộ chế độ tối đã lưu ở trang cài đặt */
  function applySavedTheme() {
    try {
      var saved = JSON.parse(localStorage.getItem("studypath-settings"));
      if (saved && saved.theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch (err) {
      /* bỏ qua nếu dữ liệu lỗi */
    }
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function semCardHTML(sem) {
    return (
      '<article class="sem-card' + (sem.risk ? " sem-card--risk" : "") + '">' +
        '<div class="sem-top">' +
          "<h3>" + sem.id + "</h3>" +
          (sem.risk
            ? '<span class="sem-ai2">AI-2</span>'
            : '<span class="sem-status" aria-label="Đã kiểm tra tiên quyết">' + ICONS.check + "</span>") +
        "</div>" +
        '<p class="sem-credits">' + sem.credits + " tín chỉ</p>" +
        '<p class="sem-courses">' + sem.courses + "</p>" +
        (sem.risk
          ? '<p class="sem-risk-note">' + ICONS.warn + " Rủi ro cao · tải học tập lớn</p>"
          : "") +
      "</article>"
    );
  }

  function renderSemesters() {
    semGrid.innerHTML = SEMESTERS.slice(0, 4).map(semCardHTML).join("");
    semGridMore.innerHTML = SEMESTERS.slice(4).map(semCardHTML).join("");
  }

  function setRejected(rejected) {
    resultCard.classList.toggle("rejected", rejected);
    rejectNote.classList.toggle("hidden", !rejected);
    acceptBtn.disabled = rejected;
    editBtn.disabled = rejected;
    rejectBtn.disabled = rejected;

    if (rejected) {
      resultTag.textContent = "Đã từ chối";
      resultTag.className = "tag tag-red";
    } else {
      resultTag.textContent = "Mới tạo";
      resultTag.className = "tag tag-green";
    }
  }

  function currentCareer() {
    return careerSelect.options[careerSelect.selectedIndex].text;
  }

  function syncTimeBudget(value) {
    timeNote.textContent = TIME_MAP[value].note;
    timeReason.textContent = TIME_MAP[value].label;
  }

  function regenerate() {
    if (isLoading) return;
    isLoading = true;

    resultCard.classList.add("is-loading");

    setTimeout(function () {
      isLoading = false;
      resultCard.classList.remove("is-loading");
      setRejected(false);

      fitValue.textContent = "94%";
      updatedDate.textContent = "Cập nhật 23/10/2026";
      resultMeta.textContent = "8 học kỳ · 132 tín chỉ · Mục tiêu " + currentCareer();

      renderSemesters();
      showToast("Đã tạo lộ trình mới (mô phỏng) — độ phù hợp 94%.");
    }, 900);
  }

  prefChips.addEventListener("click", function (event) {
    var chip = event.target.closest(".pref-chip");
    if (!chip) return;

    var isActive = chip.classList.toggle("active");
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  document.querySelectorAll(".time-seg-input").forEach(function (radio) {
    radio.addEventListener("change", function () {
      syncTimeBudget(radio.value);
    });
  });

  btnMoreSems.addEventListener("click", function () {
    var isHidden = semGridMore.classList.toggle("hidden");
    btnMoreSems.setAttribute("aria-expanded", isHidden ? "false" : "true");
    btnMoreSems.innerHTML = isHidden
      ? 'Xem tiếp HK5–HK8 <span aria-hidden="true">→</span>'
      : 'Thu gọn HK5–HK8 <span aria-hidden="true">↑</span>';
  });

  generateBtn.addEventListener("click", regenerate);
  regenBtn.addEventListener("click", regenerate);

  rejectBtn.addEventListener("click", function () {
    setRejected(true);
    showToast("Đã từ chối đề xuất lộ trình.");
  });

  acceptBtn.addEventListener("click", function () {
    resultTag.textContent = "Đã chấp nhận";
    resultTag.className = "tag tag-green";
    showToast("Đã tạo kế hoạch HK1 từ lộ trình đề xuất (mô phỏng).");
  });

  editBtn.addEventListener("click", function () {
    profileCard.scrollIntoView({ behavior: "smooth", block: "start" });
    profileCard.classList.remove("flash");
    void profileCard.offsetWidth;
    profileCard.classList.add("flash");

    setTimeout(function () {
      profileCard.classList.remove("flash");
    }, 1300);

    careerSelect.focus({ preventScroll: true });
  });

  applySavedTheme();
  renderSemesters();
  syncTimeBudget(document.querySelector(".time-seg-input:checked").value);
})();
