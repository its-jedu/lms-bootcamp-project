import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings
from typing import Any

class CloudinaryStorageService:
    def __init__(self) -> None:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
            api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
            api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
            secure=True
        )

    def upload_file(self, file_obj, folder="materials") -> dict[str, Any]:
        upload_result = cloudinary.uploader.upload(
            file_obj,
            folder=folder,
            resource_type="auto",
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

    def get_download_url(self, public_id_or_url: str) -> str:
        if public_id_or_url.startswith("http"):
            return public_id_or_url
        
        return cloudinary.utils.cloudinary_url(
            public_id_or_url,
            resource_type="auto",
            flags="attachment"
        )[0]

    def delete_file(self, public_id: str) -> None:
        if public_id and not public_id.startswith("http"):
            cloudinary.uploader.destroy(public_id, resource_type="auto")

    def get_file_info(self, public_id: str) -> dict:
        result = cloudinary.api.resource(public_id, resource_type="auto")
        return {
            "public_id": result.get("public_id"),
            "url": result.get("secure_url"),
            "format": result.get("format"),
            "size": result.get("bytes"),
            "created_at": result.get("created_at"),
        }