import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def check_history():
    try:
        # Note: I'll use a generic way to check if pyodbc exists
        import pyodbc
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={os.getenv('DB_HOST')};"
            f"DATABASE={os.getenv('DB_NAME')};"
            f"UID={os.getenv('DB_USER')};"
            f"PWD={os.getenv('DB_PASS')};"
        )
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM EXERCISE_AUDIT_LOG WHERE LecturerId = 'GV01'")
        count = cursor.fetchone()[0]
        print(f"History count for GV01: {count}")
        
        if count == 0:
            print("Inserting sample history...")
            # Get some exercises
            cursor.execute("SELECT TOP 5 MaBaiTap, TenBaiTap FROM BAITAP WHERE MaMon IN (SELECT MaMon FROM GIANGVIEN_MONHOC WHERE MaGV = 'GV01')")
            rows = cursor.fetchall()
            for row in rows:
                cursor.execute("""
                    INSERT INTO EXERCISE_AUDIT_LOG (ExerciseId, ExerciseTitle, LecturerId, Action, ActionTime, Details)
                    VALUES (?, ?, 'GV01', 'create', GETDATE(), 'Khởi tạo bài tập mới')
                """, row[0], row[1])
            conn.commit()
            print("Sample history inserted.")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

check_history()
