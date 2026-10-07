/**
 * 最低票价 (Minimum Cost For Tickets · LeetCode 983)
 * Step Compiler: 一维动态规划逆向跳跃状态转移推演
 */

import { type Dp066StepBase } from '../../../algorithms/categories/dynamic-programming/dp-066/dp-066-shared';
import { MIN_COST_TICKETS_066_LINES } from '../../../algorithms/categories/dynamic-programming/dp-066/dp-066-stage-codes';

export interface MinCostTicketsStep extends Dp066StepBase {
  days: number[];
  costs: number[];
  dp: number[];
  currentI?: number;
  branch1Cost?: number;
  branch7Cost?: number;
  branch30Cost?: number;
  bestCost?: number;
  jumpIdx1?: number;
  jumpIdx7?: number;
  jumpIdx30?: number;
}

export const MIN_COST_TICKETS_PRESETS_DATA: Record<string, { days: number[]; costs: number[] }> = {
  standard: {
    days: [1, 4, 6, 7, 8, 20],
    costs: [2, 7, 15],
  },
  dense_days: {
    days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31],
    costs: [2, 7, 15],
  },
  sparse_days: {
    days: [1, 10, 20, 30, 40, 50],
    costs: [3, 10, 25],
  },
};

export function parseMinCostTicketsInputs(inputs?: Record<string, any>): { days: number[]; costs: number[] } {
  let customDays: number[] | undefined;
  let customCosts: number[] | undefined;

  if (inputs?.days) {
    const parsed = String(inputs.days).split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
    if (parsed.length > 0) customDays = parsed;
  }
  if (inputs?.costs) {
    const parsed = String(inputs.costs).split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n >= 0);
    if (parsed.length === 3) customCosts = parsed;
  }

  const data = (inputs?.preset && MIN_COST_TICKETS_PRESETS_DATA[inputs.preset]) || MIN_COST_TICKETS_PRESETS_DATA.standard;
  const days = customDays || [...data.days];
  const costs = customCosts || [...data.costs];
  return { days, costs };
}

