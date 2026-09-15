import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';
import {
  AbstractSequenceRecursionCompiler,
  type SequenceRecursionContext,
  type BoundaryCheckResult,
  type ConditionEvalResult as RecursionConditionEvalResult,
  type RecursionBranchSpec,
  type CombineResult
} from './abstract-sequence-recursion-compiler';
import {
  AbstractSequenceTableCompiler,
  type SequenceTableContext,
  type BorderInitConfig,
  type BorderInitCell,
  type ConditionEvalResult,
  type TransferResult,
  type ReturnInfo
} from './abstract-sequence-table-compiler';
class DistinctSubsequencesRecursionCompiler extends AbstractSequenceRecursionCompiler {
  protected extractString1(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.s || 'rabbbit') as string;
  }

  protected extractString2(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.t || 'rabbit') as string;
  }

  protected getLabels(model: IYamlAlgorithmModel): { label1: string; label2: string } {
    return { label1: '母串 S', label2: '目标 T' };
  }

  protected checkBoundary(
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): BoundaryCheckResult {
    const isForward = ctx.isForward;
    const targetDone = isForward ? j === ctx.n : j === 0;
    if (targetDone) {
      return {
        isBase: true,
        val: 1,
        lineKey: 'boundary_target',
        tag: isForward ? 'Base Case (目标串匹配完成)' : 'Base Case (目标串前缀耗尽)',
        log: `| 🎬 满足 Base Case: 目标串已全部匹配完毕，返回 1`,
        msg: `🎬 目标串已全部匹配完毕，成功寻得 1 种有效子序列方案，返回 <strong>1</strong>。`
      };
    }

    const sourceEmpty = isForward ? i === ctx.m : i === 0;
    if (sourceEmpty) {
      return {
        isBase: true,
        val: 0,
        lineKey: 'boundary_source',
        tag: 'Base Case (s耗尽)',
        log: `| 🎬 满足 Base Case: 源串字符已耗尽但目标串未完毕，返回 0`,
        msg: `🎬 源串 <code>s</code> 字符已耗尽，无法凑齐目标串 <code>t</code>，返回 <strong>0</strong>。`
      };
    }

    return { isBase: false };
  }

  protected evalCondition(
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): RecursionConditionEvalResult {
    const curCharS = ctx.isForward ? ctx.s1[i] : ctx.s1[i - 1];
    const curCharT = ctx.isForward ? ctx.s2[j] : ctx.s2[j - 1];
    const isMatch = curCharS === curCharT;

    return {
      isMatch,
      char1: curCharS,
      char2: curCharT,
      lineKey: 'match',
      tag: isMatch ? `字符匹配 '${curCharS}'` : `字符不匹配 '${curCharS}'!='${curCharT}'`,
      log: isMatch
        ? `| 🔀 字符匹配 ('${curCharS}')，探索 [匹配] 与 [跳过] 两分支`
        : `| ⏩ 字符不匹配 ('${curCharS}' != '${curCharT}')，只能跳过`,
      msg: isMatch
        ? `🔀 字符匹配 <code>'${curCharS}'</code>，可选择使用当前字符匹配或跳过。`
        : `⏩ 字符不匹配 <code>'${curCharS}' != '${curCharT}'</code>，只能跳过当前字符。`
    };
  }

  protected getMatchBranches(
    i: number,
    j: number,
    ctx: SequenceRecursionContext,
    cond: RecursionConditionEvalResult
  ): RecursionBranchSpec[] {
    const isForward = ctx.isForward;
    const nextMatchI = isForward ? i + 1 : i - 1;
    const nextMatchJ = isForward ? j + 1 : j - 1;
    const nextSkipI = isForward ? i + 1 : i - 1;
    const nextSkipJ = j;

    return [
      {
        nextI: nextMatchI,
        nextJ: nextMatchJ,
        lineKey: 'branch_match',
        tag: '进入 [使用匹配] 分支',
        log: `| ➡️ 执行 useMatch = dfs(${nextMatchI}, ${nextMatchJ})：进入选用当前字符分支`,
        msg: `➡️ 进入 if 分支：执行 <code>useMatch = dfs(${nextMatchI}, ${nextMatchJ})</code>，选用当前匹配字符 <code>'${cond.char1}'</code>。`,
        recordMatchIndices: true
      },
      {
        nextI: nextSkipI,
        nextJ: nextSkipJ,
        lineKey: 'branch_skip',
        tag: '进入 [跳过] 分支',
        log: `| ➡️ 执行 skipChar = dfs(${nextSkipI}, ${nextSkipJ})：进入跳过分支（虽相同但不选）`,
        msg: `➡️ 继续执行 <code>skipChar = dfs(${nextSkipI}, ${nextSkipJ})</code>：跳过当前母串字符。`,
        recordMatchIndices: false
      }
    ];
  }

  protected getMismatchBranches(
    i: number,
    j: number,
    ctx: SequenceRecursionContext,
    cond: RecursionConditionEvalResult
  ): RecursionBranchSpec[] {
    const isForward = ctx.isForward;
    const nextSkipI = isForward ? i + 1 : i - 1;
    const nextSkipJ = j;

    return [
      {
        nextI: nextSkipI,
        nextJ: nextSkipJ,
        lineKey: 'skip',
        tag: `不匹配跳过 '${cond.char1}'`,
        log: `| ⏩ 执行 return dfs(${nextSkipI}, ${nextSkipJ})：跳过当前源串字符`,
        msg: `⏩ 字符不匹配，执行 <code>dfs(${nextSkipI}, ${nextSkipJ})</code> 跳过当前字符。`,
        recordMatchIndices: false
      }
    ];
  }

  protected combineBranches(
    branchResults: number[],
    isMatch: boolean,
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): CombineResult {
    if (isMatch) {
      const valMatch = branchResults[0] ?? 0;
      const valSkip = branchResults[1] ?? 0;
      const res = valMatch + valSkip;
      return {
        val: res,
        lineKey: 'combine',
        tag: '合并匹配与跳过方案',
        log: `| ✨ 合并分支: dfs(${i}, ${j}) = 匹配(${valMatch}) + 跳过(${valSkip}) = ${res}${ctx.isMemo ? ' [存入备忘录]' : ''}`,
        msg: `✨ 汇总分支决策：<code>匹配分支 (${valMatch}) + 跳过分支 (${valSkip}) = <strong>${res}</strong></code>。`
      };
    } else {
      const res = branchResults[0] ?? 0;
      return {
        val: res,
        lineKey: 'skip',
        tag: '单分支返回',
        log: `| ↩️ 不匹配分支返回: dfs(${i}, ${j}) = ${res}${ctx.isMemo ? ' [存入备忘录]' : ''}`,
        msg: `↩️ 不匹配分支探索结束，返回 <strong>${res}</strong>。`
      };
    }
  }

  protected formatFinalReturn(
    total: number,
    ctx: SequenceRecursionContext
  ): { tag: string; log: string; msg: string } {
    return {
      tag: '最终答案',
      log: `| 🏆 不同的子序列演化完成！numDistinct("${ctx.s1}", "${ctx.s2}") = ${total}`,
      msg: `🏆 演化计算完成！在 <code>s = "${ctx.s1}"</code> 的子序列中，<code>t = "${ctx.s2}"</code> 出现的次数为 <strong>${total}</strong>。`
    };
  }
}

