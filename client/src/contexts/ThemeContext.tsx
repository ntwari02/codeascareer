import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';

type Theme = 'dark' | 'light';
type Language = 'en' | 'fr' | 'rw' | 'sw';
type Currency = 'USD' | 'EUR' | 'RWF' | 'KES';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dbPreferencesLoaded, setDbPreferencesLoaded] = useState(false);

  // Load preferences from localStorage first (for immediate UI)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLanguage = localStorage.getItem('language') as Language;
    const savedCurrency = localStorage.getItem('currency') as Currency;

    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedCurrency) setCurrency(savedCurrency);
    
    setIsInitialLoad(false);
  }, []);

  // Load preferences from database when user is available
  useEffect(() => {
    if (user && !dbPreferencesLoaded) {
      const loadPreferencesFromDB = async () => {
        try {
          const { profileAPI } = await import('../lib/api');
          const profileData = await profileAPI.getProfile();
          
          if (profileData.preferences) {
            if (profileData.preferences.theme && profileData.preferences.theme !== 'auto') {
              setTheme(profileData.preferences.theme as Theme);
              localStorage.setItem('theme', profileData.preferences.theme);
            }
            if (profileData.preferences.language) {
              setLanguage(profileData.preferences.language as Language);
              localStorage.setItem('language', profileData.preferences.language);
            }
            if (profileData.preferences.currency) {
              setCurrency(profileData.preferences.currency as Currency);
              localStorage.setItem('currency', profileData.preferences.currency);
            }
          }
          setDbPreferencesLoaded(true);
        } catch (error) {
          console.error('Failed to load preferences from database:', error);
          // Fall back to localStorage if DB fetch fails
          setDbPreferencesLoaded(true);
        }
      };
      
      loadPreferencesFromDB();
    }
  }, [user, dbPreferencesLoaded]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    
    // Save theme to database when it changes (if user is logged in and not initial load)
    if (user && !isInitialLoad && dbPreferencesLoaded) {
      const saveThemeToDB = async () => {
        try {
          const { profileAPI } = await import('../lib/api');
          await profileAPI.updatePreferences({ theme });
        } catch (error) {
          console.error('Failed to save theme to database:', error);
        }
      };
      saveThemeToDB();
    }
  }, [theme, user, isInitialLoad, dbPreferencesLoaded]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Save to database if user is logged in and preferences are loaded
    if (user && dbPreferencesLoaded) {
      const saveLanguageToDB = async () => {
        try {
          const { profileAPI } = await import('../lib/api');
          await profileAPI.updatePreferences({ language: lang });
        } catch (error) {
          console.error('Failed to save language to database:', error);
        }
      };
      saveLanguageToDB();
    }
  };

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('currency', curr);
    
    // Save to database if user is logged in and preferences are loaded
    if (user && dbPreferencesLoaded) {
      const saveCurrencyToDB = async () => {
        try {
          const { profileAPI } = await import('../lib/api');
          await profileAPI.updatePreferences({ currency: curr });
        } catch (error) {
          console.error('Failed to save currency to database:', error);
        }
      };
      saveCurrencyToDB();
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      language,
      setLanguage: handleSetLanguage,
      currency,
      setCurrency: handleSetCurrency
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