export function buildMinCostTickets066Steps(
  inputDays?: string | number[],
  customCosts?: number[]
): MinCostTicketsStep[] {
  let days: number[];
  let costs: number[];

  if (Array.isArray(inputDays)) {
    days = [...inputDays];
    costs = customCosts && customCosts.length === 3 ? [...customCosts] : [2, 7, 15];
  } else {
    const presetKey = typeof inputDays === 'string' ? inputDays : 'standard';
    const data = MIN_COST_TICKETS_PRESETS_DATA[presetKey] || MIN_COST_TICKETS_PRESETS_DATA.standard;
    days = [...data.days];
    costs = customCosts && customCosts.length === 3 ? [...customCosts] : [...data.costs];
  }
  const n = days.length;
  const durations = [1, 7, 30];

  const steps: MinCostTicketsStep[] = [];
  const lines = MIN_COST_TICKETS_066_LINES;

  const dp: number[] = new Array(n + 1).fill(0);

  // Step 0: 入口纯净帧
  steps.push({
    days,
    costs,
    dp: [...dp],
    line: lines.entry.javascript,
    codeLine: lines.entry,
    message: `🚀 初始化最低票价一维动态规划：共有 ${n} 个旅行日，通行证费用分别为 [1天: $${costs[0]}, 7天: $${costs[1]}, 30天: $${costs[2]}]。`,
    explanation: '定义 dp[i] 为从第 i 个旅行日开始完成后续所有旅行的最低花费。自底向上逆向推导，基准条件 dp[n] = 0。',
    metrics: { '旅行日数': n, '当前阶段': '初始化', '基准条件': 'dp[n]=0' },
  });

  // Step 1: 分配 dp 表
  steps.push({
    days,
    costs,
    dp: [...dp],
    line: lines.initDp.javascript,
    codeLine: lines.initDp,
    message: `📊 创建长度为 ${n + 1} 的 dp 数组，初始全 0。dp[${n}] = 0 作为虚拟终点哨兵。`,
    explanation: '当已完成全部计划日（达到下标 n）时，后续花费自然为 0。',
    metrics: { '旅行日数': n, 'dp数组大小': n + 1, '当前阶段': '开辟DP表' },
  });

  // 逆向遍历每个旅行日
  for (let i = n - 1; i >= 0; i--) {
    const curDay = days[i];

    // 计算三个分支的跳跃目标和花费
    let j1 = i;
    while (j1 < n && days[j1] < curDay + durations[0]) j1++;
    const cost1 = costs[0] + dp[j1];

    let j7 = i;
    while (j7 < n && days[j7] < curDay + durations[1]) j7++;
    const cost7 = costs[1] + dp[j7];

    let j30 = i;
    while (j30 < n && days[j30] < curDay + durations[2]) j30++;
    const cost30 = costs[2] + dp[j30];

    // 步骤：考察第 i 个旅行日
    steps.push({
      days,
      costs,
      dp: [...dp],
      currentI: i,
      branch1Cost: cost1,
      branch7Cost: cost7,
      branch30Cost: cost30,
      jumpIdx1: j1,
      jumpIdx7: j7,
      jumpIdx30: j30,
      line: lines.outerLoop.javascript,
      codeLine: lines.outerLoop,
      message: `🔍 考察旅行日 #${i} (第 ${curDay} 天)：开始评估 1天/7天/30天 三种购票方案。`,
      explanation: `当前决策基点为第 ${curDay} 天，分别计算覆盖 1/7/30 天后能跳跃到的下一个有效旅行日。`,
      highlightedIndices: [i],
      metrics: { '当前旅行日': `第${curDay}天 (i=${i})`, '决策状态': '评估方案' },
    });

    // 步骤：三种方案对比
    steps.push({
      days,
      costs,
      dp: [...dp],
      currentI: i,
      branch1Cost: cost1,
      branch7Cost: cost7,
      branch30Cost: cost30,
      jumpIdx1: j1,
      jumpIdx7: j7,
      jumpIdx30: j30,
      line: lines.skipDays.javascript,
      codeLine: lines.skipDays,
      message: `💡 方案对比：1天票跳至 #${j1}(第${days[j1] ?? '末尾'}天) 需$${cost1} | 7天票跳至 #${j7}(第${days[j7] ?? '末尾'}天) 需$${cost7} | 30天票跳至 #${j30}(第${days[j30] ?? '末尾'}天) 需$${cost30}`,
      explanation: `1天票覆盖[${curDay}, ${curDay}]；7天票覆盖[${curDay}, ${curDay + 6}]；30天票覆盖[${curDay}, ${curDay + 29}]。`,
      highlightedIndices: [i, j1, j7, j30].filter((idx) => idx <= n),
      metrics: {
        '1天方案': `$${costs[0]}+dp[${j1}]=$${cost1}`,
        '7天方案': `$${costs[1]}+dp[${j7}]=$${cost7}`,
        '30天方案': `$${costs[2]}+dp[${j30}]=$${cost30}`,
      },
    });

    const best = Math.min(cost1, cost7, cost30);
    dp[i] = best;

    // 步骤：确定最优解并写表
    steps.push({
      days,
      costs,
      dp: [...dp],
      currentI: i,
      bestCost: best,
      branch1Cost: cost1,
      branch7Cost: cost7,
      branch30Cost: cost30,
      jumpIdx1: j1,
      jumpIdx7: j7,
      jumpIdx30: j30,
      line: lines.saveDp.javascript,
      codeLine: lines.saveDp,
      message: `✅ 第 ${curDay} 天决策完成：取三者最小值 min(${cost1}, ${cost7}, ${cost30}) = $${best}，写入 dp[${i}] = ${best}。`,
      explanation: `完成自第 ${curDay} 天起的子问题求解。`,
      highlightedIndices: [i],
      metrics: { '当前旅行日': `第${curDay}天`, '最优花费': `$${best}`, '已完成天数': n - i },
    });
  }

  // 终点帧：返回 dp[0]
  steps.push({
    days,
    costs,
    dp: [...dp],
    currentI: 0,
    bestCost: dp[0],
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    message: `🎉 逆向递推圆满结束！完成所有计划旅行日的最低总花费为 dp[0] = $${dp[0]}！`,
    explanation: '自底向上求解完毕，dp[0] 汇聚了从第一个旅行日开始覆盖全年的全局最优策略。',
    highlightedIndices: [0],
    metrics: { '全局最低总花费': `$${dp[0]}`, '总旅行日数': n, '状态': '求解完毕' },
  });

  return steps;
}
