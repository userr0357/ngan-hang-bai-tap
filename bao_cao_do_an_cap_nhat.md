# BÁO CÁO PHÁT TRIỂN ỨNG DỤNG
**ĐỀ TÀI: XÂY DỰNG NGÂN HÀNG BÀI TẬP LẬP TRÌNH THEO CẤP ĐỘ ĐỂ PHỤC VỤ HỆ THỐNG GỢI Ý CÁ NHÂN HÓA**

*(Ghi chú: Dưới đây là nội dung báo cáo đã được cập nhật hoàn toàn theo hiện trạng hệ thống mới nhất của bạn. Tại những vị trí có thẻ `[CHÈN HÌNH ẢNH: ...]`, bạn vui lòng chụp ảnh màn hình hệ thống thực tế và dán vào file Word).*

---

## Lời nói đầu
Trong bối cảnh giáo dục hiện đại đang liên tục đổi mới theo hướng số hóa và cá nhân hóa trải nghiệm học tập, nhu cầu xây dựng một hệ thống ngân hàng bài tập trực tuyến trở nên cấp thiết hơn bao giờ hết. Đồ án "Xây dựng Ngân hàng Bài tập Lập trình" được phát triển nhằm mục tiêu tối ưu hóa việc quản lý nội dung bài tập, hỗ trợ giảng viên trong quá trình giảng dạy và giúp sinh viên tiếp cận nguồn tài liệu phong phú, được phân loại rõ ràng theo từng môn học, dạng bài và mức độ khó.

Trong quá trình thực hiện đồ án, chúng tôi đã nâng cấp từ kiến trúc lưu trữ dữ liệu tập tin cơ bản lên sử dụng Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ **Microsoft SQL Server**, kết hợp với Backend **Node.js/Express.js** và giao diện Frontend linh hoạt bằng Vanilla JavaScript. Đặc biệt, hệ thống đã được tích hợp thuật toán tìm kiếm thông minh với khả năng nhận diện từ khóa AI (AI Keywords) và xử lý triệt để các vấn đề về bảng mã Unicode Tiếng Việt (NFD/NFC).

---

## Chương 1. TỔNG QUAN VỀ ĐỀ TÀI
### 1.1. Lý do chọn đề tài
Việc chuyển dịch từ quản lý bài tập thủ công, lưu trữ trên các tập tin rời rạc sang một hệ thống quản lý tập trung và tự động hóa là xu hướng tất yếu. Một ngân hàng bài tập trực tuyến chuyên nghiệp không chỉ giúp tránh thất lạc dữ liệu mà còn cho phép phân loại bài tập theo các tiêu chí (Độ khó, Dạng bài, Môn học). Hơn nữa, việc tích hợp tìm kiếm nhanh theo ngữ nghĩa và từ khóa tự động (AI Keywords) giúp tối ưu hóa thời gian tra cứu cho cả giảng viên và sinh viên.

### 1.2. Mục tiêu đề tài
### 1.1.3. So sánh với hệ thống tương tự
Ý tưởng xây dựng Dự án ngân hàng bài tập được dựa trên ý kiến tham khảo từ các giảng viên Khoa CNTT của trường Đại Học Lạc Hồng. Thay vì so sánh để tìm ra "điểm yếu" của một nền tảng khổng lồ như Quizlet, đồ án tập trung đánh giá **sự phù hợp miền ứng dụng (Domain-Specific Suitability)**. 

Bảng dưới đây phân tích những điểm mạnh của Quizlet, đi kèm với những hạn chế khi áp dụng mô hình này vào đặc thù giảng dạy chuyên ngành lập trình, từ đó làm nổi bật lý do cần thiết phải xây dựng hệ thống Ngân hàng Bài tập (Đồ án):

