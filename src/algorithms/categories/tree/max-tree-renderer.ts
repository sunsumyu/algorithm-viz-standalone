/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 经典分治与区间扫描 (Recursive Divide & Conquer, O(N log N) ~ O(N^2))
 *   Stage 2: 单调栈 O(N) 笛卡尔树 (Monotonic Stack Cartesian Tree, O(N))
 *   Stage 3: 显式任务栈迭代构建 (Explicit Construction Stack)
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, renderTreeSVG } from './tree-template';
import {
  MAX_TREE_STAGE1_CODES,
  MAX_TREE_STAGE1_LINES,
  MAX_TREE_STAGE2_CODES,
  MAX_TREE_STAGE2_LINES,
  MAX_TREE_STAGE3_CODES,
  MAX_TREE_STAGE3_LINES,
} from './max-tree-stage-codes';
import {
  MAX_TREE_PROBLEM_HTML,
  MAX_TREE_ANALYSIS_HTML,
} from './max-tree-problem-content';

export interface MaxTreeStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  maxVal: number | null;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  highlightNodes?: Set<number>;
  range?: [number, number];
  scanIdx?: number;
  maxIdx?: number;
  nums: number[];
  stackVals?: number[];
  activeNum?: number | null;
  metrics?: Record<string, string>;
  visitedNodes?: number[];
}

/** 收集树中所有有效节点值，支持全景高亮与收尾状态守卫 */
export function collectTreeValues(node: TreeNode | null): number[] {
  const result: number[] = [];
  function traverse(n: TreeNode | null) {
    if (!n) return;
    result.push(n.val);
    traverse(n.left);
    traverse(n.right);
  }
  traverse(node);
  return result;
}

import { cloneStateDepTree } from '../../../core/strategies/tree-clone';

// 辅助深拷贝树节点以记录快照 (委托通用 cloneStateDepTree 消除重复)
function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

