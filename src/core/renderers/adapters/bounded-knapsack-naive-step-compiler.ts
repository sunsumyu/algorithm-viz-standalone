/**
 * 多重背包朴素枚举 (洛谷 P1776 宝物筛选 / 左程云 Class 075 Code01)
 * Step Compiler: 三重循环枚举每种物品件数 k，空间压缩倒序枚举容量 j
 */

import type { HighlightTarget } from '../../code-panel';

export interface BoundedNaiveTake {
  itemIdx: number;
  takeCount: number;
  unitWeight: number;
  unitVal: number;
}

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
  status: 'init' | 'item' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedTakes: BoundedNaiveTake[];
  evalInfo?: {
    candidateVal?: number;
    prevVal?: number;
    fits?: boolean;
    improved?: boolean;
  };
  metrics?: Record<string, any>;
}

export function parseNaiveInputs(inputs: Record<string, any> = {}) {
  const rawT = inputs?.['input-t'];
  const t = rawT !== undefined && rawT !== '' ? Math.max(0, parseInt(String(rawT), 10) || 0) : 10;
  const parseList = (val: any, fallback: number[]) => {
    if (val === undefined || val === null || val === '') return fallback;
    const list = String(val)
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));
    return list.length > 0 ? list : fallback;
  };

  const vList = parseList(inputs?.['input-v'], [3, 4, 7]);
  const wList = parseList(inputs?.['input-w'], [2, 3, 5]);
  const cList = parseList(inputs?.['input-c'], [2, 3, 2]);
  return { t, vList, wList, cList };
}

export function buildBoundedKnapsackNaiveSteps(inputs: Record<string, any> = {}): BoundedKnapsackNaiveStep[] {
  const { t, vList, wList, cList } = parseNaiveInputs(inputs);
  const n = Math.min(vList.length, wList.length, cList.length);
  const steps: BoundedKnapsackNaiveStep[] = [];
  const dp = new Array(t + 1).fill(0);
  let bestTakesForCapacity: BoundedNaiveTake[][] = Array.from({ length: t + 1 }, () => []);

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    initDp: { java: 3, cpp: 3, python: 3, javascript: 3 },
    itemLoop: { java: 4, cpp: 4, python: 4, javascript: 4 },
    capLoop: { java: 5, cpp: 5, python: 5, javascript: 5 },
    countLoop: { java: 6, cpp: 6, python: 7, javascript: 6 },
    updateDp: { java: 7, cpp: 7, python: 8, javascript: 7 },
    returnAns: { java: 11, cpp: 11, python: 10, javascript: 11 },
  };

  const makeStep = (data: Partial<BoundedKnapsackNaiveStep> & {
    status: BoundedKnapsackNaiveStep['status'];
    message: string;
    log: string;
  }): BoundedKnapsackNaiveStep => {
    const itemIdx = data.itemIndex ?? -1;
    const jVal = data.j ?? -1;
    const kVal = data.k ?? 0;
    return {
      itemIndex: itemIdx,
      k: kVal,
      j: jVal,
      dp: [...dp],
      maxVal: dp[t],
      totalCapacity: t,
      vList: [...vList],
      wList: [...wList],
      cList: [...cList],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedTakes: data.selectedTakes ? [...data.selectedTakes] : [...(bestTakesForCapacity[t] || [])],
      evalInfo: data.evalInfo,
      metrics: {
        'metric-cur-item': itemIdx >= 0 ? `#${itemIdx + 1}` : '—',
        'metric-cur-k': kVal > 0 ? `${kVal} 件` : '—',
        'metric-cur-j': jVal >= 0 ? `${jVal}` : '—',
        'metric-max-val': `${dp[t]}`,
      },
    };
  };

  // 1. 函数入口
  steps.push(
    makeStep({
      status: 'init',
      message: `🏁 初始化多重背包算法：进入 compute 函数，背包总容量 t=${t}，共有 ${n} 种可拆选宝物。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: lines.entry,
      selectedTakes: [],
    })
  );

  // 2. 初始化 DP 数组
  steps.push(
    makeStep({
      status: 'init',
      message: `📊 初始化 DP 数组：分配 dp[0..${t}] 空间，初值全为 0。准备开启三重朴素循环。`,
      log: `initDp: dp[0..${t}] = 0`,
      codeLine: lines.initDp,
      selectedTakes: [],
    })
  );

  if (n === 0 || t === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 背包容量为 0 或无可用宝物，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
        selectedTakes: [],
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const val = vList[i];
    const weight = wList[i];
    const cnt = cList[i];

    // 2. 宝物外层循环
    steps.push(
      makeStep({
        itemIndex: i,
        status: 'item',
        message: `📦 考察宝物 #${i + 1}：价值=${val}，单重=${weight}，共有 c=${cnt} 件。`,
        log: `item #${i + 1}: v=${val}, w=${weight}, c=${cnt}`,
        codeLine: lines.itemLoop,
      })
    );

    const nextBestTakes = bestTakesForCapacity.map((list) => [...list]);

    // 3. 倒序枚举容量
    for (let j = t; j >= 0; j--) {
      steps.push(
        makeStep({
          itemIndex: i,
          j,
          status: 'check',
          message: `⏳ 容量循环：当前考察背包容量 j=${j}（倒序枚举）。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      // 4. 枚举件数 k
      for (let k = 1; k <= cnt && weight * k <= j; k++) {
        const candidate = dp[j - weight * k] + k * val;
        const updated = candidate > dp[j];

        steps.push(
          makeStep({
            itemIndex: i,
            j,
            k,
            status: 'check',
            message: `🔍 件数枚举：尝试装入宝物 #${i + 1} 共 k=${k} 件 (耗重 ${weight * k}，面值 +${k * val})。`,
            log: `count loop: k=${k}, cost=${weight * k}`,
            codeLine: lines.countLoop,
            evalInfo: {
              candidateVal: candidate,
              prevVal: dp[j],
              fits: true,
            },
          })
        );

        if (updated) {
          dp[j] = candidate;
          const prevFiltered = bestTakesForCapacity[j - weight * k].filter((it) => it.itemIdx !== i + 1);
          nextBestTakes[j] = [
            ...prevFiltered,
            { itemIdx: i + 1, takeCount: k, unitWeight: weight, unitVal: val },
          ];
        }

        steps.push(
          makeStep({
            itemIndex: i,
            j,
            k,
            status: updated ? 'update' : 'check',
            selectedTakes: [...(nextBestTakes[t] || [])],
            message: updated
              ? `✨ 状态转移：装入 ${k} 件刷新收益 dp[${j}] = Math.max(${dp[j]}, dp[${j - weight * k}] + ${k * val}) = ${candidate}！`
              : `⏸️ 状态保持：装入 ${k} 件后收益 ${candidate} <= 原收益 ${dp[j]}，保持原值。`,
            log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
            codeLine: lines.updateDp,
            evalInfo: {
              candidateVal: candidate,
              prevVal: dp[j],
              fits: true,
              improved: updated,
            },
          })
        );
      }
    }

    bestTakesForCapacity = nextBestTakes;
  }

  // 5. 最终返回
  steps.push(
    makeStep({
      j: t,
      status: 'done',
      message: `🎉 多重背包朴素枚举完毕！在总容量 ${t} 下，能够获得的最大总价值为 ${dp[t]}！`,
      log: `return dp[${t}]=${dp[t]}`,
      codeLine: lines.returnAns,
      selectedTakes: [...(bestTakesForCapacity[t] || [])],
    })
  );

  return steps;
}
