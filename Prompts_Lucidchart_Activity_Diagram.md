# BỘ PROMPT TẠO ACTIVITY DIAGRAM BẰNG LUCIDCHART AI

*Hướng dẫn sử dụng: Mở tính năng "Generate Diagram / Create with AI" của Lucidchart. Copy từng đoạn Prompt dưới đây (có thể dịch sang tiếng Anh nếu Lucidchart phản hồi tốt hơn bằng tiếng Anh) và dán vào hộp thoại chat của AI.*

---

## 1. Sơ đồ Đăng nhập hệ thống
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Đăng nhập. Sử dụng 2 Swimlanes: "Người dùng (Giảng viên/Admin)" và "Hệ thống". Bắt đầu ở làn Người dùng với hành động "Mở trang Đăng nhập", tiếp theo "Nhập tài khoản và mật khẩu". Chuyển sang làn Hệ thống với hình thoi quyết định (Decision) "Xác thực hợp lệ?". Nhánh [Đúng] đi qua các hành động tuần tự: "Tạo Session", "Lưu log vào bảng LOGIN_HISTORY", "Chuyển hướng đến Dashboard" và kết thúc ở Final Node. Nhánh [Sai] đi tới hành động "Hiển thị thông báo lỗi" và vòng ngược lại trang đăng nhập.

## 2. Sơ đồ Khôi phục mật khẩu (OTP)
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Khôi phục mật khẩu. Dùng 2 Swimlanes: "Giảng viên" và "Hệ thống". Bắt đầu ở làn Giảng viên: "Bấm nút Quên mật khẩu", sau đó "Nhập Email". Chuyển sang Hệ thống với hình thoi quyết định "Email có tồn tại trong CSDL?". Nếu [Không]: "Hiển thị lỗi" -> Kết thúc. Nếu [Có]: "Hệ thống sinh mã OTP", "Lưu vào bảng PasswordResetOTP", "Gửi Email cho Giảng viên". Chuyển về Giảng viên: "Nhập mã OTP và Mật khẩu mới". Chuyển sang Hệ thống với quyết định "OTP hợp lệ và còn hạn?". Nếu [Đúng]: "Mã hóa mật khẩu mới", "Lưu CSDL", "Báo thành công" -> Kết thúc. Nếu [Sai]: "Báo lỗi OTP" -> Kết thúc.

## 3. Sơ đồ Tra cứu và Xem bài tập (Sinh viên)
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Sinh viên tìm kiếm bài tập. Dùng 2 Swimlanes: "Sinh viên" và "Hệ thống". Sinh viên bắt đầu: "Truy cập website", "Nhập từ khóa Deep Search hoặc chọn bộ lọc". Chuyển sang Hệ thống: "Truy vấn bảng BAITAP và MONHOC". Ra quyết định bằng hình thoi "Có tìm thấy kết quả?". Nếu [Không]: "Hiển thị thông báo không tìm thấy". Nếu [Có]: "Trả về danh sách kết quả". Sinh viên: "Click xem một bài tập cụ thể". Hệ thống: "Render định dạng Markdown và Code Snippet", "Hiển thị chi tiết đề bài" -> Final Node.

## 4. Sơ đồ Thêm bài tập mới
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Thêm bài tập. Dùng 2 Swimlanes: "Giảng viên" và "Hệ thống". Giảng viên: "Bấm nút Thêm mới", "Soạn thảo nội dung Markdown", "Chọn Môn học và Độ khó", "Bấm Lưu". Chuyển sang Hệ thống với hình thoi quyết định "Dữ liệu nhập đủ và hợp lệ?". Nếu [Sai]: "Hiển thị cảnh báo yêu cầu nhập lại" -> Vòng về hành động của Giảng viên. Nếu [Đúng]: "Lưu bản ghi vào bảng BAITAP", "Khởi chạy tiến trình ngầm trích xuất Keywords", "Cập nhật danh sách hiển thị" -> Kết thúc.

