const mssql = require('mssql');
const config = {
    user: 'userPersonalizedSystem',
    password: '123456789',
    server: '118.69.126.49',
    database: 'Data_PersonalizedSystem',
    options: { encrypt: false, trustServerCertificate: true }
};

async function checkExercise79() {
    try {
        let pool = await mssql.connect(config);
        console.log("--- BÀI TẬP ID 79 ---");
        let result = await pool.request().input('id', mssql.Int, 79).query("SELECT * FROM BAITAP WHERE Id = @id");
        console.log(result.recordset[0]);

        console.log("--- ĐỊNH DẠNG NỘP ---");
        let formats = await pool.request().input('id', mssql.Int, 79).query("SELECT dd.TenDinhDang FROM BAITAP_DINHDANG bdd JOIN DINHDANG_NOPBAI dd ON bdd.MaDinhDang = dd.MaDinhDang WHERE bdd.BaiTapId = @id");
        console.log(formats.recordset);

        console.log("--- LEVEL ---");
        let levels = await pool.request().input('id', mssql.Int, 79).query("SELECT * FROM EXERCISE_SKILL_METADATA WHERE BaiTapId = @id");
        console.log(levels.recordset);
        
        await mssql.close();
    } catch (err) {
        console.error(err);
    }
}
checkExercise79();
