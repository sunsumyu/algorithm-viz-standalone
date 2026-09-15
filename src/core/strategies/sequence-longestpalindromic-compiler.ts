import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import {
  AbstractIntervalRecursionCompiler,
  type IntervalRecursionContext,
  type IntervalBoundaryResult,
  type IntervalConditionResult,
  type IntervalBranchSpec,
  type IntervalCombineResult
} from './abstract-interval-recursion-compiler';
import {
  AbstractIntervalTableCompiler,
  type IntervalTableContext,
  type IntervalConditionEvalResult,
  type IntervalTransferResult,
  type IntervalReturnInfo
} from './abstract-interval-table-compiler';

class LongestPalindromicRecursionCompiler extends AbstractIntervalRecursionCompiler {
  protected extractString(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.s || 'bbbab') as string;
  }

  protected checkBoundary(
    i: number,
    j: number,
    ctx: IntervalRecursionContext
  ): IntervalBoundaryResult {
    if (i > j) {
      return {
        isBase: true,
        val: 0,
        lineKey: 'boundary_cross',
        tag: 'Base Case i > j (空区间)',
        log: `| 🎬 满足 Base Case: i > j (i=${i}, j=${j}) 为空区间，返回 0`,
        msg: `🎬 满足 <code>i > j</code>：区间交叉为空，返回 <strong>0</strong>。`
      };
    }
    if (i === j) {
      return {
        isBase: true,
        val: 1,
        lineKey: 'boundary_single',
        tag: `Base Case i=j (单字符 '${ctx.s[i]}')`,
        log: `| 🎬 满足 Base Case: i == j == ${i}，单字符 '${ctx.s[i]}' 自身为回文，返回 1`,
        msg: `🎬 满足 <code>i == j == ${i}</code>：单字符 <code>'${ctx.s[i]}'</code> 本身构成长度为 1 的回文，返回 <strong>1</strong>。`
      };
    }
    return { isBase: false };
  }

  protected evalCondition(
    i: number,
    j: number,
    ctx: IntervalRecursionContext
  ): IntervalConditionResult {
    const charI = ctx.s[i];
    const charJ = ctx.s[j];
    const isMatch = charI === charJ;

    return {
      isMatch,
      charI,
      charJ,
      lineKey: 'match',
      tag: isMatch ? `两端相同 '${charI}'` : `端点不同 '${charI}'!='${charJ}'`,
      log: isMatch
        ? `| 🔀 两端字符相同 s[${i}] == s[${j}] ('${charI}')，贡献长度 +2，深入 dfs(${i + 1}, ${j - 1})`
        : `| 🔀 端点不同 s[${i}]('${charI}') != s[${j}]('${charJ}')，分裂为双向分支`,
      msg: isMatch
        ? `🔀 两端字符相同 <code>s[${i}] == s[${j}] == '${charI}'</code>，贡献回文长度 2，进入 <code>dfs(${i + 1}, ${j - 1})</code>。`
        : `比对端点：<code>s[${i}] ('${charI}') != s[${j}] ('${charJ}')</code>，两字符不同，分别尝试舍弃左端或右端字符。`
    };
  }

  protected getMatchBranches(
    i: number,
    j: number,
    ctx: IntervalRecursionContext,
    cond: IntervalConditionResult
  ): IntervalBranchSpec[] {
    return [
      {
        nextI: i + 1,
        nextJ: j - 1,
        lineKey: 'match_branch',
        varName: 'pMatch',
        branchType: 'diag',
        tag: `两端相同深入 dfs(${i + 1}, ${j - 1})`,
        log: `| 🎯 两端字符相同，深入子问题 dfs(${i + 1}, ${j - 1})`,
        msg: `🎯 两端相同，深入子区间 <code>dfs(${i + 1}, ${j - 1})</code>。`
      }
    ];
  }

  protected getMismatchBranches(
    i: number,
    j: number,
    ctx: IntervalRecursionContext,
    cond: IntervalConditionResult
  ): IntervalBranchSpec[] {
    return [
      {
        nextI: i + 1,
        nextJ: j,
        lineKey: 'branch_left',
        varName: 'skipLeft',
        branchType: 'bottom',
        tag: `舍弃左端 s[${i}]('${cond.charI}')`,
        log: `| ➡️ 分支 1: 舍弃左端字符，深入 dfs(${i + 1}, ${j})`,
        msg: `➡️ 分支 1：尝试舍弃左端字符 <code>s[${i}] ('${cond.charI}')</code>，计算 <code>skipLeft = dfs(${i + 1}, ${j})</code>。`
      },
      {
        nextI: i,
        nextJ: j - 1,
        lineKey: 'branch_right',
        varName: 'skipRight',
        branchType: 'left',
        tag: `舍弃右端 s[${j}]('${cond.charJ}')`,
        log: `| ➡️ 分支 2: 舍弃右端字符，深入 dfs(${i}, ${j - 1})`,
        msg: `➡️ 分支 2：尝试舍弃右端字符 <code>s[${j}] ('${cond.charJ}')</code>，计算 <code>skipRight = dfs(${i}, ${j - 1})</code>。`
      }
    ];
  }

  protected combineBranches(
    branchResults: number[],
    isMatch: boolean,
    i: number,
    j: number,
    ctx: IntervalRecursionContext
  ): IntervalCombineResult {
    if (isMatch) {
      const subRes = branchResults[0] ?? 0;
      const res = subRes + 2;
      return {
        val: res,
        lineKey: 'match_branch',
        tag: `dfs(${i + 1},${j - 1}) + 2 = ${res}`,
        log: `| ✨ 端点匹配更新: dfs(${i}, ${j}) = dfs(${i + 1}, ${j - 1}) + 2 = ${res}${ctx.isMemo ? ' [存入备忘录]' : ''}`,
        msg: `✨ 端点匹配结果：<code>dfs(${i}, ${j}) = dfs(${i + 1}, ${j - 1}) + 2 = <strong>${res}</strong></code>。`
      };
    } else {
      const valLeft = branchResults[0] ?? 0;
      const valRight = branchResults[1] ?? 0;
      const res = Math.max(valLeft, valRight);
      return {
        val: res,
        lineKey: 'combine',
        tag: `max(${valLeft}, ${valRight}) = ${res}`,
        log: `| ✨ 合并分支: dfs(${i}, ${j}) = max(舍左=${valLeft}, 舍右=${valRight}) = ${res}${ctx.isMemo ? ' [存入备忘录]' : ''}`,
        msg: `✨ 汇总分支决策：<code>max(舍左=${valLeft}, 舍右=${valRight}) = <strong>${res}</strong></code>。`
      };
    }
  }

  protected formatFinalReturn(
    total: number,
    ctx: IntervalRecursionContext
  ): { tag: string; log: string; msg: string } {
    return {
      tag: '最终答案',
      log: `| 🏆 最长回文子序列演化完成！longestPalindromeSubseq("${ctx.s}") = ${total}`,
      msg: `🏆 演化计算完成！字符串 <code>"${ctx.s}"</code> 的最长回文子序列长度为 <strong>${total}</strong>。`
    };
  }
}

