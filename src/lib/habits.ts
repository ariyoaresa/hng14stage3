import { Habit } from '../types/habit';

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const completionsSet = new Set(habit.completions);
  
  if (completionsSet.has(date)) {
    completionsSet.delete(date);
  } else {
    completionsSet.add(date);
  }

  return {
    ...habit,
    completions: Array.from(completionsSet),
  };
}
