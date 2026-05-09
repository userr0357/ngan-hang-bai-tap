HƯỚNG DẪN SỬ DỤNG HỆ THỐNG NGÂN HÀNG BÀI TẬP
Phiên bản 2.0 | Cập nhật tháng 05/2026

Tài liệu này hướng dẫn chi tiết cách sử dụng hệ thống cho ba nhóm người dùng: Sinh viên, Giảng viên và Quản trị viên (Admin). Mỗi nhóm có quyền hạn và chức năng riêng biệt được mô tả đầy đủ trong các phần dưới đây.

=============================================
PHẦN 1 - GIỚI THIỆU HỆ THỐNG
=============================================

Hệ thống Ngân Hàng Bài Tập Lập Trình là nền tảng web tập trung giúp giảng viên quản lý kho bài tập và sinh viên tra cứu tài liệu thực hành. Hệ thống xây dựng trên Node.js và Microsoft SQL Server, hỗ trợ đa người dùng với phân quyền rõ ràng theo vai trò.

Các tính năng chính:
- Tìm kiếm bài tập theo môn học, dạng bài và độ khó. Kết quả hiển thị tức thì theo thời gian thực, không cần tải lại trang.
- Tích hợp trí tuệ nhân tạo GPT-4o giúp giảng viên tự động soạn nội dung bài tập, kiểm định chất lượng và gợi ý cải thiện đề bài.
- Kiểm tra tự động độ tương đồng giữa các bài tập, cảnh báo khi phát hiện nội dung trùng lặp trên 80%.
- Nhập và xuất dữ liệu hàng loạt qua định dạng Excel, hỗ trợ xem trước kết quả trước khi lưu vào cơ sở dữ liệu.
- Giao diện Dark Mode, hiển thị tốt trên mọi thiết bị bao gồm máy tính, tablet và điện thoại.
- Đính kèm file tài liệu, cho phép sinh viên tải về với tên file gốc được bảo toàn đúng như giảng viên đặt.

Địa chỉ truy cập: http://localhost:3000 hoặc địa chỉ server do Admin cung cấp.

=============================================
PHẦN 2 - PHÂN QUYỀN NGƯỜI DÙNG
=============================================

Hệ thống có ba cấp quyền:

Sinh viên: Truy cập trang chủ mà không cần đăng nhập. Có quyền xem và tìm kiếm bài tập, xem chi tiết nội dung, tiêu chí chấm điểm và tải file đính kèm về máy. Không có quyền tạo, sửa hoặc xóa bất kỳ bài tập nào.

Giảng viên: Đăng nhập vào trang /lecturer. Có quyền tạo, sửa và xóa bài tập thuộc môn học được Admin phân công. Được sử dụng các tính năng AI, xuất nhập dữ liệu Excel và xem thống kê của riêng mình. Không thể chỉnh sửa bài tập của giảng viên khác.

Quản trị viên (Admin): Có toàn quyền của Giảng viên, cộng thêm quyền quản lý tất cả người dùng bao gồm duyệt tài khoản và khóa tài khoản, xem và chỉnh sửa bài tập của mọi giảng viên, xuất dữ liệu toàn hệ thống.

=============================================
PHẦN 3 - ĐĂNG KÝ VÀ ĐĂNG NHẬP
=============================================

Đăng nhập:
Truy cập http://localhost:3000/login. Nhập Mã giảng viên (ví dụ GV01) và Mật khẩu vào ô tương ứng. Nhấn nút Đăng nhập. Hệ thống kiểm tra thông tin và chuyển tự động đến trang phù hợp với vai trò của tài khoản. Nếu tài khoản chưa được duyệt hoặc bị khóa, hệ thống hiển thị thông báo cụ thể.

Đăng ký tài khoản giảng viên:
Truy cập http://localhost:3000/register. Điền đầy đủ Mã giảng viên, Họ tên và Mật khẩu. Nhấn Đăng ký. Tài khoản sẽ ở trạng thái chờ duyệt đến khi Admin phê duyệt. Trong thời gian chờ duyệt, chưa thể đăng nhập vào hệ thống. Nên liên hệ Admin sau khi đăng ký để được duyệt nhanh.

