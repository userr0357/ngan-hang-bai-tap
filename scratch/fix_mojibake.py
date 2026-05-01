import os

def fix_encoding(file_path):
    print(f"Fixing {file_path}...")
    with open(file_path, 'rb') as f:
        content = f.read()
    
    # Mojibake often happens when UTF-8 bytes are interpreted as ISO-8859-1 (Latin1)
    # and then saved again as UTF-8. 
    # Example: 'ả' is 0xE1 0xBA 0xA3. 
    # In Latin1, 0xE1=á, 0xBA=º, 0xA3=£. 
    # So 'ả' becomes 'áº£'.
    
    # We can try to undo this by encoding the string back to Latin1 and then decoding as UTF-8.
    try:
        # First, convert to string as it is (likely corrupted UTF-8)
        text = content.decode('utf-8')
        
        # Check if it looks like Mojibake
        if 'áº' in text or 'Ã³' in text or 'á»‹' in text or 'áº£' in text:
            # Re-encode to latin1 to get raw bytes, then decode as utf-8
            # This is the standard "Mojibake reversal"
            corrected = text.encode('latin-1').decode('utf-8')
            print(f"  Successfully reversed Mojibake for {file_path}")
            
            with open(file_path, 'wb') as f:
                f.write(corrected.encode('utf-8'))
        else:
            print(f"  No obvious Mojibake found in {file_path}")
    except Exception as e:
        print(f"  Error fixing {file_path}: {e}")
        # Fallback: manual replace for common strings if the above fails
        pass

files = [
    r"c:\Users\Admin\Downloads\PTUD\PTUD\public\app.js",
    r"c:\Users\Admin\Downloads\PTUD\PTUD\public\lecturer.html"
]

for f in files:
    if os.path.exists(f):
        fix_encoding(f)
    else:
        print(f"File not found: {f}")
