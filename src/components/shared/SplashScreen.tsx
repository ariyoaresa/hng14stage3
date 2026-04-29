'use client';

import React from 'react';

export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-50"
    >
      <h1 className="text-4xl font-bold tracking-wider">Habit Tracker</h1>
    </div>
  );
}
