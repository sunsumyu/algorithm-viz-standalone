/**
 * Class 038: 有序链表合并 (Merge Two Sorted Lists) — 步进推演编译器
 * 虚拟头节点 (Dummy) + 双指针贪心归并 / LeetCode 21
 */

import { LinkedList034Step } from './linked-list-034-038-shared';
import { MERGE_SORTED_LISTS_038_LINES } from './linked-list-034-038-stage-codes';

export interface MergeSortedLists038Step extends LinkedList034Step {
  l1: number[];
  l2: number[];
  merged: number[];
  curL1: number | null;
  curL2: number | null;
  phase: string;
}

export function buildMergeSortedLists038Steps(): MergeSortedLists038Step[] {
  const steps: MergeSortedLists038Step[] = [];
  const lines = MERGE_SORTED_LISTS_038_LINES;

  // Step 0: 入口帧
  steps.push({
    l1: [1, 2, 4],
    l2: [1, 3, 4],
    merged: [],
    curL1: 1,
    curL2: 1,
    phase: '初始化哨兵节点与双指针',
    decision: `主函数入口：开始合并两个升序单链表 L1: [1, 2, 4] 与 L2: [1, 3, 4]`,
    message: `创建虚拟哨兵 dummy = Node(0)，尾指针 cur 指向 dummy`,
    log: `enter mergeTwoLists: l1=[1,2,4], l2=[1,3,4]`,
    codeLine: lines.initDummy,
    metrics: { 'L1长度': 3, 'L2长度': 3 },
  });

  // Step 1: 比较 1 与 1，接入 L1 的 1
  steps.push({
    l1: [2, 4],
    l2: [1, 3, 4],
    merged: [1],
    curL1: 2,
    curL2: 1,
    phase: '接入 L1 的 1',
    decision: `比较 L1.val(1) <= L2.val(1)：贪心接入 L1 的 1，cur.next = L1；L1 前进一步`,
    message: `已合并结果更新为 [1]`,
    log: `merged 1 from l1: merged=[1]`,
    codeLine: lines.compareNodes,
    statusBadge: { text: '接入 L1[1]', type: 'info' },
    metrics: { '接入节点': 1, '来自': 'L1' },
  });

  // Step 2: 比较 2 与 1，接入 L2 的 1
  steps.push({
    l1: [2, 4],
    l2: [3, 4],
    merged: [1, 1],
    curL1: 2,
    curL2: 3,
    phase: '接入 L2 的 1',
    decision: `比较 L1.val(2) > L2.val(1)：接入 L2 的 1，cur.next = L2；L2 前进一步`,
    message: `已合并结果更新为 [1, 1]`,
    log: `merged 1 from l2: merged=[1, 1]`,
    codeLine: lines.compareNodes,
    statusBadge: { text: '接入 L2[1]', type: 'info' },
    metrics: { '接入节点': 1, '来自': 'L2' },
  });

  // Step 3: 比较 2 与 3，接入 L1 的 2
  steps.push({
    l1: [4],
    l2: [3, 4],
    merged: [1, 1, 2],
    curL1: 4,
    curL2: 3,
    phase: '接入 L1 的 2',
    decision: `比较 L1.val(2) <= L2.val(3)：接入 L1 的 2，cur.next = L1；L1 前进一步`,
    message: `已合并结果更新为 [1, 1, 2]`,
    log: `merged 2 from l1: merged=[1, 1, 2]`,
    codeLine: lines.compareNodes,
    statusBadge: { text: '接入 L1[2]', type: 'info' },
    metrics: { '接入节点': 2, '来自': 'L1' },
  });

  // Step 4: 比较 4 与 3，接入 L2 的 3
  steps.push({
    l1: [4],
    l2: [4],
    merged: [1, 1, 2, 3],
    curL1: 4,
    curL2: 4,
    phase: '接入 L2 的 3',
    decision: `比较 L1.val(4) > L2.val(3)：接入 L2 的 3，cur.next = L2；L2 前进一步`,
    message: `已合并结果更新为 [1, 1, 2, 3]`,
    log: `merged 3 from l2: merged=[1, 1, 2, 3]`,
    codeLine: lines.compareNodes,
    statusBadge: { text: '接入 L2[3]', type: 'info' },
    metrics: { '接入节点': 3, '来自': 'L2' },
  });

  // Step 5: 比较 4 与 4，接入 L1 的 4 并嫁接剩余
  steps.push({
    l1: [],
    l2: [],
    merged: [1, 1, 2, 3, 4, 4],
    curL1: null,
    curL2: null,
    phase: '嫁接剩余节点并返回 dummy.next',
    decision: `接入剩余节点 4 与 4：L1 耗尽，直接将 L2 剩余部分 O(1) 嫁接至尾部`,
    message: `最终返回 dummy.next，完成单链表有序合并`,
    log: `merge finished: result=[1, 1, 2, 3, 4, 4]`,
    codeLine: lines.appendRest,
    statusBadge: { text: '合并大功告成', type: 'success' },
    metrics: { '总长度': 6, '新头节点': 1 },
  });

  return steps;
}
