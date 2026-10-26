# Luồng cố vấn học tập

Bốn trang cố vấn: `advisor-dashboard.html`, `advisor-student-plan-review.html`, `advisor-students.html` và `advisor-feedback-management.html`. Cả bốn dùng design token trong `base.css`, dữ liệu mock JSON qua `StudyPathAPI` và dữ liệu chỉnh sửa trong `localStorage`.

## Nguồn dữ liệu và giới hạn prototype

- Sinh viên lấy từ `assets/data/users.json`; kế hoạch lấy từ `assets/data/plans.json`; học phần và tín chỉ lấy từ `assets/data/planItems.json` và `assets/data/courses.json`.
- Repo hiện có hồ sơ mẫu cho 8 sinh viên, không có phân công cố vấn chính thức, điểm GPA hay lịch sử kết quả học tập. Màn hình chỉ hiển thị sinh viên có tài khoản mẫu và đánh dấu các trường GPA/lịch sử là chưa có dữ liệu.
- Rủi ro kế hoạch là quy tắc tham khảo theo số tín chỉ (trên 18 là cao), không phải kết quả AI-2 đã lưu.
- Chưa có collection góp ý. Lần đầu mở dashboard hoặc quản lý góp ý, prototype tạo một số góp ý minh họa trong store `advisorFeedback`; các thao tác thêm, sửa, xem, thu hồi và khôi phục cập nhật store này.
- Advisor Copilot là tóm tắt theo quy tắc từ số tín chỉ và danh sách học phần, không gọi mô hình AI. Nó chỉ hỗ trợ tham khảo; quyết định duyệt/chỉnh sửa do cố vấn chọn.

## Thao tác

- Tổng quan: xem số sinh viên có kế hoạch, số kế hoạch chờ duyệt, góp ý minh họa, phân bố tải tín chỉ; mở thẳng kế hoạch để xem xét.
- Xem xét kế hoạch: chọn kế hoạch gửi duyệt, xem danh sách học phần, tạo lại tóm tắt, báo cáo tóm tắt sai, duyệt hoặc yêu cầu chỉnh sửa và lưu phản hồi.
- Hồ sơ sinh viên: tìm và chọn sinh viên; xem kế hoạch gần nhất, mở luồng duyệt hoặc chuyển sang soạn góp ý.
- Quản lý góp ý: lọc theo sinh viên/kế hoạch/trạng thái; tạo, xem, sửa, thu hồi và khôi phục góp ý.
