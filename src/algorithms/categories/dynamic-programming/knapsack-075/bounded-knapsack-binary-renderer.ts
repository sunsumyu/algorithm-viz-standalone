import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';

export interface DerivedItem {
  origIndex: number;
  multiplier: number;
  val: number;
  weight: number;
}

export interface BoundedKnapsackBinaryStep {
  curDerivedIndex: number;
  derivedItems: DerivedItem[];
  j: number;
  dp: number[];
  maxVal: number;
  totalCapacity: number;
  status: 'split' | 'dp-item' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
}

export function buildBoundedKnapsackBinarySteps(inputs: Record<string, any>): BoundedKnapsackBinaryStep[] {
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
  const steps: BoundedKnapsackBinaryStep[] = [];

  const derivedItems: DerivedItem[] = [];

  const makeStep = (p: Partial<BoundedKnapsackBinaryStep>): BoundedKnapsackBinaryStep => ({
    curDerivedIndex: p.curDerivedIndex ?? -1,
    derivedItems: [...derivedItems],
    j: p.j ?? 0,
    dp: [...(p.dp ?? [])],
    maxVal: p.maxVal ?? 0,
    totalCapacity: t,
    status: p.status ?? 'dp-item',
    message: p.message ?? '',
    log: p.log ?? '',
    codeLine: p.codeLine ?? 3,
  });

  // 1. 二进制拆分阶段
  for (let i = 0; i < n; i++) {
    let cnt = cList[i];
    const val = vList[i];
    const weight = wList[i];

    for (let k = 1; k <= cnt; k <<= 1) {
      derivedItems.push({
        origIndex: i,
        multiplier: k,
        val: k * val,
        weight: k * weight,
      });
      cnt -= k;
    }
    if (cnt > 0) {
      derivedItems.push({
        origIndex: i,
        multiplier: cnt,
        val: cnt * val,
        weight: cnt * weight,
      });
    }
  }

  const dp = new Array(t + 1).fill(0);

  steps.push(
    makeStep({
      dp: [...dp],
      status: 'split',
      message: `✂️ 二进制拆分完毕！原始 ${n} 种多重宝物成功拆分为 ${derivedItems.length} 个独立 01 衍生包，复杂度降为 O(W log C)！`,
      log: `split: orig_n=${n} => derived_m=${derivedItems.length}`,
      codeLine: 18,
    })
  );

  if (derivedItems.length === 0 || t === 0) {
    steps.push(
      makeStep({
        dp: [...dp],
        status: 'done',
        message: '🏁 容量为 0 或无可用宝物，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: 35,
      })
    );
    return steps;
  }

  // 2. 01 背包空间压缩推进
  for (let idx = 0; idx < derivedItems.length; idx++) {
    const item = derivedItems[idx];

    steps.push(
      makeStep({
        curDerivedIndex: idx,
        dp: [...dp],
        maxVal: dp[t],
        status: 'dp-item',
        message: `📦 考察衍生包 #${idx + 1} (源自宝物 #${item.origIndex + 1} × ${item.multiplier})：价值=${item.val}，重量=${item.weight}。`,
        log: `derived #${idx + 1}: val=${item.val}, weight=${item.weight}`,
        codeLine: 28,
      })
    );

    for (let j = t; j >= item.weight; j--) {
      const candidate = dp[j - item.weight] + item.val;
      if (candidate > dp[j]) {
        dp[j] = candidate;
        steps.push(
          makeStep({
            curDerivedIndex: idx,
            j,
            dp: [...dp],
            maxVal: dp[t],
            status: 'update',
            message: `✨ 容量 j=${j}：放入衍生包 #${idx + 1}，价值刷新为 dp[${j}]=${dp[j]}！`,
            log: `update: dp[${j}]=${dp[j]} via derived #${idx + 1}`,
            codeLine: 31,
          })
        );
      }
    }
  }

  steps.push(
    makeStep({
      curDerivedIndex: -1,
      j: t,
      dp: [...dp],
      maxVal: dp[t],
      status: 'done',
      message: `🎉 01 背包求解完成！通过二进制拆分求得最大总收益为 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: 34,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BoundedKnapsackBinaryStep>({
  id: 'bounded-knapsack-binary',
  name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 二进制转01',
    complexity: 'O(W · Σlog c) · O(W)',
  },
  card1Title: '✂️ 衍生商品分解区 (1, 2, 4, 8... 二进制权位覆盖)',
  card2Title: '📈 01 背包空间压缩 DP 向量',
  inputs: [
    { id: 'input-t', label: '容量 t:', type: 'number', defaultValue: 15, width: '55px' },
    { id: 'input-v', label: '价值 v:', type: 'text', defaultValue: '3, 4, 7, 8', width: '110px' },
    { id: 'input-w', label: '重量 w:', type: 'text', defaultValue: '2, 3, 5, 6', width: '110px' },
    { id: 'input-c', label: '数量 c:', type: 'text', defaultValue: '2, 3, 2, 2', width: '110px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=15, 4种拆为8衍生包, Ans=21)',
      values: { 'input-t': 15, 'input-v': '3, 4, 7, 8', 'input-w': '2, 3, 5, 6', 'input-c': '2, 3, 2, 2' },
    },
    {
      label: '大量拆分案例 (t=25, 单宝物c=7拆为1+2+4, Ans=28)',
      values: { 'input-t': 25, 'input-v': '4, 6', 'input-w': '3, 5', 'input-c': '7, 4' },
    },
  ],
  metrics: [
    { id: 'metric-orig-n', label: '原始宝物品类', color: '#94a3b8' },
    { id: 'metric-derived-m', label: '衍生 01 包件数', color: '#8b5cf6' },
    { id: 'metric-cur-derived', label: '当前考察衍生包', color: '#f59e0b' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].analysisHtml,
  buildSteps: buildBoundedKnapsackBinarySteps,
  renderCustomStep: (step, { container, updateMetric }) => {
    updateMetric('metric-orig-n', `${step.derivedItems.length > 0 ? (step.derivedItems[step.derivedItems.length - 1].origIndex + 1) : 0} 种`);
    updateMetric('metric-derived-m', `${step.derivedItems.length} 个`);
    updateMetric('metric-cur-derived', step.curDerivedIndex >= 0 ? `#${step.curDerivedIndex + 1}` : '—');
    updateMetric('metric-max-val', `${step.maxVal}`);

    const derivedCards = step.derivedItems
      .map((item, idx) => {
        const isCur = idx === step.curDerivedIndex;
        return `
          <div style="background:${isCur ? '#1e293b' : '#0f172a'}; border:1px solid ${
          isCur ? '#f59e0b' : '#334155'
        }; border-radius:6px; padding:4px 8px; min-width:85px; text-align:center;">
            <div style="font-size:10px; color:${isCur ? '#f59e0b' : '#8b5cf6'}; font-weight:700;">#${idx + 1} (源#${item.origIndex + 1}×${item.multiplier})</div>
            <div style="font-size:11px; color:#f8fafc; margin-top:2px;">💎 <b>+${item.val}</b></div>
            <div style="font-size:10px; color:#94a3b8;">⚖️ ${item.weight}</div>
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
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">二进制衍生小包货架 (不重不漏覆盖 [0..C])</div>
        <div style="display:flex; gap:6px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${derivedCards}
        </div>
        <div style="font-size:11px; color:#94a3b8; font-weight:700;">01 背包空间压缩向量 dp[0..${step.totalCapacity}]</div>
        <div style="display:flex; gap:3px; overflow-x:auto; background:#0b1329; padding:6px; border-radius:6px;">
          ${dpCells}
        </div>
      </div>
    `;
  },
});

export const BoundedKnapsackBinaryVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-binary',
  name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
  viewId: 'algo-bounded-knapsack-binary-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code02：洛谷 P1776 宝物筛选，将多重背包物品按二进制位权拆解转化为 01 背包的标准模版',
  icon: '✂️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 91,
  learningGoal: '掌握任意整数的二进制区间无缝覆盖定理、衍生小包生成算法与多重背包的最常用解法',
});
