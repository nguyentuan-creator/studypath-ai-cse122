/* =========================================================
   StudyPath AI — lớp truy cập dữ liệu giả lập
   Hiện có: danh sách thông báo (notifications.json)
   Các màn khác sẽ bổ sung thêm endpoint tại đây.
   ========================================================= */
(function () {
  "use strict";

  const NOTIFICATIONS_ENDPOINT = "../assets/data/notifications.json";
  const MOCK_DELAY_MS = 400;

  let notificationsCache = null;

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function loadNotifications() {
    if (notificationsCache !== null) {
      return notificationsCache;
    }
    const response = await fetch(NOTIFICATIONS_ENDPOINT);
    if (!response.ok) {
      throw new Error("Không tải được dữ liệu thông báo (HTTP " + response.status + ")");
    }
    notificationsCache = await response.json();
    return notificationsCache;
  }

  async function getNotifications() {
    await delay(MOCK_DELAY_MS);
    const data = await loadNotifications();
    return data.notifications;
  }

  window.StudyPathAPI = {
    getNotifications: getNotifications
  };
})();
