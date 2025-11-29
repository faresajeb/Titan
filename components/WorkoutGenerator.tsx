import React, { useState, useEffect } from 'react';
import { FitnessGoal, WorkoutPlan, UserProfile, SplitStrategy, ExperienceLevel, Exercise, Language } from '../types';
import { generateWorkout } from '../services/geminiService';
import { Button } from './Button';
import { Play, Clock, TrendingUp, Dumbbell, Save, Activity, Calendar, Edit2, Trash2, Plus, ChevronRight } from 'lucide-react';

interface WorkoutGeneratorProps {
  userProfile: UserProfile;
  onSaveWorkout: (plan: WorkoutPlan) => void;
  onStartWorkout?: (plan: WorkoutPlan) => void;
  language: Language;
  t: any;
}

export const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({ userProfile, onSaveWorkout, onStartWorkout, language, t }) => {
  const [goal, setGoal] = useState<FitnessGoal>(FitnessGoal.GENERAL_HEALTH);
  const [splitStrategy, setSplitStrategy] = useState<SplitStrategy>(SplitStrategy.FULL_BODY);
  const [focusDay, setFocusDay] = useState<string>("Full Body Session");
  const [duration, setDuration] = useState<number>(45);
  const [equipment, setEquipment] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("3 days/week");
  const [overrideLevel, setOverrideLevel] = useState<ExperienceLevel>(userProfile.level);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const requiresSplitFocus = goal === FitnessGoal.MUSCLE_GAIN || goal === FitnessGoal.WEIGHT_LOSS;
  const splitOptions = Object.values(SplitStrategy);
  const focusOptions = (() => {
    if (splitStrategy === SplitStrategy.PPL) return ["Full Weekly Plan", "Push", "Pull", "Legs"];
    if (splitStrategy === SplitStrategy.UPPER_LOWER) return ["Full Weekly Plan", "Upper", "Lower"];
    return ["Full Body Session"];
  })();

  useEffect(() => {
    const allowed = focusOptions;
    if (!allowed.includes(focusDay)) {
      setFocusDay(allowed[0]);
    }
  }, [splitStrategy, goal]);

  const handleGenerate = async () => {
    setLoading(true);
    setIsEditing(false);
    try {
      const plan = await generateWorkout(
        userProfile, 
        goal, 
        splitStrategy,
        focusDay,
        duration, 
        equipment, 
        frequency,
        language,
        overrideLevel
      );
      setGeneratedPlan(plan);
    } catch (error) {
      const freqDays = parseInt(String(frequency).match(/[0-9]+/)?.[0] || '3', 10);
      const normalizeFocus = (f: string) => {
        if (f === 'Full Weekly Plan') return 'Full Body';
        if (f === 'Full Body Session') return 'Full Body';
        return f;
      };
      const focusExercises = (focus: string) => {
        switch (focus) {
          case 'Push': return ['Bench Press','Incline DB Press','Overhead Press','Cable Fly','Triceps Pushdown','Skullcrusher'];
          case 'Pull': return ['Deadlift (moderate)','Pull-ups','Barbell Row','Face Pull','Hammer Curl','Lat Pulldown'];
          case 'Legs': return ['Back Squat','Romanian Deadlift','Leg Press','Walking Lunge','Leg Curl','Standing Calf Raise'];
          case 'Upper': return ['Bench Press','Row','Overhead Press','Fly','Pulldown','Curl','Triceps'];
          case 'Lower': return ['Squat','RDL','Leg Press','Lunge','Leg Curl','Calf Raise'];
          default: return ['Squat','Bench Press','Row','Hip Thrust','Pulldown','Core'];
        }
      };
      const makeExerciseObjs = (names: string[]) => names.map(n => ({ name: n, sets: '3', reps: '8-12', rest: '60s', notes: 'Controlled tempo' }));
      const buildWeekly = (): { day: string; focus: string; exercises: string[] }[] => {
        let seq: string[] = [];
        if (splitStrategy === SplitStrategy.PPL) {
          seq = freqDays >= 5 ? ['Push','Pull','Legs','Rest','Push','Pull','Rest'] : ['Push','Pull','Legs','Rest','Push','Pull','Legs'];
        } else if (splitStrategy === SplitStrategy.UPPER_LOWER) {
          seq = ['Upper','Lower','Upper','Rest','Lower','Upper','Rest'];
        } else {
          seq = ['Full Body','Rest','Full Body','Full Body','Rest','Full Body','Rest'];
        }
        const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        return days.map((d, i) => ({ day: d, focus: seq[i] || 'Rest', exercises: seq[i] && seq[i] !== 'Rest' ? focusExercises(seq[i]!) : ['Recovery'] }));
      };
      const nf = normalizeFocus(focusDay);
      const plan: WorkoutPlan = {
        title: focusDay === 'Full Weekly Plan' ? 'Titan Weekly Program' : `${nf} Session`,
        durationMinutes: duration,
        difficulty: String(overrideLevel || userProfile.level),
        warmup: '5-10 min light cardio, dynamic stretches',
        cooldown: 'Stretch major muscle groups, 5 min',
        exercises: makeExerciseObjs(focusExercises(nf)),
        weeklySchedule: focusDay === 'Full Weekly Plan' ? buildWeekly() : undefined
      };
      setGeneratedPlan(plan);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    if (!generatedPlan) return;
    const updatedExercises = [...generatedPlan.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setGeneratedPlan({ ...generatedPlan, exercises: updatedExercises });
  };

  const handleDeleteExercise = (index: number) => {
    if (!generatedPlan) return;
    const updatedExercises = generatedPlan.exercises.filter((_, i) => i !== index);
    setGeneratedPlan({ ...generatedPlan, exercises: updatedExercises });
  };

  const handleAddExercise = () => {
    if (!generatedPlan) return;
    const newExercise: Exercise = {
      name: "New Exercise",
      sets: "3",
      reps: "10",
      rest: "60s",
      notes: "Add notes here"
    };
    setGeneratedPlan({ 
      ...generatedPlan, 
      exercises: [...generatedPlan.exercises, newExercise] 
    });
  };

  return (
    <div className="space-y-8">
      {!generatedPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-500" />
              {t.workout.parameters}
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.workout.goal}</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value as FitnessGoal)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white">
                  {Object.values(FitnessGoal).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              
              {requiresSplitFocus && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.workout.split}</label>
                     <select value={splitStrategy} onChange={(e) => setSplitStrategy(e.target.value as SplitStrategy)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white">
                        {splitOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.workout.focus}</label>
                     <select value={focusDay} onChange={(e) => setFocusDay(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white">
                        {focusOptions.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.workout.experience}</label>
                  <select value={overrideLevel} onChange={(e) => setOverrideLevel(e.target.value as ExperienceLevel)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white">
                    {Object.values(ExperienceLevel).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.workout.frequency}</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white">
                    {[1,2,3,4,5,6,7].map(d => (<option key={d} value={`${d} days/week`}>{d} Days / Week</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex justify-between"><span>{t.workout.duration}</span><span className="text-emerald-600 dark:text-emerald-400">{duration} mins</span></label>
                <input type="range" min="15" max="120" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t.workout.equipment}</label>
                <input type="text" placeholder="Default: Full Gym" value={equipment} onChange={(e) => setEquipment(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white" />
              </div>

              <Button onClick={handleGenerate} isLoading={loading} className="w-full mt-4 py-3 text-base" icon={<Play className="w-5 h-5" />}>
                {t.workout.generateBtn}
              </Button>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-8">
            <div className="text-center text-slate-500 dark:text-slate-500 max-w-xs">
              <Dumbbell className="w-12 h-12 opacity-40 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-slate-900 dark:text-white font-medium mb-2">Titan Intelligence</h3>
              <p className="text-sm">AI-Generated workout plans tailored to your biometrics.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{generatedPlan.title}</h2>
                <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {generatedPlan.durationMinutes} min</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {generatedPlan.difficulty}</span>
                </div>
              </div>
              <div className="flex gap-3">
                {!generatedPlan.weeklySchedule && (
                  <Button variant={isEditing ? "secondary" : "outline"} onClick={() => setIsEditing(!isEditing)} icon={<Edit2 className="w-4 h-4" />}>
                    {t.workout.edit}
                  </Button>
                )}
                <Button onClick={() => onSaveWorkout(generatedPlan)} icon={<Save className="w-4 h-4" />}>{t.workout.save}</Button>
                <Button onClick={() => onStartWorkout && onStartWorkout(generatedPlan)} variant="secondary" icon={<Play className="w-4 h-4" />}>Start</Button>
                <Button onClick={() => setGeneratedPlan(null)} variant="ghost">{t.workout.close}</Button>
              </div>
            </div>

            <div className="p-6 grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <h4 className="text-emerald-600 dark:text-emerald-400 font-medium mb-2 text-sm uppercase tracking-wider">{t.workout.warmUp}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{generatedPlan.warmup}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2 text-sm uppercase tracking-wider">{t.workout.coolDown}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{generatedPlan.cooldown}</p>
                </div>
              </div>

              {generatedPlan.weeklySchedule ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-slate-400" /> {t.workout.fullWeek}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedPlan.weeklySchedule.map((day, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{day.day}</span>
                          <span className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{day.focus}</span>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          {day.exercises.map((ex, i) => (<li key={i} className="flex items-start gap-2"><ChevronRight className="w-3 h-3 mt-1 text-slate-400" /> {ex}</li>))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Dumbbell className="w-5 h-5 text-slate-400" /> {t.workout.routine}</h3>
                    {isEditing && <button onClick={handleAddExercise} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>}
                  </div>
                  
                  {generatedPlan.exercises.map((ex, idx) => (
                    <div key={idx} className={`bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-start gap-4 ${isEditing ? 'border-emerald-500/50' : ''}`}>
                      <div className="bg-white dark:bg-slate-800 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">{idx + 1}</div>
                      <div className="flex-1 w-full">
                        {isEditing ? (
                          <div className="grid gap-3">
                             <input className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-white font-medium w-full" value={ex.name} onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)} />
                             <div className="grid grid-cols-3 gap-2">
                              <input value={ex.sets} onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-900 dark:text-white" placeholder="Sets" />
                              <input value={ex.reps} onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-900 dark:text-white" placeholder="Reps" />
                              <input value={ex.rest} onChange={(e) => handleExerciseChange(idx, 'rest', e.target.value)} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-900 dark:text-white" placeholder="Rest" />
                            </div>
                            <div className="flex justify-end"><button onClick={() => handleDeleteExercise(idx)} className="text-red-400"><Trash2 className="w-5 h-5" /></button></div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-1"><h4 className="text-slate-900 dark:text-white font-medium">{ex.name}</h4><div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700/50">{ex.rest}</div></div>
                            <div className="flex gap-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2"><span>{ex.sets} Sets</span><span className="text-slate-400 dark:text-slate-600">•</span><span>{ex.reps} Reps</span></div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">{ex.notes}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};