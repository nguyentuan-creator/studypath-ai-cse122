# Khai báo sử dụng AI

> Nhóm StudyPath AI — CSE122 · Cập nhật 27/10/2026
> Phạm vi: toàn bộ sản phẩm (HTML/CSS/JavaScript thuần + dữ liệu JSON/LocalStorage).

## Công cụ AI đã dùng

- **Qoder (AI coding agent)** — SV2 Hứa Đình Kiên dùng để dựng app shell, `base.css`, hai rule engine AI-1/AI-2, dark mode, script kiểm thử và soạn tài liệu.
- **Codex (AI coding agent)** — SV1 Hồ Trung Anh dùng cho các màn Khách/auth; thể hiện qua các nhánh `codex/login-auth-layout`, `codex/register-auth-layout`, `codex/visitor-*` và commit tương ứng. SV1 xác nhận lại prompt chi tiết trước khi nộp.
- **SV3 Nguyễn Bá Hoàng Tuân** dùng **Qoder** để dựng các màn cố vấn/quản trị (gồm AI-3 Advisor Copilot), hợp nhất các nhánh còn lại vào `dev` rồi `main`, rà soát asset/console toàn bộ 23 trang, cấu hình GitHub Pages và biên tập tài liệu.
- Sản phẩm **không gọi LLM/API AI thật**, không dùng API key và không gửi dữ liệu sinh viên ra ngoài.

## Prompt chính

Các prompt dưới đây được rút gọn từ hội thoại thật, không dán toàn bộ lịch sử chat:

1. “Làm tính năng AI như thế nào, giải thích cho tôi cách làm và các phương án.”
2. “Ẩn các model AI trước khi tạo lộ trình.” — yêu cầu không lộ kết quả trước khi người dùng bấm tạo.
3. “Dưới 20 giờ luôn không đủ dữ liệu.” — yêu cầu AI-1 phải có kịch bản thất bại thật khi quỹ thời gian không đủ.
4. “AI-2 cảnh báo quá tải, phải lưu Accept/Edit/Reject thật, F5 còn dữ liệu.”
5. “Phần dark mode cho tất cả màn hình.” — yêu cầu áp dụng và ghi nhớ theme trên toàn hệ thống.
6. “Kiểm tra lại bài tập đã đúng với barem chấm chưa.” — dùng AI đối chiếu sản phẩm với rubric.
7. “Commit AI code còn lại.” — tách commit AI-1/AI-2 khỏi thay đổi giao diện.
8. “Merge all nhánh vào dev sau đó merge dev vào main, cố gắng giữ đồng bộ.” — yêu cầu hợp nhất 15 nhánh và giữ `dev`/`main` khớp nhau.
9. “Khi nhìn vào repo người ta thấy nhóm tôi làm như thế nào?” — dùng AI rà soát repo theo góc nhìn người chấm (lịch sử commit, PR, tài liệu, video).
10. “Chốt 1 danh tính/người cho các commit về sau.” — chuẩn hoá tên/email commit, xoá nhánh trùng, cập nhật báo cáo AI.

## Phần do AI sinh ra

- **AI-1 (Roadmap Recommender)**
  - `js/modules/ai-engine.js`: chuẩn hóa hồ sơ, chọn học phần theo nghề nghiệp/sở thích, sắp thứ tự tiên quyết, xếp học kỳ theo quỹ thời gian, tính độ phù hợp và sinh lý do.
  - `js/student-ai-roadmap.js`: nối form → engine → trạng thái kết quả/lỗi → Accept/Edit/Reject/Regenerate.
- **AI-2 (Workload Risk)**
  - `js/modules/workload-engine.js`: đếm tín chỉ, phát hiện môn nặng, môn trùng, thiếu tiên quyết; tính `riskLevel`, độ tin cậy, lý do và gợi ý giảm tải.
  - `js/student-semester-plan.js`: nối kế hoạch đang chọn → engine → trạng thái idle/loading/stale/error → Accept/Reduce/Edit/Reject.
- **AI-3 (Advisor Copilot)**
  - `js/modules/advisor-review.js`: tóm tắt kế hoạch theo số tín chỉ (ngưỡng tham khảo 18), sinh câu hỏi gợi ý cho cố vấn, nút “Tạo lại tóm tắt” và ghi nhận “Báo cáo kết quả sai”; quyết định duyệt/từ chối vẫn do cố vấn chọn.
