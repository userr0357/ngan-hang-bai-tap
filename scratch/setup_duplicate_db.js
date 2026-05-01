const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: { encrypt: false, trustServerCertificate: true }
};

async function createTables() {
  try {
    await sql.connect(config);
    console.log('Connected to DB');

    // EXERCISE_FEATURES
    await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EXERCISE_FEATURES' and xtype='U')
      CREATE TABLE EXERCISE_FEATURES (
        BaiTapId INT PRIMARY KEY,
        HardHash VARCHAR(255) NOT NULL,
        AI_Keywords NVARCHAR(MAX),
        AI_Summary NVARCHAR(MAX),
        LastUpdated DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (BaiTapId) REFERENCES BAITAP(Id) ON DELETE CASCADE
      )
    `);
    console.log('EXERCISE_FEATURES table created/exists.');

    // DUPLICATE_LOG
    await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DUPLICATE_LOG' and xtype='U')
      CREATE TABLE DUPLICATE_LOG (
        LogId INT IDENTITY(1,1) PRIMARY KEY,
        ScanDate DATETIME DEFAULT GETDATE(),
        InitiatedBy NVARCHAR(50),
        TotalChecked INT DEFAULT 0,
        DuplicatesFound INT DEFAULT 0,
        Status NVARCHAR(50) DEFAULT 'COMPLETED'
      )
    `);
    console.log('DUPLICATE_LOG table created/exists.');

    // DUPLICATE_REPORTS
    await sql.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DUPLICATE_REPORTS' and xtype='U')
      CREATE TABLE DUPLICATE_REPORTS (
        ReportId INT IDENTITY(1,1) PRIMARY KEY,
        LogId INT,
        BaiTap_A_Id INT NOT NULL,
        BaiTap_B_Id INT NOT NULL,
        SimilarityScore DECIMAL(5,2),
        DetectedBy NVARCHAR(50),
        Status NVARCHAR(50) DEFAULT 'PENDING',
        FOREIGN KEY (LogId) REFERENCES DUPLICATE_LOG(LogId) ON DELETE CASCADE,
        FOREIGN KEY (BaiTap_A_Id) REFERENCES BAITAP(Id) ON DELETE NO ACTION,
        FOREIGN KEY (BaiTap_B_Id) REFERENCES BAITAP(Id) ON DELETE CASCADE
      )
    `);
    console.log('DUPLICATE_REPORTS table created/exists.');

    // Chú ý: Ở DUPLICATE_REPORTS, BaiTap_B_Id có ON DELETE CASCADE, 
    // BaiTap_A_Id không có cascade để tránh lỗi multiple cascade paths trong MSSQL. 
    // Sẽ cần trigger hoặc logic code để xóa báo cáo nếu Bài A bị xóa.

    // TRIGGER for EXERCISE_FEATURES and DUPLICATE_REPORTS when BAITAP is deleted
    await sql.query(`
      CREATE OR ALTER TRIGGER trg_BaiTap_Delete_Cleanup
      ON BAITAP
      AFTER DELETE
      AS
      BEGIN
          DELETE FROM DUPLICATE_REPORTS 
          WHERE BaiTap_A_Id IN (SELECT Id FROM deleted) 
             OR BaiTap_B_Id IN (SELECT Id FROM deleted);
      END
    `);
    console.log('Trigger trg_BaiTap_Delete_Cleanup created.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

createTables();
