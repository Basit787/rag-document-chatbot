from decouple import config, Csv


class Config:
    DATABASE_URL = config("DATABASE_URL")
    BACKEND_ORIGINS = config("BACKEND_ORIGINS", cast=Csv())
    JWT_SECRET = config("JWT_SECRET", default="super_solid_jwt_secret_key")
    JWT_ALGORITHM = config("JWT_ALGORITHM", default="HS256")
    AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = config("AWS_REGION")
    AWS_BUCKET_NAME = config("AWS_BUCKET_NAME")
    ENDPOINT_URL = config("ENDPOINT_URL")
    OPENROUTER_API_KEY = config("OPENROUTER_API_KEY")
    OPENROUTER_BASE_URL = config(
        "OPENROUTER_BASE_URL",
        default="https://openrouter.ai/api/v1",
    )
    OPENROUTER_MODEL = config("OPENROUTER_MODEL")
    AI_SUMMARY_LAMBDA = config("AI_SUMMARY_LAMBDA", default="lambda-function")
