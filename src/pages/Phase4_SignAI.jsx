import { useState, useRef, useEffect, useCallback } from "react";
import * as hands from "@mediapipe/hands";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { saveSignSession, getSignHistory, getSignStats, deleteSignSession } from "../api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg: #06080f; --surface: #0d1220; --surface2: #131a2e;
    --border: #1c2a44; --accent: #38bdf8; --accent2: #818cf8;
    --accent3: #fb7185; --accent4: #34d399; --accent5: #f59e0b;
    --text: #f0f4ff; --muted: #64748b; --danger: #f43f5e;
  }
  .p4-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  .p4-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 70% 60% at 0% 20%, rgba(129,140,248,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 70%, rgba(56,189,248,0.07) 0%, transparent 60%); }
  .p4-header { position: relative; z-index: 10; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); background: rgba(6,8,15,0.88); backdrop-filter: blur(14px); }
  .p4-logo { display: flex; align-items: center; gap: 10px; }
  .p4-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .p4-logo-text { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .p4-phase-badge { font-size: 11px; padding: 4px 12px; border-radius: 100px; background: rgba(129,140,248,0.12); border: 1px solid rgba(129,140,248,0.28); color: var(--accent2); font-weight: 600; }

  /* ACCESSIBILITY */
  .p4-skip-link {
    position: fixed; top: -100px; left: 16px; z-index: 9999;
    background: var(--accent); color: #06080f; padding: 10px 20px;
    border-radius: 8px; font-weight: 700; transition: top 0.2s;
    text-decoration: none;
  }
  .p4-skip-link:focus { top: 16px; outline: 3px solid white; }

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

  .p4-title { position: relative; z-index: 5; text-align: center; padding: 36px 24px 24px; }
  .p4-title h2 { font-family: 'Syne', sans-serif; font-size: clamp(24px, 4vw, 40px); font-weight: 800; margin-bottom: 10px; }
  .p4-title h2 span { background: linear-gradient(90deg, var(--accent2), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .p4-title p { color: var(--muted); font-size: 15px; max-width: 560px; margin: 0 auto; line-height: 1.6; }

  /* MODE TABS */
  .p4-mode-tabs { position: relative; z-index: 5; display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; padding: 0 24px; }
  .p4-mode-tab { padding: 10px 24px; border-radius: 100px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
  .p4-mode-tab:hover { border-color: var(--accent2); color: var(--text); }
  .p4-mode-tab.active-live { background: rgba(56,189,248,0.12); border-color: var(--accent); color: var(--accent); }
  .p4-mode-tab.active-random { background: rgba(251,113,133,0.12); border-color: var(--accent3); color: var(--accent3); }
  .p4-mode-tab.active-face { background: rgba(52,211,153,0.12); border-color: var(--accent4); color: var(--accent4); }

  .p4-layout { position: relative; z-index: 5; max-width: 1100px; margin: 0 auto; padding: 0 24px 48px; display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
  @media(max-width:820px){ .p4-layout { grid-template-columns: 1fr; } }

  .p4-card { background: var(--surface); border: 1px solid var(--border); border-radius: 22px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
  .p4-card-header { padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--surface2); display: flex; align-items: center; justify-content: space-between; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }
  .p4-camera-wrap { position: relative; background: #000; aspect-ratio: 4/3; overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .p4-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
  .p4-canvas { position: absolute; inset: 0; width: 100%; height: 100%; transform: scaleX(-1); pointer-events: none; }

  /* VIDEO CAPTIONS FOR DEAF USERS */
  .p4-video-captions {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(0,0,0,0.8); color: white; padding: 12px 16px;
    font-size: 16px; font-weight: 600; text-align: center;
    border-top: 2px solid var(--accent);
  }

  .p4-captions-toggle {
    position: absolute; top: 10px; right: 10px;
    background: rgba(0,0,0,0.7); color: white; border: none;
    border-radius: 50%; width: 32px; height: 32px;
    cursor: pointer; font-size: 14px; z-index: 10;
  }

  /* RANDOM MODE DISPLAY */
  .p4-random-display { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; background: linear-gradient(135deg, #0d1220, #131a2e); padding: 32px; }
  .p4-random-emoji-big { font-size: 100px; line-height: 1; animation: randomPop 0.5s cubic-bezier(0.34,1.56,0.64,1); filter: drop-shadow(0 0 24px rgba(129,140,248,0.6)); }
  @keyframes randomPop { 0% { transform: scale(0.3) rotate(-20deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
  .p4-random-name { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; background: linear-gradient(90deg, var(--accent2), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .p4-random-type { font-size: 13px; padding: 4px 14px; border-radius: 100px; font-weight: 600; }
  .p4-random-type.hand { background: rgba(129,140,248,0.15); color: var(--accent2); border: 1px solid rgba(129,140,248,0.3); }
  .p4-random-type.face { background: rgba(251,113,133,0.15); color: var(--accent3); border: 1px solid rgba(251,113,133,0.3); }
  .p4-random-desc { font-size: 13px; color: var(--muted); text-align: center; max-width: 260px; line-height: 1.6; }
  .p4-random-bar { width: 200px; height: 6px; border-radius: 100px; background: var(--border); overflow: hidden; }
  .p4-random-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--accent2), var(--accent)); transition: width 0.3s ease; }

  .p4-cam-off { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 40px; text-align: center; width: 100%; height: 100%; background: linear-gradient(135deg, #0d1220, #131a2e); }
  .p4-cam-off-icon { font-size: 64px; opacity: 0.4; }
  .p4-cam-off h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); }
  .p4-cam-off p { font-size: 13px; color: var(--muted); max-width: 280px; line-height: 1.6; }

  .p4-scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent2), var(--accent), var(--accent2), transparent); animation: scanMove 2.5s ease-in-out infinite; box-shadow: 0 0 12px var(--accent2); pointer-events: none; }
  @keyframes scanMove { 0% { top: 10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
  .p4-corner { position: absolute; width: 32px; height: 32px; border-color: var(--accent2); border-style: solid; pointer-events: none; opacity: 0.8; }
  .p4-corner.tl { top: 16px; left: 16px; border-width: 3px 0 0 3px; border-radius: 4px 0 0 0; }
  .p4-corner.tr { top: 16px; right: 16px; border-width: 3px 3px 0 0; border-radius: 0 4px 0 0; }
  .p4-corner.bl { bottom: 16px; left: 16px; border-width: 0 0 3px 3px; border-radius: 0 0 0 4px; }
  .p4-corner.br { bottom: 16px; right: 16px; border-width: 0 3px 3px 0; border-radius: 0 0 4px 0; }

  .p4-status-bar { padding: 12px 18px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border); background: var(--surface2); flex-wrap: wrap; }
  .p4-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .p4-status-dot.active { background: var(--accent4); box-shadow: 0 0 8px var(--accent4); animation: dotPulse 1.4s infinite; }
  .p4-status-dot.inactive { background: var(--muted); }
  .p4-status-dot.random { background: var(--accent3); box-shadow: 0 0 8px var(--accent3); animation: dotPulse 0.8s infinite; }
  @keyframes dotPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.75); } }
  .p4-status-text { font-size: 13px; color: var(--muted); flex: 1; }
  .p4-status-text strong { color: var(--text); }

  .p4-controls { padding: 16px 18px; display: flex; gap: 10px; flex-wrap: wrap; }
  .p4-btn { padding: 11px 18px; border-radius: 12px; border: none; cursor: pointer; font-weight: 700; font-family: 'Syne', sans-serif; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 7px; }
  .p4-btn-cam { background: linear-gradient(135deg, var(--accent2), var(--accent)); color: white; flex: 1; }
  .p4-btn-cam:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(129,140,248,0.3); }
  .p4-btn-random { background: linear-gradient(135deg, var(--accent3), var(--accent5)); color: white; flex: 1; }
  .p4-btn-random:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(251,113,133,0.3); }
  .p4-btn-stop { background: rgba(244,63,94,0.15); border: 1px solid rgba(244,63,94,0.3); color: var(--danger); }
  .p4-btn-stop:hover { background: rgba(244,63,94,0.25); }
  .p4-btn-speak { background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.28); color: var(--accent4); }
  .p4-btn-speak:hover { background: rgba(52,211,153,0.22); }
  .p4-btn-speak.speaking { animation: speakGlow 0.8s infinite alternate; }
  @keyframes speakGlow { from { box-shadow: 0 0 0 0 rgba(52,211,153,0.3); } to { box-shadow: 0 0 0 10px rgba(52,211,153,0); } }
  .p4-btn-clear { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); color: var(--accent5); }
  .p4-btn-clear:hover { background: rgba(245,158,11,0.2); }
  .p4-btn-next { background: rgba(129,140,248,0.15); border: 1px solid rgba(129,140,248,0.3); color: var(--accent2); }
  .p4-btn-next:hover { background: rgba(129,140,248,0.25); }

  .p4-right { display: flex; flex-direction: column; gap: 16px; }
  .p4-detected-card { background: var(--surface); border: 1px solid var(--border); border-radius: 22px; overflow: hidden; }
  .p4-detected-body { padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 140px; justify-content: center; }
  .p4-detected-emoji { font-size: 56px; line-height: 1; animation: detectedPop 0.4s cubic-bezier(0.34,1.56,0.64,1); filter: drop-shadow(0 0 16px rgba(129,140,248,0.5)); }
  @keyframes detectedPop { 0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
  .p4-detected-label { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; background: linear-gradient(90deg, var(--accent2), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .p4-confidence { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .p4-conf-bar { width: 80px; height: 4px; border-radius: 100px; background: var(--border); overflow: hidden; }
  .p4-conf-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--accent4), var(--accent)); transition: width 0.4s ease; }
  .p4-no-detect { color: var(--muted); font-size: 14px; text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center; }
  .p4-no-detect-icon { font-size: 40px; opacity: 0.3; }

  .p4-emotion-card { background: var(--surface); border: 1px solid var(--border); border-radius: 22px; overflow: hidden; }
  .p4-emotion-body { padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; min-height: 120px; justify-content: center; }
  .p4-emotion-emoji { font-size: 48px; line-height: 1; animation: detectedPop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  .p4-emotion-label { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; }
  .p4-emotion-desc { font-size: 12px; color: var(--muted); max-width: 220px; line-height: 1.5; }

  /* RANDOM HISTORY */
  .p4-history { padding: 14px 18px; border-top: 1px solid var(--border); }
  .p4-history-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .p4-history-list { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .p4-history-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border); font-size: 13px; animation: chipIn 0.25s ease; }
  @keyframes chipIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
  .p4-history-emoji { font-size: 20px; }
  .p4-history-name { font-weight: 600; color: var(--text); flex: 1; }
  .p4-history-badge { font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 600; }
  .p4-history-badge.hand { background: rgba(129,140,248,0.15); color: var(--accent2); }
  .p4-history-badge.face { background: rgba(251,113,133,0.15); color: var(--accent3); }

  .p4-sentence-wrap { padding: 14px 18px; border-top: 1px solid var(--border); }
  .p4-sentence-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .p4-sentence-chips { display: flex; flex-wrap: wrap; gap: 8px; min-height: 36px; margin-bottom: 12px; }
  .p4-s-chip { padding: 6px 12px; border-radius: 100px; background: rgba(129,140,248,0.12); border: 1px solid rgba(129,140,248,0.25); font-size: 13px; color: var(--text); animation: chipIn 0.25s ease; cursor: pointer; transition: all 0.2s; }
  .p4-s-chip:hover { background: rgba(244,63,94,0.12); border-color: rgba(244,63,94,0.3); color: var(--danger); }
  .p4-sentence-preview { padding: 10px 14px; border-radius: 10px; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.14); font-size: 13px; color: var(--accent); font-style: italic; margin-bottom: 10px; }

  .p4-dict-card { background: var(--surface); border: 1px solid var(--border); border-radius: 22px; overflow: hidden; }
  .p4-dict-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 16px; max-height: 200px; overflow-y: auto; scrollbar-width: thin; }
  .p4-dict-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface2); cursor: pointer; transition: all 0.2s; }
  .p4-dict-item:hover { border-color: var(--accent2); transform: translateY(-2px); background: rgba(129,140,248,0.08); }
  .p4-dict-emoji { font-size: 20px; }
  .p4-dict-label { font-size: 9px; color: var(--muted); text-align: center; font-weight: 500; }

  .p4-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 100px; font-size: 13px; font-weight: 600; z-index: 999; box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: toastIn 0.3s ease; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
  .p4-toast.green { background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); color: var(--accent4); }
  .p4-toast.blue  { background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); color: var(--accent); }
  .p4-toast.red   { background: rgba(244,63,94,0.15);  border: 1px solid rgba(244,63,94,0.3);  color: var(--danger); }
  @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

  .p4-footer { position: relative; z-index: 5; text-align: center; padding: 20px; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); }
  .p4-footer span { background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; }

  @media(max-width:600px){ .p4-header { padding: 14px 16px; } .p4-layout { padding: 0 12px 32px; } }
