import React, { useState, useEffect } from 'react';
import { UserProfile, FitnessGoal, Gender, MacroData, FoodLogEntry, MealType, Language } from '../types';
import { analyzeFood } from '../services/geminiService';
import { Button } from './Button';
import { Plus, Utensils, ChevronDown, ChevronUp, Flame, PieChart, Coffee, Sun, Moon, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface NutritionTrackerProps {
  userProfile: UserProfile;
  goal: FitnessGoal;
  language: Language;
  t: any;
  userId: string;
  onLogged?: () => void;
}

export const NutritionTracker: React.FC<NutritionTrackerProps> = ({ userProfile, goal, language, t, userId, onLogged }) => {
  const [tdee, setTdee] = useState<number>(0);
  const [dailyLog, setDailyLog] = useState<FoodLogEntry[]>([]);
  const [input, setInput] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>("Breakfast");
  const [loading, setLoading] = useState(false);
  const [showTargets, setShowTargets] = useState(true);

  // Calculator State
  const [calcAge, setCalcAge] = useState<number>(userProfile.age);
  const [calcWeight, setCalcWeight] = useState<string>(userProfile.weight);
  const [calcHeight, setCalcHeight] = useState<string>(userProfile.height);
  const [activityLevel, setActivityLevel] = useState<string>("1.55");
  const [isEditingCalc, setIsEditingCalc] = useState(false);

  const mealTypes: MealType[] = ["Breakfast", "Breakfast Snack", "Lunch", "Lunch Snack", "Dinner", "Dinner Snack"];

  useEffect(() => {
    const weightKg = parseFloat(calcWeight) || 70; 
    const heightCm = parseFloat(calcHeight) || 175;
    const age = calcAge || 25;
    let bmr = 0;
    if (userProfile.gender === Gender.MALE) {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
    setTdee(Math.round(bmr * parseFloat(activityLevel)));
  }, [calcAge, calcWeight, calcHeight, activityLevel, userProfile.gender]);

  const maintenance = tdee;
  const cut = tdee - 500;
  const bulk = tdee + 500;

  const currentTotals = dailyLog.reduce((acc, item) => ({
    calories: acc.calories + item.macros.calories,
    protein: acc.protein + item.macros.protein,
    carbs: acc.carbs + item.macros.carbs,
    fats: acc.fats + item.macros.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const handleAddFood = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeFood(input, language);
      const newEntry: FoodLogEntry = {
        id: Date.now().toString(),
        foodName: result.foodName,
        macros: result,
        timestamp: Date.now(),
        meal: selectedMeal
      };
      setDailyLog(prev => [newEntry, ...prev]);
      setInput('');
      if (userId) {
        const clampInt2 = (n: number) => Math.max(0, Math.min(32767, Math.round(n || 0)));
        const rowId = Date.now();
        const payload = {
          id: rowId,
          user_id: userId,
          food_name: result.foodName,
          calories: clampInt2(result.calories),
          protein: clampInt2(result.protein),
          carbs: clampInt2(result.carbs),
          fats: clampInt2(result.fats),
          created_at: new Date().toISOString()
        };
        const { error } = await supabase.from('nutrition_logs').insert(payload);
        if (error) {
          alert(`Could not save nutrition log to Supabase: ${error.message}`);
        } else {
          onLogged && onLogged();
        }
      }
    } catch (err) {
      alert("Could not analyze food.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowTargets(!showTargets)}>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> {t.nutrition.calculator}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                TDEE: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{tdee} kcal</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setIsEditingCalc(!isEditingCalc); }} className="text-xs h-8">
                <RefreshCw className="w-3 h-3 mr-1" /> Edit
              </Button>
              {showTargets ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </div>
          </div>
          {isEditingCalc && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
               <div><label className="block text-xs font-medium text-slate-500 mb-1">Age</label><input type="number" value={calcAge} onChange={(e) => setCalcAge(Number(e.target.value))} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-white" /></div>
               <div><label className="block text-xs font-medium text-slate-500 mb-1">Weight</label><input type="text" value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-white" /></div>
               <div><label className="block text-xs font-medium text-slate-500 mb-1">Height</label><input type="text" value={calcHeight} onChange={(e) => setCalcHeight(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-white" /></div>
               <div><label className="block text-xs font-medium text-slate-500 mb-1">Activity</label><select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-white"><option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Active</option><option value="1.9">Athlete</option></select></div>
            </div>
          )}
        </div>
        {showTargets && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900/30">
            <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/50">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t.nutrition.deficit}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{cut}</div>
            </div>
            <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t.nutrition.maintenance}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{maintenance}</div>
            </div>
            <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t.nutrition.surplus}</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{bulk}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
             <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Utensils className="w-5 h-5 text-emerald-500" /> {t.nutrition.logMeal}</h3>
             <div className="flex flex-col sm:flex-row gap-3 mb-4">
               <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value as MealType)} className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:w-48">
                 {mealTypes.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., 2 eggs" className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddFood()} />
               <Button onClick={handleAddFood} isLoading={loading} icon={<Plus className="w-5 h-5" />}>{t.nutrition.add}</Button>
             </div>
          </div>
          <div className="space-y-4">
            {dailyLog.length === 0 && <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700"><p>{t.nutrition.noMeals}</p></div>}
            {dailyLog.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <span className="font-medium text-slate-900 dark:text-white">{entry.foodName}</span>
                <div className="text-sm text-slate-500 dark:text-slate-400 flex gap-4"><span className="text-orange-500 font-bold">{entry.macros.calories} kcal</span><span>P: {entry.macros.protein}</span><span>C: {entry.macros.carbs}</span><span>F: {entry.macros.fats}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 h-fit sticky top-6 shadow-sm">
           <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-500" /> {t.nutrition.calories}</h3>
           <div className="text-center mb-6 bg-slate-50 dark:bg-slate-900/50 py-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
             <div className="text-4xl font-bold text-slate-900 dark:text-white">{currentTotals.calories}</div>
             <div className="text-sm text-slate-500 dark:text-slate-400">{t.nutrition.calories}</div>
           </div>
        </div>
      </div>
    </div>
  );
};