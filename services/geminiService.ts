import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FitnessGoal, ExperienceLevel, WorkoutPlan, UserProfile, SplitStrategy, MacroData, Language } from "../types";

const apiKey = process.env.API_KEY as string | undefined;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- WORKOUT GENERATION ---

const workoutSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy name for the workout or plan" },
    durationMinutes: { type: Type.INTEGER, description: "Estimated duration per session" },
    difficulty: { type: Type.STRING, description: "Difficulty level assessment" },
    warmup: { type: Type.STRING, description: "General warmup routine" },
    cooldown: { type: Type.STRING, description: "General cooldown routine" },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          sets: { type: Type.STRING },
          reps: { type: Type.STRING },
          rest: { type: Type.STRING, description: "Rest time between sets" },
          notes: { type: Type.STRING, description: "Form cues or tips" },
        },
        required: ["name", "sets", "reps", "rest", "notes"]
      }
    },
    weeklySchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          focus: { type: Type.STRING },
          exercises: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
          }
        },
        required: ["day", "focus", "exercises"]
      }
    }
  },
  required: ["title", "durationMinutes", "difficulty", "exercises", "warmup", "cooldown"]
};

export const generateWorkout = async (
  userProfile: UserProfile,
  goal: FitnessGoal,
  splitStrategy: SplitStrategy,
  focusDay: string,
  duration: number,
  equipment: string,
  frequency: string,
  language: Language,
  overrideLevel?: ExperienceLevel
): Promise<WorkoutPlan> => {
  const model = "gemini-2.5-flash";
  const effectiveLevel = overrideLevel || userProfile.level;
  const isWeeklyPlan = focusDay === "Full Weekly Plan";
  const freqDays = parseInt(String(frequency).match(/[0-9]+/)?.[0] || '3', 10);

  const prompt = `
    Create a personalized ${isWeeklyPlan ? "FULL WEEKLY ROUTINE" : "SINGLE WORKOUT SESSION"} for "Titan" fitness app.
    
    CRITICAL INSTRUCTION: Output the response COMPLETELY in the language: ${language}.
    
    User Biometrics:
    - Age: ${userProfile.age}
    - Height: ${userProfile.height}
    - Weight: ${userProfile.weight}
    - Gender: ${userProfile.gender}
    - Genetics: ${userProfile.geneticAdvantages || "None specified"}
    
    Parameters:
    - Level: ${effectiveLevel}
    - Goal: ${goal}
    - Split: ${splitStrategy}
    - Focus: ${focusDay}
    - Frequency: ${frequency}
    - Equipment: ${equipment || "Full Gym Access"}
    
    Logic:
    1. If Focus is "Full Weekly Plan", populate 'weeklySchedule' (7 days).
    2. If Focus is specific, populate 'exercises'.
    3. Account for age/weight in intensity.
    4. Return JSON.
  `;

  const focusExercises = (focus: string): string[] => {
    switch (focus) {
      case 'Push':
        return ['Bench Press', 'Incline DB Press', 'Overhead Press', 'Cable Fly', 'Triceps Pushdown', 'Skullcrusher'];
      case 'Pull':
        return ['Deadlift (moderate)', 'Pull-ups', 'Barbell Row', 'Face Pull', 'Hammer Curl', 'Lat Pulldown'];
      case 'Legs':
        return ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Walking Lunge', 'Leg Curl', 'Standing Calf Raise'];
      case 'Upper':
        return ['Bench Press', 'Row', 'Overhead Press', 'Fly', 'Pulldown', 'Curl', 'Triceps'];
      case 'Lower':
        return ['Squat', 'RDL', 'Leg Press', 'Lunge', 'Leg Curl', 'Calf Raise'];
      case 'Full Body':
        return ['Squat', 'Bench Press', 'Row', 'Hip Thrust', 'Pulldown', 'Core'];
      default:
        return ['Recovery'];
    }
  };

  const buildWeekly = (split: SplitStrategy, freq: number): WeeklyDay[] => {
    let seq: string[] = [];
    if (split === SplitStrategy.PPL) {
      if (freq >= 5) {
        seq = ['Push','Pull','Legs','Rest','Push','Pull','Rest'];
      } else {
        const base = ['Push','Pull','Legs'];
        while (seq.length < 7) {
          for (const d of base) {
            if (seq.length >= 7) break;
            seq.push(d);
          }
          seq.push('Rest');
        }
      }
    } else if (split === SplitStrategy.UPPER_LOWER) {
      const base = ["Upper", "Lower"]; 
      while (seq.length < freq) {
        for (const d of base) {
          if (seq.length >= freq) break;
          seq.push(d);
          if (seq.length % 3 === 0) seq.push("Rest");
        }
      }
    } else {
      while (seq.length < freq) {
        seq.push("Full Body");
        if (seq.length % 3 === 0) seq.push("Rest");
      }
    }
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    return days.map((d, i) => ({
      day: d,
      focus: seq[i] || 'Rest',
      exercises: (seq[i] && seq[i] !== 'Rest') ? focusExercises(seq[i]!) : ['Recovery']
    }));
  };

  const makeExerciseObjs = (names: string[]): { name: string; sets: string; reps: string; rest: string; notes: string }[] => {
    return names.map(n => ({ name: n, sets: "3", reps: "8-12", rest: "60s", notes: "Controlled tempo" }));
  };

  const normalizeFocus = (f: string): string => {
    if (!f) return 'Full Body';
    if (f === 'Full Weekly Plan') return 'Full Body';
    if (f === 'Full Body Session') return 'Full Body';
    return f;
  };

  const fallback: WorkoutPlan = {
    title: isWeeklyPlan ? "Titan Weekly Program" : focusDay || "Titan Session",
    durationMinutes: duration || 45,
    difficulty: String(effectiveLevel),
    warmup: "5-10 min light cardio, dynamic stretches",
    cooldown: "Stretch major muscle groups, 5 min",
    exercises: makeExerciseObjs(focusExercises(normalizeFocus(focusDay || 'Full Body'))),
    weeklySchedule: isWeeklyPlan ? buildWeekly(splitStrategy, freqDays) : undefined
  };

  if (!ai) {
    return fallback;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        role: "user",
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
        temperature: 0.4,
      }
    });
    const text = (response as any).text || (response as any).response?.text;
    if (!text) return fallback;
    return JSON.parse(text) as WorkoutPlan;
  } catch {
    return fallback;
  }
};

