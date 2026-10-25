# Danh sách task Trello — StudyPath AI (CSE122)

> Cập nhật 2026-10-12: đổi sang mã TASK-xx. Nguồn: `docs/screen-list.md` (23 màn, giảng viên đã duyệt) + `docs/roadmap.md`.
> Nguyên tắc: **1 màn hình = 1 task = 1 lát cắt dọc hoàn chỉnh** (mục 7 đề bài): Bản mô phỏng → HTML → CSS → JS → Dữ liệu → Responsive → Nhánh Git → Commit → PR → Review → Merge → OBS → README.
> **Tổng 32 task** = 6 chuẩn bị + 23 màn hình + 3 hoàn thiện.
> Lưu ý: mã thẻ Trello = TASK-xx; tên file OBS vẫn theo mục 17 đề: `SVx-yy-tên-màn.mp4` (yy = số thứ tự màn của từng ngưới).

---

## 1. Khởi tạo bảng (làm 1 lần)

- **Tên bảng:** StudyPath AI — CSE122 (nhóm 3)
- **5 cột:** `Tồn đọng` → `Cần làm` → `Đang làm` → `Chờ duyệt` → `Hoàn thành`
- **Nhãn:** `SV1` `SV2` `SV3` `Hạ tầng` `AI-1` `AI-2` `AI-3` `QA` `Tài liệu`

**Quy tắc luồng cột:**
1. Thẻ mới → `Tồn đọng` (đang chờ hạ tầng/màn trước) hoặc `Cần làm` (làm được ngay).
2. Bắt đầu làm (tạo nhánh) → kéo sang `Đang làm`.
3. Push + mở PR vào `dev` → kéo sang `Chờ duyệt`.
4. Merge + quay xong OBS + cập nhật README → kéo sang `Hoàn thành`.

**Quy tắc thẻ:**
- Mỗi thẻ có: mã TASK, tệp/màn, ngườI, hạn, nhánh, link PR (dán khi mở), link OBS (dán khi quay).
- **Không xóa thẻ** — lịch sử bảng là minh chứng (mục 16 đề bài).

---

## 2. Checklist mẫu

### Lát cắt dọc chung (T1–T13) — tạo 1 lần trên thẻ TASK-07, các thẻ màn sau dùng "Copy items from"

- [ ] T1. Bản mô phỏng Figma khớp màn (prompt có sẵn trong `design/figma-prompts.md`) + frame trạng thái + mobile 390px
- [ ] T2. HTML semantic, đúng tên tệp
- [ ] T3. CSS đúng token chung `css/style.css` (xanh `#2563EB`, AI tím `#7C3AED` — không dùng màu lạ)
- [ ] T4. Responsive: desktop + 390px
- [ ] T5. JS tương tác có ý nghĩa theo đặc thù màn (tìm kiếm/lọc/modal/toast…)
- [ ] T6. Kiểm tra hợp lệ form (màn có form)
- [ ] T7. Dữ liệu lấy từ `js/api.js` / `assets/data/*.json` — không hard-code
- [ ] T8. Trạng thái: rỗng + đang tải + lỗi (+ trạng thái nghiệp vụ riêng)
- [ ] T9. a11y cơ bản: label, alt, focus
- [ ] T10. Commit chuẩn (`feat:` / `fix:` / `style:` — không "update/final") + push nhánh + mở PR vào `dev`
- [ ] T11. Được review chéo + merge vào `dev`
- [ ] T12. Quay OBS đúng chuẩn: mặt + Figma + code + sửa trực tiếp + commit live + đọc rõ mã task/nhánh/commit
- [ ] T13. Cập nhật README + `docs/screen-list.md` (link OBS)

### Luồng AI (A1–A7) — chỉ gắn thêm cho TASK-08, TASK-09, TASK-22

