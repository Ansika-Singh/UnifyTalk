import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { getChatStats, getPictogramStats, getSignStats, getSOSHistory, getSymptomStats } from '../api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
  .dash-root { min-height: 100vh; padding: 24px; position: relative; }
  .dash-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 70% 50% at 10% 20%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(6,182,212,0.06) 0%, transparent 60%); }
  .dash-content { position: relative; z-index: 2; max-width: 1100px; margin: 0 auto; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
  .dash-welcome h1 { font-family: 'Playfair Display', serif; font-size: clamp(24px, 4vw, 36px); font-weight: 900; color: var(--text, #ede8ff); margin-bottom: 4px; }
  .dash-welcome h1 span { background: linear-gradient(90deg, var(--p2, #c084fc), var(--cyan, #06b6d4)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .dash-welcome p { font-size: 14px; color: var(--muted, #7c6aaa); }
  .dash-actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .dash-btn { padding: 10px 18px; border-radius: 12px; border: 1px solid var(--border, #2a1560); background: rgba(168,85,247,0.06); color: var(--text, #ede8ff); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; text-decoration: none; }
  .dash-btn:hover { background: rgba(168,85,247,0.12); border-color: var(--p, #a855f7); }
  .dash-btn-logout { border-color: rgba(244,63,94,0.3); color: #fb7185; }
  .dash-btn-logout:hover { background: rgba(244,63,94,0.1); }
  .dash-profile { display: grid; grid-template-columns: auto 1fr auto; gap: 20px; padding: 28px; border-radius: 22px; background: rgba(14,8,40,0.7); backdrop-filter: blur(16px); border: 1px solid var(--border, #2a1560); margin-bottom: 24px; align-items: center; }
  .dash-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--p, #a855f7), var(--cyan, #06b6d4)); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: white; box-shadow: 0 0 24px rgba(168,85,247,0.3); }
  .dash-profile-info h2 { font-size: 20px; font-weight: 700; color: var(--text, #ede8ff); margin-bottom: 4px; }
  .dash-profile-info p { font-size: 13px; color: var(--muted, #7c6aaa); }
  .dash-profile-badge { padding: 5px 14px; border-radius: 100px; font-size: 11px; font-weight: 600; background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.3); color: #67e8f9; text-transform: capitalize; white-space: nowrap; }
  .dash-section-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: var(--text, #ede8ff); margin-bottom: 16px; }
  .dash-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; margin-bottom: 28px; }
  .dash-stat { padding: 22px 18px; border-radius: 18px; background: rgba(14,8,40,0.6); backdrop-filter: blur(12px); border: 1px solid var(--border, #2a1560); transition: all 0.2s; text-align: center; }
  .dash-stat:hover { border-color: var(--p, #a855f7); transform: translateY(-3px); }
  .dash-stat-icon { font-size: 28px; margin-bottom: 8px; }
  .dash-stat-num { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; background: linear-gradient(90deg, var(--p, #a855f7), var(--cyan, #06b6d4)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; margin-bottom: 4px; }
  .dash-stat-label { font-size: 12px; color: var(--muted, #7c6aaa); }
  .dash-phases { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 28px; }
  .dash-phase-card { padding: 18px 16px; border-radius: 16px; background: rgba(14,8,40,0.5); border: 1px solid var(--border, #2a1560); transition: all 0.2s; text-decoration: none; color: var(--text, #ede8ff); display: flex; align-items: center; gap: 12px; }
  .dash-phase-card:hover { border-color: var(--p, #a855f7); transform: translateX(4px); }
  .dash-phase-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .dash-phase-info h3 { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .dash-phase-info p { font-size: 11px; color: var(--muted, #7c6aaa); }
  .dash-settings { padding: 24px; border-radius: 22px; background: rgba(14,8,40,0.6); border: 1px solid var(--border, #2a1560); margin-bottom: 28px; }
  .dash-setting-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid rgba(42,21,96,0.5); }
  .dash-setting-row:last-child { border-bottom: none; }
  .dash-setting-label { font-size: 14px; color: var(--text, #ede8ff); font-weight: 500; }
  .dash-setting-desc { font-size: 11px; color: var(--muted, #7c6aaa); margin-top: 2px; }
  .dash-toggle { width: 44px; height: 24px; border-radius: 100px; border: none; cursor: pointer; position: relative; transition: background 0.2s; background: var(--border, #2a1560); }
  .dash-toggle.on { background: linear-gradient(135deg, var(--p, #a855f7), var(--cyan, #06b6d4)); }
  .dash-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; }
  .dash-toggle.on::after { transform: translateX(20px); }
  .dash-badges { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
  .dash-badge { padding: 10px 16px; border-radius: 14px; background: rgba(168,85,247,0.08); border: 1px solid var(--border, #2a1560); display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted, #7c6aaa); }
  .dash-badge.earned { background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.3); color: #34d399; }
  @media(max-width:700px) { .dash-profile { grid-template-columns: 1fr; text-align: center; justify-items: center; } .dash-header { flex-direction: column; align-items: flex-start; } }
`;

const PHASES = [
  { path:'/chat', icon:'💬', bg:'rgba(168,85,247,0.12)', name:'Chat', desc:'Speech ↔ Text' },
  { path:'/board', icon:'🖼️', bg:'rgba(6,182,212,0.12)', name:'Pictograms', desc:'76 symbols' },
  { path:'/phrases', icon:'⚡', bg:'rgba(245,158,11,0.12)', name:'Phrases', desc:'Quick phrases' },
  { path:'/signs', icon:'🤟', bg:'rgba(129,140,248,0.12)', name:'Sign AI', desc:'Hand detection' },
  { path:'/reader', icon:'📖', bg:'rgba(52,211,153,0.12)', name:'Screen Reader', desc:'Voice nav' },
  { path:'/community', icon:'🌍', bg:'rgba(251,113,133,0.12)', name:'Community', desc:'Connect' },
  { path:'/symptom', icon:'🤖', bg:'rgba(232,52,26,0.12)', name:'Symptoms', desc:'Medical AI' },
  { path:'/emergency', icon:'🚨', bg:'rgba(244,63,94,0.12)', name:'Emergency', desc:'SOS alerts' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { notify } = useNotifications();
  const { theme, cycleTheme, largeText, toggleLargeText } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ chat:0, picto:0, sign:0, sos:0, symptom:0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const r = await Promise.allSettled([getChatStats(), getPictogramStats(), getSignStats(), getSOSHistory(), getSymptomStats()]);
      setStats({
        chat:    r[0].status==='fulfilled' ? (r[0].value.data.totalSessions||0) : 0,
        picto:   r[1].status==='fulfilled' ? (r[1].value.data.totalSessions||0) : 0,
        sign:    r[2].status==='fulfilled' ? (r[2].value.data.totalSessions||0) : 0,
        sos:     r[3].status==='fulfilled' ? (r[3].value.data.length||0) : 0,
        symptom: r[4].status==='fulfilled' ? (r[4].value.data.totalReports||0) : 0,
      });
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (!user) { navigate('/auth'); return; } document.title = 'Dashboard | UnifyTalk'; loadStats(); }, [user, navigate, loadStats]);

  const { lang, changeLang, t, LANGUAGES } = useLanguage();

  const handleLogout = () => { logout(); notify({ message: `👋 ${t('logout')}`, type: 'info' }); navigate('/'); };
  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';
  const total = stats.chat + stats.picto + stats.sign + stats.sos + stats.symptom;
  const themeLabels = { dark:'🌙 Dark', light:'☀️ Light', 'high-contrast':'♿ Contrast' };
  const badges = [
    { icon:'🎯', label:'First Login', earned:true },
    { icon:'💬', label:'10+ Chats', earned: stats.chat>=10 },
    { icon:'🤟', label:'5+ Signs', earned: stats.sign>=5 },
    { icon:'🌟', label:'50+ Total', earned: total>=50 },
  ];

  return (<>
    <style>{styles}</style>
    <div className="dash-root">
      <div className="dash-bg" aria-hidden="true" />
      <div className="dash-content">
        <div className="dash-header">
          <div className="dash-welcome"><h1>{t('welcomeBack')}, <span>{user.name||'User'}</span> 👋</h1><p>{t('dashboard')}</p></div>
          <div className="dash-actions">
            <button className="dash-btn" onClick={cycleTheme}>{themeLabels[theme]||'🌙 Dark'}</button>
            <button className="dash-btn" onClick={toggleLargeText}>{largeText ? '🔤 Normal' : '🔠 Large'}</button>
            <button className="dash-btn dash-btn-logout" onClick={handleLogout}>🚪 {t('logout')}</button>
          </div>
        </div>

        <div className="dash-profile">
          <div className="dash-avatar" aria-hidden="true">{initials}</div>
          <div className="dash-profile-info"><h2>{user.name}</h2><p>{user.email}</p></div>
          <div className="dash-profile-badge">{user.disabilityType==='none' ? `✅ ${t('none')}` : `${user.disabilityType}`}</div>
        </div>

        <div className="dash-section-title">📊 {t('yourActivity')}</div>
        <div className="dash-stats">
          {[
            { icon:'💬', num:stats.chat, label:t('chatSessions') },
            { icon:'🖼️', num:stats.picto, label:t('pictogramSessions') },
            { icon:'🤟', num:stats.sign, label:t('signSessions') },
            { icon:'🚨', num:stats.sos, label:t('sosAlerts') },
            { icon:'🤖', num:stats.symptom, label:t('symptomReports') },
            { icon:'⭐', num:total, label:t('totalActivities') },
          ].map((s,i) => (
            <div key={i} className="dash-stat">
              <div className="dash-stat-icon" aria-hidden="true">{s.icon}</div>
              <div className="dash-stat-num">{loading ? '…' : s.num}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dash-section-title">🏅 {t('achievements')}</div>
        <div className="dash-badges">
          {badges.map((a,i) => <div key={i} className={`dash-badge ${a.earned?'earned':''}`}><span aria-hidden="true">{a.icon}</span> {a.label} {a.earned && '✓'}</div>)}
        </div>

        <div className="dash-section-title">🚀 {t('quickAccess')}</div>
        <div className="dash-phases">
          {PHASES.map((p,i) => <NavLink key={i} to={p.path} className="dash-phase-card"><div className="dash-phase-icon" style={{background:p.bg}} aria-hidden="true">{p.icon}</div><div className="dash-phase-info"><h3>{p.name}</h3><p>{p.desc}</p></div></NavLink>)}
        </div>

        <div className="dash-section-title">⚙️ {t('settings')}</div>
        <div className="dash-settings">
          <div className="dash-setting-row"><div><div className="dash-setting-label">{t('largeText')}</div><div className="dash-setting-desc">+25%</div></div><button className={`dash-toggle ${largeText?'on':''}`} onClick={toggleLargeText} aria-label={`${t('largeText')} ${largeText?'on':'off'}`}/></div>
          <div className="dash-setting-row"><div><div className="dash-setting-label">{t('theme')}: {themeLabels[theme]}</div><div className="dash-setting-desc">Dark, Light, Contrast</div></div><button className="dash-btn" onClick={cycleTheme} style={{padding:'8px 14px',fontSize:'12px'}}>{t('switchBtn')}</button></div>
          <div className="dash-setting-row">
            <div>
              <div className="dash-setting-label">🌐 {t('selectLanguage') || 'Language'}</div>
              <div className="dash-setting-desc">{LANGUAGES.find(l => l.code === lang)?.label || 'English'}</div>
            </div>
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="dash-btn"
              style={{ padding: '8px 12px', fontSize: '12px', cursor: 'pointer', background: 'rgba(168,85,247,0.1)' }}
              aria-label="Change Language"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ background: '#0e0828', color: '#ede8ff' }}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  </>);
}
