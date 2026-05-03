# BÁO CÁO PHÁT TRIỂN ỨNG DỤNG
**ĐỀ TÀI: XÂY DỰNG NGÂN HÀNG BÀI TẬP LẬP TRÌNH CHUYÊN SÂU TÍCH HỢP AI VÀ THUẬT TOÁN CHỐNG TRÙNG LẶP**

---

## LỜI NÓI ĐẦU
Xin kính chào quý Thầy Cô trong Hội đồng và Bộ môn Công nghệ Thông tin. Trong suốt quá trình học tập tại Trường Đại học Lạc Hồng, chúng tôi đã có cơ hội tiếp cận nhiều kiến thức chuyên môn và rèn luyện qua các môn học về lập trình, cơ sở dữ liệu và phát triển phần mềm. Dựa trên những nền tảng đó, chúng em đã thực hiện dự án xây dựng **Website Ngân hàng Bài tập Lập trình** - một hệ thống hỗ trợ lưu trữ, quản lý và tra cứu bài tập dành riêng cho sinh viên và giảng viên Khoa CNTT.

Mục tiêu chính của dự án là thiết kế và phát triển một nền tảng trực tuyến giúp tối ưu hóa việc quản lý tài nguyên học thuật. Hệ thống không chỉ dừng lại ở việc lưu trữ dạng văn bản thuần túy, mà còn hỗ trợ soạn thảo bằng Markdown, cho phép nhúng mã nguồn (Code Snippets) và Testcase trực quan. Đặc biệt, để giải quyết bài toán rác dữ liệu, hệ thống tích hợp công nghệ phân tích ngữ nghĩa **AI Groq** và thuật toán **HardHash** nhằm phát hiện, cảnh báo và gộp (Merge) các bài tập trùng lặp.

Trong quá trình thực hiện đồ án, chúng tôi đã áp dụng các kiến thức lập trình Web và tự nghiên cứu các công nghệ mới như Node.js, Express.js, Hệ quản trị cơ sở dữ liệu Microsoft SQL Server, cùng quy trình xây dựng kiến trúc RESTful API. Đồ án được hoàn thành thông qua các bước: khảo sát yêu cầu thực tế, phân tích và thiết kế hệ thống (từ ERD 19 bảng đến các sơ đồ Use Case), xây dựng chức năng và tiến hành kiểm thử.

Chúng tôi xin gửi lời cảm ơn chân thành đến thầy Nguyễn Minh Phúc, người đã hướng dẫn và hỗ trợ chúng em trong suốt quá trình thực hiện đề tài. Những nhận xét và định hướng của thầy đã giúp chúng em hoàn thiện sản phẩm một cách hiệu quả nhất.

Sau cùng, chúng tôi xin kính chúc quý Thầy cô dồi dào sức khỏe để tiếp tục sự nghiệp truyền đạt kiến thức cho thế hệ mai sau. Chúng em xin chân thành cảm ơn!

---

## MỤC LỤC
1. Chương 1: Tổng quan về đề tài
2. Chương 2: Cơ sở lý thuyết và Công nghệ áp dụng
3. Chương 3: Phân tích và Thiết kế hệ thống
4. Chương 4: Triển khai Giao diện và Đánh giá kết quả
5. Chương 5: Tổng kết và Hướng phát triển

---

## CHƯƠNG 1. TỔNG QUAN VỀ ĐỀ TÀI

### 1.1. Lý do chọn đề tài
Việc ứng dụng công nghệ thông tin vào quá trình quản lý và giảng dạy đã không còn mới mẻ với nền giáo dục nước ta hiện nay. Đặc biệt tại các trường Đại học và Cao đẳng khối ngành Công nghệ thông tin (CNTT), số lượng bài tập, đồ án và các bài thực hành lập trình ngày càng gia tăng và đòi hỏi mức độ chuyên sâu cao. 

Cũng chính vì nhu cầu lưu trữ và khai thác kho bài tập ngày càng lớn, việc soạn thảo, quản lý và tái sử dụng tài liệu đã trở thành một vấn đề gây không ít khó khăn cho các giảng viên. Dữ liệu thường bị phân mảnh trên các tập tin rời rạc, dẫn đến khó khăn trong việc phân loại, tra cứu và rất dễ xảy ra tình trạng trùng lặp nội dung bài tập do nhiều giảng viên cùng biên soạn.

