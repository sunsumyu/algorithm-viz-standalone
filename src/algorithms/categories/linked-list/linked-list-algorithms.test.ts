import { describe, it, expect } from 'vitest';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import { buildReverseSteps, parseValues } from './reverse-linked-list-renderer';
import { REVERSE_LINKED_LIST_CODE_LANGUAGES } from './reverse-linked-list-problem-content';
import { buildRNSteps } from './remove-nth-from-end-renderer';
import { REMOVE_NTH_FROM_END_CODE_LANGUAGES } from './remove-nth-from-end-problem-content';
import { buildCycleSteps } from './linked-list-cycle-ii-renderer';
import { LINKED_LIST_CYCLE_II_CODE_LANGUAGES } from './linked-list-cycle-ii-problem-content';
import { buildIntersectionSteps } from './intersection-linked-list-renderer';
import { INTERSECTION_LINKED_LIST_CODE_LANGUAGES } from './intersection-linked-list-problem-content';
import { buildPresetSteps, LinkedListModel } from './design-linked-list-renderer';
import { DESIGN_LINKED_LIST_CODE_LANGUAGES } from './design-linked-list-problem-content';
import { buildMSASteps } from './merge-sorted-array-renderer';
import { MERGE_SORTED_ARRAY_CODE_LANGUAGES } from './merge-sorted-array-problem-content';
import { buildMoveZeroesSteps } from './move-zeroes-renderer';
import { MOVE_ZEROES_CODE_LANGUAGES } from './move-zeroes-problem-content';

function verifyStepsLineBounds(
  steps: Array<{ codeLine?: HighlightTarget }>,
  codeLanguages: Record<string, string[]>
) {
  const languages = ['java', 'cpp', 'python', 'javascript'] as const;
  for (const lang of languages) {
    const lines = codeLanguages[lang];
    expect(lines, `Missing language definition: ${lang}`).toBeDefined();
    const maxLine = lines.length;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.codeLine) continue;
      const target = step.codeLine;
      let lineNums: number[] = [];
      if (typeof target === 'number') {
        if (target > 0) lineNums = [target];
      } else if (Array.isArray(target)) {
        lineNums = target;
      } else if (typeof target === 'object' && target !== null) {
        const langVal = (target as Record<string, any>)[lang];
        if (typeof langVal === 'number') {
          if (langVal > 0) lineNums = [langVal];
        } else if (Array.isArray(langVal)) {
          lineNums = langVal;
        }
      }
      for (const line of lineNums) {
        expect(
          line,
          `Step ${i} codeLine ${line} exceeds ${lang} max line ${maxLine}`
        ).toBeLessThanOrEqual(maxLine);
        expect(line, `Step ${i} codeLine ${line} is less than 1`).toBeGreaterThanOrEqual(1);
      }
    }
  }
}

