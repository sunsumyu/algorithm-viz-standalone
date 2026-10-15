// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildZigzagQueueSteps,
  buildZigzagStaticArraySteps,
  buildZigzagDfsSteps,
  buildZigzag036Steps,
} from './zigzag-level-order-036-renderer';
import { buildTreeFromArr } from '../tree-template';
import {
  ZIGZAG_STAGE1_CODE,
  ZIGZAG_STAGE2_STATIC_ARRAY_CODE,
  ZIGZAG_STAGE3_DFS_CODE,
} from './zigzag-level-order-036-stage-codes';

function assertCodeLineWithinBounds(codeLine: any, codes: Record<string, string[] | string>, desc: string) {
  if (!codeLine) return;
  for (const [lang, raw] of Object.entries(codes)) {
    const lines = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split('\n') : [];
    const count = lines.length;
    if (count === 0) continue;
    const target = typeof codeLine === 'object' && codeLine[lang] != null ? codeLine[lang] : codeLine;
    const nums = Array.isArray(target) ? target : typeof target === 'number' ? [target] : [];
    for (const num of nums) {
      expect(num, `${desc}: codeLine exceeds ${lang}`).toBeLessThanOrEqual(count);
      expect(num, `${desc}: codeLine < 1 for ${lang}`).toBeGreaterThanOrEqual(1);
    }
  }
}

describe('二叉树锯齿形层序遍历 (Zigzag Level Order · LeetCode 103)', () => {
  const sampleArr = [3, 9, 20, null, null, 15, 7];
  const fullArr = [1, 2, 3, 4, 5, 6, 7];

  it('1. 正确处理空树输入（Stage 1, 2, 3）', () => {
    const s1 = buildZigzagQueueSteps(null);
    expect(s1.length).toBe(2);
    expect(s1[s1.length - 1].result).toEqual([]);

    const s2 = buildZigzagStaticArraySteps(null);
    expect(s2.length).toBe(2);
    expect(s2[s2.length - 1].result).toEqual([]);

    const s3 = buildZigzagDfsSteps(null);
    expect(s3.length).toBe(2);
    expect(s3[s3.length - 1].result).toEqual([]);
  });

  describe('2. 核心推演结果与四语言行号合法性', () => {
    it('Stage 1 (Queue + Deque): 正确推导三层之字形结果 [[3], [20, 9], [15, 7]] 且行号合法', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildZigzagQueueSteps(root);
      expect(steps.length).toBeGreaterThan(6);

      const last = steps[steps.length - 1];
      expect(last.result).toEqual([[3], [20, 9], [15, 7]]);
      expect(last.decision).toContain('锯齿形层序遍历完成');

      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, ZIGZAG_STAGE1_CODE, `Stage 1 Step ${idx}`);
      });
    });

    it('Stage 1 (Queue + Deque): 满二叉树正确折返 [[1], [3, 2], [4, 5, 6, 7]]', () => {
      const root = buildTreeFromArr(fullArr);
      const steps = buildZigzagQueueSteps(root);
      const last = steps[steps.length - 1];
      expect(last.result).toEqual([[1], [3, 2], [4, 5, 6, 7]]);
    });

    it('Stage 2 (静态连续内存双指针): 正确推导三层之字形结果 [[3], [20, 9], [15, 7]] 且包含静态数组状态', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildZigzagStaticArraySteps(root);
      expect(steps.length).toBeGreaterThan(6);

      for (const step of steps) {
        expect(step.staticQueueState).toBeDefined();
      }

      const last = steps[steps.length - 1];
      expect(last.result).toEqual([[3], [20, 9], [15, 7]]);
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, ZIGZAG_STAGE2_STATIC_ARRAY_CODE, `Stage 2 Step ${idx}`);
      });
    });

    it('Stage 3 (递归 DFS 深度映射): 正确推导三层之字形结果 [[3], [20, 9], [15, 7]]', () => {
      const root = buildTreeFromArr(sampleArr);
      const steps = buildZigzagDfsSteps(root);
      expect(steps.length).toBeGreaterThan(6);

      const last = steps[steps.length - 1];
      expect(last.result).toEqual([[3], [20, 9], [15, 7]]);
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, ZIGZAG_STAGE3_DFS_CODE, `Stage 3 Step ${idx}`);
      });
    });
  });

  it('3. Legacy buildZigzag036Steps 兼容函数保持稳定', () => {
    const steps = buildZigzag036Steps();
    expect(steps.length).toBeGreaterThanOrEqual(5);
    expect(steps[steps.length - 1].decision).toContain('锯齿形层序遍历完成');
  });
});