Quên mật khẩu:
Truy cập http://localhost:3000/forgot. Nhập Mã giảng viên đã đăng ký và làm theo hướng dẫn trên màn hình để đặt lại mật khẩu mới. Nếu không nhớ cả mã giảng viên, liên hệ Admin để được xác minh và hỗ trợ đặt lại.

Đăng xuất:
Nhấn nút Đăng xuất ở góc trên phải của trang giảng viên. Hệ thống xóa phiên làm việc và chuyển về trang đăng nhập. Nên đăng xuất sau mỗi lần sử dụng trên máy tính chung.

=============================================
PHẦN 4 - HƯỚNG DẪN DÀNH CHO SINH VIÊN
=============================================

4.1 Truy cập và giao diện tổng quan

Mở trình duyệt và vào http://localhost:3000. Giao diện chia làm ba vùng chính: sidebar bên trái chứa danh sách môn học, vùng trung tâm hiển thị thẻ bài tập và thanh tìm kiếm phía trên. Sinh viên không cần đăng nhập để sử dụng bất kỳ tính năng nào trên trang này.

4.2 Chọn môn học

Nhấn vào tên môn học trong sidebar bên trái, ví dụ: Kỹ thuật lập trình, Cấu trúc dữ liệu và giải thuật. Hệ thống tải danh sách bài tập thuộc môn đó và phân nhóm theo dạng bài. Mỗi thẻ bài tập hiển thị tên, độ khó, cấp độ kỹ năng và tóm tắt nội dung. Có thể nhấn vào thẻ để xem toàn bộ chi tiết.

4.3 Tìm kiếm bài tập

Tìm kiếm theo từ khóa: Nhấn vào ô tìm kiếm phía trên và gõ từ khóa bất kỳ như tên bài, từ trong mô tả hoặc tên yêu cầu. Hệ thống lọc và hiển thị kết quả ngay tức thì theo thời gian thực. Không cần nhấn Enter hay nhấn nút tìm kiếm.

Lọc theo độ khó: Nhấn vào bộ lọc Độ khó trên thanh công cụ. Chọn Dễ, Trung bình hoặc Khó để chỉ hiển thị bài ở mức tương ứng. Có thể kết hợp với tìm kiếm từ khóa để thu hẹp thêm kết quả.

4.4 Xem chi tiết bài tập

Nhấn vào thẻ bài tập bất kỳ. Panel chi tiết mở ra bên phải màn hình với đầy đủ thông tin:
- Mã bài tập và ID hệ thống giúp nhận diện duy nhất bài tập trong toàn hệ thống.
- Dạng bài và độ khó cho biết loại bài tập và mức độ yêu cầu kỹ năng.
- Cấp độ kỹ năng từ 1 đến 5 giúp sinh viên đánh giá xem bài có phù hợp với trình độ hiện tại không.
- Mô tả đầy đủ viết theo định dạng có cấu trúc, bao gồm bối cảnh, mục tiêu và gợi ý phương án.
- Yêu cầu kỹ thuật là danh sách cụ thể các điều kiện cần đạt được trong bài làm.
- Tiêu chí chấm điểm là bảng tiêu chí kèm trọng số phần trăm giúp hiểu rõ cách giảng viên tính điểm.
- Hình thức nộp bài là quy định của giảng viên về định dạng nộp như ZIP, PDF, link...
- File đính kèm là danh sách tài liệu hỗ trợ có thể tải về.
Nhấn nút X ở góc trên phải panel để đóng và quay lại danh sách.

4.5 Tải file đính kèm

