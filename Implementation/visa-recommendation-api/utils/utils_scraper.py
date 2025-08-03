import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import quote
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

def scrape_url(url_info: Dict, timeout: int = 10) -> Optional[Dict]:
    """Scrape content from a single URL."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url_info['url'], headers=headers, timeout=timeout)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            element.decompose()

        text_elements = soup.find_all(['p', 'h1', 'h2', 'h3', 'li'])
        text = ' '.join([elem.get_text().strip() for elem in text_elements if elem.get_text().strip()])
        text = re.sub(r'\s+', ' ', text).strip()
        if len(text) < 100:
            logger.warning(f"Limited content scraped from {url_info['url']} (length: {len(text)})")
            return None

        return {
            'country': url_info['country'],
            'visa_type': url_info['visa_type'],
            'url': url_info['url'],
            'content': text[:10000]
        }
    except Exception as e:
        logger.error(f"Error scraping {url_info['url']}: {str(e)}")
        return None

async def scrape_all_urls(urls: List[Dict], max_workers: int = 5) -> List[Dict]:
    """Scrape content from multiple URLs concurrently."""
    documents = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(scrape_url, url_info): url_info for url_info in urls}
        for future in as_completed(future_to_url):
            url_info = future_to_url[future]
            try:
                result = future.result()
                if result:
                    documents.append(result)
                    logger.info(f"Successfully scraped {url_info['url']}")
            except Exception as e:
                logger.error(f"Error processing {url_info['url']}: {str(e)}")
    return documents

async def autonomous_web_search(query: str, target_country: str, intent: str, max_results: int = 5) -> List[Dict]:
    """Perform a web search for additional visa information."""
    try:
        domains = "site:*.gov | site:*.edu | site:*.gc.ca | site:*.gov.au | site:*.gov.uk | site:*.gov.my | site:*.gov.sg"
        search_query = f"{intent} visa requirements for Pakistani citizens {target_country} {domains}"
        encoded_query = quote(search_query)
        search_url = f"https://www.google.com/search?q={encoded_query}&num={max_results}"
        session = requests.Session()
        retries = Retry(total=3, backoff_factor=0.3, status_forcelist=[500, 502, 503, 504])
        session.mount('https://', HTTPAdapter(max_retries=retries))
        response = session.get(search_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        results = []
        links = soup.find_all('a')
        for link in links[:max_results*2]:
            href = link.get('href')
            if href and href.startswith('/url?q='):
                url = href.split('/url?q=')[1].split('&')[0]
                try:
                    page_response = session.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
                    page_response.raise_for_status()
                    page_soup = BeautifulSoup(page_response.text, 'html.parser')
                    text_elements = page_soup.find_all(['p', 'h1', 'h2', 'h3', 'li'])
                    text = ' '.join([elem.get_text().strip() for elem in text_elements if elem.get_text().strip()])
                    if len(text) > 50:
                        results.append({
                            "country": target_country,
                            "visa_type": f"{intent.capitalize()} Visa",
                            "url": url,
                            "content": text[:2000]
                        })
                    else:
                        logger.warning(f"Skipped web result {url}: Content too short")
                except Exception as e:
                    logger.error(f"Error fetching web result {url}: {str(e)}")
            if len(results) >= max_results:
                break
        logger.info(f"Fetched {len(results)} web results for {search_query}")
        return results
    except Exception as e:
        logger.error(f"Error in autonomous search: {str(e)}")
        return []