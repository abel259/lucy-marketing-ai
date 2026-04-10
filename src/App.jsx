// ============================================================
// Lucy Marketing AI — Full Redesign
// Dark/Gold theme inspired by the reference HTML
// Fonts: Instrument Serif + DM Sans
// ============================================================

import { useState, useEffect } from "react";

// ─── Theme tokens ───
const T = {
  bg: "#0e0d0b",
  bg2: "#161410",
  bg3: "#1e1b16",
  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  gold: "#c9a96e",
  goldLight: "#e2c48a",
  goldDim: "rgba(201,169,110,0.15)",
  text: "#f0ece4",
  text2: "#9c9383",
  text3: "#5e5a52",
  radius: 14,
  radiusSm: 8,
  font: "'DM Sans', sans-serif",
  serif: "'Instrument Serif', serif",
};

// ─── Reusable tiny icons ───
const PlusIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ChevronRight = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const SendIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const HomeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
const MailIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const CalIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const UsersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ClipIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>;
const MicIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const XIcon = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const GlobeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const ArrowRightIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckCircle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const SparkleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>;

// ─── Ambient glow (CSS injected once) ───
const injectGlobalStyles = () => {
  if (document.getElementById("lucy-global")) return;
  const style = document.createElement("style");
  style.id = "lucy-global";
  style.textContent = `
    @keyframes lucyPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes lucySpin { to{transform:rotate(360deg)} }
    @keyframes lucyFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    .lucy-fade { animation: lucyFadeUp 0.5s ease both; }
    .lucy-pulse { animation: lucyPulse 2s infinite; }
  `;
  document.head.appendChild(style);
};

// ─── Sidebar (shared across dashboard screens) ───
function Sidebar({ activePage, onNavigate, userName }) {
  const navItems = [
    { id: "home", label: "Home", icon: <HomeIcon /> },
    { id: "emails", label: "Emails", icon: <MailIcon /> },
    { id: "meetings", label: "Meetings", icon: <CalIcon /> },
  ];
  const initials = (userName || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: T.bg2,
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      fontFamily: T.font,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `linear-gradient(135deg, ${T.gold}, #8a6a3a)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.serif, fontSize: 14, color: T.bg, flexShrink: 0,
        }}>L</div>
        <div>
          <div style={{ fontFamily: T.serif, fontSize: 16, color: T.text, letterSpacing: "0.02em" }}>Lucy</div>
          <div style={{ fontSize: 11, color: T.text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {userName ? `${userName}'s Wor…` : "Workspace"}
          </div>
        </div>
      </div>

      {/* New chat */}
      <button onClick={() => onNavigate("home")} style={{
        margin: "14px 14px 10px", display: "flex", alignItems: "center", gap: 8,
        padding: "9px 14px", background: T.goldDim,
        border: `1px solid rgba(201,169,110,0.25)`, borderRadius: T.radiusSm,
        color: T.goldLight, fontSize: 13, fontFamily: T.font, fontWeight: 400,
        cursor: "pointer", textAlign: "left",
      }}>
        <PlusIcon /> New chat
        <span style={{ marginLeft: "auto" }}><ChevronRight size={12} /></span>
      </button>

      {/* Nav */}
      <nav style={{ padding: "6px 10px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.text3, padding: "10px 8px 4px" }}>Workspace</div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: T.radiusSm,
            color: activePage === item.id ? T.text : T.text2,
            background: activePage === item.id ? T.surface : "none",
            fontSize: 13.5, cursor: "pointer", border: "none",
            width: "100%", textAlign: "left", fontFamily: T.font,
          }}>
            <span style={{ opacity: activePage === item.id ? 1 : 0.6 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: T.text3, padding: "18px 8px 4px" }}>Chats</div>
      </nav>

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: 14, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #7a6040, #4a3a20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: T.goldLight, fontWeight: 500,
          }}>{initials}</div>
          <div style={{ fontSize: 12.5, color: T.text2 }}>{userName || "User"}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Landing page ───
