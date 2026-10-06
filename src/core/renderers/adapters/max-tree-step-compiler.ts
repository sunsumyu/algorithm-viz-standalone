/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree) 核心推演编译器深模块
 * 遵循 Matt Pocock 深模块哲学与严苛一行一步规范
 *
 * 核心多阶段演化推演支持:
 *   Stage 1: 递归分治与区间扫描 (Recursive Divide & Conquer, O(N log N) ~ O(N^2))
 *   Stage 2: 单调栈 O(N) 笛卡尔树构建 (Monotonic Stack Cartesian Tree, O(N))
 *   Stage 3: 显式任务栈迭代构建 (Explicit Construction Stack)
 */

import { HighlightTarget, StepBase } from '../../step-visualizer';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import {
  MAX_TREE_STAGE1_LINES,
  MAX_TREE_STAGE2_LINES,
  MAX_TREE_STAGE3_LINES,
} from '../../../algorithms/categories/tree/max-tree-stage-codes';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface MaxTreeStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  maxVal: number | null;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  highlightNodes?: Set<number>;
  visitedNodes?: number[];
  range?: [number, number];
  scanIdx?: number;
  maxIdx?: number;
  nums: number[];
  stackVals?: number[];
  activeNum?: number | null;
  metrics?: Record<string, string | number>;
  callTrace?: RecursiveCallTraceSnapshot;
  action?: string;
  phase?: string;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };
}

/** 收集树中所有有效节点值，支持全景高亮与收尾状态守卫 */
export function collectTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
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

// 辅助深拷贝树节点以记录快照
function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

