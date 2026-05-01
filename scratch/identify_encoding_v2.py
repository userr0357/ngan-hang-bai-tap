import os

def identify_non_ascii(file_path, output_path):
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write(f"Scanning {file_path}...\n")
        with open(file_path, 'rb') as f:
            content = f.read()
        
        try:
            text = content.decode('utf-8')
            for i, char in enumerate(text):
                if ord(char) > 127:
                    context = text[max(0, i-10):min(len(text), i+10)]
                    out.write(f"Pos {i}: Hex {hex(ord(char))} Char '{char}' Context: ...{repr(context)}...\n")
        except UnicodeDecodeError as e:
            out.write(f"Error decoding: {e}\n")

identify_non_ascii(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\lecturer.html", r"c:\Users\Admin\Downloads\PTUD\PTUD\scratch\encoding_report.txt")
