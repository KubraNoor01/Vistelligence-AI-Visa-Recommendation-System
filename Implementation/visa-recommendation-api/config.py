from pydantic import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    """Application configuration settings."""
    DATA_DIR: str = str(Path(__file__).parent / "data")
    DOCUMENTS_FILE: str = "documents.pkl"
    CHUNKS_FILE: str = "visa_chunks.csv"
    FAISS_INDEX_FILE: str = "visa_embeddings.faiss"
    METADATA_FILE: str = "visa_metadata.pkl"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    MAX_CHUNK_SIZE: int = 500
    MAX_WEB_RESULTS: int = 5
    DEFAULT_STUDY_DESTINATIONS: list = ["USA", "UK", "Canada", "Australia", "Malaysia", "Germany"]
    CURRENCY_RATES: dict = {
        "USD": 280, "GBP": 350, "MYR": 60, "CAD": 200, "AUD": 180, "EUR": 300, "SGD": 168
    }

settings = Settings()