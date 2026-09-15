import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
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

/**
 * 两个字符串的删除操作 (Delete Operation for Two Strings, LeetCode 583) 四阶段全演化步骤编译器
 * 遵循「不同路径 II」黄金基准与 AbstractSequenceRecursionCompiler / AbstractSequenceTableCompiler 顶层抽象：
 * - 阶段 1 & 2: 继承 AbstractSequenceRecursionCompiler，Template Method 模式接管 DFS，分支调用前严格高亮调用行，彻底杜绝跳步
 * - 阶段 3: 严格二维表拓扑递推，对偶支持正序自左上向右下填表与倒序自右下向左上填表
 * - 阶段 4: 一维滚动数组优化，对偶支持正序左上角 pre 暂存与倒序右下角 pre 暂存
 */

class DeleteDistanceRecursionCompiler extends AbstractSequenceRecursionCompiler {
  protected extractString1(model: IYamlAlgorithmModel): string {
    const p = model.defaultParams as any;
    return (p?.word1 || p?.s || 'sea') as string;
  }

  protected extractString2(model: IYamlAlgorithmModel): string {
    const p = model.defaultParams as any;
    return (p?.word2 || p?.t || 'eat') as string;
  }

  protected getLabels(model: IYamlAlgorithmModel): { label1: string; label2: string } {
    return { label1: 'word1', label2: 'word2' };
  }

  protected checkBoundary(
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): BoundaryCheckResult {
    const isForward = ctx.isForward;
    if (isForward) {
      if (i === ctx.m) {
        const remaining = ctx.n - j;
        return {
          isBase: true,
          val: remaining,
          lineKey: 'boundary_word1',
          tag: `Base Case i=m 需删${remaining}步`,
          log: `| 🏆 【Base Case 达成】i=${ctx.m}: word1 到达末尾，需删去 word2 剩余全部 ${remaining} 个字符，return ${remaining}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>i = ${ctx.m}</code>（word1 到达末尾）：需删除 word2 剩余全部 <code>${remaining}</code> 个字符，返回 <strong>${remaining}</strong>。`
        };
      }
      if (j === ctx.n) {
        const remaining = ctx.m - i;
        return {
          isBase: true,
          val: remaining,
          lineKey: 'boundary_word2',
          tag: `Base Case j=n 需删${remaining}步`,
          log: `| 🏆 【Base Case 达成】j=${ctx.n}: word2 到达末尾，需删去 word1 剩余全部 ${remaining} 个字符，return ${remaining}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>j = ${ctx.n}</code>（word2 到达末尾）：需删除 word1 剩余全部 <code>${remaining}</code> 个字符，返回 <strong>${remaining}</strong>。`
        };
      }
    } else {
      if (i === 0) {
        return {
          isBase: true,
          val: j,
          lineKey: 'boundary_word1',
          tag: `Base Case i=0 需删${j}步`,
          log: `| 🏆 【Base Case 达成】i=0: word1 为空，需删去 word2 剩余全部 ${j} 个字符，return ${j}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>i = 0</code>（word1 为空）：需删除 word2 剩余全部 <code>${j}</code> 个字符，返回 <strong>${j}</strong>。`
        };
      }
      if (j === 0) {
        return {
          isBase: true,
          val: i,
          lineKey: 'boundary_word2',
          tag: `Base Case j=0 需删${i}步`,
          log: `| 🏆 【Base Case 达成】j=0: word2 为空，需删去 word1 剩余全部 ${i} 个字符，return ${i}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>j = 0</code>（word2 为空）：需删除 word1 剩余全部 <code>${i}</code> 个字符，返回 <strong>${i}</strong>。`
        };
      }
    }
    return { isBase: false };
  }

  protected evalCondition(
    i: number,
    j: number,
    ctx: SequenceRecursionContext
  ): RecursionConditionEvalResult {
    const isForward = ctx.isForward;
    const charS = isForward ? ctx.s1[i] : ctx.s1[i - 1];
    const charT = isForward ? ctx.s2[j] : ctx.s2[j - 1];
    const isMatch = charS === charT;

    const idx1 = isForward ? i : i - 1;
    const idx2 = isForward ? j : j - 1;

    return {
      isMatch,
      char1: charS,
      char2: charT,
      lineKey: 'match',
      tag: isMatch ? `字符匹配 '${charS}'=='${charT}'` : `字符不匹配 '${charS}'!='${charT}'`,
      log: `| 🔍 字符比对: word1[${idx1}]='${charS}' 与 word2[${idx2}]='${charT}' -> ${isMatch ? '匹配相同' : '不同'}`,
      msg: `比对字符：<code>word1[${idx1}] = '${charS}'</code> 与 <code>word2[${idx2}] = '${charT}'</code> -> <strong>${isMatch ? '匹配相同' : '不相同'}</strong>。`
    };
  }

