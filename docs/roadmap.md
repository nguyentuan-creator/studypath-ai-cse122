# Lộ trình hoàn thành BTL — StudyPath AI (CSE122)

> Lập ngày 2026-10-12. Căn cứ: đề bài BTL-01 + tiến độ repo GitHub (commit mới nhất `6eba7d0`) + xác nhận của nhóm ngày 2026-10-12.

## 1. Hiện trạng trên GitHub

| Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|
| Tài liệu phân tích | ✅ Xong phần khung | `docs/project-proposal.md`, `roles-and-features.md`, `screen-list.md` (23 màn), `screen-states.md`, `user-flow.html` — commit `6eba7d0` |
| Khung dây Figma 23 màn | ✅ Xong và đã được giảng viên duyệt (2026-10-12) | 3 file Figma trong `design/figma-link.txt` |
| Bản mô phỏng hi-fi | 🔶 Mới có 1 bản tham chiếu | `design/drafts/advisor-dashboard.html` — SV3 |
| Phân công | ✅ Đã điền tên + chia 9 màn dùng chung 4/4/1 | `docs/team-assignment.md`, `docs/screen-list.md` |
| Code sản phẩm | ❌ Chưa có màn nào | `css/*.css`, `js/*.js` còn là file trống |
| Dữ liệu giả lập | ❌ Chưa có | `assets/data/` trống |
| Quy trình Git | 🔶 Đã tạo nhánh cá nhân `dev-kien` (SV2) từ `dev`; chưa có PR nào | nhánh `dev-kien` |
| Trello/Jira | ❌ Chưa tạo | — |
| OBS | ❌ Chưa có video nào | — |

Tình hình theo thành viên:

- **SV3 — Nguyễn Bá Hoàng Tuân**: đã đẩy gói docs + Figma links + 1 draft hi-fi (`717c94b`, `6eba7d0`); phụ trách màn `403.html`.
- **SV1 — Hồ Trung Anh**: chưa có commit/nhánh nào trên GitHub.
- **SV2 — Hứa Đình Kiên**: đã tạo nhánh `dev-kien` và đẩy tài liệu phân công (2026-10-12).

## 2. Việc bắt buộc còn thiếu (đối chiếu đề bài)

1. ~~Giảng viên duyệt trước khi code~~ ✅ Đã duyệt (2026-10-12).
2. **Trello**: tạo bảng 5 cột; task theo TỪNG MÀN HÌNH (không tách card "CSS 1 phần / HTML 1 phần").
3. **Design tokens + khung CSS chung**: chốt token (xanh `#2563EB`, AI tím `#7C3AED`, Inter/Segoe UI, lưới 8px) thành `css/style.css` để 23 màn không lệch nhau.
4. **Lớp dữ liệu 7 entity** (`users, courses, programs, plans, planItems, advisorFeedback, aiSuggestions`) + seed JSON — **SV2 chủ trì**, ưu tiên sớm vì cả nhóm dùng lại.
5. **Quy trình Git**: mở PR đầu tiên `dev-kien → dev`; các màn làm trên `feature/<tên-màn>` → PR vào `dev` → review chéo → merge.
6. **OBS**: 23 video theo 23 màn; mỗi người quay phần màn mình phụ trách. Video phải có mặt, thao tác sửa code trực tiếp và commit live.
7. **`docs/ai-usage-report.md`**: điền dần trong lúc làm, không để cuối kỳ.
8. **Bảo vệ (mục "Bảo vệ / Chỉnh sửa ngẫu nhiên")**: mỗi người phải luyện trước các thao tác chỉnh sửa nhanh 5–10 phút.

## 3. Phân công chính thức (chốt 2026-10-12)

### Màn hình dùng chung (9 màn) — chia 4 / 4 / 1

| Thành viên | Màn hình chung |
|---|---|
| SV1 — Hồ Trung Anh | `index.html`, `login.html`, `register.html`, `forgot-password.html` |
| SV2 — Hứa Đình Kiên | `profile.html`, `settings.html`, `notifications.html`, `404.html` |
| SV3 — Nguyễn Bá Hoàng Tuân | `403.html` |

