/**
 * 夏季特惠 (LeetCode LCP 51 / tJau2o) - 声明式 4-Card 沙盘渲染器
 * 核心：心理不吃亏判别式 -> 贪心白嫖必选 (well >= 0) + 剩余游戏 01 背包转化
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  BUY_GOODS_DISCOUNT_PROBLEM_HTML,
  BUY_GOODS_DISCOUNT_ANALYSIS_HTML,
  BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
} from './knapsack-073-problem-content';

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
  codeLine: number;
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
      status: 'INIT',
      message: `🎮 开启夏季特惠决策：初始预算 X=${initialBudget}，平台共有 ${n} 款折扣游戏。`,
      log: `init: budget=${initialBudget}, games=${n}`,
      codeLine: 8,
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
          status: 'FREE_WIN',
          message: `🎁 发现白赚游戏 #${i + 1}：原价 ${g.a}，折后仅 ${g.b}。好处值 well=${g.well} &ge; 0！必买且预算扩增至 ${currentBudget} 元，快乐值 +${g.w}！`,
          log: `game #${i + 1} free-win: well=+${g.well}, budget=${currentBudget}, happy=${greedyHappy}`,
          codeLine: 13,
        })
      );
    } else {
      const realCost = -g.well;
      normalGames.push({ id: i + 1, cost: realCost, val: g.w });
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
          status: 'NORMAL_ADD',
          message: `🏷️ 游戏 #${i + 1} 折扣未达白嫖标准：原价 ${g.a}，折后 ${g.b}，好处值 well=${g.well} < 0。归入 01 背包候选池（等效花费 ${realCost} 元，价值 ${g.w}）。`,
          log: `game #${i + 1} normal: cost=${realCost}, val=${g.w}`,
          codeLine: 16,
        })
      );
    }
  }

  // 3. 第二阶段：01 背包规划普通游戏
  const dp = new Array(currentBudget + 1).fill(0);

  if (normalGames.length > 0 && currentBudget > 0) {
    for (let i = 0; i < normalGames.length; i++) {
      const ng = normalGames[i];
      for (let j = currentBudget; j >= ng.cost; j--) {
        const candidate = dp[j - ng.cost] + ng.val;
        if (candidate > dp[j]) {
          dp[j] = candidate;
          steps.push(
            makeStep({
              phase: 'knapsack-dp',
              gameIndex: ng.id - 1,
              effectiveBudget: currentBudget,
              greedyHappy,
              dpHappy: dp[currentBudget],
              totalHappy: greedyHappy + dp[currentBudget],
              games: [...games],
              normalGames: [...normalGames],
              dp: [...dp],
              j,
              status: 'DP_UPDATE',
              message: `💰 背包规划：在等效预算 j=${j} 下购买游戏 #${ng.id} 提升快乐值！dp[${j}] 增至 ${dp[j]}。`,
              log: `dp update: j=${j}, dp[${j}]=${dp[j]}`,
              codeLine: 23,
            })
          );
        }
      }
    }
  }

  const finalHappy = greedyHappy + dp[currentBudget];

  // 4. 完成
  steps.push(
    makeStep({
      phase: 'done',
      gameIndex: -1,
      effectiveBudget: currentBudget,
      greedyHappy,
      dpHappy: dp[currentBudget],
      totalHappy: finalHappy,
      games: [...games],
      normalGames: [...normalGames],
      dp: [...dp],
      j: currentBudget,
      status: 'done',
      message: `🎉 特惠结算完毕！白嫖贪心获取 ${greedyHappy} 快乐值，背包决策获取 ${dp[currentBudget]} 快乐值，在心理完全不吃亏的前提下，最大总快乐值为 ${finalHappy}！`,
      log: `done: totalHappy=${finalHappy}`,
      codeLine: 26,
    })
  );

  return steps;
}

export const BuyGoodsDiscountVisualizer = createDeclarativeVisualizer<BuyGoodsStep>({
  id: 'buy-goods-discount',
  name: '夏季特惠 (01背包转化)',
  category: 'dynamic-programming',
  badge: {
    mode: '贪心白嫖 + 01背包转化',
    complexity: 'O(N · X) · O(X)',
  },
  card1Title: '🏷️ 折扣商品优惠透视与白嫖收益沙盘',
  card2Title: '📈 动态等效预算与快乐值增长监视器',
  card2Desc: '展示冲动消费不吃亏模型下，白嫖增量与 01 背包决策的实时双轨计算',
  legend: [
    { label: '白赚游戏 (well >= 0 必买)', color: '#10b981' },
    { label: '普通游戏 (纳入01背包候选)', color: '#38bdf8' },
    { label: '当前考察商品', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-budget',
      label: '初始预算 X',
      type: 'number',
      defaultValue: 10,
      width: '60px',
    },
    {
      id: 'input-orig-prices',
      label: '原价 a_i (逗号分隔)',
      type: 'text',
      defaultValue: '10, 10, 20',
      width: '120px',
    },
    {
      id: 'input-sale-prices',
      label: '现价 b_i (逗号分隔)',
      type: 'text',
      defaultValue: '3, 8, 12',
      width: '120px',
    },
    {
      id: 'input-happy-vals',
      label: '快乐值 w_i (逗号分隔)',
      type: 'text',
      defaultValue: '5, 10, 12',
      width: '120px',
    },
  ],
  presets: [
    {
      label: '经典白嫖+规划用例 (X=10, Ans=27)',
      values: {
        'input-budget': 10,
        'input-orig-prices': '10, 10, 20',
        'input-sale-prices': '3, 8, 12',
        'input-happy-vals': '5, 10, 12',
      },
    },
    {
      label: '大额预算组合 (X=20, Ans=45)',
      values: {
        'input-budget': 20,
        'input-orig-prices': '20, 15, 30, 8',
        'input-sale-prices': '8, 10, 14, 2',
        'input-happy-vals': '15, 10, 20, 8',
      },
    },
  ],
  metrics: [
    { id: 'metric-eff-budget', label: '实时有效预算', color: '#38bdf8' },
    { id: 'metric-greedy-happy', label: '白嫖快乐值', color: '#10b981' },
    { id: 'metric-dp-happy', label: '背包规划快乐值', color: '#f59e0b' },
    { id: 'metric-total-happy', label: '当前总快乐值', color: '#a855f7' },
  ],
  codeLanguages: BUY_GOODS_DISCOUNT_CODE_LANGUAGES,
  problemHtml: BUY_GOODS_DISCOUNT_PROBLEM_HTML,
  analysisHtml: BUY_GOODS_DISCOUNT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const x = parseInt(inputs['input-budget'] || '10', 10);
    const a = (inputs['input-orig-prices'] || '10, 10, 20')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const b = (inputs['input-sale-prices'] || '3, 8, 12')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const w = (inputs['input-happy-vals'] || '5, 10, 12')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildBuyGoodsDiscountSteps(x, a, b, w);
  },
  renderCanvas: (container, step) => {
    const cards = step.games
      .map((g, idx) => {
        const isCur = step.gameIndex === idx;
        const bg = g.isFree ? '#064e3b' : '#1e293b';
        const border = isCur ? '#f59e0b' : g.isFree ? '#10b981' : '#38bdf8';
        const badge = g.isFree ? '🎁 白嫖必买' : '🏷️ 背包候选';
        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:8px 12px; min-width:95px; text-align:center;">
            <div style="font-size:10px; color:#94a3b8;">游戏 #${idx + 1} <span style="font-size:9px; color:${g.isFree ? '#34d399' : '#38bdf8'};">[${badge}]</span></div>
            <div style="font-size:12px; color:#cbd5e1; margin:2px 0;">原: ¥${g.a} &rarr; 现: ¥${g.b}</div>
            <div style="font-size:11px; font-weight:700; color:${g.well >= 0 ? '#34d399' : '#f87171'};">
              well: ${g.well >= 0 ? `+${g.well}` : g.well}
            </div>
            <div style="font-size:12px; font-weight:800; color:#fbbf24;">💖 快乐: +${g.w}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:center; align-items:center; background:#0f172a; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">游戏商品库与好处值透视 (well = 原价 - 2 &times; 现价)</div>
        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${cards}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    container.innerHTML = `
      <div style="display:flex; gap:10px; width:100%; padding:8px; box-sizing:border-box; background:#0b1329; border-radius:6px;">
        <div style="flex:1; padding:8px; background:#1e293b; border-radius:6px; border:1px solid #334155;">
          <div style="font-size:11px; color:#94a3b8;">白嫖必入所得快乐</div>
          <div style="font-size:18px; font-weight:800; color:#10b981;">+${step.greedyHappy}</div>
        </div>
        <div style="flex:1; padding:8px; background:#1e293b; border-radius:6px; border:1px solid #334155;">
          <div style="font-size:11px; color:#94a3b8;">01背包规划所得快乐</div>
          <div style="font-size:18px; font-weight:800; color:#f59e0b;">+${step.dpHappy}</div>
        </div>
        <div style="flex:1; padding:8px; background:#1e293b; border-radius:6px; border:1px solid #334155;">
          <div style="font-size:11px; color:#94a3b8;">累计总快乐值 (不吃亏)</div>
          <div style="font-size:18px; font-weight:800; color:#a855f7;">${step.totalHappy}</div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'buy-goods-discount',
    name: '夏季特惠 (01背包转化)',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: 'LeetCode LCP 51 夏季特惠：冲动消费不吃亏模型向白嫖贪心与 01 背包的惊艳转化',
    tags: ['动态规划', '01背包', '贪心算法', '左程云073'],
  },
  BuyGoodsDiscountVisualizer
);
