# Bảng kiểm kê màn hình

> Bản nháp khởi tạo từ danh sách nền tảng (mục 8 đề bài). Nhóm bổ sung các màn hình dùng chung (index, login, register, forgot-password, profile, settings, notifications, 403, 404...) và màn hình phát sinh, rồi trình giảng viên duyệt TRƯỚC khi code.

| Vai trò | Mục tiêu người dùng | Nhiệm vụ người dùng | Màn hình | Tệp | CRUD/Trạng thái | AI | Người phụ trách |
|---|---|---|---|---|---|---|---|
| Khách | Tra cứu chương trình và học phần | Danh sách học phần | Course Catalog | visitor-course-catalog.html | R | — | SV1 |
| Khách | Tra cứu chương trình và học phần | Xem chi tiết học phần | Course Detail | visitor-course-detail.html | C/R/U | — | SV1 |
| Khách | Tra cứu chương trình và học phần | Xem lộ trình mẫu | Sample Roadmaps | visitor-sample-roadmaps.html | C/R/U/D | — | SV1 |
| Sinh viên | Lập kế hoạch và theo dõi tiến độ | Xem tổng quan tiến độ | Dashboard | student-dashboard.html | R | — | SV2 |
| Sinh viên | Lập kế hoạch và theo dõi tiến độ | Lập kế hoạch học kỳ | Semester Plan | student-semester-plan.html | C/R/U | AI-2 | SV2 |
| Sinh viên | Lập kế hoạch và theo dõi tiến độ | Đề xuất lộ trình bằng AI | AI Roadmap | student-ai-roadmap.html | C/R/U/D | AI-1, AI-2 | SV2 |
| Cố vấn học tập | Review kế hoạch và phản hồi | Xem tổng quan sinh viên | Dashboard | advisor-dashboard.html | R | — | SV3 |
| Cố vấn học tập | Review kế hoạch và phản hồi | Duyệt kế hoạch sinh viên | Student Plan Review | advisor-student-plan-review.html | C/R/U | AI-3 | SV3 |
| Cố vấn học tập | Review kế hoạch và phản hồi | Quản lý phản hồi | Feedback Management | advisor-feedback-management.html | C/R/U/D | — | SV3 |
| Quản trị viên | Quản lý học phần và cấu hình | Xem tổng quan hệ thống | Dashboard | admin-dashboard.html | R | — | SV3 |
| Quản trị viên | Quản lý học phần và cấu hình | Quản lý học phần | Course Management | admin-course-management.html | C/R/U | — | SV3 |
| Quản trị viên | Quản lý học phần và cấu hình | Cấu hình chương trình | Program Settings | admin-program-settings.html | C/R/U/D | — | SV3 |

## Ghi chú

- CRUD: C = Tạo, R = Đọc, U = Sửa, D = Xóa. Với dữ liệu nghiệp vụ có thể thay Xóa bằng Hủy/Lưu trữ/Vô hiệu hóa/Đóng.
- Mỗi chức năng quan trọng phải phân tích các trạng thái phù hợp: bình thường, đang tải, rỗng, thành công, lỗi, vô hiệu hóa, đang chờ, bị từ chối, hoàn thành, đã hủy/lưu trữ.
- Số video OBS cuối cùng = số màn hình trong bảng này sau khi được duyệt.
