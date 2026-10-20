import { useState, useEffect, useCallback } from "react";
import { saveSymptomReport } from '../api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

  :root {
    --red: #E8341A;
    --red-dim: rgba(232,52,26,0.12);
    --red-glow: rgba(232,52,26,0.25);
    --amber: #F5A623;
    --green: #27AE60;
    --ink: #0D0D0D;
    --ink2: #1A1A1A;
    --ink3: #242424;
    --steel: #3A3A3A;
    --mist: #888;
    --fog: #555;
    --white: #F5F5F0;
    --white-dim: rgba(245,245,240,0.06);
    --white-mid: rgba(245,245,240,0.12);
    --white-soft: rgba(245,245,240,0.7);
    --accent: #38bdf8;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ACCESSIBILITY */
  .sc-skip {
    position: fixed; top: -100px; left: 16px; z-index: 9999;
    background: var(--red); color: white; padding: 10px 20px;
    border-radius: 8px; font-weight: 700; transition: top 0.2s;
    text-decoration: none;
  }
  .sc-skip:focus { top: 16px; outline: 3px solid white; }

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

  .sc-root {
    font-family: 'IBM Plex Sans', sans-serif;
    background: var(--ink);
    color: var(--white);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  /* Subtle grid background */
  .sc-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: 
      linear-gradient(rgba(245,245,240,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,245,240,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .sc-content {
    position: relative;
    z-index: 1;
    max-width: 760px;
    margin: 0 auto;
    padding: 40px 24px 60px;
    width: 100%;
  }

  /* ── HEADER ── */
  .sc-header {
    margin-bottom: 48px;
  }

  .sc-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--red-dim);
    border: 1px solid var(--red);
    border-radius: 4px;
    padding: 4px 10px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--red);
    margin-bottom: 20px;
  }

  .sc-badge-dot {
    width: 6px; height: 6px;
    background: var(--red);
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .sc-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--white);
    margin-bottom: 14px;
  }

  .sc-title span {
    color: var(--red);
  }

  .sc-desc {
    font-size: 1rem;
    color: var(--mist);
    line-height: 1.6;
    max-width: 520px;
  }

  /* ── STEP INDICATOR ── */
  .sc-steps {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 36px;
  }

  .sc-step {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    color: var(--fog);
    text-transform: uppercase;
  }

  .sc-step.active {
    color: var(--white);
  }

  .sc-step.done {
    color: var(--green);
  }

  .sc-step-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 1px solid currentColor;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem;
    flex-shrink: 0;
  }

  .sc-step.done .sc-step-num {
    background: var(--green);
    border-color: var(--green);
    color: white;
  }

  .sc-step-line {
    flex: 1;
    height: 1px;
    background: var(--steel);
    margin: 0 12px;
    max-width: 60px;
  }

  /* ── PANEL ── */
  .sc-panel {
    background: var(--ink2);
    border: 1px solid var(--steel);
    border-radius: 10px;
    padding: 28px;
    margin-bottom: 20px;
  }

  .sc-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--mist);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sc-panel-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--steel);
  }

  /* ── TAGS ── */
  .sc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 4px;
  }

  .sc-tag {
    padding: 6px 12px;
    background: var(--white-dim);
    border: 1px solid var(--steel);
    border-radius: 4px;
    font-size: 0.82rem;
    color: var(--white-soft);
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'IBM Plex Sans', sans-serif;
  }

  .sc-tag:hover {
    background: var(--white-mid);
    border-color: var(--mist);
    color: var(--white);
  }

  .sc-tag.selected {
    background: var(--red-dim);
    border-color: var(--red);
    color: var(--white);
  }

  /* ── INPUTS ── */
  .sc-field {
    margin-bottom: 20px;
  }

  .sc-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mist);
    margin-bottom: 8px;
  }

  .sc-textarea {
    width: 100%;
    background: var(--ink3);
    border: 1px solid var(--steel);
    border-radius: 6px;
    padding: 14px 16px;
    color: var(--white);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.95rem;
    line-height: 1.6;
    resize: vertical;
    min-height: 110px;
    transition: border-color 0.15s;
  }

  .sc-textarea::placeholder { color: var(--fog); }

  .sc-textarea:focus {
    outline: none;
    border-color: var(--mist);
  }

  .sc-select-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  .sc-select {
    background: var(--ink3);
    border: 1px solid var(--steel);
    border-radius: 6px;
    padding: 10px 14px;
    color: var(--white);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.9rem;
    cursor: pointer;
    width: 100%;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }

  .sc-select:focus { outline: none; border-color: var(--mist); }

  /* ── SEVERITY SCALE ── */
  .sc-severity {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .sc-sev-btn {
    flex: 1;
    padding: 8px 4px;
    border-radius: 4px;
    border: 1px solid var(--steel);
    background: var(--ink3);
    color: var(--fog);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }

  .sc-sev-btn:hover { border-color: var(--mist); color: var(--white); }

  .sc-sev-btn.sel-low { background: rgba(39,174,96,0.15); border-color: #27AE60; color: #27AE60; }
  .sc-sev-btn.sel-mid { background: rgba(245,166,35,0.15); border-color: #F5A623; color: #F5A623; }
  .sc-sev-btn.sel-high { background: var(--red-dim); border-color: var(--red); color: var(--red); }

  .sc-sev-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.68rem;
    color: var(--fog);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    min-width: 60px;
    text-align: right;
  }

  /* ── SUBMIT BUTTON ── */
  .sc-submit {
    width: 100%;
    padding: 16px;
    background: var(--red);
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }

  .sc-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
  }

  .sc-submit:not(:disabled):hover {
    background: #ff3d1f;
    box-shadow: 0 0 28px var(--red-glow);
    transform: translateY(-1px);
  }

  .sc-submit::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  .sc-submit:not(:disabled):hover::after {
    transform: translateX(100%);
  }

  /* ── LOADING ── */
  .sc-loading {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sc-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── OUTPUT ── */
  .sc-output {
    background: var(--ink2);
    border: 1px solid var(--steel);
    border-radius: 10px;
    overflow: hidden;
    animation: slide-up 0.35s ease;
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .sc-output-header {
    background: var(--ink3);
    border-bottom: 1px solid var(--steel);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sc-output-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--mist);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sc-output-label span {
    color: var(--green);
    font-size: 0.65rem;
  }

  .sc-copy-btn {
    padding: 5px 12px;
    background: var(--white-dim);
    border: 1px solid var(--steel);
    border-radius: 4px;
    color: var(--mist);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    cursor: pointer;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.15s;
  }

  .sc-copy-btn:hover { background: var(--white-mid); color: var(--white); }
  .sc-copy-btn.copied { color: var(--green); border-color: var(--green); }

  .sc-output-body {
    padding: 24px;
  }

  .sc-output-text {
    font-size: 1rem;
    line-height: 1.75;
    color: var(--white);
    white-space: pre-wrap;
  }

  .sc-output-text.streaming::after {
    content: '▌';
    animation: blink 0.7s step-end infinite;
    color: var(--red);
  }

  @keyframes blink { 50% { opacity: 0; } }

  .sc-output-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--steel);
    background: var(--ink3);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    color: var(--fog);
  }

  .sc-output-footer svg {
    flex-shrink: 0;
    color: var(--amber);
  }

  /* ── TRIAGE BADGE ── */
  .sc-triage {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 16px;
  }

  .sc-triage.emergency { background: rgba(232,52,26,0.15); border: 1px solid var(--red); color: var(--red); }
  .sc-triage.urgent { background: rgba(245,166,35,0.12); border: 1px solid var(--amber); color: var(--amber); }
  .sc-triage.routine { background: rgba(39,174,96,0.1); border: 1px solid var(--green); color: var(--green); }

  /* ── LANGUAGE TABS ── */
  .sc-lang-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .sc-lang-tab {
    padding: 6px 14px;
    background: var(--ink3);
    border: 1px solid var(--steel);
    border-radius: 4px;
    color: var(--mist);
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .sc-lang-tab:hover { border-color: var(--mist); color: var(--white); }
  .sc-lang-tab.active { background: var(--white-mid); border-color: var(--mist); color: var(--white); }

  /* ── ERROR ── */
  .sc-error {
    background: rgba(232,52,26,0.1);
    border: 1px solid var(--red);
    border-radius: 8px;
    padding: 14px 18px;
    color: var(--red);
    font-size: 0.88rem;
    margin-top: 16px;
  }

  /* ── DISCLAIMER ── */
  .sc-disclaimer {
    margin-top: 28px;
    padding: 14px 18px;
    border: 1px solid var(--steel);
    border-radius: 6px;
    font-size: 0.78rem;
    color: var(--fog);
    line-height: 1.5;
    font-family: 'IBM Plex Mono', monospace;
    letter-spacing: 0.01em;
  }

  .sc-disclaimer strong {
    color: var(--amber);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.7rem;
  }

  @media (max-width: 500px) {
    .sc-select-row { grid-template-columns: 1fr; }
    .sc-title { font-size: 1.9rem; }
  }
`;

const SYMPTOM_TAGS = [
  "Chest pain", "Shortness of breath", "Severe headache", "Stomach pain",
  "High fever", "Nausea / vomiting", "Dizziness", "Extreme fatigue",
  "Cough", "Sore throat", "Back pain", "Blurred vision",
  "Palpitations", "Swelling", "Rash", "Numbness"
];

const LANGUAGES = [
  { code: "english", label: "English" },
  { code: "hindi", label: "हिंदी" },
  { code: "kannada", label: "ಕನ್ನಡ" },
  { code: "tamil", label: "தமிழ்" },
  { code: "telugu", label: "తెలుగు" },
];

const DURATION_OPTIONS = [
  "Just started", "Few hours", "1–2 days", "3–7 days", "Over a week"
];

export default function SymptomCommunicator() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [freeText, setFreeText] = useState("");
  const [severity, setSeverity] = useState(null); // 1-10
  const [duration, setDuration] = useState("");
  const [language, setLanguage] = useState("english");
  const [output, setOutput] = useState("");
  const [triageLevel, setTriageLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1); // 1 = input, 2 = output
  const [announcement, setAnnouncement] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const announce = useCallback((msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  const toggleTag = (tag) => {
    const isSelected = selectedTags.includes(tag);
    setSelectedTags(prev =>
      isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    announce(isSelected ? `Removed ${tag}` : `Added ${tag}`);
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const handleSeverity = (v) => {
    setSeverity(v);
    announce(`Severity set to ${v} out of 10`);
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const sevClass = (v) => {
    if (!severity) return "";
    if (v <= 3) return severity === v ? "sel-low" : "";
    if (v <= 6) return severity === v ? "sel-mid" : "";
    return severity === v ? "sel-high" : "";
  };

  const getSeverityGroup = () => {
    if (!severity) return null;
    if (severity <= 3) return "low";
    if (severity <= 6) return "mid";
    return "high";
  };

  const handleGenerate = useCallback(async () => {
    const hasInput = selectedTags.length > 0 || freeText.trim();
    if (!hasInput) {
      announce("Please select a symptom or enter a description first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setOutput("");
    setTriageLevel("");
    setStep(2);
    announce("Generating your communication aid...");

    setTimeout(() => {
      try {
        const mockResponse = generateMockResponse(selectedTags, freeText, severity, duration, language);
        setTriageLevel(mockResponse.triage);
        setOutput(mockResponse.text);
        announce(`Generated. Triage level: ${mockResponse.triage}.`);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        // Save to backend
        saveSymptomReport({
          tags: selectedTags, freeText, severity, duration, language,
          triage: mockResponse.triage, generatedText: mockResponse.text
        }).catch(() => {});
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setStep(1);
        announce("Error generating response. Returning to first step.");
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  }, [selectedTags, freeText, severity, duration, language, announce, setIsLoading, setError, setOutput, setTriageLevel, setStep]);

  const handleSpeak = useCallback(() => {
    if (!output || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(output);
    utterance.lang = language === "hindi" ? "hi-IN" : "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    announce("Speaking generated communication aid.");
  }, [output, language, announce]);

  const generateMockResponse = (tags, text, sev, dur, lang) => {
    // Determine triage level based on symptoms
    const emergencySymptoms = ["chest pain", "shortness of breath", "severe headache", "stroke signs", "unconsciousness"];
    const urgentSymptoms = ["fever", "abdominal pain", "vomiting", "dizziness", "palpitations"];

    const hasEmergency = tags.some(tag => emergencySymptoms.some(sym => tag.toLowerCase().includes(sym))) ||
                        text.toLowerCase().includes("can't breathe") || text.toLowerCase().includes("heart attack");

    const hasUrgent = tags.some(tag => urgentSymptoms.some(sym => tag.toLowerCase().includes(sym))) ||
                     sev >= 8 || text.toLowerCase().includes("severe");

    let triage = "routine";
    if (hasEmergency) triage = "emergency";
    else if (hasUrgent) triage = "urgent";

    // Generate appropriate response text
    const allSymptoms = [...tags];
    if (text) allSymptoms.push(text);

    const symptomText = allSymptoms.length > 0 ? allSymptoms.join(", ") : "various symptoms";

    let responseText = "";

    if (lang === "english") {
      responseText = `I am experiencing ${symptomText}. `;

      if (sev) responseText += `The severity is ${sev}/10. `;
      if (dur) responseText += `This has been going on for ${dur}. `;

      responseText += `Please help me communicate this to medical professionals. I need assistance understanding and articulating my symptoms clearly.`;
    } else if (lang === "hindi") {
      responseText = `मैं ${symptomText} का अनुभव कर रहा/रही हूं। `;

      if (sev) responseText += `तीव्रता ${sev}/10 है। `;
      if (dur) responseText += `यह ${dur} से चल रहा है। `;

      responseText += `कृपया मुझे चिकित्सा पेशेवरों के साथ इसकी स्पष्ट अभिव्यक्ति में मदद करें।`;
    } else {
      // Default to English for other languages in demo
      responseText = `I am experiencing ${symptomText}. `;

      if (sev) responseText += `The severity is ${sev}/10. `;
      if (dur) responseText += `This has been going on for ${dur}. `;

      responseText += `Please help me communicate this to medical professionals.`;
    }

    return { text: responseText, triage };
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      announce("Copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output, setCopied, announce]);

  const handleReset = useCallback(() => {
    setStep(1);
    setOutput("");
    setTriageLevel("");
    setError("");
    setSelectedTags([]);
    setFreeText("");
    setSeverity(null);
    setDuration("");
    announce("Reset all fields. Returning to first step.");
  }, [setStep, setOutput, setTriageLevel, setError, setSelectedTags, setFreeText, setSeverity, setDuration, announce]);

  useEffect(() => {
    const handleKeys = (e) => {
      // Alt + G to Generate
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (step === 1) handleGenerate();
      }
      // Alt + S to Speak
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (step === 2) handleSpeak();
      }
      // Alt + C to Copy
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (step === 2) handleCopy();
      }
      // Alt + R to Reset
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [step, selectedTags, freeText, severity, duration, language, output, handleGenerate, handleSpeak, handleCopy, handleReset]);

  useEffect(() => {
    document.title = "Symptom Communicator | UnifyTalk";
  }, []);

  const triageLabel = {
    emergency: "🚨 Emergency — Seek immediate care",
    urgent: "⚠️ Urgent — See a doctor today",
    routine: "✓ Routine — Schedule an appointment"
  };

  const hasInput = selectedTags.length > 0 || freeText.trim();

  return (
    <>
      <style>{styles}</style>
      <div className="sc-root" role="application" aria-label="Symptom Communicator">
        <a href="#main-content" className="sc-skip">Skip to main content</a>
        
        {/* ARIA LIVE REGION */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>

        {/* KEYBOARD SHORTCUTS GUIDE FOR SCREEN READERS */}
        <div className="sr-only">
          Keyboard Shortcuts: 
          Alt + G: Generate Communication Aid. 
          Alt + S: Speak generated text. 
          Alt + C: Copy to clipboard. 
          Alt + R: Reset and start over.
        </div>

        <main className="sc-content" id="main-content">

          {/* Header */}
          <header className="sc-header">
            <div className="sc-badge">
              <div className="sc-badge-dot" aria-hidden="true" />
              Medical Communication Tool
            </div>
            <h1 className="sc-title">
              AI Symptom<br /><span>Communicator</span>
            </h1>
            <p className="sc-desc">
              Describe your symptoms clearly — in any language — so your doctor understands you immediately.
            </p>
          </header>

          {/* Steps */}
          <nav className="sc-steps" aria-label="Progress steps">
            <div className={`sc-step ${step === 1 ? "active" : "done"}`} aria-current={step === 1 ? "step" : undefined}>
              <div className="sc-step-num" aria-hidden="true">{step > 1 ? "✓" : "1"}</div>
              Describe
            </div>
            <div className="sc-step-line" aria-hidden="true" />
            <div className={`sc-step ${step === 2 ? "active" : ""}`} aria-current={step === 2 ? "step" : undefined}>
              <div className="sc-step-num" aria-hidden="true">2</div>
              Generate
            </div>
          </nav>

          {step === 1 && (
            <section aria-labelledby="input-section">
              <h2 id="input-section" className="sr-only">Symptom Input Section</h2>
              
              {/* Symptom tags */}
              <div className="sc-panel">
                <div className="sc-panel-title">Select symptoms</div>
                <div className="sc-tags" role="list">
                  {SYMPTOM_TAGS.map(tag => (
                    <button
                      key={tag}
                      className={`sc-tag ${selectedTags.includes(tag) ? "selected" : ""}`}
                      onClick={() => toggleTag(tag)}
                      aria-pressed={selectedTags.includes(tag)}
                    >
                      {selectedTags.includes(tag) ? "✓ " : ""}{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details panel */}
              <div className="sc-panel">
                <div className="sc-panel-title">Add details</div>

                <div className="sc-field">
                  <label htmlFor="free-text" className="sc-label">Describe in your own words</label>
                  <textarea
                    id="free-text"
                    className="sc-textarea"
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                    placeholder="E.g., sharp pain in my left side that gets worse when I breathe deeply, started this morning..."
                  />
                </div>

                <div className="sc-select-row">
                  <div>
                    <label htmlFor="duration-select" className="sc-label">Duration</label>
                    <select
                      id="duration-select"
                      className="sc-select"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                    >
                      <option value="">Select duration</option>
                      {DURATION_OPTIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="language-select" className="sc-label">Output language</label>
                    <select
                      id="language-select"
                      className="sc-select"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sc-field">
                  <label className="sc-label" id="severity-label">Pain / discomfort severity</label>
                  <div className="sc-severity" role="radiogroup" aria-labelledby="severity-label">
                    {[1,2,3,4,5,6,7,8,9,10].map(v => (
                      <button
                        key={v}
                        className={`sc-sev-btn ${sevClass(v)}`}
                        onClick={() => handleSeverity(v)}
                        aria-label={`Severity ${v}`}
                        aria-checked={severity === v}
                        role="radio"
                      >
                        {v}
                      </button>
                    ))}
                    <span className="sc-sev-label" aria-hidden="true">
                      {getSeverityGroup() === "low" && "Mild"}
                      {getSeverityGroup() === "mid" && "Moderate"}
                      {getSeverityGroup() === "high" && "Severe"}
                      {!severity && "Rate"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="sc-submit"
                disabled={isLoading || !hasInput}
                onClick={handleGenerate}
                aria-label="Generate Doctor Communication Aid"
              >
                {isLoading ? (
                  <div className="sc-loading">
                    <div className="sc-spinner" aria-hidden="true" />
                    Generating communication aid...
                  </div>
                ) : (
                  "Generate Doctor Communication (Alt + G) →"
                )}
              </button>

              {error && <div className="sc-error" role="alert">⚠ {error}</div>}
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="output-section">
              <h2 id="output-section" className="sr-only">Symptom Output Section</h2>
              
              {isLoading ? (
                <div className="sc-panel" style={{ textAlign: "center", padding: "48px 28px" }}>
                  <div className="sc-spinner" style={{ margin: "0 auto 16px", width: 28, height: 28, borderWidth: 3 }} aria-hidden="true" />
                  <p style={{ color: "var(--mist)", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
                    Generating your communication aid...
                  </p>
                </div>
              ) : (
                output && (
                  <div className="sc-output">
                    <div className="sc-output-header">
                      <div className="sc-output-label">
                        Communication Aid
                        <span>● Ready</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className={`sc-copy-btn ${isSpeaking ? "active" : ""}`}
                          onClick={handleSpeak}
                          aria-label="Speak generated text"
                        >
                          {isSpeaking ? "🔊 Speaking..." : "🔈 Speak (Alt + S)"}
                        </button>
                        <button
                          className={`sc-copy-btn ${copied ? "copied" : ""}`}
                          onClick={handleCopy}
                          aria-label="Copy to clipboard"
                        >
                          {copied ? "Copied ✓" : "Copy (Alt + C)"}
                        </button>
                      </div>
                    </div>
                    <div className="sc-output-body">
                      {triageLevel && (
                        <div className={`sc-triage ${triageLevel}`} role="status">
                          {triageLabel[triageLevel]}
                        </div>
                      )}
                      <p className="sc-output-text">{output}</p>
                    </div>
                    <footer className="sc-output-footer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Show this to a doctor, nurse, or emergency responder. In a life-threatening emergency, call 112 immediately.
                    </footer>
                  </div>
                )
              )}

              {!isLoading && (
                <button
                  className="sc-submit"
                  style={{ marginTop: 16, background: "var(--ink3)", border: "1px solid var(--steel)", color: "var(--mist)" }}
                  onClick={handleReset}
                  aria-label="Start over"
                >
                  ← Start Over (Alt + R)
                </button>
              )}

              {error && <div className="sc-error" role="alert">⚠ {error}</div>}
            </section>
          )}

          <footer className="sc-disclaimer">
            <strong>Note:</strong> This tool helps communicate symptoms — it does not provide a diagnosis.
            Always consult a qualified medical professional. For emergencies, call 112 (India).
          </footer>

        </main>
      </div>
    </>
  );
}