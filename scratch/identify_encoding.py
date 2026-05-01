import os

def identify_non_ascii(file_path):
    print(f"Scanning {file_path}...")
    with open(file_path, 'rb') as f:
        content = f.read()
    
    # Try to decode as UTF-8
    try:
        text = content.decode('utf-8')
        for i, char in enumerate(text):
            if ord(char) > 127:
                # Print hex and character context
                context = text[max(0, i-10):min(len(text), i+10)]
                print(f"Pos {i}: Hex {hex(ord(char))} Char '{char}' Context: ...{repr(context)}...")
    except UnicodeDecodeError as e:
        print(f"Error decoding: {e}")

identify_non_ascii(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\lecturer.html")
