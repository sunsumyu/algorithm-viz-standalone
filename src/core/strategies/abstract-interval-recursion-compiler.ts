import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

export interface IntervalRecursionContext {
  model: IYamlAlgorithmModel;
  s: string;
  n: number;
  isMemo: boolean;
  anchorMap: Record<string, number>;
  gridState: (number | null)[][];
  activeStack: string[];
  visitedCells: Set<string>;
  memoCache: Record<string, number>;
  rootNode: UniversalTreeNode;
  nodeIdCounter: number;
  callCount: number;
}

export interface IntervalBoundaryResult {
  isBase: boolean;
  val?: number;
  lineKey?: string;
  tag?: string;
  log?: string;
  msg?: string;
}

export interface IntervalConditionResult {
  isMatch: boolean;
  charI: string;
  charJ: string;
  lineKey?: string;
  tag?: string;
  log?: string;
  msg?: string;
}

export interface IntervalBranchSpec {
  nextI: number;
  nextJ: number;
  lineKey: string;
  varName?: string;
  branchType?: 'diag' | 'bottom' | 'left';
  tag: string;
  log: string;
  msg: string;
}

export interface IntervalCombineResult {
  val: number;
  lineKey: string;
  tag: string;
  log: string;
  msg: string;
}

/**
 * AbstractIntervalRecursionCompiler — 区间 DP 递归与记忆化顶层抽象编译器
 *
 * 核心设计：Template Method 模式。
 * 遵循《universal-dp-refactoring》黄金基准，独占区间递归的控制流，保障零跳步物理不变量：
 *   1. main_entry / memo_init / call_dfs: 主函数外层框架帧
 *   2. dfs_entry: 递归入口帧（压栈、高亮函数头）
 *   3. boundary: 区间边界基底特判 (i > j 与 i == j)
 *   4. cache_hit: 备忘录命中 O(1) 剪枝（仅 Stage 2）
 *   5. match: 端点字符关系比对与条件求值
 *   6. branch-call: 【核心拦截点】进入具体分支前发射调用行高亮帧
 *   7. branch-return: 【Call-Return Parity】子递归返回后发射回溯赋值帧
 *   8. combine: 结果汇总、写入备忘录、回溯出栈
 *   9. return: 最终结果收敛
 */
export abstract class AbstractIntervalRecursionCompiler {
  public compile(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap: Record<string, number> = {}
  ): UniversalStep[] {
    const s = this.extractString(model);
    const n = s.length;

    const gridState: (number | null)[][] = Array.from({ length: n }, () =>
      new Array(n).fill(null)
    );
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    const memoCache: Record<string, number> = {};

    const rootNode: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: n - 1,
      val: `dfs(0, ${n - 1})`,
      status: 'current',
      children: []
    };

    const ctx: IntervalRecursionContext = {
      model,
      s,
      n,
      isMemo,
      anchorMap,
      gridState,
      activeStack,
      visitedCells,
      memoCache,
      rootNode,
      nodeIdCounter: 1,
      callCount: 0
    };

    const steps: UniversalStep[] = [];

    const emitStep = (stepData: any) => {
      const isComparing =
        stepData.type === 'match-eval' ||
        stepData.type === 'branch-call' ||
        stepData.type === 'match-branch' ||
        stepData.type === 'diff-branch-left' ||
        stepData.type === 'diff-branch-right';

      steps.push({
        s,
        curI: stepData.i ?? 0,
        curJ: stepData.j ?? 0,
        isComparing,
        callStack: activeStack.map((coord, idx) => ({
          label: `dfs(${coord})`,
          coord,
          depth: idx + 1
        })),
        ...stepData
      });
    };

    // Step 0: 主函数入口帧
    const lineMainEntry = anchorMap.entry || 1;
    const lineMemoInit = anchorMap.memo_init || 3;
    const lineCallDfs = anchorMap.call_dfs || (isMemo ? 4 : 2);

