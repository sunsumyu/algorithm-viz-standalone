import { describe, it, expect } from 'vitest';
import { getSpecialKnapsackAnchor } from './knapsack-special-stage-codes';

// Registration happens at module import time via registry.register()
describe('knapsack-special-stage-codes', () => {
  const kinds = ['buying-hay', 'coins-from-piles'] as const;
  const stages = [1, 2, 3];

  describe('anchor compilation produces valid positive line numbers', () => {
    for (const kind of kinds) {
      for (const stage of stages) {
        it(`${kind} stage ${stage} has valid anchors`, () => {
          const target = getSpecialKnapsackAnchor(stage, kind, 'callRoot');
          expect(target).toBeDefined();
          expect(typeof target).toBe('object');

          const langs = ['java', 'cpp', 'python', 'javascript'] as const;
          for (const lang of langs) {
            const val = (target as any)[lang];
            expect(val).toBeGreaterThanOrEqual(1);
          }
        });
      }
    }
  });

  describe('different anchors produce distinct line numbers', () => {
    it('buying-hay stage 1 different anchors have different lines', () => {
      const t1 = getSpecialKnapsackAnchor(1, 'buying-hay', 'callRoot');
      const t2 = getSpecialKnapsackAnchor(1, 'buying-hay', 'baseCheckSatisfied');
      const langs = ['java', 'cpp', 'python', 'javascript'] as const;
      const hasDiff = langs.some(lang => (t1 as any)[lang] !== (t2 as any)[lang]);
      expect(hasDiff).toBe(true);
    });

    it('coins-from-piles stage 1 different anchors have different lines', () => {
      const t1 = getSpecialKnapsackAnchor(1, 'coins-from-piles', 'baseCheck');
      const t2 = getSpecialKnapsackAnchor(1, 'coins-from-piles', 'loopCoins');
      const langs = ['java', 'cpp', 'python', 'javascript'] as const;
      const hasDiff = langs.some(lang => (t1 as any)[lang] !== (t2 as any)[lang]);
      expect(hasDiff).toBe(true);
    });
  });
});
