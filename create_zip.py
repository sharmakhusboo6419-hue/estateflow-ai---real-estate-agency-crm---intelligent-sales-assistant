import zipfile
import os

exclude_dirs = {'node_modules', '.git', 'dist', '.aistudio'}
zip_filename = 'estateflow-ai-crm.zip'

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file in [zip_filename, 'create_zip.py']:
                continue
            filepath = os.path.join(root, file)
            arcname = os.path.relpath(filepath, '.')
            zipf.write(filepath, arcname)

print(f"Zip created successfully: {os.path.getsize(zip_filename)} bytes")
