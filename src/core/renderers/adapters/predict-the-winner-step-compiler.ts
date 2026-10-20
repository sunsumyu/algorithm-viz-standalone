/**
 * 预测赢家 (Predict the Winner / 博弈区间 DP, LC 486, 左程云 83 课)
 * 核心：博弈论零和对抗与区间 DP——相对净胜分建模 dp[i][j] = max(nums[i]-dp[i+1][j], nums[j]-dp[i][j-1])
 * 四阶段全演化推演编译器 (Stage 1-4, forward/reverse 双向支持)
 */

import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

export interface PredictTheWinnerStepParams {
  nums?: number[];
  stage?: number;
  direction?: string;
  isMemo?: boolean;
  anchorMap?: Record<string, number>;
  params?: Record<string, any>;
}

export function parsePredictTheWinnerInputs(inputs: Record<string, any>): { nums: number[] } {
  const raw = inputs?.nums ?? inputs?.['input-nums'] ?? [1, 5, 2];
  if (Array.isArray(raw)) return { nums: raw.map(Number) };
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { nums: parsed.map(Number) };
    } catch {
      // split by comma
    }
    return {
      nums: raw
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n)),
    };
  }
  return { nums: [1, 5, 2] };
}

export function buildPredictTheWinnerSteps(params: PredictTheWinnerStepParams): UniversalStep[] {
  const rawParams = params.params || {};
  const parsed = parsePredictTheWinnerInputs(rawParams.nums !== undefined ? rawParams : params);
  const nums = parsed.nums.length > 0 ? parsed.nums : [1, 5, 2];
  const n = nums.length;
  const stage = params.stage ?? 3;
  const isMemo = Boolean(params.isMemo || stage === 2);
  const isReverse = params.direction === 'reverse';
  const anchorMap = params.anchorMap || {};

  // 1-based 行号兜底
  const lineEntry = anchorMap.entry || 2;
  const lineInitN = anchorMap.init_n || 3;
  const lineGuardEven = anchorMap.guard_even || 4;
  const lineInitDp = anchorMap.init_dp || 5;
  const lineInitBase = anchorMap.init_base || 6;
  const lineLoopLen = anchorMap.loop_len || 7;
  const lineLoopI = anchorMap.loop_i || 8;
  const lineCalcJ = anchorMap.calc_j || 9;
  const lineBranchLeft = anchorMap.branch_left || 10;
  const lineBranchRight = anchorMap.branch_right || 11;
  const lineTransfer = anchorMap.transfer || 12;
  const lineReturn = anchorMap.return || 15;
  const lineDfsEntry = anchorMap.dfs_entry || 9;
  const lineBoundary = anchorMap.boundary || 10;
  const lineCacheHit = anchorMap.cache_hit || 11;

  const steps: UniversalStep[] = [];

  // ==========================================================================
  // Stage 1 & Stage 2: 递归与记忆化搜索演化 (博弈树展开)
  // ==========================================================================
  if (stage === 1 || stage === 2) {
    const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    const activeStack: Array<{ label: string; coord: string; depth: number }> = [];
    const memoCache: Record<string, number> = {};

    let nodeCounter = 1;
    const rootNode: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: n - 1,
      val: `dfs(0, ${n - 1})`,
      status: 'current',
      children: [],
    };

    const pushStep = (st: Partial<UniversalStep>) => {
      const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
      steps.push({
        stage,
        line,
        codeLine: line,
        flowPhase: st.flowPhase || 'forward',
        i: st.i ?? 0,
        j: st.j ?? 0,
        grid: snapshotGrid2D(memoGrid),
        dp1d: [...nums],
        memo: { ...memoCache },
        activeSlot: st.j ?? 0,
        treeRoot: cloneTree(rootNode),
        activeNodeId: st.activeNodeId || rootNode.id,
        callStack: [...activeStack],
        decision: st.decision || st.tag || '推导进行中',
        tag: st.tag || '',
        log: st.log || '',
        msg: st.msg || '',
        ...st,
      } as UniversalStep);
    };

    // Step 0: 函数入口帧
    pushStep({
      type: 'entry',
      flowPhase: 'forward',
      line: lineEntry,
      tag: `predictTheWinner(nums) 数组长度 n=${n}`,
      log: `🎯 进入 predictTheWinner：牌堆 nums=[${nums.join(', ')}]`,
      msg: `主函数入口：给定纸牌数组 <code>nums = [${nums.join(', ')}]</code>。两位玩家均采取最优策略轮流拿牌，每次只能拿走最左端或最右端的一张。`,
      decision: '进入主函数',
    });

    // Step 1: 偶数长度特判
    pushStep({
      type: 'guard',
      flowPhase: 'forward',
      line: lineGuardEven,
      tag: `n = ${n} (${n % 2 === 0 ? '偶数: 先手必胜' : '奇数: 进入推导'})`,
      log: `| 数组长度 n=${n}，${n % 2 === 0 ? '偶数长度先手可通过奇偶位染色策略必胜' : '奇数长度需区间博弈递归推导'}`,
      msg:
        n % 2 === 0
          ? `偶数长度特判：<code>n = ${n}</code> 为偶数，先手总能通过奇偶位选择控制全部奇数位或全部偶数位纸牌，先手必胜。`
          : `奇偶性判定：<code>n = ${n}</code> 为奇数，需通过博弈决策树精确推导双方最优策略。`,
      decision: n % 2 === 0 ? '偶数先手必胜' : '奇数递归推演',
    });

    // Step 2: 备忘录 / 递归准备
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: stage === 2 ? lineInitDp : lineReturn,
      tag: stage === 2 ? `创建备忘录 memo[${n}][${n}]` : `发起顶层递归 dfs(0, ${n - 1})`,
      log:
        stage === 2
          ? `| 📋 初始化上三角记忆化矩阵 memo[${n}][${n}]`
          : `| 🚀 发起顶层递归调用 dfs(0, ${n - 1})`,
      msg:
        stage === 2
          ? `分配上三角记忆化矩阵 <code>memo = new Integer[${n}][${n}]</code>，防止重叠区间重复求解。`
          : `发起顶层博弈递归调用 <code>dfs(0, ${n - 1})</code>。`,
      decision: stage === 2 ? '初始化备忘录' : '发起递归',
    });

    function dfs(i: number, j: number, parentNode: UniversalTreeNode, depth: number): number {
      if (steps.length > 280) return 0;
      const callLabel = `dfs(${i}, ${j})`;
      activeStack.push({ label: callLabel, coord: `${i},${j}`, depth });

      pushStep({
        type: 'dfs_entry',
        flowPhase: 'forward',
        line: lineDfsEntry,
        i,
        j,
        activeNodeId: parentNode.id,
        tag: `进入帧 ${callLabel}`,
        log: `| 📥 进入递归帧 ${callLabel}：求解区间 [${i}, ${j}] 的最大相对净胜分`,
        msg: `深入博弈子问题 <code>[${i}, ${j}]</code>，当前剩余纸牌为 <code>[${nums.slice(i, j + 1).join(', ')}]</code>。`,
        decision: `深入 [${i}, ${j}]`,
      });

      // 边界特判：单张牌区间
      if (i === j) {
        memoGrid[i]![i] = nums[i]!;
        pushStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          line: lineBoundary,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `基底: 区间 [${i}, ${i}] 仅剩牌 ${nums[i]} ➔ 净胜分 ${nums[i]}`,
          log: `| 🎯 边界基底：区间 [${i}, ${i}] 只有一张牌 ${nums[i]}，当前行动者直接拿走，相对净胜分 = ${nums[i]}`,
          msg: `区间 <code>[${i}, ${i}]</code> 只有单张牌，当前行动者直接拿走，净胜分为 <strong>${nums[i]}</strong>。`,
          decision: `基底返回 ${nums[i]}`,
        });
        parentNode.status = 'base';
        activeStack.pop();
        return nums[i]!;
      }

      // 记忆化命中（仅 Stage 2）
      if (isMemo && memoGrid[i]![j] !== null) {
        const cached = memoGrid[i]![j]!;
        pushStep({
          type: 'cache_hit',
          flowPhase: 'backtrack',
          line: lineCacheHit,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `⚡ 缓存命中: memo[${i}][${j}] = ${cached}`,
          log: `| ⚡ 命中备忘录缓存：区间 [${i}, ${j}] 已求解过，直接返回净胜分 ${cached}`,
          msg: `命中记忆化缓存：区间 <code>[${i}, ${j}]</code> 之前已计算，直接复用净胜分 <strong>${cached}</strong>。`,
          decision: `复用缓存 ${cached}`,
        });
        parentNode.status = 'computed';
        activeStack.pop();
        return cached;
      }

      // 分支 1: 选左端牌 nums[i]
      nodeCounter++;
      const leftChild: UniversalTreeNode = {
        id: `node-${nodeCounter}`,
        r: i + 1,
        c: j,
        val: `dfs(${i + 1}, ${j})`,
        status: 'current',
        children: [],
      };
      parentNode.children.push(leftChild);

      pushStep({
        type: 'branch_left',
        flowPhase: 'forward',
        line: lineBranchLeft,
        i,
        j,
        activeNodeId: parentNode.id,
        tag: `选左端: 拿走 nums[${i}]=${nums[i]}，转向对手子区间 [${i + 1}, ${j}]`,
        log: `| 👈 尝试决策 1：当前行动者拿走最左端牌 nums[${i}]=${nums[i]}，随后对手面对区间 [${i + 1}, ${j}]`,
        msg: `决策分支 1：拿走左端 <code>nums[${i}] = ${nums[i]}</code>，对手在剩余区间 <code>[${i + 1}, ${j}]</code> 中将获得相对净胜分。`,
        decision: `选左端 ${nums[i]}`,
      });

      const oppLeft = dfs(i + 1, j, leftChild, depth + 1);
      const chooseLeft = nums[i]! - oppLeft;

      // 分支 2: 选右端牌 nums[j]
      nodeCounter++;
      const rightChild: UniversalTreeNode = {
        id: `node-${nodeCounter}`,
        r: i,
        c: j - 1,
        val: `dfs(${i}, ${j - 1})`,
        status: 'current',
        children: [],
      };
      parentNode.children.push(rightChild);

      pushStep({
        type: 'branch_right',
        flowPhase: 'forward',
        line: lineBranchRight,
        i,
        j,
        activeNodeId: parentNode.id,
        tag: `选右端: 拿走 nums[${j}]=${nums[j]}，转向对手子区间 [${i}, ${j - 1}]`,
        log: `| 👉 尝试决策 2：当前行动者拿走最右端牌 nums[${j}]=${nums[j]}，随后对手面对区间 [${i}, ${j - 1}]`,
        msg: `决策分支 2：拿走右端 <code>nums[${j}] = ${nums[j]}</code>，对手在剩余区间 <code>[${i}, ${j - 1}]</code> 中将获得相对净胜分。`,
        decision: `选右端 ${nums[j]}`,
      });

      const oppRight = dfs(i, j - 1, rightChild, depth + 1);
      const chooseRight = nums[j]! - oppRight;

      // 决策聚合：取极大值
      const best = Math.max(chooseLeft, chooseRight);
      memoGrid[i]![j] = best;
      memoCache[`${i},${j}`] = best;

      pushStep({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
        i,
        j,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j },
        tag: `[${i}, ${j}] 决策聚合: max(选左=${chooseLeft}, 选右=${chooseRight}) = ${best}`,
        log: `| 🏆 区间 [${i}, ${j}] 决策完成：选左净胜=${chooseLeft}，选右净胜=${chooseRight} ➔ 最优净胜分 = ${best}`,
        msg: `区间 <code>[${i}, ${j}]</code> 求解完成：选左净胜 <code>${nums[i]} - ${oppLeft} = ${chooseLeft}</code>，选右净胜 <code>${nums[j]} - ${oppRight} = ${chooseRight}</code>，最优相对净胜分为 <strong>${best}</strong>。`,
        decision: `收敛返回 ${best}`,
      });

      parentNode.status = 'target';
      activeStack.pop();
      return best;
    }

    const finalAdvantage = dfs(0, n - 1, rootNode, 1);
    memoGrid[0]![n - 1] = finalAdvantage;
    const canWin = finalAdvantage >= 0;

    pushStep({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineReturn,
      i: 0,
      j: n - 1,
      gridHighlight: { i: 0, j: n - 1 },
      tag: `先手最终净胜分: ${finalAdvantage} -> ${canWin ? '先手获胜 ✓' : '先手落败 ✗'}`,
      log: `| 🏆 推导收敛：dp[0][${n - 1}] = ${finalAdvantage}，先手${canWin ? '获胜 (>=0)' : '落败 (<0)'}`,
      msg: `🎉 推导完成！全局区间 <code>[0, ${n - 1}]</code> 上先手的最大相对净胜分为 <strong>${finalAdvantage}</strong>。最终结论：<strong>${canWin ? '玩家 1 获胜！返回 true' : '玩家 1 无法获胜！返回 false'}</strong>。`,
      decision: `全局最优 ${finalAdvantage}`,
    });

    return steps;
  }

  // ==========================================================================
  // Stage 3 & Stage 4: 严格二维表递推与空间拓扑演化
  // ==========================================================================
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  // Step 0: 函数入口帧
  steps.push({
    stage,
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    codeLine: lineEntry,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: 0,
    decision: '函数入口',
    tag: `predictTheWinner(nums) 数组长度 n=${n}`,
    log: `🎯 进入 predictTheWinner：牌堆 nums=[${nums.join(', ')}]`,
    msg: `主函数入口：给定纸牌数组 <code>nums = [${nums.join(', ')}]</code>。两位玩家均采取最优策略轮流拿牌，每次只能拿走最左端或最右端的一张。`,
  });

  // Step 1: 偶数长度特判
  steps.push({
    stage,
    type: 'guard',
    flowPhase: 'forward',
    line: lineGuardEven,
    codeLine: lineGuardEven,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: 0,
    decision: n % 2 === 0 ? '偶数先手必胜' : '奇数推演',
    tag: `n = ${n} (${n % 2 === 0 ? '偶数: 先手必胜' : '奇数: 进入推导'})`,
    log: `| 数组长度 n=${n}，${n % 2 === 0 ? '偶数长度先手可通过奇偶位染色策略必胜' : '奇数长度需区间 DP 严格推导'}`,
    msg:
      n % 2 === 0
        ? `偶数长度特判：<code>n = ${n}</code> 为偶数，先手总能通过奇偶位选择控制全部奇数位或全部偶数位纸牌，先手必胜。`
        : `奇偶性判定：<code>n = ${n}</code> 为奇数，需通过区间动态规划精确推导双方最优决策。`,
  });

  // Step 2: 分配表格
  steps.push({
    stage,
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    codeLine: lineInitDp,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: 0,
    decision: '分配DP表格',
    tag: stage === 4 ? `分配一维压缩数组 dp[${n}]` : `分配二维 dp[${n}][${n}] 状态矩阵`,
    log:
      stage === 4
        ? `| 📊 初始化一维空间压缩数组：dp[j] 表示当前行区间的相对净胜分`
        : `| 📊 初始化上三角区间 DP 矩阵：dp[i][j] 表示区间 [i, j] 先手相对后手的净胜分`,
    msg:
      stage === 4
        ? `创建一维压缩表 <code>dp = new int[${n}]</code>，实现 $O(n)$ 空间常数优化。`
        : `创建状态表 <code>dp = new int[${n}][${n}]</code>。因为区间左端点 <code>i <= j</code>，仅上三角区域有效。`,
  });

  // Step 3: 单张牌基础边界初始化 (len = 1, dp[i][i] = nums[i])
  for (let i = 0; i < n; i++) {
    grid[i]![i] = nums[i]!;
    steps.push({
      stage,
      type: 'boundary',
      flowPhase: 'backtrack',
      line: lineInitBase,
      codeLine: lineInitBase,
      i,
      j: i,
      grid: snapshotGrid2D(grid),
      dp1d: [...nums],
      memo: {},
      activeSlot: i,
      gridHighlight: { i, j: i },
      decision: `基底 dp[${i}][${i}]=${nums[i]}`,
      tag: `基底: dp[${i}][${i}] = ${nums[i]}`,
      log: `| 🏁 单牌基底：区间 [${i}, ${i}] 只有一张牌 ${nums[i]}，先手直接拿走，净胜分 = ${nums[i]}`,
      msg: `初始化基底：当区间长度为 1 时，<code>dp[${i}][${i}] = nums[${i}] = <strong>${nums[i]}</strong></code>。`,
    });
  }

  // Step 4: 递推计算
  if (stage === 4) {
    // Stage 4: 一维滚动数组压缩 (逆序 i 从 n - 2 到 0, 正序 j 从 i + 1 到 n - 1)
    const dp1d = [...nums];
    for (let i = n - 2; i >= 0; i--) {
      steps.push({
        stage: 4,
        type: 'loop_i',
        flowPhase: 'forward',
        line: lineLoopI,
        codeLine: lineLoopI,
        i,
        j: i + 1,
        grid: snapshotGrid2D(grid),
        dp1d: [...dp1d],
        memo: {},
        activeSlot: i,
        decision: `固定左端点 i=${i}`,
        tag: `外层逆序: 固定左端点 i = ${i}`,
        log: `| 📐 空间压缩推进：外层逆序固定起点 i = ${i}，内层滚动更新一维数组 dp[j]`,
        msg: `空间压缩外层：固定起点 <code>i = ${i}</code>，向右依次更新各个区间终点。`,
      });

      for (let j = i + 1; j < n; j++) {
        const chooseLeft = nums[i]! - dp1d[j]!;
        const chooseRight = nums[j]! - dp1d[j - 1]!;
        const best = Math.max(chooseLeft, chooseRight);
        dp1d[j] = best;
        grid[i]![j] = best;

        steps.push({
          stage: 4,
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          codeLine: lineTransfer,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...dp1d],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          decision: `更新 dp[${j}]=${best}`,
          tag: `dp[${j}] = max(${nums[i]} - dp[${j}], ${nums[j]} - dp[${j - 1}]) = ${best}`,
          log: `| 🔀 一维压缩区间 [${i}, ${j}]：选左=${nums[i]}-dp[${j}]=${chooseLeft}，选右=${nums[j]}-dp[${j - 1}]=${chooseRight} ➔ dp[${j}] = ${best}`,
          msg: `一维原地转移区间 <code>[${i}, ${j}]</code>：<code>dp[${j}] = max(${nums[i]} - dp[${j}], ${nums[j]} - dp[${j - 1}]) = <strong>${best}</strong></code>。`,
        });
      }
    }
  } else if (isReverse) {
    // 逆向推演分支：从全局区间 [0, n - 1] 逆向寻源
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const chooseLeft = nums[i]! - (grid[i + 1]![j] ?? 0);
        const chooseRight = nums[j]! - (grid[i]![j - 1] ?? 0);
        grid[i]![j] = Math.max(chooseLeft, chooseRight);
      }
    }

    for (let len = n; len >= 2; len--) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const currentVal = grid[i]![j] ?? 0;
        const leftVal = grid[i + 1]![j] ?? 0;
        const rightVal = grid[i]![j - 1] ?? 0;

        steps.push({
          stage: 3,
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          codeLine: lineTransfer,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...nums],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps: [
            { r: i + 1, c: j, type: 'bottom' as any, label: `dp[${i + 1}][${j}]=${leftVal}` },
            { r: i, c: j - 1, type: 'left', label: `dp[${i}][${j - 1}]=${rightVal}` },
          ],
          decision: `逆向追溯 [${i}, ${j}]`,
          tag: `逆向追溯 dp[${i}][${j}] = ${currentVal}`,
          log: `| 🔍 逆向依赖寻源：区间 [${i}, ${j}](${currentVal}) 依赖下侧 [${i + 1}, ${j}](${leftVal}) 与左侧 [${i}, ${j - 1}](${rightVal})`,
          msg: `逆向分析区间 <code>[${i}, ${j}]</code> 的决策源头：分别对比左端选牌与右端选牌后的子区间状态。`,
        });
      }
    }
  } else {
    // Stage 3 标准区间跨度填表 (len 从 2 到 n)
    for (let len = 2; len <= n; len++) {
      steps.push({
        stage: 3,
        type: 'loop_len',
        flowPhase: 'forward',
        line: lineLoopLen,
        codeLine: lineLoopLen,
        i: 0,
        j: len - 1,
        grid: snapshotGrid2D(grid),
        dp1d: [...nums],
        memo: {},
        activeSlot: len,
        decision: `递推跨度 len=${len}`,
        tag: `--- 递推区间长度 len = ${len} ---`,
        log: `| 📏 开始计算所有长度为 ${len} 的子区间`,
        msg: `外层循环推进：当前推演所有跨度为 <code>len = ${len}</code> 的子区间。`,
      });

      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const chooseLeft = nums[i]! - (grid[i + 1]![j] ?? 0);
        steps.push({
          stage: 3,
          type: 'branch_left',
          flowPhase: 'forward',
          line: lineBranchLeft,
          codeLine: lineBranchLeft,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...nums],
          memo: {},
          activeSlot: i,
          gridHighlight: { i, j },
          deps: [{ r: i + 1, c: j, type: 'bottom' as any, label: `dp[${i + 1}][${j}]=${grid[i + 1]![j] ?? 0}` }],
          decision: `选左端 nums[${i}]=${nums[i]} 净胜 ${chooseLeft}`,
          tag: `区间 [${i}, ${j}] 抉择1: 拿走左端牌 nums[${i}](${nums[i]}) ➔ 净胜 ${chooseLeft}`,
          log: `| 👈 抉择1: 拿走左端牌 nums[${i}]=${nums[i]}，对手后手净胜 dp[${i + 1}][${j}]=${grid[i + 1]![j] ?? 0} ➔ 自身净胜 = ${chooseLeft}`,
          msg: `区间 <code>[${i}, ${j}]</code> 尝试拿走左端 <code>nums[${i}]=${nums[i]}</code>：对手在后续区间 <code>[${i + 1}, ${j}]</code> 获得净胜分 <code>${grid[i + 1]![j] ?? 0}</code>，自身净得 <code>${chooseLeft}</code>。`,
        });

        const chooseRight = nums[j]! - (grid[i]![j - 1] ?? 0);
        steps.push({
          stage: 3,
          type: 'branch_right',
          flowPhase: 'forward',
          line: lineBranchRight,
          codeLine: lineBranchRight,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...nums],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps: [{ r: i, c: j - 1, type: 'left', label: `dp[${i}][${j - 1}]=${grid[i]![j - 1] ?? 0}` }],
          decision: `选右端 nums[${j}]=${nums[j]} 净胜 ${chooseRight}`,
          tag: `区间 [${i}, ${j}] 抉择2: 拿走右端牌 nums[${j}](${nums[j]}) ➔ 净胜 ${chooseRight}`,
          log: `| 👉 抉择2: 拿走右端牌 nums[${j}]=${nums[j]}，对手后手净胜 dp[${i}][${j - 1}]=${grid[i]![j - 1] ?? 0} ➔ 自身净胜 = ${chooseRight}`,
          msg: `区间 <code>[${i}, ${j}]</code> 尝试拿走右端 <code>nums[${j}]=${nums[j]}</code>：对手在后续区间 <code>[${i}, ${j - 1}]</code> 获得净胜分 <code>${grid[i]![j - 1] ?? 0}</code>，自身净得 <code>${chooseRight}</code>。`,
        });

        const best = Math.max(chooseLeft, chooseRight);
        grid[i]![j] = best;

        steps.push({
          stage: 3,
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          codeLine: lineTransfer,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...nums],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps: [
            { r: i + 1, c: j, type: 'bottom' as any, label: `dp[${i + 1}][${j}]=${grid[i + 1]![j]}` },
            { r: i, c: j - 1, type: 'left', label: `dp[${i}][${j - 1}]=${grid[i]![j - 1]}` },
          ],
          decision: `转移 [${i}, ${j}] 得 ${best}`,
          tag: `dp[${i}][${j}] = max(${chooseLeft}, ${chooseRight}) = ${best}`,
          log: `| 🔀 区间 [${i}, ${j}] (牌[${nums.slice(i, j + 1).join(',')}])：选左=${nums[i]}-dp[${i + 1}][${j}](${grid[i + 1]![j]})=${chooseLeft}，选右=${nums[j]}-dp[${i}][${j - 1}](${grid[i]![j - 1]})=${chooseRight} ➔ 最优净胜分 = ${best}`,
          msg: `计算区间 <code>[${i}, ${j}]</code>：先手选左端 <code>nums[${i}]=${nums[i]}</code> 后手净胜 <code>${grid[i + 1]![j]}</code>，净得 <code>${chooseLeft}</code>；选右端 <code>nums[${j}]=${nums[j]}</code> 净得 <code>${chooseRight}</code>。因此 <code>dp[${i}][${j}] = <strong>${best}</strong></code>。`,
        });
      }
    }
  }

  // Step 5: 全局收敛返回
  const finalScore = grid[0]![n - 1] ?? 0;
  const canWin = finalScore >= 0;

  steps.push({
    stage,
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    codeLine: lineReturn,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    decision: `全局最优 ${finalScore} -> ${canWin ? '胜' : '负'}`,
    tag: `先手最终净胜分: ${finalScore} -> ${canWin ? '先手获胜 ✓' : '先手落败 ✗'}`,
    log: `| 🏆 推导收敛：dp[0][${n - 1}] = ${finalScore}，先手${canWin ? '获胜 (>=0)' : '落败 (<0)'}`,
    msg: `🎉 推导完成！全局区间 <code>[0, ${n - 1}]</code> 上先手的最大相对净胜分为 <strong>${finalScore}</strong>。最终结论：<strong>${canWin ? '玩家 1 获胜！返回 true' : '玩家 1 无法获胜！返回 false'}</strong>。`,
  });

  return steps;
}
