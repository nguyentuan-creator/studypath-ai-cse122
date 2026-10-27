(function () {
  "use strict";

  const STORAGE_KEY = "studypath.adminUsers";
  const PAGE_SIZE = 5;
  const roleLabels = { student: "Sinh viên", advisor: "Cố vấn", admin: "Quản trị" };
  const $ = function (selector) { return document.querySelector(selector); };
  const state = { users: [], filtered: [], students: [], page: 1, query: "", role: "all", status: "all" };
  const modalTriggers = new WeakMap();

  function openModal(id, focusSelector) {
    const modal = $("#" + id); modalTriggers.set(modal, document.activeElement);
    modal.hidden = false; modal.setAttribute("aria-hidden", "false"); document.body.classList.add("admin-modal-open");
    const focusTarget = focusSelector ? $(focusSelector) : modal; if (focusTarget && focusTarget.focus) focusTarget.focus({ preventScroll: true });
  }
  function closeModal(id) {
    const modal = $("#" + id); if (!modal || modal.hidden) return;
    modal.hidden = true; modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".admin-modal:not([hidden])")) document.body.classList.remove("admin-modal-open");
    const trigger = modalTriggers.get(modal); if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
  }
  function bindModal(id, onClose) {
    const modal = $("#" + id);
    modal.addEventListener("click", function (event) { if (event.target !== modal) return; if (onClose) onClose(); closeModal(id); });
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); if (onClose) onClose(); closeModal(id); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(modal.querySelectorAll("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return; const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    });
  }

  function safeRead(key, fallback) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch (_) { return fallback; }
  }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.users)); }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }
  function initials(name) { return String(name || "QT").trim().split(/\s+/).slice(-2).map(function (part) { return part[0] || ""; }).join("").toUpperCase(); }
  function toast(message) {
    const node = $("#toast"); node.textContent = message; node.classList.remove("hidden");
    clearTimeout(toast.timer); toast.timer = setTimeout(function () { node.classList.add("hidden"); }, 2600);
  }
  function advisorName(id) { const found = state.users.find(function (user) { return String(user.id) === String(id) && user.role === "advisor"; }); return found ? found.name : "—"; }
  function setDefaults() {
    return fetch("../assets/data/users.json").then(function (response) {
      if (!response.ok) throw new Error("users");
      return response.json();
    }).then(function (data) {
      const records = (data.users || []).map(function (user) { return Object.assign({ status: "active", studentId: "", program: "", advisorId: "" }, user); });
      return fetch("../assets/data/advisor-students.json").then(function (response) { return response.ok ? response.json() : { students: [] }; }).then(function (advisory) {
        state.students = advisory.students || [];
        state.students.forEach(function (student) {
          const existing = records.find(function (user) { return user.role === "student" && (Number(user.id) === Number(student.id) || user.name === student.name); });
          if (existing) Object.assign(existing, { studentId: student.code, program: student.program, year: student.year, advisorId: advisory.advisorId || "" });
          else records.push({ id: "sample-" + student.id, name: student.name, email: "sv" + student.code + "@studypath.edu.vn", password: "123456", role: "student", roleLabel: "Sinh viên", status: "active", studentId: student.code, program: student.program, year: student.year, advisorId: advisory.advisorId || "" });
        });
        state.users = safeRead(STORAGE_KEY, records);
        persist();
      });
    });
  }
  function refreshFilter() {
    const needle = state.query.trim().toLocaleLowerCase("vi");
    state.filtered = state.users.filter(function (user) {
      const matchesText = !needle || [user.name, user.email, user.studentId].some(function (value) { return String(value || "").toLocaleLowerCase("vi").includes(needle); });
      return matchesText && (state.role === "all" || user.role === state.role) && (state.status === "all" || (user.status || "active") === state.status);
    });
    state.page = Math.min(state.page, Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE)));
    renderTable();
  }
  function renderTable() {
    const start = (state.page - 1) * PAGE_SIZE;
    const rows = state.filtered.slice(start, start + PAGE_SIZE);
    $("#userCount").textContent = state.users.length.toLocaleString("vi-VN");
    $("#usersBody").innerHTML = rows.map(function (user) {
      const role = user.role || "student", active = (user.status || "active") !== "locked";
      return '<tr><td><div class="user-identity"><strong>' + escapeHtml(user.name) + '</strong><span>' + escapeHtml(user.email) + '</span></div></td>' +
        '<td><span class="role-pill role-' + escapeHtml(role) + '">' + escapeHtml(roleLabels[role] || role) + '</span></td>' +
        '<td>' + escapeHtml(user.studentId || "—") + '</td><td><span class="status-pill status-' + (active ? "active" : "locked") + '">' + (active ? "Hoạt động" : "Bị khóa") + '</span></td>' +
        '<td>' + escapeHtml(role === "student" ? advisorName(user.advisorId) : (role === "advisor" ? state.users.filter(function (item) { return item.role === "student" && String(item.advisorId) === String(user.id); }).length + " sinh viên" : "—")) + '</td>' +
        '<td><div class="row-actions"><button class="row-action" type="button" data-edit="' + escapeHtml(user.id) + '">Sửa</button>' + (role === "admin" ? "" : '<button class="row-action ' + (active ? "danger" : "unlock") + '" type="button" data-toggle="' + escapeHtml(user.id) + '">' + (active ? "Khóa" : "Mở khóa") + '</button>') + '</div></td></tr>';
    }).join("");
    $("#usersEmpty").classList.toggle("hidden", state.filtered.length > 0);
    $("#tableSummary").textContent = state.filtered.length ? "Hiển thị " + (start + 1) + "–" + (start + rows.length) + " trong " + state.filtered.length.toLocaleString("vi-VN") + " người dùng" : "0 người dùng";
    renderPagination();
  }
  function renderPagination() {
    const total = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    let html = '<button class="page-button" data-page="' + (state.page - 1) + '" aria-label="Trang trước" ' + (state.page === 1 ? "disabled" : "") + '>‹</button>';
    for (let i = 1; i <= Math.min(total, 5); i++) html += '<button class="page-button ' + (i === state.page ? "active" : "") + '" data-page="' + i + '" aria-current="' + (i === state.page ? "page" : "false") + '">' + i + '</button>';
    if (total > 5) html += '<span class="text-muted">… ' + total + '</span>';
    html += '<button class="page-button" data-page="' + (state.page + 1) + '" aria-label="Trang sau" ' + (state.page === total ? "disabled" : "") + '>›</button>';
    $("#pagination").innerHTML = html;
  }
  function fillAdvisorOptions() {
    const advisors = state.users.filter(function (user) { return user.role === "advisor" && user.status !== "locked"; });
    [$("#advisorSelect"), $("#bulkAdvisor")].forEach(function (select) {
      const placeholder = select.id === "advisorSelect" ? '<option value="">Chưa gán</option>' : '<option value="">Chọn cố vấn</option>';
      select.innerHTML = placeholder + advisors.map(function (user) { return '<option value="' + escapeHtml(user.id) + '">' + escapeHtml(user.name) + '</option>'; }).join("");
    });
  }
  function renderStudents() {
    const selectedAdvisor = $("#bulkAdvisor").value;
    const students = state.users.filter(function (user) { return user.role === "student"; });
    $("#studentChecklist").innerHTML = students.map(function (user) {
      const checked = selectedAdvisor && String(user.advisorId) === selectedAdvisor ? "checked" : "";
      return '<label class="student-option"><input type="checkbox" value="' + escapeHtml(user.id) + '" ' + checked + '> ' + escapeHtml(user.name) + (user.studentId ? " · " + escapeHtml(user.studentId) : "") + '</label>';
    }).join("");
    updateSelectedCount();
  }
  function updateSelectedCount() { $("#selectedCount").textContent = document.querySelectorAll("#studentChecklist input:checked").length; }
  function resetUserForm() {
    $("#userForm").reset(); $("#editingId").value = ""; $("#newRole").value = "student";
    $("#userFormTitle").textContent = "Thêm người dùng"; $("#saveUserBtn").textContent = "Lưu người dùng";
    $("#passwordHint").classList.remove("hidden"); document.querySelectorAll("[data-error]").forEach(function (el) { el.classList.add("hidden"); });
  }
  function editUser(id) {
    const user = state.users.find(function (item) { return String(item.id) === String(id); }); if (!user) return;
    $("#editingId").value = user.id; $("#fullName").value = user.name; $("#email").value = user.email;
    $("#newRole").value = user.role; $("#studentCode").value = user.studentId || ""; $("#program").value = user.program || "";
    fillAdvisorOptions(); $("#advisorSelect").value = user.advisorId || "";
    $("#userFormTitle").textContent = "Chỉnh sửa người dùng"; $("#saveUserBtn").textContent = "Lưu thay đổi"; $("#passwordHint").classList.add("hidden");
    openModal("userFormCard", "#fullName");
  }
  function validateForm(name, email) {
    let valid = true;
    const duplicate = state.users.some(function (user) { return String(user.id) !== $("#editingId").value && user.email.toLowerCase() === email.toLowerCase(); });
    [["fullName", !name, "Vui lòng nhập họ và tên."], ["email", !/^\S+@\S+\.\S+$/.test(email), "Vui lòng nhập email hợp lệ."], ["email", duplicate, "Email đã được dùng bởi tài khoản khác."]].forEach(function (item) {
      if (!item[1]) return; valid = false; const error = document.querySelector('[data-error="' + item[0] + '"]'); error.textContent = item[2]; error.classList.remove("hidden");
    });
    return valid;
  }
  function bindEvents() {
    $("#applyFilters").addEventListener("click", function () { state.query = $("#userSearch").value; state.role = $("#roleFilter").value; state.status = $("#statusFilter").value; state.page = 1; refreshFilter(); });
    $("#userSearch").addEventListener("keydown", function (event) { if (event.key === "Enter") $("#applyFilters").click(); });
    [$("#roleFilter"), $("#statusFilter")].forEach(function (el) { el.addEventListener("change", function () { $("#applyFilters").click(); }); });
    $("#resetFilters").addEventListener("click", function () { $("#userSearch").value = ""; $("#roleFilter").value = "all"; $("#statusFilter").value = "all"; $("#applyFilters").click(); });
    $("#usersBody").addEventListener("click", function (event) {
      const edit = event.target.closest("[data-edit]"), toggle = event.target.closest("[data-toggle]");
      if (edit) editUser(edit.dataset.edit);
      if (toggle) { const user = state.users.find(function (item) { return String(item.id) === toggle.dataset.toggle; }); if (!user) return; user.status = user.status === "locked" ? "active" : "locked"; persist(); fillAdvisorOptions(); refreshFilter(); renderStudents(); toast(user.status === "locked" ? "Đã khóa tài khoản " + user.name : "Đã mở khóa tài khoản " + user.name); }
    });
    $("#pagination").addEventListener("click", function (event) { const button = event.target.closest("[data-page]"); if (!button || button.disabled) return; state.page = Number(button.dataset.page); renderTable(); });
    $("#userForm").addEventListener("submit", function (event) {
      event.preventDefault(); document.querySelectorAll("[data-error]").forEach(function (el) { el.classList.add("hidden"); });
      const name = $("#fullName").value.trim(), email = $("#email").value.trim(); if (!validateForm(name, email)) return;
      const editingId = $("#editingId").value, role = $("#newRole").value;
      const existing = state.users.find(function (user) { return String(user.id) === editingId; });
      const record = Object.assign({}, existing || { id: "u-" + Date.now(), password: "123456", status: "active" }, { name: name, email: email, role: role, roleLabel: roleLabels[role] === "Cố vấn" ? "Cố vấn học tập" : roleLabels[role], studentId: role === "student" ? $("#studentCode").value.trim() : "", program: role === "student" ? $("#program").value.trim() : "", advisorId: role === "student" ? $("#advisorSelect").value : "" });
      if (existing) Object.assign(existing, record); else state.users.unshift(record);
      persist(); fillAdvisorOptions(); renderStudents(); refreshFilter(); closeModal("userFormCard"); resetUserForm(); toast(existing ? "Đã cập nhật tài khoản." : "Đã tạo tài khoản.");
    });
    $("#assignForm").addEventListener("submit", function (event) {
      event.preventDefault(); const advisorId = $("#bulkAdvisor").value, chosen = Array.from(document.querySelectorAll("#studentChecklist input:checked")).map(function (input) { return input.value; });
      if (!advisorId) { toast("Hãy chọn cố vấn trước khi phân công."); return; }
      state.users.forEach(function (user) { if (user.role === "student" && chosen.includes(String(user.id))) user.advisorId = advisorId; });
      persist(); renderStudents(); refreshFilter(); closeModal("assignCard"); toast("Đã gán " + chosen.length + " sinh viên cho " + advisorName(advisorId) + ".");
    });
    $("#studentChecklist").addEventListener("change", updateSelectedCount);
    $("#bulkAdvisor").addEventListener("change", renderStudents);
    $("#showCreateBtn").addEventListener("click", function () { resetUserForm(); openModal("userFormCard", "#fullName"); });
    $("#showAssignBtn").addEventListener("click", function () { renderStudents(); openModal("assignCard", "#bulkAdvisor"); });
    $("#cancelUserForm").addEventListener("click", function () { resetUserForm(); closeModal("userFormCard"); });
    $("#cancelAssign").addEventListener("click", function () { document.querySelectorAll("#studentChecklist input").forEach(function (input) { input.checked = false; }); updateSelectedCount(); closeModal("assignCard"); });
    document.querySelectorAll("[data-close]").forEach(function (button) { button.addEventListener("click", function () { if (button.dataset.close === "userFormCard") resetUserForm(); closeModal(button.dataset.close); }); });
    bindModal("userFormCard", resetUserForm); bindModal("assignCard");
    $("#logoutBtn").addEventListener("click", function () { if (window.StudyPathGuard) window.StudyPathGuard.signOut(); window.location.href = "login.html"; });
  }
  function init() {
    const session = window.StudyPathGuard ? window.StudyPathGuard.requireRole("admin") : null;
    if (session === null) return;
    $("#adminName").textContent = session.name || "Quản trị viên"; $("#adminInitials").textContent = initials(session.name);
    setDefaults().then(function () { fillAdvisorOptions(); renderStudents(); refreshFilter(); bindEvents(); }).catch(function () { $("#usersBody").innerHTML = '<tr><td colspan="6">Không tải được dữ liệu tài khoản. Hãy thử tải lại trang.</td></tr>'; });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
