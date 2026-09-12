import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';


export function compileDeleteDistanceStage1or2(
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

export function compileDeleteDistanceStage3(
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

export function compileDeleteDistanceStage4(
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

