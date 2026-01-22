import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      const initialTheme = saved === 'dark';
      console.log('Initial theme:', initialTheme ? 'dark' : 'light');
      return initialTheme;
    } catch (error) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
        console.log('✅ Dark mode applied to document');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('✅ Light mode applied to document');
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }, [isDark]);

  const toggleTheme = () => {
    console.log('🔄 Toggling theme from:', isDark ? 'dark' : 'light');
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 