# Đặc tả shell dùng chung — StudyPath AI

Tài liệu này là chuẩn bắt buộc cho **mọi màn hình sau khi đăng nhập** (sinh viên, cố vấn, quản trị viên).
Bản dựng tham chiếu: `design/drafts/shell-v2.html` (ảnh: `shell-v2-desktop.png`, `shell-v2-mobile.png`).

## 0. Bốn vai trò và hai bề mặt

Đề yêu cầu 4 vai trò. **Khách là trạng thái chưa đăng nhập, không phải tài khoản** — không có user `guest`, không có dashboard khách và không có "đăng nhập khách".

| Vai trò | Bề mặt | Màn hình |
|---|---|---|
| Khách | Công khai, `site-header`, **không** app shell | `index.html`, `login.html`, `register.html`, `forgot-password.html`, 3 trang `visitor-*` |
| Sinh viên | App shell | `student-dashboard.html`, `student-semester-plan.html`, `student-ai-roadmap.html` + màn dùng chung |
| Cố vấn học tập | App shell | 4 trang `advisor-*` + màn dùng chung |
| Quản trị viên | App shell | 4 trang `admin-*` + màn dùng chung |

- Người dùng vào màn hình khách bằng cách **không đăng nhập**; không tạo phiên giả.
- Shell chỉ phục vụ 3 vai trò có tài khoản. `profile.html`, `settings.html`, `notifications.html` dùng shell và cho cả 3 vai trò đã đăng nhập.

## 1. Cấu trúc chuẩn

```
┌─────────────────────────────────────────────────────────┐
│ .app-header: logo · (trống) · chuông · tên + vai trò     │
├────────────┬────────────────────────────────────────────┤
│ .sidebar   │ .main-content                              │
│ (nav theo  │  .page-head                                │
│  vai trò)  │  nội dung màn hình                         │
└────────────┴────────────────────────────────────────────┘
```

- Header full-width, cao 64px, dính trên cùng.
- Aside rộng 240px, dính dưới header; nav do JS dựng theo vai trò.
- **Không có thanh tìm kiếm trên header.** Không thêm lại nếu chưa có yêu cầu mới.
- Không hardcode tên/MSSV/avatar. Mọi thông tin người dùng lấy từ session qua `js/api.js`.

## 2. Khung HTML bắt buộc

Dán nguyên khối dưới đây, chỉ thay phần `<main>`:

```html
<body data-page="ten-man-hinh">
  <header class="app-header">
    <button type="button" class="icon-btn menu-btn" data-shell="menu"
            aria-label="Mở menu" aria-controls="app-sidebar" aria-expanded="false">
      <!-- icon hamburger -->
    </button>

    <a class="brand" href="student-dashboard.html" data-shell="brand">
      <span class="brand-mark" aria-hidden="true"><!-- logo --></span>
      <span>StudyPath AI</span>
    </a>

    <div class="header-actions">
      <a class="icon-btn" href="notifications.html" aria-label="Thông báo">
        <!-- icon chuông -->
        <span class="bell-dot" aria-hidden="true"></span>
      </a>
      <div class="header-user">
        <div class="user-name">
          <span data-shell-user="name"></span>
          <span class="user-role" data-shell-user="meta"></span>
        </div>
        <span class="avatar avatar-sm" data-shell-user="avatar" aria-hidden="true"></span>
      </div>
    </div>
  </header>

  <div class="app-body">
    <aside class="sidebar" id="app-sidebar">
      <nav class="sidebar-nav" aria-label="Điều hướng chính" data-shell="nav"></nav>
    </aside>

    <main class="main-content">
      <!-- nội dung màn hình -->
    </main>
  </div>

  <div class="sidebar-overlay" data-shell="overlay" hidden></div>

  <script src="../js/api.js"></script>
  <script src="../js/shell.js"></script>
  <script src="../js/ten-man-hinh.js"></script>
</body>
```

Quy tắc:

