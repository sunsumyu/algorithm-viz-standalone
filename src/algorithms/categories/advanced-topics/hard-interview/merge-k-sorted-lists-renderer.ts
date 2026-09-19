/**
 * Hard 18: 合并 K 个升序链表 (Merge k Sorted Lists)
 * LeetCode 23 (Hard) / 大厂压轴高频高精度数据结构题
 * 核心原语：小根堆 (Min-Heap / PriorityQueue) 维护 K 条链表头部最小值，O(N log K) 极致合并
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

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

export function renderMergeKListsCanvas(container: HTMLElement, step: MergeKListsStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; padding: 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 主视图：各链表当前待选区 + 小根堆 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; flex: 1; min-height: 0;">
        <!-- 各链表当前候选题板 -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; overflow-y: auto;">
          <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>待处理链表轨道 (Remaining Lists)</span>
            <span style="font-size: 11px; color: #94a3b8;">共 ${step.lists.length} 条</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${step.lists.map((nodes, idx) => `
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(30, 41, 59, 0.3); padding: 6px 10px; border-radius: 6px;">
                <span style="font-size: 11px; color: #94a3b8; width: 50px; font-weight: 600;">L${idx}:</span>
                <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
                  ${nodes.length === 0 ? '<span style="color: #64748b; font-size: 11px;">(全部节点已并入)</span>' : ''}
                  ${nodes.map((v, i) => `
                    <div style="
                      width: 28px;
                      height: 28px;
                      background: ${i === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)'};
                      border: ${i === 0 ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)'};
                      color: ${i === 0 ? '#38bdf8' : '#e2e8f0'};
                      border-radius: 4px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 12px;
                      font-weight: 700;
                    ">${v}</div>
                    ${i < nodes.length - 1 ? '<span style="color: #64748b; font-size: 10px;">➔</span>' : ''}
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 小根堆状态展示 -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>小根堆优先队列 (Min-Heap)</span>
            <span style="font-size: 11px; color: #10b981; font-weight: 600;">堆顶最小优先</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 48px; background: rgba(30, 41, 59, 0.25); padding: 12px; border-radius: 6px;">
            ${step.heap.length === 0 ? '<span style="color: #64748b; font-size: 12px;">堆已空</span>' : ''}
            ${step.heap.map((item, idx) => `
              <div style="
                padding: 6px 12px;
                background: ${idx === 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(2, 132, 199, 0.25)'};
                color: ${idx === 0 ? '#34d399' : '#38bdf8'};
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
                border: ${idx === 0 ? '1.5px solid #34d399' : '1px solid rgba(56, 189, 248, 0.4)'};
                box-shadow: ${idx === 0 ? '0 0 10px rgba(52,211,153,0.35)' : 'none'};
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                ${idx === 0 ? '👑' : ''}<span>${item.val}</span> <span style="font-size: 10px; opacity: 0.75;">[L${item.listId}]</span>
              </div>
            `).join('')}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 10px; line-height: 1.5;">
            👑 高亮项为堆顶最小元，下一步 <code style="color: #38bdf8;">poll()</code> 出堆挂载至合并链表尾部。
          </div>
        </div>
      </div>

      <!-- 已合并链表展示栏 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px; overflow-x: auto;">
        <div style="font-size: 12px; font-weight: 600; color: #34d399; margin-bottom: 8px;">已生成的升序合并链表 (Merged Result List)</div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <div style="padding: 4px 8px; background: rgba(51, 65, 85, 0.6); color: #94a3b8; border-radius: 4px; font-size: 11px; font-weight: bold;">dummy</div>
          <span style="color: #64748b;">➔</span>
          ${step.merged.length === 0 ? '<span style="color: #64748b; font-size: 11px;">(待合并首元)</span>' : ''}
          ${step.merged.map((val, idx) => `
            <div style="
              width: 32px;
              height: 32px;
              background: rgba(16, 185, 129, 0.2);
              border: 1px solid #34d399;
              color: #ecfdf5;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
            ">${val}</div>
            ${idx < step.merged.length - 1 ? '<span style="color: #34d399; font-size: 12px;">➔</span>' : ''}
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export const mergeKSortedListsVisualizer = registerDeclarativeAlgorithm<MergeKListsStep>({
  id: 'merge-k-sorted-lists',
  name: 'Hard 18: 合并 K 个升序链表 (Merge k Sorted Lists)',
  category: 'heap',
  icon: '🔗',
  difficulty: 3,
  levelOrder: 18,
  learningGoal: '掌握小根堆多路归并算法模型，理解 O(N log K) 复杂度证明与多路数据流并发合并思想',
  metrics: [
    { id: 'heapTop', label: '小根堆堆顶 (Heap Top)', color: 'emerald' },
    { id: 'mergedCount', label: '已合并节点 (Merged)', color: 'blue' },
    { id: 'poppedNode', label: '出堆采纳节点 (Popped)', color: 'amber' },
    { id: 'heapSize', label: '堆当前容量 (Heap Size)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 23 - Hard)</h3>
      <p>给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。</p>
      <ul>
        <li><strong>最优解法</strong>：构建大小为 $K$ 的优先队列（小根堆），堆顶永远是当前所有未合并节点中的全局最小值。</li>
        <li><strong>复杂度</strong>：时间复杂度严格 $O(N \log K)$，空间复杂度 $O(K)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: MERGE_K_LISTS_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设链表组合',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准三链表: [1,4,5], [1,3,4], [2,6]', value: 'standard' },
        { label: '四路密集链表: [2,8], [1,9,11], [3,5,7], [4,6]', value: 'four_lists' },
      ],
    },
  ],
  generateSteps: (input) => {
    const sc = input.scenario || 'standard';
    let lists: number[][];
    if (sc === 'four_lists') {
      lists = [[2, 8], [1, 9, 11], [3, 5, 7], [4, 6]];
    } else {
      lists = [[1, 4, 5], [1, 3, 4], [2, 6]];
    }
    return generateMergeKListsSteps(lists);
  },
  renderCanvas: (container, step) => {
    renderMergeKListsCanvas(container, step);
  },
});
