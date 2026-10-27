(function () {
  "use strict";
  const $ = function (selector) { return document.querySelector(selector); };
  const KEYS = { courses: "studypath.adminCourses", programs: "studypath.adminPrograms", users: "studypath.adminUsers" };
  const SEED_COURSES = [
    { code:"IT1010",name:"Nhập môn lập trình",credits:3,program:"CNTT (K17)",status:"active",updatedAt:"01/10/2026",group:"Bắt buộc",description:"Làm quen với tư duy lập trình và giải quyết vấn đề." },
    { code:"IT1020",name:"Kỹ thuật lập trình",credits:4,program:"CNTT (K17)",status:"active",updatedAt:"28/09/2026",group:"Bắt buộc",description:"Kỹ thuật lập trình căn bản." },
    { code:"IT3060",name:"Cơ sở dữ liệu",credits:3,program:"CNTT · HTTT",status:"active",updatedAt:"25/09/2026",group:"Bắt buộc",description:"Mô hình hóa và truy vấn cơ sở dữ liệu." },
    { code:"IT4040",name:"Mạng máy tính",credits:3,program:"CNTT (K17)",status:"active",updatedAt:"22/09/2026",group:"Bắt buộc",description:"Nguyên lý mạng máy tính." },
    { code:"IT5060",name:"Mạng máy tính nâng cao",credits:3,program:"CNTT (K17)",status:"paused",updatedAt:"20/09/2026",group:"Tự chọn",description:"Chủ đề nâng cao về mạng máy tính." },
    { code:"MA2010",name:"Toán rời rạc",credits:3,program:"Toàn trường",status:"active",updatedAt:"15/09/2026",group:"Bắt buộc",description:"Cấu trúc rời rạc cho khoa học máy tính." },
    { code:"IT3090",name:"Phát triển ứng dụng web",credits:3,program:"CNTT (K17)",status:"active",updatedAt:"12/09/2026",group:"Tự chọn",description:"Xây dựng ứng dụng web phía máy khách." },
    { code:"IT4060",name:"Trí tuệ nhân tạo",credits:4,program:"CNTT (K17)",status:"active",updatedAt:"10/09/2026",group:"Tự chọn",description:"Các phương pháp AI cơ bản." },
    { code:"IT7070",name:"Phân tích và thiết kế hệ thống",credits:3,program:"CNTT (K17)",status:"active",updatedAt:"08/09/2026",group:"Tự chọn",description:"Phân tích yêu cầu và thiết kế hệ thống thông tin.",prerequisites:["IT3060"] }
  ];
  const SEED_PROGRAMS = [
    { id:"SE-K17",name:"Kỹ thuật phần mềm (K17)",code:"SE-K17",requiredCredits:130,cohort:"K17 trở đi",status:"active",groups:[{id:"g1",type:"required",name:"Nền tảng",creditTarget:24,courses:["IT1010","IT1020","MA2010"]},{id:"g2",type:"required",name:"Cơ sở ngành",creditTarget:40,courses:["IT3060","IT4040"]},{id:"g3",type:"elective",name:"Tự chọn hướng Software",creditTarget:20,courses:["IT3090","IT4060"]},{id:"g4",type:"elective",name:"Tự chọn toàn trường",creditTarget:20,courses:["IT5060"]}]},
    { id:"IT-K18",name:"Công nghệ thông tin (K18)",code:"IT-K18",requiredCredits:128,cohort:"K18 trở đi",status:"active",groups:[{id:"g1",type:"required",name:"Kiến thức nền tảng",creditTarget:30,courses:["IT1010","MA2010"]},{id:"g2",type:"required",name:"Cơ sở ngành",creditTarget:48,courses:["IT1020","IT3060","IT4040"]},{id:"g3",type:"elective",name:"Tự chọn chuyên ngành",creditTarget:30,courses:["IT3090","IT4060"]}]},
    { id:"DS",name:"Khoa học dữ liệu",code:"DS",requiredCredits:132,cohort:"K17 trở đi",status:"active",groups:[{id:"g1",type:"required",name:"Nền tảng",creditTarget:28,courses:["IT1010","MA2010"]},{id:"g2",type:"required",name:"Cơ sở dữ liệu và AI",creditTarget:44,courses:["IT3060","IT4060"]},{id:"g3",type:"elective",name:"Tự chọn",creditTarget:24,courses:["IT3090"]}]},
    { id:"IS",name:"Hệ thống thông tin",code:"IS",requiredCredits:128,cohort:"K17 trở đi",status:"active",groups:[{id:"g1",type:"required",name:"Nền tảng",creditTarget:30,courses:["IT1010","MA2010"]},{id:"g2",type:"required",name:"Cơ sở ngành",creditTarget:42,courses:["IT3060","IT1020"]},{id:"g3",type:"elective",name:"Tự chọn",creditTarget:28,courses:["IT3090","IT4040"]}]},
    { id:"SEC",name:"An ninh mạng",code:"SEC",requiredCredits:130,cohort:"K17 trở đi",status:"active",groups:[{id:"g1",type:"required",name:"Nền tảng",creditTarget:30,courses:["IT1010","MA2010"]},{id:"g2",type:"required",name:"Mạng và an toàn",creditTarget:48,courses:["IT4040","IT5060"]},{id:"g3",type:"elective",name:"Tự chọn chuyên sâu",creditTarget:24,courses:["IT4060"]}]},
    { id:"CE",name:"Kỹ thuật máy tính",code:"CE",requiredCredits:131,cohort:"K17 trở đi",status:"active",groups:[{id:"g1",type:"required",name:"Nền tảng",creditTarget:32,courses:["IT1010","MA2010"]},{id:"g2",type:"required",name:"Cơ sở ngành",creditTarget:46,courses:["IT1020","IT3060"]},{id:"g3",type:"elective",name:"Tự chọn",creditTarget:24,courses:["IT4040","IT5060"]}]}
  ];
  function readStorage(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } }
  function writeStorage(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function escapeHtml(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function notify(message) { const node = $("#adminToast"); if (!node) return; node.textContent = message; node.classList.remove("hidden"); clearTimeout(notify.timer); notify.timer = setTimeout(function () { node.classList.add("hidden"); }, 2600); }
  function setupGuard() { const user = window.StudyPathGuard ? window.StudyPathGuard.requireRole("admin") : null; if (!user) return null; const name = $("#adminName"); if (name) name.textContent = user.name || "Quản trị viên"; const badge = $("#adminInitials"); if (badge) badge.textContent = (user.name || "QT").trim().split(/\s+/).slice(-2).map(function (part) { return part[0]; }).join("").toUpperCase(); const logout = $("#logoutBtn"); if (logout) logout.addEventListener("click", function () { window.StudyPathGuard.signOut(); window.location.href = "login.html"; }); return user; }
  function loadStudentsData() { return fetch("../assets/data/advisor-students.json").then(function (r) { return r.ok ? r.json() : { plans:[] }; }).catch(function () { return { plans:[] }; }); }
  function initDashboard() {
    if (!setupGuard()) return;
    const courses = readStorage(KEYS.courses, SEED_COURSES), programs = readStorage(KEYS.programs, SEED_PROGRAMS);
    writeStorage(KEYS.courses, courses); writeStorage(KEYS.programs, programs);
    $("#courseCount").textContent = courses.length.toLocaleString("vi-VN"); $("#inactiveCourseCount").textContent = courses.filter(function (course) { return course.status !== "active"; }).length + " học phần tạm ngưng"; $("#programCount").textContent = programs.length.toLocaleString("vi-VN");
    loadStudentsData().then(function (data) { $("#pendingPlans").textContent = (data.plans || []).filter(function (plan) { return plan.status === "pending"; }).length.toLocaleString("vi-VN"); });
    const savedUsers = readStorage(KEYS.users, null);
    if (savedUsers) { $("#activeUsers").textContent = savedUsers.filter(function (user) { return user.status !== "locked"; }).length.toLocaleString("vi-VN"); $("#userFoot").textContent = savedUsers.length.toLocaleString("vi-VN") + " tài khoản trong dữ liệu mẫu"; }
    else fetch("../assets/data/users.json").then(function (r) { return r.json(); }).then(function (data) { const total = (data.users || []).length; $("#activeUsers").textContent = total.toLocaleString("vi-VN"); $("#userFoot").textContent = total + " tài khoản đăng nhập mẫu"; }).catch(function () { $("#activeUsers").textContent = "—"; });
    const chart = [{label:"Tháng 7",value:4},{label:"Tháng 8",value:7},{label:"Tháng 9",value:9}]; const max = Math.max.apply(null, chart.map(function (item) { return item.value; }));
    $("#planChart").innerHTML = chart.map(function (item) { return '<div class="bar-row"><span>' + item.label + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.round(item.value / max * 100) + '%"></div></div><span class="bar-value">' + item.value + '</span></div>'; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () { initDashboard(); });
})();
