const mssql = require('mssql');
const config = {
    user: 'userPersonalizedSystem',
    password: '123456789',
    server: '118.69.126.49',
    database: 'Data_PersonalizedSystem',
    options: { encrypt: false, trustServerCertificate: true }
};

async function checkColumns() {
    try {
        let pool = await mssql.connect(config);
        let result = await pool.request().query("SELECT TOP 1 * FROM BAITAP");
        console.log("Columns in BAITAP:", Object.keys(result.recordset[0]));
        await mssql.close();
    } catch (err) {
        console.error(err);
    }
}
checkColumns();
