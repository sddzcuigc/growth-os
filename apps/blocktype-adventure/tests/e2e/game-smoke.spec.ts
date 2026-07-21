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
  baseHealth: number;
  remainingSeconds: number;
  total: number;
  correct: number;
  incorrect: number;
  lockedTargetId: number | null;
  enemies: EnemySnapshot[];
  visibleTexts: string[];
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
            baseHealth: number;
            remainingSeconds: number;
            enemies: Array<{
              id: number;
              word: string;
              progress: number;
              container: { x: number };
            }>;
            stats: { total: number; correct: number; incorrect: number };
            typingSystem: { lockedTargetId: number | null };
            children: {
              list: Array<{ active?: boolean; visible?: boolean; text?: string }>;
            };
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
      baseHealth: scene.baseHealth,
      remainingSeconds: scene.remainingSeconds,
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
      visibleTexts: scene.children.list
        .filter((child) => child.active !== false && child.visible !== false && typeof child.text === 'string')
        .map((child) => child.text as string),
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

async function prepareSameInitialTargets(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: {
          getScene: (key: string) => {
            enemies: Array<{ word: string; progress: number }>;
          };
        };
      };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene || scene.enemies.length < 2) throw new Error('Two live enemies are required');
    scene.enemies[0].word = 'stone';
    scene.enemies[0].progress = 0;
    scene.enemies[1].word = 'star';
    scene.enemies[1].progress = 0;
  });
}

async function prepareVictory(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: {
          getScene: (key: string) => {
            remainingSeconds: number;
            time: { timeScale: number };
          };
        };
      };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    scene.remainingSeconds = 1;
    scene.time.timeScale = 100;
  });
}

async function prepareBaseBreach(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: {
          getScene: (key: string) => {
            baseHealth: number;
            enemies: Array<{ container: { x: number } }>;
          };
        };
      };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene || scene.enemies.length === 0) throw new Error('A live enemy is required');
    scene.baseHealth = 1;
    scene.enemies[0].container.x = 154;
  });
}

async function clickRestartButton(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: { getScene: (key: string) => { time: { timeScale: number } } };
      };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    scene.time.timeScale = 1;
  });

  const canvas = page.locator('#game canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Game canvas has no bounding box');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * (550 / 720));
}

function collectBrowserErrors(page: import('@playwright/test').Page): string[] {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  return browserErrors;
}

test('loads canvas and handles keyboard pause/input without browser errors', async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);

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
  const browserErrors = collectBrowserErrors(page);

  await page.goto('/');
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThanOrEqual(2);

  // Normalize only the two fixture words; movement, distance, keyboard events and restart stay real.
  await prepareSameInitialTargets(page);
  const beforeInput = await snapshot(page);
  const sameInitial = beforeInput.enemies.filter((enemy) => enemy.word.startsWith('s'));
  expect(sameInitial).toHaveLength(2);

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

test('completes victory and failure reports and restarts through the real result button', async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);

  await page.goto('/');
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);

  // Shorten time through the scene clock; the production countdown callback still calls finishGame(true).
  await prepareVictory(page);
  await expect.poll(async () => (await snapshot(page)).finished, { timeout: 5000 }).toBe(true);
  let result = await snapshot(page);
  expect(result.visibleTexts).toContain('胜利！');
  expect(result.visibleTexts.some((text) => text.includes('本局得分：'))).toBe(true);
  expect(result.visibleTexts.some((text) => text.includes('输入总字符：'))).toBe(true);
  expect(result.visibleTexts).toContain('再来一局');

  await clickRestartButton(page);
  await expect.poll(async () => (await snapshot(page)).finished).toBe(false);
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
  let restarted = await snapshot(page);
  expect(restarted.baseHealth).toBe(5);
  expect(restarted.remainingSeconds).toBe(60);
  expect(restarted.total).toBe(0);
  expect(restarted.lockedTargetId).toBeNull();

  // Prepare the minimum breach condition; the production update loop still calls damageBase and finishGame(false).
  await prepareBaseBreach(page);
  await expect.poll(async () => (await snapshot(page)).finished).toBe(true);
  result = await snapshot(page);
  expect(result.baseHealth).toBe(0);
  expect(result.visibleTexts).toContain('挑战失败');
  expect(result.visibleTexts.some((text) => text.includes('正确 / 错误：'))).toBe(true);
  expect(result.visibleTexts.some((text) => text.includes('最高连击：'))).toBe(true);
  expect(result.visibleTexts).toContain('再来一局');

  await clickRestartButton(page);
  await expect.poll(async () => (await snapshot(page)).finished).toBe(false);
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
  restarted = await snapshot(page);
  expect(restarted.baseHealth).toBe(5);
  expect(restarted.remainingSeconds).toBe(60);
  expect(restarted.total).toBe(0);
  expect(restarted.correct).toBe(0);
  expect(restarted.incorrect).toBe(0);
  expect(restarted.lockedTargetId).toBeNull();
  expect(browserErrors).toEqual([]);
});
