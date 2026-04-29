import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '../../src/components/auth/SignupForm';
import LoginForm from '../../src/components/auth/LoginForm';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}));

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it('submits the signup form and creates a session', async () => {
    render(<SignupForm />);
    const user = userEvent.setup();
    
    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));
    
    const users = JSON.parse(localStorage.getItem('habit-tracker-users') || '[]');
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('test@example.com');
    
    const session = JSON.parse(localStorage.getItem('habit-tracker-session') || '{}');
    expect(session.email).toBe('test@example.com');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for duplicate signup email', async () => {
    localStorage.setItem('habit-tracker-users', JSON.stringify([{ id: '1', email: 'test@example.com', password: '123' }]));
    
    render(<SignupForm />);
    const user = userEvent.setup();
    
    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));
    
    expect(await screen.findByText('User already exists')).toBeInTheDocument();
  });

  it('submits the login form and stores the active session', async () => {
    localStorage.setItem('habit-tracker-users', JSON.stringify([{ id: '1', email: 'test@example.com', password: 'password123' }]));
    
    render(<LoginForm />);
    const user = userEvent.setup();
    
    await user.type(screen.getByTestId('auth-login-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'password123');
    await user.click(screen.getByTestId('auth-login-submit'));
    
    const session = JSON.parse(localStorage.getItem('habit-tracker-session') || '{}');
    expect(session.email).toBe('test@example.com');
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for invalid login credentials', async () => {
    render(<LoginForm />);
    const user = userEvent.setup();
    
    await user.type(screen.getByTestId('auth-login-email'), 'wrong@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrong');
    await user.click(screen.getByTestId('auth-login-submit'));
    
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
