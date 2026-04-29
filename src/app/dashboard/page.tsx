'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Habit } from '../../types/habit';
import { Session } from '../../types/auth';
import { getHabitSlug } from '../../lib/slug';
import { validateHabitName } from '../../lib/validators';
import { calculateCurrentStreak } from '../../lib/streaks';
import { toggleHabitCompletion } from '../../lib/habits';
import { Check, Edit2, Trash2, Plus, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem('habit-tracker-session');
    if (!sessionStr) {
      router.push('/login');
      return;
    }
    const currentSession = JSON.parse(sessionStr);
    setSession(currentSession);

    const habitsStr = localStorage.getItem('habit-tracker-habits');
    if (habitsStr) {
      const allHabits: Habit[] = JSON.parse(habitsStr);
      setHabits(allHabits.filter(h => h.userId === currentSession.userId));
    }
  }, [router]);

  const saveHabits = (newHabits: Habit[], currentSession: Session) => {
    const habitsStr = localStorage.getItem('habit-tracker-habits');
    const allHabits: Habit[] = habitsStr ? JSON.parse(habitsStr) : [];
    
    // Replace all current user habits in the global list
    const otherHabits = allHabits.filter(h => h.userId !== currentSession.userId);
    const updatedAllHabits = [...otherHabits, ...newHabits];
    
    localStorage.setItem('habit-tracker-habits', JSON.stringify(updatedAllHabits));
    setHabits(newHabits);
  };

  const handleLogout = () => {
    localStorage.removeItem('habit-tracker-session');
    router.push('/login');
  };

  const handleOpenForm = (habit?: Habit) => {
    if (habit) {
      setEditingHabitId(habit.id);
      setFormName(habit.name);
      setFormDescription(habit.description);
    } else {
      setEditingHabitId(null);
      setFormName('');
      setFormDescription('');
    }
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabitId(null);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const validation = validateHabitName(formName);
    if (!validation.valid) {
      setFormError(validation.error);
      return;
    }

    let newHabits = [...habits];

    if (editingHabitId) {
      newHabits = newHabits.map(h => {
        if (h.id === editingHabitId) {
          return { ...h, name: validation.value, description: formDescription };
        }
        return h;
      });
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        userId: session.userId,
        name: validation.value,
        description: formDescription,
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: []
      };
      newHabits.push(newHabit);
    }

    saveHabits(newHabits, session);
    handleCloseForm();
  };

  const handleDeleteHabit = (id: string) => {
    if (!session) return;
    const newHabits = habits.filter(h => h.id !== id);
    saveHabits(newHabits, session);
    setHabitToDelete(null);
  };

  const handleToggleCompletion = (habit: Habit) => {
    if (!session) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedHabit = toggleHabitCompletion(habit, todayStr);
    
    const newHabits = habits.map(h => h.id === habit.id ? updatedHabit : h);
    saveHabits(newHabits, session);
  };

  if (!session) return null;

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
          <button
            onClick={handleLogout}
            data-testid="auth-logout-button"
            className="flex items-center text-gray-600 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Habits</h2>
          <button
            onClick={() => handleOpenForm()}
            data-testid="create-habit-button"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5 sm:mr-1" />
            <span className="hidden sm:inline">New Habit</span>
          </button>
        </div>

        {habits.length === 0 ? (
          <div data-testid="empty-state" className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4">You don't have any habits yet.</p>
            <button
              onClick={() => handleOpenForm()}
              className="text-blue-600 font-medium hover:underline"
            >
              Create your first habit
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {habits.map(habit => {
              const slug = getHabitSlug(habit.name);
              const streak = calculateCurrentStreak(habit.completions);
              const todayStr = new Date().toISOString().split('T')[0];
              const isCompletedToday = habit.completions.includes(todayStr);

              return (
                <div
                  key={habit.id}
                  data-testid={`habit-card-${slug}`}
                  className={`p-5 rounded-xl shadow-sm border transition ${isCompletedToday ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                      {habit.description && <p className="text-sm text-gray-500 mt-1">{habit.description}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenForm(habit)}
                        data-testid={`habit-edit-${slug}`}
                        className="text-gray-400 hover:text-blue-600 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setHabitToDelete(habit.id)}
                        data-testid={`habit-delete-${slug}`}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium text-gray-500">Streak:</div>
                      <div data-testid={`habit-streak-${slug}`} className="text-lg font-bold text-gray-900">
                        {streak}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleCompletion(habit)}
                      data-testid={`habit-complete-${slug}`}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                        isCompletedToday 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Check className={`w-5 h-5 mr-1 ${isCompletedToday ? 'opacity-100' : 'opacity-50'}`} />
                      {isCompletedToday ? 'Completed' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Habit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{editingHabitId ? 'Edit Habit' : 'Create Habit'}</h3>
            {formError && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleSaveHabit} data-testid="habit-form">
              <div className="space-y-4">
                <div>
                  <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    id="habit-name"
                    type="text"
                    data-testid="habit-name-input"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="habit-desc" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    id="habit-desc"
                    data-testid="habit-description-input"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="habit-freq" className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    id="habit-freq"
                    data-testid="habit-frequency-select"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    disabled
                  >
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="habit-save-button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Delete Habit?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this habit? This action cannot be undone.</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setHabitToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHabit(habitToDelete)}
                data-testid="confirm-delete-button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
