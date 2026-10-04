# Phân tích trạng thái giao diện — StudyPath AI

Tổng hợp trạng thái cần xử lý của từng màn hình — căn cứ để dựng mockup hi-fi và lập trình. Đối chiếu yêu cầu "Bao phủ trạng thái bắt buộc" của đề bài: không phải trang nào cũng cần đủ mọi trạng thái — cột **Loại** ghi rõ trạng thái áp dụng cho trang đó.

Khung dây 23 màn đã dựng xong và thể hiện trong Figma (`design/figma-link.txt`); khung dây chỉ trình bày khung màn hình, còn bảng dưới đây là nguồn tham chiếu trạng thái khi dựng hi-fi và code.

## Dùng chung

### index.html — Landing (Dùng chung)

Không có dữ liệu động — không áp dụng trạng thái tải/rỗng/lỗi.

Ghi chú hành vi: trang tĩnh; mọi nút CTA dẫn tới login.html / register.html / visitor-*.html.

### login.html — Đăng nhập (Dùng chung)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Lỗi xác thực | error | "Email hoặc mật khẩu không đúng" — hiển thị trong card, giữ nguyên dữ liệu đã nhập. |
| 2 | Đang xử lý | loading | Nút chuyển thành "Đang đăng nhập…", vô hiệu hóa, không bấm được lần 2. |
| 3 | Thành công | success | Chuyển trang theo vai trò: Sinh viên → student-dashboard · Cố vấn → advisor-dashboard · Quản trị → admin-dashboard. |

### register.html — Đăng ký (Dùng chung)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Lỗi | error | Email đã tồn tại / mật khẩu không khớp — báo lỗi dưới từng trường, giữ nguyên dữ liệu đã nhập. |
| 2 | Vô hiệu hóa | disabled | Nút "Tạo tài khoản" mờ khi thiếu trường bắt buộc hoặc chưa tích điều khoản. |
| 3 | Thành công | success | Chuyển tới đăng nhập — thông báo "Đã tạo tài khoản, hãy đăng nhập". |

### forgot-password.html — Quên mật khẩu (Dùng chung)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Thành công | success | Đã gửi liên kết đặt lại tới email của bạn — card hiển thị xác nhận, ẩn form. |
| 2 | Lỗi | error | Không tìm thấy email trong hệ thống — báo dưới trường Email. |
| 3 | Đang xử lý | loading | Đang gửi… — nút vô hiệu hóa trong lúc gửi. |

### profile.html — Hồ sơ cá nhân (Dùng chung)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Thành công | success | Toast "Đã lưu thay đổi" — hiển thị góc trên phải, tự ẩn sau 3 giây. |
| 2 | Lỗi | error | Mật khẩu hiện tại không đúng — báo dưới trường đổi mật khẩu. |
| 3 | Đang tải | loading | Skeleton form khi tải hồ sơ — hiển thị trong lúc lấy dữ liệu người dùng. |

### settings.html — Cài đặt (Dùng chung)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Thành công | success | Toast "Đã lưu cài đặt" — cài đặt giữ nguyên khi tải lại trang. |
| 2 | Lỗi | error | Không lưu được cài đặt — toast lỗi + giữ trạng thái cũ, cho phép thử lại. |
| 3 | Mặc định | default | Trạng thái ban đầu — công tắc theo cài đặt đã lưu trên máy chủ. |

### notifications.html — Thông báo (Dùng chung)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Chưa có thông báo nào" — kèm icon chuông, không hiện nút đánh dấu đã đọc. |
| 2 | Đã đọc | success | Hàng chuyển màu nhạt — dot đỏ trên chuông biến mất khi hết thông báo chưa đọc. |
| 3 | Lỗi | error | "Không tải được thông báo" — kèm nút "Thử lại". |

### 403.html — Forbidden (Dùng chung)

Trang tự thân là một trạng thái chặn truy cập — không có bảng trạng thái dữ liệu riêng.

Ghi chú hành vi: ví dụ 403 thực tế — sinh viên mở advisor-student-plan-review.html → chặn trước khi tải dữ liệu; giữ nguyên người dùng đang đăng nhập.

### 404.html — Not Found (Dùng chung)

Trang tự thân là trạng thái lỗi 404; chỉ có hành động thoát ("Về trang chủ" / "Xem danh mục học phần") — không có trạng thái dữ liệu khác.

## Khách (chưa đăng nhập)

