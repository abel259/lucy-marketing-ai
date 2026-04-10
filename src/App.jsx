import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Lucy Marketing AI - Complete Single-File React App
// ============================================================================

const App = () => {
  // Navigation state machine
  const [screen, setScreen] = useState('landing'); // landing -> login -> website-input -> analyzing -> brand-extraction -> marketing-ready -> dashboard
  const [user, setUser] = useState(null);
  const [website, setWebsite] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [brandData, setBrandData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [autoCampaign, setAutoCampaign] = useState(null);
  const [autoCampaignLoading, setAutoCampaignLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize Google Sign-In
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.onload = () => {
      if (window.google && screen === 'login') {
        google.accounts.id.initialize({
          client_id: '48759326038-bti7je30dad8knp7grufpgd99h2spqvi.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          { theme: 'dark', size: 'large' }
        );
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [screen]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Landing page scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mock Claude API call for brand analysis
  const mockBrandExtraction = useCallback((url) => {
    const mockData = {
      business: "HeliumDeploy positions itself as the 'Top Trusted Home Miner Reseller' offering a wide range of mining hardware and bundles with exceptional customer service.",
      description: "We provide high-quality mining equipment and expert guidance to help customers build and optimize their mining operations.",
      brandColors: ['#c8e632', '#1a1a2e', '#2d2d50', '#111111', '#e8e8f0'],
      logo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23c8e632;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%2300cec9;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx="50" cy="50" r="45" fill="url(%23grad)"%3E%3C/circle%3E%3Ctext x="50" y="60" font-size="40" font-weight="bold" text-anchor="middle" fill="%231a1a2e"%3EHD%3C/text%3E%3C/svg%3E',
      font: 'Inter',
      industry: 'Hardware & Mining',
      targetAudience: 'Home miners, crypto enthusiasts, hardware investors',
    };
    return mockData;
  }, []);

  // Analysis progress animation
  useEffect(() => {
    if (screen === 'analyzing') {
      const steps = [
        { progress: 25 },
        { progress: 50 },
        { progress: 75 },
      ];
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setAnalysisProgress(steps[currentStep].progress);
          currentStep++;
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [screen]);

  // Auto-generate campaign when landing on dashboard
  useEffect(() => {
    if (screen === 'dashboard' && brandData && !autoCampaign) {
      setAutoCampaignLoading(true);
      fetch('/api/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandData.brandName,
          industry: brandData.industry,
          products: brandData.products,
          targetAudience: brandData.targetAudience,
          brandColors: brandData.brandColors,
          tone: brandData.tone
        })
      })
      .then(r => r.json())
      .then(data => {
        setAutoCampaign(data);
        setAutoCampaignLoading(false);
      })
      .catch(err => {
        console.error('Auto campaign failed:', err);
        setAutoCampaignLoading(false);
      });
    }
  }, [screen, brandData]);

  // Google OAuth callback
  const handleCredentialResponse = (response) => {
    try {
      const responsePayload = JSON.parse(atob(response.credential.split('.')[1]));
      setUser({
        email: responsePayload.email,
        name: responsePayload.name,
        picture: responsePayload.picture,
      });
      setScreen('website-input');
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  // Demo login
  const handleDemoLogin = () => {
    setUser({
      email: 'demo@example.com',
      name: 'Demo User',
      picture: 'https://via.placeholder.com/40',
    });
    setScreen('website-input');
  };

  // Website analysis
  const handleAnalyzeWebsite = async () => {
    if (!websiteInput.trim()) return;
    const url = websiteInput.trim();
    setWebsite(url);
    setScreen('analyzing');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.startsWith('http') ? url : 'https://' + url })
      });
      const data = await res.json();
      setBrandData({
        business: data.description,
        description: data.description,
        brandColors: data.brandColors || ['#6c5ce7', '#a29bfe', '#dfe6e9', '#2d3436', '#636e72'],
        logo: data.logoUrl || mockBrandExtraction(url).logo,
        font: 'Inter',
        industry: data.industry || 'Unknown',
        targetAudience: data.targetAudience || 'General',
        brandName: data.brandName,
        tone: data.tone,
        campaignSuggestion: data.campaignSuggestion,
      });
      setAnalysisProgress(100);
      setTimeout(() => setScreen('brand-extraction'), 500);
    } catch (err) {
      console.error('Analysis failed:', err);
      setBrandData({
        ...mockBrandExtraction(url),
        brandName: url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
        campaignSuggestion: { name: 'Welcome Campaign', description: 'Introductory email series', estimatedOpenRate: '25%', projectedROI: '150%' }
      });
      setAnalysisProgress(100);
      setTimeout(() => setScreen('brand-extraction'), 500);
    }
  };

  // Brand extraction navigation
  const handleCreateCampaign = () => {
    setScreen('marketing-ready');
  };

  const handleSkip = () => {
    setScreen('dashboard');
  };

  // Chat functionality
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const messageText = chatInput;
    setChatInput('');
    setIsLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          brandContext: brandData
        })
      });
      const data = await res.json();

      setChatMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      }]);
    }
    setIsLoadingChat(false);
  }, [chatInput, brandData]);

  const handleQuickAction = useCallback(async (action) => {
    const userMessage = {
      id: Date.now(),
      text: action,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: action, brandContext: brandData })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      }]);
    }
    setIsLoadingChat(false);
  }, [brandData]);

  // ============================================================================
  // SCREEN RENDERERS
  // ============================================================================

  const renderLanding = () => {
    const Check = () => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.12" />
        <path d="M6 10.5l2.5 2.5L14 7.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );

    const SlackIcon = () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" fill="#e01e5a"/>
      </svg>
    );

    const toolBadge = (name, logoUrl) => (
      <div key={name} style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        background: "#fff", border: "1px solid #e8e8ed", borderRadius: 10,
        padding: "10px 18px",
      }}>
        <img src={logoUrl} alt={name} style={{ width: 20, height: 20, objectFit: "contain" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{name}</span>
      </div>
    );

    return (
      <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: "#1d1d1f", background: "#fff", WebkitFontSmoothing: "antialiased" }}>

        {/* Nav */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
          transition: "all 0.3s",
        }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 24px" }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.04em", color: "#1d1d1f" }}>lucy</span>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {["Product", "Pricing", "Docs"].map((t) => (
                <a key={t} href="#" style={{ fontSize: 14, color: "#6e6e73", textDecoration: "none", fontWeight: 500 }}>{t}</a>
              ))}
              <button onClick={() => setScreen('website-input')} style={{
                fontSize: 14, fontWeight: 600, color: "#fff", background: "#1d1d1f",
                padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              }}>Get started</button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth: 780, margin: "0 auto", padding: "140px 24px 48px", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#10b981", marginBottom: 16, letterSpacing: "0.02em" }}>AI-POWERED MARKETING</p>
          <h1 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.035em", margin: "0 0 20px", color: "#1d1d1f" }}>
            Your entire marketing team, in one AI.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.65, color: "#6e6e73", margin: "0 auto 36px", maxWidth: 520 }}>
            Lucy connects to your tools, learns your brand, and runs campaigns — all on autopilot.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setScreen('website-input')} style={{
              fontSize: 15, fontWeight: 600, color: "#fff", background: "#1d1d1f",
              padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
            }}>Start for free</button>
            <button style={{
              fontSize: 15, fontWeight: 600, color: "#1d1d1f", background: "transparent",
              padding: "12px 28px", borderRadius: 10, border: "1px solid #d2d2d7", cursor: "pointer",
            }}>See how it works</button>
          </div>
          <p style={{ fontSize: 13, color: "#afafb2", marginTop: 14 }}>Free plan available. No credit card needed.</p>
        </section>

        {/* Connects to your tools */}
        <section style={{ padding: "32px 24px 64px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#afafb2", fontWeight: 500, marginBottom: 20 }}>Connects to your tools</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {toolBadge("Slack", "https://cdn.simpleicons.org/slack")}
              {toolBadge("Google Meet", "https://cdn.simpleicons.org/googlemeet")}
              {toolBadge("Shopify", "https://cdn.simpleicons.org/shopify")}
              {toolBadge("Figma", "https://cdn.simpleicons.org/figma")}
              {toolBadge("Google Docs", "https://cdn.simpleicons.org/googledocs")}
              {toolBadge("Klaviyo", "https://cdn.simpleicons.org/klaviyo")}
              {toolBadge("Notion", "https://cdn.simpleicons.org/notion")}
            </div>
          </div>
        </section>

        {/* Lucy lives in your tools */}
        <section style={{ background: "#fafafa", padding: "100px 24px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#10b981", marginBottom: 8, letterSpacing: "0.02em" }}>LUCY LIVES IN YOUR TOOLS</p>
              <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px" }}>From conversation to campaign in seconds</h2>
              <p style={{ fontSize: 16, color: "#6e6e73", maxWidth: 500, margin: "0 auto" }}>Lucy watches your Slack, reads your docs, and pushes campaigns directly into Klaviyo — no tab switching.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "start" }}>

              {/* Slack conversation */}
              <div style={{
                background: "#fff", borderRadius: 14, overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
                  <SlackIcon />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}># marketing</div>
                    <div style={{ fontSize: 11, color: "#afafb2" }}>3 members</div>
                  </div>
                </div>

                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "#e8e8ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>S</div>
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>Sarah</span>
                        <span style={{ fontSize: 11, color: "#afafb2", marginLeft: 8 }}>10:42 AM</span>
                      </div>
                      <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.55 }}>
                        Hey team, we just launched the new summer collection on Shopify. We need an email campaign ASAP — can we get something out this week?
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "#e8e8ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>M</div>
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>Mike</span>
                        <span style={{ fontSize: 11, color: "#afafb2", marginLeft: 8 }}>10:44 AM</span>
                      </div>
                      <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.55 }}>
                        @Lucy can you handle this? Pull the new products and draft something.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "#1d1d1f", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>L</div>
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>Lucy</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#10b981", background: "#ecfdf5", padding: "1px 6px", borderRadius: 4, marginLeft: 6 }}>AI</span>
                        <span style={{ fontSize: 11, color: "#afafb2", marginLeft: 8 }}>10:44 AM</span>
                      </div>
                      <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.6 }}>
                        On it. I pulled 12 new products from your Shopify store. Here's what I'm proposing:
                      </div>
                      <div style={{
                        marginTop: 10, background: "#f8f8fa", borderRadius: 10, padding: 16,
                        border: "1px solid #e8e8ed", fontSize: 13, lineHeight: 1.6, color: "#1d1d1f",
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Summer Collection Launch</div>
                        <div style={{ color: "#6e6e73" }}>3-email sequence over 7 days</div>
                        <div style={{ color: "#6e6e73", marginTop: 4 }}>Email 1: "Summer just dropped" — hero product showcase</div>
                        <div style={{ color: "#6e6e73" }}>Email 2: Social proof + bestsellers</div>
                        <div style={{ color: "#6e6e73" }}>Email 3: Last chance + 10% off</div>
                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#1d1d1f", background: "#e8e8ed", padding: "4px 10px", borderRadius: 6 }}>Predicted open: 36%</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#10b981", background: "#ecfdf5", padding: "4px 10px", borderRadius: 6 }}>Ready to push</span>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, fontSize: 14, color: "#1d1d1f" }}>
                        Want me to push this directly to Klaviyo? I'll set up the flows and schedule it.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow connector */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", paddingTop: 120 }}>
                <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
                  <path d="M0 10h32m0 0l-6-6m6 6l-6 6" stroke="#d2d2d7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Klaviyo result */}
              <div style={{
                background: "#fff", borderRadius: 14, overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 4, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>K</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}>Klaviyo</div>
                    <div style={{ fontSize: 11, color: "#afafb2" }}>Campaign created by Lucy</div>
                  </div>
                </div>

                <div style={{ padding: "20px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>Summer Collection Launch</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", background: "#fffbeb", padding: "3px 8px", borderRadius: 5 }}>Scheduled</span>
                    </div>
                    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#afafb2", marginBottom: 2 }}>Recipients</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>8,432</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#afafb2", marginBottom: 2 }}>Emails</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>3</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#afafb2", marginBottom: 2 }}>Duration</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>7 days</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      { day: "Day 1", subject: "Summer just dropped — see what's new", status: "Scheduled", statusColor: "#f59e0b", statusBg: "#fffbeb" },
                      { day: "Day 3", subject: "People are loving these pieces", status: "Draft ready", statusColor: "#6e6e73", statusBg: "#f0f0f0" },
                      { day: "Day 7", subject: "Last chance: 10% off summer styles", status: "Draft ready", statusColor: "#6e6e73", statusBg: "#f0f0f0" },
                    ].map((email, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "#10b981" : "#d2d2d7",
                            flexShrink: 0,
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: "#afafb2", marginBottom: 2 }}>{email.day}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{email.subject}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: email.statusColor, background: email.statusBg, padding: "3px 8px", borderRadius: 5 }}>
                            {email.status}
                          </span>
                        </div>
                        {i < 2 && <div style={{ width: 1, height: 12, background: "#e8e8ed", marginLeft: 3.5 }} />}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                    <div style={{
                      flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8,
                      background: "#1d1d1f", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>Launch campaign</div>
                    <div style={{
                      flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8,
                      border: "1px solid #e8e8ed", color: "#1d1d1f", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>Edit in Klaviyo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section style={{ maxWidth: 1120, margin: "0 auto", padding: "100px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
              Tap into deeper customer insights with Marketing Analytics
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#6e6e73", margin: "0 0 32px" }}>
              Drive retention, revenue, and relationships at scale with actionable customer insights.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { title: "Track every touchpoint", desc: "Understand the entire customer journey to convert more across channels, segments, and seasons." },
                { title: "Start and scale faster", desc: "Skip the analysis with continuously updated, out-of-the-box machine learning models and dashboards." },
                { title: "Take action in one click", desc: "Grow revenue on auto-pilot with ready-to-use templates, automated workflows, and personalized predictions." },
                { title: "Built for marketers", desc: "Consolidate and customize your reporting, metrics, and attribution to track what matters." },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", gap: 14 }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}><Check /></div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f", marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 14, color: "#6e6e73", lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "#fff", borderRadius: 14, padding: 24,
              boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#afafb2", marginBottom: 16 }}>Engagement Over Time</div>
              <svg viewBox="0 0 300 80" style={{ width: "100%", height: 80 }}>
                <polyline fill="none" stroke="#1d1d1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  points="0,60 30,45 60,55 90,30 120,35 150,20 180,25 210,15 240,22 270,10 300,18" />
                <polyline fill="none" stroke="#d2d2d7" strokeWidth="1.5" strokeDasharray="4,4"
                  points="0,65 30,60 60,62 90,55 120,50 150,48 180,45 210,42 240,38 270,35 300,30" />
              </svg>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6e6e73" }}>
                  <div style={{ width: 12, height: 2, background: "#1d1d1f", borderRadius: 1 }} /> Open rate
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6e6e73" }}>
                  <div style={{ width: 12, height: 2, background: "#d2d2d7", borderRadius: 1 }} /> Industry avg
                </div>
              </div>
            </div>
            <div style={{
              background: "#fff", borderRadius: 14, padding: 24,
              boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#afafb2", marginBottom: 16 }}>Revenue by Channel</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 80 }}>
                {[90, 70, 85, 60, 95, 75].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 4, display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 3, background: "#f59e0b", borderRadius: "4px 4px 0 0" }} />
                    <div style={{ flex: 4, background: "#10b981" }} />
                    <div style={{ flex: 5, background: "#1d1d1f", borderRadius: "0 0 4px 4px" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                {[{ c: "#1d1d1f", l: "Email" }, { c: "#10b981", l: "Social" }, { c: "#f59e0b", l: "Ads" }].map((x) => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6e6e73" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} /> {x.l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ background: "#fafafa", padding: "100px 24px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#10b981", marginBottom: 8, textAlign: "center", letterSpacing: "0.02em" }}>HOW IT WORKS</p>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", textAlign: "center", margin: "0 0 56px" }}>Up and running in minutes</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
              {[
                { num: "1", title: "Connect your tools", desc: "Link Slack, Shopify, Klaviyo, Google Calendar, and Figma. Lucy syncs your products, conversations, and brand assets." },
                { num: "2", title: "Lucy learns your brand", desc: "She reads your docs, scans your store, and builds a brand profile — voice, colors, audience, positioning." },
                { num: "3", title: "Campaigns on autopilot", desc: "Lucy spots opportunities in Slack, drafts campaigns, and pushes them to Klaviyo. You just approve." },
              ].map((step) => (
                <div key={step.num} style={{
                  background: "#fff", borderRadius: 14, padding: 32,
                  border: "1px solid rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: "#1d1d1f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 20,
                  }}>{step.num}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#6e6e73", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "100px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px" }}>Ready to automate your marketing?</h2>
            <p style={{ fontSize: 16, color: "#6e6e73", lineHeight: 1.65, margin: "0 0 32px" }}>
              Join thousands of brands using Lucy to create better campaigns in less time.
            </p>
            <button onClick={() => setScreen('website-input')} style={{
              display: "inline-block", fontSize: 15, fontWeight: 600, color: "#fff",
              background: "#1d1d1f", padding: "13px 32px", borderRadius: 10, border: "none", cursor: "pointer",
            }}>Get started for free</button>
            <p style={{ fontSize: 13, color: "#afafb2", marginTop: 14 }}>No credit card required</p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #f0f0f0", padding: "32px 24px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.04em", color: "#1d1d1f" }}>lucy</span>
            <div style={{ display: "flex", gap: 28 }}>
              {["Privacy", "Terms", "Docs", "Support"].map((t) => (
                <a key={t} href="#" style={{ fontSize: 13, color: "#afafb2", textDecoration: "none" }}>{t}</a>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "#d2d2d7" }}>&copy; 2026 Lucy AI</span>
          </div>
        </footer>
      </div>
    );
  };

  const renderLogin = () => (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <h2 style={styles.loginTitle}>Welcome to Lucy</h2>
        <p style={styles.loginSubtitle}>Sign in with your Google account to get started</p>

        <div id="googleSignInButton" style={styles.googleButtonContainer}></div>

        <div style={styles.divider}>
          <span>or</span>
        </div>

        <button
          style={styles.demoButton}
          onClick={handleDemoLogin}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2d2d50';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#1a1a2e';
          }}
        >
          Demo Login
        </button>

        <p style={styles.loginFooter}>
          We never share your data. Your privacy is our priority.
        </p>
      </div>
    </div>
  );

  const renderWebsiteInput = () => (
    <div style={styles.inputContainer}>
      <div style={styles.inputCard}>
        <h2 style={styles.inputTitle}>Let's analyze your brand</h2>
        <p style={styles.inputSubtitle}>
          Enter your website URL to get started
        </p>

        <input
          type="url"
          placeholder="https://example.com"
          value={websiteInput}
          onChange={(e) => setWebsiteInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleAnalyzeWebsite();
          }}
          style={styles.websiteInput}
        />

        <button
          style={styles.analyzeButton}
          onClick={handleAnalyzeWebsite}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#5a4ab3';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#6c5ce7';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Analyze
        </button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div style={styles.analyzingContainer}>
      <div style={styles.analyzingCard}>
        <div style={styles.spinner}></div>
        <h2 style={styles.analyzingTitle}>Analyzing your website</h2>

        <div style={styles.progressSteps}>
          <div style={{ ...styles.progressStep, opacity: analysisProgress >= 25 ? 1 : 0.3 }}>
            <div style={styles.stepIndicator}>✓</div>
            <p>Scanning website...</p>
          </div>
          <div style={{ ...styles.progressStep, opacity: analysisProgress >= 50 ? 1 : 0.3 }}>
            <div style={styles.stepIndicator}>✓</div>
            <p>Extracting brand identity...</p>
          </div>
          <div style={{ ...styles.progressStep, opacity: analysisProgress >= 75 ? 1 : 0.3 }}>
            <div style={styles.stepIndicator}>✓</div>
            <p>Analyzing content...</p>
          </div>
          <div style={{ ...styles.progressStep, opacity: analysisProgress >= 100 ? 1 : 0.3 }}>
            <div style={styles.stepIndicator}>✓</div>
            <p>Building marketing profile...</p>
          </div>
        </div>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${analysisProgress}%` }}></div>
        </div>

        <p style={styles.progressText}>{analysisProgress}%</p>
      </div>
    </div>
  );

  const renderBrandExtraction = () => (
    <div style={styles.brandContainer}>
      <div style={styles.brandContent}>
        <h2 style={styles.brandTitle}>About your business</h2>

        <div style={styles.brandGrid}>
          <div style={styles.brandSection}>
            <h3 style={styles.sectionTitle}>Logo</h3>
            <img
              src={brandData?.logo}
              alt="Brand logo"
              style={styles.logoImage}
            />
          </div>

          <div style={styles.brandSection}>
            <h3 style={styles.sectionTitle}>Brand Colors</h3>
            <div style={styles.colorPalette}>
              {brandData?.brandColors.map((color, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                  <label style={{ cursor: 'pointer', position: 'relative' }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...brandData.brandColors];
                        newColors[index] = e.target.value;
                        setBrandData({ ...brandData, brandColors: newColors });
                      }}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        top: 0,
                        left: 0
                      }}
                    />
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: '3px solid rgba(255,255,255,0.2)',
                      transition: 'transform 0.2s, border-color 0.2s',
                    }} />
                  </label>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{color}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>click to edit</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.brandSection}>
          <h3 style={styles.sectionTitle}>Brand Description</h3>
          <textarea
            defaultValue={brandData?.business}
            style={styles.brandTextarea}
            readOnly
          />
        </div>

        <div style={styles.brandSection}>
          <h3 style={styles.sectionTitle}>Industry</h3>
          <p style={styles.brandText}>{brandData?.industry}</p>
        </div>

        <div style={styles.brandSection}>
          <h3 style={styles.sectionTitle}>Target Audience</h3>
          <p style={styles.brandText}>{brandData?.targetAudience}</p>
        </div>

        <div style={styles.brandActions}>
          <button
            style={{ ...styles.brandButton, backgroundColor: '#6c5ce7' }}
            onClick={handleCreateCampaign}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5a4ab3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6c5ce7';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Create Campaign
          </button>
          <button
            style={{ ...styles.brandButton, backgroundColor: '#1a1a2e', border: '1px solid #6c5ce7' }}
            onClick={() => setScreen('website-input')}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2d2d50';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#1a1a2e';
            }}
          >
            Update Website
          </button>
          <button
            style={{ ...styles.brandButton, backgroundColor: 'transparent', color: '#8b9dc3' }}
            onClick={handleSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );

  const renderMarketingReady = () => (
    <div style={styles.readyContainer}>
      <div style={styles.readyContent}>
        <div style={styles.celebrationEmoji}>🎉</div>
        <h2 style={styles.readyTitle}>Your marketing is ready!</h2>
        <p style={styles.readySubtitle}>
          We've built a custom campaign strategy tailored to your brand
        </p>

        <div style={styles.campaignCard}>
          <div style={styles.campaignIcon}>📧</div>
          <h3 style={styles.campaignTitle}>Educational Email Series</h3>
          <p style={styles.campaignDescription}>
            A 5-part email sequence educating prospects about mining equipment ROI
            and best practices. Designed to build trust and drive conversions.
          </p>
          <div style={styles.campaignMeta}>
            <span>📊 Estimated open rate: 35%</span>
            <span>💰 Projected ROI: 280%</span>
          </div>
        </div>

        <button
          style={styles.ctaButton}
          onClick={() => setScreen('dashboard')}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#5a4ab3';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#6c5ce7';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const accentColor = brandData?.brandColors?.[0] || '#6c5ce7';
    const showQuickActions = chatMessages.length === 0;

    return (
      <div style={styles.dashboardContainer}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarBrand}>
            <h2 style={styles.sidebarLogo}>Lucy</h2>
          </div>

          <nav style={styles.sidebarNav}>
            {[
              { icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>), label: 'Home', active: true },
              { icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>), label: 'Emails' },
              { icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>), label: 'Campaigns' },
              { icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>), label: 'Analytics' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  ...styles.navItem,
                  backgroundColor: item.active ? 'rgba(108, 92, 231, 0.12)' : 'transparent',
                  color: item.active ? '#ffffff' : '#8b9dc3',
                }}
                onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ display: 'flex', alignItems: 'center', color: item.active ? '#6c5ce7' : '#8b9dc3' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Recent Chats */}
          <div style={{ padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, padding: '0 16px' }}>Recent Chats</p>
            {chatMessages.filter(m => m.sender === 'user').slice(-3).map((msg, i) => (
              <div key={i} style={{ fontSize: 13, color: '#8888a8', padding: '6px 16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {msg.text.slice(0, 28)}{msg.text.length > 28 ? '...' : ''}
              </div>
            ))}
            {chatMessages.filter(m => m.sender === 'user').length === 0 && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', padding: '0 16px' }}>No chats yet</div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* User Profile */}
          <div style={styles.sidebarFooter}>
            <div style={styles.userProfile}>
              <img src={user?.picture || 'https://via.placeholder.com/32'} alt="User" style={styles.userAvatar} />
              <div style={styles.userInfo}>
                <p style={styles.userName}>{user?.name || 'User'}</p>
                <p style={styles.userEmail}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.dashboardMain}>
          <div style={styles.dashboardCenter}>

            {/* Welcome Header — only when no chat */}
            {showQuickActions && (
              <div style={{ textAlign: 'center', marginBottom: 32, animation: 'dashFadeIn 0.4s ease-out' }}>
                <h2 style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>How can I help?</h2>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Ask me anything about your marketing strategy</p>
              </div>
            )}

            {/* Chat Input */}
            <div style={{ position: 'relative', marginBottom: 24, animation: 'dashFadeIn 0.3s ease-out' }}>
              <input
                type="text"
                placeholder="Ask me anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isLoadingChat) handleSendMessage(); }}
                style={styles.dashInput}
                disabled={isLoadingChat}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoadingChat}
                style={{
                  ...styles.dashSendBtn,
                  opacity: isLoadingChat ? 0.5 : 1,
                  cursor: isLoadingChat ? 'not-allowed' : 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>

            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: msg.sender === 'user' ? '#6c5ce7' : 'rgba(255,255,255,0.08)',
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoadingChat && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '12px 20px', borderRadius: '16px 16px 16px 4px', backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', animation: 'pulse 1.2s ease-in-out infinite' }} />
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', animation: 'pulse 1.2s ease-in-out 0.2s infinite' }} />
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', animation: 'pulse 1.2s ease-in-out 0.4s infinite' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Auto Campaign Card */}
            {showQuickActions && autoCampaign && (
              <div
                style={{
                  background: `linear-gradient(135deg, rgba(108,92,231,0.12) 0%, rgba(0,206,201,0.08) 100%)`,
                  border: `1px solid ${accentColor}33`,
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 16,
                  animation: 'dashSlideUp 0.5s ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accentColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested Campaign</div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: '#ffffff' }}>{autoCampaign.campaignName || autoCampaign.name || 'Your Next Campaign'}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', lineHeight: 1.6 }}>
                  {autoCampaign.objective || autoCampaign.description || ''}
                </p>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {autoCampaign.emailSequence && (
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Emails</span>
                      <span style={{ color: '#fff', fontWeight: 600, marginLeft: 6 }}>{autoCampaign.emailSequence.length}</span>
                    </div>
                  )}
                  {autoCampaign.timing && (
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Timing</span>
                      <span style={{ color: '#fff', fontWeight: 600, marginLeft: 6 }}>{autoCampaign.timing}</span>
                    </div>
                  )}
                  {autoCampaign.estimatedOpenRate && (
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Open Rate</span>
                      <span style={{ color: accentColor, fontWeight: 600, marginLeft: 6 }}>{autoCampaign.estimatedOpenRate}</span>
                    </div>
                  )}
                  {autoCampaign.projectedROI && (
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>ROI</span>
                      <span style={{ color: accentColor, fontWeight: 600, marginLeft: 6 }}>{autoCampaign.projectedROI}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading state for auto campaign */}
            {showQuickActions && autoCampaignLoading && !autoCampaign && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 24, marginBottom: 16, textAlign: 'center', animation: 'dashFadeIn 0.4s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(108,92,231,0.3)', borderTop: '2px solid #6c5ce7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Generating campaign suggestion...
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { text: 'What should my next campaign be?', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>) },
                  { text: 'Draft an email sequence for my top product', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>) },
                  { text: 'Analyze my competitors', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>) },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.text)}
                    style={{
                      ...styles.dashQuickAction,
                      animation: `dashSlideUp 0.4s ease-out ${0.1 * (i + 1)}s both`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(108,92,231,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(108,92,231,0.1)', flexShrink: 0 }}>{action.icon}</span>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{action.text}</span>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return renderLanding();
      case 'login':
        return renderLogin();
      case 'website-input':
        return renderWebsiteInput();
      case 'analyzing':
        return renderAnalyzing();
      case 'brand-extraction':
        return renderBrandExtraction();
      case 'marketing-ready':
        return renderMarketingReady();
      case 'dashboard':
        return renderDashboard();
      default:
        return renderLanding();
    }
  };

  return <div style={styles.app}>{renderScreen()}</div>;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  app: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#0f0f1a',
    color: '#ffffff',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  // ========== LANDING PAGE ==========
  landingContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#0f0f1a',
    overflow: 'hidden',
  },

  orb1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, rgba(108, 92, 231, 0) 70%)',
    top: '-200px',
    right: '-200px',
    animation: 'float 6s ease-in-out infinite',
  },

  orb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 206, 201, 0.1) 0%, rgba(0, 206, 201, 0) 70%)',
    bottom: '-100px',
    left: '-100px',
    animation: 'float 8s ease-in-out infinite reverse',
  },

  orb3: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(253, 203, 110, 0.08) 0%, rgba(253, 203, 110, 0) 70%)',
    top: '50%',
    left: '10%',
    animation: 'float 7s ease-in-out infinite',
  },

  landingContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '800px',
    padding: '40px 20px',
    animation: 'fadeIn 0.8s ease-out',
  },

  logoSection: {
    marginBottom: '60px',
  },

  logo: {
    fontSize: '72px',
    fontWeight: '900',
    margin: '0 0 10px 0',
    background: 'linear-gradient(135deg, #6c5ce7 0%, #00cec9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  tagline: {
    fontSize: '18px',
    color: '#8b9dc3',
    margin: 0,
  },

  heroSection: {
    marginBottom: '40px',
  },

  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    margin: '0 0 20px 0',
    lineHeight: '1.3',
  },

  heroDescription: {
    fontSize: '18px',
    color: '#8b9dc3',
    margin: '0 0 40px 0',
    lineHeight: '1.6',
  },

  valuePropGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '60px',
  },

  valueProp: {
    padding: '24px',
    backgroundColor: 'rgba(26, 26, 46, 0.5)',
    border: '1px solid rgba(108, 92, 231, 0.2)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  },

  valuePropIcon: {
    fontSize: '32px',
    marginBottom: '12px',
    display: 'block',
  },

  ctaButton: {
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#6c5ce7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // ========== LOGIN PAGE ==========
  loginContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    animation: 'fadeIn 0.5s ease-out',
  },

  loginCard: {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(108, 92, 231, 0.2)',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  loginTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },

  loginSubtitle: {
    fontSize: '16px',
    color: '#8b9dc3',
    margin: '0 0 32px 0',
  },

  googleButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    color: '#4a5a7a',
    fontSize: '14px',
  },

  demoButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    border: '1px solid #6c5ce7',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  loginFooter: {
    fontSize: '12px',
    color: '#4a5a7a',
    margin: '24px 0 0 0',
    textAlign: 'center',
  },

  // ========== WEBSITE INPUT PAGE ==========
  inputContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    animation: 'fadeIn 0.5s ease-out',
  },

  inputCard: {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(108, 92, 231, 0.2)',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '500px',
    width: '90%',
  },

  inputTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },

  inputSubtitle: {
    fontSize: '16px',
    color: '#8b9dc3',
    margin: '0 0 32px 0',
  },

  websiteInput: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    backgroundColor: '#0f0f1a',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    marginBottom: '20px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },

  analyzeButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#6c5ce7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  // ========== ANALYZING PAGE ==========
  analyzingContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    animation: 'fadeIn 0.5s ease-out',
  },

  analyzingCard: {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(108, 92, 231, 0.2)',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center',
  },

  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(108, 92, 231, 0.2)',
    borderTop: '3px solid #6c5ce7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },

  analyzingTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 32px 0',
  },

  progressSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },

  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'opacity 0.3s ease',
  },

  stepIndicator: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },

  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '16px',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    transition: 'width 0.3s ease',
  },

  progressText: {
    fontSize: '14px',
    color: '#8b9dc3',
    margin: 0,
  },

  // ========== BRAND EXTRACTION PAGE ==========
  brandContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#0f0f1a',
    padding: '40px 20px',
    animation: 'fadeIn 0.5s ease-out',
    overflowY: 'auto',
  },

  brandContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },

  brandTitle: {
    fontSize: '36px',
    fontWeight: '700',
    margin: '0 0 40px 0',
    textAlign: 'center',
  },

  brandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
    marginBottom: '40px',
  },

  brandSection: {
    marginBottom: '32px',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#6c5ce7',
  },

  logoImage: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    padding: '12px',
  },

  colorPalette: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  colorSwatch: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    border: '2px solid rgba(108, 92, 231, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  brandTextarea: {
    width: '100%',
    padding: '16px',
    fontSize: '14px',
    backgroundColor: '#0f0f1a',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    fontFamily: 'inherit',
    minHeight: '120px',
    boxSizing: 'border-box',
    resize: 'none',
  },

  brandText: {
    fontSize: '16px',
    color: '#d0d8e8',
    margin: 0,
    lineHeight: '1.6',
  },

  brandActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '40px',
    flexWrap: 'wrap',
  },

  brandButton: {
    padding: '12px 28px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
  },

  // ========== MARKETING READY PAGE ==========
  readyContainer: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    padding: '40px 20px',
    animation: 'fadeIn 0.5s ease-out',
  },

  readyContent: {
    textAlign: 'center',
    maxWidth: '600px',
  },

  celebrationEmoji: {
    fontSize: '72px',
    marginBottom: '24px',
    animation: 'bounce 0.6s ease-in-out',
  },

  readyTitle: {
    fontSize: '40px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },

  readySubtitle: {
    fontSize: '18px',
    color: '#8b9dc3',
    margin: '0 0 40px 0',
    lineHeight: '1.6',
  },

  campaignCard: {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(108, 92, 231, 0.2)',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '40px',
    textAlign: 'left',
  },

  campaignIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },

  campaignTitle: {
    fontSize: '22px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },

  campaignDescription: {
    fontSize: '16px',
    color: '#8b9dc3',
    margin: '0 0 16px 0',
    lineHeight: '1.6',
  },

  campaignMeta: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
    color: '#6c5ce7',
  },

  // ========== DASHBOARD ==========
  dashboardContainer: {
    display: 'flex',
    width: '100%',
    height: '100vh',
    backgroundColor: '#0f0f1a',
    animation: 'fadeIn 0.5s ease-out',
  },

  sidebar: {
    width: '240px',
    backgroundColor: '#0f0f1a',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    boxSizing: 'border-box',
    flexShrink: 0,
  },

  dashboardMain: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
    padding: '80px 24px 40px',
  },

  dashboardCenter: {
    width: '100%',
    maxWidth: 640,
  },

  dashInput: {
    width: '100%',
    padding: '16px 52px 16px 20px',
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    color: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, background-color 0.2s',
    fontFamily: 'inherit',
  },

  dashSendBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#6c5ce7',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  },

  dashQuickAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    textAlign: 'left',
    fontFamily: 'inherit',
  },

  sidebarBrand: {
    marginBottom: '40px',
  },

  sidebarLogo: {
    fontSize: '28px',
    fontWeight: '900',
    margin: 0,
    background: 'linear-gradient(135deg, #6c5ce7 0%, #00cec9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  sidebarNav: {
    flex: 1,
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    marginBottom: '4px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    color: '#8b9dc3',
    fontSize: '14px',
    fontWeight: 500,
  },

  navIcon: {
    fontSize: '18px',
  },

  sidebarFooter: {
    borderTop: '1px solid rgba(108, 92, 231, 0.1)',
    paddingTop: '16px',
  },

  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  userEmail: {
    margin: 0,
    fontSize: '12px',
    color: '#4a5a7a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0f0f1a',
  },

  chatWelcome: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },

  chatWelcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },

  chatWelcomeSubtitle: {
    fontSize: '16px',
    color: '#8b9dc3',
    margin: '0 0 40px 0',
  },

  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    maxWidth: '800px',
  },

  quickActionButton: {
    padding: '20px',
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(108, 92, 231, 0.2)',
    borderRadius: '12px',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  },

  quickActionIcon: {
    fontSize: '24px',
  },

  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  chatMessage: {
    display: 'flex',
    marginBottom: '12px',
  },

  chatBubble: {
    maxWidth: '60%',
    padding: '12px 16px',
    borderRadius: '12px',
    wordWrap: 'break-word',
  },

  chatTime: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '4px',
    display: 'block',
  },

  typingIndicator: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },

  chatInputContainer: {
    padding: '20px 24px',
    borderTop: '1px solid rgba(108, 92, 231, 0.1)',
    backgroundColor: '#0f0f1a',
  },

  chatInputWrapper: {
    display: 'flex',
    gap: '12px',
    maxWidth: '800px',
    margin: '0 auto',
  },

  chatInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    transition: 'all 0.3s ease',
  },

  chatSendButton: {
    padding: '12px 20px',
    fontSize: '18px',
    backgroundColor: '#6c5ce7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default App;
