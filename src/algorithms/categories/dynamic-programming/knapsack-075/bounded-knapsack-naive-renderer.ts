import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';

export interface BoundedKnapsackNaiveStep {
  itemIndex: number;
  k: number;
  j: number;
  dp: number[];
  maxVal: number;
  totalCapacity: number;
  vList: number[];
  wList: number[];
  cList: number[];
  status: 'init' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
}

export function buildBoundedKnapsackNaiveSteps(inputs: Record<string, any>): BoundedKnapsackNaiveStep[] {
  const t = Math.max(0, parseInt(inputs['input-t'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const vList = parseList(inputs['input-v']);
  const wList = parseList(inputs['input-w']);
  const cList = parseList(inputs['input-c']);

  const n = Math.min(vList.length, wList.length, cList.length);
  const steps: BoundedKnapsackNaiveStep[] = [];

  const dp = new Array(t + 1).fill(0);

  const makeStep = (p: Partial<BoundedKnapsackNaiveStep>): BoundedKnapsackNaiveStep => ({
    itemIndex: p.itemIndex ?? -1,
    k: p.k ?? 0,
    j: p.j ?? 0,
    dp: [...(p.dp ?? dp)],
    maxVal: p.maxVal ?? dp[t],
    totalCapacity: t,
    vList: [...vList],
    wList: [...wList],
    cList: [...cList],
    status: p.status ?? 'check',
    message: p.message ?? '',
    log: p.log ?? '',
    codeLine: p.codeLine ?? 3,
  });

  steps.push(
    makeStep({
      status: 'init',
      message: `🏁 初始化多重背包沙盘：背包总容量 t=${t}，共有 ${n} 种可拆选宝物。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: 3,
    })
  );

  if (n === 0 || t === 0) {
    steps.push(
      makeStep({
        status: 'done',
        message: '🏁 背包容量为 0 或无可用宝物，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: 11,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const val = vList[i];
    const weight = wList[i];
    const cnt = cList[i];

    steps.push(
      makeStep({
        itemIndex: i,
        status: 'check',
        message: `📦 开始考察宝物 #${i + 1}：单价=${val}，单重=${weight}，拥有数量 c=${cnt} 件。`,
        log: `item #${i + 1}: val=${val}, weight=${weight}, cnt=${cnt}`,
        codeLine: 4,
      })
    );

    // 倒序枚举容量
    for (let j = t; j >= 0; j--) {
      for (let k = 1; k <= cnt && weight * k <= j; k++) {
        const candidate = dp[j - weight * k] + k * val;
        if (candidate > dp[j]) {
          dp[j] = candidate;
          steps.push(
            makeStep({
              itemIndex: i,
              k,
              j,
              dp: [...dp],
              maxVal: dp[t],
              status: 'update',
              message: `✨ 容量 j=${j}：选择 ${k} 件宝物 #${i + 1} (消耗重 ${k * weight}，收益 +${k * val})，将 dp[${j}] 刷新为 ${dp[j]}！`,
              log: `update: dp[${j}]=${dp[j]} via k=${k} of #${i + 1}`,
              codeLine: 8,
            })
          );
        }
      }
    }
  }

  steps.push(
    makeStep({
      itemIndex: -1,
      j: t,
      status: 'done',
      message: `🎉 决策完毕！在容量 ${t} 限制下，多重背包所能获得的最大价值为 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: 11,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BoundedKnapsackNaiveStep>({
  id: 'bounded-knapsack-naive',
  name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 三重循环',
    complexity: 'O(W · Σc) · O(W)',
  },
  card1Title: '📦 宝物库品类与件数陈列 (有限数量 c[i])',
  card2Title: '📈 动态规划收益向量 dp[j]',
  inputs: [
    { id: 'input-t', label: '容量 t:', type: 'number', defaultValue: 15, width: '55px' },
    { id: 'input-v', label: '价值 v:', type: 'text', defaultValue: '3, 4, 7, 8', width: '110px' },
    { id: 'input-w', label: '重量 w:', type: 'text', defaultValue: '2, 3, 5, 6', width: '110px' },
    { id: 'input-c', label: '数量 c:', type: 'text', defaultValue: '2, 3, 2, 2', width: '110px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=15, 4种宝物, Ans=21)',
      values: { 'input-t': 15, 'input-v': '3, 4, 7, 8', 'input-w': '2, 3, 5, 6', 'input-c': '2, 3, 2, 2' },
    },
    {
      label: '高数量宝物测试 (t=20, Ans=23)',
      values: { 'input-t': 20, 'input-v': '3, 4, 7, 8', 'input-w': '2, 3, 5, 9', 'input-c': '2, 3, 2, 1' },
    },
  ],
  metrics: [
    { id: 'metric-cur-item', label: '当前宝物', color: '#f59e0b' },
    { id: 'metric-cur-k', label: '选取件数 k', color: '#8b5cf6' },
    { id: 'metric-cur-j', label: '当前容量 j', color: '#38bdf8' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].analysisHtml,
  buildSteps: buildBoundedKnapsackNaiveSteps,
  renderCustomStep: (step, { container, updateMetric }) => {
    updateMetric('metric-cur-item', step.itemIndex >= 0 ? `#${step.itemIndex + 1}` : '—');
    updateMetric('metric-cur-k', step.k > 0 ? `${step.k} 件` : '—');
    updateMetric('metric-cur-j', step.j > 0 ? `${step.j}` : '—');
    updateMetric('metric-max-val', `${step.maxVal}`);

    const itemsHtml = step.vList
      .map((val, idx) => {
        const isCur = idx === step.itemIndex;
        const w = step.wList[idx];
        const c = step.cList[idx];
        return `
          <div style="background:${isCur ? '#1e293b' : '#0f172a'}; border:1px solid ${
          isCur ? '#f59e0b' : '#334155'
        }; border-radius:6px; padding:6px 10px; min-width:90px; flex:1;">
            <div style="font-size:11px; font-weight:700; color:${isCur ? '#f59e0b' : '#94a3b8'};">宝物 #${idx + 1}</div>
            <div style="font-size:12px; color:#e2e8f0; margin-top:2px;">💎 价值: <b>${val}</b></div>
            <div style="font-size:11px; color:#64748b;">⚖️ 重量: ${w}</div>
            <div style="font-size:11px; color:#38bdf8;">📦 数量: <b>${c}</b> 件</div>
          </div>
        `;
      })
      .join('');

    const dpCells = step.dp
      .map((val, j) => {
        const isTarget = j === step.j;
        return `
          <div style="flex:1; min-width:32px; background:${isTarget ? '#2563eb' : val > 0 ? '#064e3b' : '#1e293b'};
                      border:1px solid ${isTarget ? '#60a5fa' : '#334155'}; border-radius:4px;
                      padding:4px 2px; text-align:center;">
            <div style="font-size:9px; color:#94a3b8;">${j}</div>
            <div style="font-size:11px; font-weight:700; color:#f8fafc;">${val}</div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; gap:8px; padding:4px 8px; box-sizing:border-box;">
        <div style="display:flex; gap:6px; overflow-x:auto;">
          ${itemsHtml}
        </div>
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">DP 容量矩阵向量 dp[0..${step.totalCapacity}]</div>
        <div style="display:flex; gap:3px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${dpCells}
        </div>
      </div>
    `;
  },
});

export const BoundedKnapsackNaiveVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-naive',
  name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
  viewId: 'algo-bounded-knapsack-naive-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code01：洛谷 P1776 宝物筛选，多重背包基准朴素三重循环枚举每种物品件数 k',
  icon: '📦',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 90,
  learningGoal: '理解多重背包的严格定义、三重循环朴素枚举的运行轨迹与向空间压缩的一维转化',
});
