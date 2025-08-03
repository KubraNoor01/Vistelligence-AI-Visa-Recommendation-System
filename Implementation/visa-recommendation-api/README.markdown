# Visa Recommendation API

A FastAPI-based API for generating personalized visa recommendations for Pakistani applicants, using a RAG model with FAISS and Gemini API. Users must provide their own Gemini API key with each request to configure the model.

## Setup Instructions

1. **Install Python**:
   - Ensure Python 3.8+ is installed (`python --version`).
   - Download from https://www.python.org/downloads/ if needed.

2. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd visa-recommendation-api
   ```

3. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   ```
   - Activate:
     - Windows: `venv\Scripts\activate`
     - macOS/Linux: `source venv/bin/activate`

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the API**:
   ```bash
   uvicorn main:app --reload
   ```
   - API runs at `http://localhost:8000`.

6. **Generate FAISS Index**:
   ```bash
   curl -X POST http://localhost:8000/generate-index
   ```
   - Takes ~1–2 minutes, generates ~600–700 chunks.

7. **Test Visa Recommendation**:
   - Provide your Gemini API key in the request:
   ```bash
   curl -X POST http://localhost:8000/visa-recommendation \
   -H "Content-Type: application/json" \
   -d '{"purpose": "go to Singapore for spouse visa", "savings": 600000, "gemini_api_key": "your_gemini_api_key_here"}'
   ```
   - Or use Python:
     ```python
     import requests
     response = requests.post(
         "http://localhost:8000/visa-recommendation",
         json={
             "purpose": "go to Singapore for spouse visa",
             "savings": 600000,
             "gemini_api_key": "your_gemini_api_key_here"
         }
     )
     print(response.json())
     ```

8. **Access Documentation**:
   - Open `http://localhost:8000/docs` for Swagger UI.

## Project Structure

- `main.py`: FastAPI app and endpoints
- `config.py`: Configuration settings
- `models.py`: Pydantic models
- `services/`: Business logic
  - `data_processing.py`: Data processing (Steps 2–4)
  - `visa_recommendation.py`: Visa recommendation (Steps 5–6)
- `utils/`: Utility functions
  - `scraper.py`: Web scraping
  - `embedding.py`: FAISS and embeddings
  - `logging.py`: Logging setup
- `requirements.txt`: Dependencies
- `.env.example`: Example environment variables (none required)
- `README.md`: This file

## Notes

- **Gemini API Key**: You must include a valid Gemini API key in every `/visa-recommendation` request.
- **Performance**: ~10–20s per recommendation, ~1–2m for index generation.
- **Logging**: Logs saved to `logs/visa_recommendation.log`.
- **Limitations**: Google scraper may hit CAPTCHAs. Consider SerpAPI for production:
  ```bash
  pip install google-search-results
  ```

## Troubleshooting

- **FAISS Index Missing**: Run `POST /generate-index`.
- **Gemini API Error**: Verify the API key provided in the request is valid.
- **Port Conflict**: Change port (e.g., `uvicorn main:app --port 8001`).

Contact for support: [Your contact info]