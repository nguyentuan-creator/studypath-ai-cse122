const form = document.getElementById("profile-form");
const fullNameInput = document.getElementById("full-name");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const successAlert = document.getElementById("save-success");

function setError(input, message) {
  const group = input.closest(".form-group");
  group.querySelector(".form-error").textContent = message;
  input.classList.add("is-invalid");
}

function clearError(input) {
  const group = input.closest(".form-group");
  group.querySelector(".form-error").textContent = "";
  input.classList.remove("is-invalid");
}

[fullNameInput, currentPasswordInput, newPasswordInput].forEach((input) => {
  input.addEventListener("input", () => {
    clearError(input);
    successAlert.classList.add("hidden");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let valid = true;

  if (fullNameInput.value.trim() === "") {
    setError(fullNameInput, "Vui lòng nhập họ và tên.");
    valid = false;
  }

  const newPassword = newPasswordInput.value;
  if (newPassword !== "" && newPassword.length < 6) {
    setError(newPasswordInput, "Mật khẩu mới phải có ít nhất 6 ký tự.");
    valid = false;
  }

  if (newPassword !== "" && currentPasswordInput.value === "") {
    setError(currentPasswordInput, "Nhập mật khẩu hiện tại để đổi mật khẩu.");
    valid = false;
  }

  if (valid) {
    successAlert.classList.remove("hidden");
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
  }
});

document.getElementById("btn-reset").addEventListener("click", () => {
  form.reset();
  [fullNameInput, currentPasswordInput, newPasswordInput].forEach(clearError);
  successAlert.classList.add("hidden");
});