Bên cạnh đó, mặc dù sự phát triển của các hệ thống giáo dục đại trà (tiêu biểu như Quizlet hay các nền tảng LMS cơ bản) thu hút nhiều người sử dụng, nhưng chúng lại bộc lộ những khoảng trống lớn khi áp dụng vào đặc thù cấu trúc môn học của ngành CNTT. Đa phần các hệ thống này chưa hỗ trợ tối ưu việc soạn thảo các văn bản có cấu trúc phức tạp (như hiển thị mã nguồn Code snippet) hoặc thiếu đi cơ chế kiểm soát chất lượng dữ liệu nội bộ.

Chính vì vậy, đề tài **“Xây dựng hệ thống Ngân hàng bài tập”** được thực hiện với hy vọng sẽ cung cấp một giải pháp chuyên biệt, giúp cho việc số hóa, lưu trữ và quản trị tập trung kho tài nguyên bài tập lập trình của Khoa CNTT được diễn ra khoa học, bảo mật và dễ dàng.

### 1.2. Mục tiêu của đề tài
* Xây dựng một ứng dụng web (Web-app) cho phép Giảng viên soạn thảo bài tập chuyên sâu bằng công cụ Markdown.
* Tích hợp trí tuệ nhân tạo (AI Groq) và thuật toán HardHash để tự động quét, gộp (merge) các bài tập trùng lặp. 
* Cung cấp cơ chế phân quyền chặt chẽ (RBAC) cho 3 đối tượng: Admin, Giảng viên, Sinh viên.
* Xây dựng Dashboard thống kê trực quan, sẵn sàng trở thành nền tảng lõi phục vụ công tác đào tạo tại trường.

### 1.3. So sánh với hệ thống tương tự
Thay vì so sánh để tìm ra "điểm yếu" của một nền tảng khổng lồ như Quizlet, đồ án tập trung đánh giá **sự phù hợp miền ứng dụng (Domain-Specific Suitability)**. 

| Ưu điểm của nền tảng đại trà (Quizlet) | Điểm hạn chế khi áp dụng cho Khoa CNTT (Lý do xây dựng Đồ án) |
| :--- | :--- |
| **Kho nội dung phong phú:** Quizlet có số lượng bài tập rất lớn từ cộng đồng. | **Chất lượng không đồng đều:** Do ai cũng tạo được, nội dung dễ sai lệch. *Hệ thống Đồ án khắc phục bằng cách chỉ cho phép Giảng viên thêm bài tập.* |
| **Tính năng học đa dạng:** Nhiều chế độ như Flashcard, Match. | **Không phù hợp môn cấu trúc phức tạp:** Quizlet yếu trong dạng bài lập trình. *Hệ thống Đồ án hỗ trợ Markdown để chèn Code snippet.* |
| **Tính cộng đồng mạnh:** Học từ nội dung người khác tạo. | **Dễ bị trùng lặp dữ liệu:** Nhiều bộ bài copy lẫn nhau. *Hệ thống Đồ án tích hợp AI Groq và HardHash để tự quét và gộp bài trùng lặp.* |

---

## CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

### 2.1. Nền tảng Backend: Node.js và Express.js
**2.1.1. Khái niệm**
Node.js là một môi trường chạy JavaScript mã nguồn mở, đa nền tảng, được xây dựng trên engine V8 của Google Chrome. Express.js là một framework web tối giản và linh hoạt dành cho Node.js, cung cấp bộ tính năng mạnh mẽ để phát triển ứng dụng web và API.

**2.1.2. Lý do lựa chọn**
Hệ thống Ngân hàng bài tập yêu cầu khả năng xử lý bất đồng bộ cao (đọc/ghi database liên tục, gọi API AI bên thứ 3). Node.js sử dụng kiến trúc Event-driven và Non-blocking I/O, giúp máy chủ phản hồi cực nhanh mà không bị nghẽn khi có hàng trăm sinh viên truy cập tra cứu bài tập cùng lúc.

### 2.2. Kiến trúc RESTful API
**2.2.1. Khái niệm**
RESTful API đóng vai trò là cầu nối giữa giao diện người dùng và hệ thống xử lý dữ liệu (SQL Server), đảm bảo việc trao đổi thông tin mạch lạc theo định dạng JSON.

