/* =========================================================
   StudyPath AI — màn hình Chi tiết học phần (Khách)
   Chức năng: đọc mã học phần từ ?code= (mặc định IT3060),
   gọi StudyPathAPI.getCourseDetail() rồi render:
     - skeleton khi đang tải,
     - khối lỗi + nút "Thử lại" khi tải thất bại,
     - trạng thái rỗng "Không tìm thấy học phần" khi mã không
       tồn tại (kèm link về danh mục),
     - nội dung chi tiết khi thành công.
   ========================================================= */
(function () {
  "use strict";

  const DEFAULT_CODE = "IT3060";
  const OPEN_STATUS = "Đang mở";

  const ICONS = {
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="8 12.5 11 15.5 16 9.5"></polyline></svg>',
    credits: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    type: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    prereq: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    recommend: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    status: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  };

  const els = {
    skeleton: document.getElementById("detailSkeleton"),
    error: document.getElementById("detailError"),
    empty: document.getElementById("detailEmpty"),
    content: document.getElementById("detailContent"),
    fallbackNote: document.getElementById("dFallbackNote"),
    retry: document.getElementById("retryLoad"),
    crumbCode: document.getElementById("crumbCode"),
    code: document.getElementById("dCode"),
    status: document.getElementById("dStatus"),
    name: document.getElementById("dName"),
    meta: document.getElementById("dMeta"),
    desc: document.getElementById("dDesc"),
    objectives: document.getElementById("dObjectives"),
    objectivesTitle: document.getElementById("objectivesTitle"),
    contents: document.getElementById("dContents"),
    contentsTitle: document.getElementById("contentsTitle"),
    facts: document.getElementById("dFacts"),
    related: document.getElementById("dRelated"),
    relatedSection: document.getElementById("relatedSection")
  };

  function getCourseCode() {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get("code") || DEFAULT_CODE).trim().toUpperCase();
    return code || DEFAULT_CODE;
  }

  function showState(state) {
    els.skeleton.classList.toggle("hidden", state !== "loading");
    els.error.classList.toggle("hidden", state !== "error");
    els.empty.classList.toggle("hidden", state !== "empty");
    els.content.classList.toggle("hidden", state !== "content");
  }

  function makeFactRow(icon, label, value, valueClass) {
    const row = document.createElement("div");
    row.className = "fact-row";

    const iconSpan = document.createElement("span");
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.innerHTML = icon;
    row.appendChild(iconSpan);

    const labelEl = document.createElement("span");
    labelEl.className = "fact-label";
    labelEl.textContent = label;
    row.appendChild(labelEl);

    const valueEl = document.createElement("dd");
    valueEl.className = "fact-value" + (valueClass ? " " + valueClass : "");
    valueEl.textContent = value;
    row.appendChild(valueEl);

    return row;
  }

  function render(course) {
    document.title = course.name + " (" + course.code + ") — StudyPath AI";
    els.crumbCode.textContent = course.code;
    els.code.textContent = course.code;
    els.fallbackNote.classList.toggle("hidden", course.hasDetail !== false);

    const isOpen = course.status === OPEN_STATUS;
    els.status.textContent = course.status;
    els.status.classList.toggle("is-closed", !isOpen);

    els.name.textContent = course.name;
    const typePart = course.type && course.type !== "—" ? " · " + course.type : "";
    els.meta.textContent = course.credits + " tín chỉ · " + course.faculty + typePart + " — " + course.program;
    els.desc.textContent = course.description;

    const hasObjectives = course.objectives.length > 0;
    els.objectivesTitle.classList.toggle("hidden", !hasObjectives);
    els.objectives.classList.toggle("hidden", !hasObjectives);

    els.objectives.textContent = "";
    course.objectives.forEach(function (text) {
      const li = document.createElement("li");
      li.innerHTML = ICONS.check;
      const span = document.createElement("span");
      span.textContent = text;
      li.appendChild(span);
      els.objectives.appendChild(li);
    });

    const hasContents = course.mainContents.length > 0;
    els.contentsTitle.classList.toggle("hidden", !hasContents);
    els.contents.classList.toggle("hidden", !hasContents);

    els.contents.textContent = "";
    course.mainContents.forEach(function (item) {
      const li = document.createElement("li");
      const no = document.createElement("span");
      no.className = "content-no";
      no.textContent = item.no;
      const title = document.createElement("span");
      title.textContent = item.title;
      li.appendChild(no);
      li.appendChild(title);
      els.contents.appendChild(li);
    });

    els.facts.textContent = "";
    els.facts.appendChild(makeFactRow(ICONS.credits, "Số tín chỉ", course.credits + " tín chỉ"));
    els.facts.appendChild(makeFactRow(ICONS.type, "Loại học phần", course.type));
    els.facts.appendChild(makeFactRow(ICONS.prereq, "Học phần tiên quyết", course.prerequisite || "Không"));
    els.facts.appendChild(makeFactRow(ICONS.recommend, "Nên học trước", course.recommendBefore || "Không"));
    els.facts.appendChild(makeFactRow(ICONS.status, "Trạng thái", course.status, isOpen ? "is-open" : ""));

    els.related.textContent = "";
    const hasRelated = course.relatedCourses.length > 0;
    els.relatedSection.classList.toggle("hidden", !hasRelated);
    (course.relatedCourses || []).forEach(function (item) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "visitor-course-detail.html?code=" + encodeURIComponent(item.code);

      const code = document.createElement("span");
      code.className = "related-code";
      code.textContent = item.code;

      const name = document.createElement("span");
      name.className = "related-name";
      name.textContent = item.name;

      const credits = document.createElement("span");
      credits.className = "related-credits";
      credits.textContent = item.credits + " tín chỉ";

      a.appendChild(code);
      a.appendChild(name);
      a.appendChild(credits);
      li.appendChild(a);
      els.related.appendChild(li);
    });
  }

  async function load() {
    const code = getCourseCode();
    els.crumbCode.textContent = code;
    showState("loading");

    try {
      const course = await window.StudyPathAPI.getCourseDetail(code);
      if (!course) {
        showState("empty");
        return;
      }
      render(course);
      showState("content");
    } catch (err) {
      console.error(err);
      showState("error");
    }
  }

  if (els.retry) {
    els.retry.addEventListener("click", load);
  }

  load();
})();
