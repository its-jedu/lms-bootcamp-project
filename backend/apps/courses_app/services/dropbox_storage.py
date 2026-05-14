import dropbox
from django.conf import settings
from dropbox.files import WriteMode
from typing import Any


class DropboxStorageService:
    def __init__(self) -> None:
        self.client = dropbox.Dropbox(settings.DROPBOX_ACCESS_TOKEN)
        self.base_folder = getattr(settings, "DROPBOX_APP_FOLDER", "/materials").rstrip("/")

    def _target_path(self, filename: str) -> str:
        return f"{self.base_folder}/{filename}"

    def upload_file(self, file_obj) -> dict[str, Any]:
        filename = file_obj.name
        target_path = self._target_path(filename)

        content = file_obj.read()
        file_obj.seek(0)

        metadata = self.client.files_upload(
            content,
            target_path,
            mode=WriteMode("add"),
            mute=True,
        )

        return {
            "filename": filename,
            "storage_provider": "dropbox",
            "provider_file_id": metadata.id,
            "provider_path": metadata.path_lower,
        }
    
    def get_download_link(self, provider_path: str) -> str:
        links = self.client.sharing_list_shared_links(
            path=provider_path,
            direct_only=True
        ).links

        if links:
            return self._to_direct_download(links[0].url)

        link = self.client.sharing_create_shared_link_with_settings(provider_path)
        return self._to_direct_download(link.url)

    def _to_direct_download(self, url: str) -> str:
        if "dl=0" in url:
            return url.replace("dl=0", "dl=1")
        if "dl=1" in url:
            return url
        return f"{url}?dl=1"

    def delete_file(self, provider_path: str) -> None:
        self.client.files_delete_v2(provider_path)