// --- NUTRITION ANALYSIS ---

const nutritionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.INTEGER },
    protein: { type: Type.INTEGER },
    carbs: { type: Type.INTEGER },
    fats: { type: Type.INTEGER },
    foodName: { type: Type.STRING, description: "Short food name in the requested language" }
  },
  required: ["calories", "protein", "carbs", "fats", "foodName"]
};

export const analyzeFood = async (query: string, language: Language): Promise<MacroData & { foodName: string }> => {
  const model = "gemini-2.5-flash";
  const simpleEstimate = (q: string): MacroData & { foodName: string } => {
    const s = q.toLowerCase();
    const num = parseFloat((s.match(/([0-9]+\.?[0-9]*)\s*(g|grams|cup|cups|tbsp|tablespoon|tsp|slice|slices|x|pcs|piece|egg|eggs)/) || [])[1] || '1');
    const unit = ((s.match(/(g|grams|cup|cups|tbsp|tablespoon|tsp|slice|slices|x|pcs|piece|egg|eggs)/) || [])[1] || '').toLowerCase();
    const mult = (() => {
      if (unit === 'g' || unit === 'grams') return num / 100;
      if (unit === 'cup' || unit === 'cups') return num; // values below are per cup
      if (unit === 'tbsp' || unit === 'tablespoon') return num; // per tbsp
      if (unit === 'tsp') return num; // per tsp
      if (unit === 'slice' || unit === 'slices') return num; // per slice
      if (unit === 'x' || unit === 'pcs' || unit === 'piece' || unit === 'egg' || unit === 'eggs') return num; // per piece
      return 1;
    })();
    const base = (name: string, kcal: number, p: number, c: number, f: number, adj: number = mult) => ({ calories: Math.round(kcal * adj), protein: Math.round(p * adj), carbs: Math.round(c * adj), fats: Math.round(f * adj), foodName: name });
    if (s.includes('egg')) return base('Egg', 70, 6, 1, 5);
    if (s.includes('chicken') || s.includes('chicken breast')) return base('Chicken Breast (100g)', 165, 31, 0, 4);
    if (s.includes('rice')) return base('Cooked Rice (cup)', 205, 4, 45, 0, unit.includes('g') ? mult * (130/205) : mult);
    if (s.includes('banana')) return base('Banana', 105, 1, 27, 0);
    if (s.includes('apple')) return base('Apple', 95, 0, 25, 0);
    if (s.includes('bread')) return base('Bread (slice)', 80, 3, 14, 1);
    if (s.includes('oat') || s.includes('oatmeal')) return base('Oatmeal (cup cooked)', 158, 6, 27, 3);
    if (s.includes('olive oil')) return base('Olive Oil (tbsp)', 119, 0, 0, 14);
    if (s.includes('beef') || s.includes('steak')) return base('Beef (100g)', 250, 26, 0, 15);
    // generic estimate per 100g if grams provided
    if (unit === 'g' || unit === 'grams') return base('Food (estimated)', 200, 10, 20, 8);
    return { calories: 200, protein: 10, carbs: 20, fats: 8, foodName: 'Food (estimated)' };
  };

  try {
    if (!ai) throw new Error('AI unavailable');
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze food input: "${query}". Estimate calories, protein(g), carbs(g), fats(g). Return 'foodName' in language: ${language}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: nutritionSchema,
      }
    });
    const text = (response as any).text || (response as any).response?.text;
    if (!text) throw new Error('No response');
    return JSON.parse(text) as MacroData & { foodName: string };
  } catch {
    return simpleEstimate(query);
  }
};

// --- COACHING ---

export const getAICoachResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  language: Language
): Promise<string> => {
  const model = "gemini-2.5-flash";
  try {
    const chat = ai.chats.create({
      model,
      history: history,
      config: {
        systemInstruction: `You are Titan AI, an elite fitness and nutrition coach. Respond in ${language}. Be concise, scientific, and motivating.`,
      }
    });
    const result = await chat.sendMessage({ message });
    return result.text || "Error connecting to Titan.";
  } catch (error) {
    return "Error connecting to Titan server.";
  }
};