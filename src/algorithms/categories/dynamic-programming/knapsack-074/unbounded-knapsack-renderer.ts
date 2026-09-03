/**
 * 完全背包模版 (洛谷 P1616 疯狂的采药) - 声明式 4-Card 沙盘渲染器
 * 核心：每种物品可选任意次，空间压缩后【正序】枚举容量 j，允许当轮重复累加
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  UNBOUNDED_KNAPSACK_PROBLEM_HTML,
  UNBOUNDED_KNAPSACK_ANALYSIS_HTML,
  UNBOUNDED_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-074-problem-content';

export interface UnboundedKnapsackStep {
  itemIndex: number;
  j: number;
  cost: number[];
  val: number[];
  dp: number[];
  maxVal: number;
  totalTime: number;
  status: 'init' | 'item' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildUnboundedKnapsackSteps(
  totalTime: number,
  cost: number[],
  val: number[]
): UnboundedKnapsackStep[] {
  const steps: UnboundedKnapsackStep[] = [];
  const t = Math.max(0, totalTime);
  const m = Math.min(cost.length, val.length);
  const dp = new Array(t + 1).fill(0);

  function makeStep(data: Omit<UnboundedKnapsackStep, 'metrics'>): UnboundedKnapsackStep {
    const itStr = data.itemIndex >= 0 ? `#${data.itemIndex + 1}` : '—';
    const jStr = data.j >= 0 ? `${data.j}` : '—';
    return {
      ...data,
      metrics: {
        'metric-cur-item': itStr,
        'metric-cur-j': jStr,
        'metric-direction': '正序枚举 →',
        'metric-max-val': `${data.maxVal}`,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      itemIndex: -1,
      j: -1,
      cost: [...cost],
      val: [...val],
      dp: [...dp],
      maxVal: 0,
      totalTime: t,
      status: 'init',
      message: `🌿 初始化完全背包：总时间 T=${t}，草药种类 m=${m}（每种草药无限次选取）。`,
      log: `init: T=${t}, m=${m}`,
      codeLine: 8,
    })
  );

  if (t === 0 || m === 0) {
    steps.push(
      makeStep({
        itemIndex: -1,
        j: 0,
        cost: [...cost],
        val: [...val],
        dp: [...dp],
        maxVal: 0,
        totalTime: t,
        status: 'done',
        message: '🏁 时间为 0 或无草药可选，最大收益 0。',
        log: 'done: ans=0',
        codeLine: 18,
      })
    );
    return steps;
  }

  for (let i = 0; i < m; i++) {
    const c = cost[i], v = val[i];

    steps.push(
      makeStep({
        itemIndex: i,
        j: -1,
        cost: [...cost],
        val: [...val],
        dp: [...dp],
        maxVal: dp[t],
        totalTime: t,
        status: 'item',
        message: `🌱 考察第 ${i + 1} 种草药：耗时 ${c}，价值 ${v}。从 j=${c} 到 ${t}【正序】递增枚举。`,
        log: `item #${i + 1}: cost=${c}, val=${v}`,
        codeLine: 11,
      })
    );

    // 正序枚举容量
    for (let j = c; j <= t; j++) {
      const candidate = dp[j - c] + v;
      if (candidate > dp[j]) {
        dp[j] = candidate;
        steps.push(
          makeStep({
            itemIndex: i,
            j,
            cost: [...cost],
            val: [...val],
            dp: [...dp],
            maxVal: dp[t],
            totalTime: t,
            status: 'update',
            message: `✨ 容量 j=${j}：正序由 dp[${j - c}] (${dp[j - c] - v}) 叠加草药 #${i + 1} 获得更优值 dp[${j}]=${dp[j]}！`,
            log: `update: dp[${j}] = ${dp[j]} using item #${i + 1}`,
            codeLine: 14,
          })
        );
      }
    }
  }

  // 完成
  steps.push(
    makeStep({
      itemIndex: -1,
      j: t,
      cost: [...cost],
      val: [...val],
      dp: [...dp],
      maxVal: dp[t],
      totalTime: t,
      status: 'done',
      message: `🎉 采摘计划制定完成！在时间 ${t} 内无限次采摘的最大总收益为 ${dp[t]}！`,
      log: `done: maxVal=${dp[t]}`,
      codeLine: 18,
    })
  );

  return steps;
}

export const UnboundedKnapsackVisualizer = createDeclarativeVisualizer<UnboundedKnapsackStep>({
  id: 'unbounded-knapsack-standard',
  name: '完全背包模版 (疯狂的采药)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 正序压缩',
    complexity: 'O(M · T) · O(T)',
  },
  card1Title: '🌿 草药库陈列 (每种可无限次采摘 ∞)',
  card2Title: '🔄 正序滚动收益向量 dp[j] 监视器',
  card2Desc: '对比 01 背包逆序枚举，完全背包正序枚举使得同件物品可在同一轮中不断自叠加',
  legend: [
    { label: '可选草药 (无限次)', color: '#38bdf8' },
    { label: '当前采摘草药', color: '#f59e0b' },
    { label: '正序叠加更新', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-t',
      label: '总采药时间 T',
      type: 'number',
      defaultValue: 70,
      width: '60px',
    },
    {
      id: 'input-costs',
      label: '耗时数组 costs',
      type: 'text',
      defaultValue: '71, 23',
      width: '120px',
    },
    {
      id: 'input-vals',
      label: '价值数组 values',
      type: 'text',
      defaultValue: '100, 10',
      width: '120px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (T=70, 耗时[71,23], 价值[100,10], Ans=30)',
      values: {
        'input-t': 70,
        'input-costs': '71, 23',
        'input-vals': '100, 10',
      },
    },
    {
      label: '多草药多重选择 (T=10, 耗时[2,3,5], 价值[5,8,14], Ans=26)',
      values: {
        'input-t': 10,
        'input-costs': '2, 3, 5',
        'input-vals': '5, 8, 14',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-item', label: '当前草药', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前时间点 j', color: '#38bdf8' },
    { id: 'metric-direction', label: '压缩方向', color: '#8b5cf6' },
    { id: 'metric-max-val', label: '当前最大收益', color: '#10b981' },
  ],
  codeLanguages: UNBOUNDED_KNAPSACK_CODE_LANGUAGES,
  problemHtml: UNBOUNDED_KNAPSACK_PROBLEM_HTML,
  analysisHtml: UNBOUNDED_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const t = parseInt(inputs['input-t'] || '70', 10);
    const cost = (inputs['input-costs'] || '71, 23')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const val = (inputs['input-vals'] || '100, 10')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildUnboundedKnapsackSteps(t, cost, val);
  },
  renderCanvas: (container, step) => {
    const itemsHtml = step.cost
      .map((c, idx) => {
        const v = step.val[idx];
        const isCur = step.itemIndex === idx;
        const bg = isCur ? '#1e1b4b' : '#0f172a';
        const border = isCur ? '#818cf8' : '#334155';
        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:10px; min-width:110px; text-align:center;">
            <div style="font-size:11px; color:#cbd5e1; font-weight:700;">草药 #${idx + 1} <span style="color:#10b981;">(可无限取 ∞)</span></div>
            <div style="margin-top:6px; font-size:11px; color:#94a3b8;">耗时: <b style="color:#f8fafc;">${c}</b></div>
            <div style="font-size:11px; color:#94a3b8;">价值: <b style="color:#10b981;">${v}</b></div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; justify-content:center; align-items:center; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">草药资源库与正序推进方向 (Forward Order)</div>
        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
          ${itemsHtml}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const cells = step.dp.map((val, idx) => {
      const isCur = step.j === idx;
      const bg = isCur ? '#0284c7' : '#1e293b';
      const border = isCur ? '#38bdf8' : '#334155';
      const color = val > 0 ? '#10b981' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:32px; padding:3px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:8px; color:#94a3b8;">${idx}</span>
          <span style="font-size:10px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">正序滚动容量表 dp[0..${step.dp.length - 1}]</div>
        <div style="display:flex; flex-wrap:wrap; max-height:100px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'unbounded-knapsack-standard',
    name: '完全背包模版 (疯狂的采药)',
    category: 'dynamic-programming',
    difficulty: 'easy',
    description: '洛谷 P1616：每种物品可选任意次，空间压缩后正序枚举容量 j',
    tags: ['动态规划', '完全背包', '空间压缩', '正序枚举', '左程云074'],
  },
  UnboundedKnapsackVisualizer
);
