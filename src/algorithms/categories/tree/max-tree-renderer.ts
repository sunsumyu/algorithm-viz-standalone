/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 设计模式抽象与设计原则:
 *   - 建造者模式 (Builder Pattern): 利用 RecursiveCallTraceBuilder 结构化构建递归分治推演树与状态快照
 *   - 适配器模式 (Adapter Pattern): TreeCanvasAdapter (Card 1 画布) + RecursiveCallTraceAdapter (Card 2 调用栈视图)
 *   - 单一职责与防腐隔离 (SRP): Card 1 与 Card 2 彻底解耦，杜绝跨容器选择器穿透与 DOM 污染
 *   - 严格一行一步与零静默 (Strict One-Line-One-Step): 覆盖所有递归入口/判空/最值扫描/左右子树挂载与回溯帧
 *
 * 核心多阶段演化体系:
 *   Stage 1: 经典分治与区间扫描 (Recursive Divide & Conquer, O(N log N) ~ O(N^2))
 *   Stage 2: 单调栈 O(N) 笛卡尔树 (Monotonic Stack Cartesian Tree, O(N))
 *   Stage 3: 显式任务栈迭代构建 (Explicit Construction Stack)
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceAdapter,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { HighlightTarget, StepBase } from '../../../core/step-visualizer';
import { TreeNode } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
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

// 辅助深拷贝树节点以记录快照 (委托通用 cloneStateDepTree 消除重复)
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

// 统一入口（兼容旧 API 与目录测试）
export function buildMaxTreeSteps(nums: number[]): MaxTreeStep[] {
  return buildMaxTreeStage1Steps(nums);
}

// ============================================================
// 统一表现层渲染器 (Card 1: 树画布纯净沙盘)
// ============================================================
export function renderMaxTreeCanvas(container: HTMLElement, step: MaxTreeStep): void {
  if (!step.tree) {
    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #64748b; font-size: 13px;">
        <span style="font-size: 32px; margin-bottom: 8px;">🌲</span>
        <span>待构建最大二叉树 (树为空或尚未生成节点)</span>
      </div>
    `;
    return;
  }

  const isDone = step.action === 'done' || step.message.includes('完成');
  const allTreeVals = collectTreeValues(step.tree);

  let primaryNode = step.current;
  let visitedNodes = step.visitedNodes ?? [];
  let secondaryNodes: number[] = [];

  if (isDone) {
    visitedNodes = allTreeVals;
    if (primaryNode === null && step.tree) {
      primaryNode = step.tree.val;
    }
  } else if (step.maxIdx != null && step.nums && step.nums[step.maxIdx] != null) {
    secondaryNodes = [step.nums[step.maxIdx]];
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: primaryNode,
    secondaryHighlightedNodes: secondaryNodes,
    visitedNodes: visitedNodes,
    primaryColor: '#fbbf24', // 金黄: 当前焦点/考察元素
    secondaryColor: '#c084fc', // 紫罗兰: 区间最大值节点
    visitedColor: '#34d399', // 翡翠绿: 已建树收尾高亮
  });
}

// ============================================================
// Card 2 自定义指标与推演栈渲染器 (Card 2 Presentation Adapters)
// ============================================================

/** 辅助生成数组切片与区间扫描沙盘 */
function renderArrayScanBar(step: MaxTreeStep): HTMLElement {
  const arrayBox = document.createElement('div');
  arrayBox.style.display = 'flex';
  arrayBox.style.flexDirection = 'column';
  arrayBox.style.gap = '6px';
  arrayBox.style.background = 'rgba(15, 23, 42, 0.5)';
  arrayBox.style.padding = '8px 10px';
  arrayBox.style.borderRadius = '6px';
  arrayBox.style.border = '1px solid rgba(51, 65, 85, 0.6)';

  const arrayTitle = document.createElement('div');
  arrayTitle.style.fontSize = '11px';
  arrayTitle.style.fontWeight = '700';
  arrayTitle.style.color = '#94a3b8';
  arrayTitle.textContent = step.range
    ? `当前扫描区间 [${step.range[0]}, ${step.range[1]}]`
    : '输入数组 nums 元素状态';
  arrayBox.appendChild(arrayTitle);

  const arrayRow = document.createElement('div');
  arrayRow.style.display = 'flex';
  arrayRow.style.flexWrap = 'wrap';
  arrayRow.style.gap = '5px';

  step.nums.forEach((val, i) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'center';
    item.style.minWidth = '34px';
    item.style.height = '40px';
    item.style.borderRadius = '5px';
    item.style.fontSize = '12px';
    item.style.fontWeight = '700';
    item.style.fontFamily = 'monospace';
    item.style.transition = 'all 0.15s ease';

    const inRange = step.range ? i >= step.range[0] && i <= step.range[1] : true;
    const isScan = step.scanIdx === i;
    const isMax = step.maxIdx === i;
    const isCurrent = step.current === val;

    if (isMax) {
      item.style.background = 'rgba(192, 132, 252, 0.25)';
      item.style.color = '#e9d5ff';
      item.style.border = '2px solid #c084fc';
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
      item.style.background = 'rgba(15, 23, 42, 0.4)';
      item.style.color = '#475569';
      item.style.border = '1px dashed #334155';
      item.style.opacity = '0.5';
    }

    item.innerHTML = `
      <span>${val}</span>
      <span style="font-size: 8px; opacity: 0.7; font-weight: normal;">#${i}</span>
    `;
    arrayRow.appendChild(item);
  });
  arrayBox.appendChild(arrayRow);
  return arrayBox;
}

/** 辅助生成推演决策总结框 */
function renderDecisionSummary(step: MaxTreeStep): HTMLElement {
  const summaryBox = document.createElement('div');
  summaryBox.style.background = 'rgba(30, 41, 59, 0.5)';
  summaryBox.style.padding = '8px 10px';
  summaryBox.style.borderRadius = '6px';
  summaryBox.style.fontSize = '11px';
  summaryBox.style.lineHeight = '1.4';
  summaryBox.style.color = '#94a3b8';
  summaryBox.style.border = '1px solid rgba(51, 65, 85, 0.4)';
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">⚡ 推演动态</div>
    <div style="color: #e2e8f0;">${step.message}</div>
  `;
  return summaryBox;
}

/**
 * Stage 1: Card 2 递归调用推演跟踪栈
 */
export function renderStage1CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前焦点</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.current ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">区间最值</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.maxVal ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">递归深度</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.depth}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前区间</span>
      <span class="text-cyan-300 font-mono font-bold text-sm mt-0.5 truncate">${step.range ? `[${step.range[0]}, ${step.range[1]}]` : '全域'}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 数组与区间沙盘
  container.appendChild(renderArrayScanBar(step));

  // 3. 递归调用推演跟踪栈
  const traceBox = document.createElement('div');
  traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
  if (step.callTrace) {
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
  } else {
    traceBox.innerHTML = '<span class="text-slate-500 italic text-xs">无活动调用栈</span>';
  }
  container.appendChild(traceBox);

  // 4. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * Stage 2: Card 2 单调栈笛卡尔树监视器
 */
