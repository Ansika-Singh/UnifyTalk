import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = {
  dark: {
    '--bg':     '#08041a',
    '--bg2':    '#0e0828',
    '--border': '#2a1560',
    '--p':      '#a855f7',
    '--p2':     '#c084fc',
    '--cyan':   '#06b6d4',
    '--text':   '#ede8ff',
    '--muted':  '#7c6aaa',
    '--surface':'#0d1220',
    '--surface2':'#131a2e',
  },
  light: {
    '--bg':     '#f5f3ff',
    '--bg2':    '#ede9fe',
    '--border': '#c4b5fd',
    '--p':      '#7c3aed',
    '--p2':     '#6d28d9',
    '--cyan':   '#0891b2',
    '--text':   '#1e1b4b',
    '--muted':  '#6b7280',
    '--surface':'#ffffff',
    '--surface2':'#f0ecff',
  },
  'high-contrast': {
    '--bg':     '#000000',
    '--bg2':    '#111111',
    '--border': '#ffffff',
    '--p':      '#ffff00',
    '--p2':     '#ffff00',
    '--cyan':   '#00ffff',
    '--text':   '#ffffff',
    '--muted':  '#cccccc',
    '--surface':'#111111',
    '--surface2':'#222222',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('ut-theme') || 'dark');
  const [largeText, setLargeTextState] = useState(() => localStorage.getItem('ut-large-text') === 'true');

  const applyTheme = useCallback((t, large) => {
    const vars = THEMES[t] || THEMES.dark;
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.fontSize = large ? '125%' : '100%';
    root.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    applyTheme(theme, largeText);
  }, [theme, largeText, applyTheme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    localStorage.setItem('ut-theme', t);
  }, []);

  const toggleLargeText = useCallback(() => {
    setLargeTextState(prev => {
      const next = !prev;
      localStorage.setItem('ut-large-text', String(next));
      return next;
    });
  }, []);

  const cycleTheme = useCallback(() => {
    const order = ['dark', 'light', 'high-contrast'];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, largeText, toggleLargeText }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
