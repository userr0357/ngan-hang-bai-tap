import sys
import os

file_path = 'server.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SQL Query to include Lecturer name
old_query_block = """    // Query BAITAP with joins to MONHOC and TIEUCHI_DANGBAI
    const query = `
      SELECT 
        bt.Id,
        bt.MaBaiTap,
        bt.TenBaiTap,
        bt.MaDoKho,
        bt.MaDangBai,
        bt.MoTa,
        bt.YeuCau,
        bt.TieuChiChamDiem,
        bt.MaMon,
        bt.FileDinhKem,
        m.TenMon,
        esm.SkillLevel,
        td.TenTieuChi,
        td.ThuTu,
        td.TrongSo,
        dd.TenDinhDang,
        dd.MaDinhDang
      FROM BAITAP bt
      LEFT JOIN MONHOC m ON bt.MaMon = m.MaMon
      LEFT JOIN TIEUCHI_DANGBAI td ON bt.MaDangBai = td.MaDangBai
      LEFT JOIN EXERCISE_SKILL_METADATA esm ON bt.Id = esm.BaiTapId
      LEFT JOIN BAITAP_DINHDANG bdd ON bt.Id = bdd.BaiTapId
      LEFT JOIN DINHDANG_NOPBAI dd ON bdd.MaDinhDang = dd.MaDinhDang
      ORDER BY bt.MaBaiTap, td.ThuTu
    `;"""

new_query_block = """    // Query BAITAP with all necessary joins
    const query = `
      SELECT 
        bt.Id,
        bt.MaBaiTap,
        bt.TenBaiTap,
        bt.MaDoKho,
        bt.MaDangBai,
        bt.MoTa,
        bt.YeuCau,
        bt.TieuChiChamDiem,
        bt.MaMon,
        bt.FileDinhKem,
        bt.MaGiangVien,
        gv.HoTen as TenGiangVien,
        m.TenMon,
        esm.SkillLevel,
        td.TenTieuChi,
        td.ThuTu,
        td.TrongSo,
        dd.TenDinhDang,
        dd.MaDinhDang
      FROM BAITAP bt
      LEFT JOIN MONHOC m ON bt.MaMon = m.MaMon
      LEFT JOIN GIANGVIEN gv ON bt.MaGiangVien = gv.MaGiangVien
      LEFT JOIN TIEUCHI_DANGBAI td ON bt.MaDangBai = td.MaDangBai
      LEFT JOIN EXERCISE_SKILL_METADATA esm ON bt.Id = esm.BaiTapId
      LEFT JOIN BAITAP_DINHDANG bdd ON bt.Id = bdd.BaiTapId
      LEFT JOIN DINHDANG_NOPBAI dd ON bdd.MaDinhDang = dd.MaDinhDang
      ORDER BY bt.Id, td.ThuTu
    `;"""

content = content.replace(old_query_block, new_query_block)

# 2. Update Mapping Logic to be more robust
old_mapping_block = """    const exercisesMap = {};
    const criteriaMap = {};

    for (const row of result.recordset) {
      const exId = row.Id;
      if (!exercisesMap[exId]) {
        exercisesMap[exId] = {
          id: exId,
          title: row.TenBaiTap || '',
          name: row.MaBaiTap || '',
          content: row.MoTa || '',
          description: row.MoTa || '',
          requirements: row.YeuCau ? [row.YeuCau] : [],
          form_id: String(row.MaDangBai || ''),
          difficulty: difficultyMap[row.MaDoKho] || 'Trung bình',
          skill_level: row.SkillLevel || 1,
          subject_id: row.MaMon || '',
          subject_name: row.TenMon || '',
          file_dinh_kem: row.FileDinhKem || null,
          grading_criteria: []
        };
        criteriaMap[exId] = [];
      // Ensure helper properties exist
        exercisesMap[exId].submission_formats = exercisesMap[exId].submission_formats || [];
        exercisesMap[exId]._criteria_set = exercisesMap[exId]._criteria_set || new Set();
        exercisesMap[exId]._format_set = exercisesMap[exId]._format_set || new Set();
      }

      // Collect grading criteria (unique per exercise)
      if (row.TenTieuChi && !exercisesMap[exId]._criteria_set.has(row.TenTieuChi)) {
        exercisesMap[exId]._criteria_set.add(row.TenTieuChi);
        criteriaMap[exId].push({
          id: row.Id,
          name: row.TenTieuChi,
          order: row.ThuTu || 0,
          points: row.TrongSo || 0
        });
      }

      // Collect submission formats (unique per exercise)
      if (row.TenDinhDang && !exercisesMap[exId]._format_set.has(row.TenDinhDang)) {
        exercisesMap[exId]._format_set.add(row.TenDinhDang);
        exercisesMap[exId].submission_formats.push({
          id: row.MaDinhDang,
          name: row.TenDinhDang
        });
      }
    }"""

