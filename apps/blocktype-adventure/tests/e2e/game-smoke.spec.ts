import { expect, test, type Page } from '@playwright/test';

type EnemySnapshot = { id: number; word: string; progress: number; x: number };
type TextLike = { active?: boolean; visible?: boolean; text?: string };
type SceneSnapshot = {
  active: boolean;
  started: boolean;
  paused: boolean;
  finished: boolean;
  enemyCount: number;
  baseHealth: number;
  remainingSeconds: number;
  total: number;
  correct: number;
  incorrect: number;
  completedWords: number;
  errorKeys: Record<string, number>;
  lockedTargetId: number | null;
  enemies: EnemySnapshot[];
  visibleTexts: string[];
};

async function snapshot(page: Page): Promise<SceneSnapshot> {
  return page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: {
        scene: {
          getScene: (key: string) => {
            scene: { isActive: () => boolean; restart: (data?: { autoStart?: boolean }) => void };
            started: boolean;
            paused: boolean;
            finished: boolean;
            baseHealth: number;
            remainingSeconds: number;
            enemies: Array<{ id: number; word: string; progress: number; container: { x: number } }>;
            stats: {
              total: number; correct: number; incorrect: number; completedWords: number;
              errorKeys: Record<string, number>;
            };
            typingSystem: { lockedTargetId: number | null };
            children: { list: TextLike[] };
            overlay?: { list: TextLike[] };
            menuOverlay?: { list: TextLike[] };
            pauseOverlay?: { list: TextLike[] };
          };
        };
      };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    const textObjects = [
      ...scene.children.list,
      ...(scene.overlay?.list ?? []),
      ...(scene.menuOverlay?.list ?? []),
      ...(scene.pauseOverlay?.list ?? []),
    ];
    return {
      active: scene.scene.isActive(),
      started: scene.started,
      paused: scene.paused,
      finished: scene.finished,
      enemyCount: scene.enemies.length,
      baseHealth: scene.baseHealth,
      remainingSeconds: scene.remainingSeconds,
      total: scene.stats.total,
      correct: scene.stats.correct,
      incorrect: scene.stats.incorrect,
      completedWords: scene.stats.completedWords,
      errorKeys: { ...scene.stats.errorKeys },
      lockedTargetId: scene.typingSystem.lockedTargetId,
      enemies: scene.enemies.map((enemy) => ({
        id: enemy.id, word: enemy.word, progress: enemy.progress, x: enemy.container.x,
      })),
      visibleTexts: textObjects
        .filter((child) => child.active !== false && child.visible !== false && typeof child.text === 'string')
        .map((child) => child.text as string),
    };
  });
}

async function clickCanvasPoint(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator('#game canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Game canvas has no bounding box');
  await page.mouse.click(box.x + box.width * (x / 1280), box.y + box.height * (y / 720));
}

async function startGame(page: Page): Promise<void> {
  await clickCanvasPoint(page, 640, 455);
  await expect.poll(async () => (await snapshot(page)).started).toBe(true);
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
}

async function restartPlayingScene(page: Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: { scene: { getScene: (key: string) => { scene: { restart: (data?: { autoStart?: boolean }) => void } } } };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    scene.scene.restart({ autoStart: true });
  });
  await expect.poll(async () => (await snapshot(page)).started).toBe(true);
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
}

async function prepareSameInitialTargets(page: Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: { scene: { getScene: (key: string) => {
        enemies: Array<{ word: string; progress: number }>;
        spawnEnemy: () => void;
      } } };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    while (scene.enemies.length < 2) scene.spawnEnemy();
    scene.enemies[0].word = 'stone';
    scene.enemies[0].progress = 0;
    scene.enemies[1].word = 'star';
    scene.enemies[1].progress = 0;
  });
}

async function prepareVictory(page: Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: { scene: { getScene: (key: string) => {
        remainingSeconds: number; time: { timeScale: number };
      } } };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene) throw new Error('GameScene is unavailable');
    scene.remainingSeconds = 1;
    scene.time.timeScale = 100;
  });
}

async function prepareBaseBreach(page: Page): Promise<void> {
  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: { scene: { getScene: (key: string) => {
        baseHealth: number; enemies: Array<{ container: { x: number } }>;
      } } };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene || scene.enemies.length === 0) throw new Error('A live enemy is required');
    scene.baseHealth = 1;
    scene.enemies[0].container.x = 154;
  });
}