`;

// All hand signs
const ALL_SIGNS = [
  { name: "Hello",      emoji: "👋", type: "hand", desc: "Open palm waving",           confidence: 94 },
  { name: "Yes",        emoji: "👍", type: "hand", desc: "Thumbs up gesture",           confidence: 91 },
  { name: "No",         emoji: "👎", type: "hand", desc: "Thumbs down gesture",         confidence: 89 },
  { name: "I Love You", emoji: "🤟", type: "hand", desc: "Thumb, index and pinky up",   confidence: 96 },
  { name: "OK",         emoji: "👌", type: "hand", desc: "Thumb and index circle",      confidence: 88 },
  { name: "Peace",      emoji: "✌️", type: "hand", desc: "Index and middle finger up",  confidence: 87 },
  { name: "Help",       emoji: "🙏", type: "hand", desc: "Both palms pressed together", confidence: 90 },
  { name: "Stop",       emoji: "✋", type: "hand", desc: "Open palm facing forward",    confidence: 93 },
  { name: "Point",      emoji: "☝️", type: "hand", desc: "Only index finger extended",  confidence: 92 },
  { name: "Fist",       emoji: "✊", type: "hand", desc: "All fingers closed tight",    confidence: 85 },
  { name: "Call Me",    emoji: "🤙", type: "hand", desc: "Thumb and pinky extended",    confidence: 88 },
  { name: "Come",       emoji: "🤚", type: "hand", desc: "All fingers spread open",     confidence: 84 },
  { name: "Clap",       emoji: "👏", type: "hand", desc: "Two hands together",          confidence: 86 },
  { name: "Rock",       emoji: "🤘", type: "hand", desc: "Index and pinky up",          confidence: 83 },
  { name: "Cross",      emoji: "🤞", type: "hand", desc: "Fingers crossed",             confidence: 81 },
];

// All face expressions
const ALL_EMOTIONS = [
  { name: "Happy",     emoji: "😄", type: "face", desc: "Smiling, mouth open",         color: "#34d399", confidence: 92 },
  { name: "Sad",       emoji: "😢", type: "face", desc: "Downturned mouth, brows up",  color: "#38bdf8", confidence: 88 },
  { name: "Angry",     emoji: "😠", type: "face", desc: "Furrowed brows, tight mouth", color: "#f43f5e", confidence: 85 },
  { name: "Surprised", emoji: "😮", type: "face", desc: "Wide eyes, open mouth",       color: "#f59e0b", confidence: 91 },
  { name: "Sleepy",    emoji: "😴", type: "face", desc: "Half-closed eyes",            color: "#818cf8", confidence: 87 },
  { name: "Neutral",   emoji: "😐", type: "face", desc: "Calm resting expression",     color: "#64748b", confidence: 90 },
  { name: "Excited",   emoji: "🤩", type: "face", desc: "Eyes wide, big smile",        color: "#f59e0b", confidence: 89 },
  { name: "Confused",  emoji: "😕", type: "face", desc: "One brow raised, slight frown", color: "#818cf8", confidence: 82 },
  { name: "Laughing",  emoji: "😂", type: "face", desc: "Eyes squinted, wide smile",   color: "#34d399", confidence: 93 },
  { name: "Nervous",   emoji: "😰", type: "face", desc: "Tense expression, wide eyes", color: "#fb7185", confidence: 84 },
  { name: "Disgusted", emoji: "🤢", type: "face", desc: "Nose scrunched, mouth down",  color: "#f43f5e", confidence: 80 },
  { name: "In Love",   emoji: "🥰", type: "face", desc: "Soft eyes, gentle smile",     color: "#fb7185", confidence: 86 },
];

const ALL_COMBINED = [...ALL_SIGNS, ...ALL_EMOTIONS];

const detectEmotion = (landmarks) => {
  if (!landmarks || landmarks.length < 468) return null;
  const mouthTop = landmarks[13], mouthBottom = landmarks[14];
  const mouthLeft = landmarks[61], mouthRight = landmarks[291];
  const leftEyeTop = landmarks[159], leftEyeBottom = landmarks[145];
  const rightEyeTop = landmarks[386], rightEyeBottom = landmarks[374];
  const leftBrowInner = landmarks[65], rightBrowInner = landmarks[295];
  const leftEyeInner = landmarks[133], rightEyeInner = landmarks[362];
  const mouthOpen = Math.abs(mouthBottom.y - mouthTop.y);
  const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
  const mouthRatio = mouthOpen / mouthWidth;
  const leftEyeOpen = Math.abs(leftEyeBottom.y - leftEyeTop.y);
  const rightEyeOpen = Math.abs(rightEyeBottom.y - rightEyeTop.y);
  const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;
  const browRaise = Math.abs(leftBrowInner.y - leftEyeInner.y) + Math.abs(rightBrowInner.y - rightEyeInner.y);
  if (mouthRatio > 0.25 && avgEyeOpen > 0.03) return ALL_EMOTIONS.find(e => e.name === "Surprised");
  if (mouthRatio > 0.18) return ALL_EMOTIONS.find(e => e.name === "Happy");
  if (browRaise < 0.04 && mouthRatio < 0.05) return ALL_EMOTIONS.find(e => e.name === "Angry");
  if (avgEyeOpen < 0.015) return ALL_EMOTIONS.find(e => e.name === "Sleepy");
  if (mouthRatio < 0.04 && browRaise > 0.06) return ALL_EMOTIONS.find(e => e.name === "Sad");
  return ALL_EMOTIONS.find(e => e.name === "Neutral");
};

const detectGesture = (landmarks) => {
  const isFingerUp = (tip, pip) => landmarks[tip].y < landmarks[pip].y;
  const fingers = [landmarks[4].x < landmarks[3].x, isFingerUp(8,6), isFingerUp(12,10), isFingerUp(16,14), isFingerUp(20,18)];
  const [thumb, index, middle, ring, pinky] = fingers;
  if (thumb && index && middle && ring && pinky)    return ALL_SIGNS.find(s => s.name === "Hello");
  if (!thumb && index && !middle && !ring && !pinky) return ALL_SIGNS.find(s => s.name === "Point");
  if (!thumb && index && middle && !ring && !pinky)  return ALL_SIGNS.find(s => s.name === "Peace");
  if (!thumb && !index && !middle && !ring && !pinky) return ALL_SIGNS.find(s => s.name === "Fist");
  if (thumb && !index && !middle && !ring && pinky)  return ALL_SIGNS.find(s => s.name === "Call Me");
  if (thumb && index && !middle && !ring && pinky)   return ALL_SIGNS.find(s => s.name === "I Love You");
  if (!thumb && index && middle && ring && pinky)    return ALL_SIGNS.find(s => s.name === "Come");
  if (thumb && index && middle && !ring && !pinky)   return ALL_SIGNS.find(s => s.name === "OK");
  if (thumb && !index && !middle && !ring && !pinky) return ALL_SIGNS.find(s => s.name === "Yes");
  return null;
};

export default function UnifyTalkPhase4() {
  const [mode, setMode]               = useState("random"); // live | random | face
  const [cameraOn, setCameraOn]       = useState(false);
  const [detecting, setDetecting]     = useState(false);
  const [detected, setDetected]       = useState(null);
  const [confidence, setConfidence]   = useState(0);
  const [emotion, setEmotion]         = useState(null);
  const [randomItem, setRandomItem]   = useState(null);
  const [randomProgress, setRandomProgress] = useState(0);
  const [history, setHistory]         = useState([]);
  const [sentence, setSentence]       = useState([]);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [toast, setToast]             = useState(null);
  const [frameCount, setFrameCount]   = useState(0);
  const [isRandomRunning, setIsRandomRunning] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // ── Backend state ──────────────────────────────────────
  const [backendHistory, setBackendHistory] = useState([]);   // past sessions from DB
  const [backendStats, setBackendStats]     = useState(null); // aggregated stats
  const [backendLoading, setBackendLoading] = useState(false);
  const [showBackendHistory, setShowBackendHistory] = useState(false);
  const sessionStartRef = useRef(Date.now()); // track session start time

  const announce = useCallback((msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  // Video captions for deaf users
  const [videoCaptions, setVideoCaptions] = useState("");
  const [showVideoCaptions, setShowVideoCaptions] = useState(true);

  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);
  const streamRef    = useRef(null);
  const cameraRef    = useRef(null);
  const randomRef    = useRef(null);
  const progressRef  = useRef(null);

  const showToast = useCallback((msg, type = "green") => {
    setToast({ msg, type });
    announce(msg);
    setTimeout(() => setToast(null), 2400);
  }, [setToast, announce]);

  // ── Backend helpers ────────────────────────────────────
  const loadBackendHistory = useCallback(async () => {
    try {
      setBackendLoading(true);
      const [histRes, statsRes] = await Promise.all([
        getSignHistory({ limit: 10 }),
        getSignStats()
      ]);
      setBackendHistory(histRes.data.sessions || []);
      setBackendStats(statsRes.data);
    } catch {
      // Backend offline or not logged in — silently ignore
    } finally {
      setBackendLoading(false);
    }
  }, []);

  // Save session to backend whenever a sentence is spoken
  const saveSessionToBackend = useCallback(async (spokenSentence, signsArr, spokenMode) => {
    try {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      await saveSignSession({
        sentence:     spokenSentence,
        signs:        signsArr.map(s => ({
          name:       s.name,
          emoji:      s.emoji,
          type:       s.type || 'hand',
          confidence: s.confidence || 0
        })),
        mode:         spokenMode,
        gestureCount: signsArr.length,
        duration,
        wasSpoken:    true
      });
      // Refresh backend history after saving
      loadBackendHistory();
    } catch {
      // Silently fail if backend is unavailable
    }
  }, [loadBackendHistory]);

  const handleDeleteSession = useCallback(async (id) => {
    try {
      await deleteSignSession(id);
      setBackendHistory(prev => prev.filter(s => s._id !== id));
      showToast('🗑 Session deleted', 'blue');
    } catch {
      showToast('❌ Could not delete session', 'red');
    }
  }, [showToast]);

  // Load history on mount
  useEffect(() => { loadBackendHistory(); }, [loadBackendHistory]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1.05;
    u.onstart = () => { setIsSpeaking(true); announce("Speaking message"); };
    u.onend   = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
    if (navigator.vibrate) navigator.vibrate(40);
  }, [announce, setIsSpeaking]);

  const pickRandom = useCallback(() => {
    const pool = mode === "face"
      ? ALL_EMOTIONS
      : mode === "random"
      ? ALL_COMBINED
      : ALL_SIGNS;

    const item = pool[Math.floor(Math.random() * pool.length)];
    const conf = item.confidence + Math.floor(Math.random() * 6) - 3;
    setRandomItem({ ...item, confidence: conf });
    setRandomProgress(0);

    setHistory(prev => [{ ...item, uid: Date.now() }, ...prev].slice(0, 10));

    if (item.type === "hand") {
      setDetected({ ...item, confidence: conf });
      setConfidence(conf);
      announce(`Random sign: ${item.name}`);
    } else {
      setEmotion(item);
      announce(`Random emotion: ${item.name}`);
    }

    if (navigator.vibrate) navigator.vibrate(40);

    // Speak it
    speak(item.type === "face" ? `Feeling ${item.name}` : item.name);

    // Progress bar animation
    let p = 0;
    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      p += 2;
      setRandomProgress(p);
      if (p >= 100) {
        clearInterval(progressRef.current);
        // Auto next after 3 seconds
        randomRef.current = setTimeout(pickRandom, 500);
      }
    }, 60);
  }, [mode, announce, speak]);

  const startRandom = useCallback(() => {
    setIsRandomRunning(true);
    showToast("🎲 Random mode started!", "blue");
    pickRandom();
  }, [setIsRandomRunning, showToast, pickRandom]);

  const stopRandom = useCallback(() => {
    setIsRandomRunning(false);
    clearInterval(progressRef.current);
    clearTimeout(randomRef.current);
    setRandomItem(null);
    setRandomProgress(0);
    announce("Random mode stopped");
  }, [setIsRandomRunning, progressRef, randomRef, setRandomItem, setRandomProgress, announce]);

  const nextRandom = () => {
    clearTimeout(randomRef.current);
    clearInterval(progressRef.current);
    pickRandom();
    announce("Next random item");
  };

  // ── LIVE CAMERA MODE ─────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      setCameraOn(true);
      showToast("📷 Camera started!", "blue");
      announce("Camera started. Detection active.");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => startDetection());
        }
      }, 500);
    } catch (err) {
      showToast("❌ Camera access denied.", "red");
      announce("Camera access denied.");
    }
  }, [streamRef, setCameraOn, showToast, announce, videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (cameraRef.current) { cameraRef.current.stop(); cameraRef.current = null; }
    setCameraOn(false); setDetecting(false); setDetected(null); setEmotion(null);
    const canvas = canvasRef.current;
    if (canvas) { const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    announce("Camera stopped.");
  }, [streamRef, cameraRef, setCameraOn, setDetecting, setDetected, setEmotion, canvasRef, announce]);

  const startDetection = () => {
    setDetecting(true);
    const handsModel = new hands.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
    handsModel.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.5 });
    handsModel.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = videoRef.current?.videoWidth || 640;
      canvas.height = videoRef.current?.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.multiHandLandmarks?.length > 0) {
        const lm = results.multiHandLandmarks[0];
        drawConnectors(ctx, lm, hands.HAND_CONNECTIONS, { color: "#818cf8", lineWidth: 2.5 });
        drawLandmarks(ctx, lm, { color: "#38bdf8", lineWidth: 1, radius: 4 });
        const gesture = detectGesture(lm);
        if (gesture) { 
          setDetected(gesture); 
          setConfidence(gesture.confidence); 
          setFrameCount(f => f + 1);
          // Show gesture as video caption for deaf users
          setVideoCaptions(`${gesture.emoji} ${gesture.name} (${gesture.confidence}%)`);
          // Clear caption after 3 seconds
          setTimeout(() => setVideoCaptions(""), 3000);
          
          // Vibration on new detection
          if (navigator.vibrate) navigator.vibrate(40);
        }
      }
    });

    const faceMeshModel = new faceMesh.FaceMesh({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
    faceMeshModel.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    faceMeshModel.onResults((results) => {
      if (results.multiFaceLandmarks?.length > 0) {
        const em = detectEmotion(results.multiFaceLandmarks[0]);
        if (em) setEmotion(em);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await handsModel.send({ image: videoRef.current });
          await faceMeshModel.send({ image: videoRef.current });
        }
      },
      width: 640, height: 480
    });
    cameraRef.current = camera;
    camera.start();
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopRandom();
    };
  }, [stopCamera, stopRandom]);

  // Stop random when switching modes
  const switchMode = useCallback((m) => {
    if (isRandomRunning) stopRandom();
    if (cameraOn) stopCamera();
    setMode(m);
    announce(`Mode switched to ${m === 'live' ? 'Live Camera' : m === 'random' ? 'Random Mode' : 'Face Expressions Only'}`);
  }, [isRandomRunning, stopRandom, cameraOn, stopCamera, setMode, announce]);

  const speakSentence = useCallback(() => {
    if (sentence.length === 0) { showToast("⚠️ Build a sentence first!", "red"); return; }
    const text = sentence.map(s => s.name).join(", ");
    speak(text);
    showToast("🔊 Speaking sentence…", "blue");
    // Auto-save session to backend
    saveSessionToBackend(text, sentence, mode);
    // Reset session timer
    sessionStartRef.current = Date.now();
  }, [sentence, speak, showToast, saveSessionToBackend, mode]);

  const addToSentence = useCallback((item) => {
    const src = item || detected;
    if (!src) { showToast("⚠️ Nothing detected yet!", "red"); return; }
    setSentence(prev => prev.length < 8 ? [...prev, { ...src, uid: Date.now() }] : prev);
    showToast(`✅ Added: ${src.name}`, "green");
    if (navigator.vibrate) navigator.vibrate(40);
  }, [detected, showToast]);

  const addManual = (item) => {
    setSentence(prev => prev.length < 8 ? [...prev, { ...item, uid: Date.now() }] : prev);
    showToast(`✅ Added: ${item.name}`, "green");
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const removeChip = (uid) => {
    const chip = sentence.find(s => s.uid === uid);
    if (chip) announce(`Removed ${chip.name}`);
    setSentence(prev => prev.filter(s => s.uid !== uid));
    if (navigator.vibrate) navigator.vibrate(40);
  };
  
  const clearSentence = useCallback(() => { 
    setSentence([]); window.speechSynthesis?.cancel(); setIsSpeaking(false); 
    announce("Cleared sentence");
    if (navigator.vibrate) navigator.vibrate([40, 40]);
  }, [setSentence, setIsSpeaking, announce]);

  const sentenceText = sentence.map(s => s.name).join(" · ");

  useEffect(() => {
    const handleKeys = (e) => {
      // Alt + 1-3 for Tabs/Modes
      if (e.altKey && e.key === '1') { e.preventDefault(); switchMode("live"); }
      if (e.altKey && e.key === '2') { e.preventDefault(); switchMode("random"); }
      if (e.altKey && e.key === '3') { e.preventDefault(); switchMode("face"); }
      
      // Alt + S to Speak
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        speakSentence();
      }
      
      // Alt + C to Clear
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        clearSentence();
      }
      
      // Alt + A to Add detection to sentence
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        addToSentence(randomItem);
      }
      
      // Alt + P to start/stop detection
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (mode === "live") cameraOn ? stopCamera() : startCamera();
        else isRandomRunning ? stopRandom() : startRandom();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [mode, cameraOn, isRandomRunning, sentence, randomItem, speakSentence, addToSentence, clearSentence, startCamera, startRandom, stopCamera, stopRandom, switchMode]);

  useEffect(() => {
    document.title = "Sign Language AI | UnifyTalk";
    // Reset session timer when mode changes
    sessionStartRef.current = Date.now();
  }, [mode]);

  const isLive = mode === "live";
  const isRandom = mode === "random" || mode === "face";

  return (
    <>
      <style>{styles}</style>
      <div className="p4-root" role="application" aria-label="Sign Language and Emotion AI">
        <div className="p4-bg" aria-hidden="true" />
        
        <a href="#main-ai" className="p4-skip-link">Skip to AI content</a>

        {/* ARIA ANNOUNCEMENT REGION */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {/* KEYBOARD SHORTCUTS GUIDE FOR SCREEN READERS */}
        <div className="sr-only">
          Keyboard Shortcuts: 
          Alt + 1: Live Camera mode. 
          Alt + 2: Random Signs mode. 
          Alt + 3: Face Expressions mode. 
          Alt + S: Speak built sentence. 
          Alt + C: Clear sentence. 
          Alt + A: Add current detection to sentence. 
          Alt + P: Start/Stop detection or camera.
        </div>

        <header className="p4-header">
          <div className="p4-logo">
            <div className="p4-logo-icon" aria-hidden="true">🤝</div>
            <div className="p4-logo-text">UnifyTalk</div>
          </div>
          <div className="p4-phase-badge">Phase 4 — Sign + Emotion AI</div>
        </header>

        <main id="main-ai">
          <section className="p4-title" aria-labelledby="page-title">
            <h2 id="page-title">Sign Language + <span>Emotion Detection</span></h2>
            <p>Detect hand signs and facial expressions — live from camera, randomly generated, or face-only mode.</p>
          </section>

          {/* MODE TABS */}
          <nav className="p4-mode-tabs" aria-label="Detection modes">
            <button className={`p4-mode-tab ${mode === "live" ? "active-live" : ""}`} onClick={() => switchMode("live")} aria-pressed={mode === "live"}>
              📷 Live Camera
            </button>
            <button className={`p4-mode-tab ${mode === "random" ? "active-random" : ""}`} onClick={() => switchMode("random")} aria-pressed={mode === "random"}>
              🎲 Random Signs + Emotions
            </button>
            <button className={`p4-mode-tab ${mode === "face" ? "active-face" : ""}`} onClick={() => switchMode("face")} aria-pressed={mode === "face"}>
              😊 Face Expressions Only
            </button>
          </nav>

          <div className="p4-layout">
            <div>
              <div className="p4-card">
                <div className="p4-card-header">
                  <span>{isLive ? "📷 Live Camera Feed" : isRandom && mode === "face" ? "😊 Random Face Expressions" : "🎲 Random Signs & Emotions"}</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div className={`p4-status-dot ${isLive ? (cameraOn ? "active" : "inactive") : (isRandomRunning ? "random" : "inactive")}`} aria-hidden="true" />
                    <span style={{ fontSize: "12px", color: isLive ? (cameraOn ? "var(--accent4)" : "var(--muted)") : (isRandomRunning ? "var(--accent3)" : "var(--muted)") }}>
                      {isLive ? (cameraOn ? "Live" : "Offline") : (isRandomRunning ? "Running" : "Stopped")}
                    </span>
                  </div>
                </div>

                {/* DISPLAY AREA */}
                <div className="p4-camera-wrap">
                  {isLive ? (
                    cameraOn ? (
                      <>
                        <video ref={videoRef} className="p4-video" playsInline muted autoPlay aria-label="Live camera feed" />
                        <canvas ref={canvasRef} className="p4-canvas" aria-hidden="true" />
                        <div className="p4-scan-line" aria-hidden="true" />
                        <div className="p4-corner tl" aria-hidden="true" /><div className="p4-corner tr" aria-hidden="true" />
                        <div className="p4-corner bl" aria-hidden="true" /><div className="p4-corner br" aria-hidden="true" />
                        {detected && (
                          <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(6,8,15,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }} role="status">
                            <span style={{ fontSize: 20 }} aria-hidden="true">{detected.emoji}</span>
                            <span style={{ color: "var(--accent2)", fontWeight: 700 }}>{detected.name}</span>
                            <span style={{ color: "var(--muted)" }}>{confidence}%</span>
                          </div>
                        )}
                        
                        {/* VIDEO CAPTIONS FOR DEAF USERS */}
                        {showVideoCaptions && videoCaptions && (
                          <div className="p4-video-captions" role="status" aria-live="polite">
                            {videoCaptions}
                          </div>
                        )}
                        
                        <button 
                          className="p4-captions-toggle"
                          onClick={() => { setShowVideoCaptions(!showVideoCaptions); announce(showVideoCaptions ? "Captions off" : "Captions on"); }}
                          aria-label={showVideoCaptions ? "Hide video captions" : "Show video captions"}
                        >
                          {showVideoCaptions ? "📝" : "📝❌"}
                        </button>
                        {emotion && (
                          <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(6,8,15,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${emotion.color}40`, borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }} role="status">
                            <span style={{ fontSize: 20 }} aria-hidden="true">{emotion.emoji}</span>
                            <span style={{ color: emotion.color, fontWeight: 700 }}>{emotion.name}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p4-cam-off">
                        <div className="p4-cam-off-icon" aria-hidden="true">🤟</div>
                        <h3>Camera Not Active</h3>
                        <p>Start camera to detect hand signs and facial expressions in real-time.</p>
                      </div>
                    )
                  ) : (
                    randomItem ? (
                      <div className="p4-random-display" role="status">
                        <div className="p4-random-emoji-big" key={randomItem.name + randomItem.uid} aria-hidden="true">{randomItem.emoji}</div>
                        <div className="p4-random-name">{randomItem.name}</div>
                        <div className={`p4-random-type ${randomItem.type}`}>
                          {randomItem.type === "hand" ? "✋ Hand Sign" : "😊 Face Expression"}
                        </div>
                        <div className="p4-random-desc">{randomItem.desc}</div>
                        <div className="p4-random-bar" aria-hidden="true">
                          <div className="p4-random-fill" style={{ width: `${randomProgress}%` }} />
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Confidence: <strong style={{ color: "var(--accent4)" }}>{randomItem.confidence}%</strong></div>
                      </div>
                    ) : (
                      <div className="p4-cam-off">
                        <div className="p4-cam-off-icon" aria-hidden="true">{mode === "face" ? "😊" : "🎲"}</div>
                        <h3>{mode === "face" ? "Face Expression Mode" : "Random Mode"}</h3>
                        <p>{mode === "face" ? "Click Start to randomly show face expressions with descriptions." : "Click Start to randomly cycle through hand signs and face expressions."}</p>
                      </div>
                    )
                  )}
                </div>

                {/* STATUS BAR */}
                <div className="p4-status-bar">
                  <div className={`p4-status-dot ${isLive ? (detecting ? "active" : "inactive") : (isRandomRunning ? "random" : "inactive")}`} aria-hidden="true" />
                  <div className="p4-status-text" role="status">
                    {isLive
                      ? detecting ? <><strong>AI Active</strong> — {frameCount} gestures · Hand + Face detection</> : "Start the camera to begin detection"
                      : isRandomRunning ? <><strong>{mode === "face" ? "Face Mode" : "Random Mode"}</strong> — Showing: {randomItem?.name || "loading…"}</> : "Press Start to begin random detection demo"
                    }
                  </div>
                </div>

                {/* CONTROLS */}
                <div className="p4-controls">
                  {isLive ? (
                    !cameraOn ? (
                      <button className="p4-btn p4-btn-cam" onClick={startCamera}>📷 Start Camera</button>
                    ) : (
                      <>
                        <button className="p4-btn p4-btn-stop" onClick={stopCamera}>⏹ Stop</button>
                        <button className="p4-btn p4-btn-cam" onClick={() => addToSentence(null)} style={{ flex: 1 }}>➕ Add Sign</button>
                      </>
                    )
                  ) : (
                    !isRandomRunning ? (
                      <button className="p4-btn p4-btn-random" onClick={startRandom}>
                        {mode === "face" ? "😊 Start Face Mode" : "🎲 Start Random"}
                      </button>
                    ) : (
                      <>
                        <button className="p4-btn p4-btn-stop" onClick={stopRandom}>⏹ Stop</button>
                        <button className="p4-btn p4-btn-next" onClick={nextRandom}>⏭ Next</button>
                        <button className="p4-btn p4-btn-cam" onClick={() => addToSentence(randomItem)} style={{ flex: 1 }}>➕ Add</button>
                      </>
                    )
                  )}
                  <button className={`p4-btn p4-btn-speak ${isSpeaking ? "speaking" : ""}`} onClick={speakSentence} aria-label="Speak built sentence (Alt + S)">
                    {isSpeaking ? "🔊 Speaking…" : "🔊 Speak"}
                  </button>
                  <button className="p4-btn p4-btn-clear" onClick={clearSentence} aria-label="Clear sentence (Alt + C)">🗑 Clear</button>
                </div>

                {/* SENTENCE */}
                <div className="p4-sentence-wrap">
                  <div className="p4-sentence-label">Built Sentence</div>
                  <div className="p4-sentence-chips" role="list" aria-label="Sentence chips">
                    {sentence.length === 0 ? (
                      <span style={{ color: "var(--muted)", fontSize: 13 }}>Signs will appear here…</span>
                    ) : (
                      sentence.map(s => (
                        <button key={s.uid} className="p4-s-chip" onClick={() => removeChip(s.uid)} aria-label={`Remove ${s.name}`} role="listitem">
                          <span aria-hidden="true">{s.emoji}</span> {s.name}
                        </button>
                      ))
                    )}
                  </div>
                  {sentence.length > 0 && <div className="p4-sentence-preview" role="status">💬 "{sentenceText}"</div>}
                </div>

                {/* HISTORY */}
                {history.length > 0 && (
                  <section className="p4-history" aria-labelledby="history-label">
                    <div className="p4-history-label" id="history-label">Recent Detections</div>
                    <div className="p4-history-list" role="list">
                      {history.map((h, i) => (
                        <button key={h.uid || i} className="p4-history-item" onClick={() => addManual(h)} style={{ cursor: "pointer", width: "100%", textAlign: "left", border: "1px solid var(--border)" }} aria-label={`Add ${h.name} from history`} role="listitem">
                          <span className="p4-history-emoji" aria-hidden="true">{h.emoji}</span>
                          <span className="p4-history-name">{h.name}</span>
                          <span className={`p4-history-badge ${h.type}`}>{h.type === "hand" ? "Hand" : "Face"}</span>
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>{h.confidence}%</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <aside className="p4-right">

              {/* HAND SIGN */}
              <section className="p4-detected-card" aria-labelledby="hand-sign-title">
                <div className="p4-card-header">
                  <span id="hand-sign-title">🤟 Hand Sign</span>
                  {detected && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }} role="status">Detected</span>}
                </div>
                <div className="p4-detected-body">
                  {detected ? (
                    <>
                      <div className="p4-detected-emoji" key={detected.name} aria-hidden="true">{detected.emoji}</div>
                      <div className="p4-detected-label">{detected.name}</div>
                      <div className="p4-confidence">
                        Confidence
                        <div className="p4-conf-bar" aria-hidden="true"><div className="p4-conf-fill" style={{ width: `${confidence}%` }} /></div>
                        <strong style={{ color: "var(--accent4)" }}>{confidence}%</strong>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>{detected.desc}</div>
                      <button className="p4-btn p4-btn-speak" style={{ marginTop: 8 }} onClick={() => speak(detected.name)}>🔊 Speak</button>
                    </>
                  ) : (
                    <div className="p4-no-detect">
                      <div className="p4-no-detect-icon" aria-hidden="true">🤚</div>
                      <div>No sign detected yet</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {isLive ? (cameraOn ? "Show your hand" : "Start camera") : "Start random mode"}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* EMOTION */}
              <section className="p4-emotion-card" aria-labelledby="emotion-title">
                <div className="p4-card-header">
                  <span id="emotion-title">😊 Facial Emotion</span>
                  {emotion && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }} role="status">Detected</span>}
                </div>
                <div className="p4-emotion-body">
                  {emotion ? (
                    <>
                      <div className="p4-emotion-emoji" key={emotion.name} aria-hidden="true">{emotion.emoji}</div>
                      <div className="p4-emotion-label" style={{ color: emotion.color }}>{emotion.name}</div>
                      <div className="p4-emotion-desc">{emotion.desc}</div>
                      <button className="p4-btn p4-btn-speak" style={{ marginTop: 4 }} onClick={() => speak(`Feeling ${emotion.name}`)}>🔊 Speak</button>
                    </>
                  ) : (
                    <div className="p4-no-detect">
                      <div className="p4-no-detect-icon" aria-hidden="true">😶</div>
                      <div>No emotion detected yet</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {isLive ? (cameraOn ? "Face the camera" : "Start camera") : "Start random mode"}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* DICT */}
              <section className="p4-dict-card" aria-labelledby="dict-title">
                <div className="p4-card-header">
                  <span id="dict-title">📖 All Signs & Emotions</span>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>Tap to add</span>
                </div>
                <div className="p4-dict-grid" role="list">
                  {ALL_COMBINED.map((g, i) => (
                    <button key={i} className="p4-dict-item" onClick={() => addManual(g)} aria-label={`Add ${g.name}`} role="listitem"
                      style={{ borderColor: g.type === "face" ? "rgba(251,113,133,0.2)" : undefined }}>
                      <span className="p4-dict-emoji" aria-hidden="true">{g.emoji}</span>
                      <span className="p4-dict-label">{g.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }} role="note">
                <div style={{ color: "var(--accent)", fontWeight: 700, marginBottom: 6 }}>🧠 Tech Stack</div>
                <div><strong style={{ color: "var(--text)" }}>MediaPipe Hands</strong> — 21 landmarks · 30fps</div>
                <div><strong style={{ color: "var(--accent3)" }}>MediaPipe Face Mesh</strong> — 468 landmarks</div>
                <div><strong style={{ color: "var(--accent5)" }}>Random Mode</strong> — {ALL_SIGNS.length} signs + {ALL_EMOTIONS.length} emotions</div>
                <div><strong style={{ color: "var(--accent4)" }}>Backend</strong> — MongoDB session history</div>
              </div>

              {/* ── BACKEND STATS CARD ─────────────────────────── */}
              {backendStats && (
                <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, overflow: "hidden" }} aria-labelledby="stats-title">
                  <div className="p4-card-header">
                    <span id="stats-title">📊 Your Sign Stats</span>
                    <button
                      onClick={loadBackendHistory}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--muted)" }}
                      aria-label="Refresh stats"
                    >
                      {backendLoading ? "⏳" : "🔄"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px" }}>
                    <div style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.18)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontFamily: "Syne, sans-serif" }}>{backendStats.totalSessions || 0}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Sessions</div>
                    </div>
                    <div style={{ background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.18)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent2)", fontFamily: "Syne, sans-serif" }}>{backendStats.totalGestures || 0}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Gestures</div>
                    </div>
                    <div style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent4)", fontFamily: "Syne, sans-serif" }}>{backendStats.totalSpoken || 0}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Spoken</div>
                    </div>
                    <div style={{ background: "rgba(251,113,133,0.07)", border: "1px solid rgba(251,113,133,0.18)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent3)", fontFamily: "Syne, sans-serif" }}>
                        {backendStats.topSigns?.[0]?.emoji || "🤟"}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                        {backendStats.topSigns?.[0]?._id || "Top Sign"}
                      </div>
                    </div>
                  </div>
                  {backendStats.topSigns?.length > 1 && (
                    <div style={{ padding: "0 16px 14px" }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Top Signs</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {backendStats.topSigns.map((s, i) => (
                          <div key={i} style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", fontSize: 11, color: "var(--accent2)" }}>
                            {s.emoji} {s._id} <span style={{ color: "var(--muted)" }}>×{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* ── BACKEND SESSION HISTORY ────────────────────── */}
              {(backendHistory.length > 0 || backendLoading) && (
                <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, overflow: "hidden" }} aria-labelledby="bk-history-title">
                  <div className="p4-card-header" style={{ cursor: "pointer" }} onClick={() => setShowBackendHistory(v => !v)}>
                    <span id="bk-history-title">🗂 Saved Sessions</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>{backendHistory.length} saved</span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{showBackendHistory ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {showBackendHistory && (
                    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", scrollbarWidth: "thin" }}>
                      {backendLoading && (
                        <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", padding: 12 }}>Loading…</div>
                      )}
                      {backendHistory.map(sess => (
                        <div key={sess._id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, marginBottom: 3 }}>
                                💬 {sess.sentence || "(no sentence)"}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <span>{sess.gestureCount} gestures</span>
                                <span>·</span>
                                <span style={{ textTransform: "capitalize" }}>{sess.mode} mode</span>
                                <span>·</span>
                                <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                              </div>
                              {sess.signs?.length > 0 && (
                                <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                                  {sess.signs.slice(0, 6).map((s, i) => (
                                    <span key={i} style={{ fontSize: 16 }} title={s.name}>{s.emoji}</span>
                                  ))}
                                  {sess.signs.length > 6 && <span style={{ fontSize: 11, color: "var(--muted)" }}>+{sess.signs.length - 6}</span>}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteSession(sess._id)}
                              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 8, color: "var(--danger)", cursor: "pointer", fontSize: 12, padding: "4px 8px", flexShrink: 0 }}
                              aria-label={`Delete session: ${sess.sentence}`}
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </aside>
          </div>
        </main>

        <footer className="p4-footer">
          Made with ❤️ · <span>UnifyTalk</span> · Phase 4 — Sign + Emotion AI
        </footer>

        {toast && <div className={`p4-toast ${toast.type}`} role="alert" aria-live="assertive">{toast.msg}</div>}
      </div>
    </>
  );
}