- **Dùng chung**
  - `css/base.css`: token màu, component app shell, form, card, tag, alert, modal, toast.
  - `js/theme.js` và các override dark mode ở CSS từng màn.
  - Một phần nội dung `README.md`, `docs/ai-usage-report.md` và script QA Playwright (script QA chỉ dùng nội bộ, không nằm trong sản phẩm).

## Phần sinh viên chỉnh sửa

- **Chọn kiến trúc rule-based thay vì gọi LLM**: đảm bảo giải thích được khi vấn đáp, không có API key, không phụ thuộc mạng. AI chỉ hỗ trợ viết code, không quyết định nghiệp vụ.
- **AI-1 — Accept ghi dữ liệu thật**: AI ban đầu chỉ đổi nhãn trạng thái; nhóm sửa để tạo `plans` + `planItems` qua `StudyPathAPI`, lưu `aiSuggestions` và giữ nguyên sau F5.
- **AI-1 — ẩn kết quả trước khi tạo**: kết quả chỉ hiện sau khi bấm “Tạo lộ trình” trong phiên hiện tại.
- **AI-1 — failure thật**: khi quỹ thời gian không xếp đủ tín chỉ, hiển thị lỗi “Không đủ dữ liệu” kèm nút “Nâng quỹ thời gian”/“Chọn sở thích”/“Thử lại”; không giả lập thành công.
- **AI-2 — luồng đầy đủ**: thêm trạng thái kế hoạch trống, dữ liệu cũ (`stale`), lỗi lưu, nút “Vì sao?”, Accept và “Giảm tải” thực sự xóa học phần khỏi `planItems`.
- **Sửa lỗi điều hướng**: bỏ đoạn `preventDefault()` còn sót từ bản nháp khiến sidebar không chuyển trang.
- **Dark mode**: tách màu chữ (`--color-primary`) khỏi màu nền đặc (`--color-primary-solid`) để nút vẫn có chữ trắng trên nền xanh, đồng thời link/trạng thái đủ tương phản trên nền tối.
- **Kiểm soát thay đổi AI**: đọc `git diff`, tách commit dark mode / AI-1 / AI-2, không commit lẫn file AI còn dang dở.

## Lỗi AI gặp phải

| Lỗi | Cách phát hiện | Cách sửa |
|---|---|---|
| AI-1 Accept chỉ đổi nhãn, không lưu kế hoạch | F5 mất trạng thái; kiểm tra `aiSuggestions` | Ghi thật `plans`/`planItems`, lưu `planId` vào suggestion |
| Kết quả AI hiện trước khi người dùng bấm tạo | Kiểm tra DOM lúc mở trang | Ẩn khối kết quả, chỉ render sau thao tác tạo trong phiên |
| AI-1 báo thành công dù quỹ thời gian không đủ | Thử mức `< 10 giờ` với 132 TC | Trả `feasible=false`, hiển thị failure + hành động khắc phục |
| AI-2 chỉ là banner, không có 6 bước AI UX | Đối chiếu barem TC6 | Thêm processing, output, explain, control, save, failure |
| Dark mode chỉ đúng ở Settings/Roadmap | Mở lần lượt 11 trang | Tạo `js/theme.js` nạp trước CSS; token hóa toàn bộ màu |
| Chữ trắng trên nền sáng ở nút primary khi dark | Kiểm tra tương phản | Tách token màu chữ và màu nền đặc |
| Script QA tự reset theme mỗi lần điều hướng | Kết quả test không khớp trình duyệt thật | Chỉ seed theme khi localStorage chưa có; test lại luồng lưu/light/dark |

## Cách sinh viên kiểm chứng

- Chạy sản phẩm qua **HTTP server** (không dùng `file://` vì `fetch` dữ liệu sẽ hỏng).
- Dùng Playwright + Chrome kiểm tra 11 trang ở desktop 1440×900 và mobile 390×844: theme, tràn ngang, lỗi console.
- Kiểm tra 3 vai trò (sinh viên/cố vấn/khách), đăng nhập bằng tài khoản seed, so khớp persona và dữ liệu hiển thị.
- Kiểm tra lưu trữ thật: tạo lộ trình → Accept → F5; chạy AI-2 → Accept/Giảm tải → F5; đổi theme → reload → chuyển trang.
- Kiểm tra đồng bộ tab bằng sự kiện `storage` của `theme.js` và `StudyPathAPI.onStoreChange`.
- Đọc lại `git diff` từng commit, đối chiếu `docs/screen-inventory.md` và barem trước khi chốt.
- Các kết luận “đạt” chỉ được ghi nhận sau khi chạy thử, không dựa vào việc AI báo đã xong.