**2.2.2. Cấu trúc triển khai trong dự án**
Các API được tách biệt theo module: `admin-routes.js`, `duplicate-routes.js`. Mọi thao tác (CRUD bài tập, Quét AI) đều độc lập với Frontend, giúp hệ thống dễ dàng mở rộng trong tương lai (ví dụ làm thêm App Mobile).

### 2.3. Cơ sở dữ liệu: Microsoft SQL Server
Khác với các phiên bản nháp sử dụng JSON File, hệ thống hiện tại được triển khai trên **Microsoft SQL Server**.
Đây là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mạnh mẽ. SQL Server giải quyết triệt để bài toán truy vấn phức tạp của hệ thống (tìm kiếm theo Môn học, Dạng bài, Độ khó) thông qua hệ thống **19 bảng dữ liệu** liên kết chặt chẽ (Khóa chính, Khóa ngoại) và đảm bảo tính toàn vẹn (ACID). Việc sử dụng các Trigger và Stored Procedure giúp hệ thống xử lý hàng nghìn bài tập mà không bị suy giảm hiệu năng.

### 2.4. Trí tuệ nhân tạo (AI Groq) và Thuật toán HardHash
Hệ thống áp dụng kiến trúc kiểm tra trùng lặp 2 lớp:
1. **Lớp 1 (HardHash):** Mã hóa nội dung bài tập thành chuỗi băm (Hash). Nếu 2 bài tập giống nhau 100% từng dấu chấm phẩy, hệ thống phát hiện ngay lập tức mà không cần tốn tài nguyên.
2. **Lớp 2 (AI Groq Semantic Search):** Phân tích ngữ nghĩa. Nếu 2 bài tập được diễn đạt bằng 2 cách khác nhau nhưng cùng yêu cầu chung một thuật toán, AI sẽ đánh giá mức độ tương đồng (%) và gộp chúng lại.

---

## CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1. Đối tượng sử dụng
* **Admin (Quản trị viên):** Có toàn quyền. Phân công giảng viên giảng dạy, dọn dẹp hệ thống, duyệt các báo cáo gộp bài tập trùng lặp từ AI.
* **Giảng viên:** Thêm, sửa, xóa bài tập của mình. Quản lý sinh viên, xem lịch sử làm bài, gửi phản hồi nội bộ.
* **Sinh viên:** Tra cứu bài tập bằng thanh công cụ Deep Search, xem yêu cầu chi tiết (được highlight code syntax rõ ràng).

### 3.2. Các chức năng cốt lõi của hệ thống

#### 3.2.1. Quản trị Cơ sở dữ liệu Bài tập (CRUD qua MS SQL Server)
Thay vì sử dụng các tệp JSON tĩnh gây nghẽn cổ chai khi dữ liệu lớn, hệ thống hiện tại tương tác trực tiếp với **Microsoft SQL Server**. Backend Node.js thực thi các lệnh truy vấn phức tạp (JOIN, WHERE) thông qua thư viện `mssql` để lưu trữ đồng bộ bài tập cùng với các thông số nâng cao như Môn học, Độ khó, Tiêu chí chấm điểm và File đính kèm. Khóa ngoại đảm bảo tính toàn vẹn tuyệt đối của dữ liệu.

#### 3.2.2. Kiến trúc Xử lý API Backend (RESTful)
Hệ thống cung cấp một bộ API mạnh mẽ, đóng vai trò giao tiếp giữa Client và Server. Các luồng xử lý (routes) được chia nhỏ theo từng nghiệp vụ: `admin-routes.js` (quản lý người dùng, thống kê), `duplicate-routes.js` (xử lý logic quét trùng lặp). Việc trao đổi dữ liệu hoàn toàn bằng định dạng JSON giúp phản hồi giao diện tức thời mà không cần tải lại toàn trang.

#### 3.2.3. Phân quyền RBAC và Quản lý bảo mật (Auth)
Hệ thống áp dụng mô hình phân quyền Role-Based Access Control (RBAC) nghiêm ngặt gồm 3 cấp độ: Sinh viên, Giảng viên và Admin. 
* Sinh viên chỉ được cấp quyền "Read-only" để tra cứu. 
* Giảng viên yêu cầu đăng nhập bằng Mật khẩu mã hóa để thao tác với kho bài tập cá nhân. Đặc biệt, hệ thống tích hợp bảng `LOGIN_HISTORY` để ghi log các phiên làm việc và bảng `PasswordResetOTP` để tự động hóa quy trình cấp lại mật khẩu qua Email.

