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
import { HighlightTarget } from '../../../../core/code-panel';

export interface CoinsFromPilesStep {
  pileIndex: number;
  j: number;
  c: number;
  piles: number[][];
  preSum: number[];
  dp: number[];
  maxVal: number;
  kTarget: number;
  status: 'init' | 'pile' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildCoinsFromPilesSteps(
  piles: number[][],
  k: number
): CoinsFromPilesStep[] {
  const steps: CoinsFromPilesStep[] = [];
  const K = Math.max(0, k);
  const n = piles.length;
  const dp = new Array(K + 1).fill(0);

  const lines = {
    initDp: { java: 8, cpp: 8, python: 3, javascript: 3 },
    pileLoop: { java: 9, cpp: 9, python: 4, javascript: 4 },
    calcLimit: { java: 10, cpp: 10, python: 5, javascript: 5 },
    initPreSum: { java: 11, cpp: 11, python: 6, javascript: 6 },
    preSumLoop: { java: 12, cpp: 12, python: 7, javascript: 7 },
    capLoop: { java: 16, cpp: 14, python: 9, javascript: 10 },
    coinLoop: { java: 17, cpp: 15, python: 10, javascript: 11 },
    updateDp: { java: 18, cpp: 16, python: 11, javascript: 12 },
    returnAns: { java: 22, cpp: 20, python: 12, javascript: 16 },
  };

  function makeStep(data: Omit<CoinsFromPilesStep, 'metrics'>): CoinsFromPilesStep {
    const pileStr = data.pileIndex >= 0 ? `栈 #${data.pileIndex + 1}` : '—';
    const cStr = data.c >= 0 ? `${data.c} 枚` : '—';
    const jStr = data.j >= 0 ? `${data.j}` : '—';
    return {
      ...data,
      metrics: {
        'metric-cur-pile': pileStr,
        'metric-take-coins': cStr,
        'metric-cur-capacity': jStr,
        'metric-max-val': `${data.maxVal}`,
      },
    };
  }

  // 1. 初始化 DP 数组
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
      message: `🪙 初始化取硬币沙盘：目标抽取总次数 k=${K}，硬币栈总数 n=${n}。分配 dp[0..${K}] 空间。`,
      log: `init: dp[0..${K}] = 0`,
      codeLine: lines.initDp,
    })
  );

  if (n === 0 || K === 0) {
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
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const pile = piles[i];

    // 2. 栈循环开始
    steps.push(
      makeStep({
        pileIndex: i,
        j: -1,
        c: -1,
        piles: [...piles],
        preSum: [],
        dp: [...dp],
        maxVal: dp[K],
        kTarget: K,
        status: 'pile',
        message: `🔄 外层栈循环：开始处理硬币栈 #${i + 1}（本栈共 ${pile.length} 枚硬币）。`,
        log: `pile loop: pile #${i + 1}`,
        codeLine: lines.pileLoop,
      })
    );

    // 3. 计算本栈最大贡献上限 t
    const t = Math.min(pile.length, K);
    steps.push(
      makeStep({
        pileIndex: i,
        j: -1,
        c: -1,
        piles: [...piles],
        preSum: [],
        dp: [...dp],
        maxVal: dp[K],
        kTarget: K,
        status: 'pile',
        message: `📏 确定拿取上限：t = min(栈高度 ${pile.length}, 步数上限 ${K}) = ${t}。`,
        log: `t = min(${pile.length}, ${K}) = ${t}`,
        codeLine: lines.calcLimit,
      })
    );

    // 4. 前缀和数组初始化
    const preSum = new Array(t + 1).fill(0);
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
        message: `📊 初始化前缀和数组 preSum[0..${t}]，准备自顶向下累加硬币面值。`,
        log: `init preSum[0..${t}]`,
        codeLine: lines.initPreSum,
      })
    );

    // 5. 累加前缀和
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
        message: `📥 计算前缀和完成：preSum = [${preSum.join(', ')}]，分别对应拿取 0..${t} 枚硬币的累加面值。`,
        log: `preSum = [${preSum.join(', ')}]`,
        codeLine: lines.preSumLoop,
      })
    );

    // 6. 分组背包容量倒序枚举
    for (let j = K; j > 0; j--) {
      steps.push(
        makeStep({
          pileIndex: i,
          j,
          c: -1,
          piles: [...piles],
          preSum: [...preSum],
          dp: [...dp],
          maxVal: dp[K],
          kTarget: K,
          status: 'check',
          message: `⏳ 容量循环：当前考察抽取次数容量 j=${j}（倒序防止同栈多选）。`,
          log: `capacity loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      for (let c = 1; c <= Math.min(t, j); c++) {
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
            status: 'check',
            message: `🪙 枚举拿取枚数：从栈 #${i + 1} 拿取 c=${c} 枚硬币（面值 +${preSum[c]}）。`,
            log: `coin loop: c=${c}`,
            codeLine: lines.coinLoop,
          })
        );

        const candidate = dp[j - c] + preSum[c];
        const updated = candidate > dp[j];
        if (updated) {
          dp[j] = candidate;
        }
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
            status: updated ? 'update' : 'check',
            message: updated
              ? `✨ 状态转移：dp[${j}] = Math.max(${dp[j]}, dp[${j - c}] + ${preSum[c]}) = ${candidate}，收益提高！`
              : `⏸️ 状态保持：拿取 ${c} 枚后收益 ${candidate} <= 原收益 ${dp[j]}，保持 dp[${j}]=${dp[j]}。`,
            log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
            codeLine: lines.updateDp,
          })
        );
      }
    }
  }

  // 7. 完成
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

const { template, Visualizer } = createDeclarativeVisualizer<CoinsFromPilesStep>({
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

export const CoinsFromPilesVisualizer = Visualizer;

registerAlgorithm({
  id: 'coins-from-piles',
  name: '从栈中取出K个硬币的最大面值和',
  viewId: 'algo-coins-from-piles-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code02：LeetCode 2218 取硬币，自顶向下连续拿取的前缀和预处理转分组背包互斥选择',
  icon: '🪙',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握硬币栈连续操作向互斥物品组的转化、前缀和预处理加速与步数容量分组背包',
});