- [ ] A1. NgườI dùng nhập dữ liệu + validate trước khi gọi AI
- [ ] A2. Trạng thái "AI đang xử lý" (spinner/skeleton)
- [ ] A3. Kết quả AI hiển thị có cấu trúc (không phải text thô)
- [ ] A4. Nút **"Vì sao?"** — giải thích lý do/yếu tố ảnh hưởng
- [ ] A5. NgườI dùng kiểm soát: **Chấp nhận / Sửa / Từ chối / Tạo lại**
- [ ] A6. Lưu kết quả vào trạng thái ứng dụng (`aiSuggestions` + `plans`/`planItems`)
- [ ] A7. Trạng thái AI thất bại ("không đủ dữ liệu" / "chưa chắc chắn" / "không thể xử lý") + Thử lại / Bỏ qua / Dùng thủ công

---

## 3. Bảng tổng hợp 32 task (tick khi đã tạo thẻ trên Trello)

| # | Mã | Nội dung | NgườI | Hạn gợi ý | Cột bắt đầu |
|---:|---|---|---|---|---|
| 1 | TASK-01 | Tạo bảng Trello + dán link vào README | SV2 | 14/10 | Đang làm |
| 2 | TASK-02 | Luyện quy trình Git: nhánh cá nhân + PR đầu (cả 3) | Cả nhóm | 14/10 | Cần làm |
| 3 | TASK-03 | Lớp dữ liệu giả lập `js/api.js` + JSON (7 entity) | SV2 | 15/10 | Cần làm |
| 4 | TASK-04 | Khung CSS chung `css/style.css` | SV2 | 15/10 | Cần làm |
| 5 | TASK-05 | Hi-fi 3 màn Sinh viên | SV2 | 17/10 | Cần làm |
| 6 | TASK-06 | Hi-fi phần còn lại (SV1: 7 màn, SV3: 9 màn) | SV1 + SV3 | 26/10 | Cần làm |
| 7 | TASK-07 | `student-dashboard.html` — Dashboard (Sinh viên) | SV2 | 18/10 | Tồn đọng |
| 8 | TASK-08 | `student-semester-plan.html` — Semester Plan (AI-2) | SV2 | 20/10 | Tồn đọng |
| 9 | TASK-09 | `student-ai-roadmap.html` — AI Roadmap (AI-1+AI-2) | SV2 | 23/10 | Tồn đọng |
| 10 | TASK-10 | `profile.html` — Profile | SV2 | 25/10 | Tồn đọng |
| 11 | TASK-11 | `settings.html` — Settings | SV2 | 26/10 | Tồn đọng |
| 12 | TASK-12 | `notifications.html` — Notifications | SV2 | 27/10 | Tồn đọng |
| 13 | TASK-13 | `404.html` — Not Found | SV2 | 28/10 | Tồn đọng |
| 14 | TASK-14 | `index.html` — Landing | SV1 | 17/10 | Tồn đọng |
| 15 | TASK-15 | `login.html` — Login | SV1 | 19/10 | Tồn đọng |
| 16 | TASK-16 | `register.html` — Register | SV1 | 20/10 | Tồn đọng |
| 17 | TASK-17 | `forgot-password.html` — Forgot Password | SV1 | 21/10 | Tồn đọng |
| 18 | TASK-18 | `visitor-course-catalog.html` — Course Catalog | SV1 | 23/10 | Tồn đọng |
| 19 | TASK-19 | `visitor-course-detail.html` — Course Detail | SV1 | 25/10 | Tồn đọng |
| 20 | TASK-20 | `visitor-sample-roadmaps.html` — Sample Roadmaps | SV1 | 27/10 | Tồn đọng |
| 21 | TASK-21 | `advisor-dashboard.html` — Dashboard (Cố vấn) | SV3 | 18/10 | Tồn đọng |
| 22 | TASK-22 | `advisor-student-plan-review.html` — Review (AI-3) | SV3 | 21/10 | Tồn đọng |
| 23 | TASK-23 | `advisor-feedback-management.html` — Feedback | SV3 | 23/10 | Tồn đọng |
| 24 | TASK-24 | `advisor-students.html` — Student Profiles | SV3 | 25/10 | Tồn đọng |
| 25 | TASK-25 | `admin-dashboard.html` — Dashboard (Admin) | SV3 | 26/10 | Tồn đọng |
| 26 | TASK-26 | `admin-course-management.html` — Course Mgmt | SV3 | 27/10 | Tồn đọng |
| 27 | TASK-27 | `admin-program-settings.html` — Program Settings | SV3 | 28/10 | Tồn đọng |
| 28 | TASK-28 | `admin-user-management.html` — User Mgmt | SV3 | 29/10 | Tồn đọng |
| 29 | TASK-29 | `403.html` — Forbidden | SV3 | 30/10 | Tồn đọng |
| 30 | TASK-30 | Tích hợp & QA toàn nhóm (GĐ3) | SV3 chủ trì | 01/11 | Tồn đọng |
| 31 | TASK-31 | Hoàn thiện `docs/ai-usage-report.md` | Cả nhóm | 01/11 | Tồn đọng |
| 32 | TASK-32 | PR cuối `dev → main` + README tổng hợp | SV3 chủ trì | 03/11 | Tồn đọng |

