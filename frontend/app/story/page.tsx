'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await API.get(`/search?query=${query}`);
      router.push(`/story/${res.data.story_id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="story-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px' }}>
      <main className="search-container anim anim-2" style={{ width: '100%', maxWidth: '640px', textAlign: 'center' }}>
        <p className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>Story Arc Tracker</p>
        <h1 className="hero-title" style={{ margin: '0 auto 40px', fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
          Uncover the <em>narrative</em> behind the news.
        </h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Zomato earnings, Tesla autopilot..."
            className="search-input"
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? "Searching..." : "Search Stories"}
          </button>
        </form>
      </main>
    </div>
  );
}
