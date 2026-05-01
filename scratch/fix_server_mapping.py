import sys
import os

file_path = 'server.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update mapping logic
old_block = """      // Collect grading criteria
      if (row.TenTieuChi) {
        criteriaMap[exId].push({
          id: row.Id,
          name: row.TenTieuChi,
          order: row.ThuTu || 0,
          points: row.TrongSo || 0
        });
      }
    }

    // Add grading criteria to exercises
    for (const exId in exercisesMap) {
      exercisesMap[exId].grading_criteria = criteriaMap[exId];
    }"""

new_block = """      // Ensure helper properties exist
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
    }

    // Finalize and cleanup
    for (const exId in exercisesMap) {
      exercisesMap[exId].grading_criteria = criteriaMap[exId];
      // Set primary submission_format for UI compatibility
      exercisesMap[exId].submission_format = exercisesMap[exId].submission_formats.length ? exercisesMap[exId].submission_formats[0].name : '';
      delete exercisesMap[exId]._criteria_set;
      delete exercisesMap[exId]._format_set;
    }"""

content = content.replace(old_block, new_block)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
