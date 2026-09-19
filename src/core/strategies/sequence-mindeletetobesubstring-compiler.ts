import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { cloneTree, build2DDPDependencyTree } from './strategy-helpers';

/**
 * 最少删除使成为子串 (MinDeleteToBeSubstring) 四阶段全演化步骤编译器
 * 对应：左程云《算法通关课》第 068 讲题目 4
 *
 * 核心设计：
 * - 状态定义：dp[i][j] 表示 s1 的前 i 个字符变成以 s2 的第 j 个字符结尾的连续子串的最少删除字符数
 * - 阶段 1 & 2: 严格树形 DFS 演化，保留匹配与删除分支，备忘录剪枝，零跳步代码对齐
 * - 阶段 3: 严格 (n+1) × (m+1) 二维状态网格拓扑填表，Step 0 纯净 null 防御，双向顺逆推对称，末行取 min
 * - 阶段 4: 一维滚动空间压缩，(n+1)*(m+1) -> (m+1)，利用 leftUp 寄存器暂存对角线值，物理槽位跳跃
 */

function extractParams(model: IYamlAlgorithmModel): { s1: string; s2: string; n: number; m: number } {
  const p = (model.defaultParams || {}) as any;
  const s1 = String(p.s1 || p.word1 || 'abdf');
  const s2 = String(p.s2 || p.word2 || 'dfxxabYYabfzz');
  return { s1, s2, n: s1.length, m: s2.length };
}

// ---------------------------------------------------------------------------
// 阶段 1 & 2: 递归与记忆化搜索编译器
// ---------------------------------------------------------------------------

