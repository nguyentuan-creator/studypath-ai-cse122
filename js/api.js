/* =========================================================
   StudyPath AI — lớp truy cập dữ liệu giả lập (mock JSON)
   Dùng chung cho các màn hình; hiện có:
     - getCourseDetail(code): tải chi tiết một học phần cho
       vai trò Khách, trả về null nếu không có mã tương ứng.
   Lưu ý: fetch cần chạy qua HTTP server, không mở trực tiếp file://.
   ========================================================= */
(function () {
  "use strict";

  const DETAIL_ENDPOINT = "../assets/data/course-detail.json";
  const MOCK_DELAY_MS = 500;

  let detailCache = null;

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function loadDetailData() {
    if (detailCache !== null) {
      return detailCache;
    }

    await delay(MOCK_DELAY_MS);

    const response = await fetch(DETAIL_ENDPOINT);
    if (!response.ok) {
      throw new Error("Không tải được dữ liệu chi tiết học phần (HTTP " + response.status + ")");
    }

    detailCache = await response.json();
    return detailCache;
  }

  async function getCourseDetail(code) {
    const data = await loadDetailData();
    const found = data.courses.find(function (course) {
      return course.code === code;
    });
    return found || null;
  }

  window.StudyPathAPI = {
    getCourseDetail: getCourseDetail
  };
})();
