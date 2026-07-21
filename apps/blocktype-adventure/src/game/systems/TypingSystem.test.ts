import { describe, expect, it } from 'vitest';
import { TypingSystem, type TypingTarget } from './TypingSystem';

const target = (id: number, word: string, distanceToBase: number, progress = 0): TypingTarget => ({
  id,
  word,
  distanceToBase,
  progress,
});

describe('TypingSystem', () => {
  it('locks the closest target when multiple targets share the same next character', () => {
    const system = new TypingSystem();
    const result = system.handleCharacter('s', [target(1, 'stone', 500), target(2, 'star', 200)]);

    expect(result).toEqual({ kind: 'correct', targetId: 2, completed: false, nextProgress: 1 });
    expect(system.lockedTargetId).toBe(2);
  });

  it('keeps the current lock even when another target becomes closer', () => {
    const system = new TypingSystem();
    system.handleCharacter('s', [target(1, 'stone', 100), target(2, 'star', 200)]);

    const result = system.handleCharacter('t', [target(1, 'stone', 300, 1), target(2, 'star', 50)]);
    expect(result).toMatchObject({ kind: 'correct', targetId: 1, nextProgress: 2 });
  });

  it('does not change the lock after an incorrect character', () => {
    const system = new TypingSystem();
    system.handleCharacter('b', [target(7, 'book', 100)]);

    const result = system.handleCharacter('x', [target(7, 'book', 80, 1)]);
    expect(result).toEqual({ kind: 'incorrect', targetId: 7, expected: 'o' });
    expect(system.lockedTargetId).toBe(7);
  });

  it('unlocks after completing a word', () => {
    const system = new TypingSystem();
    const result = system.handleCharacter('a', [target(3, 'a', 100)]);

    expect(result).toEqual({ kind: 'correct', targetId: 3, completed: true, nextProgress: 1 });
    expect(system.lockedTargetId).toBeNull();
  });

  it('backspace returns the previous progress and cancels a zero-progress lock', () => {
    const system = new TypingSystem();
    system.handleCharacter('t', [target(4, 'tree', 100)]);
    expect(system.handleBackspace([target(4, 'tree', 90, 1)])).toEqual({ targetId: 4, nextProgress: 0 });

    expect(system.handleBackspace([target(4, 'tree', 90, 0)])).toEqual({ targetId: null, nextProgress: null });
    expect(system.lockedTargetId).toBeNull();
  });

  it('ignores non-letter keys', () => {
    const system = new TypingSystem();
    expect(system.handleCharacter(' ', [target(1, 'stone', 100)])).toEqual({ kind: 'ignored' });
  });
});
