import urllib.parse

from routers.ai_summary.service import AIService
from routers.ai_summary.repository import DocumentRepository


repository = DocumentRepository()
service = AIService(repository)


def lambda_handler(event, context):
    for record in event["Records"]:
        s3_key = urllib.parse.unquote_plus(
            record["s3"]["object"]["key"]
        )

        service.process_document(s3_key)
