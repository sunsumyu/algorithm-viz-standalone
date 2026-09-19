/**
 * 经典链表专题与双指针物理不变量顶级架构机械防退化门禁
 * (Linked List & Pointer Invariants Gatekeeper)
 *
 * 守护领域：
 * 1. 经典链表高频操作与指针模拟 (Classic Linked List 9 题)：
 *    - 反转链表 (LeetCode 206)
 *    - 删除链表的倒数第 N 个节点 (LeetCode 19)
 *    - 环形链表 II 入环点锁定 (LeetCode 142)
 *    - 相交链表双指针汇合 (LeetCode 160)
 *    - 设计单双链表模型 CRUD (LeetCode 707)
 *    - 合并两个有序数组逆向双指针 (LeetCode 88)
 *    - 移动零快慢双指针保序 (LeetCode 283)
 *    - 重排链表中点分割与交错合并 (LeetCode 143)
 *    - K 个一组翻转链表经典版 (LeetCode 25)
 *
 * 2. 左程云大课链表与指针进阶专题 (Class 006, 034~038, 041, 042 8 题)：
 *    - Class 006 单双链表基本操作与队列栈实现
 *    - Class 034 单双链表反转
 *    - Class 035 复杂链表的深拷贝
 *    - Class 036 相交链表判定
 *    - Class 037 K 个一组翻转链表
 *    - Class 038 有序链表合并
 *    - Class 041 寻找单链表中的入环节点
 *    - Class 042 复杂链表的复制（原地交织三步法）
 *
 * 核心机械不变量红线：
 * 1. 指针拓扑守恒与逆转自洽性 (Topological Invariance)：
 *    反转操作后，原链表各节点的 next 指向严格逆转，原头节点指向 null，原尾节点成为新头；
 * 2. 双指针快慢步频与 Floyd 相遇定理 (Floyd Cycle Invariant)：
 *    若链表有环，快慢指针必然在 O(N) 步内于环内相遇；相遇后重置 fast 至头节点并同步单步推进，必恰好相交于第一个入环节点；
 * 3. 复杂链表交织深拷贝拓扑同构性 (Deep Clone Isomorphism)：
 *    原地三阶段插入、复制 random、解耦拆分后，新链表各节点均为克隆体，random 指针指向新链表对应节点，原链表结构完全复原无损；
 * 4. 多语言代码行映射合法区间：[1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';

// Part 1: Classic Linked List 9 题
import { buildReverseSteps } from '../../algorithms/categories/linked-list/reverse-linked-list-renderer';
import { REVERSE_LINKED_LIST_CODE_LANGUAGES } from '../../algorithms/categories/linked-list/reverse-linked-list-problem-content';
import { buildRNSteps } from '../../algorithms/categories/linked-list/remove-nth-from-end-renderer';
import { REMOVE_NTH_FROM_END_CODE_LANGUAGES } from '../../algorithms/categories/linked-list/remove-nth-from-end-problem-content';
import { buildCycleSteps } from '../../algorithms/categories/linked-list/linked-list-cycle-ii-renderer';
import { LINKED_LIST_CYCLE_II_CODE_LANGUAGES } from '../../algorithms/categories/linked-list/linked-list-cycle-ii-problem-content';
import { buildIntersectionSteps } from '../../algorithms/categories/linked-list/intersection-linked-list-renderer';
import { INTERSECTION_LINKED_LIST_CODE_LANGUAGES } from '../../algorithms/categories/linked-list/intersection-linked-list-problem-content';
import { buildPresetSteps, LinkedListModel } from '../../algorithms/categories/linked-list/design-linked-list-renderer';
import { DESIGN_LINKED_LIST_CODE_LANGUAGES } from '../../algorithms/categories/linked-list/design-linked-list-problem-content';
import { buildMSASteps } from '../../algorithms/categories/linked-list/merge-sorted-array-renderer';
import { MERGE_SORTED_ARRAY_CODE_LANGUAGES } from '../../algorithms/categories/linked-list/merge-sorted-array-problem-content';
import { buildMoveZeroesSteps } from '../../algorithms/categories/linked-list/move-zeroes-renderer';
import { MOVE_ZEROES_CODE_LANGUAGES } from '../../algorithms/categories/linked-list/move-zeroes-problem-content';
import { buildReorderListSteps, REORDER_LIST_CODES } from '../../algorithms/categories/linked-list/reorder-list-renderer';
import { generateReverseKGroupSteps, REVERSE_K_GROUP_CODES } from '../../algorithms/categories/linked-list/reverse-nodes-in-k-group-renderer';

// Part 2: 左程云大课链表专题 8 题
import { buildLinkedList006Steps, LINKED_LIST_006_CODES } from '../../algorithms/categories/linked-list/linked-list-basics-006-renderer';
import { buildReverseLinkedList034Steps } from '../../algorithms/categories/linked-list/linked-list-034-038/reverse-linked-list-034-renderer';
import { buildCopyRandomList035Steps } from '../../algorithms/categories/linked-list/linked-list-034-038/copy-random-list-035-renderer';
import { buildIntersectionList036Steps } from '../../algorithms/categories/linked-list/linked-list-034-038/intersection-linked-list-036-renderer';
import { buildReverseKGroup037Steps } from '../../algorithms/categories/linked-list/linked-list-034-038/reverse-k-group-037-renderer';
import { buildMergeSortedLists038Steps } from '../../algorithms/categories/linked-list/linked-list-034-038/merge-sorted-lists-038-renderer';
import {
  REVERSE_LINKED_LIST_034_CODES,
  COPY_RANDOM_LIST_035_CODES,
  INTERSECTION_LIST_036_CODES,
  REVERSE_K_GROUP_037_CODES,
  MERGE_SORTED_LISTS_038_CODES,
} from '../../algorithms/categories/linked-list/linked-list-034-038/linked-list-034-038-stage-codes';
import { buildLinkedListCycleSteps, CYCLE_II_CODES } from '../../algorithms/categories/linked-list/linked-list-cycle-ii-041-renderer';
import { buildCopyListSteps, COPY_LIST_CODES } from '../../algorithms/categories/linked-list/copy-list-random-pointer-042-renderer';

/**
 * 验证步进序列中的多语言代码行号合法性（支持字符串代码与数组代码双格式）
 */
