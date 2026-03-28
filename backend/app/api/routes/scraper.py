import feedparser
import requests
from bs4 import BeautifulSoup
import time
import urllib.parse
import trafilatura

keyword = input("Enter your interest (or type 'general'): ").lower()
encoded_keyword = urllib.parse.quote(keyword)
keywords = keyword.split()

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

if keyword == "general":
    google_rss = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
else:
    google_rss = f"https://news.google.com/rss/search?q={encoded_keyword}&hl=en-IN&gl=IN&ceid=IN:en"

headers = {"User-Agent": "Mozilla/5.0"}

def extract_real_url_from_google(entry):
    try:
        summary = entry.get("summary", "")
        soup = BeautifulSoup(summary, "html.parser")
        a_tag = soup.find("a")
        if a_tag and a_tag.get("href"):
            return a_tag.get("href")
    except:
        pass
    return entry.link

def extract_article_details(url):
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

    except:
        return "Could not fetch article", None

news_list = []
seen_links = set()

def process_feed(feed, source_name):
    for entry in feed.entries:
        title = entry.title.lower()

        raw_desc = entry.get("summary", "")
        clean_desc = BeautifulSoup(raw_desc, "html.parser").get_text().lower()

        combined_text = title + " " + clean_desc

        if keyword == "general" or any(word in combined_text for word in keywords):

            link = entry.link

            if source_name == "Google News":
                link = extract_real_url_from_google(entry)

            if link.startswith("/"):
                link = "https://economictimes.indiatimes.com" + link

            if link in seen_links:
                continue
            seen_links.add(link)

            content, image = extract_article_details(link)

            if "Content not available" in content:
                continue

            score = 0

            for word in keywords:
                if word in combined_text:
                    score += 2

            priority = {
                "Economic Times": 5,
                "Hindustan Times": 4,
                "Times of India": 3,
                "India Today": 3,
                "Google News": 1
            }

            score += priority.get(source_name, 0)

            news = {
                "source": source_name,
                "title": entry.title,
                "description": clean_desc,
                "content": content[:1000],
                "image": image,
                "link": link,
                "score": score
            }

            news_list.append(news)

print("\nFetching news...\n")

for source, urls in rss_sources.items():
    for url in urls:
        feed = feedparser.parse(url)
        process_feed(feed, source)

google_feed = feedparser.parse(google_rss)
process_feed(google_feed, "Google News")

unique_news = []
titles_seen = set()

for news in news_list:
    if news["title"] not in titles_seen:
        unique_news.append(news)
        titles_seen.add(news["title"])

news_list = sorted(news_list, key=lambda x: x["score"], reverse=True)

for news in news_list:
    print(f"SOURCE: {news['source']}")
    print("TITLE:", news["title"])
    print("LINK:", news["link"])
    print("DESCRIPTION:", news["description"])
    print("CONTENT:", news["content"][:1000], "...")
    print("IMAGE:", news["image"])
    print("SCORE:", news["score"])
    print("-" * 100)

print(f"\nTotal articles fetched: {len(news_list)}")