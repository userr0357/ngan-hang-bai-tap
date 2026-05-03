# CHI TIẾT ĐẶC TẢ CÁC USE CASE CỦA HỆ THỐNG

Dưới đây là bảng đặc tả chi tiết cho toàn bộ các chức năng (Use Case) trong hệ thống Ngân hàng bài tập lập trình, được phân chia theo từng tác nhân (Actor) cụ thể.

---

## I. NHÓM USE CASE CHUNG (XÁC THỰC)

### Bảng 1: Đặc tả Use Case "Đăng nhập hệ thống"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Đăng nhập hệ thống |
| **Ngữ cảnh** | Giảng viên hoặc Admin truy cập vào hệ thống để bắt đầu phiên làm việc. |
| **Mô tả** | Người dùng nhập Tên đăng nhập và Mật khẩu để xác thực quyền truy cập vào trang quản trị. |
| **Tác nhân (Actor)** | Giảng viên, Admin |
| **Sự kiện** | Người dùng mở trang Login và yêu cầu đăng nhập. |
| **Kết quả** | Đăng nhập thành công, hệ thống cấp Session/Token và chuyển hướng đến Dashboard tương ứng. |
| **Luồng sự kiện** | **Actor:** Nhập username & password → Nhấn "Đăng nhập".<br>**System:** Kiểm tra thông tin trong bảng `GIANGVIEN`. <br>- Nếu đúng: Tạo Session, lưu lịch sử vào `LOGIN_HISTORY`, chuyển trang.<br>- Nếu sai: Hiển thị thông báo lỗi "Tài khoản hoặc mật khẩu không chính xác". |

### Bảng 2: Đặc tả Use Case "Khôi phục mật khẩu (OTP)"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Khôi phục mật khẩu (Quên mật khẩu) |
| **Ngữ cảnh** | Giảng viên quên mật khẩu đăng nhập. |
| **Mô tả** | Hệ thống gửi mã OTP qua Email để giảng viên xác thực và đặt lại mật khẩu mới. |
| **Tác nhân** | Giảng viên |
| **Sự kiện** | Giảng viên bấm "Quên mật khẩu" và nhập Email. |
| **Kết quả** | Mật khẩu mới được cập nhật thành công vào cơ sở dữ liệu. |
| **Luồng sự kiện** | **Actor:** Nhập Email yêu cầu.<br>**System:** Khởi tạo mã OTP, lưu vào bảng `PasswordResetOTP` và gửi Email.<br>**Actor:** Nhập mã OTP và Mật khẩu mới.<br>**System:** Kiểm tra mã OTP (đúng/hết hạn). Nếu hợp lệ, mã hóa mật khẩu mới (Bcrypt) và lưu DB. |

---

## II. NHÓM USE CASE DÀNH CHO SINH VIÊN

### Bảng 3: Đặc tả Use Case "Tra cứu bài tập (Deep Search)"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Tra cứu và xem chi tiết bài tập |
| **Ngữ cảnh** | Sinh viên cần tìm bài tập lập trình để luyện tập theo môn học. |
| **Mô tả** | Sinh viên sử dụng thanh tìm kiếm, bộ lọc (Độ khó, Môn học, Dạng bài) để tìm đề bài và xem nội dung chi tiết. |
| **Tác nhân** | Sinh viên |
| **Sự kiện** | Sinh viên truy cập trang chủ hoặc nhập từ khóa vào ô tìm kiếm. |
| **Kết quả** | Hệ thống hiển thị danh sách bài tập phù hợp và trang chi tiết đề bài (có định dạng Markdown, Code snippet). |
| **Luồng sự kiện** | **Actor:** Chọn bộ lọc hoặc nhập từ khóa tìm kiếm.<br>**System:** Truy vấn CSDL (LIKE, JOIN bảng MONHOC) và trả về danh sách.<br>**Actor:** Click vào một bài tập.<br>**System:** Render giao diện chi tiết, highlight các vùng chứa mã nguồn (Code syntax). |

