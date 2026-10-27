# Phân công nhóm — StudyPath AI (CSE122)

> **Học phần:** Phát triển ứng dụng web cơ bản — BTL-01 StudyPath AI
> **Nhóm:** 3 sinh viên · **Hạn nộp / bảo vệ:** 27/10/2026
> **Cập nhật:** 27/10/2026 · **Kho mã:** `nguyentuan-creator/studypath-ai-cse122` · **Trello:** [lịch trình phân công và làm bài tập LTW](https://trello.com/b/A2ziMN34/lịch-trình-phân-công-và-làm-bài-tập-ltw)
>
> Tài liệu này là **hợp đồng làm việc** của nhóm: hai thoả thuận D1 và D2 ở dưới được chốt tối 23/10 để cả ba thành viên code song song mà không phải chờ nhau.

## 1. Thành viên

| Mã | Họ tên | GitHub | Phụ trách chính | Trách nhiệm xuyên suốt |
|---|---|---|---|---|
| SV1 | Hồ Trung Anh | `trunganhh2530-crypto` | Khách (3 màn) + 5 màn dùng chung | Responsive + kiểm tra giao diện phần mình |
| SV2 | Hứa Đình Kiên | `huadinhkien` | Sinh viên (3 màn) + AI-1, AI-2 | JavaScript / dữ liệu giả lập; giữ `css/base.css` (hệ thống thiết kế) |
| SV3 | Nguyễn Bá Hoàng Tuân | `nguyentuan-creator` | Cố vấn học tập (4) + Quản trị viên (4) + AI-3 | Tích hợp bố cục, điều hướng, phát hành; đánh giá tính nhất quán toàn dự án |

### 1.1. Chốt danh tính commit (áp dụng từ 27/10/2026)

Lịch sử repo đang có 8 danh tính cho 3 thành viên (đổi tên hiển thị và email giữa các máy), khiến GitHub tách đóng góp và giảng viên khó đối chiếu. Từ 27/10, **mỗi người chỉ commit bằng đúng một cặp tên + email** dưới đây:

| Mã | Danh tính commit chuẩn | Tên/email cũ còn trong lịch sử (không dùng nữa) |
|---|---|---|
| SV1 | `Hồ Trung Anh <trunganhh2530@gmail.com>` | `trunganhh2530-crypto` (cùng email) — 3 commit |
| SV2 | `Hứa Đình Kiên <huadinhkien123@gmail.com>` | `huadinhkien` (cùng email) — 7 commit |
| SV3 | `Nguyễn Bá Hoàng Tuân <295372213+nguyentuan-creator@users.noreply.github.com>` | `nguyentuan-creator` (25), `Nguyễn Bá Hoàng Tuân` với email cũ (8), `Nguyễn Tuấn Creator` (19) |

- **Không sửa/rewrite commit cũ.** Lịch sử giữ nguyên; chỉ commit mới dùng danh tính chuẩn.
- Đặt cấu hình theo từng worktree, **không sửa `--global`** để không ảnh hưởng máy mượn:
  ```bash
  git config user.name "Hồ Trung Anh"
  git config user.email "trunganhh2530@gmail.com"
  # SV2: "Hứa Đình Kiên" / "huadinhkien123@gmail.com"
  # SV3: "Nguyễn Bá Hoàng Tuân" / "295372213+nguyentuan-creator@users.noreply.github.com"
  ```
- Email noreply của SV3 gắn trực tiếp với tài khoản GitHub `nguyentuan-creator`; các email cũ vẫn thuộc cùng tài khoản nên không mất đóng góp đã có.
- Commit `5cff2a9` (23/10) của `Phạm Đình Tú <tupham151107@gmail.com>` là chỉnh sửa tài liệu D1/D2 từ ngoài nhóm 3 người — không tính vào phân công, cũng không dùng danh tính này cho commit mới.

## 2. Trạng thái dự án (23/10/2026)

| Chỉ số | Giá trị |
|---|---|
| Màn hình trong bảng kiểm kê | 23 = 9 dùng chung + 3 Khách + 3 Sinh viên + 4 Cố vấn + 4 Quản trị |
| Đã merge vào `dev` | 1 — `pages/login.html` (PR #2) |
| Có code nhưng chưa merge | 6 — `register`, `profile`, `notifications`, `403`, `404`, `visitor-course-catalog` |
| Chưa bắt đầu | 16 |
| Tính năng AI | 0/3 |
| Video OBS | 1/23 — SV1-01 `visitor-course-catalog` |
| `main` | chưa nhận gì từ `dev` sau 04/10 |

## 3. D1 — Hợp đồng schema dữ liệu chung

Ai **tạo** dữ liệu và ai **đọc** dữ liệu đó phải dùng đúng tên field dưới đây. Đổi tên field = trang của người khác sập.

```text
plans.json
  { id, studentId, title, semester, status, createdAt }
    status: draft | submitted | pending | approved | rejected | archived

planItems.json
  { id, planId, courseId, courseName, credits, term }

aiSuggestions.json
  { id, studentId, planId,
    type: "roadmap" | "workload",
    riskLevel: "low" | "medium" | "high",
    confidence: 0..1,
    reasons: [string],                 // phần "vì sao" — đề bài bắt buộc phải có
    recommendedCourses: [id],
    status: "generated" | "accepted" | "edited" | "dismissed" }

advisorFeedback.json
  { id, planId, advisorId, studentId, message, createdAt,
    state: "draft" | "sent" | "read" }
```

### Quyền sở hữu file dữ liệu

Quy tắc: **chủ sở hữu được sửa, người khác chỉ đọc.** Nhờ đó ba thành viên không bao giờ xung đột trên cùng một file.

| Tệp trong `assets/data/` | Chủ sở hữu | Chỉ đọc |
|---|---|---|
| `users.json` | SV1 | SV2, SV3 |
| `courses.json` | SV1 | SV3 |
| `notifications.json` | SV1 | SV3 |
| `plans.json`, `planItems.json` | SV2 | SV1, SV3 |
| `aiSuggestions.json` | SV2 | SV3 |
| `advisorFeedback.json`, `advisor-students.json` | SV3 | — |
| `admin-courses.json`, `programs.json` | SV3 | — |

SV3 **không** sửa `courses.json` của SV1; trang `admin-course-management.html` dùng `admin-courses.json` riêng.

## 4. D2 — Hợp đồng tên tệp và vai trò được truy cập

Toàn bộ trang đặt trong `pages/`, tên phải đúng từng ký tự. `login.html` chuyển hướng theo `role`, nên sai một ký tự là 404.

| Vai trò được vào | Tệp trong `pages/` |
|---|---|
| khách | `index.html`, `login.html`, `register.html`, `forgot-password.html` |
| khách | `visitor-course-catalog.html`, `visitor-course-detail.html`, `visitor-sample-roadmaps.html` |
| `student` | `student-dashboard.html`, `student-semester-plan.html`, `student-ai-roadmap.html` |
| `advisor` | `advisor-dashboard.html`, `advisor-student-plan-review.html`, `advisor-feedback-management.html`, `advisor-students.html` |
| `admin` | `admin-dashboard.html`, `admin-course-management.html`, `admin-program-settings.html`, `admin-user-management.html` |
| mọi vai trò đã đăng nhập | `profile.html`, `settings.html`, `notifications.html`, `403.html`, `404.html` |

- Ai làm xong trang nào thì **tự thêm link điều hướng vào trang của mình**, không sửa tệp của người khác.
- Trang chưa làm thì **chưa được link tới** — không để liên kết chết khi bảo vệ.

## 5. Ba luật kỹ thuật

1. Nhánh tính năng cắt từ `dev`, tên `feature/<tên-màn-hình>`; tài liệu dùng `docs/<tên>`; sửa lỗi dùng `fix/<tên>`. Không cắt nhánh từ `main`.
2. **Không sửa tệp chung của người khác:** CSS mỗi màn ở `css/<màn>.css`, JS ở `js/modules/<màn>.js`, dữ liệu ở `assets/data/<màn>.json`. Chỉ `css/base.css` dùng chung và chỉ SV2 được sửa. Muốn lấy code người khác: `git merge dev` vào **nhánh của mình**, giải conflict ở nhánh mình rồi mới mở PR.
3. Mỗi màn hình = **1 nhánh = 1 PR = 1 video OBS**, quay trong ngày hôm đó. Chính tác giả mở PR, một thành viên khác duyệt và bấm merge.

## 6. Nguyên tắc

- Mỗi thành viên tự hoàn thành ít nhất một lát cắt dọc end-to-end:
  `Figma/Canva → HTML → CSS → JS → dữ liệu → responsive → nhánh Git → commit → PR → OBS`.
- Không tách vai trò kiểu "một người chỉ làm tài liệu, một người chỉ HTML, một người chỉ JS".
- Đánh giá chéo: SV2 review PR của SV1 hoặc SV3; SV3 đánh giá tính nhất quán toàn dự án.
- Commit theo chuẩn `feat:` / `fix:` / `style:` / `refactor:` / `docs:`. Không dùng `update`, `done`, `final`, `fix code`.
- PR chỉ merge khi: chạy được qua HTTP server, responsive ở 375px, có trạng thái rỗng và lỗi, console không báo đỏ, video OBS đã quay.
- Mọi trang có dữ liệu phải chạy qua HTTP server (`js/api.js` dùng `fetch`); mở bằng `file://` sẽ hỏng.

## 7. Ba lane song song

**SV1 — Hồ Trung Anh (Khách + xác thực)**
1. `register`: giải conflict CSS, mở PR, merge
2. `index.html` — landing, cổng vào của cả nhóm
3. `visitor-course-detail.html` + video
4. `visitor-sample-roadmaps.html` + video
5. `notifications`, `403`, `404`: giải conflict, PR, video
6. `forgot-password.html`, `settings.html` — hoãn được

**SV2 — Hứa Đình Kiên (Sinh viên + AI-1, AI-2)**
1. `profile`: dời `profile.html` → `pages/`, `js/profile.js` → `js/modules/`, mở PR
2. `student-dashboard.html` + video
3. `student-semester-plan.html` + **AI-2 Workload Risk** + video
4. `student-ai-roadmap.html` + **AI-1 Roadmap Recommender** + video
5. `settings.html` — hoãn được

**SV3 — Nguyễn Bá Hoàng Tuân (Cố vấn + Quản trị + AI-3)**
1. `advisor-dashboard.html` + video `SV3-01` — mở khoá demo đăng nhập role advisor
2. `advisor-student-plan-review.html` + **AI-3 Advisor Copilot** + video `SV3-02`
3. `admin-course-management.html` + video `SV3-03`
4. `admin-dashboard.html` + video `SV3-04` — mở khoá demo đăng nhập role admin
5. `advisor-feedback-management.html` + video `SV3-05`
6. `advisor-students.html` + video `SV3-06`
7. `admin-program-settings.html`, `admin-user-management.html` — hoãn được, phải ghi lý do vào `screen-list.md`

## 8. Lịch 4 ngày

| Ngày | SV1 Trung Anh | SV2 Kiên | SV3 Tuân |
|---|---|---|---|
| 23/10 | Giải conflict `register` → PR; mở PR `404` | Dời `profile` vào `pages/` + `js/modules/` → PR | Review + merge PR của SV1, SV2; dựng `feature/advisor-dashboard` |
| 24/10 | PR `notifications`, `403`; làm `index.html` | `student-dashboard` + video SV2-01 | Xong `advisor-dashboard` + video SV3-01 |
| 25/10 | `visitor-course-detail` + video SV1-02 | `student-semester-plan` + AI-2 + video SV2-02 | `advisor-student-plan-review` + AI-3 + video SV3-02 |
| 26/10 | `visitor-sample-roadmaps` + video SV1-03 | `student-ai-roadmap` + AI-1 + video SV2-03 | `admin-course-management`, `admin-dashboard` + video SV3-03/04 |
| 27/10 sáng | Chốt `docs/screen-list.md` | Viết phần AI-1, AI-2 vào `ai-usage-report.md` | Test tích hợp; README + link OBS; merge `dev` → `main` |

### Điểm gặp mặt

| Mốc | Nội dung | Ai | Thời lượng |
|---|---|---|---|
| 23/10 tối | Chốt D1 + D2 | Cả 3 | 45 phút |
| 24/10 sáng | Review chéo: SV2 duyệt SV1, SV1 duyệt SV3, SV3 duyệt SV2 | Cặp đôi | 15 phút |
| 25/10 tối | Test chéo vai trò: SV1 đăng nhập role advisor/admin test trang SV3; SV3 test trang SV2 | Cặp đôi | 30 phút |
| 26/10 tối | Freeze code, gộp tài liệu, merge `dev` → `main` | SV3 | 60 phút |

## 9. Rủi ro đang mở

| Rủi ro | Hậu quả khi chấm | Xử lý |
|---|---|---|
| `main` chưa nhận gì từ 04/10 | Giảng viên mở repo chỉ thấy tài liệu cũ | Bắt buộc merge `dev` → `main` sáng 27/10 |
| 1 PR / 23 màn | Mất điểm thành phần quy trình | Mỗi màn đúng 1 nhánh 1 PR; PR #2 là chuẩn mẫu |
| 3/3 AI chưa bắt đầu | Mất điểm phần sáng tạo | AI-3 làm 25/10; AI-1, AI-2 làm 25–26/10 |
| 6 màn có code chưa merge | Không test được luồng end-to-end, conflict tăng theo thời gian | Chủ branch `git merge dev` vào nhánh mình trong 23–24/10 |
| Chưa có auth guard | Vai trò nào cũng mở được trang vai trò khác; `403.html` thành trang vô nghĩa | SV2 hoặc SV3 viết `js/modules/auth-guard.js` dùng chung |
| Trang đích của `login.html` chưa tồn tại | Đăng nhập advisor/admin rơi vào 404 | SV3 làm `advisor-dashboard`, SV2 làm `student-dashboard` sớm nhất |

## 10. Quy ước video OBS

- Tên tệp: `SV3-01-advisor-dashboard.mp4`. Kênh YouTube chế độ Unlisted. Dán link vào `README.md` mục *Video OBS* và vào mô tả PR.
- Sáu nhịp bắt buộc: (1) mặt sinh viên + mã công việc/nhánh/màn hình → (2) mở Figma cạnh bản chạy thật → (3) mở HTML/CSS/JS giải thích bố cục và luồng dữ liệu → (4) demo tương tác, cho thấy trạng thái rỗng và lỗi → (5) sửa trực tiếp một thay đổi nhỏ rồi chạy lại → (6) `git commit && git push`, mở GitHub chỉ mặt commit.
- Phóng to chữ trong editor trước khi quay; quay một mạch, không cắt ghép.
