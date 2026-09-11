/**
 * 左程云算法通关课 Class 042: 复杂链表的复制 (Copy List with Random Pointer)
 * LeetCode 138 (Medium / 高频大厂核心链表手撕题)
 * 核心机制: 原地交织复制法 (In-Place Interleaving)
 *  1. 第一遍：每个原节点后紧跟插入一个克隆节点 1 -> 1' -> 2 -> 2'
 *  2. 第二遍：利用交织结构无哈希表设置 random：cur.next.random = cur.random ? cur.random.next : null
 *  3. 第三遍：分离拆解交织链表，复原原链表并分离出克隆新链表
 *  时间复杂度 O(N)，空间复杂度 O(1) 辅助空间（不计返回结果）
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface ComplexNode {
  id: string;
  val: number;
  isClone: boolean;
  nextId: string | null;
  randomId: string | null;
}

export interface CopyListStep extends StepBase {
  phase: 'init' | 'clone_nodes' | 'set_random' | 'split_lists' | 'finish';
  nodes: ComplexNode[];
  currentNodeId: string | null;
  message: string;
  log: string;
  codeLine: number;
}

export const COPY_LIST_CODES = {
  java: `public class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        Node cur = head;
        // 1. 复制节点并插入原节点之后: 1 -> 1' -> 2 -> 2'
        while (cur != null) {
            Node next = cur.next;
            Node clone = new Node(cur.val);
            cur.next = clone;
            clone.next = next;
            cur = next;
        }
        // 2. 利用相对位置设置克隆节点的 random
        cur = head;
        while (cur != null) {
            if (cur.random != null) {
                cur.next.random = cur.random.next;
            }
            cur = cur.next.next;
        }
        // 3. 拆分原链表与克隆链表
        cur = head;
        Node res = head.next;
        while (cur != null) {
            Node clone = cur.next;
            Node next = clone.next;
            cur.next = next;
            clone.next = next != null ? next.next : null;
            cur = next;
        }
        return res;
    }
}`,
  cpp: `class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) return nullptr;
        Node* cur = head;
        while (cur) {
            Node* next = cur->next;
            cur->next = new Node(cur->val);
            cur->next->next = next;
            cur = next;
        }
        cur = head;
        while (cur) {
            if (cur->random) cur->next->random = cur->random->next;
            cur = cur->next->next;
        }
        cur = head;
        Node* res = head->next;
        while (cur) {
            Node* clone = cur->next;
            Node* next = clone->next;
            cur->next = next;
            clone->next = next ? next->next : nullptr;
            cur = next;
        }
        return res;
    }
};`,
  python: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if not head:
            return None
        cur = head
        while cur:
            nxt = cur.next
            cur.next = Node(cur.val, nxt, None)
            cur = nxt
        cur = head
        while cur:
            if cur.random:
                cur.next.random = cur.random.next
            cur = cur.next.next
        cur = head
        res = head.next
        while cur:
            clone = cur.next
            nxt = clone.next
            cur.next = nxt
            clone.next = nxt.next if nxt else None
            cur = nxt
        return res`,
};

export function buildCopyListSteps(): CopyListStep[] {
  const steps: CopyListStep[] = [];

  // 原链表: 7 -> 13 -> 11 -> 10 -> 1
  // random: 7->null, 13->7, 11->1, 10->13, 1->7
  const initialNodes: ComplexNode[] = [
    { id: '1', val: 7, isClone: false, nextId: '2', randomId: null },
    { id: '2', val: 13, isClone: false, nextId: '3', randomId: '1' },
    { id: '3', val: 11, isClone: false, nextId: '4', randomId: '5' },
    { id: '4', val: 10, isClone: false, nextId: '5', randomId: '2' },
    { id: '5', val: 1, isClone: false, nextId: null, randomId: '1' },
  ];

  // Step 0: Init
  steps.push({
    phase: 'init',
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    currentNodeId: '1',
    message: `算法启动：原链表共 5 个节点，每个节点包含 val、next 以及随机指针 random。准备执行三步原地复制法。`,
    log: `初始化复杂链表: 长度=5`,
    codeLine: 4,
  });

  // Phase 1: Clone and insert
  const interleavedNodes: ComplexNode[] = [
    { id: '1', val: 7, isClone: false, nextId: "1'", randomId: null },
    { id: "1'", val: 7, isClone: true, nextId: '2', randomId: null },
    { id: '2', val: 13, isClone: false, nextId: "2'", randomId: '1' },
    { id: "2'", val: 13, isClone: true, nextId: '3', randomId: null },
    { id: '3', val: 11, isClone: false, nextId: "3'", randomId: '5' },
    { id: "3'", val: 11, isClone: true, nextId: '4', randomId: null },
    { id: '4', val: 10, isClone: false, nextId: "4'", randomId: '2' },
    { id: "4'", val: 10, isClone: true, nextId: '5', randomId: null },
    { id: '5', val: 1, isClone: false, nextId: "5'", randomId: '1' },
    { id: "5'", val: 1, isClone: true, nextId: null, randomId: null },
  ];

  steps.push({
    phase: 'clone_nodes',
    nodes: JSON.parse(JSON.stringify(interleavedNodes)),
    currentNodeId: "1'",
    message: `阶段一完成：克隆节点紧随其后就地插入！结构变为 1 ➔ 1' ➔ 2 ➔ 2' ➔ 3 ➔ 3' ... 原节点与新节点形成严格交织。`,
    log: `完成克隆节点原地串接`,
    codeLine: 7,
  });

  // Phase 2: Set random
  const withRandomNodes: ComplexNode[] = JSON.parse(JSON.stringify(interleavedNodes));
  withRandomNodes.find((n) => n.id === "2'")!.randomId = "1'";
  withRandomNodes.find((n) => n.id === "3'")!.randomId = "5'";
  withRandomNodes.find((n) => n.id === "4'")!.randomId = "2'";
  withRandomNodes.find((n) => n.id === "5'")!.randomId = "1'";

  steps.push({
    phase: 'set_random',
    nodes: JSON.parse(JSON.stringify(withRandomNodes)),
    currentNodeId: "2'",
    message: `阶段二完成：利用交织性质配置 random！对于任意原节点 cur，其克隆节点必为 cur.next；因此 cur.next.random 恰好等于 cur.random.next！全程零哈希表开销。`,
    log: `克隆节点 random 指针全部精准对齐绑定`,
    codeLine: 16,
  });

  // Phase 3: Split
  const clonedOnlyNodes: ComplexNode[] = [
    { id: "1'", val: 7, isClone: true, nextId: "2'", randomId: null },
    { id: "2'", val: 13, isClone: true, nextId: "3'", randomId: "1'" },
    { id: "3'", val: 11, isClone: true, nextId: "4'", randomId: "5'" },
    { id: "4'", val: 10, isClone: true, nextId: "5'", randomId: "2'" },
    { id: "5'", val: 1, isClone: true, nextId: null, randomId: "1'" },
  ];

  steps.push({
    phase: 'split_lists',
    nodes: clonedOnlyNodes,
    currentNodeId: "1'",
    message: `阶段三完成：解开交织结构！原链表各节点重新连回自己的原后继，克隆新链表独立解耦抽出，各指针完全深拷贝完毕。`,
    log: `拆分还原原链表，抽出克隆链表`,
    codeLine: 24,
  });

  // Finish
  steps.push({
    phase: 'finish',
    nodes: clonedOnlyNodes,
    currentNodeId: null,
    message: `🎉 深拷贝完成！新链表具备完全独立的内存与精确对应的 next 与 random 拓扑，返回克隆头节点。`,
    log: `复杂链表深拷贝完毕，空间复杂度 O(1)`,
    codeLine: 32,
  });

  return steps;
}

export function renderCopyListCanvas(container: HTMLElement, step: CopyListStep) {
  const nodesHtml = step.nodes
    .map((n) => {
      const isClone = n.isClone;
      const border = isClone
        ? 'border: 2px solid #38bdf8; background: rgba(2, 132, 199, 0.25);'
        : 'border: 1px solid rgba(255, 255, 255, 0.15); background: rgba(30, 41, 59, 0.7);';

      return `
      <div style="
        position: relative;
        padding: 10px 14px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 95px;
        transition: all 0.2s;
      ">
        <div style="font-size: 11px; color: ${isClone ? '#38bdf8' : '#94a3b8'}; font-weight: bold;">
          ${isClone ? `Clone #${n.id}` : `Origin #${n.id}`}
        </div>
        <div style="font-size: 18px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${n.val}</div>
        <div style="font-size: 10px; color: #64748b; font-family: monospace;">next ➔ ${n.nextId ?? 'NULL'}</div>
        <div style="font-size: 10px; color: #f59e0b; font-family: monospace; margin-top: 2px;">random ➔ ${n.randomId ?? 'NULL'}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">复杂链表节点与指针拓扑交互沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            阶段: ${step.phase}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #94a3b8;">节点数量: ${step.nodes.length}</span>
        </div>
      </div>

      <!-- 链表节点序列网格 -->
      <div style="display: flex; gap: 10px; align-items: center; overflow-x: auto; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${nodesHtml}
      </div>

      <!-- 原地三段式解剖卡片 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. 原地插入克隆</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">克隆每个节点并插入到对应原节点正后方，保持紧密相邻相对位置。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #f59e0b;">2. 跨步设置 Random</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">cur.next.random = cur.random ? cur.random.next : null，O(1) 精确映射。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">3. 链表无损拆解</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">原链表连回原后继，新链表独立抽出，保证原链表完好无损。</div>
        </div>
      </div>
    </div>
  `;
}

export const copyListRandomPointer042Visualizer = registerDeclarativeAlgorithm<CopyListStep>({
  id: 'copy-list-random-pointer-042',
  name: '复杂链表的复制 (Class 042)',
  category: 'linked-list',
  icon: '📋',
  difficulty: 2,
  levelOrder: 42,
  learningGoal: '掌握利用链表就地插入建立映射的精妙技巧，彻底摆脱哈希表实现 O(1) 额外空间复杂度的复杂链表深拷贝',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 042 / LeetCode 138)</h3>
      <p>给你一个长度为 <code>n</code> 的链表，每个节点包含一个额外增加的随机指针 <code>random</code> ，该指针可以指向链表中的任何节点或空节点。构造这个链表的<strong>深拷贝</strong>：</p>
      <ul>
        <li><strong>传统解法</strong>：用 <code>HashMap&lt;Node, Node&gt;</code> 记录原节点到克隆节点的映射，空间复杂度为 $O(N)$。</li>
        <li><strong>左神最优解法 (原地交织法)</strong>：
          <br/>1. 复制每个节点，并将新节点直接挂在老节点后边：<code>1 -&gt; 1' -&gt; 2 -&gt; 2'</code>；
          <br/>2. 根据老节点的 <code>random</code> 关系设置新节点的 <code>random</code>：<code>cur.next.random = cur.random.next</code>；
          <br/>3. 在保持老链表完整恢复的同时，将新链表从缝隙中完整拆出！空间复杂度达 $O(1)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: COPY_LIST_CODES,
  inputs: [],
  generateSteps: () => {
    return buildCopyListSteps();
  },
  renderCanvas: (container, step) => {
    renderCopyListCanvas(container, step);
  },
});