---

## III. NHÓM USE CASE QUẢN LÝ BÀI TẬP (GIẢNG VIÊN)

### Bảng 4: Đặc tả Use Case "Thêm mới bài tập"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Thêm mới bài tập |
| **Ngữ cảnh** | Giảng viên muốn bổ sung một đề bài mới vào kho tài nguyên. |
| **Mô tả** | Giảng viên điền thông tin đề bài (Mô tả, Yêu cầu, File đính kèm) thông qua trình soạn thảo hỗ trợ Markdown. |
| **Tác nhân** | Giảng viên |
| **Sự kiện** | Giảng viên bấm nút "Thêm bài tập mới". |
| **Kết quả** | Bài tập được lưu vào SQL Server và tự động trích xuất từ khóa ẩn bởi tiến trình ngầm. |
| **Luồng sự kiện** | **Actor:** Nhập thông tin, chọn Môn học, Độ khó, Dạng bài, đính kèm file (nếu có) → Nhấn "Lưu".<br>**System:** Validate dữ liệu trống.<br>**System:** Lưu bản ghi vào bảng `BAITAP`, lưu log vào `EXERCISE_AUDIT_LOG`. Hiển thị thông báo thành công. |

### Bảng 5: Đặc tả Use Case "Cập nhật bài tập"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Cập nhật / Sửa bài tập |
| **Ngữ cảnh** | Giảng viên phát hiện lỗi sai trong đề bài hoặc muốn cập nhật nội dung. |
| **Mô tả** | Giảng viên thay đổi thông tin của bài tập do chính mình tạo ra. |
| **Tác nhân** | Giảng viên |
| **Sự kiện** | Giảng viên chọn "Sửa" trên một bài tập cụ thể. |
| **Kết quả** | Dữ liệu cũ được ghi đè, ghi nhận lịch sử chỉnh sửa vào hệ thống. |
| **Luồng sự kiện** | **Actor:** Bấm Sửa, thay đổi nội dung → Nhấn "Cập nhật".<br>**System:** Kiểm tra quyền (chỉ tác giả mới được sửa). Cập nhật DB, lưu log vào `EXERCISE_AUDIT_LOG` để truy vết. |

### Bảng 6: Đặc tả Use Case "Xóa bài tập (Soft Delete)"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Xóa bài tập |
| **Ngữ cảnh** | Giảng viên muốn gỡ bỏ một bài tập lỗi hoặc đã cũ. |
| **Mô tả** | Bài tập không bị xóa vĩnh viễn khỏi Database mà chỉ được chuyển trạng thái (IsDeleted = true) để tránh lỗi lịch sử chấm điểm. |
| **Tác nhân** | Giảng viên |
| **Sự kiện** | Giảng viên nhấn nút "Xóa" và xác nhận. |
| **Kết quả** | Bài tập bị ẩn khỏi danh sách hiển thị của Sinh viên. |
| **Luồng sự kiện** | **Actor:** Bấm Xóa → Xác nhận Popup.<br>**System:** Chuyển cờ `IsDeleted = 1` trong bảng `BAITAP`. Lưu vết thao tác xóa. |

### Bảng 7: Đặc tả Use Case "Nhập liệu bài tập hàng loạt (Import)"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Nhập liệu bài tập hàng loạt (Import) |
| **Ngữ cảnh** | Giảng viên có sẵn file Excel/JSON chứa nhiều đề bài và muốn đưa lên hệ thống nhanh chóng. |
| **Mô tả** | Upload file, hệ thống tự động đọc, phân giải và lưu đồng loạt vào CSDL. |
| **Tác nhân** | Giảng viên |
| **Sự kiện** | Giảng viên chọn file và bấm "Tải lên". |
| **Kết quả** | Hàng loạt bài tập được lưu vào Database mà không cần nhập tay từng bài. |
| **Luồng sự kiện** | **Actor:** Chọn file dữ liệu → Bấm Upload.<br>**System:** Đọc cấu trúc file bằng `multer` và `xlsx/json-parser`. Validate từng dòng. <br>**System:** Insert vào bảng `BAITAP`, trả về kết quả (Bao nhiêu bản ghi thành công/thất bại). |

