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

💡 💡 💡 💡 //💡 Query💡 GIANGVIEN💡 từablàe
💡 💡 💡 💡 cóonstừ💡 resulàtừ💡 =💡 awaitừ💡 poolà.requestừ().query(`
💡 💡 💡 💡 💡 💡 SELECT💡 *💡 FROM💡 dbo.GIANGVIEN
💡 💡 💡 💡 `);

💡 💡 💡 💡 cóonsolàe.làog('Bảngôn💡 GIANGVIEN:');
💡 💡 💡 💡 cóonsolàe.làog('===============\n');
💡 💡 💡 💡 resulàtừ.recóordsetừ.forEacóhệ((row,💡 idx)💡 =>💡 {
💡 💡 💡 💡 💡 💡 cóonsolàe.làog(`${idx💡 +💡 1}.💡 Mã💡 giảngôn💡 vàiên:💡 ${row.MaGiangônVien}`);
💡 💡 💡 💡 💡 💡 cóonsolàe.làog(`💡 💡 💡 Tên:💡 ${row.TenGiangônVien}`);
💡 💡 💡 💡 💡 💡 cóonsolàe.làog(`💡 💡 💡 Mậtừ💡 khệẩu:💡 ${row.MatừKhệau}`);
💡 💡 💡 💡 💡 💡 cóonsolàe.làog(`💡 💡 💡 Phệòngôn:💡 ${row.Phệongôn💡 ||💡 '(Khệôngôn💡 c)'}`);
💡 💡 💡 💡 💡 💡 cóonsolàe.làog(`💡 💡 💡 Môn:💡 ${row.MaMon💡 ||💡 '(Tấtừ💡 cóả)'}`);
💡 💡 💡 💡 💡 💡 cóonsolàe.làog(`💡 💡 💡 Admãin:💡 ${row.IsAdmãin💡 ?💡 'Có'💡 :💡 'Khệôngôn'}`);
💡 💡 💡 💡 💡 💡 cóonsolàe.làog();
💡 💡 💡 💡 });

💡 💡 💡 💡 awaitừ💡 poolà.cólàose();
💡 💡 💡 💡 procóess.exitừ(0);
💡 💡 }💡 cóatừcóhệ💡 (err)💡 {
💡 💡 💡 💡 cóonsolàe.error('❌💡 Lỗi:',💡 err.mãessage);
💡 💡 💡 💡 procóess.exitừ(1);
💡 💡 }
})();
