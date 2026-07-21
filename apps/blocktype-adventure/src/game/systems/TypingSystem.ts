export type TypingTarget = {
  id: number;
  word: string;
  progress: number;
  distanceToBase: number;
};

export type TypingState = {
  lockedTargetId: number | null;
};

export type CharacterResult =
  | { kind: 'correct'; targetId: number; completed: boolean; nextProgress: number }
  | { kind: 'incorrect'; targetId: number | null; expected: string | null }
  | { kind: 'ignored' };

export class TypingSystem {
  private state: TypingState = { lockedTargetId: null };

  get lockedTargetId(): number | null {
    return this.state.lockedTargetId;
  }

  reset(): void {
    this.state.lockedTargetId = null;
  }

  unlock(): void {
    this.state.lockedTargetId = null;
  }

  selectTarget(key: string, targets: readonly TypingTarget[]): TypingTarget | null {
    const normalizedKey = key.toLowerCase();
    const locked = targets.find((target) => target.id === this.state.lockedTargetId);
    if (locked) return locked;

    const selected = targets
      .filter((target) => target.word[target.progress]?.toLowerCase() === normalizedKey)
      .toSorted((a, b) => a.distanceToBase - b.distanceToBase)[0] ?? null;

    this.state.lockedTargetId = selected?.id ?? null;
    return selected;
  }

  handleCharacter(key: string, targets: readonly TypingTarget[]): CharacterResult {
    if (!/^[a-z]$/i.test(key)) return { kind: 'ignored' };

    const target = this.selectTarget(key, targets);
    if (!target) return { kind: 'incorrect', targetId: null, expected: null };

    const expected = target.word[target.progress]?.toLowerCase() ?? null;
    if (expected !== key.toLowerCase()) {
      return { kind: 'incorrect', targetId: target.id, expected };
    }

    const nextProgress = target.progress + 1;
    const completed = nextProgress >= target.word.length;
    if (completed) this.unlock();

    return { kind: 'correct', targetId: target.id, completed, nextProgress };
  }

  handleBackspace(targets: readonly TypingTarget[]): { targetId: number | null; nextProgress: number | null } {
    const target = targets.find((item) => item.id === this.state.lockedTargetId);
    if (!target) return { targetId: null, nextProgress: null };

    if (target.progress <= 0) {
      this.unlock();
      return { targetId: null, nextProgress: null };
    }

    return { targetId: target.id, nextProgress: target.progress - 1 };
  }

  removeTarget(targetId: number): void {
    if (this.state.lockedTargetId === targetId) this.unlock();
  }
}
