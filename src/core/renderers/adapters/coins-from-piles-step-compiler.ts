/**
 * 从栈中取出K个硬币的最大面值和 (LeetCode 2218 / 左程云 Class 074 Code02)
 * Step Compiler: 自顶向下连续拿取的前缀和预处理转分组背包互斥选择状态推演
 */

import type { HighlightTarget } from '../../code-panel';

export interface CoinPileTake {
  pileIdx: number;
  takeCount: number;
  sumVal: number;
}

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
  selectedTakes: CoinPileTake[];
  metrics?: Record<string, any>;
}

export function parseCoinsFromPilesInputs(inputs: Record<string, any>): {
  k: number;
  piles: number[][];
} {
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
  return { k, piles: rawArr };
}

export function buildCoinsFromPilesSteps(
  piles: number[][],
  k: number
): CoinsFromPilesStep[] {
  const steps: CoinsFromPilesStep[] = [];
  const K = Math.max(0, k);
  const n = piles.length;
  const dp = new Array(K + 1).fill(0);
  let bestTakesForCapacity: CoinPileTake[][] = Array.from({ length: K + 1 }, () => []);

  const lines = {
    entry: { java: 7, cpp: 7, python: 1, javascript: 2 },
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
        'metric-cur-j': jStr,
        'metric-cur-c': cStr,
        'metric-max-coins': `${data.maxVal}`,
      },
    };
  }

  // 1. 初始化入口
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
      selectedTakes: [],
      status: 'init',
      message: `👛 开启硬币栈提取决策：共有 ${n} 个硬币栈，目标从中提取 K=${K} 枚硬币。`,
      log: `init: pilesCount=${n}, k=${K}`,
      codeLine: lines.entry,
    })
  );

  steps.push(
    makeStep({
      pileIndex: -1,
      j: 0,
      c: -1,
      piles: [...piles],
      preSum: [],
      dp: [...dp],
      maxVal: 0,
      kTarget: K,
      selectedTakes: [],
      status: 'init',
      message: `📊 初始化 DP 数组 dp[0..${K}] 全为 0，代表未选取硬币时的累计面值。`,
      log: `dp[0..${K}] = 0`,
      codeLine: lines.initDp,
    })
  );

  if (K === 0 || n === 0) {
    steps.push(
      makeStep({
        pileIndex: -1,
        j: 0,
        c: -1,
        piles: [...piles],
        preSum: [],
        dp: [...dp],
        maxVal: 0,
        kTarget: K,
        selectedTakes: [],
        status: 'done',
        message: '🏁 抽取总次数为 0 或硬币栈为空，最大收益为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const pile = piles[i];

    // 2. 考察当前栈
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
        selectedTakes: [...(bestTakesForCapacity[K] || [])],
        status: 'pile',
        message: `🔄 开始考察硬币栈 #${i + 1}：栈内共 ${pile.length} 枚硬币。`,
        log: `pile loop: i=${i}, size=${pile.length}`,
        codeLine: lines.pileLoop,
      })
    );

    // 3. 计算拿取上限
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
        selectedTakes: [...(bestTakesForCapacity[K] || [])],
        status: 'pile',
        message: `📏 确定拿取上限：最多从本栈拿取 t = min(${pile.length}, ${K}) = ${t} 枚硬币。`,
        log: `calcLimit: t=min(${pile.length}, ${K})=${t}`,
        codeLine: lines.calcLimit,
      })
    );

    // 4. 初始化前缀和
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
        selectedTakes: [...(bestTakesForCapacity[K] || [])],
        status: 'pile',
        message: `📊 初始化前缀和数组 preSum[0..${t}]，准备自顶向下累加硬币面值。`,
        log: `init preSum[0..${t}]`,
        codeLine: lines.initPreSum,
      })
    );

    // 5. 累加前缀和 (逐项步进)
    for (let idx = 0; idx < t; idx++) {
      preSum[idx + 1] = preSum[idx] + pile[idx];
      steps.push(
        makeStep({
          pileIndex: i,
          j: -1,
          c: idx + 1,
          piles: [...piles],
          preSum: [...preSum],
          dp: [...dp],
          maxVal: dp[K],
          kTarget: K,
          selectedTakes: [...(bestTakesForCapacity[K] || [])],
          status: 'pile',
          message: `📥 累加硬币前缀和：第 ${idx + 1} 枚面值 ${pile[idx]}，preSum[${idx + 1}] = preSum[${idx}] + ${pile[idx]} = ${preSum[idx + 1]}。`,
          log: `preSum[${idx + 1}] = ${preSum[idx + 1]}`,
          codeLine: lines.preSumLoop,
        })
      );
    }

    const nextBestTakes = bestTakesForCapacity.map((list) => [...list]);

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
          selectedTakes: [...(nextBestTakes[K] || [])],
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
            selectedTakes: [...(nextBestTakes[K] || [])],
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
          nextBestTakes[j] = [
            ...bestTakesForCapacity[j - c],
            { pileIdx: i + 1, takeCount: c, sumVal: preSum[c] },
          ];
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
            selectedTakes: [...(nextBestTakes[K] || [])],
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

    bestTakesForCapacity = nextBestTakes;
  }

  // 7. 返回最终答案
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
      selectedTakes: [...(bestTakesForCapacity[K] || [])],
      status: 'done',
      message: `🎉 取硬币决策完毕！在总拿取 ${K} 枚硬币限制下，最大面值总和为 ${dp[K]}！`,
      log: `done: dp[${K}]=${dp[K]}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
