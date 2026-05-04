# BỘ CODE PLANTUML TẠO ACTIVITY DIAGRAM

*Hướng dẫn sử dụng: Copy từng đoạn code bắt đầu bằng `@startuml` đến `@enduml` và dán vào trang web **planttext.com** hoặc công cụ PlantUML (nếu tích hợp trong VS Code). Sơ đồ sẽ tự động sinh ra với định dạng phân làn (Swimlanes).*

---

## 1. Sơ đồ Đăng nhập hệ thống
```plantuml
@startuml
|Người dùng|
start
:Mở trang Đăng nhập;
:Nhập tài khoản và mật khẩu;
|Hệ thống|
:Truy vấn CSDL kiểm tra thông tin;
if (Xác thực hợp lệ?) then ([Sai])
  :Hiển thị thông báo lỗi;
  stop
else ([Đúng])
  :Khởi tạo Session;
  :Lưu log vào bảng LOGIN_HISTORY;
  :Chuyển hướng đến Dashboard;
endif
stop
@enduml
```

## 2. Sơ đồ Khôi phục mật khẩu (OTP)
```plantuml
@startuml
|Giảng viên|
start
:Bấm nút Quên mật khẩu;
:Nhập địa chỉ Email;
|Hệ thống|
if (Email tồn tại trong CSDL?) then ([Không])
  :Hiển thị báo lỗi;
  stop
else ([Có])
  :Sinh mã OTP ngẫu nhiên;
  :Lưu OTP vào bảng PasswordResetOTP;
  :Gửi mã OTP qua Email cho Giảng viên;
endif
|Giảng viên|
:Nhập mã OTP và Mật khẩu mới;
|Hệ thống|
if (OTP hợp lệ & chưa hết hạn?) then ([Sai])
  :Báo lỗi mã OTP không hợp lệ;
  stop
else ([Đúng])
  :Mã hóa Bcrypt mật khẩu mới;
  :Cập nhật mật khẩu vào CSDL;
  :Thông báo đặt lại thành công;
endif
stop
@enduml
```

## 3. Sơ đồ Tra cứu và Xem bài tập (Sinh viên)
```plantuml
@startuml
|Sinh viên|
start
:Truy cập website;
|Hệ thống|
:Load danh sách bài tập mới nhất;
|Sinh viên|
if (Chọn thao tác?) then ([Xem theo Môn học])
  |Hệ thống|
  :Truy vấn bảng MONHOC;
  :Hiển thị danh sách môn học;
elseif (Chọn thao tác?) then ([Lọc bài tập theo môn])
  |Hệ thống|
  :Truy vấn bảng BAITAP theo Khóa ngoại;
  :Hiển thị danh sách bài tập;
elseif (Chọn thao tác?) then ([Xem chi tiết đề bài])
  |Hệ thống|
  :Render định dạng Markdown & Code Snippet;
  :Hiển thị nội dung chi tiết bài tập;
else ([Tìm kiếm - Deep Search])
  |Sinh viên|
  :Nhập từ khóa tìm kiếm;
  |Hệ thống|
  :Lọc dữ liệu từ CSDL SQL Server;
  :Hiển thị danh sách kết quả phù hợp;
endif
stop
@enduml
```

## 4. Sơ đồ Thêm bài tập mới
```plantuml
@startuml
|Giảng viên|
start
:Bấm nút Thêm bài tập mới;
:Soạn thảo nội dung (Markdown);
:Chọn Môn học và Độ khó;
:Đính kèm tệp tin (nếu có);
:Bấm Lưu bài tập;
|Hệ thống|
if (Dữ liệu nhập đầy đủ & hợp lệ?) then ([Sai])
  :Hiển thị cảnh báo yêu cầu nhập lại;
  stop
else ([Đúng])
  :Lưu bản ghi vào bảng BAITAP;
  :Khởi chạy tiến trình ngầm trích xuất Keywords;
  :Cập nhật danh sách hiển thị;
endif
stop
@enduml
```

