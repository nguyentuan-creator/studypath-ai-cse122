const form = document.getElementById("profile-form");
const fullNameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const studentIdInput = document.getElementById("student-id");
const programInput = document.getElementById("program");
const yearInput = document.getElementById("year");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const successAlert = document.getElementById("save-success");

function hydrateProfile() {
  if (!window.StudyPathAPI) {
    return;
  }

  const user = StudyPathAPI.getCurrentUser();
  if (!user) {
    return;
  }

  [
    [fullNameInput, user.name],
    [emailInput, user.email],
    [studentIdInput, user.studentId],
    [programInput, user.program],
    [yearInput, user.year]
  ].forEach(([input, value]) => {
    if (input && typeof value === "string" && value !== "") {
      input.value = value;
      input.defaultValue = value;
    }
  });

  const summary = document.querySelector(".profile-summary");
  if (!summary) {
    return;
  }

  const name = String(user.name || "").trim();
  const nameEl = summary.querySelector("[data-profile-summary='name']");
  const roleEl = summary.querySelector("[data-profile-summary='role']");
  const metaEl = summary.querySelector("[data-profile-summary='meta']");
  const avatarEl = summary.querySelector("[data-profile-summary='avatar']");

  if (nameEl) {
    nameEl.textContent = name;
  }
  if (roleEl) {
    roleEl.textContent = user.roleLabel || "";
  }
  if (avatarEl) {
    const lastWord = name.split(/\s+/).pop() || "";
    avatarEl.textContent = lastWord.charAt(0).toUpperCase() || "?";
  }
  if (metaEl) {
    const parts = [];
    if (user.studentId) {
      parts.push("MSSV " + user.studentId);
    }
    if (user.program) {
      parts.push(user.program);
    }
    metaEl.textContent = parts.join(" · ");
  }
}

hydrateProfile();

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
