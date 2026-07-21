import { expect, test } from '@playwright/test';

type SceneSnapshot = {
  active: boolean;
  paused: boolean;
  finished: boolean;
  enemyCount: number;
  total: number;
};

async function snapshot(page: import('@playwright/test').Page): Promise<SceneSnapshot> {
  return page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: {
          getScene: (key: string) => {
            scene: { isActive: () => boolean };
            paused: boolean;
            finished: boolean;
            enemies: unknown[];
            stats: { total: number };
          };
        };
      };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    return {
      active: scene.scene.isActive(),
      paused: scene.paused,
      finished: scene.finished,
      enemyCount: scene.enemies.length,
      total: scene.stats.total,
    };
  });
}

test('loads canvas and handles keyboard pause/input without browser errors', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/方块打字冒险|BlockType Adventure/i);
  await expect(page.locator('#game canvas')).toBeVisible();

  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
  const initial = await snapshot(page);
  expect(initial.active).toBe(true);
  expect(initial.paused).toBe(false);
  expect(initial.finished).toBe(false);

  await page.keyboard.press('Escape');
  await expect.poll(async () => (await snapshot(page)).paused).toBe(true);

  await page.keyboard.press('a');
  expect((await snapshot(page)).total).toBe(initial.total);

  await page.keyboard.press('Escape');
  await expect.poll(async () => (await snapshot(page)).paused).toBe(false);

  await page.keyboard.press('a');
  await expect.poll(async () => (await snapshot(page)).total).toBe(initial.total + 1);

  await page.reload();
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
  expect(browserErrors).toEqual([]);
});
