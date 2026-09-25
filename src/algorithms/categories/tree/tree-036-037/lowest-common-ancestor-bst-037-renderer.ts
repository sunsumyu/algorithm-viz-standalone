/**
 * 左程云算法通关课 Class 037: 二叉搜索树最近公共祖先 (LCA in BST / LeetCode 235)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
} from './tree-036-037-shared';
import { LCA_BST_037_CODES, LCA_BST_037_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

// 二叉搜索树标准结构: 根 6 -> 左 2 (0, 4 -> 3, 5), 右 8 (7, 9)
const BST_LCA_NODES: TreeNode036[] = [
  { id: 1, val: 6, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 2, left: 4, right: 5, x: 100, y: 95 },
  { id: 3, val: 8, left: 6, right: 7, x: 300, y: 95 },
  { id: 4, val: 0, left: null, right: null, x: 50, y: 155 },
  { id: 5, val: 4, left: 8, right: 9, x: 140, y: 155 },
  { id: 6, val: 7, left: null, right: null, x: 260, y: 155 },
  { id: 7, val: 9, left: null, right: null, x: 340, y: 155 },
  { id: 8, val: 3, left: null, right: null, x: 115, y: 215 },
  { id: 9, val: 5, left: null, right: null, x: 165, y: 215 },
];

export function buildLcaBst037Steps(treeRaw?: string, pInput?: number | string, qInput?: number | string): Tree036Step[] {
  const steps: Tree036Step[] = [];
  const pVal = (pInput !== undefined && pInput !== '' && !isNaN(Number(pInput))) ? Number(pInput) : 3;
  const qVal = (qInput !== undefined && qInput !== '' && !isNaN(Number(qInput))) ? Number(qInput) : 5;
  const minVal = Math.min(pVal, qVal);
  const maxVal = Math.max(pVal, qVal);

  const nodes = BST_LCA_NODES;
  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));
  const valToNode = new Map<number, TreeNode036>(nodes.map((n) => [n.val, n]));

  const pNode = valToNode.get(pVal);
  const qNode = valToNode.get(qVal);

  let cur: TreeNode036 | undefined = nodes[0]; // root 6

  // Step 1: 入口
  steps.push({
    codeLine: LCA_BST_037_LINES.entry,
    decision: `在 BST 中寻找目标节点 p = ${pVal} 与 q = ${qVal} 的 LCA`,
    message: `利用 BST「左小右大」数值单调性：目标区间 [${minVal}, ${maxVal}]。若当前节点同时大于两者则左转；若同时小于两者则右转；首次分叉即为 LCA！`,
    log: `lowestCommonAncestorBST(root: ${cur?.val}, p: ${pVal}, q: ${qVal})`,
    activeNodeId: cur?.id ?? 1,
    secondaryNodeId: pNode?.id ?? qNode?.id,
    metrics: { '目标 p': pVal, '目标 q': qVal, '当前指针': `节点 ${cur?.val}`, '时间复杂度': 'O(h)' },
    statusBadge: { text: '算法启动', type: 'info' },
    extraData: { treeNodes: nodes },
  });

  while (cur) {
    if (cur.val > maxVal) {
      // 两个目标都在左子树
      const nextLeftId: number | null | undefined = cur.left;
      const nextNode: TreeNode036 | undefined = nextLeftId != null ? nodeMap.get(nextLeftId) : undefined;
      steps.push({
        codeLine: LCA_BST_037_LINES.goLeft,
        decision: `当前节点 ${cur.val} 同时大于 p(${pVal}) 与 q(${qVal})，向左子树深入`,
        message: `${cur.val} > ${pVal} 且 ${cur.val} > ${qVal}：说明两目标均在左子树中，指针移向 root.left (节点 ${nextNode ? nextNode.val : nextLeftId})`,
        log: `root.val (${cur.val}) > max(${pVal}, ${qVal}) -> root = root.left (${nextNode?.val ?? nextLeftId})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: { '当前数值': cur.val, '数值比较': `${cur.val} > ${pVal} 且 ${cur.val} > ${qVal}`, '走向': '向左子树深入 ⬅️' },
        statusBadge: { text: `向左走: ${nextNode?.val ?? nextLeftId}`, type: 'warning' },
        extraData: { treeNodes: nodes },
      });
      cur = nextNode;
    } else if (cur.val < minVal) {
      // 两个目标都在右子树
      const nextRightId: number | null | undefined = cur.right;
      const nextNode: TreeNode036 | undefined = nextRightId != null ? nodeMap.get(nextRightId) : undefined;
      steps.push({
        codeLine: LCA_BST_037_LINES.goRight,
        decision: `当前节点 ${cur.val} 同时小于 p(${pVal}) 与 q(${qVal})，向右子树深入`,
        message: `${cur.val} < ${pVal} 且 ${cur.val} < ${qVal}：说明两目标均在右子树中，指针移向 root.right (节点 ${nextNode ? nextNode.val : nextRightId})`,
        log: `root.val (${cur.val}) < min(${pVal}, ${qVal}) -> root = root.right (${nextNode?.val ?? nextRightId})`,
        activeNodeId: cur.id,
        secondaryNodeId: nextNode?.id,
        metrics: { '当前数值': cur.val, '数值比较': `${cur.val} < ${pVal} 且 ${cur.val} < ${qVal}`, '走向': '向右子树深入 ➡️' },
        statusBadge: { text: `向右走: ${nextNode?.val ?? nextRightId}`, type: 'warning' },
        extraData: { treeNodes: nodes },
      });
      cur = nextNode;
    } else {
      // 分叉命中或当前节点即是其中之一
      const isDirectMatch = cur.val === pVal || cur.val === qVal;
      steps.push({
        codeLine: LCA_BST_037_LINES.splitFork,
        decision: isDirectMatch
          ? `当前节点 ${cur.val} 即为目标之一，命中 LCA！`
          : `节点 ${cur.val} 介于 p(${pVal}) 与 q(${qVal}) 之间，分叉命中 LCA！`,
        message: isDirectMatch
          ? `当前节点 ${cur.val} 自身即为目标节点，且另一目标在其子树中，根据 LCA 定义当前节点即为最近公共祖先！`
          : `节点 ${cur.val} 满足 ${minVal} <= ${cur.val} <= ${maxVal}：p(${pVal}) 与 q(${qVal}) 在此首次分流，节点 ${cur.val} 必为最近公共祖先！`,
        log: `分叉点确定: lowestCommonAncestor = TreeNode(${cur.val})`,
        activeNodeId: cur.id,
        secondaryNodeId: pNode?.id ?? qNode?.id,
        metrics: {
          '分叉节点 (LCA)': `节点 ${cur.val}`,
          '目标 p': pVal,
          '目标 q': qVal,
          '判定性质': isDirectMatch ? '当前节点为目标之一' : '数值分叉点',
        },
        statusBadge: { text: `命中 LCA: 节点 ${cur.val}`, type: 'success' },
        extraData: { treeNodes: nodes },
      });
      break;
    }
  }

  return steps;
}

function renderLcaBstCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || BST_LCA_NODES;
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
    </div>
  `;
}

export const lowestCommonAncestorBst037Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-037-lowest-common-ancestor-bst',
  aliases: ['bst-lca'],
  name: '二叉搜索树最近公共祖先 (Class 037)',
  category: 'tree',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 3702,
  learningGoal: '领会二叉搜索树分叉点定理，利用数值单调性在 O(h) 时间与 O(1) 空间内直接定位 LCA',
  problemHtml: TREE_036_037_PROBLEMS.lowestCommonAncestorBst037.html,
  codeLanguages: LCA_BST_037_CODES,
  inputs: [
    {
      "id": "tree",
      "label": "BST 层序",
      "type": "text",
      "defaultValue": "6, 2, 8, 0, 4, 7, 9, null, null, 3, 5",
      "width": "180px"
    },
    {
      "id": "p",
      "label": "节点 p",
      "type": "number",
      "defaultValue": "3",
      "width": "60px"
    },
    {
      "id": "q",
      "label": "节点 q",
      "type": "number",
      "defaultValue": "5",
      "width": "60px"
    }
  ],
  presets: [
    {
      "label": "分叉在深层 (p=3, q=5 -> 4)",
      "values": {
        "tree": "6, 2, 8, 0, 4, 7, 9, null, null, 3, 5",
        "p": "3",
        "q": "5"
      }
    },
    {
      "label": "分叉点在根 (p=2, q=8 -> 6)",
      "values": {
        "tree": "6, 2, 8, 0, 4, 7, 9, null, null, 3, 5",
        "p": "2",
        "q": "8"
      }
    },
    {
      "label": "分叉在左树 (p=2, q=4 -> 2)",
      "values": {
        "tree": "6, 2, 8, 0, 4, 7, 9, null, null, 3, 5",
        "p": "2",
        "q": "4"
      }
    }
  ],

  generateSteps: (inputs) => buildLcaBst037Steps(inputs?.tree, inputs?.p, inputs?.q),
  renderCanvas: (container, step) => renderLcaBstCanvas(container, step),
});
