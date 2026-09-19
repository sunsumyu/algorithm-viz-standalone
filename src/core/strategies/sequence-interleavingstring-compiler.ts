import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree } from './strategy-helpers';

/**
 * 交错字符串 (Interleaving String, LeetCode 97) 四阶段全演化步骤编译器
 *
 * 遵循「不同路径 II」黄金基准：
 * - 阶段 1 & 2: 严格树形 DFS 演化，双字符交错决策分支，备忘录剪枝，零跳步代码行对齐
 * - 阶段 3: 严格 (m+1) × (n+1) 二维状态网格拓扑填表，首帧纯净 null 防御，双向顺逆推对称
 * - 阶段 4: 一维滚动空间压缩，(m+1)*(n+1) -> (n+1)，物理槽位跳跃实体与双向发散
 */

function extractParams(model: IYamlAlgorithmModel): { s1: string; s2: string; s3: string; m: number; n: number } {
  const p = (model.defaultParams || {}) as any;
  const s1 = String(p.s1 || p.word1 || 'aabcc');
  const s2 = String(p.s2 || p.word2 || 'dbbca');
  const s3 = String(p.s3 || 'aadbbcbcac');
  return { s1, s2, s3, m: s1.length, n: s2.length };
}

// ---------------------------------------------------------------------------
// 阶段 1 & 2: 递归与记忆化搜索编译器
// ---------------------------------------------------------------------------

