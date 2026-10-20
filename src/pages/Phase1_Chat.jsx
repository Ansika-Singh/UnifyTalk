import { useState, useEffect, useCallback, useRef } from "react";
import { saveChatSession, translateText } from '../api';

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
    --text: #f0f4ff;
    --muted: #64748b;
    --danger: #f43f5e;
  }

  /* ACCESSIBILITY */
  .ab-skip-link {
    position: absolute; top: -100px; left: 0; background: var(--accent2); color: white;
    padding: 10px 20px; z-index: 1000; transition: top 0.3s; text-decoration: none;
    font-weight: 700; border-radius: 0 0 8px 0;
  }
  .ab-skip-link:focus { top: 0; }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  :focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 4px;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-delay: -1ms !important;
      animation-duration: 1ms !important;
      animation-iteration-count: 1 !important;
      background-attachment: initial !important;
      scroll-behavior: auto !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  }

  .ab-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ANIMATED BACKGROUND */
  .ab-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 60% at 15% 15%, rgba(56,189,248,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 85% 75%, rgba(129,140,248,0.09) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 50% 100%, rgba(251,113,133,0.05) 0%, transparent 70%);
  }

  /* HEADER */
  .ab-header {
    position: relative; z-index: 10;
    padding: 20px 40px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
    background: rgba(10,14,26,0.8);
    backdrop-filter: blur(12px);
  }

  .ab-logo {
    display: flex; align-items: center; gap: 12px;
  }

  .ab-logo-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 16px rgba(56,189,248,0.3);
  }

  .ab-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }

  .ab-tagline {
    font-size: 12px; color: var(--muted); font-style: italic;
  }

  .ab-status {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--accent);
  }

  .ab-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  /* HERO */
  .ab-hero {
    position: relative; z-index: 5;
    text-align: center;
    padding: 60px 40px 40px;
  }

  .ab-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25);
    border-radius: 100px; padding: 6px 16px;
    font-size: 12px; color: var(--accent); margin-bottom: 24px;
    letter-spacing: 1px; text-transform: uppercase;
  }

  .ab-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 800; line-height: 1.1;
    margin-bottom: 16px;
  }

  .ab-hero h1 span {
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .ab-hero p {
    font-size: 16px; color: var(--muted);
    max-width: 560px; margin: 0 auto 40px;
    line-height: 1.7;
  }

  /* MODE SELECTOR */
  .ab-modes {
    display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
    margin-bottom: 40px;
  }

  .ab-mode-btn {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 16px 24px; border-radius: 16px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted); cursor: pointer;
    transition: all 0.25s ease;
    font-family: 'DM Sans', sans-serif;
    min-width: 120px;
  }

  .ab-mode-btn:hover {
    border-color: var(--accent);
    color: var(--text);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,212,170,0.1);
  }

  .ab-mode-btn.active {
    border-color: var(--accent);
    background: rgba(56,189,248,0.1);
    color: var(--accent);
    box-shadow: 0 0 20px rgba(56,189,248,0.15);
  }

  .ab-mode-btn.active-purple {
    border-color: var(--accent2);
    background: rgba(129,140,248,0.1);
    color: var(--accent2);
    box-shadow: 0 0 20px rgba(129,140,248,0.15);
  }

  .ab-mode-btn.active-amber {
    border-color: var(--accent3);
    background: rgba(251,113,133,0.1);
    color: var(--accent3);
    box-shadow: 0 0 20px rgba(251,113,133,0.15);
  }

  .ab-mode-icon { font-size: 28px; }
  .ab-mode-label { font-size: 13px; font-weight: 500; }

  /* MAIN CHAT AREA */
  .ab-main {
    position: relative; z-index: 5;
    max-width: 900px; margin: 0 auto;
    padding: 0 24px 40px;
  }

  .ab-chat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(0,0,0,0.4);
  }

  .ab-chat-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface2);
  }

  .ab-chat-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    display: flex; align-items: center; gap: 10px;
  }

  .ab-mode-indicator {
    font-size: 11px; padding: 3px 10px;
    border-radius: 100px; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.5px;
  }

  .ab-mode-indicator.deaf { background: rgba(56,189,248,0.15); color: var(--accent); }
  .ab-mode-indicator.mute { background: rgba(129,140,248,0.15); color: var(--accent2); }
  .ab-mode-indicator.blind { background: rgba(251,113,133,0.15); color: var(--accent3); }

  .ab-clear-btn {
    background: none; border: 1px solid var(--border);
    color: var(--muted); border-radius: 8px;
    padding: 6px 12px; font-size: 12px; cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .ab-clear-btn:hover { border-color: var(--danger); color: var(--danger); }

  /* MESSAGES */
  .ab-messages {
    height: 400px; overflow-y: auto;
    padding: 24px; display: flex; flex-direction: column; gap: 16px;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }

  .ab-messages::-webkit-scrollbar { width: 4px; }
  .ab-messages::-webkit-scrollbar-track { background: transparent; }
  .ab-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  .ab-msg {
    display: flex; gap: 12px; align-items: flex-start;
    animation: msgIn 0.3s ease;
  }

  @keyframes msgIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ab-msg.user { flex-direction: row-reverse; }

  .ab-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
    border: 2px solid var(--border);
  }

  .ab-avatar.system { background: rgba(0,212,170,0.15); }
  .ab-avatar.user { background: rgba(124,106,247,0.15); }

  .ab-bubble {
    max-width: 70%; padding: 12px 16px;
    border-radius: 16px; font-size: 14px; line-height: 1.6;
  }

  .ab-msg.system .ab-bubble {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-top-left-radius: 4px;
    color: var(--text);
  }

  .ab-msg.user .ab-bubble {
    background: var(--accent2);
    border: 1px solid rgba(255,255,255,0.1);
    border-top-right-radius: 4px;
    text-align: right;
    color: #fff;
  }

  .ab-msg-type {
    font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .ab-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--muted); text-align: center; gap: 12px;
    font-size: 14px;
  }

  .ab-empty-icon { font-size: 48px; opacity: 0.4; }

  /* INPUT AREA */
  .ab-input-area {
    padding: 20px 24px;
    border-top: 1px solid var(--border);
    background: var(--surface2);
  }

  .ab-input-row {
    display: flex; gap: 12px; align-items: flex-end;
  }

  .ab-textarea {
    flex: 1; background: var(--bg);
    border: 1px solid var(--border); border-radius: 14px;
    color: var(--text); padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; resize: none;
    min-height: 52px; max-height: 120px;
    transition: border-color 0.2s;
    line-height: 1.5;
  }

  .ab-textarea:focus {
    outline: none; border-color: var(--accent2);
    box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
  }

  .ab-textarea::placeholder { color: var(--muted); }

  /* WORD PREDICTION DROPDOWN */
  .ab-suggestions {
    position: absolute; bottom: 100%; left: 0; right: 0;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    max-height: 200px; overflow-y: auto; z-index: 100;
  }

  .ab-suggestion-item {
    padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border);
    transition: all 0.2s; font-size: 14px;
  }

  .ab-suggestion-item:hover,
  .ab-suggestion-item:focus,
  .ab-suggestion-item.selected {
    background: var(--accent2);
    color: white;
  }

  .ab-suggestion-item:last-child {
    border-bottom: none;
  }

  /* LIVE CAPTIONS FOR DEAF USERS */
  .ab-captions {
    position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.95); color: #fff; padding: 24px 32px;
    border-radius: 16px; font-size: 28px; font-weight: 800;
    box-shadow: 0 0 40px rgba(56,189,248,0.4); z-index: 1000;
    max-width: 90%; text-align: center; border: 4px solid var(--accent);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    line-height: 1.3;
  }

  .ab-captions.interim {
    color: #ccc;
    border-color: #666;
  }

  .ab-action-btns {
    display: flex; flex-direction: column; gap: 8px;
  }

  .ab-btn {
    padding: 14px 20px; border-radius: 12px;
    border: none; cursor: pointer; font-weight: 600;
    font-family: 'Syne', sans-serif; font-size: 13px;
    transition: all 0.2s ease; white-space: nowrap;
    display: flex; align-items: center; gap: 8px;
  }

  .ab-btn-send {
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    color: white;
  }
  .ab-btn-send:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(124,106,247,0.3); }

  .ab-btn-speak {
    background: rgba(56,189,248,0.12);
    border: 1px solid rgba(56,189,248,0.3);
    color: var(--accent); padding: 10px 16px; font-size: 12px;
  }
  .ab-btn-speak:hover { background: rgba(56,189,248,0.22); }
  .ab-btn-speak.listening {
    background: rgba(244,63,94,0.15);
    border-color: rgba(244,63,94,0.3);
    color: var(--danger);
    animation: listenPulse 1.2s infinite;
  }

  @keyframes listenPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.3); }
    50% { box-shadow: 0 0 0 8px rgba(244,63,94,0); }
  }

  .ab-btn-tts {
    background: rgba(52,211,153,0.12);
    border: 1px solid rgba(52,211,153,0.3);
    color: var(--accent4); padding: 10px 16px; font-size: 12px;
  }
  .ab-btn-tts:hover { background: rgba(52,211,153,0.22); }
  .ab-btn-tts.speaking {
    animation: speakPulse 0.8s infinite alternate;
  }
  @keyframes speakPulse {
    from { box-shadow: 0 0 0 0 rgba(52,211,153,0.2); }
    to { box-shadow: 0 0 0 10px rgba(52,211,153,0); }
  }

  /* TOOLS ROW */
  .ab-tools {
    display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;
  }

  .ab-tool-chip {
    padding: 6px 14px; border-radius: 100px;
    border: 1px solid var(--border); background: none;
    color: var(--muted); font-size: 12px; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .ab-tool-chip:hover { border-color: var(--accent2); color: var(--text); }
  .ab-tool-chip.active { border-color: var(--accent2); color: var(--accent2); background: rgba(124,106,247,0.1); }

  /* QUICK PHRASES */
  .ab-quick {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    background: var(--surface);
  }

  .ab-quick-label {
    font-size: 11px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 10px;
  }

  .ab-quick-grid {
    display: flex; flex-wrap: wrap; gap: 8px;
  }

  .ab-quick-btn {
    padding: 8px 14px; border-radius: 100px;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text); font-size: 13px; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .ab-quick-btn:hover {
    border-color: var(--accent); color: var(--accent);
    background: rgba(0,212,170,0.05);
    transform: translateY(-1px);
  }

  /* STATS BAR */
  .ab-stats {
    position: relative; z-index: 5;
    max-width: 900px; margin: 0 auto 40px;
    padding: 0 24px;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  }

  .ab-stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 20px;
    text-align: center;
    transition: all 0.3s ease;
  }
  .ab-stat-card:hover {
    border-color: var(--accent2);
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  }

  .ab-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 28px; font-weight: 800;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
  }

  .ab-stat-label { font-size: 12px; color: var(--muted); }

  /* FOOTER STRIP */
  .ab-footer {
    position: relative; z-index: 5;
    text-align: center; padding: 24px;
    border-top: 1px solid var(--border);
    font-size: 12px; color: var(--muted);
  }

  .ab-footer span {
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    font-weight: 700;
  }

  /* FONT SIZE CONTROLS */
  .ab-a11y-bar {
    position: relative; z-index: 5;
    max-width: 900px; margin: 0 auto 20px;
    padding: 0 24px;
    display: flex; gap: 10px; align-items: center;
    flex-wrap: wrap;
  }

  .ab-a11y-label { font-size: 12px; color: var(--muted); margin-right: 4px; }

  .ab-a11y-btn {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--text); cursor: pointer; font-size: 13px;
    font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  }
  .ab-a11y-btn:hover { border-color: var(--accent); color: var(--accent); }
  .ab-a11y-btn.active { border-color: var(--accent); background: rgba(0,212,170,0.1); color: var(--accent); }

  /* LANGUAGE SELECTOR */
  .ab-lang-select {
    padding: 6px 12px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--text); cursor: pointer; font-size: 12px;
    font-family: 'DM Sans', sans-serif; transition: all 0.2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6' fill='%2364748b'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
    padding-right: 24px;
  }
  .ab-lang-select:focus { border-color: var(--accent2); outline: none; box-shadow: 0 0 0 3px rgba(129,140,248,0.1); }
  .ab-lang-select option { background: var(--surface2); color: var(--text); }

  .ab-lang-bar {
    display: flex; align-items: center; gap: 8px;
    margin-left: auto;
  }

  .ab-translate-btn {
    padding: 2px 8px; border-radius: 6px;
    border: 1px solid rgba(52,211,153,0.3); background: rgba(52,211,153,0.08);
    color: var(--accent4); font-size: 10px; cursor: pointer;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    display: inline-flex; align-items: center; gap: 4px;
    margin-top: 6px;
  }
  .ab-translate-btn:hover { background: rgba(52,211,153,0.18); border-color: var(--accent4); }
  .ab-translate-btn.loading { opacity: 0.6; cursor: wait; }

  .ab-translated-text {
    margin-top: 6px; padding: 6px 10px;
    border-radius: 8px; font-size: 13px;
    background: rgba(52,211,153,0.06);
    border: 1px solid rgba(52,211,153,0.15);
    color: var(--accent4); line-height: 1.5;
  }

  .ab-auto-badge {
    font-size: 9px; padding: 1px 6px;
    border-radius: 4px; background: rgba(52,211,153,0.12);
    color: var(--accent4); margin-left: 4px; font-weight: 600;
  }

  /* HIGH CONTRAST MODE */
  .ab-root.high-contrast {
    --bg: #000; --surface: #111; --surface2: #1a1a1a;
    --border: #333; --text: #fff;
  }

  /* RESPONSIVE */
  @media (max-width: 600px) {
    .ab-header { padding: 16px 20px; }
    .ab-hero { padding: 40px 20px 24px; }
    .ab-main, .ab-stats, .ab-a11y-bar { padding: 0 16px; }
    .ab-stats { grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .ab-stat-card { padding: 14px 10px; }
    .ab-stat-num { font-size: 20px; }
    .ab-input-row { flex-direction: column; }
    .ab-action-btns { flex-direction: row; }
    .ab-btn { padding: 12px 14px; font-size: 12px; }
    .ab-messages { height: 300px; }
  }
`;

const QUICK_PHRASES = [
  "Hello! 👋", "Thank you 🙏", "Please help me",
  "I don't understand", "Can you repeat?", "Yes ✅",
  "No ❌", "I need help 🆘", "Good morning ☀️",
  "Nice to meet you 🤝"
];

const MODES = [
  { id: "deaf", icon: "👂", label: "Deaf Mode", desc: "Speech → Text", color: "active" },
  { id: "mute", icon: "🗣️", label: "Mute Mode", desc: "Text → Speech", color: "active-purple" },
  { id: "blind", icon: "👁️", label: "Blind Mode", desc: "Voice Navigate", color: "active-amber" },
];

const LANGUAGES = [
  { code: "en", label: "🇬🇧 English", speech: "en-US" },
  { code: "hi", label: "🇮🇳 Hindi", speech: "hi-IN" },
  { code: "bn", label: "🇮🇳 Bengali", speech: "bn-IN" },
  { code: "ta", label: "🇮🇳 Tamil", speech: "ta-IN" },
  { code: "te", label: "🇮🇳 Telugu", speech: "te-IN" },
  { code: "kn", label: "🇮🇳 Kannada", speech: "kn-IN" },
  { code: "or", label: "🇮🇳 Odia", speech: "or-IN" },
  { code: "mr", label: "🇮🇳 Marathi", speech: "mr-IN" },
  { code: "es", label: "🇪🇸 Spanish", speech: "es-ES" },
  { code: "fr", label: "🇫🇷 French", speech: "fr-FR" },
  { code: "ar", label: "🇸🇦 Arabic", speech: "ar-SA" },
  { code: "ja", label: "🇯🇵 Japanese", speech: "ja-JP" },
  { code: "zh", label: "🇨🇳 Chinese", speech: "zh-CN" },
];

export default function UnifyTalk() {
  const [messages, setMessages] = useState([
    {
      id: 1, from: "system", type: "system",
      text: "Welcome to UnifyTalk! 🤝 Choose your communication mode above and start talking. Type, speak, or tap a quick phrase — we've got you covered.",
    }
  ]);
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState("mute");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [msgCount, setMsgCount] = useState(1);
  const [wordsConverted, setWordsConverted] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  // Word prediction for mute users
  const [wordSuggestions, setWordSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  // Live captions for deaf users
  const [liveCaptions, setLiveCaptions] = useState("");
  const [showCaptions, setShowCaptions] = useState(false);
  // Multilanguage
  const [selectedLang, setSelectedLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translations, setTranslations] = useState({}); // { msgId: translatedText }
  const [translating, setTranslating] = useState({}); // { msgId: true/false }

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const sessionStartRef = useRef(Date.now());

  // Session timer
  useEffect(() => {
    timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);


  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  // WORD PREDICTION FOR MUTE USERS
  const COMMON_PHRASES = [
    "I need help", "Please help me", "I feel sick", "I need water", "I'm hungry", "I'm tired",
    "Thank you", "You're welcome", "Excuse me", "I'm sorry", "Good morning", "Good afternoon",
    "Good evening", "How are you", "I'm fine", "What's your name", "My name is", "Where is",
    "I need to go", "Can you help", "I understand", "I don't understand", "Please repeat",
    "Speak slower", "Speak louder", "I need medicine", "Call doctor", "Emergency", "Pain here",
    "I feel pain", "Headache", "Stomach ache", "I need rest", "I'm cold", "I'm hot"
  ];

  const getWordSuggestions = (text) => {
    if (!text || text.length < 2) return [];
    
    const words = text.toLowerCase().split(' ');
    const lastWord = words[words.length - 1];
    
    // Find phrases that start with the current input
    const matches = COMMON_PHRASES.filter(phrase => 
      phrase.toLowerCase().startsWith(text.toLowerCase()) ||
      (phrase.toLowerCase().includes(lastWord) && lastWord.length > 2)
    ).slice(0, 5);
    
    return matches;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    // Generate suggestions for mute users
    if (activeMode === "mute" && value.trim()) {
      const suggestions = getWordSuggestions(value);
      setWordSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setSelectedSuggestion(-1);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < wordSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev > 0 ? prev - 1 : wordSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(wordSuggestions[selectedSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const [announcement, setAnnouncement] = useState("");

  const announce = (msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  };

  const getModeName = useCallback(() => MODES.find(m => m.id === activeMode)?.label || "", [activeMode]);

  useEffect(() => {
    if (activeMode === "blind") {
      announce(`Mode changed to ${getModeName()}. Voice navigation active.`);
    }
  }, [activeMode, getModeName]);

  const speakText = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95; utter.pitch = 1.1;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, []);

  const speakLastMessage = useCallback(() => {
    const userMsgs = messages.filter(m => m.from === "user");
    if (userMsgs.length) speakText(userMsgs[userMsgs.length - 1].text);
  }, [messages, speakText]);

  const addMessage = useCallback((text, from = "user", type = "text") => {
    const id = Date.now();
    setMessages(prev => [...prev, { id, from, text, type }]);
    setMsgCount(c => c + 1);
    setWordsConverted(w => w + text.split(" ").length);
    // Auto-save user messages to backend
    if (from === 'user') {
      saveChatSession({
        mode: 'mute',
        messages: [{ from, text, type }],
        duration: Math.round((Date.now() - sessionStartRef.current) / 1000)
      }).catch(() => {});
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage("⚠️ Speech recognition not supported in this browser. Try Chrome!", "system", "system");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setLiveCaptions("");
      setShowCaptions(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true; // Enable interim results for live captions
    recognition.lang = LANGUAGES.find(l => l.code === selectedLang)?.speech || "en-US";
    recognition.onstart = () => {
      setIsListening(true);
      if (activeMode === "deaf") {
        setShowCaptions(true);
      }
    };
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setLiveCaptions(interimTranscript);
      if (finalTranscript) {
        setInput(prev => prev + finalTranscript);
        setLiveCaptions("");
        if (activeMode === "deaf") {
          setShowCaptions(false);
        }
      }
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setLiveCaptions("");
      setShowCaptions(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      setLiveCaptions("");
      setShowCaptions(false);
    };
    recognition.start();
  }, [addMessage, isListening, setIsListening, setLiveCaptions, setShowCaptions, activeMode, setInput, selectedLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.from === "system") {
        announce(`New system message: ${lastMsg.text}`);
      }
    }
  }, [messages]);

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // Alt+S to Speak
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        startListening();
        // Since state update is async, we announce based on intent
        announce(isListening ? "Voice input stopped" : "Voice input started");
      }
      // Alt+M to switch mode
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const nextMode = activeMode === 'mute' ? 'deaf' : activeMode === 'deaf' ? 'blind' : 'mute';
        setActiveMode(nextMode);
      }
      // Alt+C to clear chat
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        setMessages([]);
        announce("Chat cleared");
      }
      // Alt+L to read last message
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        speakLastMessage();
        announce("Reading last message");
      }
      // Alt+E for emergency
      if (e.altKey && e.key === 'e') {
        e.preventDefault();
        addMessage("🆘 I need immediate help!", "user", "emergency");
        announce("Emergency alert sent");
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [activeMode, isListening, speakLastMessage, startListening, addMessage]);

  // Font size effect
  useEffect(() => {
    const sizes = { small: "13px", normal: "14px", large: "17px", xlarge: "20px" };
    document.querySelectorAll('.ab-bubble').forEach(el => {
      el.style.fontSize = sizes[fontSize] || "14px";
    });
  }, [fontSize, messages]);

  const sendMessage = (text = input) => {
    if (!text.trim()) return;
    addMessage(text, "user", "typed");
    setInput("");

    // Auto read aloud if mute mode
    if (activeMode === "mute") {
      setTimeout(() => speakText(text), 300);
    }

    // Auto-translate if enabled
    if (autoTranslate && selectedLang !== targetLang) {
      translateText({ text, from: selectedLang, to: targetLang })
        .then(r => {
          if (r.data.translatedText && r.data.translatedText !== text) {
            const transId = Date.now() + 1;
            setMessages(prev => [...prev, {
              id: transId, from: "system", type: "translated",
              text: `🌐 ${LANGUAGES.find(l => l.code === targetLang)?.label || targetLang}: ${r.data.translatedText}`
            }]);
          }
        }).catch(() => {});
    }

    // Simulate response
    setTimeout(() => {
      addMessage("Message received! ✅ In the full platform, this will relay your message to the other person in real-time.", "system", "system");
    }, 800);
  };

  const fontSizes = ["small", "normal", "large", "xlarge"];
  const fontLabels = { small: "A-", normal: "A", large: "A+", xlarge: "A++" };

  return (
    <>
      <style>{styles}</style>
      
      {/* LIVE CAPTIONS FOR DEAF USERS */}
      {showCaptions && activeMode === "deaf" && (
        <div 
          className={`ab-captions ${liveCaptions.includes('...') ? 'interim' : ''}`}
          role="status" 
          aria-live="polite"
          aria-label="Live speech captions"
        >
          🎤 {liveCaptions}
        </div>
      )}

      <div className={`ab-root${highContrast ? " high-contrast" : ""}`}
        role="application"
        style={{ fontSize: fontSize === "large" ? "16px" : fontSize === "xlarge" ? "19px" : undefined }}>
        <a href="#main-chat" className="ab-skip-link">Skip to chat interface</a>
        
        {/* KEYBOARD SHORTCUTS HELP FOR SCREEN READERS */}
        <div className="sr-only">
          Keyboard Shortcuts: 
          Alt + S: Start/Stop voice input. 
          Alt + M: Switch communication mode. 
          Alt + C: Clear chat. 
          Alt + L: Read last message. 
          Alt + E: Send emergency alert.
        </div>

        {/* ARIA ANNOUNCEMENT REGION */}
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {announcement}
        </div>
        <div className="ab-bg" />

        {/* HEADER */}
        <header className="ab-header">
          <div className="ab-logo">
            <div className="ab-logo-icon">🤝</div>
            <div>
              <div className="ab-logo-text">UnifyTalk</div>
              <div className="ab-tagline">One platform. Every voice. No limits.</div>
            </div>
          </div>
          <div className="ab-status">
            <div className="ab-dot" />
            Live · Phase 1
          </div>
        </header>

        {/* HERO */}
        <section className="ab-hero">
          <div className="ab-hero-badge">🤝 Uniting Every Voice, Every Ability</div>
          <h1>Talk to Anyone,<br /><span>Understood by All</span></h1>
          <p>UnifyTalk breaks the silence between deaf, mute, blind and hearing individuals — so no one ever feels left out of a conversation again.</p>

          <div className="ab-modes" role="tablist" aria-label="Communication modes">
            {MODES.map(m => (
              <button
                key={m.id}
                className={`ab-mode-btn ${activeMode === m.id ? m.color : ""}`}
                onClick={() => setActiveMode(m.id)}
                role="tab"
                aria-selected={activeMode === m.id}
                aria-controls={`mode-panel-${m.id}`}
                id={`mode-tab-${m.id}`}
              >
                <span className="ab-mode-icon">{m.icon}</span>
                <span className="ab-mode-label">{m.label}</span>
                <span style={{ fontSize: "11px", opacity: 0.7 }}>{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ACCESSIBILITY BAR */}
        <div className="ab-a11y-bar" role="toolbar" aria-label="Accessibility controls">
          <span className="ab-a11y-label">♿ Accessibility:</span>
          {fontSizes.map(s => (
            <button key={s} className={`ab-a11y-btn ${fontSize === s ? "active" : ""}`}
              onClick={() => setFontSize(s)} aria-label={`Font size ${s}`}>
              {fontLabels[s]}
            </button>
          ))}
          <button className={`ab-a11y-btn ${highContrast ? "active" : ""}`}
            onClick={() => setHighContrast(c => !c)} aria-label="Toggle high contrast">
            ◑ Contrast
          </button>
        </div>

        {/* CHAT */}
        <main className="ab-main" id="main-chat">
          <div className="ab-chat-card" aria-label="Communication interface">
            <div className="ab-chat-header">
              <div className="ab-chat-title">
                💬 Communication Room
                <span className={`ab-mode-indicator ${activeMode}`}>{getModeName()}</span>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <select className="ab-lang-select" value={selectedLang} onChange={e => setSelectedLang(e.target.value)} aria-label="Your language">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <span style={{fontSize:14,color:'var(--muted)'}}>→</span>
                <select className="ab-lang-select" value={targetLang} onChange={e => setTargetLang(e.target.value)} aria-label="Translate to">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <button className="ab-clear-btn" onClick={() => setMessages([])} aria-label="Clear chat">
                  🗑 Clear
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="ab-messages" role="log" aria-live="polite" aria-label="Messages">
              {messages.length === 0 ? (
                <div className="ab-empty">
                  <div className="ab-empty-icon">💬</div>
                  <div>Start a conversation using the input below</div>
                </div>
              ) : (
                messages.map(msg => {
                  const handleTranslateMsg = () => {
                    if (translations[msg.id]) { setTranslations(prev => { const n={...prev}; delete n[msg.id]; return n; }); return; }
                    setTranslating(prev => ({...prev, [msg.id]: true}));
                    const from = msg.from === 'user' ? selectedLang : 'en';
                    const to = msg.from === 'user' ? targetLang : selectedLang;
                    translateText({ text: msg.text, from, to })
                      .then(r => setTranslations(prev => ({...prev, [msg.id]: r.data.translatedText})))
                      .catch(() => setTranslations(prev => ({...prev, [msg.id]: '⚠️ Translation failed'})))
                      .finally(() => setTranslating(prev => ({...prev, [msg.id]: false})));
                  };
                  return (
                    <div key={msg.id} className={`ab-msg ${msg.from}`} role="article">
                      <div className={`ab-avatar ${msg.from}`}>
                        {msg.from === "system" ? "🤖" : "🧑"}
                      </div>
                      <div className="ab-bubble">
                        <div className="ab-msg-type">
                          {msg.from === "system" ? "System" : "You"} · {msg.type}
                          {msg.type === 'translated' && <span className="ab-auto-badge">AUTO</span>}
                        </div>
                        {msg.text}
                        {msg.type !== 'translated' && msg.type !== 'system' && (
                          <button className={`ab-translate-btn ${translating[msg.id] ? 'loading' : ''}`} onClick={handleTranslateMsg} aria-label="Translate message">
                            🌐 {translations[msg.id] ? 'Hide' : translating[msg.id] ? 'Translating…' : 'Translate'}
                          </button>
                        )}
                        {translations[msg.id] && (
                          <div className="ab-translated-text">{translations[msg.id]}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* QUICK PHRASES */}
            <div className="ab-quick" aria-label="Quick phrases">
              <div className="ab-quick-label">⚡ Quick Phrases</div>
              <div className="ab-quick-grid">
                {QUICK_PHRASES.map((phrase, i) => (
                  <button key={i} className="ab-quick-btn"
                    onClick={() => sendMessage(phrase)} aria-label={phrase}>
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT */}
            <div className="ab-input-area">
              <div className="ab-input-row" style={{position: 'relative'}}>
                <textarea
                  className="ab-textarea"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    if (e.key === "Enter" && !e.shiftKey && !showSuggestions) { 
                      e.preventDefault(); 
                      sendMessage(); 
                    }
                  }}
                  placeholder={
                    activeMode === "deaf" ? "Speak or type your message..." :
                    activeMode === "mute" ? "Type here — word prediction available..." :
                    "Type or speak your message..."
                  }
                  rows={2}
                  aria-label="Message input"
                  aria-describedby={showSuggestions ? "word-suggestions" : undefined}
                  aria-autocomplete="list"
                />
                
                {/* WORD PREDICTION DROPDOWN */}
                {showSuggestions && activeMode === "mute" && (
                  <div className="ab-suggestions" id="word-suggestions" role="listbox">
                    {wordSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`ab-suggestion-item ${selectedSuggestion === index ? 'selected' : ''}`}
                        onClick={() => selectSuggestion(suggestion)}
                        onMouseEnter={() => setSelectedSuggestion(index)}
                        role="option"
                        aria-selected={selectedSuggestion === index}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="ab-action-btns">
                  <button className="ab-btn ab-btn-send" onClick={() => sendMessage()} aria-label="Send message">
                    Send ➤
                  </button>
                  <button
                    className={`ab-btn ab-btn-speak ${isListening ? "listening" : ""}`}
                    onClick={startListening}
                    aria-label={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? "🔴 Stop" : "🎙️ Speak"}
                  </button>
                  <button
                    className={`ab-btn ab-btn-tts ${isSpeaking ? "speaking" : ""}`}
                    onClick={speakLastMessage}
                    aria-label="Read last message aloud"
                  >
                    {isSpeaking ? "🔊 Playing" : "🔊 Read"}
                  </button>
                </div>
              </div>
              <div className="ab-tools">
                <button className={`ab-tool-chip ${autoTranslate ? 'active' : ''}`} onClick={() => setAutoTranslate(a => !a)} aria-label="Toggle auto-translate">
                  🌐 Auto-Translate {autoTranslate ? 'ON' : 'OFF'}
                </button>
                <button className="ab-tool-chip" onClick={() => addMessage("🆘 I need immediate help!", "user", "emergency")} aria-label="Emergency alert">
                  🆘 Emergency
                </button>
                <button className="ab-tool-chip" onClick={() => speakText("Hello! How can I help you today?")} aria-label="Demo text to speech">
                  🔊 Demo TTS
                </button>
                <button className="ab-tool-chip" onClick={() => addMessage("👍 Yes, I understand!", "user", "quick")} aria-label="Quick yes">
                  👍 Yes
                </button>
                <button className="ab-tool-chip" onClick={() => addMessage("👎 No, please help me.", "user", "quick")} aria-label="Quick no">
                  👎 No
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* STATS */}
        <div className="ab-stats" role="region" aria-label="Session statistics">
          {[
            { num: msgCount, label: "Messages Sent" },
            { num: wordsConverted, label: "Words Converted" },
            { num: formatTime(sessionTime), label: "Session Time" },
          ].map((s, i) => (
            <div key={i} className="ab-stat-card">
              <div className="ab-stat-num">{s.num}</div>
              <div className="ab-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="ab-footer">
          Made with ❤️ by Ansika & Bishnu &nbsp;·&nbsp; <span>UnifyTalk</span> &nbsp;·&nbsp; Phase 1 of 6
        </footer>

      </div>
    </>
  );
}
