/**
 * 二叉树族群遍历步进编译器深模块 (BinaryTreeTraversalCompiler Deep Module)
 *
 * 依据 Matt Pocock 深模块哲学与“两适配器深化法则（Two-Adapter Deepening Rule）”：
 * 将全库 25+ 个二叉树单题（树深度、平衡树、路径和、最近公共祖先等）中重复的
 * 递归调用栈维护、空指针安全守卫、层次遍历队列与静态内存双指针推演，
 * 收敛至单一高内聚深模块。
 *
 * 核心能力：
 * 1. compileDfs: 严格遵循五段式递归生命周期 (📥入口 -> 🔍判空 -> 🎯叶子 -> 🔀深入分支 -> 🔄后序归约)
 * 2. compileBfs: 层次遍历 BFS 队列层级推演、层首/层尾事件与叶节点提前退出
 * 3. compileStaticQueue: 左神 Class 036 招牌零 GC 连续内存双指针队列模拟
 * 4. 内置不可变 CallTrace 拓扑快照与多语言 1-based 行号平滑联动
 */

import { TreeNode, cloneTree } from '../../../algorithms/categories/tree/tree-template';
import { HighlightTarget, StepBase } from '../../step-visualizer';
import {
  CallTraceSnapshot,
  RecursiveCallTraceBuilder,
} from './recursive-call-trace-adapter';

// =========================================================================
// 统一通用二叉树步骤契约 (BinaryTreeStep)
// =========================================================================

export interface StaticQueueSnapshot {
  array?: (number | null)[];
  queue?: number[];
  l: number;
  r: number;
  windowSize?: number;
}

export interface BinaryTreeStep<TResult = any> extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  secondaryCurrent?: number | null;
  stageId?: string;
  action?: string;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
  statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
  callTrace?: CallTraceSnapshot;
  visitedNodes?: number[];

  // 推演计算值
  result?: TResult;
  leftResult?: TResult;
  rightResult?: TResult;

  // BFS 队列字段
  queue?: (number | string)[];
  levelIndex?: number;

  // 静态数组队列状态
  staticQueueState?: StaticQueueSnapshot;

  // 任意算法扩展字段
  [key: string]: any;
}

// =========================================================================
// DFS 规约接口 (TreeDfsSpec)
// =========================================================================

export interface TreeDfsContext<TNode, TResult> {
  depth: number;
  callStack: string[];
  visitedNodes: number[];
  trace: RecursiveCallTraceBuilder;
  nodeDepthMap: Map<number, number>;
  resultMap: Map<number, TResult>;
}

export interface TreeDfsSpec<TNode = TreeNode, TResult = any> {
  root: TNode | null;
  stageId?: string;
  funcName?: string;

  /** 获取子节点，默认兼容 { left, right } */
  getChildren?: (node: TNode) => { left: TNode | null; right: TNode | null };
  /** 获取节点数值/ID */
  getNodeVal?: (node: TNode) => number;
  /** 获取节点显示标签 */
  getNodeLabel?: (node: TNode) => string;

  /** 空树特判自定义步骤（若不提供则走标准 3 步基准序列） */
  onEmpty?: (ctx: TreeDfsContext<TNode, TResult>) => BinaryTreeStep<TResult>[];

  /** 算法初始包装帧 (Init Steps)，如从顶层函数准备进入辅助递归前产生入口步骤 */
  onInitSteps?: (root: TNode, ctx: TreeDfsContext<TNode, TResult>) => BinaryTreeStep<TResult>[];

