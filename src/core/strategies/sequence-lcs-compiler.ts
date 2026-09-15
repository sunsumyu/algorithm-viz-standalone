import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';
import {
  AbstractSequenceTableCompiler,
  type SequenceTableContext,
  type BorderInitConfig,
  type BorderInitCell,
  type ConditionEvalResult,
  type TransferResult,
  type ReturnInfo
} from './abstract-sequence-table-compiler';

/**
 * 最长公共子序列 (LCS, LeetCode 1143) 四阶段全演化步骤编译器
 * 遵循「不同路径 II」黄金基准与《universal-dp-refactoring》标准：
 * - 阶段 1 & 2: 全量双串字符匹配 DFS，维护 activeStack 安全绳连线、memo 剪枝与复合视图元数据
 * - 阶段 3: 严格二维表拓扑递推，对偶支持正序自左上向右下填表与倒序自右下向左上填表
 * - 阶段 4: 一维滚动数组优化，对偶支持正序 leftUp 暂存与倒序 rightDown 暂存
 */

export function compileLcsStage1or2(
  model: IYamlAlgorithmModel,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const s1 = ((model.defaultParams as any)?.s1 || (model.defaultParams as any)?.text1 || 'abcde') as string;
  const s2 = ((model.defaultParams as any)?.s2 || (model.defaultParams as any)?.text2 || 'ace') as string;
  const m = s1.length;
  const n = s2.length;
  const isForward = direction !== 'reverse';

  const generated: UniversalStep[] = [];
  const memoCache: Record<string, number> = {};
  const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
  const activeStack: string[] = [];
  const visitedCells: Set<string> = new Set();
  let nodeIdCounter = 0;

  const lineEntry = anchorMap?.entry || 1;
  const lineBoundary = anchorMap?.boundary || (isMemo ? 6 : 5);
  const lineCacheHit = anchorMap?.cache_hit || 8;
  const lineMatch = anchorMap?.match || (isMemo ? 10 : 7);
  const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 11 : 8);
  const lineDiff = anchorMap?.diff || (isMemo ? 13 : 10);
  const lineCombine = anchorMap?.combine || (isMemo ? 16 : 13);
  const lineReturn = 2;

  let callCount = 0;
  const MAX_RECORDED_CALLS = 120;

  const rootI = isForward ? 0 : m;
  const rootJ = isForward ? 0 : n;

  const rootNode: UniversalTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: rootI,
    c: rootJ,
    val: `dfs(${rootI},${rootJ})`,
    status: 'current',
    children: [],
  };

  const currentMatched1: number[] = [];
  const currentMatched2: number[] = [];

  function emitStep(stepData: any): void {
    const isComparing = stepData.type === 'match' || stepData.type === 'match-branch' || stepData.type === 'diff';
    const curI = isForward ? (stepData.i ?? 0) : Math.max(0, (stepData.i ?? 1) - 1);
    const curJ = isForward ? (stepData.j ?? 0) : Math.max(0, (stepData.j ?? 1) - 1);

    generated.push({
      s: s1,
      t: s2,
      s1,
      s2,
      curI,
      curJ,
      label1: '文本 1 (s1)',
      label2: '文本 2 (s2)',
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
  }

  function dfs(i: number, j: number, currentTreeNode?: UniversalTreeNode): number {
    callCount++;
    const shouldRecord = isMemo || callCount <= MAX_RECORDED_CALLS;
    const key = `${i},${j}`;
    activeStack.push(key);
    visitedCells.add(key);
    if (currentTreeNode) currentTreeNode.status = 'current';

    if (shouldRecord && currentTreeNode) {
      emitStep({
        type: 'entry',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineEntry,
        tag: `dfs(${i}, ${j})`,
        log: isForward
          ? `| 📥 进入 dfs(i=${i}, j=${j}) [顺推考察 s1[${i}..${m - 1}], s2[${j}..${n - 1}]]`
          : `| 📥 进入 dfs(i=${i}, j=${j}) [逆推考察 s1[0..${i - 1}], s2[0..${j - 1}]]`,
        msg: isForward
          ? `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，从起点向后顺推匹配。`
          : `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，从末尾向前逆推寻源。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode.id,
        treeRoot: cloneTree(rootNode),
      });
    }

    // 1. 边界基底判断
    const isBoundary = isForward ? (i === m || j === n) : (i === 0 || j === 0);
    if (isBoundary) {
      gridState[i][j] = 0;
      if (currentTreeNode) {
        currentTreeNode.status = 'base';
        currentTreeNode.tag = '= 0 (空串基底)';
      }
      if (shouldRecord && currentTreeNode) {
        emitStep({
          type: 'boundary',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundary,
          tag: '达到空串基底',
          log: `| 🛑 【边界基底】dfs(${i}, ${j}): 任一字符串长度耗尽，return 0`,
          msg: `达到空串边界：<code>i=${i}, j=${j}</code>，任一前缀为空串时公共子序列长度恒为 <strong>0</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }
      activeStack.pop();
      return 0;
    }

    // 2. 备忘录缓存命中判定 (仅阶段 2)
    if (isMemo && memoCache[key] !== undefined) {
      if (currentTreeNode) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `⚡=${memoCache[key]}`;
      }
      emitStep({
        type: 'cache-hit',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCacheHit,
        tag: `⚡ 备忘录命中: ${memoCache[key]}`,
        log: `| ⚡ 【备忘录剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！O(1) 查表直接返回`,
        msg: `⚡ 备忘录命中！状态 <code>(${i}, ${j})</code> 先前已求解为 <strong>${memoCache[key]}</strong>，直接剪枝返回。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode?.id,
        treeRoot: cloneTree(rootNode),
      });
      activeStack.pop();
      return memoCache[key];
    }

    // 3. 字符比对与分支展开
    const c1 = isForward ? s1[i] : s1[i - 1];
    const c2 = isForward ? s2[j] : s2[j - 1];
    const isMatch = c1 === c2;
    let res = 0;

    const nextMatchI = isForward ? i + 1 : i - 1;
    const nextMatchJ = isForward ? j + 1 : j - 1;
    const nextSkip1I = isForward ? i + 1 : i - 1;
    const nextSkip1J = isForward ? j : j;
    const nextSkip2I = isForward ? i : i;
    const nextSkip2J = isForward ? j + 1 : j - 1;

    if (isMatch) {
      if (shouldRecord && currentTreeNode) {
        emitStep({
          type: 'match',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatch,
          tag: `字符匹配 '${c1}'`,
          log: `| ✨ 字符相同 ('${c1}' == '${c2}')：当前字符对齐，公共子序列 +1，深入对角线`,
          msg: `字符匹配：<code>'${c1}' == '${c2}'</code>，当前字符对齐贡献长度 1，继续探索对角线子问题。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }

      let childMatch: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childMatch = {
          id: `node-${++nodeIdCounter}`,
          r: nextMatchI,
          c: nextMatchJ,
          val: `dfs(${nextMatchI},${nextMatchJ})`,
          status: 'normal',
          children: [],
        };
        currentTreeNode.children.push(childMatch);
      }

      const matchedIdx1 = isForward ? i : i - 1;
      const matchedIdx2 = isForward ? j : j - 1;
      currentMatched1.push(matchedIdx1);
      currentMatched2.push(matchedIdx2);

      res = 1 + dfs(nextMatchI, nextMatchJ, childMatch);

      currentMatched1.pop();
      currentMatched2.pop();

      if (isMemo) memoCache[key] = res;
      gridState[i][j] = res;

      if (currentTreeNode) {
        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;
      }
      if (shouldRecord && currentTreeNode) {
        emitStep({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatchBranch,
          tag: `匹配返回: ${res}`,
          log: `| ↖️ 对角线回溯：dfs(${i}, ${j}) = 1 + dfs(${nextMatchI}, ${nextMatchJ}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `对角线回溯完成：<code>dfs(${i}, ${j}) = 1 + dfs(${nextMatchI}, ${nextMatchJ}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }
    } else {
      if (shouldRecord && currentTreeNode) {
        emitStep({
          type: 'diff',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDiff,
          tag: `字符不匹配 ('${c1}' != '${c2}')`,
          log: `| ⏩ 字符不同 ('${c1}' != '${c2}')：分裂为双向分支尝试跳过`,
          msg: `字符不同：<code>'${c1}' != '${c2}'</code>，分别尝试跳过两串当前字符，取两分支最大值。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }

      let child1: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        child1 = {
          id: `node-${++nodeIdCounter}`,
          r: nextSkip1I,
          c: nextSkip1J,
          val: `dfs(${nextSkip1I},${nextSkip1J})`,
          status: 'normal',
          children: [],
        };
        currentTreeNode.children.push(child1);
      }
      const p1 = dfs(nextSkip1I, nextSkip1J, child1);

      let child2: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        child2 = {
          id: `node-${++nodeIdCounter}`,
          r: nextSkip2I,
          c: nextSkip2J,
          val: `dfs(${nextSkip2I},${nextSkip2J})`,
          status: 'normal',
          children: [],
        };
        currentTreeNode.children.push(child2);
      }
      const p2 = dfs(nextSkip2I, nextSkip2J, child2);

      res = Math.max(p1, p2);
      if (isMemo) memoCache[key] = res;
      gridState[i][j] = res;

      if (currentTreeNode) {
        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;
      }
      if (shouldRecord && currentTreeNode) {
        emitStep({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: `max(${p1}, ${p2}) = ${res}`,
          log: `| 🔄 分支汇聚: dfs(${i}, ${j}) = max(${p1}, ${p2}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `🔄 汇聚两路分支：<code>max(${p1}, ${p2}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }
    }

    activeStack.pop();
    return res;
  }

  const total = dfs(rootI, rootJ, rootNode);

  emitStep({
    type: 'return',
    i: rootI,
    j: rootJ,
    grid: JSON.parse(JSON.stringify(gridState)),
    activeStack: [],
    visited: [...visitedCells],
    line: lineReturn,
    tag: `最终答案: ${total}`,
    log: `| 🏆 LCS 演化计算完成！LCS("${s1}", "${s2}") = ${total}`,
    msg: `🏆 计算完成！<code>text1 = "${s1}"</code> 与 <code>text2 = "${s2}"</code> 的最长公共子序列长度为 <strong>${total}</strong>。`,
    gridHighlight: { i: rootI, j: rootJ },
    activeNodeId: rootNode.id,
    treeRoot: cloneTree(rootNode),
  });

  return generated;
}

class LcsTableCompiler extends AbstractSequenceTableCompiler {
  protected extractString1(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.s1 || (model.defaultParams as any)?.text1 || 'abcde') as string;
  }
  protected extractString2(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.s2 || (model.defaultParams as any)?.text2 || 'ace') as string;
  }
  protected getLabel1(): string {
    return '文本 1 (s1)';
  }
  protected getLabel2(): string {
    return '文本 2 (s2)';
  }
  protected getInitMessage(ctx: SequenceTableContext): string {
    const isForward = ctx.direction !== 'reverse';
    return isForward
      ? `初始化 <code>${ctx.m + 1} × ${ctx.n + 1}</code> 二维状态表格，首行与首列空串基底置为 <strong>0</strong>。`
      : `初始化 <code>${ctx.m + 1} × ${ctx.n + 1}</code> 二维状态表格，末行与末列空串基底置为 <strong>0</strong>。`;
  }
  protected override preInitGrid(dp: (number | null)[][], ctx: SequenceTableContext): void {
    const isForward = ctx.direction !== 'reverse';
    if (isForward) {
      for (let j = 0; j <= ctx.n; j++) dp[0][j] = 0;
      for (let i = 0; i <= ctx.m; i++) dp[i][0] = 0;
    } else {
      for (let j = 0; j <= ctx.n; j++) dp[ctx.m][j] = 0;
      for (let i = 0; i <= ctx.m; i++) dp[i][ctx.n] = 0;
    }
  }
  protected getBorderInitConfig(ctx: SequenceTableContext): BorderInitConfig {
    const isForward = ctx.direction !== 'reverse';
    const cells: BorderInitCell[] = [];
    if (isForward) {
      for (let j = 0; j <= ctx.n; j++) {
        cells.push({
          i: 0,
          j,
          val: 0,
          tag: `Base Case dp[0][${j}]=0`,
          log: `| 🎬 初始化首行: dp[0][${j}] = 0 (s1 为空串)`,
          msg: `初始化首行：<code>dp[0][${j}] = 0</code>。`
        });
      }
      for (let i = 1; i <= ctx.m; i++) {
        cells.push({
          i,
          j: 0,
          val: 0,
          tag: `Base Case dp[${i}][0]=0`,
          log: `| 🎬 初始化首列: dp[${i}][0] = 0 (s2 为空串)`,
          msg: `初始化首列：<code>dp[${i}][0] = 0</code>。`
        });
      }
    } else {
      for (let j = 0; j <= ctx.n; j++) {
        cells.push({
          i: ctx.m,
          j,
          val: 0,
          tag: `Base Case dp[${ctx.m}][${j}]=0`,
          log: `| 🎬 初始化末行: dp[${ctx.m}][${j}] = 0 (s1 为空后缀)`,
          msg: `初始化末行：<code>dp[${ctx.m}][${j}] = 0</code>。`
        });
      }
      for (let i = 0; i < ctx.m; i++) {
        cells.push({
          i,
          j: ctx.n,
          val: 0,
          tag: `Base Case dp[${i}][${ctx.n}]=0`,
          log: `| 🎬 初始化末列: dp[${i}][${ctx.n}] = 0 (s2 为空后缀)`,
          msg: `初始化末列：<code>dp[${i}][${ctx.n}] = 0</code>。`
        });
      }
    }
    return { valAnchorKey: 'init', cells };
  }
  protected evaluateCondition(i: number, j: number, ctx: SequenceTableContext): ConditionEvalResult {
    const isForward = ctx.direction !== 'reverse';
    const c1 = isForward ? ctx.s1[i - 1] : ctx.s1[i];
    const c2 = isForward ? ctx.s2[j - 1] : ctx.s2[j];
    const isMatch = c1 === c2;
    const tag = isMatch ? `字符匹配 '${c1}' == '${c2}'` : `字符不匹配 '${c1}' != '${c2}'`;
    const log = isForward
      ? (isMatch
          ? `| 🔍 [顺推] 比对 s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}')：相同！继承左上并+1`
          : `| 🔍 [顺推] 比对 s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}')：不同！择优取 max(上, 左)`)
      : (isMatch
          ? `| 🔍 [逆推] 比对 s1[${i}]('${c1}') 与 s2[${j}]('${c2}')：相同！继承右下并+1`
          : `| 🔍 [逆推] 比对 s1[${i}]('${c1}') 与 s2[${j}]('${c2}')：不同！择优取 max(下, 右)`);
    const msg = isMatch
      ? `比对条件成立：<code>'${c1}' == '${c2}'</code>，当前两字符相同，最长公共子序列长度可增加 1。`
      : `比对条件不成立：<code>'${c1}' != '${c2}'</code>，两字符不同，需择优继承前驱解的最大值。`;
    return { isMatch, char1: c1, char2: c2, tag, log, msg };
  }
  protected computeTransfer(i: number, j: number, cond: ConditionEvalResult, ctx: SequenceTableContext): TransferResult {
    const isForward = ctx.direction !== 'reverse';
    if (isForward) {
      if (cond.isMatch) {
        const diag = ctx.dp[i - 1][j - 1] ?? 0;
        const val = diag + 1;
        return {
          val,
          lineKey: 'transfer_match',
          topI: i - 1,
          topJ: j,
          leftI: i - 1,
          leftJ: j - 1,
          tag: `匹配转移: 1 + dp[${i - 1}][${j - 1}] = ${val}`,
          log: `| ✨ 字符匹配 '${cond.char1}' == '${cond.char2}'：dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${val}`,
          msg: `✨ 字符匹配成功：对角线转移 <code>1 + dp[${i - 1}][${j - 1}] (${diag}) = <strong>${val}</strong></code>。`
        };
      } else {
        const up = ctx.dp[i - 1][j] ?? 0;
        const left = ctx.dp[i][j - 1] ?? 0;
        const val = Math.max(up, left);
        return {
          val,
          lineKey: 'transfer_diff',
          topI: i - 1,
          topJ: j,
          leftI: i,
          leftJ: j - 1,
          tag: `择优转移: max(上=${up}, 左=${left}) = ${val}`,
          log: `| ➡️ 字符不匹配：dp[${i}][${j}] = max(上=${up}, 左=${left}) = ${val}`,
          msg: `字符不同：择优继承 <code>max(上=${up}, 左=${left}) = <strong>${val}</strong></code>。`
        };
      }
    } else {
      if (cond.isMatch) {
        const diag = ctx.dp[i + 1][j + 1] ?? 0;
        const val = diag + 1;
        return {
          val,
          lineKey: 'transfer_match',
          topI: i + 1,
          topJ: j,
          leftI: i + 1,
          leftJ: j + 1,
          tag: `逆推匹配转移: 1 + dp[${i + 1}][${j + 1}] = ${val}`,
          log: `| ✨ 逆推字符匹配 '${cond.char1}' == '${cond.char2}'：dp[${i}][${j}] = 1 + dp[${i + 1}][${j + 1}] = ${val}`,
          msg: `✨ 字符匹配成功：右下对角线转移 <code>1 + dp[${i + 1}][${j + 1}] (${diag}) = <strong>${val}</strong></code>。`
        };
      } else {
        const down = ctx.dp[i + 1][j] ?? 0;
        const right = ctx.dp[i][j + 1] ?? 0;
        const val = Math.max(down, right);
        return {
          val,
          lineKey: 'transfer_diff',
          topI: i + 1,
          topJ: j,
          leftI: i,
          leftJ: j + 1,
          tag: `逆推择优转移: max(下=${down}, 右=${right}) = ${val}`,
          log: `| ➡️ 逆推字符不匹配：dp[${i}][${j}] = max(下=${down}, 右=${right}) = ${val}`,
          msg: `字符不同：择优继承 <code>max(下=${down}, 右=${right}) = <strong>${val}</strong></code>。`
        };
      }
    }
  }
  protected getReturnInfo(ctx: SequenceTableContext): ReturnInfo {
    const isForward = ctx.direction !== 'reverse';
    const targetI = isForward ? ctx.m : 0;
    const targetJ = isForward ? ctx.n : 0;
    const ans = ctx.dp[targetI][targetJ] ?? 0;
    return {
      i: targetI,
      j: targetJ,
      val: ans,
      tag: isForward ? `最终解: ${ans}` : `逆推最终解: ${ans}`,
      log: isForward
        ? `| 🏆 二维 DP 递推完成！dp[${ctx.m}][${ctx.n}] = ${ans}`
        : `| 🏆 逆推二维 DP 递推完成！dp[0][0] = ${ans}`,
      msg: isForward
        ? `🏆 状态转移全部完成！全局最长公共子序列长度为 <strong>${ans}</strong>。`
        : `🏆 逆推递推全部完成！全局最长公共子序列长度为 <strong>${ans}</strong>。`
    };
  }
}

export function compileLcsStage3(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const compiler = new LcsTableCompiler();
  return compiler.compile(model, anchorMap || {}, direction);
}

export function compileLcsStage4(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const s1 = ((model.defaultParams as any)?.s1 || (model.defaultParams as any)?.text1 || 'abcde') as string;
  const s2 = ((model.defaultParams as any)?.s2 || (model.defaultParams as any)?.text2 || 'ace') as string;
  const m = s1.length;
  const n = s2.length;

  const steps: UniversalStep[] = [];
  const dp1d: number[] = new Array(n + 1).fill(0);

  const lineInit = anchorMap?.init || 3;
  const linePreInit = anchorMap?.pre_init || 6;
  const lineTransferMatch = anchorMap?.transfer_match || 10;
  const lineTransferDiff = anchorMap?.transfer_diff || 12;
  const lineReturn = anchorMap?.return || 16;

  function emitStep(stepData: any): void {
    const isComparing = stepData.type === 'update';
    steps.push({
      s: s1,
      t: s2,
      s1,
      s2,
      curI: Math.max(0, Math.min(m - 1, stepData.i ?? 0)),
      curJ: Math.max(0, Math.min(n - 1, stepData.j ?? 0)),
      label1: '文本 1 (s1)',
      label2: '文本 2 (s2)',
      isComparing,
      dp1d: Array.from(dp1d),
      ...stepData
    });
  }

  if (direction === 'reverse') {
    emitStep({
      type: 'init',
      i: m,
      j: n,
      grid: [Array.from(dp1d)],
      line: lineInit,
      tag: `创建逆推一维滚动数组 dp[0..${n}]`,
      log: `| ⚡ 逆推空间压缩：仅维护一维数组 dp[${n + 1}] 全部置为 0，目标汇聚在 dp[0]`,
      msg: `创建大小为 <code>${n + 1}</code> 的一维滚动向量，空间复杂度极限压缩至 <strong>O(N)</strong>。`,
      gridHighlight: { i: 0, j: n },
    });

    for (let i = m - 1; i >= 0; i--) {
      let rightDown = 0;
      const c1 = s1[i];

      emitStep({
        type: 'row-start',
        i,
        j: n,
        grid: [Array.from(dp1d)],
        line: linePreInit,
        tag: `第 ${i} 行逆推开始 (rightDown=0)`,
        log: `| 🔁 进入第 ${i} 行逆推滚动 (字符 '${c1}')，重置 rightDown = 0`,
        msg: `开始倒序计算第 <code>${i}</code> 行（字符 <code>'${c1}'</code>），暂存右下角 <code>rightDown = 0</code>。`,
        gridHighlight: { i: 0, j: n },
      });

      for (let j = n - 1; j >= 0; j--) {
        const c2 = s2[j];
        const isMatch = c1 === c2;
        const backup = dp1d[j]; // 备份下方旧值

        if (isMatch) {
          dp1d[j] = rightDown + 1;
          emitStep({
            type: 'update',
            i,
            j,
            grid: [Array.from(dp1d)],
            line: lineTransferMatch,
            tag: `匹配: dp[${j}] = rightDown+1 = ${dp1d[j]}`,
            log: `| ✨ 逆推字符匹配 '${c1}' == '${c2}'：dp[${j}] = rightDown + 1 = ${dp1d[j]}`,
            msg: `✨ 字符匹配成功：利用暂存的 <code>rightDown (${rightDown}) + 1 = <strong>${dp1d[j]}</strong></code> 更新。`,
            gridHighlight: { i: 0, j },
          });
        } else {
          dp1d[j] = Math.max(backup, dp1d[j + 1]);
          emitStep({
            type: 'update',
            i,
            j,
            grid: [Array.from(dp1d)],
            line: lineTransferDiff,
            tag: `择优: max(旧值, 右方) = ${dp1d[j]}`,
            log: `| ➡️ 逆推字符不匹配：dp[${j}] = max(下方旧值=${backup}, 右方新值=${dp1d[j + 1]}) = ${dp1d[j]}`,
            msg: `字符不同：择优继承 <code>max(下方旧值=${backup}, 右方新值=${dp1d[j + 1]}) = <strong>${dp1d[j]}</strong></code>。`,
            gridHighlight: { i: 0, j },
          });
        }

        rightDown = backup; // 寄存器推移
      }
    }

    emitStep({
      type: 'return',
      i: 0,
      j: 0,
      grid: [Array.from(dp1d)],
      line: lineReturn,
      tag: `逆推空间压缩最终解: ${dp1d[0]}`,
      log: `| 🏆 逆推空间压缩计算完成！最终 LCS = dp[0] = ${dp1d[0]}`,
      msg: `🏆 一维滚动逆推完成！最终最长公共子序列长度汇聚于 <strong>dp[0] = ${dp1d[0]}</strong>。`,
      gridHighlight: { i: 0, j: 0 },
    });

    return steps;
  }

  emitStep({
    type: 'init',
    i: 0,
    j: 0,
    grid: [Array.from(dp1d)],
    line: lineInit,
    tag: `创建一维滚动数组 dp[0..${n}]`,
    log: `| ⚡ 空间压缩：仅维护一维数组 dp[${n + 1}] 全部置为 0`,
    msg: `创建大小为 <code>${n + 1}</code> 的一维滚动向量，空间复杂度极限压缩至 <strong>O(N)</strong>。`,
    gridHighlight: { i: 0, j: 0 },
  });

  for (let i = 1; i <= m; i++) {
    let leftUp = 0;
    const c1 = s1[i - 1];

    emitStep({
      type: 'row-start',
      i,
      j: 0,
      grid: [Array.from(dp1d)],
      line: linePreInit,
      tag: `第 ${i} 行开始 (leftUp=0)`,
      log: `| 🔁 进入第 ${i} 行滚动 (字符 '${c1}')，重置 leftUp = 0`,
      msg: `开始计算第 <code>${i}</code> 行（字符 <code>'${c1}'</code>），暂存左上角 <code>leftUp = 0</code>。`,
      gridHighlight: { i: 0, j: 0 },
    });

    for (let j = 1; j <= n; j++) {
      const c2 = s2[j - 1];
      const isMatch = c1 === c2;
      const backup = dp1d[j]; // 备份上方旧值

      if (isMatch) {
        dp1d[j] = leftUp + 1;
        emitStep({
          type: 'update',
          i,
          j,
          grid: [Array.from(dp1d)],
          line: lineTransferMatch,
          tag: `匹配: dp[${j}] = leftUp+1 = ${dp1d[j]}`,
          log: `| ✨ 字符匹配 '${c1}' == '${c2}'：dp[${j}] = leftUp + 1 = ${leftUp} + 1 = ${dp1d[j]}`,
          msg: `✨ 字符匹配成功：利用暂存的 <code>leftUp (${leftUp}) + 1 = <strong>${dp1d[j]}</strong></code> 更新。`,
          gridHighlight: { i: 0, j },
        });
      } else {
        dp1d[j] = Math.max(dp1d[j], dp1d[j - 1]);
        emitStep({
          type: 'update',
          i,
          j,
          grid: [Array.from(dp1d)],
          line: lineTransferDiff,
          tag: `择优: max(旧值, 左方) = ${dp1d[j]}`,
          log: `| ➡️ 字符不匹配：dp[${j}] = max(旧上方=${backup}, 当前左方=${dp1d[j - 1]}) = ${dp1d[j]}`,
          msg: `字符不同：择优继承 <code>max(旧上方=${backup}, 当前左方=${dp1d[j - 1]}) = <strong>${dp1d[j]}</strong></code>。`,
          gridHighlight: { i: 0, j },
        });
      }

      leftUp = backup; // 寄存器推移
    }
  }

  emitStep({
    type: 'return',
    i: m,
    j: n,
    grid: [Array.from(dp1d)],
    line: lineReturn,
    tag: `空间压缩最终解: ${dp1d[n]}`,
    log: `| 🏆 空间压缩计算完成！最终 LCS = dp[${n}] = ${dp1d[n]}`,
    msg: `🏆 一维滚动递推完成！最终最长公共子序列长度为 <strong>${dp1d[n]}</strong>。`,
    gridHighlight: { i: 0, j: n },
  });

  return steps;
}
