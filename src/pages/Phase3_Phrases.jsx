import { useState, useEffect, useCallback } from "react";
import { getPhrases, createPhrase, deletePhrase } from '../api';
import SmartPhrases from '../components/SmartPhrases';

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
  }

  /* ACCESSIBILITY */
  .p3-skip-link {
    position: fixed; top: -100px; left: 16px; z-index: 9999;
    background: var(--accent); color: #06080f; padding: 10px 20px;
    border-radius: 8px; font-weight: 700; transition: top 0.2s;
    text-decoration: none;
  }
  .p3-skip-link:focus { top: 16px; outline: 3px solid white; }

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

  .p3-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .p3-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 50% at 0% 30%, rgba(56,189,248,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 60% at 100% 60%, rgba(129,140,248,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 50% 100%, rgba(52,211,153,0.05) 0%, transparent 60%);
  }

  /* HEADER */
  .p3-header {
    position: relative; z-index: 10;
    padding: 16px 32px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
    background: rgba(6,8,15,0.88);
    backdrop-filter: blur(14px);
  }

  .p3-logo {
    display: flex; align-items: center; gap: 10px;
  }

  .p3-logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 4px 14px rgba(56,189,248,0.3);
  }

  .p3-logo-text {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .p3-phase-badge {
    font-size: 11px; padding: 4px 12px; border-radius: 100px;
    background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.28);
    color: var(--accent5); font-weight: 600; letter-spacing: 0.5px;
  }

  /* PAGE TITLE */
  .p3-title {
    position: relative; z-index: 5;
    text-align: center; padding: 40px 24px 28px;
  }

  .p3-title h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(24px, 4vw, 40px); font-weight: 800; margin-bottom: 10px;
  }

  .p3-title h2 span {
    background: linear-gradient(90deg, var(--accent4), var(--accent5));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .p3-title p { color: var(--muted); font-size: 15px; max-width: 500px; margin: 0 auto; line-height: 1.6; }

  /* TAB BAR */
  .p3-tabbar {
    position: relative; z-index: 5;
    max-width: 1100px; margin: 0 auto;
    padding: 0 24px 20px;
    display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
  }

  .p3-tab {
    padding: 10px 22px; border-radius: 14px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--muted); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.22s;
    font-family: 'Syne', sans-serif;
    display: flex; align-items: center; gap: 8px;
  }
  .p3-tab:hover { border-color: var(--accent2); color: var(--text); }
  .p3-tab.active {
    background: rgba(129,140,248,0.15);
    border-color: var(--accent2); color: var(--accent2);
    box-shadow: 0 0 18px rgba(129,140,248,0.15);
  }
  .p3-tab.active-green {
    background: rgba(52,211,153,0.12);
    border-color: var(--accent4); color: var(--accent4);
    box-shadow: 0 0 18px rgba(52,211,153,0.12);
  }
  .p3-tab.active-amber {
    background: rgba(245,158,11,0.12);
    border-color: var(--accent5); color: var(--accent5);
    box-shadow: 0 0 18px rgba(245,158,11,0.12);
  }
  .p3-tab.active-red {
    background: rgba(251,113,133,0.12);
    border-color: var(--accent3); color: var(--accent3);
    box-shadow: 0 0 18px rgba(251,113,133,0.12);
  }

  /* MAIN */
  .p3-main {
    position: relative; z-index: 5;
    max-width: 1100px; margin: 0 auto;
    padding: 0 24px 48px;
  }

  /* ── QUICK PHRASES TAB ── */
  .p3-qp-layout {
    display: grid; grid-template-columns: 1fr 360px; gap: 24px;
  }
  @media(max-width:780px){ .p3-qp-layout { grid-template-columns: 1fr; } }

  .p3-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 22px; overflow: hidden;
    box-shadow: 0 16px 40px rgba(0,0,0,0.35);
  }

  .p3-card-header {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface2);
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    gap: 10px;
  }

  .p3-card-header-left { display: flex; align-items: center; gap: 8px; }

  /* CATEGORY FILTER CHIPS */
  .p3-filter-chips {
    display: flex; gap: 8px; padding: 14px 20px 8px; flex-wrap: wrap;
  }

  .p3-chip {
    padding: 6px 14px; border-radius: 100px;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--muted); font-size: 12px; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 5px;
  }
  .p3-chip:hover { border-color: var(--accent4); color: var(--text); }
  .p3-chip.active {
    background: rgba(52,211,153,0.12); border-color: var(--accent4); color: var(--accent4);
  }

  /* PHRASE GRID */
  .p3-phrase-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px; padding: 16px 20px 20px;
    max-height: 480px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }

  .p3-phrase-card {
    padding: 16px 14px; border-radius: 16px;
    border: 1px solid var(--border); background: var(--surface2);
    cursor: pointer; transition: all 0.22s;
    display: flex; flex-direction: column; gap: 8px;
    position: relative; overflow: hidden;
  }

  .p3-phrase-card::after {
    content: ''; position: absolute;
    inset: 0; border-radius: 16px;
    background: linear-gradient(135deg, rgba(52,211,153,0.08), rgba(56,189,248,0.04));
    opacity: 0; transition: opacity 0.2s;
    pointer-events: none;
  }

  .p3-phrase-card:hover {
    border-color: var(--accent4); transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.3);
  }
  .p3-phrase-card:hover::after { opacity: 1; }
  .p3-phrase-card:active { transform: scale(0.97); }

  .p3-phrase-icon { font-size: 28px; }
  .p3-phrase-text { font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.4; }
  .p3-phrase-cat {
    font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.6px;
  }

  .p3-phrase-card.custom {
    border-color: rgba(245,158,11,0.3);
    background: rgba(245,158,11,0.05);
  }
  .p3-phrase-card.custom:hover { border-color: var(--accent5); }

  /* ADD CUSTOM FORM */
  .p3-add-form { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }

  .p3-input-group { display: flex; flex-direction: column; gap: 6px; }

  .p3-label { font-size: 12px; color: var(--muted); font-weight: 500; }

  .p3-input, .p3-textarea, .p3-select {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 12px; color: var(--text);
    padding: 11px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; width: 100%; transition: border-color 0.2s;
  }
  .p3-input:focus, .p3-textarea:focus, .p3-select:focus {
    outline: none; border-color: var(--accent2);
    box-shadow: 0 0 0 3px rgba(129,140,248,0.1);
  }
  .p3-textarea { resize: none; min-height: 80px; line-height: 1.5; }
  .p3-select { cursor: pointer; }
  .p3-select option { background: var(--surface2); }

  .p3-emoji-picker {
    display: flex; gap: 8px; flex-wrap: wrap;
  }

  .p3-emoji-opt {
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--surface2);
    font-size: 18px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .p3-emoji-opt:hover { border-color: var(--accent2); transform: scale(1.1); }
  .p3-emoji-opt.picked { border-color: var(--accent4); background: rgba(52,211,153,0.12); }

  .p3-btn {
    padding: 12px 20px; border-radius: 12px; border: none;
    cursor: pointer; font-weight: 700; font-family: 'Syne', sans-serif;
    font-size: 13px; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .p3-btn-primary {
    background: linear-gradient(135deg, var(--accent4), var(--accent));
    color: #06080f;
  }
  .p3-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(52,211,153,0.3); }

  .p3-btn-secondary {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--muted);
  }
  .p3-btn-secondary:hover { border-color: var(--accent2); color: var(--text); }

  /* ── EMOTION PANEL TAB ── */
  .p3-emotion-layout {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  }
  @media(max-width:700px){ .p3-emotion-layout { grid-template-columns: 1fr; } }

  /* BIG EMOTION CARDS */
  .p3-big-emotions {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
    padding: 20px;
  }

  .p3-emo-card {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 22px 10px; border-radius: 20px;
    border: 2px solid var(--border); background: var(--surface2);
    cursor: pointer; transition: all 0.25s;
    position: relative; overflow: hidden;
  }

  .p3-emo-card::before {
    content: ''; position: absolute; inset: 0;
    opacity: 0; transition: opacity 0.25s;
    border-radius: 20px;
  }

  .p3-emo-card:hover { transform: translateY(-4px) scale(1.03); }
  .p3-emo-card:hover::before { opacity: 1; }
  .p3-emo-card:active { transform: scale(0.96); }

  .p3-emo-card.e-happy  { --ec: #34d399; --eb: rgba(52,211,153,0.12); }
  .p3-emo-card.e-happy::before  { background: radial-gradient(circle at 50% 100%, rgba(52,211,153,0.15), transparent 70%); }
  .p3-emo-card.e-sad    { --ec: #38bdf8; --eb: rgba(56,189,248,0.12); }
  .p3-emo-card.e-sad::before    { background: radial-gradient(circle at 50% 100%, rgba(56,189,248,0.15), transparent 70%); }
  .p3-emo-card.e-angry  { --ec: #fb7185; --eb: rgba(251,113,133,0.12); }
  .p3-emo-card.e-angry::before  { background: radial-gradient(circle at 50% 100%, rgba(251,113,133,0.15), transparent 70%); }
  .p3-emo-card.e-scared { --ec: #f59e0b; --eb: rgba(245,158,11,0.12); }
  .p3-emo-card.e-scared::before { background: radial-gradient(circle at 50% 100%, rgba(245,158,11,0.15), transparent 70%); }
  .p3-emo-card.e-tired  { --ec: #818cf8; --eb: rgba(129,140,248,0.12); }
  .p3-emo-card.e-tired::before  { background: radial-gradient(circle at 50% 100%, rgba(129,140,248,0.15), transparent 70%); }
  .p3-emo-card.e-love   { --ec: #fb7185; --eb: rgba(251,113,133,0.16); }
  .p3-emo-card.e-love::before   { background: radial-gradient(circle at 50% 100%, rgba(251,113,133,0.18), transparent 70%); }
  .p3-emo-card.e-excited{ --ec: #f59e0b; --eb: rgba(245,158,11,0.14); }
  .p3-emo-card.e-excited::before{ background: radial-gradient(circle at 50% 100%, rgba(245,158,11,0.16), transparent 70%); }
  .p3-emo-card.e-confused{--ec: #38bdf8; --eb: rgba(56,189,248,0.12); }
  .p3-emo-card.e-confused::before{background: radial-gradient(circle at 50% 100%, rgba(56,189,248,0.14), transparent 70%); }
  .p3-emo-card.e-pain   { --ec: #f43f5e; --eb: rgba(244,63,94,0.12); }
  .p3-emo-card.e-pain::before   { background: radial-gradient(circle at 50% 100%, rgba(244,63,94,0.15), transparent 70%); }

  .p3-emo-card.selected-e {
    border-color: var(--ec);
    background: var(--eb);
    box-shadow: 0 0 24px rgba(0,0,0,0.2), 0 0 0 1px var(--ec);
    transform: scale(1.05);
  }

  .p3-emo-emoji { font-size: 36px; position: relative; z-index: 1; }
  .p3-emo-label {
    font-size: 12px; font-weight: 700; color: var(--ec, var(--muted));
    position: relative; z-index: 1; text-transform: uppercase; letter-spacing: 0.5px;
  }

  /* INTENSITY SLIDER */
  .p3-intensity-section { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

  .p3-intensity-label {
    font-size: 13px; font-weight: 600; color: var(--text);
    display: flex; justify-content: space-between; align-items: center;
  }

  .p3-intensity-val {
    font-size: 20px; font-weight: 800; font-family: 'Syne', sans-serif;
    background: linear-gradient(90deg, var(--accent2), var(--accent3));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .p3-slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 6px; border-radius: 100px;
    background: var(--border); outline: none; cursor: pointer;
  }

  .p3-slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 20px; height: 20px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent2), var(--accent3));
    cursor: pointer; box-shadow: 0 2px 8px rgba(129,140,248,0.4);
    transition: transform 0.15s;
  }
  .p3-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }

  .p3-intensity-labels {
    display: flex; justify-content: space-between;
    font-size: 11px; color: var(--muted);
  }

  /* EMOTION MESSAGE BUILDER */
  .p3-emo-message {
    padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;
    border-top: 1px solid var(--border);
  }

  .p3-emo-preview {
    padding: 16px 18px; border-radius: 14px;
    background: rgba(129,140,248,0.08);
    border: 1px solid rgba(129,140,248,0.18);
    font-size: 15px; line-height: 1.6; color: var(--text);
    min-height: 60px;
  }

  .p3-emo-preview strong { color: var(--accent2); }

  .p3-emo-btn-row { display: flex; gap: 10px; }

  /* ── SOS PANEL ── */
  .p3-sos-layout { display: flex; flex-direction: column; gap: 20px; }

  .p3-sos-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px; padding: 20px;
  }

  .p3-sos-btn {
    padding: 24px 16px; border-radius: 20px;
    border: 2px solid; cursor: pointer;
    transition: all 0.22s; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    font-family: 'DM Sans', sans-serif;
  }

  .p3-sos-btn:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.3); }
  .p3-sos-btn:active { transform: scale(0.96); }

  .p3-sos-icon { font-size: 40px; }
  .p3-sos-label { font-size: 15px; font-weight: 700; }
  .p3-sos-desc  { font-size: 12px; opacity: 0.75; line-height: 1.4; }

  .sos-red    { background: rgba(244,63,94,0.1);  border-color: rgba(244,63,94,0.35);  color: #f43f5e; }
  .sos-amber  { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.35); color: #f59e0b; }
  .sos-blue   { background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.35); color: #38bdf8; }
  .sos-green  { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.35); color: #34d399; }
  .sos-purple { background: rgba(129,140,248,0.1);border-color: rgba(129,140,248,0.35);color: #818cf8; }
  .sos-pink   { background: rgba(251,113,133,0.1);border-color: rgba(251,113,133,0.35);color: #fb7185; }

  /* TOAST */
  .p3-toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    padding: 12px 24px; border-radius: 100px;
    font-size: 13px; font-weight: 600; z-index: 999;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease; white-space: nowrap;
    display: flex; align-items: center; gap: 8px;
  }
  .p3-toast.green { background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); color: var(--accent4); }
  .p3-toast.red   { background: rgba(244,63,94,0.15);  border: 1px solid rgba(244,63,94,0.3);  color: var(--danger); }
  .p3-toast.blue  { background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); color: var(--accent); }
  @keyframes toastIn {
    from { opacity:0; transform: translateX(-50%) translateY(14px); }
    to   { opacity:1; transform: translateX(-50%) translateY(0); }
  }

  /* FOOTER */
  .p3-footer {
    position: relative; z-index: 5; text-align: center;
    padding: 20px; border-top: 1px solid var(--border);
    font-size: 12px; color: var(--muted);
  }
  .p3-footer span {
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700;
  }

  @media(max-width:600px){
    .p3-header { padding: 14px 16px; }
    .p3-main { padding: 0 12px 32px; }
    .p3-big-emotions { grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .p3-emo-emoji { font-size: 28px; }
    .p3-sos-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ── DATA ──────────────────────────────────────────────────────────────

const PHRASE_CATS = ["All", "Greetings", "Needs", "Medical", "Daily", "Social", "Emergency"];

const DEFAULT_PHRASES = [
  { id:1,  cat:"Greetings", icon:"👋", text:"Hello, nice to meet you!" },
  { id:2,  cat:"Greetings", icon:"😊", text:"Good morning! How are you?" },
  { id:3,  cat:"Greetings", icon:"🌙", text:"Good night, sleep well." },
  { id:4,  cat:"Greetings", icon:"🤝", text:"Thank you so much." },
  { id:5,  cat:"Needs",     icon:"💧", text:"I need some water please." },
  { id:6,  cat:"Needs",     icon:"🍽️", text:"I am hungry, can I have food?" },
  { id:7,  cat:"Needs",     icon:"🚻", text:"Where is the restroom?" },
  { id:8,  cat:"Needs",     icon:"😴", text:"I need to rest for a while." },
  { id:9,  cat:"Medical",   icon:"😷", text:"I am not feeling well today." },
  { id:10, cat:"Medical",   icon:"💊", text:"I need my medication now." },
  { id:11, cat:"Medical",   icon:"🤕", text:"I have pain here, please help." },
  { id:12, cat:"Medical",   icon:"👨‍⚕️", text:"Please call a doctor urgently." },
  { id:13, cat:"Daily",     icon:"🚶", text:"I want to go for a walk." },
  { id:14, cat:"Daily",     icon:"📱", text:"Can I use your phone please?" },
  { id:15, cat:"Daily",     icon:"📍", text:"I am lost, please help me." },
  { id:16, cat:"Daily",     icon:"🏠", text:"I want to go home now." },
  { id:17, cat:"Social",    icon:"🙂", text:"I understand, thank you." },
  { id:18, cat:"Social",    icon:"🔄", text:"Can you repeat that slowly?" },
  { id:19, cat:"Social",    icon:"✍️", text:"Can you write that down for me?" },
  { id:20, cat:"Social",    icon:"🤔", text:"I don't understand, please explain." },
  { id:21, cat:"Emergency", icon:"🆘", text:"EMERGENCY! I need help immediately!" },
  { id:22, cat:"Emergency", icon:"☎️", text:"Please call 112 right now!" },
  { id:23, cat:"Emergency", icon:"😰", text:"I am in danger, please stay with me." },
  { id:24, cat:"Emergency", icon:"👨‍👩‍👧", text:"Please contact my family." },
];

const EMOTIONS_DATA = [
  { id:"happy",   cls:"e-happy",   emoji:"😊", label:"Happy",   msgs:["I am feeling really happy right now!", "Today is a great day for me.", "I feel joyful and at peace."] },
  { id:"sad",     cls:"e-sad",     emoji:"😢", label:"Sad",     msgs:["I am feeling sad today.", "I feel down and need some comfort.", "I am upset about something."] },
  { id:"angry",   cls:"e-angry",   emoji:"😡", label:"Angry",   msgs:["I am feeling angry right now.", "Something upset me a lot.", "I need some space to calm down."] },
  { id:"scared",  cls:"e-scared",  emoji:"😨", label:"Scared",  msgs:["I am feeling scared and anxious.", "Something is frightening me.", "I feel unsafe and need help."] },
  { id:"tired",   cls:"e-tired",   emoji:"😴", label:"Tired",   msgs:["I am very tired and exhausted.", "I need to rest soon.", "I have no energy left today."] },
  { id:"love",    cls:"e-love",    emoji:"🥰", label:"Loved",   msgs:["I am feeling loved and cared for.", "I feel grateful for the people around me.", "I feel warmth and kindness today."] },
  { id:"excited", cls:"e-excited", emoji:"🤩", label:"Excited", msgs:["I am super excited about this!", "I can't wait — I feel thrilled!", "I am really looking forward to this."] },
  { id:"confused",cls:"e-confused",emoji:"😕", label:"Confused",msgs:["I am confused and need help.", "I don't understand what is happening.", "Can someone explain this to me?"] },
  { id:"pain",    cls:"e-pain",    emoji:"🤕", label:"In Pain",  msgs:["I am in pain and need attention.", "I am hurting and need medical help.", "Something is causing me pain."] },
];

const SOS_ACTIONS = [
  { cls:"sos-red",    icon:"🆘", label:"Emergency",      desc:"I need immediate help!" },
  { cls:"sos-amber",  icon:"👨‍⚕️", label:"Medical Help",   desc:"Call a doctor or nurse now." },
  { cls:"sos-blue",   icon:"☎️", label:"Call 112",        desc:"Contact emergency services." },
  { cls:"sos-green",  icon:"👨‍👩‍👧", label:"Contact Family",  desc:"Please reach my family." },
  { cls:"sos-purple", icon:"🔒", label:"Feel Unsafe",     desc:"I feel threatened right now." },
  { cls:"sos-pink",   icon:"😰", label:"Panic Attack",    desc:"I'm having a panic attack." },
];

const EMOJI_OPTS = ["😊","😢","😡","😨","🥰","🤩","😴","🤕","✅","❌","🙏","👋","💧","🍽️","🆘","☎️","💊","🏠","📍","🤔"];
const INTENSITY_LABELS = ["Mild","Low","Moderate","High","Intense","Very Intense","Overwhelming","Critical","Extreme","Maximum"];

// ── COMPONENT ─────────────────────────────────────────────────────────
export default function UnifyTalkPhase3() {
  const [activeTab, setActiveTab]         = useState("phrases");
  const [filterCat, setFilterCat]         = useState("All");
  const [phrases]                        = useState(DEFAULT_PHRASES);
  const [customPhrases, setCustomPhrases] = useState([]);
  const [newText, setNewText]             = useState("");
  const [newCat, setNewCat]               = useState("Daily");
  const [newEmoji, setNewEmoji]           = useState("😊");
  const [selEmotion, setSelEmotion]       = useState(null);
  const [intensity, setIntensity]         = useState(5);
  const [selMsg, setSelMsg]               = useState(0);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [toast, setToast]                 = useState(null);
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  // Load custom phrases from backend on mount
  useEffect(() => {
    getPhrases().then(r => {
      const backendPhrases = r.data.map(p => ({
        id: p._id, cat: p.cat, icon: p.icon, text: p.text, custom: true, _backendId: p._id
      }));
      setCustomPhrases(backendPhrases);
    }).catch(() => {});
  }, []);

  const showToast = useCallback((msg, type = "green") => {
    setToast({ msg, type });
    announce(msg);
    setTimeout(() => setToast(null), 2400);
  }, [setToast, announce]);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) { showToast("⚠️ TTS not supported or empty text", "red"); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.05;
    window.lastUtterance = u; // Prevent garbage collection bug in Chrome
    u.onstart = () => { setIsSpeaking(true); announce("Speaking message"); };
    u.onend   = () => setIsSpeaking(false);
    u.onerror = (e) => { console.error("Speech error", e); setIsSpeaking(false); };
    window.speechSynthesis.speak(u);
    showToast("🔊 Speaking…", "blue");
    if (navigator.vibrate) navigator.vibrate(40);
  }, [announce, showToast]);

  const copy = useCallback((text) => {
    navigator.clipboard?.writeText(text).then(() => showToast("📋 Copied to clipboard!"));
    if (navigator.vibrate) navigator.vibrate(40);
  }, [showToast]);

  const allPhrases  = [...phrases, ...customPhrases];
  const filtered    = filterCat === "All" ? allPhrases : allPhrases.filter(p => p.cat === filterCat);

  const addCustomPhrase = () => {
    if (!newText.trim()) { showToast("⚠️ Please type a phrase first", "red"); return; }
    const p = { id: Date.now(), cat: newCat, icon: newEmoji, text: newText.trim(), custom: true };
    setCustomPhrases(prev => [p, ...prev]);
    setNewText(""); setNewEmoji("😊");
    showToast("✅ Phrase saved!");
    if (navigator.vibrate) navigator.vibrate([40, 40]);
    // Persist to backend
    createPhrase({ text: p.text, cat: p.cat, icon: p.icon })
      .then(r => {
        setCustomPhrases(prev => prev.map(x => x.id === p.id ? { ...x, _backendId: r.data._id } : x));
      }).catch(() => {});
  };

  const deleteCustom = (id) => {
    const phrase = customPhrases.find(p => p.id === id);
    setCustomPhrases(prev => prev.filter(p => p.id !== id));
    showToast("🗑 Phrase deleted", "red");
    if (navigator.vibrate) navigator.vibrate(40);
    // Delete from backend if it was synced
    if (phrase?._backendId) {
      deletePhrase(phrase._backendId).catch(() => {});
    }
  };

  const emotionMessage = useCallback(() => {
    if (!selEmotion) return "";
    const lvl = INTENSITY_LABELS[Math.min(intensity - 1, 9)];
    return `I am feeling ${selEmotion.label.toLowerCase()} — ${lvl.toLowerCase()} level. ${selEmotion.msgs[selMsg]}`;
  }, [selEmotion, intensity, selMsg]);

  const handleSOS = (action) => {
    speak(action.desc);
    showToast(`🚨 ${action.label} alert sent!`, "red");
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
  };

  useEffect(() => {
    const handleKeys = (e) => {
      // Alt + 1-3 for Tabs
      if (e.altKey && e.key === '1') { e.preventDefault(); setActiveTab("phrases"); announce("Switched to Quick Phrases"); }
      if (e.altKey && e.key === '2') { e.preventDefault(); setActiveTab("emotions"); announce("Switched to Emotion Panel"); }
      if (e.altKey && e.key === '3') { e.preventDefault(); setActiveTab("sos"); announce("Switched to SOS Alerts"); }
      
      // Alt + S to Speak (if emotion selected or in SOS)
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeTab === "emotions" && selEmotion) speak(emotionMessage());
      }
      
      // Alt + C to Copy (if emotion selected)
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (activeTab === "emotions" && selEmotion) copy(emotionMessage());
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [activeTab, selEmotion, intensity, selMsg, announce, speak, copy, emotionMessage]);

  useEffect(() => {
    document.title = "Phrases & Emotions | UnifyTalk";
  }, []);

  const TABS = [
    { id:"phrases",  label:"⚡ Quick Phrases",  active:"active-green" },
    { id:"emotions", label:"💖 Emotion Panel",  active:"active" },
    { id:"sos",      label:"🆘 SOS Alerts",     active:"active-red" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="p3-root" role="application" aria-label="Phrases and Emotions Panel">
        <div className="p3-bg" aria-hidden="true" />
        
        <a href="#main-phrases" className="p3-skip-link">Skip to phrases content</a>

        {/* ARIA ANNOUNCEMENT REGION */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {/* KEYBOARD SHORTCUTS GUIDE FOR SCREEN READERS */}
        <div className="sr-only">
          Keyboard Shortcuts: 
          Alt + 1: Quick Phrases tab. 
          Alt + 2: Emotion Panel tab. 
          Alt + 3: SOS Alerts tab. 
          Alt + S: Speak current emotion message. 
          Alt + C: Copy current emotion message.
        </div>

        {/* HEADER */}
        <header className="p3-header">
          <div className="p3-logo">
            <div className="p3-logo-icon" aria-hidden="true">🤝</div>
            <div className="p3-logo-text">UnifyTalk</div>
          </div>
          <div className="p3-phase-badge">Phase 3 — Phrases & Emotions</div>
        </header>

        <main id="main-phrases">
          {/* PAGE TITLE */}
          <section className="p3-title" aria-labelledby="page-title">
            <h2 id="page-title">Express Yourself <span>Instantly</span></h2>
            <p>One-tap pre-saved phrases, a deep emotion panel with intensity control, and emergency SOS alerts — all in one place.</p>
          </section>

          {/* TAB BAR */}
          <nav className="p3-tabbar" aria-label="Feature tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`p3-tab ${activeTab === t.id ? t.active : ""}`}
                onClick={() => { setActiveTab(t.id); announce(`Switched to ${t.label}`); }}
                aria-pressed={activeTab === t.id}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* MAIN CONTENT AREA */}
          <div className="p3-main">

            {/* ── QUICK PHRASES ── */}
            {activeTab === "phrases" && (
              <>
              <SmartPhrases context="general" onSpeak={speak} onCopy={copy} />
              <div className="p3-qp-layout">
                {/* LEFT — PHRASE LIBRARY */}
                <section className="p3-card" aria-labelledby="phrase-lib-title">
                  <div className="p3-card-header">
                    <div className="p3-card-header-left">
                      <span aria-hidden="true">⚡</span> <h3 id="phrase-lib-title" style={{display:'inline', fontSize:'inherit'}}>Phrase Library</h3>
                      <span style={{ fontSize:"11px", color:"var(--muted)", fontWeight:400 }} aria-hidden="true">
                        · {filtered.length} phrases
                      </span>
                    </div>
                  </div>

                  {/* FILTER CHIPS */}
                  <nav className="p3-filter-chips" aria-label="Phrase categories">
                    {PHRASE_CATS.map(c => (
                      <button
                        key={c}
                        className={`p3-chip ${filterCat === c ? "active" : ""}`}
                        onClick={() => { setFilterCat(c); announce(`Filtered by ${c}`); }}
                        aria-pressed={filterCat === c}
                      >
                        {c}
                      </button>
                    ))}
                  </nav>

                  {/* GRID */}
                  <div className="p3-phrase-grid" role="list" aria-label="Phrases">
                    {filtered.map(p => (
                      <div
                        key={p.id}
                        className={`p3-phrase-card ${p.custom ? "custom" : ""}`}
                        role="listitem"
                      >
                        <div className="p3-phrase-icon" aria-hidden="true">{p.icon}</div>
                        <div className="p3-phrase-text">{p.text}</div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div className="p3-phrase-cat">{p.cat}</div>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <button
                              style={{ background:"none", border:"none", cursor:"pointer", fontSize:"15px", opacity:0.7, transition:"opacity 0.2s" }}
                              onClick={() => speak(p.text)}
                              aria-label={`Speak: ${p.text}`}
                              onMouseOver={e=>e.target.style.opacity=1}
                              onMouseOut={e=>e.target.style.opacity=0.7}
                            ><span aria-hidden="true">🔊</span></button>
                            <button
                              style={{ background:"none", border:"none", cursor:"pointer", fontSize:"15px", opacity:0.7, transition:"opacity 0.2s" }}
                              onClick={() => copy(p.text)}
                              aria-label={`Copy: ${p.text}`}
                              onMouseOver={e=>e.target.style.opacity=1}
                              onMouseOut={e=>e.target.style.opacity=0.7}
                            ><span aria-hidden="true">📋</span></button>
                            {p.custom && (
                              <button
                                style={{ background:"none", border:"none", cursor:"pointer", fontSize:"15px", opacity:0.7, transition:"opacity 0.2s" }}
                                onClick={() => deleteCustom(p.id)}
                                aria-label={`Delete custom phrase: ${p.text}`}
                                onMouseOver={e=>e.target.style.opacity=1}
                                onMouseOut={e=>e.target.style.opacity=0.7}
                              ><span aria-hidden="true">🗑</span></button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* RIGHT — ADD CUSTOM */}
                <aside style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                  <section className="p3-card" aria-labelledby="add-custom-title">
                    <div className="p3-card-header">
                      <div className="p3-card-header-left"><span aria-hidden="true">✏️</span> <h3 id="add-custom-title" style={{display:'inline', fontSize:'inherit'}}>Add Custom Phrase</h3></div>
                    </div>
                    <div className="p3-add-form">
                      <div className="p3-input-group">
                        <label className="p3-label" id="emoji-label">Pick an emoji icon</label>
                        <div className="p3-emoji-picker" role="radiogroup" aria-labelledby="emoji-label">
                          {EMOJI_OPTS.map(e => (
                            <button
                              key={e}
                              className={`p3-emoji-opt ${newEmoji === e ? "picked" : ""}`}
                              onClick={() => { setNewEmoji(e); announce(`Selected ${e} emoji`); }}
                              role="radio"
                              aria-checked={newEmoji === e}
                              aria-label={`Select ${e} emoji`}
                            >{e}</button>
                          ))}
                        </div>
                      </div>

                      <div className="p3-input-group">
                        <label className="p3-label" htmlFor="phrase-input">Your phrase</label>
                        <textarea
                          id="phrase-input"
                          className="p3-textarea"
                          placeholder="Type what you want to say quickly…"
                          value={newText}
                          onChange={e => setNewText(e.target.value)}
                        />
                      </div>

                      <div className="p3-input-group">
                        <label className="p3-label" htmlFor="cat-select">Category</label>
                        <select id="cat-select" className="p3-select" value={newCat} onChange={e => { setNewCat(e.target.value); announce(`Category set to ${e.target.value}`); }}>
                          {PHRASE_CATS.filter(c=>c!=="All").map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {newText && (
                        <div style={{
                          padding:"10px 14px", borderRadius:"10px",
                          background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.18)",
                          fontSize:"13px", color:"var(--accent4)"
                        }} role="status">
                          Preview: {newEmoji} {newText}
                        </div>
                      )}

                      <button className="p3-btn p3-btn-primary" onClick={addCustomPhrase}>
                        + Save Custom Phrase
                      </button>
                    </div>
                  </section>

                  {/* STATS */}
                  <section className="p3-card" aria-label="Phrase statistics">
                    <div className="p3-card-header">
                      <div className="p3-card-header-left"><span aria-hidden="true">📊</span> Phrase Stats</div>
                    </div>
                    <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:"12px" }}>
                      {[
                        { label:"Total Phrases", val: allPhrases.length, color:"var(--accent2)" },
                        { label:"Custom Added",  val: customPhrases.length, color:"var(--accent5)" },
                        { label:"Categories",    val: PHRASE_CATS.length - 1, color:"var(--accent4)" },
                      ].map(s => (
                        <div key={s.label} style={{
                          display:"flex", justifyContent:"space-between", alignItems:"center",
                          padding:"10px 14px", borderRadius:"12px",
                          background:"var(--surface2)", border:"1px solid var(--border)"
                        }} role="status">
                          <span style={{ fontSize:"13px", color:"var(--muted)" }}>{s.label}</span>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"18px", color:s.color }}>{s.val}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </aside>
              </div>
              </>
            )}

            {/* ── EMOTION PANEL ── */}
            {activeTab === "emotions" && (
              <div className="p3-emotion-layout">
                {/* LEFT — BIG EMOTION CARDS */}
                <section className="p3-card" aria-labelledby="emo-select-title">
                  <div className="p3-card-header">
                    <div className="p3-card-header-left"><span aria-hidden="true">💖</span> <h3 id="emo-select-title" style={{display:'inline', fontSize:'inherit'}}>How Are You Feeling?</h3></div>
                    {selEmotion && (
                      <span style={{ fontSize:"12px", color:"var(--muted)", fontWeight:400 }} aria-hidden="true">
                        Tap again to deselect
                      </span>
                    )}
                  </div>
                  <div className="p3-big-emotions" role="radiogroup" aria-label="Select your current emotion">
                    {EMOTIONS_DATA.map(e => (
                      <button
                        key={e.id}
                        className={`p3-emo-card ${e.cls} ${selEmotion?.id === e.id ? "selected-e" : ""}`}
                        onClick={() => {
                          const isNew = selEmotion?.id !== e.id;
                          setSelEmotion(prev => prev?.id === e.id ? null : e);
                          setSelMsg(0);
                          if (isNew) announce(`Selected ${e.label}`);
                          else announce("Deselected emotion");
                        }}
                        aria-checked={selEmotion?.id === e.id}
                        role="radio"
                        aria-label={e.label}
                      >
                        <span className="p3-emo-emoji" aria-hidden="true">{e.emoji}</span>
                        <span className="p3-emo-label">{e.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* RIGHT — INTENSITY + MESSAGE */}
                <section className="p3-card" aria-labelledby="intensity-title">
                  <div className="p3-card-header">
                    <div className="p3-card-header-left">
                      <span aria-hidden="true">🎚️</span> <h3 id="intensity-title" style={{display:'inline', fontSize:'inherit'}}>{selEmotion ? `${selEmotion.emoji} ${selEmotion.label}` : "Intensity & Message"}</h3>
                    </div>
                  </div>

                  <div className="p3-intensity-section">
                    <div className="p3-intensity-label">
                      Intensity Level
                      <span className="p3-intensity-val" aria-live="polite">{INTENSITY_LABELS[intensity-1]}</span>
                    </div>
                    <input
                      type="range" min="1" max="10" value={intensity}
                      className="p3-slider"
                      onChange={e => { setIntensity(Number(e.target.value)); announce(`Intensity level ${INTENSITY_LABELS[Number(e.target.value)-1]}`); }}
                      aria-label="Emotion intensity"
                    />
                    <div className="p3-intensity-labels" aria-hidden="true">
                      <span>Mild</span><span>Moderate</span><span>Maximum</span>
                    </div>

                    {/* MESSAGE VARIANTS */}
                    {selEmotion && (
                      <div role="radiogroup" aria-label="Choose a message variant">
                        <div style={{ marginTop:"4px" }}>
                          <div className="p3-label" style={{ marginBottom:"8px" }}>Choose a message variant:</div>
                          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                            {selEmotion.msgs.map((m, i) => (
                              <button
                                key={i}
                                onClick={() => { setSelMsg(i); announce(`Selected variant: ${m}`); }}
                                role="radio"
                                aria-checked={selMsg === i}
                                style={{
                                  padding:"10px 14px", borderRadius:"12px",
                                  border: selMsg === i
                                    ? "1px solid rgba(129,140,248,0.5)"
                                    : "1px solid var(--border)",
                                  background: selMsg === i
                                    ? "rgba(129,140,248,0.12)"
                                    : "var(--surface2)",
                                  color: selMsg === i ? "var(--accent2)" : "var(--muted)",
                                  fontSize:"13px", textAlign:"left",
                                  cursor:"pointer", transition:"all 0.2s",
                                  fontFamily:"'DM Sans',sans-serif", lineHeight:1.5
                                }}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BUILT MESSAGE */}
                  <div className="p3-emo-message">
                    <div className="p3-label">Your message:</div>
                    <div className="p3-emo-preview" role="status" aria-live="polite">
                      {selEmotion
                        ? <><strong>"{emotionMessage()}"</strong></>
                        : <span style={{ color:"var(--muted)" }}>Select an emotion above to generate your message.</span>
                      }
                    </div>
                    {selEmotion && (
                      <div className="p3-emo-btn-row">
                        <button
                          className="p3-btn p3-btn-primary"
                          style={{ flex:1 }}
                          onClick={() => speak(emotionMessage())}
                          aria-label="Speak built message (Alt + S)"
                        >
                          {isSpeaking ? "🔊 Speaking…" : "🔊 Speak Aloud"}
                        </button>
                        <button
                          className="p3-btn p3-btn-secondary"
                          onClick={() => copy(emotionMessage())}
                          aria-label="Copy message (Alt + C)"
                        >
                          <span aria-hidden="true">📋</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* ── SOS PANEL ── */}
            {activeTab === "sos" && (
              <section className="p3-sos-layout" aria-labelledby="sos-title">
                <div className="p3-card">
                  <div className="p3-card-header">
                    <div className="p3-card-header-left"><span aria-hidden="true">🆘</span> <h3 id="sos-title" style={{display:'inline', fontSize:'inherit'}}>Emergency SOS Alerts</h3></div>
                    <span style={{ fontSize:"12px", color:"var(--muted)", fontWeight:400 }} aria-hidden="true">
                      Tap to speak + alert
                    </span>
                  </div>
                  <div className="p3-sos-grid" role="list">
                    {SOS_ACTIONS.map((s, i) => (
                      <button
                        key={i}
                        className={`p3-sos-btn ${s.cls}`}
                        onClick={() => handleSOS(s)}
                        aria-label={`${s.label}: ${s.desc}`}
                        role="listitem"
                      >
                        <span className="p3-sos-icon" aria-hidden="true">{s.icon}</span>
                        <span className="p3-sos-label">{s.label}</span>
                        <span className="p3-sos-desc">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* NOTE */}
                <footer style={{
                  padding:"18px 22px", borderRadius:"16px",
                  background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)",
                  fontSize:"13px", color:"var(--muted)", lineHeight:1.7
                }}>
                  ⚠️ <strong style={{ color:"var(--accent5)" }}>Phase 3 Note:</strong> SOS buttons currently trigger voice alerts and notifications. In Phase 6, these will connect to real contacts, GPS location sharing, and emergency services integration.
                </footer>
              </section>
            )}

          </div>
        </main>

        {/* FOOTER */}
        <footer className="p3-footer">
          Made with ❤️ by Ansika &nbsp;·&nbsp; <span>UnifyTalk</span> &nbsp;·&nbsp; Phase 3 of 6 — Phrases & Emotions
        </footer>

        {/* TOAST */}
        {toast && <div className={`p3-toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </>
  );
}
