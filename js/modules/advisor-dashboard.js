(function () {
  "use strict";

  const REVIEW_PAGE = "advisor-student-plan-review.html";

  const nodes = {
    loading: document.getElementById("plans-loading"),
    error: document.getElementById("plans-error"),
    empty: document.getElementById("plans-empty"),
    content: document.getElementById("plans-content"),
    body: document.getElementById("plans-body"),
    count: document.getElementById("pending-count"),
    foot: document.getElementById("plans-foot"),
    retry: document.getElementById("btn-retry"),
    emptyRetry: document.getElementById("btn-empty-retry"),
    kpiStudents: document.getElementById("kpi-students"),
    kpiPending: document.getElementById("kpi-pending")
  };

  const VIEW_KEYS = ["loading", "error", "empty", "content"];
  let isLoading = false;

  function showView(activeKey) {
    VIEW_KEYS.forEach(function (key) {
      nodes[key].classList.toggle("hidden", key !== activeKey);
    });
  }

  function countStudents(plans) {
    const ids = new Set();
    plans.forEach(function (plan) {
      if (plan && plan.studentId !== undefined && plan.studentId !== null && plan.studentId !== "") {
        ids.add(String(plan.studentId));
      }
    });
    return ids.size;
  }

  function formatCredits(plan) {
    const credits = Number(plan.credits);
    if (Number.isFinite(credits) && credits > 0) {
      return credits + " TC";
    }
    return "—";
  }

  function buildStudentCell(plan) {
    const cell = document.createElement("td");
    const wrapper = document.createElement("div");
    wrapper.className = "student-cell";

    const studentId = plan.studentId === undefined || plan.studentId === null ? "" : String(plan.studentId);

    const avatar = document.createElement("span");
    avatar.className = "avatar avatar-sm";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = studentId ? studentId.slice(-2) : "SV";

    const meta = document.createElement("div");
    meta.className = "student-meta";

    const code = document.createElement("div");
    code.className = "student-code";
    code.textContent = studentId ? "MSSV " + studentId : "Chưa rõ sinh viên";

    const title = document.createElement("div");
    title.className = "student-plan";
    title.textContent = plan.title || "Chưa đặt tên kế hoạch";
    title.title = title.textContent;

    meta.append(code, title);
    wrapper.append(avatar, meta);
    cell.append(wrapper);
    return cell;
  }

  function buildTextCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
  }

  function buildStatusCell() {
    const cell = document.createElement("td");
    const tag = document.createElement("span");
    tag.className = "tag tag-purple";
    tag.textContent = "Chờ duyệt";
    cell.append(tag);
    return cell;
  }

  function buildActionCell(plan, studentId) {
    const cell = document.createElement("td");
    cell.className = "cell-actions";

    const link = document.createElement("a");
    link.className = "btn btn-primary btn-sm";
    link.href = REVIEW_PAGE + "?plan=" + encodeURIComponent(plan.id === undefined || plan.id === null ? "" : String(plan.id));
    link.textContent = "Xem";
    link.setAttribute("aria-label", studentId ? "Xem kế hoạch của MSSV " + studentId : "Xem kế hoạch");

    cell.append(link);
    return cell;
  }

  function renderRows(plans) {
    const fragment = document.createDocumentFragment();

    plans.forEach(function (plan) {
      const row = document.createElement("tr");
      const studentId = plan.studentId === undefined || plan.studentId === null ? "" : String(plan.studentId);

      row.append(
        buildStudentCell(plan),
        buildTextCell(plan.semester || "—"),
        buildTextCell(formatCredits(plan)),
        buildStatusCell(),
        buildActionCell(plan, studentId)
      );
      fragment.append(row);
    });

    nodes.body.replaceChildren(fragment);
  }

  function renderSummary(allPlans, pendingPlans) {
    nodes.kpiStudents.textContent = String(countStudents(allPlans));
    nodes.kpiPending.textContent = String(pendingPlans.length);
    nodes.count.textContent = pendingPlans.length + " kế hoạch đang chờ";
    nodes.foot.textContent = "Hiển thị " + pendingPlans.length + " kế hoạch đang chờ duyệt.";
  }

  function resetSummary() {
    nodes.kpiStudents.textContent = "—";
    nodes.kpiPending.textContent = "—";
    nodes.count.textContent = "Không tải được";
    nodes.foot.textContent = "";
    nodes.body.replaceChildren();
  }

  async function loadPlans() {
    if (isLoading) {
      return;
    }

    isLoading = true;
    nodes.retry.disabled = true;
    nodes.emptyRetry.disabled = true;
    nodes.loading.setAttribute("aria-busy", "true");
    nodes.count.textContent = "Đang tải…";
    showView("loading");

    try {
      const plans = await window.StudyPathAPI.getPlans();
      const pendingPlans = plans.filter(function (plan) {
        return plan && (plan.status === "submitted" || plan.status === "pending");
      });

      renderSummary(plans, pendingPlans);

      if (pendingPlans.length === 0) {
        showView("empty");
        return;
      }

      renderRows(pendingPlans);
      showView("content");
    } catch (error) {
      resetSummary();
      showView("error");
    } finally {
      isLoading = false;
      nodes.retry.disabled = false;
      nodes.emptyRetry.disabled = false;
      nodes.loading.setAttribute("aria-busy", "false");
    }
  }

  if (window.StudyPathAPI && StudyPathAPI.onStoreChange) {
    StudyPathAPI.onStoreChange("plans", loadPlans);
  }

  nodes.retry.addEventListener("click", loadPlans);
  nodes.emptyRetry.addEventListener("click", loadPlans);

  loadPlans();
})();