1. `<nav data-shell="nav">` phải **rỗng** — shell tự dựng link, active state và mục bị khoá.
2. `<body data-page="...">` quyết định mục nào đang active. Giá trị dùng một lần, thống nhất với `key` trong `js/shell.js`.
3. Thứ tự nạp CSS: `base.css` → `responsive.css` → CSS của trang.
4. Thứ tự nạp JS: `api.js` → `shell.js` → JS của trang. `shell.js` phải chạy trước để trang (ví dụ `settings.js`) đọc được nhãn nav đã dựng.
5. Overlay đặt cuối `body`, ngoài `.app-body`, có `hidden`.
6. Nút chuông là link tới `notifications.html` (không phải button giả lập).
7. Không viết "Khách" / "Chưa đăng nhập" vào app shell. `js/shell.js` chặn phiên không hợp lệ và chuyển về `login.html`.

## 3. Giá trị `data-page`

| Trang | `data-page` | File |
|---|---|---|
| Tổng quan sinh viên | `dashboard` | `pages/student-dashboard.html` |
| Kế hoạch học kỳ | `plan` | `pages/student-semester-plan.html` |
| Lộ trình AI | `roadmap` | `pages/student-ai-roadmap.html` |
| Thông báo | `notifications` | `pages/notifications.html` |
| Hồ sơ | `profile` | `pages/profile.html` |
| Cài đặt | `settings` | `pages/settings.html` |
| Tổng quan cố vấn | `advisor-dashboard` | `pages/advisor-dashboard.html` |
| Tổng quan quản trị | `admin-dashboard` | `pages/admin-dashboard.html` |
| Quản lý học phần | `admin-courses` | `pages/admin-course-management.html` |
| Cấu hình chương trình | `admin-programs` | `pages/admin-program-settings.html` |
| Quản lý người dùng | `admin-users` | `pages/admin-user-management.html` |

Màn hình mới: thêm key tương ứng vào `NAV_BY_ROLE` trong `js/shell.js`.

## 4. Điều hướng theo vai trò

Toàn bộ nav nằm trong `js/shell.js` — **nguồn duy nhất**, không lặp lại trong HTML:

- `NAV_BY_ROLE.student`: Tổng quan, Kế hoạch học kỳ, Lộ trình AI, Thông báo, Hồ sơ, Cài đặt.
- `NAV_BY_ROLE.advisor`: Tổng quan cố vấn + 3 mục đang khoá (Xem xét kế hoạch, Quản lý góp ý, Hồ sơ sinh viên) + Thông báo, Hồ sơ, Cài đặt.
- `NAV_BY_ROLE.admin`: Tổng quan, Học phần, Chương trình, Người dùng, Thông báo, Hồ sơ, Cài đặt. `HOME_BY_ROLE.admin` trỏ tới `admin-dashboard.html`.
- Khách không có nav và không vào app shell; chỉ dùng `site-header` ở các trang công khai.

Khi màn hình cố vấn hoàn thiện: bỏ `disabled`, thêm `href` và thêm `key` vào trang tương ứng. Không tạo link chết.

### Chặn truy cập

- Không có phiên đăng nhập → `js/shell.js` chuyển về `login.html` (đã bật).
- Có phiên nhưng sai vai trò → `403.html`. Trang này thuộc SV1 (`SV1-08`) và chưa có, nên **chưa bật kiểm tra vai trò** để tránh link chết; bật ngay khi `403.html` được merge.
- Sau khi bật: `student` chỉ vào trang sinh viên; `advisor` chỉ vào trang cố vấn; `admin` chỉ vào trang quản trị; `profile/settings/notifications` cho cả ba.

## 5. Hành vi responsive

- **> 1024px**: header full-width; sidebar 240px.
- **≤ 1024px**: sidebar thu còn rail 68px, chỉ hiện icon.
- **≤ 760px**: sidebar thành drawer trượt từ trái; nút hamburger hiện ra; đóng bằng overlay, `Esc` hoặc khi resize lên desktop; header ẩn tên người dùng, chỉ còn avatar.

