/* Semester plan logic — bảng học phần + AI-2 cảnh báo quá tải + gợi ý + modal sửa */
(function () {
  "use strict";

  var CREDIT_LIMIT = 18;

  var plan = [
    { id: "c1", code: "IT1010", name: "Nhập môn lập trình", credits: 4, type: "Bắt buộc", note: "Nền tảng" },
    { id: "c2", code: "IT1020", name: "Kỹ thuật lập trình", credits: 4, type: "Bắt buộc", note: "Đã đủ tiên quyết" },
    { id: "c3", code: "MA2010", name: "Toán rời rạc", credits: 3, type: "Bắt buộc", note: "Môn cơ sở" },
    { id: "c4", code: "IT3060", name: "Cơ sở dữ liệu", credits: 3, type: "Bắt buộc", note: "Theo lộ trình AI" },
    { id: "c5", code: "IT4040", name: "Cấu trúc dữ liệu và giải thuật", credits: 4, type: "Bắt buộc", note: "Tải học tập cao", warn: true },
    { id: "c6", code: "EN2010", name: "Tiếng Anh chuyên ngành", credits: 3, type: "Tự chọn", note: "Ưu tiên học kỳ này" }
  ];

  var suggestions = [
    { code: "IT1010", name: "Nhập môn lập trình", credits: 4 },
    { code: "IT3060", name: "Cơ sở dữ liệu", credits: 3 },
    { code: "IT5060", name: "Mạng máy tính", credits: 3 }
  ];

  var nextId = 7;

  var bodyEl = document.getElementById("plan-body");
  var countEl = document.getElementById("plan-count");
  var totalEl = document.getElementById("plan-total");
  var bannerEl = document.getElementById("risk-banner");
  var suggestListEl = document.getElementById("suggest-list");
  var toastEl = document.getElementById("toast");
  var editModal = document.getElementById("edit-modal");
  var editForm = document.getElementById("edit-form");
  var editingId = null;
  var toastTimer = null;

  /* ---------- Toast ---------- */
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------- Tổng tín chỉ ---------- */
  function totalCredits() {
    return plan.reduce(function (sum, c) { return sum + c.credits; }, 0);
  }

  /* ---------- Render bảng ---------- */
  function renderTable() {
    bodyEl.innerHTML = "";

    plan.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.dataset.id = c.id;

      var typeCell = c.type === "Tự chọn"
        ? '<span class="tag tag-purple">Tự chọn</span>'
        : '<span class="plan-type">Bắt buộc</span>';

      var noteClass = c.warn ? "plan-note plan-note--warn" : "plan-note";

      tr.innerHTML =
        '<td><span class="plan-course"><span class="pc-name"></span><small></small></span></td>' +
        "<td>" + c.credits + "</td>" +
        "<td>" + typeCell + "</td>" +
        '<td><span class="' + noteClass + '"></span></td>' +
        '<td><span class="plan-actions">' +
          '<button type="button" class="row-action row-action--edit" data-action="edit">Sửa</button>' +
          '<button type="button" class="row-action row-action--delete" data-action="delete">Xoá</button>' +
        "</span></td>";

      tr.querySelector(".pc-name").textContent = c.name;
      tr.querySelector(".plan-course small").textContent = c.code;
      tr.querySelector(".plan-note").textContent = c.note || "—";

      bodyEl.appendChild(tr);
    });

    countEl.textContent = "Tổng cộng · " + plan.length + " học phần";
    totalEl.textContent = totalCredits() + " tín chỉ";
  }

  /* ---------- Render banner AI-2 ---------- */
  function renderBanner() {
    var total = totalCredits();

    if (total > CREDIT_LIMIT) {
      bannerEl.innerHTML =
        '<div class="alert alert-warning risk-alert">' +
          '<div class="risk-text">' +
            "<strong>Kế hoạch " + total + " tín chỉ vượt ngưỡng " + CREDIT_LIMIT + " tín chỉ</strong>" +
            "<span>Cân nhắc chuyển 1 học phần sang HK2 để giảm rủi ro quá tải.</span>" +
          "</div>" +
          '<button type="button" class="btn btn-secondary btn-sm" id="btn-suggest">Xem gợi ý</button>' +
        "</div>";
    } else {
      bannerEl.innerHTML =
        '<div class="alert alert-success risk-alert">' +
          '<div class="risk-text">' +
            "<strong>Kế hoạch " + total + " tín chỉ nằm trong ngưỡng an toàn</strong>" +
            "<span>Tổng tải học tập hợp lý cho học kỳ này.</span>" +
          "</div>" +
        "</div>";
    }
  }

  /* ---------- Render gợi ý ---------- */
  function inPlan(code) {
    return plan.some(function (c) { return c.code === code; });
  }

  function renderSuggestions() {
    suggestListEl.innerHTML = "";

    suggestions.forEach(function (s) {
      var chosen = inPlan(s.code);
      var item = document.createElement("div");
      item.className = "suggest-item";

      item.innerHTML =
        '<span class="suggest-code"></span>' +
        '<span class="suggest-name"></span>' +
        '<div class="suggest-foot">' +
          '<span class="suggest-credits"></span>' +
          (chosen
            ? '<span class="suggest-status">Đang chọn</span>'
            : '<button type="button" class="suggest-add">Có thể thêm</button>') +
        "</div>";

      item.querySelector(".suggest-code").textContent = s.code;
      item.querySelector(".suggest-name").textContent = s.name;
      item.querySelector(".suggest-credits").textContent = s.credits + " TC";

      if (!chosen) {
        item.querySelector(".suggest-add").addEventListener("click", function () {
          plan.push({ id: "c" + nextId++, code: s.code, name: s.name, credits: s.credits, type: "Bắt buộc", note: "Thêm từ gợi ý" });
          renderAll();
          showToast("Đã thêm " + s.code + " vào kế hoạch");
        });
      }

      suggestListEl.appendChild(item);
    });
  }

  function renderAll() {
    renderTable();
    renderBanner();
    renderSuggestions();
  }

  /* ---------- Sửa / Xoá trong bảng ---------- */
  bodyEl.addEventListener("click", function (event) {
    var btn = event.target.closest(".row-action");
    if (!btn) return;

    var id = event.target.closest("tr").dataset.id;
    var course = plan.find(function (c) { return c.id === id; });
    if (!course) return;

    if (btn.dataset.action === "delete") {
      plan = plan.filter(function (c) { return c.id !== id; });
      renderAll();
      showToast("Đã xoá " + course.code + " khỏi kế hoạch");
    }

    if (btn.dataset.action === "edit") {
      openEditModal(course);
    }
  });

  /* ---------- Modal sửa ---------- */
  function openEditModal(course) {
    editingId = course.id;
    document.getElementById("edit-name").value = course.name;
    document.getElementById("edit-code").value = course.code;
    document.getElementById("edit-credits").value = String(course.credits);
    document.getElementById("edit-type").value = course.type;
    document.getElementById("edit-note").value = course.note || "";
    clearEditErrors();
    editModal.classList.remove("hidden");
    document.getElementById("edit-name").focus();
  }

  function closeEditModal() {
    editModal.classList.add("hidden");
    editingId = null;
  }

  function clearEditErrors() {
    editForm.querySelectorAll(".form-group").forEach(function (g) {
      g.classList.remove("is-invalid");
      var err = g.querySelector(".form-error");
      if (err) err.textContent = "";
    });
  }

  document.getElementById("btn-close-modal").addEventListener("click", closeEditModal);
  document.getElementById("btn-cancel-edit").addEventListener("click", closeEditModal);

  editModal.addEventListener("click", function (event) {
    if (event.target === editModal) closeEditModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !editModal.classList.contains("hidden")) closeEditModal();
  });

  editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.getElementById("edit-name").value.trim();
    var code = document.getElementById("edit-code").value.trim();

    clearEditErrors();
    var ok = true;

    if (!name) {
      setFieldError("edit-name", "Vui lòng nhập tên học phần.");
      ok = false;
    }
    if (!code) {
      setFieldError("edit-code", "Vui lòng nhập mã học phần.");
      ok = false;
    }
    if (!ok) return;

    var course = plan.find(function (c) { return c.id === editingId; });
    if (course) {
      course.name = name;
      course.code = code.toUpperCase();
      course.credits = parseInt(document.getElementById("edit-credits").value, 10);
      course.type = document.getElementById("edit-type").value;
      course.note = document.getElementById("edit-note").value.trim();
      course.warn = false;
      renderAll();
      showToast("Đã cập nhật " + course.code);
    }

    closeEditModal();
  });

  function setFieldError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var group = input.closest(".form-group");
    group.classList.add("is-invalid");
    group.querySelector(".form-error").textContent = message;
  }

  /* ---------- Các nút hành động chính ---------- */
  document.getElementById("btn-save-draft").addEventListener("click", function () {
    showToast("Đã lưu bản nháp kế hoạch");
  });

  document.getElementById("btn-submit-plan").addEventListener("click", function () {
    var total = totalCredits();
    if (total > CREDIT_LIMIT) {
      showToast("Kế hoạch " + total + " tín chỉ vượt ngưỡng " + CREDIT_LIMIT + " — cần điều chỉnh trước khi gửi duyệt");
      return;
    }
    showToast("Đã gửi kế hoạch cho cố vấn (mô phỏng)");
  });

  document.getElementById("btn-reply-advisor").addEventListener("click", function () {
    showToast("Mở khung phản hồi cố vấn (mô phỏng)");
  });

  document.getElementById("btn-find-course").addEventListener("click", function () {
    showToast("Tra cứu học phần (mô phỏng)");
  });

  bannerEl.addEventListener("click", function (event) {
    if (event.target.id === "btn-suggest") {
      document.getElementById("suggest-card").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  renderAll();
})();