const lpsRecursionCompiler = new LongestPalindromicRecursionCompiler();

export function compileLongestPalindromicStage1or2(
  model: IYamlAlgorithmModel,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const normalizedAnchorMap: Record<string, number> = { ...(anchorMap || {}) };
  if (!normalizedAnchorMap.branch_left && normalizedAnchorMap.diff) {
    normalizedAnchorMap.branch_left = normalizedAnchorMap.diff;
  }
  return lpsRecursionCompiler.compile(model, isMemo, normalizedAnchorMap);
}

class LongestPalindromicTableCompiler extends AbstractIntervalTableCompiler {
  protected extractString(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.s || 'bbbab') as string;
  }
  protected getInitMessage(ctx: IntervalTableContext): string {
    return `创建 <code>${ctx.n}×${ctx.n}</code> 的二维 DP 表格，<code>dp[i][j]</code> 表示子串 <code>s[i..j]</code> 的最长回文子序列长度。`;
  }
  protected getInnerLoopStartOffset(): number {
    return 1; // j 从 i+1 开始
  }
  protected override performDiagInit(ctx: IntervalTableContext, emitStep: (stepData: any) => void): void {
    const lineInitDiag = ctx.anchorMap.init_diag || 6;
    for (let i = 0; i < ctx.n; i++) {
      ctx.dp[i][i] = 1;
      emitStep({
        type: 'init-diag',
        line: lineInitDiag,
        i,
        j: i,
        val: 1,
        grid: JSON.parse(JSON.stringify(ctx.dp)),
        tag: `对角线初始化: dp[${i}][${i}] = 1`,
        log: `| 🎬 对角线单字符初始化: dp[${i}][${i}] = 1 ('${ctx.s[i]}')`,
        msg: `对角线初始化：单字符 <code>'${ctx.s[i]}'</code> 回文长度必然为 <code>dp[${i}][${i}] = 1</code>。`,
        gridHighlight: { i, j: i }
      });
    }
  }
  protected evaluateCondition(i: number, j: number, ctx: IntervalTableContext): IntervalConditionEvalResult {
    const c1 = ctx.s[i];
    const c2 = ctx.s[j];
    const isMatch = c1 === c2;
    const tag = isMatch ? `端点相同 '${c1}' == '${c2}'` : `端点不同 '${c1}' != '${c2}'`;
    const log = isMatch
      ? `| 🔍 比对端点 s[${i}]('${c1}') 与 s[${j}]('${c2}')：相同！`
      : `| 🔍 比对端点 s[${i}]('${c1}') 与 s[${j}]('${c2}')：不同！`;
    const msg = isMatch
      ? `端点字符相同：<code>s[${i}] == s[${j}] == '${c1}'</code>，可向内层继承并加 2。`
      : `端点字符不同：<code>s[${i}] ('${c1}') != s[${j}] ('${c2}')</code>，择优舍弃左端或右端字符。`;
    return { isMatch, charI: c1, charJ: c2, tag, log, msg };
  }
  protected computeTransfer(i: number, j: number, cond: IntervalConditionEvalResult, ctx: IntervalTableContext): IntervalTransferResult {
    if (cond.isMatch) {
      const fromDiag = ctx.dp[i + 1][j - 1] ?? 0;
      const sum = fromDiag + 2;
      return {
        val: sum,
        lineKey: 'transfer_match',
        topI: i + 1,
        topJ: j - 1,
        leftI: -1,
        leftJ: -1,
        tag: `端点相同 '${cond.charI}': dp[${i+1}][${j-1}] + 2 = ${sum}`,
        log: `| 🔄 端点字符相同 s[${i}] == s[${j}] ('${cond.charI}'): dp[${i}][${j}] = dp[${i + 1}][${j - 1}] (${fromDiag}) + 2 = ${sum}`,
        msg: `端点字符相同 <code>s[${i}] == s[${j}] == '${cond.charI}'</code>：<code>dp[${i}][${j}] = dp[${i + 1}][${j - 1}] (${fromDiag}) + 2 = <strong>${sum}</strong></code>。`
      };
    } else {
      const fromDown = ctx.dp[i + 1][j] ?? 0;
      const fromLeft = ctx.dp[i][j - 1] ?? 0;
      const maxVal = Math.max(fromDown, fromLeft);
      return {
        val: maxVal,
        lineKey: 'transfer_diff',
        topI: i + 1,
        topJ: j,
        leftI: i,
        leftJ: j - 1,
        tag: `端点不同: max(下, 左) = ${maxVal}`,
        log: `| 🔄 端点字符不同 s[${i}]('${cond.charI}') != s[${j}]('${cond.charJ}'): dp[${i}][${j}] = max(下=${fromDown}, 左=${fromLeft}) = ${maxVal}`,
        msg: `端点字符不同 <code>s[${i}] ('${cond.charI}') != s[${j}] ('${cond.charJ}')</code>：<code>dp[${i}][${j}] = max(下 ${fromDown}, 左 ${fromLeft}) = <strong>${maxVal}</strong></code>。`
      };
    }
  }
  protected getReturnInfo(ctx: IntervalTableContext): IntervalReturnInfo {
    const ans = ctx.dp[0][ctx.n - 1] ?? 0;
    return {
      i: 0,
      j: ctx.n - 1,
      val: ans,
      tag: '返回最终结果',
      log: `| 🏆 上三角填表完成！最长回文子序列长度 dp[0][${ctx.n - 1}] = ${ans}`,
      msg: `🏆 二维上三角填表全部完成！字符串 <code>"${ctx.s}"</code> 的最长回文子序列长度为: <strong>${ans}</strong>。`
    };
  }
}

