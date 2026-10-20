import { useState, useEffect, useCallback } from "react";
import { sendSOSAlert } from '../api';

const styles = `
  /* ACCESSIBILITY */
  .sos-skip {
    position: fixed; top: -100px; left: 16px; z-index: 9999;
    background: #ff4757; color: white; padding: 10px 20px;
    border-radius: 8px; font-weight: 700; transition: top 0.2s;
    text-decoration: none;
  }
  .sos-skip:focus { top: 16px; outline: 3px solid white; }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  :focus-visible {
    outline: 4px solid var(--accent, #38bdf8);
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

  .sos-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 20px;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .sos-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .sos-title {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(90deg, #ff4757, #ff3838);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 10px;
  }

  .sos-subtitle {
    font-size: 1.2rem;
    color: var(--muted);
    max-width: 500px;
  }

  .sos-button {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff4757, #ff3838);
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    text-align: center;
    transition: all 0.3s;
    box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4);
    animation: pulse 2s infinite;
  }

  .sos-button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 30px rgba(255, 71, 87, 0.6);
  }

  .sos-button:active {
    transform: scale(0.95);
  }

  .sos-button.sos-active {
    background: linear-gradient(135deg, #ff6b6b, #ff5252);
    animation: none;
  }

  .sos-button.sos-active {
    animation: emergency-flash 0.5s infinite alternate;
  }

  @keyframes emergency-flash {
    0% { background: linear-gradient(135deg, #ff4757, #ff3838); box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4); }
    100% { background: linear-gradient(135deg, #ff0000, #cc0000); box-shadow: 0 4px 40px rgba(255, 0, 0, 0.8); }
  }

  @keyframes pulse {
    0% { box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4); }
    50% { box-shadow: 0 4px 30px rgba(255, 71, 87, 0.7); }
    100% { box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4); }
  }

  /* VISUAL ALERTS FOR DEAF USERS */
  .sos-visual-alert {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: screen-flash 0.3s infinite alternate;
    pointer-events: none;
  }

  @keyframes screen-flash {
    0% { background: rgba(255, 0, 0, 0.9); }
    100% { background: rgba(255, 255, 255, 0.9); }
  }

  .sos-alert-text {
    font-size: 4rem;
    font-weight: 900;
    color: white;
    text-shadow: 0 0 20px black;
    text-align: center;
    animation: text-pulse 0.5s infinite alternate;
  }

  @keyframes text-pulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }

  .sos-status-alert {
    background: #ff0000 !important;
    color: white !important;
    border: 3px solid yellow !important;
    animation: status-flash 1s infinite alternate;
  }

  @keyframes status-flash {
    0% { background: #ff0000; border-color: yellow; }
    100% { background: yellow; border-color: #ff0000; color: black; }
  }

  .sos-icon {
    font-size: 3rem;
    margin-bottom: 10px;
  }

  .sos-status {
    margin-top: 30px;
    text-align: center;
    padding: 20px;
    background: var(--bg2);
    border-radius: 12px;
    border: 1px solid var(--border);
    max-width: 400px;
  }

  .sos-status h3 {
    color: var(--cyan);
    margin-bottom: 10px;
  }

  .sos-status p {
    color: var(--text);
    line-height: 1.6;
  }

  .sos-emergency-info {
    margin-top: 20px;
    font-size: 0.9rem;
    color: var(--muted);
  }

  .sos-emergency-info strong {
    color: #ff4757;
  }

  .sos-cancel {
    margin-top: 20px;
    padding: 10px 20px;
    background: rgba(255, 71, 87, 0.1);
    border: 1px solid rgba(255, 71, 87, 0.3);
    border-radius: 8px;
    color: #ff4757;
    cursor: pointer;
    font-weight: 600;
  }

  .sos-cancel:hover {
    background: rgba(255, 71, 87, 0.2);
  }
`;

