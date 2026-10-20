import { useState, useRef, useEffect, useCallback } from "react";
import { getAccessibilityPrefs, saveAccessibilityPrefs, logVoiceCommand } from '../api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #06080f;
    --surface: #0d1220;
    --surface2: #131a2e;
    --border: #1c2a44;
    --accent: #38bdf8;
    --accent2: #818cf8;
    --accent3: #fb7185;
    --accent4: #34d399;
    --accent5: #f59e0b;
    --text: #f0f4ff;
    --muted: #64748b;
    --danger: #f43f5e;
    --focus: #f59e0b;
  }

  /* HIGH CONTRAST OVERRIDE */
  .hc {
    --bg: #000000 !important;
    --surface: #0a0a0a !important;
    --surface2: #111111 !important;
    --border: #444444 !important;
    --text: #ffffff !important;
    --muted: #aaaaaa !important;
    --accent: #00ffff !important;
    --accent2: #ff88ff !important;
    --accent4: #00ff88 !important;
    --focus: #ffff00 !important;
  }

  /* LARGE TEXT OVERRIDE */
  .large-text { font-size: 120% !important; }
  .xlarge-text { font-size: 145% !important; }

  .p5-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg); color: var(--text);
    min-height: 100vh; overflow-x: hidden;
    transition: all 0.3s ease;
  }

  /* SKIP LINK */
  .p5-skip {
    position: fixed; top: -100px; left: 16px; z-index: 9999;
    background: var(--focus); color: #000;
    padding: 10px 20px; border-radius: 8px;
    font-weight: 700; font-size: 14px;
    transition: top 0.2s; text-decoration: none;
  }
  .p5-skip:focus { top: 16px; outline: 3px solid #000; }

  .p5-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 10% 20%, rgba(56,189,248,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 90% 70%, rgba(129,140,248,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 100%, rgba(52,211,153,0.05) 0%, transparent 60%);
  }

  /* HEADER */
  .p5-header {
    position: relative; z-index: 10;
    padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
    background: rgba(6,8,15,0.88); backdrop-filter: blur(14px);
  }

  .p5-logo { display: flex; align-items: center; gap: 10px; }

  .p5-logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 14px rgba(56,189,248,0.3);
  }

  .p5-logo-text {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .p5-phase-badge {
    font-size: 11px; padding: 4px 12px; border-radius: 100px;
    background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.28);
    color: var(--accent4); font-weight: 600; letter-spacing: 0.5px;
  }

  /* VOICE BANNER */
  .p5-voice-banner {
    position: relative; z-index: 5;
    margin: 20px 24px 0;
    max-width: 1100px; margin: 20px auto 0;
    padding: 0 24px;
  }

  .p5-banner-inner {
    padding: 18px 24px; border-radius: 18px;
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    border: 1px solid rgba(52,211,153,0.25);
    background: rgba(52,211,153,0.06);
  }

  .p5-banner-inner.listening {
    border-color: rgba(244,63,94,0.4);
    background: rgba(244,63,94,0.06);
    animation: bannerPulse 1.5s infinite;
  }

  @keyframes bannerPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.2); }
    50%      { box-shadow: 0 0 0 8px rgba(244,63,94,0); }
  }

  .p5-voice-icon { font-size: 28px; flex-shrink:0; }

  .p5-voice-info { flex: 1; min-width: 180px; }
  .p5-voice-info h4 {
    font-family:'Syne',sans-serif; font-size:14px; font-weight:700;
    color: var(--accent4); margin-bottom:4px;
  }
  .p5-voice-info p { font-size:12px; color: var(--muted); line-height:1.5; }

  .p5-voice-heard {
    padding: 8px 14px; border-radius: 10px;
    background: rgba(6,8,15,0.6); border: 1px solid var(--border);
    font-size: 13px; color: var(--text); min-width: 200px;
    font-style: italic;
  }

  .p5-voice-heard span { color: var(--accent4); font-weight:600; font-style:normal; }

  /* ACCESSIBILITY TOOLBAR */
  .p5-a11y-toolbar {
    position: relative; z-index: 5;
    max-width: 1100px; margin: 16px auto 0;
    padding: 0 24px;
  }

  .p5-toolbar-inner {
    padding: 14px 20px; border-radius: 16px;
    background: var(--surface); border: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }

  /* ADVANCED ACCESSIBILITY PANELS */
  .p5-a11y-panels {
    position: relative; z-index: 4;
    max-width: 1100px; margin: 16px auto 0;
    padding: 0 24px;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
  }

  @media (max-width: 768px) {
    .p5-a11y-panels {
      grid-template-columns: 1fr;
    }
  }

  .p5-toolbar-label {
    font-size: 12px; color: var(--muted); font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.6px; margin-right: 4px;
  }

  .p5-tool-btn {
    padding: 8px 16px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--muted); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .p5-tool-btn:hover { border-color: var(--accent2); color: var(--text); }
  .p5-tool-btn.on {
    background: rgba(52,211,153,0.12);
    border-color: var(--accent4); color: var(--accent4);
  }
  .p5-tool-btn.on-blue {
    background: rgba(56,189,248,0.12);
    border-color: var(--accent); color: var(--accent);
  }
  .p5-tool-btn.on-yellow {
    background: rgba(245,158,11,0.12);
    border-color: var(--accent5); color: var(--accent5);
  }
  .p5-tool-btn.on-purple {
    background: rgba(129,140,248,0.12);
    border-color: var(--accent2); color: var(--accent2);
  }

  /* FOCUS RING — visible keyboard focus */
  .p5-root *:focus-visible {
    outline: 3px solid var(--focus) !important;
    outline-offset: 3px !important;
    border-radius: 6px;
  }

  /* FOCUS SPOTLIGHT MODE */
  .p5-root.focus-mode *:focus-visible {
    outline: 6px solid var(--accent) !important;
    outline-offset: 8px !important;
    box-shadow: 0 0 0 100vmax rgba(0,0,0,0.8) !important;
    z-index: 10001 !important;
    position: relative;
  }

  /* PAGE TITLE */
  .p5-title {
    position: relative; z-index: 5;
    text-align: center; padding: 32px 24px 24px;
  }

  .p5-title h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(24px, 4vw, 40px); font-weight: 800; margin-bottom: 10px;
  }

  .p5-title h2 span {
    background: linear-gradient(90deg, var(--accent4), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .p5-title p { color: var(--muted); font-size: 15px; max-width:520px; margin:0 auto; line-height:1.6; }

  /* MAIN LAYOUT */
  .p5-layout {
    position: relative; z-index: 5;
    max-width: 1100px; margin: 0 auto;
    padding: 0 24px 48px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  }
  @media(max-width:780px){ .p5-layout { grid-template-columns:1fr; } }

  /* CARD */
  .p5-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 22px; overflow: hidden;
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  }

  .p5-card-header {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface2);
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
  }

  /* SCREEN READER DEMO */
  .p5-sr-area { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

  .p5-sr-element {
    padding: 14px 16px; border-radius: 14px;
    border: 1px solid var(--border); background: var(--surface2);
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: flex-start; gap: 12px;
    position: relative;
  }

  .p5-sr-element:hover, .p5-sr-element:focus {
    border-color: var(--accent2);
    background: rgba(129,140,248,0.08);
    transform: translateX(4px);
  }

  .p5-sr-element.reading {
    border-color: var(--accent4) !important;
    background: rgba(52,211,153,0.08) !important;
    box-shadow: 0 0 0 2px rgba(52,211,153,0.2);
  }

  .p5-sr-icon { font-size: 22px; flex-shrink:0; margin-top:2px; }

  .p5-sr-content { flex:1; }

  .p5-sr-role {
    font-size: 10px; color: var(--accent2); text-transform: uppercase;
    letter-spacing: 0.8px; font-weight: 600; margin-bottom:4px;
  }

  .p5-sr-label { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom:3px; }

  .p5-sr-desc { font-size: 12px; color: var(--muted); line-height:1.5; }

  .p5-sr-aria {
    font-size:10px; padding:3px 8px; border-radius:100px;
    background: rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.2);
    color: var(--accent); font-family:monospace;
    position:absolute; top:10px; right:12px;
  }

  /* READING INDICATOR */
  .p5-reading-bar {
    height: 3px; background: var(--border); border-radius:100px; overflow:hidden;
    margin-top:6px;
  }
  .p5-reading-fill {
    height:100%; border-radius:100px;
    background: linear-gradient(90deg, var(--accent4), var(--accent));
    transition: width 0.1s linear;
  }

  /* VOICE COMMANDS PANEL */
  .p5-cmd-list { padding: 16px 20px; display:flex; flex-direction:column; gap:10px; }

  .p5-cmd-item {
    display:flex; align-items:center; gap:12px;
    padding:12px 16px; border-radius:14px;
    background: var(--surface2); border:1px solid var(--border);
    transition: all 0.2s; cursor:pointer;
  }
  .p5-cmd-item:hover {
    border-color: var(--accent); background: rgba(56,189,248,0.06);
    transform: translateX(4px);
  }
  .p5-cmd-item.triggered {
    border-color: var(--accent4) !important;
    background: rgba(52,211,153,0.1) !important;
    animation: cmdFlash 0.5s ease;
  }
  @keyframes cmdFlash {
    0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
    100% { box-shadow: 0 0 0 12px rgba(52,211,153,0); }
  }

  .p5-cmd-keyword {
    padding:5px 12px; border-radius:8px;
    background: rgba(129,140,248,0.15); border:1px solid rgba(129,140,248,0.3);
    color: var(--accent2); font-family:monospace; font-size:13px; font-weight:700;
    min-width:100px; text-align:center; flex-shrink:0;
  }

  .p5-cmd-desc { font-size:13px; color: var(--muted); flex:1; line-height:1.4; }
  .p5-cmd-icon { font-size:18px; flex-shrink:0; }

  /* KEYBOARD NAV DEMO */
  .p5-kb-grid {
    display:grid; grid-template-columns: repeat(3,1fr);
    gap:12px; padding:20px;
  }

  .p5-kb-item {
    display:flex; flex-direction:column; align-items:center; gap:8px;
    padding:16px 10px; border-radius:16px;
    border:1px solid var(--border); background: var(--surface2);
    cursor:pointer; transition:all 0.2s;
    font-family:'DM Sans',sans-serif;
  }
  .p5-kb-item:hover, .p5-kb-item:focus {
    border-color: var(--accent); background: rgba(56,189,248,0.08);
    transform:translateY(-2px);
    box-shadow:0 8px 20px rgba(0,0,0,0.3);
  }

  .p5-kb-key {
    padding:6px 12px; border-radius:8px;
    background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3);
    color:var(--accent5); font-family:monospace; font-size:13px; font-weight:700;
    min-width:48px; text-align:center;
  }

  .p5-kb-action { font-size:12px; color:var(--muted); text-align:center; line-height:1.4; }

  /* ARIA SHOWCASE */
  .p5-aria-demo { padding:20px; display:flex; flex-direction:column; gap:14px; }

  .p5-aria-item {
    border-radius:14px; border:1px solid var(--border);
    overflow:hidden;
  }

  .p5-aria-header {
    padding:10px 14px; background:var(--surface2);
    font-size:12px; font-family:monospace;
    color:var(--accent); border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:8px;
  }

  .p5-aria-body {
    padding:14px 16px; font-size:13px; color:var(--muted); line-height:1.6;
  }

  .p5-aria-body strong { color:var(--text); }

  /* BRAILLE STRIP */
  .p5-braille-area { padding:20px; display:flex; flex-direction:column; gap:16px; }

  .p5-braille-input {
    background:var(--bg); border:1px solid var(--border);
    border-radius:12px; color:var(--text); padding:12px 16px;
    font-family:'DM Sans',sans-serif; font-size:14px; width:100%;
    transition:border-color 0.2s;
  }
  .p5-braille-input:focus {
    outline:none; border-color:var(--accent2);
    box-shadow:0 0 0 3px rgba(129,140,248,0.1);
  }

  .p5-braille-display {
    padding:16px 18px; border-radius:14px;
    background:rgba(129,140,248,0.06); border:1px solid rgba(129,140,248,0.18);
    min-height:64px;
  }

  .p5-braille-label { font-size:11px; color:var(--muted); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.6px; }

  .p5-braille-chars {
    display:flex; flex-wrap:wrap; gap:6px;
  }

  .p5-braille-char {
    display:flex; flex-direction:column; align-items:center; gap:4px;
    padding:8px 10px; border-radius:10px;
    background:var(--surface2); border:1px solid var(--border);
    animation: chipIn 0.2s ease;
  }

  @keyframes chipIn {
    from{opacity:0;transform:scale(0.8);}
    to{opacity:1;transform:scale(1);}
  }

  .p5-braille-dot { font-size:22px; line-height:1; }
  .p5-braille-letter { font-size:11px; color:var(--muted); font-weight:600; }

  /* LIVE REGION */
  .p5-live-region {
    padding:16px 20px; border-top:1px solid var(--border);
    background:rgba(52,211,153,0.04);
  }

  .p5-live-label { font-size:11px; color:var(--accent4); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px; font-weight:600; }

  .p5-live-text {
    font-size:13px; color:var(--text); line-height:1.6;
    padding:10px 14px; border-radius:10px;
    background:var(--surface2); border:1px solid var(--border);
    min-height:40px;
  }

  /* LISTENING WAVE */
  .p5-wave {
    display:flex; align-items:center; gap:3px; height:24px;
  }

  .p5-wave-bar {
    width:3px; border-radius:100px;
    background: var(--danger);
    animation: waveAnim 0.8s ease-in-out infinite;
  }
  .p5-wave-bar:nth-child(1){animation-delay:0s;    height:8px;}
  .p5-wave-bar:nth-child(2){animation-delay:0.1s;  height:16px;}
  .p5-wave-bar:nth-child(3){animation-delay:0.2s;  height:22px;}
  .p5-wave-bar:nth-child(4){animation-delay:0.15s; height:14px;}
  .p5-wave-bar:nth-child(5){animation-delay:0.05s; height:10px;}

  @keyframes waveAnim {
    0%,100%{transform:scaleY(0.5);opacity:0.6;}
    50%{transform:scaleY(1);opacity:1;}
  }

  /* VISUAL CUE INDICATOR */
  .p5-cue-indicator {
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--accent4); border: 2px solid white;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; animation: cueFlash 0.3s ease;
    box-shadow: 0 0 20px var(--accent4);
  }
  @keyframes cueFlash {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
    padding:11px 18px; border-radius:12px; border:none;
    cursor:pointer; font-weight:700; font-family:'Syne',sans-serif;
    font-size:12px; transition:all 0.2s;
    display:flex; align-items:center; gap:7px;
  }

  .p5-btn-green {
    background: linear-gradient(135deg, var(--accent4), var(--accent));
    color:#06080f;
  }
  .p5-btn-green:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(52,211,153,0.3); }

  .p5-btn-red {
    background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3);
    color:var(--danger);
  }
  .p5-btn-red:hover { background:rgba(244,63,94,0.25); }

  .p5-btn-outline {
    background:var(--surface2); border:1px solid var(--border); color:var(--muted);
  }
  .p5-btn-outline:hover { border-color:var(--accent2); color:var(--text); }

  /* TOAST */
  .p5-toast {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    padding:12px 24px; border-radius:100px; font-size:13px; font-weight:600;
    z-index:999; box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:toastIn 0.3s ease; white-space:nowrap;
    display:flex; align-items:center; gap:8px;
  }
  .p5-toast.green{background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);color:var(--accent4);}
  .p5-toast.blue {background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:var(--accent);}
  .p5-toast.red  {background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3); color:var(--danger);}
  @keyframes toastIn{
    from{opacity:0;transform:translateX(-50%) translateY(14px);}
    to{opacity:1;transform:translateX(-50%) translateY(0);}
  }

  /* FOOTER */
  .p5-footer {
    position:relative;z-index:5;text-align:center;
    padding:20px;border-top:1px solid var(--border);
    font-size:12px;color:var(--muted);
  }
  .p5-footer span {
    background:linear-gradient(90deg,var(--accent),var(--accent2));
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700;
  }

  @media(max-width:600px){
    .p5-header{padding:14px 16px;}
    .p5-layout{padding:0 12px 32px;}
    .p5-kb-grid{grid-template-columns:repeat(2,1fr);}
  }
