import Phaser from 'phaser';
import './style.css';
import { GameScene } from './game/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#8ed7ff',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

// Read-only browser test seam. It exposes the Phaser game instance so Playwright can
// verify real scene state without duplicating gameplay rules in DOM-only test code.
(globalThis as typeof globalThis & { __BLOCKTYPE_GAME__?: Phaser.Game }).__BLOCKTYPE_GAME__ = game;
