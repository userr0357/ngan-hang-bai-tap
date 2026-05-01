import sys
import os

file_path = 'server.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Duplicate Check Prompt
old_dup_prompt = """    const systemPrompt = `Bạn là chuyên gia kiểm định chương trình đào tạo. Hãy so sánh bài tập mới với danh sách bài tập hiện có.
Trả về JSON:
{
  "similarity_score": (0-100),
  "matched_exercise": "Tên bài - Môn - Dạng bài trùng nhất",
  "duplicate_reason": "Giải thích chi tiết điểm giống nhau (ví dụ: trùng thuật toán, trùng kịch bản...)",
  "message": "Lời khuyên để làm bài tập trở nên khác biệt"
}`;"""

new_dup_prompt = """    const systemPrompt = `Bạn là chuyên gia kiểm định chương trình đào tạo tại Lạc Hồng University. 
Nhiệm vụ: So sánh bài tập mới với danh sách bài tập hiện có để phát hiện trùng lặp ý tưởng hoặc nội dung.

Trả về JSON CHÍNH XÁC định dạng sau:
{
  "similarity_score": (con số 0-100),
  "matched_exercise": "Tên bài - Môn - Dạng bài (ID bài tập nếu có)",
  "duplicate_reason": "Chỉ rõ điểm giống nhau: ví dụ 'Trùng thuật toán sắp xếp mảng ở Level 3', 'Kịch bản tính thuế giống bài X', 'Trùng bộ test case'...",
  "message": "Gợi ý cụ thể để làm bài tập này khác biệt và sáng tạo hơn"
}`;"""

content = content.replace(old_dup_prompt, new_dup_prompt)

# 2. Update Validation Prompt with Level Logic
old_val_prompt = """    const systemPrompt = `Bạn là chuyên gia thẩm định giáo trình đại học. Hãy đánh giá bài tập dựa trên 5 tiêu chí:
1. Độ chính xác chuyên môn.
2. Tính đầy đủ (Mô tả, Yêu cầu, Tiêu chí chấm).
3. Sự tương quan giữa Yêu cầu và Tiêu chí chấm điểm.
4. Độ rõ ràng và ngôn sư phạm.
5. Sự phù hợp về trọng số điểm.

Trả về JSON:
{
  "status": "valid" | "warning" | "invalid",
  "feedback": "Nhận xét chi tiết theo 5 tiêu chí trên",
  "suggestions": ["Gợi ý cụ thể để cải thiện bài tập"]
}`;"""

new_val_prompt = """    const { skill_level } = req.body;
    const levelNames = { 1: 'Lego (Cú pháp)', 2: 'Decision Making (Rẽ nhánh)', 3: 'Repetition (Vòng lặp)', 4: 'Modularization (Hàm)', 5: 'Problem Solver (Giải thuật)' };
    const targetLevelName = levelNames[skill_level] || 'Chưa xác định';

    const systemPrompt = `Bạn là chuyên gia thẩm định bài tập lập trình. Hãy đánh giá bài tập dựa trên các tiêu chí nghiêm ngặt sau:
1. SỰ PHÙ HỢP CẤP ĐỘ: Bài tập đang đặt ở ${targetLevelName}. (Ví dụ: Level 1 không được có vòng lặp, Level 4 phải yêu cầu chia hàm).
2. ĐỘ CHÍNH XÁC CHUYÊN MÔN: Thuật toán và thuật ngữ có đúng không.
3. TÍNH ĐẦY ĐỦ: Đã đủ mô tả, yêu cầu và tiêu chí chấm chưa.
4. LOGIC CHẤM ĐIỂM: Tiêu chí chấm điểm có bao quát hết các yêu cầu thực hiện không.
5. NGÔN NGỮ SƯ PHẠM: Câu chữ rõ ràng, dễ hiểu cho sinh viên.

Trả về JSON:
{
  "status": "valid" | "warning" | "invalid",
  "feedback": "Nhận xét chi tiết, chỉ rõ điểm chưa đạt so với cấp độ ${targetLevelName}",
  "suggestions": ["Gợi ý cụ thể để nâng cấp bài tập"]
}`;"""

content = content.replace(old_val_prompt, new_val_prompt)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
