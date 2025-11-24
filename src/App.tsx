import React, { useState, useEffect } from 'react';
import { Landing } from './ui/Landing';
import { Playground } from './ui/Playground';
import { AIEnchancer } from './ai';
import { BrowserPodManager } from './ai/browserpod';

function App() {
  // Simple state-based routing
  const [currentView, setCurrentView] = useState<'landing' | 'playground'>('landing');

  useEffect(() => {
      // Boot BrowserPod in background non-blocking
      const bootAI = async () => {
        try {
          // We do NOT await here to allow React to render immediately
          // BrowserPod initialization happens in parallel
          BrowserPodManager.getInstance().initialize().then(() => {
              AIEnchancer.getInstance().preload();
          });
        } catch (e) {
          console.error("AI System Boot Failed:", e);
        }
      };
      
      // Use requestIdleCallback if available to further delay heavy lifting
      if ('requestIdleCallback' in window) {
          // @ts-ignore
          window.requestIdleCallback(() => bootAI());
      } else {
          setTimeout(bootAI, 500);
      }
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
