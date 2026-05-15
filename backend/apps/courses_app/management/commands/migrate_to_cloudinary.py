from django.core.management.base import BaseCommand
from apps.courses_app.models import Material
from apps.courses_app.services.cloudinary_storage import CloudinaryStorageService
from apps.courses_app.services.dropbox_storage import DropboxStorageService
import requests
import tempfile
import os

class Command(BaseCommand):
    help = 'Migrate existing Dropbox files to Cloudinary'

    def handle(self, *args, **options):
        dropbox_materials = Material.objects.filter(storage_provider='dropbox')
        
        cloudinary_storage = CloudinaryStorageService()
        dropbox_storage = DropboxStorageService()
        
        for material in dropbox_materials:
            try:
                # Download from Dropbox
                download_url = dropbox_storage.get_download_link(material.provider_path)
                response = requests.get(download_url)
                
                # Save to temp file
                with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(material.filename)[1]) as temp_file:
                    temp_file.write(response.content)
                    temp_file.flush()
                    
                    # Upload to Cloudinary
                    with open(temp_file.name, 'rb') as file_to_upload:
                        uploaded = cloudinary_storage.upload_file(file_to_upload)
                        
                        # Update material record
                        material.storage_provider = 'cloudinary'
                        material.provider_file_id = uploaded['provider_file_id']
                        material.provider_path = uploaded['provider_path']
                        material.save()
                        
                        self.stdout.write(f'Migrated: {material.filename}')
                
                # Clean up temp file
                os.unlink(temp_file.name)
                
            except Exception as e:
                self.stderr.write(f'Failed to migrate {material.filename}: {str(e)}')
        
        self.stdout.write('Migration completed!')