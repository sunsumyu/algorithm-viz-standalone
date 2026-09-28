// @vitest-environment jsdom
/**
 * 左程云 Class 063: 双向广搜与双向搜索（折半搜索）专题单元测试
 */

import { describe, it, expect } from 'vitest';
import { buildWordLadder063Steps } from './word-ladder-063-renderer';
import { buildSnacksWays063Steps } from './snacks-ways-buy-tickets-063-renderer';
import { buildClosestSubsequenceSum063Steps } from './closest-subsequence-sum-063-renderer';
import { buildPartitionMinDiff063Steps } from './partition-minimize-difference-063-renderer';
import { algorithmRegistry } from '../../../../core/algorithm-registry';
import './word-ladder-063-renderer';
import './snacks-ways-buy-tickets-063-renderer';
import './closest-subsequence-sum-063-renderer';
import './partition-minimize-difference-063-renderer';

describe('左程云 Class 063 算法专题全量测试', () => {
  describe('Code01: 单词接龙 (Word Ladder LeetCode 127)', () => {
    it('Step 0 入口帧必须纯净且携带合法 1-based 行号', () => {
      const steps = buildWordLadder063Steps('hit_to_cog');
      expect(steps.length).toBeGreaterThan(4);
      const step0 = steps[0];
      expect(step0.status).toBe('init');
      expect(typeof step0.line).toBe('number');
      expect(step0.line).toBeGreaterThanOrEqual(1);
      expect(step0.message).toContain('算法初始化');
    });

    it('标准用例 hit -> cog 应通过双向波前相遇求得最短长度 5', () => {
      const steps = buildWordLadder063Steps('hit_to_cog');
      const meetStep = steps.find((s) => s.status === 'meet');
      expect(meetStep).toBeDefined();
      expect(meetStep?.stepLen).toBe(5);
    });

    it('无解用例 unreachable 应返回 0', () => {
      const steps = buildWordLadder063Steps('unreachable');
      const last = steps[steps.length - 1];
      expect(last.stepLen).toBe(0);
      expect(last.status).toBe('done');
    });

    it('所有步进必须 100% 具备合法有效的代码行号', () => {
      const steps = buildWordLadder063Steps('hit_to_cog');
      for (const s of steps) {
        expect(typeof s.line).toBe('number');
        expect(s.line).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Code02: 牛牛的背包问题 (Snacks Ways 洛谷 P4799)', () => {
    it('标准用例 v=[1, 2, 4], w=10 所有子集和 <= 10，方案数应为 8', () => {
      const steps = buildSnacksWays063Steps('standard_3_snacks');
      expect(steps.length).toBeGreaterThan(5);
      const last = steps[steps.length - 1];
      expect(last.totalWays).toBe(8);
      expect(last.status).toBe('done');
    });

    it('紧缩容量用例 v=[3, 4, 2, 5], w=5 应正确二分求得 6 种放法', () => {
      // 满足 <= 5 的子集: 空(0), [2]=2, [3]=3, [4]=4, [5]=5, [3,2]=5 共 6 种
      const steps = buildSnacksWays063Steps('tight_capacity');
      const last = steps[steps.length - 1];
      expect(last.totalWays).toBe(6);
    });

    it('所有步进必须 100% 具备合法有效的代码行号', () => {
      const steps = buildSnacksWays063Steps('standard_3_snacks');
      for (const s of steps) {
        expect(typeof s.line).toBe('number');
        expect(s.line).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Code03: 最接近目标值的子序列和 (LeetCode 1755)', () => {
    it('例题一 [5, -7, 3, 5], 目标 6 应命中绝对差 0', () => {
      const steps = buildClosestSubsequenceSum063Steps('leetcode_example_1');
      const last = steps[steps.length - 1];
      expect(last.bestDiff).toBe(0);
    });

    it('全正数用例 [1, 2, 4, 8], 目标 11 应命中 1+2+8=11 差值 0', () => {
      const steps = buildClosestSubsequenceSum063Steps('positive_only');
      const last = steps[steps.length - 1];
      expect(last.bestDiff).toBe(0);
    });

    it('所有步进必须 100% 具备合法有效的代码行号', () => {
      const steps = buildClosestSubsequenceSum063Steps('leetcode_example_1');
      for (const s of steps) {
        expect(typeof s.line).toBe('number');
        expect(s.line).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Code04: 分割数组使数组差最小 (LeetCode 2035)', () => {
    it('例题一 [3, 9, 7, 3] 分割为两大小为 2 的子集，最小差应为 2', () => {
      // 子集 [3, 9]=12, [7, 3]=10, 差值 |12 - 10| = 2
      const steps = buildPartitionMinDiff063Steps('leetcode_example_1');
      const last = steps[steps.length - 1];
      expect(last.bestDiff).toBe(2);
    });

    it('对偶负数 [-36, 36] 分割为两大小为 1 的子集，最小差应为 72', () => {
      const steps = buildPartitionMinDiff063Steps('leetcode_example_2');
      const last = steps[steps.length - 1];
      expect(last.bestDiff).toBe(72);
    });

    it('所有步进必须 100% 具备合法有效的代码行号', () => {
      const steps = buildPartitionMinDiff063Steps('leetcode_example_1');
      for (const s of steps) {
        expect(typeof s.line).toBe('number');
        expect(s.line).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Class 063 声明式注册中心与表现层防红灯陷阱检验', () => {
    const ids = [
      'word-ladder-063',
      'snacks-ways-buy-tickets-063',
      'closest-subsequence-sum-063',
      'partition-minimize-difference-063',
    ];

    it('所有 4 个算法必须在 algorithmRegistry 成功注册', () => {
      for (const id of ids) {
        const manifest = algorithmRegistry.getManifest(id);
        expect(manifest, `算法 ${id} 未能正确注册`).toBeDefined();
        expect(manifest?.name).toBeTruthy();
        expect(manifest?.description).toContain('Class 063');
      }
    });

    it('所有 4 个算法 Card 1 自定义沙盘渲染绝不打印 [object Object] 或 NaN', () => {
      for (const id of ids) {
        const manifest = algorithmRegistry.getManifest(id);
        expect(manifest).toBeDefined();
        const container = document.createElement('div');
        const visualizer = new (manifest!.Visualizer as any)(container);
        expect(visualizer).toBeDefined();

        const html = container.innerHTML;
        expect(html).not.toContain('[object Object]');
        expect(html).not.toContain('NaN');
        expect(html).not.toContain('undefined');
        if (typeof visualizer?.dispose === 'function') {
          visualizer.dispose();
        }
      }
    });

    it('所有 4 个算法必须具备规范的 class063-codeXX 课号别名与权威题目别名', () => {
      const aliasMap: Record<string, string[]> = {
        'word-ladder-063': ['class063-code01', 'leetcode-127'],
        'snacks-ways-buy-tickets-063': ['class063-code02', 'luogu-p4799'],
        'closest-subsequence-sum-063': ['class063-code03', 'leetcode-1755'],
        'partition-minimize-difference-063': ['class063-code04', 'leetcode-2035'],
      };

      for (const [id, expectedAliases] of Object.entries(aliasMap)) {
        const manifest = algorithmRegistry.getManifest(id);
        expect(manifest).toBeDefined();
        for (const alias of expectedAliases) {
          expect(manifest?.aliases, `${id} 应包含别名 ${alias}`).toContain(alias);
        }
      }
    });
  });
});