export function compileLongestPalindromicStage3(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const compiler = new LongestPalindromicTableCompiler();
  return compiler.compile(model, anchorMap || {});
}

export function compileLongestPalindromicStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'bbbab') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n).fill(0);
    const gridState = Array.from({ length: n }, () => new Array(n).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineLoopI = anchorMap?.loop_i || 7;
    const lineAssignMatch = anchorMap?.assign_match || 14;
    const lineCalcMax = anchorMap?.calc_max || 16;
    const lineReturn = anchorMap?.return || 21;

    steps.push({
      type: 'init',
      line: lineInit,
      i: n - 1,
      j: n - 1,
      curL: n - 1,
      curR: n - 1,
      activeSlot: 0,
      memo: [...memo],
      dp: [...memo],
      leftDown: 0,
      s,
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维状态数组',
      log: `| 📦 创建长度为 ${n} 的一维滚动数组 memo[0..${n - 1}]`,
      msg: `创建长度为 <code>${n}</code> 的一维滚动状态数组 <code>memo[0..${n - 1}]</code>。`
    });

    for (let i = n - 1; i >= 0; i--) {
      memo[i] = 1;
      gridState[i][i] = 1;
      let pre = 0;

      steps.push({
        type: 'init-slot',
        line: lineLoopI,
        i,
        j: i,
        curL: i,
        curR: i,
        activeSlot: i,
        slotMode: 'updated',
        memoj: 1,
        memo: [...memo],
        dp: [...memo],
        leftDown: pre,
        s,
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `第 ${i} 行单字符初始化 memo[${i}] = 1`,
        log: `| 🎬 第 ${i} 行开始: memo[${i}] = 1, 初始化 pre = 0`,
        msg: `第 <code>${i}</code> 行开始：初始化 <code>memo[${i}] = 1</code>，重置 <code>pre = 0</code>。`
      });

      for (let j = i + 1; j < n; j++) {
        const temp = memo[j];
        const isMatch = s[i] === s[j];

        if (isMatch) {
          const sum = pre + 2;
          memo[j] = sum;
          gridState[i][j] = sum;

          steps.push({
            type: 'accumulate',
            line: lineAssignMatch,
            i,
            j,
            curL: i,
            curR: j,
            activeSlot: j,
            slotMode: 'updated',
            down: temp,
            right: pre,
            memoj: sum,
            memo: [...memo],
            dp: [...memo],
            leftDown: pre,
            s,
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `端点相同: pre(${pre}) + 2 = ${sum}`,
            log: `| ✨ s[${i}] == s[${j}] ('${s[i]}'): memo[${j}] = pre(${pre}) + 2 = ${sum}`,
            msg: `端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>：<code>memo[${j}] = pre (${pre}) + 2 = <strong>${sum}</strong></code>。`
          });
        } else {
          const downVal = memo[j];
          const leftVal = memo[j - 1];
          const maxVal = Math.max(downVal, leftVal);
          memo[j] = maxVal;
          gridState[i][j] = maxVal;

          steps.push({
            type: 'accumulate',
            line: lineCalcMax,
            i,
            j,
            curL: i,
            curR: j,
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: leftVal,
            memoj: maxVal,
            memo: [...memo],
            dp: [...memo],
            leftDown: pre,
            s,
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `端点不同: max(下, 左) = ${maxVal}`,
            log: `| ✨ s[${i}]('${s[i]}') != s[${j}]('${s[j]}'): memo[${j}] = max(下=${downVal}, 左=${leftVal}) = ${maxVal}`,
            msg: `端点字符不同 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>：<code>memo[${j}] = max(下 ${downVal}, 左 ${leftVal}) = <strong>${maxVal}</strong></code>。`
          });
        }

        pre = temp;
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      curL: 0,
      curR: n - 1,
      activeSlot: n - 1,
      slotMode: 'final',
      down: memo[n - 1],
      right: memo[n - 1],
      memoj: memo[n - 1],
      memo: [...memo],
      dp: [...memo],
      leftDown: memo[n - 2] ?? 0,
      s,
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 一维空间压缩完成！最长回文子序列长度 = ${memo[n - 1]}`,
      msg: `🏆 一维滚动压缩计算完成！字符串 <code>"${s}"</code> 的最长回文子序列长度为: <strong>${memo[n - 1]}</strong>。`
    });

    return steps;
  }

  /* =========================================================================
   * 5. 回文子串 (Palindromic Substrings)
   * ========================================================================= */