Trong panel chi tiết, kéo xuống đến phần File đính kèm. Danh sách hiển thị các file với icon phân loại theo định dạng như PDF, ZIP, hình ảnh, Word và tên file gốc do giảng viên đặt. Nhấn vào tên file, trình duyệt tự động bắt đầu tải về. File được lưu vào thư mục tải về mặc định của trình duyệt với đúng tên gốc, không bị đổi tên thành mã số ngẫu nhiên.

4.6 Bật tắt Dark Mode

Nhấn vào biểu tượng mặt trăng ở góc trên phải để chuyển sang giao diện tối. Toàn bộ màu sắc giao diện tự động điều chỉnh sang tông tối, giảm mỏi mắt khi làm việc ban đêm. Nhấn lại để quay về giao diện sáng. Hệ thống tự động ghi nhớ lựa chọn, lần sau mở lại vẫn giữ nguyên.

=============================================
PHẦN 5 - HƯỚNG DẪN DÀNH CHO GIẢNG VIÊN
=============================================

5.1 Đăng nhập và giao diện

Truy cập http://localhost:3000/login, nhập Mã giảng viên và Mật khẩu, nhấn Đăng nhập. Sau khi xác thực, hệ thống chuyển đến http://localhost:3000/lecturer. Giao diện có sidebar menu bên trái, vùng nội dung chính và header trên cùng hiển thị tên tài khoản, nút góp ý, Dark Mode và Đăng xuất.

5.2 Dashboard Tổng quan

Nhấn menu Tổng quan để xem bộ bốn thẻ thống kê: Tổng bài tập, Số môn học, Số dạng bài và Số cấp độ. Mỗi thẻ có thể nhấn vào để cuộn nhanh đến biểu đồ tương ứng phía dưới. Biểu đồ phân tích phân bố bài tập theo môn, dạng bài và cấp độ giúp giảng viên có cái nhìn tổng thể về kho bài của mình và xác định phần còn thiếu.

5.3 Xem danh sách bài tập

Nhấn menu Ngân hàng bài tập. Hệ thống hiển thị bảng danh sách tất cả bài tập thuộc môn được phân công. Các cột hiển thị: STT, Mã bài tập, Tên bài, Độ khó, Tổng trọng số tiêu chí và các nút hành động. Dùng ô lọc Môn học ở trên cùng để chỉ hiện bài thuộc một môn. Dùng ô tìm kiếm để tìm tên bài cụ thể. Nhấn vào tên bài để xem nhanh nội dung.

5.4 Tạo bài tập mới

Nhấn nút Tạo bài tập mới ở góc trên phải. Form mở ra với các nhóm trường sau:

Thông tin cơ bản: Chọn Môn học từ danh sách môn được phân công (giảng viên khác môn không thấy phần này). Chọn Dạng bài tương ứng trong môn vừa chọn. Mã bài tập được tự sinh theo quy tắc Mon_Dang_SoThuTu ví dụ KTLT_D1_12, có thể sửa tay nhưng phải đảm bảo không trùng mã đã tồn tại. Nhập Tên bài tập ngắn gọn, rõ nghĩa. Chọn Độ khó là Dễ, Trung bình hoặc Khó và Cấp độ kỹ năng từ 1 đến 5.

Mô tả: Nhập nội dung mô tả đầy đủ bao gồm bối cảnh, mục tiêu, các gợi ý và ví dụ. Trường này hỗ trợ định dạng Markdown. Có thể để trống và để AI sinh tự động.

Yêu cầu kỹ thuật: Nhấn Thêm yêu cầu để thêm từng dòng. Mỗi dòng là một điều kiện cụ thể sinh viên cần thực hiện. Nhấn dấu trừ cuối dòng để xóa yêu cầu không cần thiết.

Tiêu chí chấm điểm: Nhấn Thêm tiêu chí để thêm dòng mới. Mỗi dòng gồm tên tiêu chí, trọng số phần trăm và ô ghi chú thêm. Tổng trọng số hiển thị phía dưới, nên đặt tổng bằng 100%.

Định dạng nộp bài: Nhập hình thức nộp quy định, ví dụ: File ZIP chứa code nguồn và báo cáo PDF không quá 5MB.

