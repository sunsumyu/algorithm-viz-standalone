import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { snapshotGrid2D } from './grid-snapshot';

/**
 * 预测赢家 (Predict the Winner / 纸牌博弈, LC 486, 左程云 83 课)
 * 区间 DP 经典博弈：
 * 状态定义：dp[i][j] 表示在区间 [i, j] 内当前行动者相对于对手的最大净胜分。
 * 转移方程：dp[i][j] = max(nums[i] - dp[i+1][j], nums[j] - dp[i][j-1])
 * 严格遵循黄金规约：
 * 1. 严格上三角网格拓扑 (i <= j) 与依赖高亮；
 * 2. 顶层控制流相位契约 (flowPhase: 'forward' | 'backtrack')；
 * 3. 完备生命周期：entry -> guard -> init_dp -> init_base -> loop_len -> loop_i -> transfer -> return。
 */
export function compilePredictWinner(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const nums: number[] = (params.params?.nums as number[]) || [1, 5, 2];
  const n = nums.length;
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitN = anchorMap?.init_n || 3;
  const lineGuardEven = anchorMap?.guard_even || 4;
  const lineInitDp = anchorMap?.init_dp || 5;
  const lineInitBase = anchorMap?.init_base || 6;
  const lineLoopLen = anchorMap?.loop_len || 7;
  const lineLoopI = anchorMap?.loop_i || 8;
  const lineCalcJ = anchorMap?.calc_j || 9;
  const lineBranchLeft = anchorMap?.branch_left || 10;
  const lineBranchRight = anchorMap?.branch_right || 11;
  const lineTransfer = anchorMap?.transfer || 12;
  const lineReturn = anchorMap?.return || 15;

  const steps: UniversalStep[] = [];

  // 二维表格初始化 (上三角有效，初始均为 null)
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

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
    tag: `predictTheWinner(nums) 数组长度 n=${n}`,
    log: `🎯 进入 predictTheWinner：牌堆 nums=[${nums.join(', ')}]`,
    msg: `主函数入口：给定纸牌数组 <code>nums = [${nums.join(', ')}]</code>。两位玩家均采取最优策略轮流拿牌，每次只能拿走最左端或最右端的一张。`,
  });

  // Step 1: 偶数长度特判
  steps.push({
    type: 'guard',
    flowPhase: 'forward',
    line: lineGuardEven,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: 0,
    tag: `n = ${n} (${n % 2 === 0 ? '偶数: 先手必胜' : '奇数: 进入推导'})`,
    log: `| 数组长度 n=${n}，${n % 2 === 0 ? '偶数长度先手可通过奇偶位染色策略必胜' : '奇数长度需区间 DP 严格推导'}`,
    msg: n % 2 === 0
      ? `偶数长度特判：<code>n = ${n}</code> 为偶数，先手总能通过奇偶位选择控制全部奇数位或全部偶数位纸牌，先手必胜。`
      : `奇偶性判定：<code>n = ${n}</code> 为奇数，需通过区间动态规划精确推导双方最优决策。`,
  });

  // Step 2: 分配二维表格
  steps.push({
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: 0,
    tag: `分配 dp[${n}][${n}] 状态矩阵`,
    log: `| 📊 初始化上三角区间 DP 矩阵：dp[i][j] 表示区间 [i, j] 先手相对后手的净胜分`,
    msg: `创建状态表 <code>dp = new int[${n}][${n}]</code>。因为区间左端点 <code>i <= j</code>，仅上三角区域有效。`,
  });

  // Step 3: 单张牌基础边界初始化 (len = 1, dp[i][i] = nums[i])
  for (let i = 0; i < n; i++) {
    grid[i]![i] = nums[i]!;
    steps.push({
      type: 'boundary',
      flowPhase: 'backtrack',
      line: lineInitBase,
      i,
      j: i,
      grid: snapshotGrid2D(grid),
      dp1d: [...nums],
      memo: {},
      activeSlot: i,
      gridHighlight: { i, j: i },
      tag: `基底: dp[${i}][${i}] = ${nums[i]}`,
      log: `| 🏁 单牌基底：区间 [${i}, ${i}] 只有一张牌 ${nums[i]}，先手直接拿走，净胜分 = ${nums[i]}`,
      msg: `初始化基底：当区间长度为 1 时，<code>dp[${i}][${i}] = nums[${i}] = <strong>${nums[i]}</strong></code>。`,
    });
  }

  // Step 4: 按区间长度 len 从 2 到 n 逐步递推
  for (let len = 2; len <= n; len++) {
    steps.push({
      type: 'loop_len',
      flowPhase: 'forward',
      line: lineLoopLen,
      i: 0,
      j: len - 1,
      grid: snapshotGrid2D(grid),
      dp1d: [...nums],
      memo: {},
      activeSlot: len,
      tag: `--- 递推区间长度 len = ${len} ---`,
      log: `| 📏 开始计算所有长度为 ${len} 的区间`,
      msg: `外层循环推进：当前推演所有跨度为 <code>len = ${len}</code> 的子区间。`,
    });

    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;

      // 决策展开：高亮依赖单元格
      const chooseLeft = nums[i]! - (grid[i + 1]![j] ?? 0);
      const chooseRight = nums[j]! - (grid[i]![j - 1] ?? 0);
      const best = Math.max(chooseLeft, chooseRight);
      grid[i]![j] = best;

      steps.push({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
        i,
        j,
        grid: snapshotGrid2D(grid),
        dp1d: [...nums],
        memo: {},
        activeSlot: j,
        gridHighlight: { i, j },
        deps: [
          { r: i + 1, c: j, type: 'bottom' as any, label: `dp[${i+1}][${j}]=${grid[i+1]![j]}` },
          { r: i, c: j - 1, type: 'left', label: `dp[${i}][${j-1}]=${grid[i]![j-1]}` },
        ],
        tag: `dp[${i}][${j}] = max(${chooseLeft}, ${chooseRight}) = ${best}`,
        log: `| 🔀 区间 [${i}, ${j}] (牌[${nums.slice(i, j + 1).join(',')}])：选左=${nums[i]}-dp[${i+1}][${j}](${grid[i+1]![j]})=${chooseLeft}，选右=${nums[j]}-dp[${i}][${j-1}](${grid[i]![j-1]})=${chooseRight} ➔ 最优净胜分 = ${best}`,
        msg: `计算区间 <code>[${i}, ${j}]</code>：先手选左端 <code>nums[${i}]=${nums[i]}</code> 后手净胜 <code>${grid[i+1]![j]}</code>，净得 <code>${chooseLeft}</code>；选右端 <code>nums[${j}]=${nums[j]}</code> 净得 <code>${chooseRight}</code>。因此 <code>dp[${i}][${j}] = <strong>${best}</strong></code>。`,
      });
    }
  }

  // Step 5: 全局收敛返回
  const finalScore = grid[0]![n - 1] ?? 0;
  const canWin = finalScore >= 0;

  steps.push({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...nums],
    memo: {},
    activeSlot: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    tag: `先手最终净胜分: ${finalScore} -> ${canWin ? '先手获胜 ✓' : '先手落败 ✗'}`,
    log: `| 🏆 推导收敛：dp[0][${n - 1}] = ${finalScore}，先手${canWin ? '获胜 (>=0)' : '落败 (<0)'}`,
    msg: `🎉 推导完成！全局区间 <code>[0, ${n - 1}]</code> 上先手的最大相对净胜分为 <strong>${finalScore}</strong>。最终结论：<strong>${canWin ? '玩家 1 获胜！返回 true' : '玩家 1 无法获胜！返回 false'}</strong>。`,
  });

  return steps;
}
