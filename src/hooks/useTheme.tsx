import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get saved theme from storage or use dark as default
  const [theme, setTheme] = useState<Theme>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Load theme from chrome storage on component mount
    chrome.storage.local.get(['theme'], (result) => {
      if (result.theme) {
        setTheme(result.theme);
      }
    });
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save theme to chrome storage
    chrome.storage.local.set({ theme });
  }, [theme]);

  const toggleTheme = () => {
    // Set transitioning state to true to prevent UI flashes
    setIsTransitioning(true);
    
    // Toggle the theme
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    
    // Reset transitioning state after the transition is complete
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Match this with the longest transition time in your CSS
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 