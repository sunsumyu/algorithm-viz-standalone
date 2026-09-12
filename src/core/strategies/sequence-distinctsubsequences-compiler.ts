import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';


export function compileDistinctSubsequencesStage1or2(
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

export function compileDistinctSubsequencesStage3(
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

export function compileDistinctSubsequencesStage4(
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

