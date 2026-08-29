import { describe, it, expect } from 'vitest';
import { buildReverseSteps, parseValues } from './reverse-linked-list-renderer';
import { buildRNSteps } from './remove-nth-from-end-renderer';
import { buildCycleSteps } from './linked-list-cycle-ii-renderer';
import { buildIntersectionSteps } from './intersection-linked-list-renderer';
import { buildPresetSteps, LinkedListModel } from './design-linked-list-renderer';
import { buildMSASteps } from './merge-sorted-array-renderer';
import { buildMoveZeroesSteps } from './move-zeroes-renderer';

describe('Linked List Algorithms Step Generation (链表核心算法推导测试)', () => {
  describe('Reverse Linked List (反转链表)', () => {
    it('1. parseValues 正确解析逗号/空格分隔的数字字符串', () => {
      expect(parseValues('1, 2, 3, 4, 5')).toEqual([1, 2, 3, 4, 5]);
      expect(parseValues('10 20 30')).toEqual([10, 20, 30]);
      expect(parseValues('')).toEqual([1, 2, 3, 4, 5]);
    });

    it('2. 反转 [1, 2, 3] 正确将各节点 next 指向反转', () => {
      const steps = buildReverseSteps([1, 2, 3]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.reversedCount).toBe(3);
      // nextDir[0] 应为 -1 (指向 null), nextDir[1] 应为 0, nextDir[2] 应为 1
      expect(lastStep.nextDir[0]).toBe(-1);
      expect(lastStep.nextDir[1]).toBe(0);
      expect(lastStep.nextDir[2]).toBe(1);
    });
  });

  describe('Remove Nth Node From End (删除链表倒数第 N 个节点)', () => {
    it('3. 删除 [1, 2, 3, 4, 5] 倒数第 2 个节点 (即节点 4, 下标 3)', () => {
      const steps = buildRNSteps([1, 2, 3, 4, 5], 2);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.removedIndex).toBe(3); // 值为 4 的节点下标为 3
      expect(lastStep.values).toEqual([1, 2, 3, 5]);
    });

    it('4. 删除头节点 (n=len) 正确处理 dummy 节点', () => {
      const steps = buildRNSteps([1, 2], 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.removedIndex).toBe(0); // 值为 1 的节点
      expect(lastStep.values).toEqual([2]);
    });

    it('5. 非法 n 值安全返回错误提示', () => {
      const steps = buildRNSteps([1, 2], 5);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.message).toContain('输入不合法');
    });
  });

  describe('Linked List Cycle II (环形链表 II)', () => {
    it('6. 有环链表 [3, 2, 0, -4], pos=1 成功找到入环口下标 1', () => {
      const steps = buildCycleSteps([3, 2, 0, -4], 1);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('done_entrance');
      expect(lastStep.entryIndex).toBe(1);
      expect(lastStep.message).toContain('入环起始节点');
    });

    it('7. 无环链表 pos=-1 正确判定为 no_cycle', () => {
      const steps = buildCycleSteps([1, 2], -1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.phase).toBe('no_cycle');
      expect(lastStep.message).toContain('无环');
    });
  });

  describe('Intersection of Two Linked Lists (相交链表)', () => {
    it('8. 相交链表测试能够找到公共交点', () => {
      const steps = buildIntersectionSteps(true);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(true);
      expect(lastStep.missed).toBe(false);
      expect(lastStep.message).toContain('相遇');
    });

    it('9. 不相交链表测试遍历到 null 结束', () => {
      const steps = buildIntersectionSteps(false);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.found).toBe(false);
      expect(lastStep.missed).toBe(true);
      expect(lastStep.message).toContain('无相交交点');
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

    it('11. buildPresetSteps 生成规范的 LeetCode 707 经典用例步骤', () => {
      const steps = buildPresetSteps();
      expect(steps.length).toBe(7);
      expect(steps[0].op).toBe('init');
      expect(steps[steps.length - 1].op).toBe('get');
      expect(steps[steps.length - 1].ret).toBe(3);
    });
  });

  describe('Merge Sorted Array (合并两个有序数组)', () => {
    it('12. buildMSASteps 逆向三指针合并 [1, 2, 3, 0, 0, 0] 与 [2, 5, 6]', () => {
      const steps = buildMSASteps([1, 2, 3], [2, 5, 6]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.nums1).toEqual([1, 2, 2, 3, 5, 6]);
    });
  });

  describe('Move Zeroes (移动零)', () => {
    it('13. buildMoveZeroesSteps 快慢双指针原地移动 [0, 1, 0, 3, 12]', () => {
      const steps = buildMoveZeroesSteps([0, 1, 0, 3, 12]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.nums).toEqual([1, 3, 12, 0, 0]);
    });
  });
});
