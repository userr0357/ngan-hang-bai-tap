const mssql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 1433),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function checkAdmin() {
    try {
        await mssql.connect(config);
        const result = await mssql.query(`
            SELECT 
                (SELECT COUNT(*) FROM BAITAP WHERE MaMon IS NULL OR MaMon NOT IN (SELECT MaMon FROM MONHOC)) as OrphanSubjects,
                (SELECT COUNT(*) FROM BAITAP WHERE MaDangBai IS NULL OR MaDangBai NOT IN (SELECT MaDangBai FROM DANGBAI)) as OrphanTypes,
                (SELECT COUNT(*) FROM BAITAP WHERE SkillLevel IS NULL) as MissingLevels,
                (SELECT COUNT(*) FROM BAITAP) as Total
        `);
        console.log(JSON.stringify(result.recordset, null, 2));
        await mssql.close();
    } catch (err) {
        console.error(err);
    }
}

checkAdmin();
