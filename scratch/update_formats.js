const mssql = require('mssql');
const config = {
    user: 'userPersonalizedSystem',
    password: '123456789',
    server: '118.69.126.49',
    database: 'Data_PersonalizedSystem',
    options: { encrypt: false, trustServerCertificate: true }
};

async function updateFormats() {
    try {
        let pool = await mssql.connect(config);
        const sql = `
            IF NOT EXISTS (SELECT 1 FROM DINHDANG_NOPBAI WHERE MaDinhDang = 4) INSERT INTO DINHDANG_NOPBAI (MaDinhDang, TenDinhDang) VALUES (4, 'link');
            IF NOT EXISTS (SELECT 1 FROM DINHDANG_NOPBAI WHERE MaDinhDang = 5) INSERT INTO DINHDANG_NOPBAI (MaDinhDang, TenDinhDang) VALUES (5, 'text');
            IF NOT EXISTS (SELECT 1 FROM DINHDANG_NOPBAI WHERE MaDinhDang = 6) INSERT INTO DINHDANG_NOPBAI (MaDinhDang, TenDinhDang) VALUES (6, 'image');
        `;
        await pool.request().query(sql);
        console.log("Updated DINHDANG_NOPBAI successfully.");
        await mssql.close();
    } catch (err) {
        console.error(err);
    }
}
updateFormats();
