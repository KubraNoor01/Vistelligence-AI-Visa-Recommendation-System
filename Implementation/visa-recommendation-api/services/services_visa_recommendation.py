import re
import random
import logging
import google.generativeai as genai
from typing import List, Dict, Optional, Tuple
from utils.embedding import load_index_and_metadata
from utils.scraper import autonomous_web_search
from config import settings
from sentence_transformers import SentenceTransformer
import numpy as np
import torch

logger = logging.getLogger(__name__)

class VisaRecommendationService:
    """Service for generating visa recommendations based on user queries."""

    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = self.model.to(self.device)
        self.visa_type_map = {
            "tourism": ["visitor visa", "standard visitor", "tourist visa"],
            "study": ["student visa", "study permit", "student pass"],
            "work": ["work permit", "skilled worker", "employment pass"],
            "family": ["family visa", "dependant pass", "long-term visit pass"]
        }

    def parse_intent(self, purpose: str) -> str:
        """Parse the intent from the user's purpose."""
        purpose_lower = purpose.lower()
        if any(keyword in purpose_lower for keyword in ["tourism", "visit", "honeymoon"]):
            return "tourism"
        elif any(keyword in purpose_lower for keyword in ["study", "student"]):
            return "study"
        elif any(keyword in purpose_lower for keyword in ["work", "job"]):
            return "work"
        elif any(keyword in purpose_lower for keyword in ["spouse", "family", "dependant"]):
            return "family"
        return "tourism"

    async def retrieve_relevant_chunks(
        self, query: str, intent: str, user_context: Dict, top_k: int = 10
    ) -> Tuple[List[Dict], Optional[str]]:
        """Retrieve relevant chunks from FAISS index or web search."""
        index, metadata = load_index_and_metadata(
            index_file=settings.FAISS_INDEX_FILE,
            metadata_file=settings.METADATA_FILE
        )
        query_embedding = self.model.encode([query], convert_to_numpy=True, show_progress_bar=False, normalize_embeddings=True).astype('float32')
        distances, indices = index.search(query_embedding, top_k)
        results = []

        country_match = re.search(r'(?:in|to|for)\s+([A-Za-z\s]+)(?:\s|$)', query, re.IGNORECASE)
        target_country = country_match.group(1).strip() if country_match else None
        if not target_country:
            country_match = re.search(r'(?:in|to|for)\s+([A-Za-z\s]+)(?:\s|$)', user_context['purpose'], re.IGNORECASE)
            target_country = country_match.group(1).strip() if country_match else None

        if not target_country and intent.lower() == "study":
            target_country = "Malaysia" if user_context['savings'] <= 600000 else random.choice(settings.DEFAULT_STUDY_DESTINATIONS)
            logger.info(f"No specific country detected. Defaulting to {target_country} for study intent.")

        target_visa_types = self.visa_type_map.get(intent.lower(), [])
        for idx, dist in zip(indices[0], distances[0]):
            if idx < len(metadata):
                result = metadata[idx].copy()
                result['distance'] = float(dist)
                country_score = 2.0 if target_country and target_country.lower() in result['country'].lower() else (0.5 if not target_country else 0.1)
                visa_score = 1.0 if any(vt.lower() in result['visa_type'].lower() for vt in target_visa_types) else 0.1
                result['relevance_score'] = country_score * visa_score * (1.0 - dist)
                results.append(result)

        results = sorted(results, key=lambda x: x['relevance_score'], reverse=True)
        filtered_results = [r for r in results if target_country and target_country.lower() in r['country'].lower() and any(vt.lower() in r['visa_type'].lower() for vt in target_visa_types)]
        if len(filtered_results) < 3 and target_country:
            logger.info(f"Insufficient relevant chunks for {target_country}. Performing web search...")
            web_results = await autonomous_web_search(query, target_country, intent, max_results=settings.MAX_WEB_RESULTS)
            filtered_results.extend(web_results)

        results = filtered_results[:5] if filtered_results else results[:5]
        if not results and target_country:
            logger.info(f"No relevant chunks found for {target_country}. Attempting fallback web search.")
            web_results = await autonomous_web_search(query, target_country, intent, max_results=settings.MAX_WEB_RESULTS)
            results = web_results[:5]

        logger.info(f"Retrieved {len(results)} chunks for query: {query}")
        return results, target_country

    async def generate_answer(
        self, query: str, intent: str, relevant_chunks: List[Dict], user_context: Dict, target_country: Optional[str], gemini_api_key: str
    ) -> str:
        """Generate a structured visa recommendation using Gemini API."""
        try:
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            context = "\n".join([f"Country: {chunk['country']}, Visa Type: {chunk['visa_type']}, Source: {chunk['url']}\nContent: {chunk['content']}" for chunk in relevant_chunks])
            user_info = f"User Profile: Purpose: {user_context['purpose']}, Savings: PKR {user_context['savings']}"

            if not target_country:
                target_country = "Malaysia" if user_context['savings'] <= 600000 else random.choice(settings.DEFAULT_STUDY_DESTINATIONS)
                logger.info(f"No target country specified. Using {target_country} as default.")

            initial_prompt = f"""
Answer the following query based on the provided context and user profile:
Query: {query}
User Profile: {user_info}
Context: {context}

The user's intent is '{intent}' for {target_country}. Provide a structured response in the following format, recommending ONE specific country ({target_country}) and visa type that best matches the user's purpose and savings:

---

**Personalized Visa Recommendation Guide for Pakistani Applicants**

This guide provides a personalized visa recommendation for a Pakistani applicant planning a {intent} trip to {target_country} with a budget of PKR {user_context['savings']}. Using data from official immigration sources, the model suggests the best visa type, costs, and tips to maximize visa approval.

**Model’s Recommendation**

**Recommended Country**: {target_country}  
**Visa Type**: [Specific Visa Type, e.g., Long-Term Visit Pass for Singapore]  
**Why {target_country}?**:  
- [Reason 1, e.g., suitability for {intent}]  
- [Reason 2, e.g., visa requirements feasibility]  
- [Reason 3, e.g., alignment with budget or intent]  

**Cost Breakdown**:  
- Visa Fee: [Exact amount in local currency and PKR, e.g., SGD 225 (~PKR 37,800)]  
- Additional Fees: [e.g., document attestation, if applicable]  
- Travel: [Estimated travel cost in PKR, e.g., PKR 50,000–100,000]  
- Medical Check: [Cost in PKR, if required, e.g., PKR 5,000–10,000]  
- Initial Living (1 month): [Cost in PKR, e.g., PKR 100,000–150,000]  
- **Total**: [Total range in PKR, e.g., PKR 197,800–307,800]  

**Steps**:  
1. [Step 1, e.g., Verify marriage for spouse visa]  
2. [Step 2, e.g., Gather required documents]  
3. [Step 3, e.g., Apply online via official website]  
4. [Step 4, e.g., Apply 2–3 months early]  

**Tips**:  
- [Tip 1, e.g., Apply early to avoid delays]  
- [Tip 2, e.g., Provide proof of funds]  
- [Tip 3, e.g., Ensure passport validity]  
- [Tip 4, e.g., Verify requirements]  
- [Tip 5, e.g., Consult a visa agent]  

**Disclaimer**:  
This guide is informational only, not legal advice. Consult official immigration authorities or consultants. The AI RAG model uses reliable web sources, but regulations may change.

---

Ensure the recommendation is specific to {target_country} and aligns with the user's intent ({intent}) and budget (PKR {user_context['savings']}). Use currency conversions: {', '.join([f'1 {k} = {v} PKR' for k, v in settings.CURRENCY_RATES.items()])}. Extract precise cost details from context or web results. If costs are unavailable, use conservative estimates based on general knowledge and note the need for verification. Avoid generic placeholders and ensure all fields are filled with specific values.
"""
            initial_response = model.generate_content(initial_prompt).text

            review_prompt = f"""
Review the following visa recommendation guide for accuracy, completeness, and alignment with the user's intent ('{intent}' for {target_country}) and budget (PKR {user_context['savings']}):
{initial_response}

Context: {context}
User Profile: {user_info}

Provide a revised version of the guide, correcting any inaccuracies, filling in missing details (e.g., precise costs, specific visa type, actionable steps), and ensuring it aligns with the user's intent and budget. Ensure the recommended country is {target_country} and all fields (e.g., visa type, costs) are specific, avoiding generic placeholders. If data is missing, use general knowledge to provide conservative estimates and note the need for verification. Maintain the same structured format and currency conversions ({', '.join([f'1 {k} = {v} PKR' for k, v in settings.CURRENCY_RATES.items()])}).
"""
            final_response = model.generate_content(review_prompt).text
            return final_response
        except Exception as e:
            logger.error(f"Error generating answer with provided Gemini API key: {str(e)}")
            return self._generate_fallback_answer(query, intent, user_context, target_country)

    def _generate_fallback_answer(self, query: str, intent: str, user_context: Dict, target_country: Optional[str]) -> str:
        """Generate a fallback response when data is unavailable."""
        target_country = target_country or ("Malaysia" if user_context['savings'] <= 600000 else random.choice(settings.DEFAULT_STUDY_DESTINATIONS))
        visa_type = {
            ("family", "singapore"): "Long-Term Visit Pass",
            ("study", "malaysia"): "Student Pass",
        }.get((intent.lower(), target_country.lower()), "Visitor Visa")
        visa_fee = {
            ("family", "singapore"): "SGD 225 (~PKR 37,800 at 1 SGD = 168 PKR)",
            ("study", "malaysia"): "MYR 126 (~PKR 7,560 at 1 MYR = 60 PKR)",
        }.get((intent.lower(), target_country.lower()), "PKR 5,000–10,000 (estimate)")
        total_cost = {
            ("family", "singapore"): "PKR 197,800–307,800",
            ("study", "malaysia"): "PKR 117,560–227,560",
        }.get((intent.lower(), target_country.lower()), "PKR 110,000–220,000")

        return f"""
---

**Personalized Visa Recommendation Guide for Pakistani Applicants**

This guide provides a personalized visa recommendation for a Pakistani applicant planning a {intent} trip to {target_country} with a budget of PKR {user_context['savings']}. Due to limited data, {target_country} is recommended as it aligns with the budget. Please verify details with official sources.

**Model’s Recommendation**

**Recommended Country**: {target_country}  
**Visa Type**: {visa_type}  
**Why {target_country}?**:  
- {'Suitable for family reunification with a Singapore citizen/PR.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Offers affordable tuition and living costs, ideal for budgets under PKR 600,000.' if intent.lower() == 'study' else 'Supports short-term visits with minimal requirements.'}  
- {'Straightforward application process via ICA.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Simplified visa process with no interview requirement.' if intent.lower() == 'study' else 'High approval rates for Pakistani applicants.'}  
- {'Costs fit within budget constraints.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'High approval rates with complete documentation.' if intent.lower() == 'study' else 'Affordable travel and living expenses.'}  

**Cost Breakdown**:  
- Visa Fee: {visa_fee}  
- Additional Fees: {'Document attestation (~PKR 5,000–10,000)' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Medical clearance (~PKR 5,000–10,000)' if intent.lower() == 'study' else 'None (estimate)'}  
- Travel: PKR 50,000–100,000 (round-trip flight estimate)  
- Medical Check: ~PKR 5,000–10,000 {'(if required)' if intent.lower() == 'family' and target_country.lower() == 'singapore' else ''}  
- Initial Living (1 month): {'PKR 100,000–150,000 (housing, food in Singapore)' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'PKR 50,000–100,000 (housing, food)' if intent.lower() == 'study' else 'PKR 50,000–100,000 (estimate)'}  
- **Total**: {total_cost} (within budget)  

**Steps**:  
1. {'Verify marriage to a Singapore citizen/PR; obtain attested marriage certificate.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Secure admission and obtain an offer letter from a recognized Malaysian institution (e.g., Universiti Putra Malaysia).' if intent.lower() == 'study' else 'Prepare travel itinerary and proof of ties to Pakistan.'}  
2. {'Gather documents (passport, marriage certificate, spouse’s SingPass, proof of funds).' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Gather documents (passport, bank statements, medical clearance, IELTS 5.5+ or equivalent).' if intent.lower() == 'study' else 'Gather documents (passport, financial proof, travel itinerary).'}  
3. {'Apply online via https://www.ica.gov.sg/reside/LTVP/apply with your spouse as the sponsor.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Apply online via https://visa.educationmalaysia.gov.my/.' if intent.lower() == 'study' else 'Apply via the relevant embassy or online portal.'}  
4. {'Apply 2–3 months early; processing takes 4–6 weeks.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Apply 3–4 months early to account for processing (4–6 weeks).' if intent.lower() == 'study' else 'Apply 1–2 months early (processing varies).'}  

**Tips**:  
- Apply early to avoid delays.  
- {'Provide proof of funds (e.g., PKR 600,000 bank statement) to show financial stability.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Provide clear proof of funds (e.g., PKR 600,000 bank statement).' if intent.lower() == 'study' else 'Provide proof of funds to demonstrate financial stability.'}  
- Ensure passport validity for 6+ months.  
- {'Verify marriage certificate attestation with Pakistan’s MOFA and Singapore’s embassy.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Verify program costs to fit within budget.' if intent.lower() == 'study' else 'Check visa validity and conditions.'}  
- {'Consult a visa agent if additional support is needed.' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'Explore scholarships via university websites for additional support.' if intent.lower() == 'study' else 'Consult the embassy for specific requirements.'}  

**Disclaimer**:  
This guide is informational only, not legal advice. Consult official immigration authorities (e.g., {'https://www.ica.gov.sg/' if intent.lower() == 'family' and target_country.lower() == 'singapore' else 'https://visa.educationmalaysia.gov.my/' if intent.lower() == 'study' else 'relevant embassy websites'}) or consultants. The AI RAG model uses reliable web sources, but regulations may change.

---
"""

    async def generate_recommendation(self, purpose: str, savings: int, gemini_api_key: str) -> str:
        """Generate a visa recommendation based on user input."""
        if savings < 0:
            raise ValueError("Savings cannot be negative")
        if not gemini_api_key:
            raise ValueError("Gemini API key is required")

        intent = self.parse_intent(purpose)
        user_context = {"purpose": purpose, "savings": savings, "intent": intent}

        relevant_chunks, target_country = await self.retrieve_relevant_chunks(
            query=purpose, intent=intent, user_context=user_context
        )
        recommendation = await self.generate_answer(
            query=purpose, intent=intent, relevant_chunks=relevant_chunks,
            user_context=user_context, target_country=target_country,
            gemini_api_key=gemini_api_key
        )
        return recommendation