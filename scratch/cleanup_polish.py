import os

def cleanup_last_artifacts():
    root_dirs = [r"c:\Users\Admin\Downloads\PTUD\PTUD\public", r"c:\Users\Admin\Downloads\PTUD\PTUD"]
    extensions = [".html", ".js", ".css"]
    
    # Specific targeted fixes for the "over-replaced" artifacts
    cleanup_map = {
        'ngônôn': 'ng',
        'thànhành': 'th',
        'thành': 'th',
        'paddingônôn': 'padding',
        'Đangônôn': 'Đang',
        'Khôngônôn': 'Không',
        'warningônôn': 'warning',
        'dangônôner': 'danger',
        'stringônônify': 'stringify',
        'gradingônôn': 'grading',
        'Lượngônôn': 'Lượng',
        'mããessage': 'message',
        'mããarked': 'marked',
        'mããax': 'max',
        'mããargin': 'margin',
        'mããodalàà': 'modal',
        'mããap': 'map',
        'mããain': 'main',
        'phệệân': 'phân',
        'phânônôn': 'phân',
        'từừícóóhệệ': 'tích',
        'phân tích': 'phân tích',
        'cải th thiện': 'cải thiện',
        'cải th hiện': 'cải thiện',
        'cải thànhànhiện': 'cải thiện',
        'thànhànhiện': 'thiện',
        'methànhod': 'method',
        'methànhànhod': 'method',
        'phân ônôn': 'phân ',
    }

    print("Cleaning up final artifacts...")
    
    files_modified = 0
    for base_dir in root_dirs:
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    if "scratch" in root: continue
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        original = content
                        for bad in sorted(cleanup_map.keys(), key=len, reverse=True):
                            content = content.replace(bad, cleanup_map[bad])
                        
                        if content != original:
                            with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
                                f.write(content)
                            files_modified += 1
                    except: pass

    print(f"Cleanup complete! {files_modified} files polished.")

if __name__ == "__main__":
    cleanup_last_artifacts()
