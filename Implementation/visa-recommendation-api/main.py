from fastapi import FastAPI, HTTPException
from models import VisaRequest, VisaResponse
from services.data_processing import DataProcessingService
from services.visa_recommendation import VisaRecommendationService
from utils.logging import setup_logging
import logging

app = FastAPI(
    title="Visa Recommendation API",
    description="API for generating personalized visa recommendations for Pakistani applicants",
    version="1.0.0"
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize services and setup logging on startup."""
    setup_logging()
    logger.info("Starting Visa Recommendation API")

@app.post("/generate-index", response_model=dict)
async def generate_index():
    """Generate FAISS index and cached files from visa URLs."""
    try:
        processor = DataProcessingService()
        result = await processor.process_data()
        logger.info(f"Index generated with {result['chunks']} chunks in {result['time']:.2f} seconds")
        return {"message": f"Index generated successfully in {result['time']:.2f} seconds", "chunks": result['chunks']}
    except Exception as e:
        logger.error(f"Error generating index: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating index: {str(e)}")

@app.post("/visa-recommendation", response_model=VisaResponse)
async def visa_recommendation(request: VisaRequest):
    """Generate a personalized visa recommendation based on user input."""
    try:
        recommender = VisaRecommendationService()
        recommendation = await recommender.generate_recommendation(
            purpose=request.purpose,
            savings=request.savings,
            gemini_api_key=request.gemini_api_key
        )
        logger.info(f"Generated recommendation for query: {request.purpose}")
        return VisaResponse(query=request.purpose, recommendation=recommendation)
    except ValueError as e:
        logger.error(f"Invalid input: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)