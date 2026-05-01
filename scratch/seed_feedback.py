import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={os.getenv('DB_HOST')};"
        f"DATABASE={os.getenv('DB_NAME')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASS')};"
    )
    return pyodbc.connect(conn_str)

def check_feedback():
    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM FEEDBACKS WHERE ReceiverId = 'GV01'")
        count = cursor.fetchone()[0]
        print(f"Feedback count for GV01: {count}")
        
        if count == 0:
            print("Inserting sample feedback...")
            # Get an exercise ID from GV01
            cursor.execute("SELECT TOP 1 MaBaiTap FROM BAITAP WHERE MaMon IN (SELECT MaMon FROM GIANGVIEN_MONHOC WHERE MaGV = 'GV01')")
            row = cursor.fetchone()
            if row:
                ex_id = row[0]
                cursor.execute("""
                    INSERT INTO FEEDBACKS (BaiTapId, SenderId, ReceiverId, Category, Title, Content, Status, IsRead, CreatedAt, UpdatedAt)
                    VALUES 
                    (?, 'SV001', 'GV01', 'difficulty', 'Độ khó quá cao', 'Bài tập này có phần nâng cao quá so với kiến thức trên lớp ạ.', 0, 0, GETDATE(), GETDATE()),
                    (?, 'SV002', 'GV01', 'content', 'Lỗi đề bài', 'Câu 2 của bài tập có thông tin bị trùng lặp, nhờ thầy xem lại.', 0, 0, GETDATE(), GETDATE())
                """, ex_id, ex_id)
                conn.commit()
                print("Sample feedback inserted.")
            else:
                print("No exercise found for GV01 to link feedback.")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

check_feedback()
