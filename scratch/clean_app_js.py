import os
import re

def clean_app_js(file_path):
    print(f"Cleaning {file_path}...")
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # 1. Fix double spacing (common in messy Windows edits)
    content = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
    
    # 2. Fix multiple consecutive empty lines (more than 2)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # 3. Detect duplicate function definitions (extremely common if edits were messy)
    # This is a bit risky but we can try to find blocks that appear twice
    # For now, let's just focus on the line count and double spacing.
    
    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    
    print(f"  Cleaned {file_path}. New line count: {len(content.splitlines())}")

clean_app_js(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\app.js")
