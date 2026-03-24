import Link from 'next/link';

export default function Home() {
  const tools = [
    {
      id: "story",
      title: "Story Arc Tracker",
      desc: "Pick any ongoing business story and watch AI build a complete chronological narrative and predictive map.",
      icon: "📈",
      href: "/story"
    },
    {
      id: "my-et",
      title: "My ET Personalized",
      desc: "A completely custom newsfeed tailored specifically to your exact investment portfolio or persona focus.",
      icon: "🎯",
      href: "/my-et"
    },
    {
      id: "navigator",
      title: "News Navigator",
      desc: "An interactive intelligence briefing. Chat with a deeply analyzed mega-report of specific events.",
      icon: "💬",
      href: "/navigator"
    },
    {
      id: "studio",
      title: "AI Video Studio",
      desc: "Instantly transform any breaking ET article into a broadcast-quality short video with dynamic narration.",
      icon: "🎬",
      href: "/studio"
    },
    {
      id: "vernacular",
      title: "Vernacular Engine",
      desc: "Real-time, context-aware translations of complex financial concepts into localized Indian languages.",
      icon: "🌍",
      href: "/vernacular"
    }
  ];

  return (
    <div className="story-root">
      <div className="hub-container">
        <header className="hub-header anim anim-1">
          <p className="hub-subtitle">Welcome to the future</p>
          <h1 className="hub-title">ET — <em>The Personalized Newsroom</em></h1>
        </header>

        <div className="hub-grid">
          {tools.map((tool, i) => (
            <Link key={tool.id} href={tool.href} className={`hub-card anim anim-${(i % 5) + 2}`}>
              <div className="hub-card-icon">{tool.icon}</div>
              <h2 className="hub-card-title">{tool.title}</h2>
              <p className="hub-card-desc">{tool.desc}</p>
              <div className="hub-card-link">Launch Module</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}