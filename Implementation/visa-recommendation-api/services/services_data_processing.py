from typing import List, Dict
import time
import logging
from utils.scraper import scrape_all_urls
from utils.embedding import chunk_all_documents, generate_embeddings, create_faiss_index, save_artifacts
from config import settings

logger = logging.getLogger(__name__)

class DataProcessingService:
    """Service for processing visa data and generating FAISS index."""

    def __init__(self):
        self.visa_urls = [
            # UK
            {"country": "UK", "visa_type": "Student", "url": "https://www.gov.uk/student-visa"},
            {"country": "UK", "visa_type": "Work", "url": "https://www.gov.uk/skilled-worker-visa"},
            {"country": "UK", "visa_type": "Family", "url": "https://www.gov.uk/uk-family-visa"},
            {"country": "UK", "visa_type": "Tourist", "url": "https://www.gov.uk/standard-visitor"},
            {"country": "UK", "visa_type": "Business", "url": "https://www.gov.uk/representative-overseas-business"},
            # USA
            {"country": "USA", "visa_type": "Student", "url": "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html"},
            {"country": "USA", "visa_type": "Work", "url": "https://travel.state.gov/content/travel/en/us-visas/employment.html"},
            {"country": "USA", "visa_type": "Family", "url": "https://travel.state.gov/content/travel/en/us-visas/immigrate/family-immigration.html"},
            {"country": "USA", "visa_type": "Tourist", "url": "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html"},
            {"country": "USA", "visa_type": "Exchange", "url": "https://travel.state.gov/content/travel/en/us-visas/study/exchange.html"},
            # Canada
            {"country": "Canada", "visa_type": "Student", "url": "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/eligibility.html"},
            {"country": "Canada", "visa_type": "Work", "url": "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html"},
            {"country": "Canada", "visa_type": "Family", "url": "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html"},
            {"country": "Canada", "visa_type": "Tourist", "url": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html"},
            {"country": "Canada", "visa_type": "Business", "url": "https://www.canada.ca/en/services/immigration-citizenship.html"},
            # Australia
            {"country": "Australia", "visa_type": "Student", "url": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500"},
            {"country": "Australia", "visa_type": "Work", "url": "https://immi.homeaffairs.gov.au/visas/working-in-australia"},
            {"country": "Australia", "visa_type": "Family", "url": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/partner-onshore"},
            {"country": "Australia", "visa_type": "Tourist", "url": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600"},
            {"country": "Australia", "visa_type": "Guardian", "url": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-590"},
            # Germany
            {"country": "Germany", "visa_type": "Student", "url": "https://www.germany.info/us-en/service/visa"},
            {"country": "Germany", "visa_type": "Work", "url": "https://www.germany.info/us-en/service/visa"},
            {"country": "Germany", "visa_type": "Family", "url": "https://www.germany.info/us-en/service/visa"},
            {"country": "Germany", "visa_type": "Tourist", "url": "https://www.germany.info/us-en/service/visa"},
            {"country": "Germany", "visa_type": "Business", "url": "https://www.germany.info/us-en/service/visa"},
            # Singapore
            {"country": "Singapore", "visa_type": "Student", "url": "https://www.ica.gov.sg/reside/STP/apply"},
            {"country": "Singapore", "visa_type": "Work", "url": "https://www.mom.gov.sg/passes-and-permits"},
            {"country": "Singapore", "visa_type": "Family", "url": "https://www.ica.gov.sg/reside/LTVP/apply"},
            {"country": "Singapore", "visa_type": "Tourist", "url": "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements"},
            {"country": "Singapore", "visa_type": "Business", "url": "https://www.mfa.gov.sg/consular-services/visa-information"},
            # Malaysia
            {"country": "Malaysia", "visa_type": "Student", "url": "https://visa.educationmalaysia.gov.my/guidelines/required-documents"},
            {"country": "Malaysia", "visa_type": "Work", "url": "https://esd.imi.gov.my/portal/expatriates/myxpats/key-services/employment-pass/"},
            {"country": "Malaysia", "visa_type": "Family", "url": "https://esd.imi.gov.my/portal/expatriates/myxpats/key-services/employment-pass/dependant-pass/"},
            {"country": "Malaysia", "visa_type": "Tourist", "url": "https://malaysiavisa.imi.gov.my/evisa"},
            {"country": "Malaysia", "visa_type": "Business", "url": "https://www.miti.gov.my/index.php/pages/view/738"},
            # UAE
            {"country": "UAE", "visa_type": "Student", "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/study-visit-entry-and-residence-permits"},
            {"country": "UAE", "visa_type": "Work", "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/work-permit"},
            {"country": "UAE", "visa_type": "Family", "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visa-family-members"},
            {"country": "UAE", "visa_type": "Tourist", "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/visit-permit"},
            {"country": "UAE", "visa_type": "Investor", "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/investor-residence-permit"},
            # Turkey
            {"country": "Turkey", "visa_type": "Student", "url": "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa"},
            {"country": "Turkey", "visa_type": "Work", "url": "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa"},
            {"country": "Turkey", "visa_type": "Family", "url": "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa"},
            {"country": "Turkey", "visa_type": "Tourist", "url": "https://www.evisa.gov.tr/en/tour/"},
            {"country": "Turkey", "visa_type": "Business", "url": "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa"},
            # Japan
            {"country": "Japan", "visa_type": "Student", "url": "https://www.studyinjapan.go.jp/en/"},
            {"country": "Japan", "visa_type": "Work", "url": "https://www.jetro.go.jp/en/invest/setting_up/section3/page9.html"},
            {"country": "Japan", "visa_type": "Family", "url": "https://www.vfsglobal.com/one-pager/japan/pakistan/english/index.html"},
            {"country": "Japan", "visa_type": "Business", "url": "https://www.jetro.go.jp/en/invest/setting_up/section3/page9.html"},
            {"country": "Japan", "visa_type": "Tourist", "url": "https://www.vfsglobal.com/one-pager/japan/pakistan/english/index.html"},
            # Saudi Arabia
            {"country": "Saudi Arabia", "visa_type": "Tourist", "url": "https://www.visitsaudi.com/en/plan-your-trip/visa-regulations"},
            {"country": "Saudi Arabia", "visa_type": "Pilgrimage (Hajj/Umrah)", "url": "https://www.visitsaudi.com/en/plan-your-trip/visa-regulations"},
            {"country": "Saudi Arabia", "visa_type": "Work", "url": "https://www.visitsaudi.com/en/plan-your-trip/visa-regulations"},
            # Qatar
            {"country": "Qatar", "visa_type": "Tourist", "url": "https://visitqatar.com/intl-en/plan-your-trip/visas"},
            {"country": "Qatar", "visa_type": "Tourist", "url": "https://www.mofa.gov.qa/en/consular-services/visas/visas"},
            {"country": "Qatar", "visa_type": "Tourist", "url": "https://e-visa-qatar.com/"},
            # Oman
            {"country": "Oman", "visa_type": "Tourist", "url": "https://evisa.rop.gov.om/"},
            {"country": "Oman", "visa_type": "Work", "url": "https://www.rop.gov.om/english/Visas.aspx"},
            {"country": "Oman", "visa_type": "Work", "url": "https://www.rop.gov.om/english/Visas.aspx?VisaName=TemporaryWorkVisa"},
            {"country": "Oman", "visa_type": "Work", "url": "https://gov.om/en/w/get-a-work-visa"},
            # South Korea
            {"country": "South Korea", "visa_type": "Student", "url": "https://www.visa.go.kr/?LANG_TYPE=EN"},
            {"country": "South Korea", "visa_type": "Work", "url": "https://www.visa.go.kr/?LANG_TYPE=EN"},
            {"country": "South Korea", "visa_type": "Tourist", "url": "https://overseas.mofa.go.kr/pk-en/wpge/m_3159/contents.do"},
            # China
            {"country": "China", "visa_type": "Student", "url": "https://www.visaforchina.cn/ISB3_EN/"},
            {"country": "China", "visa_type": "Business", "url": "https://www.visaforchina.cn/ISB3_EN/"},
            {"country": "China", "visa_type": "Tourist", "url": "https://www.visaforchina.cn/KHI3_EN/"},
            {"country": "China", "visa_type": "Tourist", "url": "https://www.visaforchina.cn/ISB3_EN/"},
            {"country": "China", "visa_type": "Tourist", "url": "https://www.visaforchina.cn/VIE3_EN/"},
            # Thailand
            {"country": "Thailand", "visa_type": "Tourist", "url": "https://www.thaiembassy.org/islamabad/en/consular/68/60054-Apply-for-Thai-Visa.html"},
            {"country": "Thailand", "visa_type": "Business", "url": "https://www.thaiembassy.org/islamabad/en/publicservice/77961-Business-Visa"},
            {"country": "Thailand", "visa_type": "Transit", "url": "https://www.thaiembassy.org/islamabad/en/publicservice/77963-Transit-Visa"},
            # Russia
            {"country": "Russia", "visa_type": "Student", "url": "https://toronto.kdmid.ru/en/consular-function/visa/study-visa/"},
            {"country": "Russia", "visa_type": "Business", "url": "https://warsaw.kdmid.ru/en/russian-visa/business-visa/"},
            {"country": "Russia", "visa_type": "Tourist", "url": "https://evisa.kdmid.ru/"},
            # Azerbaijan
            {"country": "Azerbaijan", "visa_type": "Tourist", "url": "https://evisa.gov.az/en/"},
            {"country": "Azerbaijan", "visa_type": "Business", "url": "https://evisa.gov.az/en/"},
            {"country": "Azerbaijan", "visa_type": "Transit", "url": "https://losangeles.mfa.gov.az/en/category/transit-visa"},
            # South Africa
            {"country": "South Africa", "visa_type": "Tourist", "url": "https://www.dha.gov.za/index.php/immigration-services/types-of-visas"},
            {"country": "South Africa", "visa_type": "Study", "url": "https://www.dha.gov.za/index.php/immigration-services/types-of-visas"},
            {"country": "South Africa", "visa_type": "Work", "url": "https://www.dha.gov.za/index.php/immigration-services/types-of-visas"},
        ]

    async def process_data(self) -> Dict:
        """Process visa URLs to generate FAISS index and cached files."""
        start_time = time.time()
        logger.info("Starting data processing pipeline")

        # Step 2: Scrape URLs
        logger.info("Scraping URLs...")
        documents = await scrape_all_urls(self.visa_urls)
        if not documents:
            raise RuntimeError("No documents scraped")
        logger.info(f"Scraped {len(documents)} documents")

        # Step 3: Chunk documents
        logger.info("Chunking documents...")
        chunks = chunk_all_documents(documents)
        if not chunks:
            raise RuntimeError("No chunks generated")
        logger.info(f"Generated {len(chunks)} chunks")

        # Step 4: Generate embeddings and FAISS index
        logger.info("Generating embeddings and FAISS index...")
        embeddings = generate_embeddings(chunks, model_name=settings.EMBEDDING_MODEL)
        index, metadata = create_faiss_index(embeddings, chunks)
        logger.info(f"Created FAISS index with {index.ntotal} vectors")

        # Save artifacts
        logger.info("Saving artifacts...")
        save_artifacts(documents, chunks, index, metadata)
        end_time = time.time()
        return {"chunks": len(chunks), "time": end_time - start_time}