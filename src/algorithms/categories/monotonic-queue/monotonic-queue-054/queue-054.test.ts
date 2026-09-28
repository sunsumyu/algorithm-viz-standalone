/**
 * Class 054: 单调队列·上 自动化测试套件
 * 覆盖 Code01, Code02, Code03 的 Step 生成器、逻辑正确性、1-based 代码行号与 DOM 契约
 */

import { describe, it, expect } from 'vitest';
import { buildSlidingWindowMaxSteps } from './sliding-window-max-054-renderer';
import { buildLongestSubarrayLimitSteps } from './longest-subarray-limit-054-renderer';
import { buildFallingWaterFlowerPotSteps } from './falling-water-flower-pot-054-renderer';
import { renderSlidingWindowBoard, renderLongestSubarrayLimitBoard, renderFallingWaterFlowerPotBoard } from './queue-054-shared';
import {
  CODE01_SLIDING_WINDOW_CODES,
  CODE02_LONGEST_SUBARRAY_CODES,
  CODE03_FLOWER_POT_CODES,
} from './queue-054-stage-codes';

function verifyLineBounds(steps: any[], codes: Record<string, string[]>, desc: string) {
  for (const step of steps) {
    if (!step.codeLine) continue;
    for (const [lang, line] of Object.entries(step.codeLine)) {
      if (typeof line !== 'number') continue;
      const codeList = codes[lang];
      expect(codeList, `${desc} 缺少语言 ${lang}`).toBeDefined();
      expect(line, `${desc} ${lang} 行号 ${line} 必须 >= 1`).toBeGreaterThanOrEqual(1);
      expect(line, `${desc} ${lang} 行号 ${line} 超出源码总行数 ${codeList.length}`).toBeLessThanOrEqual(codeList.length);
    }
  }
}

