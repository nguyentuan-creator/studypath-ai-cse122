# Bảng kiểm kê màn hình

> Bản nháp khởi tạo từ danh sách nền tảng (mục 8 đề bài), sau đó nhóm kiểm kê đầy đủ theo NGUYÊN TẮC PHẠM VI (mức tối thiểu 12 màn chỉ là sàn): tổng **23 màn hình** = 9 dùng chung/xác thực + 3 Khách + 3 Sinh viên + 4 Cố vấn + 4 Quản trị viên. Khung dây 23 màn đã dựng xong và thể hiện trong Figma của nhóm (`design/figma-link.txt`). Danh sách này trình giảng viên duyệt TRƯỚC khi code (mục 18).

| Vai trò | Mục tiêu người dùng | Nhiệm vụ người dùng | Màn hình | Tệp | CRUD/Trạng thái | AI | Người phụ trách |
|---|---|---|---|---|---|---|---|
| Dùng chung | Giới thiệu sản phẩm | Xem trang chủ | Landing | index.html | R | — | Chờ phân công |
| Dùng chung | Truy cập hệ thống | Đăng nhập | Login | login.html | R | — | Chờ phân công |
| Dùng chung | Truy cập hệ thống | Đăng ký tài khoản | Register | register.html | C | — | Chờ phân công |
| Dùng chung | Truy cập hệ thống | Khôi phục mật khẩu | Forgot Password | forgot-password.html | R/U | — | Chờ phân công |
| Dùng chung | Quản lý tài khoản | Xem/sửa hồ sơ cá nhân | Profile | profile.html | R/U | — | Chờ phân công |
| Dùng chung | Quản lý tài khoản | Cài đặt ứng dụng | Settings | settings.html | R/U | — | Chờ phân công |
| Dùng chung | Quản lý tài khoản | Xem và đánh dấu đọc thông báo | Notifications | notifications.html | R/U | — | Chờ phân công |
| Dùng chung | Truy cập hệ thống | Báo không có quyền truy cập | Forbidden (403) | 403.html | R | — | Chờ phân công |
| Dùng chung | Truy cập hệ thống | Báo không tìm thấy trang | Not Found (404) | 404.html | R | — | Chờ phân công |
| Khách | Tra cứu chương trình và học phần | Danh sách học phần | Course Catalog | visitor-course-catalog.html | R | — | SV1 |
| Khách | Tra cứu chương trình và học phần | Xem chi tiết học phần | Course Detail | visitor-course-detail.html | C/R/U | — | SV1 |
| Khách | Tra cứu chương trình và học phần | Xem lộ trình mẫu | Sample Roadmaps | visitor-sample-roadmaps.html | C/R/U/D | — | SV1 |
| Sinh viên | Lập kế hoạch và theo dõi tiến độ | Xem tổng quan tiến độ | Dashboard | student-dashboard.html | R | AI-2 (hiển thị cảnh báo) | SV2 |
| Sinh viên | Lập kế hoạch và theo dõi tiến độ | Lập kế hoạch học kỳ | Semester Plan | student-semester-plan.html | C/R/U | AI-2 | SV2 |
| Sinh viên | Lập kế hoạch và theo dõi tiến độ | Đề xuất lộ trình bằng AI | AI Roadmap | student-ai-roadmap.html | C/R/U/D | AI-1, AI-2 | SV2 |
| Cố vấn học tập | Review kế hoạch và phản hồi | Xem tổng quan sinh viên | Dashboard | advisor-dashboard.html | R | AI-2 (hiển thị cảnh báo) | SV3 |
| Cố vấn học tập | Review kế hoạch và phản hồi | Duyệt kế hoạch sinh viên | Student Plan Review | advisor-student-plan-review.html | C/R/U | AI-3 | SV3 |
| Cố vấn học tập | Review kế hoạch và phản hồi | Quản lý phản hồi | Feedback Management | advisor-feedback-management.html | C/R/U/D | — | SV3 |
| Cố vấn học tập | Review kế hoạch và phản hồi | Xem hồ sơ sinh viên phụ trách | Student Profiles | advisor-students.html | R | AI-2 (hiển thị mức rủi ro) | SV3 |
| Quản trị viên | Quản lý học phần và cấu hình | Xem tổng quan hệ thống | Dashboard | admin-dashboard.html | R | — | SV3 |
| Quản trị viên | Quản lý học phần và cấu hình | Quản lý học phần | Course Management | admin-course-management.html | C/R/U | — | SV3 |
| Quản trị viên | Quản lý học phần và cấu hình | Cấu hình chương trình | Program Settings | admin-program-settings.html | C/R/U/D | — | SV3 |
| Quản trị viên | Quản lý học phần và cấu hình | Quản lý người dùng, gán cố vấn–sinh viên | User Management | admin-user-management.html | C/R/U/D | — | SV3 |

## Ghi chú

- CRUD: C = Tạo, R = Đọc, U = Sửa, D = Xóa. Với dữ liệu nghiệp vụ có thể thay Xóa bằng Hủy/Lưu trữ/Vô hiệu hóa/Đóng.
- Mỗi chức năng quan trọng phải phân tích các trạng thái phù hợp: bình thường, đang tải, rỗng, thành công, lỗi, vô hiệu hóa, đang chờ, bị từ chối, hoàn thành, đã hủy/lưu trữ.
- Mức 12 màn của mục 8 chỉ là mức tối thiểu; kiểm kê đầy đủ theo thực thể (mục 10) và trạng thái (mục 9) cho ra 23 màn như trên. Danh sách mở rộng vẫn phải được giảng viên duyệt trước khi code (mục 18).
- Thiết kế Figma 23 màn: `design/figma-link.txt`. Mockup hi-fi tham chiếu: `design/drafts/advisor-dashboard.html`.
- Số video OBS cuối cùng = số màn hình trong bảng này sau khi được duyệt (hiện tại 23, chờ duyệt).
