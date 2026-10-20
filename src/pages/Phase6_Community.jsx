import { useState, useEffect, useCallback } from "react";
import { getCommunityPosts, createCommunityPost } from '../api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #06080f; --surface: #0d1220; --surface2: #131a2e;
    --border: #1c2a44; --accent: #38bdf8; --accent2: #818cf8;
    --accent3: #fb7185; --accent4: #34d399; --accent5: #f59e0b;
    --text: #f0f4ff; --muted: #64748b; --danger: #f43f5e;
  }

  .p6-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  
  /* ACCESSIBILITY */
  .p6-skip-link {
    position: fixed; top: -100px; left: 16px; z-index: 9999;
    background: var(--accent2); color: white; padding: 10px 20px;
    border-radius: 8px; font-weight: 700; transition: top 0.2s;
    text-decoration: none;
  }
  .p6-skip-link:focus { top: 16px; outline: 3px solid white; }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  :focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-delay: -1ms !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0s !important;
    }
  }

  .p6-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 70% 50% at 0% 10%, rgba(56,189,248,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 100% 60%, rgba(129,140,248,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(52,211,153,0.05) 0%, transparent 60%); }

  .p6-header { position: relative; z-index: 10; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); background: rgba(6,8,15,0.9); backdrop-filter: blur(14px); }
  .p6-logo { display: flex; align-items: center; gap: 10px; }
  .p6-logo-icon { width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 16px rgba(56,189,248,0.35); }
  .p6-logo-text { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .p6-header-right { display: flex; align-items: center; gap: 12px; }
  .p6-phase-badge { font-size: 11px; padding: 4px 12px; border-radius: 100px; background: rgba(251,113,133,0.12); border: 1px solid rgba(251,113,133,0.28); color: var(--accent3); font-weight: 600; letter-spacing: 0.5px; }
  .p6-user-pill { display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 8px; border-radius: 100px; background: var(--surface2); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; font-size: 13px; font-weight: 600; }
  .p6-user-pill:hover { border-color: var(--accent2); }
  .p6-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }

  .p6-nav { position: relative; z-index: 5; display: flex; gap: 4px; padding: 16px 32px; border-bottom: 1px solid var(--border); background: rgba(6,8,15,0.7); backdrop-filter: blur(10px); overflow-x: auto; scrollbar-width: none; }
  .p6-nav::-webkit-scrollbar { display: none; }
  .p6-nav-btn { padding: 9px 18px; border-radius: 12px; border: 1px solid transparent; background: none; color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 7px; }
  .p6-nav-btn:hover { background: var(--surface2); color: var(--text); }
  .p6-nav-btn.active { background: rgba(129,140,248,0.15); border-color: rgba(129,140,248,0.3); color: var(--accent2); }

  .p6-main { position: relative; z-index: 5; max-width: 1140px; margin: 0 auto; padding: 28px 24px 56px; }

  .p6-card { background: var(--surface); border: 1px solid var(--border); border-radius: 22px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.3); margin-bottom: 20px; }
  .p6-card-header { padding: 15px 22px; border-bottom: 1px solid var(--border); background: var(--surface2); display: flex; align-items: center; justify-content: space-between; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }

  /* DASHBOARD */
  .p6-dash-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  @media(max-width:780px){ .p6-dash-grid { grid-template-columns: repeat(2,1fr); } }
  .p6-stat-tile { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 20px 18px; display: flex; flex-direction: column; gap: 8px; transition: all 0.25s; cursor: default; }
  .p6-stat-tile:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.3); border-color: var(--accent2); }
  .p6-tile-icon { font-size: 26px; }
  .p6-tile-val { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; line-height: 1; }
  .p6-tile-label { font-size: 12px; color: var(--muted); }
  .p6-tile-change { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 100px; width: fit-content; }
  .p6-tile-change.up { background: rgba(52,211,153,0.12); color: var(--accent4); }
  .p6-tile-change.neutral { background: rgba(56,189,248,0.1); color: var(--accent); }

  .p6-dash-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media(max-width:700px){ .p6-dash-bottom { grid-template-columns:1fr; } }

  .p6-activity { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
  .p6-act-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 14px; background: var(--surface2); border: 1px solid var(--border); animation: fadeUp 0.3s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
  .p6-act-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .p6-act-body { flex: 1; }
  .p6-act-text { font-size: 13px; color: var(--text); line-height: 1.5; }
  .p6-act-text strong { color: var(--accent2); }
  .p6-act-time { font-size: 11px; color: var(--muted); margin-top: 3px; }

  .p6-phases { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .p6-phase-row { display: flex; align-items: center; gap: 12px; }
  .p6-phase-label { font-size: 12px; font-weight: 600; min-width: 100px; color: var(--text); }
  .p6-phase-bar { flex: 1; height: 8px; border-radius: 100px; background: var(--border); overflow: hidden; }
  .p6-phase-fill { height: 100%; border-radius: 100px; transition: width 1.2s cubic-bezier(0.34,1.2,0.64,1); }
  .p6-phase-pct { font-size: 12px; font-weight: 700; min-width: 36px; text-align: right; }

  /* PROFILE */
  .p6-profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
  @media(max-width:780px){ .p6-profile-layout { grid-template-columns:1fr; } }

  .p6-profile-hero { padding: 28px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px; border-bottom: 1px solid var(--border); }
  .p6-profile-avatar { width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; border: 3px solid var(--accent2); box-shadow: 0 0 24px rgba(129,140,248,0.3); position: relative; cursor: pointer; font-family: 'Syne', sans-serif; }
  .p6-avatar-edit { position: absolute; bottom: 0; right: 0; width: 24px; height: 24px; border-radius: 50%; background: var(--accent2); display: flex; align-items: center; justify-content: center; font-size: 11px; }
  .p6-profile-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
  .p6-profile-handle { font-size: 13px; color: var(--muted); }
  .p6-disability-badge { padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; }
  .p6-profile-bio { font-size: 13px; color: var(--muted); line-height: 1.6; text-align: center; padding: 0 8px; }

  .p6-profile-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; padding: 18px 20px; border-bottom: 1px solid var(--border); }
  .p6-ps-tile { text-align: center; padding: 12px 8px; border-radius: 12px; background: var(--surface2); border: 1px solid var(--border); }
  .p6-ps-val { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:var(--accent2); }
  .p6-ps-label { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }

  .p6-profile-badges { padding: 16px 20px; }
  .p6-badges-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px; }
  .p6-badges-grid { display:flex; flex-wrap:wrap; gap:8px; }
  .p6-badge { padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }

  /* SKILLS */
  .p6-skills { padding: 16px 20px; border-top: 1px solid var(--border); }
  .p6-skills-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px; }
  .p6-skills-grid { display:flex; flex-wrap:wrap; gap:8px; }
  .p6-skill-chip { padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); color: var(--accent); }

  /* SETTINGS */
  .p6-settings { padding: 22px 24px; display: flex; flex-direction: column; gap: 20px; }
  .p6-field { display: flex; flex-direction: column; gap: 6px; }
  .p6-label { font-size: 12px; color: var(--muted); font-weight: 600; }
  .p6-input, .p6-select, .p6-textarea { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; color: var(--text); padding: 11px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; width: 100%; transition: border-color 0.2s; }
  .p6-input:focus, .p6-select:focus, .p6-textarea:focus { outline: none; border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(129,140,248,0.1); }
  .p6-textarea { resize: none; min-height: 80px; line-height: 1.5; }
  .p6-select option { background: var(--surface2); }

  .p6-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; background: var(--surface2); border: 1px solid var(--border); }
  .p6-toggle-info { display: flex; flex-direction:column; gap:2px; }
  .p6-toggle-title { font-size: 13px; font-weight: 600; }
  .p6-toggle-desc  { font-size: 11px; color: var(--muted); }
  .p6-toggle { width: 44px; height: 24px; border-radius: 100px; border: none; cursor: pointer; position: relative; transition: all 0.3s; flex-shrink: 0; }
  .p6-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: all 0.3s; }
  .p6-toggle.on { background: var(--accent4); }
  .p6-toggle.off { background: var(--border); }
  .p6-toggle.on::after { left: 23px; }

  /* COMMUNITY */
  .p6-community-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
  @media(max-width:820px){ .p6-community-layout { grid-template-columns:1fr; } }

  .p6-post { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 20px; margin-bottom: 16px; transition: all 0.2s; }
  .p6-post:hover { border-color: rgba(129,140,248,0.3); }
  .p6-post-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
  .p6-post-meta { flex: 1; }
  .p6-post-name { font-size: 14px; font-weight: 700; color: var(--text); }
  .p6-post-sub  { font-size: 12px; color: var(--muted); display:flex; gap:8px; align-items:center; margin-top:2px; }
  .p6-post-tag { padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; }
  .p6-post-body { font-size: 14px; color: var(--text); line-height: 1.7; margin-bottom: 14px; }
  .p6-post-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .p6-post-btn { padding: 6px 14px; border-radius: 100px; border: 1px solid var(--border); background: none; color: var(--muted); font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 5px; }
  .p6-post-btn:hover { border-color: var(--accent2); color: var(--accent2); }
  .p6-post-btn.liked { background: rgba(251,113,133,0.1); border-color: var(--accent3); color: var(--accent3); }

  .p6-new-post { padding: 18px 20px; border-bottom: 1px solid var(--border); }
  .p6-new-post-row { display: flex; gap: 12px; align-items: flex-start; }
  .p6-new-textarea { flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 14px; color: var(--text); padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; resize: none; min-height: 60px; transition: border-color 0.2s; line-height: 1.5; }
  .p6-new-textarea:focus { outline: none; border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(129,140,248,0.1); }
  .p6-new-textarea::placeholder { color: var(--muted); }

  .p6-sidebar { display: flex; flex-direction: column; gap: 16px; }
  .p6-sidebar-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
  .p6-sidebar-header { padding: 12px 18px; border-bottom: 1px solid var(--border); background: var(--surface2); font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; }
  .p6-member-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
  .p6-member { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
  .p6-member:hover { background: var(--surface2); border-color: var(--border); }
  .p6-member-info { flex: 1; }
  .p6-member-name { font-size: 13px; font-weight: 600; }
  .p6-member-type { font-size: 11px; color: var(--muted); }
  .p6-online-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent4); box-shadow: 0 0 6px var(--accent4); }
  .p6-trend-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
  .p6-trend-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
  .p6-trend-item:hover { background: var(--surface2); }
  .p6-trend-num { font-size: 12px; color: var(--muted); min-width: 20px; }
  .p6-trend-tag { font-size: 13px; color: var(--accent2); font-weight: 600; flex: 1; }
  .p6-trend-count { font-size: 11px; color: var(--muted); }

  .p6-btn { padding: 11px 20px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700; font-family: 'Syne', sans-serif; font-size: 13px; transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
  .p6-btn-primary { background: linear-gradient(135deg, var(--accent2), var(--accent)); color: white; }
  .p6-btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(129,140,248,0.3); }
  .p6-btn-green { background: linear-gradient(135deg, var(--accent4), var(--accent)); color: #06080f; }
  .p6-btn-green:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(52,211,153,0.3); }
  .p6-btn-outline { background: var(--surface2); border: 1px solid var(--border); color: var(--muted); }
  .p6-btn-outline:hover { border-color: var(--accent2); color: var(--text); }

  .p6-complete { position: relative; z-index: 5; max-width: 1140px; margin: 0 auto 28px; padding: 0 24px; }
  .p6-complete-inner { padding: 28px 32px; border-radius: 22px; background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(56,189,248,0.08), rgba(129,140,248,0.1)); border: 1px solid rgba(52,211,153,0.25); display: flex; align-items: center; gap: 20px; flex-wrap: wrap; box-shadow: 0 0 48px rgba(52,211,153,0.08); }
  .p6-complete-icon { font-size: 52px; flex-shrink:0; animation: celebratePop 1s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes celebratePop { 0%{transform:scale(0) rotate(-20deg);} 100%{transform:scale(1) rotate(0);} }
  .p6-complete-text { flex: 1; min-width: 200px; }
  .p6-complete-text h3 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 6px; background: linear-gradient(90deg, var(--accent4), var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .p6-complete-text p { font-size: 14px; color: var(--muted); line-height: 1.6; }
  .p6-phase-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .p6-phase-pill { padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3); color: var(--accent4); display: flex; align-items: center; gap: 6px; }

  .p6-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); padding:12px 24px; border-radius:100px; font-size:13px; font-weight:600; z-index:999; box-shadow:0 8px 32px rgba(0,0,0,0.4); animation:toastIn 0.3s ease; white-space:nowrap; display:flex; align-items:center; gap:8px; }
  .p6-toast.green{background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);color:var(--accent4);}
  .p6-toast.blue {background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:var(--accent);}
  .p6-toast.red  {background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3); color:var(--danger);}
  .p6-toast.gold {background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);color:var(--accent5);}
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(14px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }

  .p6-footer { position:relative;z-index:5;text-align:center; padding:28px 24px;border-top:1px solid var(--border); font-size:13px;color:var(--muted);line-height:1.8; }
  .p6-footer span { background:linear-gradient(90deg,var(--accent),var(--accent2)); -webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;font-size:15px; }
  .p6-footer-heart { color:var(--accent3); font-size:16px; }

  @media(max-width:600px){
    .p6-header{padding:14px 16px;}
    .p6-nav{padding:12px 16px;}
    .p6-main{padding:20px 14px 40px;}
    .p6-complete-inner{padding:20px;}
  }
