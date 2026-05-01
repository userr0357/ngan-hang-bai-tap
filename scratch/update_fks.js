const db = require('../db-sql');

async function updateForeignKeys() {
  const pool = await db.getPool();
  try {
    const fkQuery = `
      SELECT 
        f.name AS fk_name, 
        OBJECT_NAME(f.parent_object_id) AS table_name, 
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS col_name 
      FROM sys.foreign_keys AS f 
      INNER JOIN sys.foreign_key_columns AS fc ON f.OBJECT_ID = fc.constraint_object_id 
      INNER JOIN sys.tables t ON t.OBJECT_ID = fc.referenced_object_id 
      WHERE t.name = 'GIANGVIEN'
    `;
    const r = await pool.request().query(fkQuery);
    const fks = r.recordset;
    
    console.log('Found FKs:', fks);

    for (const fk of fks) {
      console.log(`Dropping FK ${fk.fk_name} on table ${fk.table_name}...`);
      await pool.request().query(`ALTER TABLE ${fk.table_name} DROP CONSTRAINT ${fk.fk_name}`);
      
      console.log(`Recreating FK ${fk.fk_name} with ON UPDATE CASCADE...`);
      await pool.request().query(`
        ALTER TABLE ${fk.table_name} 
        ADD CONSTRAINT ${fk.fk_name} 
        FOREIGN KEY (${fk.col_name}) 
        REFERENCES GIANGVIEN(MaGiangVien) 
        ON UPDATE CASCADE
      `);
    }

    console.log('All Foreign Keys updated successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}

updateForeignKeys();