### Màn hình theo vai trò

| Thành viên | Vai trò | Màn hình |
|---|---|---|
| SV1 — Hồ Trung Anh | Khách | `visitor-course-catalog`, `visitor-course-detail`, `visitor-sample-roadmaps` |
| SV2 — Hứa Đình Kiên | Sinh viên | `student-dashboard` (R), `student-semester-plan` (AI-2), `student-ai-roadmap` (AI-1) |
| SV3 — Nguyễn Bá Hoàng Tuân | Cố vấn + Quản trị | 4 màn Cố vấn + 4 màn Quản trị viên |

### Cân bằng khối lượng

| Thành viên | Màn vai trò | Màn chung | Tổng | Ghi chú |
|---|---:|---:|---:|---|
| SV1 | 3 | 4 | 7 | |
| SV2 | 3 | 4 | 7 | Kèm lớp dữ liệu + 2 AI + review chéo |
| SV3 | 8 | 1 | 9 | Kèm docs + tích hợp toàn dự án |

### Quy ước nhánh

- Nhánh cá nhân (tạo từ `dev`, làm việc hằng ngày): `dev-kien` (SV2, đã tạo), `dev-anh` (SV1), `dev-tuan` (SV3).
- Nhánh tính năng: `feature/<tên-màn-hình>` cho từng màn, mở PR vào `dev`.
- `dev → main` khi tích hợp và kiểm thử xong.

### Trách nhiệm xuyên suốt (theo đề bài)

- **SV1**: responsive + kiểm tra giao diện phần mình.
- **SV2**: lớp JavaScript / dữ liệu giả lập dùng chung; **review PR của SV1 hoặc SV3** (bắt buộc).
- **SV3**: tích hợp bố cục, điều hướng, phát hành; đánh giá tính nhất quán toàn dự án.

## 4. Lộ trình 5 giai đoạn

### Giai đoạn 0 — Chốt nền tảng

- [x] Giảng viên đã duyệt 23 màn + luồng + Figma (xác nhận 2026-10-12).
- [x] Điền tên 3 thành viên vào `team-assignment.md` + README.
- [x] Chốt chia 9 màn dùng chung (4/4/1).
- [x] Tạo nhánh cá nhân `dev-kien` cho SV2.
- [ ] Mở PR đầu tiên `dev-kien → dev` (nội dung: điền tên + phân công + roadmap + prompt hi-fi).
- [ ] Tạo Trello 5 cột, mỗi card = 1 màn hình (đủ mã, file, người, deadline, nhánh, link PR/OBS).
- [ ] SV1 tạo `dev-anh`, SV3 tạo `dev-tuan`.

### Giai đoạn 1 — Khung kỹ thuật + hi-fi (song song, 3–5 ngày)

- [ ] **SV2**: `css/style.css` — token + component nền (header, sidebar, card, button, badge, table, form, modal, toast, skeleton) — PR vào `dev` cho cả nhóm dùng.
- [ ] **SV2**: `js/api.js` + `assets/data/*.json` — mock CRUD 7 entity trên LocalStorage (ưu tiên làm sớm nhất vì chặn SV1/SV3).
- [ ] **Mỗi người**: hi-fi các màn của mình (SV2 dùng `design/figma-prompts.md`); thêm frame trạng thái (rỗng / đang tải / lỗi / AI thất bại) và mobile 390px.
- [ ] Cả nhóm thống nhất checklist DONE (mục 5 dưới) thành template task Trello.

### Giai đoạn 2 — Code lát cắt dọc (1,5–2 tuần, ~1–2 ngày/màn)

Vòng lặp cho MỖI màn hình (bắt buộc theo đúng thứ tự):

```text
Kéo task Trello → tạo nhánh feature/<tên-màn>
→ HTML semantic → CSS → JS (tìm kiếm/lọc/validate/modal/toast) → nối api.js → responsive → trạng thái rỗng/tải/lỗi
→ commit chuẩn (feat:/fix:/style:/docs:)
→ push + mở PR vào dev → review chéo → sửa → merge dev
→ quay OBS NGAY (mặt + Figma + code + sửa trực tiếp + chạy thử + commit live + nêu TASK/nhánh/commit)
→ cập nhật README/screen-list + tick DONE
```

