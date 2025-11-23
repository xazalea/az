import React, { useState } from 'react';
import { Landing } from './ui/Landing';
import { Playground } from './ui/Playground';

function App() {
  // Simple state-based routing
  const [currentView, setCurrentView] = useState<'landing' | 'playground'>('landing');

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
