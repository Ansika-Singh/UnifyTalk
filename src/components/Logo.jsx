// UnifyTalk Logo Component
// Drop this into ANY page/component to show the official logo
// Usage: <UnifyTalkLogo size={60} /> or <UnifyTalkLogo size={40} showText={false} />

export function UnifyTalkLogo({ size = 60, showText = true, showSlogan = false }) {
  const s = size;

  const LogoSVG = () => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="ogBg" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#f5a832" />
          <stop offset="100%" stopColor="#d97316" />
        </radialGradient>
        <radialGradient id="micPink" cx="38%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#e898c8" />
          <stop offset="55%" stopColor="#b85898" />
          <stop offset="100%" stopColor="#783060" />
        </radialGradient>
      </defs>

      {/* Orange rounded square bg */}
      <rect x="0" y="0" width="100" height="100" rx="18" fill="url(#ogBg)" />

      {/* Black speech bubble circle */}
      <circle cx="46" cy="42" r="32" fill="#111111" />
      {/* Bubble tail */}
      <path d="M58,71 L70,82 L50,74" fill="#111111" />

      {/* Headphone left ear */}
      <rect x="20" y="33" width="7" height="14" rx="3.5" fill="url(#micPink)" />
      {/* Headphone right ear */}
      <rect x="65" y="33" width="7" height="14" rx="3.5" fill="url(#micPink)" />
      {/* Headphone band */}
      <path d="M25,39 Q25,16 46,16 Q67,16 67,39"
        fill="none" stroke="#b85898" strokeWidth="5.5" strokeLinecap="round" />

      {/* Mic body */}
      <rect x="40" y="28" width="12" height="22" rx="6" fill="url(#micPink)" />
      {/* Mic highlight */}
      <rect x="42" y="30" width="4" height="9" rx="2" fill="white" opacity="0.25" />
      {/* Mic grill lines */}
      <line x1="40" y1="35" x2="52" y2="35" stroke="#601840" strokeWidth="0.7" opacity="0.6" />
      <line x1="40" y1="39" x2="52" y2="39" stroke="#601840" strokeWidth="0.7" opacity="0.6" />
      <line x1="40" y1="43" x2="52" y2="43" stroke="#601840" strokeWidth="0.7" opacity="0.6" />
      {/* Mic stand */}
      <path d="M40,50 Q36,56 36,61 L56,61 Q56,56 52,50"
        fill="none" stroke="#b85898" strokeWidth="1.8" strokeLinecap="round" />
      {/* Mic base */}
      <rect x="33" y="59" width="26" height="3.5" rx="1.75" fill="#b85898" />
    </svg>
  );

  if (!showText) return <LogoSVG />;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <LogoSVG />
      <div>
        <div style={{
          fontFamily: "'Arial Black', sans-serif",
          fontWeight: 900,
          fontSize: s * 0.38,
          color: "#f0f4ff",
          letterSpacing: 1,
          lineHeight: 1,
        }}>
          UNIFY<span style={{ color: "#f97316" }}>TALK</span>
        </div>
        {showSlogan && (
          <div style={{
            fontFamily: "Arial, sans-serif",
            fontSize: s * 0.16,
            color: "#9060a0",
            fontWeight: 600,
            letterSpacing: 1,
            marginTop: 2,
          }}>
            Every Voice · Every Ability · No Limits
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifyTalkLogo;