## 5. Sơ đồ Cập nhật (Sửa) bài tập
```plantuml
@startuml
|Giảng viên|
start
:Chọn bài tập cần chỉnh sửa;
:Bấm nút Sửa;
|Hệ thống|
:Load dữ liệu cũ lên Form nhập liệu;
|Giảng viên|
:Thay đổi nội dung yêu cầu bài tập;
:Bấm nút Cập nhật;
|Hệ thống|
if (Validate dữ liệu hợp lệ?) then ([Sai])
  :Hiển thị thông báo lỗi;
  stop
else ([Đúng])
  :Cập nhật dữ liệu mới vào CSDL;
  :Ghi log thao tác vào bảng EXERCISE_AUDIT_LOG;
  :Hiển thị thông báo cập nhật thành công;
endif
stop
@enduml
```

## 6. Sơ đồ Xóa bài tập (Xóa mềm - Soft Delete)
```plantuml
@startuml
|Giảng viên|
start
:Chọn bài tập cần xóa;
:Bấm nút Xóa bài tập;
|Hệ thống|
:Hiển thị Popup yêu cầu xác nhận;
|Giảng viên|
if (Xác nhận đồng ý xóa?) then ([Không])
  stop
else ([Có])
  |Hệ thống|
  :Bật cờ IsDeleted = 1 trong bảng BAITAP;
  :Ghi log thao tác xóa;
  :Ẩn bài tập khỏi giao diện danh sách;
endif
stop
@enduml
```

## 7. Sơ đồ Import Bài tập hàng loạt từ File
```plantuml
@startuml
|Giảng viên|
start
:Chọn tệp JSON/Excel chứa danh sách bài tập;
:Bấm Tải lên tệp;
|Hệ thống|
:Đọc nội dung tệp bằng thư viện Multer;
if (Cấu trúc file hợp lệ?) then ([Sai])
  :Hiển thị báo lỗi định dạng cấu trúc tệp;
  stop
else ([Đúng])
  :Phân giải tệp dữ liệu;
  :Thực thi insert hàng loạt vào SQL Server;
  :Hiển thị báo cáo số lượng bản ghi thành công;
endif
stop
@enduml
```

## 8. Sơ đồ Khởi chạy Quét AI Trùng lặp
```plantuml
@startuml
|Admin|
start
:Truy cập trang Quản lý Đối soát;
:Bấm nút Khởi chạy Quét AI;
|Hệ thống|
:Tính toán mã băm (HardHash) cho toàn bộ kho bài;
:Gửi Prompt gọi API Groq Llama-3 so sánh ngữ nghĩa;
if (Phát hiện trùng lặp > 80%?) then ([Không])
  :Hiển thị thông báo 'Kho dữ liệu sạch';
  stop
else ([Có])
  :Lưu thông tin các cặp bài bị trùng vào DUPLICATE_REPORTS;
  :Cập nhật số lượng và hiển thị danh sách cho Admin;
endif
stop
@enduml
```

## 9. Sơ đồ Đối soát và Gộp bài tập (Merge)
```plantuml
@startuml
|Admin|
start
:Click 'Xem chi tiết' cặp bài tập trùng lặp;
|Hệ thống|
:Mở giao diện so sánh song song 2 cột;
:Highlight bôi vàng các câu văn trùng nhau;
|Admin|
:Kiểm tra đối soát nội dung hai bài;
if (Quyết định xử lý?) then ([Bỏ qua])
  :Đóng giao diện đối soát;
else ([Gộp Bài B vào Bài A])
  |Hệ thống|
  :Chuyển toàn bộ lịch sử điểm của sinh viên từ Bài B sang Bài A;
  :Xóa bỏ Bài B (Bản sao) khỏi CSDL;
  :Cập nhật trạng thái báo cáo AI thành Đã giải quyết;
endif
stop
@enduml
```
