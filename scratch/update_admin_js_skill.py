import sys
import os

file_path = 'public/admin.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update openAdminExerciseModal to set skill_level
old_open = "document.getElementById('admin-field-difficulty').value = exercise.difficulty;"
new_open = """document.getElementById('admin-field-difficulty').value = exercise.difficulty;
    if (document.getElementById('admin-field-skill-level')) {
        document.getElementById('admin-field-skill-level').value = exercise.skill_level || 1;
    }"""
content = content.replace(old_open, new_open)

# Update saveAdminExercise to collect skill_level
old_data = "description: getVal('admin-field-description'),"
new_data = """description: getVal('admin-field-description'),
    skill_level: getVal('admin-field-skill-level'),"""
content = content.replace(old_data, new_data)

old_append = "finalFd.append('description', exerciseData.description);"
new_append = """finalFd.append('description', exerciseData.description);
    finalFd.append('skill_level', exerciseData.skill_level);"""
content = content.replace(old_append, new_append)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
