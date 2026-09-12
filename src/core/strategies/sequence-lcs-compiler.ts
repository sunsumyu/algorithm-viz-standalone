import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree, findNodeIdByCoord } from './strategy-helpers';

/**
 * 最长公共子序列 (LCS, LeetCode 1143) 四阶段全演化步骤编译器
 * 遵循「不同路径 II」与「编辑距离」黄金基准标准：
 * - 阶段 1 & 2: 全量双串字符末尾匹配 DFS，维护 activeStack 安全绳连线与 memo 剪枝
 * - 阶段 3: 严格二维表拓扑递推，全表初始为 null，计算中为 active，转移完成后写入数值变绿
 * - 阶段 4: 一维滚动数组优化，leftUp 寄存器暂存对角线值
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

  const rootNode: UniversalTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: m,
    c: n,
    val: `dfs(${m},${n})`,
    status: 'current',
    children: [],
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
        log: `| 📥 进入 dfs(i=${i}, j=${j}) [s1="${s1.slice(0, i)}", s2="${s2.slice(0, j)}"]`,
        msg: `进入函数 <code>dfs(i = ${i}, j = ${j})</code>，考察 <code>s1[0..${i - 1}]</code> 与 <code>s2[0..${j - 1}]</code> 的公共子序列。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode.id,
        treeRoot: cloneTree(rootNode),
      });
    }

    // 1. 边界检查: 任一串为空
    if (i === 0 || j === 0) {
      gridState[i][j] = 0;
      if (currentTreeNode) {
        currentTreeNode.status = 'base';
        currentTreeNode.tag = '= 0 (空串基底)';
      }
      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'boundary',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundary,
          tag: '达到空串基底',
          log: `| 🛑 【边界基底】dfs(${i}, ${j}): 任一字符串长度为 0，return 0`,
          msg: `达到空串边界：<code>i=${i}, j=${j}</code>，任一前缀为空串时公共子序列长度恒为 <strong>0</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }
      activeStack.pop();
      return 0;
    }

    // 2. 记忆化缓存命中剪枝
    if (isMemo && memoCache[key] !== undefined) {
      const cached = memoCache[key];
      gridState[i][j] = cached;
      if (currentTreeNode) {
        currentTreeNode.status = 'pruned';
        currentTreeNode.tag = `🎯Hit=${cached}`;
      }
      if (shouldRecord && currentTreeNode) {
        generated.push({
          type: 'cache-hit',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineCacheHit,
          tag: `备忘录命中: ${cached}`,
          log: `| 🎯 【缓存命中】memo[${i}][${j}] = ${cached}，剪枝返回！`,
          msg: `🎯 命中备忘录缓存：<code>memo[${i}][${j}] = <strong>${cached}</strong></code>，直接剪枝返回。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }
      activeStack.pop();
      return cached;
    }

    let res: number;
    const c1 = s1[i - 1];
    const c2 = s2[j - 1];
    const isMatch = c1 === c2;

    if (shouldRecord && currentTreeNode) {
      generated.push({
        type: 'compare',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineMatch,
        tag: `比对 '${c1}' 与 '${c2}'`,
        log: `| 🔍 字符比对 s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}') -> ${isMatch ? '匹配 ✨' : '不匹配 ❌'}`,
        msg: `比对末尾字符：<code>s1[${i - 1}] = '${c1}'</code> 与 <code>s2[${j - 1}] = '${c2}'</code>，${isMatch ? '匹配成功！准备深入对角线 (+1)' : '不匹配，准备分叉探索'}。`,
        gridHighlight: { i, j },
        activeNodeId: currentTreeNode.id,
        treeRoot: cloneTree(rootNode),
      });
    }

    if (isMatch) {
      // 字符匹配：1 + dfs(i - 1, j - 1)
      let childMatch: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childMatch = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j - 1,
          val: `dfs(${i - 1},${j - 1})`,
          status: 'normal',
          children: [],
        };
        currentTreeNode.children.push(childMatch);
      }
      const sub = dfs(i - 1, j - 1, childMatch);
      res = 1 + sub;
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
          tag: `匹配转移: 1 + ${sub} = ${res}`,
          log: `| ↖️ 对角线转移: dfs(${i}, ${j}) = 1 + dfs(${i - 1}, ${j - 1}) = 1 + ${sub} = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `✨ 字符匹配成功：<code>1 + dfs(${i - 1}, ${j - 1}) = 1 + ${sub} = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
        });
      }
    } else {
      // 字符不匹配：max(dfs(i - 1, j), dfs(i, j - 1))
      let childUp: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childUp = {
          id: `node-${++nodeIdCounter}`,
          r: i - 1,
          c: j,
          val: `dfs(${i - 1},${j})`,
          status: 'normal',
          children: [],
        };
        currentTreeNode.children.push(childUp);
      }
      const p1 = dfs(i - 1, j, childUp);

      let childLeft: UniversalTreeNode | undefined;
      if (shouldRecord && currentTreeNode) {
        childLeft = {
          id: `node-${++nodeIdCounter}`,
          r: i,
          c: j - 1,
          val: `dfs(${i},${j - 1})`,
          status: 'normal',
          children: [],
        };
        currentTreeNode.children.push(childLeft);
      }
      const p2 = dfs(i, j - 1, childLeft);

      res = Math.max(p1, p2);
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
          tag: `max(${p1}, ${p2}) = ${res}`,
          log: `| 🔄 分支汇聚: dfs(${i}, ${j}) = max(上=${p1}, 左=${p2}) = ${res}${isMemo ? ' [存入备忘录]' : ''}`,
          msg: `🔄 汇聚两路分支：<code>max(上=${p1}, 左=${p2}) = <strong>${res}</strong></code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentTreeNode.id,
          treeRoot: cloneTree(rootNode),
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
    tag: `最终答案: ${total}`,
    log: `| 🏆 LCS 演化计算完成！LCS("${s1}", "${s2}") = ${total}`,
    msg: `🏆 计算完成！<code>text1 = "${s1}"</code> 与 <code>text2 = "${s2}"</code> 的最长公共子序列长度为 <strong>${total}</strong>。`,
    gridHighlight: { i: m, j: n },
    activeNodeId: rootNode.id,
    treeRoot: cloneTree(rootNode),
  });

  return generated;
}

export function compileLcsStage3(
  model: IYamlAlgorithmModel,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const s1 = ((model.defaultParams as any)?.s1 || (model.defaultParams as any)?.text1 || 'abcde') as string;
  const s2 = ((model.defaultParams as any)?.s2 || (model.defaultParams as any)?.text2 || 'ace') as string;
  const m = s1.length;
  const n = s2.length;

  const steps: UniversalStep[] = [];
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(null));

  const lineInit = anchorMap?.init || 3;
  const lineLoopI = anchorMap?.loop_i || 5;
  const lineLoopJ = anchorMap?.loop_j || 6;
  const lineTransferMatch = anchorMap?.transfer_match || 8;
  const lineTransferDiff = anchorMap?.transfer_diff || 10;
  const lineReturn = anchorMap?.return || 13;

  // 1. 基底边界初始化 (第 0 行与第 0 列置为 0)
  for (let j = 0; j <= n; j++) dp[0][j] = 0;
  for (let i = 0; i <= m; i++) dp[i][0] = 0;

  steps.push({
    type: 'init',
    i: 0,
    j: 0,
    grid: JSON.parse(JSON.stringify(dp)),
    line: lineInit,
    tag: '分配二维表并初始化边界',
    log: `| 📋 分配 dp[${m + 1}][${n + 1}] 表格，空串边界初始化为 0`,
    msg: `初始化 <code>${m + 1} × ${n + 1}</code> 二维状态表格，首行与首列空串基底置为 <strong>0</strong>。`,
    gridHighlight: { i: 0, j: 0 },
  });

  // 2. 逐行逐列填表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c1 = s1[i - 1];
      const c2 = s2[j - 1];
      const isMatch = c1 === c2;

      // 转移计算中: 当前格仍为 null，焦点移到当前格
      steps.push({
        type: 'eval',
        i,
        j,
        grid: JSON.parse(JSON.stringify(dp)),
        line: lineLoopJ,
        tag: `考察 dp[${i}][${j}] ('${c1}' vs '${c2}')`,
        log: `| 🔍 考察 dp[${i}][${j}]：s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}')`,
        msg: `考察单元格 <code>dp[${i}][${j}]</code>：比对 <code>s1[${i - 1}]='${c1}'</code> 与 <code>s2[${j - 1}]='${c2}'</code>。`,
        gridHighlight: { i, j },
      });

      if (isMatch) {
        dp[i][j] = (dp[i - 1][j - 1] ?? 0) + 1;
        steps.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          line: lineTransferMatch,
          tag: `匹配转移: 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          log: `| ✨ 字符匹配 '${c1}' == '${c2}'：dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          msg: `✨ 字符匹配成功：对角线转移 <code>1 + dp[${i - 1}][${j - 1}] = <strong>${dp[i][j]}</strong></code>。`,
          gridHighlight: { i, j },
        });
      } else {
        const up = dp[i - 1][j] ?? 0;
        const left = dp[i][j - 1] ?? 0;
        dp[i][j] = Math.max(up, left);
        steps.push({
          type: 'update',
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          line: lineTransferDiff,
          tag: `择优转移: max(上=${up}, 左=${left}) = ${dp[i][j]}`,
          log: `| ➡️ 字符不匹配：dp[${i}][${j}] = max(上=${up}, 左=${left}) = ${dp[i][j]}`,
          msg: `字符不同：择优继承 <code>max(上=${up}, 左=${left}) = <strong>${dp[i][j]}</strong></code>。`,
          gridHighlight: { i, j },
        });
      }
    }
  }

  // 3. 最终返回步
  steps.push({
    type: 'return',
    i: m,
    j: n,
    grid: JSON.parse(JSON.stringify(dp)),
    line: lineReturn,
    tag: `最终解: ${dp[m][n]}`,
    log: `| 🏆 二维 DP 递推完成！dp[${m}][${n}] = ${dp[m][n]}`,
    msg: `🏆 状态转移全部完成！全局最长公共子序列长度为 <strong>${dp[m][n]}</strong>。`,
    gridHighlight: { i: m, j: n },
  });

  for (const step of steps) {
    step.treeRoot = build2DDPDependencyTree(m + 1, n + 1, 'forward', undefined, step.grid, step.i, step.j);
    step.activeNodeId = findNodeIdByCoord(step.treeRoot, step.i, step.j);
  }

  return steps;
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
  const rollingHistory: (number | null)[][] = [Array.from(dp1d)];

  const lineInit = anchorMap?.init || 3;
  const lineLoopI = anchorMap?.loop_i || 5;
  const linePreInit = anchorMap?.pre_init || 6;
  const lineLoopJ = anchorMap?.loop_j || 7;
  const lineTransferMatch = anchorMap?.transfer_match || 10;
  const lineTransferDiff = anchorMap?.transfer_diff || 12;
  const lineReturn = anchorMap?.return || 16;

  if (direction === 'reverse') {
    steps.push({
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

      steps.push({
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
          steps.push({
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
          steps.push({
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

    steps.push({
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

  steps.push({
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

    steps.push({
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
        steps.push({
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
        steps.push({
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

  steps.push({
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