> Hạn là **gợi ý** — nhóm họp điều chỉnh thoải mái.

---

## 4. Chi tiết từng task (nội dung dán vào Trello)

### A. Chuẩn bị trước khi code (TASK-01 → TASK-06)

#### TASK-01 · Tạo bảng Trello + dán link vào README
`NgườI: SV2 Kiên · Hạn: 14/10 · Nhãn: Tài liệu · Cột: Đang làm · Nhánh: dev-kien`
- Tạo bảng 5 cột theo mục 1; tạo đủ 32 thẻ theo mục 3; dán link bảng + bảng phân công vào README.
- Checklist riêng: [ ] Board 5 cột + 9 nhãn [ ] Đủ 32 thẻ [ ] Link Trello trong README [ ] Commit + PR + merge

#### TASK-02 · Luyện quy trình Git: nhánh cá nhân + PR đầu tiên (cả 3 ngườI)
`NgườI: Cả nhóm · Hạn: 14/10 · Nhãn: Tài liệu · Cột: Cần làm`
- Mỗi ngườI: `git checkout dev && git pull` → tạo nhánh cá nhân (`dev-anh`, `dev-tuan`; `dev-kien` đã có) → 1 commit nhỏ chuẩn → push → PR vào `dev` → nhờ ngườI khác review → merge.
- Checklist riêng: [ ] `dev-anh` + PR đầu (Anh) [ ] `dev-tuan` + PR đầu (Tuân) [ ] PR docs của `dev-kien` đã merge [ ] Mỗi PR đều có review chéo

#### TASK-03 · Lớp dữ liệu giả lập — `js/api.js` + `assets/data/*.json`
`NgườI: SV2 Kiên · Hạn: 15/10 · Nhãn: Hạ tầng · Cột: Cần làm · Nhánh: feature/shared-foundation — ƯU TIÊN SỐ 1, chặn cả nhóm`
- Mock CRUD 7 entity (`users, courses, programs, plans, planItems, advisorFeedback, aiSuggestions`) trên LocalStorage; seed từ JSON; hàm chung list/get/create/update/remove/`resetSeed()`; tuỳ chọn độ trễ giả lập để demo "đang tải"; không hard-code trong pages.
- Checklist riêng: [ ] 7 file JSON seed [ ] CRUD đủ 7 entity [ ] `resetSeed()` [ ] Thử gọi API qua console [ ] PR + review + merge cho cả nhóm dùng

#### TASK-04 · Khung CSS chung — `css/style.css` + `css/responsive.css`
`NgườI: SV2 Kiên · Hạn: 15/10 · Nhãn: Hạ tầng · Cột: Cần làm · Nhánh: feature/shared-foundation — ƯU TIÊN SỐ 1, chặn cả nhóm`
- Tokens: xanh `#2563EB`, AI tím `#7C3AED`, slate `#0F172A`/`#64748B`, Inter/Segoe UI, lưới 8px, radius, shadow.
- Components: topbar/header, sidebar, card, button (thường + AI), badge trạng thái, table, form, modal, toast, skeleton, empty-state, error-state; `responsive.css`: breakpoints chung.
- Checklist riêng: [ ] Tokens [ ] ≥10 component [ ] responsive.css breakpoints [ ] PR + review + merge cho cả nhóm dùng

