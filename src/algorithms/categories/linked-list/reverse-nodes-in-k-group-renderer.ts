/**
 * Hard 21: K 个一组翻转链表 (Reverse Nodes in k-Group)
 * LeetCode 25 (Hard) / 大厂面试压轴高频链表指针模拟之神
 * 核心原语：k 节点预探查 + 局部区间就地反转 + 前驱后继无缝缝合，O(N) 时间 O(1) 空间
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  KGroupStep,
  REVERSE_K_GROUP_CODES,
  REVERSE_K_GROUP_LINES,
  generateReverseKGroupSteps,
} from './reverse-nodes-in-k-group-step-compiler';
import {
  renderReverseKGroupCanvas,
  renderReverseKGroupAuxiliary,
} from './reverse-nodes-in-k-group-canvas-adapter';

export type { KGroupStep };
export {
  REVERSE_K_GROUP_CODES,
  REVERSE_K_GROUP_LINES,
  generateReverseKGroupSteps,
  renderReverseKGroupCanvas,
  renderReverseKGroupAuxiliary,
};

export const reverseNodesInKGroupVisualizer = registerDeclarativeAlgorithm<KGroupStep>({
  id: 'reverse-nodes-in-k-group',
  aliases: ['class037-code01', 'reverse-k-group-037', 'reverse-nodes-in-k-group-25', 'leetcode-25', '25', 'reverse-k-group'],
  name: 'Hard 21: K 个一组翻转链表 (Reverse Nodes in k-Group)',
  category: 'linked-list',
  icon: '🔁',
  difficulty: 3,
  levelOrder: 25,
  learningGoal: '掌握经典链表局部指针翻转与边界缝合技巧，理解常数额外空间 O(1) 处理组内重构的精妙逻辑',
  hasDeductionTree: true,
  metrics: [
    { id: 'k', label: '每组翻转规模 (k)', color: '#0ea5e9' },
    { id: 'groupRange', label: '当前活跃区间', color: '#f59e0b' },
    { id: 'nodeCount', label: '链表拓扑长度', color: '#10b981' },
    { id: 'status', label: '翻转推进状态', color: '#6366f1' },
  ],
  auxiliaryVisual: {
    title: '链表 K 个一组就地翻转公理',
    render: (container, step) => {
      renderReverseKGroupAuxiliary(container, step);
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