  /** 1. 递归判空基底求值 (Base Case Null) */
  onBaseNull: (ctx: TreeDfsContext<TNode, TResult>) => {
    result: TResult;
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 2. 节点入口帧 (Entry) */
  onEnter?: (node: TNode, ctx: TreeDfsContext<TNode, TResult>) => {
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 3. 叶节点特判帧 (Leaf Check) - 可选，触发时跳过子树深入并直接返回 */
  onBaseLeaf?: (node: TNode, ctx: TreeDfsContext<TNode, TResult>) => {
    hit: boolean;
    result?: TResult;
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 4. 剪枝特判 (Prune Check) - 可选，如平衡二叉树 -1 剪枝 */
  onPruneCheck?: (
    node: TNode,
    branch: 'left' | 'right',
    branchResult: TResult,
    ctx: TreeDfsContext<TNode, TResult>
  ) => {
    shouldPrune: boolean;
    result: TResult;
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 5. 深入左子树前 (Before Left Call) */
  beforeLeft?: (node: TNode, ctx: TreeDfsContext<TNode, TResult>) => {
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 5.1 左子树归约就绪后 (After Left Done) */
  afterLeft?: (node: TNode, leftResult: TResult, ctx: TreeDfsContext<TNode, TResult>) => {
    action?: string;
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 6. 深入右子树前 (Before Right Call) */
  beforeRight?: (node: TNode, leftResult: TResult, ctx: TreeDfsContext<TNode, TResult>) => {
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 6.1 右子树归约就绪后 (After Right Done) */
  afterRight?: (node: TNode, rightResult: TResult, ctx: TreeDfsContext<TNode, TResult>) => {
    action?: string;
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 7. 后序归约与合并 (Combine / Unwind) */
  onCombine: (
    node: TNode,
    leftResult: TResult,
    rightResult: TResult,
    ctx: TreeDfsContext<TNode, TResult>
  ) => {
    result: TResult;
    action?: string;
    decision: string;
    message: string;
    log: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
    extraSteps?: BinaryTreeStep<TResult>[];
  };

  /** 8. 算法收尾帧 (Done) */
  onDone?: (finalResult: TResult, ctx: TreeDfsContext<TNode, TResult>) => {
    decision?: string;
    message?: string;
    log?: string;
    codeLine?: HighlightTarget;
    metrics?: Record<string, any>;
    statusBadge?: { text: string; type: 'info' | 'success' | 'warning' | 'error' | 'danger' };
    customFields?: Record<string, any>;
  };

  /** 步骤后处理器 (可选，微调最终输出) */
  stepTransformer?: (step: BinaryTreeStep<TResult>) => BinaryTreeStep<TResult>;
}

// =========================================================================
// BFS 规约接口 (TreeBfsSpec)
// =========================================================================

export interface TreeBfsContext<TNode, TResult> {
  levelIndex: number;
  queue: TNode[];
  queueVals: number[];
  visitedNodes: number[];
  depthMap: Map<number, number>;
}

export interface TreeBfsSpec<TNode = TreeNode, TResult = any> {
  root: TNode | null;
  stageId?: string;

  getChildren?: (node: TNode) => { left: TNode | null; right: TNode | null };
  getNodeVal?: (node: TNode) => number;

  onEmpty?: () => {
    result: TResult;
    steps: BinaryTreeStep<TResult>[];
  };

  onInit?: (ctx: TreeBfsContext<TNode, TResult>) => BinaryTreeStep<TResult>;
  onLevelStart?: (ctx: TreeBfsContext<TNode, TResult>) => BinaryTreeStep<TResult>;
  onPollNode?: (node: TNode, ctx: TreeBfsContext<TNode, TResult>) => BinaryTreeStep<TResult>;
  onLeafHit?: (node: TNode, ctx: TreeBfsContext<TNode, TResult>) => {
    earlyExit: boolean;
    result?: TResult;
    step?: BinaryTreeStep<TResult>;
  };
  onExpandChild?: (
    parent: TNode,
    child: TNode,
    branch: 'left' | 'right',
    ctx: TreeBfsContext<TNode, TResult>
  ) => BinaryTreeStep<TResult> | null;
  onLevelEnd?: (ctx: TreeBfsContext<TNode, TResult>) => BinaryTreeStep<TResult>;
  onDone: (finalResult: TResult, ctx: TreeBfsContext<TNode, TResult>) => BinaryTreeStep<TResult>;

  stepTransformer?: (step: BinaryTreeStep<TResult>) => BinaryTreeStep<TResult>;
}

// =========================================================================
// 静态队列规约接口 (TreeStaticQueueSpec)
// =========================================================================

export interface TreeStaticQueueSpec<TNode = TreeNode, TResult = any> {
  root: TNode | null;
  stageId?: string;
  maxCapacity?: number;

  getChildren?: (node: TNode) => { left: TNode | null; right: TNode | null };
  getNodeVal?: (node: TNode) => number;

  onEmpty?: () => {
    result: TResult;
    steps: BinaryTreeStep<TResult>[];
  };

  onInit?: (l: number, r: number, arr: (number | null)[]) => BinaryTreeStep<TResult>;
  onLevelStart?: (
    level: number,
    levelSize: number,
    l: number,
    r: number,
    arr: (number | null)[]
  ) => BinaryTreeStep<TResult>;
  onPollNode?: (
    node: TNode,
    l: number,
    r: number,
    arr: (number | null)[],
    level: number
  ) => BinaryTreeStep<TResult>;
  onLeafHit?: (
    node: TNode,
    l: number,
    r: number,
    level: number
  ) => { earlyExit: boolean; result?: TResult; step?: BinaryTreeStep<TResult> };
  onPushChild?: (
    child: TNode,
    branch: 'left' | 'right',
    l: number,
    r: number,
    arr: (number | null)[]
  ) => BinaryTreeStep<TResult> | null;
  onLevelEnd?: (
    level: number,
    l: number,
    r: number,
    arr: (number | null)[]
  ) => BinaryTreeStep<TResult>;
  onDone: (
    finalResult: TResult,
    l: number,
    r: number,
    arr: (number | null)[]
  ) => BinaryTreeStep<TResult>;

  stepTransformer?: (step: BinaryTreeStep<TResult>) => BinaryTreeStep<TResult>;
}

// =========================================================================
// 深模块编译器实体 (BinaryTreeTraversalCompiler)
// =========================================================================

export class BinaryTreeTraversalCompiler {
  /**
   * 编译五段式递归推演步骤 (DFS)
   */
  public static compileDfs<TNode = TreeNode, TResult = any>(
    spec: TreeDfsSpec<TNode, TResult>
  ): BinaryTreeStep<TResult>[] {
    const steps: BinaryTreeStep<TResult>[] = [];
    const getChildren =
      spec.getChildren ||
      ((n: any) => ({ left: n?.left ?? null, right: n?.right ?? null }));
    const getNodeVal = spec.getNodeVal || ((n: any) => (n?.val !== undefined ? Number(n.val) : 0));
    const getNodeLabel = spec.getNodeLabel || ((n: any) => `节点 ${getNodeVal(n)}`);
    const funcName = spec.funcName || 'dfs';
    const stageId = spec.stageId || 'stage-1';

    const trace = new RecursiveCallTraceBuilder();
    const callStack: string[] = [];
    const visitedNodes: number[] = [];
    const nodeDepthMap = new Map<number, number>();
    const resultMap = new Map<number, TResult>();

    const ctx: TreeDfsContext<TNode, TResult> = {
      depth: 0,
      callStack,
      visitedNodes,
      trace,
      nodeDepthMap,
      resultMap,
    };

    // 1. 空树入口守卫
    if (!spec.root) {
      if (spec.onEmpty) {
        const raw = spec.onEmpty(ctx);
        return spec.stepTransformer ? raw.map(spec.stepTransformer) : raw;
      }

      trace.addHeader(`${funcName}(null)`, 0, '<- 根调用空树特判');
      trace.addConditionHit('① root == null √ 命中基准', 0);
      const nullMeta = spec.onBaseNull(ctx);
      trace.addReturnLeaf(`return ${JSON.stringify(nullMeta.result)}`, 0);
      trace.addFinalResult(`最终计算结果: ${nullMeta.result}`, 0, undefined, String(nullMeta.result));

      // 产生标准 3 步基准序列
      const s1: BinaryTreeStep<TResult> = {
        tree: null,
        current: null,
        action: 'entry',
        decision: '算法启动：空树基底检验',
        message: '传入二叉树根节点为空 (null)，启动基准条件判定。',
        log: `${funcName}(root = null)`,
        stageId,
        codeLine: nullMeta.codeLine,
        metrics: nullMeta.metrics || { '当前节点': 'null', '计算结果': String(nullMeta.result) },
        statusBadge: { text: '空树输入', type: 'info' },
        callTrace: trace.snapshot(),
        result: nullMeta.result,
        ...nullMeta.customFields,
      };

      const s2: BinaryTreeStep<TResult> = {
        tree: null,
        current: null,
        action: 'base-check',
        decision: nullMeta.decision || '空树基底命中，直接返回基底值',
        message: nullMeta.message || '递归基准：root == null 返回基底解。',
        log: nullMeta.log || `return ${JSON.stringify(nullMeta.result)}`,
        stageId,
        codeLine: nullMeta.codeLine,
        metrics: nullMeta.metrics || { '当前节点': 'null', '计算结果': String(nullMeta.result) },
        statusBadge: nullMeta.statusBadge || { text: '基准退出', type: 'info' },
        callTrace: trace.snapshot(),
        result: nullMeta.result,
        ...nullMeta.customFields,
      };

      const s3: BinaryTreeStep<TResult> = {
        tree: null,
        current: null,
        action: 'done',
        decision: '递归求解完成：返回最终结果',
        message: `全树递归结束，最终结果为 ${nullMeta.result}。`,
        log: `最终结果 = ${nullMeta.result}`,
        stageId,
        codeLine: nullMeta.codeLine,
        metrics: nullMeta.metrics || { '当前节点': 'null', '最终结果': String(nullMeta.result) },
        statusBadge: { text: '推演完成', type: 'success' },
        callTrace: trace.snapshot(),
        result: nullMeta.result,
        ...nullMeta.customFields,
      };

      const raw = [s1, s2, s3];
      return spec.stepTransformer ? raw.map(spec.stepTransformer) : raw;
    }

    // 1.1 若算法声明了初始入口包装步骤 (如 public wrapper 调用辅助递归函数)
    if (spec.onInitSteps) {
      const initSteps = spec.onInitSteps(spec.root, ctx);
      steps.push(...initSteps);
    }

    // 2. 递归主推演引擎
    function dfs(node: TNode | null, currentDepth: number): TResult {
      ctx.depth = currentDepth;

      // 判空基底
      if (!node) {
        trace.addHeader(`${funcName}(null)`, currentDepth, '<- 深入空引用');
        trace.addConditionHit('① node == null √ 命中基准', currentDepth);
        const nullMeta = spec.onBaseNull(ctx);
        trace.addReturnLeaf(`return ${JSON.stringify(nullMeta.result)}`, currentDepth);

        steps.push({
          tree: cloneTree(spec.root as any),
          current: null,
          action: 'base-check',
          decision: nullMeta.decision || '命中空节点基底',
          message: nullMeta.message || '当前引用为空，直接返回基底值。',
          log: nullMeta.log || `return ${JSON.stringify(nullMeta.result)}`,
          stageId,
          codeLine: nullMeta.codeLine,
          metrics: nullMeta.metrics,
          statusBadge: nullMeta.statusBadge || { text: '基底返回', type: 'info' },
          callTrace: trace.snapshot(),
          result: nullMeta.result,
          visitedNodes: [...visitedNodes],
          ...nullMeta.customFields,
        });

        return nullMeta.result;
      }

      const val = getNodeVal(node);
      const label = getNodeLabel(node);
      nodeDepthMap.set(val, currentDepth);
      if (!visitedNodes.includes(val)) visitedNodes.push(val);

      const frameLabel = `${funcName}(${val})`;
      callStack.push(frameLabel);
      trace.addHeader(frameLabel, currentDepth, `<- 进入 ${label}`);

      // 入口帧
      const enterMeta = spec.onEnter ? spec.onEnter(node, ctx) : undefined;
      steps.push({
        tree: cloneTree(spec.root as any),
        current: val,
        action: 'entry',
        decision: enterMeta?.decision || `进入 ${label}，开始探索`,
        message: enterMeta?.message || `执行调用帧 ${frameLabel}，准备向下推演。`,
        log: enterMeta?.log || `-> ${frameLabel}`,
        stageId,
        codeLine: enterMeta?.codeLine,
        metrics: enterMeta?.metrics,
        statusBadge: enterMeta?.statusBadge || { text: '深入调用', type: 'info' },
        callTrace: trace.snapshot(),
        visitedNodes: [...visitedNodes],
        ...enterMeta?.customFields,
      });

      // 叶节点特判帧
      if (spec.onBaseLeaf) {
        const leafMeta = spec.onBaseLeaf(node, ctx);
        if (leafMeta && leafMeta.hit && leafMeta.result !== undefined) {
          trace.addConditionHit(`🎯 ${label} 为叶节点，提前返回`, currentDepth);
          trace.addReturnLeaf(`return ${JSON.stringify(leafMeta.result)}`, currentDepth);

          steps.push({
            tree: cloneTree(spec.root as any),
            current: val,
            action: 'base-leaf',
            decision: leafMeta.decision || `叶节点特判命中：${label}`,
            message: leafMeta.message || `${label} 无左右子树，返回叶子结果。`,
            log: leafMeta.log || `叶子返回: ${JSON.stringify(leafMeta.result)}`,
            stageId,
            codeLine: leafMeta.codeLine,
            metrics: leafMeta.metrics,
            statusBadge: leafMeta.statusBadge || { text: '叶子退出', type: 'success' },
            callTrace: trace.snapshot(),
            result: leafMeta.result,
            visitedNodes: [...visitedNodes],
            ...leafMeta.customFields,
          });

          resultMap.set(val, leafMeta.result);
          callStack.pop();
          return leafMeta.result;
        }
      }

      const { left, right } = getChildren(node);

      // 深入左子树前
      if (spec.beforeLeft) {
        const bl = spec.beforeLeft(node, ctx);
        if (bl) {
          steps.push({
            tree: cloneTree(spec.root as any),
            current: val,
            action: 'call-left',
            decision: bl.decision || `准备进入 ${label} 的左子树`,
            message: bl.message || `即将调用左分支 ${left ? getNodeLabel(left) : 'null'}`,
            log: bl.log || `-> 深入左子树`,
            stageId,
            codeLine: bl.codeLine,
            metrics: bl.metrics,
            statusBadge: bl.statusBadge,
            callTrace: trace.snapshot(),
            visitedNodes: [...visitedNodes],
            ...bl.customFields,
          });
        }
      }

      trace.addRecursePrep(`进入左子树调用`, currentDepth);
      const leftRes = dfs(left, currentDepth + 1);

      // 左子树就绪步骤
      if (spec.afterLeft) {
        const al = spec.afterLeft(node, leftRes, ctx);
        if (al) {
          steps.push({
            tree: cloneTree(spec.root as any),
            current: val,
            action: al.action || 'left-done',
            decision: al.decision || `左子树调用就绪，返回结果 = ${leftRes}`,
            message: al.message || `从左子树归约返回至 ${label}`,
            log: al.log || `<- 左子树返回 ${leftRes}`,
            stageId,
            codeLine: al.codeLine,
            metrics: al.metrics,
            statusBadge: al.statusBadge,
            callTrace: trace.snapshot(),
            visitedNodes: [...visitedNodes],
            leftResult: leftRes,
            ...al.customFields,
          });
        }
      }

      // 左分支剪枝特判
      if (spec.onPruneCheck) {
        const pruneMeta = spec.onPruneCheck(node, 'left', leftRes, ctx);
        if (pruneMeta.shouldPrune) {
          trace.addConditionHit(`✂ 剪枝触发，提前返回`, currentDepth);
          steps.push({
            tree: cloneTree(spec.root as any),
            current: val,
            action: 'prune',
            decision: pruneMeta.decision || `触发剪枝：提前返回`,
            message: pruneMeta.message || `左子树计算满足剪枝条件，停止探索右子树。`,
            log: pruneMeta.log || `剪枝退出: ${pruneMeta.result}`,
            stageId,
            codeLine: pruneMeta.codeLine,
            metrics: pruneMeta.metrics,
            statusBadge: pruneMeta.statusBadge || { text: '提前剪枝', type: 'warning' },
            callTrace: trace.snapshot(),
            result: pruneMeta.result,
            visitedNodes: [...visitedNodes],
            pruned: true,
            ...pruneMeta.customFields,
          });
          resultMap.set(val, pruneMeta.result);
          callStack.pop();
          return pruneMeta.result;
        }
      }

      // 深入右子树前
      if (spec.beforeRight) {
        const br = spec.beforeRight(node, leftRes, ctx);
        if (br) {
          steps.push({
            tree: cloneTree(spec.root as any),
            current: val,
            action: 'call-right',
            decision: br.decision || `准备进入 ${label} 的右子树`,
            message: br.message || `左子树已就绪，即将调用右分支`,
            log: br.log || `-> 深入右子树`,
            stageId,
            codeLine: br.codeLine,
            metrics: br.metrics,
            statusBadge: br.statusBadge,
            callTrace: trace.snapshot(),
            visitedNodes: [...visitedNodes],
            leftResult: leftRes,
            ...br.customFields,
          });
        }
      }

      trace.addRecursePrep(`进入右子树调用`, currentDepth);
      const rightRes = dfs(right, currentDepth + 1);

      // 右子树就绪步骤
      if (spec.afterRight) {
        const ar = spec.afterRight(node, rightRes, ctx);
        if (ar) {
          steps.push({
            tree: cloneTree(spec.root as any),
            current: val,
            action: ar.action || 'right-done',
            decision: ar.decision || `右子树调用就绪，返回结果 = ${rightRes}`,
            message: ar.message || `从右子树归约返回至 ${label}`,
            log: ar.log || `<- 右子树返回 ${rightRes}`,
            stageId,
            codeLine: ar.codeLine,
            metrics: ar.metrics,
            statusBadge: ar.statusBadge,
            callTrace: trace.snapshot(),
            visitedNodes: [...visitedNodes],
            leftResult: leftRes,
            rightResult: rightRes,
            ...ar.customFields,
          });
        }
      }

      // 右分支剪枝特判
      if (spec.onPruneCheck) {
        const pruneMeta = spec.onPruneCheck(node, 'right', rightRes, ctx);
        if (pruneMeta.shouldPrune) {
          trace.addConditionHit(`✂ 剪枝触发，提前返回`, currentDepth);
          steps.push({
            tree: cloneTree(spec.root as any),
            current: val,
            action: 'prune',
            decision: pruneMeta.decision || `触发剪枝：提前返回`,
            message: pruneMeta.message || `右子树计算满足剪枝条件。`,
            log: pruneMeta.log || `剪枝退出: ${pruneMeta.result}`,
            stageId,
            codeLine: pruneMeta.codeLine,
            metrics: pruneMeta.metrics,
            statusBadge: pruneMeta.statusBadge || { text: '提前剪枝', type: 'warning' },
            callTrace: trace.snapshot(),
            result: pruneMeta.result,
            visitedNodes: [...visitedNodes],
            pruned: true,
            ...pruneMeta.customFields,
          });
          resultMap.set(val, pruneMeta.result);
          callStack.pop();
          return pruneMeta.result;
        }
      }

      // 后序合并
      const combineMeta = spec.onCombine(node, leftRes, rightRes, ctx);
      trace.addUnwindCalc(
        `合并 [${val}]: 左=${JSON.stringify(leftRes)}, 右=${JSON.stringify(rightRes)} -> ${JSON.stringify(combineMeta.result)}`,
        currentDepth
      );

      steps.push({
        tree: cloneTree(spec.root as any),
        current: val,
        action: combineMeta.action || 'combine',
        decision: combineMeta.decision,
        message: combineMeta.message,
        log: combineMeta.log,
        stageId,
        codeLine: combineMeta.codeLine,
        metrics: combineMeta.metrics,
        statusBadge: combineMeta.statusBadge || { text: '归约就绪', type: 'success' },
        callTrace: trace.snapshot(),
        result: combineMeta.result,
        leftResult: leftRes,
        rightResult: rightRes,
        visitedNodes: [...visitedNodes],
        ...combineMeta.customFields,
      });

      if (combineMeta.extraSteps && combineMeta.extraSteps.length > 0) {
        steps.push(...combineMeta.extraSteps);
      }

      resultMap.set(val, combineMeta.result);
      callStack.pop();
      return combineMeta.result;
    }

    const finalResult = dfs(spec.root, 0);

    // 3. 最终收尾步
    trace.addFinalResult(`全树求解完毕: ${JSON.stringify(finalResult)}`, 0, undefined, String(finalResult));
    const doneMeta = spec.onDone ? spec.onDone(finalResult, ctx) : undefined;

    steps.push({
      tree: cloneTree(spec.root as any),
      current: getNodeVal(spec.root),
      action: 'done',
      decision: doneMeta?.decision || `二叉树推演完成：最终结果 = ${finalResult}`,
      message: doneMeta?.message || `全树递归归约完毕，输出最终求解结果 ${finalResult}。`,
      log: doneMeta?.log || `推演结束 -> 结果: ${finalResult}`,
      stageId,
      codeLine: doneMeta?.codeLine,
      metrics: doneMeta?.metrics,
      statusBadge: doneMeta?.statusBadge || { text: '推演完成', type: 'success' },
      callTrace: trace.snapshot(),
      result: finalResult,
      visitedNodes: [...visitedNodes],
      ...doneMeta?.customFields,
    });

    return spec.stepTransformer ? steps.map(spec.stepTransformer) : steps;
  }

  /**
   * 编译层次遍历推演步骤 (BFS Queue)
   */
  public static compileBfs<TNode = TreeNode, TResult = any>(
    spec: TreeBfsSpec<TNode, TResult>
  ): BinaryTreeStep<TResult>[] {
    const steps: BinaryTreeStep<TResult>[] = [];
    const getChildren =
      spec.getChildren ||
      ((n: any) => ({ left: n?.left ?? null, right: n?.right ?? null }));
    const getNodeVal = spec.getNodeVal || ((n: any) => (n?.val !== undefined ? Number(n.val) : 0));
    const stageId = spec.stageId || 'stage-2';

    if (!spec.root) {
      if (spec.onEmpty) {
        const emptyData = spec.onEmpty();
        return spec.stepTransformer ? emptyData.steps.map(spec.stepTransformer) : emptyData.steps;
      }
      return [];
    }

    const queue: TNode[] = [spec.root];
    const visitedNodes: number[] = [];
    const depthMap = new Map<number, number>();
    let levelIndex = 0;

    const ctx: TreeBfsContext<TNode, TResult> = {
      levelIndex,
      queue,
      queueVals: [getNodeVal(spec.root)],
      visitedNodes,
      depthMap,
    };

    if (spec.onInit) {
      steps.push(spec.onInit(ctx));
    }

    let earlyExited = false;
    let finalResult: any = 0;

    while (queue.length > 0 && !earlyExited) {
      levelIndex += 1;
      ctx.levelIndex = levelIndex;
      const levelSize = queue.length;
      ctx.queueVals = queue.map(getNodeVal);

      if (spec.onLevelStart) {
        steps.push(spec.onLevelStart(ctx));
      }

      for (let i = 0; i < levelSize; i++) {
        const cur = queue.shift()!;
        const val = getNodeVal(cur);
        if (!visitedNodes.includes(val)) visitedNodes.push(val);
        depthMap.set(val, levelIndex);
        ctx.queueVals = queue.map(getNodeVal);

        if (spec.onPollNode) {
          steps.push(spec.onPollNode(cur, ctx));
        }

        // 叶子特判
        if (spec.onLeafHit) {
          const hit = spec.onLeafHit(cur, ctx);
          if (hit.step) steps.push(hit.step);
          if (hit.earlyExit) {
            earlyExited = true;
            finalResult = hit.result;
            break;
          }
        }

        const { left, right } = getChildren(cur);
        if (left) {
          queue.push(left);
          ctx.queueVals = queue.map(getNodeVal);
          if (spec.onExpandChild) {
            const s = spec.onExpandChild(cur, left, 'left', ctx);
            if (s) steps.push(s);
          }
        }

        if (right) {
          queue.push(right);
          ctx.queueVals = queue.map(getNodeVal);
          if (spec.onExpandChild) {
            const s = spec.onExpandChild(cur, right, 'right', ctx);
            if (s) steps.push(s);
          }
        }
      }

      if (spec.onLevelEnd && !earlyExited) {
        steps.push(spec.onLevelEnd(ctx));
      }
    }

    if (!earlyExited) {
      finalResult = levelIndex;
    }

    steps.push(spec.onDone(finalResult, ctx));
    return spec.stepTransformer ? steps.map(spec.stepTransformer) : steps;
  }

  /**
   * 编译连续内存双指针队列推演步骤 (Static Queue)
   */
  public static compileStaticQueue<TNode = TreeNode, TResult = any>(
    spec: TreeStaticQueueSpec<TNode, TResult>
  ): BinaryTreeStep<TResult>[] {
    const steps: BinaryTreeStep<TResult>[] = [];
    const getChildren =
      spec.getChildren ||
      ((n: any) => ({ left: n?.left ?? null, right: n?.right ?? null }));
    const getNodeVal = spec.getNodeVal || ((n: any) => (n?.val !== undefined ? Number(n.val) : 0));
    const maxCapacity = spec.maxCapacity || 1000;

    if (!spec.root) {
      if (spec.onEmpty) {
        const emptyData = spec.onEmpty();
        return spec.stepTransformer ? emptyData.steps.map(spec.stepTransformer) : emptyData.steps;
      }
      return [];
    }

    // 静态数组模拟队列
    const staticArr: (TNode | null)[] = new Array(maxCapacity).fill(null);
    let l = 0;
    let r = 0;

    staticArr[r++] = spec.root;
    const toVals = (arr: (TNode | null)[]) => arr.map((n) => (n ? getNodeVal(n) : null));

    if (spec.onInit) {
      steps.push(spec.onInit(l, r, toVals(staticArr)));
    }

    let level = 0;
    let earlyExited = false;
    let finalResult: any = 0;

    while (l < r && !earlyExited) {
      level += 1;
      const levelSize = r - l;

      if (spec.onLevelStart) {
        steps.push(spec.onLevelStart(level, levelSize, l, r, toVals(staticArr)));
      }

      for (let i = 0; i < levelSize; i++) {
        const cur = staticArr[l++]!;

        if (spec.onPollNode) {
          steps.push(spec.onPollNode(cur, l, r, toVals(staticArr), level));
        }

        if (spec.onLeafHit) {
          const hit = spec.onLeafHit(cur, l, r, level);
          if (hit.step) steps.push(hit.step);
          if (hit.earlyExit) {
            earlyExited = true;
            finalResult = hit.result;
            break;
          }
        }

        const { left, right } = getChildren(cur);
        if (left) {
          staticArr[r++] = left;
          if (spec.onPushChild) {
            const s = spec.onPushChild(left, 'left', l, r, toVals(staticArr));
            if (s) steps.push(s);
          }
        }

        if (right) {
          staticArr[r++] = right;
          if (spec.onPushChild) {
            const s = spec.onPushChild(right, 'right', l, r, toVals(staticArr));
            if (s) steps.push(s);
          }
        }
      }

      if (spec.onLevelEnd && !earlyExited) {
        steps.push(spec.onLevelEnd(level, l, r, toVals(staticArr)));
      }
    }

    if (!earlyExited) {
      finalResult = level;
    }

    steps.push(spec.onDone(finalResult, l, r, toVals(staticArr)));
    return spec.stepTransformer ? steps.map(spec.stepTransformer) : steps;
  }
}
