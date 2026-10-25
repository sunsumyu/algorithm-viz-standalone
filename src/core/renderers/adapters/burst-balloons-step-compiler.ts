/**
 * 戳气球 (Burst Balloons, LC 312, 左程云 83 课)
 * 核心：区间 DP 经典逆向思维——枚举开区间 (i, j) 中最后一个被戳破的气球 k
 * 四阶段全演化标准推演编译器 (Stage 1-4, forward/reverse 双向支持)
 */

import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

export interface BurstBalloonsStepParams {
  nums?: number[];
  stage?: number;
  direction?: string;
  isMemo?: boolean;
  anchorMap?: Record<string, number>;
  params?: Record<string, any>;
}

export function parseBurstBalloonsInputs(inputs: Record<string, any>): { nums: number[] } {
  const raw = inputs?.nums ?? inputs?.['input-nums'] ?? [3, 1, 5, 8];
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
  return { nums: [3, 1, 5, 8] };
}

export function buildBurstBalloonsSteps(params: BurstBalloonsStepParams): UniversalStep[] {
  const rawParams = params.params || {};
  const parsed = parseBurstBalloonsInputs(rawParams.nums !== undefined ? rawParams : params);
  const nums = parsed.nums.length > 0 ? parsed.nums : [3, 1, 5, 8];
  const n = nums.length;
  const stage = params.stage ?? 3;
  const isMemo = Boolean(params.isMemo || stage === 2);
  const isReverse = params.direction === 'reverse';
  const anchorMap = params.anchorMap || {};

  // 哨兵数组 val: [1, nums..., 1]，长度 m = n + 2
  const val = [1, ...nums, 1];
  const m = n + 2;

  // 1-based 行号兜底
  const lineEntry = anchorMap.entry || 2;
  const lineInitN = anchorMap.init_n || 3;
  const lineInitVal = anchorMap.init_val || 4;
  const lineSetBorder = anchorMap.set_border || 5;
  const lineFillVal = anchorMap.fill_val || 6;
  const lineInitDp = anchorMap.init_dp || 7;
  const lineCallDfs = anchorMap.call_dfs || 7;
  const lineDfsEntry = anchorMap.dfs_entry || 9;
  const lineBoundary = anchorMap.boundary || 10;
  const lineCacheHit = anchorMap.cache_hit || 11;
  const lineInitBest = anchorMap.init_best || 11;
  const lineLoopLen = anchorMap.loop_len || 8;
  const lineLoopI = anchorMap.loop_i || 9;
  const lineCalcJ = anchorMap.calc_j || 10;
  const lineLoopK = anchorMap.loop_k || 12;
  const lineCalcGain = anchorMap.calc_gain || 13;
  const lineCalcCoins = anchorMap.calc_coins || 14;
  const lineUpdateBest = anchorMap.update_best || 15;
  const lineTransfer = anchorMap.transfer || 16;
  const lineReturn = anchorMap.return || 18;

  const steps: UniversalStep[] = [];

  // ==========================================================================
  // Stage 1 & Stage 2: 递归与记忆化搜索演化
  // ==========================================================================
  if (stage === 1 || stage === 2) {
    const memoGrid: (number | null)[][] = Array.from({ length: m }, () => new Array(m).fill(null));
    const activeStack: Array<{ label: string; coord: string; depth: number }> = [];
    const memoCache: Record<string, number> = {};

    let nodeCounter = 1;
    const rootNode: UniversalTreeNode = {
      id: 'node-1',
      r: 0,
      c: m - 1,
      val: `dfs(0, ${m - 1})`,
      status: 'current',
      children: [],
    };

    const pushStep = (st: Partial<UniversalStep>) => {
      const line = (typeof st.line === 'number' && st.line >= 1) ? st.line : lineEntry;
      steps.push({
        stage,
        line,
        codeLine: line,
        flowPhase: st.flowPhase || 'forward',
        i: st.i ?? 0,
        j: st.j ?? 0,
        grid: snapshotGrid2D(memoGrid),
        dp1d: [...val],
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

    // Step 0: 函数主入口
    pushStep({
      type: 'entry',
      flowPhase: 'forward',
      line: lineEntry,
      tag: `maxCoins(nums) 气球数 n=${n}`,
      log: `🎯 进入 maxCoins：气球数组 nums=[${nums.join(', ')}]，准备构造虚拟哨兵边界`,
      msg: `主函数入口：给定 <code>${n}</code> 个气球，数值为 <code>[${nums.join(', ')}]</code>。左右哨兵拓展后开区间为 <code>(0, ${m - 1})</code>。`,
      decision: '进入主函数',
    });

    // Step 1: 哨兵构造
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: lineSetBorder,
      tag: `首尾虚拟气球 1 ➔ val=[${val.join(', ')}]`,
      log: `| 🎈 首尾添加标号为 1 的虚拟气球，开区间转为 (0, ${m - 1})`,
      msg: `边界扩展：左右两端各补一个数值为 <code>1</code> 的虚拟气球，长度变为 <code>${m}</code>。`,
      decision: '构造哨兵',
    });

    // Step 2: 备忘录 / DFS 准备
    pushStep({
      type: 'init',
      flowPhase: 'forward',
      line: stage === 2 ? lineInitDp : lineCallDfs,
      tag: stage === 2 ? `创建备忘录 memo[${m}][${m}]` : `发起顶层递归 dfs(0, ${m - 1})`,
      log: stage === 2
        ? `| 📋 初始化上三角记忆化矩阵 memo[${m}][${m}]`
        : `| 🚀 发起顶层递归调用 dfs(0, ${m - 1})`,
      msg: stage === 2
        ? `分配上三角记忆化矩阵 <code>memo = new int[${m}][${m}]</code>，防止重叠开区间重复求解。`
        : `发起顶层开区间递归调用 <code>dfs(0, ${m - 1})</code>。`,
      decision: stage === 2 ? '初始化备忘录' : '发起递归',
    });

    function dfs(i: number, j: number, parentNode: UniversalTreeNode, depth: number): number {
      if (steps.length > 280) return 0;
      const callLabel = `dfs(${i}, ${j})`;
      activeStack.push({ label: callLabel, coord: `${i},${j}`, depth });

      pushStep({
        type: 'dfs-entry',
        flowPhase: 'forward',
        line: lineDfsEntry,
        i,
        j,
        activeNodeId: parentNode.id,
        tag: `进入帧 ${callLabel}`,
        log: `| 📥 进入递归帧 ${callLabel}：求解开区间 (${i}, ${j}) 的最大得分`,
        msg: `深入子问题 <code>(${i}, ${j})</code>，开区间内待戳破气球为 <code>[${val.slice(i + 1, j).join(', ')}]</code>。`,
        decision: `深入 (${i}, ${j})`,
      });

      // 边界特判：开区间内部无气球
      if (i + 1 >= j) {
        pushStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          line: lineBoundary,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `基底: 开区间 (${i}, ${j}) 无气球 ➔ 0`,
          log: `| 🎯 边界基底：开区间 (${i}, ${j}) 跨度不足，得分 0`,
          msg: `开区间 <code>(${i}, ${j})</code> 内部无气球可戳，基础得分返回 <code>0</code>。`,
          decision: '基底返回 0',
        });
        parentNode.status = 'base';
        activeStack.pop();
        return 0;
      }

      // 记忆化命中（仅 Stage 2）
      if (isMemo && memoGrid[i]![j] !== null) {
        const cached = memoGrid[i]![j]!;
        pushStep({
          type: 'cache-hit',
          flowPhase: 'backtrack',
          line: lineCacheHit,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `⚡ 命中缓存: memo[${i}][${j}] = ${cached}`,
          log: `| ⚡ 命中缓存：memo[${i}][${j}] = ${cached}，剪除重复展开`,
          msg: `⚡ <strong>命中备忘录缓存</strong>！<code>memo[${i}][${j}] = <strong>${cached}</strong></code>，直接 O(1) 返回剪枝。`,
          decision: `缓存命中 ${cached}`,
        });
        parentNode.status = 'target';
        activeStack.pop();
        return cached;
      }

      let best = 0;
      let bestK = -1;

      // 枚举最后戳破的气球 k ∈ (i, j)
      for (let k = i + 1; k < j; k++) {
        if (steps.length > 280) break;
        const gain = val[i]! * val[k]! * val[j]!;

        pushStep({
          type: 'loop_k',
          flowPhase: 'forward',
          line: lineLoopK,
          i,
          j,
          activeNodeId: parentNode.id,
          tag: `(${i}, ${j}) 尝试最后戳气球 #${k}(值${val[k]})`,
          log: `| 🔍 枚举最后戳破气球 #${k}(值 ${val[k]})：独立分割为 (${i}, ${k}) 与 (${k}, ${j})`,
          msg: `逆向抉择：设气球 <code>#${k}</code>（数值 <code>${val[k]}</code>）为该开区间<strong>最后</strong>戳破的气球，它戳破时左右相邻必然是固定边界 <code>val[${i}]=${val[i]}</code> 与 <code>val[${j}]=${val[j]}</code>。`,
          decision: `尝试气球 #${k}`,
        });

        const leftChildNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: i,
          c: k,
          val: `dfs(${i}, ${k})`,
          edgeLabel: `左(${i},${k})`,
          status: 'current',
          children: [],
        };
        parentNode.children = parentNode.children || [];
        parentNode.children.push(leftChildNode);

        const leftScore = dfs(i, k, leftChildNode, depth + 1);

        const rightChildNode: UniversalTreeNode = {
          id: `node-${++nodeCounter}`,
          r: k,
          c: j,
          val: `dfs(${k}, ${j})`,
          edgeLabel: `右(${k},${j})`,
          status: 'current',
          children: [],
        };
        parentNode.children.push(rightChildNode);

        const rightScore = dfs(k, j, rightChildNode, depth + 1);

        const totalCoins = leftScore + rightScore + gain;
        if (totalCoins > best) {
          best = totalCoins;
          bestK = k;
        }

        pushStep({
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          deps: [
            { r: i, c: k, type: 'left', label: `(${i},${k})=${leftScore}` },
            { r: k, c: j, type: 'bottom' as any, label: `(${k},${j})=${rightScore}` },
          ],
          tag: `(${i}, ${j}) 戳气球 #${k} 总分=${totalCoins}`,
          log: `| 🎯 开区间 (${i}, ${j}) 以 #${k} 为最后气球：左(${leftScore}) + 右(${rightScore}) + 收益(${gain}) = ${totalCoins}`,
          msg: `计算分支收益：左区间 <code>${leftScore}</code> + 右区间 <code>${rightScore}</code> + 戳气球金币 <code>${val[i]} × ${val[k]} × ${val[j]} = ${gain}</code> ➔ 总得分 <strong>${totalCoins}</strong>。`,
          decision: `更新候选 ${totalCoins}`,
        });
      }

      if (isMemo) {
        memoGrid[i]![j] = best;
        memoCache[`${i},${j}`] = best;
      }

      pushStep({
        type: 'return',
        flowPhase: 'backtrack',
        line: lineReturn,
        i,
        j,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j },
        tag: `(${i}, ${j}) 最优解=${best} (气球#${bestK})`,
        log: `| 🏆 开区间 (${i}, ${j}) 汇聚完成：最后戳气球 #${bestK} 最优，最高得分 = ${best}`,
        msg: `开区间 <code>(${i}, ${j})</code> 求解完成：以气球 <code>#${bestK}</code> 为最后戳破者最优，最高硬币数 <strong>${best}</strong>。`,
        decision: `收敛返回 ${best}`,
      });

      parentNode.status = 'target';
      activeStack.pop();
      return best;
    }

    const maxCoins = dfs(0, m - 1, rootNode, 1);
    memoGrid[0]![m - 1] = maxCoins;

    pushStep({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineReturn,
      i: 0,
      j: m - 1,
      gridHighlight: { i: 0, j: m - 1 },
      tag: `🎉 全局最大硬币数: ${maxCoins}`,
      log: `| 🏆 递归演练完成：全局开区间 (0, ${m - 1}) 最大得分 = ${maxCoins}`,
      msg: `🎉 推导完成！原数组全部 <code>${n}</code> 个气球戳破能获得的最高硬币总数为 <strong>${maxCoins}</strong>。`,
      decision: `全局最优 ${maxCoins}`,
    });

    return steps;
  }

  // ==========================================================================
  // Stage 3 & Stage 4: 严格二维表递推与空间拓扑演化
  // ==========================================================================
  const grid: (number | null)[][] = Array.from({ length: m }, () => new Array(m).fill(null));

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
    tag: `maxCoins(nums) 气球数量 n=${n}`,
    log: `🎯 进入 maxCoins：气球数组 nums=[${nums.join(', ')}]`,
    msg: `主函数入口：给定 <code>${n}</code> 个气球，数值为 <code>[${nums.join(', ')}]</code>。戳破气球 $k$ 的收益为左邻居 $\\times k \\times$ 右邻居。`,
  });

  // Step 1: 首尾哨兵数组构造
  steps.push({
    stage,
    type: 'init',
    flowPhase: 'forward',
    line: lineSetBorder,
    codeLine: lineSetBorder,
    i: 0,
    j: m - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...val],
    memo: {},
    activeSlot: 0,
    decision: '设置哨兵',
    tag: `构建哨兵数组 val=[${val.join(', ')}]`,
    log: `| 🎈 首尾添加虚拟气球 1 ➔ val = [${val.join(', ')}]，总长度 ${m}`,
    msg: `添加边界保护：左右两端各补一个标号为 <code>1</code> 的虚拟气球，将问题转化为开区间 <code>(0, ${m - 1})</code> 的求解。`,
  });

  // Step 2: 分配 DP 表格
  steps.push({
    stage,
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    codeLine: lineInitDp,
    i: 0,
    j: m - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...val],
    memo: {},
    activeSlot: 0,
    decision: '分配DP表格',
    tag: `分配 dp[${m}][${m}] 矩阵`,
    log: `| 📊 初始化上三角开区间 DP 矩阵：dp[i][j] 表示开区间 (i, j) 内戳破所有气球的最大得分`,
    msg: `分配开区间状态表 <code>dp = new int[${m}][${m}]</code>。开区间长度至少为 2（即内部至少包含 1 个气球）。`,
  });

  // Step 3: 表格计算循环
  if (stage === 4) {
    // Stage 4: 空间对偶 / 对角线逆推拓扑：从大行号向小行号倒推
    for (let i = n; i >= 0; i--) {
      steps.push({
        stage: 4,
        type: 'loop_i',
        flowPhase: 'forward',
        line: lineLoopI,
        codeLine: lineLoopI,
        i,
        j: i + 2,
        grid: snapshotGrid2D(grid),
        dp1d: [...val],
        memo: {},
        activeSlot: i,
        decision: `倒序固定左端点 i=${i}`,
        tag: `倒序推进: 固定左端点 i=${i}`,
        log: `| 📐 空间拓扑演化：倒序固定左端点 i = ${i}，向右拓展计算各开区间 (i, j)`,
        msg: `外层倒序推进：当前固定开区间左端点 <code>i = ${i}</code>。`,
      });

      for (let j = i + 2; j <= n + 1; j++) {
        let best = 0;
        let bestK = -1;

        for (let k = i + 1; k < j; k++) {
          const gain = val[i]! * val[k]! * val[j]!;
          const leftCoins = grid[i]![k] ?? 0;
          const rightCoins = grid[k]![j] ?? 0;
          const total = leftCoins + rightCoins + gain;
          if (total > best) {
            best = total;
            bestK = k;
          }
        }

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
          dp1d: [...val],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps: bestK !== -1 ? [
            { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
            { r: bestK, c: j, type: 'bottom' as any, label: `dp[${bestK}][${j}]=${grid[bestK]![j]}` },
          ] : [],
          decision: `dp[${i}][${j}] = ${best}`,
          tag: `对角拓扑 (${i}, ${j}) 最优气球: #${bestK}, 得分: ${best}`,
          log: `| 🎯 开区间 (${i}, ${j})：最后戳气球 #${bestK}(值${val[bestK]}) ➔ dp[${i}][${j}] = ${best}`,
          msg: `对偶更新开区间 <code>(${i}, ${j})</code>：选择最后戳破气球 <code>#${bestK}</code>，得分 <strong>${best}</strong>。`,
        });
      }
    }
  } else {
    // Stage 3: 按开区间跨度 len 从 2 到 n + 1 递增计算（或 reverse 从 n+1 到 2）
    const lenStart = isReverse ? n + 1 : 2;
    const lenEnd = isReverse ? 2 : n + 1;
    const lenStep = isReverse ? -1 : 1;

    for (let len = lenStart; isReverse ? len >= lenEnd : len <= lenEnd; len += lenStep) {
      steps.push({
        stage: 3,
        type: 'loop_len',
        flowPhase: 'forward',
        line: lineLoopLen,
        codeLine: lineLoopLen,
        i: 0,
        j: len,
        grid: snapshotGrid2D(grid),
        dp1d: [...val],
        memo: {},
        activeSlot: len,
        decision: `跨度 len=${len}`,
        tag: `--- 递推开区间跨度 len = ${len} ---`,
        log: `| 📏 考察所有跨度为 ${len} 的开区间 (i, i + ${len})`,
        msg: `外层递推推进：当前计算跨度 <code>len = ${len}</code> 的开区间。`,
      });

      for (let i = 0; i <= m - 1 - len; i++) {
        const j = i + len;
        let best = 0;
        let bestK = -1;

        // 枚举最后戳破的气球 k ∈ (i, j)
        for (let k = i + 1; k < j; k++) {
          const gain = val[i]! * val[k]! * val[j]!;
          const leftCoins = grid[i]![k] ?? 0;
          const rightCoins = grid[k]![j] ?? 0;
          const total = leftCoins + rightCoins + gain;

          steps.push({
            stage: 3,
            type: 'loop_k',
            flowPhase: 'forward',
            line: lineLoopK,
            codeLine: lineLoopK,
            i,
            j,
            grid: snapshotGrid2D(grid),
            dp1d: [...val],
            memo: {},
            activeSlot: k,
            gridHighlight: { i, j },
            deps: [
              { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftCoins}` },
              { r: k, c: j, type: 'bottom' as any, label: `dp[${k}][${j}]=${rightCoins}` },
            ],
            decision: `尝试最后戳破气球 #${k}(值${val[k]})`,
            tag: `开区间 (${i}, ${j}) 尝试气球 #${k}: 即时金币=${val[i]}*${val[k]}*${val[j]}=${gain}`,
            log: `| 🎯 尝试以气球 #${k}(值${val[k]}) 作为开区间 (${i}, ${j}) 最后一个戳破者：金币=${gain} + 左侧(${leftCoins}) + 右侧(${rightCoins}) = ${total}`,
            msg: `开区间 <code>(${i}, ${j})</code> 尝试以气球 <code>#${k}</code>（值 <code>${val[k]}</code>）作为最后戳破者：即时金币 <code>${val[i]} × ${val[k]} × ${val[j]} = ${gain}</code>，左侧 <code>dp[${i}][${k}] = ${leftCoins}</code>，右侧 <code>dp[${k}][${j}] = ${rightCoins}</code>，总收益 <strong>${total}</strong>。`,
          });

          if (total > best) {
            best = total;
            bestK = k;

            steps.push({
              stage: 3,
              type: 'update_best',
              flowPhase: 'forward',
              line: lineUpdateBest,
              codeLine: lineUpdateBest,
              i,
              j,
              grid: snapshotGrid2D(grid),
              dp1d: [...val],
              memo: {},
              activeSlot: k,
              gridHighlight: { i, j },
              deps: [
                { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftCoins}` },
                { r: k, c: j, type: 'bottom' as any, label: `dp[${k}][${j}]=${rightCoins}` },
              ],
              decision: `刷新最大金币 best=${total} (选气球 #${k})`,
              tag: `更优方案：最后戳气球 #${k} 获得金币 ${total} > 原最高`,
              log: `| 🏆 刷新最优解：开区间 (${i}, ${j}) 最后戳气球 #${k}，金币刷新为 ${best}`,
              msg: `更新最优决策：开区间 <code>(${i}, ${j})</code> 最后戳破气球 <code>#${k}</code> 获得金币 <strong>${total}</strong> 刷新当前最高记录。`,
            });
          }
        }

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
          dp1d: [...val],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps: bestK !== -1 ? [
            { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
            { r: bestK, c: j, type: 'bottom' as any, label: `dp[${bestK}][${j}]=${grid[bestK]![j]}` },
          ] : [],
          decision: `dp[${i}][${j}] = ${best}`,
          tag: `开区间 (${i}, ${j}) 最优气球: #${bestK}(值${val[bestK]}), dp[${i}][${j}] = ${best}`,
          log: `| 🎯 开区间 (${i}, ${j}) [气球 ${val.slice(i + 1, j).join(', ')}]：最后戳气球 ${bestK}(值${val[bestK]}) 收益=${val[i]}*${val[bestK]}*${val[j]}=${val[i]! * val[bestK]! * val[j]!} ➔ dp[${i}][${j}] = ${best}`,
          msg: `计算开区间 <code>(${i}, ${j})</code>：以气球 <code>${bestK}</code>（数值 <code>${val[bestK]}</code>）作为最后戳破者最优，获得金币 <code>${val[i]} × ${val[bestK]} × ${val[j]} + dp[${i}][${bestK}] + dp[${bestK}][${j}] = <strong>${best}</strong></code>。`,
        });
      }
    }
  }

  // Step 4: 全局最优解收敛
  const maxCoins = grid[0]![m - 1] ?? 0;
  steps.push({
    stage,
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    codeLine: lineReturn,
    i: 0,
    j: m - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...val],
    memo: {},
    activeSlot: m - 1,
    gridHighlight: { i: 0, j: m - 1 },
    decision: `最终最大得分: ${maxCoins}`,
    tag: `🎉 戳破全部气球最大硬币数: ${maxCoins}`,
    log: `| 🏆 推导收敛：开区间 (0, ${m - 1}) 最大得分 dp[0][${m - 1}] = ${maxCoins}`,
    msg: `🎉 推导完成！将原数组全部 <code>${n}</code> 个气球戳破能获得的最高硬币总数为 <strong>${maxCoins}</strong>。`,
  });

  return steps;
}
