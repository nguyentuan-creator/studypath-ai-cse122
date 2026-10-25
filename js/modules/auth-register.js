/* =========================================================
   StudyPath AI — màn hình Đăng ký
   Chức năng: bật/tắt nút theo trường bắt buộc + điều khoản,
   validate khớp mật khẩu, gọi StudyPathAPI.register, báo lỗi
   dưới từng trường (giữ dữ liệu), thành công chuyển login.
   ========================================================= */
(function () {
  "use strict";

  const FLASH_KEY = "studypath.flashMessage";

  const form = document.getElementById("registerForm");
  const nameInput = document.getElementById("regName");
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");
  const confirmInput = document.getElementById("regConfirm");
  const studentIdInput = document.getElementById("regStudentId");
  const programInput = document.getElementById("regProgram");
  const agreeInput = document.getElementById("regAgree");
  const submitBtn = document.getElementById("regSubmit");
  const submitLabel = submitBtn.querySelector(".auth-submit-label");
  const formError = document.getElementById("regFormError");

  const fields = [
    { input: nameInput, error: document.getElementById("regNameError") },
    { input: emailInput, error: document.getElementById("regEmailError") },
    { input: passwordInput, error: document.getElementById("regPasswordError") },
    { input: confirmInput, error: document.getElementById("regConfirmError") }
  ];

  function showFieldError(field, message) {
    field.error.textContent = message;
    field.error.classList.remove("hidden");
    field.input.classList.add("is-invalid");
    field.input.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(field) {
    field.error.textContent = "";
    field.error.classList.add("hidden");
    field.input.classList.remove("is-invalid");
    field.input.removeAttribute("aria-invalid");
  }

  function clearFormError() {
    formError.textContent = "";
    formError.classList.add("hidden");
  }

  function isFormValid() {
    return (
      nameInput.value.trim() !== "" &&
      emailInput.checkValidity() &&
      passwordInput.value !== "" &&
      confirmInput.value !== "" &&
      agreeInput.checked
    );
  }

  function toggleSubmit() {
    submitBtn.disabled = !isFormValid();
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading || !isFormValid();
    submitBtn.classList.toggle("is-loading", isLoading);
    submitLabel.textContent = isLoading ? "Đang tạo tài khoản…" : "Tạo tài khoản";
    form.setAttribute("aria-busy", String(isLoading));
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submitBtn.disabled) {
      return;
    }

    fields.forEach(clearFieldError);
    clearFormError();

    if (passwordInput.value !== confirmInput.value) {
      showFieldError(
        fields[3],
        "Mật khẩu không khớp"
      );
      confirmInput.focus();
      return;
    }

    setLoading(true);

    try {
      await StudyPathAPI.register({
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        studentId: studentIdInput.value.trim(),
        program: programInput.options[programInput.selectedIndex]
          ? programInput.options[programInput.selectedIndex].text
          : ""
      });
      sessionStorage.setItem(FLASH_KEY, "Đã tạo tài khoản, hãy đăng nhập");
      window.location.href = "login.html";
    } catch (error) {
      setLoading(false);

      if (error.code === "EMAIL_EXISTS") {
        showFieldError(fields[1], "Email đã tồn tại");
        emailInput.focus();
      } else {
        console.error("Đăng ký thất bại:", error);
        formError.textContent = "Không thể tạo tài khoản lúc này. Vui lòng thử lại.";
        formError.classList.remove("hidden");
      }
    }
  });

  fields.forEach(function (field) {
    field.input.addEventListener("input", function () {
      clearFieldError(field);
      clearFormError();
      toggleSubmit();
    });
  });

  agreeInput.addEventListener("change", toggleSubmit);
  programInput.addEventListener("change", clearFormError);
  studentIdInput.addEventListener("input", clearFormError);

  toggleSubmit();
})();
