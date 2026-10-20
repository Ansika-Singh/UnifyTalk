import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GlobalScreenReaderContext = createContext();

export const useGlobalScreenReader = () => useContext(GlobalScreenReaderContext);

export const GlobalScreenReaderProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem('globalScreenReader') === 'true';
  });
  
  const location = useLocation();
  const lastSpokenText = useRef('');
  const timeoutRef = useRef(null);

  const toggleScreenReader = useCallback(() => {
    setIsActive(prev => {
      const next = !prev;
      localStorage.setItem('globalScreenReader', next.toString());
      if (next) {
        speak("Global Screen Reader Enabled");
      } else {
        speak("Global Screen Reader Disabled");
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = useCallback((text, force = false) => {
    if (!window.speechSynthesis) return;
    
    // To prevent repeating the same text if hovered multiple times quickly
    if (!force && lastSpokenText.current === text) return;
    lastSpokenText.current = text;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Debounce slightly to avoid speech spam
    timeoutRef.current = setTimeout(() => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      u.pitch = 1.0;
      window.lastUtterance = u; // Fix garbage collection issue
      window.speechSynthesis.speak(u);
    }, 150);
  }, []);

  // Handle Route Changes
  useEffect(() => {
    if (!isActive) return;
    const pageName = location.pathname === '/' ? 'Home' : location.pathname.replace('/', '').replace('-', ' ');
    speak(`Navigated to ${pageName} page`, true);
  }, [location, isActive, speak]);

  // Handle Global DOM Events
  useEffect(() => {
    if (!isActive) return;

    const getElementText = (el) => {
      if (!el) return null;
      // Prefer aria-label or title
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel;
      const title = el.getAttribute('title');
      if (title) return title;
      // Check for form inputs
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const placeholder = el.getAttribute('placeholder') || '';
        return `${el.tagName.toLowerCase()} field ${placeholder}`;
      }
      // Finally, innerText (if not too long)
      let text = el.innerText || el.textContent || '';
      text = text.trim();
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    const handleFocusOrHover = (e) => {
      // Only read if it's an interactive element or has text
      const target = e.target.closest('button, a, input, select, textarea, [role="button"], [role="link"], [tabindex="0"]');
      if (target) {
        const text = getElementText(target);
        if (text) {
          const type = target.tagName === 'A' ? 'link' : target.tagName === 'BUTTON' ? 'button' : '';
          speak(`${text} ${type}`);
        }
      }
    };

    const handleClick = (e) => {
      const target = e.target.closest('button, a, input[type="submit"], [role="button"], [role="link"]');
      if (target) {
        const text = getElementText(target);
        if (text) {
          // Speak action explicitly on click
          speak(`Activated ${text}`, true);
        }
      }
    };

    document.body.addEventListener('mouseover', handleFocusOrHover, { passive: true });
    document.body.addEventListener('focusin', handleFocusOrHover, { passive: true });
    document.body.addEventListener('click', handleClick, { passive: true });

    return () => {
      document.body.removeEventListener('mouseover', handleFocusOrHover);
      document.body.removeEventListener('focusin', handleFocusOrHover);
      document.body.removeEventListener('click', handleClick);
    };
  }, [isActive, speak]);

  return (
    <GlobalScreenReaderContext.Provider value={{ isActive, toggleScreenReader }}>
      {children}
    </GlobalScreenReaderContext.Provider>
  );
};
