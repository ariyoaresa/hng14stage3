import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../../src/app/dashboard/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}));

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
  });

  it('shows a validation error when habit name is empty', async () => {
    render(<DashboardPage />);
    const user = userEvent.setup();
    
    await user.click(await screen.findByTestId('create-habit-button'));
    await user.click(await screen.findByTestId('habit-save-button'));
    
    expect(await screen.findByText('Habit name is required')).toBeInTheDocument();
  });

  it('creates a new habit and renders it in the list', async () => {
    render(<DashboardPage />);
    const user = userEvent.setup();
    
    await user.click(await screen.findByTestId('create-habit-button'));
    await user.type(await screen.findByTestId('habit-name-input'), 'Drink Water');
    await user.click(await screen.findByTestId('habit-save-button'));
    
    expect(await screen.findByTestId('habit-card-drink-water')).toBeInTheDocument();
    
    const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') || '[]');
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe('Drink Water');
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const habitId = 'h1';
    const createdAt = '2024-01-01T00:00:00.000Z';
    localStorage.setItem('habit-tracker-habits', JSON.stringify([
      { id: habitId, userId: 'u1', name: 'Old Name', description: '', frequency: 'daily', createdAt, completions: ['2024-01-01'] }
    ]));
    
    render(<DashboardPage />);
    const user = userEvent.setup();
    
    await user.click(await screen.findByTestId('habit-edit-old-name'));
    const nameInput = await screen.findByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    await user.click(await screen.findByTestId('habit-save-button'));
    
    expect(await screen.findByTestId('habit-card-new-name')).toBeInTheDocument();
    
    const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') || '[]');
    expect(habits[0].id).toBe(habitId);
    expect(habits[0].createdAt).toBe(createdAt);
    expect(habits[0].completions).toEqual(['2024-01-01']);
  });

  it('deletes a habit only after explicit confirmation', async () => {
    localStorage.setItem('habit-tracker-habits', JSON.stringify([
      { id: 'h1', userId: 'u1', name: 'Delete Me', description: '', frequency: 'daily', createdAt: '2024-01-01', completions: [] }
    ]));
    
    render(<DashboardPage />);
    const user = userEvent.setup();
    
    await user.click(await screen.findByTestId('habit-delete-delete-me'));
    expect(await screen.findByText('Delete Habit?')).toBeInTheDocument();
    
    await user.click(screen.getByTestId('confirm-delete-button'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('habit-card-delete-me')).not.toBeInTheDocument();
    });
    
    const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') || '[]');
    expect(habits).toHaveLength(0);
  });

  it('toggles completion and updates the streak display', async () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('habit-tracker-habits', JSON.stringify([
      { id: 'h1', userId: 'u1', name: 'Complete Me', description: '', frequency: 'daily', createdAt: today, completions: [] }
    ]));
    
    render(<DashboardPage />);
    const user = userEvent.setup();
    
    const streakElement = await screen.findByTestId('habit-streak-complete-me');
    expect(streakElement).toHaveTextContent('0');
    
    await user.click(await screen.findByTestId('habit-complete-complete-me'));
    
    expect(streakElement).toHaveTextContent('1');
    
    const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') || '[]');
    expect(habits[0].completions).toContain(today);
  });
});
