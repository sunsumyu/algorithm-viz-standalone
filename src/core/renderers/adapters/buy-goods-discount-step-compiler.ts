/**
 * 夏季特惠 (LeetCode LCP 51 / tJau2o / 左程云 Class 073 Code02)
 * Step Compiler: 心理不吃亏判别式贪心白嫖 + 01 背包状态推演
 */

import type { HighlightTarget } from '../../code-panel';

export interface BuyGoodsStep {
  phase: 'init' | 'greedy-free' | 'knapsack-dp' | 'done';
  gameIndex: number;
  effectiveBudget: number;
  greedyHappy: number;
  dpHappy: number;
  totalHappy: number;
  games: { a: number; b: number; w: number; well: number; isFree: boolean }[];
  normalGames: { id: number; cost: number; val: number }[];
  dp: number[];
  j: number;
  status: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedNormalGames: number[]; // 01 背包中选中的 normalGames 索引
  metrics?: Record<string, any>;
}

export function buildBuyGoodsDiscountSteps(
  initialBudget: number,
  a: number[],
  b: number[],
  w: number[]
): BuyGoodsStep[] {
  const steps: BuyGoodsStep[] = [];
  const n = a.length;
  let currentBudget = initialBudget;
  let greedyHappy = 0;

  const games = a.map((orig, i) => {
    const disc = b[i];
    const happy = w[i];
    const well = orig - 2 * disc;
    return { a: orig, b: disc, w: happy, well, isFree: well >= 0 };
  });

  const normalGames: { id: number; cost: number; val: number }[] = [];

  const lines = {
    init: { java: 7, cpp: 7, python: 1, javascript: 2 },
    greedyLoop: { java: 12, cpp: 10, python: 5, javascript: 5 },
    greedyFreePick: { java: 14, cpp: 13, python: 8, javascript: 8 },
    initDp: { java: 22, cpp: 20, python: 13, javascript: 15 },
    dpOuterLoop: { java: 23, cpp: 21, python: 14, javascript: 16 },
    dpCapLoop: { java: 24, cpp: 22, python: 15, javascript: 18 },
    dpUpdate: { java: 25, cpp: 23, python: 16, javascript: 19 },
    returnAns: { java: 28, cpp: 26, python: 17, javascript: 22 },
  };

  function makeStep(data: Omit<BuyGoodsStep, 'metrics'>): BuyGoodsStep {
    return {
      ...data,
      metrics: {
        'metric-eff-budget': `${data.effectiveBudget} 元`,
        'metric-greedy-happy': `${data.greedyHappy}`,
        'metric-dp-happy': `${data.dpHappy}`,
        'metric-total-happy': `${data.totalHappy}`,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      phase: 'init',
      gameIndex: -1,
      effectiveBudget: currentBudget,
      greedyHappy: 0,
      dpHappy: 0,
      totalHappy: 0,
      games: [...games],
      normalGames: [],
      dp: [0],
      j: -1,
      selectedNormalGames: [],
      status: 'INIT',
      message: `🎮 开启夏季特惠决策：初始预算 X=${initialBudget}，平台共有 ${n} 款折扣游戏。`,
      log: `init: budget=${initialBudget}, games=${n}`,
      codeLine: lines.init,
    })
  );

  // 2. 第一阶段：贪心辨别白嫖游戏 (well >= 0)
  for (let i = 0; i < n; i++) {
    const g = games[i];
    if (g.well >= 0) {
      currentBudget += g.well;
      greedyHappy += g.w;
      steps.push(
        makeStep({
          phase: 'greedy-free',
          gameIndex: i,
          effectiveBudget: currentBudget,
          greedyHappy,
          dpHappy: 0,
          totalHappy: greedyHappy,
          games: [...games],
          normalGames: [...normalGames],
          dp: [0],
          j: -1,
          selectedNormalGames: [],
          status: 'FREE_PICK',
          message: `🎁 发现倒贴白嫖游戏 #${i + 1}：原价 ${g.a}，折后 ${g.b}，心理吃亏度 well=${g.well} >= 0！果断购入，白嫖获得快乐 +${g.w}，预算反增至 ${currentBudget} 元！`,
          log: `free game #${i + 1}: happy+=${g.w}, budget+=${g.well}`,
          codeLine: lines.greedyFreePick,
        })
      );
    } else {
      normalGames.push({ id: i + 1, cost: -g.well, val: g.w });
      steps.push(
        makeStep({
          phase: 'greedy-free',
          gameIndex: i,
          effectiveBudget: currentBudget,
          greedyHappy,
          dpHappy: 0,
          totalHappy: greedyHappy,
          games: [...games],
          normalGames: [...normalGames],
          dp: [0],
          j: -1,
          selectedNormalGames: [],
          status: 'NORMAL_COLLECT',
          message: `🛍️ 普通折扣游戏 #${i + 1}：原价 ${g.a}，折后 ${g.b}，心理吃亏度 well=${g.well} < 0。转化为 01 背包物品 (消耗资金=${-g.well}，获得快乐=${g.w})。`,
          log: `normal game #${i + 1}: cost=${-g.well}, val=${g.w}`,
          codeLine: lines.greedyLoop,
        })
      );
    }
  }

  // 3. 第二阶段：01 背包动态规划
  const m = normalGames.length;
  const x = currentBudget;
  const dp = new Array(x + 1).fill(0);
  let bestSelection: number[][] = Array.from({ length: x + 1 }, () => []);

  steps.push(
    makeStep({
      phase: 'knapsack-dp',
      gameIndex: -1,
      effectiveBudget: x,
      greedyHappy,
      dpHappy: 0,
      totalHappy: greedyHappy,
      games: [...games],
      normalGames: [...normalGames],
      dp: [...dp],
      j: -1,
      selectedNormalGames: [],
      status: 'DP_INIT',
      message: `📊 01 背包启动：白嫖完毕后可用总预算为 ${x} 元，需在 ${m} 款普通折扣游戏中做出最优选择。`,
      log: `dp init: budget=${x}, items=${m}`,
      codeLine: lines.initDp,
    })
  );

  for (let i = 0; i < m; i++) {
    const item = normalGames[i];

    steps.push(
      makeStep({
        phase: 'knapsack-dp',
        gameIndex: item.id - 1,
        effectiveBudget: x,
        greedyHappy,
        dpHappy: dp[x],
        totalHappy: greedyHappy + dp[x],
        games: [...games],
        normalGames: [...normalGames],
        dp: [...dp],
        j: -1,
        selectedNormalGames: [...(bestSelection[x] || [])],
        status: 'DP_ITEM',
        message: `🔍 考察普通游戏 #${item.id}：需真实消耗心理预算 ${item.cost} 元，可得快乐值 +${item.val}。`,
        log: `dp item #${item.id}: cost=${item.cost}, val=${item.val}`,
        codeLine: lines.dpOuterLoop,
      })
    );

    const nextBest = bestSelection.map((list) => [...list]);

    for (let j = x; j >= item.cost; j--) {
      steps.push(
        makeStep({
          phase: 'knapsack-dp',
          gameIndex: item.id - 1,
          effectiveBudget: x,
          greedyHappy,
          dpHappy: dp[x],
          totalHappy: greedyHappy + dp[x],
          games: [...games],
          normalGames: [...normalGames],
          dp: [...dp],
          j,
          selectedNormalGames: [...(nextBest[x] || [])],
          status: 'CHECK',
          message: `⏳ 倒序枚举预算：当前预算 j=${j} >= 耗资 ${item.cost}。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.dpCapLoop,
        })
      );

      const candidate = dp[j - item.cost] + item.val;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        nextBest[j] = [...bestSelection[j - item.cost], i];
      }

      steps.push(
        makeStep({
          phase: 'knapsack-dp',
          gameIndex: item.id - 1,
          effectiveBudget: x,
          greedyHappy,
          dpHappy: dp[x],
          totalHappy: greedyHappy + dp[x],
          games: [...games],
          normalGames: [...normalGames],
          dp: [...dp],
          j,
          selectedNormalGames: [...(nextBest[x] || [])],
          status: updated ? 'UPDATE' : 'KEEP',
          message: updated
            ? `✨ 状态更新：购入游戏 #${item.id}，将预算 ${j} 下的快乐值提升至 dp[${j}]=${dp[j]}！`
            : `⏸️ 状态保持：购入该游戏收益 ${candidate} <= 原值 ${dp[j]}，保持原选择。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.dpUpdate,
        })
      );
    }

    bestSelection = nextBest;
  }

  const finalDpHappy = dp[x];
  const finalTotalHappy = greedyHappy + finalDpHappy;

  steps.push(
    makeStep({
      phase: 'done',
      gameIndex: -1,
      effectiveBudget: x,
      greedyHappy,
      dpHappy: finalDpHappy,
      totalHappy: finalTotalHappy,
      games: [...games],
      normalGames: [...normalGames],
      dp: [...dp],
      j: x,
      selectedNormalGames: [...(bestSelection[x] || [])],
      status: 'done',
      message: `🎉 特惠狂欢决策完毕！白嫖必选游戏收获快乐 ${greedyHappy}，01 背包选购收获快乐 ${finalDpHappy}，最终总快乐值为 ${finalTotalHappy}！`,
      log: `done: totalHappy=${finalTotalHappy}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}

export function parseBuyGoodsInputs(inputs: Record<string, any>) {
  const initialBudget = parseInt(inputs['input-budget'] || '10', 10);
  const a = String(inputs['input-a'] || '10, 10')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const b = String(inputs['input-b'] || '3, 8')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const w = String(inputs['input-w'] || '5, 10')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  return { initialBudget, a, b, w };
}
