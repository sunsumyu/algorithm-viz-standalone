import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';

export interface SequenceRecursionContext {
  model: IYamlAlgorithmModel;
  s1: string;
  s2: string;
  m: number;
  n: number;
  isForward: boolean;
  direction: 'forward' | 'reverse';
  isMemo: boolean;
  anchorMap: Record<string, number>;
  gridState: (number | null)[][];
  activeStack: string[];
  visitedCells: Set<string>;
  currentMatched1: number[];
  currentMatched2: number[];
  memoCache: Record<string, number>;
  rootNode: UniversalTreeNode;
  nodeIdCounter: { value: number };
  callCount: { value: number };
}

export interface BoundaryCheckResult {
  isBase: boolean;
  val?: number;
  lineKey?: string;
  tag?: string;
  log?: string;
  msg?: string;
}

export interface ConditionEvalResult {
  isMatch: boolean;
  char1: string;
  char2: string;
  lineKey?: string;
  tag?: string;
  log?: string;
  msg?: string;
}

export interface RecursionBranchSpec {
  nextI: number;
  nextJ: number;
  lineKey: string;
  varName?: string;
  tag: string;
  log: string;
  msg: string;
  recordMatchIndices?: boolean;
}

export interface CombineResult {
  val: number;
  lineKey: string;
  tag: string;
  log: string;
  msg: string;
}

/**
 * AbstractSequenceRecursionCompiler — 序列 DP 递归与记忆化顶层抽象编译器
 *
 * 核心设计：Template Method 模式。
 * 针对历史开发中频发的“判断完 if 之后未进入 if 块体直接跳进子函数”、“漏发分支赋值语句帧”等跳步问题，
 * 由本顶层基类独占 DFS 调度与控制流，严格保障“一行一步、零跳步”的物理不变量：
 *   1. entry: 递归入口帧（函数签名行，压入调用栈）
 *   2. boundary: 基底特判与返回
 *   3. cache-hit: 备忘录命中剪枝（Stage 2）
 *   4. cond / match: 字符关系比对与条件求值
 *   5. branch-call: 【核心拦截点】进入具体分支（如 useMatch / skipChar）前强制发射代码行高亮帧
 *   6. combine / return: 结果汇总、写入备忘录、回溯出栈
 */
export abstract class AbstractSequenceRecursionCompiler {
  public compile(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap: Record<string, number> = {},
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    const s1 = this.extractString1(model);
    const s2 = this.extractString2(model);
    const m = s1.length;
    const n = s2.length;
    const isForward = direction !== 'reverse';

    const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () =>
      new Array(n + 1).fill(null)
    );
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    const memoCache: Record<string, number> = {};
    const currentMatched1: number[] = [];
    const currentMatched2: number[] = [];

    const rootI = isForward ? 0 : m;
    const rootJ = isForward ? 0 : n;
    const nodeIdCounter = { value: 1 };
    const callCount = { value: 0 };

    const rootNode: UniversalTreeNode = {
      id: `node-${nodeIdCounter.value}`,
      r: rootI,
      c: rootJ,
      val: `dfs(${rootI},${rootJ})`,
      status: 'current',
      children: []
    };

    const ctx: SequenceRecursionContext = {
      model,
      s1,
      s2,
      m,
      n,
      isForward,
      direction,
      isMemo,
      anchorMap,
      gridState,
      activeStack,
      visitedCells,
      currentMatched1,
      currentMatched2,
      memoCache,
      rootNode,
      nodeIdCounter,
      callCount
    };

    const steps: UniversalStep[] = [];
    const labels = this.getLabels(model);

