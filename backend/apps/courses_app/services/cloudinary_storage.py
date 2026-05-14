import cloudinary
import cloudinary.uploader
from django.conf import settings
from typing import Any


class CloudinaryStorageService:
    def __init__(self) -> None:
        pass

    def upload_file(self, file_obj, folder="materials") -> dict[str, Any]:
        """
        Upload a file to Cloudinary and return the file details
        """
        try:
            # Upload the file to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                resource_type="auto",
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
                "url": upload_result.get("secure_url", ""),
                "format": upload_result.get("format", ""),
                "size": upload_result.get("bytes", 0),
            }
        except Exception as e:
            raise Exception(f"Failed to upload file to Cloudinary: {str(e)}")

    def get_download_url(self, public_id_or_url: str) -> str:
        """
        Generate a direct download URL for a file
        """
        try:
            if public_id_or_url.startswith("http"):
                if "?" in public_id_or_url:
                    if "fl_attachment" not in public_id_or_url:
                        return public_id_or_url + "&fl_attachment=true"
                else:
                    return public_id_or_url + "?fl_attachment=true"
            
            download_url = cloudinary.utils.cloudinary_url(
                public_id_or_url,
                resource_type="auto",
                flags="attachment"
            )[0]
            
            return download_url
        except Exception as e:
            raise Exception(f"Failed to generate download URL: {str(e)}")

    def delete_file(self, public_id: str) -> None:
        """
        Delete a file from Cloudinary
        """
        try:
            if not public_id:
                return
            
            if public_id.startswith("http"):
                parts = public_id.split("/")
                for i, part in enumerate(parts):
                    if part.startswith("v") and part[1:].isdigit():
                        public_id = "/".join(parts[i+1:]).rsplit(".", 1)[0]
                        break
            
            cloudinary.uploader.destroy(public_id, resource_type="auto")
        except Exception as e:
            print(f"Warning: Failed to delete file from Cloudinary: {str(e)}")

    def get_file_info(self, public_id: str) -> dict:
        """
        Get file information from Cloudinary
        """
        try:
            result = cloudinary.api.resource(public_id, resource_type="auto")
            return {
                "public_id": result.get("public_id"),
                "url": result.get("secure_url"),
                "format": result.get("format"),
                "size": result.get("bytes"),
                "created_at": result.get("created_at"),
            }
        except Exception as e:
            raise Exception(f"Failed to get file info: {str(e)}")