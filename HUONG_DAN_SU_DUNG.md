# 📖 Hướng Dẫn Sử Dụng Hệ Thống "Ngân Hàng Bài Tập"

Chào mừng bạn đến với tài liệu hướng dẫn sử dụng hệ thống. Vui lòng làm theo các hướng dẫn bên dưới tương ứng với vai trò (Quyền) của bạn.

---

## 1. Dành cho Sinh viên
Sinh viên sử dụng hệ thống chủ yếu để tìm kiếm tài liệu thực hành và nộp bài tập.

* **Bước 1: Đăng nhập/Đăng ký:** Truy cập trang chủ, nếu chưa có tài khoản, nhấn "Đăng ký" và chọn vai trò `Sinh viên`. Đăng nhập bằng Tên tài khoản và Mật khẩu.
* **Bước 2: Khám phá Ngân hàng bài tập:** 
  * Ngay tại màn hình chính, bạn sẽ thấy danh sách toàn bộ bài tập.
  * Sử dụng các ô lọc ở phía trên (Bộ lọc Môn học, Dạng bài, Độ khó) để tìm nhanh bài tập mình cần làm.
  * Gõ từ khóa vào thanh Tìm kiếm nếu cần tìm bài tập cụ thể.
* **Bước 3: Xem và Nộp bài:**
  * Nhấn vào thẻ bài tập để xem chi tiết yêu cầu, mô tả và tải file đính kèm về máy (nếu có).
  * Ở cuối màn hình chi tiết sẽ có khu vực **Nộp bài**. Bạn có thể tải lên file code hoặc điền trực tiếp câu trả lời vào ô văn bản (tùy vào định dạng mà Giảng viên quy định).
* **Mẹo nhỏ:** Nhấn nút biểu tượng Mặt trăng ở góc trên cùng bên phải để bật Chế độ Tối (Dark Mode) bảo vệ mắt khi code đêm.

---

## 2. Dành cho Giảng viên
Giảng viên sử dụng hệ thống để thiết kế kho bài tập và theo dõi thống kê. Do tài khoản Giảng viên cần có tính xác thực, sau khi bạn đăng ký xong, hãy đợi **Admin phê duyệt** thì mới có thể đăng nhập.

* **Bước 1: Theo dõi Tổng quan (Dashboard):** 
  * Khi đăng nhập thành công, bạn sẽ vào màn hình Dashboard. Tại đây có 4 thẻ thống kê: Tổng Bài Tập, Môn Học, Dạng Bài, Cấp Độ.
  * Bạn có thể bấm thẳng vào các thẻ này để hệ thống cuộn nhanh đến các biểu đồ phân tích kỹ năng tương ứng bên dưới.
* **Bước 2: Quản lý Danh sách Bài tập:**
  * Chuyển sang Tab `Danh sách Bài tập` trên thanh Menu trái.
  * Tại đây, bạn có thể TÌM KIẾM bài tập của riêng mình, sửa, xóa hoặc tạo bài mới.
* **Bước 3: Thêm Bài Tập Mới (Sức mạnh AI):**
  * Bấm nút **"Thêm bài tập"** ở góc trên cùng bên phải.
  * Điền Tên bài, chọn Môn học và Dạng bài.
  * Thay vì tự gõ tay, hãy bấm nút 🌟 **"Sinh nội dung bằng AI"**. Chỉ cần nhập vài dòng yêu cầu vắn tắt, AI sẽ tự động viết toàn bộ mô tả chuẩn Markdown, sinh ra danh sách yêu cầu chi tiết và thiết lập sẵn bảng tiêu chí chấm điểm (Rubric).
  * Bạn có thể nhấn thêm nút 🔍 **"Kiểm tra trùng lặp"** để AI rà soát xem đề bài này có bị trùng với bất kì giảng viên nào khác đã đăng trước đó không.
  * Gắn file đính kèm bằng cách **Kéo Thả** file vào khung nét đứt màu xanh. Cuối cùng, bấm "Lưu bài tập".
* **Bước 4: Nhập bằng Excel (Import):**
  * Bấm nút "Nhập Excel" để tải lên file danh sách bài tập nếu bạn có sẵn thư viện bài tập trong máy tính.

---

## 3. Dành cho Quản trị viên (Admin)
Admin có quyền lực cao nhất, quản trị toàn bộ hoạt động để giữ hệ thống trơn tru.

* **Bước 1: Quản lý Người dùng (Duyệt tài khoản):**
  * Mở thẻ `Quản lý Users` trên Menu trái.
  * Hệ thống sẽ đánh dấu các tài khoản Giảng viên mới đăng ký đang ở trạng thái `Chờ duyệt`. Hãy nhấn nút "Phê duyệt" để cấp quyền cho họ.
  * Nếu phát hiện tài khoản vi phạm, bạn có thể Khóa (Ban) tài khoản đó tại đây.
* **Bước 2: Quản lý Kho Bài Tập Toàn Cục:**
  * Mở thẻ `Quản lý Bài Tập`. 
  * Admin có quyền xem danh sách bài tập của **TẤT CẢ** các giảng viên. Admin có thể trực tiếp xóa/ẩn bài tập nếu phát hiện sai sót nghiêm trọng.
* **Bước 3: Xuất Dữ Liệu (Export):**
  * Để phục vụ công tác thanh tra hoặc sao lưu, Admin vào mục `Xuất Dữ liệu`.
  * Tại đây, có thể xuất Danh sách tài khoản (Sinh viên/Giảng viên) hoặc Danh sách bài tập ra file `.xlsx` (Excel) hoặc `.csv`. File xuất ra sẽ chứa đầy đủ thông tin để tiện cho việc báo cáo lên khoa.

---

***Cảm ơn bạn đã tin tưởng và sử dụng Hệ thống Ngân hàng bài tập!***