## Điều sinh viên học được

- Rule-based vẫn là một dạng AI hợp lệ nếu có input → processing → output → explain → control → save, nhưng phải trung thực là mock.
- Độ tin cậy và lý do phải suy ra từ dữ liệu/ngưỡng, không được gán cảm tính.
- Phần khó nhất của tính năng AI là trạng thái và lưu trữ (empty, stale, failure, F5), không phải giao diện.
- AI viết code nhanh nhưng có thể tạo ra “thành công giả”; con người phải kiểm chứng bằng luồng thật và dữ liệu thật.
- Prompt càng cụ thể (ví dụ “ẩn kết quả trước khi tạo”) thì kết quả càng ít phải sửa.

## Tính năng mock vs gọi API thật

| Tính năng | Cách hoạt động | Mock/Real | Tệp |
|---|---|---|---|
| AI-1 Roadmap Recommender | Rule engine tất định từ hồ sơ + danh mục học phần | **Mock rule-based** | `js/modules/ai-engine.js` |
| AI-2 Workload Risk | Rule engine tính tín chỉ, môn nặng, tiên quyết, gợi ý giảm tải | **Mock rule-based** | `js/modules/workload-engine.js` |
| AI-3 Advisor Copilot | Rule engine tóm tắt kế hoạch theo tín chỉ, sinh câu hỏi gợi ý; cố vấn tự quyết định | **Mock rule-based** | `js/modules/advisor-review.js` |

- Không có lời gọi mạng tới dịch vụ AI, không có API key trong repo.
- Dữ liệu đầu vào: `assets/data/courses.json`, `plans`, `planItems`, `aiSuggestions`; lưu qua `js/api.js` + localStorage.
- Giới hạn: chưa phải mô hình học máy/LLM; kết quả mang tính gợi ý theo luật, đã được giải thích bằng `reasons` và `confidence`.

## Phân công khai báo theo thành viên

| Thành viên | Màn phụ trách | Cách dùng AI | Phần đã tự kiểm chứng |
|---|---|---|---|
| SV2 Hứa Đình Kiên | Dashboard, Semester Plan (AI-2), AI Roadmap (AI-1), Profile, Settings, shell/dark mode | Qoder hỗ trợ code + QA + docs; tự chốt kiến trúc rule-based, sửa luồng lưu/failure, review diff | Chạy HTTP server + Playwright 11 trang × 2 viewport; test Accept/F5; test dark mode; xem video OBS |
| SV1 Hồ Trung Anh | Login, Register, Course Catalog, Course Detail, Sample Roadmaps, 403/404 | Codex hỗ trợ dựng màn (theo nhánh `codex/*`); SV1 cần xác nhận prompt | SV1 kiểm thử màn của mình; SV2 review chéo |
| SV3 Nguyễn Bá Hoàng Tuân | Advisor Dashboard, 3 màn cố vấn còn lại (gồm AI-3), 4 màn quản trị | Qoder hỗ trợ dựng màn, hợp nhất nhánh, kiểm thử asset/console, cấu hình GitHub Pages, biên tập tài liệu | Tự kiểm thử luồng cố vấn/quản trị; rà soát 23 trang qua HTTP server; xem video OBS của mình |

> Ghi chú trung thực: bảng phân công cần SV1 xác nhận lại prompt Codex trước khi nộp; không tự gán công cụ AI cho phần các bạn không sử dụng.

## Bằng chứng

- AI-1: commit [`34f692f`](https://github.com/nguyentuan-creator/studypath-ai-cse122/commit/34f692f) · video [SV2-03](https://youtu.be/u4zZnQK54z4)
- AI-2: commit [`049da6b`](https://github.com/nguyentuan-creator/studypath-ai-cse122/commit/049da6b) · video [SV2-02](https://youtu.be/gOnKtp3Fhes)
- Dark mode toàn hệ thống: commit [`44255a1`](https://github.com/nguyentuan-creator/studypath-ai-cse122/commit/44255a1)
- Dashboard hiển thị cảnh báo AI-2: commit [`9b743dc`](https://github.com/nguyentuan-creator/studypath-ai-cse122/commit/9b743dc) · video [SV2-01](https://youtu.be/tAmpdnyheAw)
- Playlist minh chứng: [YouTube playlist](https://www.youtube.com/playlist?list=PLdm_M2EEcUyQ)
