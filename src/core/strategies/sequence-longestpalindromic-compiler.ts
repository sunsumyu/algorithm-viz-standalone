import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree } from './strategy-helpers';
import {
  AbstractIntervalTableCompiler,
  type IntervalTableContext,
  type IntervalConditionEvalResult,
  type IntervalTransferResult,
  type IntervalReturnInfo
} from './abstract-interval-table-compiler';


export function compileLongestPalindromicStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'bbbab') as string;
    const n = s.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let callCount = 0;
    const MAX_RECORDED_CALLS = 100;

    const lineMainEntry = anchorMap?.entry || 1;
    const lineMemoInit = anchorMap?.memo_init || 3;
    const lineCallDfs = anchorMap?.call_dfs || (isMemo ? 4 : 2);
    const lineDfsEntry = anchorMap?.dfs_entry || (isMemo ? 6 : 4);
    const lineBoundaryCross = anchorMap?.boundary_cross || (isMemo ? 7 : 5);
    const lineBoundarySingle = anchorMap?.boundary_single || (isMemo ? 8 : 6);
    const lineCacheHit = anchorMap?.cache_hit || (isMemo ? 9 : 7);
    const lineMatch = anchorMap?.match || (isMemo ? 10 : 7);
    const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 11 : 8);
    const lineBranchLeft = anchorMap?.branch_left || anchorMap?.diff || (isMemo ? 13 : 10);
    const lineBranchRight = anchorMap?.branch_right || (isMemo ? 14 : 11);
    const lineCombine = anchorMap?.combine || (isMemo ? 16 : 13);
    const lineReturn = anchorMap?.return || lineMainEntry;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: n - 1,
      val: `dfs(0, ${n - 1})`,
      status: 'current',
      children: []
    };

    // Step 0: 主函数入口帧 (生命周期闭环不变量)
    generated.push({
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
      generated.push({
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

    generated.push({
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

    function dfs(i: number, j: number, currentTreeNode?: UniversalTreeNode): number {
      callCount++;
      const shouldRecord = isMemo || callCount <= MAX_RECORDED_CALLS;
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);
      if (currentTreeNode) currentTreeNode.status = 'current';

      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'entry',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDfsEntry,
          tag: `dfs(${i}, ${j})`,
          log: `| 📥 进入 dfs(i=${i}, j=${j}) [子串="${s.slice(i, j + 1)}"]`,
          msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，求解子串 <code>s[${i}..${j}] "${s.slice(i, j + 1)}"</code> 的最长回文子序列长度。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      if (i > j) {
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = '= 0 (空区间)';
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundaryCross,
            tag: 'Base Case i > j (空区间)',
            log: `| 🎬 满足 Base Case: i > j (i=${i}, j=${j}) 为空区间，返回 0`,
            msg: `🎬 满足 <code>i > j</code>：区间交叉为空，返回 <strong>0</strong>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return 0;
      }

      if (i === j) {
        gridState[i][i] = 1;
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = '= 1 (单字符)';
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundarySingle,
            tag: `Base Case i=j (单字符 '${s[i]}')`,
            log: `| 🎬 满足 Base Case: i == j == ${i}，单字符 '${s[i]}' 自身为回文，返回 1`,
            msg: `🎬 满足 <code>i == j == ${i}</code>：单字符 <code>'${s[i]}'</code> 本身构成长度为 1 的回文，返回 <strong>1</strong>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return 1;
      }

      if (isMemo && memoCache[key] !== undefined) {
        if (currentTreeNode) {
          currentTreeNode.status = 'pruned';
          currentTreeNode.tag = `⚡=${memoCache[key]}`;
        }

        generated.push({
          type: 'cache-hit',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接 O(1) 返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode?.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      const isMatch = s[i] === s[j];
      let res = 0;

      if (isMatch) {
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'match-branch',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineMatch,
            tag: `两端相同 '${s[i]}'`,
            log: `| 🔀 两端字符相同 s[${i}] == s[${j}] ('${s[i]}')，贡献长度 +2，深入 dfs(${i + 1}, ${j - 1})`,
            msg: `🔀 两端字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>，贡献回文长度 2，进入 <code>dfs(${i + 1}, ${j - 1})</code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }

        let childNode: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childNode = {
            id: `node-${++nodeIdCounter}`,
            r: i + 1,
            c: j - 1,
            val: `dfs(${i + 1},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childNode);
        }
        res = dfs(i + 1, j - 1, childNode) + 2;

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `= ${res}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'update',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineMatchBranch,
            tag: '端点匹配 +2 结果',
            log: `| ✨ 端点匹配更新: dfs(${i}, ${j}) = dfs(${i + 1}, ${j - 1}) + 2 = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 端点匹配结果：<code>dfs(${i}, ${j}) = dfs(${i + 1}, ${j - 1}) + 2 = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
      } else {
        // 分支 1: 舍弃左端 s[i] -> dfs(i+1, j)
        let childLeft: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childLeft = {
            id: `node-${++nodeIdCounter}`,
            r: i + 1,
            c: j,
            val: `dfs(${i + 1},${j})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childLeft);

          generated.push({
            type: 'diff-branch-left',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBranchLeft,
            tag: `舍弃左端 s[${i}]('${s[i]}')`,
            log: `| ⏩ 端点不同 s[${i}]('${s[i]}') != s[${j}]('${s[j]}')，分支 1：舍弃左端，深入探索 dfs(${i + 1}, ${j})`,
            msg: `⏩ 端点不同 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>，分支 1：尝试舍弃左端字符 <code>s[${i}]</code>，计算 <code>skipLeft = dfs(${i + 1}, ${j})</code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        const valLeft = dfs(i + 1, j, childLeft);

        // 分支 2: 舍弃右端 s[j] -> dfs(i, j-1)
        let childRight: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childRight = {
            id: `node-${++nodeIdCounter}`,
            r: i,
            c: j - 1,
            val: `dfs(${i},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childRight);

          generated.push({
            type: 'diff-branch-right',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBranchRight,
            tag: `舍弃右端 s[${j}]('${s[j]}')`,
            log: `| ⏩ 端点不同，分支 2：舍弃右端，深入探索 dfs(${i}, ${j - 1})`,
            msg: `⏩ 端点不同，分支 2：尝试舍弃右端字符 <code>s[${j}] ('${s[j]}')</code>，计算 <code>skipRight = dfs(${i}, ${j - 1})</code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        const valRight = dfs(i, j - 1, childRight);

        res = Math.max(valLeft, valRight);

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        if (currentTreeNode) {
          currentTreeNode.status = 'visited';
          currentTreeNode.tag = `= ${res}`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'update',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineCombine,
            tag: '取舍弃左右较大值',
            log: `| ✨ 合并分支: dfs(${i}, ${j}) = max(舍左=${valLeft}, 舍右=${valRight}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 汇总分支决策：<code>max(舍左=${valLeft}, 舍右=${valRight}) = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(0, n - 1, rootNode);

    generated.push({
      type: 'return',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 最长回文子序列演化完成！longestPalindromeSubseq("${s}") = ${total}`,
      msg: `🏆 演化计算完成！字符串 <code>"${s}"</code> 的最长回文子序列长度为 <strong>${total}</strong>。`,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
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

