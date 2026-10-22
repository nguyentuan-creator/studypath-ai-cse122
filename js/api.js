/* =========================================================
   StudyPath AI — lớp truy cập dữ liệu giả lập
   Hiện có: danh sách người dùng (users.json) + đăng ký tài khoản
   Các màn khác sẽ bổ sung thêm endpoint tại đây.
   ========================================================= */
(function () {
  "use strict";

  const USERS_ENDPOINT = "../assets/data/users.json";
  const MOCK_DELAY_MS = 600;

  let usersCache = null;
  let nextUserId = 100;

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function loadUsers() {
    if (usersCache !== null) {
      return usersCache;
    }
    const response = await fetch(USERS_ENDPOINT);
    if (!response.ok) {
      throw new Error("Không tải được dữ liệu người dùng (HTTP " + response.status + ")");
    }
    usersCache = await response.json();
    return usersCache;
  }

  function normalizeEmail(email) {
    return String(email).trim().toLowerCase();
  }

  async function register(userInfo) {
    await delay(MOCK_DELAY_MS);
    const data = await loadUsers();
    const email = normalizeEmail(userInfo.email);

    const exists = data.users.some(function (user) {
      return normalizeEmail(user.email) === email;
    });
    if (exists) {
      const error = new Error("Email đã tồn tại");
      error.code = "EMAIL_EXISTS";
      throw error;
    }

    const newUser = {
      id: nextUserId++,
      name: String(userInfo.name).trim(),
      email: email,
      password: userInfo.password,
      role: "student",
      roleLabel: "Sinh viên",
      studentId: userInfo.studentId || "",
      program: userInfo.program || ""
    };
    data.users.push(newUser);
    return newUser;
  }

  window.StudyPathAPI = {
    register: register
  };
})();