async function prepareHighSpeedTarget(page: Page, word: string): Promise<void> {
  await page.evaluate((targetWord) => {
    const root = globalThis as typeof globalThis & {
      __BLOCKTYPE_GAME__?: { scene: { getScene: (key: string) => {
        enemies: Array<{
          word: string; progress: number; speed: number;
          container: { x: number; destroy: (destroyChildren?: boolean) => void };
        }>;
        stats: {
          score: number; combo: number; maxCombo: number; total: number; correct: number;
          incorrect: number; completedWords: number; startedAt: number; errorKeys: Record<string, number>;
        };
        typingSystem: { reset: () => void };
        time: { timeScale: number };
      } } };
    };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (!scene || scene.enemies.length === 0) throw new Error('A live enemy is required');
    scene.time.timeScale = 0;
    for (const enemy of scene.enemies.slice(1)) enemy.container.destroy(true);
    scene.enemies.splice(1);
    const target = scene.enemies[0];
    target.word = targetWord;
    target.progress = 0;
    target.speed = 0;
    target.container.x = 900;
    scene.typingSystem.reset();
    scene.stats.score = 0;
    scene.stats.combo = 0;
    scene.stats.maxCombo = 0;
    scene.stats.total = 0;
    scene.stats.correct = 0;
    scene.stats.incorrect = 0;
    scene.stats.completedWords = 0;
    scene.stats.startedAt = Date.now();
    scene.stats.errorKeys = {};
  }, word);
}

function collectBrowserErrors(page: Page): string[] {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  return browserErrors;
}

test('starts from a quiet menu and shows an explicit pause panel', async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/方块打字冒险|BlockType Adventure/i);
  await expect(page.locator('#game canvas')).toBeVisible();

  let state = await snapshot(page);
  expect(state.active).toBe(true);
  expect(state.started).toBe(false);
  expect(state.enemyCount).toBe(0);
  expect(state.visibleTexts).toContain('开始游戏');

  await page.keyboard.press('a');
  expect((await snapshot(page)).total).toBe(0);
  await startGame(page);

  await page.keyboard.press('Escape');
  await expect.poll(async () => (await snapshot(page)).paused).toBe(true);
  state = await snapshot(page);
  expect(state.visibleTexts).toContain('游戏已暂停');
  const totalWhilePaused = state.total;
  await page.keyboard.press('a');
  expect((await snapshot(page)).total).toBe(totalWhilePaused);

  await page.keyboard.press('Escape');
  await expect.poll(async () => (await snapshot(page)).paused).toBe(false);
  await page.keyboard.press('a');
  await expect.poll(async () => (await snapshot(page)).total).toBe(totalWhilePaused + 1);

  await page.reload();
  await expect(page.locator('#game canvas')).toBeVisible();
  state = await snapshot(page);
  expect(state.started).toBe(false);
  expect(state.enemyCount).toBe(0);
  expect(browserErrors).toEqual([]);
});

test('locks the nearest same-initial enemy, rolls back with Backspace, and resets on restart', async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.goto('/');
  await startGame(page);
  await prepareSameInitialTargets(page);
  const beforeInput = await snapshot(page);
  const sameInitial = beforeInput.enemies.filter((enemy) => enemy.word.startsWith('s'));
  expect(sameInitial).toHaveLength(2);
  const nearest = [...sameInitial].sort((a, b) => a.x - b.x)[0];

  await page.keyboard.press('s');
  await expect.poll(async () => (await snapshot(page)).lockedTargetId).toBe(nearest.id);
  await page.keyboard.press(nearest.word[1]);
  await expect.poll(async () => (await snapshot(page)).enemies.find((enemy) => enemy.id === nearest.id)?.progress).toBe(2);

  const urlBeforeBackspace = page.url();
  const totalBeforeBackspace = (await snapshot(page)).total;
  await page.keyboard.press('Backspace');
  await expect.poll(async () => (await snapshot(page)).enemies.find((enemy) => enemy.id === nearest.id)?.progress).toBe(1);
  expect(page.url()).toBe(urlBeforeBackspace);
  expect((await snapshot(page)).total).toBe(totalBeforeBackspace);

  await restartPlayingScene(page);
  const restarted = await snapshot(page);
  expect(restarted.total).toBe(0);
  expect(restarted.correct).toBe(0);
  expect(restarted.incorrect).toBe(0);
  expect(restarted.lockedTargetId).toBeNull();
  expect(restarted.enemies.every((enemy) => enemy.progress === 0)).toBe(true);
  expect(browserErrors).toEqual([]);
});

