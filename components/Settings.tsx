import React from 'react';
import { Moon, Sun, Info, Shield, RotateCcw, LogOut, Globe } from 'lucide-react';
import { Button } from './Button';
import { Language } from '../types';

interface SettingsProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  onLogout: () => void;
  t: any;
}

export const Settings: React.FC<SettingsProps> = ({ theme, toggleTheme, language, setLanguage, onLogout, t }) => {
  
  const handleReset = () => {
    if (confirm("Reset app data?")) {
      localStorage.removeItem('titanProfile');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          {t.settings.appearance}
        </h3>
        
        <div className="space-y-6">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{t.settings.theme}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.settings.themeDesc}</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md flex items-center justify-center ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}>
                 {theme === 'dark' ? <Moon className="w-3 h-3 text-emerald-600" /> : <Sun className="w-3 h-3 text-orange-400" />}
              </span>
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
             <div>
              <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2"><Globe className="w-4 h-4" /> {t.settings.language}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.settings.langDesc}</p>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            >
              <option value={Language.EN}>English</option>
              <option value={Language.HU}>Magyar</option>
              <option value={Language.AR}>العربية</option>
              <option value={Language.FR}>Français</option>
              <option value={Language.ES}>Español</option>
              <option value={Language.RU}>Русский</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" /> {t.settings.data}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
               <p className="font-medium text-slate-800 dark:text-slate-200">{t.settings.reset}</p>
            </div>
            <Button variant="outline" onClick={handleReset} className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200 dark:border-red-900/30">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
               <p className="font-medium text-slate-800 dark:text-slate-200">{t.settings.logout}</p>
            </div>
            <Button variant="secondary" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
          </div>

        </div>
      </div>

    </div>
  );
};