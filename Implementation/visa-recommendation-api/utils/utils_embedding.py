import pickle
import pandas as pd
import faiss
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple
import logging
from config import settings
import os

logger = logging.getLogger(__name__)

def chunk_document(doc: Dict, max_chunk_size: int = 500) -> List[Dict]:
    """Chunk a document into smaller pieces."""
    try:
        text = doc['content']
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0

        for word in words:
            current_chunk.append(word)
            current_length += len(word) + 1
            if current_length >= max_chunk_size:
                chunks.append({
                    'country': doc['country'],
                    'visa_type': doc['visa_type'],
                    'url': doc['url'],
                    'content': ' '.join(current_chunk)
                })
                current_chunk = []
                current_length = 0

        if current_chunk:
            chunks.append({
                'country': doc['country'],
                'visa_type': doc['visa_type'],
                'url': doc['url'],
                'content': ' '.join(current_chunk)
            })

        return chunks
    except Exception as e:
        logger.error(f"Error chunking document from {doc['url']}: {str(e)}")
        return []

def chunk_all_documents(documents: List[Dict]) -> List[Dict]:
    """Chunk all documents."""
    all_chunks = []
    for doc in documents:
        chunks = chunk_document(doc, max_chunk_size=settings.MAX_CHUNK_SIZE)
        all_chunks.extend(chunks)
    return all_chunks

def generate_embeddings(chunks: List[Dict], model_name: str = 'all-MiniLM-L6-v2') -> np.ndarray:
    """Generate embeddings for chunks."""
    try:
        model = SentenceTransformer(model_name)
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        model = model.to(device)
        contents = [chunk['content'] for chunk in chunks]
        embeddings = model.encode(contents, convert_to_numpy=True, show_progress_bar=True, normalize_embeddings=True)
        return embeddings
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise

def create_faiss_index(embeddings: np.ndarray, chunks: List[Dict]) -> Tuple[faiss.Index, List[Dict]]:
    """Create a FAISS index from embeddings."""
    try:
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings.astype('float32'))
        metadata = [{
            'country': chunk['country'],
            'visa_type': chunk['visa_type'],
            'url': chunk['url'],
            'content': chunk['content']
        } for chunk in chunks]
        return index, metadata
    except Exception as e:
        logger.error(f"Error creating FAISS index: {str(e)}")
        raise

def save_artifacts(documents: List[Dict], chunks: List[Dict], index: faiss.Index, metadata: List[Dict]):
    """Save processing artifacts to disk."""
    try:
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        with open(os.path.join(settings.DATA_DIR, settings.DOCUMENTS_FILE), 'wb') as f:
            pickle.dump(documents, f)
        df_chunks = pd.DataFrame(chunks)
        df_chunks.to_csv(os.path.join(settings.DATA_DIR, settings.CHUNKS_FILE), index=False)
        faiss.write_index(index, os.path.join(settings.DATA_DIR, settings.FAISS_INDEX_FILE))
        with open(os.path.join(settings.DATA_DIR, settings.METADATA_FILE), 'wb') as f:
            pickle.dump(metadata, f)
        logger.info(f"Artifacts saved to {settings.DATA_DIR}")
    except Exception as e:
        logger.error(f"Error saving artifacts: {str(e)}")
        raise

def load_index_and_metadata(index_file: str, metadata_file: str) -> Tuple[faiss.Index, List[Dict]]:
    """Load FAISS index and metadata from disk."""
    try:
        index_path = os.path.join(settings.DATA_DIR, index_file)
        metadata_path = os.path.join(settings.DATA_DIR, metadata_file)
        if not os.path.exists(index_path) or not os.path.exists(metadata_path):
            raise FileNotFoundError("Cached files not found. Run /generate-index first.")
        index = faiss.read_index(index_path)
        with open(metadata_path, 'rb') as f:
            metadata = pickle.load(f)
        logger.info(f"Loaded FAISS index with {index.ntotal} vectors and {len(metadata)} metadata entries")
        return index, metadata
    except Exception as e:
        logger.error(f"Error loading index/metadata: {str(e)}")
        raise