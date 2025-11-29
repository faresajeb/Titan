import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Dumbbell, MessageSquare, Activity, Settings as SettingsIcon, Menu, X, User, Flame, Play } from 'lucide-react';
import { WorkoutGenerator } from './components/WorkoutGenerator';
import { ProgressChart } from './components/ProgressChart';
import { AICoach } from './components/AICoach';
import { Onboarding } from './components/Onboarding';
import { Profile } from './components/Profile';
import { NutritionTracker } from './components/NutritionTracker';
import { Settings } from './components/Settings';
import { UserStats, WorkoutPlan, ProgressDataPoint, UserProfile, FitnessGoal, Language, ActiveSession } from './types';
import { translations } from './translations';
import { supabase } from './services/supabaseClient';
import { WorkoutSession } from './components/WorkoutSession';

// --- Navigation Component ---
const Navigation = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, t }: any) => {
  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'workout', label: t.nav.workout, icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'workouts', label: 'Workouts', icon: <Activity className="w-5 h-5" /> },
    { id: 'nutrition', label: t.nav.nutrition, icon: <Flame className="w-5 h-5" /> },
    { id: 'coach', label: t.nav.coach, icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'profile', label: t.nav.profile, icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: t.nav.settings, icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600">TITAN</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-800 dark:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Drawer */}
      <nav className={`fixed md:static inset-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 flex-shrink-0 h-screen overflow-y-auto pt-20 md:pt-0`}>
        <div className="p-6 hidden md:block">
          <h1 className="font-black text-3xl italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600 tracking-tighter">TITAN</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium tracking-widest uppercase">Elite Fitness AI</p>
        </div>

        <div className="px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

// --- Main App ---
export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>(Language.EN);
  
  const t = translations[language];

  // Mock Data State
  const [stats, setStats] = useState<UserStats>({
    workoutsCompleted: 0,
    minutesTrained: 0,
    currentStreak: 0,
    caloriesBurned: 0
  });

  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<{ id?: string; title: string; duration_minutes: number; created_at: string; data?: WorkoutPlan }[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<{ id: string; plan: WorkoutPlan } | null>(null);
  const [viewingLogs, setViewingLogs] = useState<{ workoutId: string; sessions: { started_at: string; finished_at: string; logs: { exerciseName: string; set: number; reps: number; weight: number }[] }[] } | null>(null);
  const refreshTodayCalories = async () => {
    if (!profileId) return;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const { data: nlogs } = await supabase
      .from('nutrition_logs')
      .select('calories, created_at')
      .eq('user_id', profileId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    const totalCalories = (nlogs || []).reduce((s, r: any) => s + (Number(r.calories) || 0), 0);
    setStats(prev => ({ ...prev, caloriesBurned: totalCalories }));
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('titanProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    let id = localStorage.getItem('titanUserId');
    if (!id) {
      const newId = (window.crypto && 'randomUUID' in window.crypto)
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      id = newId;
      localStorage.setItem('titanUserId', id);
    }
    setUserId(id);
    const prof = localStorage.getItem('titanProfileId');
    if (prof) setProfileId(prof);
    
    const savedTheme = localStorage.getItem('titanTheme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);

    const savedLang = localStorage.getItem('titanLang') as Language | null;
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!profileId) return;
      const { data, error, count } = await supabase
        .from('workouts')
        .select('id,title,duration_minutes,created_at,data', { count: 'exact' })
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return;
      const totalMinutes = (data || []).reduce((s, w) => s + (w.duration_minutes || 0), 0);
      const days = new Set((data || []).map(w => new Date(w.created_at).toDateString()));
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        if (days.has(key)) streak++; else break;
      }
      let nextStats = {
        workoutsCompleted: count || 0,
        minutesTrained: totalMinutes,
        currentStreak: streak,
        caloriesBurned: 0
      } as UserStats;
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      const { data: nlogs } = await supabase
        .from('nutrition_logs')
        .select('calories, created_at')
        .eq('user_id', profileId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      const totalCalories = (nlogs || []).reduce((s, r: any) => s + (Number(r.calories) || 0), 0);
      nextStats.caloriesBurned = totalCalories;
      setStats(nextStats);
      setRecentWorkouts((data || []).slice(0, 5));
    };
    load();
  }, [profileId]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('titanTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('titanLang', language);
  }, [language]);

  useEffect(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockData = days.map((d, i) => ({
      date: d,
      duration: Math.floor(Math.random() * 60) + 20 
    }));
    setProgressData(mockData);
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('titanProfile', JSON.stringify(profile));
    const heightNumeric = String((profile.height || '').match(/[0-9.]+/)?.[0] || '0');
    const weightNumeric = String((profile.weight || '').match(/[0-9.]+/)?.[0] || '0');
    const newProfileId = (window.crypto && 'randomUUID' in window.crypto)
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    supabase.from('profiles').insert({
      id: newProfileId,
      name: profile.name,
      age: profile.age,
      height: heightNumeric,
      weight: weightNumeric,
      gender: profile.gender,
      level: profile.level,
      genetics: profile.geneticAdvantages
    }).then(({ error }) => {
      if (error) {
        alert(`Could not save profile to Supabase: ${error.message}`);
      } else {
        localStorage.setItem('titanProfileId', newProfileId);
        setProfileId(newProfileId);
      }
    });
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('titanProfile', JSON.stringify(profile));
    if (profileId) {
      const heightNumeric = String((profile.height || '').match(/[0-9.]+/)?.[0] || '0');
      const weightNumeric = String((profile.weight || '').match(/[0-9.]+/)?.[0] || '0');
      supabase.from('profiles').update({
        name: profile.name,
        age: profile.age,
        height: heightNumeric,
        weight: weightNumeric,
        gender: profile.gender,
        level: profile.level,
        genetics: profile.geneticAdvantages
      }).eq('id', profileId).then(({ error }) => {
        if (error) {
          alert('Could not update profile on Supabase');
        }
      });
    }
  };

  const handleSaveWorkout = (plan: WorkoutPlan) => {
    setStats(prev => ({
      ...prev,
      workoutsCompleted: prev.workoutsCompleted + 1,
      minutesTrained: prev.minutesTrained + plan.durationMinutes,
      currentStreak: prev.currentStreak + 1,
      caloriesBurned: prev.caloriesBurned
    }));
    setProgressData(prev => {
      if (prev.length === 0) return prev;
      const newData = [...prev];
      newData[newData.length - 1].duration += plan.durationMinutes;
      return newData;
    });
    alert(`Great job ${userProfile?.name}! "${plan.title}" recorded.`);
    setActiveTab('dashboard');
    if (profileId) {
      const newId = (window.crypto && 'randomUUID' in window.crypto)
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const createdAt = new Date().toISOString();
      supabase.from('workouts').insert({
        id: newId,
        user_id: profileId,
        title: plan.title,
        duration_minutes: plan.durationMinutes,
        difficulty: plan.difficulty,
        data: plan,
        created_at: createdAt
      }).then(({ error }) => {
        if (error) {
          alert(`Could not save workout to Supabase: ${error.message}`);
        } else {
          setRecentWorkouts(prev => [{ id: newId, title: plan.title, duration_minutes: plan.durationMinutes, created_at: createdAt, data: plan }, ...prev].slice(0, 5));
          window.location.reload();
        }
      });
    }
  };

  const handleStartWorkout = (plan: WorkoutPlan, workoutId?: string) => {
    setActiveSession({ plan, workoutId });
  };

  const handleStartEditWorkout = (w: { id?: string; data?: WorkoutPlan; title: string }) => {
    if (!w.id || !w.data) return;
    setEditingWorkout({ id: w.id, plan: { ...w.data, title: w.title } });
  };

  const handleEditWorkoutTitle = (title: string) => {
    if (!editingWorkout) return;
    setEditingWorkout({ id: editingWorkout.id, plan: { ...editingWorkout.plan, title } });
  };

  const handleEditExerciseField = (index: number, field: 'name' | 'sets' | 'reps', value: string) => {
    if (!editingWorkout) return;
    const next = [...editingWorkout.plan.exercises];
    next[index] = { ...next[index], [field]: value } as any;
    setEditingWorkout({ id: editingWorkout.id, plan: { ...editingWorkout.plan, exercises: next } });
  };

  const handleSaveEditedWorkout = async () => {
    if (!editingWorkout || !profileId) return;
    const { id, plan } = editingWorkout;
    const { error } = await supabase.from('workouts').update({
      title: plan.title,
      duration_minutes: plan.durationMinutes,
      data: plan
    }).eq('id', id).eq('user_id', profileId);
    if (error) {
      alert('Could not update workout');
      return;
    }
    setRecentWorkouts(prev => prev.map(w => w.id === id ? { ...w, title: plan.title, data: plan, duration_minutes: plan.durationMinutes } : w));
    setEditingWorkout(null);
  };

  const handleViewWorkoutLogs = async (id?: string) => {
    if (!id || !profileId) return;
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('started_at,finished_at,logs')
      .eq('user_id', profileId)
      .eq('workout_id', id)
      .order('started_at', { ascending: false })
      .limit(10);
    if (error) {
      alert('Could not load workout logs');
      return;
    }
    setViewingLogs({ workoutId: id, sessions: data || [] });
  };

  const handleSessionFinished = async (summary: any) => {
    setActiveSession(null);
    setStats(prev => ({
      workoutsCompleted: prev.workoutsCompleted + 1,
      minutesTrained: prev.minutesTrained + summary.durationMinutes,
      currentStreak: prev.currentStreak + 1,
      caloriesBurned: prev.caloriesBurned
    }));
    setRecentWorkouts(prev => [{ title: summary.title, duration_minutes: summary.durationMinutes, created_at: new Date().toISOString() }, ...prev].slice(0,5));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('titanProfile');
    setUserProfile(null);
    setActiveTab('dashboard');
  };

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} language={language} setLanguage={setLanguage} t={t} />;
  }

  return (
    <div dir={language === Language.AR ? 'rtl' : 'ltr'} className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden transition-colors duration-300">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        t={t}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
        <div className="max-w-6xl mx-auto">
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in space-y-6">
              <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.dashboard.welcome}, {userProfile.name}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.dashboard.level}: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{userProfile.level}</span></p>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t.dashboard.workouts, val: stats.workoutsCompleted, icon: <Dumbbell className="text-blue-500 dark:text-blue-400" /> },
                  { label: t.dashboard.minutes, val: stats.minutesTrained, icon: <Clock className="text-emerald-500 dark:text-emerald-400" /> },
                  { label: t.dashboard.streak, val: `${stats.currentStreak}`, icon: <Activity className="text-orange-500 dark:text-orange-400" /> },
                  { label: t.dashboard.calories, val: stats.caloriesBurned, icon: <div className="text-rose-500 dark:text-rose-400">🔥</div> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-start justify-between h-28">
                     <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">{stat.icon}</div>
                     <div>
                       <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.val}</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">{stat.label}</div>
                     </div>
                  </div>
                ))}
              </div>

              <ProgressChart data={progressData} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-6 rounded-xl text-white shadow-lg">
                  <h3 className="font-bold text-lg mb-2">{t.dashboard.generate}</h3>
                  <button 
                    onClick={() => setActiveTab('workout')}
                    className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors"
                  >
                    {t.workout.generateBtn}
                  </button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Workouts</h3>
                   <div className="space-y-3">
                      {recentWorkouts.length === 0 && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">No workouts yet</div>
                      )}
                      {recentWorkouts.map((w, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-slate-700 dark:text-slate-300">{w.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 dark:text-slate-500">{w.duration_minutes} min</span>
                            {w.data && (
                              <button onClick={() => handleStartWorkout(w.data!)} className="px-2 py-1 rounded bg-emerald-600 text-white flex items-center gap-1">
                                <Play className="w-3 h-3" /> Start
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Workout Generator View */}
          {activeTab === 'workout' && (
            <div className="animate-fade-in">
               <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.workout.title}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.workout.subtitle}</p>
              </header>
              {!activeSession ? (
                <WorkoutGenerator userProfile={userProfile} onSaveWorkout={handleSaveWorkout} onStartWorkout={(p) => handleStartWorkout(p)} language={language} t={t} />
              ) : (
                <WorkoutSession plan={activeSession.plan} workoutId={activeSession.workoutId} userId={profileId || ''} onFinished={handleSessionFinished} onCancel={() => setActiveSession(null)} />
              )}
            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="animate-fade-in">
               <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Workouts</h2>
                <p className="text-slate-500 dark:text-slate-400">Saved plans you created.</p>
              </header>
              {!activeSession && !editingWorkout ? (
                <div className="space-y-3">
                  {recentWorkouts.length === 0 && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">No workouts saved</div>
                  )}
                  {recentWorkouts.map((w, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{w.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(w.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 dark:text-slate-500">{w.duration_minutes} min</span>
                        {w.data && (
                          <button onClick={() => handleStartWorkout(w.data!, w.id)} className="px-3 py-1.5 rounded bg-emerald-600 text-white">Start</button>
                        )}
                        {w.id && w.data && (
                          <>
                            <button onClick={() => handleStartEditWorkout(w)} className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">Edit</button>
                            <button onClick={() => handleViewWorkoutLogs(w.id)} className="px-3 py-1.5 rounded bg-blue-600 text-white">View Logs</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeSession ? (
                <WorkoutSession plan={activeSession.plan} workoutId={activeSession.workoutId} userId={profileId || ''} onFinished={handleSessionFinished} onCancel={() => setActiveSession(null)} />
              ) : editingWorkout ? (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <input value={editingWorkout.plan.title} onChange={(e) => handleEditWorkoutTitle(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-white w-full" />
                    </div>
                    <div className="space-y-4">
                      {editingWorkout.plan.exercises.map((ex, idx) => (
                        <div key={idx} className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                          <div className="grid gap-2 md:grid-cols-4">
                            <input value={ex.name} onChange={(e) => handleEditExerciseField(idx, 'name', e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm" />
                            <input value={ex.sets} onChange={(e) => handleEditExerciseField(idx, 'sets', e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm" placeholder="Sets" />
                            <input value={ex.reps} onChange={(e) => handleEditExerciseField(idx, 'reps', e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm" placeholder="Reps" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                      <button onClick={() => setEditingWorkout(null)} className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">Cancel</button>
                      <button onClick={handleSaveEditedWorkout} className="px-3 py-1.5 rounded bg-emerald-600 text-white">Save Changes</button>
                    </div>
                  </div>
                </div>
              ) : viewingLogs ? (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Workout Logs</h3>
                      <button onClick={() => setViewingLogs(null)} className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">Close</button>
                    </div>
                    <div className="space-y-4">
                      {viewingLogs.sessions.length === 0 && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">No sessions yet</div>
                      )}
                      {viewingLogs.sessions.map((s, i) => (
                        <div key={i} className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                          <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">{new Date(s.started_at).toLocaleString()} → {new Date(s.finished_at).toLocaleString()}</div>
                          <div className="space-y-2">
                            {s.logs.map((l, j) => (
                              <div key={j} className="text-xs text-slate-700 dark:text-slate-200">{l.exerciseName} • Set {l.set} • Reps {l.reps} • Weight {l.weight}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Nutrition View */}
          {activeTab === 'nutrition' && (
            <div className="animate-fade-in">
               <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.nutrition.title}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.nutrition.subtitle}</p>
              </header>
                <NutritionTracker userProfile={userProfile} goal={FitnessGoal.MUSCLE_GAIN} language={language} t={t} userId={profileId || ''} onLogged={refreshTodayCalories} />
            </div>
          )}

          {/* Coach View */}
          {activeTab === 'coach' && (
            <div className="animate-fade-in h-full">
               <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.coach.title}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.coach.subtitle}</p>
              </header>
              <AICoach language={language} t={t} />
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in h-full">
               <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.profile.title}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.profile.subtitle}</p>
              </header>
              <Profile profile={userProfile} onUpdate={handleUpdateProfile} t={t} onLogout={handleLogout} />
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in h-full">
               <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.settings.title}</h2>
                <p className="text-slate-500 dark:text-slate-400">{t.settings.subtitle}</p>
              </header>
              <Settings 
                theme={theme} 
                toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                language={language}
                setLanguage={setLanguage}
                onLogout={handleLogout}
                t={t}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const Clock = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);