File đính kèm: Kéo thả file vào vùng upload hoặc nhấn vào để chọn từ máy tính. Hỗ trợ JPG, PNG, PDF, ZIP, DOCX tối đa 10MB. Tên file đã chọn hiển thị bên dưới vùng upload. Khi sinh viên xem bài, họ thấy được các file này và tải về trực tiếp.

Sau khi điền xong, nhấn Lưu bài tập. Hệ thống tự kiểm tra trùng lặp. Nếu phát hiện bài có độ tương đồng trên 80% với bài khác, hiển thị hộp thoại cảnh báo với tên bài trùng và phần trăm. Chọn Vẫn lưu để tiếp tục lưu, hoặc Hủy để quay lại chỉnh sửa nội dung.

5.5 Sửa và xóa bài tập

Sửa bài: Trong bảng danh sách, nhấn nút bút chì bên cạnh bài muốn sửa. Form tự điền sẵn thông tin hiện tại. Chỉnh sửa các trường cần thay đổi và nhấn Lưu bài tập. Lịch sử sửa được ghi lại trong menu Lịch sử bài tập.

Xóa bài: Nhấn nút thùng rác bên cạnh bài muốn xóa. Hệ thống hiển thị cảnh báo xác nhận. Sau khi xác nhận, bài bị ẩn khỏi hệ thống theo cơ chế xóa mềm, không mất hoàn toàn. Chỉ giảng viên tạo bài mới có quyền sửa xóa. Không thể chỉnh sửa bài của giảng viên khác.

5.6 Sử dụng tính năng AI

AI sinh nội dung bài tập:
Trong form tạo hoặc sửa bài, nhấn nút AI Sinh Nội Dung Bài Tập. Cửa sổ AI mở ra. Nhập mô tả ngắn gọn yêu cầu bài tập vào ô prompt, ví dụ: Bài tập về con trỏ trong C++, yêu cầu cấp phát động mảng hai chiều và tính tổng từng hàng. Chọn loại nội dung muốn sinh: Mô tả, Yêu cầu, Tiêu chí chấm điểm hoặc Sinh toàn bộ. Nhấn Sinh nội dung và đợi AI xử lý thường mất 5 đến 10 giây. Xem kết quả trong cửa sổ. Nếu hài lòng, nhấn Điền tất cả vào Form để AI tự động điền vào các ô tương ứng trong form chính. Kiểm tra lại nội dung trước khi lưu.

AI phản biện và đề xuất:
Đã điền Tên bài và Mô tả trong form, nhấn nút AI Phản Biện Đề Xuất. AI phân tích và trả về: Trạng thái đánh giá là Hợp lệ, Cần chú ý hoặc Không đạt; Nhận xét cụ thể về nội dung, yêu cầu và tiêu chí; Bộ tiêu chí chấm điểm nâng cao để thay thế nếu muốn; Đề xuất cốt truyện hoặc ngữ cảnh mới giúp tránh trùng lặp. Có thể áp dụng từng đề xuất riêng lẻ theo ý muốn bằng cách nhấn các nút tương ứng.

Kiểm tra trùng lặp thủ công:
Điền Tên và Mô tả vào form rồi nhấn Kiểm tra trùng lặp. Hệ thống so sánh với toàn bộ ngân hàng hiện có và trả về: mức độ tương đồng theo phần trăm, tên bài trùng nhất và các đoạn nội dung cụ thể bị trùng. Chức năng này chạy độc lập, không cần thực hiện sinh AI trước.

5.7 Xuất và nhập dữ liệu

Xuất Excel: Nhấn menu Xuất Nhập dữ liệu. Chọn môn học muốn xuất hoặc để trống để xuất tất cả. Tùy chọn thêm dạng bài và khoảng thời gian nếu muốn lọc. Nhấn Xuất Excel. File .xlsx được tải về máy chứa đầy đủ thông tin bài tập theo cấu trúc chuẩn.

