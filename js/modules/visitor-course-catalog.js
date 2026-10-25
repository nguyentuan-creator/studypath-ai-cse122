/* =========================================================
   StudyPath AI — màn hình Danh mục học phần (Khách)
   Chức năng: tải dữ liệu qua StudyPathAPI, tìm kiếm, lọc, sắp xếp,
   phân trang, skeleton, trạng thái rỗng/lỗi và modal chi tiết.
   ========================================================= */
(function () {
  "use strict";

  const PAGE_SIZE = 6;

  let programs = [];
  let courses = [];
  let currentPage = 1;
  let isLoaded = false;

  /* ===== DOM ===== */
  const subtitleEl = document.getElementById("courseSubtitle");
  const summaryEl = document.getElementById("resultSummary");
  const courseGrid = document.getElementById("courseGrid");
  const emptyState = document.getElementById("emptyState");
  const loadError = document.getElementById("loadError");
  const retryLoadBtn = document.getElementById("retryLoad");
  const pagination = document.getElementById("pagination");
  const filterForm = document.getElementById("filterForm");
  const searchInput = document.getElementById("searchInput");
  const programSelect = document.getElementById("filterProgram");
  const creditsSelect = document.getElementById("filterCredits");
  const openOnlyCheckbox = document.getElementById("openOnly");
  const sortSelect = document.getElementById("sortSelect");
  const resetFiltersBtn = document.getElementById("resetFilters");
  const emptyResetBtn = document.getElementById("emptyReset");
  const courseModal = document.getElementById("courseModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalTag = document.getElementById("modalTag");
  const modalCode = document.getElementById("modalCode");
  const modalCredits = document.getElementById("modalCredits");
  const modalProgram = document.getElementById("modalProgram");
  const modalFaculty = document.getElementById("modalFaculty");
  const modalPrereqs = document.getElementById("modalPrereqs");
  const modalStatus = document.getElementById("modalStatus");
  const modalDesc = document.getElementById("modalDesc");
  const modalClose = document.getElementById("modalClose");
  const modalCancel = document.getElementById("modalCancel");
  const modalDetailLink = document.getElementById("modalDetailLink");

  /* ===== LỌC + SẮP XẾP ===== */
  const SORTERS = {
    code: function (a, b) { return a.code.localeCompare(b.code); },
    name: function (a, b) { return a.name.localeCompare(b.name, "vi"); },
    credits: function (a, b) { return a.credits - b.credits || a.code.localeCompare(b.code); }
  };

  function getFilteredCourses() {
    const keyword = searchInput.value.trim().toLowerCase();
    const program = programSelect.value;
    const credits = creditsSelect.value;
    const openOnly = openOnlyCheckbox.checked;
    const sorter = SORTERS[sortSelect.value] || SORTERS.code;

    const result = courses.filter(function (course) {
      const matchesKeyword = keyword === "" ||
        course.name.toLowerCase().includes(keyword) ||
        course.code.toLowerCase().includes(keyword);
      const matchesProgram = program === "" || course.program === program;
      const matchesCredits = credits === "" || course.credits === Number(credits);
      const matchesStatus = !openOnly || course.status === "Đang mở";

      return matchesKeyword && matchesProgram && matchesCredits && matchesStatus;
    });

    return result.sort(sorter);
  }

  /* ===== RENDER LƯỚI HỌC PHẦN ===== */
  function courseCardHTML(course) {
    const prereqText = course.prereqs.length > 0 ? course.prereqs.join(", ") : "Không";
    const statusClass = course.status === "Đang mở" ? "status-open" : "status-paused";

    return `
      <article class="course-card card">
        <div class="course-card-top">
          <span class="course-code">${course.code}</span>
          <span class="course-status ${statusClass}"><span class="status-dot"></span>${course.status}</span>
        </div>
        <h3 class="course-name">${course.name}</h3>
        <ul class="course-meta text-sm text-muted">
          <li>${course.credits} tín chỉ</li>
          <li>Tiên quyết: ${prereqText}</li>
          <li>${course.faculty}</li>
        </ul>
        <div class="course-card-foot">
          <button type="button" class="card-link" data-action="detail" data-id="${course.id}">Xem chi tiết →</button>
        </div>
      </article>`;
  }

  function renderGrid(list) {
    if (list.length === 0) {
      courseGrid.innerHTML = "";
      return;
    }
    courseGrid.innerHTML = list.map(courseCardHTML).join("");
  }

  /* ===== PHÂN TRANG (‹ 1 2 3 … N ›) ===== */
  function pageList(current, total) {
    const items = [];
    for (let i = 1; i <= total; i++) {
      /* Luôn giữ trang đầu, trang cuối và các trang lân cận trang hiện tại */
      if (i === 1 || i === total || Math.abs(i - current) <= 1) {
        items.push(i);
      }
    }

    /* Chèn dấu "…" vào các khoảng bị bỏ qua */
    const result = [];
    let prev = 0;
    items.forEach(function (p) {
      if (p - prev > 1) {
        result.push("…");
      }
      result.push(p);
      prev = p;
    });
    return result;
  }

  function renderPagination(totalCount) {
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    let html = `<button type="button" class="page-btn" data-page="prev" ${currentPage === 1 ? "disabled" : ""}>&lsaquo;</button>`;
    pageList(currentPage, totalPages).forEach(function (item) {
      if (item === "…") {
        html += `<span class="page-ellipsis">…</span>`;
      } else if (item === currentPage) {
        html += `<button type="button" class="page-btn active" data-page="${item}">${item}</button>`;
      } else {
        html += `<button type="button" class="page-btn" data-page="${item}">${item}</button>`;
      }
    });
    html += `<button type="button" class="page-btn" data-page="next" ${currentPage === totalPages ? "disabled" : ""}>&rsaquo;</button>`;

    pagination.innerHTML = html;
  }

  /* ===== CẬP NHẬT TOÀN BỘ GIAO DIỆN ===== */
  function updateView() {
    if (!isLoaded) {
      return;
    }

    const filtered = getFilteredCourses();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageCourses = filtered.slice(start, start + PAGE_SIZE);

    courseGrid.setAttribute("aria-busy", "false");
    renderGrid(pageCourses);
    renderPagination(filtered.length);

    if (filtered.length === 0) {
      summaryEl.textContent = "Không tìm thấy học phần phù hợp";
      emptyState.classList.remove("hidden");
    } else {
      summaryEl.textContent =
        "Hiển thị " + (start + 1) + "–" + (start + pageCourses.length) + " trong " + filtered.length + " học phần";
      emptyState.classList.add("hidden");
    }
  }

  /* ===== MODAL CHI TIẾT HỌC PHẦN ===== */
  function findCourseById(id) {
    for (let i = 0; i < courses.length; i++) {
      if (courses[i].id === id) {
        return courses[i];
      }
    }
    return null;
  }

  function openCourseModal(id) {
    const course = findCourseById(id);
    if (course === null) {
      return;
    }

    modalTitle.textContent = course.name;
    modalTag.textContent = course.status;
    modalTag.className = "tag " + (course.status === "Đang mở" ? "tag-green" : "tag-amber");
    modalCode.textContent = course.code;
    modalCredits.textContent = course.credits;
    modalProgram.textContent = course.program;
    modalFaculty.textContent = course.faculty;
    modalPrereqs.textContent = course.prereqs.length > 0 ? course.prereqs.join(", ") : "Không";
    modalStatus.textContent = course.status;
    modalDesc.textContent = course.description;
    modalDetailLink.href = "visitor-course-detail.html?code=" + encodeURIComponent(course.code);

    courseModal.classList.remove("hidden");
  }

  function closeCourseModal() {
    courseModal.classList.add("hidden");
  }

  /* ===== TRẠNG THÁI ĐANG TẢI (SKELETON) ===== */
  function showSkeleton() {
    let html = "";
    for (let i = 0; i < PAGE_SIZE; i++) {
      html += `
        <article class="card skeleton-card" aria-hidden="true">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-chip"></div>
        </article>`;
    }
    courseGrid.setAttribute("aria-busy", "true");
    courseGrid.innerHTML = html;
  }

  /* ===== TẢI DỮ LIỆU + TRẠNG THÁI LỖI ===== */
  function renderProgramOptions() {
    let html = '<option value="">Tất cả chương trình</option>';
    programs.forEach(function (program) {
      html += `<option value="${program.name}">${program.name}</option>`;
    });
    programSelect.innerHTML = html;
  }

  function showLoadError() {
    isLoaded = false;
    courses = [];
    courseGrid.setAttribute("aria-busy", "false");
    courseGrid.innerHTML = "";
    emptyState.classList.add("hidden");
    loadError.classList.remove("hidden");
    pagination.innerHTML = "";
    summaryEl.textContent = "Không tải được dữ liệu học phần";
    retryLoadBtn.disabled = false;
  }

  async function loadData() {
    emptyState.classList.add("hidden");
    loadError.classList.add("hidden");
    retryLoadBtn.disabled = true;
    pagination.innerHTML = "";
    summaryEl.textContent = "Đang tải danh sách học phần…";
    showSkeleton();

    try {
      const data = await StudyPathAPI.loadData("courses");
      programs = data.programs;
      courses = data.courses;
      isLoaded = true;

      renderProgramOptions();
      subtitleEl.textContent = courses.length + " học phần · " + programs.length + " chương trình đào tạo";
      updateView();
    } catch (error) {
      console.error("Không tải được danh mục học phần:", error);
      showLoadError();
    }
  }

  /* ===== GẮN SỰ KIỆN ===== */

  /* Nút "Lọc": chặn gửi trang, áp bộ lọc (tìm kiếm đã áp tức thì sẵn) */
  filterForm.addEventListener("submit", function (event) {
    event.preventDefault();
    currentPage = 1;
    updateView();
  });

  /* Tìm kiếm tức thì khi người dùng gõ */
  searchInput.addEventListener("input", function () {
    currentPage = 1;
    updateView();
  });

  /* Đổi bộ lọc hoặc kiểu sắp xếp → trở về trang 1 và render lại */
  programSelect.addEventListener("change", function () {
    currentPage = 1;
    updateView();
  });

  creditsSelect.addEventListener("change", function () {
    currentPage = 1;
    updateView();
  });

  openOnlyCheckbox.addEventListener("change", function () {
    currentPage = 1;
    updateView();
  });

  sortSelect.addEventListener("change", function () {
    currentPage = 1;
    updateView();
  });

  /* Đặt lại toàn bộ bộ lọc về mặc định (checkbox giữ trạng thái checked như thiết kế) */
  function resetFiltersAndRender() {
    filterForm.reset();
    currentPage = 1;
    updateView();
  }

  resetFiltersBtn.addEventListener("click", resetFiltersAndRender);
  emptyResetBtn.addEventListener("click", resetFiltersAndRender);

  /* Bấm "Xem chi tiết" trên thẻ (ủy quyền sự kiện trên lưới) */
  courseGrid.addEventListener("click", function (event) {
    const detailBtn = event.target.closest('[data-action="detail"]');
    if (detailBtn) {
      openCourseModal(Number(detailBtn.dataset.id));
    }
  });

  /* Chuyển trang: số trang hoặc nút ‹ › (ủy quyền sự kiện trên thanh phân trang) */
  pagination.addEventListener("click", function (event) {
    const pageBtn = event.target.closest("[data-page]");
    if (!pageBtn || pageBtn.disabled) {
      return;
    }

    const target = pageBtn.dataset.page;
    if (target === "prev") {
      currentPage = Math.max(1, currentPage - 1);
    } else if (target === "next") {
      currentPage = currentPage + 1;
    } else {
      currentPage = Number(target);
    }
    updateView();
  });

  /* Đóng modal: nút, bấm nền hoặc phím Esc */
  modalClose.addEventListener("click", closeCourseModal);
  modalCancel.addEventListener("click", closeCourseModal);
  courseModal.addEventListener("click", function (event) {
    if (event.target === courseModal) {
      closeCourseModal();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeCourseModal();
    }
  });

  /* ===== KHỞI ĐỘNG ===== */
  retryLoadBtn.addEventListener("click", loadData);
  loadData();
})();
