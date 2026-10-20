import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

  .auth-root {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; position: relative; overflow: hidden;
    background: var(--bg, #08041a);
  }
  .auth-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(168,85,247,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.1) 0%, transparent 60%);
  }
  .auth-card {
    position: relative; z-index: 2;
    width: 100%; max-width: 440px;
    background: rgba(14,8,40,0.85); backdrop-filter: blur(24px);
    border: 1px solid var(--border, #2a1560); border-radius: 28px;
    padding: 44px 36px; box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    animation: authIn 0.5s ease;
  }
  @keyframes authIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .auth-logo {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-bottom: 32px;
  }
  .auth-logo-icon {
    width: 40px; height: 40px; border-radius: 11px;
    background: linear-gradient(135deg, var(--p, #a855f7), var(--cyan, #06b6d4));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; color: white;
    box-shadow: 0 0 20px rgba(168,85,247,0.4);
  }
  .auth-logo-text {
    font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700;
    background: linear-gradient(90deg, var(--p2, #c084fc), var(--cyan, #06b6d4));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .auth-title {
    font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900;
    text-align: center; margin-bottom: 8px; color: var(--text, #ede8ff);
  }
  .auth-sub {
    text-align: center; font-size: 14px; color: var(--muted, #7c6aaa);
    margin-bottom: 28px; line-height: 1.6;
  }
  .auth-tabs {
    display: flex; gap: 4px; margin-bottom: 28px;
    background: rgba(168,85,247,0.06); border-radius: 14px; padding: 4px;
  }
  .auth-tab {
    flex: 1; padding: 10px; border: none; border-radius: 11px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    background: transparent; color: var(--muted, #7c6aaa);
  }
  .auth-tab.active {
    background: linear-gradient(135deg, var(--p, #a855f7), var(--cyan, #06b6d4));
    color: white; box-shadow: 0 4px 16px rgba(168,85,247,0.3);
  }
  .auth-field {
    margin-bottom: 18px;
  }
  .auth-label {
    display: block; font-size: 12px; font-weight: 600;
    color: var(--muted, #7c6aaa); margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .auth-input {
    width: 100%; padding: 12px 16px; border-radius: 12px;
    border: 1px solid var(--border, #2a1560);
    background: rgba(8,4,26,0.6); color: var(--text, #ede8ff);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    transition: all 0.2s; outline: none;
  }
  .auth-input:focus {
    border-color: var(--p, #a855f7);
    box-shadow: 0 0 0 3px rgba(168,85,247,0.15);
  }
  .auth-input::placeholder { color: rgba(124,106,170,0.5); }
  .auth-select {
    width: 100%; padding: 12px 16px; border-radius: 12px;
    border: 1px solid var(--border, #2a1560);
    background: rgba(8,4,26,0.6); color: var(--text, #ede8ff);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    cursor: pointer; outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%237c6aaa' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
  }
  .auth-select:focus {
    border-color: var(--p, #a855f7);
    box-shadow: 0 0 0 3px rgba(168,85,247,0.15);
  }
  .auth-select option { background: #0e0828; }
  .auth-disability-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .auth-dis-opt {
    padding: 10px 8px; border-radius: 12px; text-align: center;
    border: 1px solid var(--border, #2a1560);
    background: rgba(8,4,26,0.4); cursor: pointer;
    transition: all 0.2s; font-size: 12px; color: var(--muted, #7c6aaa);
  }
  .auth-dis-opt:hover { border-color: var(--p, #a855f7); color: var(--text, #ede8ff); }
  .auth-dis-opt.selected {
    background: rgba(168,85,247,0.12); border-color: var(--p, #a855f7);
    color: var(--p2, #c084fc);
  }
  .auth-dis-emoji { font-size: 20px; display: block; margin-bottom: 4px; }
  .auth-submit {
    width: 100%; padding: 14px; border: none; border-radius: 14px;
    background: linear-gradient(135deg, var(--p, #a855f7), var(--cyan, #06b6d4));
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700; cursor: pointer;
    transition: all 0.25s; margin-top: 8px;
    box-shadow: 0 4px 20px rgba(168,85,247,0.3);
  }
  .auth-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.45); }
  .auth-submit:active { transform: scale(0.98); }
  .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
  .auth-error {
    padding: 10px 14px; border-radius: 10px; margin-bottom: 16px;
    background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3);
    color: #fb7185; font-size: 13px; text-align: center;
    animation: authIn 0.3s ease;
  }
  .auth-footer {
    text-align: center; margin-top: 20px;
    font-size: 12px; color: var(--muted, #7c6aaa);
  }
  .auth-footer a {
    color: var(--p2, #c084fc); text-decoration: none; font-weight: 600;
  }
  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0; color: var(--muted, #7c6aaa); font-size: 11px;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border, #2a1560);
  }
  .auth-lang-picker {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 24px; flex-wrap: wrap;
  }
  .auth-lang-btn {
    padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
    border: 1px solid var(--border, #2a1560); background: rgba(8,4,26,0.4);
    color: var(--muted, #7c6aaa); cursor: pointer; transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .auth-lang-btn:hover { border-color: var(--p, #a855f7); color: var(--text, #ede8ff); }
  .auth-lang-btn.active {
    background: rgba(168,85,247,0.15); border-color: var(--p, #a855f7);
    color: var(--p2, #c084fc);
  }
  @media(max-width:480px) { .auth-card { padding: 32px 20px; } }
`;

const DISABILITY_OPTIONS = [
  { value: 'none',       emoji: '✅', label: 'None' },
  { value: 'deaf',       emoji: '👂', label: 'Deaf' },
  { value: 'mute',       emoji: '🗣️', label: 'Mute' },
  { value: 'blind',      emoji: '👁️', label: 'Blind' },
  { value: 'low-vision', emoji: '🔍', label: 'Low Vision' },
];

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [disabilityType, setDisabilityType] = useState('none');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, user } = useAuth();
  const { notify } = useNotifications();
  const { lang, changeLang, t, LANGUAGES } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => { document.title = mode === 'login' ? 'Login | UnifyTalk' : 'Register | UnifyTalk'; }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        notify({ message: t('welcomeMsg'), type: 'success' });
      } else {
        if (!name.trim()) { setError(t('nameRequired')); setLoading(false); return; }
        if (password.length < 6) { setError(t('passwordMin')); setLoading(false); return; }
        await register(name, email, password, disabilityType);
        notify({ message: t('createdMsg'), type: 'success' });
      }
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirect);
    } catch (err) {
      const msg = err.response?.data?.error || t('genericError');
      setError(msg);
      notify({ message: msg, type: 'alert' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        <div className="auth-bg" aria-hidden="true" />
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon" aria-hidden="true">U</div>
            <div className="auth-logo-text">UnifyTalk</div>
          </div>

          {/* LANGUAGE PICKER */}
          <div className="auth-lang-picker" role="radiogroup" aria-label={t('selectLanguage')}>
            {LANGUAGES.map(l => (
              <button key={l.code} className={`auth-lang-btn ${lang === l.code ? 'active' : ''}`}
                onClick={() => changeLang(l.code)} role="radio" aria-checked={lang === l.code}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          <h1 className="auth-title">{mode === 'login' ? t('welcomeBack') : t('joinUs')}</h1>
          <p className="auth-sub">
            {mode === 'login' ? t('signInSub') : t('registerSub')}
          </p>

          <div className="auth-tabs" role="tablist">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
              role="tab" aria-selected={mode === 'login'}>{t('signIn')}</button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
              role="tab" aria-selected={mode === 'register'}>{t('createAccount')}</button>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">{t('fullName')}</label>
                <input id="auth-name" className="auth-input" type="text"
                  placeholder={t('namePlaceholder')}
                  value={name} onChange={e => setName(e.target.value)}
                  required autoComplete="name" />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">{t('email')}</label>
              <input id="auth-email" className="auth-input" type="email"
                placeholder={t('emailPlaceholder')}
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">{t('password')}</label>
              <input id="auth-password" className="auth-input" type="password"
                placeholder={mode === 'register' ? t('passwordRegPlaceholder') : t('passwordPlaceholder')}
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6} />
            </div>

            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">{t('accessibilityNeed')}</label>
                <div className="auth-disability-grid">
                  {DISABILITY_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      className={`auth-dis-opt ${disabilityType === opt.value ? 'selected' : ''}`}
                      onClick={() => setDisabilityType(opt.value)}
                      aria-pressed={disabilityType === opt.value}>
                      <span className="auth-dis-emoji" aria-hidden="true">{opt.emoji}</span>
                      {t(opt.value === 'low-vision' ? 'lowVision' : opt.value)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? t('wait') : (mode === 'login' ? t('signInBtn') : t('createBtn'))}
            </button>
          </form>

          <div className="auth-footer">
            {mode === 'login'
              ? <>{t('noAccount')} <a href="#register" onClick={(e) => { e.preventDefault(); setMode('register'); setError(''); }}>{t('signUpFree')}</a></>
              : <>{t('haveAccount')} <a href="#login" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }}>{t('signInLink')}</a></>
            }
          </div>
        </div>
      </div>
    </>
  );
}
