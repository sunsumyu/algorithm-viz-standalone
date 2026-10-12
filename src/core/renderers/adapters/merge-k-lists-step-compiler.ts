/**
 * 合并 K 个升序链表 (LeetCode 23 / 大厂压轴高频题)
 * Step Compiler: 小根堆 (PriorityQueue) 维护各链表当前头节点，O(N log K) 归并推演编译器
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface HeapNode {
  listId: number;
  val: number;
}

export interface MergeKListsStep extends StepBase {
  stepIndex?: number;
  lists: number[][]; // 当前各个链表剩余的节点
  heap: HeapNode[];
  merged: number[];
  poppedNode: HeapNode | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const MERGE_K_LISTS_CODES = {
  java: `public class MergeKSortedLists {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists == null || lists.length == 0) return null;
        // 小根堆维护各链表当前头节点
        PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode head : lists) {
            if (head != null) heap.offer(head);
        }

        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (!heap.isEmpty()) {
            ListNode minNode = heap.poll(); // 弹出全局最小值
            tail.next = minNode;
            tail = tail.next;
            if (minNode.next != null) {
                heap.offer(minNode.next); // 推进该链表的下一个节点
            }
        }
        return dummy.next;
    }
}`,
  cpp: `struct Compare {
    bool operator()(ListNode* a, ListNode* b) { return a->val > b->val; }
};

class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        priority_queue<ListNode*, vector<ListNode*>, Compare> heap;
        for (auto head : lists) {
            if (head) heap.push(head);
        }
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (!heap.empty()) {
            auto node = heap.top();
            heap.pop();
            tail->next = node;
            tail = tail->next;
            if (node->next) heap.push(node->next);
        }
        return dummy.next;
    }
};`,
  python: `import heapq

class Solution:
    def mergeKLists(self, lists: list) -> list:
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))

        dummy = ListNode(0)
        tail = dummy

        while heap:
            val, i, node = heapq.heappop(heap)
            tail.next = node
            tail = tail.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))

        return dummy.next`,
  typescript: `function mergeKLists(lists: number[][]): number[] {
    // 采用小根堆贪心模拟合并
    const heads = lists.map(l => [...l]);
    const merged: number[] = [];
    while (true) {
        let minVal = Infinity, minIdx = -1;
        for (let i = 0; i < heads.length; i++) {
            if (heads[i].length > 0 && heads[i][0] < minVal) {
                minVal = heads[i][0];
                minIdx = i;
            }
        }
        if (minIdx === -1) break;
        merged.push(heads[minIdx].shift()!);
    }
    return merged;
}`
};

export const MERGE_K_LISTS_CODE_LINES = {
  entry: { java: 3, cpp: 3, python: 2, typescript: 1 },
  initHeap: { java: 5, cpp: 6, python: 5, typescript: 3 },
  whileHeap: { java: 14, cpp: 14, python: 13, typescript: 5 },
  pollMin: { java: 15, cpp: 15, python: 14, typescript: 6 },
  appendTail: { java: 16, cpp: 16, python: 15, typescript: 14 },
  pushNext: { java: 18, cpp: 18, python: 18, typescript: 14 },
  returnAns: { java: 22, cpp: 22, python: 20, typescript: 16 },
};

export function generateMergeKListsSteps(initialLists: number[][]): MergeKListsStep[] {
  const steps: MergeKListsStep[] = [];
  const lists = initialLists.map(l => [...l]);
  const heap: HeapNode[] = [];
  const merged: number[] = [];
  const totalNodes = initialLists.reduce((sum, l) => sum + l.length, 0);

  const lines = MERGE_K_LISTS_CODE_LINES;

  const makeMetrics = (popped: HeapNode | null = null, topOverride?: string) => ({
    heapTop: topOverride ?? (heap.length > 0 ? `${heap[0].val} (L${heap[0].listId})` : '堆已空'),
    mergedCount: `${merged.length} / ${totalNodes}`,
    poppedNode: popped ? `${popped.val} (L${popped.listId})` : '无',
    heapSize: `${heap.length} / ${initialLists.length}`,
  });
  const currentAns = () => (merged.length > 0 ? `[${merged.join(', ')}]` : '-');

  // Step 0: 入口
  steps.push({
    lists: lists.map(l => [...l]),
    heap: [],
    merged: [],
    poppedNode: null,
    decision: `启动合并 ${initialLists.length} 个升序链表`,
    message: '利用小根堆维护每条链表的当前首元，每次提取全局最小只需 O(log K)',
    log: `Init merge k lists with ${initialLists.length} lists`,
    codeLine: lines.entry,
    statusBadge: { text: '算法启动', type: 'info' },
    metrics: makeMetrics(null, '待初始化'),
    ans: currentAns(),
  });

  // 初始化堆：将各链表头节点推入堆
  for (let i = 0; i < lists.length; i++) {
    if (lists[i].length > 0) {
      const val = lists[i].shift()!;
      heap.push({ listId: i, val });
      heap.sort((a, b) => a.val - b.val); // 保持小根堆排序

      steps.push({
        lists: lists.map(l => [...l]),
        heap: [...heap],
        merged: [],
        poppedNode: null,
        decision: `链表 [${i}] 首节点 (${val}) 压入小根堆`,
        message: `小根堆当前规模 ${heap.length}，堆顶元素为 ${heap[0].val}`,
        log: `Push head from list ${i}: val=${val}`,
        codeLine: lines.initHeap,
        statusBadge: { text: '头节点入堆', type: 'info' },
        metrics: makeMetrics(),
        ans: currentAns(),
      });
    }
  }

  // 循环抽取与推进
  while (heap.length > 0) {
    const minNode = heap.shift()!;
    merged.push(minNode.val);

    steps.push({
      lists: lists.map(l => [...l]),
      heap: [...heap],
      merged: [...merged],
      poppedNode: minNode,
      decision: `弹出堆顶最小值 (${minNode.val}) [来自链表 ${minNode.listId}]，追加至合并链表`,
      message: `已合并序列长度更新为 ${merged.length}，尾节点值为 ${minNode.val}`,
      log: `Poll minNode: val=${minNode.val}, listId=${minNode.listId}`,
      codeLine: lines.appendTail,
      statusBadge: { text: `追加 ${minNode.val}`, type: 'success' },
      metrics: makeMetrics(minNode),
      ans: currentAns(),
    });

    // 若该链表还有下一个节点，推入小根堆
    if (lists[minNode.listId].length > 0) {
      const nextVal = lists[minNode.listId].shift()!;
      heap.push({ listId: minNode.listId, val: nextVal });
      heap.sort((a, b) => a.val - b.val);

      steps.push({
        lists: lists.map(l => [...l]),
        heap: [...heap],
        merged: [...merged],
        poppedNode: null,
        decision: `链表 [${minNode.listId}] 的下一个节点 (${nextVal}) 补充压入小根堆`,
        message: `堆内元素维持 K 个以内，保证后续依然能 O(1) 取极小值`,
        log: `Push next from list ${minNode.listId}: val=${nextVal}`,
        codeLine: lines.pushNext,
        statusBadge: { text: '后继入堆', type: 'info' },
        metrics: makeMetrics(),
        ans: currentAns(),
      });
    }
  }

  // 收尾
  steps.push({
    lists: lists.map(l => [...l]),
    heap: [],
    merged: [...merged],
    poppedNode: null,
    decision: `🎉 全部链表合并完毕！完整升序序列: [${merged.join(', ')}]`,
    message: `总耗时严格 O(N log K)，空间复杂度仅需 O(K) 堆额外内存`,
    log: 'All k lists merged successfully.',
    codeLine: lines.returnAns,
    statusBadge: { text: '合并圆满', type: 'success' },
    metrics: makeMetrics(null, '已排空'),
    ans: currentAns(),
  });

  return steps;
}
