/**
 * 从栈中取出K个硬币的最大面值和 (LeetCode 2218) - 声明式 4-Card 沙盘渲染器
 * 核心：硬币栈自顶向下连续取 -> 前缀和预处理转分组背包互斥选择
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  COINS_FROM_PILES_PROBLEM_HTML,
  COINS_FROM_PILES_ANALYSIS_HTML,
  COINS_FROM_PILES_CODE_LANGUAGES,
} from './knapsack-074-problem-content';

export interface CoinsFromPilesStep {
  pileIndex: number;
  j: number;
  c: number;
  piles: number[][];
  preSum: number[];
  dp: number[];
  maxVal: number;
  kTarget: number;
  status: 'init' | 'pile' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number;
  metrics?: Record<string, any>;
}

export function buildCoinsFromPilesSteps(
  piles: number[][],
  k: number
): CoinsFromPilesStep[] {
  const steps: CoinsFromPilesStep[] = [];
  const n = piles.length;
  const K = Math.max(0, k);
  const dp = new Array(K + 1).fill(0);

  function makeStep(data: Omit<CoinsFromPilesStep, 'metrics'>): CoinsFromPilesStep {
    const pileStr = data.pileIndex >= 0 ? `第 ${data.pileIndex + 1} 栈` : '—';
    const jStr = data.j >= 0 ? `${data.j}` : '—';
    const cStr = data.c >= 0 ? `取 ${data.c} 枚` : '—';
    return {
      ...data,
      metrics: {
        'metric-cur-pile': pileStr,
        'metric-cur-j': jStr,
        'metric-cur-c': cStr,
        'metric-max-coins': `${data.maxVal}`,
      },
    };
  }

  // 1. 初始化
  steps.push(
    makeStep({
      pileIndex: -1,
      j: -1,
      c: -1,
      piles: [...piles],
      preSum: [],
      dp: [...dp],
      maxVal: 0,
      kTarget: K,
      status: 'init',
      message: `🪙 初始化硬币栈：共有 ${n} 个栈，目标操作次数 k=${K}。`,
      log: `init: piles=${n}, k=${K}`,
      codeLine: 8,
    })
  );

  if (K === 0 || n === 0) {
    steps.push(
      makeStep({
        pileIndex: -1,
        j: 0,
        c: 0,
        piles: [...piles],
        preSum: [],
        dp: [...dp],
        maxVal: 0,
        kTarget: K,
        status: 'done',
        message: '🏁 操作次数为 0 或无硬币栈，获得最大面值 0。',
        log: 'done: ans=0',
        codeLine: 26,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const pile = piles[i];
    const t = Math.min(pile.length, K);
    const preSum = new Array(t + 1).fill(0);
    for (let idx = 0; idx < t; idx++) {
      preSum[idx + 1] = preSum[idx] + pile[idx];
    }

    steps.push(
      makeStep({
        pileIndex: i,
        j: -1,
        c: -1,
        piles: [...piles],
        preSum: [...preSum],
        dp: [...dp],
        maxVal: dp[K],
        kTarget: K,
        status: 'pile',
        message: `📥 处理硬币栈 #${i + 1}：计算前缀和 [${preSum.join(', ')}]，至多可贡献 ${t} 枚硬币。`,
        log: `pile #${i + 1}: size=${pile.length}, preSum=[${preSum.join(', ')}]`,
        codeLine: 12,
      })
    );

    // 分组背包倒序枚举
    for (let j = K; j > 0; j--) {
      for (let c = 1; c <= Math.min(t, j); c++) {
        const candidate = dp[j - c] + preSum[c];
        if (candidate > dp[j]) {
          dp[j] = candidate;
          steps.push(
            makeStep({
              pileIndex: i,
              j,
              c,
              piles: [...piles],
              preSum: [...preSum],
              dp: [...dp],
              maxVal: dp[K],
              kTarget: K,
              status: 'update',
              message: `✨ 容量 j=${j}：从栈 #${i + 1} 拿取前 ${c} 枚硬币（获得面值 ${preSum[c]}），dp[${j}] 增至 ${dp[j]}！`,
              log: `update: dp[${j}] = ${dp[j]} taking ${c} coins`,
              codeLine: 21,
            })
          );
        }
      }
    }
  }

  // 完成
  steps.push(
    makeStep({
      pileIndex: -1,
      j: K,
      c: -1,
      piles: [...piles],
      preSum: [],
      dp: [...dp],
      maxVal: dp[K],
      kTarget: K,
      status: 'done',
      message: `🎉 拿取完毕！恰好操作 ${K} 次可获得的最大面值和为 ${dp[K]}！`,
      log: `done: maxVal=${dp[K]}`,
      codeLine: 26,
    })
  );

  return steps;
}

export const CoinsFromPilesVisualizer = createDeclarativeVisualizer<CoinsFromPilesStep>({
  id: 'coins-from-piles',
  name: '从栈中取出K个硬币的最大面值和',
  category: 'dynamic-programming',
  badge: {
    mode: '前缀和 · 分组背包',
    complexity: 'O(K · TotalCoins) · O(K)',
  },
  card1Title: '🪙 硬币栈自顶向下与前缀和收益沙盘',
  card2Title: '📈 操作次数容量收益向量 dp[j] 监视器',
  card2Desc: '展示每一个栈视为一个互斥组，按取 1..t 枚硬币的分组背包演进',
  legend: [
    { label: '硬币栈顶 (优先出栈)', color: '#f59e0b' },
    { label: '深层硬币', color: '#38bdf8' },
    { label: '最优拿取方案', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-k',
      label: '操作次数 k',
      type: 'number',
      defaultValue: 2,
      width: '60px',
    },
    {
      id: 'input-piles-json',
      label: '硬币栈列表 JSON',
      type: 'text',
      defaultValue: '[[1,100,3],[7,8,9]]',
      width: '200px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 官方典例 (k=2, Ans=101)',
      values: {
        'input-k': 2,
        'input-piles-json': '[[1,100,3],[7,8,9]]',
      },
    },
    {
      label: '3栈平衡测试 (k=4, Ans=120)',
      values: {
        'input-k': 4,
        'input-piles-json': '[[10,20],[50],[5,40,5]]',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-pile', label: '当前考察栈', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前总步数 j', color: '#38bdf8' },
    { id: 'metric-cur-c', label: '当前拿取枚数 c', color: '#8b5cf6' },
    { id: 'metric-max-coins', label: '当前最大面值', color: '#10b981' },
  ],
  codeLanguages: COINS_FROM_PILES_CODE_LANGUAGES,
  problemHtml: COINS_FROM_PILES_PROBLEM_HTML,
  analysisHtml: COINS_FROM_PILES_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const k = parseInt(inputs['input-k'] || '2', 10);
    let rawArr: number[][] = [];
    try {
      rawArr = JSON.parse(inputs['input-piles-json'] || '[[1,100,3],[7,8,9]]');
    } catch {
      rawArr = [
        [1, 100, 3],
        [7, 8, 9],
      ];
    }
    return buildCoinsFromPilesSteps(rawArr, k);
  },
  renderCanvas: (container, step) => {
    const pilesHtml = step.piles
      .map((pile, pIdx) => {
        const isCurPile = step.pileIndex === pIdx;
        const bg = isCurPile ? '#1e1b4b' : '#0f172a';
        const border = isCurPile ? '#818cf8' : '#334155';

        const coinsHtml = pile
          .map((coin, cIdx) => {
            const isTaken = isCurPile && step.c > 0 && cIdx < step.c;
            const coinBg = isTaken ? '#065f46' : cIdx === 0 ? '#78350f' : '#1e293b';
            const coinBorder = isTaken ? '#34d399' : cIdx === 0 ? '#f59e0b' : '#38bdf8';
            return `
              <div style="background:${coinBg}; border:1px solid ${coinBorder}; border-radius:4px; padding:3px 8px; margin:2px 0; font-size:11px; text-align:center; font-weight:700; color:#f8fafc;">
                🪙 ${coin}
              </div>
            `;
          })
          .join('');

        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:8px; min-width:80px; text-align:center;">
            <div style="font-size:10px; color:#94a3b8; margin-bottom:4px;">栈 #${pIdx + 1}</div>
            <div style="display:flex; flex-direction:column;">
              ${coinsHtml}
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; justify-content:center; align-items:center; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">硬币栈阵列 (从顶向下连续拿取)</div>
        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
          ${pilesHtml}
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
        <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:34px; padding:4px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px;">
          <span style="font-size:8.5px; color:#94a3b8;">${idx}</span>
          <span style="font-size:11px; font-weight:700; color:${color};">${val}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
        <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">操作次数容量收益向量 dp[0..${step.dp.length - 1}]</div>
        <div style="display:flex; flex-wrap:wrap; max-height:100px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
          ${cells.join('')}
        </div>
      </div>
    `;
  },
});

registerAlgorithm(
  {
    id: 'coins-from-piles',
    name: '从栈中取出K个硬币的最大面值和',
    category: 'dynamic-programming',
    difficulty: 'hard',
    description: 'LeetCode 2218：硬币栈前缀和预处理，转化为以操作步数 k 为容量的分组背包',
    tags: ['动态规划', '分组背包', '前缀和', '左程云074'],
  },
  CoinsFromPilesVisualizer
);
