import React, { useEffect, useMemo, useState } from 'react';
import { WorkoutPlan, WorkoutSetLog, WorkoutSessionSummary } from '../types';
import { Button } from './Button';
import { CheckCircle, Timer } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Props {
  plan: WorkoutPlan;
  userId: string;
  workoutId?: string;
  onFinished: (summary: WorkoutSessionSummary) => void;
  onCancel: () => void;
}

export const WorkoutSession: React.FC<Props> = ({ plan, userId, workoutId, onFinished, onCancel }) => {
  const [startedAt] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(id);
  }, [startedAt]);
  const initialLogs = useMemo(() => {
    return plan.exercises.flatMap(ex => {
      const totalSets = parseInt(ex.sets || '0', 10) || 0;
      return Array.from({ length: totalSets }).map((_, i) => ({ exerciseName: ex.name, set: i + 1, reps: 0, weight: 0 }));
    });
  }, [plan]);
  const [logs, setLogs] = useState<WorkoutSetLog[]>(initialLogs);
  const finished = useMemo(() => logs.every(l => l.reps > 0), [logs]);

  const updateLogByExerciseSet = (exerciseName: string, setNumber: number, field: 'reps' | 'weight', value: number) => {
    const idx = logs.findIndex(l => l.exerciseName === exerciseName && l.set === setNumber);
    if (idx === -1) return;
    const next = [...logs];
    next[idx] = { ...next[idx], [field]: value } as WorkoutSetLog;
    setLogs(next);
  };

  const handleFinish = async () => {
    const summary: WorkoutSessionSummary = {
      title: plan.title,
      durationMinutes: plan.durationMinutes,
      difficulty: plan.difficulty,
      startedAt,
      finishedAt: Date.now(),
      logs
    };
    if (userId) {
      await supabase.from('workout_sessions').insert({
        user_id: userId,
        workout_id: workoutId || null,
        title: summary.title,
        duration_minutes: summary.durationMinutes,
        difficulty: summary.difficulty,
        started_at: new Date(summary.startedAt).toISOString(),
        finished_at: new Date(summary.finishedAt).toISOString(),
        logs: summary.logs
      });
    }
    onFinished(summary);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{plan.title}</h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><Timer className="w-4 h-4" /> {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')}</div>
        </div>
        <div className="space-y-4">
          {plan.exercises.map((ex, exIdx) => {
            const totalSets = parseInt(ex.sets || '0', 10) || 0;
            return (
              <div key={exIdx} className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                <div className="font-medium text-slate-900 dark:text-white mb-2">{ex.name}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {Array.from({ length: totalSets }).map((_, i) => {
                    return (
                      <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded px-3 py-2 border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500">Set {i + 1}</div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500">Reps</span>
                          <input type="number" value={logs.find(l => l.exerciseName === ex.name && l.set === i + 1)?.reps || 0} onChange={(e) => updateLogByExerciseSet(ex.name, i + 1, 'reps', Number(e.target.value))} className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500">Weight</span>
                          <input type="number" value={logs.find(l => l.exerciseName === ex.name && l.set === i + 1)?.weight || 0} onChange={(e) => updateLogByExerciseSet(ex.name, i + 1, 'weight', Number(e.target.value))} className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4 gap-3">
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleFinish} disabled={!finished} icon={<CheckCircle className="w-4 h-4" />}>Finish Workout</Button>
        </div>
      </div>
    </div>
  );
};