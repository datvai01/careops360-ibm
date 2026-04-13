import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

mkdirSync('screenshots/dashboard', { recursive: true });

const BASE = 'http://localhost:80';
const EMAIL = 'exec@horizon.com';
const PASS  = 'Horizon&IBM2026';

const PAGES = [
  { id: 'login',              path: '/',                              label: 'Login' },
  { id: 'app-health',         path: '/dashboard/app-health',          label: 'Executive Overview' },
  { id: 'enrollment',         path: '/dashboard/enrollment',          label: 'Enrollment Intelligence' },
  { id: 'ops',                path: '/dashboard/ops',                 label: 'Operational Excellence' },
  { id: 'digital-front-door', path: '/dashboard/digital-front-door',  label: 'Digital Front Door' },
  { id: 'aiops-value',        path: '/dashboard/aiops-value',         label: 'IBM AIOps Value' },
  { id: 'roadmap',            path: '/dashboard/roadmap',             label: 'Transformation Roadmap' },
  { id: 'capability-uplift',  path: '/dashboard/capability-uplift',   label: 'Capability Uplift & AI Readiness' },
  { id: 'financial',          path: '/dashboard/financial',           label: 'Financial Performance' },
  { id: 'sla',                path: '/dashboard/sla',                 label: 'SLA & Service Quality' },
];

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx     = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page    = await ctx.newPage();

  // --- login ---
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(2000);

  // screenshot login page
  await page.screenshot({ path: 'screenshots/dashboard/login.jpg', type: 'jpeg', quality: 90 });
  console.log('✓ login');

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // screenshot each dashboard page
  for (const p of PAGES.slice(1)) {
    await page.goto(`${BASE}${p.path}`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `screenshots/dashboard/${p.id}.jpg`, type: 'jpeg', quality: 90, fullPage: true });
    console.log(`✓ ${p.label}`);
  }

  await browser.close();
  console.log('Done.');
})();
