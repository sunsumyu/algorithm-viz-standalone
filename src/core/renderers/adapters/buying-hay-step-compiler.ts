/**
 * 购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S / 左程云 Class 074 Code06)
 * Step Compiler: 容量上界扩充至 H + max(val)，求最小值的完全背包并在 [H, m] 中取全局最小
 */

import type { HighlightTarget } from '../../code-panel';

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
  codeLine?: HighlightTarget;
  selectedItems: HayPurchaseItem[];
  evalInfo?: {
    c: number;
    v: number;
    prevVal: number;
    candidateVal: number;
    reachable: boolean;
    improved: boolean;
  };
  metrics?: Record<string, any>;
}

export function parseBuyingHayInputs(inputs: Record<string, any>): {
  h: number;
  cost: number[];
  val: number[];
} {
  const h = parseInt(inputs['input-h'] || '60', 10);
  const cost = String(inputs['input-costs'] || '5, 100')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const val = String(inputs['input-vals'] || '10, 100')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  return { h, cost, val };
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

  const lines = {
    entry: { java: 7, cpp: 9, python: 1, javascript: 2 },
    initDp: { java: 11, cpp: 13, python: 5, javascript: 6 },
    outerLoop: { java: 13, cpp: 15, python: 7, javascript: 9 },
    capLoop: { java: 14, cpp: 16, python: 8, javascript: 11 },
    updateDp: { java: 16, cpp: 18, python: 10, javascript: 13 },
    scanAns: { java: 21, cpp: 23, python: 11, javascript: 18 },
    returnAns: { java: 24, cpp: 22, python: 12, javascript: 20 },
  };

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

  // 1. 初始化入口
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
      minCost: 0,
      status: 'init',
      message: `🌾 开启干草采购决策：目标需求 H=${h} 磅，单包最大 ${maxv} 磅，扩充容量上限 m=H+maxV=${m} 磅。`,
      log: `init: H=${h}, maxV=${maxv}, m=${m}`,
      codeLine: lines.entry,
      selectedItems: [],
    })
  );

  // 2. 初始化 DP 数组为 INF
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
      status: 'init',
      message: `📊 初始化 DP 状态表：dp[0]=0，其余 dp[1..${m}] 设为不可达 INF (10^9)。`,
      log: `dp[0]=0, dp[1..${m}]=INF`,
      codeLine: lines.initDp,
      selectedItems: [],
    })
  );

  // 3. 完全背包正序递推
  for (let i = 0; i < n; i++) {
    const c = cost[i];
    const v = val[i];

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
        codeLine: lines.outerLoop,
        selectedItems: [],
      })
    );

    for (let j = v; j <= m; j++) {
      const reachable = dp[j - v] !== INF;
      if (!reachable) {
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
            minCost: dp[j] === INF ? -1 : dp[j],
            status: 'check',
            selectedItems: [...(bestPlans[j] || [])],
            evalInfo: {
              c,
              v,
              prevVal: dp[j],
              candidateVal: INF,
              reachable: false,
              improved: false,
            },
            message: `⏳ 重量 j=${j} 磅：前置状态 dp[${j - v}] 为不可达 (INF)，跳过转移。`,
            log: `skip: dp[${j - v}] == INF`,
            codeLine: lines.capLoop,
          })
        );
        continue;
      }

      const prevCost = dp[j];
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
          evalInfo: {
            c,
            v,
            prevVal: prevCost,
            candidateVal: candidate,
            reachable: true,
            improved: updated,
          },
          message: updated
            ? `✨ 重量 j=${j} 磅：选购供应商 #${i + 1} 成功将花费降至 dp[${j}]=${dp[j]} 元！`
            : `⏸️ 重量 j=${j} 磅：选购后花费 ${candidate} >= 原花费 ${dp[j]}，保持当前方案。`,
          log: `dp[${j}] = Math.min(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }
  }

  // 4. 在 [H, m] 中逐个重量检索全局最小花费
  let ans = INF;
  let bestWeight = h;
  for (let j = h; j <= m; j++) {
    const isMin = dp[j] < ans;
    if (isMin) {
      ans = dp[j];
      bestWeight = j;
    }
    steps.push(
      makeStep({
        companyIndex: -1,
        j,
        hTarget: h,
        maxVal: maxv,
        expandedCapacity: m,
        cost: [...cost],
        val: [...val],
        dp: [...dp],
        minCost: ans === INF ? -1 : ans,
        status: isMin ? 'update' : 'check',
        selectedItems: [...(bestPlans[bestWeight] || [])],
        message: `🔍 检索达标总重 j=${j} 磅：花费 ${dp[j] === INF ? 'INF' : dp[j] + '元'}${isMin ? `，刷新当前最低花费 ans=${ans} 元！` : `，未低于当前最低 ${ans} 元。`}`,
        log: `scan min: j=${j}, dp[${j}]=${dp[j]}, curAns=${ans}`,
        codeLine: lines.scanAns,
      })
    );
  }

  // 5. 决策完成
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
      codeLine: lines.returnAns,
      selectedItems: [...(bestPlans[bestWeight] || [])],
    })
  );

  return steps;
}
