export enum FitnessGoal {
  WEIGHT_LOSS = "Weight Loss (Cut)",
  MUSCLE_GAIN = "Muscle Gain (Hypertrophy)",
  STRENGTH = "Strength Training",
  ENDURANCE = "Endurance / Cardio",
  FLEXIBILITY = "Flexibility / Mobility",
  GENERAL_HEALTH = "General Health"
}

export enum ExperienceLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced"
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Prefer not to say"
}

export enum SplitStrategy {
  PPL = "Push / Pull / Legs",
  UPPER_LOWER = "Upper / Lower",
  BRO_SPLIT = "Body Part Split (Bro Split)",
  FULL_BODY = "Full Body",
  CUSTOM = "Custom / Mixed"
}

export enum Language {
  EN = "en",
  HU = "hu",
  AR = "ar",
  FR = "fr",
  ES = "es",
  RU = "ru"
}

export interface UserProfile {
  name: string;
  age: number;
  height: string;
  weight: string;
  level: ExperienceLevel;
  gender: Gender;
  geneticAdvantages: string;
  isGuest?: boolean;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

export interface WeeklyDay {
  day: string;
  focus: string;
  exercises: string[]; // Simplified list for the weekly view
}

export interface WorkoutPlan {
  title: string;
  durationMinutes: number;
  difficulty: string;
  exercises: Exercise[];
  warmup: string;
  cooldown: string;
  weeklySchedule?: WeeklyDay[]; // Optional: for full week plans
}

export interface WorkoutSetLog {
  exerciseName: string;
  set: number;
  reps: number;
  weight: number;
}

export interface WorkoutSessionSummary {
  title: string;
  durationMinutes: number;
  difficulty: string;
  startedAt: number;
  finishedAt: number;
  logs: WorkoutSetLog[];
}

export interface ActiveSession {
  plan: WorkoutPlan;
  workoutId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserStats {
  workoutsCompleted: number;
  minutesTrained: number;
  currentStreak: number;
  caloriesBurned: number;
}

export interface ProgressDataPoint {
  date: string;
  weight?: number;
  duration: number; // minutes
}

export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export type MealType = "Breakfast" | "Breakfast Snack" | "Lunch" | "Lunch Snack" | "Dinner" | "Dinner Snack";

export interface FoodLogEntry {
  id: string;
  foodName: string;
  macros: MacroData;
  timestamp: number;
  meal: MealType;
}