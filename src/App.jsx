import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { GlobalScreenReaderProvider, useGlobalScreenReader } from "./context/GlobalScreenReaderContext";
import NotificationBanner from "./components/NotificationBanner";

import Landing       from "./pages/Landing";
import Phase1        from "./pages/Phase1_Chat";
import Phase2        from "./pages/Phase2_Pictograms";
import Phase3        from "./pages/Phase3_Phrases";
import Phase4        from "./pages/Phase4_SignAI";
import Phase5        from "./pages/Phase5_ScreenReader";
import Phase6        from "./pages/Phase6_Community";
import SymptomCommunicator from "./pages/SymptomCommunicator";
import EmergencySOS   from "./pages/EmergencySOS";
import Auth           from "./pages/Auth";
import Dashboard      from "./pages/Dashboard";

const NAV_ROUTES = [
  { path:"/",         icon:"🏠", key:"home",         exact:true  },
  { path:"/chat",     icon:"💬", key:"chat"                      },
  { path:"/board",    icon:"🖼️", key:"pictograms"                },
  { path:"/phrases",  icon:"⚡", key:"phrases"                   },
  { path:"/signs",    icon:"🤟", key:"signAI"                    },
  { path:"/reader",   icon:"📖", key:"screenReader"              },
  { path:"/community",icon:"🌍", key:"community"                 },
  { path:"/symptom",  icon:"🤖", key:"symptoms"                  },
  { path:"/emergency",icon:"🚨", key:"emergency"                 },
];

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; }

  :root {
    --bg:     #08041a;
    --bg2:    #0e0828;
    --border: #2a1560;
    --p:      #a855f7;
    --p2:     #c084fc;
    --cyan:   #06b6d4;
    --text:   #ede8ff;
    --muted:  #7c6aaa;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; transition: background 0.3s, color 0.3s; }

  .ut-navbar {
    position: fixed; top:0; left:0; right:0; z-index:1000;
    height: 56px; padding: 0 28px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(8,4,26,0.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: background 0.3s;
  }

  [data-theme="light"] .ut-navbar { background: rgba(245,243,255,0.92); }
  [data-theme="high-contrast"] .ut-navbar { background: rgba(0,0,0,0.95); border-bottom-color: #fff; }

  .ut-nav-logo {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none;
    font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700;
    background: linear-gradient(90deg, var(--p2), var(--cyan));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .ut-nav-logo-icon {
    width: 28px; height: 28px; border-radius: 7px;
    background: linear-gradient(135deg, var(--p), var(--cyan));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 900; color: white;
    box-shadow: 0 0 14px rgba(168,85,247,0.4);
  }

  .ut-nav-links {
    display: flex; gap: 2px; align-items: center;
    overflow-x: auto; scrollbar-width: none;
  }
  .ut-nav-links::-webkit-scrollbar { display: none; }

  .ut-nav-item {
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 500;
    color: var(--muted); text-decoration: none;
    transition: all 0.18s; white-space: nowrap;
    font-family: 'DM Sans', sans-serif; border: 1px solid transparent;
  }
  .ut-nav-item:hover { color: var(--text); background: rgba(168,85,247,0.07); }
  .ut-nav-item.active {
    background: rgba(168,85,247,0.12);
    border-color: rgba(168,85,247,0.25);
    color: var(--p2);
  }

  .ut-nav-right {
    display: flex; align-items: center; gap: 8px;
  }

  .ut-nav-auth {
    padding: 6px 14px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    text-decoration: none; cursor: pointer;
    border: 1px solid rgba(168,85,247,0.3);
    background: rgba(168,85,247,0.08);
    color: var(--p2);
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .ut-nav-auth:hover { background: rgba(168,85,247,0.15); border-color: var(--p); }
  .ut-nav-auth.primary {
    background: linear-gradient(135deg, var(--p), var(--cyan));
    color: white; border: none;
    box-shadow: 0 0 12px rgba(168,85,247,0.25);
  }
  .ut-nav-auth.primary:hover { box-shadow: 0 4px 20px rgba(168,85,247,0.4); }
  .ut-nav-logout {
    padding: 6px 12px; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    text-decoration: none; cursor: pointer;
    border: 1px solid rgba(244,63,94,0.3);
    background: rgba(244,63,94,0.08);
    color: #fb7185;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 4px;
  }
  .ut-nav-logout:hover {
    background: rgba(244,63,94,0.18);
    border-color: #f43f5e;
    color: #f43f5e;
  }

  .ut-nav-theme {
    padding: 6px 10px; border-radius: 8px;
    background: none; border: 1px solid var(--border);
    color: var(--muted); cursor: pointer;
    font-size: 14px; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .ut-nav-theme:hover { border-color: var(--p); color: var(--text); }

  .ut-nav-lang {
    padding: 5px 8px; border-radius: 8px;
    background: rgba(168,85,247,0.08); border: 1px solid var(--border);
    color: var(--text); cursor: pointer;
    font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    outline: none; transition: all 0.2s;
  }
  .ut-nav-lang:hover { border-color: var(--p); background: rgba(168,85,247,0.15); }
  .ut-nav-lang:focus { border-color: var(--cyan); }

  .ut-phase-tag {
    font-size: 11px; padding: 3px 10px; border-radius: 100px;
    background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.25);
    color: var(--cyan); font-weight: 600; white-space: nowrap;
  }

  .ut-page { padding-top: 56px; min-height: 100vh; }
  .ut-page > * { animation: pageIn 0.3s ease both; }

  @keyframes pageIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ACCESSIBILITY ENHANCEMENTS */
  .skip-link {
    position: absolute; top: -40px; left: 6px; z-index: 10000;
    background: var(--p); color: white; padding: 8px 16px;
    text-decoration: none; border-radius: 4px; font-weight: 600;
    transition: top 0.2s;
  }
  .skip-link:focus { top: 6px; }

  *:focus {
    outline: 2px solid var(--cyan) !important;
    outline-offset: 2px !important;
  }
  button:focus, a:focus, input:focus, textarea:focus, select:focus {
    outline: 2px solid var(--p) !important;
    outline-offset: 2px !important;
  }

  @media (prefers-contrast: high) {
    :root {
      --bg: #000000;
      --text: #ffffff;
      --muted: #cccccc;
      --border: #ffffff;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  }

  .ut-404 {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 80vh;
    gap: 16px; text-align: center; padding: 24px;
  }

  .ut-404 h2 {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-weight: 900; color: var(--text);
  }

  .ut-404 p { color: var(--muted); max-width: 380px; line-height: 1.7; font-size: 15px; }

  .ut-404-btn {
    padding: 12px 28px; border-radius: 12px; border: none; cursor: pointer;
    background: linear-gradient(135deg, var(--p), var(--cyan));
    color: white; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px;
    text-decoration: none; display: inline-block;
  }

  @media(max-width: 768px) {
    .ut-navbar { padding: 0 16px; }
    .ut-phase-tag { display: none; }
    .ut-nav-item { padding: 5px 9px; font-size: 11px; }
    .ut-nav-right { gap: 4px; }
  }
`;

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function GlobalNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { notify } = useNotifications();
  const { theme, cycleTheme } = useTheme();
  const { lang, changeLang, t, LANGUAGES } = useLanguage();
  const { isActive: isScreenReaderActive, toggleScreenReader } = useGlobalScreenReader();
  const navigate = useNavigate();

  // Accessibility Keyboard Shortcuts (Alt+R: Screen Reader, Alt+T: Theme, Alt+H: Home, Alt+E: Emergency SOS)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (isInput) return;

        const key = e.key.toLowerCase();
        if (key === 'r') {
          e.preventDefault();
          toggleScreenReader();
          if (notify) notify({ message: isScreenReaderActive ? '🔇 Screen reader disabled' : '🗣️ Screen reader enabled', type: 'info' });
        } else if (key === 't') {
          e.preventDefault();
          cycleTheme();
        } else if (key === 'h') {
          e.preventDefault();
          navigate('/');
        } else if (key === 'e') {
          e.preventDefault();
          navigate('/emergency');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScreenReaderActive, toggleScreenReader, cycleTheme, navigate, notify]);

  const NAV_LABELS = { home: t('home') || 'Home', chat: t('chat'), pictograms: t('pictograms'), phrases: t('phrases'), signAI: t('signAI'), screenReader: t('screenReader'), community: t('community'), symptoms: t('symptoms'), emergency: t('emergency') };

  const idx = NAV_ROUTES.findIndex(r => r.exact ? pathname === r.path : pathname.startsWith(r.path) && r.path !== "/");
  const tag = idx > 0 ? `Phase ${idx}` : pathname === "/dashboard" ? t('dashboard') : pathname === "/auth" ? t('login') : NAV_LABELS.home;

  const themeIcons = { dark: '🌙', light: '☀️', 'high-contrast': '♿' };

  const handleLogout = () => {
    logout();
    if (notify) notify({ message: `👋 ${t('logout') || 'Signed out'}`, type: 'info' });
    navigate('/');
  };

  return (
    <nav className="ut-navbar" aria-label="Main navigation">
      <NavLink to="/" className="ut-nav-logo" title="UnifyTalk Home (Alt + H)">
        <div className="ut-nav-logo-icon">U</div>
        UnifyTalk
      </NavLink>
      <div className="ut-nav-links">
        {NAV_ROUTES.map(r => (
          <NavLink key={r.path} to={r.path} end={r.exact}
            className={({ isActive }) => `ut-nav-item${isActive ? " active" : ""}`}
            title={r.path === '/emergency' ? 'Emergency SOS (Alt + E)' : undefined}>
            {r.icon} {NAV_LABELS[r.key] || r.key}
          </NavLink>
        ))}
      </div>
      <div className="ut-nav-right">
        <select
          className="ut-nav-lang"
          value={lang}
          onChange={(e) => changeLang(e.target.value)}
          aria-label={t('selectLanguage') || "Select Language"}
          title="Change Language"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code} style={{ background: '#0e0828', color: '#ede8ff' }}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
        <button
          className={`ut-nav-theme ${isScreenReaderActive ? 'active' : ''}`}
          onClick={toggleScreenReader}
          aria-label={isScreenReaderActive ? "Disable Global Screen Reader (Alt + R)" : "Enable Global Screen Reader (Alt + R)"}
          title="Toggle Global Screen Reader (Alt + R)"
          style={isScreenReaderActive ? { borderColor: 'var(--p)', color: 'var(--text)' } : {}}
        >
          {isScreenReaderActive ? '🗣️' : '🔇'}
        </button>
        <button
          className="ut-nav-theme"
          onClick={cycleTheme}
          aria-label={`Cycle Theme: ${theme} (Alt + T)`}
          title={`Theme: ${theme} (Alt + T)`}
        >
          {themeIcons[theme] || '🌙'}
        </button>
        {user ? (
          <>
            <button className="ut-nav-auth" onClick={() => navigate('/dashboard')} title={t('dashboard')}>
              👤 {user.name?.split(' ')[0] || t('dashboard')}
            </button>
            <button className="ut-nav-logout" onClick={handleLogout} title={t('logout') || "Sign Out"} aria-label={t('logout') || "Sign Out"}>
              🚪 {t('logout') || "Sign Out"}
            </button>
          </>
        ) : (
          <button className="ut-nav-auth primary" onClick={() => navigate('/auth')}>
            🔐 {t('login')}
          </button>
        )}
        <div className="ut-phase-tag">{tag}</div>
      </div>
    </nav>
  );
}

function NotFound() {
  return (
    <div className="ut-404">
      <div style={{ fontSize: 52 }}>🔮</div>
      <h2>Page Not Found</h2>
      <p>This page doesn't exist. Head back home to explore UnifyTalk.</p>
      <NavLink to="/" className="ut-404-btn">← Back to Home</NavLink>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
        <div style={{ fontSize:40, animation:'spin 1s linear infinite' }}>⏳</div>
        <p style={{ color:'var(--muted)', fontSize:14 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    // Store intended destination so user lands there after login
    sessionStorage.setItem('redirectAfterLogin', pathname);
    return <Auth />;
  }

  return children;
}

export default function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <style>{globalStyles}</style>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <BrowserRouter>
            <GlobalScreenReaderProvider>
            <ScrollTop />
            <GlobalNav />
            <NotificationBanner />
            <div className="ut-page" id="main-content">
              <Routes>
                <Route path="/"          element={<Landing />} />
                <Route path="/auth"      element={<Auth />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/chat"      element={<ProtectedRoute><Phase1 /></ProtectedRoute>} />
                <Route path="/board"     element={<ProtectedRoute><Phase2 /></ProtectedRoute>} />
                <Route path="/phrases"   element={<ProtectedRoute><Phase3 /></ProtectedRoute>} />
                <Route path="/signs"     element={<ProtectedRoute><Phase4 /></ProtectedRoute>} />
                <Route path="/reader"    element={<ProtectedRoute><Phase5 /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Phase6 /></ProtectedRoute>} />
                <Route path="/symptom"   element={<ProtectedRoute><SymptomCommunicator /></ProtectedRoute>} />
                <Route path="/emergency" element={<ProtectedRoute><EmergencySOS /></ProtectedRoute>} />
                <Route path="*"          element={<NotFound/>} />
              </Routes>
            </div>
            </GlobalScreenReaderProvider>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}