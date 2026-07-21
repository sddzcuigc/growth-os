import Phaser from 'phaser';
import { TypingSystem, type TypingTarget } from './systems/TypingSystem';

type EnemyKind = 'typo-slime' | 'key-beetle';

type Enemy = {
  id: number;
  kind: EnemyKind;
  word: string;
  progress: number;
  speed: number;
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
};

type Stats = {
  score: number;
  combo: number;
  maxCombo: number;
  total: number;
  correct: number;
  incorrect: number;
  completedWords: number;
  startedAt: number;
  errorKeys: Record<string, number>;
};

const WORDS = [
  'apple', 'stone', 'house', 'tree', 'river', 'grass', 'light', 'cloud',
  'book', 'star', 'green', 'water', 'happy', 'sword', 'block', 'dream',
];

export class GameScene extends Phaser.Scene {
  private enemies: Enemy[] = [];
  private nextEnemyId = 1;
  private readonly typingSystem = new TypingSystem();
  private baseHealth = 5;
  private remainingSeconds = 60;
  private paused = false;
  private finished = false;
  private stats: Stats = this.createStats();

  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private accuracyText!: Phaser.GameObjects.Text;
  private wpmText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private inputText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Container;

  constructor() {
    super('game');
  }

  create(): void {
    this.resetState();
    this.drawWorld();
    this.createHud();
    this.createInputPanel();
    this.bindKeyboard();

    this.time.addEvent({
      delay: 1600,
      loop: true,
      callback: () => {
        if (!this.paused && !this.finished && this.enemies.length < 6) {
          this.spawnEnemy();
        }
      },
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.paused || this.finished) return;
        this.remainingSeconds -= 1;
        this.updateHud();
        if (this.remainingSeconds <= 0) this.finishGame(true);
      },
    });

    this.spawnEnemy();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners();
    });
  }

  update(_time: number, delta: number): void {
    if (this.paused || this.finished) return;

    for (const enemy of [...this.enemies]) {
      enemy.container.x -= enemy.speed * (delta / 1000);
      if (enemy.container.x <= 155) {
        this.damageBase(enemy);
      }
    }
  }

  private createStats(): Stats {
    return {
      score: 0,
      combo: 0,
      maxCombo: 0,
      total: 0,
      correct: 0,
      incorrect: 0,
      completedWords: 0,
      startedAt: Date.now(),
      errorKeys: {},
    };
  }

  private resetState(): void {
    this.enemies = [];
    this.nextEnemyId = 1;
    this.typingSystem.reset();
    this.baseHealth = 5;
    this.remainingSeconds = 60;
    this.paused = false;
    this.finished = false;
    this.stats = this.createStats();
  }

  private drawWorld(): void {
    this.cameras.main.setBackgroundColor('#8bd3ff');

    const graphics = this.add.graphics();
    graphics.fillStyle(0xdaf3ff).fillRect(0, 0, 1280, 420);
    graphics.fillStyle(0x7acb55).fillRect(0, 420, 1280, 300);
    graphics.fillStyle(0x4d8f3a).fillRect(0, 505, 1280, 215);

    for (let x = 0; x < 1280; x += 64) {
      graphics.fillStyle(x % 128 === 0 ? 0x69b84b : 0x75c755).fillRect(x, 420, 64, 32);
      graphics.fillStyle(x % 128 === 0 ? 0x76502f : 0x68462b).fillRect(x, 452, 64, 53);
    }

    graphics.fillStyle(0x385f72, 0.35).fillTriangle(620, 420, 850, 160, 1070, 420);
    graphics.fillStyle(0xffffff, 0.8).fillRect(160, 92, 130, 34);
    graphics.fillRect(230, 70, 95, 42);
    graphics.fillRect(920, 105, 145, 38);

    const base = this.add.rectangle(92, 425, 126, 225, 0x80542f).setStrokeStyle(6, 0x38251b);
    this.add.rectangle(92, 330, 142, 54, 0x314f87).setStrokeStyle(4, 0x1e2e4d);
    this.add.text(92, 330, '字核塔', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.rectangle(92, 465, 52, 118, 0x37291f).setStrokeStyle(3, 0x19130f);
    base.setData('role', 'base');
  }

  private createHud(): void {
    const hud = this.add.rectangle(640, 48, 910, 72, 0x172b3a, 0.94).setStrokeStyle(4, 0x2f4c60);
    hud.setOrigin(0.5);

    this.scoreText = this.add.text(240, 31, '', this.hudStyle());
    this.comboText = this.add.text(415, 31, '', this.hudStyle());
    this.accuracyText = this.add.text(580, 31, '', this.hudStyle());
    this.wpmText = this.add.text(780, 31, '', this.hudStyle());
    this.healthText = this.add.text(930, 31, '', this.hudStyle());
    this.timeText = this.add.text(1080, 31, '', this.hudStyle());

    this.add.text(1190, 48, 'Ⅱ', {
      fontFamily: 'sans-serif', fontSize: '36px', color: '#ffffff', backgroundColor: '#254359', padding: { x: 18, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.togglePause());

    this.updateHud();
  }

  private hudStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: 'sans-serif', fontSize: '20px', color: '#ffffff', fontStyle: 'bold' };
  }

  private createInputPanel(): void {
    this.add.rectangle(640, 650, 600, 96, 0x172119, 0.93).setStrokeStyle(5, 0x4f7b3b);
    this.inputText = this.add.text(640, 635, '输入任意目标的首字母开始攻击', {
      fontFamily: 'monospace', fontSize: '30px', color: '#fff3b0', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.feedbackText = this.add.text(640, 684, 'ESC 暂停 · Backspace 撤销', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#d7e6cf',
    }).setOrigin(0.5);
  }

  private bindKeyboard(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.BACKSPACE,
      Phaser.Input.Keyboard.KeyCodes.ESC,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    ]);

    keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.togglePause();
        return;
      }

      if (this.finished || this.paused) return;

      if (event.key === 'Backspace') {
        event.preventDefault();
        this.handleBackspace();
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        this.handleCharacter(event.key.toLowerCase());
      }
    });
  }

  private spawnEnemy(): void {
    const word = Phaser.Utils.Array.GetRandom(WORDS);
    const kind: EnemyKind = Math.random() > 0.5 ? 'typo-slime' : 'key-beetle';
    const laneY = Phaser.Utils.Array.GetRandom([470, 520, 570]);
    const bodyColor = kind === 'typo-slime' ? 0x7748a7 : 0xb6603c;

    const body = this.add.rectangle(0, 0, 78, 70, bodyColor).setStrokeStyle(5, 0x2b1d28);
    const face = this.add.text(0, 3, kind === 'typo-slime' ? 'Aa' : '⌨', {
      fontFamily: 'monospace', fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const label = this.add.text(0, -62, word, {
      fontFamily: 'monospace', fontSize: '27px', color: '#ffffff', backgroundColor: '#15202b',
      padding: { x: 12, y: 7 }, fontStyle: 'bold',
    }).setOrigin(0.5).setStroke('#000000', 3);

    const container = this.add.container(1220, laneY, [body, face, label]);
    const enemy: Enemy = {
      id: this.nextEnemyId++,
      kind,
      word,
      progress: 0,
      speed: kind === 'typo-slime' ? 38 : 48,
      container,
      body,
      label,
    };

    this.enemies.push(enemy);
  }

  private toTypingTargets(): TypingTarget[] {
    return this.enemies.map((enemy) => ({
      id: enemy.id,
      word: enemy.word,
      progress: enemy.progress,
      distanceToBase: Math.max(enemy.container.x - 155, 0),
    }));
  }

  private getLockedEnemy(): Enemy | null {
    const lockedId = this.typingSystem.lockedTargetId;
    return lockedId === null ? null : this.enemies.find((enemy) => enemy.id === lockedId) ?? null;
  }

  private handleCharacter(key: string): void {
    this.stats.total += 1;
    const result = this.typingSystem.handleCharacter(key, this.toTypingTargets());

    if (result.kind === 'correct') {
      const enemy = this.enemies.find((item) => item.id === result.targetId);
      if (!enemy) return;

      enemy.progress = result.nextProgress;
      this.stats.correct += 1;
      this.stats.combo += 1;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);
      this.stats.score += 10 + Math.min(this.stats.combo, 20);
      enemy.body.setFillStyle(0xf1d65c);
      this.time.delayedCall(90, () => enemy.body.setFillStyle(enemy.kind === 'typo-slime' ? 0x7748a7 : 0xb6603c));
      this.feedbackText.setText('正确！保持节奏').setColor('#8cff7a');

      if (result.completed) {
        this.completeEnemy(enemy);
      } else {
        this.renderEnemyLabel(enemy);
      }
    } else if (result.kind === 'incorrect') {
      this.stats.incorrect += 1;
      this.stats.combo = 0;
      this.stats.errorKeys[key] = (this.stats.errorKeys[key] ?? 0) + 1;
      this.feedbackText.setText(`错误：${key.toUpperCase()}，目标没有改变`).setColor('#ff7066');
      this.cameras.main.shake(90, 0.003);
    }

    this.updateInputText();
    this.updateHud();
  }

  private handleBackspace(): void {
    const result = this.typingSystem.handleBackspace(this.toTypingTargets());
    if (result.targetId === null || result.nextProgress === null) {
      this.feedbackText.setText('已取消目标锁定').setColor('#fff3b0');
      this.updateEnemyLabels();
      this.updateInputText();
      return;
    }

    const enemy = this.enemies.find((item) => item.id === result.targetId);
    if (!enemy) return;

    enemy.progress = result.nextProgress;
    this.renderEnemyLabel(enemy);
    this.feedbackText.setText('已撤销一个字符').setColor('#fff3b0');
    this.updateInputText();
  }

  private updateEnemyLabels(): void {
    for (const enemy of this.enemies) this.renderEnemyLabel(enemy);
  }

  private renderEnemyLabel(enemy: Enemy): void {
    const done = enemy.word.slice(0, enemy.progress).toUpperCase();
    const rest = enemy.word.slice(enemy.progress);
    enemy.label.setText(`${done}${rest}`);
    enemy.label.setColor(enemy.id === this.typingSystem.lockedTargetId ? '#ffe36d' : '#ffffff');
  }

  private completeEnemy(enemy: Enemy): void {
    this.stats.completedWords += 1;
    this.stats.score += 100 + enemy.word.length * 8;
    this.feedbackText.setText(`击破 ${enemy.word.toUpperCase()}！`).setColor('#ffe36d');
    this.removeEnemy(enemy);
  }

  private damageBase(enemy: Enemy): void {
    this.baseHealth -= 1;
    this.stats.combo = 0;
    this.feedbackText.setText('基地受到攻击！').setColor('#ff7066');
    this.removeEnemy(enemy);
    if (this.baseHealth <= 0) this.finishGame(false);
    this.updateHud();
  }

  private removeEnemy(enemy: Enemy): void {
    this.typingSystem.removeTarget(enemy.id);
    this.enemies = this.enemies.filter((item) => item.id !== enemy.id);
    enemy.container.destroy(true);
    this.updateEnemyLabels();
    this.updateInputText();
  }

  private updateInputText(): void {
    const lockedEnemy = this.getLockedEnemy();
    if (!lockedEnemy) {
      this.inputText.setText('输入任意目标的首字母开始攻击');
      return;
    }
    const done = lockedEnemy.word.slice(0, lockedEnemy.progress).toUpperCase();
    const rest = lockedEnemy.word.slice(lockedEnemy.progress);
    this.inputText.setText(`${done}${rest}`);
  }

  private updateHud(): void {
    const accuracy = this.stats.total === 0 ? 100 : (this.stats.correct / this.stats.total) * 100;
    const elapsedMinutes = Math.max((Date.now() - this.stats.startedAt) / 60000, 1 / 60);
    const wpm = Math.round((this.stats.correct / 5) / elapsedMinutes);

    this.scoreText.setText(`得分 ${this.stats.score}`);
    this.comboText.setText(`连击 ×${this.stats.combo}`);
    this.accuracyText.setText(`准确率 ${accuracy.toFixed(0)}%`);
    this.wpmText.setText(`WPM ${wpm}`);
    this.healthText.setText(`基地 ${'♥'.repeat(Math.max(this.baseHealth, 0))}`);
    this.timeText.setText(`时间 ${this.remainingSeconds}s`);
  }

  private togglePause(): void {
    if (this.finished) return;
    this.paused = !this.paused;
    this.feedbackText.setText(this.paused ? '游戏已暂停，按 ESC 继续' : '继续战斗！');
    this.feedbackText.setColor(this.paused ? '#fff3b0' : '#8cff7a');
  }

  private finishGame(victory: boolean): void {
    if (this.finished) return;
    this.finished = true;
    this.paused = false;

    const accuracy = this.stats.total === 0 ? 100 : (this.stats.correct / this.stats.total) * 100;
    const elapsedMinutes = Math.max((Date.now() - this.stats.startedAt) / 60000, 1 / 60);
    const wpm = Math.round((this.stats.correct / 5) / elapsedMinutes);
    const topErrors = Object.entries(this.stats.errorKeys)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([errorKey, count]) => `${errorKey.toUpperCase()}(${count})`)
      .join('、') || '无';

    const dim = this.add.rectangle(640, 360, 1280, 720, 0x081018, 0.78);
    const panel = this.add.rectangle(640, 360, 650, 470, 0x263226, 0.98).setStrokeStyle(6, victory ? 0xf2c94c : 0x5d8fc4);
    const title = this.add.text(640, 185, victory ? '胜利！' : '挑战失败', {
      fontFamily: 'sans-serif', fontSize: '58px', color: victory ? '#ffe36d' : '#9fceff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const report = this.add.text(640, 350,
      `本局得分：${this.stats.score}\n输入总字符：${this.stats.total}\n正确 / 错误：${this.stats.correct} / ${this.stats.incorrect}\n正确率：${accuracy.toFixed(1)}%\n平均速度：${wpm} WPM\n最高连击：${this.stats.maxCombo}\n高频错误按键：${topErrors}`,
      { fontFamily: 'monospace', fontSize: '25px', color: '#ffffff', lineSpacing: 9, align: 'left' },
    ).setOrigin(0.5);
    const restart = this.add.text(640, 550, '再来一局', {
      fontFamily: 'sans-serif', fontSize: '30px', color: '#ffffff', backgroundColor: '#4c9f38', padding: { x: 38, y: 14 }, fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.restart());

    this.overlay = this.add.container(0, 0, [dim, panel, title, report, restart]);
    this.overlay.setDepth(100);
  }
}
