/* Semester plan — planItems CRUD + validation + AI-2 workload risk (aiSuggestions) */
(function () {
  "use strict";

  var AI_PROCESSING_MS = 800;
  var SEND_PROCESSING_MS = 650;
  var THRESHOLD = 18;

  var STATUS = {
    draft: { label: "Bản nháp", tag: "tag tag-blue", step: 0, locked: false },
    pending: { label: "Chờ duyệt", tag: "tag tag-amber", step: 1, locked: true },
    submitted: { label: "Chờ duyệt", tag: "tag tag-amber", step: 1, locked: true },
    approved: { label: "Đã duyệt", tag: "tag tag-green", step: 2, locked: true },
    rejected: { label: "Bị từ chối", tag: "tag tag-red", step: 3, locked: false },
    archived: { label: "Đã lưu trữ", tag: "tag tag-gray", step: -1, locked: true },
  };

  var AI_STATUS = {
    generated: { label: "Mới tạo", tag: "tag tag-purple" },
    edited: { label: "Đang chỉnh sửa", tag: "tag tag-blue" },
    accepted: { label: "Đã chấp nhận", tag: "tag tag-green" },
    dismissed: { label: "Đã từ chối", tag: "tag tag-red" },
  };

  var RISK = {
    high: { label: "Quá tải", className: "ai2-risk-high" },
    medium: { label: "Cần chú ý", className: "ai2-risk-medium" },
    low: { label: "An toàn", className: "ai2-risk-low" },
  };

  var el = {};
  var state = {
    user: null,
    catalog: [],
    catalogById: Object.create(null),
    plans: [],
    items: [],
    suggestions: [],
    plan: null,
    aiLoading: false,
    aiError: null,
    submitting: false,
    editingId: null,
    toastTimer: null,
  };

  /* ---------- Tiện ích ---------- */
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () {
      el.toast.classList.remove("show");
    }, 2800);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[character];
    });
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "";
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    return day + "/" + month + "/" + date.getFullYear();
  }

  function normalizeText(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function statusInfo(plan) {
    return STATUS[plan && plan.status] || STATUS.draft;
  }

  function canEditPlan() {
    return Boolean(state.plan) && !statusInfo(state.plan).locked;
  }

  function nextPlanId(plans) {
    var max = 0;
    plans.forEach(function (plan) {
      var match = /^PL-2026-(\d+)$/.exec(plan.id || "");
      if (match) max = Math.max(max, Number(match[1]));
    });
    return "PL-2026-" + String(max + 1).padStart(3, "0");
  }

  function nextItemNumber(items) {
    var max = 0;
    items.forEach(function (item) {
      var match = /^PI-(\d+)$/.exec(item.id || "");
      if (match) max = Math.max(max, Number(match[1]));
    });
    return max + 1;
  }

  /* ---------- Dữ liệu kế hoạch ---------- */
  function plansForUser() {
    if (!state.user) return [];
    return state.plans.filter(function (plan) {
      return plan.studentId === state.user.studentId;
    });
  }

  function semesterPlansForUser() {
    return plansForUser().filter(function (plan) {
      return String(plan.title || "").indexOf("Lộ trình AI") !== 0;
    });
  }

  function itemsForPlan(planId) {
    return state.items.filter(function (item) {
      return item.planId === planId;
    });
  }

  function currentCourses() {
    if (!state.plan) return [];
    return itemsForPlan(state.plan.id).map(function (item) {
      var course = state.catalogById[item.courseId] || {};
      return {
        id: item.courseId,
        code: course.code || item.courseCode || "HP" + item.courseId,
        name: item.courseName || course.name || "Học phần",
        credits: Number(item.credits || course.credits || 0),
        prereqs: course.prereqs || [],
        itemId: item.id,
        note: item.note || "",
      };
    });
  }

  function totalCredits(courses) {
    return (courses || currentCourses()).reduce(function (sum, course) {
      return sum + Number(course.credits || 0);
    }, 0);
  }

  function completedCodes() {
    if (!state.plan || !state.user) return [];
    var codes = [];
    plansForUser().forEach(function (plan) {
      if (plan.id === state.plan.id) return;
      if (plan.status !== "approved" && plan.status !== "archived") return;
      itemsForPlan(plan.id).forEach(function (item) {
        var course = state.catalogById[item.courseId];
        if (course && course.code && codes.indexOf(course.code) === -1) {
          codes.push(course.code);
        }
      });
    });
    return codes;
  }

  function currentSignature() {
    return window.WorkloadEngine
      ? window.WorkloadEngine.signature(currentCourses())
      : "";
  }

  function persistPlanState() {
    if (!state.plan) return;
    state.plan.credits = totalCredits();
    state.plan.updatedAt = new Date().toISOString();
    window.StudyPathAPI.savePlanItems(state.items);
    window.StudyPathAPI.savePlans(state.plans);
  }

  function touchEditablePlan() {
    if (!state.plan) return;
    if (state.plan.status === "rejected") state.plan.status = "draft";
  }

  /* ---------- Chọn kế hoạch ---------- */
  function pickInitialPlan() {
    var mine = semesterPlansForUser().slice().sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
    var requested = new URLSearchParams(window.location.search).get("planId");
    var requestedPlan = mine.find(function (plan) {
      return plan.id === requested;
    });
    if (requestedPlan) return requestedPlan;

    var editable = mine.find(function (plan) {
      return plan.status === "draft" || plan.status === "rejected";
    });
    return editable || mine[0] || null;
  }

  function selectPlan(planId) {
    var plan = semesterPlansForUser().find(function (candidate) {
      return candidate.id === planId;
    });
    if (!plan) return;

    closeEditModal();
    closeCourseModal();
    state.plan = plan;
    state.aiError = null;
    state.aiLoading = false;

    try {
      var url = new URL(window.location.href);
      url.searchParams.set("planId", plan.id);
      window.history.replaceState(null, "", url.toString());
    } catch (error) {
      /* bỏ qua nếu trình duyệt chặn history */
    }

    renderAll();
  }

  function renderPlanPicker() {
    var mine = semesterPlansForUser().slice().sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });

    el.planSelect.innerHTML = "";
    mine.forEach(function (plan) {
      var option = document.createElement("option");
      option.value = plan.id;
      option.textContent =
        plan.title + " (" + plan.semester + " · " + statusInfo(plan).label + ")";
      el.planSelect.appendChild(option);
    });

    if (!mine.length) {
      var empty = document.createElement("option");
      empty.textContent = "Chưa có kế hoạch";
      el.planSelect.appendChild(empty);
    }

    el.planSelect.disabled = mine.length === 0;
    if (state.plan) el.planSelect.value = state.plan.id;
  }

  function renderPlanMeta() {
    var info = statusInfo(state.plan);
    var courses = currentCourses();
    var total = totalCredits(courses);
    var updated = state.plan ? state.plan.updatedAt || state.plan.createdAt : "";

    el.planTitle.textContent = state.plan
      ? "Kế hoạch học kỳ — " + state.plan.semester
      : "Kế hoạch học kỳ";
    el.planSubtitle.textContent = state.plan
      ? info.label +
        " · " +
        total +
        " tín chỉ · Cập nhật " +
        (formatDate(updated) || "hôm nay")
      : "Chưa có kế hoạch.";
    document.title = state.plan
      ? "Kế hoạch học kỳ — " + state.plan.semester + " | StudyPath AI"
      : "Kế hoạch học kỳ | StudyPath AI";

    el.planStatusTag.textContent = state.plan ? info.label : "Chưa có";
    el.planStatusTag.className = "tag " + (state.plan ? info.tag.replace("tag ", "") : "tag-gray");

    el.stepperSteps.forEach(function (step, index) {
      step.classList.toggle("active", state.plan != null && index === info.step);
    });

    var locked = Boolean(state.plan) && info.locked;
    el.saveBtn.disabled = !state.plan || locked || state.submitting;
    el.submitBtn.disabled = !state.plan || locked || state.submitting;
    el.planSelect.disabled = semesterPlansForUser().length === 0;
    el.findCourseBtn.disabled = !canEditPlan();
    el.ai2CheckBtn.disabled = !state.plan || state.aiLoading;

    if (locked) {
      var message =
        state.plan.status === "approved"
          ? "Kế hoạch đã được duyệt nên được khóa chỉnh sửa. Bạn vẫn có thể kiểm tra quá tải."
          : state.plan.status === "archived"
            ? "Kế hoạch đã lưu trữ — chỉ xem, không thể chỉnh sửa."
            : "Kế hoạch đang chờ cố vấn duyệt nên tạm khóa chỉnh sửa. Bạn vẫn có thể kiểm tra quá tải.";
      el.planLock.textContent = message;
      el.planLock.classList.remove("hidden");
    } else {
      el.planLock.classList.add("hidden");
    }
  }

  /* ---------- Bảng học phần ---------- */
  function missingForCourse(course, inPlan, completed) {
    return (course.prereqs || []).filter(function (prereq) {
      return !inPlan[prereq] && !completed[prereq];
    });
  }

  function renderTable() {
    var courses = currentCourses();
    var total = totalCredits(courses);
    var inPlan = Object.create(null);
    var completed = Object.create(null);
    var counts = Object.create(null);

    courses.forEach(function (course) {
      inPlan[course.code] = true;
      counts[course.id] = (counts[course.id] || 0) + 1;
    });
    completedCodes().forEach(function (code) {
      completed[code] = true;
    });

    el.planBody.innerHTML = "";

    if (!state.plan) {
      el.planBody.innerHTML = '<tr><td colspan="5" class="plan-loading">Chưa có kế hoạch.</td></tr>';
      el.tableWrapper.classList.add("hidden");
      el.planEmpty.classList.add("hidden");
      el.planCount.textContent = "Chưa có kế hoạch";
      el.planTotal.textContent = "—";
      return;
    }

    if (!courses.length) {
      el.tableWrapper.classList.add("hidden");
      el.planEmpty.classList.remove("hidden");
      el.emptyAddBtn.disabled = !canEditPlan();
      el.planCount.textContent = "Tổng cộng · 0 học phần";
      el.planTotal.textContent = "0 tín chỉ";
      return;
    }

    el.tableWrapper.classList.remove("hidden");
    el.planEmpty.classList.add("hidden");

    courses.forEach(function (course) {
      var missing = missingForCourse(course, inPlan, completed);
      var duplicate = counts[course.id] > 1;
      var warn = duplicate || missing.length > 0;
      var tr = document.createElement("tr");
      if (warn) tr.className = "plan-row-warn";

      var prereqHtml;
      if (!(course.prereqs || []).length) {
        prereqHtml = '<span class="prereq-none">Không có</span>';
      } else if (missing.length) {
        prereqHtml =
          '<span class="prereq-warn">Thiếu: ' +
          missing.map(escapeHtml).join(" · ") +
          "</span>";
      } else {
        prereqHtml =
          '<span class="prereq-ok">Đủ: ' +
          course.prereqs.map(escapeHtml).join(" · ") +
          "</span>";
      }

      var note = duplicate
        ? "Trùng học phần"
        : course.note || (missing.length ? "Chưa thấy đủ tiên quyết" : "—");

      tr.innerHTML =
        "<td>" +
        '<span class="plan-course"><span class="pc-name"></span><small></small></span>' +
        "</td>" +
        "<td>" +
        course.credits +
        "</td>" +
        "<td>" +
        prereqHtml +
        "</td>" +
        '<td><span class="' +
        (warn ? "plan-note plan-note--warn" : "plan-note") +
        '"></span></td>' +
        '<td><span class="plan-actions">' +
        '<button type="button" class="row-action row-action--edit" data-action="edit" data-item-id="' +
        escapeHtml(course.itemId) +
        '"' +
        (canEditPlan() ? "" : " disabled") +
        ">Sửa</button>" +
        '<button type="button" class="row-action row-action--delete" data-action="delete" data-item-id="' +
        escapeHtml(course.itemId) +
        '"' +
        (canEditPlan() ? "" : " disabled") +
        ">Xoá</button>" +
        "</span></td>";

      tr.querySelector(".pc-name").textContent = course.name;
      tr.querySelector(".plan-course small").textContent = course.code;
      tr.querySelector(".plan-note").textContent = note;
      el.planBody.appendChild(tr);
    });

    el.planCount.textContent = "Tổng cộng · " + courses.length + " học phần";
    el.planTotal.textContent = total + " tín chỉ";
  }

  function collectIssues() {
    var courses = currentCourses();
    var inPlan = Object.create(null);
    var completed = Object.create(null);
    var counts = Object.create(null);
    var duplicates = [];
    var missing = [];

    courses.forEach(function (course) {
      if (!inPlan[course.code]) inPlan[course.code] = true;
      counts[course.id] = (counts[course.id] || 0) + 1;
      if (counts[course.id] === 2) duplicates.push(course.code);
    });
    completedCodes().forEach(function (code) {
      completed[code] = true;
    });
    courses.forEach(function (course) {
      missingForCourse(course, inPlan, completed).forEach(function (prereq) {
        missing.push({ course: course.code, prereq: prereq });
      });
    });

    return { duplicates: duplicates, missing: missing };
  }

  function renderValidation() {
    var issues = collectIssues();
    el.planValidation.innerHTML = "";

    if (issues.duplicates.length) {
      var duplicateAlert = document.createElement("div");
      duplicateAlert.className = "alert alert-danger";
      duplicateAlert.textContent =
        "Không thể gửi: học phần bị trùng trong kế hoạch — " +
        issues.duplicates.join(", ") +
        ".";
      el.planValidation.appendChild(duplicateAlert);
    }

    if (issues.missing.length) {
      var missingAlert = document.createElement("div");
      missingAlert.className = "alert alert-warning";
      var details = issues.missing.slice(0, 5).map(function (entry) {
        return entry.course + " thiếu " + entry.prereq;
      });
      missingAlert.textContent =
        "Cảnh báo tiên quyết: " +
        details.join(" · ") +
        (issues.missing.length > 5 ? "…" : "") +
        " (đối chiếu kế hoạch hiện tại và các kế hoạch đã duyệt).";
      el.planValidation.appendChild(missingAlert);
    }
  }

  /* ---------- Gợi ý học phần ---------- */
  function prereqState(course, currentCodes, completed) {
    var missing = (course.prereqs || []).filter(function (prereq) {
      return currentCodes.indexOf(prereq) === -1 && !completed[prereq];
    });
    return {
      missing: missing,
      label: !(course.prereqs || []).length
        ? "Không có tiên quyết"
        : missing.length
          ? "Thiếu: " + missing.join(" · ")
          : "Đủ tiên quyết",
      ok: missing.length === 0,
    };
  }

  function suggestionPool() {
    var current = currentCourses();
    var currentIds = current.map(function (course) {
      return String(course.id);
    });
    var currentCodes = current.map(function (course) {
      return course.code;
    });
    var completed = Object.create(null);
    completedCodes().forEach(function (code) {
      completed[code] = true;
    });

    return state.catalog
      .filter(function (course) {
        return (
          course.status === "Đang mở" &&
          currentIds.indexOf(String(course.id)) === -1
        );
      })
      .map(function (course) {
        var prerequisite = prereqState(course, currentCodes, completed);
        return {
          course: course,
          prereq: prerequisite,
          programMatch:
            state.user && course.program && String(state.user.program).indexOf(course.program) !== -1
              ? 1
              : 0,
        };
      })
      .sort(function (a, b) {
        return (
          b.programMatch - a.programMatch ||
          a.prereq.missing.length - b.prereq.missing.length ||
          Number(b.course.credits) - Number(a.course.credits) ||
          String(a.course.code).localeCompare(String(b.course.code))
        );
      });
  }

  function renderSuggestions() {
    el.suggestList.innerHTML = "";
    if (!state.plan) return;

    var pool = suggestionPool().slice(0, 3);
    if (!pool.length) {
      el.suggestList.innerHTML =
        '<div class="empty-state suggest-empty"><strong>Không còn gợi ý phù hợp</strong>' +
        '<p class="text-sm text-muted">Tất cả học phần đang mở đã có trong kế hoạch hoặc không còn lựa chọn.</p></div>';
      return;
    }

    pool.forEach(function (entry) {
      var course = entry.course;
      var item = document.createElement("div");
      item.className = "suggest-item";

      item.innerHTML =
        '<span class="suggest-code"></span>' +
        '<span class="suggest-name"></span>' +
        '<span class="suggest-prereq ' +
        (entry.prereq.ok ? "is-ok" : "is-warn") +
        '"></span>' +
        '<div class="suggest-foot">' +
        '<span class="suggest-credits"></span>' +
        '<button type="button" class="suggest-add" data-course-id="' +
        escapeHtml(course.id) +
        '"' +
        (canEditPlan() ? "" : " disabled") +
        ">" +
        (canEditPlan() ? "Thêm" : "Đã khóa") +
        "</button>" +
        "</div>";

      item.querySelector(".suggest-code").textContent = course.code;
      item.querySelector(".suggest-name").textContent = course.name;
      item.querySelector(".suggest-prereq").textContent = entry.prereq.label;
      item.querySelector(".suggest-credits").textContent = course.credits + " TC";

      el.suggestList.appendChild(item);
    });
  }

  function renderEmptyAddState() {
    if (!el.emptyAddBtn) return;
    el.emptyAddBtn.disabled = !canEditPlan();
  }

  /* ---------- Thêm / xoá học phần ---------- */
  function addCourse(courseId, options) {
    if (!state.plan) return;
    if (!canEditPlan()) {
      showToast("Kế hoạch đang khóa — không thể thêm học phần.");
      return;
    }

    var course = state.catalogById[courseId];
    if (!course) return;

    var exists = itemsForPlan(state.plan.id).some(function (item) {
      return String(item.courseId) === String(courseId);
    });
    if (exists) {
      showToast(course.code + " đã có trong kế hoạch.");
      return;
    }

    state.items.push({
      id: "PI-" + String(nextItemNumber(state.items)).padStart(3, "0"),
      planId: state.plan.id,
      courseId: course.id,
      courseName: course.name,
      credits: course.credits,
      term: state.plan.semester,
      note: "",
    });

    touchEditablePlan();
    state.aiError = null;
    persistPlanState();
    renderAll();
    if (!el.courseModal.classList.contains("hidden")) renderCoursePicker();

    showToast("Đã thêm " + course.code + " vào kế hoạch.");
    if (options && options.closeModal) closeCourseModal();
  }

  function deleteItem(itemId) {
    if (!canEditPlan()) {
      showToast("Kế hoạch đang khóa — không thể xoá học phần.");
      return;
    }

    var item = state.items.find(function (candidate) {
      return candidate.id === itemId && candidate.planId === state.plan.id;
    });
    if (!item) return;

    var course = state.catalogById[item.courseId];
    state.items = state.items.filter(function (candidate) {
      return candidate.id !== itemId;
    });

    touchEditablePlan();
    state.aiError = null;
    persistPlanState();
    renderAll();
    if (!el.courseModal.classList.contains("hidden")) renderCoursePicker();

    showToast("Đã xoá " + (course ? course.code : item.courseName) + " khỏi kế hoạch.");
  }

  /* ---------- Modal sửa học phần ---------- */
  function openEditModal(itemId) {
    if (!canEditPlan()) {
      showToast("Kế hoạch đang khóa — không thể sửa học phần.");
      return;
    }

    var item = state.items.find(function (candidate) {
      return candidate.id === itemId && candidate.planId === state.plan.id;
    });
    if (!item) return;

    var course = state.catalogById[item.courseId] || {};
    state.editingId = itemId;
    document.getElementById("edit-name").value = item.courseName || course.name || "";
    document.getElementById("edit-code").value = course.code || item.courseCode || "";
    document.getElementById("edit-credits").value = String(item.credits || course.credits || 3);
    document.getElementById("edit-note").value = item.note || "";
    clearEditErrors();
    el.editModal.classList.remove("hidden");
    document.getElementById("edit-name").focus();
  }

  function closeEditModal() {
    el.editModal.classList.add("hidden");
    state.editingId = null;
  }

  function clearEditErrors() {
    el.editForm.querySelectorAll(".form-group").forEach(function (group) {
      group.classList.remove("is-invalid");
      var error = group.querySelector(".form-error");
      if (error) error.textContent = "";
    });
  }

  function setFieldError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var group = input.closest(".form-group");
    group.classList.add("is-invalid");
    group.querySelector(".form-error").textContent = message;
  }

  function submitEdit(event) {
    event.preventDefault();

    var item = state.items.find(function (candidate) {
      return candidate.id === state.editingId && candidate.planId === state.plan.id;
    });
    if (!item) {
      closeEditModal();
      return;
    }

    var name = document.getElementById("edit-name").value.trim();
    var credits = parseInt(document.getElementById("edit-credits").value, 10);

    clearEditErrors();
    var ok = true;
    if (!name) {
      setFieldError("edit-name", "Vui lòng nhập tên học phần.");
      ok = false;
    }
    if (!Number.isFinite(credits) || credits < 1 || credits > 6) {
      setFieldError("edit-credits", "Tín chỉ phải từ 1 đến 6.");
      ok = false;
    }
    if (!ok) return;

    item.courseName = name;
    item.credits = credits;
    item.note = document.getElementById("edit-note").value.trim();

    touchEditablePlan();
    state.aiError = null;
    persistPlanState();
    closeEditModal();
    renderAll();
    var catalog = state.catalogById[item.courseId] || {};
    showToast("Đã cập nhật " + (catalog.code || item.courseName) + ".");
  }

  /* ---------- Modal thêm học phần ---------- */
  function openCourseModal() {
    if (!state.plan) {
      showToast("Chưa có kế hoạch để thêm học phần.");
      return;
    }
    if (!canEditPlan()) {
      showToast("Kế hoạch đang khóa — không thể thêm học phần.");
      return;
    }

    if (!state.catalog.length) {
      showToast("Chưa tải được danh mục học phần.");
      return;
    }

    el.courseSearch.value = "";
    renderCoursePicker();
    el.courseModal.classList.remove("hidden");
    el.courseSearch.focus();
  }

  function closeCourseModal() {
    el.courseModal.classList.add("hidden");
  }

  function renderCoursePicker() {
    var query = normalizeText(el.courseSearch.value.trim());
    var current = currentCourses();
    var currentIds = current.map(function (course) {
      return String(course.id);
    });
    var currentCodes = current.map(function (course) {
      return course.code;
    });
    var completed = Object.create(null);
    completedCodes().forEach(function (code) {
      completed[code] = true;
    });

    var available = state.catalog
      .filter(function (course) {
        return course.status === "Đang mở" && currentIds.indexOf(String(course.id)) === -1;
      })
      .map(function (course) {
        return {
          course: course,
          prereq: prereqState(course, currentCodes, completed),
          programMatch:
            state.user && course.program && String(state.user.program).indexOf(course.program) !== -1
              ? 1
              : 0,
        };
      })
      .filter(function (entry) {
        if (!query) return true;
        return (
          normalizeText(entry.course.code).indexOf(query) !== -1 ||
          normalizeText(entry.course.name).indexOf(query) !== -1
        );
      })
      .sort(function (a, b) {
        return (
          b.programMatch - a.programMatch ||
          a.prereq.missing.length - b.prereq.missing.length ||
          String(a.course.code).localeCompare(String(b.course.code))
        );
      });

    el.courseModalMeta.textContent =
      available.length +
      " học phần phù hợp · " +
      state.catalog.length +
      " học phần trong danh mục";

    el.coursePickList.innerHTML = "";

    if (!available.length) {
      el.coursePickList.innerHTML =
        '<div class="empty-state course-pick-empty"><strong>Không tìm thấy học phần phù hợp</strong>' +
        '<p class="text-sm text-muted">Thử mã hoặc tên khác, hoặc học phần đã có trong kế hoạch.</p></div>';
      return;
    }

    available.slice(0, 40).forEach(function (entry) {
      var course = entry.course;
      var row = document.createElement("div");
      row.className = "course-pick";
      row.innerHTML =
        '<div class="course-pick-main">' +
        '<strong class="course-pick-title"></strong>' +
        '<span class="course-pick-meta"></span>' +
        "</div>" +
        '<button type="button" class="btn btn-secondary btn-sm" data-add-course="' +
        escapeHtml(course.id) +
        '">Thêm</button>';

      row.querySelector(".course-pick-title").textContent = course.code + " · " + course.name;
      row.querySelector(".course-pick-meta").textContent =
        course.credits + " tín chỉ · " + entry.prereq.label;
      row.querySelector(".course-pick-meta").classList.add(entry.prereq.ok ? "is-ok" : "is-warn");
      el.coursePickList.appendChild(row);
    });

    if (available.length > 40) {
      var more = document.createElement("p");
      more.className = "text-sm text-muted course-pick-more";
      more.textContent = "Đang hiển thị 40/" + available.length + " học phần. Gõ thêm để lọc.";
      el.coursePickList.appendChild(more);
    }
  }

  /* ---------- AI-2 ---------- */
  function latestSuggestionForPlan() {
    if (!state.plan) return null;
    return (
      state.suggestions
        .filter(function (suggestion) {
          return (
            suggestion.studentId === state.user.studentId &&
            suggestion.type === "workload" &&
            suggestion.planId === state.plan.id &&
            suggestion.input &&
            suggestion.output
          );
        })
        .sort(function (a, b) {
          return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
        })[0] || null
    );
  }

  function aiInput(result) {
    var courses = currentCourses();
    return {
      planId: state.plan.id,
      semester: state.plan.semester,
      threshold: result.threshold,
      courseIds: courses.map(function (course) {
        return course.id;
      }),
      courseCodes: courses.map(function (course) {
        return course.code;
      }),
      completedCodes: completedCodes(),
      total: result.total,
      signature: result.signature,
    };
  }

  function persistSuggestion(suggestion) {
    var list = state.suggestions.slice();
    var index = list.findIndex(function (item) {
      return item.id === suggestion.id;
    });
    if (index >= 0) list[index] = suggestion;
    else list.push(suggestion);
    window.StudyPathAPI.saveAiSuggestions(list);
    state.suggestions = list;
  }

  function setAiStatus(label, tagClass) {
    el.ai2Status.textContent = label;
    el.ai2Status.className = "tag " + tagClass;
  }

  function metricsHtml(currentTotal, count, extraLabel, extraValue, extraClass) {
    var over = currentTotal > THRESHOLD;
    return (
      '<div class="ai2-metrics">' +
      '<div class="ai2-metric"><span>Tín chỉ hiện tại</span><strong class="' +
      (over ? "ai2-risk-high" : "") +
      '">' +
      currentTotal +
      "/" +
      THRESHOLD +
      "</strong></div>" +
      '<div class="ai2-metric"><span>Học phần</span><strong>' +
      count +
      "</strong></div>" +
      '<div class="ai2-metric"><span>' +
      escapeHtml(extraLabel) +
      '</span><strong class="ai2-metric-extra ' +
      escapeHtml(extraClass || "") +
      '">' +
      escapeHtml(extraValue) +
      "</strong></div>" +
      "</div>"
    );
  }

  function renderAi2Idle() {
    var courses = currentCourses();
    var total = totalCredits(courses);
    setAiStatus("Chưa kiểm tra", "tag-gray");
    el.ai2CheckBtn.disabled = !state.plan || state.aiLoading;
    el.ai2Body.innerHTML =
      metricsHtml(total, courses.length, "Ngưỡng cảnh báo", THRESHOLD + " TC", "") +
      '<p class="ai2-note">' +
      (courses.length
        ? "AI-2 chưa phân tích kế hoạch này. Kết quả sẽ giải thích yếu tố rủi ro và được lưu để kiểm tra lại sau khi tải trang."
        : "Kế hoạch chưa có học phần nào — AI-2 sẽ báo không đủ dữ liệu nếu bạn kiểm tra ngay.") +
      "</p>";
  }

  function renderAi2Stale(latest) {
    var courses = currentCourses();
    var total = totalCredits(courses);
    var output = latest.output || {};
    var risk = RISK[output.riskLevel] || RISK.low;

    setAiStatus("Cần kiểm tra lại", "tag-amber");
    el.ai2CheckBtn.disabled = !state.plan || state.aiLoading;
    el.ai2Body.innerHTML =
      metricsHtml(
        total,
        courses.length,
        "Lần kiểm tra cuối",
        formatDate(latest.updatedAt || latest.createdAt) || "—",
        "ai2-metric-date"
      ) +
      '<div class="ai2-status-note ai2-status-note--warn">' +
      "Kế hoạch đã thay đổi sau lần kiểm tra AI-2 gần nhất (" +
      escapeHtml(risk.label.toLowerCase()) +
      ", " +
      (output.total != null ? output.total : "?") +
      " tín chỉ). Kết quả cũ không còn áp dụng." +
      "</div>" +
      '<div class="ai2-actions">' +
      '<button type="button" class="btn btn-ai btn-sm" data-ai2-action="check">Kiểm tra lại</button>' +
      "</div>";
  }

  function renderAi2Result(suggestion) {
    var output = suggestion.output;
    var status = AI_STATUS[suggestion.status] || AI_STATUS.generated;
    var risk = RISK[output.riskLevel] || RISK.low;
    var courses = currentCourses();
    var currentTotal = totalCredits(courses);

    setAiStatus(status.label, status.tag.replace("tag ", ""));
    el.ai2CheckBtn.disabled = !state.plan || state.aiLoading;

    var summary =
      output.riskLevel === "high"
        ? "Kế hoạch vượt ngưỡng cảnh báo — cần giảm tải hoặc chấp nhận rủi ro."
        : output.riskLevel === "medium"
          ? "Kế hoạch cần chú ý nhưng chưa vượt ngưỡng 18 tín chỉ."
          : "Kế hoạch nằm trong ngưỡng an toàn.";

    var reasonsHtml = (output.reasons || [])
      .map(function (reason) {
        return "<li>" + escapeHtml(reason) + "</li>";
      })
      .join("");

    var recommendation = output.recommendation;
    var recommendationHtml = recommendation
      ? '<div class="ai2-recommend"><strong>Gợi ý giảm tải</strong><span>' +
        "Chuyển " +
        recommendation.courses
          .map(function (course) {
            return course.code + " (" + course.credits + " TC)";
          })
          .join(", ") +
        " khỏi kế hoạch này → còn " +
        recommendation.projectedTotal +
        " tín chỉ.</span></div>"
      : "";

    var note = "";
    if (suggestion.status === "accepted") {
      note = output.overloaded
        ? '<div class="ai2-status-note ai2-status-note--warn">Bạn đã chấp nhận rủi ro quá tải — cố vấn sẽ thấy cảnh báo này khi duyệt kế hoạch.</div>'
        : output.riskLevel === "medium"
          ? '<div class="ai2-status-note ai2-status-note--ok">Bạn đã chấp nhận kế hoạch ở mức cần chú ý theo đánh giá của AI-2.</div>'
          : '<div class="ai2-status-note ai2-status-note--ok">Bạn đã chấp nhận kế hoạch an toàn theo đánh giá của AI-2.</div>';
    } else if (suggestion.status === "dismissed") {
      note =
        '<div class="ai2-status-note ai2-status-note--danger">Bạn đã từ chối kết quả AI-2 — kế hoạch không thay đổi.</div>';
    } else if (suggestion.status === "edited") {
      note =
        '<div class="ai2-status-note">Bạn đã chọn sửa kế hoạch. Sau khi đổi môn, hãy kiểm tra lại để cập nhật kết quả.</div>';
    }

    var actions = [];
    var done = suggestion.status === "accepted" || suggestion.status === "dismissed";

    if (!done) {
      if (recommendation && canEditPlan()) {
        actions.push(
          '<button type="button" class="btn btn-ai btn-sm" data-ai2-action="reduce">Giảm tải</button>'
        );
      }
      actions.push(
        '<button type="button" class="btn btn-secondary btn-sm" data-ai2-action="accept">' +
          (output.overloaded ? "Chấp nhận rủi ro" : "Chấp nhận kế hoạch") +
          "</button>"
      );
      if (canEditPlan()) {
        actions.push(
          '<button type="button" class="btn btn-secondary btn-sm" data-ai2-action="edit">Sửa kế hoạch</button>'
        );
      }
      actions.push(
        '<button type="button" class="btn btn-secondary btn-sm" data-ai2-action="check">Kiểm tra lại</button>'
      );
      actions.push(
        '<button type="button" class="link-btn" data-ai2-action="reject">Từ chối kết quả</button>'
      );
    } else {
      actions.push(
        '<button type="button" class="btn btn-secondary btn-sm" data-ai2-action="check">Kiểm tra lại</button>'
      );
    }

    el.ai2Body.innerHTML =
      metricsHtml(
        output.total != null ? output.total : currentTotal,
        output.count != null ? output.count : courses.length,
        "Mức rủi ro",
        risk.label,
        risk.className
      ) +
      '<p class="ai2-summary">' +
      escapeHtml(summary) +
      "</p>" +
      '<div class="ai2-why-row"><strong>Vì sao có kết quả này?</strong>' +
      '<button type="button" class="link-btn" data-ai2-action="why" aria-expanded="true">Ẩn giải thích</button></div>' +
      '<ul class="ai2-reasons" id="ai2-reasons">' +
      reasonsHtml +
      "</ul>" +
      recommendationHtml +
      note +
      '<div class="ai2-actions">' +
      actions.join("") +
      "</div>";
  }

  function renderAi2Error() {
    var courses = currentCourses();
    var total = totalCredits(courses);
    setAiStatus("Không đủ dữ liệu", "tag-red");
    el.ai2CheckBtn.disabled = !state.plan || state.aiLoading;

    var actions = [];
    if (canEditPlan()) {
      actions.push(
        '<button type="button" class="btn btn-ai btn-sm" data-ai2-action="add">Thêm học phần</button>'
      );
    }
    actions.push(
      '<button type="button" class="btn btn-secondary btn-sm" data-ai2-action="check">Thử lại</button>'
    );
    actions.push(
      '<button type="button" class="link-btn" data-ai2-action="dismiss-failure">Bỏ qua</button>'
    );

    el.ai2Body.innerHTML =
      metricsHtml(total, courses.length, "Ngưỡng cảnh báo", THRESHOLD + " TC", "") +
      '<div class="alert alert-warning ai2-failure">' +
      escapeHtml(state.aiError.message) +
      "</div>" +
      '<div class="ai2-actions">' +
      actions.join("") +
      "</div>";
  }

  function renderAi2Loading() {
    setAiStatus("Đang phân tích", "tag-purple");
    el.ai2CheckBtn.disabled = true;
    el.ai2Body.innerHTML =
      '<div class="ai2-loading">' +
      '<div class="skeleton ai2-skeleton-line"></div>' +
      '<div class="skeleton ai2-skeleton-line ai2-skeleton-line--short"></div>' +
      '<p class="text-sm text-muted">AI-2 đang đối chiếu tín chỉ, môn nặng và điều kiện tiên quyết…</p>' +
      "</div>";
  }

  function renderAi2() {
    if (!state.plan) {
      setAiStatus("Chưa kiểm tra", "tag-gray");
      el.ai2CheckBtn.disabled = true;
      el.ai2Body.innerHTML =
        '<div class="empty-state ai2-empty"><strong>Chưa có kế hoạch</strong>' +
        '<p class="text-sm text-muted">Tạo hoặc chọn một kế hoạch học kỳ để AI-2 kiểm tra quá tải.</p></div>';
      return;
    }

    el.ai2CheckBtn.textContent = state.aiLoading ? "Đang phân tích…" : "Kiểm tra quá tải";

    if (state.aiLoading) {
      renderAi2Loading();
      return;
    }
    if (state.aiError) {
      renderAi2Error();
      return;
    }

    var latest = latestSuggestionForPlan();
    if (latest && latest.input && latest.input.signature === currentSignature()) {
      renderAi2Result(latest);
      return;
    }
    if (latest) {
      renderAi2Stale(latest);
      return;
    }
    renderAi2Idle();
  }

  async function checkWorkload() {
    if (!state.plan || state.aiLoading) return;
    if (!window.WorkloadEngine) {
      state.aiError = { message: "Không nạp được AI-2. Vui lòng tải lại trang." };
      renderAi2();
      return;
    }

    state.aiError = null;
    state.aiLoading = true;
    renderAi2();

    await wait(AI_PROCESSING_MS);

    var result = window.WorkloadEngine.analyze({
      courses: currentCourses(),
      completedCodes: completedCodes(),
      plan: state.plan,
    });
    state.aiLoading = false;

    if (result.empty) {
      state.aiError = {
        message:
          "AI-2 chưa đủ dữ liệu vì kế hoạch chưa có học phần nào. Hãy thêm ít nhất một học phần rồi kiểm tra lại.",
      };
      renderAi2();
      showToast("AI-2 không đủ dữ liệu — kế hoạch đang trống.");
      return;
    }

    var now = new Date();
    var suggestion = {
      id: "SUG-W" + now.getTime(),
      studentId: state.user.studentId,
      planId: state.plan.id,
      type: "workload",
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      reasons: result.reasons,
      recommendedCourses: result.recommendation
        ? result.recommendation.courses.map(function (course) {
            return course.id;
          })
        : [],
      status: "generated",
      createdAt: now.toISOString(),
      input: aiInput(result),
      output: result,
    };

    try {
      persistSuggestion(suggestion);
      renderAi2();
      showToast(
        "AI-2: " +
          (RISK[result.riskLevel] || RISK.low).label +
          " — " +
          result.total +
          "/" +
          result.threshold +
          " tín chỉ, độ tin cậy " +
          Math.round(result.confidence * 100) +
          "%."
      );
    } catch (error) {
      state.aiError = { message: "AI-2 đã phân tích nhưng chưa lưu được kết quả. Hãy thử lại." };
      renderAi2();
    }
  }

  function acceptSuggestion() {
    var suggestion = latestSuggestionForPlan();
    if (!suggestion || suggestion.status === "accepted" || suggestion.status === "dismissed") return;

    suggestion.status = "accepted";
    suggestion.updatedAt = new Date().toISOString();
    persistSuggestion(suggestion);
    renderAi2();
    showToast(
      suggestion.output.overloaded
        ? "Đã ghi nhận chấp nhận rủi ro quá tải cho kế hoạch " + state.plan.id + "."
        : "Đã chấp nhận kế hoạch " + state.plan.id + " theo đánh giá của AI-2."
    );
  }

  function editFromSuggestion() {
    var suggestion = latestSuggestionForPlan();
    if (suggestion && suggestion.status !== "accepted" && suggestion.status !== "dismissed") {
      suggestion.status = "edited";
      suggestion.updatedAt = new Date().toISOString();
      persistSuggestion(suggestion);
      renderAi2();
    }
    var tableCard = document.querySelector(".table-card");
    if (tableCard) tableCard.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Chỉnh sửa học phần trong bảng hoặc thêm môn mới rồi kiểm tra lại.");
  }

  function rejectSuggestion() {
    var suggestion = latestSuggestionForPlan();
    if (!suggestion || suggestion.status === "accepted" || suggestion.status === "dismissed") return;

    suggestion.status = "dismissed";
    suggestion.updatedAt = new Date().toISOString();
    persistSuggestion(suggestion);
    renderAi2();
    showToast("Đã từ chối kết quả AI-2 — kế hoạch giữ nguyên.");
  }

  function applyReduction() {
    var suggestion = latestSuggestionForPlan();
    if (!suggestion || !suggestion.output || !suggestion.output.recommendation) return;
    if (!canEditPlan()) {
      showToast("Kế hoạch đang khóa — không thể giảm tải.");
      return;
    }

    var recommended = suggestion.output.recommendation.courses;
    var ids = recommended.map(function (course) {
      return String(course.id);
    });
    var removedCourses = currentCourses().filter(function (course) {
      return ids.indexOf(String(course.id)) !== -1;
    });

    if (!removedCourses.length) {
      showToast("Không tìm thấy học phần cần giảm tải trong kế hoạch.");
      return;
    }

    state.items = state.items.filter(function (item) {
      return !(item.planId === state.plan.id && ids.indexOf(String(item.courseId)) !== -1);
    });
    touchEditablePlan();
    state.aiError = null;

    var result = window.WorkloadEngine.analyze({
      courses: currentCourses(),
      completedCodes: completedCodes(),
      plan: state.plan,
    });

    persistPlanState();

    suggestion.status = "accepted";
    suggestion.riskLevel = result.riskLevel;
    suggestion.confidence = result.confidence;
    suggestion.reasons = result.reasons;
    suggestion.recommendedCourses = [];
    suggestion.updatedAt = new Date().toISOString();
    suggestion.input = aiInput(result);
    suggestion.output = result;
    persistSuggestion(suggestion);

    renderAll();
    showToast(
      "Đã giảm tải: bỏ " +
        removedCourses
          .map(function (course) {
            return course.code;
          })
          .join(", ") +
        " — còn " +
        result.total +
        " tín chỉ."
    );
  }

  function handleAiAction(action, button) {
    if (action === "check") {
      checkWorkload();
      return;
    }
    if (action === "why") {
      var reasons = document.getElementById("ai2-reasons");
      if (!reasons) return;
      var willHide = !reasons.classList.contains("hidden");
      reasons.classList.toggle("hidden", willHide);
      button.textContent = willHide ? "Vì sao?" : "Ẩn giải thích";
      button.setAttribute("aria-expanded", willHide ? "false" : "true");
      return;
    }
    if (action === "accept") {
      acceptSuggestion();
      return;
    }
    if (action === "reduce") {
      applyReduction();
      return;
    }
    if (action === "edit") {
      editFromSuggestion();
      return;
    }
    if (action === "reject") {
      rejectSuggestion();
      return;
    }
    if (action === "add") {
      openCourseModal();
      return;
    }
    if (action === "dismiss-failure") {
      state.aiError = null;
      renderAi2();
    }
  }

  function acceptedRiskForCurrentPlan() {
    var latest = latestSuggestionForPlan();
    return Boolean(
      latest &&
        latest.status === "accepted" &&
        latest.input &&
        latest.input.signature === currentSignature() &&
        latest.output &&
        latest.output.overloaded
    );
  }

  /* ---------- Lưu nháp / gửi cố vấn ---------- */
  function saveDraft() {
    if (!state.plan) return;
    if (!canEditPlan()) {
      showToast("Kế hoạch đang khóa — không thể lưu chỉnh sửa.");
      return;
    }
    touchEditablePlan();
    persistPlanState();
    renderAll();
    showToast("Đã lưu bản nháp kế hoạch.");
  }

  async function submitPlan() {
    if (!state.plan || state.submitting) return;
    if (!canEditPlan()) {
      showToast("Kế hoạch đang khóa — không thể gửi lại.");
      return;
    }

    var courses = currentCourses();
    if (!courses.length) {
      showToast("Kế hoạch trống — hãy thêm học phần trước khi gửi cố vấn.");
      el.planEmpty.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    var issues = collectIssues();
    if (issues.duplicates.length) {
      showToast("Không thể gửi: học phần bị trùng trong kế hoạch.");
      el.planValidation.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (totalCredits(courses) > THRESHOLD && !acceptedRiskForCurrentPlan()) {
      showToast(
        "Kế hoạch vượt 18 tín chỉ — hãy kiểm tra quá tải và giảm tải hoặc chấp nhận rủi ro trước khi gửi."
      );
      el.ai2Card.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    state.submitting = true;
    var originalHtml = el.submitBtn.innerHTML;
    el.submitBtn.disabled = true;
    el.submitBtn.textContent = "Đang gửi…";

    try {
      await wait(SEND_PROCESSING_MS);
      touchEditablePlan();
      state.plan.status = "pending";
      persistPlanState();
      renderAll();
      showToast("Đã gửi kế hoạch tới cố vấn — trạng thái Chờ duyệt.");
    } catch (error) {
      showToast("Gửi thất bại — chưa gửi được cho cố vấn. Bản nháp vẫn được giữ.");
    } finally {
      state.submitting = false;
      el.submitBtn.innerHTML = originalHtml;
      renderPlanMeta();
    }
  }

  /* ---------- Render tổng ---------- */
  function renderAll() {
    renderPlanPicker();
    renderPlanMeta();
    renderTable();
    renderValidation();
    renderSuggestions();
    renderEmptyAddState();
    renderAi2();
  }

  /* ---------- Sự kiện ---------- */
  function cacheElements() {
    el.planTitle = document.getElementById("plan-title");
    el.planSubtitle = document.getElementById("plan-subtitle");
    el.planSelect = document.getElementById("plan-select");
    el.planStatusTag = document.getElementById("plan-status-tag");
    el.stepperSteps = Array.prototype.slice.call(document.querySelectorAll(".stepper .step"));
    el.saveBtn = document.getElementById("btn-save-draft");
    el.submitBtn = document.getElementById("btn-submit-plan");
    el.ai2Card = document.getElementById("ai2-card");
    el.ai2Status = document.getElementById("ai2-status");
    el.ai2Subtitle = document.getElementById("ai2-subtitle");
    el.ai2Body = document.getElementById("ai2-body");
    el.ai2CheckBtn = document.getElementById("btn-ai2-check");
    el.planLock = document.getElementById("plan-lock-notice");
    el.planValidation = document.getElementById("plan-validation");
    el.tableWrapper = document.getElementById("plan-table-wrapper");
    el.planBody = document.getElementById("plan-body");
    el.planEmpty = document.getElementById("plan-empty");
    el.emptyAddBtn = document.getElementById("btn-empty-add");
    el.planCount = document.getElementById("plan-count");
    el.planTotal = document.getElementById("plan-total");
    el.suggestList = document.getElementById("suggest-list");
    el.findCourseBtn = document.getElementById("btn-find-course");
    el.replyAdvisorBtn = document.getElementById("btn-reply-advisor");
    el.editModal = document.getElementById("edit-modal");
    el.editForm = document.getElementById("edit-form");
    el.courseModal = document.getElementById("course-modal");
    el.courseSearch = document.getElementById("course-search");
    el.coursePickList = document.getElementById("course-pick-list");
    el.courseModalMeta = document.getElementById("course-modal-meta");
    el.toast = document.getElementById("toast");
  }

  function bindEvents() {
    el.planSelect.addEventListener("change", function () {
      selectPlan(el.planSelect.value);
    });

    el.saveBtn.addEventListener("click", saveDraft);
    el.submitBtn.addEventListener("click", submitPlan);
    el.ai2CheckBtn.addEventListener("click", checkWorkload);

    el.ai2Body.addEventListener("click", function (event) {
      var button = event.target.closest("[data-ai2-action]");
      if (!button) return;
      handleAiAction(button.dataset.ai2Action, button);
    });

    el.planBody.addEventListener("click", function (event) {
      var button = event.target.closest(".row-action");
      if (!button || button.disabled) return;
      var itemId = button.dataset.itemId;
      if (button.dataset.action === "edit") openEditModal(itemId);
      if (button.dataset.action === "delete") deleteItem(itemId);
    });

    el.suggestList.addEventListener("click", function (event) {
      var button = event.target.closest(".suggest-add");
      if (!button || button.disabled) return;
      addCourse(button.dataset.courseId);
    });

    el.findCourseBtn.addEventListener("click", openCourseModal);
    el.emptyAddBtn.addEventListener("click", openCourseModal);
    el.replyAdvisorBtn.addEventListener("click", function () {
      showToast("Mở khung phản hồi cố vấn (mô phỏng)");
    });

    document.getElementById("btn-close-modal").addEventListener("click", closeEditModal);
    document.getElementById("btn-cancel-edit").addEventListener("click", closeEditModal);
    el.editModal.addEventListener("click", function (event) {
      if (event.target === el.editModal) closeEditModal();
    });
    el.editForm.addEventListener("submit", submitEdit);

    document.getElementById("btn-close-course-modal").addEventListener("click", closeCourseModal);
    el.courseModal.addEventListener("click", function (event) {
      if (event.target === el.courseModal) closeCourseModal();
    });
    el.courseSearch.addEventListener("input", renderCoursePicker);
    el.coursePickList.addEventListener("click", function (event) {
      var button = event.target.closest("[data-add-course]");
      if (!button) return;
      addCourse(button.dataset.addCourse);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (!el.courseModal.classList.contains("hidden")) {
        closeCourseModal();
        return;
      }
      if (!el.editModal.classList.contains("hidden")) closeEditModal();
    });
  }

  function showLoadError(message) {
    el.planSubtitle.textContent = "Không tải được kế hoạch.";
    el.planCount.textContent = "Lỗi dữ liệu";
    el.planTotal.textContent = "—";
    el.planBody.innerHTML =
      '<tr><td colspan="5" class="plan-loading">' + escapeHtml(message) + "</td></tr>";
    el.tableWrapper.classList.remove("hidden");
    el.planLock.classList.add("hidden");
    el.ai2CheckBtn.disabled = true;
    el.saveBtn.disabled = true;
    el.submitBtn.disabled = true;
    el.planValidation.innerHTML =
      '<div class="alert alert-danger plan-load-error"><span>' +
      escapeHtml(message) +
      '</span><button type="button" class="btn btn-secondary btn-sm" id="btn-retry-load">Thử lại</button></div>';
    var retry = document.getElementById("btn-retry-load");
    if (retry) {
      retry.addEventListener("click", function () {
        window.location.reload();
      });
    }
  }

  async function init() {
    cacheElements();
    bindEvents();

    state.user = window.StudyPathAPI.getCurrentUser();
    if (!state.user) {
      showLoadError("Chưa có người dùng đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      var payload = await window.StudyPathAPI.loadData("courses");
      state.catalog = (payload && payload.courses) || [];
      state.catalog.forEach(function (course) {
        state.catalogById[course.id] = course;
      });

      state.plans = await window.StudyPathAPI.getPlans();
      state.items = await window.StudyPathAPI.getPlanItems();
      state.suggestions = await window.StudyPathAPI.getAiSuggestions();

      if (!semesterPlansForUser().length) {
        var newPlan = {
          id: nextPlanId(state.plans),
          studentId: state.user.studentId,
          studentName: state.user.name,
          title: "Kế hoạch học kỳ mới",
          semester: "HK1 2026-2027",
          status: "draft",
          credits: 0,
          createdAt: new Date().toISOString(),
        };
        state.plans.push(newPlan);
        window.StudyPathAPI.savePlans(state.plans);
      }

      state.plan = pickInitialPlan();
      if (!state.plan) {
        showLoadError("Chưa có kế hoạch học kỳ cho tài khoản này.");
        return;
      }

      renderAll();
    } catch (error) {
      console.error(error);
      showLoadError("Không tải được dữ liệu kế hoạch. Kiểm tra kết nối rồi thử lại.");
    }
  }

  init();
})();
