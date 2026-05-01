# 🌟 Danh Sách Chức Năng Hệ Thống "Ngân Hàng Bài Tập"

Hệ thống được chia thành 3 vai trò (Phân quyền) chính: **Sinh viên, Giảng viên, và Quản trị viên (Admin)**. Dưới đây là danh sách toàn bộ các chức năng hiện có của hệ thống:

## 1. 🎓 Chức năng dành cho Sinh viên (Người học)
* **Giao diện Ngân hàng bài tập:** Xem danh sách toàn bộ bài tập được công bố trên hệ thống.
* **Bộ lọc thông minh đa tầng:** Tìm kiếm và lọc bài tập theo **Môn học**, **Dạng bài**, **Độ khó** (Dễ/Trung bình/Khó) và **Cấp độ kỹ năng (Skill Levels)**.
* **Xem chi tiết bài tập:** Xem mô tả Markdown, yêu cầu chi tiết, tiêu chí chấm điểm và tải về file đính kèm.
* **Nộp bài tập:** Hỗ trợ nộp bài trực tiếp thông qua form (file đính kèm hoặc văn bản) tùy theo định dạng mà giảng viên yêu cầu.
* **Cá nhân hóa:** Chế độ hiển thị sáng/tối (Dark mode).

## 2. 👨‍🏫 Chức năng dành cho Giảng viên (Người dạy)
* **Dashboard thống kê cá nhân:** Hiển thị biểu đồ phân bổ bài tập, môn học, dạng bài và cấp độ mà giảng viên đó đang quản lý.
* **Quản lý kho bài tập cá nhân:** Thêm mới, chỉnh sửa, xóa và ẩn/hiện bài tập của mình.
* **Import từ Excel:** Thêm hàng loạt bài tập mới thông qua file Excel mẫu.
* **🤖 Tích hợp Trí tuệ Nhân tạo (AI):**
  * **Sinh nội dung tự động:** Sử dụng AI Groq (Llama 3.3) để tự động soạn thảo Mô tả bài tập, Yêu cầu và Tiêu chí chấm điểm dựa trên vài từ khóa cơ bản.
  * **Kiểm tra trùng lặp (Đạo văn):** Sử dụng AI để quét nội dung bài tập chuẩn bị đăng xem có bị trùng lặp với các bài tập đã tồn tại trong ngân hàng hay không.
* **Giao diện kéo thả file đính kèm:** Upload tài liệu bài tập trực quan với chức năng Drag & Drop.

## 3. 🛡️ Chức năng dành cho Quản trị viên (Admin)
* **Dashboard Tổng quan:** Theo dõi biểu đồ tổng hợp số liệu toàn hệ thống (Tổng User, Tổng số bài tập, Trạng thái hệ thống).
* **Quản lý Tài khoản (Users):**
  * Duyệt tài khoản Giảng viên đăng ký mới.
  * Phân quyền, Khóa/Mở khóa hoặc Xóa tài khoản người dùng.
  * Theo dõi lịch sử hoạt động.
* **Quản lý Bài tập toàn cục:** Có quyền xem và can thiệp (ẩn/xóa) mọi bài tập trên hệ thống do vi phạm nội quy.
* **Trích xuất dữ liệu (Export):** Xuất báo cáo danh sách tài khoản, danh sách bài tập, và điểm số lịch sử ra file **Excel (.xlsx)** hoặc **CSV** phục vụ lưu trữ.

## 4. ⚙️ Chức năng chung (Hệ thống)
* **Xác thực người dùng:** Đăng nhập, Đăng ký tài khoản mới (Mã hóa mật khẩu an toàn).
* **Quên mật khẩu:** Gửi yêu cầu khôi phục mật khẩu.
* **Bảo mật API:** Sử dụng JWT (JSON Web Token) để xác thực các phiên làm việc an toàn.
* **Hỗ trợ định dạng phong phú:** Hiển thị nội dung bằng Markdown (In đậm, in nghiêng, code block...).
