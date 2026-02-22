import React, { useState } from 'react';
import { HomeView } from './components/HomeView';
import { SectionView } from './components/SectionView';
import { ThemeProvider } from './hooks/useTheme';
import { TabProvider } from './context/TabContext';
import { SearchProvider } from './context/SearchContext';
import './styles/index.css';

type View = 'home' | 'active' | 'inactive' | 'forgotten';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');

  return (
    <TabProvider>
    <SearchProvider>
    <ThemeProvider>
      <div className="app-container">
        {activeView === 'home' ? (
          <HomeView onNavigate={setActiveView} />
        ) : (
          <SectionView section={activeView} onBack={() => setActiveView('home')} />
        )}
      </div>
    </ThemeProvider>
    </SearchProvider>
    </TabProvider>
  );
};