#### TASK-05 · Hi-fi 3 màn Sinh viên
`NgườI: SV2 Kiên · Hạn: 17/10 · Nhãn: SV2 · Cột: Cần làm · Phụ thuộc: không`
- `student-dashboard.html`, `student-semester-plan.html`, `student-ai-roadmap.html` — dùng prompt có sẵn trong `design/figma-prompts.md`.
- Checklist riêng: [ ] Đủ 3 màn [ ] Frame trạng thái rỗng/đang tải/lỗi (+ AI cho 2 màn AI) [ ] Mobile 390px

#### TASK-06 · Hi-fi phần còn lại
`NgườI: SV1 Anh (7 màn) + SV3 Tuân (9 màn) · Hạn: 26/10 · Nhãn: SV1, SV3 · Cột: Cần làm`
- Song song trong GĐ1. Anh xong ≤24/10, Tuân xong ≤26/10.
- Checklist riêng: [ ] Đủ số màn phụ trách [ ] Frame trạng thái [ ] Mobile 390px

### B. Lát cắt màn hình — SV2 Hứa Đình Kiên (TASK-07 → TASK-13)

#### TASK-07 · `student-dashboard.html` — Dashboard (Sinh viên)
`NgườI: SV2 Kiên · Hạn: 18/10 · Nhãn: SV2, AI-2 · Cột: Tồn đọng · Nhánh: feature/student-dashboard · Phụ thuộc: TASK-03, TASK-04, TASK-05`
- **Lát cắt:** T1–T13 | **OBS:** `SV2-01-student-dashboard.mp4`
- **Đặc thù:** R — tiến độ tín chỉ theo học kỳ, kế hoạch hiện tại + trạng thái phê duyệt (chờ/đã duyệt/bị từ chối), cảnh báo quá tải AI-2, phản hồi mới từ cố vấn, lối vào 2 màn kế hoạch. Render từ `api.js`; skeleton; rỗng "chưa có kế hoạch" → CTA sang semester-plan; lỗi tải → thử lại; biểu đồ thanh CSS; badge AI-2 đúng token.

#### TASK-08 · `student-semester-plan.html` — Semester Plan (AI-2)
`NgườI: SV2 Kiên · Hạn: 20/10 · Nhãn: SV2, AI-2 · Cột: Tồn đọng · Nhánh: feature/student-semester-plan · Phụ thuộc: TASK-03, TASK-04, TASK-05`
- **Lát cắt:** T1–T13 + A1–A7 | **OBS:** `SV2-02-student-semester-plan.mp4`
- **Đặc thù:** C/R/U — chọn học kỳ, thêm/xóa học phần (`planItems`), bảng tổng tín chỉ, validate (trùng môn, thiếu tiên quyết), nút "Gửi cố vấn" (→ chờ duyệt). AI-2: nút "Kiểm tra quá tải" → luồng AI đầy đủ; ngưỡng cảnh báo **18 tín chỉ**; giải thích yếu tố rủi ro; lưu `aiSuggestions`. Rỗng (chưa thêm môn) + lỗi AI "không đủ dữ liệu".

#### TASK-09 · `student-ai-roadmap.html` — AI Roadmap (AI-1 + AI-2)
`NgườI: SV2 Kiên · Hạn: 23/10 · Nhãn: SV2, AI-1, AI-2 · Cột: Tồn đọng · Nhánh: feature/student-ai-roadmap · Phụ thuộc: TASK-03, TASK-04, TASK-05, TASK-08`
- **Lát cắt:** T1–T13 + A1–A7 | **OBS:** `SV2-03-student-ai-roadmap.mp4`
- **Đặc thù:** C/R/U/D — form mục tiêu nghề nghiệp + quỹ thờI gian → AI-1 đề xuất lộ trình nhiều học kỳ (timeline); Chấp nhận (lưu `plans`/`planItems`) / Sửa / Từ chối / Tạo lại; quản lý lộ trình đã lưu (xóa/lưu trữ); AI-2 cảnh báo kỳ nào > 18 TC. Màn khó nhất — làm sau TASK-07/08. AI thất bại: "chưa chắc chắn"/"không thể xử lý" + Thử lại/Dùng thủ công.

