import { useState, useRef, useEffect, useCallback } from "react";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { savePictogramSession } from '../api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #06080f;
    --surface: #0d1220;
    --surface2: #131a2e;
    --surface3: #1a2340;
    --border: #1c2a44;
    --accent: #38bdf8;
    --accent2: #818cf8;
    --accent3: #fb7185;
    --accent4: #34d399;
    --accent5: #fbbf24;
    --text: #f0f4ff;
    --muted: #64748b;
    --danger: #f43f5e;
  }

  .ut-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }

  .ut-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 50% at 5% 20%, rgba(56,189,248,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 95% 70%, rgba(129,140,248,0.08) 0%, transparent 55%),
      radial-gradient(ellipse 40% 30% at 50% 100%, rgba(52,211,153,0.05) 0%, transparent 60%);
  }

  .ut-header {
    position: sticky; top: 0; z-index: 100;
    padding: 14px 32px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
    border-bottom: 1px solid var(--border);
    background: rgba(6,8,15,0.88); backdrop-filter: blur(16px);
  }

  .ut-logo { display: flex; align-items: center; gap: 10px; }
  .ut-logo-icon {
    width: 38px; height: 38px; border-radius: 11px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    box-shadow: 0 4px 14px rgba(56,189,248,0.25);
  }
  .ut-logo-name {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
    background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent3));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .ut-phase-badge {
    font-size: 11px; color: var(--accent4);
    background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.25);
    border-radius: 100px; padding: 4px 12px; font-weight: 600;
  }

  /* ACCESSIBILITY */
  .ut-skip-link {
    position: fixed; top: -100px; left: 16px; z-index: 9999;
    background: var(--accent); color: #06080f; padding: 10px 20px;
    border-radius: 8px; font-weight: 700; transition: top 0.2s;
    text-decoration: none;
  }
  .ut-skip-link:focus { top: 16px; outline: 3px solid white; }

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

  .ut-nav { display: flex; gap: 8px; }
  .ut-nav-btn {
    padding: 7px 14px; border-radius: 10px; border: 1px solid var(--border);
    background: none; color: var(--muted); font-family: 'DM Sans', sans-serif;
    font-size: 12px; cursor: pointer; transition: all 0.2s;
  }
  .ut-nav-btn:hover { border-color: var(--accent2); color: var(--text); }
  .ut-nav-btn.active { border-color: var(--accent2); background: rgba(129,140,248,0.12); color: var(--accent2); }

  .ut-hero {
    position: relative; z-index: 5;
    padding: 38px 32px 24px; text-align: center;
  }
  .ut-hero-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.22);
    border-radius: 100px; padding: 5px 14px;
    font-size: 11px; color: var(--accent4); text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 16px;
  }
  .ut-hero h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(24px, 4vw, 42px); font-weight: 800; line-height: 1.15; margin-bottom: 10px;
  }
  .ut-hero h2 em {
    font-style: normal;
    background: linear-gradient(90deg, var(--accent4), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .ut-hero p { font-size: 14px; color: var(--muted); max-width: 460px; margin: 0 auto; line-height: 1.7; }

  .ut-stats {
    position: relative; z-index: 5;
    max-width: 1100px; margin: 0 auto 20px; padding: 0 24px;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  }
  @media (max-width: 600px) { .ut-stats { grid-template-columns: repeat(2, 1fr); } }
  .ut-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px; text-align: center; transition: all 0.3s;
  }
  .ut-stat:hover { border-color: var(--accent4); transform: translateY(-2px); }
  .ut-stat-n {
    font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
    background: linear-gradient(90deg, var(--accent4), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .ut-stat-l { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .ut-layout {
    position: relative; z-index: 5;
    display: grid; grid-template-columns: 1fr 320px; gap: 18px;
    max-width: 1100px; margin: 0 auto; padding: 0 24px 40px;
  }
  @media (max-width: 800px) { .ut-layout { grid-template-columns: 1fr; } .ut-sidebar { order: -1; } }

  .ut-board-panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 22px; overflow: hidden;
  }
  .ut-panel-header {
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    background: var(--surface2); display: flex; align-items: center; justify-content: space-between;
  }
  .ut-panel-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; }

  .ut-cats {
    display: flex; gap: 6px; padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    overflow-x: auto; flex-wrap: wrap; scrollbar-width: none;
  }
  .ut-cats::-webkit-scrollbar { display: none; }
  .ut-cat-btn {
    padding: 6px 12px; border-radius: 100px; border: 1px solid var(--border);
    background: none; color: var(--muted); font-size: 12px; cursor: pointer;
    white-space: nowrap; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .ut-cat-btn:hover { border-color: var(--accent4); color: var(--text); }
  .ut-cat-btn.active { border-color: var(--accent4); background: rgba(52,211,153,0.12); color: var(--accent4); }

  .ut-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
    gap: 10px; padding: 14px; max-height: 340px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
  }
  .ut-picto {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 13px 6px; border-radius: 14px; border: 1px solid var(--border);
    background: var(--surface2); cursor: pointer; transition: all 0.2s ease;
    user-select: none;
  }
  .ut-picto:hover {
    border-color: var(--accent4); background: rgba(52,211,153,0.08);
    transform: translateY(-3px) scale(1.04); box-shadow: 0 8px 20px rgba(52,211,153,0.15);
  }
  .ut-picto:active { transform: scale(0.96); }
  .ut-picto.added { border-color: var(--accent4); background: rgba(52,211,153,0.18); animation: addPop 0.3s ease; }
  @keyframes addPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
  .ut-picto-icon { font-size: 30px; line-height: 1; }
  .ut-picto-label { font-size: 10px; color: var(--muted); text-align: center; font-weight: 500; line-height: 1.3; }

  .ut-emotions { padding: 12px 14px; border-top: 1px solid var(--border); }
  .ut-emotions-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .ut-emotion-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .ut-emotion-btn {
    padding: 7px 13px; border-radius: 100px; border: 2px solid transparent;
    cursor: pointer; font-size: 13px; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 5px; font-weight: 500;
  }
  .ut-emotion-btn:hover { transform: scale(1.06); }
  .ut-emotion-btn.selected { transform: scale(1.06); }

  .ut-speaking-bar {
    display: flex; align-items: center; gap: 8px; padding: 10px 16px;
    background: rgba(52,211,153,0.07); border-top: 1px solid rgba(52,211,153,0.15);
    font-size: 12px; color: var(--accent4);
  }
  .ut-wave { display: flex; align-items: center; gap: 2px; }
  .ut-wave span { display: block; width: 3px; border-radius: 2px; background: var(--accent4); animation: wave 0.8s ease infinite; }
  .ut-wave span:nth-child(1) { height: 8px; animation-delay: 0s; }
  .ut-wave span:nth-child(2) { height: 14px; animation-delay: 0.15s; }
  .ut-wave span:nth-child(3) { height: 10px; animation-delay: 0.3s; }
  .ut-wave span:nth-child(4) { height: 16px; animation-delay: 0.1s; }
  .ut-wave span:nth-child(5) { height: 8px; animation-delay: 0.25s; }
  @keyframes wave { 0%,100% { transform: scaleY(0.5); opacity: 0.6; } 50% { transform: scaleY(1); opacity: 1; } }

  .ut-sidebar { display: flex; flex-direction: column; gap: 14px; }

  .ut-sentence-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
  .ut-sentence-header {
    padding: 13px 16px; background: var(--surface2); border-bottom: 1px solid var(--border);
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ut-sentence-body { padding: 14px; min-height: 90px; display: flex; flex-wrap: wrap; gap: 7px; align-content: flex-start; }
  .ut-sentence-chip {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 11px; border-radius: 10px;
    background: var(--surface3); border: 1px solid var(--border);
    font-size: 12px; cursor: pointer; transition: all 0.2s;
    animation: chipIn 0.2s ease;
  }
  @keyframes chipIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
  .ut-sentence-chip:hover { border-color: var(--danger); background: rgba(244,63,94,0.1); }
  .ut-sentence-empty { color: var(--muted); font-size: 12px; font-style: italic; }
  .ut-preview {
    margin: 0 14px 12px; padding: 10px 13px; border-radius: 10px;
    background: var(--surface3); border: 1px solid var(--border);
    font-size: 13px; font-style: italic; color: var(--text); line-height: 1.5;
  }
  .ut-sentence-actions { padding: 10px 14px; border-top: 1px solid var(--border); display: flex; gap: 7px; }
  .ut-action-btn {
    flex: 1; padding: 10px 8px; border-radius: 11px; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
    transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .ut-btn-speak { background: linear-gradient(135deg, var(--accent4), var(--accent)); color: #06080f; }
  .ut-btn-speak:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(52,211,153,0.3); }
  .ut-btn-copy { background: rgba(129,140,248,0.15); border: 1px solid rgba(129,140,248,0.3); color: var(--accent2); }
  .ut-btn-copy:hover { background: rgba(129,140,248,0.25); }
  .ut-btn-clear { background: var(--surface2); border: 1px solid var(--border); color: var(--muted); }
  .ut-btn-clear:hover { border-color: var(--danger); color: var(--danger); }

  .ut-history-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
  .ut-history-header {
    padding: 13px 16px; background: var(--surface2); border-bottom: 1px solid var(--border);
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
  }
  .ut-history-list { padding: 10px; max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 7px; }
  .ut-history-item {
    padding: 9px 12px; border-radius: 11px; background: var(--surface2); border: 1px solid var(--border);
    font-size: 12px; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; line-height: 1.5;
  }
  .ut-history-item:hover { border-color: var(--accent); background: rgba(56,189,248,0.06); }
  .ut-history-time { font-size: 10px; color: var(--muted); white-space: nowrap; margin-top: 2px; }
  .ut-history-empty { color: var(--muted); font-size: 12px; font-style: italic; padding: 14px; }
  .ut-replay-btn { background: none; border: none; cursor: pointer; color: var(--accent4); font-size: 13px; padding: 2px; transition: transform 0.2s; flex-shrink: 0; }
  .ut-replay-btn:hover { transform: scale(1.2); }

  .ut-footer { position: relative; z-index: 5; text-align: center; padding: 20px; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); }
  .ut-footer b { background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  /* Eye-gaze input styles */
  .ut-gaze-cursor {
    position: fixed; z-index: 9999; pointer-events: none;
    width: 20px; height: 20px; border-radius: 50%;
    background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
    border: 2px solid var(--accent); box-shadow: 0 0 10px var(--accent);
    transform: translate(-50%, -50%); transition: all 0.1s ease;
  }
  .ut-gaze-selected {
    position: relative; overflow: hidden;
  }
  .ut-gaze-selected::before {
    content: ''; position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(45deg, transparent, rgba(56,189,248,0.2), transparent);
    animation: gazePulse 1.5s ease-in-out infinite;
  }
  .ut-dwell-progress {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
    height: 3px; background: var(--accent);
    transform-origin: left; transition: transform 0.1s ease;
  }
  @keyframes gazePulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  .ut-eye-gaze-toggle {
    position: fixed; bottom: 20px; right: 20px; z-index: 1000;
    padding: 12px 16px; border-radius: 12px; border: none;
    background: var(--surface); border: 1px solid var(--border);
    color: var(--text); font-size: 12px; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .ut-eye-gaze-toggle:hover { border-color: var(--accent); transform: translateY(-1px); }
  .ut-eye-gaze-toggle.active { background: rgba(56,189,248,0.1); border-color: var(--accent); color: var(--accent); }
`;

const CATEGORIES = [
  { id: "all",     icon: "🌐", label: "All"       },
  { id: "greet",   icon: "👋", label: "Greetings" },
  { id: "need",    icon: "🙏", label: "Needs"     },
  { id: "feel",    icon: "💭", label: "Feelings"  },
  { id: "action",  icon: "⚡", label: "Actions"   },
  { id: "place",   icon: "📍", label: "Places"    },
  { id: "people",  icon: "👥", label: "People"    },
  { id: "time",    icon: "⏰", label: "Time"      },
  { id: "food",    icon: "🍽️", label: "Food"      },
  { id: "medical", icon: "🏥", label: "Medical"   },
];

const PICTOGRAMS = [
  { id:1,  cat:"greet",   icon:"👋",  label:"Hello"         },
  { id:2,  cat:"greet",   icon:"😊",  label:"Good morning"  },
  { id:3,  cat:"greet",   icon:"🌙",  label:"Good night"    },
  { id:4,  cat:"greet",   icon:"👐",  label:"Welcome"       },
  { id:5,  cat:"greet",   icon:"🤝",  label:"Nice to meet"  },
  { id:6,  cat:"greet",   icon:"🫡",  label:"Goodbye"       },
  { id:7,  cat:"need",    icon:"🆘",  label:"Help me"       },
  { id:8,  cat:"need",    icon:"💊",  label:"Medicine"      },
  { id:9,  cat:"need",    icon:"🚽",  label:"Bathroom"      },
  { id:10, cat:"need",    icon:"💧",  label:"Water"         },
  { id:11, cat:"need",    icon:"🛏️",  label:"Rest"          },
  { id:12, cat:"need",    icon:"📞",  label:"Call someone"  },
  { id:13, cat:"feel",    icon:"😢",  label:"Sad"           },
  { id:14, cat:"feel",    icon:"😠",  label:"Angry"         },
  { id:15, cat:"feel",    icon:"😰",  label:"Scared"        },
  { id:16, cat:"feel",    icon:"🤒",  label:"Sick"          },
  { id:17, cat:"feel",    icon:"😌",  label:"Calm"          },
  { id:18, cat:"feel",    icon:"🥴",  label:"Confused"      },
  { id:19, cat:"action",  icon:"✅",  label:"Yes"           },
  { id:20, cat:"action",  icon:"❌",  label:"No"            },
  { id:21, cat:"action",  icon:"🔁",  label:"Repeat"        },
  { id:22, cat:"action",  icon:"⏸️",  label:"Wait"          },
  { id:23, cat:"action",  icon:"👍",  label:"Okay"          },
  { id:24, cat:"action",  icon:"🙅",  label:"Stop"          },
  { id:25, cat:"place",   icon:"🏠",  label:"Home"          },
  { id:26, cat:"place",   icon:"🏥",  label:"Hospital"      },
  { id:27, cat:"place",   icon:"🏫",  label:"School"        },
  { id:28, cat:"place",   icon:"🛒",  label:"Shop"          },
  { id:29, cat:"place",   icon:"🚌",  label:"Bus stop"      },
  { id:30, cat:"place",   icon:"🚻",  label:"Toilet"        },
  { id:31, cat:"people",  icon:"👨‍⚕️", label:"Doctor"        },
  { id:32, cat:"people",  icon:"👮",  label:"Police"        },
  { id:33, cat:"people",  icon:"👨‍👩‍👧", label:"Family"        },
  { id:34, cat:"people",  icon:"👩‍🏫", label:"Teacher"       },
  { id:35, cat:"people",  icon:"🧑‍🤝‍🧑",label:"Friend"        },
  { id:36, cat:"people",  icon:"👶",  label:"Child"         },
  { id:37, cat:"time",    icon:"🌅",  label:"Morning"       },
  { id:38, cat:"time",    icon:"☀️",  label:"Afternoon"     },
  { id:39, cat:"time",    icon:"🌆",  label:"Evening"       },
  { id:40, cat:"time",    icon:"🕐",  label:"Now"           },
  { id:41, cat:"time",    icon:"⏳",  label:"Later"         },
  { id:42, cat:"time",    icon:"📅",  label:"Tomorrow"      },
  { id:43, cat:"food",    icon:"🍽️",  label:"Food"          },
  { id:44, cat:"food",    icon:"💧",  label:"Water"         },
  { id:45, cat:"food",    icon:"☕",  label:"Hot drink"     },
  { id:46, cat:"food",    icon:"🍌",  label:"Fruit"         },
  { id:47, cat:"food",    icon:"🍞",  label:"Bread"         },
  { id:48, cat:"food",    icon:"🥗",  label:"Vegetables"    },
  { id:49, cat:"medical", icon:"🤕",  label:"Pain"          },
  { id:50, cat:"medical", icon:"💊",  label:"Tablet"        },
  { id:51, cat:"medical", icon:"🩺",  label:"Check me"      },
  { id:52, cat:"medical", icon:"🩹",  label:"Wound"         },
  { id:53, cat:"medical", icon:"😮‍💨", label:"Can't breathe" },
  { id:54, cat:"medical", icon:"🧠",  label:"Head hurts"    },
];

const EMOTIONS = [
  { id:"happy",  icon:"😄", label:"Happy",   color:"#fbbf24", bg:"rgba(251,191,36,0.12)",  border:"rgba(251,191,36,0.35)"  },
  { id:"sad",    icon:"😢", label:"Sad",     color:"#60a5fa", bg:"rgba(96,165,250,0.12)",   border:"rgba(96,165,250,0.35)"  },
  { id:"angry",  icon:"😠", label:"Angry",   color:"#f87171", bg:"rgba(248,113,113,0.12)",  border:"rgba(248,113,113,0.35)" },
  { id:"scared", icon:"😰", label:"Scared",  color:"#c084fc", bg:"rgba(192,132,252,0.12)",  border:"rgba(192,132,252,0.35)" },
  { id:"calm",   icon:"😌", label:"Calm",    color:"#34d399", bg:"rgba(52,211,153,0.12)",   border:"rgba(52,211,153,0.35)"  },
  { id:"tired",  icon:"😴", label:"Tired",   color:"#94a3b8", bg:"rgba(148,163,184,0.12)",  border:"rgba(148,163,184,0.35)" },
  { id:"pain",   icon:"🤕", label:"In pain", color:"#fb923c", bg:"rgba(251,146,60,0.12)",   border:"rgba(251,146,60,0.35)"  },
  { id:"love",   icon:"🥰", label:"Loved",   color:"#fb7185", bg:"rgba(251,113,133,0.12)",  border:"rgba(251,113,133,0.35)" },
];

export default function UnifyTalkPhase2() {
  const [activeCat, setActiveCat]     = useState("all");
  const [sentence, setSentence]       = useState([]);
  const [emotion, setEmotion]         = useState(null);
  const [history, setHistory]         = useState([]);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [addedId, setAddedId]         = useState(null);
  const [copied, setCopied]           = useState(false);
  const [totalSpoken, setTotalSpoken] = useState(0);
  const [totalBuilt, setTotalBuilt]   = useState(0);
  const [tab, setTab]                 = useState("board");
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  // Eye-gaze input for motor-impaired users
  const [eyeGazeEnabled, setEyeGazeEnabled] = useState(false);
  const [gazeX, setGazeX] = useState(0);
  const [gazeY, setGazeY] = useState(0);
  const [selectedPictoId, setSelectedPictoId] = useState(null);
  const [dwellTime, setDwellTime] = useState(0);
  const [dwellThreshold] = useState(1500); // 1.5 seconds to select

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const dwellTimerRef = useRef(null);
  const filtered = activeCat === "all" ? PICTOGRAMS : PICTOGRAMS.filter(p => p.cat === activeCat);

  // EYE-GAZE INPUT FUNCTIONS
  const checkGazeIntersection = useCallback((x, y) => {
    // Check if gaze intersects with pictogram buttons
    const elements = document.querySelectorAll('.ut-picto');
    let found = false;
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const pictoId = el.dataset.pictoId;
        if (selectedPictoId !== pictoId) {
          // Clear previous timer
          if (dwellTimerRef.current) {
            clearInterval(dwellTimerRef.current);
          }
          
          setSelectedPictoId(pictoId);
          setDwellTime(0);
          
          // Start dwell timer
          dwellTimerRef.current = setInterval(() => {
            setDwellTime(prev => {
              const newTime = prev + 100;
              if (newTime >= dwellThreshold) {
                // Trigger click on dwelled element
                el.click();
                clearInterval(dwellTimerRef.current);
                setSelectedPictoId(null);
                setDwellTime(0);
                return 0;
              }
              return newTime;
            });
          }, 100);
        }
        found = true;
      }
    });
    
    if (!found && selectedPictoId) {
      setSelectedPictoId(null);
      setDwellTime(0);
      if (dwellTimerRef.current) {
        clearInterval(dwellTimerRef.current);
      }
    }
  }, [selectedPictoId, setSelectedPictoId, setDwellTime, dwellThreshold, dwellTimerRef]);

  const startEyeGaze = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 320, height: 240 } 
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      const faceMeshModel = new faceMesh.FaceMesh({ 
        locateFile: f => "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/" + f
      });
      
      faceMeshModel.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      faceMeshModel.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          
          // Calculate eye gaze from iris positions
          const leftIris = landmarks[468];  // Left iris center
          const rightIris = landmarks[473]; // Right iris center
          
          if (leftIris && rightIris) {
            // Average iris position for gaze direction
            const avgX = (leftIris.x + rightIris.x) / 2;
            const avgY = (leftIris.y + rightIris.y) / 2;
            
            // Convert to screen coordinates
            const screenX = avgX * window.innerWidth;
            const screenY = avgY * window.innerHeight;
            
            setGazeX(screenX);
            setGazeY(screenY);
            
            // Check if gaze is over interactive elements
            checkGazeIntersection(screenX, screenY);
          }
        }
      });
      
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await faceMeshModel.send({ image: videoRef.current });
          }
        },
        width: 320,
        height: 240
      });
      
      cameraRef.current = camera;
      camera.start();
      setEyeGazeEnabled(true);
      
    } catch (error) {
      console.error("Eye gaze setup failed:", error);
      alert("Eye gaze input requires camera permission. Please allow camera access.");
    }
  }, [checkGazeIntersection]);

  const stopEyeGaze = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
    setEyeGazeEnabled(false);
    setSelectedPictoId(null);
    setDwellTime(0);
    if (dwellTimerRef.current) {
      clearInterval(dwellTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      stopEyeGaze();
    };
  }, []);

  const addPicto = (p) => {
    setSentence(s => [...s, { ...p, uid: Date.now() + Math.random() }]);
    setAddedId(p.id);
    setTotalBuilt(t => t + 1);
    announce(`Added ${p.label}`);
    if (navigator.vibrate) navigator.vibrate(40);
    setTimeout(() => setAddedId(null), 400);
  };

  const removeChip = (uid) => {
    const chip = sentence.find(c => c.uid === uid);
    if (chip) announce(`Removed ${chip.label}`);
    setSentence(s => s.filter(c => c.uid !== uid));
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const buildText = useCallback(() => {
    const parts = [];
    if (emotion) parts.push("I feel " + emotion.label + ".");
    if (sentence.length) parts.push(sentence.map(c => c.label).join(", "));
    return parts.join(" ");
  }, [emotion, sentence]);

  const speakSentence = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.05;
    u.onstart = () => { setIsSpeaking(true); announce("Speaking your message"); };
    u.onend   = () => { setIsSpeaking(false); setTotalSpoken(t => t + 1); };
    window.speechSynthesis.speak(u);
    const ts = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    setHistory(h => [{ text, time: ts, id: Date.now() }, ...h].slice(0, 20));
    // Save to backend silently
    savePictogramSession({
      sentence: text,
      emotion: emotion?.label || null,
      symbols: sentence.map(s => ({ id: s.id, label: s.label, icon: s.icon, cat: s.cat }))
    }).catch(() => {});
  }, [announce, setIsSpeaking, setTotalSpoken, setHistory, emotion, sentence]);

  const handleSpeak = useCallback(() => speakSentence(buildText()), [speakSentence, buildText]);
  const handleClear = useCallback(() => { 
    setSentence([]); setEmotion(null); 
    announce("Cleared sentence");
    if (navigator.vibrate) navigator.vibrate([40, 40]);
  }, [announce]);
  const handleCopy = useCallback(() => {
    const t = buildText(); if (!t) return;
    navigator.clipboard?.writeText(t);
    setCopied(true); 
    announce("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }, [buildText, announce, setCopied]);

  const handleTabChange = useCallback((t) => {
    setTab(t);
    announce(`Switched to ${t === 'board' ? 'Pictogram Board' : 'Emotion Selector'}`);
  }, [setTab, announce]);

  const handleEmotionSelect = (e) => {
    const isNew = emotion?.id !== e.id;
    setEmotion(prev => prev?.id === e.id ? null : e);
    if (isNew) announce(`Feeling ${e.label}`);
    else announce("Removed emotion");
    if (navigator.vibrate) navigator.vibrate(40);
  };

  useEffect(() => {
    const handleKeys = (e) => {
      // Alt + S to Speak
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSpeak();
      }
      // Alt + C to Clear
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
      // Alt + B to switch to Board tab
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleTabChange("board");
      }
      // Alt + E to switch to Emotion tab
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleTabChange("emotion");
      }
      // Alt + Shift + C to Copy
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      }
      // Alt + V to toggle Eye Gaze
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        eyeGazeEnabled ? stopEyeGaze() : startEyeGaze();
        announce(eyeGazeEnabled ? "Eye gaze disabled" : "Eye gaze enabled");
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [eyeGazeEnabled, emotion, sentence, tab, announce, handleClear, handleCopy, handleSpeak, handleTabChange, startEyeGaze]);

  useEffect(() => {
    document.title = "Pictogram Board | UnifyTalk";
  }, []);

  const fullText = buildText();

  return (
    <>
      <style>{styles}</style>
      <div className="ut-root" role="application" aria-label="Pictogram Communication Board">
        <div className="ut-bg" aria-hidden="true" />
        
        <a href="#main-board" className="ut-skip-link">Skip to board content</a>

        {/* ARIA ANNOUNCEMENT REGION */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {/* KEYBOARD SHORTCUTS GUIDE FOR SCREEN READERS */}
        <div className="sr-only">
          Keyboard Shortcuts: 
          Alt + S: Speak built sentence. 
          Alt + C: Clear sentence. 
          Alt + B: Switch to Pictogram Board tab. 
          Alt + E: Switch to Emotion Selector tab. 
          Alt + Shift + C: Copy to clipboard. 
          Alt + V: Toggle Eye Gaze control.
        </div>

        <header className="ut-header">
          <div className="ut-logo">
            <div className="ut-logo-icon" aria-hidden="true">🤝</div>
            <div className="ut-logo-name">UnifyTalk</div>
          </div>
          <nav className="ut-nav" aria-label="Board tabs">
            <button className={"ut-nav-btn " + (tab==="board"?"active":"")} onClick={()=>handleTabChange("board")} aria-pressed={tab==="board"}>🔲 Picture Board</button>
            <button className={"ut-nav-btn " + (tab==="emotion"?"active":"")} onClick={()=>handleTabChange("emotion")} aria-pressed={tab==="emotion"}>💭 Emotions</button>
          </nav>
          <div className="ut-phase-badge">✨ Phase 2 · Pictograms</div>
        </header>

        <main className="ut-layout" id="main-board">
          {/* HERO (accessible description) */}
          <section className="ut-hero" aria-labelledby="hero-title">
            <div className="ut-hero-tag" aria-hidden="true">✨ New in Phase 2</div>
            <h2 id="hero-title">Build Sentences <em>Without Speaking</em></h2>
            <p>Tap pictures to build your thought. Add an emotion. Hit Speak — UnifyTalk voices it for you instantly.</p>
          </section>

          <section className="ut-stats" aria-label="Platform stats">
            {[
              { n: PICTOGRAMS.length, l: "Pictograms" },
              { n: EMOTIONS.length,   l: "Emotions"   },
              { n: totalBuilt,        l: "Symbols Used"},
              { n: totalSpoken,       l: "Times Spoken"},
            ].map((s,i) => (
              <div key={i} className="ut-stat" role="status">
                <div className="ut-stat-n" aria-label={`${s.n} ${s.l}`}>{s.n}</div>
                <div className="ut-stat-l">{s.l}</div>
              </div>
            ))}
          </section>

          <div className="ut-layout-grid" style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:'18px', width:'100%'}}>
            {/* BOARD PANEL */}
            <section className="ut-board-panel" aria-labelledby="panel-title">
              <div className="ut-panel-header">
                <h3 className="ut-panel-title" id="panel-title">{tab==="board"?"🔲 Pictogram Board":"💭 Emotion Selector"}</h3>
                <span style={{fontSize:"11px",color:"var(--muted)"}} aria-hidden="true">
                  {tab==="board" ? filtered.length + " symbols" : EMOTIONS.length + " emotions"}
                </span>
              </div>

              {tab==="board" && <>
                <nav className="ut-cats" aria-label="Pictogram categories">
                  {CATEGORIES.map(c => (
                    <button key={c.id} className={"ut-cat-btn " + (activeCat===c.id?"active":"")}
                      onClick={()=>setActiveCat(c.id)}
                      aria-pressed={activeCat===c.id}>
                      <span aria-hidden="true">{c.icon}</span> {c.label}
                    </button>
                  ))}
                </nav>
                <div className="ut-grid" role="grid" aria-label="Pictogram selection grid">
                  {filtered.map(p => (
                    <button key={p.id} 
                      className={"ut-picto " + (addedId===p.id?"added":"") + " " + (selectedPictoId === p.id.toString() ? "ut-gaze-selected" : "")}
                      onClick={()=>addPicto(p)} 
                      aria-label={`Add ${p.label} pictogram`}
                      role="gridcell"
                      data-picto-id={p.id}>
                      <span className="ut-picto-icon" aria-hidden="true">{p.icon}</span>
                      <span className="ut-picto-label">{p.label}</span>
                      {selectedPictoId === p.id.toString() && (
                        <div className="ut-dwell-progress" 
                          style={{transform: "scaleX(" + (dwellTime / dwellThreshold) + ")"}} />
                      )}
                    </button>
                  ))}
                </div>
              </>}

              {tab==="emotion" && (
                <div style={{padding:"20px"}}>
                  <div className="ut-emotions-label" style={{fontSize:"11px",color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"14px"}}>
                    How are you feeling right now?
                  </div>
                  <div className="ut-emotion-grid" style={{gap:"12px"}} role="radiogroup" aria-label="Select emotion">
                    {EMOTIONS.map(e => (
                      <button key={e.id}
                        className={"ut-emotion-btn " + (emotion?.id===e.id?"selected":"")}
                        style={{
                          background: emotion?.id===e.id ? e.bg : "var(--surface2)",
                          borderColor: emotion?.id===e.id ? e.border : "var(--border)",
                          color: emotion?.id===e.id ? e.color : "var(--muted)",
                          fontSize:"15px", padding:"12px 20px",
                        }}
                        onClick={()=>handleEmotionSelect(e)}
                        aria-checked={emotion?.id===e.id}
                        role="radio">
                        <span aria-hidden="true">{e.icon}</span> {e.label}
                      </button>
                    ))}
                  </div>
                  {emotion && (
                    <div style={{
                      marginTop:"18px",padding:"13px 16px",borderRadius:"13px",
                      background:"var(--surface2)",border:"1px solid " + emotion.border,
                      fontSize:"13px",color:emotion.color,display:"flex",alignItems:"center",gap:"10px"
                    }} role="status">
                      <span style={{fontSize:"22px"}} aria-hidden="true">{emotion.icon}</span>
                      <div>
                        <div style={{fontWeight:600}}>Emotion: {emotion.label}</div>
                        <div style={{fontSize:"11px",color:"var(--muted)",marginTop:"2px"}}>Added to start of your sentence</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Inline emotion row on board tab */}
              {tab==="board" && (
                <div className="ut-emotions">
                  <div className="ut-emotions-label">🎭 Add Emotion (optional)</div>
                  <div className="ut-emotion-grid" role="radiogroup" aria-label="Select emotion (optional)">
                    {EMOTIONS.map(e => (
                      <button key={e.id}
                        className={`ut-emotion-btn ${emotion?.id===e.id?"selected":""}`}
                        style={{
                          background: emotion?.id===e.id ? e.bg : "var(--surface2)",
                          borderColor: emotion?.id===e.id ? e.border : "var(--border)",
                          color: emotion?.id===e.id ? e.color : "var(--muted)",
                        }}
                        onClick={()=>handleEmotionSelect(e)}
                        aria-checked={emotion?.id===e.id}
                        role="radio">
                        <span aria-hidden="true">{e.icon}</span> {e.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isSpeaking && (
                <div className="ut-speaking-bar" role="status">
                  <div className="ut-wave" aria-hidden="true">{[1,2,3,4,5].map(i=><span key={i}/>)}</div>
                  <span style={{marginLeft:"6px"}}>Speaking your message…</span>
                </div>
              )}
            </section>

            {/* SIDEBAR */}
            <aside className="ut-sidebar">

              <div className="ut-sentence-card">
                <div className="ut-sentence-header">
                  ✍️ Your Sentence
                  <span style={{fontSize:"11px",color:"var(--muted)",fontFamily:"'DM Sans'"}} aria-hidden="true">
                    {sentence.length + (emotion?1:0)} items · click to remove
                  </span>
                </div>
                <div className="ut-sentence-body" role="list" aria-label="Built sentence">
                  {!emotion && sentence.length===0 && (
                    <div className="ut-sentence-empty">Tap pictograms to build your message…</div>
                  )}
                  {emotion && (
                    <button className="ut-sentence-chip"
                      onClick={()=>setEmotion(null)}
                      style={{borderColor:emotion.border,color:emotion.color,background:emotion.bg}}
                      aria-label={`Remove emotion: I feel ${emotion.label}`}
                      role="listitem">
                      <span aria-hidden="true">{emotion.icon}</span> I feel {emotion.label}
                    </button>
                  )}
                  {sentence.map(chip=>(
                    <button key={chip.uid} className="ut-sentence-chip" onClick={()=>removeChip(chip.uid)}
                      aria-label={`Remove ${chip.label}`}
                      role="listitem">
                      <span aria-hidden="true">{chip.icon}</span> {chip.label}
                    </button>
                  ))}
                </div>
                {fullText && (
                  <div className="ut-preview" role="status" aria-label="Sentence preview">"{fullText}"</div>
                )}
                <div className="ut-sentence-actions">
                  <button className="ut-action-btn ut-btn-speak" onClick={handleSpeak}
                    disabled={!fullText} style={{opacity:fullText?1:0.4}}
                    aria-label="Speak built sentence (Alt + S)">
                    🔊 Speak
                  </button>
                  <button className="ut-action-btn ut-btn-copy" onClick={handleCopy}
                    disabled={!fullText}
                    aria-label="Copy to clipboard (Alt + Shift + C)">
                    {copied?"✅":"📋"}
                  </button>
                  <button className="ut-action-btn ut-btn-clear" onClick={handleClear}
                    aria-label="Clear sentence (Alt + C)">🗑</button>
                </div>
              </div>

              <div className="ut-history-card">
                <div className="ut-history-header">🕐 Spoken History</div>
                <div className="ut-history-list" role="log" aria-label="Spoken history log">
                  {history.length===0
                    ? <div className="ut-history-empty">No messages spoken yet.</div>
                    : history.map(h=>(
                      <div key={h.id} className="ut-history-item">
                        <div>
                          <div>{h.text}</div>
                          <div className="ut-history-time">{h.time}</div>
                        </div>
                        <button className="ut-replay-btn" onClick={()=>speakSentence(h.text)} aria-label={`Replay: ${h.text}`}>🔁</button>
                      </div>
                    ))
                  }
                </div>
              </div>

            </aside>
          </div>
        </main>

        <footer className="ut-footer">
          Made with ❤️ by Ansika &nbsp;·&nbsp; <b>UnifyTalk</b> &nbsp;·&nbsp; Phase 2 of 6 · Pictogram Board
        </footer>

        {/* Eye-gaze cursor */}
        {eyeGazeEnabled && (
          <div className="ut-gaze-cursor" 
            style={{ left: gazeX, top: gazeY }} />
        )}

        {/* Eye-gaze toggle button */}
        <button className={`ut-eye-gaze-toggle ${eyeGazeEnabled ? "active" : ""}`}
          onClick={eyeGazeEnabled ? stopEyeGaze : startEyeGaze}>
          👁️ {eyeGazeEnabled ? "Stop Eye Control" : "Start Eye Control"}
        </button>

        {/* Hidden video element for camera */}
        <video ref={videoRef} style={{display: 'none'}} />
        <canvas ref={canvasRef} style={{display: 'none'}} />
      </div>
    </>
  );
}
