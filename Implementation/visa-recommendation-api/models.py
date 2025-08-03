from pydantic import BaseModel

class VisaRequest(BaseModel):
    """Request model for visa recommendation endpoint."""
    purpose: str
    savings: int
    gemini_api_key: str

    class Config:
        schema_extra = {
            "example": {
                "purpose": "go to Singapore for spouse visa",
                "savings": 600000,
                "gemini_api_key": "AIzaSyDtweizV0-1rnceLBC6qpzSU8iMl17jM54"
            }
        }

class VisaResponse(BaseModel):
    """Response model for visa recommendation endpoint."""
    query: str
    recommendation: str