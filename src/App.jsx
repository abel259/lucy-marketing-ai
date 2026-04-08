import { useState, useEffect, useCallback, useRef } from "react";

// âââ Google OAuth Configuration âââââââââââââââââââââââââââââââââââââââââââââââ
const GOOGLE_CLIENT_ID = "48759326038-bti7je30dad8knp7grufpgd99h2spqvi.apps.googleusercontent.com";

// âââ Color Palette ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const colors = {
  bg: "#0f0f1a",
  surface: "#1a1a2e",
  surfaceLight: "#222240",
  accent: "#6c5ce7",
  accentLight: "#a29bfe",
  success: "#00cec9",
  warning: "#fdcb6e",
  danger: "#ff7675",
  text: "#e8e8f0",
  textMuted: "#8888a8",
  border: "#2d2d50",
  cardBg: "#1e1e36",
};

// âââ Mock Data ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const initialCards = {
  recommended: [
    { id: "c1", title: "Launch Email Campaign", description: "New product announcement to 12k subscribers", priority: "high", type: "email", eta: "2 days" },
    { id: "c2", title: "Review Ad Spend", description: "Monthly Google Ads budget at 78% â optimize bids", priority: "medium", type: "ads", eta: "Today" },
    { id: "c3", title: "Schedule Social Posts", description: "Q2 product launch â 8 posts ready for review", priority: "medium", type: "social", eta: "3 days" },
    { id: "c4", title: "Update Landing Page", description: "A/B test variant B outperforming by 23%", priority: "high", type: "web", eta: "1 day" },
    { id: "c5", title: "Segment Audience List", description: "Create re-engagement segment for dormant users", priority: "low", type: "email", eta: "5 days" },
  ],
  in_progress: [
    { id: "c6", title: "Blog Content Calendar", description: "April editorial calendar â 3 of 8 posts drafted", priority: "medium", type: "content", eta: "Ongoing" },
    { id: "c7", title: "Influencer Outreach", description: "Contacted 5 of 12 target micro-influencers", priority: "low", type: "social", eta: "1 week" },
  ],
  completed: [
    { id: "c8", title: "Q1 Performance Report", description: "Compiled and shared with stakeholders", priority: "low", type: "analytics", eta: "Done" },
  ],
};

const metrics = [
  { label: "Active Campaigns", value: "12", change: "+3", up: true, icon: "ð£" },
  { label: "Emails Sent (MTD)", value: "48.2k", change: "+12%", up: true, icon: "âï¸" },
  { label: "Ad Spend", value: "$14.8k", change: "78%", up: false, icon: "ð°" },
  { label: "Conversion Rate", value: "3.8%", change: "+0.4%", up: true, icon: "ð" },
];

// âââ Small Components âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const TypeIcon = ({ type }) => {
  const icons = { email: "âï¸", ads: "ð¢", social: "ð±", web: "ð", content: "ð", analytics: "ð" };
  return <span style={{ fontSize: 16 }}>{icons[type] || "ð"}</span>;
};

