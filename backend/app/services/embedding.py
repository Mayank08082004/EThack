from fastembed import TextEmbedding

# Initialize the embedding model globally so it stays in memory across requests
# This downloads a tiny ~45MB quantized model locally on first run and is extremely fast!
_model = TextEmbedding("BAAI/bge-small-en-v1.5")


def get_embedding(text: str) -> list[float]:
    """Generates local embeddings instantly without any API keys or rate limits."""
    # model.embed returns a generator of numpy arrays
    gen = _model.embed([text])
    embedding = list(gen)[0].tolist()
    
    # FastEmbed bge-small returns 384 dimensions. The PostgreSQL table expects vector(1536).
    # We dynamically pad to 1536 with zeros so it inserts perfectly without a DB migration!
    # Mathematically, zero-padding preserves relative cosine similarity exactly.
    if len(embedding) < 1536:
        embedding.extend([0.0] * (1536 - len(embedding)))
        
    return embedding