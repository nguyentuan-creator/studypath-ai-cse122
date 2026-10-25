/* =========================================================
   StudyPath AI — màn hình Đăng nhập
   Chức năng: kiểm tra hợp lệ, gọi StudyPathAPI.login, hiển thị
   trạng thái đang xử lý/lỗi xác thực và chuyển trang theo vai trò.
   ========================================================= */
(function () {
  "use strict";

  const ROLE_REDIRECTS = {
    student: "student-dashboard.html",
    advisor: "advisor-dashboard.html",
    admin: "admin-dashboard.html"
  };

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const submitBtn = document.getElementById("loginSubmit");
  const submitLabel = submitBtn.querySelector(".auth-submit-label");
  const errorBox = document.getElementById("loginError");

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
    emailInput.setAttribute("aria-invalid", "true");
    passwordInput.setAttribute("aria-invalid", "true");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("hidden");
    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
    submitLabel.textContent = isLoading ? "Đang đăng nhập…" : "Đăng nhập";
    form.setAttribute("aria-busy", String(isLoading));
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    clearError();
    setLoading(true);

    try {
      const user = await StudyPathAPI.login(emailInput.value, passwordInput.value);
      const target = ROLE_REDIRECTS[user.role];

      if (!target) {
        setLoading(false);
        showError("Tài khoản chưa được gán vai trò hợp lệ.");
        return;
      }

      StudyPathAPI.setCurrentUser(user);
      window.location.href = target;
    } catch (error) {
      setLoading(false);

      if (error.code === "INVALID_CREDENTIALS") {
        showError("Email hoặc mật khẩu không đúng");
        passwordInput.focus();
      } else {
        console.error("Đăng nhập thất bại:", error);
        showError("Không thể đăng nhập lúc này. Vui lòng thử lại.");
      }
    }
  });

  emailInput.addEventListener("input", clearError);
  passwordInput.addEventListener("input", clearError);
})();
