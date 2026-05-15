import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings
from typing import Any
import os

class CloudinaryStorageService:
    def __init__(self) -> None:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
            api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
            api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
            secure=True
        )

    def upload_file(self, file_obj, folder="materials") -> dict[str, Any]:
        extension = os.path.splitext(file_obj.name)[1].lower()
        
        if extension == '.pdf':
            resource_type = "raw"
        elif extension in ('.mp3', '.wav', '.m4a', '.aac', '.ogg'):
            resource_type = "video"
        else:
            resource_type = "auto"
        
        upload_result = cloudinary.uploader.upload(
            file_obj,
            folder=folder,
            resource_type=resource_type,
            type="upload",
            access_mode="public",
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )

        return {
            "filename": file_obj.name,
            "storage_provider": "cloudinary",
            "provider_file_id": upload_result.get("public_id", ""),
            "provider_path": upload_result.get("secure_url", ""),
        }

    def delete_file(self, public_id: str) -> None:
        if public_id and not public_id.startswith("http"):
            try:
                cloudinary.uploader.destroy(public_id, resource_type="raw")
            except:
                try:
                    cloudinary.uploader.destroy(public_id, resource_type="image")
                except:
                    cloudinary.uploader.destroy(public_id, resource_type="video")