Nhập từ Excel: Nhấn Chọn file Excel và chọn file từ máy tính. Hệ thống đọc file và hiển thị bảng xem trước kết quả. Dòng dữ liệu hợp lệ tô màu xanh, dòng có lỗi tô màu đỏ kèm lý do. Kiểm tra kỹ trước khi nhấn Xác nhận nhập để ghi vào cơ sở dữ liệu. Hệ thống báo cáo chi tiết: số bài thêm mới, số bài cập nhật và số dòng bị lỗi.

Lưu ý về format Excel: Nên xuất file Excel mẫu trước, sau đó thêm dữ liệu vào file đó theo đúng cấu trúc cột để tránh lỗi định dạng khi nhập lại.

5.8 Kiểm tra trùng lặp toàn hệ thống

Nhấn menu Kiểm tra trùng lặp. Hệ thống tự phân tích toàn bộ ngân hàng và hiển thị danh sách các cặp bài có nội dung tương tự nhau. Mỗi cặp hiển thị: tên bài A, tên bài B, phần trăm tương đồng và môn học. Giúp phát hiện bài bị sao chép hoặc trùng nội dung giữa các giảng viên. Giảng viên có thể dựa vào đây để quyết định chỉnh sửa hoặc loại bỏ bài bị trùng.

5.9 Tiếp nhận góp ý

Nhấn menu Tiếp nhận góp ý để xem danh sách phản hồi từ sinh viên về bài tập. Mỗi góp ý hiển thị tên bài tập được góp ý, nội dung góp ý cụ thể và thời gian gửi. Giảng viên nên đọc định kỳ để phát hiện vấn đề trong đề bài và cập nhật nội dung cho các kỳ giảng dạy tiếp theo.

5.10 Lịch sử bài tập

Nhấn menu Lịch sử bài tập để xem nhật ký toàn bộ các thao tác đã thực hiện: thêm mới, sửa và xóa bài tập. Mỗi bản ghi hiển thị tên bài tập liên quan, hành động thực hiện và thời gian chính xác. Tiện ích cho việc theo dõi thay đổi và kiểm tra lại lịch sử chỉnh sửa khi cần thiết.

=============================================
PHẦN 6 - HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN
=============================================

Admin đăng nhập tại http://localhost:3000/login tương tự Giảng viên. Sau khi đăng nhập thành công, Admin thấy thêm hai mục trong menu: Quản lý người dùng và Lịch sử đăng nhập. Các mục còn lại hoạt động giống Giảng viên nhưng không giới hạn theo môn học.

6.1 Quản lý người dùng

Nhấn menu Quản lý người dùng. Hệ thống hiển thị danh sách tất cả tài khoản trong hệ thống kèm trạng thái.

Duyệt tài khoản: Giảng viên mới đăng ký sẽ ở trạng thái Chờ duyệt. Admin nhấn nút Phê duyệt để kích hoạt, cho phép họ đăng nhập và sử dụng hệ thống. Nhấn Từ chối nếu thông tin đăng ký không đúng hoặc không thuộc khoa.

Khóa tài khoản: Tìm tài khoản vi phạm trong danh sách, nhấn nút Khóa. Tài khoản bị khóa vẫn còn trong hệ thống nhưng không thể đăng nhập. Admin có thể mở khóa bất kỳ lúc nào bằng cách nhấn Kích hoạt lại.

Xem lịch sử đăng nhập: Nhấn menu Lịch sử đăng nhập để xem log truy cập của từng giảng viên gồm thời gian và kết quả đăng nhập. Giúp phát hiện truy cập bất thường hoặc tài khoản đăng nhập sai mật khẩu nhiều lần.

6.2 Quản lý bài tập toàn hệ thống

Trong menu Ngân hàng bài tập, Admin thấy bài tập của tất cả giảng viên, không bị giới hạn theo môn. Có thể lọc theo tên giảng viên, môn học hoặc dạng bài. Admin có quyền sửa hoặc xóa bất kỳ bài tập nào khi phát hiện sai sót nghiêm trọng về nội dung hay vi phạm quy định của khoa.

