import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

/**
 * 序列与字符串 DP 算法步骤矩阵编译器深模块 (SequenceStepMatrixCompiler Deep Module)
 * 遵循编译流水线模式 (Compiler Pipeline Pattern) 与策略辅助内聚原则：
 * 封装 5 大序列与回文 DP (Delete Distance, Edit Distance, Distinct Subsequences, Longest Palindromic Subseq, Palindromic Substrings)
 * 的 4 阶段完整步骤推演与图元标注
 */
export class SequenceStepMatrixCompiler {
  /* =========================================================================
   * 1. 两个字符串的删除操作 (Delete Operation for Two Strings)
   * ========================================================================= */

  public static compileDeleteDistanceStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
    const m = s.length;
    const n = t.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineBoundaryWord1 = anchorMap?.boundary_word1 || (isMemo ? 8 : 6);
    const lineBoundaryWord2 = anchorMap?.boundary_word2 || (isMemo ? 9 : 7);
    const lineCacheHit = anchorMap?.cache_hit || 10;
    const lineMatch = anchorMap?.match || (isMemo ? 11 : 8);
    const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 12 : 9);
    const lineCombine = anchorMap?.combine || (isMemo ? 14 : 12);
    const lineReturn = isMemo ? 4 : 3;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: m,
      c: n,
      val: `dfs(${m},${n})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, j: number, currentTreeNode: UniversalTreeNode): number {
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);
      currentTreeNode.status = 'current';

      generated.push({
        type: 'entry',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineEntry,
        tag: `dfs(${i}, ${j})`,
        log: `| 📥 进入 dfs(i=${i}, j=${j}) [s前缀="${s.slice(0, i)}", t前缀="${t.slice(0, j)}"]`,
        msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，求解使 <code>word1[0..${i - 1}]</code> 与 <code>word2[0..${j - 1}]</code> 相同所需最少删除步数。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode.id,
        treeRoot: cloneTree(rootNode)
      });

      if (i === 0) {
        gridState[0][j] = j;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = `= ${j} (删去t全部)`;

        generated.push({
          type: 'boundary',
          i: 0,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryWord1,
          tag: `Base Case i=0 需删${j}步`,
          log: `| 🏆 【Base Case 达成】i=0: word1 为空，需删去 word2 剩余全部 ${j} 个字符，return ${j}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>i = 0</code>（word1 为空）：需删除 word2 剩余全部 <code>${j}</code> 个字符，返回 <strong>${j}</strong>。`,
          gridHighlight: { i: 0, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return j;
      }

      if (j === 0) {
        gridState[i][0] = i;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = `= ${i} (删去s全部)`;

        generated.push({
          type: 'boundary',
          i,
          j: 0,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryWord2,
          tag: `Base Case j=0 需删${i}步`,
          log: `| 🏆 【Base Case 达成】j=0: word2 为空，需删去 word1 剩余全部 ${i} 个字符，return ${i}`,
          msg: `🏆 <strong>【Base Case 达成】</strong><code>j = 0</code>（word2 为空）：需删除 word1 剩余全部 <code>${i}</code> 个字符，返回 <strong>${i}</strong>。`,
          gridHighlight: { i, j: 0 },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return i;
      }

      if (isMemo && memoCache[key] !== undefined) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `⚡=${memoCache[key]}`;

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
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      memoCache[key] = (memoCache[key] || 0) + 1;

      const isMatch = s[i - 1] === t[j - 1];
      let res = 0;

      if (isMatch) {
        generated.push({
          type: 'match-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatch,
          tag: `字符相同 '${s[i - 1]}'`,
          log: `| 🔀 末尾字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}')，无需删除，直接转移至 dfs(${i - 1}, ${j - 1})`,
          msg: `🔀 末尾字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>，无需消耗删除步数，直接进入 <code>dfs(${i - 1}, ${j - 1})</code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });

        const childNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j - 1,
          val: `dfs(${i - 1},${j - 1})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode);
        res = dfs(i - 1, j - 1, childNode);

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatchBranch,
          tag: '字符相同直接继承',
          log: `| ✨ 字符相同结果: dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 字符相同继承结果：<code>dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      } else {
        generated.push({
          type: 'diff-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatch,
          tag: `字符不同 ('${s[i - 1]}' != '${t[j - 1]}')`,
          log: `| ⏩ 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}')，尝试删 word1[${i - 1}] 与删 word2[${j - 1}] 两分支`,
          msg: `⏩ 字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>，分别尝试删除 <code>word1[${i - 1}]</code> 或 <code>word2[${j - 1}]</code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });

        // 分支 1: 删 word1[i-1] -> dfs(i-1, j)
        const childNode1: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j,
          val: `dfs(${i - 1},${j})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode1);
        const valDel1 = dfs(i - 1, j, childNode1);

        // 分支 2: 删 word2[j-1] -> dfs(i, j-1)
        const childNode2: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i,
          c: j - 1,
          val: `dfs(${i},${j - 1})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode2);
        const valDel2 = dfs(i, j - 1, childNode2);

        res = Math.min(valDel1, valDel2) + 1;

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: '取较小删除代价+1',
          log: `| ✨ 合并分支: dfs(${i}, ${j}) = min(删word1=${valDel1}, 删word2=${valDel2}) + 1 = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 汇总删除代价：<code>min(删word1=${valDel1}, 删word2=${valDel2}) + 1 = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(m, n, rootNode);

    generated.push({
      type: 'return',
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 两个字符串的删除操作计算完成！minDistance("${s}", "${t}") = ${total}`,
      msg: `🏆 演化计算完成！使 <code>word1 = "${s}"</code> 与 <code>word2 = "${t}"</code> 相同所需最少删除步数为 <strong>${total}</strong>。`,
      gridHighlight: { i: m, j: n },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

  public static compileDeleteDistanceStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitCol = anchorMap?.init_col || 5;
    const lineInitRow = anchorMap?.init_row || 6;
    const lineTransferMatch = anchorMap?.transfer_match || 10;
    const lineTransferDiff = anchorMap?.transfer_diff || 12;
    const lineReturn = anchorMap?.return || 16;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表格',
      log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格`,
      msg: `创建 <code>${m + 1}×${n + 1}</code> 的二维 DP 表格，行对应 <code>word1[0..${m - 1}]</code>，列对应 <code>word2[0..${n - 1}]</code>。`
    });

    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      steps.push({
        type: 'init-col',
        line: lineInitCol,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[${i}][0]=${i}`,
        log: `| 🎬 初始化首列: dp[${i}][0] = ${i} (word2 为空串，需删除 word1 全部 ${i} 个字符)`,
        msg: `初始化首列：<code>dp[${i}][0] = ${i}</code>（word2 为空时，需删去 <code>word1</code> 的全部 <code>${i}</code> 个字符）。`
      });
    }

    for (let j = 1; j <= n; j++) {
      dp[0][j] = j;
      steps.push({
        type: 'init-row',
        line: lineInitRow,
        i: 0,
        j,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[0][${j}]=${j}`,
        log: `| 🎬 初始化首行: dp[0][${j}] = ${j} (word1 为空串，需删除 word2 全部 ${j} 个字符)`,
        msg: `初始化首行：<code>dp[0][${j}] = ${j}</code>（word1 为空时，需删去 <code>word2</code> 的全部 <code>${j}</code> 个字符）。`
      });
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          const fromMatch = dp[i - 1][j - 1] ?? 0;
          dp[i][j] = fromMatch;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i - 1,
            topJ: j - 1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符相同 '${s[i - 1]}': 继承左上角`,
            log: `| 🔄 字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${fromMatch}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：无需额外删除，<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = <strong>${fromMatch}</strong></code>。`
          });
        } else {
          const fromTop = dp[i - 1][j] ?? 0;
          const fromLeft = dp[i][j - 1] ?? 0;
          const minVal = Math.min(fromTop, fromLeft) + 1;
          dp[i][j] = minVal;

          steps.push({
            type: 'transfer',
            line: lineTransferDiff,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符不同: min(上, 左) + 1`,
            log: `| 🔄 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): dp[${i}][${j}] = min(上=${fromTop}, 左=${fromLeft}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>dp[${i}][${j}] = min(上 ${fromTop}, 左 ${fromLeft}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 填表计算完成！最少删除步数 dp[${m}][${n}] = ${dp[m][n]}`,
      msg: `🏆 二维填表全部完成！使得 <code>"${s}"</code> 与 <code>"${t}"</code> 相同所需的最少删除字符步数为: <strong>${dp[m][n]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  public static compileDeleteDistanceStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'sea') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'eat') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n + 1).fill(0);
    const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineLoopI = anchorMap?.loop_i || 6;
    const lineAssignMatch = anchorMap?.assign_match || 12;
    const lineCalcMin = anchorMap?.calc_min || 14;
    const lineReturn = anchorMap?.return || 19;

    for (let j = 0; j <= n; j++) {
      memo[j] = j;
      gridState[0][j] = j;
    }

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
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化首行 memo[j] = j`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化首行 <code>memo[j] = j</code>。`
    });

    for (let i = 1; i <= m; i++) {
      let pre = memo[0];
      memo[0] = i;
      gridState[i][0] = i;

      steps.push({
        type: 'init-col',
        line: lineLoopI,
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
        msg: `第 <code>${i}</code> 行开始：暂存左上角 <code>pre = ${pre}</code>，更新首列 <code>memo[0] = ${i}</code>。`
      });

      for (let j = 1; j <= n; j++) {
        const temp = memo[j];
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          memo[j] = pre;
          gridState[i][j] = pre;

          steps.push({
            type: 'accumulate',
            line: lineAssignMatch,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: temp,
            right: pre,
            memoj: pre,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符相同: memo[${j}] = pre(${pre})`,
            log: `| ✨ word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): 直接继承左上角 pre = ${pre}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：直接继承左上角 <code>memo[${j}] = pre = <strong>${pre}</strong></code>。`
          });
        } else {
          const downVal = memo[j];
          const leftVal = memo[j - 1];
          const minVal = Math.min(downVal, leftVal) + 1;
          memo[j] = minVal;
          gridState[i][j] = minVal;

          steps.push({
            type: 'accumulate',
            line: lineCalcMin,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: leftVal,
            memoj: minVal,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符不同: min(上, 左) + 1 = ${minVal}`,
            log: `| ✨ word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): memo[${j}] = min(上=${downVal}, 左=${leftVal}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>memo[${j}] = min(上 ${downVal}, 左 ${leftVal}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
        pre = temp;
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
      log: `| 🏆 一维滚动空间优化完成！最终答案 memo[${n}] = ${memo[n]}`,
      msg: `🏆 一维滚动压缩计算完成！使得 <code>"${s}"</code> 与 <code>"${t}"</code> 相同所需的最少删除步数: <strong>${memo[n]}</strong>。`
    });

    return steps;
  }

  /* =========================================================================
   * 2. 编辑距离 (Edit Distance)
   * ========================================================================= */

  public static compileEditDistanceStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'horse') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'ros') as string;
    const m = s.length;
    const n = t.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineBoundaryWord1 = anchorMap?.boundary_word1 || (isMemo ? 8 : 6);
    const lineBoundaryWord2 = anchorMap?.boundary_word2 || (isMemo ? 9 : 7);
    const lineCacheHit = anchorMap?.cache_hit || 10;
    const lineMatch = anchorMap?.match || (isMemo ? 11 : 8);
    const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 12 : 9);
    const lineDiff = anchorMap?.diff || (isMemo ? 14 : 11);
    const lineCombine = anchorMap?.combine || (isMemo ? 18 : 17);
    const lineReturn = isMemo ? 4 : 3;

    let callCount = 0;
    const MAX_RECORDED_CALLS = 100;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: m,
      c: n,
      val: `dfs(${m},${n})`,
      status: 'current',
      children: []
    };

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
          line: lineEntry,
          tag: `dfs(${i}, ${j})`,
          log: `| 📥 进入 dfs(i=${i}, j=${j}) [s前缀="${s.slice(0, i)}", t前缀="${t.slice(0, j)}"]`,
          msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，求解将 <code>word1[0..${i - 1}]</code> 转换成 <code>word2[0..${j - 1}]</code> 所需最少操作数。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      if (i === 0) {
        gridState[0][j] = j;
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = `= ${j} (插入全部t)`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i: 0,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundaryWord1,
            tag: `Base Case i=0 需插入${j}次`,
            log: `| 🏆 【Base Case 达成】i=0: word1 为空，需插入 word2 剩余全部 ${j} 个字符，return ${j}`,
            msg: `🏆 <strong>【Base Case 达成】</strong><code>i = 0</code>（word1 为空）：需插入 word2 剩余全部 <code>${j}</code> 个字符，返回 <strong>${j}</strong>。`,
            gridHighlight: { i: 0, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return j;
      }

      if (j === 0) {
        gridState[i][0] = i;
        if (currentTreeNode) {
          currentTreeNode.status = 'base';
          currentTreeNode.tag = `= ${i} (删除全部s)`;
        }

        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'boundary',
            i,
            j: 0,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineBoundaryWord2,
            tag: `Base Case j=0 需删除${i}次`,
            log: `| 🏆 【Base Case 达成】j=0: word2 为空，需删除 word1 剩余全部 ${i} 个字符，return ${i}`,
            msg: `🏆 <strong>【Base Case 达成】</strong><code>j = 0</code>（word2 为空）：需删除 word1 剩余全部 <code>${i}</code> 个字符，返回 <strong>${i}</strong>。`,
            gridHighlight: { i, j: 0 },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
        activeStack.pop();
        return i;
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

      memoCache[key] = (memoCache[key] || 0) + 1;

      const isMatch = s[i - 1] === t[j - 1];
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
            tag: `字符相同 '${s[i - 1]}'`,
            log: `| 🔀 末尾字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}')，无需编辑，直接转移至 dfs(${i - 1}, ${j - 1})`,
            msg: `🔀 末尾字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>，无需消耗编辑步数，直接进入 <code>dfs(${i - 1}, ${j - 1})</code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }

        let childNode: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childNode = {
            id: `node-${++nodeIdCounter}`,
            r: i - 1,
            c: j - 1,
            val: `dfs(${i - 1},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childNode);
        }
        res = dfs(i - 1, j - 1, childNode);

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
            tag: '字符相同直接继承',
            log: `| ✨ 字符相同结果: dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 字符相同继承结果：<code>dfs(${i}, ${j}) = dfs(${i - 1}, ${j - 1}) = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
      } else {
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'diff-branch',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineDiff,
            tag: `字符不同 ('${s[i - 1]}' != '${t[j - 1]}')`,
            log: `| ⏩ 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}')，探索替换、删除、插入三向决策`,
            msg: `⏩ 字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>，分别探索替换、删除、插入三种分支。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }

        // 决策 1: 替换 -> dfs(i-1, j-1)
        let childReplace: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childReplace = {
            id: `node-${++nodeIdCounter}`,
            r: i - 1,
            c: j - 1,
            val: `dfs(${i - 1},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childReplace);
        }
        const valReplace = dfs(i - 1, j - 1, childReplace);

        // 决策 2: 删除 -> dfs(i-1, j)
        let childDelete: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childDelete = {
            id: `node-${++nodeIdCounter}`,
            r: i - 1,
            c: j,
            val: `dfs(${i - 1},${j})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childDelete);
        }
        const valDelete = dfs(i - 1, j, childDelete);

        // 决策 3: 插入 -> dfs(i, j-1)
        let childInsert: UniversalTreeNode | undefined;
        if (shouldRecord && currentTreeNode) {
          childInsert = {
            id: `node-${++nodeIdCounter}`,
            r: i,
            c: j - 1,
            val: `dfs(${i},${j - 1})`,
            status: 'normal',
            children: []
          };
          currentTreeNode.children.push(childInsert);
        }
        const valInsert = dfs(i, j - 1, childInsert);

        res = Math.min(valReplace, Math.min(valDelete, valInsert)) + 1;

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
            tag: '取三向最小代价+1',
            log: `| ✨ 合并三向分支: dfs(${i}, ${j}) = min(替换=${valReplace}, 删除=${valDelete}, 插入=${valInsert}) + 1 = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
            msg: `✨ 汇总三向编辑代价：<code>min(替换=${valReplace}, 删除=${valDelete}, 插入=${valInsert}) + 1 = <strong>${res}</strong></code>。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(m, n, rootNode);

    generated.push({
      type: 'return',
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 编辑距离演化计算完成！minDistance("${s}", "${t}") = ${total}`,
      msg: `🏆 演化计算完成！将 <code>word1 = "${s}"</code> 转换成 <code>word2 = "${t}"</code> 所需最少操作数为 <strong>${total}</strong>。`,
      gridHighlight: { i: m, j: n },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

  public static compileEditDistanceStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'horse') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'ros') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitCol = anchorMap?.init_col || 5;
    const lineInitRow = anchorMap?.init_row || 6;
    const lineTransferMatch = anchorMap?.transfer_match || 10;
    const lineTransferDiff = anchorMap?.transfer_diff || 12;
    const lineReturn = anchorMap?.return || 16;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表格',
      log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格`,
      msg: `创建 <code>${m + 1}×${n + 1}</code> 的二维 DP 表格，行对应 <code>word1[0..${m - 1}]</code>，列对应 <code>word2[0..${n - 1}]</code>。`
    });

    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
      steps.push({
        type: 'init-col',
        line: lineInitCol,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[${i}][0]=${i}`,
        log: `| 🎬 初始化首列: dp[${i}][0] = ${i} (word2 为空串，需删除 word1 全部 ${i} 个字符)`,
        msg: `初始化首列：<code>dp[${i}][0] = ${i}</code>（word2 为空时，需删去 <code>word1</code> 的全部 <code>${i}</code> 个字符）。`
      });
    }

    for (let j = 1; j <= n; j++) {
      dp[0][j] = j;
      steps.push({
        type: 'init-row',
        line: lineInitRow,
        i: 0,
        j,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[0][${j}]=${j}`,
        log: `| 🎬 初始化首行: dp[0][${j}] = ${j} (word1 为空串，需插入 word2 全部 ${j} 个字符)`,
        msg: `初始化首行：<code>dp[0][${j}] = ${j}</code>（word1 为空时，需插入 <code>word2</code> 的全部 <code>${j}</code> 个字符）。`
      });
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          const fromMatch = dp[i - 1][j - 1] ?? 0;
          dp[i][j] = fromMatch;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i - 1,
            topJ: j - 1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符相同 '${s[i - 1]}': 继承对角线`,
            log: `| 🔄 字符相同 word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${fromMatch}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：无需额外编辑，<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = <strong>${fromMatch}</strong></code>。`
          });
        } else {
          const fromRep = dp[i - 1][j - 1] ?? 0;
          const fromDel = dp[i - 1][j] ?? 0;
          const fromIns = dp[i][j - 1] ?? 0;
          const minVal = Math.min(fromRep, Math.min(fromDel, fromIns)) + 1;
          dp[i][j] = minVal;

          steps.push({
            type: 'transfer',
            line: lineTransferDiff,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `字符不同: min(替换, 删除, 插入) + 1`,
            log: `| 🔄 字符不同 word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): dp[${i}][${j}] = min(替换=${fromRep}, 删=${fromDel}, 插=${fromIns}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>dp[${i}][${j}] = min(替换 ${fromRep}, 删除 ${fromDel}, 插入 ${fromIns}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 填表计算完成！最少编辑步数 dp[${m}][${n}] = ${dp[m][n]}`,
      msg: `🏆 二维填表全部完成！将 <code>"${s}"</code> 转换成 <code>"${t}"</code> 所需的最少编辑操作数为: <strong>${dp[m][n]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  public static compileEditDistanceStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.word1 || (model.defaultParams as any)?.s || 'horse') as string;
    const t = ((model.defaultParams as any)?.word2 || (model.defaultParams as any)?.t || 'ros') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n + 1).fill(0);
    const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineLoopI = anchorMap?.loop_i || 6;
    const linePreInit = anchorMap?.pre_init || 7;
    const lineAssignMatch = anchorMap?.assign_match || 12;
    const lineCalcMin = anchorMap?.calc_min || 14;
    const lineReturn = anchorMap?.return || 19;

    for (let j = 0; j <= n; j++) {
      memo[j] = j;
      gridState[0][j] = j;
    }

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
      log: `| 📦 创建长度为 ${n + 1} 的一维滚动数组 memo[0..${n}], 初始化首行 memo[j] = j`,
      msg: `创建长度为 <code>${n + 1}</code> 的一维滚动状态数组 <code>memo[0..${n}]</code>，初始化首行 <code>memo[j] = j</code>。`
    });

    for (let i = 1; i <= m; i++) {
      let pre = memo[0];
      memo[0] = i;
      gridState[i][0] = i;

      steps.push({
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
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          memo[j] = pre;
          gridState[i][j] = pre;

          steps.push({
            type: 'accumulate',
            line: lineAssignMatch,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: temp,
            right: pre,
            memoj: pre,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符相同: memo[${j}] = pre(${pre})`,
            log: `| ✨ word1[${i - 1}] == word2[${j - 1}] ('${s[i - 1]}'): 直接继承对角线 pre = ${pre}`,
            msg: `字符相同 <code>word1[${i - 1}] == word2[${j - 1}] == '${s[i - 1]}'</code>：直接继承对角线 <code>memo[${j}] = pre = <strong>${pre}</strong></code>。`
          });
        } else {
          const downVal = memo[j];
          const leftVal = memo[j - 1];
          const repVal = pre;
          const minVal = Math.min(repVal, Math.min(downVal, leftVal)) + 1;
          memo[j] = minVal;
          gridState[i][j] = minVal;

          steps.push({
            type: 'accumulate',
            line: lineCalcMin,
            i,
            j,
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: leftVal,
            memoj: minVal,
            memo: [...memo],
            memoSnapshot: [...memo],
            grid: JSON.parse(JSON.stringify(gridState)),
            tag: `字符不同: min(替换, 删除, 插入) + 1 = ${minVal}`,
            log: `| ✨ word1[${i - 1}]('${s[i - 1]}') != word2[${j - 1}]('${t[j - 1]}'): memo[${j}] = min(替=${repVal}, 删=${downVal}, 插=${leftVal}) + 1 = ${minVal}`,
            msg: `字符不同 <code>word1[${i - 1}] ('${s[i - 1]}') != word2[${j - 1}] ('${t[j - 1]}')</code>：<code>memo[${j}] = min(替换 ${repVal}, 删除 ${downVal}, 插入 ${leftVal}) + 1 = <strong>${minVal}</strong></code>。`
          });
        }
        pre = temp;
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
      log: `| 🏆 编辑距离一维滚动空间优化完成！最终答案 memo[${n}] = ${memo[n]}`,
      msg: `🏆 一维滚动压缩计算完成！将 <code>"${s}"</code> 转换成 <code>"${t}"</code> 所需最少操作数: <strong>${memo[n]}</strong>。`
    });

    return steps;
  }

  /* =========================================================================
   * 3. 不同的子序列 (Distinct Subsequences)
   * ========================================================================= */

  public static compileDistinctSubsequencesStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
    const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
    const m = s.length;
    const n = t.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, number> = {};
    const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let callCount = 0;
    let nodeIdCounter = 0;

    const lineEntry = anchorMap?.entry || (isMemo ? 3 : 3);
    const lineBoundaryTarget = anchorMap?.boundary_target || (isMemo ? 9 : 8);
    const lineBoundarySource = anchorMap?.boundary_source || (isMemo ? 11 : 10);
    const lineCacheHit = anchorMap?.cache_hit || 13;
    const lineMatch = anchorMap?.match || (isMemo ? 17 : 13);
    const lineCombine = anchorMap?.combine || (isMemo ? 19 : 15);
    const lineSkip = anchorMap?.skip || (isMemo ? 22 : 18);
    const lineReturn = anchorMap?.return || 4;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: m,
      c: n,
      val: `dfs(${m},${n})`,
      status: 'current',
      children: []
    };

    function dfs(i: number, j: number, currentTreeNode: UniversalTreeNode): number {
      callCount++;
      const key = `${i},${j}`;
      const isRepeated = !isMemo && memoCache[key] !== undefined;

      activeStack.push(key);
      visitedCells.add(key);

      currentTreeNode.status = 'current';
      if (isRepeated) {
        currentTreeNode.tag = '⚠️重复';
      }

      generated.push({
        type: 'dfs-call',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineEntry,
        tag: `DFS #${callCount} (i=${i}, j=${j})`,
        log: `| 📥 进入 dfs(i=${i}, j=${j}) [s前缀="${s.slice(0, i)}", t前缀="${t.slice(0, j)}"]`,
        msg: `📥 进入 <code>dfs(i=${i}, j=${j})</code>：求解 <code>s[0..${i - 1}]</code> 中匹配 <code>t[0..${j - 1}]</code> 的不同子序列数。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode.id,
        treeRoot: cloneTree(rootNode)
      });

      if (j === 0) {
        gridState[i][0] = 1;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = '= 1 (匹配成功)';

        generated.push({
          type: 'boundary',
          i,
          j: 0,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryTarget,
          tag: 'Base Case (t为空)',
          log: `| 🎬 满足 Base Case (j=0): 目标串 t 为空，成功构造 1 种方案，返回 1`,
          msg: `🎬 满足 <code>j=0</code>：目标串已全部匹配完毕，成功寻得 1 种有效子序列方案，返回 <strong>1</strong>。`,
          gridHighlight: { i, j: 0 },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return 1;
      }

      if (i === 0) {
        gridState[0][j] = 0;
        currentTreeNode.status = 'base';
        currentTreeNode.tag = '= 0 (s耗尽)';

        generated.push({
          type: 'boundary',
          i: 0,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundarySource,
          tag: 'Base Case (s耗尽)',
          log: `| 🎬 满足 Base Case (i=0): 源串 s 已耗尽但 t 仍有剩余，方案数为 0`,
          msg: `🎬 满足 <code>i=0</code>：源串 <code>s</code> 字符已耗尽，无法凑齐目标串 <code>t</code>，返回 <strong>0</strong>。`,
          gridHighlight: { i: 0, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return 0;
      }

      if (isMemo && memoCache[key] !== undefined) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `⚡=${memoCache[key]}`;

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
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      memoCache[key] = (memoCache[key] || 0) + 1;

      const isMatch = s[i - 1] === t[j - 1];
      let res = 0;

      if (isMatch) {
        generated.push({
          type: 'match-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineMatch,
          tag: `末尾匹配 '${s[i - 1]}'`,
          log: `| 🔀 字符匹配 s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}')，探索 [匹配] 与 [跳过] 两分支`,
          msg: `🔀 字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>，可选择使用 <code>s[${i - 1}]</code> 匹配或跳过。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });

        const childNode1: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j - 1,
          val: `dfs(${i - 1},${j - 1})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode1);
        const valMatch = dfs(i - 1, j - 1, childNode1);

        const childNode2: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j,
          val: `dfs(${i - 1},${j})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode2);
        const valSkip = dfs(i - 1, j, childNode2);

        res = valMatch + valSkip;

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCombine,
          tag: '合并匹配与跳过方案',
          log: `| ✨ 合并分支: dfs(${i}, ${j}) = 匹配(${valMatch}) + 跳过(${valSkip}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 汇总分支决策：<code>使用 s[${i - 1}] 匹配 (${valMatch}) + 跳过 s[${i - 1}] (${valSkip}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      } else {
        generated.push({
          type: 'skip-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineSkip,
          tag: `不匹配跳过 '${s[i - 1]}'`,
          log: `| ⏩ 字符不匹配 s[${i - 1}]('${s[i - 1]}') != t[${j - 1}]('${t[j - 1]}')，只能跳过 s[${i - 1}]`,
          msg: `⏩ 字符不匹配 <code>s[${i - 1}] ('${s[i - 1]}') != t[${j - 1}] ('${t[j - 1]}')</code>，只能跳过 <code>s[${i - 1}]</code>，进入 <code>dfs(${i - 1}, ${j})</code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });

        const childNode: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j,
          val: `dfs(${i - 1},${j})`,
          status: 'normal',
          children: []
        };
        currentTreeNode.children.push(childNode);
        res = dfs(i - 1, j, childNode);

        if (isMemo) memoCache[key] = res;
        gridState[i][j] = res;

        currentTreeNode.status = 'visited';
        currentTreeNode.tag = `= ${res}`;

        generated.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineSkip,
          tag: '跳过分支结果',
          log: `| ✨ 不匹配结果: dfs(${i}, ${j}) = dfs(${i - 1}, ${j}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 跳过决策结果：<code>dfs(${i}, ${j}) = dfs(${i - 1}, ${j}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode)
        });
      }

      activeStack.pop();
      return res;
    }

    const total = dfs(m, n, rootNode);

    generated.push({
      type: 'return',
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终答案',
      log: `| 🏆 不同的子序列演化完成！numDistinct("${s}", "${t}") = ${total}`,
      msg: `🏆 演化计算完成！在 <code>s = "${s}"</code> 的子序列中，<code>t = "${t}"</code> 出现的次数为 <strong>${total}</strong>。`,
      gridHighlight: { i: m, j: n },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

  public static compileDistinctSubsequencesStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
    const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitVal = anchorMap?.init_val || 7;
    const lineTransferMatch = anchorMap?.transfer_match || 17;
    const lineTransferSkip = anchorMap?.transfer_skip || 20;
    const lineReturn = anchorMap?.return || 24;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建二维 DP 表格',
      log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格`,
      msg: `创建 <code>${m + 1}×${n + 1}</code> 的二维 DP 表格，行对应源串 <code>s[0..${m - 1}]</code>，列对应目标串 <code>t[0..${n - 1}]</code>。`
    });

    for (let i = 0; i <= m; i++) {
      dp[i][0] = 1;
      steps.push({
        type: 'init-col',
        line: lineInitVal,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `Base Case dp[${i}][0]=1`,
        log: `| 🎬 初始化首列: dp[${i}][0] = 1 (目标串为空串，方案数为 1)`,
        msg: `初始化首列：<code>dp[${i}][0] = 1</code>（匹配空串 <code>t = ""</code> 时，唯一方案是删除 <code>s</code> 中所有字符）。`
      });
    }

    for (let j = 1; j <= n; j++) {
      dp[0][j] = 0;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const isMatch = s[i - 1] === t[j - 1];

        if (isMatch) {
          const fromMatch = dp[i - 1][j - 1] ?? 0;
          const fromSkip = dp[i - 1][j] ?? 0;
          const sum = fromMatch + fromSkip;
          dp[i][j] = sum;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: i - 1,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `匹配 s[${i - 1}]=='${s[i - 1]}': 匹配 + 跳过`,
            log: `| 🔄 字符匹配 s[${i - 1}] == t[${j - 1}] ('${s[i - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j - 1}](${fromMatch}) + dp[${i - 1}][${j}](${fromSkip}) = ${sum}`,
            msg: `字符匹配 <code>s[${i - 1}] == t[${j - 1}] == '${s[i - 1]}'</code>：<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] (${fromMatch}) + dp[${i - 1}][${j}] (${fromSkip}) = <strong>${sum}</strong></code>。`
          });
        } else {
          const fromSkip = dp[i - 1][j] ?? 0;
          dp[i][j] = fromSkip;

          steps.push({
            type: 'transfer',
            line: lineTransferSkip,
            i,
            j,
            topI: i - 1,
            topJ: j,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `不匹配: dp[${i}][${j}] = 上方旧值`,
            log: `| 🔄 字符不匹配 s[${i - 1}]('${s[i - 1]}') != t[${j - 1}]('${t[j - 1]}'): dp[${i}][${j}] = dp[${i - 1}][${j}](${fromSkip})`,
            msg: `字符不匹配 <code>s[${i - 1}] ('${s[i - 1]}') != t[${j - 1}] ('${t[j - 1]}')</code>：只能不用 <code>s[${i - 1}]</code>，<code>dp[${i}][${j}] = dp[${i - 1}][${j}] = <strong>${fromSkip}</strong></code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 填表计算完成！最终结果 dp[${m}][${n}] = ${dp[m][n]}`,
      msg: `🏆 二维填表全部完成！在 <code>"${s}"</code> 中匹配 <code>"${t}"</code> 的不同子序列数为: <strong>${dp[m][n]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  public static compileDistinctSubsequencesStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'rabbbit') as string;
    const t = ((model.defaultParams as any)?.t || 'rabbit') as string;
    const m = s.length;
    const n = t.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n + 1).fill(0);
    const gridState = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineAccumulateReverse = anchorMap?.accumulate_reverse || 15;
    const lineReturn = anchorMap?.return || 19;

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

    return steps;
  }

  /* =========================================================================
   * 4. 最长回文子序列 (Longest Palindromic Subsequence)
   * ========================================================================= */

  public static compileLongestPalindromicStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
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

    const lineEntry = anchorMap?.entry || (isMemo ? 7 : 5);
    const lineBoundaryCross = anchorMap?.boundary_cross || (isMemo ? 8 : 6);
    const lineBoundarySingle = anchorMap?.boundary_single || (isMemo ? 9 : 7);
    const lineCacheHit = anchorMap?.cache_hit || 10;
    const lineMatch = anchorMap?.match || (isMemo ? 12 : 9);
    const lineMatchBranch = anchorMap?.match_branch || (isMemo ? 13 : 10);
    const lineDiff = anchorMap?.diff || (isMemo ? 16 : 13);
    const lineCombine = anchorMap?.combine || (isMemo ? 19 : 17);
    const lineReturn = isMemo ? 4 : 3;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: n - 1,
      val: `dfs(0, ${n - 1})`,
      status: 'current',
      children: []
    };

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
          line: lineEntry,
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

      memoCache[key] = (memoCache[key] || 0) + 1;

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
            log: `| 🔀 两端字符相同 s[${i}] == s[${j}] ('${s[i]}')，贡献长度 +2，转移至 dfs(${i + 1}, ${j - 1})`,
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
        if (shouldRecord && currentTreeNode) {
          generated.push({
            type: 'diff-branch',
            i,
            j,
            grid: JSON.parse(JSON.stringify(gridState)),
            activeStack: [...activeStack],
            visited: [...visitedCells],
            line: lineDiff,
            tag: `端点不同 ('${s[i]}' != '${s[j]}')`,
            log: `| ⏩ 端点不同 s[${i}]('${s[i]}') != s[${j}]('${s[j]}')，分别尝试舍弃左端 dfs(${i + 1}, ${j}) 与舍弃右端 dfs(${i}, ${j - 1})`,
            msg: `⏩ 端点不同 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>，分别尝试舍弃左端与舍弃右端。`,
            gridHighlight: { i, j },
            activeNodeId: currentTreeNode.id,
            treeRoot: cloneTree(rootNode)
          });
        }

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

  public static compileLongestPalindromicStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'bbbab') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

    const lineInit = anchorMap?.init || 4;
    const lineInitDiag = anchorMap?.init_diag || 6;
    const lineTransferMatch = anchorMap?.transfer_match || 14;
    const lineTransferDiff = anchorMap?.transfer_diff || 16;
    const lineReturn = anchorMap?.return || 20;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建 n×n 状态表',
      log: `| 📦 创建 ${n}×${n} 的二维 DP 状态表格 (上三角)`,
      msg: `创建 <code>${n}×${n}</code> 的二维 DP 表格，<code>dp[i][j]</code> 表示子串 <code>s[i..j]</code> 的最长回文子序列长度。`
    });

    for (let i = 0; i < n; i++) {
      dp[i][i] = 1;
      steps.push({
        type: 'init-diag',
        line: lineInitDiag,
        i,
        j: i,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `对角线初始化: dp[${i}][${i}] = 1`,
        log: `| 🎬 对角线单字符初始化: dp[${i}][${i}] = 1 ('${s[i]}')`,
        msg: `对角线初始化：单字符 <code>'${s[i]}'</code> 回文长度必然为 <code>dp[${i}][${i}] = 1</code>。`
      });
    }

    for (let i = n - 1; i >= 0; i--) {
      for (let j = i + 1; j < n; j++) {
        const isMatch = s[i] === s[j];

        if (isMatch) {
          const fromDiag = dp[i + 1][j - 1] ?? 0;
          const sum = fromDiag + 2;
          dp[i][j] = sum;

          steps.push({
            type: 'transfer',
            line: lineTransferMatch,
            i,
            j,
            topI: i + 1,
            topJ: j - 1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `端点相同 '${s[i]}': dp[${i+1}][${j-1}] + 2 = ${sum}`,
            log: `| 🔄 端点字符相同 s[${i}] == s[${j}] ('${s[i]}'): dp[${i}][${j}] = dp[${i + 1}][${j - 1}] (${fromDiag}) + 2 = ${sum}`,
            msg: `端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>：<code>dp[${i}][${j}] = dp[${i + 1}][${j - 1}] (${fromDiag}) + 2 = <strong>${sum}</strong></code>。`
          });
        } else {
          const fromDown = dp[i + 1][j] ?? 0;
          const fromLeft = dp[i][j - 1] ?? 0;
          const maxVal = Math.max(fromDown, fromLeft);
          dp[i][j] = maxVal;

          steps.push({
            type: 'transfer',
            line: lineTransferDiff,
            i,
            j,
            topI: i + 1,
            topJ: j,
            leftI: i,
            leftJ: j - 1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `端点不同: max(下, 左) = ${maxVal}`,
            log: `| 🔄 端点字符不同 s[${i}]('${s[i]}') != s[${j}]('${s[j]}'): dp[${i}][${j}] = max(下=${fromDown}, 左=${fromLeft}) = ${maxVal}`,
            msg: `端点字符不同 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>：<code>dp[${i}][${j}] = max(下 ${fromDown}, 左 ${fromLeft}) = <strong>${maxVal}</strong></code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 上三角填表完成！最长回文子序列长度 dp[0][${n - 1}] = ${dp[0][n - 1]}`,
      msg: `🏆 二维上三角填表全部完成！字符串 <code>"${s}"</code> 的最长回文子序列长度为: <strong>${dp[0][n - 1]}</strong>。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(n, n, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  public static compileLongestPalindromicStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
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
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
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
        activeSlot: i,
        slotMode: 'updated',
        memoj: 1,
        memo: [...memo],
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
            activeSlot: j,
            slotMode: 'updated',
            down: temp,
            right: pre,
            memoj: sum,
            memo: [...memo],
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
            activeSlot: j,
            slotMode: 'updated',
            down: downVal,
            right: leftVal,
            memoj: maxVal,
            memo: [...memo],
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
      activeSlot: n - 1,
      slotMode: 'final',
      down: memo[n - 1],
      right: memo[n - 1],
      memoj: memo[n - 1],
      memo: [...memo],
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

  public static compilePalindromicSubstringsStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const generated: UniversalStep[] = [];
    const memoCache: Record<string, boolean> = {};
    const gridState: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    const activeStack: string[] = [];
    const visitedCells: Set<string> = new Set();
    let nodeIdCounter = 0;
    let count = 0;

    const lineCheck = anchorMap?.check || 6;
    const lineBoundary = anchorMap?.boundary || (isMemo ? 17 : 16);
    const lineCacheHit = anchorMap?.cache_hit || 19;
    const lineDiff = anchorMap?.diff || (isMemo ? 21 : 18);
    const lineRecurse = anchorMap?.recurse || (isMemo ? 23 : 20);
    const lineReturn = anchorMap?.return || 12;

    const rootNode: UniversalTreeNode = {
      id: `node-${++nodeIdCounter}`,
      r: 0,
      c: n - 1,
      val: `countSubstrings("${s}")`,
      status: 'current',
      children: []
    };

    function isPalindrome(i: number, j: number, parentNode?: UniversalTreeNode): boolean {
      const key = `${i},${j}`;
      activeStack.push(key);
      visitedCells.add(key);

      const currentNode: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: i,
        c: j,
        val: `isPalin(${i},${j}): "${s.slice(i, j + 1)}"`,
        status: 'current',
        children: []
      };
      if (parentNode) {
        parentNode.children.push(currentNode);
      }

      generated.push({
        type: 'entry',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCheck,
        tag: `检验区间 [${i}, ${j}] "${s.slice(i, j + 1)}"`,
        log: `| 🔍 检验子串 [${i}, ${j}] "${s.slice(i, j + 1)}" 是否为回文`,
        msg: `检验子串 <code>[${i}..${j}] "${s.slice(i, j + 1)}"</code> 的回文性。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      if (i >= j) {
        gridState[i][j] = 1;
        currentNode.status = 'base';
        currentNode.tag = '= true (Base)';

        generated.push({
          type: 'boundary',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundary,
          tag: 'Base Case (长度<=1)',
          log: `| 🎬 满足 Base Case: i >= j (i=${i}, j=${j})，长度 <= 1 必然回文，返回 true`,
          msg: `🎬 满足 <code>i >= j</code>：长度 <= 1 的子串必定为回文，返回 <strong>true</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return true;
      }

      if (isMemo && memoCache[key] !== undefined) {
        currentNode.status = 'pruned';
        currentNode.tag = `⚡=${memoCache[key]}`;

        generated.push({
          type: 'cache-hit',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: '⚡ 备忘录命中',
          log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${memoCache[key]}！直接返回`,
          msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${memoCache[key]}</strong>，直接返回！`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return memoCache[key];
      }

      if (s[i] !== s[j]) {
        if (isMemo) memoCache[key] = false;
        gridState[i][j] = 0;
        currentNode.status = 'pruned';
        currentNode.tag = '= false';

        generated.push({
          type: 'diff-branch',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineDiff,
          tag: `端点不同 '${s[i]}' != '${s[j]}'`,
          log: `| ❌ 端点字符不匹配 s[${i}]('${s[i]}') != s[${j}]('${s[j]}')，判定非回文`,
          msg: `❌ 端点字符不匹配 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>，子串必定非回文，返回 <strong>false</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return false;
      }

      generated.push({
        type: 'match-branch',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineRecurse,
        tag: `端点相同 '${s[i]}'，递推内层`,
        log: `| 🔀 端点字符相同 s[${i}] == s[${j}] ('${s[i]}')，继续检验内层子串 isPalindrome(${i + 1}, ${j - 1})`,
        msg: `🔀 端点字符相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code>，继续递归检验内层子串 <code>[${i + 1}..${j - 1}]</code>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      const res = isPalindrome(i + 1, j - 1, currentNode);

      if (isMemo) memoCache[key] = res;
      gridState[i][j] = res ? 1 : 0;

      currentNode.status = res ? 'visited' : 'pruned';
      currentNode.tag = `= ${res}`;

      generated.push({
        type: 'update',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineRecurse,
        tag: `区间 [${i}, ${j}] 判定为 ${res}`,
        log: `| ✨ 区间 [${i}, ${j}] "${s.slice(i, j + 1)}" 判定结果: ${res}${isMemo ? ' [存入备忘录]' : ''}`,
        msg: `✨ 区间 <code>[${i}..${j}] "${s.slice(i, j + 1)}"</code> 判定结果为 <strong>${res}</strong>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      activeStack.pop();
      return res;
    }

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        if (isPalindrome(i, j, rootNode)) {
          count++;
        }
      }
    }

    generated.push({
      type: 'return',
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [],
      visited: [...visitedCells],
      line: lineReturn,
      tag: '最终统计总数',
      log: `| 🏆 回文子串统计演化完成！countSubstrings("${s}") = ${count}`,
      msg: `🏆 演化计算完成！字符串 <code>"${s}"</code> 中的回文子串总数为 <strong>${count}</strong>。`,
      gridHighlight: { i: 0, j: n - 1 },
      activeNodeId: rootNode.id,
      treeRoot: cloneTree(rootNode)
    });

    return generated;
  }

  public static compilePalindromicSubstringsStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    let count = 0;

    const lineInit = anchorMap?.init || 4;
    const lineCond = anchorMap?.cond || 12;
    const lineTransferShort = anchorMap?.transfer_short || 14;
    const lineTransferSub = anchorMap?.transfer_sub || 18;
    const lineReturn = anchorMap?.return || 25;

    steps.push({
      type: 'init',
      line: lineInit,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '创建 n×n 上三角状态表',
      log: `| 📦 创建 ${n}×${n} 的二维 DP 状态表格 (仅填上三角 i <= j)`,
      msg: `创建 <code>${n}×${n}</code> 的二维 DP 表格，<code>dp[i][j]</code> 表示子串 <code>s[i..j]</code> 是否为回文。`
    });

    for (let i = n - 1; i >= 0; i--) {
      for (let j = i; j < n; j++) {
        const isMatch = s[i] === s[j];

        if (isMatch) {
          if (j - i <= 1) {
            dp[i][j] = 1;
            count++;

            steps.push({
              type: 'transfer',
              line: lineTransferShort,
              i,
              j,
              topI: -1,
              topJ: -1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `长度 <= 2 回文: "${s.slice(i, j + 1)}"`,
              log: `| 🎬 s[${i}] == s[${j}] ('${s[i]}') 且长度 <= 2: dp[${i}][${j}] = true, count = ${count}`,
              msg: `端点相同 <code>s[${i}] == s[${j}] == '${s[i]}'</code> 且长度 <code>${j - i + 1} <= 2</code>：<code>dp[${i}][${j}] = true</code>，回文总数累加至 <strong>${count}</strong>。`
            });
          } else if (dp[i + 1][j - 1] === 1) {
            dp[i][j] = 1;
            count++;

            steps.push({
              type: 'transfer',
              line: lineTransferSub,
              i,
              j,
              topI: i + 1,
              topJ: j - 1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `内层回文: dp[${i}][${j}] = true`,
              log: `| 🔄 s[${i}] == s[${j}] 且内层 dp[${i + 1}][${j - 1}] == true: dp[${i}][${j}] = true, count = ${count}`,
              msg: `端点相同且内层 <code>dp[${i + 1}][${j - 1}] == true</code>：<code>dp[${i}][${j}] = true</code>，回文子串 <code>"${s.slice(i, j + 1)}"</code> 成立，总数 = <strong>${count}</strong>。`
            });
          } else {
            dp[i][j] = 0;

            steps.push({
              type: 'transfer',
              line: lineTransferSub,
              i,
              j,
              topI: i + 1,
              topJ: j - 1,
              leftI: -1,
              leftJ: -1,
              grid: JSON.parse(JSON.stringify(dp)),
              tag: `内层非回文: dp[${i}][${j}] = false`,
              log: `| ❌ s[${i}] == s[${j}] 但内层 dp[${i + 1}][${j - 1}] == false: dp[${i}][${j}] = false`,
              msg: `端点虽相同但内层 <code>dp[${i + 1}][${j - 1}] == false</code>：<code>dp[${i}][${j}] = false</code>。`
            });
          }
        } else {
          dp[i][j] = 0;

          steps.push({
            type: 'transfer',
            line: lineCond,
            i,
            j,
            topI: -1,
            topJ: -1,
            leftI: -1,
            leftJ: -1,
            grid: JSON.parse(JSON.stringify(dp)),
            tag: `端点不同: dp[${i}][${j}] = false`,
            log: `| ❌ s[${i}]('${s[i]}') != s[${j}]('${s[j]}'): dp[${i}][${j}] = false`,
            msg: `端点字符不匹配 <code>s[${i}] ('${s[i]}') != s[${j}] ('${s[j]}')</code>：<code>dp[${i}][${j}] = false</code>。`
          });
        }
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: '返回最终结果',
      log: `| 🏆 上三角填表完成！回文子串总数 count = ${count}`,
      msg: `🏆 二维上三角填表全部完成！字符串 <code>"${s}"</code> 中共有 <strong>${count}</strong> 个回文子串。`
    });

    for (const step of steps) {
      step.treeRoot = build2DDPDependencyTree(n, n, 'forward', undefined, step.grid, step.i, step.j);
      step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
    }

    return steps;
  }

  public static compilePalindromicSubstringsStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const s = ((model.defaultParams as any)?.s || 'aaa') as string;
    const n = s.length;

    const steps: UniversalStep[] = [];
    const memo = new Array(n).fill(0);
    const gridState = Array.from({ length: n }, () => new Array(n).fill(null));
    let count = 0;

    const lineLoopCenter = anchorMap?.loop_center || 5;
    const lineMatchInc = anchorMap?.match_inc || 12;
    const lineReturn = anchorMap?.return || 18;

    steps.push({
      type: 'init',
      line: lineLoopCenter,
      i: 0,
      j: 0,
      activeSlot: 0,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '初始化中心扩散',
      log: `| 📦 准备遍历 2n-1 = ${2 * n - 1} 个回文中心`,
      msg: `准备遍历 <code>${2 * n - 1}</code> 个潜在回文中心（包含 <code>${n}</code> 个单字符中心与 <code>${n - 1}</code> 个双字符间隙）。`
    });

    for (let center = 0; center < 2 * n - 1; center++) {
      let l = Math.floor(center / 2);
      let r = l + (center % 2);
      const isOdd = center % 2 === 0;

      steps.push({
        type: 'init-center',
        line: lineLoopCenter,
        i: l,
        j: r,
        activeSlot: l,
        slotMode: 'updated',
        memoj: count,
        memo: [...memo],
        memoSnapshot: [...memo],
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `中心 #${center} (${isOdd ? `单字符 '${s[l]}'` : `间隙 '${s[l]}'-'${s[r]}'`})`,
        log: `| 🎯 探索中心 #${center}: l=${l}, r=${r} [${isOdd ? `奇数中心 "${s[l]}"` : `偶数间隙 "${s[l]}|${s[r]}"`}]`,
        msg: `探索回文中心 <code>#${center}</code>：<code>l = ${l}, r = ${r}</code>（${isOdd ? `单字符 "${s[l]}"` : `双字符间隙 "${s[l]}|${s[r]}"`}）。`
      });

      while (l >= 0 && r < n && s[l] === s[r]) {
        count++;
        memo[l] = count;
        gridState[l][r] = 1;

        steps.push({
          type: 'spread',
          line: lineMatchInc,
          i: l,
          j: r,
          activeSlot: l,
          slotMode: 'updated',
          down: l,
          right: r,
          memoj: count,
          memo: [...memo],
          memoSnapshot: [...memo],
          grid: JSON.parse(JSON.stringify(gridState)),
          tag: `扩散命中: "${s.slice(l, r + 1)}" (count=${count})`,
          log: `| ✨ 双向扩散成功 s[${l}] == s[${r}] ('${s[l]}'): 发现回文子串 "${s.slice(l, r + 1)}", count = ${count}`,
          msg: `双向扩散成功 <code>s[${l}] == s[${r}] == '${s[l]}'</code>：发现回文子串 <code>"${s.slice(l, r + 1)}"</code>，回文总数累加至 <strong>${count}</strong>。`
        });

        l--;
        r++;
      }
    }

    steps.push({
      type: 'return',
      line: lineReturn,
      i: 0,
      j: n - 1,
      activeSlot: n - 1,
      slotMode: 'final',
      down: count,
      right: count,
      memoj: count,
      memo: [...memo],
      memoSnapshot: [...memo],
      grid: JSON.parse(JSON.stringify(gridState)),
      tag: '最终答案',
      log: `| 🏆 中心扩散完成！回文子串总数 count = ${count}`,
      msg: `🏆 中心扩散法计算完成！字符串 <code>"${s}"</code> 中的回文子串总数为: <strong>${count}</strong>。`
    });

    return steps;
  }
}