| Ưu điểm của nền tảng đại trà (Quizlet) | Điểm hạn chế khi áp dụng cho Khoa CNTT (Lý do xây dựng Đồ án) |
| :--- | :--- |
| **Kho nội dung phong phú:** Quizlet có số lượng bài tập, flashcard cực kỳ lớn, được tạo bởi cộng đồng toàn cầu → giúp người học tìm kiếm tài liệu. | **Chất lượng không đồng đều:** Do ai cũng tạo được, nội dung dễ sai lệch. *Hệ thống Đồ án khắc phục bằng cách chỉ cho phép Giảng viên thêm bài tập.* |
| **Tính năng học đa dạng:** Nhiều chế độ làm bài như Flashcard, Learn, Test, Matching giúp tăng hứng thú học tập. | **Không phù hợp môn cấu trúc phức tạp:** Quizlet yếu trong dạng bài lập trình, toán. *Hệ thống Đồ án hỗ trợ Markdown để chèn Code snippet, Testcase chuyên sâu.* |
| **Giao diện đơn giản – dễ sử dụng:** Thiết kế trực quan, hỗ trợ mobile mạnh mẽ, người dùng dễ tiếp cận. | **Thống kê chuyên sâu bị hạn chế:** Nhiều chế độ báo cáo bị khóa ở gói trả phí. *Hệ thống Đồ án cung cấp Dashboard thống kê toàn diện, miễn phí nội bộ.* |
| **Khả năng chia sẻ mạnh:** Cho phép chia sẻ bài tập, nhúng vào website / LMS rất thuận tiện cho giảng viên. | **Thiếu quản lý bài tập chuyên sâu:** Không phân loại theo *Môn học – Dạng bài – Độ khó*. *Hệ thống Đồ án phân cấp dữ liệu chặt chẽ theo chuẩn đào tạo.* |
| **Hỗ trợ đa nền tảng:** Chạy tốt trên web, iOS, Android, đồng bộ hóa dữ liệu nhanh. | **Không có cơ chế phân quyền rõ ràng:** Người dạy và người học không tách biệt. *Hệ thống Đồ án áp dụng phân quyền RBAC (Admin, Giảng viên, Sinh viên).* |
| **Tính cộng đồng mạnh:** Có thể học từ nội dung người khác tạo, tiết kiệm thời gian xây dựng bài tập mới. | **Dễ bị trùng lặp dữ liệu:** Nhiều bộ bài copy lẫn nhau. *Hệ thống Đồ án tích hợp AI Groq và HardHash để tự quét và gộp (Merge) bài trùng lặp.* |
| **Nhúng hình ảnh và âm thanh dễ dàng:** Phù hợp cho các môn học cần minh họa trực quan. | **Giới hạn mô tả dài:** Khó tổ chức bài tập dài (cơ sở dữ liệu, báo cáo). *Hệ thống Đồ án lưu trữ đề bài không giới hạn format văn bản lập trình.* |

Thông qua sự đối chiếu này, đồ án không đi vào vết xe đổ của việc "phát minh lại bánh xe" thay thế Quizlet, mà tập trung làm cực kỳ tốt một ngách duy nhất: **Số hóa và Quản trị bài tập lập trình chuyên sâu**.

---

## Chương 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ ÁP DỤNG

### 2.1. Nền tảng Backend: Node.js và Express.js
Hệ thống sử dụng Node.js làm môi trường chạy mã JavaScript phía máy chủ và Express.js làm framework để định tuyến các RESTful API. Express.js cho phép xử lý nhanh gọn các HTTP request từ phía client, phân quyền (routing) rành mạch giữa trang của Sinh viên và trang quản lý của Admin.

### 2.2. Cơ sở dữ liệu: Microsoft SQL Server
Hệ thống sử dụng SQL Server để lưu trữ dữ liệu đảm bảo tính toàn vẹn và khả năng truy vấn phức tạp. Thư viện `mssql` trong Node.js được dùng để kết nối và thực thi các Stored Procedure, Query. CSDL chia thành các bảng có mối quan hệ chuẩn hóa: `BAITAP` (Bài tập chính), `DANGBAI` (Dạng bài), `MONHOC` (Môn học), `GIANGVIEN` (Giảng viên), `DOKHO` (Độ khó) và bảng mở rộng `EXERCISE_FEATURES` (chứa các từ khóa AI Keywords).

