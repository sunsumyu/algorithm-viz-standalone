/**
 * 左程云算法通关课 Class 019: 二叉树高频递归套路 (Tree Recursion Patterns / Tree DP)
 * 平衡二叉树、搜索二叉树、二叉树最大节点距离三大阶段演化
 * 4-Card 声明式标准化架构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { TREE_RECURSION_019_PROBLEM_CONTENT } from './tree-recursion-patterns-019-problem-content';
import {
  TREE_RECURSION_019_CODES,
  TREE_RECURSION_019_CODE_LINES,
  TREE_RECURSION_STAGE2_CODES,
  TREE_RECURSION_STAGE2_LINES,
  TREE_RECURSION_STAGE3_CODES,
  TREE_RECURSION_STAGE3_LINES,
} from './tree-recursion-patterns-019-stage-codes';

export {
  TREE_RECURSION_019_CODES,
  TREE_RECURSION_019_CODE_LINES,
  TREE_RECURSION_STAGE2_CODES,
  TREE_RECURSION_STAGE2_LINES,
  TREE_RECURSION_STAGE3_CODES,
  TREE_RECURSION_STAGE3_LINES,
};

// ============================================================
// 树节点与步骤数据结构定义
// ============================================================
export interface TreeNodeData {
  id: number;
  val: number;
  left?: number;
  right?: number;
}

export interface TreeRecursionStep extends StepBase {
  stepIndex?: number;
  nodes: TreeNodeData[];
  currentNodeId: number | null;
  phase: 'enter' | 'left-done' | 'right-done' | 'return';
  collectedInfo: {
    height: number;
    isBalanced: boolean;
    minVal?: number;
    maxVal?: number;
    isBST?: boolean;
    maxDistance?: number;
  };
  leftInfoSnapshot?: any;
  rightInfoSnapshot?: any;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  stageId?: 'stage1' | 'stage2' | 'stage3';
}

// ============================================================
// 自动树拓扑坐标计算器 (中序遍历排版，绝无重叠)
// ============================================================
interface LayoutNode {
  id: number;
  val: number;
  depth: number;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

function calculateTreeLayout(nodes: TreeNodeData[], width = 760, height = 260): Map<number, LayoutNode> {
  const layout = new Map<number, LayoutNode>();
  if (!nodes || nodes.length === 0) return layout;

  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const childIds = new Set<number>();
  nodes.forEach((n) => {
    if (n.left !== undefined) childIds.add(n.left);
    if (n.right !== undefined) childIds.add(n.right);
  });
  const rootNode = nodes.find((n) => !childIds.has(n.id)) || nodes[0];

  const inOrderList: number[] = [];
  function inorder(id: number | undefined, depth: number) {
    if (id === undefined || !nodeMap.has(id)) return;
    const node = nodeMap.get(id)!;
    inorder(node.left, depth + 1);
    inOrderList.push(id);
    inorder(node.right, depth + 1);
  }
  inorder(rootNode.id, 0);

  const total = inOrderList.length;
  const paddingX = 60;
  const availableW = width - paddingX * 2;
  const stepX = total > 1 ? availableW / (total - 1) : 0;

  function assignPositions(id: number | undefined, depth: number) {
    if (id === undefined || !nodeMap.has(id)) return;
    const node = nodeMap.get(id)!;
    const order = inOrderList.indexOf(id);
    const x = total > 1 ? paddingX + order * stepX : width / 2;
    const y = 45 + depth * 60;
    layout.set(id, {
      id,
      val: node.val,
      depth,
      x,
      y,
      left: node.left,
      right: node.right,
    });
    assignPositions(node.left, depth + 1);
    assignPositions(node.right, depth + 1);
  }

  assignPositions(rootNode.id, 0);
  return layout;
}

// ============================================================
// Stage 1: 平衡二叉树判定 (Is Balanced)
// 保持 100% 既有测试不可篡改契约 (generateTreeRecursionSteps)
// ============================================================
export function generateTreeRecursionSteps(treeNodes: TreeNodeData[]): TreeRecursionStep[] {
  const steps: TreeRecursionStep[] = [];
  const nodeMap = new Map<number, TreeNodeData>();
  treeNodes.forEach((n) => nodeMap.set(n.id, n));

  const rootId = treeNodes.length > 0 ? treeNodes[0].id : null;
  if (!rootId) {
    steps.push({
      stepIndex: 0,
      nodes: [],
      currentNodeId: null,
      phase: 'return',
      collectedInfo: { height: 0, isBalanced: true },
      decision: '空树天然为平衡二叉树，高度为 0',
      message: '树为空',
      log: '空树处理完毕',
      codeLine: TREE_RECURSION_019_CODE_LINES.baseCase,
      statusBadge: { text: '空树', type: 'info' },
      stageId: 'stage1',
    });
    return steps;
  }

  let stepIdx = 0;

  function dfs(id: number | undefined): { height: number; isBalanced: boolean } {
    if (id === undefined || !nodeMap.has(id)) {
      steps.push({
        stepIndex: stepIdx++,
        nodes: treeNodes,
        currentNodeId: null,
        phase: 'return',
        collectedInfo: { height: 0, isBalanced: true },
        decision: '到达空节点 (Null)，返回 Base Case: {isBalanced: true, height: 0}',
        message: '空节点返回',
        log: 'Null -> 返回高度 0',
        codeLine: TREE_RECURSION_019_CODE_LINES.baseCase,
        statusBadge: { text: '空节点', type: 'info' },
        stageId: 'stage1',
      });
      return { height: 0, isBalanced: true };
    }

    const node = nodeMap.get(id)!;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'enter',
      collectedInfo: { height: 0, isBalanced: true },
      decision: `进入节点 [${node.val}]，准备向左子树递归收集信息`,
      message: `访问节点 ${node.val}`,
      log: `进入节点 ${node.val}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.enterLeft,
      statusBadge: { text: `进入 Node ${node.val}`, type: 'info' },
      stageId: 'stage1',
    });

    const left = dfs(node.left);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'left-done',
      collectedInfo: { height: left.height, isBalanced: left.isBalanced },
      leftInfoSnapshot: left,
      decision: `节点 [${node.val}] 左子树收集完毕：高度=${left.height}，是否平衡=${left.isBalanced}。准备向右子树收集信息`,
      message: `左子树信息就绪`,
      log: `节点 ${node.val} 左树高度 ${left.height}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.leftDone,
      statusBadge: { text: `左树完成`, type: 'warning' },
      stageId: 'stage1',
    });

    const right = dfs(node.right);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'right-done',
      collectedInfo: { height: Math.max(left.height, right.height) + 1, isBalanced: false },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 右子树收集完毕：高度=${right.height}，是否平衡=${right.isBalanced}。整合左右信息计算自身`,
      message: `左右子树信息均就绪`,
      log: `节点 ${node.val} 右树高度 ${right.height}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.rightDone,
      statusBadge: { text: `信息聚合`, type: 'warning' },
      stageId: 'stage1',
    });

    const myHeight = Math.max(left.height, right.height) + 1;
    const isBalanced = left.isBalanced && right.isBalanced && Math.abs(left.height - right.height) <= 1;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'return',
      collectedInfo: { height: myHeight, isBalanced },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 整合结果：高度=${myHeight}，高度差=|${left.height} - ${right.height}|=${Math.abs(left.height - right.height)} <= 1，平衡状态=${isBalanced}`,
      message: `向上层返回结果`,
      log: `Node ${node.val} -> {h: ${myHeight}, balanced: ${isBalanced}}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.returnInfo,
      statusBadge: isBalanced ? { text: `平衡 (${myHeight})`, type: 'success' } : { text: `不平衡`, type: 'danger' },
      stageId: 'stage1',
    });

    return { height: myHeight, isBalanced };
  }

  dfs(rootId);
  return steps;
}

// ============================================================
// Stage 2: 搜索二叉树判定 (Is BST)
// ============================================================
export function generateTreeBstSteps(treeNodes: TreeNodeData[]): TreeRecursionStep[] {
  const steps: TreeRecursionStep[] = [];
  const nodeMap = new Map<number, TreeNodeData>();
  treeNodes.forEach((n) => nodeMap.set(n.id, n));
  const rootId = treeNodes.length > 0 ? treeNodes[0].id : null;

  if (!rootId) {
    steps.push({
      stepIndex: 0,
      nodes: [],
      currentNodeId: null,
      phase: 'return',
      collectedInfo: { height: 0, isBalanced: true, isBST: true },
      decision: '空树天然为二叉搜索树 (BST)',
      message: '树为空',
      log: '空树处理',
      codeLine: TREE_RECURSION_STAGE2_LINES.baseCase,
      statusBadge: { text: '空树', type: 'info' },
      stageId: 'stage2',
    });
    return steps;
  }

  let stepIdx = 0;

  interface BSTInfo {
    isBST: boolean;
    min: number;
    max: number;
  }

  function dfs(id: number | undefined): BSTInfo | null {
    if (id === undefined || !nodeMap.has(id)) {
      steps.push({
        stepIndex: stepIdx++,
        nodes: treeNodes,
        currentNodeId: null,
        phase: 'return',
        collectedInfo: { height: 0, isBalanced: true, isBST: true },
        decision: '空节点返回 null，便于父节点搜集极值',
        message: '空节点返回 null',
        log: 'Null -> 返回 null',
        codeLine: TREE_RECURSION_STAGE2_LINES.baseCase,
        statusBadge: { text: 'Null', type: 'info' },
        stageId: 'stage2',
      });
      return null;
    }

    const node = nodeMap.get(id)!;
    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'enter',
      collectedInfo: { height: 0, isBalanced: true, isBST: true },
      decision: `进入节点 [${node.val}]，准备向左子树递归搜集 BST 信息`,
      message: `访问节点 ${node.val}`,
      log: `进入节点 ${node.val}`,
      codeLine: TREE_RECURSION_STAGE2_LINES.enterLeft,
      statusBadge: { text: `Node ${node.val}`, type: 'info' },
      stageId: 'stage2',
    });

    const left = dfs(node.left);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'left-done',
      collectedInfo: { height: 1, isBalanced: true, isBST: left ? left.isBST : true },
      leftInfoSnapshot: left,
      decision: `节点 [${node.val}] 左子树就绪：${left ? `isBST=${left.isBST}, min=${left.min}, max=${left.max}` : '空子树'}。深入右子树`,
      message: `左子树汇报完毕`,
      log: `左子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE2_LINES.leftDone,
      statusBadge: { text: `左树完成`, type: 'warning' },
      stageId: 'stage2',
    });

    const right = dfs(node.right);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'right-done',
      collectedInfo: { height: 1, isBalanced: true, isBST: false },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 左右子树均就绪。开始校验 BST 判定条件：左大 < ${node.val} < 右小`,
      message: `左右子树汇报完毕`,
      log: `左右子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE2_LINES.rightDone,
      statusBadge: { text: `汇总信息`, type: 'warning' },
      stageId: 'stage2',
    });

    let min = node.val;
    let max = node.val;
    if (left) {
      min = Math.min(min, left.min);
      max = Math.max(max, left.max);
    }
    if (right) {
      min = Math.min(min, right.min);
      max = Math.max(max, right.max);
    }

    let isBST = true;
    if (left && (!left.isBST || left.max >= node.val)) isBST = false;
    if (right && (!right.isBST || right.min <= node.val)) isBST = false;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'return',
      collectedInfo: { height: 1, isBalanced: true, isBST, minVal: min, maxVal: max },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 判定结果：isBST=${isBST}, 覆盖区间=[${min}, ${max}]`,
      message: `向父节点返回 BST 判定结果`,
      log: `Node ${node.val} -> {isBST: ${isBST}, [${min}, ${max}]}`,
      codeLine: TREE_RECURSION_STAGE2_LINES.returnInfo,
      statusBadge: isBST ? { text: `BST 合法`, type: 'success' } : { text: `BST 失效`, type: 'danger' },
      stageId: 'stage2',
    });

    return { isBST, min, max };
  }

  dfs(rootId);
  return steps;
}

// ============================================================
// Stage 3: 二叉树最大节点距离 (Max Distance)
// ============================================================
export function generateTreeMaxDistSteps(treeNodes: TreeNodeData[]): TreeRecursionStep[] {
  const steps: TreeRecursionStep[] = [];
  const nodeMap = new Map<number, TreeNodeData>();
  treeNodes.forEach((n) => nodeMap.set(n.id, n));
  const rootId = treeNodes.length > 0 ? treeNodes[0].id : null;

  if (!rootId) {
    steps.push({
      stepIndex: 0,
      nodes: [],
      currentNodeId: null,
      phase: 'return',
      collectedInfo: { height: 0, isBalanced: true, maxDistance: 0 },
      decision: '空树最大节点距离为 0，高度为 0',
      message: '树为空',
      log: '空树处理',
      codeLine: TREE_RECURSION_STAGE3_LINES.baseCase,
      statusBadge: { text: '空树', type: 'info' },
      stageId: 'stage3',
    });
    return steps;
  }

  let stepIdx = 0;

  interface DistInfo {
    maxDistance: number;
    height: number;
  }

  function dfs(id: number | undefined): DistInfo {
    if (id === undefined || !nodeMap.has(id)) {
      steps.push({
        stepIndex: stepIdx++,
        nodes: treeNodes,
        currentNodeId: null,
        phase: 'return',
        collectedInfo: { height: 0, isBalanced: true, maxDistance: 0 },
        decision: '空节点返回 Base Case: {maxDistance: 0, height: 0}',
        message: '空节点返回',
        log: 'Null -> dist=0, h=0',
        codeLine: TREE_RECURSION_STAGE3_LINES.baseCase,
        statusBadge: { text: 'Null', type: 'info' },
        stageId: 'stage3',
      });
      return { maxDistance: 0, height: 0 };
    }

    const node = nodeMap.get(id)!;
    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'enter',
      collectedInfo: { height: 0, isBalanced: true, maxDistance: 0 },
      decision: `进入节点 [${node.val}]，准备向左子树搜集最大距离与高度`,
      message: `访问节点 ${node.val}`,
      log: `进入节点 ${node.val}`,
      codeLine: TREE_RECURSION_STAGE3_LINES.enterLeft,
      statusBadge: { text: `Node ${node.val}`, type: 'info' },
      stageId: 'stage3',
    });

    const left = dfs(node.left);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'left-done',
      collectedInfo: { height: left.height, isBalanced: true, maxDistance: left.maxDistance },
      leftInfoSnapshot: left,
      decision: `节点 [${node.val}] 左子树汇报完毕：maxDist=${left.maxDistance}, height=${left.height}。深入右子树`,
      message: `左子树汇报完毕`,
      log: `左子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE3_LINES.leftDone,
      statusBadge: { text: `左树完成`, type: 'warning' },
      stageId: 'stage3',
    });

    const right = dfs(node.right);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'right-done',
      collectedInfo: { height: Math.max(left.height, right.height) + 1, isBalanced: true, maxDistance: Math.max(left.maxDistance, right.maxDistance) },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 左右子树均就绪。对比三种可能性：1.左树内(${left.maxDistance}); 2.右树内(${right.maxDistance}); 3.过当前根(${left.height}+${right.height}+1=${left.height + right.height + 1})`,
      message: `左右子树汇报完毕`,
      log: `左右子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE3_LINES.rightDone,
      statusBadge: { text: `聚合决策`, type: 'warning' },
      stageId: 'stage3',
    });

    const height = Math.max(left.height, right.height) + 1;
    const p1 = left.maxDistance;
    const p2 = right.maxDistance;
    const p3 = left.height + right.height + 1;
    const maxDist = Math.max(Math.max(p1, p2), p3);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'return',
      collectedInfo: { height, isBalanced: true, maxDistance: maxDist },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 整合结果：最大节点距离=${maxDist}，子树高度=${height}`,
      message: `向上层返回结果`,
      log: `Node ${node.val} -> {dist: ${maxDist}, h: ${height}}`,
      codeLine: TREE_RECURSION_STAGE3_LINES.returnInfo,
      statusBadge: { text: `距离 ${maxDist}`, type: 'success' },
      stageId: 'stage3',
    });

    return { maxDistance: maxDist, height };
  }

  dfs(rootId);
  return steps;
}

// ============================================================
// Card 1: 纯净二叉树拓扑沙盘 (SVG Canvas)
// 零内嵌公式卡片、零多余标题 (Anti-Traps 9 & 10)
// ============================================================
export function renderTreeRecursionCanvas(container: HTMLElement, step: TreeRecursionStep) {
  const { nodes, currentNodeId } = step;
  const layout = calculateTreeLayout(nodes, 760, 260);

  // 生成父子连线
  const linesHtml: string[] = [];
  layout.forEach((node) => {
    if (node.left !== undefined && layout.has(node.left)) {
      const leftChild = layout.get(node.left)!;
      const isHighlighted = currentNodeId === node.id || currentNodeId === leftChild.id;
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${leftChild.x}" y2="${leftChild.y}"
          stroke="${isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isHighlighted ? 2.5 : 1.5}"
        />
      `);
    }
    if (node.right !== undefined && layout.has(node.right)) {
      const rightChild = layout.get(node.right)!;
      const isHighlighted = currentNodeId === node.id || currentNodeId === rightChild.id;
      linesHtml.push(`
        <line
          x1="${node.x}" y1="${node.y}"
          x2="${rightChild.x}" y2="${rightChild.y}"
          stroke="${isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}"
          stroke-width="${isHighlighted ? 2.5 : 1.5}"
        />
      `);
    }
  });

  // 生成节点
  const nodesHtml: string[] = [];
  layout.forEach((node) => {
    const isCurrent = node.id === currentNodeId;
    const isReturn = isCurrent && step.phase === 'return';
    const baseColor = isCurrent ? '#38bdf8' : '#64748b';
    const fillColor = isCurrent ? (isReturn ? '#10b981' : '#0284c7') : '#1e293b';

    nodesHtml.push(`
      <g transform="translate(${node.x}, ${node.y})">
        ${isCurrent ? `<circle r="26" fill="none" stroke="${baseColor}" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="19"
          fill="${fillColor}"
          stroke="${isCurrent ? '#ffffff' : 'rgba(255,255,255,0.2)'}"
          stroke-width="${isCurrent ? 2.5 : 1.5}"
        />
        <text
          y="5"
          text-anchor="middle"
          fill="#f8fafc"
          font-size="12"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${node.val}</text>
        <text
          y="-25"
          text-anchor="middle"
          fill="#94a3b8"
          font-size="9"
          font-family="monospace"
        >ID #${node.id}</text>
      </g>
    `);
  });

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; box-sizing: border-box;">
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); overflow: hidden;">
        <svg viewBox="0 0 760 260" style="width: 100%; height: 100%; max-height: 280px;" preserveAspectRatio="xMidYMid meet">
          ${linesHtml.join('')}
          ${nodesHtml.join('')}
        </svg>
      </div>
    </div>
  `;
}

// ============================================================
// Card 2: 树形 DP Info 结构体探针面板 (Custom Metrics)
// ============================================================
export function renderTreeRecursionCard2(container: HTMLElement, step: TreeRecursionStep) {
  const { currentNodeId, phase, collectedInfo, decision, leftInfoSnapshot, rightInfoSnapshot, stageId } = step;

  const phaseText =
    phase === 'enter'
      ? '向下探测 (Enter)'
      : phase === 'left-done'
      ? '左树完毕 (Left Done)'
      : phase === 'right-done'
      ? '右树完毕 (Right Done)'
      : '信息汇聚返回 (Return)';

  const phaseColor =
    phase === 'enter'
      ? '#38bdf8'
      : phase === 'left-done' || phase === 'right-done'
      ? '#f59e0b'
      : '#10b981';

  let metric1Label = '计算高度 (Height)';
  let metric1Val = `${collectedInfo.height}`;
  let metric2Label = '平衡状态 (IsBalanced)';
  let metric2Val = collectedInfo.isBalanced ? 'TRUE (平衡)' : 'FALSE (失衡)';
  let metric2Color = collectedInfo.isBalanced ? '#10b981' : '#ef4444';

  if (stageId === 'stage2') {
    metric1Label = '覆盖极值区间 [Min, Max]';
    metric1Val = `[${collectedInfo.minVal ?? 'Null'}, ${collectedInfo.maxVal ?? 'Null'}]`;
    metric2Label = 'BST 成立状态';
    metric2Val = collectedInfo.isBST ? 'TRUE (合法 BST)' : 'FALSE (破损)';
    metric2Color = collectedInfo.isBST ? '#10b981' : '#ef4444';
  } else if (stageId === 'stage3') {
    metric1Label = '子树高度 (Height)';
    metric1Val = `${collectedInfo.height}`;
    metric2Label = '最大节点距离 (Max Distance)';
    metric2Val = `${collectedInfo.maxDistance ?? 0}`;
    metric2Color = '#f59e0b';
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 顶部探针三联药丸 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">当前递归节点</div>
          <div style="font-size: 1.05rem; font-weight: bold; color: #38bdf8; font-family: monospace; margin-top: 2px;">
            ${currentNodeId !== null ? `Node #${currentNodeId}` : 'Null (空)'}
          </div>
        </div>
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">递归生命周期</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: ${phaseColor}; margin-top: 2px;">
            ${phaseText}
          </div>
        </div>
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">${metric2Label}</div>
          <div style="font-size: 1.05rem; font-weight: bold; color: ${metric2Color}; font-family: monospace; margin-top: 2px;">
            ${metric2Val}
          </div>
        </div>
      </div>

      <!-- Info 结构体探针三联视窗 (左子树 Info | 当前决策聚合 | 右子树 Info) -->
      <div style="display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 8px; flex: 1;">
        <!-- Left Info -->
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; font-size: 0.75rem;">
          <div style="font-weight: 600; color: #38bdf8; margin-bottom: 4px;">左子树 Info (Left)</div>
          ${
            leftInfoSnapshot
              ? `<div style="font-family: monospace; color: #cbd5e1; line-height: 1.5;">${JSON.stringify(leftInfoSnapshot, null, 1).replace(/[{}]/g, '')}</div>`
              : `<div style="color: #64748b; font-style: italic;">尚未收集或为空</div>`
          }
        </div>

        <!-- Current Decision -->
        <div style="padding: 10px; background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; font-size: 0.75rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-weight: 600; color: #38bdf8;">后序聚合决策 (Aggregate)</div>
          <div style="color: #e2e8f0; line-height: 1.4; margin: 4px 0;">${decision}</div>
          <div style="font-size: 0.7rem; color: #94a3b8;">指标: <strong style="color: #f8fafc;">${metric1Label}: ${metric1Val}</strong></div>
        </div>

        <!-- Right Info -->
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; font-size: 0.75rem;">
          <div style="font-weight: 600; color: #fb7185; margin-bottom: 4px;">右子树 Info (Right)</div>
          ${
            rightInfoSnapshot
              ? `<div style="font-family: monospace; color: #cbd5e1; line-height: 1.5;">${JSON.stringify(rightInfoSnapshot, null, 1).replace(/[{}]/g, '')}</div>`
              : `<div style="color: #64748b; font-style: italic;">尚未收集或为空</div>`
          }
        </div>
      </div>

      <!-- 核心树形 DP 三步法法则 -->
      <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.06); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.74rem; color: #cbd5e1; line-height: 1.4;">
        <strong style="color: #38bdf8;">树形 DP 递归套路：</strong>
        1. 统一设计结构体 Info；2. 假设左右子树均已返回 Info；3. 汇总左右信息计算当前节点 Info 并返回。
      </div>
    </div>
  `;
}

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const treeRecursion019Visualizer = registerDeclarativeAlgorithm<TreeRecursionStep>({
  id: 'tree-recursion-patterns-019',
  name: '二叉树高频递归套路 (Class 019)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 19,
  aliases: ['class019-code01', 'tree-recursion-patterns-019', 'tree-dp-patterns'],
  learningGoal: '彻底掌握树形 DP 递归套路，学会设计统一 Info 结构体解决平衡树、搜索二叉树与树最大距离等高频考题',
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 平衡二叉树判定 (Is Balanced)',
      shortName: '平衡判定',
      card2Title: '平衡树 DP Info 探针面板',
      card2Desc: '后序自底向上搜集 Info(isBalanced, height)',
      codeLanguages: TREE_RECURSION_019_CODES,
      generateSteps: (input) => {
        const isUnbalanced = input?.treeType === 'unbalanced';
        const nodes: TreeNodeData[] = isUnbalanced
          ? [
              { id: 1, val: 1, left: 2 },
              { id: 2, val: 2, left: 3 },
              { id: 3, val: 3, left: 4 },
              { id: 4, val: 4 },
            ]
          : [
              { id: 1, val: 1, left: 2, right: 3 },
              { id: 2, val: 2, left: 4, right: 5 },
              { id: 3, val: 3 },
              { id: 4, val: 4 },
              { id: 5, val: 5 },
            ];
        return generateTreeRecursionSteps(nodes);
      },
    },
    {
      id: 'stage2',
      name: 'Stage 2: 搜索二叉树判定 (Is BST)',
      shortName: 'BST判定',
      card2Title: 'BST 递归套路 Info 探针面板',
      card2Desc: '后序自底向上搜集 Info(isBST, min, max)',
      codeLanguages: TREE_RECURSION_STAGE2_CODES,
      generateSteps: (input) => {
        const isUnbalanced = input?.treeType === 'unbalanced';
        const nodes: TreeNodeData[] = isUnbalanced
          ? [
              { id: 1, val: 10, left: 2 },
              { id: 2, val: 15, left: 3 }, // 15 在 10 的左子树，非法 BST
              { id: 3, val: 5 },
            ]
          : [
              { id: 1, val: 4, left: 2, right: 3 },
              { id: 2, val: 2, left: 4, right: 5 },
              { id: 3, val: 6 },
              { id: 4, val: 1 },
              { id: 5, val: 3 },
            ];
        return generateTreeBstSteps(nodes);
      },
    },
    {
      id: 'stage3',
      name: 'Stage 3: 二叉树最大节点距离 (Max Distance)',
      shortName: '最大距离',
      card2Title: '二叉树直径与最大距离探针',
      card2Desc: '横向对比左树内、右树内与过根节点三种可能性',
      codeLanguages: TREE_RECURSION_STAGE3_CODES,
      generateSteps: (input) => {
        const isUnbalanced = input?.treeType === 'unbalanced';
        const nodes: TreeNodeData[] = isUnbalanced
          ? [
              { id: 1, val: 1, left: 2 },
              { id: 2, val: 2, left: 3 },
              { id: 3, val: 3, left: 4 },
              { id: 4, val: 4 },
            ]
          : [
              { id: 1, val: 1, left: 2, right: 3 },
              { id: 2, val: 2, left: 4, right: 5 },
              { id: 3, val: 3 },
              { id: 4, val: 4 },
              { id: 5, val: 5 },
            ];
        return generateTreeMaxDistSteps(nodes);
      },
    },
  ],
  codeLanguages: TREE_RECURSION_019_CODES,
  inputs: [
    {
      id: 'treeType',
      label: '二叉树测试拓扑',
      type: 'select',
      defaultValue: 'balanced',
      options: [
        { label: '经典多层平衡/对称树', value: 'balanced' },
        { label: '破损/退化单链树', value: 'unbalanced' },
      ],
    },
  ],
  card2Title: '平衡树 DP Info 探针面板',
  card2Desc: '后序自底向上搜集 Info(isBalanced, height)',
  problemHtml: TREE_RECURSION_019_PROBLEM_CONTENT.description + TREE_RECURSION_019_PROBLEM_CONTENT.methodology,
  renderCanvas: (container, step) => {
    renderTreeRecursionCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTreeRecursionCard2(container, step);
  },
});