#### 3.2.4. Nhập liệu hàng loạt (Import) và Xử lý tệp tải lên
Để tiết kiệm thời gian, Giảng viên có thể tải lên một file dữ liệu (JSON/Excel) chứa hàng trăm bài tập. Backend sử dụng thư viện `multer` để tiếp nhận luồng file (stream) và phân giải trực tiếp vào các bảng tương ứng trong SQL Server. Hệ thống cũng cho phép đính kèm các tệp mã nguồn đính kèm (.zip, .pdf) trực tiếp vào yêu cầu của đề bài.

#### 3.2.5. Trích xuất và Lưu vết Dữ liệu (Export & Audit Logging)
Chức năng cho phép Giảng viên hoặc Admin xuất toàn bộ danh sách bài tập hiện hành ra định dạng JSON/Excel phục vụ mục đích sao lưu. Mỗi thao tác xuất dữ liệu đều được hệ thống tự động ghi nhận vào bảng `EXPORT_LOG` (lưu thông tin người xuất, thời gian, số lượng bản ghi) nhằm đảm bảo tính minh bạch và tránh thất thoát dữ liệu của Khoa.

#### 3.2.6. Tích hợp AI và Quét Trùng lặp (Deduplication)
Đây là chức năng "xương sống" và đột phá nhất của đồ án. Hệ thống không còn phải rà soát thủ công, mà sử dụng cơ chế kiểm tra 2 lớp: Thuật toán mã băm HardHash và Gọi API **Trí tuệ nhân tạo (AI Groq)**. Khi phát hiện các bài tập có tỷ lệ ngữ nghĩa giống nhau, hệ thống ghi vào bảng `DUPLICATE_REPORTS`, hiển thị giao diện đối soát 2 cột (Side-by-side comparison) bôi vàng các đoạn văn trùng lặp để Admin ra quyết định Gộp (Merge) hoặc Bỏ qua.

#### 3.2.7. Cơ chế Render Giao diện (SSR và CSR kết hợp)
Hệ thống không chỉ trả về API thuần mà còn sử dụng Express để thiết lập thư mục tĩnh (public/views), gửi các tệp HTML/CSS/JS đến Client. Giao diện được xử lý linh hoạt: phần khung sườn (Header, Sidebar) được render sẵn, còn nội dung chi tiết (Danh sách bài tập, Thống kê biểu đồ) được Client-Side Rendering gọi ngầm API để vẽ lại, mang đến trải nghiệm cực kỳ mượt mà.

### 3.3. Mô hình Use Case
`[CHÈN HÌNH ẢNH: Sơ đồ Use Case tổng quát của hệ thống (Bao gồm Actor Admin, Giảng viên, Sinh viên)]`
* **Use Case Đăng nhập:** Yêu cầu xác thực mật khẩu mã hóa. Có hỗ trợ quên mật khẩu qua OTP.
* **Use Case Quản lý Bài tập (CRUD):** Thêm mới (hỗ trợ đính kèm file, markdown), Cập nhật, Xóa mềm (IsDeleted).
* **Use Case Quét trùng lặp (Admin):** Khởi chạy tiến trình quét toàn bộ Database bằng AI.

### 3.3. Sơ đồ Hoạt động (Activity Diagram)
`[CHÈN HÌNH ẢNH: Sơ đồ Hoạt động (Activity Diagram) cho chức năng Thêm mới Bài tập]`
`[CHÈN HÌNH ẢNH: Sơ đồ Hoạt động cho chức năng Quét và Gộp (Merge) bài tập trùng lặp]`

### 3.4. Thiết kế Cơ sở dữ liệu (ERD)
Cơ sở dữ liệu bao gồm 19 bảng, chia làm 4 nhóm chính:
1. **Nhóm Cốt lõi:** `BAITAP`, `MONHOC`, `DANGBAI`, `DOKHO`, `TIEUCHI_DANGBAI`.
2. **Nhóm Giảng viên:** `GIANGVIEN`, `GIANGVIEN_MONHOC`, `LOGIN_HISTORY`, `EXERCISE_AUDIT_LOG`, `EXPORT_LOG`.
3. **Nhóm Sinh viên:** `students`, `class`, `grading_history`.
4. **Nhóm AI:** `EXERCISE_FEATURES`, `DUPLICATE_REPORTS`, `DUPLICATE_LOG`.

