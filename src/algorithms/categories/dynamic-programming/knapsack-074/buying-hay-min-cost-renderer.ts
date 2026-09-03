/**
 * 购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S) - 声明式 4-Card 沙盘渲染器
 * 核心：容量上界扩充至 H + max(val)，求最小值的完全背包并在 [H, m] 中取全局最小
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  BUYING_HAY_MIN_COST_PROBLEM_HTML,
  BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  BUYING_HAY_MIN_COST_CODE_LANGUAGES,
} from './knapsack-074-problem-content';

export interface BuyingHayStep {
  companyIndex: number;
  j: number;
  hTarget: number;
  maxVal: number;
  expandedCapacity: number;
  cost: number[];
  val: number[];
  dp: number[];
  minCost: number;
  status: 'init' | 'company' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildBuyingHayMinCostSteps(
  hTarget: number,
  cost: number[],
  val: number[]
): BuyingHayStep[] {
  const steps: BuyingHayStep[] = [];
  const h = Math.max(0, hTarget);
  const n = Math.min(cost.length, val.length);
  const maxv = n > 0 ? Math.max(...val) : 0;
  const m = h + maxv;
  const INF = 1e9;
  const dp = new Array(m + 1).fill(INF);
  dp[0] = 0;

  function makeStep(data: Omit<BuyingHayStep, 'metrics'>): BuyingHayStep {
    const compStr = data.companyIndex >= 0 ? `供应商 #${data.companyIndex + 1}` : '—';
    const jStr = data.j >= 0 ? `${data.j} 磅` : '—';
    const costStr = data.minCost < INF ? `${data.minCost} 元` : 'INF (未可达)';
    return {
      ...data,
      metrics: {
        'metric-cur-supplier': compStr,
        'metric-cur-j': jStr,
        'metric-expanded-m': `${data.expandedCapacity} 磅 (H+maxV)`,
        'metric-min-cost': costStr,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      companyIndex: -1,
      j: -1,
      hTarget: h,
      maxVal: maxv,
      expandedCapacity: m,
      cost: [...cost],
      val: [...val],
      dp: [...dp],
      minCost: INF,
      status: 'init',
      message: `🌾 初始化干草购买方案：最低需求 H=${h} 磅，最大单包干草 maxVal=${maxv} 磅，扩充容量上限 m=H+maxVal=${m} 磅。`,
      log: `init: H=${h}, maxv=${maxv}, m=${m}`,
      codeLine: 8,
    })
  );

  if (h === 0 || n === 0) {
    steps.push(
      makeStep({
        companyIndex: -1,
        j: 0,
        hTarget: h,
        maxVal: maxv,
        expandedCapacity: m,
        cost: [...cost],
        val: [...val],
        dp: [...dp],
        minCost: 0,
        status: 'done',
        message: '🏁 需求为 0 磅，无需采购，花费 0 元。',
        log: 'done: cost=0',
        codeLine: 24,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const c = cost[i], v = val[i];

    steps.push(
      makeStep({
        companyIndex: i,
        j: -1,
        hTarget: h,
        maxVal: maxv,
        expandedCapacity: m,
        cost: [...cost],
        val: [...val],
        dp: [...dp],
        minCost: INF,
        status: 'company',
        message: `🚜 考察供应商 #${i + 1}：售价 ${c} 元，单包干草 ${v} 磅。正序从小到大填表。`,
        log: `supplier #${i + 1}: cost=${c}, val=${v}`,
        codeLine: 12,
      })
    );

    // 正序枚举完全背包
    for (let j = v; j <= m; j++) {
      if (dp[j - v] !== INF) {
        const candidate = dp[j - v] + c;
        if (candidate < dp[j]) {
          dp[j] = candidate;
          steps.push(
            makeStep({
              companyIndex: i,
              j,
              hTarget: h,
              maxVal: maxv,
              expandedCapacity: m,
              cost: [...cost],
              val: [...val],
              dp: [...dp],
              minCost: dp[j],
              status: 'update',
              message: `✨ 干草重量 j=${j} 磅：通过购买供应商 #${i + 1}，将花费刷新至更低值 dp[${j}]=${dp[j]} 元！`,
              log: `update: dp[${j}] = ${dp[j]} using supplier #${i + 1}`,
              codeLine: 16,
            })
          );
        }
      }
    }
  }

  // 在 [H, m] 中寻找全局最小花费
  let ans = INF;
  let bestWeight = h;
  for (let j = h; j <= m; j++) {
    if (dp[j] < ans) {
      ans = dp[j];
      bestWeight = j;
    }
  }

  steps.push(
    makeStep({
      companyIndex: -1,
      j: bestWeight,
      hTarget: h,
      maxVal: maxv,
      expandedCapacity: m,
      cost: [...cost],
      val: [...val],
      dp: [...dp],
      minCost: ans,
      status: 'done',
      message: `🎉 决策完毕！在 [${h}, ${m}] 磅区间中检索：购买 ${bestWeight} 磅干草花费最少，仅需 ${ans} 元！`,
      log: `done: minCost=${ans} at weight=${bestWeight}`,
      codeLine: 24,
    })
  );

  return steps;
}

export const BuyingHayMinCostVisualizer = createDeclarativeVisualizer<BuyingHayStep>({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 上界扩充求极小',
    complexity: 'O(N · (H + maxV)) · O(H + maxV)',
  },
  card1Title: '🚜 供应商套餐与容量扩充上限说明',
  card2Title: '📉 采购金额向量 dp[j] (求最小完全背包)',
  card2Desc: '展示容量扩充至 H+maxVal，在 >= H 的各重量中寻找全局最小支出',
  legend: [
    { label: '不可达状态 (INF)', color: '#334155' },
    { label: '已算出花费 (< INF)', color: '#38bdf8' },
    { label: '达标最优采购点 (>= H)', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-h',
      label: '干草需求量 H (磅)',
      type: 'number',
      defaultValue: 60,
      width: '60px',
    },
    {
      id: 'input-costs',
      label: '单次价格 costs',
      type: 'text',
      defaultValue: '5, 100',
      width: '120px',
    },
    {
      id: 'input-vals',
      label: '单次干草 vals',
      type: 'text',
      defaultValue: '10, 100',
      width: '120px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (H=60, 价格[5,100], 干草[10,100], Ans=30)',
      values: {
        'input-h': 60,
        'input-costs': '5, 100',
        'input-vals': '10, 100',
      },
    },
    {
      label: '超出更便宜案例 (H=8, 价格[10,12], 干草[5,10], Ans=12)',
      values: {
        'input-h': 8,
        'input-costs': '10, 12',
        'input-vals': '5, 10',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-supplier', label: '当前供应商', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前考察重量 j', color: '#38bdf8' },
    { id: 'metric-expanded-m', label: '扩充容量上限 m', color: '#8b5cf6' },
    { id: 'metric-min-cost', label: '最低采购总花费', color: '#10b981' },
  ],
  codeLanguages: BUYING_HAY_MIN_COST_CODE_LANGUAGES,
  problemHtml: BUYING_HAY_MIN_COST_PROBLEM_HTML,
  analysisHtml: BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const h = parseInt(inputs['input-h'] || '60', 10);
    const cost = (inputs['input-costs'] || '5, 100')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const val = (inputs['input-vals'] || '10, 100')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildBuyingHayMinCostSteps(h, cost, val);
  },
  renderCanvas: (container, step) => {
    const suppliersHtml = step.cost
      .map((c, idx) => {
        const v = step.val[idx];
        const isCur = step.companyIndex === idx;
        const bg = isCur ? '#1e1b4b' : '#0f172a';
        const border = isCur ? '#818cf8' : '#334155';
        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:10px; min-width:110px; text-align:center;">
            <div style="font-size:11px; color:#cbd5e1; font-weight:700;">供应商 #${idx + 1}</div>
            <div style="margin-top:6px; font-size:11px; color:#94a3b8;">售价: <b style="color:#f59e0b;">${c} 元</b></div>
            <div style="font-size:11px; color:#94a3b8;">干草量: <b style="color:#10b981;">${v} 磅</b></div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; justify-content:center; align-items:center; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">供应商货源 (需求 H=${step.hTarget} 磅，扩充上限 m=${step.expandedCapacity} 磅)</div>
        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
          ${suppliersHtml}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const cells = step.dp.map((val, idx) => {
      const isCur = step.j === idx;
      const isQualified = idx >= step.hTarget;
      const bg = isCur ? '#0284c7' : isQualified ? '#064e3b' : '#1e293b';
      const border = isCur ? '#38bdf8' : isQualified ? '#10b981' : '#334155';
      const valStr = val >= 1e8 ? '∞' : `${val}`;
      const color = val < 1e8 ? (isQualified ? '#34d399' : '#38bdf8') : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:32px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:8px; color:#94a3b8;">${idx}磅</span>
          <span style="font-size:10px; font-weight:700; color:${color};">${valStr}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">干草采购最小花费表 (深绿背景表示 >= H 达标区间)</div>
        <div style="display:flex; flex-wrap:wrap; max-height:100px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'buying-hay-min-cost',
    name: '购买足量干草的最小花费 (洛谷 P2918)',
    category: 'dynamic-programming',
    difficulty: 'medium',
    description: '洛谷 P2918：至少需要 H 磅干草，完全背包上界扩充至 H+maxVal 并在 [H, m] 寻极小值',
    tags: ['动态规划', '完全背包', '容量扩充', '最优化', '左程云074'],
  },
  BuyingHayMinCostVisualizer
);