// ----------------------------------------------------
// Stage 1: 递归分治与区间扫描
// ----------------------------------------------------
export function buildMaxTreeStage1Steps(nums: number[]): MaxTreeStep[] {
  const steps: MaxTreeStep[] = [];
  const lines = MAX_TREE_STAGE1_LINES;

  steps.push({
    tree: null,
    current: null,
    depth: 0,
    maxVal: null,
    nums: [...nums],
    message: '开始构建最大二叉树：采用分治递归与线性最值扫描',
    log: '初始化分治构建',
    codeLine: lines.entry,
  });

  if (!nums || nums.length === 0) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxVal: null,
      nums: [],
      message: '输入数组为空，返回空树 null',
      log: '空数组返回 null',
      codeLine: lines.check,
    });
    return steps;
  }

  // 维护一棵全局演进树
  let currentTree: TreeNode | null = null;

  const build = (l: number, r: number, depth: number): TreeNode | null => {
    steps.push({
      tree: cloneTree(currentTree),
      current: null,
      depth,
      maxVal: null,
      range: [l, r],
      nums: [...nums],
      message: `进入分治构建: 子数组区间 [${l}, ${r}]`,
      log: `build(l=${l}, r=${r})`,
      codeLine: lines.buildSignature,
    });

    if (l > r) {
      steps.push({
        tree: cloneTree(currentTree),
        current: null,
        depth,
        maxVal: null,
        range: [l, r],
        nums: [...nums],
        message: `区间 [${l}, ${r}] 为空 (l > r)，返回 null`,
        log: `l > r, 返回 null`,
        codeLine: lines.baseCase,
      });
      return null;
    }

    let maxIdx = l;
    steps.push({
      tree: cloneTree(currentTree),
      current: nums[l],
      depth,
      maxVal: nums[l],
      range: [l, r],
      scanIdx: l,
      maxIdx: l,
      nums: [...nums],
      message: `初始化区间最大值为 nums[${l}] = ${nums[l]}`,
      log: `区间最值初值: ${nums[l]} (索引 ${l})`,
      codeLine: lines.initMax,
    });

    for (let i = l + 1; i <= r; i++) {
      const isNewMax = nums[i] > nums[maxIdx];
      steps.push({
        tree: cloneTree(currentTree),
        current: nums[i],
        depth,
        maxVal: nums[maxIdx],
        range: [l, r],
        scanIdx: i,
        maxIdx,
        nums: [...nums],
        message: `扫描比较 nums[${i}] = ${nums[i]} 与当前最大值 nums[${maxIdx}] = ${nums[maxIdx]}`,
        log: `扫描 nums[${i}]=${nums[i]} ${isNewMax ? '> ' + nums[maxIdx] : '<= ' + nums[maxIdx]}`,
        codeLine: lines.scanLoop,
      });

      if (isNewMax) {
        maxIdx = i;
        steps.push({
          tree: cloneTree(currentTree),
          current: nums[i],
          depth,
          maxVal: nums[maxIdx],
          range: [l, r],
          scanIdx: i,
          maxIdx,
          nums: [...nums],
          message: `发现更大元素！更新最大值索引为 ${maxIdx}，最大值为 ${nums[maxIdx]}`,
          log: `更新最大值: ${nums[maxIdx]} (索引 ${maxIdx})`,
          codeLine: lines.updateMax,
        });
      }
    }

    const node: TreeNode = { val: nums[maxIdx], left: null, right: null };
    if (!currentTree) {
      currentTree = node;
    }

    steps.push({
      tree: cloneTree(currentTree),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [l, r],
      maxIdx,
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      message: `以最大值 ${node.val} 创建子树根节点`,
      log: `创建节点 ${node.val}`,
      codeLine: lines.createNode,
    });

    steps.push({
      tree: cloneTree(currentTree),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [l, maxIdx - 1],
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      message: `递归构建节点 ${node.val} 的左子树: 区间 [${l}, ${maxIdx - 1}]`,
      log: `递归左子树 [${l}, ${maxIdx - 1}]`,
      codeLine: lines.recurseLeft,
    });
    node.left = build(l, maxIdx - 1, depth + 1);

    steps.push({
      tree: cloneTree(currentTree),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [maxIdx + 1, r],
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      message: `递归构建节点 ${node.val} 的右子树: 区间 [${maxIdx + 1}, ${r}]`,
      log: `递归右子树 [${maxIdx + 1}, ${r}]`,
      codeLine: lines.recurseRight,
    });
    node.right = build(maxIdx + 1, r, depth + 1);

    steps.push({
      tree: cloneTree(currentTree),
      current: node.val,
      depth,
      maxVal: node.val,
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      message: `节点 ${node.val} 的左右子树构建完成，返回当前子树`,
      log: `完成子树 ${node.val}`,
      codeLine: lines.returnRoot,
    });

    return node;
  };

  const finalRoot = build(0, nums.length - 1, 0);
  const allTreeVals = collectTreeValues(finalRoot);

  steps.push({
    tree: cloneTree(finalRoot),
    current: finalRoot ? finalRoot.val : null,
    depth: 0,
    maxVal: finalRoot ? finalRoot.val : null,
    highlightNodes: new Set(allTreeVals),
    visitedNodes: allTreeVals,
    nums: [...nums],
    message: `最大二叉树构建完成，根节点为 ${finalRoot ? finalRoot.val : 'null'}`,
    log: `构建完成，根节点=${finalRoot ? finalRoot.val : 'null'}`,
    codeLine: lines.returnRoot,
  });

  return steps;
}