export function compileMinDeleteStage1or2(
  model: IYamlAlgorithmModel,
  isMemo: boolean = false,
  anchorMap: Record<string, number> = {},
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const { s1, s2, n, m } = extractParams(model);
  const isForward = direction !== 'reverse';
  const steps: UniversalStep[] = [];

  const lineGuard = anchorMap.guard || 2;
  const lineLoopJ = anchorMap.loop_j || 5;
  const lineCallDfs = anchorMap.call_dfs || 6;
  const lineReturn = anchorMap.return || 7;
  const lineEntry = anchorMap.entry || 9;
  const lineBoundaryI = anchorMap.boundary_i || 10;
  const lineBoundaryJ = anchorMap.boundary_j || 11;
  const lineCacheHit = anchorMap.cache_hit || 12;
  const lineCondMatch = anchorMap.cond_match || 13;
  const lineBranchMatch = anchorMap.branch_match || 14;
  const lineBranchDelete = anchorMap.branch_delete || 16;
  const lineCacheWrite = anchorMap.cache_write || 18;

  // 1. 守卫检查
  if (n === 0 || m === 0) {
    steps.push({
      type: 'guard',
      flowPhase: 'terminal',
      line: lineGuard,
      tag: '空串基底',
      log: '| 🎬 任一字符串为空，最少删除 0 次',
      msg: '任一字符串为空，直接返回 <strong>0</strong>。',
      i: 0,
      j: 0,
      grid: [new Array(m + 1).fill(null)]
    });
    return steps;
  }

  const gridState: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(null)
  );
  const activeStack: string[] = [];
  const visitedCells: Set<string> = new Set();
  const memoCache: Record<string, number> = {};
  let nodeIdCounter = 0;
  let callCount = 0;

  const rootNode: UniversalTreeNode = {
    id: `node-${++nodeIdCounter}`,
    r: isForward ? n : 0,
    c: isForward ? m : 0,
    val: `minDelete("${s1}", "${s2}")`,
    status: 'current',
    children: []
  };

  const emitStep = (stepData: any) => {
    const isComparing = stepData.type === 'cond' || stepData.type === 'branch-call';
    const curI = isForward ? stepData.i : Math.max(0, stepData.i - 1);
    const curJ = isForward ? stepData.j : Math.max(0, stepData.j - 1);

    steps.push({
      s: s1,
      t: s2,
      s1,
      s2,
      curI,
      curJ,
      label1: '母串 s1 (待删除)',
      label2: '目标 s2 (连续子串)',
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

    // 1. 入口帧
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
        ? `| 📥 进入 dfs(i=${i}, j=${j}) [考察 s1[0..${i - 1}] 与 s2 结尾 ${j}]`
        : `| 📥 进入 dfs(i=${i}, j=${j}) [考察 s1[${i}..] 与 s2 开头 ${j}]`,
      msg: isForward
        ? `📥 进入 <code>dfs(i=${i}, j=${j})</code>：求解 <code>s1[0..${i - 1}]</code> 变成以 <code>s2[${j - 1}]</code> 结尾子串的最少删除数。`
        : `📥 逆推进入 <code>dfs(i=${i}, j=${j})</code>。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    // 2. 基底判定
    if (isForward) {
      if (i === 0) {
        gridState[i][j] = 0;
        currentNode.status = 'base';
        currentNode.tag = '= 0 (空串)';
        emitStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryI,
          tag: 'Base Case i=0: 删除0次',
          log: `| 🎬 满足 Base Case: s1 变为空串，删除代价为 0`,
          msg: `🎬 <code>i = 0</code>：<code>s1</code> 字符已全部处理完，空串是任意结尾的合法子串，返回代价 <strong>0</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return 0;
      }
      if (j === 0) {
        gridState[i][j] = i;
        currentNode.status = 'base';
        currentNode.tag = `= ${i} (全删)`;
        emitStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryJ,
          tag: `Base Case j=0: 删${i}个字符`,
          log: `| 🎬 满足 Base Case: 目标子串为空，必须将 s1 当前 ${i} 个字符全删`,
          msg: `🎬 <code>j = 0</code>：目标连续子串为空，只能将 <code>s1</code> 前 <code>${i}</code> 个字符全部删去，返回代价 <strong>${i}</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return i;
      }
    } else {
      if (i === n) {
        gridState[i][j] = 0;
        currentNode.status = 'base';
        currentNode.tag = '= 0';
        emitStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryI,
          tag: 'Base Case i=n: 删除0次',
          log: `| 🎬 逆推满足 Base Case: s1 后缀为空，删除代价为 0`,
          msg: `🎬 <code>i = ${n}</code>：后缀为空，返回 <strong>0</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return 0;
      }
      if (j === m) {
        const cost = n - i;
        gridState[i][j] = cost;
        currentNode.status = 'base';
        currentNode.tag = `= ${cost}`;
        emitStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          i,
          j,
          grid: JSON.parse(JSON.stringify(gridState)),
          activeStack: [...activeStack],
          visited: [...visitedCells],
          line: lineBoundaryJ,
          tag: `Base Case j=m: 删${cost}个`,
          log: `| 🎬 逆推满足 Base Case: s2 字符耗尽，删除 s1 后缀 ${cost} 个字符`,
          msg: `🎬 <code>j = ${m}</code>：返回剩余字符数 <strong>${cost}</strong>。`,
          gridHighlight: { i, j },
          activeNodeId: currentNode.id,
          treeRoot: cloneTree(rootNode)
        });
        activeStack.pop();
        return cost;
      }
    }

    // 3. 备忘录命中剪枝
    if (isMemo && memoCache[key] !== undefined) {
      const cached = memoCache[key];
      currentNode.status = 'pruned';
      currentNode.tag = `⚡=${cached}`;
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
        log: `| ⚡ 【备忘录命中】memo[${i}][${j}] 已缓存值 ${cached}，直接返回`,
        msg: `⚡ 【备忘录剪枝】<code>memo[${i}][${j}]</code> 已计算过为 <strong>${cached}</strong>，直接剪枝返回！`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });
      activeStack.pop();
      return cached;
    }

    // 4. 字符比对与分支展开
    const c1 = isForward ? s1[i - 1] : s1[i];
    const c2 = isForward ? s2[j - 1] : s2[j];
    const isMatch = c1 === c2;

    emitStep({
      type: 'cond',
      i,
      j,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [...activeStack],
      visited: [...visitedCells],
      line: lineCondMatch,
      tag: isMatch ? `字符匹配 '${c1}'=='${c2}'` : `字符不匹配 '${c1}'!='${c2}'`,
      log: isForward
        ? `| 🔍 比对字符: s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}'): ${isMatch ? '匹配相同！' : '不匹配！'}`
        : `| 🔍 逆推比对: s1[${i}]('${c1}') 与 s2[${j}]('${c2}'): ${isMatch ? '匹配相同！' : '不匹配！'}`,
      msg: isMatch
        ? `字符匹配：<code>'${c1}' == '${c2}'</code>，选择保留该字符对齐子串末位，代价继承前驱子串。`
        : `字符不匹配：<code>'${c1}' != '${c2}'</code>，当前字符无法对齐子串末位，必须将 <code>s1</code> 字符删去。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    let res: number;

    if (isMatch) {
      const nextI = isForward ? i - 1 : i + 1;
      const nextJ = isForward ? j - 1 : j + 1;
      const childMatch: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: nextI,
        c: nextJ,
        val: `保留'${c1}' ➔ dfs(${nextI},${nextJ})`,
        edgeLabel: `保留'${c1}'`,
        status: 'current',
        children: []
      };
      currentNode.children.push(childMatch);

      emitStep({
        type: 'branch-call',
        flowPhase: 'forward',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineBranchMatch,
        tag: '进入 [保留匹配] 分支',
        log: `| ➡️ 保留字符 '${c1}'，递归调用 dfs(${nextI}, ${nextJ})`,
        msg: `➡️ 保留匹配字符 <code>'${c1}'</code>，递归进入 <code>dfs(${nextI}, ${nextJ})</code>。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      res = dfs(nextI, nextJ, childMatch);
    } else {
      const nextI = isForward ? i - 1 : i + 1;
      const nextJ = j;
      const childDel: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: nextI,
        c: nextJ,
        val: `删除'${c1}' ➔ dfs(${nextI},${nextJ})`,
        edgeLabel: `删除'${c1}'(+1)`,
        status: 'current',
        children: []
      };
      currentNode.children.push(childDel);

      emitStep({
        type: 'branch-call',
        flowPhase: 'forward',
        i,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        activeStack: [...activeStack],
        visited: [...visitedCells],
        line: lineBranchDelete,
        tag: '进入 [删除字符] 分支',
        log: `| ➡️ 删去 s1 字符 '${c1}'，递归调用 dfs(${nextI}, ${nextJ}) 并代价+1`,
        msg: `➡️ 字符不匹配，删去 <code>'${c1}'</code>，递归进入 <code>dfs(${nextI}, ${nextJ})</code> 代价累加 1。`,
        gridHighlight: { i, j },
        activeNodeId: currentNode.id,
        treeRoot: cloneTree(rootNode)
      });

      res = dfs(nextI, nextJ, childDel) + 1;
    }

    gridState[i][j] = res;
    if (isMemo) {
      memoCache[key] = res;
    }

    currentNode.status = 'visited';
    currentNode.tag = `= ${res}`;

    emitStep({
      type: 'combine',
      flowPhase: 'backtrack',
      i,
      j,
      grid: JSON.parse(JSON.stringify(gridState)),
      activeStack: [...activeStack],
      visited: [...visitedCells],
      line: isMemo ? lineCacheWrite : lineBranchDelete,
      tag: `回溯结果 dfs(${i}, ${j}) = ${res}`,
      log: `| ✨ 回溯汇总: dfs(${i}, ${j}) 计算完成，最少删除 ${res} 个字符${isMemo ? ' [存入备忘录]' : ''}`,
      msg: `✨ 决策回溯：<code>dfs(${i}, ${j}) = <strong>${res}</strong></code>。`,
      gridHighlight: { i, j },
      activeNodeId: currentNode.id,
      treeRoot: cloneTree(rootNode)
    });

    activeStack.pop();
    return res;
  }

  // 遍历收集答案
  let globalAns = n;
  let bestIdx = 1;

  if (isForward) {
    for (let j = 1; j <= m; j++) {
      emitStep({
        type: 'loop-j',
        line: lineLoopJ,
        i: n,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `考察以 s2[${j - 1}]('${s2[j - 1]}') 结尾`,
        log: `| 🔁 枚举结尾: 考察子串以 s2[${j - 1}]('${s2[j - 1]}') 结尾的情况`,
        msg: `外层枚举：考察目标连续子串以 <code>s2[${j - 1}] = '${s2[j - 1]}'</code> 结尾的情况。`,
        gridHighlight: { i: n, j },
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode)
      });

      const childJ: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: n,
        c: j,
        val: `以 s2[${j - 1}] 结尾`,
        status: 'current',
        children: []
      };
      rootNode.children.push(childJ);

      emitStep({
        type: 'branch-call',
        line: lineCallDfs,
        i: n,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `调用 dfs(${n}, ${j})`,
        log: `| 🚀 调用 dfs(${n}, ${j}) 求解`,
        msg: `调用 <code>dfs(${n}, ${j})</code> 计算变换所需的最少删除数。`,
        gridHighlight: { i: n, j },
        activeNodeId: childJ.id,
        treeRoot: cloneTree(rootNode)
      });

      const curAns = dfs(n, j, childJ);
      if (curAns < globalAns) {
        globalAns = curAns;
        bestIdx = j;
      }
    }
  } else {
    for (let j = 0; j < m; j++) {
      emitStep({
        type: 'loop-j',
        line: lineLoopJ,
        i: 0,
        j,
        grid: JSON.parse(JSON.stringify(gridState)),
        tag: `逆推考察以 s2[${j}]('${s2[j]}') 开头`,
        log: `| 🔁 逆推枚举: 考察子串以 s2[${j}]('${s2[j]}') 开头的情况`,
        msg: `逆推外层枚举：考察目标子串以 <code>s2[${j}] = '${s2[j]}'</code> 开头的情况。`,
        gridHighlight: { i: 0, j },
        activeNodeId: rootNode.id,
        treeRoot: cloneTree(rootNode)
      });

      const childJ: UniversalTreeNode = {
        id: `node-${++nodeIdCounter}`,
        r: 0,
        c: j,
        val: `以 s2[${j}] 开头`,
        status: 'current',
        children: []
      };
      rootNode.children.push(childJ);

      const curAns = dfs(0, j, childJ);
      if (curAns < globalAns) {
        globalAns = curAns;
        bestIdx = j;
      }
    }
  }

  emitStep({
    type: 'return',
    flowPhase: 'terminal',
    i: isForward ? n : 0,
    j: bestIdx,
    grid: JSON.parse(JSON.stringify(gridState)),
    activeStack: [],
    visited: [...visitedCells],
    line: lineReturn,
    tag: `全局最少删除: ${globalAns}`,
    log: `| 🏆 计算完成！最少删除 ${globalAns} 个字符即可成为 s2 的子串`,
    msg: `🏆 演化计算完成！<code>s1 = "${s1}"</code> 最少只需删除 <strong>${globalAns}</strong> 个字符，即可成为 <code>s2 = "${s2}"</code> 的连续子串。`,
    gridHighlight: { i: isForward ? n : 0, j: bestIdx },
    activeNodeId: rootNode.id,
    treeRoot: cloneTree(rootNode)
  });

  return steps;
}

