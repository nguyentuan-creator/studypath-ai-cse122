/* StudyPath AI — lộ trình mẫu cho khách: tải dữ liệu, đổi lộ trình và đăng ký sau đăng nhập. */
(function () {
  "use strict";

  const choiceRoot = document.getElementById("roadmapChoices");
  const semesterGrid = document.getElementById("semesterGrid");
  const workspace = document.querySelector(".roadmap-workspace");
  const errorState = document.getElementById("roadmapError");
  const emptyState = document.getElementById("roadmapEmpty");
  const retryButton = document.getElementById("retryRoadmaps");
  const useButton = document.getElementById("useRoadmap");
  const dialog = document.getElementById("loginDialog");
  const dialogMessage = document.getElementById("dialogMessage");
  const iconLabels = ["↗", "▧", "▦"];

  let roadmaps = [];
  let selectedId = null;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderChoices() {
    const fragment = document.createDocumentFragment();

    roadmaps.forEach(function (roadmap, index) {
      const button = node("button", "roadmap-choice");
      button.type = "button";
      button.dataset.roadmapId = roadmap.id;
      button.setAttribute("aria-pressed", String(roadmap.id === selectedId));

      button.append(node("span", "roadmap-choice-icon", iconLabels[index % iconLabels.length]));
      const main = node("span", "roadmap-choice-main");
      main.append(
        node("span", "roadmap-choice-title", roadmap.title),
        node("span", "roadmap-choice-description", roadmap.description)
      );
      const meta = node("span", "roadmap-choice-meta");
      meta.append(
        node("span", "", roadmap.totalSemesters + " học kỳ"),
        node("span", "", roadmap.totalCredits + " tín chỉ"),
        node("span", "", roadmap.program)
      );
      main.append(meta);
      button.append(main);
      if (roadmap.id === selectedId) {
        button.append(node("span", "roadmap-choice-selected", "Đang xem"));
      }
      fragment.append(button);
    });

    choiceRoot.replaceChildren(fragment);
  }

  function renderSemester(semester) {
    const card = node("article", "semester-card");
    const courses = Array.isArray(semester.courses) ? semester.courses : [];
    const creditTotal = courses.reduce(function (sum, course) {
      return sum + (Number(course.credits) || 0);
    }, 0);
    const heading = node("div", "semester-card-head");
    heading.append(node("span", "", semester.label), node("span", "", creditTotal + " tín chỉ"));
    card.append(heading);

    const list = node("ul", "semester-course-list");
    courses.forEach(function (course) {
      const item = node("li", "semester-course");
      const top = node("span", "semester-course-top");
      top.append(node("span", "semester-course-code", course.code), node("span", "", course.credits + " TC"));
      item.append(top, node("span", "semester-course-name", course.name));
      list.append(item);
    });
    card.append(list);
    return card;
  }

  function renderSelectedRoadmap() {
    const roadmap = roadmaps.find(function (item) { return item.id === selectedId; });
    if (!roadmap) return;

    document.getElementById("selectedRoadmapTitle").textContent = roadmap.title;
    document.getElementById("selectedRoadmapDescription").textContent = roadmap.description;
    document.getElementById("totalCredits").textContent = roadmap.totalCredits + " tín chỉ";
    document.getElementById("totalSemesters").textContent = roadmap.totalSemesters + " học kỳ";
    document.getElementById("selectedProgram").textContent = roadmap.program;
    document.getElementById("semesterNote").textContent = roadmap.note;

    const semesterFragment = document.createDocumentFragment();
    (Array.isArray(roadmap.semesters) ? roadmap.semesters : []).forEach(function (semester) {
      semesterFragment.append(renderSemester(semester));
    });
    semesterGrid.replaceChildren(semesterFragment);
    semesterGrid.setAttribute("aria-busy", "false");

    const suitFragment = document.createDocumentFragment();
    (Array.isArray(roadmap.suits) ? roadmap.suits : []).forEach(function (suit) {
      suitFragment.append(node("li", "", suit));
    });
    document.getElementById("suitList").replaceChildren(suitFragment);

    renderChoices();
    useButton.disabled = false;
  }

  function setLoading() {
    errorState.classList.add("hidden");
    emptyState.classList.add("hidden");
    choiceRoot.innerHTML = '<div class="roadmap-skeleton" aria-hidden="true"></div><div class="roadmap-skeleton" aria-hidden="true"></div><div class="roadmap-skeleton" aria-hidden="true"></div>';
    semesterGrid.setAttribute("aria-busy", "true");
    semesterGrid.replaceChildren(node("div", "roadmap-skeleton"));
    useButton.disabled = true;
  }

  async function loadRoadmaps() {
    setLoading();
    workspace.classList.remove("hidden");
    try {
      const data = await window.StudyPathAPI.loadData("sample-roadmaps");
      roadmaps = Array.isArray(data.roadmaps) ? data.roadmaps : [];
      if (roadmaps.length === 0) {
        workspace.classList.add("hidden");
        choiceRoot.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
      }

      choiceRoot.classList.remove("hidden");
      emptyState.classList.add("hidden");
      selectedId = roadmaps.some(function (item) { return item.id === selectedId; })
        ? selectedId
        : roadmaps[0].id;
      renderSelectedRoadmap();
    } catch (error) {
      console.error("Không tải được lộ trình mẫu:", error);
      choiceRoot.classList.add("hidden");
      workspace.classList.add("hidden");
      errorState.classList.remove("hidden");
    }
  }

  choiceRoot.addEventListener("click", function (event) {
    const choice = event.target.closest("[data-roadmap-id]");
    if (!choice) return;
    selectedId = choice.dataset.roadmapId;
    renderSelectedRoadmap();
  });

  useButton.addEventListener("click", function () {
    const selected = roadmaps.find(function (item) { return item.id === selectedId; });
    if (!selected) return;
    dialogMessage.textContent = "Đăng nhập để lưu lộ trình “" + selected.title + "” vào kế hoạch học tập của bạn.";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });

  retryButton.addEventListener("click", loadRoadmaps);
  loadRoadmaps();
})();
