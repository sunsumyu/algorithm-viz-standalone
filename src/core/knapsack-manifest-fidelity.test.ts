import { describe, it, expect, beforeAll } from 'vitest';
import { getManifest } from './registry';
import { loadAlgorithmBatch } from './algorithm-loader';

describe('🛡️ Knapsack 073 & 074 Manifest & Template Registration Fidelity', () => {
  const algoIds = [
    // 073 7 个算法
    'knapsack-01-standard',
    'buy-goods-discount',
    'target-sum-standard',
    'last-stone-weight-ii-standard',
    'dependent-knapsack-standard',
    'top-k-subsequence-sum',
    'find-kth-sum',
    // 074 6 个算法
    'partitioned-knapsack-standard',
    'coins-from-piles',
    'unbounded-knapsack-standard',
    'regex-matching',
    'wildcard-matching',
    'buying-hay-min-cost',
    // 075 5 个算法
    'bounded-knapsack-naive',
    'bounded-knapsack-binary',
    'cherry-blossom-viewing',
    'bounded-knapsack-monotonic-queue',
    'coins-change-kinds',
  ];

  beforeAll(async () => {
    // 动态加载 dynamic-programming 批次
    await loadAlgorithmBatch('dynamic-programming');
  });

  algoIds.forEach((id) => {
    it(`Algorithm [${id}] must be registered with valid template, viewId, and Visualizer`, () => {
      const manifest = getManifest(id);
      expect(manifest, `Manifest for ${id} should exist`).toBeDefined();
      expect(manifest!.id).toBe(id);
      expect(manifest!.viewId).toBe(`algo-${id}-view`);
      expect(manifest!.name).toBeTruthy();
      expect(typeof manifest!.template).toBe('string');
      expect(manifest!.template.length).toBeGreaterThan(50);
      // 验证 template 包含标准 4-Card 容器或 DOM 结构
      expect(manifest!.template).toContain('dsp-main-layout');
      expect(manifest!.template).toContain('dsp-sandbox-wrap');
      // 验证 Visualizer 构造函数已注入
      expect(typeof manifest!.Visualizer).toBe('function');
      const instance = new manifest!.Visualizer();
      expect(instance).toBeDefined();
    });
  });
});
