import os
import django
import sys

# Add your project path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import cloudinary
import cloudinary.uploader
from django.conf import settings

# Test connection
try:
    result = cloudinary.api.ping()
    print("Cloudinary connection: SUCCESS")
    print(f"Status: {result.get('status')}")
except Exception as e:
    print(f"Cloudinary connection: FAILED")
    print(f"Error: {str(e)}")

# Test upload with a small file
try:
    test_file = "test_upload.txt"
    with open(test_file, "w") as f:
        f.write("Test upload to Cloudinary")
    
    with open(test_file, "rb") as f:
        result = cloudinary.uploader.upload(
            f,
            folder="test",
            resource_type="auto"
        )
        print("Upload test: SUCCESS")
        print(f"URL: {result.get('secure_url')}")
    
    os.remove(test_file)
except Exception as e:
    print(f"Upload test: FAILED")
    print(f"Error: {str(e)}")