export function renderStage2CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">考察元素</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.activeNum ?? step.current ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">笛卡尔树根</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.stackVals && step.stackVals.length > 0 ? step.stackVals[0] : '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">单调栈深</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.stackVals ? step.stackVals.length : 0}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">遍历进度</span>
      <span class="text-cyan-300 font-mono font-bold text-sm mt-0.5 truncate">${(step.scanIdx ?? 0) + 1} / ${step.nums.length}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 数组与扫描状态条
  container.appendChild(renderArrayScanBar(step));

  // 3. 单调栈槽监视器
  const stackBox = document.createElement('div');
  stackBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

  const stackHeader = document.createElement('div');
  stackHeader.className = 'flex items-center justify-between text-slate-400 text-[11px] font-semibold';
  stackHeader.innerHTML = `
    <span>🧭 单调递减栈槽 (栈底 ➔ 栈顶)</span>
    <span class="text-slate-500 font-mono">Size: ${step.stackVals?.length ?? 0}</span>
  `;
  stackBox.appendChild(stackHeader);

  const stackRow = document.createElement('div');
  stackRow.className = 'flex flex-wrap gap-2 items-center';

  if (!step.stackVals || step.stackVals.length === 0) {
    stackRow.innerHTML = `<span class="text-slate-500 italic text-xs">(栈为空)</span>`;
  } else {
    step.stackVals.forEach((v, idx) => {
      const isTop = idx === step.stackVals!.length - 1;
      const slot = document.createElement('div');
      slot.className = `px-2.5 py-1.5 rounded border font-mono text-xs font-bold transition-all ${
        isTop
          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/10'
          : 'bg-slate-800/80 border-slate-700 text-slate-300'
      }`;
      slot.innerHTML = `<span>${v}</span>${isTop ? '<span class="text-[9px] text-amber-300 ml-1 font-normal">(顶)</span>' : ''}`;
      stackRow.appendChild(slot);
    });
  }
  stackBox.appendChild(stackRow);
  container.appendChild(stackBox);

  // 4. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