#### TASK-10 · `profile.html` — Profile
`NgườI: SV2 Kiên · Hạn: 25/10 · Nhãn: SV2 · Cột: Tồn đọng · Nhánh: feature/profile · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV2-04-profile.mp4`
- **Đặc thù:** R/U — xem/sửa hồ sơ (tên, email, MSSV, ngành); validate email + trường bắt buộc; toast thành công; trạng thái tải/lỗi.

#### TASK-11 · `settings.html` — Settings
`NgườI: SV2 Kiên · Hạn: 26/10 · Nhãn: SV2 · Cột: Tồn đọng · Nhánh: feature/settings · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV2-05-settings.mp4`
- **Đặc thù:** R/U — cài đặt thông báo, ngôn ngữ, (tuỳ chọn sáng/tối), form đổi mật khẩu (độ mạnh, xác nhận); lưu vào `users`/LocalStorage.

#### TASK-12 · `notifications.html` — Notifications
`NgườI: SV2 Kiên · Hạn: 27/10 · Nhãn: SV2 · Cột: Tồn đọng · Nhánh: feature/notifications · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV2-06-notifications.mp4`
- **Đặc thù:** R/U — danh sách thông báo (từ `advisorFeedback` + kết quả duyệt kế hoạch); lọc chưa đọc/đã đọc; đánh dấu đã đọc (từng cái + tất cả); rỗng "không có thông báo".

#### TASK-13 · `404.html` — Not Found
`NgườI: SV2 Kiên · Hạn: 28/10 · Nhãn: SV2 · Cột: Tồn đọng · Nhánh: feature/404 · Phụ thuộc: TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV2-07-404.mp4`
- **Đặc thù:** R — trang lỗi 404 + minh họa + nút về trang phù hợp; dùng thật khi id sai (vd: `visitor-course-detail.html?id=sai`).

### C. Lát cắt màn hình — SV1 Hồ Trung Anh (TASK-14 → TASK-20)

#### TASK-14 · `index.html` — Landing
`NgườI: SV1 Anh · Hạn: 17/10 · Nhãn: SV1 · Cột: Tồn đọng · Nhánh: feature/index · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV1-01-index.mp4`
- **Đặc thù:** R — hero giới thiệu StudyPath AI, 4 vai trò, khối tính năng AI, CTA đăng nhập/khám phá; nav mobile.

#### TASK-15 · `login.html` — Login
`NgườI: SV1 Anh · Hạn: 19/10 · Nhãn: SV1 · Cột: Tồn đọng · Nhánh: feature/login · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV1-02-login.mp4`
- **Đặc thù:** form + validate; 4 nút "vào nhanh theo vai trò" demo → điều hướng dashboard tương ứng; lỗi sai thông tin; link quên mật khẩu/đăng ký.

#### TASK-16 · `register.html` — Register
`NgườI: SV1 Anh · Hạn: 20/10 · Nhãn: SV1 · Cột: Tồn đọng · Nhánh: feature/register · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV1-03-register.mp4`
- **Đặc thù:** C — form (tên, email, mật khẩu ≥8, xác nhận); validate realtime; kiểm tra trùng email; thành công → ghi `users` + toast → login.

#### TASK-17 · `forgot-password.html` — Forgot Password
`NgườI: SV1 Anh · Hạn: 21/10 · Nhãn: SV1 · Cột: Tồn đọng · Nhánh: feature/forgot-password · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV1-04-forgot-password.mp4`
- **Đặc thù:** R/U — nhập email → kiểm tra tồn tại → "đang xử lý" → thông báo đã gửi; lỗi email không tồn tại.

#### TASK-18 · `visitor-course-catalog.html` — Course Catalog
`NgườI: SV1 Anh · Hạn: 23/10 · Nhãn: SV1 · Cột: Tồn đọng · Nhánh: feature/visitor-course-catalog · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV1-05-visitor-course-catalog.mp4`
- **Đặc thù:** R — danh sách từ `courses.json`; tìm kiếm mã/tên; lọc khoa + tín chỉ + học kỳ; sắp xếp; phân trang/"xem thêm"; rỗng khi lọc; link sang detail.

