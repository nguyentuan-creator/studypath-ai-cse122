/* Forgot password logic — validate email + thông báo gửi liên kết */
(function () {
  "use strict";

  var form = document.getElementById("forgot-form");
  var emailInput = document.getElementById("email");
  var successAlert = document.getElementById("send-success");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(message) {
    var group = emailInput.closest(".form-group");
    group.classList.add("is-invalid");
    group.querySelector(".form-error").textContent = message;
  }

  function clearError() {
    var group = emailInput.closest(".form-group");
    group.classList.remove("is-invalid");
    group.querySelector(".form-error").textContent = "";
  }

  function showSuccess() {
    successAlert.classList.remove("hidden");
  }

  function hideSuccess() {
    successAlert.classList.add("hidden");
  }

  emailInput.addEventListener("input", function () {
    clearError();
    hideSuccess();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideSuccess();

    var email = emailInput.value.trim();

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    clearError();
    showSuccess();
  });
})();
