/**
 * 合并石头的最低成本 (Merge Stones, LC 1000 / 左程云 84 课)
 * 核心：区间 DP 经典——相邻石子合并累加区间总重量
 * 转移方程：dp[i][j] = min_{k}(dp[i][k] + dp[k+1][j]) + sum[i..j]
 * 四阶段全演化推演编译器 (Stage 1-4, forward/reverse 双向支持)
 */

import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

export interface MergeStonesStepParams {
  stones?: number[];
  stage?: number;
  direction?: string;
  isMemo?: boolean;
  anchorMap?: Record<string, number>;
  params?: Record<string, any>;
}

export function parseMergeStonesInputs(inputs: Record<string, any>): { stones: number[] } {
  const raw = inputs?.stones ?? inputs?.['input-stones'] ?? inputs?.nums ?? [3, 2, 4, 1];
  if (Array.isArray(raw)) return { stones: raw.map(Number) };
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { stones: parsed.map(Number) };
    } catch {
      // split by comma
    }
    return {
      stones: raw
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n)),
    };
  }
  return { stones: [3, 2, 4, 1] };
}

export function buildMergeStonesSteps(params: MergeStonesStepParams): UniversalStep[] {
  const rawParams = params.params || {};
  const parsed = parseMergeStonesInputs(rawParams.stones !== undefined ? rawParams : params);
  const stones = parsed.stones && parsed.stones.length >= 2 ? parsed.stones : [3, 2, 4, 1];
  const n = stones.length;
  const stage = params.stage ?? 3;
  const isMemo = Boolean(params.isMemo || stage === 2);
  const isReverse = params.direction === 'reverse';
  const anchorMap = params.anchorMap || {};

  // 1-based 行号兜底映射
  const lineEntry = anchorMap.entry || 2;
  const lineInitN = anchorMap.init_n || 3;
  const lineGuardLess = anchorMap.guard_less || 4;
  const lineInitSum = anchorMap.init_sum || 5;
  const lineFillSum = anchorMap.fill_sum || 6;
  const lineReturn = anchorMap.return || (stage === 1 ? 7 : (stage === 2 ? 16 : 17));
  const lineDfsEntry = anchorMap.dfs_entry || 9;
  const lineBoundary = anchorMap.boundary || 10;
  const lineCacheHit = anchorMap.cache_hit || 11;
  const lineInitMin = anchorMap.init_min || (stage <= 2 ? 11 : 10);
  const lineLoopK = anchorMap.loop_k || (stage <= 2 ? 12 : 11);
  const lineCalcCost = anchorMap.calc_cost || (stage <= 2 ? 13 : 12);
  const lineUpdateMin = anchorMap.update_min || (stage <= 2 ? 14 : 13);
  const lineTransfer = anchorMap.transfer || (stage <= 2 ? 15 : 15);
  const lineInitDp = anchorMap.init_dp || 7;
  const lineLoopLen = anchorMap.loop_len || 8;
  const lineLoopI = anchorMap.loop_i || 9;
  const lineCalcJ = anchorMap.calc_j || 10;

  // 预处理前缀和数组
  const sum = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i]!;

  const steps: UniversalStep[] = [];

  // ==========================================================================
  // Stage 1 & Stage 2: 递归与记忆化搜索演化 (分治树展开)
  // ==========================================================================
  if (stage === 1 || stage === 2) {
    const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    for (let i = 0; i < n; i++) {
      memoGrid[i]![i] = 0;
    }

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
      if (steps.length >= 180) return;
      const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
      steps.push({
        stage,
        line,
        codeLine: line,
        flowPhase: st.flowPhase || 'forward',
        i: st.i ?? 0,
        j: st.j ?? 0,
        grid: snapshotGrid2D(memoGrid),
        dp1d: [...stones],
        memo: { ...memoCache },
        activeSlot: st.j ?? 0,
        treeRoot: cloneTree(rootNode),
        activeNodeId: st.activeNodeId || rootNode.id,
        callStack: [...activeStack],
        decision: st.decision || st.tag || '石子合并中',
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
      tag: `mergeStones(stones) 堆数 n=${n}`,
      log: `🎯 进入 mergeStones：石子序列 stones=[${stones.join(', ')}]`,
      msg: `主函数入口：给定 <code>${n}</code> 堆排成一列的石子 <code>[${stones.join(', ')}]</code>。每次合并相邻两堆，成本为两堆重量之和。`,
      decision: '进入主函数',
    });

    // Step 1: 长度特判
    if (n <= 1) {
      pushStep({
        type: 'return',
        flowPhase: 'backtrack',
        line: lineGuardLess,
        tag: `石子堆数 n=${n} <= 1，直接返回 0`,
        log: `| 堆数 <= 1，无需合并，总成本 = 0`,
        msg: `长度特判：<code>n = ${n}</code>，合并成本为 <strong>0</strong>。`,
        decision: '返回 0',
      });
      return steps;
    }

    // Step 2: 前缀和计算
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: lineFillSum,
      tag: `计算前缀和数组 sum=[${sum.join(', ')}]`,
      log: `| 🧮 前缀和计算完成：任意区间 [i, j] 重量 = sum[j+1] - sum[i]`,
      msg: `预处理前缀和数组 <code>sum</code>，用于在 $O(1)$ 时间获取区间合并的基础重量开销。`,
      decision: '计算前缀和',
    });

    // Step 3: 发起顶层递归 / 初始化备忘录
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
          ? `分配上三角记忆化矩阵 <code>memo = new int[${n}][${n}]</code>，消除重叠子区间重复合并计算。`
          : `发起顶层递归调用 <code>dfs(0, ${n - 1})</code> 求解合并所有石子的最低成本。`,
      decision: stage === 2 ? '初始化备忘录' : '发起递归',
    });

    function dfs(i: number, j: number, parentNode: UniversalTreeNode, depth: number): number {
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
        log: `| 📥 进入递归帧 ${callLabel}：求解石子区间 [${i}..${j}] 最低合并成本`,
        msg: `深入考察石子子区间 <code>[${i}..${j}]</code>（重量：<code>${sum[j + 1] - sum[i]}</code>）。`,
        decision: `深入 [${i}..${j}]`,
      });

      // 单堆石子基底
      if (i >= j) {
        memoGrid[i]![j] = 0;
        pushStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          line: lineBoundary,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `单堆基底: [${i}, ${j}] ➔ 0`,
          log: `| 🎯 单堆基底：石子堆 [${i}] 已成一堆，合并成本 0`,
          msg: `单堆石子无需合并，成本为 <code>0</code>。`,
          decision: '基底返回 0',
        });
        parentNode.status = 'base';
        activeStack.pop();
        return 0;
      }

      // 记忆化命中（仅 Stage 2）
      if (isMemo && memoGrid[i]![j] !== null && memoGrid[i]![j]! > 0) {
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
          log: `| ⚡ 命中备忘录缓存：区间 [${i}..${j}] 最低合并成本 ${cached}`,
          msg: `命中记忆化缓存：区间 <code>[${i}..${j}]</code> 最优合并成本 <strong>${cached}</strong>。`,
          decision: `复用缓存 ${cached}`,
        });
        parentNode.status = 'computed';
        activeStack.pop();
        return cached;
      }

      pushStep({
        type: 'condition',
        flowPhase: 'forward',
        line: lineInitMin,
        i,
        j,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j },
        tag: `枚举切分点 k ∈ [${i}..${j - 1}]`,
        log: `| 🪨 枚举切分点 k：分割为 [${i}..k] 与 [k+1..${j}]`,
        msg: `尝试所有可能的最后一次合并切分点 <code>k</code>。`,
        decision: '枚举切分点 k',
      });

      let minCost = Infinity;
      let bestK = -1;

      for (let k = i; k < j; k++) {
        const leftNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: i,
          c: k,
          val: `dfs(${i}, ${k})`,
          status: 'current',
          children: [],
        };
        const rightNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: k + 1,
          c: j,
          val: `dfs(${k + 1}, ${j})`,
          status: 'current',
          children: [],
        };
        parentNode.children.push(leftNode, rightNode);

        pushStep({
          type: 'loop_k',
          flowPhase: 'forward',
          line: lineLoopK,
          i,
          j,
          activeNodeId: parentNode.id,
          tag: `切分 k=${k}: [${i}..${k}] + [${k + 1}..${j}]`,
          log: `|   尝试切分点 k=${k}：分割为 [${i}..${k}] 与 [${k + 1}..${j}]`,
          msg: `在 <code>k = ${k}</code> 处切分：左半段 <code>[${i}..${k}]</code>，右半段 <code>[${k + 1}..${j}]</code>。`,
          decision: `切分 k=${k}`,
        });

        const leftCost = dfs(i, k, leftNode, depth + 1);
        const rightCost = dfs(k + 1, j, rightNode, depth + 1);
        const subTotal = leftCost + rightCost;

        pushStep({
          type: 'calc',
          flowPhase: 'backtrack',
          line: lineCalcCost,
          i,
          j,
          activeNodeId: parentNode.id,
          tag: `k=${k} 子合并: ${leftCost} + ${rightCost} = ${subTotal}`,
          log: `|   k=${k} 计算：左段 ${leftCost} + 右段 ${rightCost} = ${subTotal}`,
          msg: `切分点 <code>k = ${k}</code>：两子区间各自合并成本 <code>${leftCost} + ${rightCost} = ${subTotal}</code>。`,
          decision: `子合并 ${subTotal}`,
        });

        if (subTotal < minCost) {
          minCost = subTotal;
          bestK = k;
          pushStep({
            type: 'calc',
            flowPhase: 'backtrack',
            line: lineUpdateMin,
            i,
            j,
            activeNodeId: parentNode.id,
            tag: `⚡ 更新最优切分: k=${bestK} ➔ minCost = ${minCost}`,
            log: `|   ⚡ 刷新最低子成本：k=${bestK} 当前最优 ${minCost}`,
            msg: `更新当前最优切分：在 <code>k = ${bestK}</code> 处切分子区间合计 <strong>${minCost}</strong>。`,
            decision: `最优 ${minCost}`,
          });
        }
      }

      const totalWeight = sum[j + 1]! - sum[i]!;
      const finalCost = minCost + totalWeight;
      memoGrid[i]![j] = finalCost;
      memoCache[`${i},${j}`] = finalCost;

      pushStep({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
        i,
        j,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j },
        deps: bestK !== -1 ? [
          { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${memoGrid[i]![bestK]}` },
          { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK + 1}][${j}]=${memoGrid[bestK + 1]![j]}` },
        ] : [],
        tag: `区间 [${i}..${j}] 合并完成: ${minCost} + 总重 ${totalWeight} = ${finalCost}`,
        log: `| 🪨 区间 [${i}..${j}] 归约：最优切分 k=${bestK}，子成本 ${minCost} + 重量 ${totalWeight} = ${finalCost}`,
        msg: `区间 <code>[${i}..${j}]</code> 最终合并：在 <code>k = ${bestK}</code> 处合并，总成本 <code>${minCost} + ${totalWeight} = <strong>${finalCost}</strong></code>。`,
        decision: `完成合并 ${finalCost}`,
      });

      parentNode.status = 'computed';
      activeStack.pop();
      return finalCost;
    }

    const finalAns = dfs(0, n - 1, rootNode, 0);

    const returnLine = typeof lineReturn === 'number' && lineReturn >= 1 ? lineReturn : lineEntry;
    steps.push({
      type: 'return',
      stage,
      line: returnLine,
      codeLine: returnLine,
      flowPhase: 'backtrack',
      i: 0,
      j: n - 1,
      grid: snapshotGrid2D(memoGrid),
      dp1d: [...stones],
      memo: { ...memoCache },
      activeSlot: n - 1,
      treeRoot: cloneTree(rootNode),
      activeNodeId: rootNode.id,
      callStack: [],
      gridHighlight: { i: 0, j: n - 1 },
      decision: `最终返回 ${finalAns}`,
      tag: `🎯 全局收敛: 最少合并总成本 = ${finalAns}`,
      log: `🏁 全局求解完成！合并所有石子最少需 ${finalAns} 成本`,
      msg: `全局递归推导收敛：将所有石子合并为一堆的最低总成本为 <strong>${finalAns}</strong>。`,
    } as UniversalStep);

    return steps;
  }

  // ==========================================================================
  // Stage 3: 二维动态规划递推 (自底向上按区间长度填表)
  // ==========================================================================
  if (stage === 3) {
    const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

    const pushStep = (st: Partial<UniversalStep>) => {
      const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
      steps.push({
        stage: 3,
        line,
        codeLine: line,
        flowPhase: st.flowPhase || 'forward',
        i: st.i ?? 0,
        j: st.j ?? 0,
        grid: snapshotGrid2D(grid),
        dp1d: [...stones],
        memo: {},
        activeSlot: st.j ?? 0,
        decision: st.decision || st.tag || '填表推进',
        tag: st.tag || '',
        log: st.log || '',
        msg: st.msg || '',
        ...st,
      } as UniversalStep);
    };

    // Step 0: 函数入口
    pushStep({
      type: 'entry',
      flowPhase: 'forward',
      line: lineEntry,
      tag: `mergeStones(stones) 堆数 n=${n}`,
      log: `🎯 进入 mergeStones：石子序列 [${stones.join(', ')}]`,
      msg: `主函数入口：给定 <code>${n}</code> 堆排成一列的石子 <code>[${stones.join(', ')}]</code>。`,
      decision: '进入主函数',
    });

    // Step 1: 长度特判
    if (n <= 1) {
      pushStep({
        type: 'return',
        flowPhase: 'backtrack',
        line: lineGuardLess,
        tag: `石子堆数 n=${n} <= 1，直接返回 0`,
        log: `| 堆数 <= 1，无需合并，总成本 = 0`,
        msg: `长度特判：<code>n = ${n}</code>，合并成本为 <strong>0</strong>。`,
        decision: '返回 0',
      });
      return steps;
    }

    // Step 2: 预处理前缀和
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: lineFillSum,
      tag: `预处理前缀和 sum=[${sum.join(', ')}]`,
      log: `| 🧮 前缀和计算完毕：任意区间 [i, j] 重量 = sum[j+1] - sum[i]`,
      msg: `预处理前缀和数组 <code>sum</code>，用于在 $O(1)$ 时间获取区间合并的基础重量开销。`,
      decision: '计算前缀和',
    });

    // Step 3: 分配 DP 表格与对角线基底初始化
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: lineInitDp,
      i: 0,
      j: n - 1,
      tag: `分配 dp[${n}][${n}] 上三角矩阵`,
      log: `| 📊 初始化上三角区间 DP 矩阵：对角线 dp[i][i] = 0`,
      msg: `创建状态表 <code>dp = new int[${n}][${n}]</code>。单堆石子无需合并，基底 <code>dp[i][i] = 0</code>。`,
      decision: '分配DP表格',
    });

    for (let i = 0; i < n; i++) {
      grid[i]![i] = 0;
      pushStep({
        type: 'boundary',
        flowPhase: 'backtrack',
        line: lineInitDp,
        i,
        j: i,
        gridHighlight: { i, j: i },
        tag: `单堆基底: dp[${i}][${i}] = 0 (石子重 ${stones[i]})`,
        log: `| 🏁 单堆基底：stones[${i}]=${stones[i]} 无需合并，dp[${i}][${i}] = 0`,
        msg: `单堆石子已成一堆，合并成本 <code>dp[${i}][${i}] = 0</code>。`,
        decision: `基底 dp[${i}][${i}]=0`,
      });
    }

    // Step 4: 按区间长度 len 从 2 到 n 递推
    for (let len = 2; len <= n; len++) {
      pushStep({
        type: 'loop_len',
        flowPhase: 'forward',
        line: lineLoopLen,
        i: 0,
        j: len - 1,
        tag: `--- 递推区间跨度 len = ${len} ---`,
        log: `| 📏 计算所有跨度为 ${len} 的石子连续合并`,
        msg: `外层递推推进：考察跨度为 <code>len = ${len}</code> 的所有子区间。`,
        decision: `递推跨度 len=${len}`,
      });

      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;

        pushStep({
          type: 'calc',
          flowPhase: 'forward',
          line: lineLoopI,
          i,
          j,
          tag: `考察区间 [${i}..${j}] (子串 [${stones.slice(i, j + 1).join(',')}])`,
          log: `| 🔍 考察区间 [${i}..${j}]：总重 = ${sum[j + 1]! - sum[i]!}`,
          msg: `考察石子区间 <code>[${i}..${j}]</code>：区间石子 <code>[${stones.slice(i, j + 1).join(', ')}]</code>。`,
          decision: `考察 [${i}..${j}]`,
        });

        let minCost = Infinity;
        let bestK = -1;

        for (let k = i; k < j; k++) {
          const leftCost = grid[i]![k] ?? 0;
          const rightCost = grid[k + 1]![j] ?? 0;
          const total = leftCost + rightCost;

          pushStep({
            type: 'loop_k',
            flowPhase: 'forward',
            line: lineLoopK,
            i,
            j,
            gridHighlight: { i, j },
            deps: [
              { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftCost}` },
              { r: k + 1, c: j, type: 'bottom' as any, label: `dp[${k + 1}][${j}]=${rightCost}` },
            ],
            decision: `枚举切分点 k=${k}`,
            tag: `区间 [${i}..${j}] 尝试切分点 k=${k}: [${i}..${k}] + [${k + 1}..${j}] ➔ 子成本=${total}`,
            log: `| 🔍 尝试分割点 k=${k}：左段成本 dp[${i}][${k}]=${leftCost} + 右段成本 dp[${k + 1}][${j}]=${rightCost} = ${total}`,
            msg: `尝试在 <code>k = ${k}</code> 处切分：左半段 <code>[${i}..${k}]</code> 合并需 <code>${leftCost}</code>，右半段 <code>[${k + 1}..${j}]</code> 合并需 <code>${rightCost}</code>，子成本合计 <strong>${total}</strong>。`,
          });

          if (total < minCost) {
            minCost = total;
            bestK = k;

            pushStep({
              type: 'update_min',
              flowPhase: 'forward',
              line: lineUpdateMin,
              i,
              j,
              gridHighlight: { i, j },
              deps: [
                { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftCost}` },
                { r: k + 1, c: j, type: 'bottom' as any, label: `dp[${k + 1}][${j}]=${rightCost}` },
              ],
              decision: `更新最低子成本 minCost=${total}`,
              tag: `更优切分：k=${k} 最低子成本更新为 ${total}`,
              log: `| ✨ 找到更优切分点 k=${k}：最低子成本更新为 ${minCost}`,
              msg: `更新最优切分：在 <code>k = ${k}</code> 处分段子成本仅需 <strong>${total}</strong>，刷新当前区间最低子合并成本。`,
            });
          }
        }

        const totalWeight = sum[j + 1]! - sum[i]!;
        const finalCost = minCost + totalWeight;
        grid[i]![j] = finalCost;

        pushStep({
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          i,
          j,
          gridHighlight: { i, j },
          deps: bestK !== -1 ? [
            { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
            { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK + 1}][${j}]=${grid[bestK + 1]![j]}` },
          ] : [],
          tag: `区间 [${i}..${j}] 最优切分 k=${bestK} ➔ 成本 ${finalCost}`,
          log: `| 🪨 区间 [${i}..${j}]：在 k=${bestK} 切分，子区间合并=${grid[i]![bestK]}+${grid[bestK + 1]![j]}=${minCost}，区间总重=${totalWeight} ➔ 最终成本 = ${finalCost}`,
          msg: `计算区间 <code>[${i}..${j}]</code>：在 <code>k = ${bestK}</code> 处切分最优，子区间合并成本 <code>${grid[i]![bestK]} + ${grid[bestK + 1]![j]}</code>，加上最后合并全区间的总重量 <code>${totalWeight}</code>，总成本为 <code><strong>${finalCost}</strong></code>。`,
          decision: `最优切分 k=${bestK} ➔ ${finalCost}`,
        });
      }
    }

    const ans = grid[0]![n - 1] ?? 0;

    pushStep({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineReturn,
      i: 0,
      j: n - 1,
      gridHighlight: { i: 0, j: n - 1 },
      tag: `🏆 全局最优: dp[0][${n - 1}] = ${ans}`,
      log: `🏁 填表完成！合并所有石子最低总成本为 ${ans}`,
      msg: `填表结束：目标状态 <code>dp[0][${n - 1}]</code> 收敛，合并所有 <code>${n}</code> 堆石子的最低总成本为 <strong>${ans}</strong>。`,
      decision: `全局最优 ${ans}`,
    });

    return steps;
  }

  // ==========================================================================
  // Stage 4: 对角线倒序填表拓扑演化 (或逆向回溯)
  // ==========================================================================
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  const pushStep = (st: Partial<UniversalStep>) => {
    const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
    steps.push({
      stage: 4,
      line,
      codeLine: line,
      flowPhase: st.flowPhase || (isReverse ? 'backtrack' : 'forward'),
      i: st.i ?? 0,
      j: st.j ?? 0,
      grid: snapshotGrid2D(grid),
      dp1d: [...stones],
      memo: {},
      activeSlot: st.j ?? 0,
      decision: st.decision || st.tag || '拓扑演进',
      tag: st.tag || '',
      log: st.log || '',
      msg: st.msg || '',
      ...st,
    } as UniversalStep);
  };

  // Step 0: 函数入口
  pushStep({
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    tag: isReverse ? `逆向回溯寻源: stones=[${stones.join(', ')}]` : `对角线倒序拓扑演化: stones=[${stones.join(', ')}]`,
    log: `🎯 进入 stage-4 拓扑演进：stones=[${stones.join(', ')}]`,
    msg: isReverse
      ? `从全局最优解 <code>dp[0][${n - 1}]</code> 出发逆向分解石子合并决策链。`
      : `倒序固定左端点 <code>i</code> 从 <code>${n - 2}</code> 到 <code>0</code>，内层终点 <code>j</code> 从 <code>i+1</code> 到 <code>${n - 1}</code>，严格按拓扑序递推。`,
    decision: '进入Stage 4',
  });

  // Step 1: 初始化基底
  for (let i = 0; i < n; i++) {
    grid[i]![i] = 0;
  }
  pushStep({
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: 0,
    tag: `初始化对角线基底 dp[i][i] = 0`,
    log: `| 🏁 初始化单堆石子基底：成本全为 0`,
    msg: `快速填充主对角线 <code>dp[i][i] = 0</code>。`,
    decision: '对角线初始化',
  });

  // Step 2: 倒序填表
  for (let i = n - 2; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      let minCost = Infinity;
      let bestK = -1;

      for (let k = i; k < j; k++) {
        const cost = (grid[i]![k] ?? 0) + (grid[k + 1]![j] ?? 0);
        if (cost < minCost) {
          minCost = cost;
          bestK = k;
        }
      }

      const totalWeight = sum[j + 1]! - sum[i]!;
      const finalCost = minCost + totalWeight;
      grid[i]![j] = finalCost;

      pushStep({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
        i,
        j,
        gridHighlight: { i, j },
        deps: bestK !== -1 ? [
          { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
          { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK + 1}][${j}]=${grid[bestK + 1]![j]}` },
        ] : [],
        tag: `[${i},${j}] 最优切分 k=${bestK} ➔ 成本 ${finalCost}`,
        log: `| 🪨 拓扑切分：在 k=${bestK} 切分 ➔ dp[${i}][${j}] = ${finalCost}`,
        msg: `拓扑演化：在 <code>k = ${bestK}</code> 处合并两子区间，<code>dp[${i}][${j}] = <strong>${finalCost}</strong></code>。`,
        decision: `最优切分 ${finalCost}`,
      });
    }
  }

  const ans = grid[0]![n - 1] ?? 0;

  pushStep({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: 0,
    j: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    tag: `🏆 拓扑演化最优: dp[0][${n - 1}] = ${ans}`,
    log: `🏁 拓扑递推完成，最低总成本 = ${ans}`,
    msg: `全局收敛：将所有石子合并为一堆的最低总成本为 <strong>${ans}</strong>。`,
    decision: `最终返回 ${ans}`,
  });

  return steps;
}