// ----------------------------------------------------
// Stage 2: 单调栈 O(N) 笛卡尔树构建
// ----------------------------------------------------
export function buildMaxTreeStage2StackSteps(nums: number[]): MaxTreeStep[] {
  const steps: MaxTreeStep[] = [];
  const lines = MAX_TREE_STAGE2_LINES;

  steps.push({
    tree: null,
    current: null,
    depth: 0,
    maxVal: null,
    nums: [...nums],
    stackVals: [],
    message: '开始单调栈笛卡尔树线性构建：维护单调递减栈',
    log: '初始化单调栈构建',
    codeLine: lines.entry,
  });

  if (!nums || nums.length === 0) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxVal: null,
      nums: [],
      stackVals: [],
      message: '输入数组为空，返回 null',
      log: '空数组返回 null',
      codeLine: lines.check,
    });
    return steps;
  }

  const stack: TreeNode[] = [];
  steps.push({
    tree: null,
    current: null,
    depth: 0,
    maxVal: null,
    nums: [...nums],
    stackVals: [],
    message: '初始化空单调栈 stack = []',
    log: '栈已就绪',
    codeLine: lines.initStack,
  });

  for (let idx = 0; idx < nums.length; idx++) {
    const num = nums[idx];
    const curr: TreeNode = { val: num, left: null, right: null };

    steps.push({
      tree: stack.length > 0 ? cloneTree(stack[0]) : null,
      current: num,
      depth: stack.length,
      maxVal: num,
      nums: [...nums],
      scanIdx: idx,
      activeNum: num,
      stackVals: stack.map((n) => n.val),
      highlightNodes: new Set([num]),
      message: `考察数组元素 nums[${idx}] = ${num}，创建新节点 ${num}`,
      log: `遍历 nums[${idx}]=${num}`,
      codeLine: lines.createCurr,
    });

    let lastPopped: TreeNode | null = null;
    while (stack.length > 0 && stack[stack.length - 1].val < num) {
      const popped = stack.pop()!;
      lastPopped = popped;
      curr.left = popped;

      steps.push({
        tree: cloneTree(curr),
        current: num,
        depth: stack.length,
        maxVal: num,
        nums: [...nums],
        scanIdx: idx,
        activeNum: num,
        stackVals: stack.map((n) => n.val),
        highlightNodes: new Set([num, popped.val]),
        message: `栈顶节点 ${popped.val} < ${num}：弹出并将 ${popped.val} 挂为 ${num} 的左子树`,
        log: `弹出 ${popped.val}，成为 ${num} 的左孩子`,
        codeLine: lines.attachLeft,
      });
    }

    if (stack.length > 0) {
      const topNode = stack[stack.length - 1];
      topNode.right = curr;
      steps.push({
        tree: cloneTree(stack[0]),
        current: num,
        depth: stack.length,
        maxVal: stack[0].val,
        nums: [...nums],
        scanIdx: idx,
        activeNum: num,
        stackVals: stack.map((n) => n.val),
        highlightNodes: new Set([topNode.val, num]),
        message: `栈不为空，当前栈顶 ${topNode.val} > ${num}：将 ${num} 挂为 ${topNode.val} 的右子树`,
        log: `${num} 成为栈顶 ${topNode.val} 的右孩子`,
        codeLine: lines.attachRight,
      });
    }

    stack.push(curr);
    steps.push({
      tree: cloneTree(stack[0]),
      current: num,
      depth: stack.length,
      maxVal: stack[0].val,
      nums: [...nums],
      scanIdx: idx,
      activeNum: num,
      stackVals: stack.map((n) => n.val),
      highlightNodes: new Set([num]),
      message: `将节点 ${num} 压入单调栈，当前栈状态: [${stack.map((n) => n.val).join(', ')}]`,
      log: `压栈 ${num}，栈深=${stack.length}`,
      codeLine: lines.pushCurr,
    });
  }

  const root = stack[0];
  const allTreeVals = collectTreeValues(root);

  steps.push({
    tree: cloneTree(root),
    current: root.val,
    depth: 1,
    maxVal: root.val,
    nums: [...nums],
    stackVals: stack.map((n) => n.val),
    highlightNodes: new Set(allTreeVals),
    visitedNodes: allTreeVals,
    message: `扫描结束，栈底节点 ${root.val} 即为全树最大根节点`,
    log: `构建完毕，笛卡尔树根节点=${root.val}`,
    codeLine: lines.returnRoot,
  });

  return steps;
}

