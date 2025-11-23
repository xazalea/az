import React, { useState, useEffect } from 'react';
import { Landing } from './ui/Landing';
import { Playground } from './ui/Playground';
import { AIEnchancer } from './ai';

function App() {
  // Simple state-based routing
  const [currentView, setCurrentView] = useState<'landing' | 'playground'>('landing');

  useEffect(() => {
      // Preload AI model in background
      const ai = AIEnchancer.getInstance();
      ai.preload().catch(e => console.error("Background preload failed:", e));
  }, []);

  return (
    <React.StrictMode>
      {currentView === 'landing' ? (
        <Landing onStart={() => setCurrentView('playground')} />
      ) : (
        <Playground />
      )}
    </React.StrictMode>
  );
}

export default App;