### visitor-course-catalog.html — Course Catalog (Khách)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Không tìm thấy học phần phù hợp" — kèm nút "Đặt lại bộ lọc". |
| 2 | Đang tải | loading | Skeleton thẻ học phần — 6 khung xám trong lúc tải danh sách. |
| 3 | Lỗi | error | "Không tải được danh sách học phần" — kèm nút "Thử lại". |

### visitor-course-detail.html — Course Detail (Khách)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng / không thấy | empty | "Không tìm thấy học phần" — mã HP sai hoặc đã bị vô hiệu hóa → kèm link về danh mục. |
| 2 | Đang tải | loading | Skeleton khối nội dung — hiển thị trong khi lấy chi tiết học phần. |
| 3 | Lỗi | error | "Không tải được chi tiết học phần" — kèm nút "Thử lại". |

### visitor-sample-roadmaps.html — Sample Roadmaps (Khách)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Chưa có lộ trình mẫu" — do quản trị viên chưa cấu hình lộ trình mẫu. |
| 2 | Đang tải | loading | Skeleton bảng học kỳ — hiển thị khi tải chi tiết lộ trình. |
| 3 | Chưa đăng nhập | gated | Nút "Dùng lộ trình này" dẫn tới đăng nhập — sau đăng nhập → nhân bản về tài khoản sinh viên. |

## Sinh viên

### student-dashboard.html — Dashboard (Sinh viên)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Chưa có kế hoạch nào" — kèm CTA "Lập kế hoạch học kỳ đầu tiên". |
| 2 | Đang tải | loading | Skeleton KPI + bảng — toàn trang hiển thị khung xám khi tải dữ liệu. |
| 3 | Lỗi | error | "Không tải được tiến độ học tập" — kèm nút "Thử lại". |

Ghi chú hành vi: KPI thay đổi theo dữ liệu thật; cảnh báo quá tải lấy từ AI-2 — luôn kèm chip "AI-2" và nút hành động. Trạng thái kế hoạch: Bản nháp / Chờ duyệt / Đã duyệt / Bị từ chối / Đã hủy.

### student-semester-plan.html — Semester Plan (Sinh viên)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Kế hoạch trống" — bảng ẩn, hiện khối mời "Thêm học phần đầu tiên". |
| 2 | Đang gửi | loading | "Đang gửi kế hoạch tới cố vấn…" — nút gửi vô hiệu hóa trong khi gửi. |
| 3 | Lỗi gửi | error | "Gửi thất bại — chưa gửi được cho cố vấn" — toast lỗi + giữ bản nháp, nút "Thử lại". |

Ghi chú hành vi: trạng thái kế hoạch cần đầy đủ khi dựng hi-fi — Bản nháp / Chờ duyệt / Đã duyệt / Bị từ chối / Đã hủy–lưu trữ. Kế hoạch "Đã duyệt" khóa sửa (nút Sửa/Xóa vô hiệu hóa). Xóa học phần trong kế hoạch chỉ xóa khỏi planItems, không xóa học phần gốc.

Biến thể trạng thái (đã dựng trên khung dây): đang gửi · gửi thất bại (giữ bản nháp, nút "Thử lại") · kế hoạch trống (khối mời thêm học phần đầu tiên). Mặc định: màn bản nháp.

### student-ai-roadmap.html — AI Roadmap (Sinh viên)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Đang xử lý | loading | "AI đang phân tích hồ sơ…" |
| 2 | Thất bại / không chắc chắn | error | "AI không chắc chắn về kết quả" — hành động: Thử lại / Bỏ qua / Báo cáo / Nhập thủ công. |
| 3 | Rỗng | empty | "Chưa có lộ trình nào" — hiển thị trước lần tạo đầu tiên. |

Ghi chú hành vi: luồng xử lý — Nhập → Kiểm tra hợp lệ → AI đang xử lý → Kết quả → "Vì sao có kết quả này?" → Chấp nhận / Sửa / Từ chối / Tạo lại → Lưu vào trạng thái ứng dụng. Kết quả AI chưa được chấp nhận thì KHÔNG tự sửa kế hoạch của sinh viên.

Biến thể trạng thái (đã dựng trên khung dây): đang xử lý · không chắc chắn (đủ 5 hành động) · rỗng · lỗi kiểm tra hợp lệ. Mặc định: màn kết quả.

## Cố vấn học tập

### advisor-dashboard.html — Dashboard (Cố vấn)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Chưa có kế hoạch nào chờ duyệt" — "Kế hoạch mới do sinh viên gửi sẽ xuất hiện tại đây." |
| 2 | Đang tải | loading | Skeleton KPI + bảng. |
| 3 | Lỗi | error | "Không tải được danh sách kế hoạch" — "Kiểm tra kết nối mạng và thử lại." + nút "Thử lại". |