new_mapping_block = """    const exercisesMap = {};
    const criteriaMap = {};

    for (const row of result.recordset) {
      const exId = row.Id;
      if (!exercisesMap[exId]) {
        exercisesMap[exId] = {
          id: exId,
          title: row.TenBaiTap || '',
          name: row.MaBaiTap || '',
          content: row.MoTa || '',
          description: row.MoTa || '',
          requirements: row.YeuCau ? [row.YeuCau] : [],
          form_id: String(row.MaDangBai || ''),
          difficulty: difficultyMap[row.MaDoKho] || 'Trung bình',
          skill_level: row.SkillLevel || 1,
          subject_id: row.MaMon || '',
          subject_name: row.TenMon || '',
          owner: row.MaGiangVien || '',
          owner_name: row.TenGiangVien || 'Hệ thống',
          file_dinh_kem: row.FileDinhKem || null,
          submission_formats: [],
          grading_criteria: [],
          _criteria_set: new Set(),
          _format_set: new Set()
        };
        criteriaMap[exId] = [];
      } else {
        // Update fields if they were missing in previous rows
        if (!exercisesMap[exId].name && row.MaBaiTap) exercisesMap[exId].name = row.MaBaiTap;
        if (!exercisesMap[exId].subject_name && row.TenMon) exercisesMap[exId].subject_name = row.TenMon;
        if (!exercisesMap[exId].owner_name && row.TenGiangVien) exercisesMap[exId].owner_name = row.TenGiangVien;
      }

      // Collect grading criteria (unique per exercise)
      if (row.TenTieuChi && !exercisesMap[exId]._criteria_set.has(row.TenTieuChi)) {
        exercisesMap[exId]._criteria_set.add(row.TenTieuChi);
        criteriaMap[exId].push({
          id: row.Id,
          name: row.TenTieuChi,
          order: row.ThuTu || 0,
          points: row.TrongSo || 0
        });
      }

      // Collect submission formats (unique per exercise)
      if (row.TenDinhDang && !exercisesMap[exId]._format_set.has(row.TenDinhDang)) {
        exercisesMap[exId]._format_set.add(row.TenDinhDang);
        exercisesMap[exId].submission_formats.push({
          id: row.MaDinhDang,
          name: row.TenDinhDang
        });
      }
    }"""

content = content.replace(old_mapping_block, new_mapping_block)

# 3. Update the finalize loop to handle multiple formats string
old_finalize = """    // Finalize and cleanup
    for (const exId in exercisesMap) {
      exercisesMap[exId].grading_criteria = criteriaMap[exId];
      // Set primary submission_format for UI compatibility
      exercisesMap[exId].submission_format = exercisesMap[exId].submission_formats.length ? exercisesMap[exId].submission_formats[0].name : '';
      delete exercisesMap[exId]._criteria_set;
      delete exercisesMap[exId]._format_set;
    }"""

new_finalize = """    // Finalize and cleanup
    for (const exId in exercisesMap) {
      exercisesMap[exId].grading_criteria = criteriaMap[exId];
      // Join all formats for display
      exercisesMap[exId].submission_format = exercisesMap[exId].submission_formats.map(f => f.name).join(', ') || '';
      delete exercisesMap[exId]._criteria_set;
      delete exercisesMap[exId]._format_set;
    }"""

content = content.replace(old_finalize, new_finalize)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
