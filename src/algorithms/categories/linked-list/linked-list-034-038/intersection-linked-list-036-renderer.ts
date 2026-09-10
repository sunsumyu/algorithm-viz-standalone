/**
 * Class 036: 相交链表与有环无环终极判定 (Intersection of Two Linked Lists)
 * 快慢指针测环 + 长度差对齐 / LeetCode 142 & 160
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { LINKED_LIST_034_038_PROBLEMS } from './linked-list-034-038-problem-content';
import { INTERSECTION_LIST_036_CODES, INTERSECTION_LIST_036_LINES } from './linked-list-034-038-stage-codes';
import { LinkedList034Step, renderIntersectionBoard } from './linked-list-034-038-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface IntersectionList036Step extends LinkedList034Step {
  listA: number[];
  listB: number[];
  loopA: number | null;
  loopB: number | null;
  intersectNode: number | null;
  statusDesc: string;
}

export function buildIntersectionList036Steps(): IntersectionList036Step[] {
  const steps: IntersectionList036Step[] = [];
  const lines = INTERSECTION_LIST_036_LINES;

  // Step 0: 入口帧
  steps.push({
    listA: [1, 2, 8, 9],
    listB: [4, 5, 6, 8, 9],
    loopA: null,
    loopB: null,
    intersectNode: null,
    statusDesc: '开始调用主相交判定函数，分别探查链表 A 与链表 B 的环路状态',
    decision: `主函数入口：开始判定两个链表是否相交并返回首个交点`,
    message: `首先分别调用 getLoopNode 检测 A 和 B 的第一个入环节点`,
    log: `enter getIntersectNode: listA len=4, listB len=5`,
    codeLine: lines.entry,
    metrics: { '链表A长度': 4, '链表B长度': 5 },
  });

  // Step 1: 测环完毕，皆为无环链表
  steps.push({
    listA: [1, 2, 8, 9],
    listB: [4, 5, 6, 8, 9],
    loopA: null,
    loopB: null,
    intersectNode: null,
    statusDesc: '快慢指针检测完成：loopA=null, loopB=null，确定两链表皆为无环单链表',
    decision: `进入无环单链表相交子分支：计算两链表长度差 Delta = |lenA - lenB| = |4 - 5| = 1`,
    message: `长链表 B 先单独前进一步，随后 A 与 B 同步向前推进`,
    log: `both lists are loop-free: delta=1`,
    codeLine: lines.noLoopCheck,
    statusBadge: { text: '无环分支确认', type: 'info' },
    metrics: { '长度差 Delta': 1, '长链表': 'B' },
  });

  // Step 2: 同步前行锁定交点 8
  steps.push({
    listA: [1, 2, 8, 9],
    listB: [4, 5, 6, 8, 9],
    loopA: null,
    loopB: null,
    intersectNode: 8,
    statusDesc: '长链表 B 步进 1 步后，A 与 B 指针同步移动并在节点 8 处地址重合！',
    decision: `两指针在节点 8 处相遇：成功找到两单链表的第一交点 Node(8)`,
    message: `由于单链表节点仅有一个 next 指针，相交后两链表后续结构完全合并 [8 -> 9 -> null]`,
    log: `intersect node found: node 8`,
    codeLine: lines.noLoopCheck,
    statusBadge: { text: '锁定相交节点', type: 'success' },
    metrics: { '相交节点值': 8, '后续共享长度': 2 },
  });

  return steps;
}

export const intersectionLinkedList036Visualizer = registerDeclarativeAlgorithm<IntersectionList036Step>({
  id: 'intersection-linked-list-036',
  name: '相交链表与有环无环判定 (Class 036)',
  category: 'linked-list',
  difficulty: 'medium',
  problemContent: LINKED_LIST_034_038_PROBLEMS.intersectionLinkedList036,
  sourceCodes: INTERSECTION_LIST_036_CODES,
  generateSteps: buildIntersectionList036Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderIntersectionBoard(
          step.listA,
          step.listB,
          step.loopA,
          step.loopB,
          step.intersectNode,
          step.statusDesc
        )}
        ${renderFormulaCard(
          '单链表相交三大拓扑准则',
          '\\begin{cases} \\text{无环相交} & \\iff \\text{尾节点相同，长链先走 } \\Delta \\\\ \\text{有环相同入环点} & \\iff \\text{loopA} == \\text{loopB}, \\text{ 相交在入环前} \\\\ \\text{有环不同入环点} & \\iff \\text{从 loopA 出发能绕环到达 loopB} \\end{cases}',
          '若一个链表有环而另一个无环，由于单向指针无法产生分叉，两者绝对不可能相交。'
        )}
      </div>
    `;
  },
});