// ============================================================
// Stage 1: 递归分治与区间扫描 (Recursive Divide & Conquer)
// ============================================================
export function buildMaxTreeStage1Steps(nums: number[]): MaxTreeStep[] {
  const steps: MaxTreeStep[] = [];
  const lines = MAX_TREE_STAGE1_LINES;
  const trace = new RecursiveCallTraceBuilder();

  trace.addHeader(`constructMaximumBinaryTree([${nums.join(', ')}])`, 0, '<- 根调用开始');

  steps.push({
    tree: null,
    current: null,
    depth: 0,
    maxVal: null,
    nums: [...nums],
    action: 'entry',
    phase: 'init',
    message: '开始构建最大二叉树：采用分治递归与线性最值扫描',
    log: '初始化分治构建',
    codeLine: lines.entry,
    metrics: { '当前阶段': '初始化', '数组长度': nums.length },
    statusBadge: { text: '算法启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  if (!nums || nums.length === 0) {
    trace.addConditionHit('nums == null || nums.length == 0 √ 命中 -> return null', 0);
    trace.addReturnLeaf('return null', 0);
    trace.addFinalResult('最终返回: null', 0, undefined, 'null');

    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxVal: null,
      nums: [],
      action: 'empty-check',
      phase: 'check',
      message: '输入数组为空，返回空树 null',
      log: '空数组返回 null',
      codeLine: lines.check,
      metrics: { '当前阶段': '判空返回', '树状态': 'null' },
      statusBadge: { text: '空数组', type: 'info' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  trace.addConditionPass('nums 长度有效，启动 build(nums, 0, n - 1)', 0);
  steps.push({
    tree: null,
    current: null,
    depth: 0,
    maxVal: null,
    nums: [...nums],
    range: [0, nums.length - 1],
    action: 'start',
    phase: 'init',
    message: `调用分治辅助函数 build(nums, 0, ${nums.length - 1})`,
    log: `build(nums, 0, ${nums.length - 1})`,
    codeLine: lines.start,
    metrics: { '当前区间': `[0, ${nums.length - 1}]`, '待处理元素数': nums.length },
    statusBadge: { text: '进入递归构建', type: 'info' },
    callTrace: trace.snapshot(),
  });

  let globalRoot: TreeNode | null = null;

  const build = (l: number, r: number, depth: number): TreeNode | null => {
    trace.addHeader(`build([${l}..${r}])`, depth, '<- 分治调用开始');

    steps.push({
      tree: cloneTree(globalRoot),
      current: null,
      depth,
      maxVal: null,
      range: [l, r],
      nums: [...nums],
      action: 'build-entry',
      phase: 'recurse',
      message: `进入分治构建: 子数组区间 [${l}, ${r}]`,
      log: `build(l=${l}, r=${r})`,
      codeLine: lines.buildSignature,
      metrics: { '当前区间': `[${l}, ${r}]`, '递归深度': depth },
      statusBadge: { text: `区间 [${l}, ${r}]`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    if (l > r) {
      trace.addConditionHit(`l (${l}) > r (${r}) √ 命中基底 -> return null`, depth);
      trace.addReturnLeaf('return null', depth);

      steps.push({
        tree: cloneTree(globalRoot),
        current: null,
        depth,
        maxVal: null,
        range: [l, r],
        nums: [...nums],
        action: 'base-check-hit',
        phase: 'base',
        message: `区间 [${l}, ${r}] 为空 (l > r)，返回 null`,
        log: `l > r, 返回 null`,
        codeLine: lines.baseCheckHit,
        metrics: { '当前区间': `[${l}, ${r}]`, '基底判断': 'EMPTY -> null' },
        statusBadge: { text: '空区间 null', type: 'warning' },
        callTrace: trace.snapshot(),
      });
      return null;
    }

    trace.addConditionPass(`l (${l}) <= r (${r}) × 区间有效 -> 扫描最值`, depth);
    steps.push({
      tree: cloneTree(globalRoot),
      current: null,
      depth,
      maxVal: null,
      range: [l, r],
      nums: [...nums],
      action: 'base-check-pass',
      phase: 'scan',
      message: `区间 [${l}, ${r}] 包含 ${r - l + 1} 个元素，准备寻找最大值`,
      log: `区间 [${l}, ${r}] 有效`,
      codeLine: lines.baseCheckPass,
      metrics: { '当前区间': `[${l}, ${r}]`, '元素数量': r - l + 1 },
      statusBadge: { text: '扫描最值', type: 'info' },
      callTrace: trace.snapshot(),
    });

    let maxIdx = l;
    steps.push({
      tree: cloneTree(globalRoot),
      current: nums[l],
      depth,
      maxVal: nums[l],
      range: [l, r],
      scanIdx: l,
      maxIdx: l,
      nums: [...nums],
      action: 'init-max',
      phase: 'scan',
      message: `初始化区间最大值为 nums[${l}] = ${nums[l]}`,
      log: `区间最值初值: ${nums[l]} (索引 ${l})`,
      codeLine: lines.initMax,
      metrics: { '区间最值': nums[l], '最值索引': l, '扫描游标': l },
      statusBadge: { text: `最值初值: ${nums[l]}`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    for (let i = l + 1; i <= r; i++) {
      const isNewMax = nums[i] > nums[maxIdx];
      steps.push({
        tree: cloneTree(globalRoot),
        current: nums[i],
        depth,
        maxVal: nums[maxIdx],
        range: [l, r],
        scanIdx: i,
        maxIdx,
        nums: [...nums],
        action: 'scan-loop',
        phase: 'scan',
        message: `扫描比较 nums[${i}] = ${nums[i]} 与当前最大值 nums[${maxIdx}] = ${nums[maxIdx]}`,
        log: `扫描 nums[${i}]=${nums[i]} ${isNewMax ? '> ' + nums[maxIdx] : '<= ' + nums[maxIdx]}`,
        codeLine: lines.scanLoop,
        metrics: { '区间最值': nums[maxIdx], '最值索引': maxIdx, '当前比对': nums[i] },
        statusBadge: { text: `比对 nums[${i}]=${nums[i]}`, type: 'info' },
        callTrace: trace.snapshot(),
      });

      if (isNewMax) {
        maxIdx = i;
        steps.push({
          tree: cloneTree(globalRoot),
          current: nums[i],
          depth,
          maxVal: nums[maxIdx],
          range: [l, r],
          scanIdx: i,
          maxIdx,
          nums: [...nums],
          action: 'update-max',
          phase: 'scan',
          message: `发现更大元素！更新最大值索引为 ${maxIdx}，最大值为 ${nums[maxIdx]}`,
          log: `更新最大值: ${nums[maxIdx]} (索引 ${maxIdx})`,
          codeLine: lines.updateMax,
          metrics: { '新最值': nums[maxIdx], '最值索引': maxIdx },
          statusBadge: { text: `新最值: ${nums[maxIdx]}`, type: 'success' },
          callTrace: trace.snapshot(),
        });
      }
    }

    const node: TreeNode = { val: nums[maxIdx], left: null, right: null };
    if (!globalRoot) {
      globalRoot = node;
    }

    trace.addRecursePrep(`以最大值 ${node.val} 创建根节点，开始分治左右子树`, depth);

    steps.push({
      tree: cloneTree(globalRoot),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [l, r],
      maxIdx,
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      action: 'create-node',
      phase: 'build',
      message: `以最大值 ${node.val} 创建子树根节点`,
      log: `创建节点 ${node.val}`,
      codeLine: lines.createNode,
      metrics: { '已创建根': node.val, '区间': `[${l}, ${r}]` },
      statusBadge: { text: `创建节点 ${node.val}`, type: 'success' },
      callTrace: trace.snapshot(),
    });

    steps.push({
      tree: cloneTree(globalRoot),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [l, maxIdx - 1],
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      action: 'recurse-left',
      phase: 'recurse',
      message: `递归构建节点 ${node.val} 的左子树: 区间 [${l}, ${maxIdx - 1}]`,
      log: `递归左子树 [${l}, ${maxIdx - 1}]`,
      codeLine: lines.recurseLeft,
      metrics: { '左子树区间': `[${l}, ${maxIdx - 1}]`, '父节点': node.val },
      statusBadge: { text: `构建 ${node.val} 左子树`, type: 'info' },
      callTrace: trace.snapshot(),
    });
    node.left = build(l, maxIdx - 1, depth + 1);

    trace.addUnwindCalc(`左子树 [${l}..${maxIdx - 1}] 构建完毕 -> ${node.left ? node.left.val : 'null'}`, depth);

    steps.push({
      tree: cloneTree(globalRoot),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [l, maxIdx - 1],
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      action: 'left-done',
      phase: 'unwind',
      message: `节点 ${node.val} 的左子树挂载完毕: ${node.left ? node.left.val : 'null'}`,
      log: `左子树挂载完成: ${node.left ? node.left.val : 'null'}`,
      codeLine: lines.leftDone,
      metrics: { '父节点': node.val, '左孩子': node.left ? node.left.val : 'null' },
      statusBadge: { text: `左挂载: ${node.left ? node.left.val : 'null'}`, type: 'success' },
      callTrace: trace.snapshot(),
    });

    steps.push({
      tree: cloneTree(globalRoot),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [maxIdx + 1, r],
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      action: 'recurse-right',
      phase: 'recurse',
      message: `递归构建节点 ${node.val} 的右子树: 区间 [${maxIdx + 1}, ${r}]`,
      log: `递归右子树 [${maxIdx + 1}, ${r}]`,
      codeLine: lines.recurseRight,
      metrics: { '右子树区间': `[${maxIdx + 1}, ${r}]`, '父节点': node.val },
      statusBadge: { text: `构建 ${node.val} 右子树`, type: 'info' },
      callTrace: trace.snapshot(),
    });
    node.right = build(maxIdx + 1, r, depth + 1);

    trace.addUnwindCalc(`右子树 [${maxIdx + 1}..${r}] 构建完毕 -> ${node.right ? node.right.val : 'null'}`, depth);

    steps.push({
      tree: cloneTree(globalRoot),
      current: node.val,
      depth,
      maxVal: node.val,
      range: [maxIdx + 1, r],
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      action: 'right-done',
      phase: 'unwind',
      message: `节点 ${node.val} 的右子树挂载完毕: ${node.right ? node.right.val : 'null'}`,
      log: `右子树挂载完成: ${node.right ? node.right.val : 'null'}`,
      codeLine: lines.rightDone,
      metrics: { '父节点': node.val, '右孩子': node.right ? node.right.val : 'null' },
      statusBadge: { text: `右挂载: ${node.right ? node.right.val : 'null'}`, type: 'success' },
      callTrace: trace.snapshot(),
    });

    trace.addFinalResult(`子树 [${l}..${r}] 根节点 ${node.val} 返回`, depth, undefined, node.val);

    steps.push({
      tree: cloneTree(globalRoot),
      current: node.val,
      depth,
      maxVal: node.val,
      highlightNodes: new Set([node.val]),
      nums: [...nums],
      action: 'return-root',
      phase: 'unwind',
      message: `节点 ${node.val} 的左右子树构建完成，返回当前子树根`,
      log: `完成子树 ${node.val}`,
      codeLine: lines.returnRoot,
      metrics: { '返回子树根': node.val, '深度': depth },
      statusBadge: { text: `返回节点 ${node.val}`, type: 'success' },
      callTrace: trace.snapshot(),
    });

    return node;
  };

  const finalRoot = build(0, nums.length - 1, 0);
  const allTreeVals = collectTreeValues(finalRoot);

  trace.addFinalResult(`最大二叉树构建完成，根节点: ${finalRoot ? finalRoot.val : 'null'}`, 0, undefined, finalRoot ? finalRoot.val : undefined);

  steps.push({
    tree: cloneTree(finalRoot),
    current: finalRoot ? finalRoot.val : null,
    depth: 0,
    maxVal: finalRoot ? finalRoot.val : null,
    highlightNodes: new Set(allTreeVals),
    visitedNodes: allTreeVals,
    nums: [...nums],
    action: 'done',
    phase: 'done',
    message: `最大二叉树构建完成，根节点为 ${finalRoot ? finalRoot.val : 'null'}`,
    log: `构建完成，根节点=${finalRoot ? finalRoot.val : 'null'}`,
    codeLine: lines.done,
    metrics: { '全树节点总数': allTreeVals.length, '树根节点': finalRoot ? finalRoot.val : 'null' },
    statusBadge: { text: '构建完成', type: 'success' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 2: 单调栈 O(N) 笛卡尔树构建 (Monotonic Stack Cartesian Tree)
// ============================================================
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
    action: 'entry',
    phase: 'init',
    message: '开始单调栈笛卡尔树线性构建：维护单调递减栈',
    log: '初始化单调栈构建',
    codeLine: lines.entry,
    metrics: { '当前阶段': '初始化', '数组长度': nums.length },
    statusBadge: { text: '单调栈启动', type: 'info' },
  });

  if (!nums || nums.length === 0) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxVal: null,
      nums: [],
      stackVals: [],
      action: 'empty-check',
      phase: 'check',
      message: '输入数组为空，返回 null',
      log: '空数组返回 null',
      codeLine: lines.check,
      metrics: { '树状态': 'null' },
      statusBadge: { text: '空数组', type: 'info' },
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
    action: 'init-stack',
    phase: 'init',
    message: '初始化空单调栈 stack = []',
    log: '栈已就绪',
    codeLine: lines.initStack,
    metrics: { '栈状态': '空栈 []', '元素总数': nums.length },
    statusBadge: { text: '栈已就绪', type: 'info' },
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
      action: 'create-curr',
      phase: 'scan',
      message: `考察数组元素 nums[${idx}] = ${num}，创建新节点 ${num}`,
      log: `遍历 nums[${idx}]=${num}`,
      codeLine: lines.createCurr,
      metrics: { '当前考察': num, '数组索引': idx, '栈大小': stack.length },
      statusBadge: { text: `考察 ${num}`, type: 'info' },
    });

    while (stack.length > 0 && stack[stack.length - 1].val < num) {
      const popped = stack.pop()!;
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
        action: 'attach-left',
        phase: 'pop',
        message: `栈顶节点 ${popped.val} < ${num}：弹出并将 ${popped.val} 挂为 ${num} 的左子树`,
        log: `弹出 ${popped.val}，成为 ${num} 的左孩子`,
        codeLine: lines.attachLeft,
        metrics: { '出栈节点': popped.val, '挂载方向': `${num}.left`, '剩余栈深': stack.length },
        statusBadge: { text: `弹出 ${popped.val} 挂左`, type: 'warning' },
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
        action: 'attach-right',
        phase: 'attach',
        message: `栈不为空，当前栈顶 ${topNode.val} > ${num}：将 ${num} 挂为 ${topNode.val} 的右子树`,
        log: `${num} 成为栈顶 ${topNode.val} 的右孩子`,
        codeLine: lines.attachRight,
        metrics: { '当前栈顶': topNode.val, '挂载孩子': `${topNode.val}.right = ${num}` },
        statusBadge: { text: `挂右: ${topNode.val}->${num}`, type: 'info' },
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
      action: 'push-curr',
      phase: 'push',
      message: `将节点 ${num} 压入单调栈，当前栈状态: [${stack.map((n) => n.val).join(', ')}]`,
      log: `压栈 ${num}，栈深=${stack.length}`,
      codeLine: lines.pushCurr,
      metrics: { '压栈节点': num, '栈大小': stack.length, '栈底根': stack[0].val },
      statusBadge: { text: `压栈 ${num}`, type: 'success' },
    });
  }

  const root = stack[0];
  const allTreeVals = collectTreeValues(root);

  steps.push({
    tree: cloneTree(root),
    current: root ? root.val : null,
    depth: 1,
    maxVal: root ? root.val : null,
    nums: [...nums],
    stackVals: stack.map((n) => n.val),
    highlightNodes: new Set(allTreeVals),
    visitedNodes: allTreeVals,
    action: 'done',
    phase: 'done',
    message: `扫描结束，栈底节点 ${root.val} 即为全树最大根节点`,
    log: `构建完毕，笛卡尔树根节点=${root.val}`,
    codeLine: lines.returnRoot,
    metrics: { '笛卡尔树根': root.val, '全树节点总数': allTreeVals.length },
    statusBadge: { text: '单调栈构建完成', type: 'success' },
  });

  return steps;
}

// ============================================================
// Stage 3: 显式任务栈迭代构建 (Explicit Construction Stack)
// ============================================================
export function buildMaxTreeStage3IterativeSteps(nums: number[]): MaxTreeStep[] {
  const steps: MaxTreeStep[] = [];
  const lines = MAX_TREE_STAGE3_LINES;

  steps.push({
    tree: null,
    current: null,
    depth: 0,
    maxVal: null,
    nums: [...nums],
    action: 'entry',
    phase: 'init',
    message: '开始显式任务栈迭代构建：消除递归调用栈深度限制',
    log: '初始化迭代任务栈',
    codeLine: lines.entry,
    metrics: { '当前阶段': '初始化', '数组长度': nums.length },
    statusBadge: { text: '显式栈启动', type: 'info' },
  });

  if (!nums || nums.length === 0) {
    steps.push({
      tree: null,
      current: null,
      depth: 0,
      maxVal: null,
      nums: [],
      action: 'empty-check',
      phase: 'check',
      message: '数组为空，直接返回 null',
      log: '空数组返回 null',
      codeLine: lines.check,
      metrics: { '树状态': 'null' },
      statusBadge: { text: '空数组', type: 'info' },
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
    action: 'init-root',
    phase: 'init',
    message: `全局最大值在索引 ${maxIdx}，创建树根节点 ${root.val}`,
    log: `根节点 ${root.val} 创建成功`,
    codeLine: lines.initRoot,
    metrics: { '全树根节点': root.val, '最值索引': maxIdx },
    statusBadge: { text: `根节点 ${root.val}`, type: 'success' },
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
    action: 'push-subtasks',
    phase: 'schedule',
    message: `将根节点左右子区间任务入栈: [0, ${maxIdx - 1}] 与 [${maxIdx + 1}, ${nums.length - 1}]`,
    log: `左右子树任务压栈，栈中待处理任务=${taskStack.length}`,
    codeLine: lines.pushSubtasks,
    metrics: { '待处理任务数': taskStack.length, '初始任务': '左右子区间' },
    statusBadge: { text: '左右子任务入栈', type: 'info' },
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
      action: 'pop-task',
      phase: 'task',
      message: `从任务栈弹出父节点 ${task.parent.val} 的${side}子树任务，区间 [${task.l}, ${task.r}]`,
      log: `处理任务: ${task.parent.val} 的${side}子树 [${task.l}, ${task.r}]`,
      codeLine: lines.popTask,
      metrics: { '出栈任务': `${task.parent.val}.${task.isLeft ? 'left' : 'right'}`, '区间': `[${task.l}, ${task.r}]` },
      statusBadge: { text: `任务: ${task.parent.val}${side}`, type: 'info' },
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
        action: 'check-base',
        phase: 'base',
        message: `区间 [${task.l}, ${task.r}] 无效 (l > r)，跳过构建`,
        log: `区间为空，跳过`,
        codeLine: lines.checkBase,
        metrics: { '区间状态': '无效区间跳过', '剩余任务': taskStack.length },
        statusBadge: { text: '空区间跳过', type: 'warning' },
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
      action: 'find-child-max',
      phase: 'scan',
      message: `区间 [${task.l}, ${task.r}] 内最大值为 nums[${m}] = ${child.val}，创建子节点`,
      log: `找到子区间最大值 ${child.val}`,
      codeLine: lines.findChildMax,
      metrics: { '子节点值': child.val, '最值索引': m },
      statusBadge: { text: `创建子节点 ${child.val}`, type: 'success' },
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
      action: 'attach-child',
      phase: 'attach',
      message: `将子节点 ${child.val} 挂载到父节点 ${task.parent.val} 的${side}侧`,
      log: `连接: ${task.parent.val}.${task.isLeft ? 'left' : 'right'} = ${child.val}`,
      codeLine: lines.attachChild,
      metrics: { '挂载连接': `${task.parent.val}.${task.isLeft ? 'left' : 'right'} = ${child.val}` },
      statusBadge: { text: `挂载 ${child.val}`, type: 'success' },
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
      action: 'push-next-tasks',
      phase: 'schedule',
      message: `将子节点 ${child.val} 的左右子树任务压栈，栈中待处理任务数: ${taskStack.length}`,
      log: `子任务压栈，剩余任务=${taskStack.length}`,
      codeLine: lines.pushNextTasks,
      metrics: { '新增任务': `${child.val} 左右子任务`, '总任务数': taskStack.length },
      statusBadge: { text: `任务压栈 (深 ${taskStack.length})`, type: 'info' },
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
    action: 'done',
    phase: 'done',
    message: `显式任务栈清空，全树构建完成，根节点为 ${root.val}`,
    log: `构建完成，根节点=${root.val}`,
    codeLine: lines.returnRoot,
    metrics: { '全树构建完成': 'TRUE', '根节点': root.val, '总节点数': allTreeVals.length },
    statusBadge: { text: '显式栈完成', type: 'success' },
  });

  return steps;
}

/** 统一入口（兼容旧 API 与目录测试） */
export function buildMaxTreeSteps(nums: number[]): MaxTreeStep[] {
  return buildMaxTreeStage1Steps(nums);
}

/**
 * 领域统一门面 (MaxTreeStepCompiler)
 */
export class MaxTreeStepCompiler {
  static buildStage1Steps = buildMaxTreeStage1Steps;
  static buildStage2StackSteps = buildMaxTreeStage2StackSteps;
  static buildStage3IterativeSteps = buildMaxTreeStage3IterativeSteps;
  static buildSteps = buildMaxTreeSteps;
  static collectTreeValues = collectTreeValues;
}
