import { useNotifications } from '../context/NotificationContext';

const bannerStyles = `
  .ut-notif-stack {
    position: fixed; top: 68px; right: 16px; z-index: 9998;
    display: flex; flex-direction: column; gap: 8px;
    pointer-events: none; max-width: 380px; width: 100%;
  }
  .ut-notif {
    pointer-events: auto;
    display: flex; align-items: flex-start; gap: 10px;
    padding: 14px 16px; border-radius: 14px;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: utNotifIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer; transition: all 0.2s;
    font-size: 13px; line-height: 1.5;
  }
  .ut-notif:hover { transform: translateX(-4px); }
  .ut-notif-info    { background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); color: #67e8f9; }
  .ut-notif-success { background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); color: #34d399; }
  .ut-notif-warning { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; }
  .ut-notif-alert   { background: rgba(244,63,94,0.15); border: 1px solid rgba(244,63,94,0.3); color: #fb7185; }
  .ut-notif-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .ut-notif-msg { flex: 1; font-weight: 500; }
  .ut-notif-close {
    background: none; border: none; color: inherit; opacity: 0.5;
    cursor: pointer; font-size: 14px; padding: 0; transition: opacity 0.2s;
  }
  .ut-notif-close:hover { opacity: 1; }
  .ut-notif-bar {
    position: absolute; bottom: 0; left: 0; height: 2px; border-radius: 0 0 14px 14px;
    animation: utNotifBar linear forwards;
  }
  .ut-notif-bar-info    { background: #06b6d4; }
  .ut-notif-bar-success { background: #34d399; }
  .ut-notif-bar-warning { background: #f59e0b; }
  .ut-notif-bar-alert   { background: #f43f5e; }
  @keyframes utNotifIn {
    from { opacity: 0; transform: translateX(60px) scale(0.9); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes utNotifBar {
    from { width: 100%; }
    to   { width: 0%; }
  }
  .ut-flash-overlay {
    position: fixed; inset: 0; z-index: 99999;
    background: rgba(244,63,94,0.25);
    animation: utFlash 0.6s ease-out forwards;
    pointer-events: none;
  }
  @keyframes utFlash {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 0; }
  }
  @media(max-width: 480px) {
    .ut-notif-stack { right: 8px; left: 8px; max-width: 100%; }
  }
`;

const ICONS = { info: '💬', success: '✅', warning: '⚠️', alert: '🚨' };

export default function NotificationBanner() {
  const { notifications, dismiss, flashActive } = useNotifications();

  return (
    <>
      <style>{bannerStyles}</style>

      {flashActive && <div className="ut-flash-overlay" aria-hidden="true" />}

      <div className="ut-notif-stack" aria-live="polite" aria-label="Notifications">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`ut-notif ut-notif-${n.type}`}
            role="alert"
            onClick={() => dismiss(n.id)}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <span className="ut-notif-icon" aria-hidden="true">{ICONS[n.type] || '💬'}</span>
            <span className="ut-notif-msg">{n.message}</span>
            <button
              className="ut-notif-close"
              onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
              aria-label="Dismiss notification"
            >✕</button>
            <div
              className={`ut-notif-bar ut-notif-bar-${n.type}`}
              style={{ animationDuration: `${n.duration}ms` }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </>
  );
}
