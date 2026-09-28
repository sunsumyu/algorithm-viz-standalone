// @vitest-environment jsdom
/**
 * 左程云 Class 076 & 077: 区间动态规划专题单元测试套件
 * 涵盖：
 * 1. 多边形三角剖分的最低得分 (LeetCode 1039 · Class 076 Code01)
 * 2. 预测赢家 / 纸牌博弈 (LeetCode 486 · Class 076 Code02)
 * 3. 戳气球 (LeetCode 312 · Class 076 Code03)
 * 4. 奇怪的打印机 (LeetCode 664 · Class 076 Code04)
 * 5. 合并石头的最低成本 (LeetCode 1000 · Class 077 Code01)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { algorithmRegistry } from '../../../core/algorithm-registry';
import '../../batch-dynamic-programming-index';
import { DpStepEngine } from './engine/dp-step-engine';
import './specs';

describe('左程云 Class 076 & 077 区间动态规划专题测试套件', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const ids = [
    'min-score-triangulation',
    'predict-the-winner',
    'burst-balloons',
    'strange-printer',
    'merge-stones',
  ];

  it('所有 5 个 Class 076/077 区间 DP 算法均已成功注册至 algorithmRegistry', () => {
    for (const id of ids) {
      const manifest = algorithmRegistry.getManifest(id);
      expect(manifest, `算法 ${id} 未能正确注册`).toBeDefined();
      expect(manifest?.name).toBeTruthy();
      expect(manifest?.aliases).toBeDefined();
      expect(manifest?.aliases?.length).toBeGreaterThan(0);
    }
  });

  describe('1. 多边形三角剖分的最低得分 (min-score-triangulation · LC 1039)', () => {
    it('别名必须包含 Class 076 与 LeetCode 1039', () => {
      const manifest = algorithmRegistry.getManifest('min-score-triangulation');
      expect(manifest?.aliases).toContain('class076-code01');
      expect(manifest?.aliases).toContain('min-score-triangulation-1039');
      expect(manifest?.aliases).toContain('leetcode-1039');
    });

    it('数学正确性：三角基础 [1, 2, 3] 得分为 6', () => {
      const steps = DpStepEngine.generateSteps('min-score-triangulation', { values: [1, 2, 3] });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.dp2d?.[0]?.[2]?.value).toBe(6);
    });

    it('Visualizer 挂载沙盘无崩溃，无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('min-score-triangulation');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') visualizer.dispose();
    });
  });

  describe('2. 预测赢家 / 纸牌博弈 (predict-the-winner · LC 486)', () => {
    it('别名必须包含 Class 076 与 LeetCode 486 与 cards-in-line', () => {
      const manifest = algorithmRegistry.getManifest('predict-the-winner');
      expect(manifest?.aliases).toContain('class076-code02');
      expect(manifest?.aliases).toContain('predict-the-winner-486');
      expect(manifest?.aliases).toContain('leetcode-486');
      expect(manifest?.aliases).toContain('cards-in-line');
    });

    it('数学正确性：[1, 5, 2] 先手必输 (净胜分 < 0)', () => {
      const steps = DpStepEngine.generateSteps('predict-the-winner', { nums: [1, 5, 2] });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(Number(last.dp2d?.[0]?.[2]?.value)).toBeLessThan(0);
    });

    it('Visualizer 挂载沙盘无崩溃，无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('predict-the-winner');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') visualizer.dispose();
    });
  });

  describe('3. 戳气球 (burst-balloons · LC 312)', () => {
    it('别名必须包含 Class 076 与 LeetCode 312', () => {
      const manifest = algorithmRegistry.getManifest('burst-balloons');
      expect(manifest?.aliases).toContain('class076-code03');
      expect(manifest?.aliases).toContain('burst-balloons-312');
      expect(manifest?.aliases).toContain('leetcode-312');
    });

    it('数学正确性：[3, 1, 5, 8] 最大收益为 167', () => {
      const steps = DpStepEngine.generateSteps('burst-balloons', { nums: [3, 1, 5, 8] });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.metrics?.maxCoins).toBe(167);
    });

    it('Visualizer 挂载沙盘无崩溃，无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('burst-balloons');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') visualizer.dispose();
    });
  });

  describe('4. 奇怪的打印机 (strange-printer · LC 664)', () => {
    it('别名必须包含 Class 076 与 LeetCode 664', () => {
      const manifest = algorithmRegistry.getManifest('strange-printer');
      expect(manifest?.aliases).toContain('class076-code04');
      expect(manifest?.aliases).toContain('strange-printer-664');
      expect(manifest?.aliases).toContain('leetcode-664');
    });

    it('数学正确性："aaabbb" 最少刷 2 次', () => {
      const steps = DpStepEngine.generateSteps('strange-printer', { s: 'aaabbb' });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.dp2d?.[0]?.[5]?.value).toBe(2);
    });

    it('Visualizer 挂载沙盘无崩溃，无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('strange-printer');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') visualizer.dispose();
    });
  });

  describe('5. 合并石头的最低成本 (merge-stones · LC 1000)', () => {
    it('别名必须包含 Class 077 与 LeetCode 1000', () => {
      const manifest = algorithmRegistry.getManifest('merge-stones');
      expect(manifest?.aliases).toContain('class077-code01');
      expect(manifest?.aliases).toContain('merge-stones-1000');
      expect(manifest?.aliases).toContain('leetcode-1000');
    });

    it('数学正确性：[3, 2, 4, 1] k=2 最低代价为 20', () => {
      const steps = DpStepEngine.generateSteps('merge-stones', { stones: [3, 2, 4, 1], k: 2 });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.dp2d?.[0]?.[3]?.value).toBe(20);
    });

    it('Visualizer 挂载沙盘无崩溃，无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('merge-stones');
      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') visualizer.dispose();
    });
  });
});
