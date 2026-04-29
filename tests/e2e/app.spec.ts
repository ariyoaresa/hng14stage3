import { test, expect } from '@playwright/test';

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before every page load to ensure clean state
    await page.goto('/login'); // Go to a page first to have access to localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="splash-screen"]')).toBeVisible();
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: '1', email: 'test@example.com' }));
    });
    await page.goto('/');
    await expect(page.locator('[data-testid="splash-screen"]')).toBeVisible();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('[data-testid="auth-signup-email"]', 'newuser@example.com');
    await page.fill('[data-testid="auth-signup-password"]', 'password123');
    await page.click('[data-testid="auth-signup-submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-users', JSON.stringify([{ id: 'u1', email: 'user1@example.com', password: '123' }, { id: 'u2', email: 'user2@example.com', password: '123' }]));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([
        { id: 'h1', userId: 'u1', name: 'User 1 Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
        { id: 'h2', userId: 'u2', name: 'User 2 Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }
      ]));
    });
    await page.goto('/login');
    await page.fill('[data-testid="auth-login-email"]', 'user1@example.com');
    await page.fill('[data-testid="auth-login-password"]', '123');
    await page.click('[data-testid="auth-login-submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    await expect(page.locator('[data-testid="habit-card-user-1-habit"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-card-user-2-habit"]')).not.toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
    });
    await page.goto('/dashboard');
    
    await page.click('[data-testid="create-habit-button"]');
    await page.fill('[data-testid="habit-name-input"]', 'Read Book');
    await page.fill('[data-testid="habit-description-input"]', 'Read 10 pages');
    await page.click('[data-testid="habit-save-button"]');
    
    await expect(page.locator('[data-testid="habit-card-read-book"]')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([
        { id: 'h1', userId: 'u1', name: 'Streak Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }
      ]));
    });
    await page.goto('/dashboard');
    
    const streak = page.locator('[data-testid="habit-streak-streak-habit"]');
    await expect(streak).toHaveText('0');
    
    await page.click('[data-testid="habit-complete-streak-habit"]');
    await expect(streak).toHaveText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
      localStorage.setItem('habit-tracker-habits', JSON.stringify([
        { id: 'h1', userId: 'u1', name: 'Persist Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }
      ]));
    });
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="habit-card-persist-habit"]')).toBeVisible();
    
    await page.reload();
    await expect(page.locator('[data-testid="habit-card-persist-habit"]')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
    });
    await page.goto('/dashboard');
    
    await page.click('[data-testid="auth-logout-button"]');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    await page.goto('/');
    // Wait for SW to be registered and active
    await page.waitForFunction(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return reg && reg.active;
    }, { timeout: 10000 });
    
    await context.setOffline(true);
    
    await page.goto('/login');
    // The SW should return the cached '/' shell which hydrates into the Login page
    await expect(page.locator('[data-testid="auth-login-email"]')).toBeVisible();
  });
});
