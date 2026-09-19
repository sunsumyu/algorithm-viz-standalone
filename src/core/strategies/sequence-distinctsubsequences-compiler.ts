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
  type TableBoundaryResult,
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
        varName: 'useMatch',
        tag: '进入 [使用匹配] 分支',
        log: `| ➡️ 执行 useMatch = dfs(${nextMatchI}, ${nextMatchJ})：进入选用当前字符分支`,
        msg: `➡️ 进入 if 分支：执行 <code>useMatch = dfs(${nextMatchI}, ${nextMatchJ})</code>，选用当前匹配字符 <code>'${cond.char1}'</code>。`,
        recordMatchIndices: true
      },
      {
        nextI: nextSkipI,
        nextJ: nextSkipJ,
        lineKey: 'branch_skip',
        varName: 'skipChar',
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
        cells.push({
          i: 0,
          j,
          val: 0,
          tag: `Base Case dp[0][${j}]=0`,
          log: `| 🎬 初始化首行: dp[0][${j}] = 0 (母串为空且目标串非空，方案数为 0)`,
          msg: `初始化首行：<code>dp[0][${j}] = 0</code>。`
        });
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
        cells.push({
          i: ctx.m,
          j,
          val: 0,
          tag: `Base Case dp[${ctx.m}][${j}]=0`,
          log: `| 🎬 初始化尾行: dp[${ctx.m}][${j}] = 0 (母串后缀为空且目标非空，方案数为 0)`,
          msg: `初始化尾行：<code>dp[${ctx.m}][${j}] = 0</code>。`
        });
      }
    }
    return { valAnchorKey: 'init_val', cells };
  }
  protected checkTableBoundary(i: number, j: number, ctx: SequenceTableContext): TableBoundaryResult | null {
    const isForward = ctx.direction !== 'reverse';
    if (isForward) {
      if (j === 0) {
        return {
          lineKey: 'cond_base',
          val: 1,
          valLineKey: 'init_val',
          tag: `Base Case: dp[${i}][0] = 1`,
          log: `| 🎬 边界判定: j == 0 (目标串为空)，匹配方案数为 1`,
          msg: `边界条件判定：<code>j == 0</code>（目标串为空），任意母串前缀均有 1 种空匹配方案，<code>dp[${i}][0] = 1</code>。`
        };
      }
      if (i === 0) {
        return {
          lineKey: 'cond_empty',
          val: 0,
          valLineKey: 'init_zero',
          tag: `Base Case: dp[0][${j}] = 0`,
          log: `| 🎬 边界判定: i == 0 (母串为空且目标串非空)，方案数为 0`,
          msg: `边界条件判定：<code>i == 0</code>（母串已空但目标串非空），无法组成子序列，<code>dp[0][${j}] = 0</code>。`
        };
      }
      return null;
    } else {
      if (j === ctx.n) {
        return {
          lineKey: 'cond_base',
          val: 1,
          valLineKey: 'init_val',
          tag: `Base Case: dp[${i}][${ctx.n}] = 1`,
          log: `| 🎬 逆推边界判定: j == ${ctx.n} (空后缀)，匹配方案数为 1`,
          msg: `边界条件判定：<code>j == ${ctx.n}</code>（目标后缀为空），方案数为 1，<code>dp[${i}][${ctx.n}] = 1</code>。`
        };
      }
      if (i === ctx.m) {
        return {
          lineKey: 'cond_empty',
          val: 0,
          valLineKey: 'init_zero',
          tag: `Base Case: dp[${ctx.m}][${j}] = 0`,
          log: `| 🎬 逆推边界判定: i == ${ctx.m} (母串后缀为空且目标非空)，方案数为 0`,
          msg: `边界条件判定：<code>i == ${ctx.m}</code>（母串后缀为空但目标非空），无法匹配，<code>dp[${ctx.m}][${j}] = 0</code>。`
        };
      }
      return null;
    }
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
  direction: 'forward' | 'reverse' = 'forward',
  variant: string = 'for'
): UniversalStep[] {
  const compiler = new DistinctSubsequencesTableCompiler();
  return compiler.compile(model, anchorMap || {}, direction, variant);
}