#### TASK-19 · `visitor-course-detail.html` — Course Detail
`NgườI: SV1 Anh · Hạn: 25/10 · Nhãn: SV1 · Cột: Tồn đọng · Nhánh: feature/visitor-course-detail · Phụ thuộc: TASK-03, TASK-04, TASK-18`
- **Lát cắt:** T1–T13 | **OBS:** `SV1-06-visitor-course-detail.mp4`
- **Đặc thù:** C/R/U — đọc `?id=`; thông tin HP + tiên quyết + kỹ năng; "quan tâm" (C) + ghi chú cá nhân (U) vào LocalStorage; id sai → UI lỗi kiểu 404.

#### TASK-20 · `visitor-sample-roadmaps.html` — Sample Roadmaps
`NgườI: SV1 Anh · Hạn: 27/10 · Nhãn: SV1 · Cột: Tồn đọng · Nhánh: feature/visitor-sample-roadmaps · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV1-07-visitor-sample-roadmaps.mp4`
- **Đặc thù:** C/R/U/D — thư viện lộ trình mẫu; clone "Lộ trình của tôi" (C), sửa (U), xóa có xác nhận (D); lọc theo ngành/nghề; rỗng.

### D. Lát cắt màn hình — SV3 Nguyễn Bá Hoàng Tuân (TASK-21 → TASK-29)

#### TASK-21 · `advisor-dashboard.html` — Dashboard (Cố vấn)
`NgườI: SV3 Tuân · Hạn: 18/10 · Nhãn: SV3, AI-2 · Cột: Tồn đọng · Nhánh: feature/advisor-dashboard · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-01-advisor-dashboard.mp4`
- **Đặc thù:** R — số SV phụ trách, hàng đợi kế hoạch chờ duyệt, cảnh báo AI-2 (SV vượt 18 TC), phản hồi gần đây; link sang review/students. Tham khảo `design/drafts/advisor-dashboard.html`.