export function compileInterleavingStringStage1or2(
  model: IYamlAlgorithmModel,
  isMemo: boolean = false,
  anchorMap: Record<string, number> = {},
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const { s1, s2, s3, m, n } = extractParams(model);
  const isForward = direction !== 'reverse';
  const steps: UniversalStep[] = [];

  const lineGuard = anchorMap.guard || 2;
  const lineReturn = anchorMap.return || 3;
  const lineEntry = anchorMap.entry || 4;
  const lineBoundary = anchorMap.boundary || 5;
  const lineCacheHit = anchorMap.cache_hit || 6;
  const lineCondS1 = anchorMap.cond_s1 || 7;
  const lineBranchS1 = anchorMap.branch_s1 || 8;
  const lineCondS2 = anchorMap.cond_s2 || 9;
  const lineBranchS2 = anchorMap.branch_s2 || 10;
  const lineCombine = isMemo ? (anchorMap.cache_write || 11) : (anchorMap.combine || 11);

  // 1. 守恒守卫检查 (Guard Check)
  if (m + n !== s3.length) {
    steps.push({
      type: 'guard',
      flowPhase: 'terminal',
      line: lineGuard,
      tag: '长度不守恒提前返回',
      log: `| 🛑 s1.length(${m}) + s2.length(${n}) != s3.length(${s3.length})，总长不守恒直接返回 false`,
      msg: `字符串长度总和不守恒：<code>${m} + ${n} != ${s3.length}</code>，无法组成目标串，直接返回 <strong>false</strong>。`,
      i: 0,
      j: 0,
      grid: [new Array(n + 1).fill(null)]
    });
    return steps;
  }

  const gridState: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(null)
  );
  const activeStack: string[] = [];
  const visitedCells: Set<string> = new Set();
  const memoCache: Record<string, number> = {};
  let nodeIdCounter = 0;
  let callCount = 0;

  const rootI = isForward ? 0 : m;
  const rootJ = isForward ? 0 : n;

  const rootNode: UniversalTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: rootI,
    c: rootJ,
    val: `dfs(${rootI},${rootJ})`,
    status: 'current',
    children: []
  };

  const emitStep = (stepData: any) => {
    const isComparing =
      stepData.type === 'cond' ||
      stepData.type === 'branch-call';

    const curI = isForward ? stepData.i : Math.max(0, stepData.i - 1);
    const curJ = isForward ? stepData.j : Math.max(0, stepData.j - 1);

    steps.push({
      s: s1,
      t: s2,
      s1,
      s2,
      s3,
      curI,
      curJ,
      label1: '字符串 s1',
      label2: '字符串 s2',
      label3: '交错串 s3',
      isComparing,
      callStack: activeStack.map((coord, idx) => ({
        label: `dfs(${coord})`,
        coord,
        depth: idx + 1
      })),
      activeTrail: [...activeStack],
      ...stepData
    });
  };

  function dfs(i: number, j: number, currentNode: UniversalTreeNode): number {
    callCount++;
    const key = `${i},${j}`;
    const isRepeated = !isMemo && memoCache[key] !== undefined;

    activeStack.push(key);
    visitedCells.add(key);

    currentNode.status = 'current';
    if (isRepeated) {
      currentNode.tag = '⚠️重复';
    }

    // 1. 发射入口帧
    emitStep({
      type: 'dfs-call',
      flowPhase: 'forward',
      i,
      j,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [...activeStack],
      visited: [...visitedCells],
      line: lineEntry,
      tag: `DFS #${callCount} (i=${i}, j=${j})`,
      log: isForward
        ? `| 📥 进入 dfs(i=${i}, j=${j}) [正向探测 s1[${i}..], s2[${j}..] 与 s3[${i + j}..]]`
        : `| 📥 进入 dfs(i=${i}, j=${j}) [逆向寻源 s1[0..${i - 1}], s2[0..${j - 1}] 与 s3[0..${i + j - 1}]]`,
      msg: isForward
        ? `📥 [顺推探索] 进入 <code>dfs(i=${i}, j=${j})</code>：考察 <code>s1[${i}..]</code> 与 <code>s2[${j}..]</code> 能否交错出 <code>s3[${i + j}..]</code>。`
        : `📥 [逆推寻源] 进入 <code>dfs(i=${i}, j=${j})</code>：从终点 <code>(${i}, ${j})</code> 逆向寻源前缀匹配。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    // 2. 基底判定 (Boundary Check)
    const isBoundary = isForward ? (i === m && j === n) : (i === 0 && j === 0);
    if (isBoundary) {
      gridState[i][j] = 1;
      currentNode.status = 'base';
      currentNode.tag = '= 1 (成功)';

      emitStep({
        type: 'boundary',
        flowPhase: 'backtrack',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineBoundary,
        tag: 'Base Case 匹配成功',
        log: `| 🎬 满足 Base Case: 两字符串字符全部交错消耗完毕，成功拼出 s3，返回 true(1)`,
        msg: `🎬 字符全部匹配完成，成功寻得有效交错路径，返回 <strong>true (1)</strong>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      activeStack.pop();
      return 1;
    }

    // 3. 备忘录命中判定 (Memoization Cache Check)
    if (isMemo && memoCache[key] !== undefined) {
      const cachedVal = memoCache[key];
      currentNode.status = 'pruned';
      currentNode.tag = cachedVal === 1 ? '⚡=true' : '⚡=false';

      emitStep({
        type: 'cache-hit',
        flowPhase: 'backtrack',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCacheHit,
        tag: '⚡ 备忘录命中',
        log: `| ⚡ 【备忘录命中剪枝】memo[${i}][${j}] 已缓存 ${cachedVal === 1 ? 'true' : 'false'}！直接 O(1) 返回`,
        msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已命中缓存 <strong>${cachedVal === 1 ? 'true' : 'false'}</strong>，直接剪枝返回！`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      activeStack.pop();
      return cachedVal;
    }

    let ans = 0;

    // 4. 分支 1: 选取 s1 当前字符比对
    const s1Char = isForward ? (i < m ? s1[i] : null) : (i > 0 ? s1[i - 1] : null);
    const s3CharS1 = isForward ? (i + j < s3.length ? s3[i + j] : null) : (i + j > 0 ? s3[i + j - 1] : null);
    const canPickS1 = s1Char !== null && s3CharS1 !== null && s1Char === s3CharS1;

    emitStep({
      type: 'cond',
      i,
      j,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [...activeStack],
      visited: [...visitedCells],
      line: lineCondS1,
      tag: canPickS1 ? `s1 匹配 '${s1Char}'` : `s1 不匹配`,
      log: isForward
        ? `| 🔍 [顺推] 比对 s1[${i}]('${s1Char}') 与 s3[${i + j}]('${s3CharS1}'): ${canPickS1 ? '匹配！可走 s1 分支' : '不匹配'}`
        : `| 🔍 [逆推] 比对 s1[${i - 1}]('${s1Char}') 与 s3[${i + j - 1}]('${s3CharS1}'): ${canPickS1 ? '匹配！可走 s1 逆向分支' : '不匹配'}`,
      msg: canPickS1
        ? `比对成立：<code>s1 字符 '${s1Char}' == s3 字符 '${s3CharS1}'</code>，尝试选用 <code>s1</code> 字符向下推进。`
        : `比对不匹配：<code>s1 字符 '${s1Char ?? '空'}' != s3 字符 '${s3CharS1 ?? '空'}'</code>，无法走 s1 分支。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    if (canPickS1) {
      const nextI = isForward ? i + 1 : i - 1;
      const nextJ = j;
      const childNode1: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: nextI,
        c: nextJ,
        val: `s1 匹配 ➔ dfs(${nextI},${nextJ})`,
        edgeLabel: `s1='${s1Char}'`,
        status: 'current',
        children: []
      };
      currentNode.children.push(childNode1);

      emitStep({
        type: 'branch-call',
        flowPhase: 'forward',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineBranchS1,
        tag: '进入 [选用 s1] 递归分支',
        log: `| ➡️ 执行 ans = dfs(${nextI}, ${nextJ})：选用 s1 当前字符推进`,
        msg: `➡️ 选用 s1 当前字符 <code>'${s1Char}'</code>，进入递归 <code>dfs(${nextI}, ${nextJ})</code>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      const res1 = dfs(nextI, nextJ, childNode1);
      if (res1 === 1) {
        ans = 1;
      }
    }

    // 5. 分支 2: 若分支 1 未成功，尝试选取 s2 当前字符比对
    if (ans === 0) {
      const s2Char = isForward ? (j < n ? s2[j] : null) : (j > 0 ? s2[j - 1] : null);
      const s3CharS2 = isForward ? (i + j < s3.length ? s3[i + j] : null) : (i + j > 0 ? s3[i + j - 1] : null);
      const canPickS2 = s2Char !== null && s3CharS2 !== null && s2Char === s3CharS2;

      emitStep({
        type: 'cond',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineCondS2,
        tag: canPickS2 ? `s2 匹配 '${s2Char}'` : `s2 不匹配`,
        log: isForward
          ? `| 🔍 [顺推] 比对 s2[${j}]('${s2Char}') 与 s3[${i + j}]('${s3CharS2}'): ${canPickS2 ? '匹配！可走 s2 分支' : '不匹配'}`
          : `| 🔍 [逆推] 比对 s2[${j - 1}]('${s2Char}') 与 s3[${i + j - 1}]('${s3CharS2}'): ${canPickS2 ? '匹配！可走 s2 逆向分支' : '不匹配'}`,
        msg: canPickS2
          ? `比对成立：<code>s2 字符 '${s2Char}' == s3 字符 '${s3CharS2}'</code>，尝试选用 <code>s2</code> 字符推进。`
          : `比对不匹配：<code>s2 字符 '${s2Char ?? '空'}' != s3 字符 '${s3CharS2 ?? '空'}'</code>，无法走 s2 分支。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      if (canPickS2) {
        const nextI = i;
        const nextJ = isForward ? j + 1 : j - 1;
        const childNode2: UniversalTreeNode = {
          id: `node-${++nodeIdCounter}`,
          r: nextI,
          c: nextJ,
          val: `s2 匹配 ➔ dfs(${nextI},${nextJ})`,
          edgeLabel: `s2='${s2Char}'`,
          status: 'current',
          children: []
        };
        currentNode.children.push(childNode2);

        emitStep({
          type: 'branch-call',
          flowPhase: 'forward',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBranchS2,
          tag: '进入 [选用 s2] 递归分支',
          log: `| ➡️ 执行 ans = dfs(${nextI}, ${nextJ})：选用 s2 当前字符推进`,
          msg: `➡️ 选用 s2 当前字符 <code>'${s2Char}'</code>，进入递归 <code>dfs(${nextI}, ${nextJ})</code>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });

        const res2 = dfs(nextI, nextJ, childNode2);
        if (res2 === 1) {
          ans = 1;
        }
      }
    }

    // 6. 决策合并与写入备忘录
    gridState[i][j] = ans;
    if (isMemo) {
      memoCache[key] = ans;
    }

    currentNode.status = ans === 1 ? 'base' : 'normal';
    currentNode.tag = ans === 1 ? '= true' : '= false';

    emitStep({
      type: 'combine',
      flowPhase: 'backtrack',
      i,
      j,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [...activeStack],
      visited: [...visitedCells],
      line: lineCombine,
      tag: `回溯决策结果: ${ans === 1 ? 'true' : 'false'}`,
      log: `| ✨ 回溯总结: dfs(${i}, ${j}) 最终结论为 ${ans === 1 ? 'true' : 'false'}${isMemo ? ' [写入 memo 缓存]' : ''}`,
      msg: `✨ 决策汇总：<code>dfs(${i}, ${j}) = <strong>${ans === 1 ? 'true' : 'false'}</strong></code>${isMemo ? '，已存入备忘录防重复' : ''}。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    activeStack.pop();
    return ans;
  }

  const finalTotal = dfs(rootI, rootJ, rootNode);

  emitStep({
    type: 'return',
    flowPhase: 'terminal',
    i: rootI,
    j: rootJ,
    grid: JSON.parse(JSON.stringify(gridState)),
    activeStack: [],
    visited: [...visitedCells],
    line: lineReturn,
    tag: `最终演化结果: ${finalTotal === 1 ? 'true' : 'false'}`,
    log: `| 🏆 交错字符串求解完成！isInterleave("${s1}", "${s2}", "${s3}") = ${finalTotal === 1 ? 'true' : 'false'}`,
    msg: `🏆 演化计算完成！字符串 <code>s3</code> ${finalTotal === 1 ? '<strong>可以</strong>' : '<strong>不能</strong>'} 由 <code>s1</code> 和 <code>s2</code> 交错组成。`,
    gridHighlight: { i: rootI, j: rootJ },
    activeNodeId: rootNode.id,
    treeRoot: cloneTree(rootNode)
  });

  return steps;
}

// ---------------------------------------------------------------------------
// 阶段 3: 二维状态网格递推填表编译器
// ---------------------------------------------------------------------------

export function compileInterleavingStringStage3(
  model: IYamlAlgorithmModel,
  anchorMap: Record<string, number> = {},
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const { s1, s2, s3, m, n } = extractParams(model);
  const isForward = direction !== 'reverse';
  const steps: UniversalStep[] = [];

  const lineGuard = anchorMap.guard || 2;
  const lineInit = anchorMap.init || 3;
  const lineInitBase = anchorMap.init_base || 4;
  const lineInitCol = anchorMap.init_col || 5;
  const lineInitRow = anchorMap.init_row || 6;
  const lineLoopI = anchorMap.loop_i || 7;
  const lineLoopJ = anchorMap.loop_j || 8;
  const lineCheckS1 = anchorMap.check_s1 || 9;
  const lineCheckS2 = anchorMap.check_s2 || 10;
  const lineTransfer = anchorMap.transfer || 11;
  const lineReturn = anchorMap.return || 12;

  // 1. 守卫检查
  if (m + n !== s3.length) {
    steps.push({
      type: 'guard',
      flowPhase: 'terminal',
      line: lineGuard,
      tag: '长度不守恒提前返回',
      log: `| 🛑 s1.length(${m}) + s2.length(${n}) != s3.length(${s3.length})，总长不守恒直接返回 false`,
      msg: `字符串长度总和不守恒：<code>${m} + ${n} != ${s3.length}</code>，无法组成目标串，直接返回 <strong>false</strong>。`,
      i: 0,
      j: 0,
      grid: [new Array(n + 1).fill(null)]
    });
    return steps;
  }

  // 严格初始化为全 null 矩阵 (架构死规矩：Step 0 纯净 null 防御)
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(null)
  );

  const emitStep = (stepData: any) => {
    const isComparing = stepData.type === 'transfer' || stepData.type === 'cond';
    const curI = isForward ? Math.max(0, Math.min(m - 1, stepData.i - 1)) : Math.max(0, Math.min(m - 1, stepData.i));
    const curJ = isForward ? Math.max(0, Math.min(n - 1, stepData.j - 1)) : Math.max(0, Math.min(n - 1, stepData.j));

    steps.push({
      s: s1,
      t: s2,
      s1,
      s2,
      s3,
      curI,
      curJ,
      label1: '字符串 s1',
      label2: '字符串 s2',
      label3: '交错串 s3',
      isComparing,
      ...stepData
    });
  };

  // Step 0: init 表格创建帧 (纯净 null)
  emitStep({
    type: 'init',
    line: lineInit,
    i: isForward ? 0 : m,
    j: isForward ? 0 : n,
    grid: JSON.parse(JSON.stringify(dp)),
    tag: '创建二维 DP 表格',
    log: `| 📦 创建 (m+1)×(n+1) = ${m + 1}×${n + 1} 的二维 DP 状态表格，全格初始为 null`,
    msg: `创建 <code>${m + 1}×${n + 1}</code> 的二维 DP 状态表格。行对应 <code>s1</code> 前缀，列对应 <code>s2</code> 前缀。`,
    gridHighlight: { i: isForward ? 0 : m, j: isForward ? 0 : n },
    treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, isForward ? 0 : m, isForward ? 0 : n)
  });

  if (isForward) {
    // 顺推: dp[0][0] = true
    dp[0][0] = 1;
    emitStep({
      type: 'init-val',
      line: lineInitBase,
      i: 0,
      j: 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: 'Base Case dp[0][0]=true',
      log: `| 🎬 初始化基底: dp[0][0] = true (两个空串必能交错构成空串)`,
      msg: `初始化基底：<code>dp[0][0] = true (1)</code>（两个空串交错必为空串）。`,
      gridHighlight: { i: 0, j: 0 },
      treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, 0, 0)
    });

    // 初始化首列 (仅用 s1 匹配 s3 前缀)
    for (let i = 1; i <= m; i++) {
      const match = dp[i - 1][0] === 1 && s1[i - 1] === s3[i - 1];
      dp[i][0] = match ? 1 : 0;
      emitStep({
        type: 'border-init',
        line: lineInitCol,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `初始化首列 dp[${i}][0]=${dp[i][0]}`,
        log: `| 🎬 初始化首列: dp[${i}][0] = ${dp[i][0]} (仅由 s1 前缀字符构成 s3 前缀)`,
        msg: `初始化首列：<code>dp[${i}][0] = ${dp[i][0] === 1 ? 'true' : 'false'}</code>（比较 <code>s1[${i - 1}]('${s1[i - 1]}')</code> 与 <code>s3[${i - 1}]('${s3[i - 1]}')</code>）。`,
        gridHighlight: { i, j: 0 },
        treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, i, 0)
      });
    }

    // 初始化首行 (仅用 s2 匹配 s3 前缀)
    for (let j = 1; j <= n; j++) {
      const match = dp[0][j - 1] === 1 && s2[j - 1] === s3[j - 1];
      dp[0][j] = match ? 1 : 0;
      emitStep({
        type: 'border-init',
        line: lineInitRow,
        i: 0,
        j,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `初始化首行 dp[0][${j}]=${dp[0][j]}`,
        log: `| 🎬 初始化首行: dp[0][${j}] = ${dp[0][j]} (仅由 s2 前缀字符构成 s3 前缀)`,
        msg: `初始化首行：<code>dp[0][${j}] = ${dp[0][j] === 1 ? 'true' : 'false'}</code>（比较 <code>s2[${j - 1}]('${s2[j - 1]}')</code> 与 <code>s3[${j - 1}]('${s3[j - 1]}')</code>）。`,
        gridHighlight: { i: 0, j },
        treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, 0, j)
      });
    }

    // 经典嵌套循环正序填表
    for (let i = 1; i <= m; i++) {
      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `外层循环 i=${i} (考察 s1[0..${i - 1}])`,
        log: `| 🔁 外层循环: i = ${i}，当前考察 s1 字符 '${s1[i - 1]}'`,
        msg: `外层循环：<code>i = ${i}</code>，开始逐列递推。`,
        gridHighlight: { i, j: 0 }
      });

      for (let j = 1; j <= n; j++) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `内层循环 j=${j}`,
          log: `| 🔁 内层循环: j = ${j}，当前考察 s2 字符 '${s2[j - 1]}'`,
          msg: `内层循环：<code>j = ${j}</code>，准备推导 <code>dp[${i}][${j}]</code>。`,
          gridHighlight: { i, j }
        });

        const topVal = dp[i - 1][j] ?? 0;
        const leftVal = dp[i][j - 1] ?? 0;
        const pickS1 = topVal === 1 && s1[i - 1] === s3[i + j - 1];
        const pickS2 = leftVal === 1 && s2[j - 1] === s3[i + j - 1];

        emitStep({
          type: 'cond',
          line: lineCheckS1,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: pickS1 ? 's1 比对成功 (来自上方)' : 's1 比对不可达',
          log: `| 🔍 比对 s1: s1[${i - 1}]('${s1[i - 1]}') == s3[${i + j - 1}]('${s3[i + j - 1]}') && dp[${i - 1}][${j}](${topVal}) ➔ ${pickS1}`,
          msg: `考察上方 <code>s1</code> 转移：<code>s1[${i - 1}] == s3[${i + j - 1}] && dp[${i - 1}][${j}]</code> 结果为 <strong>${pickS1}</strong>。`,
          gridHighlight: { i, j }
        });

        emitStep({
          type: 'cond',
          line: lineCheckS2,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: pickS2 ? 's2 比对成功 (来自左侧)' : 's2 比对不可达',
          log: `| 🔍 比对 s2: s2[${j - 1}]('${s2[j - 1]}') == s3[${i + j - 1}]('${s3[i + j - 1]}') && dp[${i}][${j - 1}](${leftVal}) ➔ ${pickS2}`,
          msg: `考察左侧 <code>s2</code> 转移：<code>s2[${j - 1}] == s3[${i + j - 1}] && dp[${i}][${j - 1}]</code> 结果为 <strong>${pickS2}</strong>。`,
          gridHighlight: { i, j }
        });

        const val = (pickS1 || pickS2) ? 1 : 0;
        dp[i][j] = val;

        emitStep({
          type: 'transfer',
          line: lineTransfer,
          i,
          j,
          val,
          topI: i - 1,
          topJ: j,
          leftI: i,
          leftJ: j - 1,
          topVal,
          leftVal,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `转移 dp[${i}][${j}] = ${val === 1 ? 'true' : 'false'}`,
          log: `| 🔄 状态转移: dp[${i}][${j}] = pickS1(${pickS1}) || pickS2(${pickS2}) = ${val === 1 ? 'true' : 'false'}`,
          msg: `状态转移：<code>dp[${i}][${j}] = (s1来源: ${pickS1}) || (s2来源: ${pickS2}) = <strong>${val === 1 ? 'true' : 'false'}</strong></code>。`,
          decisions: [
            { branch: 'pick_s1', valid: pickS1, from: [i - 1, j], desc: `上方 s1 匹配 ('${s1[i - 1]}')` },
            { branch: 'pick_s2', valid: pickS2, from: [i, j - 1], desc: `左侧 s2 匹配 ('${s2[j - 1]}')` }
          ],
          gridHighlight: { i, j },
          treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, i, j)
        });
      }
    }

    // 最终返回右下角答案
    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: m,
      j: n,
      val: dp[m][n] ?? 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `返回最终结果 dp[${m}][${n}] = ${dp[m][n] === 1 ? 'true' : 'false'}`,
      log: `| 🏆 二维 DP 正向递推完成！最终解 dp[${m}][${n}] = ${dp[m][n] === 1 ? 'true' : 'false'}`,
      msg: `🏆 二维填表全部完成！右下角 <code>dp[${m}][${n}] = <strong>${dp[m][n] === 1 ? 'true' : 'false'}</strong></code>。`,
      gridHighlight: { i: m, j: n },
      treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, m, n)
    });
  } else {
    // 逆推: dp[m][n] = true
    dp[m][n] = 1;
    emitStep({
      type: 'init-val',
      line: lineInitBase,
      i: m,
      j: n,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: 'Base Case dp[m][n]=true',
      log: `| 🎬 初始化逆推基底: dp[${m}][${n}] = true (空后缀必能交错构成空后缀)`,
      msg: `初始化逆推基底：<code>dp[${m}][${n}] = true (1)</code>。`,
      gridHighlight: { i: m, j: n },
      treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, m, n)
    });

    // 初始化末列 (仅用 s1 后缀匹配 s3 后缀)
    for (let i = m - 1; i >= 0; i--) {
      const match = dp[i + 1][n] === 1 && s1[i] === s3[i + n];
      dp[i][n] = match ? 1 : 0;
      emitStep({
        type: 'border-init',
        line: lineInitCol,
        i,
        j: n,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `初始化末列 dp[${i}][${n}]=${dp[i][n]}`,
        log: `| 🎬 逆推初始化末列: dp[${i}][${n}] = ${dp[i][n]}`,
        msg: `逆推初始化末列：<code>dp[${i}][${n}] = ${dp[i][n] === 1 ? 'true' : 'false'}</code>。`,
        gridHighlight: { i, j: n },
        treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, i, n)
      });
    }

    // 初始化末行 (仅用 s2 后缀匹配 s3 后缀)
    for (let j = n - 1; j >= 0; j--) {
      const match = dp[m][j + 1] === 1 && s2[j] === s3[m + j];
      dp[m][j] = match ? 1 : 0;
      emitStep({
        type: 'border-init',
        line: lineInitRow,
        i: m,
        j,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `初始化末行 dp[${m}][${j}]=${dp[m][j]}`,
        log: `| 🎬 逆推初始化末行: dp[${m}][${j}] = ${dp[m][j]}`,
        msg: `逆推初始化末行：<code>dp[${m}][${j}] = ${dp[m][j] === 1 ? 'true' : 'false'}</code>。`,
        gridHighlight: { i: m, j },
        treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, m, j)
      });
    }

    // 逆序嵌套循环倒序填表
    for (let i = m - 1; i >= 0; i--) {
      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: n,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `逆推外层循环 i=${i}`,
        log: `| 🔁 逆推外层循环: i = ${i}，当前考察 s1[${i}]('${s1[i]}')`,
        msg: `逆推外层循环：<code>i = ${i}</code>，开始自右向左填表。`,
        gridHighlight: { i, j: n }
      });

      for (let j = n - 1; j >= 0; j--) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `逆推内层循环 j=${j}`,
          log: `| 🔁 逆推内层循环: j = ${j}，当前考察 s2[${j}]('${s2[j]}')`,
          msg: `逆推内层循环：<code>j = ${j}</code>，准备倒序推导 <code>dp[${i}][${j}]</code>。`,
          gridHighlight: { i, j }
        });

        const downVal = dp[i + 1][j] ?? 0;
        const rightVal = dp[i][j + 1] ?? 0;
        const pickS1 = downVal === 1 && s1[i] === s3[i + j];
        const pickS2 = rightVal === 1 && s2[j] === s3[i + j];

        emitStep({
          type: 'cond',
          line: lineCheckS1,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: pickS1 ? 's1 逆向比对成功 (来自下方)' : 's1 逆向比对不可达',
          log: `| 🔍 逆向比对 s1: s1[${i}]('${s1[i]}') == s3[${i + j}]('${s3[i + j]}') && dp[${i + 1}][${j}](${downVal}) ➔ ${pickS1}`,
          msg: `考察下方 <code>s1</code> 逆向转移：<code>s1[${i}] == s3[${i + j}] && dp[${i + 1}][${j}]</code> 结果为 <strong>${pickS1}</strong>。`,
          gridHighlight: { i, j }
        });

        emitStep({
          type: 'cond',
          line: lineCheckS2,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: pickS2 ? 's2 逆向比对成功 (来自右侧)' : 's2 逆向比对不可达',
          log: `| 🔍 逆向比对 s2: s2[${j}]('${s2[j]}') == s3[${i + j}]('${s3[i + j]}') && dp[${i}][${j + 1}](${rightVal}) ➔ ${pickS2}`,
          msg: `考察右侧 <code>s2</code> 逆向转移：<code>s2[${j}] == s3[${i + j}] && dp[${i}][${j + 1}]</code> 结果为 <strong>${pickS2}</strong>。`,
          gridHighlight: { i, j }
        });

        const val = (pickS1 || pickS2) ? 1 : 0;
        dp[i][j] = val;

        emitStep({
          type: 'transfer',
          line: lineTransfer,
          i,
          j,
          val,
          topI: i + 1,
          topJ: j,
          leftI: i,
          leftJ: j + 1,
          topVal: downVal,
          leftVal: rightVal,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `逆推转移 dp[${i}][${j}] = ${val === 1 ? 'true' : 'false'}`,
          log: `| 🔄 逆推转移: dp[${i}][${j}] = pickS1(${pickS1}) || pickS2(${pickS2}) = ${val === 1 ? 'true' : 'false'}`,
          msg: `逆推转移：<code>dp[${i}][${j}] = (s1来源: ${pickS1}) || (s2来源: ${pickS2}) = <strong>${val === 1 ? 'true' : 'false'}</strong></code>。`,
          decisions: [
            { branch: 'pick_s1', valid: pickS1, from: [i + 1, j], desc: `下方 s1 匹配 ('${s1[i]}')` },
            { branch: 'pick_s2', valid: pickS2, from: [i, j + 1], desc: `右侧 s2 匹配 ('${s2[j]}')` }
          ],
          gridHighlight: { i, j },
          treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, i, j)
        });
      }
    }

    // 最终返回左上角答案
    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: 0,
      j: 0,
      val: dp[0][0] ?? 0,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `返回最终结果 dp[0][0] = ${dp[0][0] === 1 ? 'true' : 'false'}`,
      log: `| 🏆 二维 DP 逆推填表完成！最终解 dp[0][0] = ${dp[0][0] === 1 ? 'true' : 'false'}`,
      msg: `🏆 二维逆推填表完成！左上角 <code>dp[0][0] = <strong>${dp[0][0] === 1 ? 'true' : 'false'}</strong></code>。`,
      gridHighlight: { i: 0, j: 0 },
      treeRoot: build2DDPDependencyTree(m + 1, n + 1, direction, undefined, dp, 0, 0)
    });
  }

  return steps;
}

