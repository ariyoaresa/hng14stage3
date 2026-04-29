import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '../../src/lib/habits';
import { Habit } from '../../src/types/habit';

describe('toggleHabitCompletion', () => {
  const baseHabit: Habit = {
    id: '1', userId: 'u1', name: 'Test', description: '', frequency: 'daily', createdAt: '2024-01-01', completions: ['2024-01-01']
  };

  it('adds a completion date when the date is not present', () => {
    const updated = toggleHabitCompletion(baseHabit, '2024-01-02');
    expect(updated.completions).toContain('2024-01-02');
  });

  it('removes a completion date when the date already exists', () => {
    const updated = toggleHabitCompletion(baseHabit, '2024-01-01');
    expect(updated.completions).not.toContain('2024-01-01');
  });

  it('does not mutate the original habit object', () => {
    const habitCopy = { ...baseHabit, completions: [...baseHabit.completions] };
    toggleHabitCompletion(baseHabit, '2024-01-02');
    expect(baseHabit).toEqual(habitCopy);
  });

  it('does not return duplicate completion dates', () => {
    const habitWithDupes = { ...baseHabit, completions: ['2024-01-01', '2024-01-01'] };
    const updated = toggleHabitCompletion(habitWithDupes, '2024-01-02');
    const set = new Set(updated.completions);
    expect(set.size).toBe(updated.completions.length);
  });
});