`[CHÈN HÌNH ẢNH: Lược đồ Cơ sở dữ liệu quan hệ (ERD) 19 bảng chụp từ SQL Server Management Studio]`

---

## CHƯƠNG 4. TRIỂN KHAI GIAO DIỆN VÀ ĐÁNH GIÁ KẾT QUẢ

### 4.1. Giao diện Dành cho Sinh viên
Hệ thống cung cấp giao diện tối giản, tập trung vào trải nghiệm đọc đề bài.
`[CHÈN HÌNH ẢNH: Giao diện trang chủ (Dashboard) của Sinh viên, hiển thị thanh tìm kiếm và danh sách bài tập mới nhất]`
`[CHÈN HÌNH ẢNH: Giao diện Xem chi tiết một bài tập lập trình (Có hiển thị vùng Code Snippet định dạng màu sắc rõ ràng, Light/Dark mode)]`

### 4.2. Giao diện Dành cho Giảng viên
Giảng viên được trang bị các công cụ quản lý mạnh mẽ.
`[CHÈN HÌNH ẢNH: Giao diện Quản lý Bài tập (Bảng danh sách bài tập của cá nhân giảng viên)]`
`[CHÈN HÌNH ẢNH: Modal / Màn hình Thêm mới Bài tập (Có thanh công cụ Markdown Editor)]`
`[CHÈN HÌNH ẢNH: Giao diện Thống kê sinh viên (Dữ liệu từ bảng grading_history và students)]`

### 4.3. Giao diện Quản trị viên (Admin) và Tính năng AI
`[CHÈN HÌNH ẢNH: Giao diện Báo cáo Đối soát Trùng lặp (Danh sách các cặp bài tập bị AI bắt trùng)]`
`[CHÈN HÌNH ẢNH: Modal Chi tiết Đối soát (Hiển thị 2 cột song song so sánh bài A và bài B, có bôi vàng (highlight) các câu văn giống nhau)]`
`[CHÈN HÌNH ẢNH: Giao diện Nhật ký Hệ thống (Audit Log, Lịch sử đăng nhập, Xuất dữ liệu Excel)]`

### 4.4. Đánh giá kết quả đạt được
* **Ưu điểm:** Hệ thống hoạt động mượt mà, tốc độ phản hồi nhanh nhờ NodeJS. Giải quyết dứt điểm vấn đề rác dữ liệu bằng mô hình AI. Phân quyền chặt chẽ, bảo mật cao. Thiết kế Database chuẩn hóa 100%.
* **Hạn chế:** Hệ thống AI Groq đôi khi phụ thuộc vào tốc độ mạng quốc tế. Việc chấm code tự động (Auto-grader) trực tiếp trên trình duyệt chưa được tích hợp hoàn chỉnh.

---

## CHƯƠNG 5. TỔNG KẾT VÀ HƯỚNG PHÁT TRIỂN

### 5.1. Tổng kết
Trải qua thời gian nghiên cứu và phát triển, đề tài **“Xây dựng Ngân hàng Bài tập Lập trình chuyên sâu”** đã hoàn thành xuất sắc các mục tiêu đề ra ban đầu. Sản phẩm không chỉ là một kho lưu trữ số hóa, mà còn đóng vai trò như một trợ lý ảo (nhờ tích hợp AI) giúp Ban Chủ nhiệm Khoa dễ dàng quản trị chất lượng tài nguyên giảng dạy.

### 5.2. Hướng phát triển tương lai
* **Tích hợp Compiler Trực tuyến:** Xây dựng môi trường chạy code (Code Execution Environment) bằng Docker để sinh viên nộp bài và nhận kết quả testcase ngay lập tức (Tương tự LeetCode).
* **Hệ thống Gợi ý Cá nhân hóa (Recommender System):** Dựa vào bảng `grading_history`, sử dụng Machine Learning để phân tích điểm yếu của từng sinh viên và tự động đề xuất các dạng bài tập phù hợp nhằm cải thiện kỹ năng.
* **Triển khai Mobile App:** Xây dựng phiên bản ứng dụng di động để sinh viên dễ dàng nhận thông báo bài tập mới mọi lúc mọi nơi.