## 5. Sơ đồ Cập nhật (Sửa) bài tập
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Sửa bài tập. Dùng 2 Swimlanes: "Giảng viên" và "Hệ thống". Giảng viên: "Chọn bài tập của mình", "Bấm nút Sửa". Hệ thống: "Load dữ liệu cũ lên Form nhập liệu". Giảng viên: "Thay đổi nội dung", "Bấm nút Cập nhật". Chuyển sang Hệ thống: "Cập nhật dữ liệu mới vào CSDL", "Ghi log thao tác vào bảng EXERCISE_AUDIT_LOG", "Hiển thị thông báo thành công" -> Kết thúc.

## 6. Sơ đồ Xóa bài tập (Xóa mềm - Soft Delete)
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Xóa bài tập. Dùng 2 Swimlanes: "Giảng viên" và "Hệ thống". Giảng viên: "Bấm Xóa bài tập", "Xác nhận đồng ý xóa trên Popup". Chuyển sang Hệ thống: "Không xóa vĩnh viễn dữ liệu", "Cập nhật cờ IsDeleted = 1 trong CSDL", "Ghi log thao tác xóa", "Ẩn bài tập khỏi danh sách hiển thị trên giao diện" -> Kết thúc.

## 7. Sơ đồ Import Bài tập hàng loạt từ File
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Import dữ liệu. Dùng 2 Swimlanes: "Giảng viên" và "Hệ thống". Giảng viên: "Chọn tệp JSON/Excel chứa dữ liệu bài tập", "Bấm Tải lên". Chuyển sang Hệ thống: "Đọc file bằng thư viện Multer". Hình thoi quyết định "Cấu trúc file hợp lệ?". Nếu [Sai]: "Báo lỗi cấu trúc tệp" -> Kết thúc. Nếu [Đúng]: "Phân giải tệp dữ liệu", "Lưu hàng loạt bài tập vào CSDL SQL", "Báo cáo số lượng bản ghi thành công" -> Kết thúc.

## 8. Sơ đồ Khởi chạy Quét AI Trùng lặp
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Quét AI. Dùng 2 Swimlanes: "Admin" và "Hệ thống AI". Admin: "Vào trang quản lý trùng lặp", "Bấm Khởi chạy Quét AI". Chuyển sang Hệ thống AI: "Tính toán mã băm HardHash cho toàn bộ kho bài tập", "Gửi Prompt cho API Groq Llama-3 so sánh ngữ nghĩa". Hình thoi quyết định "Phát hiện trùng lặp > 80%?". Nếu [Có]: "Lưu thông tin cặp bài bị trùng vào bảng DUPLICATE_REPORTS". Nếu [Không]: "Bỏ qua". Cuối cùng ở Hệ thống: "Lập báo cáo tổng kết số lượng", "Hiển thị cho Admin" -> Kết thúc.

## 9. Sơ đồ Đối soát và Gộp bài tập (Merge)
**Prompt:**
> Vẽ một Activity Diagram mô tả quy trình Gộp bài tập. Dùng 2 Swimlanes: "Admin" và "Hệ thống". Admin: "Click xem chi tiết cặp bài tập trùng lặp từ báo cáo AI". Hệ thống: "Mở giao diện so sánh 2 cột song song", "Highlight bôi vàng câu văn giống nhau". Admin: "Kiểm tra dữ liệu". Hình thoi quyết định cho Admin: [Gộp (Merge) Bài B vào Bài A] HOẶC [Bỏ qua]. Nếu chọn [Bỏ qua] -> "Đóng giao diện đối soát" -> Kết thúc. Nếu chọn [Gộp] -> Chuyển sang Hệ thống: "Chuyển toàn bộ lịch sử điểm của sinh viên từ Bài B sang Bài A", "Xóa bỏ Bài B (bản sao)", "Cập nhật trạng thái báo cáo AI thành Đã giải quyết" -> Kết thúc.