`;

const INIT_PROFILE = {
  name: "Bishnu Kumar Sardar",
  handle: "@bishnu_backend",
  avatar: "BS",
  avatarColor: "linear-gradient(135deg,#06b6d4,#a855f7)",
  disability: "Backend Developer",
  disabilityColor: "rgba(6,182,212,0.12)",
  disabilityBorder: "rgba(6,182,212,0.3)",
  disabilityText: "#06b6d4",
  bio: "Backend developer at UnifyTalk. Building accessible communication tech using Node.js, MongoDB & Socket.io. BTech student at Cambridge Institute of Technology, Bengaluru.",
  location: "Bengaluru, India",
  lang: "English, Hindi, Bengali, Odia",
  college: "Cambridge Institute of Technology",
  github: "@bishnusardar235",
  notifications: true, screenReader: false, voiceNav: true,
  autoSpeak: false, highContrast: false,
};

const COMMUNITY_POSTS_INIT = [
  {
    id:1, name:"Riya M.", handle:"@riya_deaf", avatar:"RM",
    avatarColor:"linear-gradient(135deg,#34d399,#38bdf8)",
    tag:"Deaf", tagColor:"rgba(52,211,153,0.15)", tagText:"#34d399",
    time:"2 min ago", likes:14, liked:false, comments:3,
    text:"Just used the pictogram board to order food at a restaurant for the first time completely on my own 🎉 UnifyTalk made it so natural and fast. The staff was so kind once they understood. This is what inclusion feels like!"
  },
  {
    id:2, name:"Arjun K.", handle:"@arjun_mute", avatar:"AK",
    avatarColor:"linear-gradient(135deg,#818cf8,#fb7185)",
    tag:"Mute", tagColor:"rgba(129,140,248,0.15)", tagText:"#818cf8",
    time:"18 min ago", likes:27, liked:false, comments:6,
    text:"The Text-to-Speech in Mute Mode is incredible. I typed a full message to my doctor and it read it out clearly. For the first time, I felt like I was really heard in a medical setting. Thank you to the team 🙏"
  },
  {
    id:3, name:"Divya S.", handle:"@divya_blind", avatar:"DS",
    avatarColor:"linear-gradient(135deg,#f59e0b,#fb7185)",
    tag:"Blind", tagColor:"rgba(245,158,11,0.15)", tagText:"#f59e0b",
    time:"1 hr ago", likes:41, liked:false, comments:9,
    text:"Voice navigation works SO well. I navigated the entire app using just my voice and keyboard. This is what accessible design actually looks like — not an afterthought, but built from the ground up. Impressed by the ARIA labels too."
  },
  {
    id:4, name:"Priya T.", handle:"@priya_caregiver", avatar:"PT",
    avatarColor:"linear-gradient(135deg,#34d399,#818cf8)",
    tag:"Caregiver", tagColor:"rgba(52,211,153,0.12)", tagText:"#34d399",
    time:"3 hr ago", likes:19, liked:false, comments:4,
    text:"My son who is deaf-mute used the Sign Language detection today and it recognised his signs with 90%+ accuracy! He was so happy seeing his gestures turn into words on screen. We cried happy tears. Please keep building this 💙"
  },
  {
    id:5, name:"Bishnu Kumar Sardar", handle:"@bishnu_backend", avatar:"BS",
    avatarColor:"linear-gradient(135deg,#06b6d4,#a855f7)",
    tag:"Developer", tagColor:"rgba(6,182,212,0.15)", tagText:"#06b6d4",
    time:"5 hr ago", likes:32, liked:false, comments:7,
    text:"Just pushed the complete backend for UnifyTalk — Node.js + Express + Socket.io + MongoDB all wired up. The real-time chat, JWT auth, and media upload are all live. Next up: connecting the MediaPipe sign detection to the backend API. This project has been one of the most meaningful things I've built 🚀"
  },
];

const MEMBERS = [
  { name:"Ansika",        type:"Lead Developer",    avatar:"AN", color:"linear-gradient(135deg,#818cf8,#38bdf8)", online:true  },
  { name:"Bishnu K.S.",   type:"Backend Developer", avatar:"BS", color:"linear-gradient(135deg,#06b6d4,#a855f7)", online:true  },
  { name:"Riya M.",       type:"Deaf User",         avatar:"RM", color:"linear-gradient(135deg,#34d399,#38bdf8)", online:true  },
  { name:"Arjun K.",      type:"Mute User",         avatar:"AK", color:"linear-gradient(135deg,#818cf8,#fb7185)", online:true  },
  { name:"Divya S.",      type:"Blind User",        avatar:"DS", color:"linear-gradient(135deg,#f59e0b,#fb7185)", online:false },
];

const TRENDING = [
  { tag:"#SignLanguage",     count:"128 posts" },
  { tag:"#AccessibilityWins",count:"94 posts"  },
  { tag:"#PictogramBoard",   count:"71 posts"  },
  { tag:"#BlindTech",        count:"58 posts"  },
  { tag:"#BackendDev",       count:"43 posts"  },
];

const BADGES = [
  { icon:"🎉", label:"First Commit",      color:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.3)",  text:"#34d399" },
  { icon:"⚙️", label:"Backend Builder",   color:"rgba(56,189,248,0.12)",  border:"rgba(56,189,248,0.3)",  text:"#38bdf8" },
  { icon:"🌟", label:"Phase 6 Complete",  color:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.3)",  text:"#f59e0b" },
  { icon:"🔌", label:"API Architect",     color:"rgba(129,140,248,0.12)", border:"rgba(129,140,248,0.3)", text:"#818cf8" },
  { icon:"🗄️", label:"Database Master",   color:"rgba(251,113,133,0.12)", border:"rgba(251,113,133,0.3)", text:"#fb7185" },
  { icon:"⚡", label:"Real-time Dev",     color:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.3)",  text:"#34d399" },
];

const SKILLS = ["Node.js", "Express.js", "MongoDB", "Socket.io", "JWT Auth", "REST API", "Cloudinary", "MediaPipe", "React", "Git"];

const PHASES_DATA = [
  { label:"Phase 1 · Chat",          pct:100, color:"#38bdf8" },
  { label:"Phase 2 · Pictograms",    pct:100, color:"#818cf8" },
  { label:"Phase 3 · Phrases",       pct:100, color:"#34d399" },
  { label:"Phase 4 · Sign AI",       pct:100, color:"#f59e0b" },
  { label:"Phase 5 · Screen Reader", pct:100, color:"#fb7185" },
  { label:"Phase 6 · Community",     pct:100, color:"#34d399" },
  { label:"Phase 7 · AI Symptom",    pct:100, color:"#06b6d4" },
  { label:"Phase 8 · Emergency SOS", pct:100, color:"#f43f5e" },
];

const ACTIVITY = [
  { avatar:"⚙️", color:"rgba(56,189,248,0.15)",  text:<>You pushed <strong>backend v1.0</strong> — all routes connected</>, time:"Just now" },
  { avatar:"🔌", color:"rgba(129,140,248,0.15)", text:<>Socket.io event <strong>send_message</strong> tested successfully</>, time:"15 min ago" },
  { avatar:"🗄️", color:"rgba(52,211,153,0.15)",  text:<>MongoDB Atlas connected — <strong>3 collections created</strong></>, time:"1 hr ago" },
  { avatar:"🤟", color:"rgba(245,158,11,0.15)",  text:<>MediaPipe integrated — <strong>gesture detection live</strong></>, time:"2 hr ago" },
  { avatar:"🏆", color:"rgba(251,113,133,0.15)", text:<>You earned the badge <strong>Backend Builder!</strong></>, time:"3 hr ago" },
];

export default function UnifyTalkPhase6() {
  const [activeTab, setActiveTab]   = useState("dashboard");
  const [profile, setProfile]       = useState(INIT_PROFILE);
  const [posts, setPosts]           = useState(COMMUNITY_POSTS_INIT);
  const [newPost, setNewPost]       = useState("");
  const [postTag, setPostTag]       = useState("Developer");
  const [toast, setToast]           = useState(null);
  const [editMode, setEditMode]     = useState(false);
  const [phasePcts, setPhasePcts]   = useState(PHASES_DATA.map(p=>({...p,pct:0})));
  const [showCelebration, setShowCelebration] = useState(true);
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  const showToast = (msg, type="green") => { 
    setToast({msg,type}); 
    announce(msg);
    setTimeout(()=>setToast(null), 2600); 
    if (navigator.vibrate) navigator.vibrate(40);
  };

  useEffect(()=>{ setTimeout(()=>setPhasePcts(PHASES_DATA), 300); },[]);

  // Load real posts from backend on mount; fall back to seeded data if offline
  useEffect(() => {
    getCommunityPosts().then(r => {
      if (r.data.posts && r.data.posts.length > 0) {
        setPosts(r.data.posts.map(p => ({
          ...p, id: p._id,
          time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          likes: p.likesCount, liked: p.liked,
          tagColor: p.tagColor || 'rgba(129,140,248,0.15)',
          tagText: p.tagText || '#818cf8'
        })));
      }
    }).catch(() => {});
  }, []);

  const toggleLike = (id) => {
    setPosts(prev=>prev.map(p=> p.id===id ? {...p, liked:!p.liked, likes:p.liked ? p.likes-1 : p.likes+1} : p));
  };

  const submitPost = () => {
    if (!newPost.trim()) { showToast("⚠️ Write something first!","red"); return; }
    const localPost = {
      id: Date.now(), name:profile.name, handle:profile.handle,
      avatar:profile.avatar, avatarColor:profile.avatarColor,
      tag: postTag, tagColor:"rgba(6,182,212,0.15)", tagText:"#06b6d4",
      time:"Just now", likes:0, liked:false, comments:0,
      text: newPost,
    };
    setPosts(prev=>[localPost,...prev]);
    setNewPost("");
    showToast("✅ Post shared with community!","green");
    // Persist to backend
    createCommunityPost({
      text: newPost, tag: postTag,
      name: profile.name, handle: profile.handle,
      avatar: profile.avatar, avatarColor: profile.avatarColor,
      tagColor: "rgba(6,182,212,0.15)", tagText: "#06b6d4"
    }).then(r => {
      setPosts(prev => prev.map(p => p.id === localPost.id ? { ...p, id: r.data._id } : p));
    }).catch(() => {});
  };

  const saveProfile = () => { setEditMode(false); showToast("✅ Profile saved!","green"); };

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onstart = () => announce("Speaking content");
    window.speechSynthesis.speak(u);
    if (navigator.vibrate) navigator.vibrate(40);
  }, [announce]);

  useEffect(() => {
    const handleKeys = (e) => {
      // Alt + 1-4 for Tabs
      if (e.altKey && e.key === '1') { e.preventDefault(); setActiveTab("dashboard"); announce("Switched to Dashboard"); }
      if (e.altKey && e.key === '2') { e.preventDefault(); setActiveTab("profile"); announce("Switched to My Profile"); }
      if (e.altKey && e.key === '3') { e.preventDefault(); setActiveTab("community"); announce("Switched to Community"); }
      if (e.altKey && e.key === '4') { e.preventDefault(); setActiveTab("settings"); announce("Switched to Settings"); }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [announce]);

  useEffect(() => {
    document.title = "Community & Dashboard | UnifyTalk";
  }, []);

  const TABS = [
    { id:"dashboard", icon:"📊", label:"Dashboard"  },
    { id:"profile",   icon:"👤", label:"My Profile"  },
    { id:"community", icon:"🌍", label:"Community"   },
    { id:"settings",  icon:"⚙️", label:"Settings"    },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="p6-root" role="application" aria-label="Community and User Dashboard">
        <div className="p6-bg" aria-hidden="true" />
        
        <a href="#main-community" className="p6-skip-link">Skip to community content</a>

        {/* ARIA ANNOUNCEMENT REGION */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {/* KEYBOARD SHORTCUTS GUIDE FOR SCREEN READERS */}
        <div className="sr-only">
          Keyboard Shortcuts: 
          Alt + 1: Dashboard. 
          Alt + 2: My Profile. 
          Alt + 3: Community. 
          Alt + 4: Settings.
        </div>

        <header className="p6-header">
          <div className="p6-logo">
            <div className="p6-logo-icon" aria-hidden="true">🤝</div>
            <div className="p6-logo-text">UnifyTalk</div>
          </div>
          <div className="p6-header-right">
            <div className="p6-phase-badge">🚀 8 Phases Available!</div>
            <button className="p6-user-pill" onClick={()=>setActiveTab("profile")} aria-label="View profile">
              <div className="p6-avatar" style={{background:profile.avatarColor}} aria-hidden="true">{profile.avatar}</div>
              {profile.name.split(" ")[0]}
            </button>
          </div>
        </header>

        <nav className="p6-nav" aria-label="Dashboard navigation">
          {TABS.map(t=>(
            <button key={t.id} className={`p6-nav-btn ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)} aria-pressed={activeTab===t.id}>
              <span aria-hidden="true">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        {showCelebration && (
          <section className="p6-complete" aria-labelledby="celebration-title">
            <div className="p6-complete-inner">
              <div className="p6-complete-icon" aria-hidden="true">🏆</div>
              <div className="p6-complete-text">
                <h3 id="celebration-title">UnifyTalk is Complete, pixel pirates 🎉</h3>
                <p>All 6 phases built. Backend connected. You've helped create a full accessibility platform that's ready for hackathons, portfolios, and the world.</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"10px",alignItems:"flex-end"}}>
                <div className="p6-phase-pills" role="list">
                  {["💬 Chat","🖼️ Picto","⚡ Phrases","🤟 Sign AI","📖 Screen Reader","🌍 Community"].map((p,i)=>(
                    <div key={i} className="p6-phase-pill" role="listitem">✅ {p}</div>
                  ))}
                </div>
                <button className="p6-btn p6-btn-outline" style={{fontSize:12,padding:"8px 14px"}} onClick={()=>setShowCelebration(false)}>
                  Dismiss
                </button>
              </div>
            </div>
          </section>
        )}

        <main className="p6-main" id="main-community">

          {/* DASHBOARD */}
          {activeTab==="dashboard" && (
            <section aria-labelledby="dash-title">
              <h2 id="dash-title" className="sr-only">Dashboard Overview</h2>
              <div className="p6-dash-grid" role="list">
                {[
                  { icon:"⚙️", val:"1",    label:"Backend Deployed",   change:"Live ✅",      color:"#06b6d4" },
                  { icon:"🔌", val:"12",   label:"API Endpoints",       change:"+3 today",     color:"#818cf8" },
                  { icon:"🗄️", val:"3",    label:"DB Collections",      change:"Connected",    color:"#34d399" },
                  { icon:"💬", val:"247",  label:"Messages Handled",    change:"+18 today",    color:"#f59e0b" },
                ].map((s,i)=>(
                  <div key={i} className="p6-stat-tile" role="listitem">
                    <div className="p6-tile-icon" aria-hidden="true">{s.icon}</div>
                    <div className="p6-tile-val" style={{color:s.color}} aria-label={`${s.val} ${s.label}`}>{s.val}</div>
                    <div className="p6-tile-label">{s.label}</div>
                    <div className="p6-tile-change up" aria-label={`Status: ${s.change}`}>{s.change}</div>
                  </div>
                ))}
              </div>

              <div className="p6-dash-bottom">
                <section className="p6-card" aria-labelledby="activity-title">
                  <div className="p6-card-header">
                    <span id="activity-title">⚡ Recent Activity</span>
                    <span style={{fontSize:11,color:"var(--muted)",fontWeight:400}} aria-hidden="true">Today</span>
                  </div>
                  <div className="p6-activity" role="list">
                    {ACTIVITY.map((a,i)=>(
                      <div key={i} className="p6-act-item" role="listitem">
                        <div className="p6-act-avatar" style={{background:a.color}} aria-hidden="true">{a.avatar}</div>
                        <div className="p6-act-body">
                          <div className="p6-act-text">{a.text}</div>
                          <div className="p6-act-time">{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p6-card" aria-labelledby="progress-title">
                  <div className="p6-card-header">
                    <span id="progress-title">🗺️ Build Progress</span>
                    <span style={{fontSize:12,padding:"3px 10px",borderRadius:100,background:"rgba(52,211,153,0.12)",color:"var(--accent4)",fontWeight:700}}>6/6 Complete</span>
                  </div>
                  <div className="p6-phases" role="list">
                    {phasePcts.map((p,i)=>(
                      <div key={i} className="p6-phase-row" role="listitem">
                        <div className="p6-phase-label">{p.label}</div>
                        <div className="p6-phase-bar" aria-hidden="true">
                          <div className="p6-phase-fill" style={{width:`${p.pct}%`,background:p.color}} />
                        </div>
                        <div className="p6-phase-pct" style={{color:p.color}} aria-label={`${p.pct} percent complete`}>{p.pct}%</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          )}

          {/* PROFILE */}
          {activeTab==="profile" && (
            <div className="p6-profile-layout">
              <section aria-labelledby="profile-info-title">
                <h2 id="profile-info-title" className="sr-only">Profile Information</h2>
                <div className="p6-card">
                  <div className="p6-profile-hero">
                    <button className="p6-profile-avatar" style={{background:profile.avatarColor, border:'none', cursor:'pointer'}} onClick={()=>showToast("📸 Avatar upload coming soon!","blue")} aria-label="Change profile picture">
                      {profile.avatar}
                      <div className="p6-avatar-edit" aria-hidden="true">✏️</div>
                    </button>
                    <div className="p6-profile-name">{profile.name}</div>
                    <div className="p6-profile-handle">{profile.handle}</div>
                    <div className="p6-disability-badge" style={{background:profile.disabilityColor,border:`1px solid ${profile.disabilityBorder}`,color:profile.disabilityText}} role="status">
                      ⚙️ {profile.disability}
                    </div>
                    <div className="p6-profile-bio">{profile.bio}</div>
                    <div style={{fontSize:12,color:"var(--muted)",display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
                      <span>📍 {profile.location}</span>
                      <span>🎓 {profile.college}</span>
                      <span>💻 GitHub: {profile.github}</span>
                    </div>
                  </div>

                  <div className="p6-profile-stats" role="list">
                    {[
                      {val:"12",  label:"Endpoints"},
                      {val:"3",   label:"DB Models"},
                      {val:"5",   label:"Posts"},
                    ].map((s,i)=>(
                      <div key={i} className="p6-ps-tile" role="listitem">
                        <div className="p6-ps-val" aria-label={`${s.val} ${s.label}`}>{s.val}</div>
                        <div className="p6-ps-label">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p6-profile-badges">
                    <div className="p6-badges-label">🏅 Badges Earned</div>
                    <div className="p6-badges-grid" role="list">
                      {BADGES.map((b,i)=>(
                        <div key={i} className="p6-badge" style={{background:b.color,border:`1px solid ${b.border}`,color:b.text}} role="listitem">
                          <span aria-hidden="true">{b.icon}</span> {b.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p6-skills">
                    <div className="p6-skills-label">🛠️ Tech Skills</div>
                    <div className="p6-skills-grid" role="list">
                      {SKILLS.map((s,i)=>(
                        <span key={i} className="p6-skill-chip" role="listitem">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section aria-labelledby="edit-profile-title">
                <div className="p6-card">
                  <div className="p6-card-header">
                    <span id="edit-profile-title">✏️ Edit Profile</span>
                    <button className={`p6-btn ${editMode?"p6-btn-green":"p6-btn-outline"}`} style={{padding:"7px 16px",fontSize:12}} onClick={()=>editMode ? saveProfile() : setEditMode(true)}>
                      {editMode ? "✅ Save" : "✏️ Edit"}
                    </button>
                  </div>
                  <div className="p6-settings">
                    {[
                      {label:"Full Name",         key:"name",     type:"input"   },
                      {label:"Username / Handle", key:"handle",   type:"input"   },
                      {label:"Bio",               key:"bio",      type:"textarea"},
                      {label:"Location",          key:"location", type:"input"   },
                      {label:"Languages Spoken",  key:"lang",     type:"input"   },
                      {label:"GitHub Username",   key:"github",   type:"input"   },
                    ].map(f=>(
                      <div key={f.key} className="p6-field">
                        <label className="p6-label" htmlFor={`field-${f.key}`}>{f.label}</label>
                        {f.type==="textarea" ? (
                          <textarea id={`field-${f.key}`} className="p6-textarea" value={profile[f.key]} disabled={!editMode} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))} />
                        ) : (
                          <input id={`field-${f.key}`} className="p6-input" value={profile[f.key]} disabled={!editMode} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))} />
                        )}
                      </div>
                    ))}
                    <div className="p6-field">
                      <label className="p6-label" htmlFor="role-select">Role Type</label>
                      <select id="role-select" className="p6-select" value={profile.disability} disabled={!editMode} onChange={e=>setProfile(p=>({...p,disability:e.target.value}))}>
                        {["Backend Developer","Frontend Developer","Full Stack Developer","Deaf","Mute","Blind","Caregiver","Volunteer","Researcher"].map(o=>(
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* COMMUNITY */}
          {activeTab==="community" && (
            <div className="p6-community-layout">
              <section aria-labelledby="comm-posts-title">
                <h2 id="comm-posts-title" className="sr-only">Community Posts</h2>
                <div className="p6-card">
                  <div className="p6-card-header"><span>✍️ Share Your Experience</span></div>
                  <div className="p6-new-post">
                    <div className="p6-new-post-row">
                      <div className="p6-avatar" style={{background:profile.avatarColor,width:38,height:38,fontSize:14,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}} aria-hidden="true">
                        {profile.avatar}
                      </div>
                      <textarea className="p6-new-textarea" aria-label="Share a post" placeholder="Share a backend update, accessibility insight, or your experience with UnifyTalk…" value={newPost} onChange={e=>setNewPost(e.target.value)} rows={3} />
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center"}}>
                      <select className="p6-select" aria-label="Select post category" value={postTag} onChange={e=>setPostTag(e.target.value)} style={{width:"auto",flex:1}}>
                        {["Developer","Backend","General","Deaf","Mute","Blind","Caregiver","Tip","Question"].map(t=>(
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button className="p6-btn p6-btn-primary" onClick={submitPost}>🌍 Post</button>
                    </div>
                  </div>
                </div>

                <div role="list" aria-label="Community feed">
                  {posts.map(p=>(
                    <article key={p.id} className="p6-post" role="listitem">
                      <div className="p6-post-header">
                        <div className="p6-avatar" style={{background:p.avatarColor,width:40,height:40,fontSize:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}} aria-hidden="true">
                          {p.avatar}
                        </div>
                        <div className="p6-post-meta">
                          <div className="p6-post-name">{p.name}</div>
                          <div className="p6-post-sub">
                            <span>{p.handle}</span><span>·</span><span>{p.time}</span>
                            <div className="p6-post-tag" style={{background:p.tagColor,color:p.tagText,border:`1px solid ${p.tagColor}`}} role="status">{p.tag}</div>
                          </div>
                        </div>
                      </div>
                      <div className="p6-post-body">{p.text}</div>
                      <div className="p6-post-actions">
                        <button className={`p6-post-btn ${p.liked?"liked":""}`} onClick={()=>toggleLike(p.id)} aria-label={`${p.liked?'Unlike':'Like'} post. Current likes: ${p.likes}`}>
                          <span aria-hidden="true">{p.liked?"❤️":"🤍"}</span> {p.likes}
                        </button>
                        <button className="p6-post-btn" onClick={()=>showToast("💬 Comments coming soon!","blue")} aria-label={`View comments. Current comments: ${p.comments}`}>
                          <span aria-hidden="true">💬</span> {p.comments}
                        </button>
                        <button className="p6-post-btn" onClick={()=>{navigator.clipboard?.writeText(p.text);showToast("📋 Copied!","green");}} aria-label="Copy post text">
                          <span aria-hidden="true">📋</span> Copy
                        </button>
                        <button className="p6-post-btn" onClick={() => speak(p.text)} aria-label="Read post aloud">
                          <span aria-hidden="true">🔊</span> Read
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="p6-sidebar">
                <section className="p6-sidebar-card" aria-labelledby="members-title">
                  <div className="p6-sidebar-header" id="members-title">👥 Team & Members</div>
                  <div className="p6-member-list" role="list">
                    {MEMBERS.map((m,i)=>(
                      <button key={i} className="p6-member" role="listitem" style={{background:'none', width:'100%', textAlign:'left'}} aria-label={`${m.name}, ${m.type}. ${m.online?'Online':'Offline'}`}>
                        <div className="p6-avatar" style={{background:m.color,width:34,height:34,fontSize:13,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}} aria-hidden="true">{m.avatar}</div>
                        <div className="p6-member-info">
                          <div className="p6-member-name">{m.name}</div>
                          <div className="p6-member-type">{m.type}</div>
                        </div>
                        {m.online && <div className="p6-online-dot" title="Online now" aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="p6-sidebar-card" aria-labelledby="trending-title">
                  <div className="p6-sidebar-header" id="trending-title">🔥 Trending Tags</div>
                  <div className="p6-trend-list" role="list">
                    {TRENDING.map((t,i)=>(
                      <button key={i} className="p6-trend-item" onClick={()=>showToast(`🔍 Filtering by ${t.tag}`,"blue")} role="listitem" style={{background:'none', border:'none', width:'100%', textAlign:'left'}}>
                        <div className="p6-trend-num" aria-hidden="true">#{i+1}</div>
                        <div className="p6-trend-tag">{t.tag}</div>
                        <div className="p6-trend-count" aria-label={`${t.count}`}>{t.count}</div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="p6-sidebar-card" aria-labelledby="impact-title">
                  <div className="p6-sidebar-header" id="impact-title">🌍 Platform Impact</div>
                  <div style={{padding:"16px"}} role="list">
                    {[
                      {val:"4,200+", label:"People Helped",    color:"var(--accent4)"},
                      {val:"12",     label:"Countries Reached",color:"var(--accent)"},
                      {val:"95%+",   label:"Sign Accuracy",    color:"var(--accent2)"},
                    ].map((s,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:8,background:"var(--surface2)",border:"1px solid var(--border)"}} role="listitem">
                        <span style={{fontSize:12,color:"var(--muted)"}}>{s.label}</span>
                        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:s.color}} aria-label={`${s.val} ${s.label}`}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab==="settings" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
              <section aria-labelledby="notif-settings-title">
                <div className="p6-card">
                  <div className="p6-card-header"><span id="notif-settings-title">🔔 Notification Settings</span></div>
                  <div className="p6-settings">
                    {[
                      {key:"notifications", title:"Push Notifications",  desc:"Get alerts for API errors, new messages, community replies"},
                      {key:"autoSpeak",     title:"Auto-Speak Messages", desc:"Automatically read new messages aloud in Mute Mode"},
                      {key:"voiceNav",      title:"Voice Navigation",     desc:"Enable voice command navigation across the platform"},
                      {key:"screenReader",  title:"Screen Reader Mode",   desc:"Optimise layout and ARIA labels for screen readers"},
                      {key:"highContrast",  title:"High Contrast Mode",   desc:"Use maximum contrast colours for better visibility"},
                    ].map(s=>(
                      <div key={s.key} className="p6-toggle-row">
                        <div className="p6-toggle-info">
                          <div className="p6-toggle-title">{s.title}</div>
                          <div className="p6-toggle-desc">{s.desc}</div>
                        </div>
                        <button
                          className={`p6-toggle ${profile[s.key]?"on":"off"}`}
                          onClick={()=>{ setProfile(p=>({...p,[s.key]:!p[s.key]})); showToast(`${s.title} ${!profile[s.key]?"enabled":"disabled"}`,"green"); }}
                          aria-pressed={profile[s.key]} aria-label={`Toggle ${s.title}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside aria-labelledby="region-settings-title">
                <div className="p6-card">
                  <div className="p6-card-header"><span id="region-settings-title">🌐 Language & Region</span></div>
                  <div className="p6-settings">
                    {[
                      {label:"App Language",         id:"app-lang", options:["English","Hindi","Kannada","Tamil","Telugu","Bengali","Odia"]},
                      {label:"Sign Language Dialect", id:"sign-lang", options:["ISL (Indian Sign Language)","ASL (American)","BSL (British)","Auslan (Australian)"]},
                      {label:"Voice Speed",           id:"voice-speed", options:["Slow (0.7x)","Normal (1.0x)","Fast (1.3x)","Very Fast (1.6x)"]},
                      {label:"Text-to-Speech Voice",  id:"tts-voice", options:["Default","Female (Natural)","Male (Deep)","Child-Friendly"]},
                    ].map(s=>(
                      <div key={s.label} className="p6-field">
                        <label className="p6-label" htmlFor={s.id}>{s.label}</label>
                        <select id={s.id} className="p6-select" onChange={()=>showToast(`✅ ${s.label} updated`,"green")}>
                          {s.options.map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p6-card" style={{marginTop:20}} aria-labelledby="privacy-settings-title">
                  <div className="p6-card-header"><span id="privacy-settings-title">🗂️ Data & Privacy</span></div>
                  <div className="p6-settings">
                    {[
                      {label:"Export my data",    icon:"📦", type:"blue"},
                      {label:"Clear chat history",icon:"🗑",  type:"red"},
                      {label:"Delete account",    icon:"⚠️", type:"red"},
                    ].map(a=>(
                      <button key={a.label} className="p6-btn p6-btn-outline" style={{width:"100%",justifyContent:"flex-start",color:a.type==="red"?"var(--danger)":"var(--muted)",borderColor:a.type==="red"?"rgba(244,63,94,0.3)":"var(--border)"}} onClick={()=>showToast(`${a.icon} ${a.label} — coming in v2`,a.type)}>
                        <span aria-hidden="true">{a.icon}</span> {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}

        </main>

        <footer className="p6-footer">
          <div style={{marginBottom:8}}>
            <span>UnifyTalk</span> — Built with <span className="p6-footer-heart" aria-hidden="true">♥</span> by <strong style={{color:"var(--accent2)"}}>Ansika</strong> & <strong style={{color:"var(--accent)"}}>Bishnu</strong>
          </div>
          <div>Cambridge Institute of Technology · Bengaluru · 2025</div>
          <div style={{marginTop:8,fontSize:11}}>🌍 Breaking communication barriers for 1 billion+ people with disabilities worldwide</div>
        </footer>

        {toast && <div className={`p6-toast ${toast.type}`} role="alert" aria-live="assertive">{toast.msg}</div>}
      </div>
    </>
  );
}
