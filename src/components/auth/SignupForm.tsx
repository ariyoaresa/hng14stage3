'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../../types/auth';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const usersStr = localStorage.getItem('habit-tracker-users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      setError('User already exists');
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('habit-tracker-users', JSON.stringify(users));

    const session = {
      userId: newUser.id,
      email: newUser.email,
    };
    localStorage.setItem('habit-tracker-session', JSON.stringify(session));

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              data-testid="auth-signup-email"
              className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              data-testid="auth-signup-password"
              className="w-full border-gray-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            data-testid="auth-signup-submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
