/* =========================================================
   StudyPath AI — lớp truy cập dữ liệu giả lập (mock JSON)
   Gồm 3 nhóm chức năng:
     1. Xác thực: login, register, setCurrentUser, getCurrentUser.
     2. Đọc dữ liệu: loadData(name) tải assets/data/<name>.json,
        kiểm tra response.ok, cache và gộp request trùng.
     3. Lưu trữ: readStore/writeStore dùng localStorage với khóa
        "studypath.<tên>", có bộ nhớ dự phòng khi trình duyệt chặn.
        onStoreChange theo dõi cả sự kiện "storage" (tab khác) và
        sự kiện nội bộ "studypath:storechange" (cùng tab).
   Tài khoản và mật khẩu chỉ phục vụ prototype, không dùng thật.
   Fetch cần chạy qua HTTP server, không mở trực tiếp file://.
   ========================================================= */
(function () {
  "use strict";

  const DATA_BASE = "../assets/data/";
  const CURRENT_USER_KEY = "studypath.currentUser";
  const STORE_PREFIX = "studypath.";
  const STORE_EVENT = "studypath:storechange";
  const MOCK_DELAY_MS = 600;

  const dataCache = Object.create(null);
  const pendingRequests = Object.create(null);
  const memoryStore = Object.create(null);
  let usersCache = null;
  let nextUserId = 100;

  const storage = (function () {
    try {
      const probeKey = "__studypath_probe__";
      window.localStorage.setItem(probeKey, "1");
      window.localStorage.removeItem(probeKey);
      return window.localStorage;
    } catch (error) {
      return null;
    }
  })();

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function clone(value) {
    if (value === undefined) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(value));
  }

  function dataUrl(name) {
    if (!/^[a-zA-Z0-9-]+$/.test(String(name))) {
      const error = new Error("Tên tệp dữ liệu không hợp lệ: " + name);
      error.code = "DATA_INVALID_NAME";
      throw error;
    }
    return DATA_BASE + name + ".json";
  }

  async function loadData(name, options) {
    const url = dataUrl(name);
    const force = Boolean(options && options.force);

    if (!force && dataCache[url] !== undefined) {
      return dataCache[url];
    }
    if (!force && pendingRequests[url]) {
      return pendingRequests[url];
    }

    const request = (async function () {
      try {
        let response;
        try {
          response = await fetch(url, { cache: force ? "no-store" : "default" });
        } catch (cause) {
          const error = new Error(
            "Không kết nối được tới " + url + ". Hãy chạy dự án qua HTTP server."
          );
          error.code = "DATA_NETWORK_ERROR";
          error.cause = cause;
          throw error;
        }

        if (!response.ok) {
          const error = new Error(
            "Không tải được " + url + " (HTTP " + response.status + ")"
          );
          error.code = "DATA_FETCH_FAILED";
          error.status = response.status;
          throw error;
        }

        try {
          const payload = await response.json();
          dataCache[url] = payload;
          return payload;
        } catch (cause) {
          const error = new Error("Tệp " + url + " không phải JSON hợp lệ");
          error.code = "DATA_INVALID_JSON";
          error.cause = cause;
          throw error;
        }
      } finally {
        delete pendingRequests[url];
      }
    })();

    pendingRequests[url] = request;
    return request;
  }

  function unwrap(payload, field) {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload !== null && typeof payload === "object" && Array.isArray(payload[field])) {
      return payload[field];
    }

    const error = new Error("Dữ liệu '" + field + "' không phải một mảng hợp lệ");
    error.code = "DATA_INVALID_SHAPE";
    throw error;
  }

  function fullStoreKey(key) {
    return STORE_PREFIX + key;
  }

  function emitStoreChange(key, value) {
    if (typeof window.CustomEvent !== "function") {
      return;
    }
    window.dispatchEvent(
      new CustomEvent(STORE_EVENT, {
        detail: { key: fullStoreKey(key), value: clone(value) }
      })
    );
  }

  function readStore(key, fallback) {
    const fullKey = fullStoreKey(key);

    if (storage !== null) {
      let raw = null;
      try {
        raw = storage.getItem(fullKey);
      } catch (error) {
        raw = null;
      }

      if (raw !== null) {
        try {
          return JSON.parse(raw);
        } catch (error) {
          /* Dữ liệu hỏng thì rơi xuống bộ nhớ dự phòng / giá trị mặc định. */
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(memoryStore, fullKey)) {
      return clone(memoryStore[fullKey]);
    }
    return clone(fallback);
  }

  function writeStore(key, value, options) {
    const fullKey = fullStoreKey(key);
    const silent = Boolean(options && options.silent);
    memoryStore[fullKey] = clone(value);

    if (storage !== null) {
      try {
        storage.setItem(fullKey, JSON.stringify(value));
      } catch (error) {
        const wrapped = new Error("Không ghi được dữ liệu vào localStorage");
        wrapped.code = "STORE_WRITE_FAILED";
        wrapped.cause = error;
        throw wrapped;
      }
    }

    if (!silent) {
      emitStoreChange(key, value);
    }
    return value;
  }

  function resetStore(key) {
    const fullKey = fullStoreKey(key);
    delete memoryStore[fullKey];

    if (storage !== null) {
      try {
        storage.removeItem(fullKey);
      } catch (error) {
        /* Không xóa được thì bỏ qua, lần đọc sau sẽ dùng dữ liệu mặc định. */
      }
    }

    emitStoreChange(key, null);
  }

  function onStoreChange(key, handler) {
    const fullKey = fullStoreKey(key);
    if (typeof handler !== "function") {
      return function () {};
    }

    function handleStorage(event) {
      if (event.key !== null && event.key !== fullKey) {
        return;
      }
      if (event.key === null) {
        handler(null, { source: "external" });
        return;
      }

      let value = null;
      if (event.newValue !== null) {
        try {
          value = JSON.parse(event.newValue);
        } catch (error) {
          value = null;
        }
      }
      handler(value, { source: "external" });
    }

    function handleLocal(event) {
      if (!event.detail || event.detail.key !== fullKey) {
        return;
      }
      handler(clone(event.detail.value), { source: "local" });
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(STORE_EVENT, handleLocal);

    return function unsubscribe() {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STORE_EVENT, handleLocal);
    };
  }

  async function loadUsers() {
    if (usersCache !== null) {
      return usersCache;
    }
    usersCache = unwrap(await loadData("users"), "users");
    return usersCache;
  }

  async function login(email, password) {
    await delay(MOCK_DELAY_MS);

    const data = await loadUsers();
    const normalizedEmail = normalizeEmail(email);
    const user = data.find(function (item) {
      return normalizeEmail(item.email) === normalizedEmail && item.password === password;
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

    const exists = data.some(function (user) {
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
    data.push(newUser);
    return newUser;
  }

  async function getCollection(file, field) {
    const stored = readStore(field, null);
    if (Array.isArray(stored)) {
      return stored;
    }

    const list = unwrap(await loadData(file), field);
    writeStore(field, list, { silent: true });
    return list;
  }

  function getPlans() {
    return getCollection("plans", "plans");
  }

  function getPlanItems() {
    return getCollection("planItems", "planItems");
  }

  function getAiSuggestions() {
    return getCollection("aiSuggestions", "aiSuggestions");
  }

  function savePlans(plans) {
    return writeStore("plans", plans);
  }

  function savePlanItems(items) {
    return writeStore("planItems", items);
  }

  function saveAiSuggestions(suggestions) {
    return writeStore("aiSuggestions", suggestions);
  }

  window.StudyPathAPI = {
    login: login,
    setCurrentUser: setCurrentUser,
    getCurrentUser: getCurrentUser,
    register: register,
    loadData: loadData,
    readStore: readStore,
    writeStore: writeStore,
    resetStore: resetStore,
    onStoreChange: onStoreChange,
    getPlans: getPlans,
    getPlanItems: getPlanItems,
    getAiSuggestions: getAiSuggestions,
    savePlans: savePlans,
    savePlanItems: savePlanItems,
    saveAiSuggestions: saveAiSuggestions
  };
})();