describe('Class 054: 单调队列·上 核心算法套件', () => {
  describe('Code01: 滑动窗口最大值 (LeetCode 239)', () => {
    it('标准用例 [1, 3, -1, -3, 5, 3, 6, 7], k=3 得到 [3, 3, 5, 5, 6, 7]', () => {
      const steps = buildSlidingWindowMaxSteps([1, 3, -1, -3, 5, 3, 6, 7], 3);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.ansList).toEqual([3, 3, 5, 5, 6, 7]);
      verifyLineBounds(steps, CODE01_SLIDING_WINDOW_CODES, 'Code01');
    });

    it('单调递减数组与 K=2', () => {
      const steps = buildSlidingWindowMaxSteps([9, 8, 7, 6], 2);
      const last = steps[steps.length - 1];
      expect(last.ansList).toEqual([9, 8, 7]);
    });

    it('沙盘渲染契约: 零 h1~h6, 零 [object Object]', () => {
      const steps = buildSlidingWindowMaxSteps();
      const html = renderSlidingWindowBoard(steps[2]);
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toContain('[object Object]');
      expect(html).toContain('单调双端队列');
    });
  });

  describe('Code02: 绝对差不超过限制的最长连续子数组 (LeetCode 1438)', () => {
    it('标准用例 [8, 2, 4, 7], limit=4 答案为 2', () => {
      const steps = buildLongestSubarrayLimitSteps([8, 2, 4, 7], 4);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.ansLen).toBe(2);
      verifyLineBounds(steps, CODE02_LONGEST_SUBARRAY_CODES, 'Code02');
    });

    it('用例 [10, 1, 2, 4, 7, 2], limit=5 答案为 4 ([1, 2, 4, 2] 或 [2, 4, 7, 2])', () => {
      const steps = buildLongestSubarrayLimitSteps([10, 1, 2, 4, 7, 2], 5);
      const last = steps[steps.length - 1];
      expect(last.ansLen).toBe(4);
    });

    it('全等元素用例 [4, 2, 2, 2, 4, 4, 2, 2], limit=0 答案为 3', () => {
      const steps = buildLongestSubarrayLimitSteps([4, 2, 2, 2, 4, 4, 2, 2], 0);
      const last = steps[steps.length - 1];
      expect(last.ansLen).toBe(3);
    });

    it('沙盘渲染契约: 零 h1~h6, 零 [object Object]', () => {
      const steps = buildLongestSubarrayLimitSteps();
      const html = renderLongestSubarrayLimitBoard(steps[1]);
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toContain('[object Object]');
      expect(html).toContain('maxDeque');
      expect(html).toContain('minDeque');
    });
  });

  describe('Code03: 接取落水的最小花盆 (洛谷 P2698 / USACO 2012 Mar Silver)', () => {
    it('洛谷样例 [(6,3), (2,4), (4,10), (10,15)], D=5 答案为 2 (覆盖 x=4 和 x=6)', () => {
      const pts: Array<[number, number]> = [
        [6, 3],
        [2, 4],
        [4, 10],
        [10, 15],
      ];
      const steps = buildFallingWaterFlowerPotSteps(pts, 5);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.bestW).toBe(2);
      verifyLineBounds(steps, CODE03_FLOWER_POT_CODES, 'Code03');
    });

    it('平缓落差用例 [(1,1), (3,2), (5,3)], D=4 无解返回 -1', () => {
      const pts: Array<[number, number]> = [
        [1, 1],
        [3, 2],
        [5, 3],
      ];
      const steps = buildFallingWaterFlowerPotSteps(pts, 4);
      const last = steps[steps.length - 1];
      expect(last.bestW).toBe(-1);
    });

    it('同点落水高差充分 [(5,1), (5,8), (9,12)], D=7 答案为 0', () => {
      const pts: Array<[number, number]> = [
        [5, 1],
        [5, 8],
        [9, 12],
      ];
      const steps = buildFallingWaterFlowerPotSteps(pts, 7);
      const last = steps[steps.length - 1];
      expect(last.bestW).toBe(0);
    });

    it('沙盘渲染契约: 零 h1~h6, 零 [object Object]', () => {
      const steps = buildFallingWaterFlowerPotSteps();
      const html = renderFallingWaterFlowerPotBoard(steps[1]);
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toContain('[object Object]');
      expect(html).toContain('花盆覆盖区间');
    });
  });

  describe('注册中心与别名统合门禁 (Class 054)', () => {
    it('全量算法与别名必须在 algorithmRegistry 中正确解析', async () => {
      const { algorithmRegistry } = await import('../../../../core/algorithm-registry');
      await import('../../../batch-38-index');

      const expectedMappings = [
        {
          id: 'sliding-window-max-054',
          aliases: [
            'class054-code01',
            'sliding-window-max',
            'sliding-window-maximum',
            'sliding-window-maximum-239',
            'leetcode-239',
            'monotonic-queue-basic-054',
          ],
        },
        {
          id: 'longest-subarray-limit-054',
          aliases: [
            'class054-code02',
            'longest-subarray-limit',
            'longest-subarray-limit-1438',
            'leetcode-1438',
            'valid-subarray-limit-055',
          ],
        },
        {
          id: 'falling-water-flower-pot-054',
          aliases: [
            'class054-code03',
            'falling-water-flowerpot',
            'falling-water-flower-pot',
            'luogu-p2698',
            'usaco-flowerpot',
            'falling-water-flowerpot-054',
          ],
        },
      ];

      for (const item of expectedMappings) {
        const manifest = algorithmRegistry.getManifest(item.id);
        expect(manifest, `Algorithm with id ${item.id} must be registered`).toBeDefined();
        for (const alias of item.aliases) {
          expect(manifest?.aliases).toContain(alias);
          const resolvedByAlias = algorithmRegistry.getManifest(alias);
          expect(resolvedByAlias?.id, `Alias ${alias} should resolve to ${item.id}`).toBe(item.id);
        }
      }
    });
  });
});