// ----------------------------------------------------
// Stage 3: 显式任务栈迭代区间模拟
// ----------------------------------------------------
export function buildMaxTreeStage3IterativeSteps(nums: number[]): MaxTreeStep[] {
  const steps: MaxTreeStep[] = [];
  const lines = MAX_TREE_STAGE3_LINES;

  steps.push({
    tree: null,
    current: null,
    depth: 0,
    maxVal: null,
    nums: [...nums],
    message: '开始显式任务栈迭代构建：消除递归调用栈深度限制',
    log: '初始化迭代任务栈',
    codeLine: lines.entry,
  });

  if (!nums || nums.length === 0) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxVal: null,
      nums: [],
      message: '数组为空，直接返回 null',
      log: '空数组返回 null',
      codeLine: lines.check,
    });
    return steps;
  }

  const findMax = (l: number, r: number): number => {
    let m = l;
    for (let i = l + 1; i <= r; i++) {
      if (nums[i] > nums[m]) m = i;
    }
    return m;
  };

  const maxIdx = findMax(0, nums.length - 1);
  const root: TreeNode = { val: nums[maxIdx], left: null, right: null };

  steps.push({
    tree: cloneTree(root),
    current: root.val,
    depth: 1,
    maxVal: root.val,
    nums: [...nums],
    maxIdx,
    highlightNodes: new Set([root.val]),
    message: `全局最大值在索引 ${maxIdx}，创建树根节点 ${root.val}`,
    log: `根节点 ${root.val} 创建成功`,
    codeLine: lines.initRoot,
  });

  interface Task {
    parent: TreeNode;
    isLeft: boolean;
    l: number;
    r: number;
  }

  const taskStack: Task[] = [];
  taskStack.push({ parent: root, isLeft: true, l: 0, r: maxIdx - 1 });
  taskStack.push({ parent: root, isLeft: false, l: maxIdx + 1, r: nums.length - 1 });

  steps.push({
    tree: cloneTree(root),
    current: root.val,
    depth: 1,
    maxVal: root.val,
    nums: [...nums],
    highlightNodes: new Set([root.val]),
    message: `将根节点左右子区间任务入栈: [0, ${maxIdx - 1}] 与 [${maxIdx + 1}, ${nums.length - 1}]`,
    log: `左右子树任务压栈，栈中待处理任务=${taskStack.length}`,
    codeLine: lines.pushSubtasks,
  });

  while (taskStack.length > 0) {
    const task = taskStack.pop()!;
    const side = task.isLeft ? '左' : '右';

    steps.push({
      tree: cloneTree(root),
      current: task.parent.val,
      depth: taskStack.length + 1,
      maxVal: task.parent.val,
      range: [task.l, task.r],
      nums: [...nums],
      highlightNodes: new Set([task.parent.val]),
      message: `从任务栈弹出父节点 ${task.parent.val} 的${side}子树任务，区间 [${task.l}, ${task.r}]`,
      log: `处理任务: ${task.parent.val} 的${side}子树 [${task.l}, ${task.r}]`,
      codeLine: lines.popTask,
    });

    if (task.l > task.r) {
      steps.push({
        tree: cloneTree(root),
        current: task.parent.val,
        depth: taskStack.length,
        maxVal: task.parent.val,
        range: [task.l, task.r],
        nums: [...nums],
        highlightNodes: new Set([task.parent.val]),
        message: `区间 [${task.l}, ${task.r}] 无效 (l > r)，跳过构建`,
        log: `区间为空，跳过`,
        codeLine: lines.checkBase,
      });
      continue;
    }

    const m = findMax(task.l, task.r);
    const child: TreeNode = { val: nums[m], left: null, right: null };

    steps.push({
      tree: cloneTree(root),
      current: child.val,
      depth: taskStack.length + 1,
      maxVal: child.val,
      range: [task.l, task.r],
      maxIdx: m,
      nums: [...nums],
      highlightNodes: new Set([task.parent.val, child.val]),
      message: `区间 [${task.l}, ${task.r}] 内最大值为 nums[${m}] = ${child.val}，创建子节点`,
      log: `找到子区间最大值 ${child.val}`,
      codeLine: lines.findChildMax,
    });

    if (task.isLeft) {
      task.parent.left = child;
    } else {
      task.parent.right = child;
    }

    steps.push({
      tree: cloneTree(root),
      current: child.val,
      depth: taskStack.length + 1,
      maxVal: child.val,
      nums: [...nums],
      highlightNodes: new Set([task.parent.val, child.val]),
      message: `将子节点 ${child.val} 挂载到父节点 ${task.parent.val} 的${side}侧`,
      log: `连接: ${task.parent.val}.${task.isLeft ? 'left' : 'right'} = ${child.val}`,
      codeLine: lines.attachChild,
    });

    taskStack.push({ parent: child, isLeft: true, l: task.l, r: m - 1 });
    taskStack.push({ parent: child, isLeft: false, l: m + 1, r: task.r });

    steps.push({
      tree: cloneTree(root),
      current: child.val,
      depth: taskStack.length,
      maxVal: child.val,
      nums: [...nums],
      highlightNodes: new Set([child.val]),
      message: `将子节点 ${child.val} 的左右子树任务压栈，栈中待处理任务数: ${taskStack.length}`,
      log: `子任务压栈，剩余任务=${taskStack.length}`,
      codeLine: lines.pushNextTasks,
    });
  }

  const allTreeVals = collectTreeValues(root);

  steps.push({
    tree: cloneTree(root),
    current: root.val,
    depth: 0,
    maxVal: root.val,
    nums: [...nums],
    highlightNodes: new Set(allTreeVals),
    visitedNodes: allTreeVals,
    message: `显式任务栈清空，全树构建完成，根节点为 ${root.val}`,
    log: `构建完成，根节点=${root.val}`,
    codeLine: lines.returnRoot,
  });

  return steps;
}

