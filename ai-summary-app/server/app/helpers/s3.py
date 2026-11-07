import logging
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException

from core.config import Config

logger = logging.getLogger(__name__)


class S3Helper:
    def __init__(self):
        self.client = boto3.client(
            "s3",
            endpoint_url=Config.ENDPOINT_URL,
            region_name=Config.AWS_REGION,
            aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
        )

    def upload_file(self, file, filename: str) -> str:
        try:
            self.client.upload_fileobj(
                Fileobj=file,
                Bucket=Config.AWS_BUCKET_NAME,
                Key=filename,
                ExtraArgs={
                    "ContentType": "text/plain",
                },
            )

            return (
                f"https://{Config.AWS_BUCKET_NAME}"
                f".s3.{Config.AWS_REGION}.amazonaws.com/{filename}"
            )

        except ClientError as e:
            logger.exception("Failed to upload file to S3.")
            raise HTTPException(
                status_code=500,
                detail=f"S3 Upload Error: {str(e)}",
            )

    def download_file(self, filename: str) -> str:
        try:
            response = self.client.get_object(
                Bucket=Config.AWS_BUCKET_NAME,
                Key=filename,
            )

            return response["Body"].read().decode("utf-8")

        except ClientError as e:
            logger.exception("Failed to download file from S3.")
            raise HTTPException(
                status_code=500,
                detail=f"S3 Download Error: {str(e)}",
            )

    def delete_file(self, filename: str):
        try:
            self.client.delete_object(
                Bucket=Config.AWS_BUCKET_NAME,
                Key=filename,
            )

        except ClientError as e:
            logger.exception("Failed to delete file from S3.")
            raise HTTPException(
                status_code=500,
                detail=f"S3 Delete Error: {str(e)}",
            )

    def file_exists(self, filename: str) -> bool:
        try:
            self.client.head_object(
                Bucket=Config.AWS_BUCKET_NAME,
                Key=filename,
            )
            return True

        except ClientError:
            return False


s3_helper = S3Helper()