function LandingScreen({ onGetStarted }) {
  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 900, height: 500,
        background: "radial-gradient(ellipse, rgba(180,140,80,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(14,13,11,0.85)", backdropFilter: "saturate(180%) blur(20px)",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: `linear-gradient(135deg, ${T.gold}, #8a6a3a)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.serif, fontSize: 14, color: T.bg,
            }}>L</div>
            <span style={{ fontFamily: T.serif, fontSize: 18, color: T.text, letterSpacing: "0.02em" }}>Lucy</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Product", "Pricing", "Docs"].map(t => (
              <a key={t} href="#" style={{ fontSize: 14, color: T.text2, textDecoration: "none", fontWeight: 400 }}>{t}</a>
            ))}
            <button onClick={onGetStarted} style={{
              fontSize: 14, fontWeight: 500, color: T.bg, background: T.gold,
              padding: "7px 18px", borderRadius: T.radiusSm, border: "none", cursor: "pointer",
            }}>Get started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 660, margin: "0 auto", padding: "160px 24px 48px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div className="lucy-fade" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: T.gold, marginBottom: 18, opacity: 0.9 }}>
          <span className="lucy-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold, display: "inline-block" }} />
          AI-Powered Marketing
        </div>
        <h1 className="lucy-fade" style={{ fontFamily: T.serif, fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 400, lineHeight: 1.12, color: T.text, letterSpacing: "-0.01em", marginBottom: 16 }}>
          Your entire marketing team,{" "}<em style={{ fontStyle: "italic", color: T.goldLight }}>in one AI.</em>
        </h1>
        <p className="lucy-fade" style={{ fontSize: 16, color: T.text2, lineHeight: 1.65, fontWeight: 300, maxWidth: 480, margin: "0 auto 36px" }}>
          Lucy connects to your tools, learns your brand, and runs campaigns — all on autopilot.
        </p>
        <div className="lucy-fade" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onGetStarted} style={{
            fontSize: 15, fontWeight: 500, color: T.bg, background: T.gold,
            padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer",
          }}>Start for free</button>
          <button style={{
            fontSize: 15, fontWeight: 400, color: T.text2, background: "transparent",
            padding: "12px 28px", borderRadius: 10, border: `1px solid ${T.borderStrong}`, cursor: "pointer",
          }}>See how it works</button>
        </div>
        <p className="lucy-fade" style={{ fontSize: 13, color: T.text3, marginTop: 14 }}>Free plan available. No credit card needed.</p>
      </section>

      {/* Tool badges */}
      <section className="lucy-fade" style={{ padding: "32px 24px 64px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: T.text3, fontWeight: 400, marginBottom: 20 }}>Connects to your tools</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {["Slack", "Google Meet", "Shopify", "Figma", "Google Docs", "Klaviyo", "Notion"].map(name => (
              <div key={name} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10,
                padding: "9px 16px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, opacity: 0.6 }} />
                <span style={{ fontSize: 13, fontWeight: 400, color: T.text2 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slack + Klaviyo story */}
      <section style={{ background: T.bg2, padding: "100px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: T.gold, marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>Lucy lives in your tools</p>
            <h2 style={{ fontFamily: T.serif, fontSize: 38, fontWeight: 400, letterSpacing: "-0.01em", margin: "0 0 12px", color: T.text }}>
              From conversation to <em style={{ fontStyle: "italic", color: T.goldLight }}>campaign</em> in seconds
            </h2>
            <p style={{ fontSize: 15, color: T.text2, maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>Lucy watches your Slack, reads your docs, and pushes campaigns directly into Klaviyo.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0, alignItems: "start" }}>
            {/* Slack panel */}
            <div style={{ background: T.bg3, borderRadius: T.radius, overflow: "hidden", border: `1px solid ${T.borderStrong}` }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: T.goldDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.gold }}>S</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}># marketing</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>3 members</div>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                {[
                  { name: "Sarah", time: "10:42 AM", msg: "Hey team, we just launched the new summer collection on Shopify. We need an email campaign ASAP." },
                  { name: "Mike", time: "10:44 AM", msg: "@Lucy can you handle this? Pull the new products and draft something." },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 6, background: T.surface, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: T.text2 }}>{m.name[0]}</div>
                    <div>
                      <div style={{ marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{m.name}</span>
                        <span style={{ fontSize: 11, color: T.text3, marginLeft: 8 }}>{m.time}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>{m.msg}</div>
                    </div>
                  </div>
                ))}
                {/* Lucy */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: `linear-gradient(135deg, ${T.gold}, #8a6a3a)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: T.bg }}>L</div>
                  <div>
                    <div style={{ marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Lucy</span>
                      <span style={{ fontSize: 10, fontWeight: 500, color: T.gold, background: T.goldDim, padding: "1px 6px", borderRadius: 4, marginLeft: 6 }}>AI</span>
                      <span style={{ fontSize: 11, color: T.text3, marginLeft: 8 }}>10:44 AM</span>
                    </div>
                    <div style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55 }}>On it. I pulled 12 new products from your Shopify store:</div>
                    <div style={{ marginTop: 10, background: T.surface, borderRadius: 10, padding: 14, border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.6, color: T.text2 }}>
                      <div style={{ fontWeight: 500, color: T.text, marginBottom: 6 }}>Summer Collection Launch</div>
                      <div>3-email sequence over 7 days</div>
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: T.text2, background: T.surface, padding: "3px 8px", borderRadius: 5 }}>Open: 36%</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: T.gold, background: T.goldDim, padding: "3px 8px", borderRadius: 5 }}>Ready to push</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", paddingTop: 120 }}>
              <svg width="40" height="20" viewBox="0 0 40 20" fill="none"><path d="M0 10h32m0 0l-6-6m6 6l-6 6" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>

            {/* Klaviyo panel */}
            <div style={{ background: T.bg3, borderRadius: T.radius, overflow: "hidden", border: `1px solid ${T.borderStrong}` }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.bg }}>K</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>Klaviyo</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>Campaign created by Lucy</div>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: T.text }}>Summer Collection Launch</div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: T.gold, background: T.goldDim, padding: "3px 8px", borderRadius: 5 }}>Scheduled</span>
                </div>
                <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                  {[{ l: "Recipients", v: "8,432" }, { l: "Emails", v: "3" }, { l: "Duration", v: "7 days" }].map(s => (
                    <div key={s.l}><div style={{ fontSize: 11, color: T.text3, marginBottom: 2 }}>{s.l}</div><div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{s.v}</div></div>
                  ))}
                </div>
                {[
                  { day: "Day 1", subj: "Summer just dropped", status: "Scheduled", active: true },
                  { day: "Day 3", subj: "People are loving these", status: "Draft ready", active: false },
                  { day: "Day 7", subj: "Last chance: 10% off", status: "Draft ready", active: false },
                ].map((e, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: e.active ? T.gold : T.text3, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: T.text3, marginBottom: 2 }}>{e.day}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{e.subj}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: e.active ? T.gold : T.text3, background: e.active ? T.goldDim : T.surface, padding: "3px 8px", borderRadius: 5 }}>{e.status}</span>
                    </div>
                    {i < 2 && <div style={{ width: 1, height: 10, background: T.border, marginLeft: 3 }} />}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <div style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: T.radiusSm, background: T.gold, color: T.bg, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Launch campaign</div>
                  <div style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: T.radiusSm, border: `1px solid ${T.border}`, color: T.text2, fontSize: 13, fontWeight: 400, cursor: "pointer" }}>Edit in Klaviyo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "100px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: T.gold, marginBottom: 8, textAlign: "center", letterSpacing: "0.08em", textTransform: "uppercase" }}>How it works</p>
          <h2 style={{ fontFamily: T.serif, fontSize: 36, fontWeight: 400, textAlign: "center", margin: "0 0 56px", color: T.text }}>Up and running in <em style={{ fontStyle: "italic", color: T.goldLight }}>minutes</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {[
              { num: "1", title: "Connect your tools", desc: "Link Slack, Shopify, Klaviyo, and more. Lucy syncs your products, conversations, and brand assets." },
              { num: "2", title: "Lucy learns your brand", desc: "She reads your docs, scans your store, and builds a brand profile — voice, colors, audience." },
              { num: "3", title: "Campaigns on autopilot", desc: "Lucy spots opportunities, drafts campaigns, and pushes them to Klaviyo. You just approve." },
            ].map(step => (
              <div key={step.num} style={{ background: T.bg3, borderRadius: T.radius, padding: 28, border: `1px solid ${T.border}` }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${T.gold}, #8a6a3a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.bg, marginBottom: 18 }}>{step.num}</div>
                <h3 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 400, margin: "0 0 8px", color: T.text }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px 100px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 40, fontWeight: 400, margin: "0 0 16px", color: T.text }}>Ready to automate your <em style={{ fontStyle: "italic", color: T.goldLight }}>marketing?</em></h2>
        <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.65, margin: "0 0 32px", fontWeight: 300 }}>Join thousands of brands using Lucy to create better campaigns in less time.</p>
        <button onClick={onGetStarted} style={{ fontSize: 15, fontWeight: 500, color: T.bg, background: T.gold, padding: "13px 32px", borderRadius: 10, border: "none", cursor: "pointer" }}>Get started for free</button>
        <p style={{ fontSize: 13, color: T.text3, marginTop: 14 }}>No credit card required</p>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: "32px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.serif, fontSize: 15, color: T.text, letterSpacing: "0.02em" }}>Lucy</span>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Docs", "Support"].map(t => (
              <a key={t} href="#" style={{ fontSize: 13, color: T.text3, textDecoration: "none" }}>{t}</a>
            ))}
          </div>
          <span style={{ fontSize: 13, color: T.text3 }}>2026 Lucy AI</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Website Input Screen ───
