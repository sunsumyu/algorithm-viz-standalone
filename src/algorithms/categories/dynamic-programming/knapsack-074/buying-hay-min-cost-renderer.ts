/**
 * 购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S) - 声明式 4-Card 沙盘渲染器
 * 核心：容量上界扩充至 H + max(val)，求最小值的完全背包并在 [H, m] 中取全局最小
 * 架构重构：引入采购方案回溯追踪与高动态干草货舱沙盘
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  BUYING_HAY_MIN_COST_PROBLEM_HTML,
  BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  BUYING_HAY_MIN_COST_CODE_LANGUAGES,
} from './knapsack-074-problem-content';

export interface HayPurchaseItem {
  supplierIdx: number;
  cost: number;
  val: number;
}

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
  status: 'init' | 'company' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
  selectedItems: HayPurchaseItem[];
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
  const bestPlans: HayPurchaseItem[][] = Array.from({ length: m + 1 }, () => []);

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
      selectedItems: [],
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
        selectedItems: [],
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
        selectedItems: [],
      })
    );

    // 正序枚举完全背包
    for (let j = v; j <= m; j++) {
      if (dp[j - v] !== INF) {
        const candidate = dp[j - v] + c;
        const updated = candidate < dp[j];
        if (updated) {
          dp[j] = candidate;
          bestPlans[j] = [...bestPlans[j - v], { supplierIdx: i + 1, cost: c, val: v }];
        }

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
            status: updated ? 'update' : 'check',
            selectedItems: [...(bestPlans[j] || [])],
            message: updated
              ? `✨ 重量 j=${j} 磅：选购供应商 #${i + 1} 成功将花费降至 dp[${j}]=${dp[j]} 元！`
              : `⏸️ 重量 j=${j} 磅：选购后花费 ${candidate} >= 原花费 ${dp[j]}，保持当前方案。`,
            log: `dp[${j}] = Math.min(${dp[j]}, ${candidate}) => ${dp[j]}`,
            codeLine: 16,
          })
        );
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
      selectedItems: [...(bestPlans[bestWeight] || [])],
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BuyingHayStep>({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 允许超额',
    complexity: 'O(N · (H + maxV)) · O(H + maxV)',
  },
  card1Title: '🌾 干草供销市场与实时采购载荷舱',
  card2Title: '📊 滚动状态向量 dp[0..m] 监视器',
  card2Desc: '展示扩充容量范围 [0, H+maxV] 内寻找全局最小花费的动态规划过程',
  legend: [
    { label: '未达需求区间 (< H)', color: '#38bdf8' },
    { label: '达标合规区间 (>= H)', color: '#10b981' },
    { label: '不可达状态 (INF)', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-h',
      label: '目标需求量 H (磅)',
      type: 'number',
      defaultValue: 60,
      width: '70px',
    },
    {
      id: 'input-costs',
      label: '单价数组 costs (元)',
      type: 'text',
      defaultValue: '5, 100',
      width: '120px',
    },
    {
      id: 'input-vals',
      label: '单包磅数 vals (磅)',
      type: 'text',
      defaultValue: '10, 100',
      width: '120px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (H=60, 供货商[5元/10磅, 100元/100磅], Ans=30元)',
      values: {
        'input-h': 60,
        'input-costs': '5, 100',
        'input-vals': '10, 100',
      },
    },
    {
      label: '超额反而更省案例 (H=15, [10元/8磅, 12元/16磅], Ans=12元)',
      values: {
        'input-h': 15,
        'input-costs': '10, 12',
        'input-vals': '8, 16',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-supplier', label: '当前供货商', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前重量 j', color: '#38bdf8' },
    { id: 'metric-expanded-m', label: '扩充容量上限 m', color: '#8b5cf6' },
    { id: 'metric-min-cost', label: '最低采购总花费', color: '#10b981' },
  ],
  codeLanguages: BUYING_HAY_MIN_COST_CODE_LANGUAGES,
  problemHtml: BUYING_HAY_MIN_COST_PROBLEM_HTML,
  analysisHtml: BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const h = parseInt(inputs['input-h'] || '60', 10);
    const cost = String(inputs['input-costs'] || '5, 100')
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
    const val = String(inputs['input-vals'] || '10, 100')
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
    return buildBuyingHayMinCostSteps(h, cost, val);
  },
  renderCanvas: (container, step) => {
    const selected = step.selectedItems || [];
    const totalWeight = selected.reduce((s, it) => s + it.val, 0);
    const totalCost = selected.reduce((s, it) => s + it.cost, 0);
    const isTargetMet = totalWeight >= step.hTarget;
    const ratio = Math.min(100, Math.round((totalWeight / Math.max(1, step.hTarget)) * 100));

    const suppliersHtml = step.cost
      .map((c, idx) => {
        const v = step.val[idx];
        const isCur = step.companyIndex === idx;
        const isChosen = selected.some((it) => it.supplierIdx === idx + 1);
        const bg = isChosen
          ? 'rgba(6, 95, 70, 0.4)'
          : isCur
          ? 'rgba(30, 27, 75, 0.7)'
          : 'rgba(15, 23, 42, 0.6)';
        const border = isChosen ? '#10b981' : isCur ? '#818cf8' : '#334155';

        let badge = '<span style="color:#64748b; font-size:9.5px;">⚪ 备选供货商</span>';
        if (isChosen) {
          badge = '<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 正在采购</span>';
        } else if (isCur) {
          badge = '<span style="background:#2563eb; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 正在考察</span>';
        }

        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:140px; text-align:center; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; color:#cbd5e1; font-weight:700;">供应商 #${idx + 1}</span>
              ${badge}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
              <span style="color:#94a3b8;">单价: <b style="color:#f59e0b;">${c} 元</b></span>
              <span style="color:#94a3b8;">单包: <b style="color:#38bdf8;">${v} 磅</b></span>
            </div>
            <div style="font-size:9.5px; color:#94a3b8; text-align:left;">性价比: ${(c / v).toFixed(2)} 元/磅</div>
          </div>
        `;
      })
      .join('');

    const tagsHtml = selected.length > 0
      ? selected.map((it) => `
          <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
            <span style="color:#a7f3d0; font-weight:700;">供应商 #${it.supplierIdx}</span>
            <span style="color:#cbd5e1;">${it.val}磅</span>
            <span style="color:#34d399; font-weight:800;">${it.cost}元</span>
          </div>
        `).join('')
      : `<span style="color:#64748b; font-size:11px;">(货车空闲，尚未装载干草)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">🌾 干草供销市场 (需求 H=${step.hTarget} 磅，扩充上限 m=${step.expandedCapacity} 磅)</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            当前考察重量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> 磅
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
          ${suppliersHtml}
        </div>

        <!-- 底部实时干草运输货舱 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🚜 实时采购运输货仓</span>
              ${isTargetMet ? '<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✅ 需求已达标</span>' : '<span style="background:#92400e; color:#fef3c7; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">⚠️ 尚未达标</span>'}
            </div>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>总干草量: <b style="color:#38bdf8;">${totalWeight}</b> / ${step.hTarget} 磅</span>
              <span>当前累计花费: <b style="color:#10b981;">${totalCost}</b> 元</span>
            </div>
          </div>

          <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); transition:width 0.25s ease;"></div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span style="color:#94a3b8; font-size:10.5px; min-width:60px;">已订购清单:</span>
            ${tagsHtml}
          </div>
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

export const BuyingHayMinCostVisualizer = Visualizer;

registerAlgorithm({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  viewId: 'algo-buying-hay-min-cost-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code06：洛谷 P2918 购买干草，至少 H 磅允许超额，容量上界扩充至 H + maxVal 的完全背包求极小值',
  icon: '🌾',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 89,
  learningGoal: '掌握允许超额时的容量上界安全扩充证明（H + maxVal）与求最小花费完全背包的状态转移',
});