### 2.3. Frontend: HTML5, CSS3, và Vanilla JavaScript
Không sử dụng các framework nặng nề, giao diện được xây dựng bằng JavaScript thuần (Vanilla JS) kết hợp với CSS Variables, đem lại tốc độ tải trang cực nhanh. Giao diện được thiết kế tương thích với các nguyên tắc UI/UX hiện đại, có tính năng Sidebar thu gọn (Collapse Sidebar) và chế độ ban đêm (Dark Mode).

---

## Chương 3. NỘI DUNG THỰC HIỆN VÀ CHỨC NĂNG HỆ THỐNG
### 3.1. Các chức năng chính
1. **Quản lý CSDL bài tập bằng SQL:** Thực hiện các thao tác CRUD (Create, Read, Update, Delete) bài tập hoàn toàn thông qua SQL queries an toàn (Sử dụng Parameterized Queries để chống SQL Injection).
2. **Hệ thống tìm kiếm nâng cao (Advanced Search):** Tìm kiếm không phân biệt hoa thường, không giới hạn vị trí từ khóa. Xử lý triệt để khác biệt bảng mã Unicode Tiếng Việt (NFC/NFD) giúp tìm kiếm luôn chính xác dù gõ từ bàn phím nào. Tìm kiếm quét qua Tiêu đề, Nội dung đề bài (Mô tả) và Từ khóa AI.
3. **Cập nhật trạng thái thống kê theo thời gian thực (Live Summary Stats):** Khi người dùng tìm kiếm, các thẻ thống kê tổng số lượng bài, số lượng theo độ khó (Dễ, Trung bình, Khó) tự động cập nhật khớp với số kết quả hiển thị.
4. **Phân trang dạng bài (Pagination):** Xử lý phân trang thông minh, đảm bảo các kết quả tìm kiếm được đẩy lên trang đầu một cách mượt mà.

### 3.2. Sơ đồ mô hình hệ thống

`[CHÈN HÌNH ẢNH: Sơ đồ Use Case tổng quát của hệ thống (bao gồm các actor Sinh viên và Giảng viên, các tác vụ Xem, Tìm kiếm, Thêm, Sửa, Xóa bài tập)]`

#### 3.2.1. Đặc tả Use Case: Trang Sinh Viên
* **Xem danh sách bài tập:** Sinh viên chọn môn học, hệ thống tải danh sách các dạng bài tập và hiển thị theo phân trang.
  `[CHÈN HÌNH ẢNH: Giao diện chọn môn học và hiển thị danh sách dạng bài bên trang Sinh viên]`
* **Tìm kiếm và lọc bài tập:** Sinh viên nhập từ khóa hoặc chọn mức độ khó. Bảng thống kê tự động cập nhật số lượng.
  `[CHÈN HÌNH ẢNH: Giao diện ô tìm kiếm đang gõ từ khóa và kết quả lọc bài tập hiển thị bên dưới, cùng với bảng Stats tự cập nhật]`
* **Xem chi tiết đề bài:** Click vào card bài tập sẽ hiện Modal chứa mô tả chi tiết, tiêu chí chấm điểm và yêu cầu đầu ra.
  `[CHÈN HÌNH ẢNH: Cửa sổ Modal hiện lên (Popup) chi tiết nội dung của một bài tập khi click vào card]`

#### 3.2.2. Đặc tả Use Case: Trang Admin / Giảng Viên
* **Bảng điều khiển chung (Dashboard):** Thống kê tổng số bài tập, số môn học, số giảng viên đóng góp.
  `[CHÈN HÌNH ẢNH: Giao diện Dashboard tổng quan trang Admin với các thẻ Thống kê (Tổng bài tập, Thêm 7 ngày qua...)]`
