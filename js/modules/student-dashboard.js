/* ============================================================
   StudyPath AI — Student Dashboard (Tổng quan sinh viên)
   Dữ liệu render từ mảng JS + tương tác: toggle việc cần làm,
   đánh dấu thông báo đã đọc, chuyển trạng thái demo, toast.
   ============================================================ */

"use strict";

/* ---------- 1. DỮ LIỆU MẪU (render từ mảng) ---------- */

const KPIS = [
  {
    label: "Tín chỉ tích lũy",
    value: "84/130",
    delta: "64.6%",
    deltaClass: "blue",
    icon: "book",
  },
  {
    label: "GPA tích lũy",
    value: "3.25",
    delta: "+0.25 so với HK trước",
    deltaClass: "green",
    icon: "grad",
  },
  {
    label: "Kế hoạch",
    value: "2",
    delta: "Đang hoạt động",
    deltaClass: "gray",
    icon: "plan",
  },
  {
    label: "Cảnh báo",
    value: "1",
    delta: "Quá tải học kỳ",
    deltaClass: "amber",
    icon: "alert",
  },
];

const CHART = {
  title: "Tiến độ tín chỉ theo học kỳ",
  subtitle: "Số tín chỉ đã và đang đăng ký",
  hint: "4 học kỳ gần nhất",
  max: 24,
  ticks: [24, 18, 12, 0],
  bars: [
    { label: "HK1 2025–26", value: 14, highlight: false },
    { label: "HK2 2025–26", value: 16, highlight: false },
    { label: "Hè 2026", value: 6, highlight: false },
    { label: "HK1 2026–27", value: 21, highlight: true },
  ],
};

const PLAN = {
  badge: "Bản nháp",
  name: "HK1 2026–2027",
  stats: [
    { value: "6", label: "Học phần" },
    { value: "21", label: "Tín chỉ" },
    { value: "01/10", label: "Cập nhật" },
  ],
  warning: "21 tín chỉ vượt ngưỡng khuyến nghị 18 tín chỉ.",
};

let todos = [
  {
    id: 1,
    title: "Hoàn tất kế hoạch HK1 2026–2027",
    due: "Hôm nay",
    overdue: true,
    done: false,
  },
  {
    id: 2,
    title: "Xác nhận môn tự chọn chuyên ngành",
    due: "05/10",
    overdue: false,
    done: false,
  },
  {
    id: 3,
    title: "Cập nhật mục tiêu nghề nghiệp",
    due: "12/10",
    overdue: false,
    done: false,
  },
];

let notifications = [
  {
    id: 1,
    icon: "chat",
    title: "Cố vấn đã bình luận kế hoạch của bạn",
    time: "12 phút trước",
    unread: true,
  },
  {
    id: 2,
    icon: "open",
    title: "IT3060 mở đăng ký lớp mới",
    time: "2 giờ trước",
    unread: true,
  },
  {
    id: 3,
    icon: "clock",
    title: "Nhắc hạn gửi kế hoạch học kỳ",
    time: "Hôm qua",
    unread: true,
  },
];

/* ---------- 2. BỘ ICON SVG (inline, phong cách line-icon) ---------- */

const ICONS = {
  book: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  grad: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/></svg>',
  plan: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  warn: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  open: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
};

/* ---------- 3. HÀM RENDER TỪNG KHỐI ---------- */

function renderKPIs() {
  return `
    <section class="kpi-grid" aria-label="Chỉ số tổng quan">
      ${KPIS.map(
        (k) => `
        <article class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">${k.label}</span>
            <span class="kpi-icon" aria-hidden="true">${ICONS[k.icon]}</span>
          </div>
          <p class="kpi-value">${k.value}</p>
          <p class="kpi-delta ${k.deltaClass}">${k.delta}</p>
        </article>
      `,
      ).join("")}
    </section>
  `;
}