## 2. Lịch sử nghiên cứu và Các hệ thống liên quan
Trong quá trình tìm hiểu và xây dựng "Ngân hàng bài tập lập trình", nhóm nghiên cứu đã tiến hành khảo sát các nền tảng và công cụ hỗ trợ giảng dạy lập trình hiện có trên thế giới cũng như trong nước. Việc đánh giá ưu, khuyết điểm của các hệ thống này đã cung cấp một góc nhìn tổng quan, từ đó định hình nên các tính năng cốt lõi cho dự án.

### 2.1. Các hệ thống trên thế giới 

#### ❖ Hệ thống LeetCode và HackerRank
LeetCode và HackerRank là hai trong số những nền tảng lớn nhất toàn cầu chuyên cung cấp kho bài tập lập trình thuật toán và hỗ trợ phỏng vấn kỹ thuật. Các nền tảng này được thiết kế cực kỳ tối ưu cho việc giải quyết vấn đề (Problem Solving) với hàng ngàn bài tập được cộng đồng đóng góp.

`[CHÈN HÌNH ẢNH: Giao diện danh sách bài tập được phân loại theo độ khó trên LeetCode]`

Hệ thống cho phép người dùng đọc đề bài (thường được định dạng rất rõ ràng bằng Markdown), viết code trực tiếp trên trình duyệt và tự động chấm điểm thông qua hệ thống Testcase ẩn.

`[CHÈN HÌNH ẢNH: Giao diện chia đôi màn hình đặc trưng của HackerRank: Một bên đọc đề bài, một bên là Code Editor]`

Tuy nhiên, khi xét dưới góc độ là một công cụ quản trị học thuật cho một Khoa/Bộ môn tại trường Đại học, nền tảng này bộc lộ một số ưu và khuyết điểm:

* **Ưu điểm:**
  - Kho câu hỏi, bài tập vô cùng phong phú, phủ sóng mọi chủ đề thuật toán (Array, String, Dynamic Programming, v.v.).
  - Hệ thống Auto-grader (chấm điểm tự động) cực kỳ mạnh mẽ, hỗ trợ hàng chục ngôn ngữ lập trình khác nhau (C++, Java, Python, Node.js...).
  - Giao diện thân thiện, hiện đại, có các chế độ hỗ trợ mắt (Dark mode).

* **Khuyết điểm:**
  - Không hỗ trợ Giảng viên tạo một không gian quản lý bài tập riêng biệt theo chuẩn đào tạo đại học (chia theo Môn học, Chương, Dạng bài).
  - Không có cơ chế phân quyền quản trị nội bộ cho trường học (Mọi người dùng đều đóng vai trò là "Coder").
  - Chức năng thêm câu hỏi riêng tư và quản lý sinh viên đa phần bị khóa lại dưới các gói dành cho Doanh nghiệp (Enterprise) với chi phí đắt đỏ.

#### ❖ Hệ thống GitHub Classroom
GitHub Classroom là một công cụ do GitHub phát triển, giúp giáo viên quản lý bài tập lập trình bằng cách tự động tạo kho lưu trữ (repository) cho mỗi sinh viên dựa trên một bài tập gốc (template).

`[CHÈN HÌNH ẢNH: Giao diện Giảng viên tạo bài tập (Assignment) trên bảng điều khiển của GitHub Classroom]`

Giáo viên có thể sử dụng sức mạnh của Git để theo dõi quá trình làm bài, tích hợp GitHub Actions để chấm điểm (Autograding) và xem lại toàn bộ lịch sử code của sinh viên.

* **Ưu điểm:**
  - Tích hợp sâu với hệ sinh thái GitHub, giúp sinh viên làm quen sớm với các công cụ quản lý mã nguồn chuẩn thực tế.
  - Hoàn toàn miễn phí cho các tổ chức giáo dục.
  - Không giới hạn định dạng bài tập (có thể giao từ bài tập thuật toán đến cả một dự án Web/App phức tạp).

* **Khuyết điểm:**
  - Đường cong học tập (Learning curve) quá dốc: Yêu cầu cả giảng viên và sinh viên phải thành thạo các câu lệnh Git (pull, commit, push), gây khó khăn cho những môn học lập trình cơ bản ở năm nhất.
  - Giao diện quản lý khô khan, không tối ưu cho việc soạn thảo đề bài.
  - Hoàn toàn thiếu cơ chế rà soát bài tập trùng lặp do nhiều giảng viên cùng đưa lên.