Tất cả đã nằm trong `css/base.css` — không viết lại trong CSS trang.

## 6. Biến thể ngoài shell

| Loại màn hình | Header | Ghi chú |
|---|---|---|
| Công khai (index, 3 trang `visitor-*`) | `site-header` riêng | Không dùng shell; không có sidebar; có CTA đăng nhập |
| Đăng nhập / đăng ký / quên mật khẩu | Không header | Card căn giữa, class `auth-page` |
| 403 / 404 | Không shell | Trang độc lập |

Shell chỉ áp dụng cho màn hình sau đăng nhập của sinh viên, cố vấn và quản trị viên. Khách dùng bề mặt công khai.

## 7. CSS của từng trang

Được phép: style nội dung (card, bảng, form, chart, toast…).

Không được khai báo lại: `.app-header`, `.app-body`, `.sidebar`, `.sidebar-nav`, `.nav-item`, `.main-content`, `.header-actions`, `.header-user`, `.brand`, `.brand-mark`, `.avatar`, `.icon-btn`, `.menu-btn`, `.sidebar-overlay`.

Dùng token trong `base.css`:

- Màu: `var(--color-primary)`, `--color-text`, `--color-text-muted`, `--color-bg`, `--color-surface`, `--color-border`, `--color-success`, `--color-warning`, `--color-danger`.
- Khoảng cách: `var(--space-1..6)`; bo góc: `var(--radius-sm/md/lg/full)`; đổ bóng: `var(--shadow-sm/md)`.

Không thêm `:root` trùng lặp hoặc reset `*`, `body`, `a` trong CSS trang.

## 8. Dữ liệu người dùng

`js/shell.js` đọc `StudyPathAPI.getCurrentUser()` và điền:

| Vị trí | Nguồn |
|---|---|
| Tên ở header | `user.name` |
| Dòng phụ | `user.roleLabel` + ` · ` + `user.studentId` |
| Avatar | chữ cái đầu của từ cuối trong tên |
| Link logo | `HOME_BY_ROLE` của vai trò (hiện có sinh viên, cố vấn; thêm quản trị khi trang có) |

Yêu cầu dữ liệu: `getCurrentUser()` trả về `{ id, name, role, roleLabel, studentId, program, year }`. Nếu thiếu `studentId` (nhánh `dev` cũ), header chỉ hiện vai trò — cần đồng bộ từ nhánh `feature/data-identity` trước khi merge.

## 9. Checklist màn hình mới

- [ ] `<body data-page="...">` đúng key.
- [ ] Header, aside, overlay copy đúng khung mục 2; nav rỗng; không hardcode "Khách" / "Chưa đăng nhập".
- [ ] Không còn topbar/search/sidebar tự dựng, không hardcode tên người dùng.
- [ ] Mở trang khi chưa đăng nhập bị chuyển về `login.html`.
- [ ] CSS nạp đúng thứ tự; JS nạp `api.js` → `shell.js` → JS trang.
- [ ] Thêm màn hình vào `NAV_BY_ROLE` nếu cần xuất hiện trên nav.
- [ ] Kiểm tra 1440 / 1024 / 390px; drawer mở/đóng; `Esc`; không lỗi console.
- [ ] Kiểm tra với cả tài khoản sinh viên và cố vấn (nav đúng vai trò).
- [ ] Không có link chết: màn hình chưa xong phải là mục `disabled`.

## 10. Quyền sửa file dùng chung

`css/base.css`, `css/responsive.css`, `js/shell.js`, `js/api.js` là hạ tầng dùng chung.

- Chỉ **SV2 (Hứa Đình Kiên)** sửa `css/base.css`.
- Ai cần thay đổi shell/nav/token: gửi yêu cầu kèm màn hình + lý do, không tự sửa rồi mở PR chen ngang.
- PR đụng các file trên phải ghi rõ ảnh hưởng tới toàn bộ 23 màn hình.
