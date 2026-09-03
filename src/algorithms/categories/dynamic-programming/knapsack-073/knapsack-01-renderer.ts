/**
 * 01背包模版 (洛谷 P1048 采药) - 声明式 4-Card 沙盘渲染器
 * 核心：空间压缩与一维滚动数组逆序更新可视化
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  KNAPSACK_01_PROBLEM_HTML,
  KNAPSACK_01_ANALYSIS_HTML,
  KNAPSACK_01_CODE_LANGUAGES,
} from './knapsack-073-problem-content';

export interface Knapsack01Step {
  itemIndex: number;
  j: number;
  cost: number[];
  val: number[];
  dp: number[];
  currentVal: number;
  selectedItems: number[];
  status: 'init' | 'check' | 'update' | 'keep' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildKnapsack01Steps(
  capacity: number,
  cost: number[],
  val: number[]
): Knapsack01Step[] {
  const steps: Knapsack01Step[] = [];
  const m = cost.length;
  const T = Math.max(0, capacity);

  const dp = new Array(T + 1).fill(0);

  function makeStep(data: Omit<Knapsack01Step, 'metrics'>): Knapsack01Step {
    const itemStr = data.itemIndex >= 0 && data.itemIndex < m 
      ? `#${data.itemIndex + 1} (体积:${cost[data.itemIndex]}, 价值:${val[data.itemIndex]})` 
      : '无';
    const jStr = data.j >= 0 ? `${data.j}` : '—';

    return {
      ...data,
      metrics: {
        'metric-cur-item': itemStr,
        'metric-cur-capacity': jStr,
        'metric-max-val': `${data.currentVal}`,
        'metric-status': data.status.toUpperCase(),
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
      currentVal: 0,
      selectedItems: [],
      status: 'init',
      message: `🚀 初始化 01 背包空间：容量 T=${T}，待选物品数 M=${m}。dp 数组初值置 0。`,
      log: `init: capacity=${T}, items=${m}, dp=[${dp.join(', ')}]`,
      codeLine: 8,
    })
  );

  if (T === 0 || m === 0) {
    steps.push(
      makeStep({
        itemIndex: -1,
        j: 0,
        cost: [...cost],
        val: [...val],
        dp: [...dp],
        currentVal: 0,
        selectedItems: [],
        status: 'done',
        message: '🏁 容量为 0 或无物品，运算结束，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: 14,
      })
    );
    return steps;
  }

  // 记录每个状态为了可视化展示选择项
  for (let i = 0; i < m; i++) {
    const c = cost[i];
    const v = val[i];

    steps.push(
      makeStep({
        itemIndex: i,
        j: -1,
        cost: [...cost],
        val: [...val],
        dp: [...dp],
        currentVal: dp[T],
        selectedItems: [],
        status: 'check',
        message: `📦 开始考察第 ${i + 1} 件物品：体积=${c}, 价值=${v}。外层枚举开始。`,
        log: `item ${i + 1}: cost=${c}, val=${v}`,
        codeLine: 9,
      })
    );

    // 倒序枚举容量
    for (let j = T; j >= c; j--) {
      const oldVal = dp[j];
      const candidateVal = dp[j - c] + v;
      const isUpdated = candidateVal > oldVal;

      if (isUpdated) {
        dp[j] = candidateVal;
        steps.push(
          makeStep({
            itemIndex: i,
            j,
            cost: [...cost],
            val: [...val],
            dp: [...dp],
            currentVal: dp[T],
            selectedItems: [i],
            status: 'update',
            message: `✨ 容量 j=${j}：选择物品 ${i + 1} 带来更优解！dp[${j}] = max(${oldVal}, dp[${j - c}](${dp[j - c] - v < 0 ? 0 : dp[j - c]})+${v}) = ${dp[j]}`,
            log: `update: dp[${j}] from ${oldVal} to ${dp[j]}`,
            codeLine: 11,
          })
        );
      } else {
        steps.push(
          makeStep({
            itemIndex: i,
            j,
            cost: [...cost],
            val: [...val],
            dp: [...dp],
            currentVal: dp[T],
            selectedItems: [],
            status: 'keep',
            message: `⚖️ 容量 j=${j}：不选物品 ${i + 1}。保留原状态 dp[${j}]=${oldVal} &ge; 候选 ${candidateVal}`,
            log: `keep: dp[${j}]=${oldVal} >= ${candidateVal}`,
            codeLine: 11,
          })
        );
      }
    }
  }

  // 最终完成
  steps.push(
    makeStep({
      itemIndex: m - 1,
      j: T,
      cost: [...cost],
      val: [...val],
      dp: [...dp],
      currentVal: dp[T],
      selectedItems: [],
      status: 'done',
      message: `🎉 01 背包状态转移完成！在总容量 ${T} 下，能够获得的最大总价值为 ${dp[T]}。`,
      log: `finished: max value = ${dp[T]}`,
      codeLine: 14,
    })
  );

  return steps;
}

export const Knapsack01Visualizer = createDeclarativeVisualizer<Knapsack01Step>({
  id: 'knapsack-01-standard',
  name: '01背包模版 (采药)',
  category: 'dynamic-programming',
  badge: {
    mode: '01背包 · 空间压缩',
    complexity: 'O(M · T) · O(T)',
  },
  card1Title: '🎒 背包物品货架与空间装载沙盘',
  card2Title: '📊 滚动数组状态向量 dp[j] 监视器',
  card2Desc: '展示倒序空间压缩中的每一步状态计算与历史留存',
  legend: [
    { label: '未处理物品', color: '#475569' },
    { label: '当前考察物品', color: '#f59e0b' },
    { label: '装入背包 (贡献价值)', color: '#10b981' },
    { label: '容量更新目标单元格', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'input-capacity',
      label: '背包总容量 T',
      type: 'number',
      defaultValue: 70,
      width: '60px',
    },
    {
      id: 'input-costs',
      label: '物品体积数组 (逗号分隔)',
      type: 'text',
      defaultValue: '71, 69, 1',
      width: '140px',
    },
    {
      id: 'input-vals',
      label: '物品价值数组 (逗号分隔)',
      type: 'text',
      defaultValue: '100, 1, 2',
      width: '140px',
    },
  ],
  presets: [
    {
      label: '洛谷采药典例 (T=70, Ans=3)',
      values: {
        'input-capacity': 70,
        'input-costs': '71, 69, 1',
        'input-vals': '100, 1, 2',
      },
    },
    {
      label: '标准紧凑示例 (T=10, Ans=14)',
      values: {
        'input-capacity': 10,
        'input-costs': '2, 3, 5, 7',
        'input-vals': '3, 4, 7, 8',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-item', label: '当前考察物品', color: '#f59e0b' },
    { id: 'metric-cur-capacity', label: '当前枚举容量 j', color: '#38bdf8' },
    { id: 'metric-max-val', label: '当前最大价值', color: '#10b981' },
    { id: 'metric-status', label: '操作阶段', color: '#a855f7' },
  ],
  codeLanguages: KNAPSACK_01_CODE_LANGUAGES,
  problemHtml: KNAPSACK_01_PROBLEM_HTML,
  analysisHtml: KNAPSACK_01_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const t = parseInt(inputs['input-capacity'] || '70', 10);
    const costs = (inputs['input-costs'] || '71, 69, 1')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const vals = (inputs['input-vals'] || '100, 1, 2')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildKnapsack01Steps(t, costs, vals);
  },
  renderCanvas: (container, step) => {
    // 渲染货架与物品
    const itemsHtml = step.cost
      .map((c, idx) => {
        const isCur = step.itemIndex === idx;
        const v = step.val[idx];
        const bg = isCur ? '#78350f' : '#1e293b';
        const border = isCur ? '#f59e0b' : '#334155';
        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:8px 12px; min-width:80px; text-align:center; transition:all 0.2s;">
            <div style="font-size:11px; color:#94a3b8;">物品 #${idx + 1}</div>
            <div style="font-size:14px; font-weight:800; color:#f8fafc; margin:2px 0;">📦 体积: ${c}</div>
            <div style="font-size:12px; font-weight:700; color:#10b981;">💎 价值: ${v}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:center; align-items:center; background:#0f172a; padding:16px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">待选商品陈列 (Items Shelf)</div>
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
          ${itemsHtml}
        </div>
        <div style="margin-top:10px; padding:6px 14px; background:#1e293b; border-radius:6px; border:1px solid #334155; font-size:12px; color:#e2e8f0;">
          当前决策目标: 容量 <span style="color:#38bdf8; font-weight:800;">j=${step.j >= 0 ? step.j : '—'}</span> | 实时最优: <span style="color:#10b981; font-weight:800;">${step.currentVal}</span>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    // 渲染滚动数组 dp 向量 (显示前后部分，防止过长)
    const len = step.dp.length;
    const cells = step.dp.map((val, idx) => {
      const isCur = step.j === idx;
      const bg = isCur ? '#0284c7' : '#1e293b';
      const border = isCur ? '#38bdf8' : '#334155';
      const color = isCur ? '#ffffff' : val > 0 ? '#10b981' : '#64748b';
      return `
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:36px; padding:4px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:9px; color:#94a3b8;">${idx}</span>
          <span style="font-size:12px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">一维滚动状态向量 dp[0..${len - 1}]</div>
        <div style="display:flex; flex-wrap:wrap; max-height:120px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'knapsack-01-standard',
    name: '01背包模版 (采药)',
    category: 'dynamic-programming',
    difficulty: 'easy',
    description: '洛谷 P1048 经典采药问题，展示一维滚动数组逆序遍历空间压缩机制',
    tags: ['动态规划', '01背包', '空间压缩', '左程云073'],
  },
  Knapsack01Visualizer
);