### Bảng 8: Đặc tả Use Case "Xuất dữ liệu bài tập (Export)"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Xuất dữ liệu bài tập (Export) |
| **Ngữ cảnh** | Giảng viên cần sao lưu dữ liệu hoặc chuyển sang hệ thống LMS khác. |
| **Mô tả** | Trích xuất toàn bộ hoặc một nhóm bài tập ra định dạng Excel/JSON. |
| **Tác nhân** | Giảng viên, Admin |
| **Sự kiện** | Người dùng bấm "Xuất dữ liệu". |
| **Kết quả** | Tải xuống file dữ liệu thành công. Ghi nhận lịch sử xuất file. |
| **Luồng sự kiện** | **Actor:** Bấm xuất dữ liệu, chọn định dạng.<br>**System:** Truy vấn DB, ghi ra file stream.<br>**System:** Lưu thông tin vào bảng `EXPORT_LOG` (Ai tải, lúc mấy giờ, bao nhiêu dòng). Gửi file cho Client tải về. |

---

## IV. NHÓM USE CASE TRÍ TUỆ NHÂN TẠO & CHỐNG TRÙNG LẶP (ADMIN)

### Bảng 9: Đặc tả Use Case "Quét bài tập trùng lặp (AI Groq)"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Khởi chạy tiến trình AI quét trùng lặp |
| **Ngữ cảnh** | Admin định kỳ kiểm tra xem các giảng viên có copy bài tập của nhau đẩy lên hệ thống gây rác dữ liệu hay không. |
| **Mô tả** | Khởi động thuật toán HardHash và gọi API Groq Llama-3 để so sánh ngữ nghĩa chéo toàn bộ các bài tập. |
| **Tác nhân** | Admin |
| **Sự kiện** | Admin bấm nút "Chạy rà quét trùng lặp". |
| **Kết quả** | Tiến trình chạy nền hoàn tất. Hệ thống lập báo cáo số lượng cặp bài tập bị trùng lặp. |
| **Luồng sự kiện** | **Actor:** Yêu cầu chạy quét AI.<br>**System:** Tạo Log mới trong `DUPLICATE_LOG`.<br>**System:** Quét Lớp 1 (Hash mã băm). Quét Lớp 2 (Gửi Prompt so sánh ngữ nghĩa cho AI Groq). <br>**System:** Nếu phát hiện tỷ lệ giống > 80%, lưu vào bảng `DUPLICATE_REPORTS`. |

### Bảng 10: Đặc tả Use Case "Đối soát và Gộp bài tập (Merge)"
| Mục | Nội dung |
| :--- | :--- |
| **Tên Use Case** | Đối soát và Gộp bài tập trùng lặp |
| **Ngữ cảnh** | AI đã báo cáo các bài tập trùng lặp, Admin cần xem xét thủ công để gộp chúng lại làm một. |
| **Mô tả** | Giao diện hiển thị song song (Side-by-side) 2 bài tập, bôi vàng (highlight) các câu văn giống hệt nhau để Admin dễ quan sát và bấm Gộp. |
| **Tác nhân** | Admin |
| **Sự kiện** | Admin click "Xem chi tiết" trên báo cáo trùng lặp. |
| **Kết quả** | Bài tập bản sao bị xóa, dữ liệu được gộp vào bài tập gốc. |
| **Luồng sự kiện** | **Actor:** Xem màn hình đối soát 2 cột.<br>**System:** Dùng thuật toán Longest Common Subsequence để highlight chữ màu vàng.<br>**Actor:** Bấm "Gộp bài B vào bài A".<br>**System:** Cập nhật khóa ngoại của tất cả sinh viên từng làm bài B sang bài A. Chuyển trạng thái Bài B thành IsDeleted=1. Cập nhật Status trong `DUPLICATE_REPORTS`. |
