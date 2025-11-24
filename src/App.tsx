import React, { useState, useEffect } from 'react';
import { Landing } from './ui/Landing';
import { Playground } from './ui/Playground';
import { AIEnchancer } from './ai';
import { BrowserPodManager } from './ai/browserpod';

function App() {
  // Simple state-based routing
  const [currentView, setCurrentView] = useState<'landing' | 'playground'>('landing');

  useEffect(() => {
      // Boot BrowserPod in background
      const bootAI = async () => {
        try {
          await BrowserPodManager.getInstance().initialize();
          // After Pod is ready, preload checks will pass
          await AIEnchancer.getInstance().preload();
        } catch (e) {
          console.error("AI System Boot Failed:", e);
        }
      };
      bootAI();
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