`;

// ── BRAILLE MAP (Grade 1) ────────────────────────────────────────────
const BRAILLE = {
  a:"⠁",b:"⠃",c:"⠉",d:"⠙",e:"⠑",f:"⠋",g:"⠛",h:"⠓",
  i:"⠊",j:"⠚",k:"⠅",l:"⠇",m:"⠍",n:"⠝",o:"⠕",p:"⠏",
  q:"⠟",r:"⠗",s:"⠎",t:"⠞",u:"⠥",v:"⠧",w:"⠺",x:"⠭",
  y:"⠽",z:"⠵"," ":"⠀",
};

// ── VOICE COMMANDS ───────────────────────────────────────────────────
const COMMANDS = [
  { keyword:"read page",    icon:"📖", desc:"Reads the entire page content aloud" },
  { keyword:"stop reading", icon:"⏹",  desc:"Stops the current reading immediately" },
  { keyword:"go to top",   icon:"⬆️",  desc:"Scrolls to the top of the page" },
  { keyword:"high contrast",icon:"◑",  desc:"Toggles high contrast mode on/off" },
  { keyword:"increase text",icon:"A+", desc:"Makes text larger for easier reading" },
  { keyword:"decrease text",icon:"A-", desc:"Reduces text size back to normal" },
  { keyword:"read buttons", icon:"🔘", desc:"Lists and reads all buttons on the page" },
  { keyword:"help",         icon:"❓", desc:"Lists all available voice commands" },
];

// ── SCREEN READER ELEMENTS ───────────────────────────────────────────
const SR_ELEMENTS = [
  { role:"banner",     icon:"🏠", label:"UnifyTalk Header",    desc:"Navigation and logo area. Contains the site name and phase indicator.", aria:"role=banner" },
  { role:"navigation", icon:"🧭", label:"Main Navigation",     desc:"Phase navigation links. Use Tab to move between links, Enter to activate.", aria:"aria-label" },
  { role:"main",       icon:"📄", label:"Main Content Area",   desc:"Primary content region. Contains the communication tools and features.", aria:"role=main" },
  { role:"button",     icon:"🔘", label:"Start Camera Button", desc:"Activates the camera for sign language detection. Press Enter or Space to activate.", aria:"role=button" },
  { role:"log",        icon:"💬", label:"Message Log",         desc:"Live region. New messages are announced automatically to screen readers.", aria:"aria-live=polite" },
  { role:"toolbar",    icon:"⚙️", label:"Accessibility Toolbar",desc:"Accessibility controls. Adjust font size, contrast, and navigation preferences.", aria:"role=toolbar" },
];

// ── KEYBOARD SHORTCUTS ───────────────────────────────────────────────
const KB_SHORTCUTS = [
  { key:"Tab",    action:"Move to next focusable element" },
  { key:"Shift+Tab", action:"Move to previous element" },
  { key:"Enter",  action:"Activate button or link" },
  { key:"Space",  action:"Toggle checkbox / activate button" },
  { key:"Arrows", action:"Navigate within a widget" },
  { key:"Esc",    action:"Close modal or cancel action" },
  { key:"H",      action:"Jump to next heading" },
  { key:"B",      action:"Jump to next button" },
  { key:"F",      action:"Jump to next form field" },
];

// ── ADVANCED FEATURES FOR BLIND USERS ────────────────────────────────
const HEADINGS = [
  { level:1, text:"UnifyTalk Phase 5 - Screen Reader and Voice Navigation", icon:"🎯" },
  { level:2, text:"Screen Reader Demo", icon:"📖" },
  { level:2, text:"Voice Commands Reference", icon:"🎙️" },
  { level:2, text:"Keyboard Navigation Guide", icon:"⌨️" },
  { level:2, text:"ARIA Implementation Examples", icon:"♿" },
  { level:2, text:"Braille Character Converter", icon:"⠿" },
];

const LANDMARKS = [
  { label:"Banner (Header)", role:"banner", desc:"Site logo and phase indicator" },
  { label:"Navigation", role:"navigation", desc:"Main navigation links" },
  { label:"Main Content", role:"main", desc:"Primary content area" },
  { label:"Complementary", role:"complementary", desc:"Related content sidebar" },
  { label:"Content Info", role:"contentinfo", desc:"Footer with links and info" },
];

const PAGE_LINKS = [
  { text:"UnifyTalk Home", url:"#", icon:"🏠" },
  { text:"Phase 1 - Chat", url:"#", icon:"💬" },
  { text:"Phase 2 - Pictograms", url:"#", icon:"🖼️" },
  { text:"Phase 3 - Phrases", url:"#", icon:"⚡" },
  { text:"Phase 4 - Sign AI", url:"#", icon:"🤟" },
  { text:"Phase 6 - Community", url:"#", icon:"🌍" },
  { text:"GitHub Repository", url:"#", icon:"💻" },
  { text:"Accessibility Info", url:"#", icon:"♿" },
];

// ── COMPONENT ────────────────────────────────────────────────────────
export default function UnifyTalkPhase5() {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize]         = useState("normal");
  const [isListening, setIsListening]   = useState(false);
  const [voiceHeard, setVoiceHeard]     = useState("");
  const [liveText, setLiveText]         = useState("Screen reader is ready. Activate voice navigation to begin.");
  const [readingIdx, setReadingIdx]     = useState(null);
  const [readProgress, setReadProgress] = useState(0);
  const [triggeredCmd, setTriggeredCmd] = useState(null);
  const [brailleInput, setBrailleInput] = useState("hello");
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusMode, setFocusMode]       = useState(false);
  // ─ Advanced Features for Blind Users ─
  const [showHeadings, setShowHeadings] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [showLinks, setShowLinks]       = useState(false);
  const [showPageStructure, setShowPageStructure] = useState(false);
  const [audioCues, setAudioCues]       = useState(true);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [currentHeadingIdx, setCurrentHeadingIdx] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [isCuePlaying, setIsCuePlaying] = useState(false);

  const announce = (msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  };

  const recognitionRef = useRef(null);
  const readTimerRef   = useRef(null);
  const savePrefsTimerRef = useRef(null);

  // ── Load saved preferences from backend on mount ──────────────────────────
  useEffect(() => {
    getAccessibilityPrefs().then(r => {
      const p = r.data;
      if (p.highContrast  !== undefined) setHighContrast(p.highContrast);
      if (p.textSize      !== undefined) setTextSize(p.textSize);
      if (p.readingSpeed  !== undefined) setReadingSpeed(p.readingSpeed);
      if (p.audioCues     !== undefined) setAudioCues(p.audioCues);
      if (p.reducedMotion !== undefined) setReducedMotion(p.reducedMotion);
      if (p.focusMode     !== undefined) setFocusMode(p.focusMode);
    }).catch(() => {});
  }, []);

  const showToast = useCallback((msg, type="green") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),2400);
  }, [setToast]);

  // Play audio cues for different element types
  const playAudioCue = useCallback((type) => {
    setIsCuePlaying(true);
    setTimeout(() => setIsCuePlaying(false), 200);

    // Vibration feedback for mobile users (Deaf/Blind)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (!audioCues || !window.AudioContext) return;
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    switch(type) {
      case "read": osc.frequency.value = 600; break; // Medium beep
      case "button": osc.frequency.value = 800; break; // Higher beep
      case "link": osc.frequency.value = 400; break; // Lower beep
      case "heading": osc.frequency.value = 1000; break; // Highest beep
      case "form": osc.frequency.value = 700; break; // Mid-high beep
      default: osc.frequency.value = 600;
    }
    
    osc.start(context.currentTime);
    osc.stop(context.currentTime + 0.1);
  }, [audioCues]);

  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88 * readingSpeed; // Apply reading speed multiplier
    u.pitch = 1.0; u.volume = 1.0;
    u.onstart = () => { setIsSpeaking(true); playAudioCue("read"); }
    u.onend   = () => { setIsSpeaking(false); onEnd && onEnd(); };
    window.speechSynthesis.speak(u);
    setLiveText(text);
  }, [readingSpeed, playAudioCue]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setReadingIdx(null);
    setReadProgress(0);
  }, [setIsSpeaking, setReadingIdx, setReadProgress]);

  // Read elements one by one
  const readPage = useCallback(() => {
    let i = 0;
    const readNext = () => {
      if (i >= SR_ELEMENTS.length) { setReadingIdx(null); setReadProgress(0); return; }
      setReadingIdx(i);
      setReadProgress(Math.round(((i+1)/SR_ELEMENTS.length)*100));
      const el = SR_ELEMENTS[i];
      speak(`${el.role}. ${el.label}. ${el.desc}`, () => {
        i++;
        readTimerRef.current = setTimeout(readNext, 300);
      });
    };
    readNext();
  }, [speak, setReadingIdx, setReadProgress, readTimerRef]);

  const handleVoiceCommand = useCallback((text) => {
    // Log every voice command to backend (debounced, silent fail)
    logVoiceCommand({ command: text, success: true }).catch(() => {});

    if (text.includes("read page"))      { setTriggeredCmd("read page");     readPage(); }
    if (text.includes("stop reading") || text.includes("stop")) { setTriggeredCmd("stop reading"); stopSpeaking(); }
    if (text.includes("go to top"))      { setTriggeredCmd("go to top");     window.scrollTo({top:0,behavior:"smooth"}); speak("Going to top of page"); }
    if (text.includes("high contrast"))  { setTriggeredCmd("high contrast"); setHighContrast(c=>!c); speak("High contrast toggled"); }
    if (text.includes("increase text"))  { setTriggeredCmd("increase text"); setTextSize("xlarge"); speak("Text size increased"); }
    if (text.includes("decrease text"))  { setTriggeredCmd("decrease text"); setTextSize("normal"); speak("Text size decreased"); }
    if (text.includes("read buttons"))   { setTriggeredCmd("read buttons");  speak("Buttons on this page: Start Camera, Speak Sentence, Clear, Start Voice Navigation, Read Page, Stop Reading."); }
    // ─ Advanced Features ─
    if (text.includes("list heading") || text.includes("heading navigation")) { 
      setTriggeredCmd("list headings"); 
      setShowHeadings(true); 
      speak("Heading navigation enabled. Use arrow keys to navigate headings."); 
    }
    if (text.includes("list landmark") || text.includes("landmark")) { 
      setTriggeredCmd("list landmarks"); 
      setShowLandmarks(true); 
      speak("Landmark navigation enabled."); 
    }
    if (text.includes("list link") || text.includes("list all link")) { 
      setTriggeredCmd("list links"); 
      setShowLinks(true); 
      speak("Showing all links on page."); 
    }
    if (text.includes("page structure") || text.includes("document structure")) { 
      setTriggeredCmd("page structure"); 
      setShowPageStructure(true); 
      speak("Page structure overview enabled."); 
    }
    if (text.includes("audio cues off")) { 
      setTriggeredCmd("audio cues off"); 
      setAudioCues(false); 
      speak("Audio cues turned off."); 
    }
    if (text.includes("audio cues on")) { 
      setTriggeredCmd("audio cues on"); 
      setAudioCues(true); 
      speak("Audio cues turned on."); 
    }
    if (text.includes("next heading")) { 
      const nextIdx = (currentHeadingIdx + 1) % HEADINGS.length;
      setCurrentHeadingIdx(nextIdx);
      setTriggeredCmd("next heading");
      speak(`Heading ${nextIdx + 1}: ${HEADINGS[nextIdx].text}`);
    }
    if (text.includes("previous heading")) { 
      const prevIdx = (currentHeadingIdx - 1 + HEADINGS.length) % HEADINGS.length;
      setCurrentHeadingIdx(prevIdx);
      setTriggeredCmd("previous heading");
      speak(`Heading ${prevIdx + 1}: ${HEADINGS[prevIdx].text}`);
    }
    if (text.includes("slow")) { 
      setTriggeredCmd("slow speed"); 
      setReadingSpeed(0.75); 
      speak("Reading speed set to slow."); 
    }
    if (text.includes("fast")) { 
      setTriggeredCmd("fast speed"); 
      setReadingSpeed(1.5); 
      speak("Reading speed set to fast."); 
    }
    if (text.includes("normal speed")) { 
      setTriggeredCmd("normal speed"); 
      setReadingSpeed(1); 
      speak("Reading speed reset to normal."); 
    }
    if (text.includes("help"))           { 
      setTriggeredCmd("help");          
      speak("Advanced commands: list headings, list landmarks, list links, page structure, audio cues on/off, next/previous heading, slow/fast/normal speed."); 
    }
    setTimeout(()=>setTriggeredCmd(null), 1500);
  }, [setTriggeredCmd, readPage, stopSpeaking, speak, setHighContrast, setTextSize, setShowHeadings, setShowLandmarks, setShowLinks, setShowPageStructure, setAudioCues, currentHeadingIdx, setCurrentHeadingIdx, setReadingSpeed]);

  // Voice recognition
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast("⚠️ Use Chrome for voice commands","red"); return; }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const r = new SR();
    recognitionRef.current = r;
    r.continuous = true; r.interimResults = true; r.lang = "en-US";
    r.onstart  = () => setIsListening(true);
    r.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript).join(" ").toLowerCase().trim();
      setVoiceHeard(transcript);
      handleVoiceCommand(transcript);
    };
    r.onerror  = () => setIsListening(false);
    r.onend    = () => setIsListening(false);
    r.start();
    showToast("🎙️ Voice navigation active","blue");
  }, [showToast, isListening, setIsListening, setVoiceHeard, handleVoiceCommand, recognitionRef]);

  // Braille conversion
  const brailleChars = brailleInput.toLowerCase().split("").map(c => ({
    char: c.toUpperCase(),
    dot: BRAILLE[c] || "⠿"
  }));

  // Text size class
  const sizeClass = textSize === "large" ? "large-text" : textSize === "xlarge" ? "xlarge-text" : "";

  const brailleInputRef = useRef(null);

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // Alt+S for Voice Navigation
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        startListening();
        announce(isListening ? "Voice navigation stopped" : "Voice navigation started");
      }
      // Alt+R for Read Page
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        readPage();
        announce("Reading page content");
      }
      // Alt+Q for Stop Speaking
      if (e.altKey && e.key === 'q') {
        e.preventDefault();
        stopSpeaking();
        announce("Reading stopped");
      }
      // Alt+C for High Contrast
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        setHighContrast(c => !c);
        announce(highContrast ? "High contrast mode off" : "High contrast mode on");
      }
      // Alt+T for Text Size
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        const sizes = ["normal", "large", "xlarge"];
        const nextSize = sizes[(sizes.indexOf(textSize) + 1) % sizes.length];
        setTextSize(nextSize);
        announce(`Text size set to ${nextSize}`);
      }
      // Alt+B for Braille Input focus
      if (e.altKey && e.key === 'b') {
        e.preventDefault();
        brailleInputRef.current?.focus();
        announce("Focusing on Braille input field");
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeys);
      clearTimeout(readTimerRef.current);
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, [isListening, highContrast, textSize, readPage, startListening, stopSpeaking]);

  // ── Auto-save prefs to backend whenever they change (debounced 1s) ────────
  useEffect(() => {
    clearTimeout(savePrefsTimerRef.current);
    savePrefsTimerRef.current = setTimeout(() => {
      saveAccessibilityPrefs({
        highContrast, textSize, readingSpeed, audioCues, reducedMotion, focusMode
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(savePrefsTimerRef.current);
  }, [highContrast, textSize, readingSpeed, audioCues, reducedMotion, focusMode]);

  return (
    <>
      <style>{styles}</style>

      {/* SKIP LINK */}
      <a href="#main-content" className="p5-skip">Skip to main content</a>

      <div
        className={`p5-root ${highContrast ? "hc" : ""} ${sizeClass} ${focusMode ? "focus-mode" : ""}`}
        role="application"
        aria-label="UnifyTalk Phase 5 - Screen Reader and Voice Navigation"
      >
        <div className="p5-bg" aria-hidden="true" />

        {/* ARIA ANNOUNCEMENT REGION */}
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {announcement}
        </div>

        {/* VISUAL CUE FOR DEAF USERS */}
        {isCuePlaying && (
          <div className="p5-cue-indicator" aria-hidden="true">
            🔔
          </div>
        )}

        {/* KEYBOARD SHORTCUTS HELP FOR SCREEN READERS */}
        <div className="sr-only">
          Keyboard Shortcuts: 
          Alt + S: Toggle Voice Navigation. 
          Alt + R: Read entire page. 
          Alt + Q: Stop reading. 
          Alt + C: Toggle High Contrast. 
          Alt + T: Cycle Text Size. 
          Alt + B: Focus Braille Input.
        </div>

        {/* HEADER */}
        <header className="p5-header" role="banner">
          <div className="p5-logo" aria-label="UnifyTalk Logo">
            <div className="p5-logo-icon" aria-hidden="true">🤝</div>
            <div className="p5-logo-text">UnifyTalk</div>
          </div>
          <div className="p5-phase-badge" aria-label="Current phase: Phase 5 Screen Reader">
            Phase 5 — Screen Reader
          </div>
        </header>

        {/* VOICE BANNER */}
        <div className="p5-voice-banner" role="region" aria-label="Voice navigation control">
          <div className={`p5-banner-inner ${isListening ? "listening" : ""}`}>
            <div className="p5-voice-icon" aria-hidden="true">
              {isListening ? "🔴" : "🎙️"}
            </div>
            <div className="p5-voice-info">
              <h4>{isListening ? "Listening for commands…" : "Voice Navigation"}</h4>
              <p>Say commands like "read page", "high contrast", "increase text", or "help"</p>
            </div>
            {isListening && (
              <div className="p5-wave" aria-label="Listening animation" aria-hidden="true">
                {[1,2,3,4,5].map(i=><div key={i} className="p5-wave-bar"/>)}
              </div>
            )}
            <div className="p5-voice-heard" aria-live="polite" aria-label="Last heard command">
              {voiceHeard
                ? <><span>Heard: </span>"{voiceHeard}"</>
                : <span style={{color:"var(--muted)"}}>Waiting for voice input…</span>
              }
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button
                className={`p5-btn ${isListening ? "p5-btn-red" : "p5-btn-green"}`}
                onClick={startListening}
                aria-label={isListening ? "Stop voice navigation" : "Start voice navigation"}
                aria-pressed={isListening}
              >
                {isListening ? "⏹ Stop" : "🎙️ Start Voice Nav"}
              </button>
              <button
                className="p5-btn p5-btn-outline"
                onClick={readPage}
                aria-label="Read entire page aloud"
              >
                📖 Read Page
              </button>
              {isSpeaking && (
                <button
                  className="p5-btn p5-btn-red"
                  onClick={stopSpeaking}
                  aria-label="Stop reading"
                >
                  ⏹ Stop
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ACCESSIBILITY TOOLBAR */}
        <div className="p5-a11y-toolbar" role="toolbar" aria-label="Accessibility settings">
          <div className="p5-toolbar-inner">
            <span className="p5-toolbar-label" id="toolbar-label">♿ A11y:</span>
            <button
              className={`p5-tool-btn ${highContrast ? "on" : ""}`}
              onClick={() => { setHighContrast(c=>!c); speak(highContrast?"High contrast off":"High contrast on"); }}
              aria-pressed={highContrast}
              aria-label="Toggle high contrast mode"
            >◑ Contrast</button>
            {["normal","large","xlarge"].map(s => (
              <button
                key={s}
                className={`p5-tool-btn ${textSize===s ? "on-yellow" : ""}`}
                onClick={() => { setTextSize(s); speak(`Text size set to ${s}`); }}
                aria-pressed={textSize===s}
                aria-label={`Text size ${s}`}
              >
                {s==="normal"?"A":s==="large"?"A+":"A++"}
              </button>
            ))}
            <button
              className={`p5-tool-btn ${reducedMotion ? "on-blue" : ""}`}
              onClick={() => { setReducedMotion(c=>!c); speak(reducedMotion?"Animations on":"Animations reduced"); }}
              aria-pressed={reducedMotion}
              aria-label="Toggle reduced motion"
            >🎞 Motion</button>
            <button
              className={`p5-tool-btn ${focusMode ? "on-purple" : ""}`}
              onClick={() => { setFocusMode(c=>!c); speak(focusMode?"Focus mode off":"Focus mode on"); }}
              aria-pressed={focusMode}
              aria-label="Toggle focus mode"
            >🔍 Focus</button>
            <button
              className="p5-tool-btn"
              onClick={() => speak("Welcome to UnifyTalk. This is Phase 5: Screen Reader and Voice Navigation. Use your voice or keyboard to navigate the page.")}
              aria-label="Read welcome message"
            >
              🔊 Read Welcome
            </button>
            <button
              className={`p5-tool-btn ${showHeadings ? "on-blue" : ""}`}
              onClick={() => setShowHeadings(!showHeadings)}
              aria-pressed={showHeadings}
              aria-label="Toggle heading navigation"
            >
              🏷 Headings
            </button>
            <button
              className={`p5-tool-btn ${showLandmarks ? "on-blue" : ""}`}
              onClick={() => setShowLandmarks(!showLandmarks)}
              aria-pressed={showLandmarks}
              aria-label="Toggle landmark navigation"
            >
              🗺 Landmarks
            </button>
            <button
              className={`p5-tool-btn ${showLinks ? "on-blue" : ""}`}
              onClick={() => setShowLinks(!showLinks)}
              aria-pressed={showLinks}
              aria-label="Toggle link navigator"
            >
              🔗 Links
            </button>
            <button
              className={`p5-tool-btn ${showPageStructure ? "on-blue" : ""}`}
              onClick={() => setShowPageStructure(!showPageStructure)}
              aria-pressed={showPageStructure}
              aria-label="Toggle page structure overview"
            >
              📑 Structure
            </button>
            <button
              className={`p5-tool-btn ${audioCues ? "on-green" : ""}`}
              onClick={() => setAudioCues(!audioCues)}
              aria-pressed={audioCues}
              aria-label="Toggle audio cues"
            >
              🔔 Cues
            </button>
            <button
              className="p5-tool-btn"
              onClick={() => speak(`Reading speed is ${readingSpeed === 0.75 ? "slow" : readingSpeed === 1 ? "normal" : "fast"}`)}
              aria-label={`Reading speed: ${readingSpeed === 0.75 ? "slow" : readingSpeed === 1 ? "normal" : "fast"}`}
            >
              ⏱ {readingSpeed === 0.75 ? "Slow" : readingSpeed === 1 ? "Normal" : "Fast"} Speed
            </button>
          </div>
        </div>

        {/* PAGE TITLE */}
        <div className="p5-title" role="heading" aria-level="1">
          <h2>Screen Reader & <span>Voice Navigation</span></h2>
          <p>Full accessibility support — navigate UnifyTalk using only your voice or keyboard. Zero sight or touch required.</p>
        </div>

        {/* ADVANCED ACCESSIBILITY PANELS */}
        {(showHeadings || showLandmarks || showLinks || showPageStructure) && (
          <div className="p5-a11y-panels">
            {/* HEADING NAVIGATOR */}
            {showHeadings && (
              <div className="p5-card" role="region" aria-label="Heading navigation">
                <div className="p5-card-header">
                  <span>🏷 Heading Navigator</span>
                  <button onClick={() => setShowHeadings(false)} aria-label="Close heading navigator" style={{background:"none",border:"none",cursor:"pointer",fontSize:"18px"}}>✕</button>
                </div>
                <div style={{padding:"16px 20px", display:"flex", flexDirection:"column", gap:"8px"}}>
                  {HEADINGS.map((h, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentHeadingIdx(idx); speak(`Heading ${idx + 1}: ${h.text}`); playAudioCue("heading"); }}
                      style={{padding:"10px 14px",borderRadius:"10px",border:"1px solid var(--border)",background:"var(--surface2)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}
                      onMouseEnter={(e) => e.target.style.background="rgba(56,189,248,0.1)"}
                      onMouseLeave={(e) => e.target.style.background="var(--surface2)"}
                      aria-label={`Heading level ${h.level}: ${h.text}`}
                    >
                      <span style={{marginRight:"8px"}}>{h.icon}</span>
                      <span style={{fontSize:"12px",color:"var(--muted)",marginRight:"6px"}}>H{h.level}</span>
                      <span style={{fontSize:"13px",fontWeight:"500",color:"var(--text)"}}>{h.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LANDMARK NAVIGATOR */}
            {showLandmarks && (
              <div className="p5-card" role="region" aria-label="Landmark navigation">
                <div className="p5-card-header">
                  <span>🗺 Landmark Navigator</span>
                  <button onClick={() => setShowLandmarks(false)} aria-label="Close landmark navigator" style={{background:"none",border:"none",cursor:"pointer",fontSize:"18px"}}>✕</button>
                </div>
                <div style={{padding:"16px 20px", display:"flex", flexDirection:"column", gap:"8px"}}>
                  {LANDMARKS.map((l, idx) => (
                    <button
                      key={idx}
                      onClick={() => { speak(`${l.label}: ${l.desc}`); playAudioCue("heading"); }}
                      style={{padding:"10px 14px",borderRadius:"10px",border:"1px solid var(--border)",background:"var(--surface2)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}
                      onMouseEnter={(e) => e.target.style.background="rgba(52,211,153,0.1)"}
                      onMouseLeave={(e) => e.target.style.background="var(--surface2)"}
                      aria-label={`${l.label}: ${l.desc}`}
                    >
                      <span style={{fontSize:"12px",color:"var(--accent4)",marginRight:"8px",fontWeight:"600"}}>role={l.role}</span>
                      <span style={{fontSize:"13px",fontWeight:"500",color:"var(--text)"}}>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LINK NAVIGATOR */}
            {showLinks && (
              <div className="p5-card" role="region" aria-label="Link navigator">
                <div className="p5-card-header">
                  <span>🔗 Link Navigator ({PAGE_LINKS.length} links)</span>
                  <button onClick={() => setShowLinks(false)} aria-label="Close link navigator" style={{background:"none",border:"none",cursor:"pointer",fontSize:"18px"}}>✕</button>
                </div>
                <div style={{padding:"16px 20px", display:"flex", flexDirection:"column", gap:"8px"}}>
                  {PAGE_LINKS.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => { speak(`Link: ${link.text}`); playAudioCue("link"); }}
                      style={{padding:"10px 14px",borderRadius:"10px",border:"1px solid var(--border)",background:"var(--surface2)",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}
                      onMouseEnter={(e) => e.target.style.background="rgba(56,189,248,0.1)"}
                      onMouseLeave={(e) => e.target.style.background="var(--surface2)"}
                      aria-label={`Link: ${link.text}`}
                    >
                      <span style={{marginRight:"8px"}}>{link.icon}</span>
                      <span style={{fontSize:"13px",fontWeight:"500",color:"var(--text)"}}>{link.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE STRUCTURE */}
            {showPageStructure && (
              <div className="p5-card" role="region" aria-label="Page structure overview">
                <div className="p5-card-header">
                  <span>📑 Page Structure Overview</span>
                  <button onClick={() => setShowPageStructure(false)} aria-label="Close page structure" style={{background:"none",border:"none",cursor:"pointer",fontSize:"18px"}}>✕</button>
                </div>
                <div style={{padding:"16px 20px", fontSize:"13px", lineHeight:"1.8", fontFamily:"monospace", color:"var(--text)"}}>
                  <div>📄 <strong>HTML Document Structure</strong></div>
                  <div style={{marginLeft:"20px",color:"var(--muted)"}}>
                    <div>├─ &lt;header role="banner"&gt; - Site Header</div>
                    <div>├─ &lt;nav role="navigation"&gt; - Navigation Menu</div>
                    <div>├─ &lt;main role="main"&gt; - Primary Content</div>
                    <div style={{marginLeft:"20px"}}>
                      <div>├─ &lt;heading&gt; - Page Title (H1)</div>
                      <div style={{marginLeft:"20px"}}>
                        <div>├─ &lt;section&gt; - Content Sections (H2)</div>
                        <div style={{marginLeft:"20px"}}>
                          <div>├─ &lt;div&gt; - Interactive Elements</div>
                        </div>
                      </div>
                    </div>
                    <div>├─ &lt;aside role="complementary"&gt; - Sidebar</div>
                    <div>└─ &lt;footer role="contentinfo"&gt; - Footer</div>
                  </div>
                  <div style={{marginTop:"12px",color:"var(--accent4)"}}>💡 Use landmark navigation to jump between sections</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN LAYOUT */}
        <main id="main-content" className="p5-layout" role="main" aria-label="Main content">

          {/* SCREEN READER DEMO */}
          <div className="p5-card" role="region" aria-label="Screen reader demonstration">
            <div className="p5-card-header">
              <span>📖 Screen Reader Elements</span>
              <span style={{fontSize:11,color:"var(--muted)",fontWeight:400}}>
                {readingIdx !== null ? `Reading ${readProgress}%` : "Tap to hear description"}
              </span>
            </div>
            {readingIdx !== null && (
              <div style={{padding:"8px 20px",borderBottom:"1px solid var(--border)"}}>
                <div className="p5-reading-bar">
                  <div className="p5-reading-fill" style={{width:`${readProgress}%`}} />
                </div>
              </div>
            )}
            <div className="p5-sr-area" role="list" aria-label="Page elements list">
              {SR_ELEMENTS.map((el,i) => (
                <div
                  key={i}
                  className={`p5-sr-element ${readingIdx===i ? "reading" : ""}`}
                  role="listitem"
                  tabIndex={0}
                  onClick={() => speak(`${el.role}. ${el.label}. ${el.desc}`)}
                  onKeyDown={e => { if(e.key==="Enter"||e.key===" ") speak(`${el.role}. ${el.label}. ${el.desc}`); }}
                  aria-label={`${el.label}. ${el.desc}`}
                >
                  <div className="p5-sr-icon" aria-hidden="true">{el.icon}</div>
                  <div className="p5-sr-content">
                    <div className="p5-sr-role">{el.role}</div>
                    <div className="p5-sr-label">{el.label}</div>
                    <div className="p5-sr-desc">{el.desc}</div>
                  </div>
                  <div className="p5-sr-aria" aria-hidden="true">{el.aria}</div>
                </div>
              ))}
            </div>

            {/* LIVE REGION */}
            <div className="p5-live-region">
              <div className="p5-live-label">🔊 Live Region (aria-live)</div>
              <div
                className="p5-live-text"
                role="log"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Screen reader output"
              >
                {liveText}
              </div>
            </div>
          </div>

          {/* VOICE COMMANDS */}
          <div className="p5-card" role="region" aria-label="Voice commands reference">
            <div className="p5-card-header">
              <span>🎙️ Voice Commands</span>
              <span style={{fontSize:11,color:"var(--muted)",fontWeight:400}}>Say any command below</span>
            </div>
            <div className="p5-cmd-list" role="list" aria-label="Available voice commands">
              {COMMANDS.map((cmd,i) => (
                <div
                  key={i}
                  className={`p5-cmd-item ${triggeredCmd===cmd.keyword ? "triggered" : ""}`}
                  role="listitem"
                  tabIndex={0}
                  onClick={() => handleVoiceCommand(cmd.keyword)}
                  onKeyDown={e => { if(e.key==="Enter") handleVoiceCommand(cmd.keyword); }}
                  aria-label={`Command: ${cmd.keyword}. ${cmd.desc}`}
                >
                  <div className="p5-cmd-keyword" aria-hidden="true">"{cmd.keyword}"</div>
                  <div className="p5-cmd-desc">{cmd.desc}</div>
                  <div className="p5-cmd-icon" aria-hidden="true">{cmd.icon}</div>
                </div>
              ))}
            </div>
          </div>

          {/* KEYBOARD NAVIGATION */}
          <div className="p5-card" role="region" aria-label="Keyboard navigation shortcuts">
            <div className="p5-card-header">
              <span>⌨️ Keyboard Navigation</span>
              <span style={{fontSize:11,color:"var(--muted)",fontWeight:400}}>Full keyboard support</span>
            </div>
            <div className="p5-kb-grid" role="list" aria-label="Keyboard shortcuts">
              {KB_SHORTCUTS.map((s,i) => (
                <div
                  key={i}
                  className="p5-kb-item"
                  role="listitem"
                  tabIndex={0}
                  onClick={() => speak(`Key ${s.key}. ${s.action}`)}
                  onKeyDown={e => { if(e.key==="Enter") speak(`Key ${s.key}. ${s.action}`); }}
                  aria-label={`${s.key}: ${s.action}`}
                >
                  <div className="p5-kb-key" aria-hidden="true">{s.key}</div>
                  <div className="p5-kb-action">{s.action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* BRAILLE OUTPUT */}
          <div className="p5-card" role="region" aria-label="Braille output converter">
            <div className="p5-card-header">
              <span>⠃⠗⠁⠊⠇⠇⠑ Braille Output</span>
              <span style={{fontSize:11,color:"var(--muted)",fontWeight:400}}>Grade 1 Braille</span>
            </div>
            <div className="p5-braille-area">
              <div>
                <label className="p5-braille-label" htmlFor="braille-input" style={{display:"block",marginBottom:6}}>
                  Type text to convert to Braille:
                </label>
                <input
                  id="braille-input"
                  ref={brailleInputRef}
                  className="p5-braille-input"
                  value={brailleInput}
                  onChange={e => setBrailleInput(e.target.value.slice(0,24))}
                  placeholder="Type here…"
                  maxLength={24}
                  aria-label="Text to convert to braille"
                  aria-describedby="braille-output"
                />
              </div>

              <div
                className="p5-braille-display"
                id="braille-output"
                role="region"
                aria-label={`Braille output for: ${brailleInput}`}
                aria-live="polite"
              >
                <div className="p5-braille-label">Braille representation:</div>
                <div className="p5-braille-chars">
                  {brailleChars.map((c,i) => (
                    <div key={i} className="p5-braille-char" title={`${c.char} in braille`}>
                      <div className="p5-braille-dot" aria-hidden="true">{c.dot}</div>
                      <div className="p5-braille-letter">{c.char}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                padding:"12px 16px", borderRadius:12,
                background:"rgba(245,158,11,0.07)",
                border:"1px solid rgba(245,158,11,0.18)",
                fontSize:12, color:"var(--muted)", lineHeight:1.6
              }}>
                ℹ️ In a full deployment, this output connects to a <strong style={{color:"var(--text)"}}>Braille display device</strong> via USB or Bluetooth, rendering the dots physically for blind users.
              </div>

              <div style={{display:"flex",gap:"10px"}}>
                <button
                  className="p5-btn p5-btn-green"
                  style={{flex:1}}
                  onClick={() => speak(brailleInput || "Nothing to read")}
                  aria-label={`Read aloud: ${brailleInput}`}
                >
                  🔊 Read Aloud
                </button>
                <button
                  className="p5-btn p5-btn-outline"
                  onClick={() => { navigator.clipboard?.writeText(brailleChars.map(c=>c.dot).join("")); showToast("📋 Braille copied!"); }}
                  aria-label="Copy braille characters"
                >
                  📋 Copy Braille
                </button>
              </div>
            </div>

            {/* ARIA SHOWCASE */}
            <div className="p5-card-header" style={{borderTop:"1px solid var(--border)"}}>
              <span>🏷️ ARIA Labels in Use</span>
            </div>
            <div className="p5-aria-demo" role="list" aria-label="ARIA attributes used in this page">
              {[
                { tag:'role="main"',          desc:"Marks the <strong>primary content area</strong> — screen readers jump here with a shortcut" },
                { tag:'aria-live="polite"',    desc:"Announces <strong>new messages</strong> automatically without interrupting current reading" },
                { tag:'aria-label="…"',        desc:"Provides a <strong>text description</strong> for elements that lack visible labels (icons, buttons)" },
                { tag:'aria-pressed={bool}',   desc:"Tells screen readers whether a <strong>toggle button</strong> is on or off" },
                { tag:'tabIndex={0}',          desc:"Makes <strong>non-interactive elements</strong> keyboard-focusable for navigation" },
              ].map((a,i) => (
                <div key={i} className="p5-aria-item" role="listitem">
                  <div className="p5-aria-header" aria-label={`ARIA attribute: ${a.tag}`}>
                    <span>⌨</span> <code>{a.tag}</code>
                  </div>
                  <div
                    className="p5-aria-body"
                    dangerouslySetInnerHTML={{__html: a.desc}}
                  />
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* FOOTER */}
        <footer className="p5-footer" role="contentinfo">
          Made with ❤️ by Ansika &nbsp;·&nbsp; <span>UnifyTalk</span> &nbsp;·&nbsp; Phase 5 of 6 — Screen Reader & Voice Navigation
        </footer>

        {toast && (
          <div className={`p5-toast ${toast.type}`} role="alert" aria-live="assertive">
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
