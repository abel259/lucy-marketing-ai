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

  const renderLanding = () => (
    <div style={styles.landingContainer}>
      {/* Background orbs */}
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>
      <div style={styles.orb3}></div>

      {/* Content */}
      <div style={styles.landingContent}>
        <div style={styles.logoSection}>
          <h1 style={styles.logo}>Lucy</h1>
          <p style={styles.tagline}>Your AI Marketing Assistant</p>
        </div>

        <div style={styles.heroSection}>
          <h2 style={styles.heroTitle}>Marketing Excellence, Powered by AI</h2>
          <p style={styles.heroDescription}>
            Lucy analyzes your brand, builds campaigns, and delivers AI-powered insights
            to help you grow faster.
          </p>

          <div style={styles.valuePropGrid}>
            <div style={styles.valueProp}>
              <div style={styles.valuePropIcon}>📊</div>
              <h3>Analyze Your Brand</h3>
              <p>Deep insights into your brand identity and market position</p>
            </div>
            <div style={styles.valueProp}>
              <div style={styles.valuePropIcon}>✉️</div>
              <h3>Build Campaigns</h3>
              <p>Create targeted campaigns that drive results</p>
            </div>
            <div style={styles.valueProp}>
              <div style={styles.valuePropIcon}>🤖</div>
              <h3>AI-Powered Insights</h3>
              <p>Get actionable recommendations from advanced AI</p>
            </div>
          </div>

          <button
            style={styles.ctaButton}
            onClick={() => setScreen('login')}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5a4ab3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6c5ce7';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );

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
    overflow: 'hidden',
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