// ---------------------------------------------------------------------------
// 阶段 3: 二维状态网格递推填表编译器
// ---------------------------------------------------------------------------

export function compileMinDeleteStage3(
  model: IYamlAlgorithmModel,
  anchorMap: Record<string, number> = {},
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const { s1, s2, n, m } = extractParams(model);
  const isForward = direction !== 'reverse';
  const steps: UniversalStep[] = [];

  const lineGuard = anchorMap.guard || 2;
  const lineInit = anchorMap.init || 4;
  const lineInitCol = anchorMap.init_col || 5;
  const lineLoopI = anchorMap.loop_i || 8;
  const lineLoopJ = anchorMap.loop_j || 9;
  const lineCheck = anchorMap.check || 10;
  const lineTransferMatch = anchorMap.transfer_match || 11;
  const lineTransferDelete = anchorMap.transfer_delete || 13;
  const lineFindMin = anchorMap.find_min || 17;
  const lineReturn = anchorMap.return || 21;

  if (n === 0 || m === 0) {
    steps.push({
      type: 'guard',
      flowPhase: 'terminal',
      line: lineGuard,
      tag: '空串基底',
      log: '| 🎬 任一字符串为空，返回 0',
      msg: '任一字符串为空，直接返回 <strong>0</strong>。',
      i: 0,
      j: 0,
      grid: [new Array(m + 1).fill(null)]
    });
    return steps;
  }

  // 架构死规矩：Step 0 纯净 null 防御
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(null)
  );

  const emitStep = (stepData: any) => {
    const isComparing = stepData.type === 'transfer' || stepData.type === 'cond';
    const curI = isForward ? Math.max(0, Math.min(n - 1, stepData.i - 1)) : Math.max(0, Math.min(n - 1, stepData.i));
    const curJ = isForward ? Math.max(0, Math.min(m - 1, stepData.j - 1)) : Math.max(0, Math.min(m - 1, stepData.j));

    steps.push({
      s: s1,
      t: s2,
      s1,
      s2,
      curI,
      curJ,
      label1: '母串 s1 (待删除)',
      label2: '目标 s2 (连续子串)',
      isComparing,
      ...stepData
    });
  };

  // Step 0: init 表格创建帧 (纯净 null)
  emitStep({
    type: 'init',
    line: lineInit,
    i: isForward ? 0 : n,
    j: isForward ? 0 : m,
    grid: JSON.parse(JSON.stringify(dp)),
    tag: '创建二维 DP 表格',
    log: `| 📦 创建 (n+1)×(m+1) = ${n + 1}×${m + 1} 的二维状态网格，全格初始为 null`,
    msg: `创建 <code>${n + 1}×${m + 1}</code> 的二维 DP 表格。行代表 <code>s1</code> 前缀，列代表以 <code>s2[j-1]</code> 结尾的子串。`,
    gridHighlight: { i: isForward ? 0 : n, j: isForward ? 0 : m },
    treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, isForward ? 0 : n, isForward ? 0 : m)
  });

  if (isForward) {
    // 顺推初始化：首行 dp[0][j] = 0 (空串匹配任意结尾子串无需删除)
    for (let j = 0; j <= m; j++) {
      dp[0][j] = 0;
    }

    // 初始化首列 dp[i][0] = i (目标为空串，必须把 s1 的前 i 个字符全部删去)
    for (let i = 1; i <= n; i++) {
      dp[i][0] = i;
      emitStep({
        type: 'border-init',
        line: lineInitCol,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `初始化首列 dp[${i}][0] = ${i}`,
        log: `| 🎬 初始化首列: dp[${i}][0] = ${i} (删去 s1 前 ${i} 个字符以匹配空子串)`,
        msg: `初始化首列：<code>dp[${i}][0] = ${i}</code>（目标子串为空，必须将 <code>s1[0..${i - 1}]</code> 全部删除）。`,
        gridHighlight: { i, j: 0 },
        treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, i, 0)
      });
    }

    // 经典嵌套循环正序填表
    for (let i = 1; i <= n; i++) {
      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: 0,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `外层循环 i=${i} (处理 s1[${i - 1}]='${s1[i - 1]}')`,
        log: `| 🔁 外层循环: i = ${i}，当前字符 s1[${i - 1}] = '${s1[i - 1]}'`,
        msg: `外层循环：<code>i = ${i}</code>，考察字符 <code>s1[${i - 1}] = '${s1[i - 1]}'</code>。`,
        gridHighlight: { i, j: 0 }
      });

      for (let j = 1; j <= m; j++) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `内层循环 j=${j} (对齐 s2[${j - 1}]='${s2[j - 1]}')`,
          log: `| 🔁 内层循环: j = ${j}，目标子串结尾 s2[${j - 1}] = '${s2[j - 1]}'`,
          msg: `内层循环：<code>j = ${j}</code>，准备推导 <code>dp[${i}][${j}]</code>。`,
          gridHighlight: { i, j }
        });

        const c1 = s1[i - 1];
        const c2 = s2[j - 1];
        const isMatch = c1 === c2;

        emitStep({
          type: 'cond',
          line: lineCheck,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: isMatch ? `字符匹配 '${c1}'=='${c2}'` : `字符不匹配 '${c1}'!='${c2}'`,
          log: `| 🔍 比对: s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}'): ${isMatch ? '匹配相同！' : '不匹配！'}`,
          msg: isMatch
            ? `比对成立：<code>s1[${i - 1}] == s2[${j - 1}] ('${c1}')</code>，保留该字符，继承左上角代价。`
            : `比对不匹配：<code>s1[${i - 1}]('${c1}') != s2[${j - 1}]('${c2}')</code>，必须删除当前字符，继承上方代价 + 1。`,
          gridHighlight: { i, j }
        });

        const topVal = dp[i - 1][j] ?? 0;
        const diagVal = dp[i - 1][j - 1] ?? 0;
        const val = isMatch ? diagVal : topVal + 1;
        dp[i][j] = val;

        emitStep({
          type: 'transfer',
          line: isMatch ? lineTransferMatch : lineTransferDelete,
          i,
          j,
          val,
          topI: i - 1,
          topJ: isMatch ? j - 1 : j,
          leftI: isMatch ? i - 1 : -1,
          leftJ: isMatch ? j - 1 : -1,
          topVal: isMatch ? diagVal : topVal,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: isMatch ? `匹配继承: dp[${i}][${j}] = 左上(${diagVal})` : `删除累加: dp[${i}][${j}] = 上(${topVal}) + 1 = ${val}`,
          log: isMatch
            ? `| 🔄 匹配继承: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${val}`
            : `| 🔄 删除累加: dp[${i}][${j}] = dp[${i - 1}][${j}] + 1 = ${val}`,
          msg: isMatch
            ? `状态转移：字符匹配，<code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = <strong>${val}</strong></code>。`
            : `状态转移：字符不匹配，<code>dp[${i}][${j}] = dp[${i - 1}][${j}] + 1 = <strong>${val}</strong></code>。`,
          decisions: [
            { branch: 'match', valid: isMatch, from: [i - 1, j - 1], desc: `左上角匹配: 保留'${c1}' (代价=${diagVal})` },
            { branch: 'delete', valid: !isMatch, from: [i - 1, j], desc: `上方删除: 删去'${c1}' (代价=${topVal + 1})` }
          ],
          gridHighlight: { i, j },
          treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, i, j)
        });
      }
    }

    // 收集最后一行最小值
    let minAns = n;
    let bestJ = 1;
    for (let j = 1; j <= m; j++) {
      if ((dp[n][j] ?? n) < minAns) {
        minAns = dp[n][j]!;
        bestJ = j;
      }
    }

    emitStep({
      type: 'find-min',
      line: lineFindMin,
      i: n,
      j: bestJ,
      val: minAns,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `遍历末行寻找全局最小值: min = ${minAns}`,
      log: `| 🔍 遍历最后一行: 最小删除数为 ${minAns} (在列 j = ${bestJ} 处取得)`,
      msg: `遍历末行所有以 <code>s2[j-1]</code> 结尾的子串代价，在 <code>j = ${bestJ}</code> 处取得全局最小删除数 <strong>${minAns}</strong>。`,
      gridHighlight: { i: n, j: bestJ },
      treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, n, bestJ)
    });

    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: n,
      j: bestJ,
      val: minAns,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `返回全局最少删除数: ${minAns}`,
      log: `| 🏆 二维 DP 填表全部完成！最少删除 ${minAns} 个字符即可成为 s2 的子串`,
      msg: `🏆 二维填表全部完成！全局最少需删除 <strong>${minAns}</strong> 个字符。`,
      gridHighlight: { i: n, j: bestJ },
      treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, n, bestJ)
    });
  } else {
    // 逆推初始化：末行全 0，末列递减初始化
    for (let j = 0; j <= m; j++) {
      dp[n][j] = 0;
    }
    for (let i = n - 1; i >= 0; i--) {
      dp[i][m] = n - i;
      emitStep({
        type: 'border-init',
        line: lineInitCol,
        i,
        j: m,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `逆推末列 dp[${i}][${m}] = ${n - i}`,
        log: `| 🎬 逆推初始化末列: dp[${i}][${m}] = ${n - i}`,
        msg: `逆推初始化末列：<code>dp[${i}][${m}] = ${n - i}</code>。`,
        gridHighlight: { i, j: m },
        treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, i, m)
      });
    }

    for (let i = n - 1; i >= 0; i--) {
      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: m,
        grid: JSON.parse(JSON.stringify(dp)),
        tag: `逆推外层 i=${i}`,
        log: `| 🔁 逆推外层: i = ${i}，考察 s1[${i}] = '${s1[i]}'`,
        msg: `逆推外层：<code>i = ${i}</code>。`,
        gridHighlight: { i, j: m }
      });

      for (let j = m - 1; j >= 0; j--) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: `逆推内层 j=${j}`,
          log: `| 🔁 逆推内层: j = ${j}`,
          msg: `逆推内层：<code>j = ${j}</code>。`,
          gridHighlight: { i, j }
        });

        const c1 = s1[i];
        const c2 = s2[j];
        const isMatch = c1 === c2;

        emitStep({
          type: 'cond',
          line: lineCheck,
          i,
          j,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: isMatch ? `逆推匹配 '${c1}'=='${c2}'` : `逆推不匹配 '${c1}'!='${c2}'`,
          log: `| 🔍 逆推比对: s1[${i}]('${c1}') 与 s2[${j}]('${c2}'): ${isMatch ? '匹配相同！' : '不匹配！'}`,
          msg: isMatch ? `逆推字符匹配：保留该字符。` : `逆推字符不匹配：删除该字符。`,
          gridHighlight: { i, j }
        });

        const downVal = dp[i + 1][j] ?? 0;
        const diagVal = dp[i + 1][j + 1] ?? 0;
        const val = isMatch ? diagVal : downVal + 1;
        dp[i][j] = val;

        emitStep({
          type: 'transfer',
          line: isMatch ? lineTransferMatch : lineTransferDelete,
          i,
          j,
          val,
          topI: i + 1,
          topJ: isMatch ? j + 1 : j,
          leftI: isMatch ? i + 1 : -1,
          leftJ: isMatch ? j + 1 : -1,
          topVal: isMatch ? diagVal : downVal,
          grid: JSON.parse(JSON.stringify(dp)),
          tag: isMatch ? `逆推匹配继承: ${val}` : `逆推删除累加: ${val}`,
          log: `| 🔄 逆推转移: dp[${i}][${j}] = ${val}`,
          msg: `逆推状态转移：<code>dp[${i}][${j}] = <strong>${val}</strong></code>。`,
          decisions: [
            { branch: 'match', valid: isMatch, from: [i + 1, j + 1], desc: `右下角匹配: 保留'${c1}'` },
            { branch: 'delete', valid: !isMatch, from: [i + 1, j], desc: `下方删除: 删去'${c1}'` }
          ],
          gridHighlight: { i, j },
          treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, i, j)
        });
      }
    }

    let minAns = n;
    let bestJ = 0;
    for (let j = 0; j < m; j++) {
      if ((dp[0][j] ?? n) < minAns) {
        minAns = dp[0][j]!;
        bestJ = j;
      }
    }

    emitStep({
      type: 'find-min',
      line: lineFindMin,
      i: 0,
      j: bestJ,
      val: minAns,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `遍历首行寻找全局最小值: min = ${minAns}`,
      log: `| 🔍 逆推遍历第一行: 最小删除数为 ${minAns} (在列 j = ${bestJ} 处取得)`,
      msg: `逆推遍历首行所有以 <code>s2[j]</code> 开头的子串代价，在 <code>j = ${bestJ}</code> 处取得全局最小删除数 <strong>${minAns}</strong>。`,
      gridHighlight: { i: 0, j: bestJ },
      treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, 0, bestJ)
    });

    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: 0,
      j: bestJ,
      val: minAns,
      grid: JSON.parse(JSON.stringify(dp)),
      tag: `返回全局最少删除数: ${minAns}`,
      log: `| 🏆 逆推填表全部完成！全局最少删除 ${minAns} 个字符`,
      msg: `🏆 逆推填表全部完成！全局最少需删除 <strong>${minAns}</strong> 个字符。`,
      gridHighlight: { i: 0, j: bestJ },
      treeRoot: build2DDPDependencyTree(n + 1, m + 1, direction, undefined, dp, 0, bestJ)
    });
  }

  return steps;
}

