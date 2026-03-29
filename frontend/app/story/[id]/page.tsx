'use client';
 
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/services/api";
<<<<<<< HEAD
import { MessageSquare, X, Send, Bot, User, ArrowLeft, Tv2 } from 'lucide-react';
=======
import { MessageSquare, X, Send, Bot, User, ArrowLeft } from 'lucide-react';
>>>>>>> 64dd9ac2d1a3384e7a61c4e11f2c98e66834a70d
 
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
  image?: string;
  source?: string;
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

interface Prediction {
  event: string;
  probability: string;
  details: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
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
  predictions?: Prediction[];
  articles: Article[];
}
 
/* ─── Component ─────────────────────────────────────────────────────── */
export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<StoryData | null>(null);
  const [filterImpact, setFilterImpact] = useState<string>("All");
  const [filterStage, setFilterStage] = useState<string>("All");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
<<<<<<< HEAD
  const [showVideo, setShowVideo] = useState(true);
=======
>>>>>>> 64dd9ac2d1a3384e7a61c4e11f2c98e66834a70d
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Ask me anything about this story and I’ll answer from the tracked articles.",
    },
  ]);
 
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => chatInputRef.current?.focus(), 100);
  }, [chatOpen]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !params?.id || chatLoading) return;

    setChatMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-8).map((item) => ({
        role: item.role,
        text: item.text,
      }));

      const res = await API.post(`/stories/${params.id}/chat`, {
        message: trimmed,
        history,
      });
      const reply = res.data?.reply || "No response received.";
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "I couldn’t get a response right now. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };
 
  return (
    <div className="story-root">
      {!data ? (
        <div className="loading-screen">
          <div className="loading-ring" />
          <span className="loading-label">Fetching story</span>
        </div>
      ) : (
        <>
          {/* ── Nav ── */}
          <nav className="article-reader-nav">
            <button onClick={() => router.back()} className="article-back-btn">
              <ArrowLeft size={16} strokeWidth={2} />
              Back
            </button>
            <div className="article-reader-brand">ET Intelligence</div>
            <div className="article-nav-actions" />
          </nav>
 
          {/* ── Hero ── */}
          <header className="hero" style={{ position: 'relative' }}>
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

            {/* ── ET Video Player (top-right) ── */}
            {showVideo && (
              <div
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  width: '260px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(212, 175, 55, 0.45)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.1)',
                  background: '#0a0a0a',
                  zIndex: 50,
                }}
              >
                {/* Header bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tv2 size={13} color="var(--gold)" strokeWidth={1.5} />
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                      fontWeight: 600,
                    }}>
                      ET Live
                    </span>
                  </div>
                  <button
                    onClick={() => setShowVideo(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--muted)',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                    title="Dismiss video"
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>

                {/* Video */}
                <video
                  src="/ET_720p.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  style={{ width: '100%', display: 'block', maxHeight: '160px', objectFit: 'cover' }}
                />
              </div>
            )}
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
              <div className="anim anim-4" style={{ marginTop: '48px' }}>
                <p className="section-label">Source Articles</p>
                <div className="news-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {data.articles.map((item, i) => (
                    <div
                      key={i}
                      className="news-card"
                      onClick={() => {
                        const articleId = `story_${params.id}_${i}`;
                        const articleData = {
                          id: articleId,
                          title: item.title,
                          content: item.content,
                          description: item.content?.slice(0, 300),
                          link: (item as unknown as { link?: string }).link || '#',
                          image: item.image,
                          source: item.source,
                          published_at: item.published_at,
                        };
                        sessionStorage.setItem(`article_${articleId}`, JSON.stringify(articleData));
                        router.push(`/article/${articleId}`);
                      }}
                    >
                      {/* Image Left */}
                      {item.image && (
                        <div className="news-card-img-wrap">
                          <img
                            src={item.image}
                            alt={item.title}
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        </div>
                      )}

                      {/* Content Right */}
                      <div className="news-card-content">
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--gold)', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em',
                            background: 'rgba(212, 175, 55, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {item.source || 'News Hub'}
                          </span>
                          {item.published_at && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              {isNaN(new Date(item.published_at).getTime()) 
                                ? item.published_at 
                                : new Date(item.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <h3 className="news-card-title" style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 600, 
                          lineHeight: 1.4, 
                          marginBottom: '8px',
                          fontFamily: "'Playfair Display', serif"
                        }}>
                          {item.title}
                        </h3>
                        <p className="news-card-desc" style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--muted)', 
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predictions */}
              {data.predictions && data.predictions.length > 0 && (
                <div className="anim anim-5" style={{marginTop: '40px'}}>
                  <p className="section-label" style={{color: 'var(--gold)'}}>🔮 What to Watch Next</p>
                  <div className="predictions-grid">
                    {data.predictions.map((pred, i) => (
                      <div className="prediction-card" key={i}>
                        <div className="prediction-header">
                          <h4 className="prediction-event">{pred.event}</h4>
                          <span className={`prediction-prob ${pred.probability.toLowerCase()}`}>{pred.probability} Probability</span>
                        </div>
                        <p className="prediction-details">{pred.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <p className="timeline-empty" style={{color: 'var(--muted)', fontStyle: 'italic'}}>No events match the selected filters.</p>
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
                            {item.date && <span className="timeline-date" style={{fontSize: '0.75rem', color: 'var(--muted)'}}>{item.date}</span>}
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
        </>
      )}

      {/* ── Floating Chat FAB ── */}
      <button
        className={`article-chat-fab ${chatOpen ? 'article-chat-fab--active' : ''}`}
        onClick={() => setChatOpen(o => !o)}
        title="Ask AI about this story"
      >
        {chatOpen ? <X size={20} strokeWidth={2} /> : <MessageSquare size={20} strokeWidth={1.5} />}
        {!chatOpen && <span className="article-chat-fab-label">Ask AI</span>}
      </button>

      {/* ── Chat Panel ── */}
      <div className={`article-chat-panel ${chatOpen ? 'article-chat-panel--open' : ''}`}>
        <div className="article-chat-header">
          <div className="article-chat-header-left">
            <Bot size={16} strokeWidth={1.5} style={{ color: 'var(--gold)' }} />
            <span className="article-chat-title">Story Intelligence</span>
          </div>
          <button className="article-chat-close" onClick={() => setChatOpen(false)}><X size={16} /></button>
        </div>

        <div className="article-chat-messages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`article-chat-msg article-chat-msg--${msg.role}`}>
              <div className="article-chat-avatar">
                {msg.role === 'assistant' ? <Bot size={14} strokeWidth={1.5} /> : <User size={14} strokeWidth={1.5} />}
              </div>
              <div className="article-chat-bubble">{msg.text}</div>
            </div>
          ))}
          {chatLoading && (
            <div className="article-chat-msg article-chat-msg--assistant">
              <div className="article-chat-avatar"><Bot size={14} strokeWidth={1.5} /></div>
              <div className="article-chat-bubble article-chat-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="article-chat-input-row" onSubmit={handleSendChat}>
          <input
            ref={chatInputRef}
            className="article-chat-input"
            type="text"
            placeholder="Ask about events, players, predictions…"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={chatLoading}
          />
          <button type="submit" className="article-chat-send" disabled={!chatInput.trim() || chatLoading}>
            <Send size={15} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}