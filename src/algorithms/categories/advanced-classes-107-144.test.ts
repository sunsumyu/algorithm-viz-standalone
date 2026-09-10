import { describe, it, expect } from 'vitest';
import { buildTrieXorMaxSteps } from './tree/trie-xor-max-107-renderer';
import { buildValueSegTreeSteps } from './tree/tree-108-116/value-segment-tree-112-renderer';
import { buildLinearBasis132Steps } from './advanced-topics/advanced-124-134/linear-basis-132-renderer';
import { buildCrt141Steps } from './advanced-topics/advanced-134-140/crt-141-renderer';
import { buildLucas144Steps } from './advanced-topics/advanced-142-148/lucas-theorem-144-renderer';
import { algorithmRegistry } from '../../core/algorithm-registry';
import { loadAllAlgorithmBatches } from '../../core/algorithm-loader';

describe('Advanced Classes 107 ~ 144 Implementation & Integrity', () => {
  it('Class 107: Trie XOR Max should correctly compute max XOR of [3, 10, 5, 25, 2, 8]', () => {
    const steps = buildTrieXorMaxSteps([3, 10, 5, 25, 2, 8], 5);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.globalMaxXor).toBe(28); // 5 ^ 25 = 28
  });

  it('Class 112: Value Segment Tree should correctly query K-th smallest in dynamic set', () => {
    // 插入 [3, 1, 5, 2, 7, 3]，查询第 4 小的数应为 3 (排序后: 1, 2, 3, 3, 5, 7)
    const steps = buildValueSegTreeSteps([3, 1, 5, 2, 7, 3], 4, 8);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.foundVal).toBe(3);
  });

  it('Class 132: Linear Basis should correctly compute max XOR subset', () => {
    // [11, 9, 5, 7] -> 11 ^ 5 = 14 (四数均为奇数，偶数项组合最后一位必为0，最大异或和为 14)
    const steps = buildLinearBasis132Steps([11, 9, 5, 7], 5);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.maxXor).toBe(14);
  });

  it('Class 141: Chinese Remainder Theorem should solve Sun Tzu riddle', () => {
    // x = 2 (mod 3), x = 3 (mod 5), x = 2 (mod 7) -> 23
    const steps = buildCrt141Steps([3, 5, 7], [2, 3, 2]);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.finalAns).toBe(23);
  });

  it('Class 144: Lucas Theorem should calculate C(10, 3) mod 7 = 1', () => {
    // C(10, 3) = 120, 120 % 7 = 1
    const steps = buildLucas144Steps(10, 3, 7);
    expect(steps.length).toBeGreaterThan(0);
    const finalStep = steps[steps.length - 1];
    expect(finalStep.ans).toBe(1);
  });

  it('All 5 new advanced classes should be loadable through AlgorithmRegistry', async () => {
    await loadAllAlgorithmBatches();

    const classIds = [
      'trie-xor-max-107',
      'value-segment-tree-112',
      'linear-basis-132',
      'crt-141',
      'lucas-theorem-144',
    ];

    for (const id of classIds) {
      const algo = await algorithmRegistry.resolve(id);
      expect(algo).toBeDefined();
      expect(algo?.Visualizer).toBeDefined();
    }
  }, 30000);
});
