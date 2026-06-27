import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface A11yContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};

export const A11yProvider = ({ children }: { children: ReactNode }) => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const lastAnnouncement = useRef<{ message: string; timestamp: number }>({ message: '', timestamp: 0 });

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Deduplication & Throttling
    const now = Date.now();
    if (
      lastAnnouncement.current.message === message && 
      now - lastAnnouncement.current.timestamp < 2000
    ) {
      return; // Ignore identical rapid announcements within 2 seconds
    }
    
    lastAnnouncement.current = { message, timestamp: now };

    if (priority === 'assertive') {
      setAssertiveMessage(message);
      // Clear after a moment so the same message can be re-announced later if needed
      setTimeout(() => setAssertiveMessage(''), 3000);
    } else {
      setPoliteMessage(message);
      setTimeout(() => setPoliteMessage(''), 3000);
    }
  }, []);

  return (
    <A11yContext.Provider value={{ announce }}>
      {children}
      {/* Global ARIA Live Regions */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>
    </A11yContext.Provider>
  );
};
