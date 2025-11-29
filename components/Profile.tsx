import React, { useState } from 'react';
import { UserProfile, ExperienceLevel, Gender } from '../types';
import { Button } from './Button';
import { Save, User, Dna, Ruler, Weight, Calendar, Lock, Trash2 } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
  t: any;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, onLogout, t }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChangePassword = () => {
    alert("Password change feature would open a secure modal here.");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure? This will permanently delete your account and data.")) {
      onLogout();
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{formData.name}</h2>
            <p className="text-slate-500 dark:text-slate-400">
              {formData.level} • {formData.isGuest ? "Guest" : formData.gender}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">{t.profile.personal}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.age}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.height}</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.weight}</label>
                <div className="relative">
                  <Weight className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.gender}</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Fitness Profile */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">{t.profile.fitness}</h3>
             <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t.profile.level}</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as ExperienceLevel })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {Object.values(ExperienceLevel).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-2">
                  <Dna className="w-4 h-4" /> {t.profile.genetics}
                </span>
              </label>
              <textarea
                value={formData.geneticAdvantages}
                onChange={(e) => setFormData({ ...formData, geneticAdvantages: e.target.value })}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Section 3: Account Management (Logged in only) */}
          {!formData.isGuest && (
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.profile.account}</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <Button variant="outline" onClick={handleChangePassword}>
                  <Lock className="w-4 h-4 mr-2" /> {t.profile.changePass}
                </Button>
                <Button variant="outline" onClick={handleDeleteAccount} className="text-red-500 border-red-200 dark:border-red-900/30 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" /> {t.profile.deleteAcc}
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <Button 
              onClick={handleSave} 
              variant="primary"
              className="w-full md:w-auto"
              icon={isSaved ? <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div> : <Save className="w-4 h-4" />}
            >
              {isSaved ? t.profile.saved : t.profile.save}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};