const PriorityBadge = ({ priority }) => {
  const c = { high: colors.danger, medium: colors.warning, low: colors.success };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: c[priority], background: `${c[priority]}18`, padding: "2px 8px", borderRadius: 4 }}>
      {priority}
    </span>
  );
};

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// âââ Login Screen âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const LoginScreen = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              const payload = JSON.parse(atob(response.credential.split(".")[1]));
              onLogin({ name: payload.name, email: payload.email, picture: payload.picture });
            },
          });
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline", size: "large", width: 320, text: "signin_with",
          });
          setGoogleReady(true);
        } catch (e) { console.error("Google Sign-In init error:", e); }
      } else {
        setTimeout(initGoogle, 500);
      }
    };
    initGoogle();
  }, [onLogin]);

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({ name: "Abel Solomon", email: "abel@heliumdeploy.io", picture: null });
    }, 1200);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, ${colors.bg} 0%, #16163a 50%, ${colors.bg} 100%)`,
    }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `${colors.accent}15`, top: "10%", left: "5%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `${colors.success}10`, bottom: "10%", right: "10%", filter: "blur(60px)" }} />
      </div>

      <div style={{
        background: colors.surface, borderRadius: 20, padding: "48px 40px", width: 420,
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${colors.border}`,
        position: "relative", zIndex: 1, textAlign: "center", animation: "fadeIn 0.6s ease",
      }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: `0 8px 24px ${colors.accent}40`,
          }}>ð</div>
          <h1 style={{ color: colors.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Lucy</h1>
          <p style={{ color: colors.accentLight, fontSize: 14, fontWeight: 500, margin: "4px 0 0", letterSpacing: 2, textTransform: "uppercase" }}>Marketing AI</p>
        </div>

        <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.6, margin: "24px 0 32px" }}>
          Your intelligent marketing co-pilot.<br />Campaign actions, insights, and automation â all in one place.
        </p>

        <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center", marginBottom: googleReady ? 16 : 0 }} />

        {!googleReady && (
          <button onClick={handleDemoLogin} disabled={isLoading} style={{
            width: "100%", padding: "14px 24px", borderRadius: 12, border: `1px solid ${colors.border}`,
            background: isLoading ? colors.surfaceLight : "white", cursor: isLoading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontSize: 15, fontWeight: 500, color: isLoading ? colors.textMuted : "#333", transition: "all 0.2s", marginBottom: 16,
          }}
          onMouseEnter={e => { if (!isLoading) { e.target.style.background = "#f5f5f5"; e.target.style.transform = "translateY(-1px)"; }}}
          onMouseLeave={e => { if (!isLoading) { e.target.style.background = "white"; e.target.style.transform = "none"; }}}
          >
            {isLoading
              ? <div style={{ width: 20, height: 20, border: `3px solid ${colors.border}`, borderTopColor: colors.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <GoogleLogo />
            }
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        )}

        {googleReady && (
          <button onClick={handleDemoLogin} style={{ background: "none", border: "none", color: colors.textMuted, fontSize: 13, cursor: "pointer", padding: "8px 16px", borderRadius: 8 }}>
            or continue with demo account â
          </button>
        )}

        <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 24 }}>Secured with Google OAuth 2.0</p>
      </div>
    </div>
  );
};

// âââ Card Component âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const ActionCard = ({ card, columnId, onMoveCard }) => {
  const [expanded, setExpanded] = useState(false);
  const next = { recommended: "in_progress", in_progress: "completed", completed: null };
  const prev = { recommended: null, in_progress: "recommended", completed: "in_progress" };
  const labels = { recommended: "Start Task", in_progress: "Mark Complete", completed: null };

  return (
    <div onClick={() => setExpanded(!expanded)} style={{
      background: colors.cardBg, borderRadius: 12, padding: 16,
      border: `1px solid ${expanded ? colors.accent + "60" : colors.border}`,
      cursor: "pointer", transition: "all 0.2s",
      boxShadow: expanded ? `0 4px 20px ${colors.accent}20` : "none",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = colors.accent + "40"}
    onMouseLeave={e => { if (!expanded) e.currentTarget.style.borderColor = colors.border; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TypeIcon type={card.type} />
          <span style={{ color: colors.text, fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{card.title}</span>
        </div>
        <PriorityBadge priority={card.priority} />
      </div>
      <p style={{ color: colors.textMuted, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>{card.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: colors.textMuted, fontSize: 11 }}>â± {card.eta}</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.border}`, display: "flex", gap: 8 }}>
          {prev[columnId] && (
            <button onClick={e => { e.stopPropagation(); onMoveCard(card.id, columnId, prev[columnId]); }} style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${colors.border}`,
              background: "transparent", color: colors.textMuted, fontSize: 12, cursor: "pointer",
            }}>â Move Back</button>
          )}
          {next[columnId] && (
            <button onClick={e => { e.stopPropagation(); onMoveCard(card.id, columnId, next[columnId]); }} style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
              color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer",
              boxShadow: `0 4px 12px ${colors.accent}40`,
            }}>{labels[columnId]} â</button>
          )}
        </div>
      )}
    </div>
  );
};

// âââ Column Component âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const KanbanColumn = ({ title, columnId, cards, count, color, onMoveCard }) => (
  <div style={{ flex: 1, minWidth: 280 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "0 4px" }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
      <span style={{ color: colors.text, fontSize: 14, fontWeight: 600 }}>{title}</span>
      <span style={{ background: colors.surfaceLight, color: colors.textMuted, fontSize: 12, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{count}</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {cards.map(card => <ActionCard key={card.id} card={card} columnId={columnId} onMoveCard={onMoveCard} />)}
      {cards.length === 0 && (
        <div style={{ padding: 24, borderRadius: 12, border: `2px dashed ${colors.border}`, textAlign: "center", color: colors.textMuted, fontSize: 13 }}>No tasks here yet</div>
      )}
    </div>
  </div>
);

// âââ Dashboard Screen âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const Dashboard = ({ user, onLogout }) => {
  const [cards, setCards] = useState(initialCards);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const moveCard = useCallback((cardId, fromCol, toCol) => {
    setCards(prev => {
      const card = prev[fromCol].find(c => c.id === cardId);
      if (!card) return prev;
      return { ...prev, [fromCol]: prev[fromCol].filter(c => c.id !== cardId), [toCol]: [...prev[toCol], card] };
    });
  }, []);

  const filterCards = (columnCards) => {
    let filtered = columnCards;
    if (searchQuery) { const q = searchQuery.toLowerCase(); filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)); }
    if (activeFilter !== "all") filtered = filtered.filter(c => c.type === activeFilter);
    return filtered;
  };

  const filters = [
    { key: "all", label: "All" }, { key: "email", label: "âï¸ Email" }, { key: "ads", label: "ð¢ Ads" },
    { key: "social", label: "ð± Social" }, { key: "web", label: "ð Web" }, { key: "content", label: "ð Content" },
  ];

  const totalTasks = cards.recommended.length + cards.in_progress.length + cards.completed.length;
  const completionRate = totalTasks ? Math.round((cards.completed.length / totalTasks) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      {/* Nav */}
      <nav style={{
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>ð</div>
          <span style={{ color: colors.text, fontSize: 18, fontWeight: 700 }}>Lucy</span>
          <span style={{ color: colors.accentLight, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" }}>Marketing AI</span>
        </div>
        <div style={{ position: "relative", flex: "0 1 400px" }}>
          <input type="text" placeholder="Search campaigns, tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.surfaceLight, color: colors.text, fontSize: 14, outline: "none" }}
            onFocus={e => e.target.style.borderColor = colors.accent} onBlur={e => e.target.style.borderColor = colors.border} />
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: colors.textMuted, fontSize: 14 }}>ð</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: colors.text, fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div style={{ color: colors.textMuted, fontSize: 11 }}>{user.email}</div>
          </div>
          {user.picture
            ? <img src={user.picture} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />
            : <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700 }}>{user.name.charAt(0)}</div>
          }
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${colors.border}`, color: colors.textMuted, padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
            onMouseEnter={e => e.target.style.borderColor = colors.danger} onMouseLeave={e => e.target.style.borderColor = colors.border}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 24, animation: "fadeIn 0.5s ease" }}>
          <h2 style={{ color: colors.text, fontSize: 24, fontWeight: 700, margin: 0 }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user.name.split(" ")[0]} ð
          </h2>
          <p style={{ color: colors.textMuted, fontSize: 14, margin: "4px 0 0" }}>
            Here's your marketing overview for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: colors.surface, borderRadius: 14, padding: 20, border: `1px solid ${colors.border}`, transition: "all 0.2s", animation: `fadeIn ${0.3 + i * 0.1}s ease` }}
              onMouseEnter={e => e.currentTarget.style.borderColor = colors.accent + "50"} onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: colors.textMuted, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ color: colors.text, fontSize: 26, fontWeight: 700 }}>{m.value}</div>
                </div>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: m.up ? colors.success : colors.warning }}>
                {m.up ? "â" : "â "} {m.change} {m.up ? "vs last month" : "of budget"}
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ background: colors.surface, borderRadius: 12, padding: "16px 20px", border: `1px solid ${colors.border}`, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ color: colors.textMuted, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>Task Completion</span>
          <div style={{ flex: 1, height: 8, background: colors.surfaceLight, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completionRate}%`, borderRadius: 4, background: `linear-gradient(90deg, ${colors.accent}, ${colors.success})`, transition: "width 0.5s ease" }} />
          </div>
          <span style={{ color: colors.text, fontSize: 14, fontWeight: 700 }}>{completionRate}%</span>
          <span style={{ color: colors.textMuted, fontSize: 12 }}>({cards.completed.length}/{totalTasks} tasks)</span>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s",
              background: activeFilter === f.key ? colors.accent : colors.surfaceLight,
              color: activeFilter === f.key ? "white" : colors.textMuted,
            }}>{f.label}</button>
          ))}
        </div>

        {/* Kanban */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <KanbanColumn title="Recommended Actions" columnId="recommended" color={colors.accentLight} cards={filterCards(cards.recommended)} count={cards.recommended.length} onMoveCard={moveCard} />
          <KanbanColumn title="In Progress" columnId="in_progress" color={colors.warning} cards={filterCards(cards.in_progress)} count={cards.in_progress.length} onMoveCard={moveCard} />
          <KanbanColumn title="Completed" columnId="completed" color={colors.success} cards={filterCards(cards.completed)} count={cards.completed.length} onMoveCard={moveCard} />
        </div>
      </div>
    </div>
  );
};

// âââ App Root âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return user ? (
    <Dashboard user={user} onLogout={() => { setUser(null); setIsAuthenticated(false); sessionStorage.clear(); }} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
}
