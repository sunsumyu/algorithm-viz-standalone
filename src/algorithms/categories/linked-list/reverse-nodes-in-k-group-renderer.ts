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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

  const lines = {
    entry: 3,
    initDummy: 5,
    whileLoop: 9,
    probeK: 11,
    breakIncomplete: 12,
    reverseLocal: 19,
    stitchNext: 22,
    returnAns: 26,
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
  });

  return steps;
}

export function renderReverseKGroupCanvas(container: HTMLElement, step: KGroupStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">每组翻转规模 (k)</div>
          <div style="font-size: 24px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            k = ${step.k}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前活跃操作区间</div>
          <div style="font-size: 18px; font-weight: bold; color: #fbbf24; margin-top: 4px;">
            ${step.groupRange ? `下标 [ ${step.groupRange[0]} ... ${step.groupRange[1]} ]` : '待定或完毕'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前链表拓扑长度</div>
          <div style="font-size: 20px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${step.nodes.length} 个节点
          </div>
        </div>
      </div>

      <!-- 链表指针轨道沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px; overflow-x: auto;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 14px;">
          单链表当前指针连接状态 (彩色框为当前翻转组)
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <div style="padding: 4px 8px; background: #334155; color: #94a3b8; border-radius: 4px; font-size: 11px;">dummy</div>
          <span style="color: #64748b;">➔</span>

          ${step.nodes.map((val, idx) => {
            const inRange = step.groupRange && idx >= step.groupRange[0] && idx <= step.groupRange[1];
            return `
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: ${inRange ? (step.isReversed ? '#065f46' : '#0369a1') : '#1e293b'};
                  border: ${inRange ? (step.isReversed ? '2px solid #34d399' : '2px solid #38bdf8') : '1px solid #475569'};
                  border-radius: 6px;
                  color: #fff;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  box-shadow: ${inRange ? '0 0 8px rgba(56,189,248,0.5)' : 'none'};
                ">
                  <span style="font-size: 14px; font-weight: bold;">${val}</span>
                  <span style="font-size: 8px; color: #94a3b8;">#${idx}</span>
                </div>
                ${idx < step.nodes.length - 1 ? '<span style="color: #38bdf8; font-size: 14px;">➔</span>' : '<span style="color: #94a3b8; font-size: 11px;">➔ null</span>'}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '链表 K 个一组就地翻转公理',
        '每组翻转由 pre 指针定位头部、探查 end 指针前移 k 步：若前移不足 k 步证明末尾短缺直接 break；若探查成功则断开 end.next 进行局部反转，随后将原 start 节点（现尾节点）接回后续链表，实现 O(N) 一趟线性扫描且空间维持绝对 O(1)！',
        step.decision,
        step.statusBadge
      )}
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