#### TASK-22 · `advisor-student-plan-review.html` — Student Plan Review (AI-3)
`NgườI: SV3 Tuân · Hạn: 21/10 · Nhãn: SV3, AI-3 · Cột: Tồn đọng · Nhánh: feature/advisor-student-plan-review · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 + A1–A7 | **OBS:** `SV3-02-advisor-student-plan-review.mp4`
- **Đặc thù:** C/R/U — chọn SV → xem kế hoạch (bảng `planItems`) → Duyệt / Yêu cầu sửa / Từ chối (ghi `advisorFeedback`); AI-3 Copilot: tóm tắt kế hoạch + gợi ý câu hỏi cố vấn; thất bại: "không đủ dữ liệu".

#### TASK-23 · `advisor-feedback-management.html` — Feedback Management
`NgườI: SV3 Tuân · Hạn: 23/10 · Nhãn: SV3 · Cột: Tồn đọng · Nhánh: feature/advisor-feedback-management · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-03-advisor-feedback-management.mp4`
- **Đặc thù:** C/R/U/D — bảng phản hồi; tạo/sửa/xóa (hoặc lưu trữ) kèm xác nhận; lọc theo SV/trạng thái; tìm kiếm.

#### TASK-24 · `advisor-students.html` — Student Profiles
`NgườI: SV3 Tuân · Hạn: 25/10 · Nhãn: SV3, AI-2 · Cột: Tồn đọng · Nhánh: feature/advisor-students · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-04-advisor-students.mp4`
- **Đặc thù:** R — danh sách SV phụ trách; cột mức rủi ro học kỳ (badge AI-2: an toàn/cảnh báo/quá tải); tìm kiếm/lọc theo rủi ro; mở kế hoạch của SV.

#### TASK-25 · `admin-dashboard.html` — Dashboard (Admin)
`NgườI: SV3 Tuân · Hạn: 26/10 · Nhãn: SV3 · Cột: Tồn đọng · Nhánh: feature/admin-dashboard · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-05-admin-dashboard.mp4`
- **Đặc thù:** R — thống kê: users theo vai trò, số courses/programs, biểu đồ CSS, hoạt động gần đây; trạng thái rỗng/tải.

#### TASK-26 · `admin-course-management.html` — Course Management
`NgườI: SV3 Tuân · Hạn: 27/10 · Nhãn: SV3 · Cột: Tồn đọng · Nhánh: feature/admin-course-management · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-06-admin-course-management.mp4`
- **Đặc thù:** C/R/U — bảng học phần; thêm/sửa qua modal + validate (mã duy nhất, tín chỉ 1–6); lưu trữ thay xóa; tìm kiếm/lọc.

#### TASK-27 · `admin-program-settings.html` — Program Settings
`NgườI: SV3 Tuân · Hạn: 28/10 · Nhãn: SV3 · Cột: Tồn đọng · Nhánh: feature/admin-program-settings · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-07-admin-program-settings.mp4`
- **Đặc thù:** C/R/U/D — CRUD chương trình; cấu hình tổng tín chỉ + ngưỡng cảnh báo (18 TC); gán học phần vào chương trình; validate.

#### TASK-28 · `admin-user-management.html` — User Management
`NgườI: SV3 Tuân · Hạn: 29/10 · Nhãn: SV3 · Cột: Tồn đọng · Nhánh: feature/admin-user-management · Phụ thuộc: TASK-03, TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-08-admin-user-management.mp4`
- **Đặc thù:** C/R/U/D — CRUD ngườI dùng; gán cố vấn–sinh viên; khóa/mở tài khoản (thay xóa); reset mật khẩu mô phỏng; lọc theo vai trò.

#### TASK-29 · `403.html` — Forbidden
`NgườI: SV3 Tuân · Hạn: 30/10 · Nhãn: SV3 · Cột: Tồn đọng · Nhánh: feature/403 · Phụ thuộc: TASK-04`
- **Lát cắt:** T1–T13 | **OBS:** `SV3-09-403.mp4`
- **Đặc thù:** R — trang không đủ quyền + CTA về trang đúng vai trò; **hoạt động thật**: sinh viên mở trang cố vấn/admin → chuyển hướng 403.

### E. Hoàn thiện (TASK-30 → TASK-32)

#### TASK-30 · Tích hợp & QA toàn nhóm
`NgườI: SV3 Tuân chủ trì + cả nhóm · Hạn: 01/11 · Nhãn: QA · Cột: Tồn đọng · Phụ thuộc: TASK-07 → TASK-29`
- Rà điều hướng 23 màn + link chéo đúng vai trò; 403/404 hoạt động thật; test desktop + 390px + 2 trình duyệt; rà 7 entity + `resetSeed()`; mỗi lỗi → nhánh `fix/<tên-lỗi>` riêng.
- Checklist riêng: [ ] Điều hướng đủ 23 màn [ ] 403/404 thật [ ] 2 trình duyệt + 390px [ ] Lớp dữ liệu OK [ ] Danh sách bug đã xử lý

#### TASK-31 · Hoàn thiện `docs/ai-usage-report.md`
`NgườI: Cả 3 thành viên (SV3 chủ trì) · Hạn: 01/11 · Nhãn: Tài liệu · Cột: Tồn đọng`
- Mỗi ngườI điền phần mình: công cụ AI đã dùng, prompt chính, phần AI sinh ra, phần tự sửa, lỗi AI, cách kiểm chứng, bài học, tính năng mock vs API thật.
- Checklist riêng: [ ] SV1 xong phần mình [ ] SV2 xong phần mình [ ] SV3 xong phần mình + tổng hợp

#### TASK-32 · PR cuối `dev → main` + README tổng hợp
`NgườI: SV3 Tuân chủ trì · Hạn: 03/11 · Nhãn: Tài liệu, QA · Cột: Tồn đọng · Phụ thuộc: TASK-30, TASK-31`
- README: bảng 23 màn + link OBS từng màn + link Trello; PR `dev → main` có review đầy đủ; kiểm tra chuỗi minh chứng mục 22 đề bài.
- Checklist riêng: [ ] README đủ bảng + links [ ] PR dev→main merged [ ] Chuỗi minh chứng đủ 23 màn
