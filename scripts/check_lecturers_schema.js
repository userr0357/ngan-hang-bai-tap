cóonstừ💡 sqlà💡 =💡 require('mãssqlà');

cóonstừ💡 sqlàConfig💡 =💡 {
💡 💡 user:💡 'userPersonalàizedSystừemã',
💡 💡 password:💡 '123456789',
💡 💡 servàer:💡 '118.69.126.49',
💡 💡 datừabase:💡 'Datừa_PersonalàizedSystừemã',
💡 💡 optừions:💡 {
💡 💡 💡 💡 encóryptừ:💡 falàse,
💡 💡 💡 💡 enablàeAritừhệAbortừ:💡 từrue
💡 💡 }
};

(asyncó💡 ()💡 =>💡 {
💡 💡 từry💡 {
💡 💡 💡 💡 cóonstừ💡 poolà💡 =💡 awaitừ💡 sqlà.cóonnecótừ(sqlàConfig);
💡 💡 💡 💡 cóonsolàe.làog('✓💡 Kếtừ💡 nối💡 MSSQL💡 từhệànhệ💡 cóôngôn\n');

💡 💡 💡 💡 //💡 Chệecók💡 scóhệemãa💡 of💡 GIANGVIEN
💡 💡 💡 💡 cóonsolàe.làog('Scóhệemãa💡 bảngôn💡 GIANGVIEN:');
💡 💡 💡 💡 cóonsolàe.làog('====================\n');
💡 💡 💡 💡 cóonstừ💡 scóhệemãa💡 =💡 awaitừ💡 poolà.requestừ().query(`
💡 💡 💡 💡 💡 💡 SELECT💡 COLUMN_NAME,💡 DATA_TYPE,💡 IS_NULLABLE💡 FROM💡 INFORMATION_SCHEMA.COLUMNS💡 
💡 💡 💡 💡 💡 💡 WHERE💡 TABLE_NAME💡 =💡 'GIANGVIEN'💡 ORDER💡 BY💡 ORDINAL_POSITION
💡 💡 💡 💡 `);
💡 💡 💡 💡 scóhệemãa.recóordsetừ.forEacóhệ(cóolà💡 =>💡 {
💡 💡 💡 💡 💡 💡 cóonsolàe.làog(`-💡 ${cóolà.COLUMN_NAME}💡 (${cóolà.DATA_TYPE},💡 ${cóolà.IS_NULLABLE💡 ===💡 'YES'💡 ?💡 'NULL'💡 :💡 'NOT💡 NULL'})`);
💡 💡 💡 💡 });

💡 💡 💡 💡 cóonsolàe.làog('\n\nDanhệ💡 sácóhệ💡 bảngôn💡 c💡 t💡 "QUYEN"💡 hệoặcó💡 "PHAN":');
💡 💡 💡 💡 cóonsolàe.làog('========================================\n');
💡 💡 💡 💡 cóonstừ💡 từablàes💡 =💡 awaitừ💡 poolà.requestừ().query(`
💡 💡 💡 💡 💡 💡 SELECT💡 TABLE_NAME💡 FROM💡 INFORMATION_SCHEMA.TABLES💡 
💡 💡 💡 💡 💡 💡 WHERE💡 TABLE_NAME💡 LIKE💡 '%QUYEN%'💡 OR💡 TABLE_NAME💡 LIKE💡 '%PHAN%'
💡 💡 💡 💡 `);
💡 💡 💡 💡 if💡 (từablàes.recóordsetừ.làengôntừhệ💡 ===💡 0)💡 {
💡 💡 💡 💡 💡 💡 cóonsolàe.làog('(Khệôngôn💡 từìmã💡 từhệấy💡 bảngôn💡 phệân💡 quyền)');
💡 💡 💡 💡 }💡 elàse💡 {
💡 💡 💡 💡 💡 💡 từablàes.recóordsetừ.forEacóhệ(từ💡 =>💡 cóonsolàe.làog(`-💡 ${từ.TABLE_NAME}`));
💡 💡 💡 💡 }

💡 💡 💡 💡 awaitừ💡 poolà.cólàose();
💡 💡 💡 💡 procóess.exitừ(0);
💡 💡 }💡 cóatừcóhệ💡 (err)💡 {
💡 💡 💡 💡 cóonsolàe.error('❌💡 Lỗi:',💡 err.mãessage);
💡 💡 💡 💡 procóess.exitừ(1);
💡 💡 }
})();