### advisor-student-plan-review.html — Student Plan Review (Cố vấn)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Thành công | success | Toast "Đã gửi phản hồi" + kế hoạch chuyển "Đã duyệt/Từ chối" — rồi tự chuyển sang sinh viên kế tiếp trong hàng chờ. |
| 2 | Lỗi gửi | error | "Không gửi được phản hồi" — giữ nội dung đã soạn, nút "Thử lại". |
| 3 | Rỗng | empty | "Sinh viên chưa gửi kế hoạch nào" — không hiện khối quyết định khi không có kế hoạch chờ duyệt. |

Ghi chú hành vi: AI-3 chỉ TÓM TẮT và gợi ý — quyết định duyệt/từ chối luôn do cố vấn chọn. Nút "Báo cáo kết quả sai" là kênh báo AI không chính xác. Tóm tắt phải tải lại được khi sinh viên sửa kế hoạch.

Biến thể trạng thái (đã dựng trên khung dây): đã gửi phản hồi (toast + kế hoạch chuyển "Đã duyệt") · lỗi gửi (giữ nội dung soạn) · chưa có kế hoạch chờ duyệt. Mặc định: màn xem xét.

### advisor-feedback-management.html — Feedback Management (Cố vấn)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Chưa có góp ý nào" — kèm CTA "Soạn góp ý mới". |
| 2 | Thành công / thu hồi | success | Toast "Đã gửi góp ý" / "Đã thu hồi góp ý" — thu hồi chỉ ẩn góp ý khỏi sinh viên (xóa mềm), cố vấn còn thấy "Đã thu hồi" và khôi phục được. |
| 3 | Lỗi | error | "Không gửi được góp ý" — giữ nội dung soạn, nút "Thử lại". |

### advisor-students.html — Student Profiles (Cố vấn)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Chưa có sinh viên nào được gán" — "Liên hệ quản trị viên để được gán sinh viên." |
| 2 | Đang tải | loading | Skeleton danh sách + chi tiết. |
| 3 | Lỗi | error | "Không tải được danh sách sinh viên" — kèm nút "Thử lại". |

## Quản trị viên

### admin-dashboard.html — Dashboard (Quản trị)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Rỗng | empty | "Chưa có hoạt động nào" — khi hệ thống mới khởi tạo, chưa có nhật ký. |
| 2 | Dịch vụ AI lỗi | error | Badge "Gián đoạn" màu đỏ — cảnh báo đầu trang cho quản trị viên xử lý. |
| 3 | Đang tải | loading | Skeleton KPI + bảng. |

### admin-course-management.html — Course Management (Quản trị)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Thành công | success | Toast "Đã lưu học phần IT7070" — bảng tải lại, dòng mới nổi bật trong 2 giây. |
| 2 | Lỗi trùng mã | error | "Mã học phần đã tồn tại" — báo dưới trường Mã, giữ nguyên form. |
| 3 | Vô hiệu hóa | confirm | Hộp xác nhận trước khi vô hiệu hóa — "Học phần sẽ ẩn khỏi danh mục nhưng giữ dữ liệu kế hoạch cũ." |

### admin-program-settings.html — Program Settings (Quản trị)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Thành công | success | Toast "Đã lưu cấu hình chương trình" — cấu hình mới áp dụng cho sinh viên K17. |
| 2 | Lỗi dữ liệu | error | "Tổng tín chỉ các nhóm vượt/yêu cầu chưa đủ 130" — chặn lưu, chỉ rõ nhóm bị lệch. |
| 3 | Xóa nhóm | confirm | Hộp xác nhận "Xóa nhóm học phần?" — chỉ cho xóa nhóm không còn học phần trong kế hoạch nào. |

### admin-user-management.html — User Management (Quản trị)

| # | Trạng thái | Loại | Mô tả |
|---|---|---|---|
| 1 | Lỗi trùng email | error | "Email đã được dùng bởi tài khoản khác" — báo dưới trường Email. |
| 2 | Khóa / mở khóa thành công | success | Toast "Đã khóa tài khoản Vũ Đức Long" — không xóa dữ liệu; "Mở khóa" cho đăng nhập lại ngay. |
| 3 | Rỗng | empty | "Không tìm thấy người dùng phù hợp" — khi lọc không có kết quả, kèm "Đặt lại bộ lọc". |