Thứ tự của **SV2**: `student-dashboard` → `student-semester-plan` (AI-2) → `student-ai-roadmap` (AI-1) → 4 màn chung (`profile`, `settings`, `notifications`, `404`).
Lý do: dashboard dựng trước để tái sử dụng component; AI-2 dùng chung logic cho cả semester-plan lẫn roadmap; roadmap khó nhất để cuối.

### Giai đoạn 3 — Tích hợp & QA (3–4 ngày)

- [ ] SV3 rà điều hướng 23 màn, link chéo đúng vai trò; 403/404 hoạt động thật (ví dụ: SV mở trang Cố vấn → 403).
- [ ] Cả nhóm test trạng thái + responsive (desktop + 390px) + 2 trình duyệt; sửa lỗi phát hiện.
- [ ] SV2 rà lớp dữ liệu: 7 entity hoạt động, reset seed được, không hard-code rải rác.
- [ ] Hoàn thiện `ai-usage-report.md` + README (bảng 23 màn + link OBS).
- [ ] PR cuối `dev → main` có review đầy đủ.

### Giai đoạn 4 — Chuẩn bị bảo vệ (2 ngày)

- [ ] Mỗi người tự luyện kịch bản chỉnh sửa ngẫu nhiên 5–10 phút: thêm filter, đổi table thành card, thêm field + validation, xử lý API trả về rỗng, đổi layout responsive, thêm trạng thái mới.
- [ ] Kiểm tra chuỗi minh chứng (mục 22 đề bài): Ngữ cảnh → Vấn đề → Mục tiêu → Vai trò → Màn hình → Bản mô phỏng → Công việc → Nhánh → Commit → PR → OBS → Sản phẩm.
- [ ] Tổng duyệt checklist DONE cho cả 23 màn.

## 5. Checklist DONE cho mỗi màn (nội dung checklist con của card Trello)

- [ ] Bản mô phỏng hi-fi + frame trạng thái
- [ ] HTML semantic + CSS hoàn chỉnh + responsive (desktop + 390px)
- [ ] JS tương tác có ý nghĩa (tìm kiếm/lọc/modal/toast) + validate form
- [ ] Dữ liệu lấy từ `js/api.js` / JSON (không hard-code rải rác)
- [ ] Trạng thái rỗng + đang tải + lỗi (khi phù hợp)
- [ ] AI (nếu có): Nhập → đang xử lý → kết quả → "Vì sao?" → Chấp nhận/Sửa/Từ chối/Tạo lại → Lưu + trạng thái thất bại
- [ ] Điều hướng nhất quán + a11y cơ bản (label, alt, focus)
- [ ] PR được duyệt + merge vào `dev`
- [ ] Video OBS đúng chuẩn, tên `SVx-yy-tên-màn.mp4`
- [ ] README + `docs/screen-list.md` cập nhật link OBS

## 6. Rủi ro & lưu ý

- ✅ Đã giải quyết: giảng viên đã duyệt bảng màn + luồng + Figma (2026-10-12).
- **SV3 vẫn gánh nhiều màn nhất** (9 màn + tích hợp) — nếu tiến độ chậm, nhóm chuyển bớt 1 màn Quản trị cho SV1/SV2.
- Tránh commit kiểu `update`, `done`, `final`; tránh spam commit — đề không đánh giá cao.
- AI-2 dùng ngưỡng cảnh báo quá tải **18 tín chỉ** (đã chốt trong `user-flow.html`) — thống nhất trong code.
- Token màu: xanh `#2563EB` + AI tím `#7C3AED` (theo `user-flow.html` + `design/drafts/`) — không dùng màu khác.
- Luồng phản hồi cố vấn → sinh viên hiện không có màn riêng: hiển thị qua trạng thái kế hoạch trên dashboard + `notifications.html` — khi bảo vệ phải giải thích được luồng này.
