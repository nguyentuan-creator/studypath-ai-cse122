# Vai trò và chức năng

## Bốn vai trò

| Vai trò | Trách nhiệm chính | Màn hình nền tảng |
|---|---|---|
| Khách | Tra cứu chương trình và học phần | visitor-course-catalog.html, visitor-course-detail.html, visitor-sample-roadmaps.html |
| Sinh viên | Lập kế hoạch và theo dõi tiến độ | student-dashboard.html, student-semester-plan.html, student-ai-roadmap.html |
| Cố vấn học tập | Review kế hoạch và phản hồi | advisor-dashboard.html, advisor-student-plan-review.html, advisor-feedback-management.html |
| Quản trị viên | Quản lý học phần và cấu hình | admin-dashboard.html, admin-course-management.html, admin-program-settings.html |

## Trải nghiệm AI bắt buộc

| Mã | Tính năng | Thuộc vai trò |
|---|---|---|
| AI-1 | AI Roadmap Recommender — đề xuất lộ trình theo mục tiêu nghề nghiệp và quỹ thời gian | Sinh viên |
| AI-2 | AI Workload Risk — cảnh báo học kỳ quá tải, giải thích yếu tố rủi ro | Sinh viên |
| AI-3 | Advisor Copilot — tóm tắt kế hoạch sinh viên, gợi ý câu hỏi cố vấn | Cố vấn học tập |

Mỗi AI feature phải có trạng thái thất bại/không chắc chắn kèm hành động: Chỉnh sửa / Thử lại / Bỏ qua / Báo cáo / Dùng thủ công.

## Trải nghiệm AI chuẩn

```text
Người dùng nhập → Kiểm tra hợp lệ → AI đang xử lý → Kết quả AI
→ Vì sao có kết quả này? → Chấp nhận / Sửa / Từ chối / Tạo lại → Lưu vào trạng thái ứng dụng
```
