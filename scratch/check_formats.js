const mssql = require('mssql');
const config = {
    user: 'userPersonalizedSystem',
    password: '123456789',
    server: '118.69.126.49',
    database: 'Data_PersonalizedSystem',
    options: { encrypt: false, trustServerCertificate: true }
};

async function checkFormats() {
    try {
        let pool = await mssql.connect(config);
        let formats = await pool.request().query("SELECT * FROM DINHDANG_NOPBAI");
        console.log("Formats in DINHDANG_NOPBAI:", formats.recordset);
        
        let bridge = await pool.request().query("SELECT TOP 1 * FROM BAITAP_DINHDANG");
        if (bridge.recordset.length > 0) {
            console.log("Columns in BAITAP_DINHDANG:", Object.keys(bridge.recordset[0]));
        } else {
            console.log("BAITAP_DINHDANG is empty.");
        }
        await mssql.close();
    } catch (err) {
        console.error(err);
    }
}
checkFormats();