    emitStep({
      type: 'entry',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [],
      line: lineMainEntry,
      tag: `longestPalindromeSubseq("${s}")`,
      log: `| 🎯 主函数入口：求解 longestPalindromeSubseq(s="${s}")，规模 n=${n}`,
      msg: `主函数入口：接收参数 <code>s = "${s}"</code>（长度 <code>${n}</code>），准备求解最长回文子序列长度。`,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    if (isMemo) {
      emitStep({
        type: 'init',
        i: 0,
        j: n - 1,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [],
        visited: [],
        line: lineMemoInit,
        tag: `初始化 memo[${n}][${n}]`,
        log: `| 📦 创建 Integer[${n}][${n}] 备忘录缓存矩阵`,
        msg: `创建 <code>${n}×${n}</code> 的备忘录矩阵 <code>memo</code>，初始化全部为 null。`,
        gridHighlight: { i: 0, j: n - 1 },
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode)
      });
    }

    emitStep({
      type: 'call',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [],
      line: lineCallDfs,
      tag: `调用 dfs(0, ${n - 1})`,
      log: `| 🚀 主函数调用 dfs(s, 0, ${n - 1}${isMemo ? ', memo' : ''})，启动区间推演`,
      msg: `调用辅助递归函数 <code>dfs(s, 0, ${n - 1}${isMemo ? ', memo' : ''})</code>，从全串区间开始深入搜索。`,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    const total = this.runDfs(0, n - 1, rootNode, ctx, emitStep);

    const lineReturn = anchorMap.return || lineMainEntry;
    const finalReturn = this.formatFinalReturn(total, ctx);

    emitStep({
      type: 'return',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [],
      visited: [...ctx.visitedCells],
      line: lineReturn,
      tag: finalReturn.tag,
      log: finalReturn.log,
      msg: finalReturn.msg,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return steps;
  }

  protected runDfs(
    i: number,
    j: number,
    currentNode: UniversalTreeNode,
    ctx: IntervalRecursionContext,
    emitStep: (data: any) => void
  ): number {
    ctx.callCount++;
    const key = `${i},${j}`;
    ctx.activeStack.push(key);
    ctx.visitedCells.add(key);
    currentNode.status = 'current';

    const lineDfsEntry = ctx.anchorMap.dfs_entry || (ctx.isMemo ? 6 : 4);

    // 1. 函数入口帧 (DFS Entry)
    emitStep({
      type: 'entry',
      i,
      j,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineDfsEntry,
      tag: `dfs(${i}, ${j})`,
      log: `| 📥 进入 dfs(i=${i}, j=${j}) [子串="${ctx.s.slice(i, j + 1)}"]`,
      msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，求解子串 <code>s[${i}..${j}] "${ctx.s.slice(i, j + 1)}"</code> 的最长回文子序列长度。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    // 2. 边界检查 (Base Case)
    const baseCheck = this.checkBoundary(i, j, ctx);
    if (baseCheck.isBase) {
      const val = baseCheck.val ?? 0;
      if (i >= 0 && i < ctx.n && j >= 0 && j < ctx.n) {
        ctx.gridState[i][j] = val;
      }
      currentNode.status = 'base';
      currentNode.tag = `= ${val}`;

      const lineBoundary = baseCheck.lineKey
        ? ctx.anchorMap[baseCheck.lineKey]
        : ctx.anchorMap.boundary_cross || 5;

      emitStep({
        type: 'boundary',
        i,
        j,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineBoundary,
        tag: baseCheck.tag || 'Base Case',
        log: baseCheck.log || `| 🎬 满足 Base Case: i=${i}, j=${j}, return ${val}`,
        msg: baseCheck.msg || `🎬 满足边界条件，直接返回 <strong>${val}</strong>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      ctx.activeStack.pop();
      return val;
    }

    // 3. 备忘录缓存命中判定 (Stage 2)
    if (ctx.isMemo && ctx.memoCache[key] !== undefined) {
      currentNode.status = 'pruned';
      currentNode.tag = `⚡=${ctx.memoCache[key]}`;

      const lineCacheHit = ctx.anchorMap.cache_hit || 7;
      emitStep({
        type: 'cache-hit',
        i,
        j,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineCacheHit,
        tag: '⚡ 备忘录命中',
        log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${ctx.memoCache[key]}！直接 O(1) 返回`,
        msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${ctx.memoCache[key]}</strong>，直接返回！`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      ctx.activeStack.pop();
      return ctx.memoCache[key];
    }

    // 4. 端点字符比对 (Condition Evaluation)
    const cond = this.evalCondition(i, j, ctx);
    const lineMatch = cond.lineKey ? (ctx.anchorMap[cond.lineKey] || 10) : (ctx.anchorMap.match || 10);

    // 提前解析所有候选分支，并在网格中以专属多色标示进行分支预告
    const branches = cond.isMatch
      ? this.getMatchBranches(i, j, ctx, cond)
      : this.getMismatchBranches(i, j, ctx, cond);

    const candidateDeps = branches.map((b, bIdx) => {
      const bType = b.branchType || (cond.isMatch ? 'diag' : bIdx === 0 ? 'bottom' : 'left');
      return {
        r: b.nextI,
        c: b.nextJ,
        type: bType,
        label: b.tag
      };
    });

    emitStep({
      type: 'match-eval',
      i,
      j,
      deps: candidateDeps,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineMatch,
      tag: cond.tag,
      log: cond.log,
      msg: cond.msg,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    // 5. 分支调用与执行
    const branchResults: number[] = [];

    for (let bIdx = 0; bIdx < branches.length; bIdx++) {
      const branch = branches[bIdx];
      const lineBranch = ctx.anchorMap[branch.lineKey] || lineMatch;

      const branchType = branch.branchType || (cond.isMatch ? 'diag' : bIdx === 0 ? 'bottom' : 'left');

      // 🌟【核心拦截点】：调用子递归前，高亮调用行并展示依赖连线
      emitStep({
        type: 'branch-call',
        i,
        j,
        targetI: branch.nextI,
        targetJ: branch.nextJ,
        branchIndex: bIdx,
        branchType,
        varName: branch.varName,
        deps: [{
          r: branch.nextI,
          c: branch.nextJ,
          type: branchType,
          label: branch.tag
        }],
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineBranch,
        tag: branch.tag,
        log: branch.log,
        msg: branch.msg,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      const childNode: UniversalTreeNode = {
        id: `node-${++ctx.nodeIdCounter}`,
        r: branch.nextI,
        c: branch.nextJ,
        val: `dfs(${branch.nextI},${branch.nextJ})`,
        status: 'current',
        children: []
      };
      currentNode.children.push(childNode);

      const subRes = this.runDfs(branch.nextI, branch.nextJ, childNode, ctx, emitStep);
      branchResults.push(subRes);

      // 🌟【Call-Return Parity 闭环】：子递归返回后，强制发射回溯赋值帧！
      emitStep({
        type: 'branch-return',
        i,
        j,
        targetI: branch.nextI,
        targetJ: branch.nextJ,
        branchIndex: bIdx,
        varName: branch.varName,
        subResult: subRes,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineBranch,
        tag: branch.varName ? `${branch.varName} = ${subRes}` : `子调用返回 ${subRes}`,
        log: `| ↩️ 子递归返回: ${branch.varName || 'res'} = ${subRes}，继续执行当前栈帧`,
        msg: `子递归返回：赋值 <code>${branch.varName || 'res'} = <strong>${subRes}</strong></code>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });
    }

    // 6. 结果汇总与写表
    const combine = this.combineBranches(branchResults, cond.isMatch, i, j, ctx);
    const res = combine.val;

    ctx.gridState[i][j] = res;
    if (ctx.isMemo) {
      ctx.memoCache[key] = res;
    }

    currentNode.status = 'visited';
    currentNode.tag = `= ${res}`;

    const lineCombine = ctx.anchorMap[combine.lineKey] || lineMatch;

    emitStep({
      type: 'combine',
      i,
      j,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineCombine,
      tag: combine.tag,
      log: combine.log,
      msg: combine.msg,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    ctx.activeStack.pop();
    return res;
  }

  protected abstract extractString(model: IYamlAlgorithmModel): string;
  protected abstract checkBoundary(i: number, j: number, ctx: IntervalRecursionContext): IntervalBoundaryResult;
  protected abstract evalCondition(i: number, j: number, ctx: IntervalRecursionContext): IntervalConditionResult;
  protected abstract getMatchBranches(i: number, j: number, ctx: IntervalRecursionContext, cond: IntervalConditionResult): IntervalBranchSpec[];
  protected abstract getMismatchBranches(i: number, j: number, ctx: IntervalRecursionContext, cond: IntervalConditionResult): IntervalBranchSpec[];
  protected abstract combineBranches(branchResults: number[], isMatch: boolean, i: number, j: number, ctx: IntervalRecursionContext): IntervalCombineResult;
  protected abstract formatFinalReturn(total: number, ctx: IntervalRecursionContext): { tag: string; log: string; msg: string };
}
