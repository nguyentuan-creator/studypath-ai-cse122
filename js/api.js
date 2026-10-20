/* =========================================================
   StudyPath AI — lớp truy cập dữ liệu giả lập (mock JSON)
   Dùng chung cho các màn hình; hiện có:
     - loadCatalog(): tải danh mục học phần cho vai trò Khách.
   Lưu ý: fetch cần chạy qua HTTP server, không mở trực tiếp file://.
   ========================================================= */
(function () {
  "use strict";

  const CATALOG_ENDPOINT = "../assets/data/courses.json";
  const MOCK_DELAY_MS = 500;

  let catalogCache = null;

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function loadCatalog() {
    if (catalogCache !== null) {
      return catalogCache;
    }

    await delay(MOCK_DELAY_MS);

    const response = await fetch(CATALOG_ENDPOINT);
    if (!response.ok) {
      throw new Error("Không tải được dữ liệu học phần (HTTP " + response.status + ")");
    }

    catalogCache = await response.json();
    return catalogCache;
  }

  window.StudyPathAPI = {
    loadCatalog: loadCatalog
  };
})();
