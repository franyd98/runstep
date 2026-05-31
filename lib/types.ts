export type RunType = "easy" | "tempo" | "interval" | "fartlek" | "long" | "recovery";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  sex: "male" | "female";
  level: "beginner" | "intermediate" | "advanced";
  goal: "weight_loss" | "complete_5k" | "habit" | "race";
  days_per_week: number;
  onboarding_done: boolean;
  created_at: string;
}

export interface Run {
  id: string;
  user_id: string;
  date: string;
  type: RunType;
  distance: number;
  duration: number; // minutes
  hr_avg: number | null;
  hr_max: number | null;
  elevation: number | null;
  cadence: number | null;
  notes: string | null;
  created_at: string;
}

export interface TrainingWeek {
  week: number;
  sessions: TrainingSession[];
}

export interface TrainingSession {
  day: string;
  type: RunType;
  description: string;
  target_distance: number;
  target_duration: number;
}
