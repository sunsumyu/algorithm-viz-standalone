import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { snapshotGrid2D } from './grid-snapshot';

/**
 * 戳气球 (Burst Balloons, LC 312, 左程云 83 课)
 * 区间 DP 经典逆向思维：
 * 核心洞察：正向戳气球会导致左右相邻关系断裂；逆向思考“谁是开区间 (i, j) 中最后一个被戳破的气球 k”，
 * 则此时 k 的左右边界必定是开区间固定的两个端点 val[i] 和 val[j]！
 * 状态定义：dp[i][j] 表示开区间 (i, j) 内所有气球被戳破的最大硬币收益。
 * 转移方程：dp[i][j] = max_{k \in (i, j)} (dp[i][k] + dp[k][j] + val[i] * val[k] * val[j])
 */
export function compileBurstBalloons(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const nums: number[] = (params.params?.nums as number[]) || [3, 1, 5, 8];
  const n = nums.length;
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitN = anchorMap?.init_n || 3;
  const lineInitVal = anchorMap?.init_val || 4;
  const lineSetBorder = anchorMap?.set_border || 5;
  const lineFillVal = anchorMap?.fill_val || 6;
  const lineInitDp = anchorMap?.init_dp || 7;
  const lineLoopLen = anchorMap?.loop_len || 8;
  const lineLoopI = anchorMap?.loop_i || 9;
  const lineCalcJ = anchorMap?.calc_j || 10;
  const lineInitBest = anchorMap?.init_best || 11;
  const lineLoopK = anchorMap?.loop_k || 12;
  const lineCalcGain = anchorMap?.calc_gain || 13;
  const lineCalcCoins = anchorMap?.calc_coins || 14;
  const lineUpdateBest = anchorMap?.update_best || 15;
  const lineTransfer = anchorMap?.transfer || 17;
  const lineReturn = anchorMap?.return || 20;

  const steps: UniversalStep[] = [];

  // 首尾哨兵数组 val: [1, nums..., 1]
  const val = [1, ...nums, 1];
  const m = n + 2;

  // 二维表格：大小 (n+2) * (n+2)，上三角有效
  const grid: (number | null)[][] = Array.from({ length: m }, () => new Array(m).fill(null));

  // Step 0: 函数入口帧
  steps.push({
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: 0,
    tag: `maxCoins(nums) 气球数量 n=${n}`,
    log: `🎯 进入 maxCoins：气球数组 nums=[${nums.join(', ')}]`,
    msg: `主函数入口：给定 <code>${n}</code> 个气球，数值为 <code>[${nums.join(', ')}]</code>。戳破气球 $k$ 的收益为左邻居 $\\times k \\times$ 右邻居。`,
  });

  // Step 1: 首尾哨兵与开区间初始化
  steps.push({
    type: 'init',
    flowPhase: 'forward',
    line: lineSetBorder,
    i: 0,
    j: m - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...val],
    memo: {},
    activeSlot: 0,
    tag: `构建哨兵数组 val=[${val.join(', ')}]`,
    log: `| 🎈 首尾添加虚拟气球 1 ➔ val = [${val.join(', ')}]，总长度 ${m}`,
    msg: `添加边界保护：左右两端各补一个标号为 <code>1</code> 的虚拟气球，将问题转化为开区间 <code>(0, ${m - 1})</code> 的求解。`,
  });

  // Step 2: 分配 DP 表格
  steps.push({
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: m - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...val],
    memo: {},
    activeSlot: 0,
    tag: `分配 dp[${m}][${m}] 矩阵`,
    log: `| 📊 初始化上三角开区间 DP 矩阵：dp[i][j] 表示开区间 (i, j) 内戳破所有气球的最大得分`,
    msg: `分配开区间状态表 <code>dp = new int[${m}][${m}]</code>。开区间长度至少为 2（即内部至少包含 1 个气球）。`,
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j <= i + 1 && j < m; j++) {
      grid[i]![j] = 0; // 开区间内无气球时收益为 0
    }
  }

  steps.push({
    type: 'init_val',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...val],
    memo: {},
    activeSlot: 0,
    tag: '基础条件: 开区间无气球得分 0',
    log: '| 📋 开区间长度 <= 1 时内部无气球，收益记为 0',
    msg: '基础条件：当开区间 <code>(i, j)</code> 跨度 <code>j <= i + 1</code> 时，内部无气球可戳，收益为 <code>0</code>。',
  });

  // Step 3: 按开区间跨度 len 从 2 到 n + 1 递增计算
  for (let len = 2; len <= n + 1; len++) {
    steps.push({
      type: 'loop_len',
      flowPhase: 'forward',
      line: lineLoopLen,
      i: 0,
      j: len,
      grid: snapshotGrid2D(grid),
      dp1d: [...val],
      memo: {},
      activeSlot: len,
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
        if (total > best) {
          best = total;
          bestK = k;
        }
      }

      grid[i]![j] = best;

      steps.push({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
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
        tag: `开区间 (${i}, ${j}) 最优气球: #${bestK}(值${val[bestK]}), dp[${i}][${j}] = ${best}`,
        log: `| 🎯 开区间 (${i}, ${j}) [气球 ${val.slice(i + 1, j).join(', ')}]：最后戳气球 ${bestK}(值${val[bestK]}) 收益=${val[i]}*${val[bestK]}*${val[j]}=${val[i]!*val[bestK]!*val[j]!} ➔ dp[${i}][${j}] = ${best}`,
        msg: `计算开区间 <code>(${i}, ${j})</code>：以气球 <code>${bestK}</code>（数值 <code>${val[bestK]}</code>）作为最后戳破者最优，获得金币 <code>${val[i]} × ${val[bestK]} × ${val[j]} + dp[${i}][${bestK}] + dp[${bestK}][${j}] = <strong>${best}</strong></code>。`,
      });
    }
  }

  // Step 4: 全局最优解收敛
  const maxCoins = grid[0]![m - 1] ?? 0;
  steps.push({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: 0,
    j: m - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...val],
    memo: {},
    activeSlot: m - 1,
    gridHighlight: { i: 0, j: m - 1 },
    tag: `🎉 戳破全部气球最大硬币数: ${maxCoins}`,
    log: `| 🏆 推导收敛：开区间 (0, ${m - 1}) 最大得分 dp[0][${m - 1}] = ${maxCoins}`,
    msg: `🎉 推导完成！将原数组全部 <code>${n}</code> 个气球戳破能获得的最高硬币总数为 <strong>${maxCoins}</strong>。`,
  });

  return steps;
}
