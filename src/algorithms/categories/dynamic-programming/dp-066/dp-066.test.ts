// @vitest-environment jsdom
/**
 * 左程云算法通关课 Class 066: 从递归入手一维动态规划专题单元测试
 * 覆盖：
 * 1. 最低票价 (min-cost-tickets-066 · LeetCode 983)
 * 2. 解码方法 II (decode-ways-ii-066 · LeetCode 639)
 * 3. 丑数 II (ugly-number-ii-066 · LeetCode 264)
 * 4. 环绕字符串中唯一的子字符串 (unique-substrings-wraparound-066 · LeetCode 467)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { buildMinCostTickets066Steps } from './min-cost-tickets-066-renderer';
import { buildDecodeWaysII066Steps } from './decode-ways-ii-066-renderer';
import { buildUglyNumberII066Steps } from './ugly-number-ii-066-renderer';
import { buildUniqueSubstringsWraparound066Steps } from './unique-substrings-wraparound-066-renderer';
import { algorithmRegistry } from '../../../../core/algorithm-registry';
import '../../../batch-dynamic-programming-index';
import '../../advanced-topics/hard-interview/longest-valid-parentheses-renderer';
import './index';

describe('左程云 Class 066: 从递归入手一维动态规划专题测试', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('1. 最低票价 (min-cost-tickets-066)', () => {
    it('标准用例 (6个旅行日) 应该产生正确的 DP 递推步进', () => {
      const steps = buildMinCostTickets066Steps('standard');
      expect(steps.length).toBeGreaterThan(5);

      // Step 0: 必须是入口帧
      const s0 = steps[0];
      expect(s0.line).toBeGreaterThan(0);
      expect(s0.message).toContain('初始化');

      // 最后一帧必须得到正确答案 (days=[1,4,6,7,8,20], costs=[2,7,15], ans=11)
      const last = steps[steps.length - 1];
      expect(last.line).toBeGreaterThan(0);
      expect(last.dp[0]).toBe(11);
      expect(last.message).toContain('11');
    });

    it('所有步骤的 metrics 和 line 均合法，无 NaN', () => {
      const steps = buildMinCostTickets066Steps('dense_days');
      for (const step of steps) {
        expect(step.line).toBeGreaterThan(0);
        expect(step.message).not.toContain('NaN');
        expect(step.message).not.toContain('undefined');
        if (step.dp) {
          for (const val of step.dp) {
            expect(Number.isNaN(val)).toBe(false);
          }
        }
      }
    });

    it('Visualizer 挂载与沙盘渲染无崩溃且无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('min-cost-tickets-066');
      expect(manifest).toBeDefined();

      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      expect(html).not.toContain('undefined');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('2. 解码方法 II (decode-ways-ii-066)', () => {
    it('双字符通配符 "2*" 应该计算出 15 种解码方案', () => {
      const steps = buildDecodeWaysII066Steps('two_star');
      expect(steps.length).toBeGreaterThan(3);

      const s0 = steps[0];
      expect(s0.line).toBeGreaterThan(0);
      expect(s0.s).toBe('2*');

      const last = steps[steps.length - 1];
      expect(last.next1).toBe('15');
      expect(last.message).toContain('15');
    });

    it('连续通配符 "**" 应该计算出 96 种解码方案', () => {
      const steps = buildDecodeWaysII066Steps('star_star');
      const last = steps[steps.length - 1];
      expect(last.next1).toBe('96');
    });

    it('Visualizer 挂载与沙盘渲染无 [object Object]', () => {
      const manifest = algorithmRegistry.getManifest('decode-ways-ii-066');
      expect(manifest).toBeDefined();

      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('3. 丑数 II (ugly-number-ii-066)', () => {
    it('第 10 个丑数应该精确等于 12', () => {
      const steps = buildUglyNumberII066Steps('n_10');
      expect(steps.length).toBeGreaterThan(5);

      const s0 = steps[0];
      expect(s0.line).toBeGreaterThan(0);
      expect(s0.n).toBe(10);

      const last = steps[steps.length - 1];
      expect(last.currentUgly).toBe(12);
      expect(last.message).toContain('12');
    });

    it('边界情况 n=1 应该直接返回 1', () => {
      const steps = buildUglyNumberII066Steps('n_1');
      const last = steps[steps.length - 1];
      expect(last.currentUgly).toBe(1);
    });

    it('Visualizer 挂载与沙盘渲染无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('ugly-number-ii-066');
      expect(manifest).toBeDefined();

      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('4. 环绕字符串中唯一的子字符串 (unique-substrings-wraparound-066)', () => {
    it('"zab" 应该计算出 6 个唯一有效子串', () => {
      const steps = buildUniqueSubstringsWraparound066Steps('preset_zab');
      expect(steps.length).toBeGreaterThan(4);

      const s0 = steps[0];
      expect(s0.line).toBeGreaterThan(0);
      expect(s0.s).toBe('zab');

      const last = steps[steps.length - 1];
      expect(last.totalAns).toBe(6);
      expect(last.message).toContain('6');
    });

    it('"cac" 应该计算出 2 个唯一有效子串', () => {
      const steps = buildUniqueSubstringsWraparound066Steps('preset_cac');
      const last = steps[steps.length - 1];
      expect(last.totalAns).toBe(2);
    });

    it('Visualizer 挂载与沙盘渲染无崩溃', () => {
      const manifest = algorithmRegistry.getManifest('unique-substrings-wraparound-066');
      expect(manifest).toBeDefined();

      const visualizer = new (manifest!.Visualizer as any)(container);
      expect(visualizer).toBeDefined();

      const html = container.innerHTML;
      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('NaN');
      if (typeof visualizer?.dispose === 'function') {
        visualizer.dispose();
      }
    });
  });

  describe('5. Class 066 别名统合与唯一性核验', () => {
    it('三道已有算法的 Class 066 别名能够正确索引', () => {
      const fibo = algorithmRegistry.getManifest('fibonacci');
      expect(fibo?.aliases).toContain('fibonacci-066');

      const decode = algorithmRegistry.getManifest('decode-ways');
      expect(decode?.aliases).toContain('decode-ways-066');

      const paren = algorithmRegistry.getManifest('longest-valid-parentheses');
      expect(paren?.aliases).toContain('longest-valid-parentheses-066');
    });
  });
});
