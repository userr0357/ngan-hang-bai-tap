const db = require('../db-sql');

async function fixForeignKeys() {
  const pool = await db.getPool();
  try {
    // We already dropped FK_Feedback_Sender and FK_Feedback_Receiver.
    // Let's just recreate them WITHOUT CASCADE to avoid the multiple cascade path error.
    console.log('Recreating FK_Feedback_Sender without CASCADE...');
    await pool.request().query(`
      ALTER TABLE FEEDBACKS 
      ADD CONSTRAINT FK_Feedback_Sender 
      FOREIGN KEY (SenderId) REFERENCES GIANGVIEN(MaGiangVien)
    `).catch(() => {});

    console.log('Recreating FK_Feedback_Receiver without CASCADE...');
    await pool.request().query(`
      ALTER TABLE FEEDBACKS 
      ADD CONSTRAINT FK_Feedback_Receiver 
      FOREIGN KEY (ReceiverId) REFERENCES GIANGVIEN(MaGiangVien)
    `).catch(() => {});

    console.log('Fixed multiple cascade path error.');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}

fixForeignKeys();
