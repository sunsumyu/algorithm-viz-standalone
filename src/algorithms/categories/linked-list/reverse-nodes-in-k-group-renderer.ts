/**
 * Hard 21: K 个一组翻转链表 (Reverse Nodes in k-Group)
 * LeetCode 25 (Hard) / 大厂面试压轴高频链表指针模拟之神
 * 核心原语：k 节点预探查 + 局部区间就地反转 + 前驱后继无缝缝合，O(N) 时间 O(1) 空间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface KGroupStep extends StepBase {
  stepIndex?: number;
  nodes: number[];
  k: number;
  groupRange: [number, number] | null; // 当前正在操作的组在 nodes 中的下标区间
  isReversed: boolean;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
  isAccepted?: boolean;
}

export const REVERSE_K_GROUP_CODES = {
  java: `public class ReverseKGroup {
    public ListNode reverseKGroup(ListNode head, int k) {
        if (head == null || k <= 1) return head;
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode pre = dummy;
        ListNode end = dummy;

        while (end.next != null) {
            // 1. 探查后续是否满足 k 个节点
            for (int i = 0; i < k && end != null; i++) end = end.next;
            if (end == null) break; // 不足 k 个保持原样

            ListNode start = pre.next;
            ListNode nextGroup = end.next;
            end.next = null; // 断开局部链

            // 2. 反转局部 k 个节点
            pre.next = reverse(start);

            // 3. 缝合后续链表
            start.next = nextGroup;
            pre = start;
            end = pre;
        }
        return dummy.next;
    }

    private ListNode reverse(ListNode head) {
        ListNode pre = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
        return pre;
    }
}`,
  cpp: `class Solution {
    ListNode* reverse(ListNode* head) {
        ListNode *pre = nullptr, *cur = head;
        while (cur) {
            ListNode* nxt = cur->next;
            cur->next = pre;
            pre = cur;
            cur = nxt;
        }
        return pre;
    }
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode *pre = &dummy, *end = &dummy;
        while (end->next) {
            for (int i = 0; i < k && end; i++) end = end->next;
            if (!end) break;
            ListNode *start = pre->next, *nxt = end->next;
            end->next = nullptr;
            pre->next = reverse(start);
            start->next = nxt;
            pre = start;
            end = pre;
        }
        return dummy.next;
    }
};`,
  python: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        pre = end = dummy

        while end.next:
            for _ in range(k):
                if end: end = end.next
            if not end: break

            start = pre.next
            nxt = end.next
            end.next = None

            # 翻转局部
            prev, curr = None, start
            while curr:
                t = curr.next
                curr.next = prev
                prev, curr = curr, t

            pre.next = prev
            start.next = nxt
            pre = end = start

        return dummy.next`,
  typescript: `function reverseKGroup(head: number[], k: number): number[] {
    const res = [...head];
    for (let i = 0; i + k <= res.length; i += k) {
        let l = i, r = i + k - 1;
        while (l < r) {
            const t = res[l]; res[l] = res[r]; res[r] = t;
            l++; r--;
        }
    }
    return res;
}`
};

export function generateReverseKGroupSteps(inputList: number[] = [1, 2, 3, 4, 5], k: number = 2): KGroupStep[] {
  const steps: KGroupStep[] = [];
  const nodes = [...inputList];
  const n = nodes.length;

  const lines: Record<string, Record<string, number>> = {
    entry: { java: 2, cpp: 11, python: 2, typescript: 1, javascript: 1 },
    initDummy: { java: 4, cpp: 12, python: 3, typescript: 2, javascript: 2 },
    whileLoop: { java: 8, cpp: 15, python: 6, typescript: 3, javascript: 3 },
    probeK: { java: 10, cpp: 16, python: 7, typescript: 3, javascript: 3 },
    breakIncomplete: { java: 11, cpp: 17, python: 9, typescript: 3, javascript: 3 },
    reverseLocal: { java: 18, cpp: 21, python: 19, typescript: 6, javascript: 6 },
    stitchNext: { java: 21, cpp: 22, python: 20, typescript: 7, javascript: 7 },
    returnAns: { java: 25, cpp: 25, python: 23, typescript: 10, javascript: 10 },
  };

  // Step 0: 入口
  steps.push({
    nodes: [...nodes],
    k,
    groupRange: null,
    isReversed: false,
    decision: `启动 K 个一组翻转链表：k = ${k}，链表长度 N = ${n}`,
    message: '核心原则：每 k 个节点一组就地反转；若末尾剩余节点不足 k 个则保持不变',
    log: `Init reverseKGroup with list=[${nodes.join(', ')}], k=${k}`,
    codeLine: lines.entry,
    statusBadge: { text: '算法就绪', type: 'info' },
    metrics: {
      k: `k = ${k}`,
      groupRange: '准备就绪',
      nodeCount: `${n} 个节点`,
      status: '就绪',
    },
  });

  let groupIdx = 0;
  for (let start = 0; start < n; start += k) {
    groupIdx++;
    const end = start + k - 1;

    if (end >= n) {
      // 不足 k 个
      steps.push({
        nodes: [...nodes],
        k,
        groupRange: [start, n - 1],
        isReversed: false,
        decision: `探查第 ${groupIdx} 组：剩余节点 [${nodes.slice(start).join(', ')}] 共 ${n - start} 个 < k(${k})`,
        message: '不足 k 个节点，根据题目规则保持原有顺序不翻转，直接跳出',
        log: `Group ${groupIdx} incomplete (< ${k}), skip reversal`,
        codeLine: lines.breakIncomplete,
        statusBadge: { text: '不足跳过', type: 'warning' },
        metrics: {
          k: `k = ${k}`,
          groupRange: `[ ${start} ... ${n - 1} ]`,
          nodeCount: `${n} 个节点`,
          status: '不足跳过',
        },
      });
      break;
    }

    steps.push({
      nodes: [...nodes],
      k,
      groupRange: [start, end],
      isReversed: false,
      decision: `探查第 ${groupIdx} 组：成功锁定 k 个节点 [${nodes.slice(start, end + 1).join(', ')}]`,
      message: '节点充足，断开与后继链表连接，准备局部反转',
      log: `Group ${groupIdx} locked: [${nodes.slice(start, end + 1).join(', ')}]`,
      codeLine: lines.probeK,
      statusBadge: { text: `锁定组 ${groupIdx}`, type: 'info' },
      metrics: {
        k: `k = ${k}`,
        groupRange: `[ ${start} ... ${end} ]`,
        nodeCount: `${n} 个节点`,
        status: `锁定第 ${groupIdx} 组`,
      },
    });

    // 局部翻转
    let l = start;
    let r = end;
    while (l < r) {
      const temp = nodes[l];
      nodes[l] = nodes[r];
      nodes[r] = temp;
      l++;
      r--;
    }

    steps.push({
      nodes: [...nodes],
      k,
      groupRange: [start, end],
      isReversed: true,
      decision: `第 ${groupIdx} 组就地反转成功 ➔ 变为 [${nodes.slice(start, end + 1).join(', ')}]，并与后继缝合`,
      message: `头尾指针调转，pre 指针推进至新尾部，链表状态更新为 [${nodes.join(' ➔ ')}]`,
      log: `Group ${groupIdx} reversed: [${nodes.slice(start, end + 1).join(', ')}]`,
      codeLine: lines.reverseLocal,
      statusBadge: { text: `反转组 ${groupIdx}`, type: 'success' },
      metrics: {
        k: `k = ${k}`,
        groupRange: `[ ${start} ... ${end} ]`,
        nodeCount: `${n} 个节点`,
        status: `反转组 ${groupIdx} 成功`,
      },
    });
  }

  // 终结
  steps.push({
    nodes: [...nodes],
    k,
    groupRange: null,
    isReversed: false,
    decision: `🎉 全部组翻转完毕！最终链表序列: [${nodes.join(' ➔ ')}]`,
    message: '仅进行了一次完整单向遍历，时间复杂度严格 O(N)，额外空间严格 O(1)',
    log: `Done reverseKGroup. Result=[${nodes.join(', ')}]`,
    codeLine: lines.returnAns,
    statusBadge: { text: '翻转成功', type: 'success' },
    metrics: {
      k: `k = ${k}`,
      groupRange: '全部完成',
      nodeCount: `${n} 个节点`,
      status: '完成',
      ans: `[${nodes.join(' ➔ ')}]`,
    },
    ans: `[${nodes.join(' ➔ ')}]`,
    isAccepted: true,
  });

  return steps;
}

export function renderReverseKGroupCanvas(container: HTMLElement, step: KGroupStep): void {
  const currentRange = step.groupRange;
  container.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="font-size: 11.5px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
        <span>单链表动态拓扑结构</span>
        <span style="font-size: 10px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px;">彩色边框指示当前活跃组</span>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: nowrap; overflow-x: auto; max-width: 100%; padding: 16px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); box-sizing: border-box;">
        <!-- dummy head -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
          <div style="padding: 5px 8px; background: #f1f5f9; border: 1px dashed #94a3b8; color: #475569; border-radius: 8px; font-size: 11px; font-weight: 700;">
            dummy(0)
          </div>
          <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">哨兵头</span>
        </div>
        <span style="color: #94a3b8; font-size: 14px; font-weight: bold; flex-shrink: 0;">➔</span>

        ${step.nodes.map((val, idx) => {
          const inRange = currentRange && idx >= currentRange[0] && idx <= currentRange[1];
          const isReversedGroup = inRange && step.isReversed;

          let bg = '#ffffff';
          let border = '1px solid #cbd5e1';
          let textCol = '#0f172a';
          let shadow = '0 1px 3px rgba(0,0,0,0.03)';

          if (isReversedGroup) {
            bg = '#ecfdf5';
            border = '2px solid #10b981';
            textCol = '#065f46';
            shadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
          } else if (inRange) {
            bg = '#f0f9ff';
            border = '2px solid #0284c7';
            textCol = '#0369a1';
            shadow = '0 2px 8px rgba(2, 132, 199, 0.25)';
          }

          return `
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="
                  width: 42px;
                  height: 42px;
                  background: ${bg};
                  border: ${border};
                  border-radius: 9px;
                  color: ${textCol};
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  box-shadow: ${shadow};
                  transition: all 0.2s ease;
                ">
                  <span style="font-size: 14px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">${val}</span>
                  <span style="font-size: 8.5px; color: #64748b; font-weight: 600;">#${idx}</span>
                </div>
                ${inRange ? `<span style="font-size: 9px; font-weight: 700; color: ${isReversedGroup ? '#059669' : '#0284c7'};">组${Math.floor(idx / step.k) + 1}</span>` : '<span style="font-size: 9px; color: transparent;">-</span>'}
              </div>
              ${idx < step.nodes.length - 1 
                ? '<span style="color: #3b82f6; font-size: 14px; font-weight: bold;">➔</span>' 
                : '<span style="color: #64748b; font-size: 10px; font-weight: 700; background: #f1f5f9; padding: 2px 5px; border-radius: 4px;">➔ null</span>'}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export const reverseNodesInKGroupVisualizer = registerDeclarativeAlgorithm<KGroupStep>({
  id: 'reverse-nodes-in-k-group',
  name: 'Hard 21: K 个一组翻转链表 (Reverse Nodes in k-Group)',
  category: 'linked-list',
  icon: '🔁',
  difficulty: 3,
  levelOrder: 25,
  learningGoal: '掌握经典链表局部指针翻转与边界缝合技巧，理解常数额外空间 O(1) 处理组内重构的精妙逻辑',
  metrics: [
    { id: 'k', label: '每组翻转规模 (k)', color: '#0ea5e9' },
    { id: 'groupRange', label: '当前活跃区间', color: '#f59e0b' },
    { id: 'nodeCount', label: '链表拓扑长度', color: '#10b981' },
    { id: 'status', label: '翻转推进状态', color: '#6366f1' },
  ],
  auxiliaryVisual: {
    title: '链表 K 个一组就地翻转公理',
    render: (container, step) => {
      container.innerHTML = `
        <div style="padding: 10px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #1e293b;">💡 局部翻转与边界缝合精髓</span>
            ${step.statusBadge ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">${step.statusBadge.text}</span>` : ''}
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.6;">
            每组由 <code>pre</code> 定位前驱、<code>end</code> 探查向前推进 <code>k</code> 步；若节点不足直接 break 终止；若充足断开 <code>end.next</code> 局部反转，将新尾节点与后续组缝合，实现 $O(N)$ 一趟线性扫描且空间严格 $O(1)$！
          </div>
          <div style="margin-top: 8px; font-size: 11.5px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 6px 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
            ${step.decision}
          </div>
        </div>
      `;
    },
  },
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 25 - Hard)</h3>
      <p>给你链表的头节点 <code>head</code> ，每 <code>k</code> 个节点一组进行翻转，请你返回修改后的链表：</p>
      <ul>
        <li><code>k</code> 是一个正整数，它的值小于或等于链表的长度。</li>
        <li>如果节点总数不是 <code>k</code> 的整数倍，那么请将最后剩余的节点保持原有顺序。</li>
        <li><strong>进阶挑战</strong>：你只能使用 $O(1)$ 额外内存空间，且不能单纯只改变节点内部的值，而是需要实际进行节点指针的交换。</li>
      </ul>
    </div>
  `,
  codeLanguages: REVERSE_K_GROUP_CODES,
  inputs: [
    {
      id: 'k',
      label: '翻转组大小 (k)',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: 'k = 2 (两两一组)', value: '2' },
        { label: 'k = 3 (三三一组)', value: '3' },
      ],
    },
  ],
  generateSteps: (input) => {
    const k = Number(input.k) || 2;
    return generateReverseKGroupSteps([1, 2, 3, 4, 5], k);
  },
  renderCanvas: (container, step) => {
    renderReverseKGroupCanvas(container, step);
  },
});