export function compileDistinctSubsequencesStage4(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward',
  variant: string = 'reverse_1d'
): UniversalStep[] {
  const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
  const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
  const m = s.length;
  const n = t.length;
  const isReverse = direction === 'reverse';
  const isPruned = variant === 'pruned_1d' || variant === 'pruned';
  const isLeftUp = variant === 'leftup_1d' || variant === 'leftup';

  const steps: UniversalStep[] = [];
  const memo = new Array(n + 1).fill(0);
  const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

  const emitStep = (stepData: any) => {
    const isComparing = stepData.type === 'cond' || stepData.type === 'accumulate';
    const curI = isReverse
      ? Math.max(0, Math.min(m - 1, stepData.i ?? 0))
      : Math.max(0, Math.min(m - 1, (stepData.i ?? 1) - 1));
    const curJ = isReverse
      ? Math.max(0, Math.min(n - 1, stepData.j ?? 0))
      : Math.max(0, Math.min(n - 1, (stepData.j ?? 1) - 1));

    steps.push({
      s,
      t,
      s1: s,
      s2: t,
      curI,
      curJ,
      label1: '母串 S',
      label2: '目标 T',
      isComparing,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      ...stepData
    });
  };

  if (isReverse) {
    // ===== 逆推（一维滚动更新：暂存右下角旧值） =====
    const lineInit = anchorMap?.init || 4;
    const lineInitVal = anchorMap?.init_val || 5;
    const lineLoopI = anchorMap?.loop_i || 6;
    const lineCachePre = anchorMap?.cache_pre || 7;
    const lineCalcBounds = anchorMap?.calc_bounds || (isPruned ? 8 : 7);
    const lineLoopJ = anchorMap?.loop_j || (isPruned ? 9 : 8);
    const lineCond = anchorMap?.cond || (isPruned ? 11 : 10);
    const lineAccumulateForward = anchorMap?.accumulate_forward || (isPruned ? 12 : 11);
    const lineReturn = anchorMap?.return || (isPruned ? 17 : 16);

    // 1. 初始化分配数组帧
    emitStep({
      type: 'init',
      line: lineInit,
      i: m,
      j: n,
      activeSlot: n,
      slotMode: 'down',
      tag: '创建逆推一维滚动数组',
      log: `| 📦 [逆推] 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 全置为 0`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>。`
    });

    // 2. 初始化 Base Case
    memo[n] = 1;
    gridState[m][n] = 1;
    emitStep({
      type: 'init_val',
      line: lineInitVal,
      i: m,
      j: n,
      activeSlot: n,
      slotMode: 'updated',
      memoj: 1,
      tag: `初始化空后缀 Base Case: memo[${n}] = 1`,
      log: `| 🎬 [逆推] 初始化空后缀 Base Case: memo[${n}] = 1 (匹配空后缀方案数为 1)`,
      msg: `初始化空后缀 Base Case：<code>memo[${n}] = 1</code>。`
    });

    for (let i = m - 1; i >= 0; i--) {
      gridState[i][n] = 1;
      const rowTrail: string[] = [];

      // 外层循环头推进帧
      emitStep({
        type: 'loop_i',
        line: lineLoopI,
        i,
        j: n,
        activeSlot: n,
        activeTrail: [...rowTrail],
        tag: `[逆推] 外层循环: i = ${i} (字符 '${s[i]}')`,
        log: `| 🔁 [逆推外层] i = ${i}，考察源串字符 s[${i}] = '${s[i]}'`,
        msg: `逆推外层推进至 <code>i = ${i}</code>（源串字符 <code>'${s[i]}'</code>）。`
      });

      let pre = memo[n]; // 暂存右下角旧值 dp[i+1][j+1]
      emitStep({
        type: 'cache_pre',
        line: lineCachePre,
        i,
        j: n,
        activeSlot: n,
        activeTrail: [...rowTrail],
        tag: `暂存右下角旧值: pre = memo[${n}] = ${pre}`,
        log: `| 💾 [逆推暂存] pre = memo[${n}] = ${pre} (暂存右下角旧值，防止被当前行覆盖)`,
        msg: `暂存右下角旧值：<code>pre = memo[${n}] = ${pre}</code>。`
      });

      const minJ = isPruned ? Math.max(0, n - m + i) : 0;
      if (isPruned) {
        emitStep({
          type: 'calc_bounds',
          line: lineCalcBounds,
          i,
          j: n - 1,
          activeSlot: n - 1,
          activeTrail: [...rowTrail],
          tag: `✂️ 容量剪枝: minJ = max(0, ${n} - ${m} + ${i}) = ${minJ}`,
          log: `| ✂️ [容量剪枝] i=${i}，源串剩余 ${m - i} 字符，目标串后缀至少需 ${n - minJ} 字符，确定有效起始 minJ=${minJ} (跳过左侧 ${minJ} 次无效循环)`,
          msg: `✂️ <strong>剩余容量剪枝生效</strong>：源串剩余可用字符仅 <code>${m - i}</code> 个，目标串后缀至少需要 <code>${n - minJ}</code> 个，确定有效循环下界 <code>minJ = ${minJ}</code>，跳过左侧 <strong>${minJ}</strong> 次无效循环！`
        });
      }

      for (let j = n - 1; j >= minJ; j--) {
        const temp = memo[j];
        const isMatch = s[i] === t[j];
        rowTrail.push(`${i},${j}`);
        const topI = i + 1;
        const topJ = j;
        const diagI = isMatch ? i + 1 : undefined;
        const diagJ = isMatch ? j + 1 : undefined;

        // 内层循环推进帧
        emitStep({
          type: 'loop_j',
          line: lineLoopJ,
          i,
          j,
          topI,
          topJ,
          diagI,
          diagJ,
          isMatch,
          activeSlot: j,
          refSlot: isMatch ? j + 1 : undefined,
          down: memo[j],
          activeTrail: [...rowTrail],
          tag: `[逆推] 内层推进: j = ${j} (目标 '${t[j]}')`,
          log: `| ➡️ [逆推内层] 考察 j = ${j} (目标字符 '${t[j]}')，当前 memo[${j}] = ${memo[j]}`,
          msg: `逆推内层推进至 <code>j = ${j}</code>（目标字符 <code>'${t[j]}'</code>），当前 <code>memo[${j}] = ${memo[j]}</code>。`
        });

        // 字符比对判定帧
        emitStep({
          type: 'cond',
          line: lineCond,
          i,
          j,
          topI,
          topJ,
          diagI,
          diagJ,
          isMatch,
          activeSlot: j,
          refSlot: isMatch ? j + 1 : undefined,
          activeTrail: [...rowTrail],
          tag: isMatch
            ? `[逆推] 字符匹配: '${s[i]}' == '${t[j]}'`
            : `[逆推] 字符不匹配: '${s[i]}' != '${t[j]}'`,
          log: isMatch
            ? `| 🔍 [逆推] 字符匹配成功: s[${i}]('${s[i]}') == t[${j}]('${t[j]}')，执行累加`
            : `| ⏩ [逆推] 字符不匹配: s[${i}]('${s[i]}') != t[${j}]('${t[j]}')，保持旧值 ${memo[j]}`,
          msg: isMatch
            ? `字符匹配成功：<code>s[${i}] ('${s[i]}') == t[${j}] ('${t[j]}')</code>，执行 <code>memo[${j}] += pre</code>。`
            : `字符不匹配：<code>'${s[i]}' != '${t[j]}'</code>，<code>memo[${j}]</code> 保持旧值 <strong>${memo[j]}</strong>。`
        });

        if (isMatch) {
          const downVal = memo[j];
          memo[j] += pre;
          gridState[i][j] = memo[j];

          emitStep({
            type: 'accumulate',
            line: lineAccumulateForward,
            i,
            j,
            topI,
            topJ,
            diagI,
            diagJ,
            isMatch,
            activeSlot: j,
            refSlot: j + 1,
            slotMode: 'updated',
            down: downVal,
            right: pre,
            memoj: memo[j],
            activeTrail: [...rowTrail],
            tag: `暂存旧值累加: memo[${j}] += pre(${pre})`,
            log: `| ✨ [逆推] s[${i}] == t[${j}] ('${s[i]}'): memo[${j}] (${downVal}) += pre (${pre}) = ${memo[j]}`,
            msg: `字符匹配 <code>s[${i}] == t[${j}] == '${s[i]}'</code>：累加右下角旧值 <code>memo[${j}] (${downVal}) + pre (${pre}) = <strong>${memo[j]}</strong></code>。`
          });
        } else {
          gridState[i][j] = memo[j];
        }
        pre = temp;
      }
    }

    emitStep({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: 0,
      activeSlot: 0,
      slotMode: 'final',
      down: memo[0],
      right: 0,
      memoj: memo[0],
      activeTrail: [],
      tag: '最终答案 memo[0]',
      log: `| 🏆 一维逆推优化完成！最终答案 memo[0] = ${memo[0]}`,
      msg: `🏆 一维逆推压缩计算完成！在 <code>"${s}"</code> 中匹配 <code>"${t}"</code> 的方案数: <strong>${memo[0]}</strong>。`
    });
  } else {
    // ===== 顺推（一维滚动更新） =====
    const lineInit = anchorMap?.init || 4;
    const lineInitVal = anchorMap?.init_val || 5;
    const lineLoopI = anchorMap?.loop_i || 6;
    const lineCacheLeftUp = anchorMap?.cache_leftup || 7;
    const lineCalcBounds = anchorMap?.calc_bounds || (isPruned ? 7 : 6);
    const lineLoopJ = isLeftUp
      ? (anchorMap?.loop_j || 8)
      : (anchorMap?.loop_j_reverse || (isPruned ? 8 : 7));
    const lineCacheTemp = anchorMap?.cache_temp || 9;
    const lineCond = anchorMap?.cond || (isLeftUp ? 10 : (isPruned ? 9 : 8));
    const lineAccumulate = isLeftUp
      ? (anchorMap?.accumulate_leftup || 11)
      : (anchorMap?.accumulate_reverse || (isPruned ? 10 : 9));
    const lineUpdateLeftUp = anchorMap?.update_leftup || 13;
    const lineReturn = anchorMap?.return || (isLeftUp ? 16 : (isPruned ? 14 : 13));

    // 1. 初始化分配数组帧
    emitStep({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      slotMode: 'down',
      tag: '创建一维滚动数组',
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 全置为 0`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，空间复杂度极限压缩至 <strong>O(N)</strong>。`
    });

    // 2. 初始化 Base Case: dp[0] = 1
    memo[0] = 1;
    gridState[0][0] = 1;
    emitStep({
      type: 'init_val',
      line: lineInitVal,
      i: 0,
      j: 0,
      activeSlot: 0,
      slotMode: 'updated',
      memoj: 1,
      tag: '初始化空串 Base Case: memo[0] = 1',
      log: `| 🎬 初始化空串 Base Case: memo[0] = 1 (母串任意子序列删光即得空串，方案数为 1)`,
      msg: `初始化空串 Base Case：<code>memo[0] = 1</code>（匹配空串时唯一方案为不选任何字符）。`
    });

    for (let i = 1; i <= m; i++) {
      gridState[i][0] = 1;
      const rowTrail: string[] = [];

      let leftUp = memo[0]; // 暂存左上角旧值 dp[i-1][0]
      const maxJ = isPruned ? Math.min(i, n) : n;

      // 外层循环推进帧
      emitStep({
        type: 'loop_i',
        line: lineLoopI,
        i,
        j: isLeftUp ? 1 : maxJ,
        activeSlot: isLeftUp ? 1 : maxJ,
        activeTrail: [...rowTrail],
        tag: `外层推进: i = ${i} (字符 '${s[i - 1]}')`,
        log: `| 🔁 [外层循环] i = ${i}，考察源串字符 s[${i - 1}] = '${s[i - 1]}'`,
        msg: isLeftUp
          ? `外层循环推进至 <code>i = ${i}</code>（源串字符 <code>'${s[i - 1]}'</code>），将使用 <code>leftUp</code> 暂存左上角，从左向右正序遍历 <code>j = 1..${n}</code>。`
          : (isPruned
            ? `外层循环推进至 <code>i = ${i}</code>（源串字符 <code>'${s[i - 1]}'</code>），对角线剪枝将内层倒序收紧至 <code>j = ${maxJ}..1</code>。`
            : `外层循环推进至 <code>i = ${i}</code>（源串字符 <code>'${s[i - 1]}'</code>），内层循环将倒序遍历 <code>j = ${n}..1</code>。`)
      });

      if (isLeftUp) {
        emitStep({
          type: 'cache_leftup',
          line: lineCacheLeftUp,
          i,
          j: 0,
          activeSlot: 0,
          refSlot: 0,
          slotMode: 'down',
          tag: `暂存左上角: leftUp = memo[0] = ${leftUp}`,
          log: `| 💾 [leftUp暂存] i=${i}，暂存左上角初始值 leftUp = memo[0] = ${leftUp}，准备从左向右正序遍历`,
          msg: `暂存左上角旧值：<code>leftUp = memo[0] = ${leftUp}</code>。准备从左向右（正序）遍历。`
        });

        // ====== 从左向右走 (正序遍历) ======
        for (let j = 1; j <= n; j++) {
          const temp = memo[j];
          const isMatch = s[i - 1] === t[j - 1];
          rowTrail.push(`${i},${j}`);
          const topI = i - 1;
          const topJ = j;
          const diagI = isMatch ? i - 1 : undefined;
          const diagJ = isMatch ? j - 1 : undefined;

          // 内层正序推进帧
          emitStep({
            type: 'loop_j',
            line: lineLoopJ,
            i,
            j,
            topI,
            topJ,
            diagI,
            diagJ,
            isMatch,
            activeSlot: j,
            refSlot: isMatch ? j - 1 : undefined,
            slotMode: 'down',
            down: memo[j],
            right: leftUp,
            activeTrail: [...rowTrail],
            tag: `内层正序: j = ${j} (目标 '${t[j - 1]}')`,
            log: `| ➡️ [内层正序] 考察 j = ${j} (目标字符 '${t[j - 1]}')，当前 memo[${j}] = ${memo[j]}，暂存 leftUp = ${leftUp}`,
            msg: `内层循环从左向右正序推进至 <code>j = ${j}</code>（目标字符 <code>'${t[j - 1]}'</code>），当前 <code>memo[${j}] = ${memo[j]}</code>，<code>leftUp = ${leftUp}</code>。`
          });

          // 记录当前列旧值 temp
          emitStep({
            type: 'cache_temp',
            line: lineCacheTemp,
            i,
            j,
            topI,
            topJ,
            diagI,
            diagJ,
            isMatch,
            activeSlot: j,
            refSlot: isMatch ? j - 1 : undefined,
            slotMode: 'down',
            down: temp,
            right: leftUp,
            activeTrail: [...rowTrail],
            tag: `记录当前旧值: temp = memo[${j}] = ${temp}`,
            log: `| 💾 [暂存temp] temp = memo[${j}] = ${temp} (记录旧值，将在更新后传给 leftUp)`,
            msg: `记录当前列未更新前的旧值：<code>temp = memo[${j}] = ${temp}</code>，准备供下一列作为左上角。`
          });

          // 字符比对判定帧
          emitStep({
            type: 'cond',
            line: lineCond,
            i,
            j,
            topI,
            topJ,
            diagI,
            diagJ,
            isMatch,
            activeSlot: j,
            refSlot: isMatch ? j - 1 : undefined,
            activeTrail: [...rowTrail],
            tag: isMatch
              ? `字符匹配: '${s[i - 1]}' == '${t[j - 1]}' (成立)`
              : `字符不匹配: '${s[i - 1]}' != '${t[j - 1]}' (不成立)`,
            log: isMatch
              ? `| 🔍 字符匹配成功: s[${i - 1}]('${s[i - 1]}') == t[${j - 1}]('${t[j - 1]}')，累加 leftUp`
              : `| ⏩ 字符不匹配: s[${i - 1}]('${s[i - 1]}') != t[${j - 1}]('${t[j - 1]}')，memo[${j}] 保持旧值 ${memo[j]}`,
            msg: isMatch
              ? `字符比对成功：<code>'${s[i - 1]}' == '${t[j - 1]}'</code>，执行 <code>memo[${j}] += leftUp</code>。`
              : `字符不匹配：<code>'${s[i - 1]}' != '${t[j - 1]}'</code>，<code>memo[${j}]</code> 保持上一轮旧值 <strong>${memo[j]}</strong> 不变。`
          });

          if (isMatch) {
            const downVal = memo[j];
            memo[j] += leftUp;
            gridState[i][j] = memo[j];

            emitStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              topI,
              topJ,
              diagI,
              diagJ,
              isMatch,
              activeSlot: j,
              refSlot: j - 1,
              slotMode: 'updated',
              down: downVal,
              right: leftUp,
              memoj: memo[j],
              activeTrail: [...rowTrail],
              tag: `leftUp累加: memo[${j}] += leftUp(${leftUp})`,
              log: `| ✨ s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}'): memo[${j}] (${downVal}) += leftUp (${leftUp}) = ${memo[j]} [从左往右成功获取左上角]`,
              msg: `字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>：累加左上角旧值 <code>memo[${j}] (${downVal}) += leftUp (${leftUp}) = <strong>${memo[j]}</strong></code>。`
            });
          } else {
            gridState[i][j] = memo[j];
          }

          // 滚动更新 leftUp = temp
          leftUp = temp;
          emitStep({
            type: 'update_leftup',
            line: lineUpdateLeftUp,
            i,
            j,
            activeSlot: j,
            refSlot: j,
            slotMode: 'down',
            down: memo[j],
            right: leftUp,
            activeTrail: [...rowTrail],
            tag: `滚动更新: leftUp = temp(${temp})`,
            log: `| 🔄 [滚动更新] leftUp = temp (${temp})，作为下一个位置 j=${j + 1} 的左上角`,
            msg: `滚动更新左上角变量：<code>leftUp = temp (${temp})</code>，留给下一个位置 <code>j = ${j + 1}</code> 作为左上角旧值。`
          });
        }
      } else {
        if (isPruned) {
          emitStep({
            type: 'calc_bounds',
            line: lineCalcBounds,
            i,
            j: maxJ,
            activeSlot: maxJ,
            activeTrail: [...rowTrail],
            tag: `✂️ 对角线剪枝: maxJ = min(${i}, ${n}) = ${maxJ}`,
            log: `| ✂️ [对角线剪枝] i=${i}，源串前缀长 ${i}，最多匹配目标串前缀长 maxJ=min(${i}, ${n})=${maxJ} (跳过右上三角 ${n - maxJ} 次无效循环)`,
            msg: `✂️ <strong>对角线剪枝生效</strong>：源串当前仅取前 <code>${i}</code> 个字符，最多只能匹配目标串前缀 <code>maxJ = min(${i}, ${n}) = ${maxJ}</code>！对角线上方（<code>j > ${i}</code>）方案数恒为 0，直接跳过这 <strong>${n - maxJ}</strong> 次无效循环！`
          });
        }

        for (let j = maxJ; j >= 1; j--) {
          const isMatch = s[i - 1] === t[j - 1];
          rowTrail.push(`${i},${j}`);
          const topI = i - 1;
          const topJ = j;
          const diagI = isMatch ? i - 1 : undefined;
          const diagJ = isMatch ? j - 1 : undefined;

          // 内层倒序推进帧
          emitStep({
            type: 'loop_j',
            line: lineLoopJ,
            i,
            j,
            topI,
            topJ,
            diagI,
            diagJ,
            isMatch,
            activeSlot: j,
            refSlot: isMatch ? j - 1 : undefined,
            slotMode: 'down',
            down: memo[j],
            activeTrail: [...rowTrail],
            tag: `内层倒序: j = ${j} (目标 '${t[j - 1]}')`,
            log: `| ➡️ [内层倒序] 考察 j = ${j} (目标字符 '${t[j - 1]}')，当前 memo[${j}] = ${memo[j]} 为上一轮旧值`,
            msg: `内层循环倒序推进至 <code>j = ${j}</code>（目标字符 <code>'${t[j - 1]}'</code>），当前 <code>memo[${j}] = ${memo[j]}</code> 为上一轮旧值。`
          });

          // 字符比对判定帧
          emitStep({
            type: 'cond',
            line: lineCond,
            i,
            j,
            topI,
            topJ,
            diagI,
            diagJ,
            isMatch,
            activeSlot: j,
            refSlot: isMatch ? j - 1 : undefined,
            activeTrail: [...rowTrail],
            tag: isMatch
              ? `字符匹配: '${s[i - 1]}' == '${t[j - 1]}' (成立)`
              : `字符不匹配: '${s[i - 1]}' != '${t[j - 1]}' (不成立)`,
            log: isMatch
              ? `| 🔍 字符匹配成功: s[${i - 1}]('${s[i - 1]}') == t[${j - 1}]('${t[j - 1]}')，准备倒序累加`
              : `| ⏩ 字符不匹配: s[${i - 1}]('${s[i - 1]}') != t[${j - 1}]('${t[j - 1]}')，memo[${j}] 保持旧值 ${memo[j]}`,
            msg: isMatch
              ? `字符比对成功：<code>'${s[i - 1]}' == '${t[j - 1]}'</code>，执行 <code>memo[${j}] += memo[${j - 1}]</code>。`
              : `字符不匹配：<code>'${s[i - 1]}' != '${t[j - 1]}'</code>，<code>memo[${j}]</code> 保持上一轮旧值 <strong>${memo[j]}</strong> 不变。`
          });

          if (isMatch) {
            const downVal = memo[j];
            const rightVal = memo[j - 1];
            memo[j] += rightVal;
            gridState[i][j] = memo[j];

            emitStep({
              type: 'accumulate',
              line: lineAccumulate,
              i,
              j,
              topI,
              topJ,
              diagI,
              diagJ,
              isMatch,
              activeSlot: j,
              refSlot: j - 1,
              slotMode: 'updated',
              down: downVal,
              right: rightVal,
              memoj: memo[j],
              activeTrail: [...rowTrail],
              tag: `倒序累加: memo[${j}] += memo[${j - 1}]`,
              log: `| ✨ s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}'): memo[${j}] (${downVal}) += memo[${j - 1}] (${rightVal}) = ${memo[j]} [倒序确保取到旧值]`,
              msg: `字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>：倒序原地累加 <code>memo[${j}] (${downVal}) += memo[${j - 1}] (${rightVal}) = <strong>${memo[j]}</strong></code>。`
            });
          } else {
            gridState[i][j] = memo[j];
          }
        }
      }
    }

    emitStep({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      activeSlot: n,
      slotMode: 'final',
      down: memo[n],
      right: memo[n - 1],
      memoj: memo[n],
      activeTrail: [],
      tag: '最终答案 memo[n]',
      log: `| 🏆 一维倒序优化完成！最终答案 memo[${n}] = ${memo[n]}`,
      msg: `🏆 一维倒序压缩计算完成！在 <code>"${s}"</code> 中匹配 <code>"${t}"</code> 的方案数: <strong>${memo[n]}</strong>。`
    });
  }

  return steps;
}

  /* =========================================================================
   * 4. 最长回文子序列 (Longest Palindromic Subsequence)
   * ========================================================================= */