const distinctSubsequencesRecursionCompiler = new DistinctSubsequencesRecursionCompiler();

export function compileDistinctSubsequencesStage1or2(
  model: IYamlAlgorithmModel,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  return distinctSubsequencesRecursionCompiler.compile(model, isMemo, anchorMap, direction);
}

class DistinctSubsequencesTableCompiler extends AbstractSequenceTableCompiler {
  protected extractString1(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.s || 'rabbbit') as string;
  }
  protected extractString2(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.t || 'rabbit') as string;
  }
  protected getLabel1(): string {
    return '母串 S';
  }
  protected getLabel2(): string {
    return '目标 T';
  }
  protected getInitMessage(ctx: SequenceTableContext): string {
    const isForward = ctx.direction !== 'reverse';
    return isForward
      ? `创建 <code>${ctx.m + 1}×${ctx.n + 1}</code> 的二维 DP 表格，行对应源串 <code>s[0..${ctx.m - 1}]</code>，列对应目标串 <code>t[0..${ctx.n - 1}]</code>。`
      : `创建 <code>${ctx.m + 1}×${ctx.n + 1}</code> 的二维 DP 表格，行对应源串后缀 <code>s[i..${ctx.m - 1}]</code>，列对应目标串后缀 <code>t[j..${ctx.n - 1}]</code>。`;
  }
  protected getBorderInitConfig(ctx: SequenceTableContext): BorderInitConfig {
    const isForward = ctx.direction !== 'reverse';
    const cells: BorderInitCell[] = [];
    if (isForward) {
      for (let i = 0; i <= ctx.m; i++) {
        cells.push({
          i,
          j: 0,
          val: 1,
          tag: `Base Case dp[${i}][0]=1`,
          log: `| 🎬 初始化首列: dp[${i}][0] = 1 (目标串为空串，方案数为 1)`,
          msg: `初始化首列：<code>dp[${i}][0] = 1</code>（匹配空串 <code>t = ""</code> 时，唯一方案是删除 <code>s</code> 中所有字符）。`
        });
      }
      for (let j = 1; j <= ctx.n; j++) {
        ctx.dp[0][j] = 0;
      }
    } else {
      for (let i = 0; i <= ctx.m; i++) {
        cells.push({
          i,
          j: ctx.n,
          val: 1,
          tag: `Base Case dp[${i}][${ctx.n}]=1`,
          log: `| 🎬 初始化尾列: dp[${i}][${ctx.n}] = 1 (目标串为空后缀，方案数为 1)`,
          msg: `初始化尾列：<code>dp[${i}][${ctx.n}] = 1</code>（匹配空后缀 <code>t = ""</code> 时方案数为 1）。`
        });
      }
      for (let j = 0; j < ctx.n; j++) {
        ctx.dp[ctx.m][j] = 0;
      }
    }
    return { valAnchorKey: 'init_val', cells };
  }
  protected evaluateCondition(i: number, j: number, ctx: SequenceTableContext): ConditionEvalResult {
    const isForward = ctx.direction !== 'reverse';
    const c1 = isForward ? ctx.s1[i - 1] : ctx.s1[i];
    const c2 = isForward ? ctx.s2[j - 1] : ctx.s2[j];
    const isMatch = c1 === c2;
    const tag = isMatch ? `字符匹配 '${c1}' == '${c2}'` : `字符不匹配 '${c1}' != '${c2}'`;
    const log = isForward
      ? (isMatch
          ? `| 🔍 [顺推] 比对 s[${i - 1}]('${c1}') 与 t[${j - 1}]('${c2}')：匹配成功！`
          : `| 🔍 [顺推] 比对 s[${i - 1}]('${c1}') 与 t[${j - 1}]('${c2}')：不匹配！`)
      : (isMatch
          ? `| 🔍 [逆推] 比对 s[${i}]('${c1}') 与 t[${j}]('${c2}')：匹配成功！`
          : `| 🔍 [逆推] 比对 s[${i}]('${c1}') 与 t[${j}]('${c2}')：不匹配！`);
    const msg = isMatch
      ? `比对条件成立：<code>'${c1}' == '${c2}'</code>，可将两分支（选该字符 / 跳过该字符）方案数相加。`
      : `比对条件不成立：<code>'${c1}' != '${c2}'</code>，当前字符无法匹配，只能跳过源串当前字符。`;
    return { isMatch, char1: c1, char2: c2, tag, log, msg };
  }
  protected computeTransfer(i: number, j: number, cond: ConditionEvalResult, ctx: SequenceTableContext): TransferResult {
    const isForward = ctx.direction !== 'reverse';
    if (isForward) {
      if (cond.isMatch) {
        const fromMatch = ctx.dp[i - 1][j - 1] ?? 0;
        const fromSkip = ctx.dp[i - 1][j] ?? 0;
        const sum = fromMatch + fromSkip;
        return {
          val: sum,
          lineKey: 'transfer_match',
          topI: i - 1,
          topJ: j,
          leftI: i - 1,
          leftJ: j - 1,
          tag: `匹配 s[${i - 1}]=='${cond.char1}': 匹配 + 跳过`,
          log: `| 🔄 字符匹配: dp[${i}][${j}] = dp[${i - 1}][${j - 1}](${fromMatch}) + dp[${i - 1}][${j}](${fromSkip}) = ${sum}`,
          msg: `字符匹配成功：<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] (${fromMatch}) + dp[${i - 1}][${j}] (${fromSkip}) = <strong>${sum}</strong></code>。`
        };
      } else {
        const fromSkip = ctx.dp[i - 1][j] ?? 0;
        return {
          val: fromSkip,
          lineKey: 'transfer_skip',
          topI: i - 1,
          topJ: j,
          leftI: -1,
          leftJ: -1,
          tag: `不匹配: dp[${i}][${j}] = 上方旧值`,
          log: `| 🔄 字符不匹配: dp[${i}][${j}] = dp[${i - 1}][${j}](${fromSkip})`,
          msg: `字符不匹配：<code>dp[${i}][${j}] = dp[${i - 1}][${j}] = <strong>${fromSkip}</strong></code>。`
        };
      }
    } else {
      if (cond.isMatch) {
        const fromMatch = ctx.dp[i + 1][j + 1] ?? 0;
        const fromSkip = ctx.dp[i + 1][j] ?? 0;
        const sum = fromMatch + fromSkip;
        return {
          val: sum,
          lineKey: 'transfer_match',
          topI: i + 1,
          topJ: j,
          leftI: i + 1,
          leftJ: j + 1,
          tag: `匹配 s[${i}]=='${cond.char1}': 匹配 + 跳过`,
          log: `| 🔄 [逆推] 字符匹配: dp[${i}][${j}] = 右下(${fromMatch}) + 下方(${fromSkip}) = ${sum}`,
          msg: `字符匹配：<code>dp[${i}][${j}] = dp[${i + 1}][${j + 1}] (${fromMatch}) + dp[${i + 1}][${j}] (${fromSkip}) = <strong>${sum}</strong></code>。`
        };
      } else {
        const fromSkip = ctx.dp[i + 1][j] ?? 0;
        return {
          val: fromSkip,
          lineKey: 'transfer_skip',
          topI: i + 1,
          topJ: j,
          leftI: -1,
          leftJ: -1,
          tag: `不匹配: dp[${i}][${j}] = 下方旧值`,
          log: `| 🔄 [逆推] 字符不匹配: dp[${i}][${j}] = dp[${i + 1}][${j}](${fromSkip})`,
          msg: `字符不匹配：<code>dp[${i}][${j}] = dp[${i + 1}][${j}] = <strong>${fromSkip}</strong></code>。`
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
      tag: `返回最终结果 dp[${targetI}][${targetJ}] = ${ans}`,
      log: isForward
        ? `| 🏆 [顺推] 顺序填表完成！最终结果 dp[${targetI}][${targetJ}] = ${ans}`
        : `| 🏆 [逆推] 倒序填表完成！最终结果 dp[0][0] = ${ans}`,
      msg: isForward
        ? `🏆 二维顺序填表全部完成！在右下角 <code>dp[${targetI}][${targetJ}]</code> 汇聚全串方案数: <strong>${ans}</strong>。`
        : `🏆 二维倒序填表全部完成！在左上角 <code>dp[0][0]</code> 汇聚全串方案数: <strong>${ans}</strong>。`
    };
  }
}

export function compileDistinctSubsequencesStage3(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const compiler = new DistinctSubsequencesTableCompiler();
  return compiler.compile(model, anchorMap || {}, direction);
}

export function compileDistinctSubsequencesStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
    const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
    const m = s.length;
    const n = t.length;
    const isReverse = direction === 'reverse';

    const steps: UniversalStep[] = [];
    const memo = new Array(n + 1).fill(0);
    const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineAccumulateReverse = anchorMap?.accumulate_reverse || 15;
    const lineAccumulateForward = anchorMap?.accumulate_forward || 15;
    const lineReturn = anchorMap?.return || 19;

    if (isReverse) {
      // ===== 逆推（一维滚动更新：暂存右下角旧值） =====
      memo[n] = 1;
      gridState[m][n] = 1;

      steps.push({
        type: 'init',
        line: lineInit,
        i: m,
        j: n,
        activeSlot: n,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: '初始化一维滚动数组 (逆推视角)',
        log: `| 📦 [逆推] 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化 memo[${n}] = 1`,
        msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化空后缀 Base Case <code>memo[${n}] = 1</code>。`
      });

      for (let i = m - 1; i >= 0; i--) {
        gridState[i][n] = 1;
        let pre = memo[n]; // 暂存右下角旧值 dp[i+1][j+1]

        for (let j = n - 1; j >= 0; j--) {
          const temp = memo[j];
          const isMatch = s[i] === t[j];

          if (isMatch) {
            const downVal = memo[j];
            memo[j] += pre;
            gridState[i][j] = memo[j];

            steps.push({
              type: 'accumulate',
              line: lineAccumulateForward,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              down: downVal,
              right: pre,
              memoj: memo[j],
              memo: [...memo],
              memoSnapshot: [...memo],
              grid: JSON.parse(JSON.stringify(gridState)),
              tag: `暂存旧值累加: memo[${j}] += pre(${pre})`,
              log: `| ✨ [逆推] s[${i}] == t[${j}] ('${s[i]}'): memo[${j}] (${downVal}) += pre (${pre}) = ${memo[j]}`,
              msg: `字符匹配 <code>s[${i}] == t[${j}] == '${s[i]}'</code>：累加右下角旧值 <code>memo[${j}] (${downVal}) + pre (${pre}) = <strong>${memo[j]}</strong></code>。`
            });
          }
          pre = temp;
        }
      }

      steps.push({
        type: 'return',
        line: lineReturn,
        i: 0,
        j: 0,
        activeSlot: 0,
        slotMode: 'final',
        down: memo[0],
        right: 0,
        memoj: memo[0],
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: '最终答案 memo[0]',
        log: `| 🏆 一维逆推优化完成！最终答案 memo[0] = ${memo[0]}`,
        msg: `🏆 一维逆推压缩计算完成！在 <code>"${s}"</code> 中匹配 <code>"${t}"</code> 的方案数: <strong>${memo[0]}</strong>。`
      });
    } else {
      // ===== 顺推（一维倒序滚动更新） =====
      memo[0] = 1;
      gridState[0][0] = 1;

      steps.push({
        type: 'init',
        line: lineInit,
        i: 0,
        j: 0,
        activeSlot: 0,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: '初始化一维滚动数组',
        log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化 memo[0] = 1`,
        msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化空串 Base Case <code>memo[0] = 1</code>。`
      });

      for (let i = 1; i <= m; i++) {
        gridState[i][0] = 1;

        for (let j = n; j >= 1; j--) {
          const isMatch = s[i - 1] === t[j - 1];

          if (isMatch) {
            const downVal = memo[j];
            const rightVal = memo[j - 1];
            memo[j] += rightVal;
            gridState[i][j] = memo[j];

            steps.push({
              type: 'accumulate',
              line: lineAccumulateReverse,
              i,
              j,
              activeSlot: j,
              slotMode: 'updated',
              down: downVal,
              right: rightVal,
              memoj: memo[j],
              memo: [...memo],
              memoSnapshot: [...memo],
              grid: JSON.parse(JSON.stringify(gridState)),
              tag: `倒序累加: memo[${j}] += memo[${j - 1}]`,
              log: `| ✨ s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}'): memo[${j}] (${downVal}) += memo[${j - 1}] (${rightVal}) = ${memo[j]} [倒序确保取到旧值]`,
              msg: `字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>：倒序原地累加 <code>memo[${j}] (${downVal}) += memo[${j - 1}] (${rightVal}) = <strong>${memo[j]}</strong></code>。`
            });
          }
        }
      }

      steps.push({
        type: 'return',
        line: lineReturn,
        i: m,
        j: n,
        activeSlot: n,
        slotMode: 'final',
        down: memo[n],
        right: memo[n - 1],
        memoj: memo[n],
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: '最终答案',
        log: `| 🏆 一维倒序优化完成！最终答案 memo[${n}] = ${memo[n]}`,
        msg: `🏆 一维倒序压缩计算完成！在 <code>"${s}"</code> 中匹配 <code>"${t}"</code> 的方案数: <strong>${memo[n]}</strong>。`
      });
    }

    return steps;
  }

  /* =========================================================================
   * 4. 最长回文子序列 (Longest Palindromic Subsequence)
   * ========================================================================= */

