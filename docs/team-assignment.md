# Phân công nhóm

| Mã | Họ tên | Phụ trách chính | Trách nhiệm xuyên suốt |
|---|---|---|---|
| SV1 | Hồ Trung Anh | Khách | Responsive + kiểm tra giao diện phần mình |
| SV2 | Hứa Đình Kiên | Sinh viên | JavaScript / dữ liệu giả lập |
| SV3 | Nguyễn Bá Hoàng Tuân | Cố vấn học tập + Quản trị viên | Tích hợp bố cục, điều hướng, phát hành; đánh giá tính nhất quán |

## Màn hình dùng chung (9 màn) — chia 4 / 4 / 1

| Thành viên | Màn hình dùng chung |
|---|---|
| SV1 — Hồ Trung Anh | `index.html`, `login.html`, `register.html`, `forgot-password.html` |
| SV2 — Hứa Đình Kiên | `profile.html`, `settings.html`, `notifications.html`, `404.html` |
| SV3 — Nguyễn Bá Hoàng Tuân | `403.html` |

## Quy ước nhánh làm việc

- Mỗi thành viên làm việc trên nhánh cá nhân tạo từ `dev`: `dev-kien` (SV2), `dev-anh` (SV1), `dev-tuan` (SV3).
- Mỗi màn hình triển khai trên nhánh `feature/<tên-màn-hình>`, mở PR vào `dev` để review chéo trước khi merge.
- `dev` được hợp nhất vào `main` sau khi tích hợp và kiểm thử xong.

## Nguyên tắc

- Mỗi thành viên tự hoàn thành ít nhất một lát cắt dọc end-to-end:
  `Figma/Canva → HTML → CSS → JS → dữ liệu → responsive → nhánh Git → commit → PR → OBS`.
- Không tách vai trò kiểu "một người chỉ làm tài liệu, một người chỉ HTML, một người chỉ JS".
- Đánh giá chéo: SV2 review PR của SV1 hoặc SV3; SV3 đánh giá tính nhất quán toàn dự án.
