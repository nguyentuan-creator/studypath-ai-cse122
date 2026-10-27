/* AI-1 Roadmap page — input → rule engine → output/explain → control → save (aiSuggestions) */
(function () {
  "use strict";

  var PROCESSING_MS = 850;
  var SESSION_CREATED_KEY = "studypath.roadmap.created";

  var TIME_NOTES = {
    low: "Mức chọn hiện tại cho phép học 12–14 tín chỉ / học kỳ (có thể kéo dài quá 8 kỳ).",
    mid: "Mức chọn hiện tại cho phép học 14–16 tín chỉ / học kỳ (có thể kéo dài quá 8 kỳ).",
    high: "Mức chọn hiện tại cho phép học 16–20 tín chỉ / học kỳ.",
  };

  var TIME_LABELS = {
    low: "< 10 giờ / tuần",
    mid: "10–20 giờ / tuần",
    high: "> 20 giờ / tuần",
  };

  var STATUS = {
    generated: { label: "Mới tạo", className: "tag tag-green" },
    accepted: { label: "Đã chấp nhận", className: "tag tag-green" },
    edited: { label: "Đang chỉnh sửa", className: "tag tag-blue" },
    dismissed: { label: "Đã từ chối", className: "tag tag-red" },
  };

  var ICONS = {
    check:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  };

  var el = {};
  var state = {
    user: null,
    catalog: [],
    suggestion: null,
    lastRendered: null,
    loading: false,
    accepting: false,
    seed: 0,
    failureAction: null,
    toastTimer: null,
  };

  function applySavedTheme() {
    try {
      var saved = JSON.parse(localStorage.getItem("studypath-settings"));
      if (saved && saved.theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch (error) {
      /* bỏ qua nếu dữ liệu lỗi */
    }
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () {
      el.toast.classList.remove("show");
    }, 2600);
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

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    return day + "/" + month + "/" + date.getFullYear();
  }

  function selectedBudget() {
    var checked = document.querySelector(".time-seg-input:checked");
    return checked ? checked.value : "high";
  }

  function readInput() {
    var interests = Array.prototype.map
      .call(document.querySelectorAll(".pref-chip.active"), function (chip) {
        return chip.textContent.trim();
      })
      .filter(Boolean);

    var priorities = Array.prototype.map
      .call(document.querySelectorAll(".prior-check:checked"), function (checkbox) {
        return checkbox.parentElement.textContent.trim();
      })
      .filter(Boolean);

    return {
      career: el.careerSelect.value,
      interests: interests,
      budget: selectedBudget(),
      priorities: priorities,
      seed: state.seed,
      program: (state.user && state.user.program) || "Công nghệ thông tin",
    };
  }

  function syncTimeBudget(value) {
    el.timeNote.textContent = TIME_NOTES[value] || "";
    el.timeReason.textContent = TIME_LABELS[value] || "";
  }

  function applyInputToForm(input) {
    if (!input) return;

    if (input.career) el.careerSelect.value = input.career;

    var budget = document.getElementById("time-" + input.budget);
    if (budget) {
      budget.checked = true;
      syncTimeBudget(input.budget);
    }

    var interests = input.interests || [];
    el.prefChips.querySelectorAll(".pref-chip").forEach(function (chip) {
      var active = interests.indexOf(chip.textContent.trim()) !== -1;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var priorities = input.priorities || [];
    document.querySelectorAll(".prior-check").forEach(function (checkbox) {
      checkbox.checked = priorities.indexOf(checkbox.parentElement.textContent.trim()) !== -1;
    });
  }

  function setActions(options) {
    el.acceptBtn.disabled = !options.accept;
    el.editBtn.disabled = !options.edit;
    el.rejectBtn.disabled = !options.reject;
    el.regenBtn.disabled = !options.regen;
  }

  function semCardHTML(semester) {
    var codes = semester.courses
      .map(function (course) {
        return course.code;
      })
      .join(" · ");

    return (
      '<article class="sem-card' +
      (semester.risk ? " sem-card--risk" : "") +
      '">' +
      '<div class="sem-top">' +
      "<h3>" +
      escapeHtml(semester.id) +
      "</h3>" +
      (semester.risk
        ? '<span class="sem-ai2">AI-2</span>'
        : '<span class="sem-status" aria-label="Đã kiểm tra tiên quyết">' +
          ICONS.check +
          "</span>") +
      "</div>" +
      '<p class="sem-credits">' +
      Number(semester.credits) +
      " tín chỉ</p>" +
      '<p class="sem-courses">' +
      escapeHtml(codes || "Chưa xếp học phần") +
      "</p>" +
      (semester.risk
        ? '<p class="sem-risk-note">' +
          ICONS.warn +
          " Rủi ro cao · tải học tập lớn</p>"
        : "") +
      "</article>"
    );
  }

  function resetResultVisibility() {
    el.resultCard.classList.remove("rejected");
    el.semGrid.classList.remove("hidden");
    el.semGridMore.classList.add("hidden");
    el.aiFailure.classList.add("hidden");
    el.rejectNote.classList.add("hidden");
    el.acceptNote.classList.add("hidden");
    el.whyCard.classList.remove("hidden");
    el.btnMoreSems.classList.remove("hidden");
  }

  function setResultsVisible(visible) {
    el.results.classList.toggle("hidden", !visible);
    el.layout.classList.toggle("is-intro", !visible);
  }

  function moreSemsLabel(expanded) {
    var output = state.suggestion && state.suggestion.output;
    var total = output && output.semesters ? output.semesters.length : window.AIEngine.TERMS;
    return (
      (expanded ? "Thu gọn HK5–HK" : "Xem tiếp HK5–HK") +
      total +
      (expanded ? ' <span aria-hidden="true">↑</span>' : ' <span aria-hidden="true">→</span>')
    );
  }

  function createdThisSession() {
    try {
      return sessionStorage.getItem(SESSION_CREATED_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function markCreatedThisSession() {
    try {
      sessionStorage.setItem(SESSION_CREATED_KEY, "1");
    } catch (error) {
      /* bỏ qua nếu trình duyệt chặn sessionStorage */
    }
  }

  function renderEmpty() {
    resetResultVisibility();
    setResultsVisible(false);
    state.lastRendered = null;
    state.suggestion = null;
    el.whyCard.classList.add("hidden");
    el.btnMoreSems.classList.add("hidden");
    el.updatedDate.textContent = "";
    el.resultTag.textContent = "Chưa tạo";
    el.resultTag.className = "tag tag-blue";
    el.fitValue.textContent = "—";
    el.resultMeta.textContent = "Chưa có lộ trình. Chọn hồ sơ mục tiêu rồi bấm Tạo lộ trình.";
    el.semGrid.innerHTML =
      '<div class="empty-state"><strong>Chưa có lộ trình AI</strong>' +
      '<p class="text-sm text-muted">Chọn nghề nghiệp, sở thích và quỹ thời gian ở cột bên trái để bắt đầu.</p></div>';
    el.semGridMore.innerHTML = "";
    el.aiReasons.innerHTML = "";
    el.interestReason.textContent = "Chưa chọn";
    el.prereqReason.textContent = "Chưa kiểm tra";
    setActions({ accept: false, edit: false, reject: false, regen: false });
  }

  function renderFailure(message, mode, output) {
    resetResultVisibility();
    setResultsVisible(true);
    el.whyCard.classList.add("hidden");
    el.semGrid.classList.add("hidden");
    el.semGridMore.classList.add("hidden");
    el.btnMoreSems.classList.add("hidden");
    el.aiFailure.classList.remove("hidden");
    el.resultCard.classList.remove("rejected");

    var details = output && output.warnings && output.warnings.length ? " " + output.warnings.join(" ") : "";
    el.aiFailureMessage.textContent = message + details;
    el.resultTag.textContent = "Không đủ dữ liệu";
    el.resultTag.className = "tag tag-red";
    el.fitValue.textContent = "—";
    el.resultMeta.textContent = "AI chưa thể tạo lộ trình từ hồ sơ hiện tại.";

    setActions({
      accept: false,
      edit: false,
      reject: false,
      regen: !!state.lastRendered,
    });

    if (mode === "interests") {
      el.btnFailureFix.textContent = "Chọn sở thích";
      state.failureAction = function () {
        el.profileCard.scrollIntoView({ behavior: "smooth", block: "start" });
        var chip = el.prefChips.querySelector(".pref-chip");
        if (chip) chip.focus({ preventScroll: true });
      };
    } else if (mode === "load") {
      el.btnFailureFix.textContent = "Thử lại";
      state.failureAction = function () {
        window.location.reload();
      };
    } else {
      el.btnFailureFix.textContent = "Nâng quỹ thời gian";
      state.failureAction = function () {
        var high = document.getElementById("time-high");
        if (high) high.checked = true;
        syncTimeBudget("high");
        generate(false);
      };
    }
  }

  function renderSuggestion(suggestion) {
    var output = suggestion.output;
    if (!output) {
      output = window.AIEngine.buildRoadmap({
        catalog: state.catalog,
        input: suggestion.input || {},
      });
      suggestion.output = output;
    }

    state.suggestion = suggestion;
    state.lastRendered = suggestion;
    state.seed = Number(suggestion.input && suggestion.input.seed) || 0;

    resetResultVisibility();
    setResultsVisible(true);
    el.whyCard.classList.remove("hidden");

    var status = STATUS[suggestion.status] || STATUS.generated;
    el.resultTag.textContent = status.label;
    el.resultTag.className = status.className;

    var input = suggestion.input || {};
    applyInputToForm(input);
    el.fitValue.textContent = Math.round(output.confidence * 100) + "%";
    el.resultMeta.textContent =
      output.semesters.length + " học kỳ · " + output.total + " tín chỉ · Mục tiêu " + (input.career || "chưa chọn");
    el.updatedDate.textContent = "Cập nhật " + formatDate(suggestion.createdAt);

    var dismissed = suggestion.status === "dismissed";
    var accepted = suggestion.status === "accepted" && suggestion.planId;

    el.rejectNote.classList.toggle("hidden", !dismissed);
    el.acceptNote.classList.toggle("hidden", !accepted);
    if (accepted) el.acceptPlanId.textContent = suggestion.planId;
    el.resultCard.classList.toggle("rejected", dismissed);

    el.semGrid.innerHTML = output.semesters.slice(0, 4).map(semCardHTML).join("");
    el.semGridMore.innerHTML = output.semesters.slice(4).map(semCardHTML).join("");

    var hasMore = output.semesters.slice(4).some(function (semester) {
      return semester.courses.length > 0;
    });
    el.btnMoreSems.classList.toggle("hidden", !hasMore);
    el.semGridMore.classList.add("hidden");
    el.btnMoreSems.setAttribute("aria-expanded", "false");
    el.btnMoreSems.innerHTML = moreSemsLabel(false);

    el.interestReason.textContent = (input.interests || []).length
      ? input.interests.join(" · ")
      : "Chưa chọn";
    el.timeReason.textContent = TIME_LABELS[input.budget] || "";
    el.prereqReason.textContent =
      output.prereqCount != null ? output.prereqCount + " môn có tiên quyết" : "Đã kiểm tra";

    el.aiReasons.innerHTML = "";
    (output.reasons || []).forEach(function (reason) {
      var item = document.createElement("li");
      item.textContent = reason;
      el.aiReasons.appendChild(item);
    });

    setActions({
      accept: !dismissed && suggestion.status !== "accepted",
      edit: !dismissed,
      reject: !dismissed && suggestion.status !== "accepted",
      regen: true,
    });
  }

  function latestForUser(list) {
    if (!state.user) return null;
    return list
      .filter(function (suggestion) {
        return (
          suggestion.studentId === state.user.studentId &&
          suggestion.type === "roadmap" &&
          suggestion.input &&
          suggestion.output
        );
      })
      .sort(function (a, b) {
        return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      })[0];
  }

  async function persistSuggestion(suggestion) {
    var list = await window.StudyPathAPI.getAiSuggestions();
    var index = list.findIndex(function (item) {
      return item.id === suggestion.id;
    });
    if (index >= 0) list[index] = suggestion;
    else list.push(suggestion);
    window.StudyPathAPI.saveAiSuggestions(list);
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

  function termLabel(index) {
    var startYear = 2026 + Math.floor(index / 2);
    return "HK" + ((index % 2) + 1) + " " + startYear + "-" + (startYear + 1);
  }

  async function generate(isRegenerate) {
    if (state.loading || !state.user) return;
    if (!window.AIEngine) {
      showToast("Chưa nạp được AI engine.");
      return;
    }

    if (isRegenerate) state.seed += 1;
    else state.seed = 0;

    var input = readInput();
    if (!input.interests.length) {
      renderFailure("AI cần ít nhất một sở thích hoặc môn mạnh để cá nhân hoá lộ trình.", "interests", null);
      return;
    }

    state.loading = true;
    setResultsVisible(true);
    if (!state.lastRendered) {
      el.semGrid.innerHTML =
        '<div class="empty-state"><strong>AI đang xếp lộ trình…</strong>' +
        '<p class="text-sm text-muted">Đang cân bằng mục tiêu, tiên quyết và quỹ thời gian.</p></div>';
      el.resultMeta.textContent = "Đang phân tích hồ sơ mục tiêu…";
    }
    el.resultCard.classList.add("is-loading");
    el.resultTag.textContent = isRegenerate ? "Đang tạo lại" : "Đang phân tích";
    el.resultTag.className = "tag tag-purple";
    el.generateBtn.disabled = true;
    el.regenBtn.disabled = true;

    await wait(PROCESSING_MS);

    var result = window.AIEngine.buildRoadmap({ catalog: state.catalog, input: input });

    state.loading = false;
    el.resultCard.classList.remove("is-loading");
    el.generateBtn.disabled = false;
    el.regenBtn.disabled = false;

    if (!result.feasible) {
      var budget = window.AIEngine.BUDGETS[input.budget] || { cap: 0 };
      renderFailure(
        "Không thể xếp đủ " + result.total + " tín chỉ trong " +
          (result.terms || window.AIEngine.MAX_TERMS) + " học kỳ với quỹ " + budget.cap +
          " tín chỉ/kỳ.",
        "budget",
        result
      );
      showToast("AI không đủ quỹ thời gian để hoàn thành lộ trình.");
      return;
    }

    var now = new Date();
    var suggestion = {
      id: "SUG-R" + now.getTime(),
      studentId: state.user.studentId,
      planId: null,
      type: "roadmap",
      riskLevel: result.riskLevel,
      confidence: result.confidence,
      reasons: result.reasons,
      recommendedCourses: result.semesters[0]
        ? result.semesters[0].courses.map(function (course) {
            return course.id;
          })
        : [],
      status: "generated",
      createdAt: now.toISOString(),
      input: input,
      output: result,
    };

    await persistSuggestion(suggestion);
    markCreatedThisSession();
    renderSuggestion(suggestion);
    showToast(
      (isRegenerate ? "Đã tạo lại lộ trình" : "Đã tạo lộ trình và lưu vào dữ liệu nhóm") +
        " — độ phù hợp " + Math.round(result.confidence * 100) + "%."
    );
  }

  async function accept() {
    var suggestion = state.suggestion;
    if (!suggestion || state.accepting) return;
    if (suggestion.status === "accepted" || suggestion.status === "dismissed") return;

    state.accepting = true;
    el.acceptBtn.disabled = true;

    try {
      var plans = await window.StudyPathAPI.getPlans();
      var items = await window.StudyPathAPI.getPlanItems();
      var planId = suggestion.planId;

      if (!planId || !plans.some(function (plan) { return plan.id === planId; })) {
        planId = nextPlanId(plans);
        plans.push({
          id: planId,
          studentId: state.user.studentId,
          studentName: state.user.name,
          title: "Lộ trình AI " + suggestion.output.semesters.length + " học kỳ",
          semester: "HK1 2026-2027",
          status: "draft",
          credits: suggestion.output.total,
          createdAt: new Date().toISOString().slice(0, 10),
        });
        window.StudyPathAPI.savePlans(plans);

        var nextItem = nextItemNumber(items);
        suggestion.output.semesters.forEach(function (semester, index) {
          semester.courses.forEach(function (course) {
            items.push({
              id: "PI-" + String(nextItem).padStart(3, "0"),
              planId: planId,
              courseId: course.id,
              courseName: course.name,
              credits: course.credits,
              term: termLabel(index),
            });
            nextItem += 1;
          });
        });
        window.StudyPathAPI.savePlanItems(items);
        suggestion.planId = planId;
      }

      suggestion.status = "accepted";
      await persistSuggestion(suggestion);
      renderSuggestion(suggestion);
      showToast("Đã tạo kế hoạch nháp " + suggestion.planId + " từ lộ trình.");
    } finally {
      state.accepting = false;
    }
  }

  async function reject() {
    var suggestion = state.suggestion;
    if (!suggestion || suggestion.status === "dismissed") return;
    suggestion.status = "dismissed";
    await persistSuggestion(suggestion);
    renderSuggestion(suggestion);
    showToast("Đã từ chối đề xuất lộ trình.");
  }

  async function edit() {
    var suggestion = state.suggestion;
    if (!suggestion || suggestion.status === "dismissed") return;

    if (suggestion.status !== "edited") {
      suggestion.status = "edited";
      await persistSuggestion(suggestion);
      renderSuggestion(suggestion);
    }

    el.profileCard.scrollIntoView({ behavior: "smooth", block: "start" });
    el.profileCard.classList.remove("flash");
    void el.profileCard.offsetWidth;
    el.profileCard.classList.add("flash");

    setTimeout(function () {
      el.profileCard.classList.remove("flash");
    }, 1300);

    el.careerSelect.focus({ preventScroll: true });
    showToast("Chỉnh hồ sơ mục tiêu rồi bấm Tạo lộ trình để AI cập nhật.");
  }

  function watchStore() {
    if (!window.StudyPathAPI.onStoreChange) return;
    window.StudyPathAPI.onStoreChange("aiSuggestions", async function () {
      if (state.loading || !state.user || !createdThisSession()) return;
      var list = await window.StudyPathAPI.getAiSuggestions();
      var latest = latestForUser(list);
      if (!latest) return;
      if (
        !state.suggestion ||
        latest.id !== state.suggestion.id ||
        latest.status !== state.suggestion.status
      ) {
        renderSuggestion(latest);
      }
    });
  }

  function cacheElements() {
    el.layout = document.getElementById("roadmap-layout");
    el.results = document.getElementById("roadmap-results");
    el.resultCard = document.getElementById("result-card");
    el.resultTag = document.getElementById("result-tag");
    el.resultMeta = document.getElementById("result-meta");
    el.fitValue = document.getElementById("fit-value");
    el.rejectNote = document.getElementById("reject-note");
    el.acceptNote = document.getElementById("accept-note");
    el.acceptPlanId = document.getElementById("accept-plan-id");
    el.semGrid = document.getElementById("sem-grid");
    el.semGridMore = document.getElementById("sem-grid-more");
    el.btnMoreSems = document.getElementById("btn-more-sems");
    el.careerSelect = document.getElementById("career-select");
    el.prefChips = document.getElementById("pref-chips");
    el.timeNote = document.getElementById("time-note");
    el.timeReason = document.getElementById("time-reason");
    el.updatedDate = document.getElementById("updated-date");
    el.profileCard = document.getElementById("profile-card");
    el.whyCard = document.getElementById("why-card");
    el.aiReasons = document.getElementById("ai-reasons");
    el.interestReason = document.getElementById("interest-reason");
    el.prereqReason = document.getElementById("prereq-reason");
    el.aiFailure = document.getElementById("ai-failure");
    el.aiFailureMessage = document.getElementById("ai-failure-message");
    el.btnFailureFix = document.getElementById("btn-failure-fix");
    el.btnFailureDismiss = document.getElementById("btn-failure-dismiss");
    el.acceptBtn = document.getElementById("btn-accept");
    el.editBtn = document.getElementById("btn-edit");
    el.rejectBtn = document.getElementById("btn-reject");
    el.regenBtn = document.getElementById("btn-regen");
    el.generateBtn = document.getElementById("btn-generate");
    el.toast = document.getElementById("toast");
  }

  function bindEvents() {
    el.prefChips.addEventListener("click", function (event) {
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

    el.btnMoreSems.addEventListener("click", function () {
      var isHidden = el.semGridMore.classList.toggle("hidden");
      el.btnMoreSems.setAttribute("aria-expanded", isHidden ? "false" : "true");
      el.btnMoreSems.innerHTML = moreSemsLabel(!isHidden);
    });

    el.generateBtn.addEventListener("click", function () {
      generate(false);
    });
    el.regenBtn.addEventListener("click", function () {
      generate(true);
    });
    el.acceptBtn.addEventListener("click", accept);
    el.editBtn.addEventListener("click", edit);
    el.rejectBtn.addEventListener("click", reject);

    el.btnFailureFix.addEventListener("click", function () {
      if (typeof state.failureAction === "function") state.failureAction();
    });
    el.btnFailureDismiss.addEventListener("click", function () {
      if (state.lastRendered) renderSuggestion(state.lastRendered);
      else renderEmpty();
    });
  }

  async function init() {
    applySavedTheme();
    cacheElements();
    bindEvents();
    renderEmpty();

    state.user = window.StudyPathAPI.getCurrentUser();
    if (!state.user) return;

    try {
      var payload = await window.StudyPathAPI.loadData("courses");
      state.catalog = (payload && payload.courses) || [];
      var suggestions = await window.StudyPathAPI.getAiSuggestions();
      var latest = latestForUser(suggestions);
      if (latest && createdThisSession()) renderSuggestion(latest);
      else renderEmpty();
      watchStore();
    } catch (error) {
      renderFailure("Không tải được dữ liệu học phần. Kiểm tra kết nối rồi thử lại.", "load", null);
    }
  }

  init();
})();
