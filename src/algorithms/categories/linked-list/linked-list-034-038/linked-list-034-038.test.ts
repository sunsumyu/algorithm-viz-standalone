/**
 * 左神算法通关课 Class 034 ~ 038 经典链表高频与递归专题 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildReverseLinkedList034Steps } from './reverse-linked-list-034-renderer';
import { buildCopyRandomList035Steps } from './copy-random-list-035-renderer';
import { buildIntersectionList036Steps } from './intersection-linked-list-036-renderer';
import { buildReverseKGroup037Steps } from './reverse-k-group-037-renderer';
import { buildMergeSortedLists038Steps } from './merge-sorted-lists-038-renderer';
import {
  REVERSE_LINKED_LIST_034_CODES,
  COPY_RANDOM_LIST_035_CODES,
  INTERSECTION_LIST_036_CODES,
  REVERSE_K_GROUP_037_CODES,
  MERGE_SORTED_LISTS_038_CODES,
} from './linked-list-034-038-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神经典链表高频与递归专题 (Class 034 ~ 038) 综合测试套件', () => {
  // 1. Class 034: 单双链表反转
  describe('Class 034: 单双链表反转 (Reverse Linked List)', () => {
    it('三指针滑动正确反转链表，终局头节点为 pre=3', () => {
      const steps = buildReverseLinkedList034Steps();
      const last = steps[steps.length - 1];
      expect(last.pre).toBe(3);
      expect(last.cur).toBeNull();
      verify1BasedCodeLines(steps, REVERSE_LINKED_LIST_034_CODES);
    });
  });

  // 2. Class 035: 复杂链表的深拷贝
  describe('Class 035: 复杂链表的深拷贝 (Copy Random List)', () => {
    it('原地插桩与拆分还原，克隆链表节点数准确且 random 正确', () => {
      const steps = buildCopyRandomList035Steps();
      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(3);
      expect(last.nodes[0].isClone).toBe(true);
      expect(last.nodes[0].randomVal).toBe(3);
      verify1BasedCodeLines(steps, COPY_RANDOM_LIST_035_CODES);
    });
  });

  // 3. Class 036: 相交链表判定
  describe('Class 036: 相交链表与有环无环判定 (Intersection List)', () => {
    it('两无环链表对齐长度差，正确锁定相交节点 8', () => {
      const steps = buildIntersectionList036Steps();
      const last = steps[steps.length - 1];
      expect(last.intersectNode).toBe(8);
      verify1BasedCodeLines(steps, INTERSECTION_LIST_036_CODES);
    });
  });

  // 4. Class 037: K 个一组翻转链表
  describe('Class 037: K 个一组翻转链表 (Reverse Nodes in k-Group)', () => {
    it('K=2 翻转前两组，不足 K 的尾组保持原样', () => {
      const steps = buildReverseKGroup037Steps();
      const last = steps[steps.length - 1];
      expect(last.groups[0].nodes).toEqual([2, 1]);
      expect(last.groups[1].nodes).toEqual([4, 3]);
      expect(last.groups[2].nodes).toEqual([5]);
      verify1BasedCodeLines(steps, REVERSE_K_GROUP_037_CODES);
    });
  });

  // 5. Class 038: 有序链表合并
  describe('Class 038: 有序链表合并 (Merge Two Sorted Lists)', () => {
    it('双指针贪心合并，最终形成完整升序序列', () => {
      const steps = buildMergeSortedLists038Steps();
      const last = steps[steps.length - 1];
      expect(last.merged).toEqual([1, 1, 2, 3, 4, 4]);
      verify1BasedCodeLines(steps, MERGE_SORTED_LISTS_038_CODES);
    });
  });
});