function renderChart() {
  const plotHeight = 164; // px phần vẽ (190 - 26 padding-bottom)
  return `
    <section class="card" aria-label="${CHART.title}">
      <div class="card-head">
        <div>
          <h2 class="card-title">${CHART.title}</h2>
          <p class="card-sub">${CHART.subtitle}</p>
        </div>
        <span class="card-hint">${CHART.hint}</span>
      </div>
      <div class="chart-wrap">
        <div class="y-axis" aria-hidden="true">
          ${CHART.ticks.map((t) => `<span>${t}</span>`).join("")}
        </div>
        <div class="bars">
          ${CHART.bars
            .map(
              (b) => `
            <div class="bar-col">
              <span class="bar-value">${b.value}</span>
              <div class="bar ${b.highlight ? "highlight" : ""}"
                   style="height:${(b.value / CHART.max) * plotHeight}px"
                   title="${b.label}: ${b.value} tín chỉ"></div>
              <span class="bar-label">${b.label}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderPlan() {
  return `
    <section class="card" aria-label="Kế hoạch hiện tại">
      <div class="card-head">
        <h2 class="card-title">Kế hoạch hiện tại</h2>
        <span class="pill pill-amber">${PLAN.badge}</span>
      </div>
      <p class="plan-name">${PLAN.name}</p>
      <div class="plan-stats">
        ${PLAN.stats
          .map(
            (s) => `
          <div class="plan-stat"><strong>${s.value}</strong><span>${s.label}</span></div>
        `,
          )
          .join("")}
      </div>
      <div class="warning-box" role="alert">
        <span class="warn-icon" aria-hidden="true">${ICONS.warn}</span>
        <span>${PLAN.warning}</span>
      </div>
      <div class="plan-actions">
        <button type="button" class="btn btn-secondary" data-action="view-plan">Xem kế hoạch</button>
      </div>
    </section>
  `;
}

function renderTodos() {
  const remaining = todos.filter((t) => !t.done).length;
  return `
    <section class="card" aria-label="Việc cần làm">
      <div class="card-head">
        <h2 class="card-title">Việc cần làm</h2>
        <span class="todo-count" id="todo-count">${remaining} việc</span>
      </div>
      <ul class="todo-list">
        ${todos
          .map(
            (t) => `
          <li class="todo-item ${t.done ? "done" : ""}" data-todo-id="${t.id}" role="checkbox" aria-checked="${t.done}" tabindex="0">
            <span class="todo-check" aria-hidden="true">${ICONS.check}</span>
            <div class="todo-body">
              <p class="todo-title">${t.title}</p>
              <p class="todo-due ${t.overdue && !t.done ? "overdue" : ""}">${t.due}</p>
            </div>
          </li>
        `,
          )
          .join("")}
      </ul>
    </section>
  `;
}

function renderNotifications() {
  return `
    <section class="card" aria-label="Thông báo mới">
      <div class="card-head">
        <h2 class="card-title">Thông báo mới</h2>
        <button type="button" class="link-btn" data-action="read-all">Xem tất cả</button>
      </div>
      <ul class="notif-list">
        ${notifications
          .map(
            (n) => `
          <li class="notif-item ${n.unread ? "" : "read"}" data-notif-id="${n.id}" tabindex="0">
            <span class="notif-icon" aria-hidden="true">${ICONS[n.icon]}</span>
            <div class="notif-body">
              <p class="notif-title">${n.title}</p>
              <p class="notif-time">${n.time}</p>
            </div>
            <span class="notif-dot" aria-label="${n.unread ? "Chưa đọc" : "Đã đọc"}"></span>
          </li>
        `,
          )
          .join("")}
      </ul>
    </section>
  `;
}

/* ---------- 4. RENDER TOÀN TRANG THEO TRẠNG THÁI ---------- */

const root = document.getElementById("dashboard-content");

function renderNormal() {
  root.innerHTML = `
    ${renderKPIs()}
    <div class="grid-mid">
      ${renderChart()}
      ${renderPlan()}
    </div>
    <div class="grid-bottom">
      ${renderTodos()}
      ${renderNotifications()}
    </div>
  `;
}

function renderSkeleton() {
  root.innerHTML = `
    <section class="kpi-grid" aria-label="Đang tải chỉ số">
      <div class="skeleton sk-card"></div>
      <div class="skeleton sk-card"></div>
      <div class="skeleton sk-card"></div>
      <div class="skeleton sk-card"></div>
    </section>
    <div class="grid-mid">
      <div class="skeleton sk-chart"></div>
      <div class="skeleton sk-chart"></div>
    </div>
    <div class="grid-bottom">
      <div>
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
      </div>
      <div>
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
        <div class="skeleton sk-row"></div>
      </div>
    </div>
  `;
}

/* ---------- 5. TƯƠNG TÁC ---------- */

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  document.querySelector(".card[aria-label='Việc cần làm']").outerHTML =
    renderTodos();
  showToast(
    todo.done ? `Đã hoàn thành: "${todo.title}"` : `Đã mở lại: "${todo.title}"`,
  );
}

function markRead(id) {
  const notif = notifications.find((n) => n.id === id);
  if (!notif || !notif.unread) return;
  notif.unread = false;
  document.querySelector(".card[aria-label='Thông báo mới']").outerHTML =
    renderNotifications();
}

function markAllRead() {
  notifications.forEach((n) => (n.unread = false));
  document.querySelector(".card[aria-label='Thông báo mới']").outerHTML =
    renderNotifications();
  showToast("Đã đánh dấu tất cả thông báo là đã đọc");
}

/* Event delegation: 1 listener duy nhất trên #dashboard-content,=================================================================
   re-render bằng innerHTML/outerHTML không làm mất listener. */
function handleContentClick(e) {
  const todoEl = e.target.closest(".todo-item");
  if (todoEl) {
    toggleTodo(Number(todoEl.dataset.todoId));
    return;
  }

  const notifEl = e.target.closest(".notif-item");
  if (notifEl) {
    markRead(Number(notifEl.dataset.notifId));
    return;
  }

  const actionBtn = e.target.closest("[data-action]");
  if (!actionBtn) return;

  const action = actionBtn.dataset.action;
  if (action === "read-all") markAllRead();
  else if (action === "view-plan")
    showToast("Giả lập: mở chi tiết kế hoạch HK1 2026–2027");
}

/* Bàn phím cho các hàng todo/notif (accessibility cơ bản) */
function handleContentKeydown(e) {
  if (e.key !== "Enter" && e.key !== " ") return;
  const row = e.target.closest(".todo-item, .notif-item");
  if (!row) return;
  e.preventDefault();
  row.click();
}

function hydrateGreeting() {
  const el = document.getElementById("greeting-name");
  if (!el || !window.StudyPathAPI) return;
  const user = StudyPathAPI.getCurrentUser();
  const parts = user && user.name ? String(user.name).trim().split(/\s+/) : [];
  el.textContent = parts.length ? parts[parts.length - 1] : "bạn";
}

function bindShellEvents() {
  document.getElementById("btn-new-plan").addEventListener("click", () => {
    showToast("Giả lập: mở form lập kế hoạch học kỳ");
  });
}

/* ---------- 6. KHỞI ĐỘNG ---------- */

hydrateGreeting();
bindShellEvents();
root.addEventListener("click", handleContentClick);
root.addEventListener("keydown", handleContentKeydown);

/* Hiệu ứng tải trang lần đầu: skeleton -> dữ liệu thật */
renderSkeleton();
setTimeout(renderNormal, 800);
