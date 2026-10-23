import { useState, useEffect, useRef } from "react";

const SHORTCUTS = [
  {
    category: "Navigation",
    items: [
      { key: "Alt + H", desc: "Go to Home / Landing page" },
      { key: "Alt + 1", desc: "Open Chat (Speech ↔ Text, TTS)" },
      { key: "Alt + 2", desc: "Open Pictogram Board & Eye-Gaze" },
      { key: "Alt + 3", desc: "Open Quick Phrases & Emotions" },
      { key: "Alt + 4", desc: "Open Sign AI Detection" },
      { key: "Alt + 5", desc: "Open Screen Reader & Braille" },
      { key: "Alt + 6", desc: "Open Community Hub" },
      { key: "Alt + 7", desc: "Open Symptom Communicator" },
      { key: "Alt + 8", desc: "Open Emergency SOS Beacon" },
      { key: "Alt + D", desc: "Open User Dashboard" },
    ],
  },
  {
    category: "Accessibility Controls",
    items: [
      { key: "Alt + T", desc: "Cycle Theme (Dark, Light, High-Contrast)" },
      { key: "Alt + R", desc: "Toggle Global Screen Reader Voice" },
      { key: "? or Shift + /", desc: "Open / Close this Shortcuts Guide" },
      { key: "Escape", desc: "Close any open dialog or modal" },
      { key: "Tab", desc: "Navigate through interactive elements" },
    ],
  },
  {
    category: "Emergency & SOS",
    items: [
      { key: "Alt + S", desc: "Activate Emergency SOS Alert" },
      { key: "Alt + C", desc: "Cancel active SOS Alert" },
      { key: "Alt + Shift + C", desc: "Initiate Emergency Dispatch Call" },
    ],
  },
];

export default function ShortcutsModal({ isOpen, onClose }) {
  const [search, setSearch] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const query = search.trim().toLowerCase();
  const filtered = SHORTCUTS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.key.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query)
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div
      className="ut-modal-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(6, 4, 22, 0.78)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface, #0e0828)",
          border: "1px solid var(--border, #2a1560)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          color: "var(--text, #ede8ff)",
          outline: "none",
          animation: "modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <style>{`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .ut-shortcut-key {
            padding: 3px 8px;
            border-radius: 6px;
            background: rgba(168, 85, 247, 0.15);
            border: 1px solid rgba(168, 85, 247, 0.35);
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            color: var(--p2, #c084fc);
            white-space: nowrap;
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border, #2a1560)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>⌨️</span>
            <div>
              <h2
                id="shortcuts-title"
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  fontFamily: "'Playfair Display', serif",
                  margin: 0,
                }}
              >
                Keyboard Accessibility Shortcuts
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted, #7c6aaa)",
                  margin: 0,
                }}
              >
                Full keyboard navigation & screen-reader hotkeys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            style={{
              background: "none",
              border: "1px solid var(--border, #2a1560)",
              color: "var(--muted, #7c6aaa)",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border, #2a1560)" }}>
          <input
            type="text"
            placeholder="Search shortcuts (e.g. chat, sos, theme)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter shortcuts"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(8, 4, 26, 0.6)",
              border: "1px solid var(--border, #2a1560)",
              color: "var(--text, #ede8ff)",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
            }}
          />
        </div>

        {/* Shortcut Groups */}
        <div
          style={{
            padding: "16px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px", color: "var(--muted, #7c6aaa)", fontSize: "13px" }}>
              No shortcuts found matching "{search}"
            </div>
          ) : (
            filtered.map((cat, idx) => (
              <div key={idx}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--cyan, #06b6d4)",
                    marginBottom: "8px",
                  }}
                >
                  {cat.category}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {cat.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "rgba(168, 85, 247, 0.04)",
                        border: "1px solid rgba(42, 21, 96, 0.6)",
                      }}
                    >
                      <span style={{ fontSize: "13px", color: "var(--text, #ede8ff)" }}>{item.desc}</span>
                      <span className="ut-shortcut-key">{item.key}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid var(--border, #2a1560)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--muted, #7c6aaa)",
          }}
        >
          <span>Press <strong style={{ color: "var(--text, #ede8ff)" }}>Esc</strong> to dismiss anytime</span>
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, var(--p, #a855f7), var(--cyan, #06b6d4))",
              color: "white",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