/**
 * Stage 3: Card 2 显式任务栈监视器
 */
export function renderStage3CustomMetrics(container: HTMLElement, step: MaxTreeStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前处理</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.current ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">子树最值</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.maxVal ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">任务栈深</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.depth}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">子树区间</span>
      <span class="text-cyan-300 font-mono font-bold text-sm mt-0.5 truncate">${step.range ? `[${step.range[0]}, ${step.range[1]}]` : '根就绪'}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 数组与区间沙盘
  container.appendChild(renderArrayScanBar(step));

  // 3. 任务队列状态监视器
  const taskBox = document.createElement('div');
  taskBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

  const taskHeader = document.createElement('div');
  taskHeader.className = 'flex items-center justify-between text-slate-400 text-[11px] font-semibold';
  taskHeader.innerHTML = `
    <span>🧱 显式任务栈调度器</span>
    <span class="text-slate-500 font-mono">Tasks: ${step.depth}</span>
  `;
  taskBox.appendChild(taskHeader);

  const taskContent = document.createElement('div');
  taskContent.className = 'text-xs text-slate-300 flex flex-col gap-1.5';
  taskContent.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-slate-500">当前任务区间:</span>
      <span class="font-mono text-cyan-300 font-semibold">${step.range ? `[${step.range[0]}, ${step.range[1]}]` : '(全域调度)'}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-slate-500">操作节点:</span>
      <span class="font-mono text-amber-300 font-semibold">${step.current ?? '-'}</span>
    </div>
  `;
  taskBox.appendChild(taskContent);
  container.appendChild(taskBox);

  // 4. 当前推演决策总结
  container.appendChild(renderDecisionSummary(step));
}

// ============================================================
// 注册多阶段演化声明式算法
// ============================================================
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
    { label: '当前焦点', color: '#fbbf24' },
    { label: '最大值节点', color: '#c084fc' },
    { label: '扫描比对中', color: '#f59e0b' },
    { label: '已完成子树', color: '#34d399' },
  ],
  stages: [
    {
      id: 'stage-1-recursive',
      name: '阶段 1: 递归分治与区间线性扫描 (Recursive Divide & Conquer)',
      shortName: '递归分治',
      num: 1,
      badge: {
        mode: '分治递归 · 经典解法',
        complexity: 'O(N²) · O(N)',
      },
      card1Title: '🌲 最大二叉树分治拓扑沙盘',
      card2Title: '📐 区间最值扫描与递归调用推演栈',
      card2Desc: '分治子区间、最值定位、递归回溯树',
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
      renderCustomMetrics: (container: HTMLElement, step: MaxTreeStep) => renderStage1CustomMetrics(container, step),
    },
    {
      id: 'stage-2-monotonic-stack',
      name: '阶段 2: 单调栈 O(N) 笛卡尔树构建 (Monotonic Stack Cartesian Tree)',
      shortName: '单调栈 O(N)',
      num: 2,
      badge: {
        mode: '单调递减栈 · 线性笛卡尔树',
        complexity: 'O(N) · O(N)',
      },
      card1Title: '🌲 单调栈笛卡尔树演进沙盘',
      card2Title: '🧭 单调递减栈槽与左右孩子挂载监视器',
      card2Desc: '弹出小元素挂左孩子、栈顶大元素挂右孩子、压栈',
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
      renderCustomMetrics: (container: HTMLElement, step: MaxTreeStep) => renderStage2CustomMetrics(container, step),
    },
    {
      id: 'stage-3-explicit-stack',
      name: '阶段 3: 显式任务栈迭代构建 (Explicit Construction Stack)',
      shortName: '显式栈模拟',
      num: 3,
      badge: {
        mode: '显式任务栈 · 防递归溢出',
        complexity: 'O(N²) · O(N)',
      },
      card1Title: '🌲 迭代显式任务栈拓扑沙盘',
      card2Title: '🧱 TaskStack 任务队列与子区间调度',
      card2Desc: '模拟调用栈、弹出父子连接任务、区间拆分压栈',
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
      renderCustomMetrics: (container: HTMLElement, step: MaxTreeStep) => renderStage3CustomMetrics(container, step),
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
  buildSteps: (inputs) => {
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
  renderCustomMetrics: (container, step) => renderStage1CustomMetrics(container, step as MaxTreeStep),
});
