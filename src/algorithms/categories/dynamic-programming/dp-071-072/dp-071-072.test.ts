// @vitest-environment jsdom
/**
 * 左程云 Class 071 & 072: LIS 最长递增子序列及其高阶进阶专题单元测试套件
 * 涵盖：
 * 1. 最长递增子序列的个数 (LeetCode 673 · Class 071 Code02)
 * 2. 堆叠长方体的最大高度 (LeetCode 1691 · Class 072 Code01)
 * 3. 使数组 K 递增的最少操作次数 (LeetCode 2111 · Class 072 Code02)
 * 4. 双版本长处综合与别名统合 (LeetCode 300 / 354)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { algorithmRegistry } from '../../../../core/algorithm-registry';
import '../../../batch-dynamic-programming-index';
import '../../advanced-topics/hard-interview/russian-doll-envelopes-renderer';
import { buildNumberOfLis071Steps } from './number-of-lis-071-renderer';
import { buildStackingCuboids072Steps } from './stacking-cuboids-072-renderer';
import { buildKIncreasingArray072Steps } from './k-increasing-array-072-renderer';

describe('左程云 Class 071 & 072 LIS 与高阶进阶专题测试套件', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('1. 算法注册与别名统合 (Registry & Aliases)', () => {
    it('三道新算法全部成功注册到 algorithmRegistry', () => {
      const ids = ['number-of-lis', 'stacking-cuboids', 'k-increasing-array'];
      for (const id of ids) {
        const manifest = algorithmRegistry.getManifest(id);
        expect(manifest, `算法 ${id} 必须注册成功`).toBeDefined();
        expect(manifest?.name).toBeTruthy();
        expect(manifest?.category).toBe('dynamic-programming');
      }
    });

    it('最长递增子序列的个数 (LC 673) 别名正确映射', () => {
      const manifest = algorithmRegistry.getManifest('number-of-lis');
      expect(manifest?.aliases).toContain('class071-code02');
      expect(manifest?.aliases).toContain('number-of-lis-673');
      expect(manifest?.aliases).toContain('leetcode-673');
    });

    it('堆叠长方体的最大高度 (LC 1691) 别名正确映射', () => {
      const manifest = algorithmRegistry.getManifest('stacking-cuboids');
      expect(manifest?.aliases).toContain('class072-code01');
      expect(manifest?.aliases).toContain('stacking-cuboids-1691');
      expect(manifest?.aliases).toContain('leetcode-1691');
    });

    it('使数组 K 递增的最少操作次数 (LC 2111) 别名正确映射', () => {
      const manifest = algorithmRegistry.getManifest('k-increasing-array');
      expect(manifest?.aliases).toContain('class072-code02');
      expect(manifest?.aliases).toContain('k-increasing-array-2111');
      expect(manifest?.aliases).toContain('leetcode-2111');
    });

    it('既有算法统合：LIS (LC 300) 与 俄罗斯套娃信封 (LC 354) 别名正确注入', () => {
      const lis = algorithmRegistry.getManifest('longest-increasing-subsequence');
      expect(lis?.aliases).toContain('class071-code01');
      expect(lis?.aliases).toContain('leetcode-300');

      const doll = algorithmRegistry.getManifest('hard-russian-doll-envelopes');
      expect(doll?.aliases).toContain('class071-code03');
      expect(doll?.aliases).toContain('leetcode-354');
    });
  });

  describe('2. 最长递增子序列的个数 (Number of LIS) 计算与表现层验证', () => {
    it('经典分支用例 [1, 3, 5, 4, 7] 正确求解 (最长长度 4, 方案数 2)', () => {
      const steps = buildNumberOfLis071Steps([1, 3, 5, 4, 7]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.maxLen).toBe(4);
      expect(last.totalWays).toBe(2);
    });

    it('全等元素用例 [2, 2, 2, 2, 2] 正确求解 (最长长度 1, 方案数 5)', () => {
      const steps = buildNumberOfLis071Steps([2, 2, 2, 2, 2]);
      const last = steps[steps.length - 1];
      expect(last.maxLen).toBe(1);
      expect(last.totalWays).toBe(5);
    });

    it('单元素极端边界 [10] 正确返回 1', () => {
      const steps = buildNumberOfLis071Steps([10]);
      const last = steps[steps.length - 1];
      expect(last.maxLen).toBe(1);
      expect(last.totalWays).toBe(1);
    });

    it('DOM 契约：沙盘渲染无崩溃，无 [object Object]，无内部 h1~h6', () => {
      const manifest = algorithmRegistry.getManifest('number-of-lis');
      const visualizer = new (manifest!.Visualizer as any)(container);
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      expect(html).not.toMatch(/<h[1-6]/i);
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('3. 堆叠长方体的最大高度 (Stacking Cuboids) 计算与表现层验证', () => {
    it('标准用例 [[50,45,20],[95,37,53],[45,23,12]] 得到最大高度 190', () => {
      const steps = buildStackingCuboids072Steps([
        [50, 45, 20],
        [95, 37, 53],
        [45, 23, 12],
      ]);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.maxHeight).toBe(190);
    });

    it('互不相容用例 [[38,25,45],[76,35,3]] 得到最大单体高度 76', () => {
      const steps = buildStackingCuboids072Steps([
        [38, 25, 45],
        [76, 35, 3],
      ]);
      const last = steps[steps.length - 1];
      expect(last.maxHeight).toBe(76);
    });

    it('DOM 契约：沙盘渲染无崩溃，无 [object Object]，无内部 h1~h6', () => {
      const manifest = algorithmRegistry.getManifest('stacking-cuboids');
      const visualizer = new (manifest!.Visualizer as any)(container);
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      expect(html).not.toMatch(/<h[1-6]/i);
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('4. 使数组 K 递增的最少操作次数 (K-Increasing Array) 计算与表现层验证', () => {
    it('逆序数组 k=1 [5, 4, 3, 2, 1] 需修改 4 次', () => {
      const steps = buildKIncreasingArray072Steps([5, 4, 3, 2, 1], 1);
      const last = steps[steps.length - 1];
      expect(last.totalOps).toBe(4);
    });

    it('偶数奇数各自递增 k=2 [4, 1, 5, 2, 6, 2] 需修改 0 次', () => {
      const steps = buildKIncreasingArray072Steps([4, 1, 5, 2, 6, 2], 2);
      const last = steps[steps.length - 1];
      expect(last.totalOps).toBe(0);
    });

    it('包含相同元素非递减用例 [2, 2, 2, 2, 3, 3] k=1 需修改 0 次 (upper_bound 特性)', () => {
      const steps = buildKIncreasingArray072Steps([2, 2, 2, 2, 3, 3], 1);
      const last = steps[steps.length - 1];
      expect(last.totalOps).toBe(0);
    });

    it('DOM 契约：沙盘渲染无崩溃，无 [object Object]，无内部 h1~h6', () => {
      const manifest = algorithmRegistry.getManifest('k-increasing-array');
      const visualizer = new (manifest!.Visualizer as any)(container);
      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      expect(html).not.toMatch(/<h[1-6]/i);
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });
});