* **Quản lý danh sách toàn bộ bài tập:** Bảng table hiển thị danh sách bài tập của toàn bộ giảng viên, phân trang 20 bài/trang. Có bộ lọc theo Môn học, Giảng viên, Cấp độ và Thanh tìm kiếm (NFC/NFD).
  `[CHÈN HÌNH ẢNH: Giao diện Table "Danh sách bài tập" với các cột (Tên bài tập, Môn học, Giảng viên, Cấp độ...)]`
  `[CHÈN HÌNH ẢNH: Giao diện thanh tìm kiếm và các ô Dropdown để lọc bài tập bên Admin]`
* **Thêm mới bài tập:** Giao diện Form thêm bài tập với các trường nhập liệu đầy đủ (Môn, Dạng, Độ khó, Nội dung Markdown, AI Keywords).
  `[CHÈN HÌNH ẢNH: Giao diện Form "Thêm bài tập" (có các ô input nhập tên, dropdown chọn độ khó, text area cho mô tả)]`
* **Sửa / Cập nhật bài tập:** Cho phép giảng viên sửa nội dung đề bài và cập nhật từ khóa AI vào CSDL.
  `[CHÈN HÌNH ẢNH: Giao diện Form sửa bài tập đang được điền sẵn dữ liệu cũ để chỉnh sửa]`
* **Xóa bài tập:** Cảnh báo trước khi xóa. Dữ liệu có thể được xóa mềm (Soft delete) hoặc xóa cứng tùy cấu hình SQL.
  `[CHÈN HÌNH ẢNH: Giao diện thông báo/cảnh báo xác nhận khi bấm nút Xóa một bài tập]`

---

## Chương 4. THIẾT KẾ VÀ CÀI ĐẶT HỆ THỐNG
### 4.1. Thiết kế dữ liệu (Data Design - MS SQL Server)
Kiến trúc CSDL đã được dịch chuyển sang mô hình quan hệ (RDBMS).
`[CHÈN HÌNH ẢNH: Sơ đồ ERD hoặc hình chụp cấu trúc các bảng trong SQL Server Management Studio (Bảng BAITAP, MONHOC, DANGBAI...)]`

* **Bảng BAITAP:** Lưu thông tin cốt lõi `Id`, `MaBaiTap`, `TenBaiTap`, `MoTa`, `MaDoKho`, `MaDangBai`, `MaMon`, `MaGiangVien`.
* **Bảng EXERCISE_FEATURES:** Lưu các trường dữ liệu nâng cao, đặc biệt là `AI_Keywords` phục vụ bộ máy tìm kiếm không cần index toàn văn (Full-text search).
  `[CHÈN HÌNH ẢNH: Chụp kết quả câu lệnh SELECT từ bảng EXERCISE_FEATURES hiển thị cột AI_Keywords]`

### 4.2. Thiết kế giao diện (UI/UX)
* **Sidebar (Thanh bên):** Được thiết kế icon-first, có thể thu gọn vào để tăng không gian làm việc.
  `[CHÈN HÌNH ẢNH: Sidebar ở trạng thái mở rộng bình thường]`
  `[CHÈN HÌNH ẢNH: Sidebar ở trạng thái thu gọn (Collapse) chỉ hiển thị các Icon]`
* **Chế độ Sáng/Tối (Theme Toggle):** Dễ dàng chuyển đổi giúp bảo vệ mắt.
  `[CHÈN HÌNH ẢNH: Giao diện toàn hệ thống ở chế độ Dark Mode]`
  `[CHÈN HÌNH ẢNH: Giao diện toàn hệ thống ở chế độ Light Mode]`

