/**
 * Class 037: K 个一组翻转链表 (Reverse Nodes in k-Group)
 * 局部组内反转 + 组间首尾桥接 / LeetCode 25
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { LINKED_LIST_034_038_PROBLEMS } from './linked-list-034-038-problem-content';
import { REVERSE_K_GROUP_037_CODES, REVERSE_K_GROUP_037_LINES } from './linked-list-034-038-stage-codes';
import { LinkedList034Step, renderReverseKGroupBoard } from './linked-list-034-038-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ReverseKGroup037Step extends LinkedList034Step {
  groups: { id: number; nodes: number[]; isReversed: boolean; isCurrent: boolean }[];
  k: number;
  phase: string;
}

export function buildReverseKGroup037Steps(): ReverseKGroup037Step[] {
  const steps: ReverseKGroup037Step[] = [];
  const lines = REVERSE_K_GROUP_037_LINES;

  const k = 2;
  // 原链表: [1, 2, 3, 4, 5], k = 2 -> 组1: [1, 2], 组2: [3, 4], 组3: [5] (不足2)

  // Step 0: 入口帧
  steps.push({
    groups: [
      { id: 1, nodes: [1, 2], isReversed: false, isCurrent: false },
      { id: 2, nodes: [3, 4], isReversed: false, isCurrent: false },
      { id: 3, nodes: [5], isReversed: false, isCurrent: false },
    ],
    k,
    phase: '链表分组初始化',
    decision: `主函数入口：开始对链表 [1 -> 2 -> 3 -> 4 -> 5] 进行 K=2 组内逆序`,
    message: `准备探测第一组组尾 end 节点`,
    log: `enter reverseKGroup: k=2, total=5`,
    codeLine: lines.entry,
    metrics: { 'K值': 2, '预计满组数': 2 },
  });

  // Step 1: 第一组逆序
  steps.push({
    groups: [
      { id: 1, nodes: [1, 2], isReversed: false, isCurrent: true },
      { id: 2, nodes: [3, 4], isReversed: false, isCurrent: false },
      { id: 3, nodes: [5], isReversed: false, isCurrent: false },
    ],
    k,
    phase: '锁定第 1 组 [1, 2] 并反转',
    decision: `寻找组 1 组尾：end = 2；满 K 个，反转区间 [1, 2] 变为 [2, 1]`,
    message: `确立全局新头 head = 2，记录上组尾 lastTeamEnd = 1`,
    log: `group 1 reversed: [1, 2] -> [2, 1], global head=2`,
    codeLine: lines.firstReverse,
    statusBadge: { text: '第 1 组翻转完成', type: 'info' },
    metrics: { '全局新头': 2, '上组尾': 1 },
  });

  // Step 2: 第二组逆序并与第一组桥接
  steps.push({
    groups: [
      { id: 1, nodes: [2, 1], isReversed: true, isCurrent: false },
      { id: 2, nodes: [4, 3], isReversed: true, isCurrent: true },
      { id: 3, nodes: [5], isReversed: false, isCurrent: false },
    ],
    k,
    phase: '锁定第 2 组 [3, 4] 反转并桥接',
    decision: `寻找组 2 组尾：end = 4；反转为 [4, 3]，并将上组尾 1 连向 4`,
    message: `链表前 4 个节点连为：2 -> 1 -> 4 -> 3，更新上组尾 lastTeamEnd = 3`,
    log: `group 2 reversed: connected 1 -> 4, new lastTeamEnd=3`,
    codeLine: lines.bridgeNext,
    statusBadge: { text: '第 2 组翻转并桥接', type: 'warning' },
    metrics: { '当前连接': '1 -> 4', '新组尾': 3 },
  });

  // Step 3: 最后一组节点数不足 K，保持原序并终止
  steps.push({
    groups: [
      { id: 1, nodes: [2, 1], isReversed: true, isCurrent: false },
      { id: 2, nodes: [4, 3], isReversed: true, isCurrent: false },
      { id: 3, nodes: [5], isReversed: false, isCurrent: false },
    ],
    k,
    phase: '第 3 组不足 K 个，保持原样结束',
    decision: `探测组 3：仅剩节点 [5]，不足 K=2 个，保持原有顺序不变直接返回`,
    message: `全局结果形成：[2 -> 1 -> 4 -> 3 -> 5 -> null]，算法顺利结束`,
    log: `remaining nodes < k: preserved original order. finished.`,
    codeLine: lines.loopGroups,
    statusBadge: { text: '处理完成', type: 'success' },
    metrics: { '最终头节点': 2, '未翻转尾部': '[5]' },
  });

  return steps;
}

export const reverseKGroup037Visualizer = registerDeclarativeAlgorithm<ReverseKGroup037Step>({
  id: 'reverse-k-group-037',
  name: 'K 个一组翻转链表 (Class 037)',
  category: 'linked-list',
  difficulty: 'hard',
  problemContent: LINKED_LIST_034_038_PROBLEMS.reverseKGroup037,
  sourceCodes: REVERSE_K_GROUP_037_CODES,
  generateSteps: buildReverseKGroup037Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderReverseKGroupBoard(
          step.groups,
          step.k,
          step.phase
        )}
        ${renderFormulaCard(
          'K 个一组链表翻转核心不变量',
          '\\text{lastTeamEnd.next} = \\text{end}, \\quad \\text{start.next} = \\text{nextGroup}',
          '每组翻转后，原头变新尾，原尾变新头。牢牢抓住上一组尾与下一组头，即可在 $O(1)$ 常数空间内实现稳健的跨组缝合。'
        )}
      </div>
    `;
  },
});