6.3 Xuất dữ liệu toàn hệ thống

Trong menu Xuất Nhập dữ liệu, Admin có thêm tùy chọn xuất dữ liệu không giới hạn theo môn hay giảng viên. Có thể xuất toàn bộ bài tập trong hệ thống hoặc xuất theo từng giảng viên cụ thể. Sử dụng cho công tác báo cáo, thanh tra học kỳ hoặc sao lưu dữ liệu định kỳ.

=============================================
PHẦN 7 - CÂU HỎI THƯỜNG GẶP
=============================================

Tôi không thấy môn học nào khi tạo bài tập?
Giảng viên chỉ thấy các môn học đã được Admin gán. Nếu ô chọn môn trống, cần liên hệ Admin để được phân công môn học phù hợp. Sau khi được gán, tải lại trang và thử lại.

Mã bài tập tự sinh có bị sai không?
Mã được tính tự động theo quy tắc Mon_Dang_SoThuTu, ví dụ KTLT_D1_12. Có thể sửa tay nhưng phải đảm bảo không trùng với bất kỳ bài nào đã có trong hệ thống. Nếu báo lỗi trùng mã khi lưu, nhấn F5 tải lại trang để hệ thống tính lại mã theo số thứ tự mới nhất, sau đó thử lưu lại.

Lưu bài tập báo lỗi Mã bài tập đã tồn tại?
Nguyên nhân thường do mã tự sinh bị xung đột với bản ghi khác. Nhấn F5 tải lại trang để hệ thống tính lại mã tự động theo số thứ tự mới nhất, sau đó thử lưu lại. Nếu vẫn lỗi, thử sửa mã theo cách khác ví dụ thêm chữ hoặc số cuối.

File đính kèm tải lên không thành công?
Kiểm tra hai điều: dung lượng file không vượt quá 10MB và định dạng nằm trong danh sách hỗ trợ là JPG, PNG, PDF, ZIP hoặc DOCX. Các định dạng khác như .rar, .exe, .psd hiện chưa được hỗ trợ.

AI sinh nội dung bị lỗi?
Trước hết kiểm tra kết nối mạng của máy tính. Nếu mạng ổn định mà vẫn lỗi, có thể API key OpenAI đã hết hạn hoặc hết quota. Liên hệ Admin để được kiểm tra và cập nhật cấu hình trên server.

Sinh viên không thấy bài tập vừa tạo?
Trang sinh viên tải dữ liệu một lần khi mở. Sinh viên cần nhấn F5 hoặc tải lại tab trình duyệt để lấy dữ liệu mới nhất. Bài tập đã lưu thành công sẽ hiển thị ngay sau khi tải lại.

Tôi muốn sửa bài tập của giảng viên khác?
Tính năng này không khả dụng với Giảng viên thường. Chỉ Admin mới có quyền chỉnh sửa bài tập của người khác. Nếu phát hiện bài tập có vấn đề, liên hệ Admin hoặc sử dụng chức năng Góp ý để thông báo.

Quên mật khẩu phải làm gì?
Truy cập http://localhost:3000/forgot và nhập Mã giảng viên. Làm theo hướng dẫn trên màn hình để đặt lại mật khẩu mới. Nếu không nhớ cả mã giảng viên, liên hệ Admin để được xác minh và hỗ trợ đặt lại.

=============================================
HỖ TRỢ KỸ THUẬT
=============================================

Nếu gặp vấn đề kỹ thuật không tự giải quyết được, sử dụng chức năng Góp ý trên trang giảng viên để gửi phản hồi đến Admin. Admin sẽ xử lý trong thời gian sớm nhất. Với các vấn đề khẩn cấp, liên hệ trực tiếp qua kênh liên lạc của khoa Công nghệ Thông tin.

Cảm ơn bạn đã sử dụng Hệ thống Ngân Hàng Bài Tập Lập Trình.
