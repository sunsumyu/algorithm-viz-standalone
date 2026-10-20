/**
 * 多边形三角剖分的最低得分 (Minimum Score Triangulation of Polygon, LC 1039, 左程云 84 课)
 * 核心：凸多边形区间 DP——固定底边 (i, j)，枚举内部第三个顶点 k 构三角形
 * dp[i][j] = min_{k}(dp[i][k] + dp[k][j] + values[i]*values[k]*values[j])
 * 四阶段全演化推演编译器 (Stage 1-4, forward/reverse 双向支持)
 */

import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

export interface MinScoreTriangulationStepParams {
  values?: number[];
  stage?: number;
  direction?: string;
  isMemo?: boolean;
  anchorMap?: Record<string, number>;
  params?: Record<string, any>;
}

export function parseMinScoreTriangulationInputs(inputs: Record<string, any>): { values: number[] } {
  const raw = inputs?.values ?? inputs?.['input-values'] ?? inputs?.nums ?? [3, 7, 4, 5];
  if (Array.isArray(raw)) return { values: raw.map(Number) };
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { values: parsed.map(Number) };
    } catch {
      // split by comma
    }
    return {
      values: raw
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n)),
    };
  }
  return { values: [3, 7, 4, 5] };
}

export function buildMinScoreTriangulationSteps(params: MinScoreTriangulationStepParams): UniversalStep[] {
  const rawParams = params.params || {};
  const parsed = parseMinScoreTriangulationInputs(rawParams.values !== undefined ? rawParams : params);
  const values = parsed.values.length >= 3 ? parsed.values : [3, 7, 4, 5];
  const n = values.length;
  const stage = params.stage ?? 3;
  const isMemo = Boolean(params.isMemo || stage === 2);
  const isReverse = params.direction === 'reverse';
  const anchorMap = params.anchorMap || {};

  // 1-based 行号兜底
  const lineEntry = anchorMap.entry || 2;
  const lineInitN = anchorMap.init_n || 3;
  const lineGuardLess = anchorMap.guard_less || 4;
  const lineInitDp = anchorMap.init_dp || 5;
  const lineLoopLen = anchorMap.loop_len || 6;
  const lineLoopI = anchorMap.loop_i || 7;
  const lineCalcJ = anchorMap.calc_j || 8;
  const lineInitMin = anchorMap.init_min || 9;
  const lineLoopK = anchorMap.loop_k || 10;
  const lineCalcTri = anchorMap.calc_tri || 11;
  const lineCalcScore = anchorMap.calc_score || 12;
  const lineUpdateMin = anchorMap.update_min || 13;
  const lineTransfer = anchorMap.transfer || 15;
  const lineReturn = anchorMap.return || 17;
  const lineDfsEntry = anchorMap.dfs_entry || 9;
  const lineBoundary = anchorMap.boundary || 10;
  const lineCacheHit = anchorMap.cache_hit || 11;

  const steps: UniversalStep[] = [];

  // ==========================================================================
  // Stage 1 & Stage 2: 递归与记忆化搜索演化 (分治树展开)
  // ==========================================================================
  if (stage === 1 || stage === 2) {
    const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
    for (let i = 0; i < n; i++) {
      memoGrid[i]![i] = 0;
      if (i + 1 < n) memoGrid[i]![i + 1] = 0;
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
      const line = typeof st.line === 'number' && st.line >= 1 ? st.line : lineEntry;
      steps.push({
        stage,
        line,
        codeLine: line,
        flowPhase: st.flowPhase || 'forward',
        i: st.i ?? 0,
        j: st.j ?? 0,
        grid: snapshotGrid2D(memoGrid),
        dp1d: [...values],
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
      tag: `minScoreTriangulation(values) 顶点数 n=${n}`,
      log: `🎯 进入 minScoreTriangulation：多边形顶点 values=[${values.join(', ')}]`,
      msg: `主函数入口：给定凸 <code>${n}</code> 边形顶点权值 <code>[${values.join(', ')}]</code>。求剖分为若干三角形的最低总得分。`,
      decision: '进入主函数',
    });

    // Step 1: 顶点数特判
    pushStep({
      type: 'guard',
      flowPhase: 'forward',
      line: lineGuardLess,
      tag: `顶点数 n=${n} (>=3 有效多边形)`,
      log: `| 顶点数 n=${n}，满足构成凸多边形至少 3 个顶点的几何约束`,
      msg: `顶点规模检查：<code>n = ${n}</code>，可以进行三角剖分。`,
      decision: '顶点数检查通过',
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
          ? `分配上三角记忆化矩阵 <code>memo = new int[${n}][${n}]</code>，防止重叠子多边形重复剖分。`
          : `发起顶层凸多边形剖分递归调用 <code>dfs(0, ${n - 1})</code>。`,
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
        log: `| 📥 进入递归帧 ${callLabel}：求解凸子多边形 [${i}..${j}] 的最低剖分得分`,
        msg: `深入考察顶点子区间 <code>[${i}..${j}]</code> 构成的子多边形。`,
        decision: `深入 [${i}..${j}]`,
      });

      // 边界特判：顶点数少于 3 (无法构成三角形)
      if (i + 1 >= j) {
        pushStep({
          type: 'boundary',
          flowPhase: 'backtrack',
          line: lineBoundary,
          i,
          j,
          activeNodeId: parentNode.id,
          gridHighlight: { i, j },
          tag: `基底: 边 (${i}, ${j}) 顶点数<3 ➔ 0`,
          log: `| 🎯 边界基底：区间 [${i}..${j}] 点数不足 3 个，无法构成三角形，得分 0`,
          msg: `区间 <code>[${i}..${j}]</code> 仅为一条边或单点，无法构成三角形，贡献得分 <code>0</code>。`,
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
          log: `| ⚡ 命中备忘录缓存：子多边形 [${i}..${j}] 已求解过，直接返回最低得分 ${cached}`,
          msg: `命中记忆化缓存：子多边形 <code>[${i}..${j}]</code> 已有最优剖分得分 <strong>${cached}</strong>。`,
          decision: `复用缓存 ${cached}`,
        });
        parentNode.status = 'computed';
        activeStack.pop();
        return cached;
      }

      let minScore = Infinity;
      let bestK = -1;

      for (let k = i + 1; k < j; k++) {
        nodeCounter++;
        const triScore = values[i]! * values[k]! * values[j]!;
        const kChild: UniversalTreeNode = {
          id: `node-${nodeCounter}`,
          r: i,
          c: j,
          val: `k=${k}(▲${triScore})`,
          status: 'current',
          children: [],
        };
        parentNode.children.push(kChild);

        pushStep({
          type: 'loop_k',
          flowPhase: 'forward',
          line: lineLoopK,
          i,
          j,
          activeNodeId: parentNode.id,
          tag: `枚举顶点 k=${k}: 三角形(${i},${k},${j}) 得分=${triScore}`,
          log: `| 🔺 尝试顶点 k=${k}：构成三角形 (${i},${k},${j})，三角乘积 ${values[i]}*${values[k]}*${values[j]} = ${triScore}`,
          msg: `切分尝试：选取顶点 <code>k = ${k}</code> 构成三角形，将多边形划分为左侧 <code>[${i}..${k}]</code> 与右侧 <code>[${k}..${j}]</code>。`,
          decision: `测试顶点 k=${k}`,
        });

        const leftRes = dfs(i, k, kChild, depth + 1);
        const rightRes = dfs(k, j, kChild, depth + 1);
        const totalScore = leftRes + rightRes + triScore;

        if (totalScore < minScore) {
          minScore = totalScore;
          bestK = k;
        }
      }

      memoGrid[i]![j] = minScore;
      memoCache[`${i},${j}`] = minScore;

      pushStep({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
        i,
        j,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j },
        tag: `[${i}..${j}] 最优三角形顶点 k=${bestK} ➔ 最低得分 ${minScore}`,
        log: `| 🏆 多边形 [${i}..${j}] 剖分收敛：最优顶点 k=${bestK}，最低总得分 = ${minScore}`,
        msg: `子多边形 <code>[${i}..${j}]</code> 剖分完成：最优剖分在顶点 <code>k = ${bestK}</code> 处，最低总得分为 <strong>${minScore}</strong>。`,
        decision: `收敛返回 ${minScore}`,
      });

      parentNode.status = 'target';
      activeStack.pop();
      return minScore;
    }

    const finalScore = dfs(0, n - 1, rootNode, 1);
    memoGrid[0]![n - 1] = finalScore;

    pushStep({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineReturn,
      i: 0,
      j: n - 1,
      gridHighlight: { i: 0, j: n - 1 },
      tag: `🎉 凸多边形三角剖分最低得分: ${finalScore}`,
      log: `| 🏆 递归演练完成：全局多边形 [0..${n - 1}] 最低得分 = ${finalScore}`,
      msg: `🎉 推导完成！凸 <code>${n}</code> 边形三角剖分的最低可能总得分为 <strong>${finalScore}</strong>。`,
      decision: `全局最优 ${finalScore}`,
    });

    return steps;
  }

  // ==========================================================================
  // Stage 3 & Stage 4: 严格二维表递推与对角线拓扑演化
  // ==========================================================================
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i + 1 && j < n; j++) {
      grid[i]![j] = 0; // 点数 < 3 无法构成三角形，得分为 0
    }
  }

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
    dp1d: [...values],
    memo: {},
    activeSlot: 0,
    decision: '函数入口',
    tag: `minScoreTriangulation(values) 顶点数 n=${n}`,
    log: `🎯 进入 minScoreTriangulation：多边形顶点 values=[${values.join(', ')}]`,
    msg: `主函数入口：给定凸 <code>${n}</code> 边形顶点权值 <code>[${values.join(', ')}]</code>。求剖分为若干三角形的最低总得分。`,
  });

  // Step 1: 顶点数特判
  steps.push({
    stage,
    type: 'guard',
    flowPhase: 'forward',
    line: lineGuardLess,
    codeLine: lineGuardLess,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...values],
    memo: {},
    activeSlot: 0,
    decision: '顶点数特判',
    tag: `顶点数 n=${n} (>=3)`,
    log: `| 检查顶点数 n=${n}，满足凸多边形基本条件`,
    msg: `顶点规模检查：<code>n = ${n}</code>，开始上三角动态规划填表。`,
  });

  // Step 2: 分配表格
  steps.push({
    stage,
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    codeLine: lineInitDp,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...values],
    memo: {},
    activeSlot: 0,
    decision: '分配DP表格',
    tag: `分配 dp[${n}][${n}] 状态矩阵`,
    log: `| 📊 初始化上三角区间 DP 矩阵：dp[i][j] 表示子多边形 [i..j] 剖分最小总得分`,
    msg: `分配状态表 <code>dp = new int[${n}][${n}]</code>。相邻点及自身（长度 $\\le 2$）无法构成三角形，初始值为 0。`,
  });

  // Step 2.5: 单点与双点基底初始化
  for (let i = 0; i < n; i++) {
    steps.push({
      stage,
      type: 'boundary',
      flowPhase: 'backtrack',
      line: lineBoundary,
      codeLine: lineBoundary,
      i,
      j: i,
      grid: snapshotGrid2D(grid),
      dp1d: [...values],
      memo: {},
      activeSlot: i,
      gridHighlight: { i, j: i },
      decision: `基底: 单点 [${i}..${i}] 无法构成三角形 ➔ 0`,
      tag: `基底: dp[${i}][${i}] = 0`,
      log: `| 🏁 单点基底：顶点 ${i} 自身无法构成三角形，得分 = 0`,
      msg: `单点基底：顶点 <code>${i}</code> 无法构成三角形，记 <code>dp[${i}][${i}] = 0</code>。`,
    });
  }

  // Step 3: 表格计算循环
  if (stage === 4) {
    // Stage 4: 对角线倒序填表拓扑演化 (i 从 n-3 递减到 0, j 从 i+2 递增到 n-1)
    for (let i = n - 3; i >= 0; i--) {
      steps.push({
        stage: 4,
        type: 'loop_i',
        flowPhase: 'forward',
        line: lineLoopI,
        codeLine: lineLoopI,
        i,
        j: i + 2,
        grid: snapshotGrid2D(grid),
        dp1d: [...values],
        memo: {},
        activeSlot: i,
        decision: `倒序固定起点 i=${i}`,
        tag: `倒序推进: 固定起点 i = ${i}`,
        log: `| 📐 空间拓扑优化：倒序固定起点 i = ${i}，向右拓展计算各子多边形 [i..j]`,
        msg: `外层倒序推进：当前固定多边形起点 <code>i = ${i}</code>。`,
      });

      for (let j = i + 2; j < n; j++) {
        let minScore = Infinity;
        let bestK = -1;

        for (let k = i + 1; k < j; k++) {
          const tri = values[i]! * values[k]! * values[j]!;
          const leftScore = grid[i]![k] ?? 0;
          const rightScore = grid[k]![j] ?? 0;
          const score = leftScore + rightScore + tri;
          if (score < minScore) {
            minScore = score;
            bestK = k;
          }
        }

        grid[i]![j] = minScore;

        steps.push({
          stage: 4,
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          codeLine: lineTransfer,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...values],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps:
            bestK !== -1
              ? [
                  { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
                  { r: bestK, c: j, type: 'bottom' as any, label: `dp[${bestK}][${j}]=${grid[bestK]![j]}` },
                ]
              : [],
          decision: `更新 dp[${i}][${j}]=${minScore}`,
          tag: `dp[${i}][${j}] = minScore: 选点 k=${bestK} 构三角 ➔ ${minScore}`,
          log: `| 🔀 倒序填表 [${i}..${j}]：以(${i},${bestK},${j})构三角形，总得分 = ${minScore}`,
          msg: `子多边形 <code>[${i}..${j}]</code> 剖分计算完成：选择顶点 <code>k = ${bestK}</code> 得到最低得分 <strong>${minScore}</strong>。`,
        });
      }
    }
  } else if (isReverse) {
    // 逆向推演分支：从全局多边形 [0..n-1] 逆向寻源
    for (let len = 3; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        let minScore = Infinity;
        for (let k = i + 1; k < j; k++) {
          const tri = values[i]! * values[k]! * values[j]!;
          minScore = Math.min(minScore, (grid[i]![k] ?? 0) + (grid[k]![j] ?? 0) + tri);
        }
        grid[i]![j] = minScore;
      }
    }

    for (let len = n; len >= 3; len--) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        const currentScore = grid[i]![j] ?? 0;

        steps.push({
          stage: 3,
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          codeLine: lineTransfer,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...values],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          decision: `逆向追溯 [${i}..${j}]`,
          tag: `逆向追溯 dp[${i}][${j}] = ${currentScore}`,
          log: `| 🔍 逆向依赖寻源：子多边形 [${i}..${j}](${currentScore}) 追溯内部最优三角划分`,
          msg: `逆向追溯多边形 <code>[${i}..${j}]</code>：分析构成三角形的最佳分割顶点。`,
        });
      }
    }
  } else {
    // Stage 3: 标准多边形跨度填表 (len 从 3 到 n)
    for (let len = 3; len <= n; len++) {
      steps.push({
        stage: 3,
        type: 'loop_len',
        flowPhase: 'forward',
        line: lineLoopLen,
        codeLine: lineLoopLen,
        i: 0,
        j: len - 1,
        grid: snapshotGrid2D(grid),
        dp1d: [...values],
        memo: {},
        activeSlot: len,
        decision: `递推跨度 len=${len}`,
        tag: `--- 递推顶点跨度 len = ${len} ---`,
        log: `| 📐 计算所有包含 ${len} 个顶点的凸子多边形剖分`,
        msg: `外层递推推进：当前考察跨度包含 <code>${len}</code> 个顶点的凸多边形。`,
      });

      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        let minScore = Infinity;
        let bestK = -1;

        for (let k = i + 1; k < j; k++) {
          const tri = values[i]! * values[k]! * values[j]!;
          const leftScore = grid[i]![k] ?? 0;
          const rightScore = grid[k]![j] ?? 0;
          const score = leftScore + rightScore + tri;

          steps.push({
            stage: 3,
            type: 'loop_k',
            flowPhase: 'forward',
            line: lineLoopK,
            codeLine: lineLoopK,
            i,
            j,
            grid: snapshotGrid2D(grid),
            dp1d: [...values],
            memo: {},
            activeSlot: k,
            gridHighlight: { i, j },
            deps: [
              { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftScore}` },
              { r: k, c: j, type: 'bottom' as any, label: `dp[${k}][${j}]=${rightScore}` },
            ],
            decision: `枚举顶点 k=${k} 构三角形`,
            tag: `多边形 [${i}..${j}] 尝试顶点 k=${k}: 三角形(${i},${k},${j})得分=${tri}`,
            log: `| 🔍 尝试以顶点 k=${k} 构三角形：(${values[i]}*${values[k]}*${values[j]}=${tri}) + 左侧(${leftScore}) + 右侧(${rightScore}) = ${score}`,
            msg: `多边形 <code>[${i}..${j}]</code> 尝试以顶点 <code>k = ${k}</code> 构成三角形：三角形得分 <code>${values[i]} × ${values[k]} × ${values[j]} = ${tri}</code>，左侧 <code>dp[${i}][${k}] = ${leftScore}</code>，右侧 <code>dp[${k}][${j}] = ${rightScore}</code>，总计 <strong>${score}</strong>。`,
          });

          if (score < minScore) {
            minScore = score;
            bestK = k;

            steps.push({
              stage: 3,
              type: 'update_min',
              flowPhase: 'forward',
              line: lineUpdateMin,
              codeLine: lineUpdateMin,
              i,
              j,
              grid: snapshotGrid2D(grid),
              dp1d: [...values],
              memo: {},
              activeSlot: k,
              gridHighlight: { i, j },
              deps: [
                { r: i, c: k, type: 'left', label: `dp[${i}][${k}]=${leftScore}` },
                { r: k, c: j, type: 'bottom' as any, label: `dp[${k}][${j}]=${rightScore}` },
              ],
              decision: `更新最低得分 minScore=${score} (k=${k})`,
              tag: `更优方案：选顶点 k=${k} 得分 ${score} < 原最低`,
              log: `| ✨ 找到更低得分：k=${k}，最低得分更新为 ${minScore}`,
              msg: `更新最优解：选择顶点 <code>k = ${k}</code> 时总得分 <strong>${score}</strong> 优于之前方案，刷新当前子多边形最低得分。`,
            });
          }
        }

        grid[i]![j] = minScore;

        steps.push({
          stage: 3,
          type: 'transfer',
          flowPhase: 'backtrack',
          line: lineTransfer,
          codeLine: lineTransfer,
          i,
          j,
          grid: snapshotGrid2D(grid),
          dp1d: [...values],
          memo: {},
          activeSlot: j,
          gridHighlight: { i, j },
          deps:
            bestK !== -1
              ? [
                  { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
                  { r: bestK, c: j, type: 'bottom' as any, label: `dp[${bestK}][${j}]=${grid[bestK]![j]}` },
                ]
              : [],
          decision: `转移 [${i}..${j}] 得 ${minScore}`,
          tag: `多边形 [${i}..${j}] 最优三角形: (${i}, ${bestK}, ${j}), dp[${i}][${j}] = ${minScore}`,
          log: `| 🔺 多边形 [${i}..${j}]：以边(${i},${j})和顶点${bestK}构三角(${values[i]}*${values[bestK]}*${values[j]}=${values[i]! * values[bestK]! * values[j]!}) ➔ 最低得分 dp[${i}][${j}] = ${minScore}`,
          msg: `计算凸多边形 <code>[${i}..${j}]</code>：选取顶点 <code>${bestK}</code> 构成三角形最优，三角得分 <code>${values[i]} × ${values[bestK]} × ${values[j]} + dp[${i}][${bestK}] + dp[${bestK}][${j}] = <strong>${minScore}</strong></code>。`,
        });
      }
    }
  }

  // Step 4: 全局收敛返回
  const ans = grid[0]![n - 1] ?? 0;
  steps.push({
    stage,
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    codeLine: lineReturn,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...values],
    memo: {},
    activeSlot: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    decision: `全局最优 ${ans}`,
    tag: `🎉 凸多边形三角剖分最低得分: ${ans}`,
    log: `| 🏆 推导收敛：dp[0][${n - 1}] = ${ans}`,
    msg: `🎉 推导完成！凸 <code>${n}</code> 边形三角剖分的最低可能总得分为 <strong>${ans}</strong>。`,
  });

  return steps;
}