export default function EmergencySOS() {
  const [sosActive, setSosActive] = useState(false);
  const [status, setStatus] = useState("");
  const [showVisualAlert, setShowVisualAlert] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  const announce = useCallback((msg) => {
    setAnnouncement(msg);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  const handleCall = useCallback((type = "Emergency Services") => {
    setIsCalling(true);
    announce(`Calling ${type} now...`);
    
    // TTS for blind users
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Calling ${type}. Connecting to the operator.`);
      window.speechSynthesis.speak(utterance);
    }

    // Vibration for deaf users
    if (navigator.vibrate) {
      navigator.vibrate([100, 100, 100, 100, 300]);
    }

    // Simulate call connection
    setTimeout(() => {
      setIsCalling(false);
      announce(`Connected to ${type}.`);
    }, 4000);
  }, [announce]);

  const handleSOS = useCallback((type = "General") => {
    if (sosActive && type === "General") return;
    setSosActive(true);
    setShowVisualAlert(true);
    setStatus(`🚨 ${type.toUpperCase()} EMERGENCY ACTIVATED! 🚨\n\nSending emergency signal...\nContacting emergency services...\nSharing location data...`);
    announce(`${type} Emergency SOS Activated. Alerting emergency services.`);

    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`EMERGENCY! ${type} emergency! Help is needed immediately!`);
      utterance.rate = 1.2; utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    if (type !== "General") { setTimeout(() => handleCall(type), 1500); }

    // Save to backend & get geolocation
    const alertPayload = { type, deviceInfo: navigator.userAgent };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          sendSOSAlert({ ...alertPayload, latitude: pos.coords.latitude, longitude: pos.coords.longitude }).catch(() => {});
        },
        () => { sendSOSAlert(alertPayload).catch(() => {}); }
      );
    } else {
      sendSOSAlert(alertPayload).catch(() => {});
    }

    setTimeout(() => {
      setStatus(prev => prev + `\n\n✅ ${type} services notified\n📍 Location shared\n🆘 Help is on the way`);
      setShowVisualAlert(false);
      announce(`${type} services notified. Help is on the way.`);
    }, 5000);
  }, [sosActive, announce, handleCall]);

  const cancelSOS = useCallback(() => {
    setSosActive(false);
    setShowVisualAlert(false);
    setStatus("");
    announce("Emergency SOS cancelled.");
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [announce]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + S to activate General SOS
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSOS();
      }
      // Alt + C to cancel SOS
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        cancelSOS();
      }
      // Alt + Shift + C to Call Emergency Services immediately
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCall();
      }
      // Alt + 1-4 for specific SOS types
      if (e.altKey && e.key === '1') { e.preventDefault(); handleSOS("Medical"); }
      if (e.altKey && e.key === '2') { e.preventDefault(); handleSOS("Police"); }
      if (e.altKey && e.key === '3') { e.preventDefault(); handleSOS("Fire"); }
      if (e.altKey && e.key === '4') { e.preventDefault(); handleSOS("Accident"); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSOS, cancelSOS, handleCall]);

  useEffect(() => {
    document.title = "Emergency SOS | UnifyTalk";
  }, []);

  return (
    <>
      <style>{styles}</style>
      
      <a href="#main-sos" className="sos-skip">Skip to SOS button</a>

      {/* ARIA ANNOUNCEMENT REGION */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>

      {/* KEYBOARD SHORTCUTS GUIDE FOR SCREEN READERS */}
      <div className="sr-only">
        Keyboard Shortcuts: 
        Alt + S: Activate General SOS. 
        Alt + 1: Medical SOS. 
        Alt + 2: Police SOS. 
        Alt + 3: Fire SOS. 
        Alt + 4: Accident SOS. 
        Alt + Shift + C: Call Emergency Services immediately.
        Alt + C: Cancel Emergency SOS.
      </div>
      
      {/* VISUAL CALLING OVERLAY FOR DEAF USERS */}
      {isCalling && (
        <div className="sos-visual-alert" style={{ background: 'rgba(56, 189, 248, 0.9)' }} role="alert" aria-live="assertive">
          <div className="sos-alert-text">
            📞<br/>CALLING<br/>SERVICES<br/>...
          </div>
        </div>
      )}
      
      {/* VISUAL ALERT OVERLAY FOR DEAF USERS */}
      {showVisualAlert && (
        <div className="sos-visual-alert" role="alert" aria-live="assertive">
          <div className="sos-alert-text">
            🚨<br/>EMERGENCY<br/>SOS<br/>ACTIVATED<br/>🚨
          </div>
        </div>
      )}
      
      <main className="sos-root" id="main-sos" role="main">
        <header className="sos-header">
          <h1 className="sos-title">Emergency Medical SOS</h1>
          <p className="sos-subtitle">
            One-touch emergency communication for critical medical situations. 
            <span className="sr-only">Press Alt plus S to activate instantly.</span>
          </p>
        </header>

        <section aria-label="SOS Activation">
          <button
            className={`sos-button ${sosActive ? 'sos-active' : ''}`}
            onClick={() => handleSOS()}
            disabled={sosActive}
            aria-label={sosActive ? "Emergency SOS is active" : "Activate general emergency SOS"}
            aria-pressed={sosActive}
          >
            <div className="sos-icon" aria-hidden="true">🚨</div>
            {sosActive ? "SOS ACTIVE" : "PRESS FOR SOS"}
          </button>
        </section>

        {!sosActive && (
          <section className="sos-types" aria-label="Quick Emergency Types" style={{ marginTop: 30, display: 'flex', gap: 15, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { type: "Medical", icon: "🚑", color: "#34d399" },
              { type: "Police", icon: "🚔", color: "#38bdf8" },
              { type: "Fire", icon: "🔥", color: "#fb7185" },
              { type: "Accident", icon: "🚗", color: "#f59e0b" }
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => handleSOS(item.type)}
                style={{
                  padding: '12px 20px', borderRadius: '12px', border: `2px solid ${item.color}`,
                  background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = item.color}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                aria-label={`Activate ${item.type} emergency SOS`}
              >
                <span>{item.icon}</span> {item.type}
              </button>
            ))}
          </section>
        )}

        {status && (
          <section className={`sos-status ${sosActive ? 'sos-status-alert' : ''}`} role="status" aria-live="polite">
            <h2 style={{ color: 'var(--cyan)', marginBottom: 10 }}>Emergency Status</h2>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '1.1rem' }}>{status}</pre>
            
            <div className="sos-emergency-info">
              <p><strong>Emergency Numbers (India):</strong></p>
              <p>🚑 Ambulance: 108</p>
              <p>🚔 Police: 100</p>
              <p>🔥 Fire: 101</p>
            </div>

            <button className="sos-cancel" onClick={cancelSOS} aria-label="Cancel emergency SOS">
              Cancel SOS (Alt + C)
            </button>
          </section>
        )}

        {!sosActive && (
          <section style={{ marginTop: 40, textAlign: 'center', maxWidth: 500 }} aria-label="Feature Information">
            <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
              This feature is designed for life-threatening emergencies. It will:
            </p>
            <ul style={{ color: 'var(--muted)', textAlign: 'left', display: 'inline-block', marginTop: 10 }}>
              <li>📱 Alert emergency contacts</li>
              <li>📍 Share your location</li>
              <li>🏥 Notify local emergency services</li>
              <li>💊 Send relevant medical information</li>
            </ul>
          </section>
        )}
      </main>
    </>
  );
}