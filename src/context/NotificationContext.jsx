import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext(null);

let idCounter = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [flashActive, setFlashActive] = useState(false);
  const audioRef = useRef(null);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback(({ message, type = 'info', duration = 4000, vibrate = true, sound = true, flash = false }) => {
    const id = ++idCounter;
    const notification = { id, message, type, duration, createdAt: Date.now() };

    setNotifications(prev => [...prev.slice(-4), notification]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }

    // Vibration for deaf users
    if (vibrate && navigator.vibrate) {
      const patterns = {
        info:    [50],
        success: [50, 30, 50],
        warning: [100, 50, 100],
        alert:   [200, 100, 200, 100, 200],
      };
      navigator.vibrate(patterns[type] || [50]);
    }

    // Audio cue for blind users
    if (sound && window.speechSynthesis) {
      const prefixes = { info: '', success: 'Success: ', warning: 'Warning: ', alert: 'Alert! ' };
      const u = new SpeechSynthesisUtterance((prefixes[type] || '') + message);
      u.volume = 0.5;
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }

    // Visual flash for critical alerts (deaf users)
    if (flash || type === 'alert') {
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 600);
    }

    return id;
  }, [dismiss]);

  const clearAll = useCallback(() => setNotifications([]), []);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/logo.svg', badge: '/logo.svg' });
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, notify, dismiss, clearAll,
      flashActive, requestPermission, sendBrowserNotification
    }}>
      <audio ref={audioRef} preload="auto" />
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
