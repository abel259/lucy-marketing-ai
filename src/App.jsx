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
      colors: ['#c8e632', '#1a1a2e', '#2d2d50', '#111111', '#e8e8f0'],
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
        colors: data.brandColors || ['#6c5ce7', '#a29bfe', '#dfe6e9', '#2d3436', '#636e72'],
        logo: mockBrandExtraction(url).logo,
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

  const handleQuickAction = (action) => {
    setChatInput(action);
  };

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
              {brandData?.colors.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.colorSwatch,
                    backgroundColor: color,
                  }}
                  title={color}
                ></div>
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

  const renderDashboard = () => (
    <div style={styles.dashboardContainer}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <h2 style={styles.sidebarLogo}>Lucy</h2>
        </div>

        <nav style={styles.sidebarNav}>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>🏠</span>
            <span>Home</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>✉️</span>
            <span>Emails</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>📊</span>
            <span>Campaigns</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>📈</span>
            <span>Analytics</span>
          </div>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userProfile}>
            <img
              src={user?.picture || 'https://via.placeholder.com/32'}
              alt="User"
              style={styles.userAvatar}
            />
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user?.name || 'User'}</p>
              <p style={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.chatContainer}>
        {chatMessages.length === 0 ? (
          <div style={styles.chatWelcome}>
            <h2 style={styles.chatWelcomeTitle}>How can I help?</h2>
            <p style={styles.chatWelcomeSubtitle}>
              Ask me anything about your marketing strategy
            </p>

            <div style={styles.quickActions}>
              <button
                style={styles.quickActionButton}
                onClick={() =>
                  handleQuickAction('What urgent marketing tasks need attention?')
                }
              >
                <span style={styles.quickActionIcon}>⚡</span>
                <span>What urgent marketing tasks need attention?</span>
              </button>
              <button
                style={styles.quickActionButton}
                onClick={() => handleQuickAction('Create an email campaign')}
              >
                <span style={styles.quickActionIcon}>✉️</span>
                <span>Create an email campaign</span>
              </button>
              <button
                style={styles.quickActionButton}
                onClick={() => handleQuickAction('Analyze my competitors')}
              >
                <span style={styles.quickActionIcon}>🔍</span>
                <span>Analyze my competitors</span>
              </button>
              <button
                style={styles.quickActionButton}
                onClick={() => handleQuickAction('Prep social media content')}
              >
                <span style={styles.quickActionIcon}>📱</span>
                <span>Prep social media content</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.chatMessages}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.chatMessage,
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.chatBubble,
                    backgroundColor:
                      msg.sender === 'user' ? '#6c5ce7' : '#1a1a2e',
                    borderLeft:
                      msg.sender === 'ai'
                        ? '3px solid #00cec9'
                        : '3px solid #6c5ce7',
                  }}
                >
                  <p>{msg.text}</p>
                  <span style={styles.chatTime}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoadingChat && (
              <div style={styles.chatMessage}>
                <div style={{ ...styles.chatBubble, backgroundColor: '#1a1a2e' }}>
                  <div style={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        <div style={styles.chatInputContainer}>
          <div style={styles.chatInputWrapper}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoadingChat) {
                  handleSendMessage();
                }
              }}
              style={styles.chatInput}
              disabled={isLoadingChat}
            />
            <button
              style={{
                ...styles.chatSendButton,
                opacity: isLoadingChat ? 0.5 : 1,
                cursor: isLoadingChat ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSendMessage}
              disabled={isLoadingChat}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
    width: '280px',
    backgroundColor: '#1a1a2e',
    borderRight: '1px solid rgba(108, 92, 231, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    boxSizing: 'border-box',
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
    gap: '12px',
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#8b9dc3',
    fontSize: '16px',
  },

  navIcon: {
    fontSize: '20px',
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
