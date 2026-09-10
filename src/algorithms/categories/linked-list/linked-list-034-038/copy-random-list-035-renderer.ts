/**
 * Class 035: 复杂链表的深拷贝 (Copy List with Random Pointer)
 * 原地插入克隆节点 O(1) 空间复杂度 / LeetCode 138
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { LINKED_LIST_034_038_PROBLEMS } from './linked-list-034-038-problem-content';
import { COPY_RANDOM_LIST_035_CODES, COPY_RANDOM_LIST_035_LINES } from './linked-list-034-038-stage-codes';
import { LinkedList034Step, renderCopyRandomBoard } from './linked-list-034-038-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CopyRandomList035Step extends LinkedList034Step {
  nodes: { val: number; isClone: boolean; randomVal: number | null }[];
  stage: string;
  desc: string;
}

export function buildCopyRandomList035Steps(): CopyRandomList035Step[] {
  const steps: CopyRandomList035Step[] = [];
  const lines = COPY_RANDOM_LIST_035_LINES;

  // Step 0: 入口帧
  steps.push({
    nodes: [
      { val: 1, isClone: false, randomVal: 3 },
      { val: 2, isClone: false, randomVal: 1 },
      { val: 3, isClone: false, randomVal: null },
    ],
    stage: '原始链表呈现',
    desc: '待克隆链表包含 random 任意指向指针，直接哈希需 O(N) 空间，左神插桩法可优化至 O(1)',
    decision: `主函数入口：开始对带随机指针的复杂链表进行深拷贝`,
    message: `准备执行经典的“原地插桩三步法”`,
    log: `enter copyRandomList: n=3`,
    codeLine: lines.entry,
    metrics: { '原链表长度': 3, '空间优化目标': 'O(1)' },
  });

  // Step 1: 原地插桩克隆节点
  steps.push({
    nodes: [
      { val: 1, isClone: false, randomVal: 3 },
      { val: 1, isClone: true, randomVal: null },
      { val: 2, isClone: false, randomVal: 1 },
      { val: 2, isClone: true, randomVal: null },
      { val: 3, isClone: false, randomVal: null },
      { val: 3, isClone: true, randomVal: null },
    ],
    stage: '第一步：原地插桩新节点',
    desc: '在每个原节点身后紧跟插入值相同的克隆节点：1 -> 1\' -> 2 -> 2\' -> 3 -> 3\'',
    decision: `遍历原链表并插入克隆节点：cur.next = new Node(cur.val); cur.next.next = next`,
    message: `新老节点交错相间，原节点的克隆体天然位于 cur.next，无需哈希映射即可瞬时访问`,
    log: `step 1 clone nodes inserted in-place`,
    codeLine: lines.cloneInsert,
    statusBadge: { text: '交错链表构建完成', type: 'info' },
    metrics: { '交错链长': 6, '克隆节点数': 3 },
  });

  // Step 2: 拷贝 random 随机指针
  steps.push({
    nodes: [
      { val: 1, isClone: false, randomVal: 3 },
      { val: 1, isClone: true, randomVal: 3 },
      { val: 2, isClone: false, randomVal: 1 },
      { val: 2, isClone: true, randomVal: 1 },
      { val: 3, isClone: false, randomVal: null },
      { val: 3, isClone: true, randomVal: null },
    ],
    stage: '第二步：一对一配对 random 指针',
    desc: '令 cur.next.random = cur.random ? cur.random.next : null',
    decision: `为克隆节点建立 random 指针：克隆节点的 random 目标正是原节点 random 目标的 next！`,
    message: `例如 1 的 random 指向 3，则 1' 的 random 指向 3.next (即 3')`,
    log: `step 2 random pointers replicated accurately`,
    codeLine: lines.copyRandom,
    statusBadge: { text: '随机指针匹配完成', type: 'warning' },
    metrics: { '1的克隆指向': "3'", '2的克隆指向': "1'" },
  });

  // Step 3: 拆分还原
  steps.push({
    nodes: [
      { val: 1, isClone: true, randomVal: 3 },
      { val: 2, isClone: true, randomVal: 1 },
      { val: 3, isClone: true, randomVal: null },
    ],
    stage: '第三步：拆分剥离并复原原始链表',
    desc: '恢复原链表的 next 指针，同时将克隆节点单向连成独立的新链表',
    decision: `完成两链表剥离：返回克隆链表头 copyHead (1')，原链表完全复原无副作用`,
    message: `成功完成复杂链表深拷贝，额外空间复杂度严格为 O(1)！`,
    log: `step 3 split lists completed: copyHead returned`,
    codeLine: lines.splitLists,
    statusBadge: { text: '深拷贝大功告成', type: 'success' },
    metrics: { '克隆链表头': "1'", '空间复杂度': 'O(1)' },
  });

  return steps;
}

export const copyRandomList035Visualizer = registerDeclarativeAlgorithm<CopyRandomList035Step>({
  id: 'copy-random-list-035',
  name: '复杂链表的深拷贝 (Class 035)',
  category: 'linked-list',
  difficulty: 'medium',
  problemContent: LINKED_LIST_034_038_PROBLEMS.copyRandomList035,
  sourceCodes: COPY_RANDOM_LIST_035_CODES,
  generateSteps: buildCopyRandomList035Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderCopyRandomBoard(
          step.nodes,
          step.stage,
          step.desc
        )}
        ${renderFormulaCard(
          '原地插桩法克隆链表核心恒等式',
          '\\text{cur.next.random} = \\text{cur.random.next}',
          '利用相邻位置关系替代哈希表的空间查找开销，使得空间复杂度从 $O(N)$ 直降至真正的 $O(1)$ 常数空间。'
        )}
      </div>
    `;
  },
});
