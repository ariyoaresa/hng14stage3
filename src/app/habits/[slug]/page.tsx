'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Habit } from '../../../types/habit';
import { Session } from '../../../types/auth';
import { calculateCurrentStreak } from '../../../lib/streaks';
import { getHabitSlug } from '../../../lib/slug';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStr = localStorage.getItem('habit-tracker-session');
    if (!sessionStr) {
      router.push('/login');
      return;
    }
    const currentSession = JSON.parse(sessionStr);
    setSession(currentSession);

    const habitsStr = localStorage.getItem('habit-tracker-habits');
    const allHabits: Habit[] = habitsStr ? JSON.parse(habitsStr) : [];
    
    // Find the habit by slug
    const targetSlug = params.slug as string;
    const foundHabit = allHabits.find(h => 
      h.userId === currentSession.userId && 
      getHabitSlug(h.name) === targetSlug
    );

    if (foundHabit) {
      setHabit(foundHabit);
    } else {
      // Habit not found for this user
      router.push('/dashboard');
    }
    setLoading(false);
  }, [params.slug, router]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!habit) return null;

  const streak = calculateCurrentStreak(habit.completions);

  return (
    <div className="min-h-screen bg-gray-50 p-4" data-testid="habit-detail-page">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="text-blue-600 hover:underline"
            >
              &larr; Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Habit Detail</h1>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-2" data-testid="habit-detail-name">
              {habit.name}
            </h2>
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-blue-600" data-testid="habit-detail-streak">
                {streak}
              </span>
              <span className="text-sm text-blue-800 uppercase tracking-wide font-semibold">
                Current Streak
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">History</h3>
            {habit.completions.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No completions yet. Keep going!</p>
            ) : (
              <ul className="space-y-2">
                {[...habit.completions].sort().reverse().map(date => (
                  <li key={date} className="flex items-center text-sm text-gray-600">
                    <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                    {date}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
