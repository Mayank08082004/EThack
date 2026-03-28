import feedparser
import requests
from bs4 import BeautifulSoup
import trafilatura
from typing import List, Dict
from app.services.llm_service import get_trending_keywords

rss_sources = {
    "Economic Times": [
        "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
        "https://economictimes.indiatimes.com/news/rssfeeds/1715249553.cms",
        "https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms",
        "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms"
    ],
    "Hindustan Times": [
        "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
        "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml"
    ],
    "Times of India": [
        "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
        "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms"
    ],
    "India Today": [
        "https://www.indiatoday.in/rss/home",
        "https://www.indiatoday.in/rss/1206578"
    ]
}

headers = {"User-Agent": "Mozilla/5.0"}

def extract_article_details(url: str):
    """Fetch full text content and OpenGraph image from an article URL using trafilatura & BeautifulSoup."""
    try:
        downloaded = trafilatura.fetch_url(url)
        content = trafilatura.extract(downloaded)

        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.content, "html.parser")

        image = None
        img_tag = soup.find("meta", property="og:image")
        if img_tag:
            image = img_tag.get("content")

        if content and len(content) > 100:
            return content.strip(), image

        paragraphs = soup.find_all("p")
        content = " ".join([p.get_text() for p in paragraphs if len(p.get_text()) > 30])

        return content if content else "Content not available", image
    except Exception:
        return "Could not fetch article", None

def match_genres(text: str, genres: List[str]) -> List[str]:
    """Return which genres matched the text."""
    matched = []
    text_lower = text.lower()
    for genre in genres:
        # Simple match using the genre ID or common keywords
        # A more sophisticated NLP/keyword map could be used here
        if genre.lower() in text_lower:
            matched.append(genre)
    return matched

def scrape_news(requested_genres: List[str] = None) -> List[Dict]:
    """
    Scrape all RSS feeds. If requested_genres is provided, only return articles 
    that loosely match those genres (via keyword searching the title/summary)
    and tag them. Otherwise, tag them generally.
    """
    if not requested_genres:
        requested_genres = []
        
    news_list = []
    seen_links = set()

    # Get trending keywords from Gemini LLM for these broad genres
    dynamic_keywords = get_trending_keywords(requested_genres) if requested_genres else []

    for source_name, urls in rss_sources.items():
        for url in urls:
            try:
                feed = feedparser.parse(url)
            except Exception:
                continue

            for entry in feed.entries:
                link = entry.link
                if link.startswith("/"):
                    link = "https://economictimes.indiatimes.com" + link

                if link in seen_links:
                    continue
                seen_links.add(link)

                title = entry.get("title", "")
                raw_desc = entry.get("summary", "")
                clean_desc = BeautifulSoup(raw_desc, "html.parser").get_text()
                
                # Broad text used to tag genres
                combined_text = (title + " " + clean_desc).lower()
                
                matched = []
                if requested_genres:
                    # Dynamically check if any LLM-generated keyword exists in the article text
                    if any(w in combined_text for w in dynamic_keywords):
                        # Tag with the requested genres since it hit a trending topic related to them
                        # (Normally you'd want to map specific keywords back to specific genres,
                        # but tagging with the user's primary preferences is fine for their feed)
                        matched = requested_genres
                else:
                    pass

                # If genres were requested but this article didn't match any trending keywords, skip it.
                if requested_genres and not matched:
                    continue

                content, image = extract_article_details(link)

                if "Content not available" in content or "Could not fetch article" in content:
                    continue

                news_list.append({
                    "source": source_name,
                    "title": title,
                    "description": clean_desc,
                    "content": content,
                    "image": image,
                    "link": link,
                    "genres": matched
                })
    return news_list
