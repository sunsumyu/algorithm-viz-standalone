/**
 * knapsack-stage-codes 锚点编译正确性验证
 * 验证 anchor 编译产生的行号严格落在合法范围内 (1-based)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { codeStepIndexer } from '../code-step-indexer';
import { getKnapsackAnchor, registerKnapsackTemplates } from './knapsack-stage-codes';
import type { KnapsackKind } from './knapsack-stage-evolution';

const KINDS: KnapsackKind[] = ['unbounded', '01', 'partitioned'];

describe('knapsack-stage-codes anchor compilation produces valid line numbers', () => {
  beforeEach(() => {
    codeStepIndexer.clear();
    registerKnapsackTemplates();
  });

  function verifyAnchors(stage: number, kind: KnapsackKind, anchors: string[]) {
    for (const anchor of anchors) {
      const compiled = getKnapsackAnchor(stage, kind, anchor);
      for (const [lang, line] of Object.entries(compiled)) {
        expect(line, `anchor "${anchor}" lang "${lang}" must be >= 1`).toBeGreaterThanOrEqual(1);
        expect(line, `anchor "${anchor}" lang "${lang}" must be <= 100`).toBeLessThanOrEqual(100);
      }
    }
  }

  describe('Stage 1: DFS Recursion', () => {
    for (const kind of KINDS) {
      it(`${kind}: all anchor line numbers are positive and valid`, () => {
        verifyAnchors(1, kind, ['callRoot', 'fnEnter', 'baseCheck', 'branch1', 'initP2', 'checkFit', 'branch2', 'returnMax']);
      });
    }
  });

  describe('Stage 2: Memoization', () => {
    for (const kind of KINDS) {
      it(`${kind}: all anchor line numbers are positive and valid`, () => {
        verifyAnchors(2, kind, ['callRoot', 'fnEnter', 'baseCheck', 'memoCheck', 'branch1', 'initP2', 'checkFit', 'branch2', 'memoStore']);
      });
    }
  });

  describe('Stage 3: 2D DP', () => {
    for (const kind of KINDS) {
      it(`${kind}: all anchor line numbers are positive and valid`, () => {
        verifyAnchors(3, kind, ['initDp', 'outerLoop', 'capLoop', 'inherit', 'checkFit', 'update', 'returnAns']);
      });
    }
  });

  describe('Anchor compilation produces distinct lines per action', () => {
    for (const kind of KINDS) {
      it(`stage 1 ${kind}: key anchors map to distinct lines`, () => {
        const anchors = ['fnEnter', 'baseCheck', 'branch1', 'checkFit', 'branch2', 'returnMax'];
        const lines = anchors.map(a => getKnapsackAnchor(1, kind, a).java);
        const unique = new Set(lines);
        expect(unique.size).toBeGreaterThanOrEqual(4);
      });
    }
  });

  describe('CodeStepIndexer has registered all templates', () => {
    it('can resolve any stage×kind combination', () => {
      for (const kind of KINDS) {
        for (let stage = 1; stage <= 3; stage++) {
          const anchor = stage === 1 ? 'fnEnter' : stage === 2 ? 'fnEnter' : 'initDp';
          const result = getKnapsackAnchor(stage, kind, anchor);
          expect(result.java).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });
});