### 2.2. Các hệ thống trong nước 

Hiện nay tại Việt Nam, để quản lý tài nguyên và chấm bài tập lập trình, nhiều trường Đại học đang tự triển khai các hệ thống nguồn mở hoặc mua các giải pháp nội bộ. Tuy nhiên, đa số các công cụ này thiên về việc tổ chức các kỳ thi thuật toán (Competitive Programming) chứ chưa giải quyết trọn vẹn bài toán Quản trị ngân hàng tài liệu.

#### ❖ Hệ thống LMS Moodle (Tích hợp plugin CodeRunner)
Moodle là Hệ quản trị đào tạo trực tuyến (LMS) được sử dụng rộng rãi nhất tại các trường Đại học ở Việt Nam. Bằng cách cài đặt thêm các plugin bên thứ 3 (như CodeRunner), giảng viên có thể biến Moodle thành một hệ thống cho phép sinh viên nộp code và chấm tự động.

`[CHÈN HÌNH ẢNH: Giao diện sinh viên làm bài tập lập trình (Plugin CodeRunner) trên hệ thống Moodle]`

* **Ưu điểm:**
  - Tận dụng được ngay nền tảng LMS sẵn có của trường Đại học, không cần cấp lại tài khoản cho sinh viên.
  - Tích hợp được vào Sổ điểm tổng của môn học dễ dàng.
  - Sinh viên có thể nộp bài trực tiếp thông qua khung trả lời câu hỏi.

* **Khuyết điểm:**
  - Giao diện vô cùng cũ kỹ, thiết kế các textbox soạn thảo chật chội, khó khăn trong việc định dạng mã nguồn (Code snippets).
  - Không có một kho lưu trữ "Ngân hàng bài tập" dùng chung cho toàn bộ giảng viên. Các bài tập thường bị "nhốt" trong từng lớp học riêng lẻ.
  - Hoàn toàn không có tính năng phân tích ngữ nghĩa hoặc cảnh báo trùng lặp nội dung khi giảng viên import bài tập từ file.

#### ❖ Các hệ thống Online Judge nội bộ (Dựa trên nền tảng DOMjudge, CMS)
Nhiều trường học (như KHTN, Bách Khoa, UIT) tự dựng các hệ thống Online Judge để sinh viên rèn luyện và thi đấu thuật toán. Hệ thống này cho sinh viên tạo tài khoản, đọc đề và Submit code.

`[CHÈN HÌNH ẢNH: Giao diện xem danh sách bài tập (Problem list) trên một hệ thống Online Judge nội bộ]`

* **Ưu điểm:**
  - Hệ thống chấm bài (Judge) cực kỳ nhanh, chính xác, có tính cạnh tranh cao thông qua Bảng xếp hạng (Leaderboard).
  - Khả năng chịu tải cực tốt trong các kỳ thi có hàng ngàn sinh viên tham gia.

* **Khuyết điểm:**
  - Không phù hợp để quản lý các môn học lý thuyết hoặc đồ án dài hạn. Chỉ phục vụ duy nhất 1 dạng bài (Problem Solving).
  - Giảng viên khó quản lý thống kê điểm số dài hạn theo từng kỹ năng của sinh viên.
  - Khó chia sẻ và tái sử dụng bộ đề do dữ liệu thường bị ẩn hoặc khó thao tác.

---
**Nhận xét chung:** Qua việc nghiên cứu các hệ thống trong và ngoài nước, nhóm nhận thấy một khoảng trống lớn: Hầu hết các công cụ hiện nay hoặc là "Quá phức tạp, thiên về thi đấu", hoặc là "Quá đại trà, không có tính năng quản trị chuyên sâu". 

Từ đó, dự án **Ngân hàng bài tập lập trình** được thiết kế nhằm điền vào khoảng trống này: Mang lại một giao diện chuẩn Markdown thân thiện, cơ cấu phân loại chặt chẽ theo Môn học - Giảng viên, và đặc biệt là sự hỗ trợ đột phá của thuật toán HardHash và trí tuệ nhân tạo (AI Groq) để đảm bảo chất lượng, dọn dẹp các bài tập bị lặp lại trong môi trường sử dụng chung.




