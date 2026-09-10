/**
 * Hard 18: 合并 K 个升序链表 (Merge k Sorted Lists)
 * LeetCode 23 (Hard) / 大厂压轴高频高精度数据结构题
 * 核心原语：小根堆 (Min-Heap / PriorityQueue) 维护 K 条链表头部最小值，O(N log K) 极致合并
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

export function generateMergeKListsSteps(initialLists: number[][]): MergeKListsStep[] {
  const steps: MergeKListsStep[] = [];
  const lists = initialLists.map(l => [...l]);
  const heap: HeapNode[] = [];
  const merged: number[] = [];

  const lines = {
    entry: 3,
    initHeap: 5,
    whileHeap: 14,
    pollMin: 15,
    appendTail: 16,
    pushNext: 18,
    returnAns: 22,
  };

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
        message: `堆内元素维持 $K$ 个以内，保证后续依然能 $O(1)$ 取极小值`,
        log: `Push next from list ${minNode.listId}: val=${nextVal}`,
        codeLine: lines.pushNext,
        statusBadge: { text: '后继入堆', type: 'info' },
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
  });

  return steps;
}

export function renderMergeKListsCanvas(container: HTMLElement, step: MergeKListsStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">小根堆堆顶极小值 (Heap Top)</div>
          <div style="font-size: 20px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${step.heap.length > 0 ? `${step.heap[0].val} (来自链表 ${step.heap[0].listId})` : '堆已空'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">已合并节点总数</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.merged.length} 个
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前出堆挂载节点</div>
          <div style="font-size: 18px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
            ${step.poppedNode ? `[ ${step.poppedNode.val} ] (链表 ${step.poppedNode.listId})` : '待提取'}
          </div>
        </div>
      </div>

      <!-- 主视图：各链表当前待选区 + 小根堆 + 已合并序列 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <!-- 各链表当前候选题板 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">待处理链表轨道 (Remaining Lists)</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${step.lists.map((nodes, idx) => `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; color: #94a3b8; width: 60px;">List ${idx}:</span>
                <div style="display: flex; gap: 4px; align-items: center;">
                  ${nodes.length === 0 ? '<span style="color: #64748b; font-size: 11px;">(已合并完毕)</span>' : ''}
                  ${nodes.map((v, i) => `
                    <div style="
                      width: 28px;
                      height: 28px;
                      background: ${i === 0 ? 'rgba(56, 189, 248, 0.2)' : '#1e293b'};
                      border: ${i === 0 ? '1px solid #38bdf8' : '1px solid #475569'};
                      color: #fff;
                      border-radius: 4px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 11px;
                      font-weight: bold;
                    ">${v}</div>
                    ${i < nodes.length - 1 ? '<span style="color: #64748b; font-size: 10px;">➔</span>' : ''}
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 小根堆状态展示 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">小根堆实时容量 (Min-Heap)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 40px;">
            ${step.heap.length === 0 ? '<span style="color: #64748b; font-size: 11px;">堆已空</span>' : ''}
            ${step.heap.map((item, idx) => `
              <div style="
                padding: 6px 12px;
                background: ${idx === 0 ? '#059669' : '#0284c7'};
                color: #fff;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                border: ${idx === 0 ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.1)'};
                box-shadow: ${idx === 0 ? '0 0 10px rgba(52,211,153,0.5)' : 'none'};
              ">
                ${item.val} <span style="font-size: 9px; opacity: 0.8;">[L${item.listId}]</span>
              </div>
            `).join('')}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
            绿色高亮项为堆顶最小元素，下一个出堆被采纳。
          </div>
        </div>
      </div>

      <!-- 已合并链表展示栏 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto;">
        <div style="font-size: 13px; font-weight: 600; color: #34d399; margin-bottom: 10px;">已生成的升序合并链表 (Merged Result List)</div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <div style="padding: 4px 8px; background: #334155; color: #94a3b8; border-radius: 4px; font-size: 11px;">dummy</div>
          <span style="color: #64748b;">➔</span>
          ${step.merged.map((val, idx) => `
            <div style="
              width: 32px;
              height: 32px;
              background: #065f46;
              border: 1px solid #34d399;
              color: #fff;
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

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '小根堆多路归并复杂度定理',
        '合并 K 个长度总和为 N 的升序链表：若两两合并需要 O(N · K)；而采用容量为 K 的小根堆，每次提取极小值并插入后继仅需 O(log K)，总时间复杂度被极致压制在 O(N log K)，是大厂海量外排序与多路归并的奠基核心算法！',
        step.decision,
        step.statusBadge
      )}
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