function WebsiteInputScreen({ onSubmit, websiteUrl, setWebsiteUrl }) {
  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(180,140,80,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", maxWidth: 520, width: "100%", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div className="lucy-fade" style={{ marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${T.gold}, #8a6a3a)`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.serif, fontSize: 22, color: T.bg, marginBottom: 20 }}>L</div>
          <h1 style={{ fontFamily: T.serif, fontSize: 32, fontWeight: 400, color: T.text, marginBottom: 10 }}>Enter your <em style={{ fontStyle: "italic", color: T.goldLight }}>website</em></h1>
          <p style={{ fontSize: 15, color: T.text2, fontWeight: 300 }}>Lucy will analyze your brand, colors, and voice to personalize everything.</p>
        </div>
        <div className="lucy-fade" style={{
          display: "flex", gap: 10, background: T.bg3, border: `1px solid ${T.borderStrong}`,
          borderRadius: T.radius, padding: "6px 6px 6px 18px", alignItems: "center",
        }}>
          <span style={{ color: T.text3 }}><GlobeIcon /></span>
          <input
            type="text" placeholder="https://yourwebsite.com"
            value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && websiteUrl.trim() && onSubmit()}
            style={{
              flex: 1, background: "none", border: "none", outline: "none", color: T.text,
              fontFamily: T.font, fontSize: 15, fontWeight: 300, padding: "12px 0",
            }}
          />
          <button onClick={() => websiteUrl.trim() && onSubmit()} style={{
            padding: "10px 20px", background: T.gold, color: T.bg, border: "none",
            borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            Analyze <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Analyzing Screen ───
function AnalyzingScreen({ websiteUrl }) {
  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(180,140,80,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, border: `2px solid ${T.gold}`,
          borderTopColor: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center",
          animation: "lucySpin 1s linear infinite", marginBottom: 28,
        }} />
        <h2 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 400, color: T.text, marginBottom: 10 }}>Analyzing <em style={{ fontStyle: "italic", color: T.goldLight }}>{websiteUrl.replace(/https?:\/\//, "")}</em></h2>
        <p style={{ fontSize: 14, color: T.text2, fontWeight: 300, lineHeight: 1.6 }}>Lucy is reading your website, extracting your brand colors, voice, and key information...</p>
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          {["Scanning pages", "Extracting brand colors", "Analyzing voice & tone", "Building your profile"].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: T.surface, borderRadius: T.radiusSm, border: `1px solid ${T.border}` }}>
              <div className="lucy-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold }} />
              <span style={{ fontSize: 13.5, color: T.text2 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Brand Extraction Screen ───
function BrandExtractionScreen({ brandData, onContinue }) {
  const [colors, setColors] = useState(brandData?.brandColors || ["#c9a96e", "#1d1d1f", "#f0ece4"]);

  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(180,140,80,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 560, width: "100%", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div className="lucy-fade" style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ marginBottom: 16 }}><CheckCircle /></div>
          <h2 style={{ fontFamily: T.serif, fontSize: 30, fontWeight: 400, color: T.text, marginBottom: 8 }}>We found your <em style={{ fontStyle: "italic", color: T.goldLight }}>brand</em></h2>
          <p style={{ fontSize: 14, color: T.text2, fontWeight: 300 }}>Review and adjust your brand details. Click any color to edit.</p>
        </div>

        <div className="lucy-fade" style={{ background: T.bg3, borderRadius: T.radius, border: `1px solid ${T.borderStrong}`, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Brand Colors</div>
          <div style={{ display: "flex", gap: 10 }}>
            {colors.map((c, i) => (
              <div key={i} style={{ position: "relative", cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: c, border: `2px solid ${T.borderStrong}` }} />
                <input type="color" value={c} onChange={e => { const n = [...colors]; n[i] = e.target.value; setColors(n); }}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
                <div style={{ fontSize: 11, color: T.text3, textAlign: "center", marginTop: 4 }}>{c}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lucy-fade" style={{ background: T.bg3, borderRadius: T.radius, border: `1px solid ${T.borderStrong}`, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Brand Voice</div>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, fontWeight: 300 }}>{brandData?.brandVoice || "Professional, approachable, and confident. Focuses on clear value propositions with a technical edge."}</p>
        </div>

        <button className="lucy-fade" onClick={onContinue} style={{
          width: "100%", padding: "13px 0", background: T.gold, color: T.bg,
          border: "none", borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Continue to Lucy <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard (Main Chat Screen) ───
function DashboardScreen({ userName }) {
  const [activePage, setActivePage] = useState("home");
  const [inputVal, setInputVal] = useState("");
  const [showInfo, setShowInfo] = useState(true);

  const quickPrompts = [
    { icon: <AlertIcon />, text: "What urgent items need my attention this morning?" },
    { icon: <UsersIcon />, text: "Prep me for today's meetings" },
    { icon: <MailIcon />, text: "What emails from today do I need to respond to?" },
  ];

  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", display: "flex", position: "relative" }}>
      {/* Ambient */}
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(180,140,80,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <Sidebar activePage={activePage} onNavigate={setActivePage} userName={userName} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px 40px", position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <div className="lucy-fade" style={{ textAlign: "center", maxWidth: 560, marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: T.gold, marginBottom: 18, opacity: 0.9 }}>
            <span className="lucy-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: T.gold, display: "inline-block" }} />
            Marketing Intelligence
          </div>
          <h1 style={{ fontFamily: T.serif, fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 400, lineHeight: 1.15, color: T.text, letterSpacing: "-0.01em", marginBottom: 12 }}>
            How can I <em style={{ fontStyle: "italic", color: T.goldLight }}>help</em> you today?
          </h1>
          <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.65, fontWeight: 300 }}>Your AI-powered marketing assistant. Ask about campaigns, emails, meetings, or anything on your plate.</p>
        </div>

        {/* Input card */}
        <div className="lucy-fade" style={{
          width: "100%", maxWidth: 620, background: T.bg3,
          border: `1px solid ${T.borderStrong}`, borderRadius: T.radius,
          overflow: "hidden", boxShadow: `0 2px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,169,110,0.04) inset`,
          marginBottom: 20,
        }}>
          <div style={{ padding: "18px 20px 10px" }}>
            <textarea rows={2} placeholder="Ask me anything…" value={inputVal} onChange={e => setInputVal(e.target.value)}
              style={{ width: "100%", background: "none", border: "none", outline: "none", color: T.text, fontFamily: T.font, fontSize: 15, fontWeight: 300, lineHeight: 1.6, resize: "none", minHeight: 52 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, color: T.text2, cursor: "pointer" }}>
                <SparkleIcon /> Auto <ChevronRight size={10} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: T.text3, borderRadius: 6 }}><ClipIcon /></button>
              <button style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: T.text3, borderRadius: 6 }}><MicIcon /></button>
              <button style={{ width: 34, height: 34, borderRadius: 8, background: T.gold, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><SendIcon /></button>
            </div>
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{ width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", gap: 6, marginBottom: 32 }}>
          {quickPrompts.map((p, i) => (
            <div key={i} className="lucy-fade" onClick={() => setInputVal(p.text)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 10, cursor: "pointer", transition: "all 0.18s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: T.goldDim, display: "flex", alignItems: "center", justifyContent: "center", color: T.gold }}>{p.icon}</div>
                <span style={{ fontSize: 13.5, color: T.text2 }}>{p.text}</span>
              </div>
              <span style={{ color: T.text3 }}><ChevronRight /></span>
            </div>
          ))}
        </div>

        {/* Info card */}
        {showInfo && (
          <div className="lucy-fade" style={{
            width: "100%", maxWidth: 620, display: "flex", alignItems: "flex-start", gap: 14,
            padding: "16px 18px", background: "rgba(201,169,110,0.05)",
            border: "1px solid rgba(201,169,110,0.15)", borderRadius: T.radius,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: T.goldDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: T.text, marginBottom: 2 }}>See what you can do with Lucy</div>
              <div style={{ fontSize: 12.5, color: T.gold, cursor: "pointer" }}>Read about the top use cases →</div>
            </div>
            <button onClick={() => setShowInfo(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.text3, padding: 2 }}><XIcon /></button>
          </div>
        )}
      </main>

      {/* Status bar */}
      <div style={{
        position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 16px", background: T.bg3, border: `1px solid ${T.borderStrong}`,
        borderRadius: 100, fontSize: 12.5, color: T.text2,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)", zIndex: 100,
      }}>
        <div className="lucy-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4caf7d" }} />
        Lucy is active
      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandData, setBrandData] = useState(null);
  const userName = "Abel Solomon";

  useEffect(() => { injectGlobalStyles(); }, []);

  // Analyze website when entering analyzing screen
  useEffect(() => {
    if (currentScreen === "analyzing") {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: websiteUrl.startsWith("http") ? websiteUrl : "https://" + websiteUrl }),
          });
          const data = await res.json();
          if (data && data.brandName) {
            setBrandData(data);
          } else {
            setBrandData({ brandName: websiteUrl.replace(/https?:\/\//, ""), brandColors: ["#c9a96e", "#1d1d1f", "#f0ece4"], brandVoice: "Professional and approachable with a confident tone." });
          }
        } catch {
          setBrandData({ brandName: websiteUrl.replace(/https?:\/\//, ""), brandColors: ["#c9a96e", "#1d1d1f", "#f0ece4"], brandVoice: "Professional and approachable with a confident tone." });
        }
        setCurrentScreen("brand-extraction");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, websiteUrl]);

  if (currentScreen === "landing") {
    return <LandingScreen onGetStarted={() => setCurrentScreen("website-input")} />;
  }
  if (currentScreen === "website-input") {
    return <WebsiteInputScreen websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl} onSubmit={() => setCurrentScreen("analyzing")} />;
  }
  if (currentScreen === "analyzing") {
    return <AnalyzingScreen websiteUrl={websiteUrl} />;
  }
  if (currentScreen === "brand-extraction") {
    return <BrandExtractionScreen brandData={brandData} onContinue={() => setCurrentScreen("dashboard")} />;
  }
  if (currentScreen === "dashboard") {
    return <DashboardScreen userName={userName} />;
  }

  return <LandingScreen onGetStarted={() => setCurrentScreen("website-input")} />;
}
