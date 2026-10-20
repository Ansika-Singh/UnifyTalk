import { useState, useEffect, useCallback } from 'react';
import { getSmartSuggestions } from '../api';

const spStyles = `
  .sp-wrap { margin-bottom: 20px; }
  .sp-card { background: var(--surface, #0d1220); border: 1px solid var(--border, #1c2a44); border-radius: 22px; overflow: hidden; }
  .sp-header { padding: 14px 20px; border-bottom: 1px solid var(--border, #1c2a44); background: var(--surface2, #131a2e); display: flex; align-items: center; justify-content: space-between; }
  .sp-header-left { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--text, #f0f4ff); }
  .sp-badge { font-size: 10px; padding: 3px 10px; border-radius: 100px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.28); color: #f59e0b; font-weight: 600; }
  .sp-refresh { background: none; border: 1px solid var(--border, #1c2a44); color: var(--muted, #64748b); padding: 6px 12px; border-radius: 10px; font-size: 11px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
  .sp-refresh:hover { border-color: #f59e0b; color: #f59e0b; }
  .sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px; }
  @media(max-width:500px) { .sp-grid { grid-template-columns: 1fr; } }
  .sp-item { padding: 14px; border-radius: 14px; border: 1px solid var(--border, #1c2a44); background: rgba(245,158,11,0.04); cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 6px; animation: spIn 0.3s ease; }
  .sp-item:hover { border-color: #f59e0b; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
  .sp-item:active { transform: scale(0.97); }
  @keyframes spIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .sp-item-top { display: flex; align-items: center; gap: 8px; }
  .sp-item-icon { font-size: 20px; }
  .sp-item-cat { font-size: 10px; color: var(--muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; }
  .sp-item-text { font-size: 13px; color: var(--text, #f0f4ff); line-height: 1.4; }
  .sp-item-reason { font-size: 10px; color: rgba(245,158,11,0.7); font-style: italic; }
  .sp-item-actions { display: flex; gap: 6px; margin-top: 4px; }
  .sp-act { background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0.6; transition: opacity 0.2s; padding: 2px; }
  .sp-act:hover { opacity: 1; }
  .sp-loading { padding: 24px; text-align: center; color: var(--muted, #64748b); font-size: 13px; }
`;

// Local rule-based smart phrase engine
function generateLocalSuggestions(context, disabilityType) {
  const hour = new Date().getHours();
  const suggestions = [];

  // Time-based greetings
  if (hour >= 5 && hour < 12) {
    suggestions.push({ icon: '🌅', text: 'Good morning! How are you today?', cat: 'Greeting', reason: 'Morning greeting' });
  } else if (hour >= 12 && hour < 17) {
    suggestions.push({ icon: '☀️', text: 'Good afternoon! Hope you\'re doing well.', cat: 'Greeting', reason: 'Afternoon greeting' });
  } else if (hour >= 17 && hour < 21) {
    suggestions.push({ icon: '🌆', text: 'Good evening! How was your day?', cat: 'Greeting', reason: 'Evening greeting' });
  } else {
    suggestions.push({ icon: '🌙', text: 'Good night, sleep well!', cat: 'Greeting', reason: 'Night greeting' });
  }

  // Disability-specific suggestions
  if (disabilityType === 'deaf') {
    suggestions.push(
      { icon: '📝', text: 'Can you please write that down for me?', cat: 'Communication', reason: 'For deaf users' },
      { icon: '👁️', text: 'I am deaf. Please face me when speaking.', cat: 'Communication', reason: 'For deaf users' },
    );
  } else if (disabilityType === 'mute') {
    suggestions.push(
      { icon: '🔊', text: 'I cannot speak. I will type my response.', cat: 'Communication', reason: 'For mute users' },
      { icon: '📱', text: 'Please read my screen for my message.', cat: 'Communication', reason: 'For mute users' },
    );
  } else if (disabilityType === 'blind') {
    suggestions.push(
      { icon: '🎤', text: 'I am visually impaired. Please describe things to me.', cat: 'Communication', reason: 'For blind users' },
      { icon: '🤝', text: 'Can you guide me to the right direction?', cat: 'Communication', reason: 'For blind users' },
    );
  }

  // Context-based (page the user is on)
  if (context === 'medical' || context === 'symptom') {
    suggestions.push(
      { icon: '🏥', text: 'I need to see a doctor urgently.', cat: 'Medical', reason: 'Medical context' },
      { icon: '💊', text: 'I need my medication. Can you help?', cat: 'Medical', reason: 'Medical context' },
    );
  } else if (context === 'emergency') {
    suggestions.push(
      { icon: '🆘', text: 'Please call emergency services immediately!', cat: 'Emergency', reason: 'Emergency context' },
      { icon: '📍', text: 'I am lost and need help finding my way.', cat: 'Emergency', reason: 'Emergency context' },
    );
  }

  // Common helpful phrases
  const common = [
    { icon: '🙏', text: 'Thank you for your patience and help.', cat: 'Social', reason: 'Commonly used' },
    { icon: '🔄', text: 'Can you repeat that more slowly please?', cat: 'Social', reason: 'Commonly used' },
    { icon: '💧', text: 'I need some water, please.', cat: 'Needs', reason: 'Daily essential' },
    { icon: '🚻', text: 'Where is the nearest restroom?', cat: 'Needs', reason: 'Daily essential' },
    { icon: '😊', text: 'I am feeling great today!', cat: 'Emotion', reason: 'Express feelings' },
    { icon: '🤔', text: 'I don\'t understand. Can you explain?', cat: 'Social', reason: 'Commonly needed' },
  ];

  // Fill up to 6 suggestions
  while (suggestions.length < 6 && common.length > 0) {
    const idx = Math.floor(Math.random() * common.length);
    suggestions.push(common.splice(idx, 1)[0]);
  }

  return suggestions.slice(0, 6);
}