### 4.3. Cấu trúc thư mục
`[CHÈN HÌNH ẢNH: Chụp cây thư mục dự án trong Visual Studio Code]`
- `/public/`: Chứa các tài nguyên giao diện
  - `index.html`: Giao diện chính cho Sinh viên.
  - `admin.html`: Giao diện Dashboard cho Giảng viên.
  - `app.js` & `admin.js`: File logic Javascript cho frontend.
  - `styles.css`: CSS dùng chung, quản lý màu sắc theo biến `--var`.
- `/server.js`: Khởi tạo Server Node.js Express.
- `/admin-routes.js`: Định tuyến API (GET/POST/PUT/DELETE) cho Admin.
- `/db-sql.js`: Xử lý toàn bộ logic kết nối SQL Server (Dùng `mssql` pool).

---

## Chương 5. KIỂM THỬ HỆ THỐNG
### 5.1. Kiểm thử tìm kiếm chuẩn Unicode (Edge Cases)
- **Mục đích:** Đảm bảo hệ thống bắt được các từ khóa tiếng Việt không đồng nhất về bảng mã (Ví dụ: `lập trình` gõ trên Windows vs Mac).
- **Kết quả:** Nhờ hàm `normalize('NFC')` và `normalize('NFD')` ở cả Front-end (`app.js`) và SQL Backend (`admin-routes.js`), hệ thống trả về kết quả khớp 100% không bị sót (missing records).
`[CHÈN HÌNH ẢNH: Chụp màn hình Console log hoặc giao diện khi search từ khóa Tiếng Việt có dấu]`

### 5.2. Kiểm thử cập nhật số liệu thời gian thực (Live Summary Stats)
- **Mục đích:** Test xem khi lọc độ khó hoặc gõ từ khóa, thẻ TỔNG BÀI TẬP trên trang Sinh viên có đổi thành KẾT QUẢ TÌM KIẾM và đếm đúng số lượng thẻ được render hay không.
- **Kết quả:** JS logic lọc dữ liệu mảng trước khi phân trang (Pagination) đảm bảo các con số luôn chính xác.
`[CHÈN HÌNH ẢNH: Chụp thẻ "Kết quả tìm kiếm" thay đổi số đếm hiển thị trên UI]`

### 5.3. Kiểm thử phân trang (Pagination logic)
- **Mục đích:** Khi từ khóa nằm ở bài tập của Dạng 5 (vốn dĩ thuộc trang 3 nếu không tìm kiếm), bộ lọc phải đưa Dạng 5 lên trang 1 ngay lập tức.
- **Kết quả:** Fix triệt để tình trạng lỗi mảng rỗng. Hệ thống render trang 1 với đầy đủ nội dung khớp với từ khóa tìm kiếm.
`[CHÈN HÌNH ẢNH: Chụp vùng phân trang "Trang 1 / ..." ở dưới cùng giao diện sau khi tìm kiếm]`

---

## Chương 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
### 6.1. Kết quả đạt được
Hệ thống Ngân hàng bài tập hiện tại đã chuyển mình thành một nền tảng Web-app mạnh mẽ. Khắc phục được những hạn chế của CSDL dạng file (JSON), hệ thống SQL Server đáp ứng được truy xuất lượng dữ liệu lớn. Chức năng tìm kiếm sâu (Deep Search) vào Mô tả và AI Keywords đã hoạt động vô cùng chuẩn xác. Giao diện trực quan, mượt mà và hỗ trợ tốt cho trải nghiệm người dùng.

### 6.2. Hướng phát triển tương lai
- Hoàn thiện hệ thống "Gợi ý cá nhân hóa": Áp dụng thuật toán Recommender System dựa trên độ khó bài tập sinh viên vừa giải được, từ đó máy tính tự đề xuất các bài tập ở mức độ phù hợp tiếp theo.
- Tích hợp Code Editor (Trình soạn thảo mã) trực tiếp trên Web, cho phép sinh viên nộp bài và chấm tự động.
- ...
