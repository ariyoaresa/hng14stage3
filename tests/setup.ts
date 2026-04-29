import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Polyfill for crypto.randomUUID in jsdom environment
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    },
    writable: true
  });
}

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Check: () => React.createElement('div', { 'data-testid': 'check-icon' }),
  Edit2: () => React.createElement('div', { 'data-testid': 'edit-icon' }),
  Trash2: () => React.createElement('div', { 'data-testid': 'trash-icon' }),
  Plus: () => React.createElement('div', { 'data-testid': 'plus-icon' }),
  LogOut: () => React.createElement('div', { 'data-testid': 'logout-icon' }),
}));