describe('Linked List Algorithms Step Generation (链表核心算法推导测试)', () => {
  describe('Reverse Linked List (反转链表)', () => {
    it('1. parseValues 正确解析逗号/空格分隔的数字字符串', () => {
      expect(parseValues('1, 2, 3, 4, 5')).toEqual([1, 2, 3, 4, 5]);
      expect(parseValues('10 20 30')).toEqual([10, 20, 30]);
      expect(parseValues('')).toEqual([1, 2, 3, 4, 5]);
    });

    it('2. 反转 [1, 2, 3] 正确将各节点 next 指向反转并验证多语言行号', () => {
      const steps = buildReverseSteps([1, 2, 3]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.reversedCount).toBe(3);
      // nextDir[0] 应为 -1 (指向 null), nextDir[1] 应为 0, nextDir[2] 应为 1
      expect(lastStep.nextDir[0]).toBe(-1);
      expect(lastStep.nextDir[1]).toBe(0);
      expect(lastStep.nextDir[2]).toBe(1);

      verifyStepsLineBounds(steps, REVERSE_LINKED_LIST_CODE_LANGUAGES);
    });
  });

  describe('Remove Nth Node From End (删除链表倒数第 N 个节点)', () => {
    it('3. 删除 [1, 2, 3, 4, 5] 倒数第 2 个节点 (即节点 4, 下标 3) 并验证行号', () => {
      const steps = buildRNSteps([1, 2, 3, 4, 5], 2);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.removedIndex).toBe(3); // 值为 4 的节点下标为 3
      expect(lastStep.values).toEqual([1, 2, 3, 5]);

      verifyStepsLineBounds(steps, REMOVE_NTH_FROM_END_CODE_LANGUAGES);
    });

    it('4. 删除头节点 (n=len) 正确处理 dummy 节点', () => {
      const steps = buildRNSteps([1, 2], 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.removedIndex).toBe(0); // 值为 1 的节点
      expect(lastStep.values).toEqual([2]);

      verifyStepsLineBounds(steps, REMOVE_NTH_FROM_END_CODE_LANGUAGES);
    });

    it('5. 非法 n 值安全返回错误提示', () => {
      const steps = buildRNSteps([1, 2], 5);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.message).toContain('输入不合法');
    });
  });

  describe('Linked List Cycle II (环形链表 II)', () => {
    it('6. 有环链表 [3, 2, 0, -4], pos=1 成功找到入环口下标 1 并验证多语言行号', () => {
      const steps = buildCycleSteps([3, 2, 0, -4], 1);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('done_entrance');
      expect(lastStep.entryIndex).toBe(1);
      expect(lastStep.message).toContain('入环起始节点');

      verifyStepsLineBounds(steps, LINKED_LIST_CYCLE_II_CODE_LANGUAGES);
    });

    it('7. 无环链表 pos=-1 正确判定为 no_cycle 并验证多语言行号', () => {
      const steps = buildCycleSteps([1, 2], -1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('no_cycle');
      expect(lastStep.message).toContain('无环');

      verifyStepsLineBounds(steps, LINKED_LIST_CYCLE_II_CODE_LANGUAGES);
    });
  });

  describe('Intersection of Two Linked Lists (相交链表)', () => {
    it('8. 相交链表测试能够找到公共交点并验证多语言行号', () => {
      const steps = buildIntersectionSteps(true);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(true);
      expect(lastStep.missed).toBe(false);
      expect(lastStep.message).toContain('相遇');

      verifyStepsLineBounds(steps, INTERSECTION_LINKED_LIST_CODE_LANGUAGES);
    });

    it('9. 不相交链表测试遍历到 null 结束并验证多语言行号', () => {
      const steps = buildIntersectionSteps(false);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(false);
      expect(lastStep.missed).toBe(true);
      expect(lastStep.message).toContain('无相交交点');

      verifyStepsLineBounds(steps, INTERSECTION_LINKED_LIST_CODE_LANGUAGES);
    });
  });

  describe('Design Linked List (设计链表)', () => {
    it('10. LinkedListModel 支持完整的 CRUD 操作', () => {
      const list = new LinkedListModel();
      expect(list.getSize()).toBe(0);
      expect(list.get(0)).toBe(-1);

      list.addAtHead(1);
      expect(list.values()).toEqual([1]);

      list.addAtTail(3);
      expect(list.values()).toEqual([1, 3]);

      list.addAtIndex(1, 2);
      expect(list.values()).toEqual([1, 2, 3]);
      expect(list.get(1)).toBe(2);

      list.deleteAtIndex(1);
      expect(list.values()).toEqual([1, 3]);
      expect(list.get(1)).toBe(3);
      expect(list.getSize()).toBe(2);
    });

    it('11. buildPresetSteps 生成规范的 LeetCode 707 经典用例步骤并验证多语言行号', () => {
      const steps = buildPresetSteps();
      expect(steps.length).toBe(7);
      expect(steps[0].op).toBe('init');
      expect(steps[steps.length - 1].op).toBe('get');
      expect(steps[steps.length - 1].ret).toBe(3);

      verifyStepsLineBounds(steps, DESIGN_LINKED_LIST_CODE_LANGUAGES);
    });
  });

  describe('Merge Sorted Array (合并两个有序数组)', () => {
    it('12. buildMSASteps 逆向三指针合并 [1, 2, 3, 0, 0, 0] 与 [2, 5, 6] 并验证多语言行号', () => {
      const steps = buildMSASteps([1, 2, 3], [2, 5, 6]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.nums1).toEqual([1, 2, 2, 3, 5, 6]);

      verifyStepsLineBounds(steps, MERGE_SORTED_ARRAY_CODE_LANGUAGES);
    });
  });

  describe('Move Zeroes (移动零)', () => {
    it('13. buildMoveZeroesSteps 快慢双指针原地移动 [0, 1, 0, 3, 12] 并验证多语言行号', () => {
      const steps = buildMoveZeroesSteps([0, 1, 0, 3, 12]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.nums).toEqual([1, 3, 12, 0, 0]);

      verifyStepsLineBounds(steps, MOVE_ZEROES_CODE_LANGUAGES);
    });
  });
});
