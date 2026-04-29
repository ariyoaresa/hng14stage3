# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Habit Tracker app >> loads the cached app shell when offline after the app has been loaded once
- Location: tests\e2e\app.spec.ts:119:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="auth-login-email"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="auth-login-email"]')

```

# Page snapshot

```yaml
- alert [ref=e1]
```

# Test source

```ts
  31  |   });
  32  | 
  33  |   test('signs up a new user and lands on the dashboard', async ({ page }) => {
  34  |     await page.goto('/signup');
  35  |     await page.fill('[data-testid="auth-signup-email"]', 'newuser@example.com');
  36  |     await page.fill('[data-testid="auth-signup-password"]', 'password123');
  37  |     await page.click('[data-testid="auth-signup-submit"]');
  38  |     await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  39  |     await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
  40  |   });
  41  | 
  42  |   test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
  43  |     await page.goto('/');
  44  |     await page.evaluate(() => {
  45  |       localStorage.setItem('habit-tracker-users', JSON.stringify([{ id: 'u1', email: 'user1@example.com', password: '123' }, { id: 'u2', email: 'user2@example.com', password: '123' }]));
  46  |       localStorage.setItem('habit-tracker-habits', JSON.stringify([
  47  |         { id: 'h1', userId: 'u1', name: 'User 1 Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] },
  48  |         { id: 'h2', userId: 'u2', name: 'User 2 Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }
  49  |       ]));
  50  |     });
  51  |     await page.goto('/login');
  52  |     await page.fill('[data-testid="auth-login-email"]', 'user1@example.com');
  53  |     await page.fill('[data-testid="auth-login-password"]', '123');
  54  |     await page.click('[data-testid="auth-login-submit"]');
  55  |     
  56  |     await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  57  |     await expect(page.locator('[data-testid="habit-card-user-1-habit"]')).toBeVisible();
  58  |     await expect(page.locator('[data-testid="habit-card-user-2-habit"]')).not.toBeVisible();
  59  |   });
  60  | 
  61  |   test('creates a habit from the dashboard', async ({ page }) => {
  62  |     await page.goto('/');
  63  |     await page.evaluate(() => {
  64  |       localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
  65  |     });
  66  |     await page.goto('/dashboard');
  67  |     
  68  |     await page.click('[data-testid="create-habit-button"]');
  69  |     await page.fill('[data-testid="habit-name-input"]', 'Read Book');
  70  |     await page.fill('[data-testid="habit-description-input"]', 'Read 10 pages');
  71  |     await page.click('[data-testid="habit-save-button"]');
  72  |     
  73  |     await expect(page.locator('[data-testid="habit-card-read-book"]')).toBeVisible();
  74  |   });
  75  | 
  76  |   test('completes a habit for today and updates the streak', async ({ page }) => {
  77  |     await page.goto('/');
  78  |     await page.evaluate(() => {
  79  |       localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
  80  |       localStorage.setItem('habit-tracker-habits', JSON.stringify([
  81  |         { id: 'h1', userId: 'u1', name: 'Streak Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }
  82  |       ]));
  83  |     });
  84  |     await page.goto('/dashboard');
  85  |     
  86  |     const streak = page.locator('[data-testid="habit-streak-streak-habit"]');
  87  |     await expect(streak).toHaveText('0');
  88  |     
  89  |     await page.click('[data-testid="habit-complete-streak-habit"]');
  90  |     await expect(streak).toHaveText('1');
  91  |   });
  92  | 
  93  |   test('persists session and habits after page reload', async ({ page }) => {
  94  |     await page.goto('/');
  95  |     await page.evaluate(() => {
  96  |       localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
  97  |       localStorage.setItem('habit-tracker-habits', JSON.stringify([
  98  |         { id: 'h1', userId: 'u1', name: 'Persist Habit', description: '', frequency: 'daily', createdAt: new Date().toISOString(), completions: [] }
  99  |       ]));
  100 |     });
  101 |     await page.goto('/dashboard');
  102 |     await expect(page.locator('[data-testid="habit-card-persist-habit"]')).toBeVisible();
  103 |     
  104 |     await page.reload();
  105 |     await expect(page.locator('[data-testid="habit-card-persist-habit"]')).toBeVisible();
  106 |   });
  107 | 
  108 |   test('logs out and redirects to /login', async ({ page }) => {
  109 |     await page.goto('/');
  110 |     await page.evaluate(() => {
  111 |       localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: 'u1', email: 'test@example.com' }));
  112 |     });
  113 |     await page.goto('/dashboard');
  114 |     
  115 |     await page.click('[data-testid="auth-logout-button"]');
  116 |     await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  117 |   });
  118 | 
  119 |   test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
  120 |     await page.goto('/');
  121 |     // Wait for SW to be registered and active
  122 |     await page.waitForFunction(async () => {
  123 |       const reg = await navigator.serviceWorker.getRegistration();
  124 |       return reg && reg.active;
  125 |     }, { timeout: 10000 });
  126 |     
  127 |     await context.setOffline(true);
  128 |     
  129 |     await page.goto('/login');
  130 |     // The SW should return the cached '/' shell which hydrates into the Login page
> 131 |     await expect(page.locator('[data-testid="auth-login-email"]')).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  132 |   });
  133 | });
  134 | 
```