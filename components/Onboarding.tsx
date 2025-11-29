import React, { useState } from 'react';
import { UserProfile, ExperienceLevel, Gender, Language } from '../types';
import { Button } from './Button';
import { Activity, CheckCircle, ArrowRight, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: any;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 4.65-1.41.76.04 2.5.36 3.7 1.91-3.24 1.67-2.67 5.77 1.03 7.19-.76 1.84-1.98 3.79-3.47 4.54h.01zM12.03 5.31c-.15-1.85 1.4-3.49 3.01-3.53.34 2.12-2.36 3.77-3.01 3.53z" /></svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/></svg>
);

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, t }) => {
  const [view, setView] = useState<'auth' | 'personal' | 'fitness'>('auth');
  
  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [level, setLevel] = useState<ExperienceLevel>(ExperienceLevel.BEGINNER);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [genetics, setGenetics] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const isPersonalValid = (
    (name || '').trim().length > 0 &&
    typeof age === 'number' && age > 0 &&
    (height || '').trim().length > 0 &&
    (weight || '').trim().length > 0
  );

  const handleAuthComplete = (guestMode = false) => {
    if (guestMode) {
      setIsGuest(true);
      setName("Guest User");
    }
    setView('personal');
  };

  const handleFinalSubmit = () => {
    if (!isPersonalValid) {
      setView('personal');
      return;
    }
    onComplete({ 
      name,
      age: Number(age),
      height,
      weight,
      level, 
      gender, 
      geneticAdvantages: genetics,
      isGuest
    });
  };

  // --- AUTH VIEW ---
  if (view === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-blend-overlay bg-black/80">
        <div className="max-w-md w-full bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600 mb-2">{t.auth.title}</h1>
            <p className="text-slate-500 dark:text-slate-400">{t.auth.subtitle}</p>
          </div>

          <div className="space-y-3">
            <button onClick={() => handleAuthComplete()} className="w-full bg-white hover:bg-gray-50 text-slate-900 border border-slate-200 dark:border-transparent font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm">
              <GoogleIcon /> {t.auth.google}
            </button>
            <button onClick={() => handleAuthComplete()} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-3 border border-slate-700 transition-colors">
              <AppleIcon /> {t.auth.apple}
            </button>
            <button onClick={() => handleAuthComplete()} className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-3 border border-transparent transition-colors">
              <FacebookIcon /> {t.auth.facebook}
            </button>
            <Button onClick={() => handleAuthComplete(true)} variant="secondary" className="w-full py-3">
              {t.auth.guest}
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">{t.auth.email}</span>
            </div>
          </div>

          <div className="space-y-4">
            <input type="email" placeholder="Email" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <input type="password" placeholder="Password" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <Button onClick={() => handleAuthComplete()} className="w-full py-3">
              {t.auth.login}
            </Button>
            <button onClick={() => handleAuthComplete(true)} className="w-full text-sm text-slate-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> {t.auth.guest}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${view === 'personal' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-500'}`}>1</div>
          <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full">
            <div className={`h-full bg-emerald-500 rounded-full transition-all duration-500 ${view === 'fitness' ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${view === 'fitness' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'}`}>2</div>
        </div>

        {view === 'personal' && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.auth.personalStep}</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.profile.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${name.trim().length === 0 ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                placeholder={isGuest ? "Guest" : "e.g., Alex Smith"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.profile.age}</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${(typeof age !== 'number' || !age || age <= 0) ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.profile.height}</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${height.trim().length === 0 ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  placeholder="e.g., 175cm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.profile.weight}</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none ${weight.trim().length === 0 ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  placeholder="e.g., 70kg"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={() => setView('fitness')} disabled={!isPersonalValid} className="w-full py-3" icon={<ArrowRight className="w-4 h-4" />}>
                Next
              </Button>
            </div>
          </div>
        )}

        {view === 'fitness' && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.auth.fitnessStep}</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.gender}</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(Gender).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-2 py-3 rounded-xl border text-sm transition-all ${
                      gender === g 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-white' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.level}</label>
              <div className="space-y-2">
                {Object.values(ExperienceLevel).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevel(lvl)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                      level === lvl 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-white' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="font-medium">{lvl}</span>
                    {level === lvl && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t.profile.genetics}
              </label>
              <textarea
                value={genetics}
                onChange={(e) => setGenetics(e.target.value)}
                className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <Button onClick={() => setView('personal')} variant="outline" className="flex-1 py-3">
                {t.auth.back}
              </Button>
              <Button onClick={handleFinalSubmit} className="flex-[2] py-3" icon={<Activity className="w-4 h-4" />}>
                {t.auth.complete}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};