  protected getMatchBranches(
    i: number,
    j: number,
    ctx: SequenceRecursionContext,
    cond: RecursionConditionEvalResult
  ): RecursionBranchSpec[] {
    const isForward = ctx.isForward;
    const nextI = isForward ? i + 1 : i - 1;
    const nextJ = isForward ? j + 1 : j - 1;

    return [
      {
        nextI,
        nextJ,
        lineKey: 'match_branch',
        tag: '字符相同无需删除',
        log: `| 🎯 字符相同无需删除，深入子问题 dfs(${nextI}, ${nextJ})`,
        msg: `🎯 字符相同无需删除，直接深入子问题 <code>dfs(${nextI}, ${nextJ})</code>。`,
        recordMatchIndices: true
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
    const del1I = isForward ? i + 1 : i - 1;
    const del1J = j;
    const del2I = i;
    const del2J = isForward ? j + 1 : j - 1;

    const char1 = cond.char1;
    const char2 = cond.char2;

    return [
      {
        nextI: del1I,
        nextJ: del1J,
        lineKey: 'branch_del1',
        tag: `删word1字符 '${char1}'`,
        log: `| ➡️ 执行 delWord1 = dfs(${del1I}, ${del1J})：删去 word1[${isForward ? i : i - 1}]='${char1}'`,
        msg: `➡️ 进入 else 分支：执行 <code>delWord1 = dfs(${del1I}, ${del1J})</code>，尝试删去 word1 字符 <code>'${char1}'</code>。`,
        recordMatchIndices: false
      },
      {
        nextI: del2I,
        nextJ: del2J,
        lineKey: 'branch_del2',
        tag: `删word2字符 '${char2}'`,
        log: `| ➡️ 执行 delWord2 = dfs(${del2I}, ${del2J})：删去 word2[${isForward ? j : j - 1}]='${char2}'`,
        msg: `➡️ 继续执行 <code>delWord2 = dfs(${del2I}, ${del2J})</code>，尝试删去 word2 字符 <code>'${char2}'</code>。`,
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
      const res = branchResults[0] ?? 0;
      return {
        val: res,
        lineKey: 'match_branch',
        tag: `直接继承结果 ${res}`,
        log: `| 🟢 dfs(${i}, ${j}) = ${res}${ctx.isMemo ? ' [写入备忘录]' : ''}`,
        msg: `字符相同，继承子问题结果：<code>dfs(${i}, ${j}) = <strong>${res}</strong></code>。`
      };
    } else {
      const valDel1 = branchResults[0] ?? 0;
      const valDel2 = branchResults[1] ?? 0;
      const res = Math.min(valDel1, valDel2) + 1;
      return {
        val: res,
        lineKey: 'combine',
        tag: `min(${valDel1}, ${valDel2}) + 1 = ${res}`,
        log: `| 🔀 汇总删除步数: min(删word1=${valDel1}, 删word2=${valDel2}) + 1 = ${res}${ctx.isMemo ? ' [写入备忘录]' : ''}`,
        msg: `汇总两向删除选择：<code>min(删word1=${valDel1}, 删word2=${valDel2}) + 1 = <strong>${res}</strong></code>。`
      };
    }
  }

  protected formatFinalReturn(
    total: number,
    ctx: SequenceRecursionContext
  ): { tag: string; log: string; msg: string } {
    return {
      tag: '最终最少步数',
      log: `| 🏆 两个字符串的删除操作演化完成！minDistance("${ctx.s1}", "${ctx.s2}") = ${total}`,
      msg: `🏆 演化计算完成！使得 <code>word1 = "${ctx.s1}"</code> 与 <code>word2 = "${ctx.s2}"</code> 相同所需的最少删除步数为 <strong>${total}</strong>。`
    };
  }
}

const deleteDistanceRecursionCompiler = new DeleteDistanceRecursionCompiler();

export function compileDeleteDistanceStage1or2(
  model: IYamlAlgorithmModel,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  return deleteDistanceRecursionCompiler.compile(model, isMemo, anchorMap, direction);
}

class DeleteDistanceTableCompiler extends AbstractSequenceTableCompiler {
  protected extractString1(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
  }
  protected extractString2(model: IYamlAlgorithmModel): string {
    return ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
  }
  protected getLabel1(): string {
    return 'word1';
  }
  protected getLabel2(): string {
    return 'word2';
  }
  protected getInitMessage(ctx: SequenceTableContext): string {
    return `创建 <code>${ctx.m + 1}×${ctx.n + 1}</code> 的二维 DP 表格，行对应 <code>word1</code>，列对应 <code>word2</code>。`;
  }
  protected getBorderInitConfig(ctx: SequenceTableContext): BorderInitConfig {
    const isForward = ctx.direction !== 'reverse';
    const cells: BorderInitCell[] = [];
    if (isForward) {
      for (let i = 0; i <= ctx.m; i++) {
        cells.push({
          i,
          j: 0,
          val: i,
          tag: `Base Case dp[${i}][0]=${i}`,
          log: `| 🎬 初始化首列: dp[${i}][0] = ${i} (word2 为空串，需删除 word1 全部 ${i} 个字符)`,
          msg: `初始化首列：<code>dp[${i}][0] = ${i}</code>（word2 为空时，需删去 <code>word1</code> 的全部 <code>${i}</code> 个字符）。`
        });
      }
      for (let j = 1; j <= ctx.n; j++) {
        cells.push({
          i: 0,
          j,
          val: j,
          tag: `Base Case dp[0][${j}]=${j}`,
          log: `| 🎬 初始化首行: dp[0][${j}] = ${j} (word1 为空串，需删除 word2 全部 ${j} 个字符)`,
          msg: `初始化首行：<code>dp[0][${j}] = ${j}</code>（word1 为空时，需删去 <code>word2</code> 的全部 <code>${j}</code> 个字符）。`
        });
      }
    } else {
      for (let i = 0; i <= ctx.m; i++) {
        cells.push({
          i,
          j: ctx.n,
          val: ctx.m - i,
          tag: `Base Case dp[${i}][${ctx.n}]=${ctx.m - i}`,
          log: `| 🎬 初始化末列: dp[${i}][${ctx.n}] = ${ctx.m - i} (word2 到达末尾，需删除 word1 剩余 ${ctx.m - i} 个字符)`,
          msg: `初始化末列：<code>dp[${i}][${ctx.n}] = ${ctx.m - i}</code>（word2 已经处理完毕，需删去 <code>word1</code> 的剩余 <code>${ctx.m - i}</code> 个字符）。`
        });
      }
      for (let j = 0; j < ctx.n; j++) {
        cells.push({
          i: ctx.m,
          j,
          val: ctx.n - j,
          tag: `Base Case dp[${ctx.m}][${j}]=${ctx.n - j}`,
          log: `| 🎬 初始化末行: dp[${ctx.m}][${j}] = ${ctx.n - j} (word1 到达末尾，需删除 word2 剩余 ${ctx.n - j} 个字符)`,
          msg: `初始化末行：<code>dp[${ctx.m}][${j}] = ${ctx.n - j}</code>（word1 已经处理完毕，需删去 <code>word2</code> 的剩余 <code>${ctx.n - j}</code> 个字符）。`
        });
      }
    }
    return { valAnchorKey: 'init_col', cells };
  }
  protected evaluateCondition(i: number, j: number, ctx: SequenceTableContext): ConditionEvalResult {
    const isForward = ctx.direction !== 'reverse';
    const c1 = isForward ? ctx.s1[i - 1] : ctx.s1[i];
    const c2 = isForward ? ctx.s2[j - 1] : ctx.s2[j];
    const isMatch = c1 === c2;
    const tag = isMatch ? `字符匹配 '${c1}' == '${c2}'` : `字符不匹配 '${c1}' != '${c2}'`;
    const log = isForward
      ? (isMatch
          ? `| 🎯 [顺推] 字符相同 word1[${i - 1}] == word2[${j - 1}] ('${c1}'): 无需删除，直接继承左上角代价`
          : `| 🔀 [顺推] 字符不同 ('${c1}' != '${c2}'): 需衍生删除 word1 或删除 word2 两分支取最小+1`)
      : (isMatch
          ? `| 🎯 [逆推] 字符相同 word1[${i}] == word2[${j}] ('${c1}'): 无需删除，直接继承右下角代价`
          : `| 🔀 [逆推] 字符不同 ('${c1}' != '${c2}'): 需衍生删除 word1 或删除 word2 两分支取最小+1`);
    const msg = isMatch
      ? `字符相同 <code>'${c1}' == '${c2}'</code>：无需删除操作，直接无损继承对角线代价。`
      : `字符不同 <code>'${c1}' != '${c2}'</code>：需在删除 word1 字符或删除 word2 字符中取最小值并 +1。`;
    return { isMatch, char1: c1, char2: c2, tag, log, msg };
  }
  protected computeTransfer(i: number, j: number, cond: ConditionEvalResult, ctx: SequenceTableContext): TransferResult {
    const isForward = ctx.direction !== 'reverse';
    if (isForward) {
      if (cond.isMatch) {
        const val = ctx.dp[i - 1][j - 1] ?? 0;
        return {
          val,
          lineKey: 'transfer_match',
          topI: i - 1,
          topJ: j,
          leftI: i - 1,
          leftJ: j - 1,
          tag: `字符匹配继承 dp[${i - 1}][${j - 1}]=${val}`,
          log: `| 🎯 字符相同: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${val}`,
          msg: `字符相同 <code>'${cond.char1}' == '${cond.char2}'</code>：无损继承左上角 <code>dp[${i - 1}][${j - 1}] = <strong>${val}</strong></code>。`
        };
      } else {
        const del1 = ctx.dp[i - 1][j] ?? 0;
        const del2 = ctx.dp[i][j - 1] ?? 0;
        const val = Math.min(del1, del2) + 1;
        return {
          val,
          lineKey: 'transfer_diff',
          topI: i - 1,
          topJ: j,
          leftI: i,
          leftJ: j - 1,
          tag: `两向最小+1: dp[${i}][${j}]=${val}`,
          log: `| 🔀 字符不同: dp[${i}][${j}] = min(删word1=${del1}, 删word2=${del2}) + 1 = ${val}`,
          msg: `字符不同：<code>min(删word1=${del1}, 删word2=${del2}) + 1 = <strong>${val}</strong></code>。`
        };
      }
    } else {
      if (cond.isMatch) {
        const val = ctx.dp[i + 1][j + 1] ?? 0;
        return {
          val,
          lineKey: 'transfer_match',
          topI: i + 1,
          topJ: j,
          leftI: i + 1,
          leftJ: j + 1,
          tag: `字符匹配继承 dp[${i + 1}][${j + 1}]=${val}`,
          log: `| 🎯 [逆推] 字符相同: dp[${i}][${j}] = dp[${i + 1}][${j + 1}] = ${val}`,
          msg: `字符相同 <code>'${cond.char1}' == '${cond.char2}'</code>：无损继承右下角 <code>dp[${i + 1}][${j + 1}] = <strong>${val}</strong></code>。`
        };
      } else {
        const del1 = ctx.dp[i + 1][j] ?? 0;
        const del2 = ctx.dp[i][j + 1] ?? 0;
        const val = Math.min(del1, del2) + 1;
        return {
          val,
          lineKey: 'transfer_diff',
          topI: i + 1,
          topJ: j,
          leftI: i,
          leftJ: j + 1,
          tag: `逆推两向最小+1: dp[${i}][${j}]=${val}`,
          log: `| 🔀 [逆推] 字符不同: dp[${i}][${j}] = min(删word1=${del1}, 删word2=${del2}) + 1 = ${val}`,
          msg: `字符不同：<code>min(删word1=${del1}, 删word2=${del2}) + 1 = <strong>${val}</strong></code>。`
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
      tag: `最终解 dp[${targetI}][${targetJ}]=${ans}`,
      log: isForward
        ? `| 🏆 填表完成！使 "${ctx.s1}" 与 "${ctx.s2}" 相同所需最少删除步数为 dp[${targetI}][${targetJ}] = ${ans}`
        : `| 🏆 逆推填表完成！使 "${ctx.s1}" 与 "${ctx.s2}" 相同所需最少删除步数为 dp[0][0] = ${ans}`,
      msg: isForward
        ? `🏆 二维填表完成！右下角终点 <code>dp[${targetI}][${targetJ}] = <strong>${ans}</strong></code>。`
        : `🏆 二维逆推填表完成！左上角终点 <code>dp[0][0] = <strong>${ans}</strong></code>。`
    };
  }
}

export function compileDeleteDistanceStage3(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const compiler = new DeleteDistanceTableCompiler();
  return compiler.compile(model, anchorMap || {}, direction);
}

/*

          emitStep({
            type: 'transfer',
            line: lineTransferDiff,
            i,
            j,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `min(删word1,删word2)+1: dp[${i}][${j}]=${dp[i][j]}`,
            log: `| 🔀 字符不同 ('${charS}'!='${charT}'): dp[${i}][${j}] = min(下方删word1=${delWord1}, 右侧删word2=${delWord2}) + 1 = ${dp[i][j]}`,
            msg: `字符不同 <code>'${charS}' != '${charT}'</code>：<code>min(下方=${delWord1}, 右侧=${delWord2}) + 1 = <strong>${dp[i][j]}</strong></code>。`,
            gridHighlight: { i, j },
            dependencies: [
              { r: i + 1, c: j, val: delWord1 },
              { r: i, c: j + 1, val: delWord2 }
            ]
          });
        }
      }
    }

    emitStep({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `最终解 dp[0][0]=${dp[0][0]}`,
      log: `| 🏆 倒序填表完成！从末尾向前寻源最终答案为 dp[0][0] = ${dp[0][0]}`,
      msg: `🏆 二维倒序填表完成！左上角起点目标解 <code>dp[0][0] = <strong>${dp[0][0]}</strong></code>。`,
      gridHighlight: { i: 0, j: 0 }
    });
  }

  // 统一挂载依赖树
  for (const step of steps) {
    step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, isForward ? 'forward' : 'reverse', undefined, step.grid, step.i, step.j);
    step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
  }

  return steps;
}
*/

export function compileDeleteDistanceStage4(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
  const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
  const m = s.length;
  const n = t.length;
  const isForward = direction !== 'reverse';

  const steps: UniversalStep[] = [];
  const memo = new Array(n + 1).fill(0);
  const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

  const lineInit = anchorMap?.init || 4;
  const lineLoopI = anchorMap?.loop_i || 6;
  const linePreInit = anchorMap?.pre_init || 7;
  const lineAssignMatch = anchorMap?.assign_match || 10;
  const lineCalcMin = anchorMap?.calc_min || 12;
  const lineReturn = anchorMap?.return || 16;

  function emitStep(stepData: any): void {
    const isComparing = stepData.type === 'transfer' || stepData.type === 'update';
    const curI = isForward ? (stepData.i ?? 0) : Math.max(0, (stepData.i ?? 1) - 1);
    const curJ = isForward ? (stepData.j ?? 0) : Math.max(0, (stepData.j ?? 1) - 1);

    steps.push({
      s,
      t,
      s1: s,
      s2: t,
      curI,
      curJ,
      label1: 'word1',
      label2: 'word2',
      isComparing,
      ...stepData
    });
  }

  if (isForward) {
    for (let j = 0; j <= n; j++) {
      memo[j] = j;
      gridState[0][j] = j;
    }

    emitStep({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维滚动数组',
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化首行 memo[j] = j`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化首行 <code>memo[j] = j</code>。`
    });

    for (let i = 1; i <= m; i++) {
      let pre = memo[0];
      memo[0] = i;
      gridState[i][0] = i;

      emitStep({
        type: 'init-col',
        line: linePreInit || lineLoopI,
        i,
        j: 0,
        activeSlot: 0,
        slotMode: 'updated',
        memoj: i,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `第${i}行首列置为 ${i}`,
        log: `| 🎬 第 ${i} 行开始: 暂存 pre = ${pre}, 更新 memo[0] = ${i}`,
        msg: `第 <code>${i}</code> 行开始：暂存对角线 <code>pre = ${pre}</code>，更新首列 <code>memo[0] = ${i}</code>。`
      });

      for (let j = 1; j <= n; j++) {
        const temp = memo[j];
        const charS = s[i - 1];
        const charT = t[j - 1];
        const isMatch = charS === charT;

        if (isMatch) {
          memo[j] = pre;
          gridState[i][j] = pre;
          emitStep({
            type: 'transfer',
            line: lineAssignMatch,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: pre,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符匹配继承 pre=${pre}`,
            log: `| 🎯 字符相同 word1[${i-1}]==word2[${j-1}] ('${charS}'): memo[${j}] 直接继承 pre = ${pre}`,
            msg: `字符相同 <code>'${charS}' == '${charT}'</code>：直接继承左上角 <code>pre = <strong>${pre}</strong></code>。`
          });
        } else {
          const minVal = Math.min(memo[j], memo[j - 1]) + 1;
          memo[j] = minVal;
          gridState[i][j] = minVal;

          emitStep({
            type: 'transfer',
            line: lineCalcMin,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: minVal,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `min(上方,左侧)+1=${minVal}`,
            log: `| 🔀 字符不同 ('${charS}'!='${charT}'): memo[${j}] = min(上方=${temp}, 左侧=${memo[j - 1]}) + 1 = ${minVal}`,
            msg: `字符不同 <code>'${charS}' != '${charT}'</code>：<code>min(上方=${temp}, 左侧=${memo[j - 1]}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
        pre = temp;
      }
    }

    emitStep({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      activeSlot: n,
      slotMode: 'resolved',
      memoj: memo[n],
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: `最终解 memo[${n}]=${memo[n]}`,
      log: `| 🏆 一维压缩填表完成！最终删除步数 = ${memo[n]}`,
      msg: `🏆 一维滚动压缩完成！终点 <code>memo[${n}] = <strong>${memo[n]}</strong></code>。`
    });
  } else {
    for (let j = 0; j <= n; j++) {
      memo[j] = n - j;
      gridState[m][j] = n - j;
    }

    emitStep({
      type: 'init',
      line: lineInit,
      i: m,
      j: n,
      activeSlot: n,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化一维滚动数组 (倒序)',
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化末行 memo[j] = n - j`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化末行 <code>memo[j] = n - j</code>。`
    });

    for (let i = m - 1; i >= 0; i--) {
      let pre = memo[n];
      memo[n] = m - i;
      gridState[i][n] = m - i;

      emitStep({
        type: 'init-col',
        line: linePreInit || lineLoopI,
        i,
        j: n,
        activeSlot: n,
        slotMode: 'updated',
        memoj: m - i,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `第${i}行末列置为 ${m - i}`,
        log: `| 🎬 倒序第 ${i} 行开始: 暂存 pre = ${pre}, 更新 memo[${n}] = ${m - i}`,
        msg: `倒序第 <code>${i}</code> 行开始：暂存右下角 <code>pre = ${pre}</code>，更新末列 <code>memo[${n}] = ${m - i}</code>。`
      });

      for (let j = n - 1; j >= 0; j--) {
        const temp = memo[j];
        const charS = s[i];
        const charT = t[j];
        const isMatch = charS === charT;

        if (isMatch) {
          memo[j] = pre;
          gridState[i][j] = pre;
          emitStep({
            type: 'transfer',
            line: lineAssignMatch,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: pre,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符匹配继承 pre=${pre}`,
            log: `| 🎯 字符相同 word1[${i}]==word2[${j}] ('${charS}'): memo[${j}] 直接继承 pre = ${pre}`,
            msg: `字符相同 <code>'${charS}' == '${charT}'</code>：直接继承右下角 <code>pre = <strong>${pre}</strong></code>。`
          });
        } else {
          const minVal = Math.min(memo[j], memo[j + 1]) + 1;
          memo[j] = minVal;
          gridState[i][j] = minVal;

          emitStep({
            type: 'transfer',
            line: lineCalcMin,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            memoj: minVal,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `min(下方,右侧)+1=${minVal}`,
            log: `| 🔀 字符不同 ('${charS}'!='${charT}'): memo[${j}] = min(下方=${temp}, 右侧=${memo[j + 1]}) + 1 = ${minVal}`,
            msg: `字符不同 <code>'${charS}' != '${charT}'</code>：<code>min(下方=${temp}, 右侧=${memo[j + 1]}) + 1 = <strong>${minVal}</strong></code>。`
          });
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
      slotMode: 'resolved',
      memoj: memo[0],
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: `最终解 memo[0]=${memo[0]}`,
      log: `| 🏆 一维倒序压缩填表完成！最终删除步数 = ${memo[0]}`,
      msg: `🏆 一维滚动倒序压缩完成！起点 <code>memo[0] = <strong>${memo[0]}</strong></code>。`
    });
  }

  return steps;
}