// ---------------------------------------------------------------------------
// 阶段 4: 一维空间压缩优化编译器
// ---------------------------------------------------------------------------

export function compileInterleavingStringStage4(
  model: IYamlAlgorithmModel,
  anchorMap: Record<string, number> = {},
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const { s1, s2, s3, m, n } = extractParams(model);
  const isForward = direction !== 'reverse';
  const steps: UniversalStep[] = [];

  const lineGuard = anchorMap.guard || 2;
  const lineInit = anchorMap.init || 3;
  const lineInitVal = anchorMap.init_val || 4;
  const lineInitRow = anchorMap.init_row || 5;
  const lineLoopI = anchorMap.loop_i || 6;
  const lineLoopJ = anchorMap.loop_j || 7;
  const lineTransfer = anchorMap.transfer || 8;
  const lineReturn = anchorMap.return || 9;

  // 1. 守卫检查
  if (m + n !== s3.length) {
    steps.push({
      type: 'guard',
      flowPhase: 'terminal',
      line: lineGuard,
      tag: '长度不守恒提前返回',
      log: `| 🛑 s1.length(${m}) + s2.length(${n}) != s3.length(${s3.length})，总长不守恒直接返回 false`,
      msg: `字符串长度总和不守恒，直接返回 <strong>false</strong>。`,
      i: 0,
      j: 0,
      grid: [new Array(n + 1).fill(null)]
    });
    return steps;
  }

  const dp1d: (number | null)[] = new Array(n + 1).fill(null);

  const emitStep = (stepData: any) => {
    const isComparing = stepData.type === 'transfer' || stepData.type === 'cond';
    const curI = isForward ? Math.max(0, Math.min(m - 1, stepData.i - 1)) : Math.max(0, Math.min(m - 1, stepData.i));
    const curJ = isForward ? Math.max(0, Math.min(n - 1, stepData.j - 1)) : Math.max(0, Math.min(n - 1, stepData.j));

    steps.push({
      s: s1,
      t: s2,
      s1,
      s2,
      s3,
      curI,
      curJ,
      label1: '字符串 s1',
      label2: '字符串 s2',
      label3: '交错串 s3',
      isComparing,
      dp1d: Array.from(dp1d),
      ...stepData
    });
  };

  // Step 0: init 表格创建帧 (严格纯净 null，且为 1D 数组 [ [...] ])
  emitStep({
    type: 'init',
    line: lineInit,
    i: isForward ? 0 : m,
    j: isForward ? 0 : n,
    grid: [new Array(n + 1).fill(null)],
    tag: `创建一维滚动数组 dp[0..${n}]`,
    log: `| ⚡ 空间压缩：仅维护一维数组 dp[${n + 1}]，空间复杂度从 O(m×n) 降至 O(n)`,
    msg: `创建大小为 <code>${n + 1}</code> 的一维滚动向量，空间复杂度严格压缩至 <strong>O(n)</strong>。`,
    gridHighlight: { i: 0, j: isForward ? 0 : n },
    actorState: { currentSlot: isForward ? 0 : n, action: 'idle' }
  });

  if (isForward) {
    // 顺推: dp[0] = 1
    dp1d[0] = 1;
    for (let j = 1; j <= n; j++) dp1d[j] = 0;

    emitStep({
      type: 'init-val',
      line: lineInitVal,
      i: 0,
      j: 0,
      grid: [Array.from(dp1d)],
      tag: '初始化基底 dp[0]=true',
      log: `| 🎬 初始化基底: dp[0] = true`,
      msg: `初始化基底：<code>dp[0] = true (1)</code>。`,
      gridHighlight: { i: 0, j: 0 },
      actorState: { currentSlot: 0, action: 'idle' }
    });

    // 初始化第 0 行: dp[j] = dp[j - 1] && s2[j - 1] == s3[j - 1]
    for (let j = 1; j <= n; j++) {
      const match = (dp1d[j - 1] === 1) && s2[j - 1] === s3[j - 1];
      dp1d[j] = match ? 1 : 0;
      emitStep({
        type: 'border-init',
        line: lineInitRow,
        i: 0,
        j,
        grid: [Array.from(dp1d)],
        tag: `初始化行 dp[${j}]=${dp1d[j]}`,
        log: `| 🎬 空间压缩初始化行: dp[${j}] = ${dp1d[j]}`,
        msg: `初始化首行状态：<code>dp[${j}] = ${dp1d[j] === 1 ? 'true' : 'false'}</code>。`,
        gridHighlight: { i: 0, j },
        actorState: { currentSlot: j, jumpFrom: j - 1, action: 'walk' }
      });
    }

    // 逐行滚动递推
    for (let i = 1; i <= m; i++) {
      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: 0,
        grid: [Array.from(dp1d)],
        tag: `第 ${i} 轮滚动迭代 (考察 s1[${i - 1}])`,
        log: `| 🔁 一维滚动外层: i = ${i}，更新首列基底`,
        msg: `第 <code>${i}</code> 轮迭代：更新首列 <code>dp[0]</code> 并正序滚动推导。`,
        gridHighlight: { i, j: 0 },
        actorState: { currentSlot: 0, action: 'idle' }
      });

      // 更新首列 dp[0]
      dp1d[0] = (dp1d[0] === 1 && s1[i - 1] === s3[i - 1]) ? 1 : 0;

      for (let j = 1; j <= n; j++) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: [Array.from(dp1d)],
          tag: `槽位 j=${j}`,
          log: `| 🔁 空间压缩考察槽位: j = ${j}`,
          msg: `考察槽位 <code>j = ${j}</code>，由上方旧值 <code>dp[${j}]</code> 与左侧新值 <code>dp[${j - 1}]</code> 联合推导。`,
          gridHighlight: { i, j },
          actorState: { currentSlot: j, jumpFrom: j - 1, action: 'walk' }
        });

        const prevUp = dp1d[j] ?? 0;
        const prevLeft = dp1d[j - 1] ?? 0;
        const pickS1 = prevUp === 1 && s1[i - 1] === s3[i + j - 1];
        const pickS2 = prevLeft === 1 && s2[j - 1] === s3[i + j - 1];
        const val = (pickS1 || pickS2) ? 1 : 0;
        dp1d[j] = val;

        emitStep({
          type: 'transfer',
          line: lineTransfer,
          i,
          j,
          val,
          topVal: prevUp,
          leftVal: prevLeft,
          grid: [Array.from(dp1d)],
          tag: `滚动更新 dp[${j}] = ${val === 1 ? 'true' : 'false'}`,
          log: `| 🔄 空间压缩更新: dp[${j}] = pickS1(${pickS1}) || pickS2(${pickS2}) = ${val === 1 ? 'true' : 'false'}`,
          msg: `空间压缩状态更新：<code>dp[${j}] = ${val === 1 ? 'true' : 'false'}</code>。`,
          decisions: [
            { branch: 'pick_s1', valid: pickS1, desc: `上方旧值 dp[${j}](${prevUp}) && s1匹配` },
            { branch: 'pick_s2', valid: pickS2, desc: `左侧新值 dp[${j - 1}](${prevLeft}) && s2匹配` }
          ],
          gridHighlight: { i, j },
          actorState: { currentSlot: j, jumpFrom: j - 1, action: 'jump' }
        });
      }
    }

    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: m,
      j: n,
      val: dp1d[n] ?? 0,
      grid: [Array.from(dp1d)],
      tag: `最终压缩结果: dp[${n}] = ${dp1d[n] === 1 ? 'true' : 'false'}`,
      log: `| 🏆 一维空间压缩求解完成！最终解 dp[${n}] = ${dp1d[n] === 1 ? 'true' : 'false'}`,
      msg: `🏆 一维滚动压缩全部完成！末位 <code>dp[${n}] = <strong>${dp1d[n] === 1 ? 'true' : 'false'}</strong></code>。`,
      gridHighlight: { i: 0, j: n },
      actorState: { currentSlot: n, action: 'idle' }
    });
  } else {
    // 逆推: dp[n] = 1
    dp1d[n] = 1;
    for (let j = 0; j < n; j++) dp1d[j] = 0;

    emitStep({
      type: 'init-val',
      line: lineInitVal,
      i: m,
      j: n,
      grid: [Array.from(dp1d)],
      tag: '初始化逆推基底 dp[n]=true',
      log: `| 🎬 初始化逆推基底: dp[${n}] = true`,
      msg: `初始化逆推基底：<code>dp[${n}] = true (1)</code>。`,
      gridHighlight: { i: 0, j: n },
      actorState: { currentSlot: n, action: 'idle' }
    });

    // 初始化第 m 行逆向: dp[j] = dp[j + 1] && s2[j] == s3[m + j]
    for (let j = n - 1; j >= 0; j--) {
      const match = (dp1d[j + 1] === 1) && s2[j] === s3[m + j];
      dp1d[j] = match ? 1 : 0;
      emitStep({
        type: 'border-init',
        line: lineInitRow,
        i: m,
        j,
        grid: [Array.from(dp1d)],
        tag: `逆推初始化行 dp[${j}]=${dp1d[j]}`,
        log: `| 🎬 空间压缩逆推初始化行: dp[${j}] = ${dp1d[j]}`,
        msg: `逆推初始化末行状态：<code>dp[${j}] = ${dp1d[j] === 1 ? 'true' : 'false'}</code>。`,
        gridHighlight: { i: 0, j },
        actorState: { currentSlot: j, jumpFrom: j + 1, action: 'walk' }
      });
    }

    // 逐行倒序滚动递推
    for (let i = m - 1; i >= 0; i--) {
      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: n,
        grid: [Array.from(dp1d)],
        tag: `逆推外层 i=${i}`,
        log: `| 🔁 一维逆推滚动外层: i = ${i}，更新末列基底`,
        msg: `逆推第 <code>${i}</code> 轮迭代：更新末列 <code>dp[${n}]</code> 并倒序滚动推导。`,
        gridHighlight: { i, j: n },
        actorState: { currentSlot: n, action: 'idle' }
      });

      // 更新末列 dp[n]
      dp1d[n] = (dp1d[n] === 1 && s1[i] === s3[i + n]) ? 1 : 0;

      for (let j = n - 1; j >= 0; j--) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: [Array.from(dp1d)],
          tag: `逆推槽位 j=${j}`,
          log: `| 🔁 空间压缩逆推考察槽位: j = ${j}`,
          msg: `逆推考察槽位 <code>j = ${j}</code>，由下方旧值 <code>dp[${j}]</code> 与右侧新值 <code>dp[${j + 1}]</code> 联合推导。`,
          gridHighlight: { i, j },
          actorState: { currentSlot: j, jumpFrom: j + 1, action: 'walk' }
        });

        const prevDown = dp1d[j] ?? 0;
        const prevRight = dp1d[j + 1] ?? 0;
        const pickS1 = prevDown === 1 && s1[i] === s3[i + j];
        const pickS2 = prevRight === 1 && s2[j] === s3[i + j];
        const val = (pickS1 || pickS2) ? 1 : 0;
        dp1d[j] = val;

        emitStep({
          type: 'transfer',
          line: lineTransfer,
          i,
          j,
          val,
          topVal: prevDown,
          leftVal: prevRight,
          grid: [Array.from(dp1d)],
          tag: `逆推滚动更新 dp[${j}] = ${val === 1 ? 'true' : 'false'}`,
          log: `| 🔄 空间压缩逆推更新: dp[${j}] = pickS1(${pickS1}) || pickS2(${pickS2}) = ${val === 1 ? 'true' : 'false'}`,
          msg: `逆推空间压缩状态更新：<code>dp[${j}] = ${val === 1 ? 'true' : 'false'}</code>。`,
          decisions: [
            { branch: 'pick_s1', valid: pickS1, desc: `下方旧值 dp[${j}](${prevDown}) && s1匹配` },
            { branch: 'pick_s2', valid: pickS2, desc: `右侧新值 dp[${j + 1}](${prevRight}) && s2匹配` }
          ],
          gridHighlight: { i, j },
          actorState: { currentSlot: j, jumpFrom: j + 1, action: 'jump' }
        });
      }
    }

    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: 0,
      j: 0,
      val: dp1d[0] ?? 0,
      grid: [Array.from(dp1d)],
      tag: `最终逆推压缩结果: dp[0] = ${dp1d[0] === 1 ? 'true' : 'false'}`,
      log: `| 🏆 一维空间压缩逆推求解完成！最终解 dp[0] = ${dp1d[0] === 1 ? 'true' : 'false'}`,
      msg: `🏆 一维逆推滚动压缩全部完成！首位 <code>dp[0] = <strong>${dp1d[0] === 1 ? 'true' : 'false'}</strong></code>。`,
      gridHighlight: { i: 0, j: 0 },
      actorState: { currentSlot: 0, action: 'idle' }
    });
  }

  return steps;
}