// ---------------------------------------------------------------------------
// 阶段 4: 一维空间压缩优化编译器
// ---------------------------------------------------------------------------

export function compileMinDeleteStage4(
  model: IYamlAlgorithmModel,
  anchorMap: Record<string, number> = {},
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const { s1, s2, n, m } = extractParams(model);
  const isForward = direction !== 'reverse';
  const steps: UniversalStep[] = [];

  const lineGuard = anchorMap.guard || 2;
  const lineInit = anchorMap.init || 4;
  const lineLoopI = anchorMap.loop_i || 5;
  const lineSaveLeftUp = anchorMap.save_leftup || 6;
  const lineLoopJ = anchorMap.loop_j || 8;
  const lineCheck = anchorMap.check || 10;
  const lineTransferMatch = anchorMap.transfer_match || 11;
  const lineTransferDelete = anchorMap.transfer_delete || 13;
  const lineFindMin = anchorMap.find_min || 17;
  const lineReturn = anchorMap.return || 21;

  if (n === 0 || m === 0) {
    steps.push({
      type: 'guard',
      flowPhase: 'terminal',
      line: lineGuard,
      tag: '空串基底',
      log: '| 🎬 任一字符串为空，返回 0',
      msg: '任一字符串为空，直接返回 <strong>0</strong>。',
      i: 0,
      j: 0,
      grid: [new Array(m + 1).fill(null)]
    });
    return steps;
  }

  const dp1d: (number | null)[] = new Array(m + 1).fill(null);

  const emitStep = (stepData: any) => {
    const isComparing = stepData.type === 'transfer' || stepData.type === 'cond';
    const curI = isForward ? Math.max(0, Math.min(n - 1, stepData.i - 1)) : Math.max(0, Math.min(n - 1, stepData.i));
    const curJ = isForward ? Math.max(0, Math.min(m - 1, stepData.j - 1)) : Math.max(0, Math.min(m - 1, stepData.j));

    steps.push({
      s: s1,
      t: s2,
      s1,
      s2,
      curI,
      curJ,
      label1: '母串 s1 (待删除)',
      label2: '目标 s2 (连续子串)',
      isComparing,
      dp1d: Array.from(dp1d),
      ...stepData
    });
  };

  // Step 0: init 表格创建帧 (纯净 null，且严格 1D 数组 [ [...] ])
  emitStep({
    type: 'init',
    line: lineInit,
    i: isForward ? 0 : n,
    j: isForward ? 0 : m,
    grid: [new Array(m + 1).fill(null)],
    tag: `创建一维滚动数组 dp[0..${m}]`,
    log: `| ⚡ 空间压缩：仅维护一维数组 dp[${m + 1}]，空间复杂度从 O(n×m) 压缩至 O(m)`,
    msg: `创建大小为 <code>${m + 1}</code> 的一维滚动向量，空间复杂度严格压缩至 <strong>O(m)</strong>。`,
    gridHighlight: { i: 0, j: isForward ? 0 : m },
    actorState: { currentSlot: isForward ? 0 : m, action: 'idle' }
  });

  if (isForward) {
    // 初始全 0
    for (let j = 0; j <= m; j++) dp1d[j] = 0;

    for (let i = 1; i <= n; i++) {
      let leftUp = dp1d[0] ?? 0;

      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: 0,
        grid: [Array.from(dp1d)],
        tag: `第 ${i} 轮滚动 (考察 s1[${i - 1}]='${s1[i - 1]}')`,
        log: `| 🔁 一维滚动外层: i = ${i}，暂存 leftUp = ${leftUp}`,
        msg: `第 <code>${i}</code> 轮迭代：考察字符 <code>s1[${i - 1}] = '${s1[i - 1]}'</code>。`,
        gridHighlight: { i: 0, j: 0 },
        actorState: { currentSlot: 0, action: 'idle' }
      });

      dp1d[0] = i;

      emitStep({
        type: 'save-leftup',
        line: lineSaveLeftUp,
        i,
        j: 0,
        grid: [Array.from(dp1d)],
        tag: `更新首列 dp[0] = ${i}`,
        log: `| 🎬 空间压缩: 更新首列基底 dp[0] = ${i}`,
        msg: `更新首列基底：<code>dp[0] = ${i}</code>，前驱对角线 <code>leftUp = ${leftUp}</code>。`,
        gridHighlight: { i: 0, j: 0 },
        actorState: { currentSlot: 0, action: 'idle' }
      });

      for (let j = 1; j <= m; j++) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: [Array.from(dp1d)],
          tag: `槽位 j=${j}`,
          log: `| 🔁 空间压缩槽位: j = ${j}，目标字符 '${s2[j - 1]}'`,
          msg: `考察槽位 <code>j = ${j}</code>，对齐目标字符 <code>s2[${j - 1}] = '${s2[j - 1]}'</code>。`,
          gridHighlight: { i: 0, j },
          actorState: { currentSlot: j, jumpFrom: j - 1, action: 'walk' }
        });

        const backup = dp1d[j] ?? 0;
        const c1 = s1[i - 1];
        const c2 = s2[j - 1];
        const isMatch = c1 === c2;

        emitStep({
          type: 'cond',
          line: lineCheck,
          i,
          j,
          grid: [Array.from(dp1d)],
          tag: isMatch ? `字符匹配 '${c1}'=='${c2}'` : `字符不匹配 '${c1}'!='${c2}'`,
          log: `| 🔍 比对: s1[${i - 1}]('${c1}') 与 s2[${j - 1}]('${c2}'): ${isMatch ? '匹配！' : '不匹配！'}`,
          msg: isMatch
            ? `字符匹配：保留当前字符，直接继承暂存的对角线值 <code>leftUp (${leftUp})</code>。`
            : `字符不匹配：删除当前字符，继承同列旧值 <code>dp[${j}] (${backup}) + 1</code>。`,
          gridHighlight: { i: 0, j }
        });

        const val = isMatch ? leftUp : backup + 1;
        dp1d[j] = val;

        emitStep({
          type: 'transfer',
          line: isMatch ? lineTransferMatch : lineTransferDelete,
          i,
          j,
          val,
          topVal: isMatch ? leftUp : backup,
          grid: [Array.from(dp1d)],
          tag: isMatch ? `滚动匹配: dp[${j}] = leftUp(${leftUp})` : `滚动删除: dp[${j}] = 旧值(${backup}) + 1 = ${val}`,
          log: isMatch
            ? `| 🔄 空间压缩更新: dp[${j}] = leftUp(${leftUp})`
            : `| 🔄 空间压缩更新: dp[${j}] = dp[${j}] + 1 = ${val}`,
          msg: `状态覆盖更新：<code>dp[${j}] = <strong>${val}</strong></code>。`,
          decisions: [
            { branch: 'match', valid: isMatch, desc: `对角线 leftUp: 保留'${c1}' (代价=${leftUp})` },
            { branch: 'delete', valid: !isMatch, desc: `同列旧值 + 1: 删去'${c1}' (代价=${backup + 1})` }
          ],
          gridHighlight: { i: 0, j },
          actorState: { currentSlot: j, jumpFrom: j - 1, action: 'jump' }
        });

        leftUp = backup;
      }
    }

    let minAns = n;
    let bestJ = 1;
    for (let j = 1; j <= m; j++) {
      if ((dp1d[j] ?? n) < minAns) {
        minAns = dp1d[j]!;
        bestJ = j;
      }
    }

    emitStep({
      type: 'find-min',
      line: lineFindMin,
      i: n,
      j: bestJ,
      val: minAns,
      grid: [Array.from(dp1d)],
      tag: `一维数组寻找最小值: min = ${minAns}`,
      log: `| 🔍 遍历一维数组: 最小删除数 = ${minAns} (槽位 j = ${bestJ})`,
      msg: `遍历一维数组各槽位代价，在 <code>j = ${bestJ}</code> 处取得全局最小删除数 <strong>${minAns}</strong>。`,
      gridHighlight: { i: 0, j: bestJ },
      actorState: { currentSlot: bestJ, action: 'walk' }
    });

    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: n,
      j: bestJ,
      val: minAns,
      grid: [Array.from(dp1d)],
      tag: `返回全局最少删除数: ${minAns}`,
      log: `| 🏆 一维空间压缩求解完成！最少删除 ${minAns} 个字符`,
      msg: `🏆 一维空间压缩递推全部完成！最少删除 <strong>${minAns}</strong> 个字符。`,
      gridHighlight: { i: 0, j: bestJ },
      actorState: { currentSlot: bestJ, action: 'idle' }
    });
  } else {
    // 逆推一维滚动
    for (let j = 0; j <= m; j++) dp1d[j] = 0;

    for (let i = n - 1; i >= 0; i--) {
      let rightDown = dp1d[m] ?? 0;

      emitStep({
        type: 'loop-i',
        line: lineLoopI,
        i,
        j: m,
        grid: [Array.from(dp1d)],
        tag: `逆推外层 i=${i}`,
        log: `| 🔁 一维逆推外层: i = ${i}`,
        msg: `逆推第 <code>${i}</code> 轮迭代。`,
        gridHighlight: { i: 0, j: m },
        actorState: { currentSlot: m, action: 'idle' }
      });

      dp1d[m] = n - i;

      for (let j = m - 1; j >= 0; j--) {
        emitStep({
          type: 'loop-j',
          line: lineLoopJ,
          i,
          j,
          grid: [Array.from(dp1d)],
          tag: `逆推槽位 j=${j}`,
          log: `| 🔁 逆推槽位: j = ${j}`,
          msg: `逆推考察槽位 <code>j = ${j}</code>。`,
          gridHighlight: { i: 0, j },
          actorState: { currentSlot: j, jumpFrom: j + 1, action: 'walk' }
        });

        const backup = dp1d[j] ?? 0;
        const c1 = s1[i];
        const c2 = s2[j];
        const isMatch = c1 === c2;

        emitStep({
          type: 'cond',
          line: lineCheck,
          i,
          j,
          grid: [Array.from(dp1d)],
          tag: isMatch ? `逆推匹配 '${c1}'=='${c2}'` : `逆推不匹配 '${c1}'!='${c2}'`,
          log: `| 🔍 逆推比对: s1[${i}]('${c1}') 与 s2[${j}]('${c2}')`,
          msg: isMatch ? `逆推字符匹配。` : `逆推字符不匹配。`,
          gridHighlight: { i: 0, j }
        });

        const val = isMatch ? rightDown : backup + 1;
        dp1d[j] = val;

        emitStep({
          type: 'transfer',
          line: isMatch ? lineTransferMatch : lineTransferDelete,
          i,
          j,
          val,
          topVal: isMatch ? rightDown : backup,
          grid: [Array.from(dp1d)],
          tag: `逆推滚动更新 dp[${j}] = ${val}`,
          log: `| 🔄 逆推更新: dp[${j}] = ${val}`,
          msg: `逆推状态覆盖：<code>dp[${j}] = <strong>${val}</strong></code>。`,
          decisions: [
            { branch: 'match', valid: isMatch, desc: `右下角匹配: 保留'${c1}'` },
            { branch: 'delete', valid: !isMatch, desc: `同列删除: 删去'${c1}'` }
          ],
          gridHighlight: { i: 0, j },
          actorState: { currentSlot: j, jumpFrom: j + 1, action: 'jump' }
        });

        rightDown = backup;
      }
    }

    let minAns = n;
    let bestJ = 0;
    for (let j = 0; j < m; j++) {
      if ((dp1d[j] ?? n) < minAns) {
        minAns = dp1d[j]!;
        bestJ = j;
      }
    }

    emitStep({
      type: 'find-min',
      line: lineFindMin,
      i: 0,
      j: bestJ,
      val: minAns,
      grid: [Array.from(dp1d)],
      tag: `一维数组寻找最小值: min = ${minAns}`,
      log: `| 🔍 逆推遍历一维数组: 最小删除数 = ${minAns}`,
      msg: `逆推遍历一维数组，最小删除数为 <strong>${minAns}</strong>。`,
      gridHighlight: { i: 0, j: bestJ },
      actorState: { currentSlot: bestJ, action: 'walk' }
    });

    emitStep({
      type: 'return',
      flowPhase: 'terminal',
      line: lineReturn,
      i: 0,
      j: bestJ,
      val: minAns,
      grid: [Array.from(dp1d)],
      tag: `返回全局最少删除数: ${minAns}`,
      log: `| 🏆 逆推一维空间压缩递推全部完成！最少删除 ${minAns} 个字符`,
      msg: `🏆 逆推一维空间压缩递推全部完成！最少删除 <strong>${minAns}</strong> 个字符。`,
      gridHighlight: { i: 0, j: bestJ },
      actorState: { currentSlot: bestJ, action: 'idle' }
    });
  }

  return steps;
}
