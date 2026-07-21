import { expect, test } from '@playwright/test';

type EnemySnapshot = {
  id: number;
  word: string;
  progress: number;
  x: number;
};

type SceneSnapshot = {
  active: boolean;
  paused: boolean;
  finished: boolean;
  enemyCount: number;
  total: number;
  correct: number;
  incorrect: number;
  lockedTargetId: number | null;
  enemies: EnemySnapshot[];
};

async function snapshot(page: import('@playwright/test').Page): Promise<SceneSnapshot> {
  return page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: {
          getScene: (key: string) => {
            scene: { isActive: () => boolean; restart: () => void };
            paused: boolean;
            finished: boolean;
            enemies: Array<{
              id: number;
              word: string;
              progress: number;
              container: { x: number };
            }>;
            stats: { total: number; correct: number; incorrect: number };
            typingSystem: { lockedTargetId: number | null };
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
      correct: scene.stats.correct,
      incorrect: scene.stats.incorrect,
      lockedTargetId: scene.typingSystem.lockedTargetId,
      enemies: scene.enemies.map((enemy) => ({
        id: enemy.id,
        word: enemy.word,
        progress: enemy.progress,
        x: enemy.container.x,
      })),
    };
  });
}

async function restartScene(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: { getScene: (key: string) => { scene: { restart: () => void } } };
      };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    scene.scene.restart();
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

test('locks the nearest same-initial enemy, rolls back with Backspace, and resets on restart', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  // A constant random value makes every generated word "stone" in this browser only.
  // Production randomness and runtime code remain unchanged.
  await page.addInitScript(() => {
    Math.random = () => 0.07;
  });

  await page.goto('/');
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThanOrEqual(2);

  const beforeInput = await snapshot(page);
  const sameInitial = beforeInput.enemies.filter((enemy) => enemy.word.startsWith('s'));
  expect(sameInitial.length).toBeGreaterThanOrEqual(2);

  const nearest = [...sameInitial].sort((a, b) => a.x - b.x)[0];
  await page.keyboard.press('s');

  await expect.poll(async () => (await snapshot(page)).lockedTargetId).toBe(nearest.id);
  let afterLock = await snapshot(page);
  expect(afterLock.enemies.find((enemy) => enemy.id === nearest.id)?.progress).toBe(1);

  const secondCharacter = nearest.word[1];
  await page.keyboard.press(secondCharacter);
  await expect.poll(async () => {
    const state = await snapshot(page);
    return state.enemies.find((enemy) => enemy.id === nearest.id)?.progress;
  }).toBe(2);

  const urlBeforeBackspace = page.url();
  const totalBeforeBackspace = (await snapshot(page)).total;
  await page.keyboard.press('Backspace');
  await expect.poll(async () => {
    const state = await snapshot(page);
    return state.enemies.find((enemy) => enemy.id === nearest.id)?.progress;
  }).toBe(1);
  expect(page.url()).toBe(urlBeforeBackspace);
  expect((await snapshot(page)).total).toBe(totalBeforeBackspace);

  await restartScene(page);
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
  afterLock = await snapshot(page);
  expect(afterLock.total).toBe(0);
  expect(afterLock.correct).toBe(0);
  expect(afterLock.incorrect).toBe(0);
  expect(afterLock.lockedTargetId).toBeNull();
  expect(afterLock.enemies.every((enemy) => enemy.progress === 0)).toBe(true);
  expect(browserErrors).toEqual([]);
});
