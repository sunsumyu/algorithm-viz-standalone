import { describe, it, expect } from 'vitest';
import {
  buildMergeTreesDfsSteps,
  buildMergeTreesBfsSteps,
  buildMergeTreesSteps,
  parseTreeInput,
} from './merge-trees-renderer';
import {
  MERGE_TREES_STAGE1_CODES,
  MERGE_TREES_STAGE2_CODES,
} from './merge-trees-stage-codes';

function assertCodeLineWithinBounds(
  codeLine: any,
  codes: Record<string, string[] | string>,
  stepDesc: string
) {
  if (!codeLine) return;

  for (const [lang, rawCode] of Object.entries(codes)) {
    const lines = Array.isArray(rawCode)
      ? rawCode
      : typeof rawCode === 'string'
      ? rawCode.split('\n')
      : [];
    const lineCount = lines.length;
    if (lineCount === 0) continue;

    if (typeof codeLine === 'number') {
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} exceeds ${lang} line count ${lineCount}`
      ).toBeLessThanOrEqual(lineCount);
      expect(
        codeLine,
        `${stepDesc}: scalar codeLine ${codeLine} must be >= 1 for ${lang}`
      ).toBeGreaterThanOrEqual(1);
    } else if (Array.isArray(codeLine)) {
      for (const line of codeLine) {
        expect(
          line,
          `${stepDesc}: array codeLine ${line} exceeds ${lang} line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          line,
          `${stepDesc}: array codeLine ${line} must be >= 1 for ${lang}`
        ).toBeGreaterThanOrEqual(1);
      }
    } else if (typeof codeLine === 'object' && codeLine !== null) {
      const target = codeLine[lang];
      if (target != null) {
        expect(
          target,
          `${stepDesc}: dict codeLine[${lang}]=${target} exceeds line count ${lineCount}`
        ).toBeLessThanOrEqual(lineCount);
        expect(
          target,
          `${stepDesc}: dict codeLine[${lang}]=${target} must be >= 1`
        ).toBeGreaterThanOrEqual(1);
      }
    }
  }
}

describe('Merge Trees (合并二叉树 - LeetCode 617)', () => {
  describe('1. Stage 1: 递归 DFS 同步下潜', () => {
    it('标准案例合并：[1,3,2,5] + [2,1,3,null,4,null,7] 产生根节点为 3 的合并树', () => {
      const t1 = [1, 3, 2, 5];
      const t2 = [2, 1, 3, null, 4, null, 7];
      const steps = buildMergeTreesDfsSteps(t1, t2);

      expect(steps.length).toBeGreaterThan(6);

      const s0 = steps[0];
      expect(s0.opType).toBe('init');
      expect(s0.focus1).toBe(1);
      expect(s0.focus2).toBe(2);

      const sLast = steps[steps.length - 1];
      expect(sLast.opType).toBe('complete');
      expect(sLast.mergedTree).not.toBeNull();
      expect(sLast.mergedTree?.val).toBe(3);
      expect(sLast.mergedTree?.left?.val).toBe(4);
      expect(sLast.mergedTree?.right?.val).toBe(5);
      expect(sLast.mergedTree?.left?.left?.val).toBe(5);
      expect(sLast.mergedTree?.left?.right?.val).toBe(4);
      expect(sLast.mergedTree?.right?.right?.val).toBe(7);

      // 验证四语言行号合法性
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, MERGE_TREES_STAGE1_CODES, `DFS step ${idx}`);
      });
    });

    it('单侧空树：[1,2,3] + [] 直接继承树 1', () => {
      const steps = buildMergeTreesDfsSteps([1, 2, 3], []);
      const sLast = steps[steps.length - 1];
      expect(sLast.mergedTree?.val).toBe(1);
      expect(sLast.mergedTree?.left?.val).toBe(2);
      expect(sLast.mergedTree?.right?.val).toBe(3);
    });

    it('两树皆为空：[] + [] 合并结果为 null', () => {
      const steps = buildMergeTreesDfsSteps([], []);
      const sLast = steps[steps.length - 1];
      expect(sLast.mergedTree).toBeNull();
    });

    it('向后兼容别名函数 buildMergeTreesSteps 正常调用', () => {
      const steps = buildMergeTreesSteps([1], [2]);
      expect(steps[steps.length - 1].mergedTree?.val).toBe(3);
      expect(steps[steps.length - 1].tree?.val).toBe(3);
    });
  });

  describe('2. Stage 2: 迭代 BFS 队列同步合并', () => {
    it('标准案例合并产生与 DFS 一致的合并结果', () => {
      const t1 = [1, 3, 2, 5];
      const t2 = [2, 1, 3, null, 4, null, 7];
      const steps = buildMergeTreesBfsSteps(t1, t2);

      expect(steps.length).toBeGreaterThan(6);

      const s0 = steps[0];
      expect(s0.opType).toBe('init');

      const sLast = steps[steps.length - 1];
      expect(sLast.mergedTree?.val).toBe(3);
      expect(sLast.mergedTree?.left?.val).toBe(4);
      expect(sLast.mergedTree?.right?.val).toBe(5);
      expect(sLast.mergedTree?.left?.left?.val).toBe(5);
      expect(sLast.mergedTree?.left?.right?.val).toBe(4);
      expect(sLast.mergedTree?.right?.right?.val).toBe(7);

      // 验证四语言行号合法性
      steps.forEach((st, idx) => {
        assertCodeLineWithinBounds(st.codeLine, MERGE_TREES_STAGE2_CODES, `BFS step ${idx}`);
      });
    });

    it('一树为空时安全处理', () => {
      const steps1 = buildMergeTreesBfsSteps([], [5, 3]);
      expect(steps1[steps1.length - 1].mergedTree?.val).toBe(5);

      const steps2 = buildMergeTreesBfsSteps([8], []);
      expect(steps2[steps2.length - 1].mergedTree?.val).toBe(8);
    });
  });

  describe('3. parseTreeInput 鲁棒性', () => {
    it('能正确解析逗号、空格与 null 标记', () => {
      expect(parseTreeInput('1, 3, 2, null, 4', [])).toEqual([1, 3, 2, null, 4]);
      expect(parseTreeInput('[2, 1, #, 7]', [])).toEqual([2, 1, null, 7]);
      expect(parseTreeInput('', [1])).toEqual([]);
      expect(parseTreeInput(null, [1, 2])).toEqual([1, 2]);
    });
  });
});
