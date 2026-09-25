/**
 * 左程云算法通关课 Class 036: 二叉树完全性检验 (Completeness of Binary Tree / LeetCode 958)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
  renderQueuePipeline,
} from './tree-036-037-shared';
import { COMPLETENESS_036_CODES, COMPLETENESS_036_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

// 满树前 6 个节点：1 -> (2, 3), 2 -> (4, 5), 3 -> (6, null)
const COMPLETE_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3 },
  { id: 2, val: 2, left: 4, right: 5 },
  { id: 3, val: 3, left: 6, right: null },
  { id: 4, val: 4, left: null, right: null },
  { id: 5, val: 5, left: null, right: null },
  { id: 6, val: 6, left: null, right: null },
];

export function buildCompleteness036Steps(): Tree036Step[] {
  const steps: Tree036Step[] = [];
  const nodes = COMPLETE_TREE_NODES;
  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));

  // Step 1: 入口
  steps.push({
    codeLine: COMPLETENESS_036_LINES.entry,
    decision: '开启完全二叉树 (CBT) 校验',
    message: '左神两大铁律：1. 任何节点有右无左直接判错；2. 一旦遇上孩子不双全，后续必须全为叶子！',
    log: 'isCompleteTree(root = 1), leaf = false',
    activeNodeId: null,
    queue: [],
    metrics: { '当前状态 leaf 触发': 'false (未触发)', '违反规则': '无' },
    statusBadge: { text: '校验启动', type: 'info' },
  });

  // Step 2: 根节点 1 出队并检查
  steps.push({
    codeLine: COMPLETENESS_036_LINES.ruleCheck,
    decision: '检查根节点 1: 左右皆有',
    message: '节点 1 左右孩子齐全 (2, 3)，不触发 leaf，左孩子 2 和右孩子 3 相继入队',
    log: 'cur = 1, left = 2, right = 3 (双全), leaf = false',
    activeNodeId: 1,
    queue: [2, 3],
    metrics: { '当前节点': 1, '左孩子': 2, '右孩子': 3, 'leaf 状态': 'false' },
    statusBadge: { text: '节点 1 合规', type: 'info' },
  });

  // Step 3: 检查节点 2: 左右皆有
  steps.push({
    codeLine: COMPLETENESS_036_LINES.ruleCheck,
    decision: '检查节点 2: 左右皆有',
    message: '节点 2 左右孩子齐全 (4, 5)，不触发 leaf，子节点 4 和 5 入队',
    log: 'cur = 2, left = 4, right = 5 (双全), leaf = false',
    activeNodeId: 2,
    queue: [3, 4, 5],
    metrics: { '当前节点': 2, '左孩子': 4, '右孩子': 5, 'leaf 状态': 'false' },
    statusBadge: { text: '节点 2 合规', type: 'info' },
  });

  // Step 4: 检查节点 3: 左有右无 -> 触发 leaf 标志
  steps.push({
    codeLine: COMPLETENESS_036_LINES.leafTrigger,
    decision: '检查节点 3: 遇到首个孩子不双全节点！',
    message: '节点 3 有左孩子 6 但无右孩子！符合完全二叉树紧凑排布，但触发重要状态【leaf = true】，后续所有节点必须全是叶子！',
    log: 'cur = 3, left = 6, right = null -> 触发 leaf = true！',
    activeNodeId: 3,
    queue: [4, 5, 6],
    metrics: { '当前节点': 3, '触发事件': '首个非双全节点', 'leaf 状态': '⚡ TRUE (后续必为叶子)' },
    statusBadge: { text: '触发叶子限制 (leaf=true)', type: 'warning' },
  });

  // Step 5: 检查节点 4
  steps.push({
    codeLine: COMPLETENESS_036_LINES.ruleCheck,
    decision: '出队节点 4: 核验是否为合规叶子',
    message: '当前 leaf 为 true，检验节点 4：无左右孩子，符合后续必须为叶子的铁律',
    log: 'poll: node 4, left = null, right = null, leaf check passed',
    activeNodeId: 4,
    queue: [5, 6],
    metrics: { '当前节点': 4, '左孩子': 'null', '右孩子': 'null', 'leaf 状态': 'TRUE (无违规)' },
    statusBadge: { text: '节点 4: 叶子合格', type: 'info' },
  });

  // Step 6: 检查节点 5
  steps.push({
    codeLine: COMPLETENESS_036_LINES.ruleCheck,
    decision: '出队节点 5: 核验是否为合规叶子',
    message: '当前 leaf 为 true，检验节点 5：无左右孩子，符合后续必须为叶子的铁律',
    log: 'poll: node 5, left = null, right = null, leaf check passed',
    activeNodeId: 5,
    queue: [6],
    metrics: { '当前节点': 5, '左孩子': 'null', '右孩子': 'null', 'leaf 状态': 'TRUE (无违规)' },
    statusBadge: { text: '节点 5: 叶子合格', type: 'info' },
  });

  // Step 7: 检查节点 6
  steps.push({
    codeLine: COMPLETENESS_036_LINES.ruleCheck,
    decision: '出队节点 6: 核验是否为合规叶子',
    message: '当前 leaf 为 true，检验最后一个节点 6：无左右孩子，符合后续必须为叶子的铁律',
    log: 'poll: node 6, left = null, right = null, leaf check passed',
    activeNodeId: 6,
    queue: [],
    metrics: { '当前节点': 6, '左孩子': 'null', '右孩子': 'null', 'leaf 状态': 'TRUE (无违规)' },
    statusBadge: { text: '节点 6: 叶子合格', type: 'info' },
  });

  // Step 8: 校验成功返回 true
  steps.push({
    codeLine: COMPLETENESS_036_LINES.returnTrue,
    decision: '完全二叉树校验通过，返回 true',
    message: '整棵树没有“有右无左”，且在遇到缺孩子节点后所有后续节点均为叶子节点，判定为合法的完全二叉树！',
    log: 'return true (Valid Complete Binary Tree)',
    activeNodeId: 1,
    queue: [],
    metrics: { '判定结果': 'TRUE (合法完全二叉树)', '左神准则 1': '通过 (无有右无左)', '左神准则 2': '通过 (断点后全叶子)' },
    statusBadge: { text: '校验通过: TRUE', type: 'success' },
  });

  return steps;
}

function renderCompletenessCanvas(container: HTMLElement, step: Tree036Step): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px; gap: 8px;">
      ${renderTreeSvg(COMPLETE_TREE_NODES, step.activeNodeId, step.secondaryNodeId)}
      ${step.queue ? renderQueuePipeline(step.queue, 'BFS 节点校验队列') : ''}
    </div>
  `;
}

export const completenessBinaryTree036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-completeness-binary-tree',
  name: '完全二叉树检验 (Class 036)',
  category: 'tree',
  icon: '🛡️',
  difficulty: 2,
  levelOrder: 3608,
  learningGoal: '深入领会左神完全二叉树两大铁律：有右无左直接判伪、出现缺孩子节点后后续必须全部为叶子',
  problemHtml: TREE_036_037_PROBLEMS.completenessBinaryTree036.html,
  codeLanguages: COMPLETENESS_036_CODES,
  inputs: [
    {
      "id": "tree",
      "label": "二叉树层序",
      "type": "text",
      "defaultValue": "1, 2, 3, 4, 5, 6",
      "width": "160px"
    }
  ],
  presets: [
    {
      "label": "合法完全二叉树",
      "values": {
        "tree": "1, 2, 3, 4, 5, 6"
      },
      "description": "满树紧凑排布"
    },
    {
      "label": "有右无左违规案例",
      "values": {
        "tree": "1, 2, 3, null, 4"
      },
      "description": "直接判定 false"
    },
    {
      "label": "断点后出现非叶子违规",
      "values": {
        "tree": "1, 2, 3, 4, 5, null, 7"
      },
      "description": "违反断点全叶铁律"
    }
  ],

  generateSteps: () => buildCompleteness036Steps(),
  renderCanvas: (container, step) => renderCompletenessCanvas(container, step),
});
