'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Clock, Tag, Share2, BookOpen, MessageSquare, X, Send, Bot, User } from 'lucide-react';
import axios from 'axios';

interface Article {
  id: number | string;
  title: string;
  description?: string;
  content?: string;
  link: string;
  image?: string;
  source?: string;
  genres?: string[];
  published_at?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ArticleReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`article_${id}`);
    if (stored) {
      setArticle(JSON.parse(stored));
    } else {
      router.push('/dashboard');
    }
  }, [id, router]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setScrollProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (chatMessages.length === 0 && article) {
        setChatMessages([{
          role: 'assistant',
          text: `Hi! I've read **"${article.title}"**. Ask me anything about this article — key insights, what it means for markets, implications, or any specific detail you'd like to understand.`
        }]);
      }
    }
  }, [chatOpen, article]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleShare = async () => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !article || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatMessages, { role: 'user', text: userMsg }];
    setChatMessages(newHistory);
    setChatLoading(true);
    try {
      const fullText = [article.description, article.content].filter(Boolean).join('\n\n');
      const res = await axios.post(`${BACKEND}/article/chat`, {
        message: userMsg,
        article_title: article.title,
        article_content: fullText.slice(0, 4000),
        history: newHistory.slice(-8).map(m => ({ role: m.role, text: m.text }))
      });
      setChatMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I ran into an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!article) {
    return (
      <div className="story-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
          <BookOpen size={40} strokeWidth={1} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p>Loading article…</p>
        </div>
      </div>
    );
  }

  const fullText = [article.description, article.content].filter(Boolean).join('\n\n');
  const readTime = estimateReadTime(fullText);

  const isJunkParagraph = (p: string) => {
    if (p.length < 4) return true;
    if (/^\d+\/\d+$/.test(p)) return true;
    if (/^(iStock|istock|IANS|Getty|Reuters|AFP|AP|PTI|ETMarkets\.com|Shutterstock|EPA|Bloomberg)$/i.test(p.trim())) return true;
    if (p.length < 25 && !p.includes('.') && !p.includes(',')) return true;
    return false;
  };

  const paragraphs = fullText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !isJunkParagraph(p));

  // Render bold markdown **text** from AI  
  const renderAIText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="story-root article-reader-root">
      {/* Reading progress bar */}
      <div className="article-progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Nav */}
      <nav className="article-reader-nav">
        <button onClick={() => router.back()} className="article-back-btn">
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </button>
        <div className="article-reader-brand">ET Intelligence</div>
        <div className="article-nav-actions">
          <button className="article-action-btn" onClick={handleShare} title="Copy link">
            <Share2 size={16} strokeWidth={1.5} />
            {copied ? 'Copied!' : 'Share'}
          </button>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-action-btn article-action-btn--primary">
            <ExternalLink size={14} strokeWidth={1.5} />
            Source
          </a>
        </div>
      </nav>

      {/* Hero */}
      {article.image && (
        <div className="article-hero-img">
          <img src={article.image} alt={article.title} onError={e => (e.currentTarget.style.display = 'none')} />
          <div className="article-hero-img-overlay" />
        </div>
      )}

      {/* Content */}
      <main className="article-reader-main" ref={contentRef}>
        <div className="article-meta-row">
          {article.source && <span className="article-source-badge">{article.source}</span>}
          {article.genres?.map(g => (
            <span key={g} className="article-genre-tag"><Tag size={10} strokeWidth={2} /> {g}</span>
          ))}
          <span className="article-meta-sep" />
          <span className="article-read-time"><Clock size={12} strokeWidth={1.5} />{readTime} min read</span>
        </div>

        <h1 className="article-reader-title">{article.title}</h1>

        {article.published_at && (
          <p className="article-reader-date">
            {new Date(article.published_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        <div className="article-reader-divider" />

        <div className="article-reader-body">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p key={i} className={i === 0 ? 'article-para article-para--lead' : 'article-para'}>{para}</p>
            ))
          ) : (
            <p className="article-para article-para--lead">
              Full article content is available at the source. Click "Source" above to read on the original publisher's site.
            </p>
          )}
        </div>

        <div className="article-reader-footer">
          <div className="article-reader-divider" />
          <p className="article-footer-label">Continue reading the full story</p>
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-source-cta">
            <ExternalLink size={14} strokeWidth={1.5} />
            Read on {article.source || 'Source'}
          </a>
          <button onClick={() => router.back()} className="article-back-link">← Back to your feed</button>
        </div>
      </main>

      {/* ── Floating Chat Button ── */}
      <button
        className={`article-chat-fab ${chatOpen ? 'article-chat-fab--active' : ''}`}
        onClick={() => setChatOpen(o => !o)}
        title="Ask AI about this article"
      >
        {chatOpen ? <X size={20} strokeWidth={2} /> : <MessageSquare size={20} strokeWidth={1.5} />}
        {!chatOpen && <span className="article-chat-fab-label">Ask AI</span>}
      </button>

      {/* ── Chat Panel ── */}
      <div className={`article-chat-panel ${chatOpen ? 'article-chat-panel--open' : ''}`}>
        <div className="article-chat-header">
          <div className="article-chat-header-left">
            <Bot size={16} strokeWidth={1.5} style={{ color: 'var(--gold)' }} />
            <span className="article-chat-title">Article Assistant</span>
          </div>
          <button className="article-chat-close" onClick={() => setChatOpen(false)}><X size={16} /></button>
        </div>

        <div className="article-chat-messages">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`article-chat-msg article-chat-msg--${msg.role}`}>
              <div className="article-chat-avatar">
                {msg.role === 'assistant'
                  ? <Bot size={14} strokeWidth={1.5} />
                  : <User size={14} strokeWidth={1.5} />}
              </div>
              <div className="article-chat-bubble">{renderAIText(msg.text)}</div>
            </div>
          ))}
          {chatLoading && (
            <div className="article-chat-msg article-chat-msg--assistant">
              <div className="article-chat-avatar"><Bot size={14} strokeWidth={1.5} /></div>
              <div className="article-chat-bubble article-chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form
          className="article-chat-input-row"
          onSubmit={e => { e.preventDefault(); sendChat(); }}
        >
          <input
            ref={inputRef}
            className="article-chat-input"
            type="text"
            placeholder="Ask anything about this article…"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={chatLoading}
          />
          <button
            type="submit"
            className="article-chat-send"
            disabled={!chatInput.trim() || chatLoading}
          >
            <Send size={15} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