// 统一入口（兼容旧 API）
export function buildMaxTreeSteps(nums: number[]): MaxTreeStep[] {
  return buildMaxTreeStage1Steps(nums);
}

// ----------------------------------------------------
// 画布渲染 Card 1 & Card 2
// ----------------------------------------------------
function renderMaxTreeCanvas(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.boxSizing = 'border-box';

  if (!step.tree) {
    container.innerHTML = `
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #64748b; font-size: 13px;">
        <span style="font-size: 32px; margin-bottom: 8px;">🌲</span>
        <span>待构建树结构 (树为空或尚未生成节点)</span>
      </div>
    `;
    return;
  }

  const isDone = step.message.includes('完成') || step.message.includes('结束') || step.log.includes('完成');
  const allTreeVals = collectTreeValues(step.tree);
  let highlight = step.highlightNodes;

  if (isDone && (!highlight || highlight.size <= 1)) {
    highlight = new Set(allTreeVals);
  } else if (!highlight) {
    highlight = step.current != null ? new Set([step.current]) : new Set<number>();
  }

  renderTreeSVG(container, step.tree, highlight, '#cba6f7', new Set(), '#89b4fa');
}

function renderMaxTreeCard2(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '12px';
  container.style.padding = '12px';
  container.style.boxSizing = 'border-box';
  container.style.overflow = 'auto';

  // 1. 数组与区间沙盘
  const arrayBox = document.createElement('div');
  arrayBox.style.display = 'flex';
  arrayBox.style.flexDirection = 'column';
  arrayBox.style.gap = '8px';
  arrayBox.style.background = 'rgba(15, 23, 42, 0.4)';
  arrayBox.style.padding = '10px';
  arrayBox.style.borderRadius = '8px';
  arrayBox.style.border = '1px solid rgba(51, 65, 85, 0.6)';

  const arrayTitle = document.createElement('div');
  arrayTitle.style.fontSize = '12px';
  arrayTitle.style.fontWeight = '700';
  arrayTitle.style.color = '#94a3b8';
  arrayTitle.textContent = step.range
    ? `当前扫描区间 [${step.range[0]}, ${step.range[1]}]`
    : '输入数组 nums 元素状态';
  arrayBox.appendChild(arrayTitle);

  const arrayRow = document.createElement('div');
  arrayRow.style.display = 'flex';
  arrayRow.style.flexWrap = 'wrap';
  arrayRow.style.gap = '6px';

  step.nums.forEach((val, i) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'center';
    item.style.minWidth = '36px';
    item.style.height = '44px';
    item.style.borderRadius = '6px';
    item.style.fontSize = '12px';
    item.style.fontWeight = '700';
    item.style.fontFamily = 'monospace';
    item.style.transition = 'all 0.2s ease';

    const inRange = step.range ? i >= step.range[0] && i <= step.range[1] : true;
    const isScan = step.scanIdx === i;
    const isMax = step.maxIdx === i;
    const isCurrent = step.current === val;

    if (isMax) {
      item.style.background = 'rgba(168, 85, 247, 0.25)';
      item.style.color = '#d8b4fe';
      item.style.border = '2px solid #a855f7';
    } else if (isScan) {
      item.style.background = 'rgba(245, 158, 11, 0.25)';
      item.style.color = '#fde047';
      item.style.border = '2px solid #f59e0b';
    } else if (isCurrent) {
      item.style.background = 'rgba(56, 189, 248, 0.25)';
      item.style.color = '#38bdf8';
      item.style.border = '1px solid #38bdf8';
    } else if (inRange) {
      item.style.background = 'rgba(30, 41, 59, 0.8)';
      item.style.color = '#e2e8f0';
      item.style.border = '1px solid #475569';
    } else {
      item.style.background = 'rgba(15, 23, 42, 0.5)';
      item.style.color = '#475569';
      item.style.border = '1px dashed #334155';
      item.style.opacity = '0.5';
    }

    item.innerHTML = `
      <span>${val}</span>
      <span style="font-size: 9px; opacity: 0.7; font-weight: normal;">#${i}</span>
    `;
    arrayRow.appendChild(item);
  });
  arrayBox.appendChild(arrayRow);
  container.appendChild(arrayBox);

  // 2. 单调栈或任务栈展示
  if (step.stackVals !== undefined) {
    const stackBox = document.createElement('div');
    stackBox.style.display = 'flex';
    stackBox.style.flexDirection = 'column';
    stackBox.style.gap = '8px';
    stackBox.style.background = 'rgba(15, 23, 42, 0.4)';
    stackBox.style.padding = '10px';
    stackBox.style.borderRadius = '8px';
    stackBox.style.border = '1px solid rgba(51, 65, 85, 0.6)';

    const stackTitle = document.createElement('div');
    stackTitle.style.fontSize = '12px';
    stackTitle.style.fontWeight = '700';
    stackTitle.style.color = '#c084fc';
    stackTitle.textContent = `单调递减栈 (栈底 ➔ 栈顶，大小: ${step.stackVals.length})`;
    stackBox.appendChild(stackTitle);

    const stackRow = document.createElement('div');
    stackRow.style.display = 'flex';
    stackRow.style.gap = '6px';
    stackRow.style.alignItems = 'center';

    if (step.stackVals.length === 0) {
      stackRow.innerHTML = `<span style="font-size: 11px; color: #64748b;">(栈为空)</span>`;
    } else {
      step.stackVals.forEach((v, idx) => {
        const slot = document.createElement('div');
        slot.style.padding = '4px 10px';
        slot.style.background = idx === step.stackVals!.length - 1 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(51, 65, 85, 0.6)';
        slot.style.border = idx === step.stackVals!.length - 1 ? '1px solid #facc15' : '1px solid #64748b';
        slot.style.borderRadius = '4px';
        slot.style.fontSize = '12px';
        slot.style.fontWeight = 'bold';
        slot.style.color = idx === step.stackVals!.length - 1 ? '#fef08a' : '#cbd5e1';
        slot.textContent = idx === step.stackVals!.length - 1 ? `${v} (顶)` : String(v);
        stackRow.appendChild(slot);
      });
    }
    stackBox.appendChild(stackRow);
    container.appendChild(stackBox);
  }

  // 3. 当前步骤推演决策总结
  const summaryBox = document.createElement('div');
  summaryBox.style.background = 'rgba(30, 41, 59, 0.5)';
  summaryBox.style.padding = '10px';
  summaryBox.style.borderRadius = '6px';
  summaryBox.style.fontSize = '12px';
  summaryBox.style.lineHeight = '1.5';
  summaryBox.style.color = '#94a3b8';
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">⚡ 推演动态</div>
    <div>${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

// ----------------------------------------------------
// 注册多阶段演化声明式算法
// ----------------------------------------------------
registerDeclarativeAlgorithm({
  id: 'max-tree',
  name: '最大二叉树',
  category: 'tree',
  description: '根据数组构建最大二叉树：最大值作为根，递归构建左右子树',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 654,
  aliases: ['leetcode-654', 'maximum-binary-tree'],
  learningGoal: '掌握分治扫描递归构建、笛卡尔树单调栈 O(N) 线性构建与显式任务栈模拟三大范式',
  inputs: [
    {
      id: 'nums',
      label: '输入整数数组',
      type: 'text',
      defaultValue: '3, 2, 1, 6, 0, 5',
      placeholder: '以逗号分隔，如 3, 2, 1, 6, 0, 5',
    },
  ],
  presets: [
    { label: '经典案例 [3,2,1,6,0,5]', values: { nums: '3, 2, 1, 6, 0, 5' } },
    { label: '递减斜链 [3,2,1]', values: { nums: '3, 2, 1' } },
    { label: '递增斜链 [1,2,3,4,5,6,7]', values: { nums: '1, 2, 3, 4, 5, 6, 7' } },
    { label: '锯齿多峰 [5,4,6,2,8,1,9]', values: { nums: '5, 4, 6, 2, 8, 1, 9' } },
  ],
  metrics: [
    { id: 'metric-mt-cur', label: '当前节点/焦点', color: '#38bdf8' },
    { id: 'metric-mt-max', label: '当前最值', color: '#c084fc' },
    { id: 'metric-mt-depth', label: '递归深度/栈深', color: '#10b981' },
    { id: 'metric-mt-range', label: '区间/阶段状态', color: '#f59e0b' },
  ],
  legend: [
    { label: '当前焦点', color: '#38bdf8' },
    { label: '最大值节点', color: '#cba6f7' },
    { label: '扫描比对中', color: '#f59e0b' },
    { label: '已完成子树', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1-recursive',
      name: 'Stage 1: 递归分治与区间线性扫描',
      shortName: '递归分治',
      num: 1,
      timeBadge: 'O(N²)',
      codeLanguages: MAX_TREE_STAGE1_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const nums = parseNumberList(inputs.nums, [3, 2, 1, 6, 0, 5]);
        return buildMaxTreeStage1Steps(nums).map((s) => ({
          ...s,
          metrics: {
            'metric-mt-cur': s.current != null ? String(s.current) : '-',
            'metric-mt-max': s.maxVal != null ? String(s.maxVal) : '-',
            'metric-mt-depth': String(s.depth),
            'metric-mt-range': s.range ? `[${s.range[0]}, ${s.range[1]}]` : '全域',
          },
        }));
      },
      renderCanvas: (container: HTMLElement, step: MaxTreeStep) => renderMaxTreeCanvas(container, step),
      auxiliaryVisual: {
        title: '区间状态与推演动态',
        render: (container: HTMLElement, step: MaxTreeStep) => renderMaxTreeCard2(container, step),
      },
    },
    {
      id: 'stage-2-monotonic-stack',
      name: 'Stage 2: 单调栈 O(N) 笛卡尔树构建',
      shortName: '单调栈 O(N)',
      num: 2,
      timeBadge: 'O(N)',
      codeLanguages: MAX_TREE_STAGE2_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const nums = parseNumberList(inputs.nums, [3, 2, 1, 6, 0, 5]);
        return buildMaxTreeStage2StackSteps(nums).map((s) => ({
          ...s,
          metrics: {
            'metric-mt-cur': s.current != null ? String(s.current) : '-',
            'metric-mt-max': s.maxVal != null ? String(s.maxVal) : '-',
            'metric-mt-depth': String(s.depth),
            'metric-mt-range': s.stackVals ? `栈大小 ${s.stackVals.length}` : '就绪',
          },
        }));
      },
      renderCanvas: (container: HTMLElement, step: MaxTreeStep) => renderMaxTreeCanvas(container, step),
      auxiliaryVisual: {
        title: '单调栈状态与推演动态',
        render: (container: HTMLElement, step: MaxTreeStep) => renderMaxTreeCard2(container, step),
      },
    },
    {
      id: 'stage-3-explicit-stack',
      name: 'Stage 3: 显式任务栈迭代区间模拟',
      shortName: '显式栈模拟',
      num: 3,
      timeBadge: 'O(N²)',
      codeLanguages: MAX_TREE_STAGE3_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const nums = parseNumberList(inputs.nums, [3, 2, 1, 6, 0, 5]);
        return buildMaxTreeStage3IterativeSteps(nums).map((s) => ({
          ...s,
          metrics: {
            'metric-mt-cur': s.current != null ? String(s.current) : '-',
            'metric-mt-max': s.maxVal != null ? String(s.maxVal) : '-',
            'metric-mt-depth': String(s.depth),
            'metric-mt-range': s.range ? `任务 [${s.range[0]}, ${s.range[1]}]` : '就绪',
          },
        }));
      },
      renderCanvas: (container: HTMLElement, step: MaxTreeStep) => renderMaxTreeCanvas(container, step),
      auxiliaryVisual: {
        title: '任务栈状态与推演动态',
        render: (container: HTMLElement, step: MaxTreeStep) => renderMaxTreeCard2(container, step),
      },
    },
  ],
  problemHtml: MAX_TREE_PROBLEM_HTML,
  analysisHtml: MAX_TREE_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(inputs.nums, [3, 2, 1, 6, 0, 5]);
    return buildMaxTreeStage1Steps(nums).map((s) => ({
      ...s,
      metrics: {
        'metric-mt-cur': s.current != null ? String(s.current) : '-',
        'metric-mt-max': s.maxVal != null ? String(s.maxVal) : '-',
        'metric-mt-depth': String(s.depth),
        'metric-mt-range': s.range ? `[${s.range[0]}, ${s.range[1]}]` : '全域',
      },
    }));
  },
  renderCanvas: (container, step) => renderMaxTreeCanvas(container, step as MaxTreeStep),
});
