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
 
interface SentimentShift {
  timeframe: string;
  score: number;
  reason: string;
}

interface KeyPlayer {
  name: string;
  type: string;
  role: string;
}

interface ContrarianPerspective {
  perspective: string;
  source: string;
}
 
interface StoryData {
  story_id: string;
  title: string;
  total_articles: number;
  summary: string;
  timeline: TimelineItem[];
  sentiment_shifts?: SentimentShift[];
  contrarian_perspectives?: ContrarianPerspective[];
  players?: KeyPlayer[];
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
 
              {/* Sentiment Tracker */}
              {data.sentiment_shifts && data.sentiment_shifts.length > 0 && (
                <div className="anim anim-3">
                  <p className="section-label">Sentiment Momentum</p>
                  <div className="sentiment-card">
                    {data.sentiment_shifts.map((shift, i) => {
                      const percentage = Math.min((Math.abs(shift.score) / 10) * 100, 100);
                      const isPos = shift.score >= 0;
                      return (
                        <div key={i} className="sentiment-row">
                          <div className="sentiment-timeframe">{shift.timeframe}</div>
                          <div className="sentiment-bar-container">
                            <div className="sentiment-axis left">
                              {!isPos && <div className="sentiment-fill neg" style={{ width: `${percentage}%` }} />}
                            </div>
                            <div className="sentiment-center" />
                            <div className="sentiment-axis right">
                              {isPos && <div className="sentiment-fill pos" style={{ width: `${percentage}%` }} />}
                            </div>
                          </div>
                          <div className="sentiment-reason">{shift.reason}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
 
              {/* Contrarian Perspectives */}
              {data.contrarian_perspectives && data.contrarian_perspectives.length > 0 && (
                <div className="anim anim-4">
                  <p className="section-label">Contrarian Perspectives</p>
                  <div className="contrarian-stack">
                    {data.contrarian_perspectives.map((view, i) => (
                      <div className="contrarian-item" key={i}>
                        <div className="contrarian-icon">▾</div>
                        <div className="contrarian-body">
                          <p className="contrarian-text">"{view.perspective}"</p>
                          <p className="contrarian-source">— {view.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
 
              {/* Key Players */}
              {data.players && data.players.length > 0 && (
                <div className="players-card">
                  <p className="section-label">Key Players</p>
                  <div className="players-list">
                    {data.players.map((player, i) => (
                      <div className="player-item" key={i}>
                        <div className="player-avatar">
                          {player.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="player-info">
                          <p className="player-name">{player.name}</p>
                          <p className="player-type">{player.type}</p>
                          <p className="player-role">{player.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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