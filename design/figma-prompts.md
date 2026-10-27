# Prompt Figma cho vai trò Sinh viên (SV2)

> Cách dùng: mở Figma → dùng tính năng **First Draft / Generate design with AI**, dán khối STYLE dùng chung + prompt của từng màn hình. Sinh từng màn một, sau đó tự chỉnh lại cho khớp design system của nhóm (màu, font, spacing).
> Sau khi duyệt wireframe, chuyển sang bản mô phỏng high-fidelity desktop (1440px) + mobile (390px), và bổ sung frame trạng thái (rỗng / đang tải / lỗi / AI đang xử lý) cho mỗi màn.

---

## Khối STYLE dùng chung (dán trước mỗi prompt)

```text
Style: modern EdTech web app, clean and minimal, white background,
blue (#2563EB) primary color, slate gray text (#0F172A / #64748B),
rounded 10-14px cards, soft shadows, 8px spacing grid,
Inter / Segoe UI font. AI accents in purple (#7C3AED).
Web dashboard layout with a left sidebar navigation
(Dashboard, Semester Plan, AI Roadmap, My Feedback, Profile)
and a top bar with search, notifications bell, user avatar.
```

> Token màu/font ở trên lấy đúng theo `docs/user-flow.html` + `design/drafts/advisor-dashboard.html` của nhóm để Figma sinh ra đồng bộ với khung dây 23 màn.

---

## 1. student-dashboard.html — Dashboard sinh viên

```text
Create a student dashboard screen for a study planning web app.

STYLE block above applies.

Main content, 3 sections:
1. Header: greeting "Hi, Tran Van A" + current semester "HK1 2026-2027"
   + plan status badge "Chờ cố vấn duyệt" (amber).
2. Stat cards row (4 cards): total credits completed 68/120,
   current semester credits 16, GPA 3.2, learning progress 57% with a progress bar.
3. Two-column area:
   - Left (60%): "Tiến độ lộ trình" vertical semester timeline,
     each semester row shows semester name, course chips, credit total,
     status tag (Hoàn thành / Đang học / Kế hoạch).
   - Right (40%): "Cảnh báo tải học" risk card (red accent, warning icon,
     short reason text, button "Xem chi tiết"), below it
     "Phản hồi mới từ cố vấn" list with 2 feedback items, sender avatar,
     snippet text and timestamp.

Include a mobile version where the sidebar collapses into a bottom tab bar
and stat cards become a 2x2 grid.
```

## 2. student-semester-plan.html — Kế hoạch học kỳ (kèm AI-2)

```text
Create a semester study plan screen for a student in a study planning web app.

STYLE block above applies.

Main content:
1. Header: title "Kế hoạch học kỳ HK2 2026-2027", plan status badge
   "Bản nháp", actions "Lưu" (secondary) and "Gửi cố vấn duyệt" (primary).
2. Toolbar: search input "Tìm học phần..." + filter chips
   (Tất cả / Chưa học / Đã qua / Đang mở lớp) + button "+ Thêm học phần".
3. Course table with columns: Mã HP, Tên học phần, Số tín chỉ,
   Loại (Bắt buộc/Tự chọn tag), Tiên quyết, Trạng thái, thao tác (edit, delete icons).
   6 rows of sample courses, total credits summary row at the bottom (16/20 tín chỉ)
   with a capacity progress bar.
4. Right side panel "AI Workload Risk" card: risk gauge showing "Cao",
   bullet list of risk reasons (3 items), explainer text "Vì sao AI cảnh báo?",
   action buttons "Chấp nhận gợi ý điều chỉnh", "Sửa thủ công", "Từ chối".

Also create the modal state: "Thêm học phần" dialog with a search field,
course result list with radio select and "Thêm vào kế hoạch" button,
plus a validation error state ("Học phần tiên quyết chưa hoàn thành").
```

## 3. student-ai-roadmap.html — AI Roadmap Recommender (AI-1)

```text
Create an AI roadmap recommendation screen for a student in a study planning web app.

STYLE block above applies.

Main content:
1. Input panel (top, card): form with fields
   "Mục tiêu nghề nghiệp" (select: Frontend Dev / Data Analyst / AI Engineer),
   "Quỹ thời gian" (select: 4 kỳ / 6 kỳ / 8 kỳ),
   "Số tín chỉ tối đa mỗi kỳ" (number input),
   primary button "Tạo lộ trình với AI" + secondary "Đặt lại".
2. Processing state frame: skeleton loading card with animated shimmer,
   text "AI đang phân tích mục tiêu của bạn..." and a progress hint.
3. Result area: roadmap timeline by semester, each semester card lists
   suggested courses with chips, credit load and a small reason line
   ("Đề xuất vì trùng kỹ năng mục tiêu Frontend").
   Above the timeline an "Giải thích của AI" summary card
   with 3 bullet reasons and confidence badge 82%.
4. Action bar on result: "Chấp nhận lộ trình" (primary), "Chỉnh sửa" ,
   "Từ chối", "Tạo lại".
5. Bottom section: "Đề xuất đã lưu" list of previously saved AI suggestions,
   each with status tag (Đã chấp nhận / Đã từ chối) and date.

Also create a failure state frame: card with error icon,
text "Không đủ dữ liệu để đưa ra đề xuất",
buttons "Thử lại" and "Chọn học phần thủ công".
```

## 4. student-plan-review.html — Phản hồi cố vấn (SV2 phụ trách thêm)

```text
Create a plan review feedback screen for a student in a study planning web app.

STYLE block above applies.

Main content:
1. Header: title "Phản hồi của cố vấn", status badge "Bị từ chối - cần chỉnh sửa".
2. Submission history list on the left (40%): 3 submissions
   (v1 Bị từ chối, v2 Bị từ chối, v3 Đang chờ duyệt), each with date
   and reviewer name.
3. Detail panel (60%): selected submission summary,
   reviewer comment thread with 2 comments, each has avatar, name,
   timestamp, message, and attached course highlight chips;
   one comment points to a specific course ("Nhóm CSE450 nên dời sang HK3").
4. Action bar: "Chỉnh sửa kế hoạch" (primary), "Trả lời cố vấn",
   "Xuất PDF" (secondary).

Include an empty state frame: illustration placeholder,
text "Chưa có phản hồi nào từ cố vấn".
```

---

## Sau khi Figma sinh xong

- Đồng bộ màu/font/spacing về design system chung của nhóm (đồng ý với SV1, SV3).
- Thêm frame trạng thái cho mỗi màn: rỗng, đang tải, lỗi, vô hiệu hóa nút khi chờ duyệt.
- Xuất mobile 390px cho ít nhất 1 màn hình chính (đề mục 18 yêu cầu bản responsive chính).
- Dán link file vào `design/figma-link.txt`, commit `docs: add figma link`.
