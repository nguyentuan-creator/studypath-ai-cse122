/* =========================================================
   StudyPath AI — màn hình Thông báo
   Chức năng: tải danh sách qua StudyPathAPI, render trạng thái
   đang tải / rỗng / lỗi + thử lại, đánh dấu đã đọc từng mục
   hoặc tất cả (lưu localStorage, đồng bộ dot đỏ trên chuông).
   ========================================================= */
(function () {
  "use strict";

  const READ_KEY = "studypath.readNotifications";

  const listEl = document.getElementById("notifList");
  const skeletonEl = document.getElementById("notifSkeleton");
  const emptyEl = document.getElementById("notifEmpty");
  const errorEl = document.getElementById("notifError");
  const summaryEl = document.getElementById("unreadSummary");
  const markAllBtn = document.getElementById("markAllRead");
  const bellDot = document.getElementById("bellDot");
  const retryBtn = document.getElementById("retryLoad");
  const topbarAvatar = document.getElementById("topbarAvatar");
  const topbarName = document.getElementById("topbarName");
  const topbarRole = document.getElementById("topbarRole");

  const ICONS = {
    plan:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
    feedback:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    ai:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    reminder:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v3"/><circle cx="12" cy="17" r="0.5"/></svg>'
  };

  const TAG_CLASS = {
    plan: "tag-green",
    feedback: "tag-blue",
    ai: "tag-red",
    reminder: "tag-amber"
  };

  let items = [];
  let readIds = loadReadIds();

  function loadReadIds() {
    try {
      const raw = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
      return new Set(Array.isArray(raw) ? raw : []);
    } catch (error) {
      return new Set();
    }
  }

  function saveReadIds() {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(readIds)));
  }

  function isRead(item) {
    return item.read === true || readIds.has(item.id);
  }

  function renderTopbar() {
    const user = StudyPathAPI.getCurrentUser();
    if (!user) {
      topbarName.textContent = "Khách";
      topbarRole.textContent = "";
      topbarRole.classList.add("hidden");
      topbarAvatar.classList.add("hidden");
      return;
    }

    const name = String(user.name || "").trim();
    topbarName.textContent = name;
    topbarRole.textContent = user.roleLabel || "";
    topbarAvatar.textContent = name.charAt(0).toUpperCase();
    topbarRole.classList.remove("hidden");
    topbarAvatar.classList.remove("hidden");
  }

  function showSkeleton() {
    skeletonEl.classList.remove("hidden");
    emptyEl.classList.add("hidden");
    errorEl.classList.add("hidden");
    listEl.innerHTML = "";
    summaryEl.textContent = "Đang tải…";
  }

  function showError() {
    skeletonEl.classList.add("hidden");
    emptyEl.classList.add("hidden");
    listEl.innerHTML = "";
    errorEl.classList.remove("hidden");
    summaryEl.textContent = "";
    markAllBtn.disabled = true;
  }

  function updateHeader(unreadCount) {
    summaryEl.textContent =
      unreadCount === 0 ? "Tất cả thông báo đã đọc" : unreadCount + " thông báo chưa đọc";
    bellDot.classList.toggle("hidden", unreadCount === 0);
    markAllBtn.classList.remove("hidden");
    markAllBtn.disabled = unreadCount === 0;
  }

  function createRow(item) {
    const key = TAG_CLASS[item.categoryKey] ? item.categoryKey : "plan";

    const row = document.createElement("li");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "notif-item" + (isRead(item) ? " is-read" : "");
    btn.dataset.id = String(item.id);
    btn.setAttribute("aria-label", item.title + " — đánh dấu đã đọc");

    const icon = document.createElement("span");
    icon.className = "notif-icon notif-icon--" + key;
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = ICONS[key];

    const body = document.createElement("span");
    body.className = "notif-body";

    const title = document.createElement("span");
    title.className = "notif-title";
    title.textContent = item.title;

    const desc = document.createElement("span");
    desc.className = "notif-desc";
    desc.textContent = item.description;

    body.appendChild(title);
    body.appendChild(desc);

    const meta = document.createElement("span");
    meta.className = "notif-meta";

    const tag = document.createElement("span");
    tag.className = "tag " + TAG_CLASS[key];
    tag.textContent = item.category;

    const time = document.createElement("span");
    time.className = "notif-time";
    time.textContent = item.time;

    meta.appendChild(tag);
    meta.appendChild(time);

    btn.appendChild(icon);
    btn.appendChild(body);
    btn.appendChild(meta);
    row.appendChild(btn);

    return row;
  }

  function render() {
    skeletonEl.classList.add("hidden");
    errorEl.classList.add("hidden");
    listEl.innerHTML = "";

    if (items.length === 0) {
      emptyEl.classList.remove("hidden");
      summaryEl.textContent = "";
      bellDot.classList.add("hidden");
      markAllBtn.classList.add("hidden");
      markAllBtn.disabled = true;
      return;
    }

    emptyEl.classList.add("hidden");
    let unreadCount = 0;

    items.forEach(function (item) {
      if (!isRead(item)) {
        unreadCount += 1;
      }
      listEl.appendChild(createRow(item));
    });

    updateHeader(unreadCount);
  }

  async function load() {
    showSkeleton();
    try {
      const data = await StudyPathAPI.loadData("notifications");
      items = data.notifications;
      render();
    } catch (error) {
      console.error("Tải thông báo thất bại:", error);
      showError();
    }
  }

  listEl.addEventListener("click", function (event) {
    const btn = event.target.closest(".notif-item");
    if (!btn) {
      return;
    }
    readIds.add(Number(btn.dataset.id));
    saveReadIds();
    render();
  });

  markAllBtn.addEventListener("click", function () {
    items.forEach(function (item) {
      readIds.add(item.id);
    });
    saveReadIds();
    render();
  });

  retryBtn.addEventListener("click", load);

  renderTopbar();
  load();
})();