export default function SmartPhrases({ context = 'general', onSpeak, onCopy }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      // Try backend first
      const res = await getSmartSuggestions({ context, timeOfDay: new Date().getHours() });
      if (res.data?.suggestions?.length) {
        const formattedSuggestions = res.data.suggestions.map(s => {
          if (typeof s === 'string') {
            return { icon: '💬', text: s, cat: 'Smart', reason: 'AI Suggestion' };
          }
          return s;
        });
        setSuggestions(formattedSuggestions);
        setLoading(false);
        return;
      }
    } catch {
      // Backend unavailable — use local engine
    }

    // Fallback: local rule-based engine
    const disType = localStorage.getItem('token') ? 'none' : 'none';
    const local = generateLocalSuggestions(context, disType);
    setSuggestions(local);
    setLoading(false);
  }, [context]);

  useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

  const handleSpeak = (text) => { if (onSpeak) onSpeak(text); };
  const handleCopy = (text) => { if (onCopy) onCopy(text); };

  return (
    <div className="sp-wrap">
      <style>{spStyles}</style>
      <div className="sp-card">
        <div className="sp-header">
          <div className="sp-header-left">
            <span aria-hidden="true">🧠</span> Smart Suggestions
            <span className="sp-badge">AI</span>
          </div>
          <button className="sp-refresh" onClick={loadSuggestions} aria-label="Refresh suggestions">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="sp-loading">✨ Generating smart suggestions…</div>
        ) : (
          <div className="sp-grid" role="list" aria-label="Smart phrase suggestions">
            {suggestions.map((s, i) => (
              <div key={i} className="sp-item" role="listitem" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="sp-item-top">
                  <span className="sp-item-icon" aria-hidden="true">{s.icon}</span>
                  <span className="sp-item-cat">{s.cat}</span>
                </div>
                <div className="sp-item-text">{s.text}</div>
                <div className="sp-item-reason">💡 {s.reason}</div>
                <div className="sp-item-actions">
                  <button className="sp-act" onClick={() => handleSpeak(s.text)} aria-label={`Speak: ${s.text}`} title="Speak">🔊</button>
                  <button className="sp-act" onClick={() => handleCopy(s.text)} aria-label={`Copy: ${s.text}`} title="Copy">📋</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