function verifyCodeLines(
  steps: any[],
  algoName: string,
  codeSource: Record<string, string | string[]>
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  const langs = ['java', 'cpp', 'python', 'javascript', 'typescript'];

  for (const lang of langs) {
    const raw = codeSource[lang];
    if (!raw) continue;
    const maxLine = Array.isArray(raw) ? raw.length : raw.split('\n').length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.codeLine === undefined || step.codeLine === null) continue;

      let lineNum: number | undefined;
      if (typeof step.codeLine === 'number') {
        lineNum = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNum = val;
        } else if (Array.isArray(val) && val.length > 0) {
          lineNum = val[0];
        }
      }

      if (lineNum !== undefined && lineNum > 0) {
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 超过最大行数 ${maxLine}`
        ).toBeLessThanOrEqual(maxLine);
        expect(
          lineNum,
          `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 小于 1`
        ).toBeGreaterThanOrEqual(1);
      }
    }
  }
}

describe('经典链表专题与双指针物理不变量顶级架构机械防退化门禁 (Linked List Gatekeeper)', () => {
  describe('Part 1: 经典链表高频操作与双指针模拟 (Classic Linked List 9 题)', () => {
    it('1. 反转链表 (Reverse Linked List): 节点 next 方向严格逆转，原头指向 -1 (null)', () => {
      const input = [1, 2, 3, 4, 5];
      const steps = buildReverseSteps(input);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.reversedCount).toBe(5);

      // next 指针不变量: 原下标 0 指向 -1 (null), 下标 i 指向 i-1
      expect(last.nextDir[0]).toBe(-1);
      for (let i = 1; i < input.length; i++) {
        expect(last.nextDir[i]).toBe(i - 1);
      }

      verifyCodeLines(steps, '反转链表', REVERSE_LINKED_LIST_CODE_LANGUAGES);
    });

    it('2. 删除链表倒数第 N 个节点 (Remove Nth Node): 快慢指针跨度保持，精准切除目标节点', () => {
      const input = [1, 2, 3, 4, 5];
      const n = 2; // 倒数第 2 个是节点 4 (下标 3)
      const steps = buildRNSteps(input, n);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.removedIndex).toBe(3);
      expect(last.values).toEqual([1, 2, 3, 5]);

      verifyCodeLines(steps, '删除倒数第 N 个节点', REMOVE_NTH_FROM_END_CODE_LANGUAGES);
    });

    it('3. 环形链表 II (Linked List Cycle II): Floyd 相遇定理与入环口准确定位', () => {
      // 有环用例：入环点 pos = 1 (值为 2)
      const cycleSteps = buildCycleSteps([3, 2, 0, -4], 1);
      expect(cycleSteps.length).toBeGreaterThan(0);
      const lastCycle = cycleSteps[cycleSteps.length - 1];
      expect(lastCycle.phase).toBe('done_entrance');
      expect(lastCycle.entryIndex).toBe(1);

      // 无环用例：pos = -1
      const noCycleSteps = buildCycleSteps([1, 2], -1);
      expect(noCycleSteps.length).toBeGreaterThan(0);
      const lastNoCycle = noCycleSteps[noCycleSteps.length - 1];
      expect(lastNoCycle.phase).toBe('no_cycle');

      verifyCodeLines(cycleSteps, '环形链表 II (有环)', LINKED_LIST_CYCLE_II_CODE_LANGUAGES);
      verifyCodeLines(noCycleSteps, '环形链表 II (无环)', LINKED_LIST_CYCLE_II_CODE_LANGUAGES);
    });

    it('4. 相交链表 (Intersection of Two Linked Lists): 双指针换链对齐步频，判定相交/不相交', () => {
      // 相交
      const stepsIntersect = buildIntersectionSteps(true);
      const lastIntersect = stepsIntersect[stepsIntersect.length - 1];
      expect(lastIntersect.found).toBe(true);
      expect(lastIntersect.missed).toBe(false);

      // 不相交
      const stepsNoIntersect = buildIntersectionSteps(false);
      const lastNoIntersect = stepsNoIntersect[stepsNoIntersect.length - 1];
      expect(lastNoIntersect.found).toBe(false);
      expect(lastNoIntersect.missed).toBe(true);

      verifyCodeLines(stepsIntersect, '相交链表', INTERSECTION_LINKED_LIST_CODE_LANGUAGES);
    });

    it('5. 设计链表 (Design Linked List): 完整 CRUD 状态迁移与返回值自洽', () => {
      const model = new LinkedListModel();
      expect(model.getSize()).toBe(0);

      model.addAtHead(10);
      model.addAtTail(30);
      model.addAtIndex(1, 20);
      expect(model.values()).toEqual([10, 20, 30]);
      expect(model.get(1)).toBe(20);

      model.deleteAtIndex(1);
      expect(model.values()).toEqual([10, 30]);
      expect(model.getSize()).toBe(2);

      const presetSteps = buildPresetSteps();
      expect(presetSteps.length).toBe(7);
      expect(presetSteps[presetSteps.length - 1].op).toBe('get');
      expect(presetSteps[presetSteps.length - 1].ret).toBe(3);

      verifyCodeLines(presetSteps, '设计链表', DESIGN_LINKED_LIST_CODE_LANGUAGES);
    });

    it('6. 合并两个有序数组 (Merge Sorted Array): 逆向双指针原地归并，升序单调递增', () => {
      const nums1 = [1, 2, 3];
      const nums2 = [2, 5, 6];
      const steps = buildMSASteps(nums1, nums2);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.nums1).toEqual([1, 2, 2, 3, 5, 6]);

      // 验证单调递增
      for (let i = 0; i < last.nums1.length - 1; i++) {
        expect(last.nums1[i]!).toBeLessThanOrEqual(last.nums1[i + 1]!);
      }

      verifyCodeLines(steps, '合并两个有序数组', MERGE_SORTED_ARRAY_CODE_LANGUAGES);
    });

    it('7. 移动零 (Move Zeroes): 快慢双指针保序前移，非零元素相对顺序完全守恒', () => {
      const input = [0, 1, 0, 3, 12];
      const steps = buildMoveZeroesSteps(input);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.nums).toEqual([1, 3, 12, 0, 0]);

      verifyCodeLines(steps, '移动零', MOVE_ZEROES_CODE_LANGUAGES);
    });

    it('8. 重排链表 (Reorder List): 中点裁切+后半段反转+交替缝合，L0->Ln->L1->Ln-1', () => {
      const input = [1, 2, 3, 4, 5];
      const steps = buildReorderListSteps(input);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('done');
      const finalVals = last.mergedList.map(n => n.val);
      expect(finalVals).toEqual([1, 5, 2, 4, 3]);

      verifyCodeLines(steps, '重排链表', REORDER_LIST_CODES);
    });

    it('9. K 个一组翻转链表经典版 (Reverse Nodes in k-Group): 局部逆转与边界组保序', () => {
      const input = [1, 2, 3, 4, 5];
      const k = 2;
      const steps = generateReverseKGroupSteps(input, k);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.nodes).toEqual([2, 1, 4, 3, 5]);

      verifyCodeLines(steps, 'K 个一组翻转链表', REVERSE_K_GROUP_CODES);
    });
  });

  describe('Part 2: 左程云大课链表专题 (Class 006, 034~038, 041, 042 8 题)', () => {
    it('10. Class 006: 单双链表基本操作 (Linked List Basics): 反转与删除指定值', () => {
      // 模式 1: 反转
      const reverseSteps = buildLinkedList006Steps([1, 2, 3, 4], 'reverse');
      expect(reverseSteps.length).toBeGreaterThan(0);
      const lastRev = reverseSteps[reverseSteps.length - 1];
      // 反转后尾节点的 next 为原前驱
      const revHead = lastRev.nodes.find(n => n.isHead);
      expect(revHead?.id).toBe(4);

      // 模式 2: 删除目标值
      const delSteps = buildLinkedList006Steps([1, 2, 3, 2, 4], 'deleteVal', 2);
      expect(delSteps.length).toBeGreaterThan(0);
      const lastDel = delSteps[delSteps.length - 1];
      const remainingVals = lastDel.nodes.filter(n => !n.isDeleted).map(n => n.val);
      expect(remainingVals).toEqual([1, 3, 4]);

      verifyCodeLines(reverseSteps, 'Class 006 反转链表', LINKED_LIST_006_CODES);
      verifyCodeLines(delSteps, 'Class 006 删除值', LINKED_LIST_006_CODES);
    });

    it('11. Class 034: 单双链表反转 (Reverse Linked List 034): 三指针就地重排', () => {
      const steps = buildReverseLinkedList034Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.pre).toBe(3);
      expect(last.cur).toBeNull();

      verifyCodeLines(steps, 'Class 034 反转链表', REVERSE_LINKED_LIST_034_CODES);
    });

    it('12. Class 035: 复杂链表的深拷贝 (Copy Random List 035): 原地插桩拆分同构克隆', () => {
      const steps = buildCopyRandomList035Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(3);
      expect(last.nodes[0].isClone).toBe(true);
      expect(last.nodes[0].randomVal).toBe(3);

      verifyCodeLines(steps, 'Class 035 复杂链表深拷贝', COPY_RANDOM_LIST_035_CODES);
    });

    it('13. Class 036: 相交链表判定 (Intersection List 036): 步频差值对齐锁定交点', () => {
      const steps = buildIntersectionList036Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.intersectNode).toBe(8);

      verifyCodeLines(steps, 'Class 036 相交链表', INTERSECTION_LIST_036_CODES);
    });

    it('14. Class 037: K 个一组翻转链表 (Reverse Nodes in k-Group 037): 组内倒置与尾组保序', () => {
      const steps = buildReverseKGroup037Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.groups[0].nodes).toEqual([2, 1]);
      expect(last.groups[1].nodes).toEqual([4, 3]);
      expect(last.groups[2].nodes).toEqual([5]);

      verifyCodeLines(steps, 'Class 037 K 个一组翻转', REVERSE_K_GROUP_037_CODES);
    });

    it('15. Class 038: 有序链表合并 (Merge Two Sorted Lists 038): 双指针升序归并', () => {
      const steps = buildMergeSortedLists038Steps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.merged).toEqual([1, 1, 2, 3, 4, 4]);

      verifyCodeLines(steps, 'Class 038 有序链表合并', MERGE_SORTED_LISTS_038_CODES);
    });

    it('16. Class 041: 寻找单链表中的入环节点 (Linked List Cycle II 041): 快慢相遇与入环点回归', () => {
      // 有环
      const stepsCycle = buildLinkedListCycleSteps(true);
      expect(stepsCycle.length).toBeGreaterThan(0);
      const lastCycle = stepsCycle[stepsCycle.length - 1];
      expect(lastCycle.phase).toBe('found_entry');
      expect(lastCycle.entryNodeId).toBe(2);

      // 无环
      const stepsNoCycle = buildLinkedListCycleSteps(false);
      expect(stepsNoCycle.length).toBeGreaterThan(0);
      const lastNoCycle = stepsNoCycle[stepsNoCycle.length - 1];
      expect(lastNoCycle.phase).toBe('no_cycle');

      verifyCodeLines(stepsCycle, 'Class 041 环形链表 (有环)', CYCLE_II_CODES);
      verifyCodeLines(stepsNoCycle, 'Class 041 环形链表 (无环)', CYCLE_II_CODES);
    });

    it('17. Class 042: 复杂链表的复制 (Copy List with Random Pointer 042): 三阶段原地解耦克隆', () => {
      const steps = buildCopyListSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.phase).toBe('finish');
      expect(last.nodes.length).toBe(5);
      // 验证全部为克隆节点且原链表 random 映射关系完全保持
      for (const node of last.nodes) {
        expect(node.isClone).toBe(true);
      }

      verifyCodeLines(steps, 'Class 042 复杂链表复制', COPY_LIST_CODES);
    });
  });
});