test('supports result restart and return-to-menu buttons', async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  await page.goto('/');
  await startGame(page);

  await prepareVictory(page);
  await expect.poll(async () => (await snapshot(page)).finished, { timeout: 5000 }).toBe(true);
  let result = await snapshot(page);
  expect(result.visibleTexts).toContain('胜利！');
  expect(result.visibleTexts).toContain('再来一局');
  expect(result.visibleTexts).toContain('返回首页');

  await page.evaluate(() => {
    const root = globalThis as typeof globalThis & { __BLOCKTYPE_GAME__?: { scene: { getScene: (key: string) => { time: { timeScale: number } } } } };
    const scene = root.__BLOCKTYPE_GAME__?.scene.getScene('game');
    if (scene) scene.time.timeScale = 1;
  });
  await clickCanvasPoint(page, 505, 555);
  await expect.poll(async () => (await snapshot(page)).started).toBe(true);
  await expect.poll(async () => (await snapshot(page)).enemyCount).toBeGreaterThan(0);
  let restarted = await snapshot(page);
  expect(restarted.finished).toBe(false);
  expect(restarted.baseHealth).toBe(5);
  expect(restarted.remainingSeconds).toBe(60);
  expect(restarted.total).toBe(0);

  await prepareBaseBreach(page);
  await expect.poll(async () => (await snapshot(page)).finished).toBe(true);
  result = await snapshot(page);
  expect(result.visibleTexts).toContain('挑战失败');
  expect(result.visibleTexts).toContain('返回首页');

  await clickCanvasPoint(page, 775, 555);
  await expect.poll(async () => (await snapshot(page)).started).toBe(false);
  const menu = await snapshot(page);
  expect(menu.finished).toBe(false);
  expect(menu.enemyCount).toBe(0);
  expect(menu.total).toBe(0);
  expect(menu.visibleTexts).toContain('开始游戏');
  expect(browserErrors).toEqual([]);
});

test('receives ordered keyboard input at 10, 20, and 30 characters per second', async ({ page }) => {
  const browserErrors = collectBrowserErrors(page);
  const word = 'abcdefghijklmnopqrstuvwx';
  const firstHalf = word.slice(0, 12);
  const secondHalf = word.slice(12);
  const wrongKey = 'z';

  for (const rate of [10, 20, 30]) {
    await page.goto('/');
    await startGame(page);
    await prepareHighSpeedTarget(page, word);
    await page.evaluate(() => {
      const root = globalThis as typeof globalThis & { __BLOCKTYPE_KEY_TRACE__?: string[] };
      root.__BLOCKTYPE_KEY_TRACE__ = [];
      window.addEventListener('keydown', (event) => {
        if (/^[a-zA-Z]$/.test(event.key)) root.__BLOCKTYPE_KEY_TRACE__?.push(event.key.toLowerCase());
      }, { capture: true });
    });

    const delay = Math.round(1000 / rate);
    await page.keyboard.type(firstHalf, { delay });
    await page.keyboard.press(wrongKey);
    await page.keyboard.type(secondHalf, { delay });
    await expect.poll(async () => (await snapshot(page)).total).toBe(word.length + 1);
    const state = await snapshot(page);
    const trace = await page.evaluate(() => {
      const root = globalThis as typeof globalThis & { __BLOCKTYPE_KEY_TRACE__?: string[] };
      return root.__BLOCKTYPE_KEY_TRACE__ ?? [];
    });
    expect(trace.join('')).toBe(`${firstHalf}${wrongKey}${secondHalf}`);
    expect(state.correct).toBe(word.length);
    expect(state.incorrect).toBe(1);
    expect(state.completedWords).toBe(1);
    expect(state.errorKeys).toEqual({ [wrongKey]: 1 });
    expect(state.lockedTargetId).toBeNull();
    expect(state.enemyCount).toBe(0);
  }
  expect(browserErrors).toEqual([]);
});
