/* =========================================================
   StudyPath AI — lớp truy cập dữ liệu giả lập (mock JSON)
   Hiện có:
     - login(email, password): xác thực tài khoản demo.
     - setCurrentUser / getCurrentUser: lưu phiên đăng nhập tạm.
     - register(userInfo): đăng ký tài khoản mới (mock).
   Lưu ý: tài khoản và mật khẩu chỉ phục vụ prototype, không dùng thật.
   Fetch cần chạy qua HTTP server, không mở trực tiếp file://.
   ========================================================= */
(function () {
  "use strict";

  const USERS_ENDPOINT = "../assets/data/users.json";
  const CURRENT_USER_KEY = "studypath.currentUser";
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

  async function login(email, password) {
    await delay(MOCK_DELAY_MS);

    const data = await loadUsers();
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = data.users.find(function (item) {
      return item.email.toLowerCase() === normalizedEmail && item.password === password;
    });

    if (!user) {
      const error = new Error("Email hoặc mật khẩu không đúng");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    return user;
  }

  function setCurrentUser(user) {
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: user.roleLabel
    };
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  }

  function getCurrentUser() {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY);
    if (raw === null) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
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
    login: login,
    setCurrentUser: setCurrentUser,
    getCurrentUser: getCurrentUser,
    register: register
  };
})();
