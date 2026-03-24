'use client';
 
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/services/api";
 
/* ─── Types ─────────────────────────────────────────────────────────── */
interface TimelineItem {
  event: string;
  impact: "Positive" | "Negative" | "Neutral" | string;
  stage: string;
  date?: string;
}
 
interface Article {
  title: string;
  content: string;
  published_at: string | null;
}
 
interface StoryData {
  story_id: string;
  title: string;
  total_articles: number;
  summary: string;
  timeline: TimelineItem[];
  articles: Article[];
}
 
/* ─── Component ─────────────────────────────────────────────────────── */
export default function StoryPage() {
  const params = useParams();
  const [data, setData] = useState<StoryData | null>(null);
  const [filterImpact, setFilterImpact] = useState<string>("All");
  const [filterStage, setFilterStage] = useState<string>("All");
 
  useEffect(() => {
    if (!params?.id) return;
    API.get(`/stories/${params.id}`).then(res => setData(res.data));
  }, [params]);

  const stageSet = data ? ["All", ...new Set(data.timeline.map(t => t.stage))] : ["All"];
  const filteredTimeline = data?.timeline.filter(t => {
    if (filterImpact !== "All" && t.impact !== filterImpact) return false;
    if (filterStage !== "All" && t.stage !== filterStage) return false;
    return true;
  }) || [];
 
  return (
    <>

 
      {!data ? (
        <div className="loading-screen story-root">
          <div className="loading-ring" />
          <span className="loading-label">Fetching story</span>
        </div>
      ) : (
        <div className="story-root">
 
          {/* ── Hero ── */}
          <header className="hero">
            <p className="hero-eyebrow anim anim-1">Market Intelligence</p>
            <h1 className="hero-title anim anim-2">
              {data.title}
            </h1>
            <div className="hero-meta anim anim-3">
              <div className="meta-chip">
                <span className="meta-chip-label">Sources</span>
                <span className="meta-chip-value">{data.total_articles} Articles</span>
              </div>
            </div>
          </header>
 
          {/* ── Body Grid ── */}
          <div className="story-body">
 
            {/* ── Left column ── */}
            <main>
              {/* Summary */}
              <div className="anim anim-2">
                <p className="section-label">Editorial Summary</p>
                <div className="summary-card">
                  <p className="summary-text">{data.summary}</p>
                </div>
              </div>
 
              {/* Articles */}
              <div className="anim anim-4">
                <p className="section-label">Source Articles</p>
                <div className="articles-stack">
                  {data.articles.map((a, i) => (
                    <article className="article-item" key={i}>
                      <p className="article-index">Article {String(i + 1).padStart(2, "0")}</p>
                      <h3 className="article-title">{a.title}</h3>
                      <p className="article-content">{a.content}</p>
                    </article>
                  ))}
                </div>
              </div>
            </main>
 
            {/* ── Sidebar ── */}
            <aside className="sidebar anim anim-3">
 
              {/* Timeline */}
              <div className="timeline-card">
                <div className="timeline-header" style={{display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px'}}>
                  <p className="section-label" style={{marginBottom: 0}}>Interactive Timeline</p>
                  
                  {data && (
                    <div className="timeline-filters" style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      <select 
                        value={filterStage} 
                        onChange={(e) => setFilterStage(e.target.value)}
                        className="filter-select"
                        style={{flex: 1, minWidth: '100px'}}
                      >
                        {stageSet.map(s => <option key={s} value={s}>{s === "All" ? "All Stages" : s}</option>)}
                      </select>
                      <select 
                        value={filterImpact} 
                        onChange={(e) => setFilterImpact(e.target.value)}
                        className="filter-select"
                        style={{flex: 1, minWidth: '100px'}}
                      >
                        <option value="All">All Impacts</option>
                        <option value="Positive">Positive</option>
                        <option value="Negative">Negative</option>
                        <option value="Neutral">Neutral</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="timeline-list">
                  {filteredTimeline.length === 0 ? (
                    <p className="timeline-empty" style={{color: '#888', fontStyle: 'italic'}}>No events match the selected filters.</p>
                  ) : filteredTimeline.map((item, i) => {
                    const isPos = item.impact === "Positive";
                    return (
                      <div className="timeline-item anim anim-2" key={i} style={{animationDelay: `${i * 100}ms`}}>
                        <div className="timeline-dot-col">
                          <div className={`timeline-dot ${isPos ? "pos" : item.impact === 'Negative' ? "neg" : "neu"}`} />
                          {i < filteredTimeline.length - 1 && <div className="timeline-line" />}
                        </div>
                        <div className="timeline-body">
                          <div className="timeline-meta" style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px'}}>
                            <p className="timeline-stage" style={{margin: 0}}>{item.stage}</p>
                            {item.date && <span className="timeline-date" style={{fontSize: '0.75rem', color: '#888'}}>{item.date}</span>}
                          </div>
                          <p className="timeline-event">{item.event}</p>
                          <span className={`impact-badge ${isPos ? "pos" : item.impact === "Negative" ? "neg" : "neu"}`}>
                            {isPos ? "▲" : item.impact === "Negative" ? "▼" : "•"} {item.impact}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
 
            </aside>
          </div>
        </div>
      )}
    </>
  );
}