    const emitStep = (stepData: any) => {
      const isComparing =
        stepData.type === 'match-eval' ||
        stepData.type === 'branch-call' ||
        stepData.type === 'match-branch' ||
        stepData.type === 'skip-branch';

      const curI = isForward ? stepData.i : Math.max(0, stepData.i - 1);
      const curJ = isForward ? stepData.j : Math.max(0, stepData.j - 1);

      steps.push({
        s: s1,
        t: s2,
        s1,
        s2,
        curI,
        curJ,
        label1: labels.label1,
        label2: labels.label2,
        matchedIndices1: stepData.matchedIndices1 ?? [...currentMatched1],
        matchedIndices2: stepData.matchedIndices2 ?? [...currentMatched2],
        isComparing,
        callStack: activeStack.map((coord, idx) => ({
          label: `dfs(${coord})`,
          coord,
          depth: idx + 1
        })),
        ...stepData
      });
    };

    const total = this.runDfs(rootI, rootJ, rootNode, ctx, emitStep);

    const lineReturn = ctx.anchorMap?.return || 4;
    const finalReturn = this.formatFinalReturn(total, ctx);

    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      i: rootI,
      j: rootJ,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [],
      visited: [...ctx.visitedCells],
      line: lineReturn,
      tag: finalReturn.tag,
      log: finalReturn.log,
      msg: finalReturn.msg,
      gridHighlight: { i: rootI, j: rootJ },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return steps;
  }

  protected formatFinalReturn(
    total: number,
    ctx: SequenceRecursionContext
  ): { tag: string; log: string; msg: string } {
    return {
      tag: '最终答案',
      log: `| 🏆 演化计算完成！结果 = ${total}`,
      msg: `🏆 演化计算完成！最终方案数为 <strong>${total}</strong>。`
    };
  }

  protected runDfs(
    i: number,
    j: number,
    currentNode: UniversalTreeNode,
    ctx: SequenceRecursionContext,
    emitStep: (data: any) => void
  ): number {
    ctx.callCount.value++;
    const key = `${i},${j}`;
    const isRepeated = !ctx.isMemo && ctx.memoCache[key] !== undefined;

    ctx.activeStack.push(key);
    ctx.visitedCells.add(key);

    currentNode.status = 'current';
    if (isRepeated) {
      currentNode.tag = '⚠️重复';
    }

    const lineEntry = ctx.anchorMap?.entry || 5;

    // 1. 发射入口帧
    emitStep({
      type: 'dfs-call',
      flowPhase: 'forward',
      i,
      j,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineEntry,
      tag: `DFS #${ctx.callCount.value} (i=${i}, j=${j})`,
      log: ctx.isForward
        ? `| 📥 进入 dfs(i=${i}, j=${j}) [正序匹配 s[${i}..${ctx.m - 1}], t[${j}..${ctx.n - 1}]]`
        : `| 📥 进入 dfs(i=${i}, j=${j}) [逆向寻源 s[0..${i - 1}], t[0..${j - 1}]]`,
      msg: ctx.isForward
        ? `📥 [顺推探索] 进入 <code>dfs(i=${i}, j=${j})</code>：从起点 <code>(${i}, ${j})</code> 开始向后顺推匹配。`
        : `📥 [逆推寻源] 进入 <code>dfs(i=${i}, j=${j})</code>：从终点 <code>(${i}, ${j})</code> 逆向寻源匹配前缀。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    // 2. 基底判定 (Boundary Check)
    const boundary = this.checkBoundary(i, j, ctx);
    if (boundary.isBase && boundary.val !== undefined) {
      ctx.gridState[i][j] = boundary.val;
      currentNode.status = 'base';
      currentNode.tag = `= ${boundary.val}`;

      const lineBoundary = boundary.lineKey ? (ctx.anchorMap?.[boundary.lineKey] || lineEntry) : lineEntry;

      emitStep({
        type: 'boundary',
        flowPhase: 'backtrack',
        i,
        j,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineBoundary,
        tag: boundary.tag || 'Base Case',
        log: boundary.log || `| 🎬 满足 Base Case，返回 ${boundary.val}`,
        msg: boundary.msg || `🎬 满足基底条件，返回 <strong>${boundary.val}</strong>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      ctx.activeStack.pop();
      return boundary.val;
    }

    // 3. 备忘录命中判定 (Memoization Cache Check)
    if (ctx.isMemo && ctx.memoCache[key] !== undefined) {
      const cachedVal = ctx.memoCache[key];
      currentNode.status = 'pruned';
      currentNode.tag = `⚡=${cachedVal}`;

      const lineCacheHit = ctx.anchorMap?.cache_hit || 13;

      emitStep({
        type: 'cache-hit',
        flowPhase: 'backtrack',
        i,
        j,
        grid: JSON.parse(JSON.stringify(ctx.gridState)),
        activeStack: [...ctx.activeStack],
        visited: [...ctx.visitedCells],
        line: lineCacheHit,
        tag: '⚡ 备忘录命中',
        log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${cachedVal}！直接 O(1) 返回`,
        msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${cachedVal}</strong>，直接返回！`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(ctx.rootNode)
      });

      ctx.activeStack.pop();
      return cachedVal;
    }

    // 4. 条件判定帧 (Condition Evaluation, e.g. if (s[i] == t[j]))
    const cond = this.evalCondition(i, j, ctx);
    const lineMatch = cond.lineKey ? (ctx.anchorMap?.[cond.lineKey] || 10) : (ctx.anchorMap?.match || 10);

    // 提前解析所有候选分支，并在网格中以专属多色标示进行分支预告
    const branches = cond.isMatch
      ? this.getMatchBranches(i, j, ctx, cond)
      : this.getMismatchBranches(i, j, ctx, cond);

    const candidateDeps = branches.map((b) => {
      const isDiag = b.nextI !== i && b.nextJ !== j;
      const isVertical = b.nextI !== i && b.nextJ === j;
      const bType: 'diag' | 'top' | 'left' = isDiag ? 'diag' : isVertical ? 'top' : 'left';
      return {
        r: b.nextI,
        c: b.nextJ,
        type: bType,
        label: b.tag
      };
    });

    emitStep({
      type: 'match-eval',
      flowPhase: 'forward',
      i,
      j,
      deps: candidateDeps,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineMatch,
      tag: cond.tag || (cond.isMatch ? `字符匹配 '${cond.char1}'` : `字符不匹配 '${cond.char1}'!='${cond.char2}'`),
      log: cond.log || `| 🔀 字符比对: '${cond.char1}' 与 '${cond.char2}' -> ${cond.isMatch ? '匹配相同' : '不相同'}`,
      msg: cond.msg || `比对当前字符：<code>'${cond.char1}'</code> 与 <code>'${cond.char2}'</code> -> <strong>${cond.isMatch ? '匹配相同' : '不相同'}</strong>。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    // 5. 分支调度与执行 (Branch Dispatch)
    const branchResults: number[] = [];

    for (let bIdx = 0; bIdx < branches.length; bIdx++) {
      const branch = branches[bIdx];
      const lineBranch = ctx.anchorMap?.[branch.lineKey] || lineMatch;

      const isDiag = branch.nextI !== i && branch.nextJ !== j;
      const isVertical = branch.nextI !== i && branch.nextJ === j;
      const branchType: 'diag' | 'top' | 'left' = isDiag ? 'diag' : isVertical ? 'top' : 'left';

      // 🌟【强制拦截点】：在进入子递归前，必须先发射高亮本分支调用行（如 int useMatch = dfs(...)）的步进帧！
      emitStep({
        type: 'branch-call',
        flowPhase: 'forward',
        i,
        j,
        targetI: branch.nextI,
        targetJ: branch.nextJ,
        branchIndex: bIdx,
        branchType,
        varName: branch.varName,
        diagI: branchType === 'diag' ? branch.nextI : undefined,
        diagJ: branchType === 'diag' ? branch.nextJ : undefined,
        topI: branchType === 'top' ? branch.nextI : undefined,
        topJ: branchType === 'top' ? branch.nextJ : undefined,
        leftI: branchType === 'left' ? branch.nextI : undefined,
        leftJ: branchType === 'left' ? branch.nextJ : undefined,
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

      // 若需要字符匹配留痕
      if (branch.recordMatchIndices) {
        const matchedIdx1 = ctx.isForward ? i : i - 1;
        const matchedIdx2 = ctx.isForward ? j : j - 1;
        ctx.currentMatched1.push(matchedIdx1);
        ctx.currentMatched2.push(matchedIdx2);
      }

      // 创建子树节点并深入调用
      const childNode: UniversalTreeNode = {
        id: `node-${++ctx.nodeIdCounter.value}`,
        r: branch.nextI,
        c: branch.nextJ,
        val: `dfs(${branch.nextI},${branch.nextJ})`,
        status: 'normal',
        children: []
      };
      currentNode.children.push(childNode);

      const val = this.runDfs(branch.nextI, branch.nextJ, childNode, ctx, emitStep);
      branchResults.push(val);

      // 回溯：弹出留痕
      if (branch.recordMatchIndices) {
        ctx.currentMatched1.pop();
        ctx.currentMatched2.pop();
      }

      // 🌟【强制闭环点】：子递归返回后，发射回溯赋值帧，焦点重新回到调用者代码行并完成变量赋值！
      if (branch.varName || branches.length > 1) {
        emitStep({
          type: 'branch-return',
          flowPhase: 'backtrack',
          i,
          j,
          grid: JSON.parse(JSON.stringify(ctx.gridState)),
          activeStack: [...ctx.activeStack],
          visited: [...ctx.visitedCells],
          line: lineBranch,
          tag: branch.varName ? `${branch.varName} = ${val}` : `分支返回: ${val}`,
          log: `| ↩️ 子分支 dfs(${branch.nextI}, ${branch.nextJ}) 计算完毕返回 ${val}${branch.varName ? `，已赋值给 ${branch.varName}` : ''}`,
          msg: `↩️ 子分支计算完毕返回 <strong>${val}</strong>${branch.varName ? `，已赋值给局部变量 <code>${branch.varName}</code>` : ''}。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(ctx.rootNode)
        });
      }
    }

    // 6. 结果汇总与写回 (Combine & Return)
    const combined = this.combineBranches(branchResults, cond.isMatch, i, j, ctx);
    const res = combined.val;

    if (ctx.isMemo) {
      ctx.memoCache[key] = res;
    }
    ctx.gridState[i][j] = res;

    currentNode.status = 'visited';
    currentNode.tag = `= ${res}`;

    const lineCombine = ctx.anchorMap?.[combined.lineKey] || lineEntry;

    emitStep({
      type: 'combine',
      flowPhase: 'backtrack',
      i,
      j,
      grid: JSON.parse(JSON.stringify(ctx.gridState)),
      activeStack: [...ctx.activeStack],
      visited: [...ctx.visitedCells],
      line: lineCombine,
      tag: combined.tag,
      log: combined.log,
      msg: combined.msg,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(ctx.rootNode)
    });

    ctx.activeStack.pop();
    return res;
  }

  // 子类必须或可选实现的 Hooks
  protected extractString1(model: IYamlAlgorithmModel): string {
    const p = model.defaultParams as any;
    return (p?.s || p?.s1 || p?.text1 || p?.word1 || 'rabbbit') as string;
  }

  protected extractString2(model: IYamlAlgorithmModel): string {
    const p = model.defaultParams as any;
    return (p?.t || p?.s2 || p?.text2 || p?.word2 || 'rabbit') as string;
  }

  protected getLabels(model: IYamlAlgorithmModel): { label1: string; label2: string } {
    return { label1: '母串 S', label2: '目标 T' };
  }

  protected abstract checkBoundary(
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): BoundaryCheckResult;

  protected abstract evalCondition(
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): ConditionEvalResult;

  protected abstract getMatchBranches(
    i: number,
    j: number,
    ctx: SequenceRecursionContext,
    cond: ConditionEvalResult
  ): RecursionBranchSpec[];

  protected abstract getMismatchBranches(
    i: number,
    j: number,
    ctx: SequenceRecursionContext,
    cond: ConditionEvalResult
  ): RecursionBranchSpec[];

  protected abstract combineBranches(
    branchResults: number[],
    isMatch: boolean,
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): CombineResult;
}
