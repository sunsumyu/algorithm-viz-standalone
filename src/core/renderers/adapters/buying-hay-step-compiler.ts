/**
 * 购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S / 左程云 Class 074 Code06)
 * Step Compiler: 容量上界扩充至 H + max(val)，求最小值的完全背包并在 [H, m] 中取全局最小
 */

import type { HighlightTarget } from '../../code-panel';
import type { UniversalStep, UniversalTreeNode } from '../../universal-stage-engine';
import { cloneTree } from '../../strategies/strategy-helpers';
import { snapshotGrid2D } from '../../strategies/grid-snapshot';

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
  const h = parseInt(inputs['input-h'] ?? inputs.h ?? '15', 10);
  const cost = String(inputs['input-costs'] ?? inputs.cost ?? inputs.costs ?? '10, 12')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const val = String(inputs['input-vals'] ?? inputs.val ?? inputs.vals ?? '8, 16')
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
        'metric-expanded-m': `${m} 磅 (H=${h}+maxV=${maxv})`,
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
      selectedItems: [],
      message: `🏁 初始化完全背包状态数组: 目标需求 H=${h} 磅，最大单包 maxV=${maxv} 磅，容量上界安全扩充至 m = H + maxV = ${m} 磅。`,
      log: `init dp[0..${m}], maxVal=${maxv}`,
      codeLine: lines.initDp,
    })
  );

  // 2. 外层枚举供货商，内层完全背包正序转移
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
        selectedItems: [],
        message: `🏢 考察供货商 #${i + 1}: 单价 ${c} 元，每包提供 ${v} 磅。允许无限次购买。`,
        log: `supplier ${i + 1}: cost=${c}, val=${v}`,
        codeLine: lines.outerLoop,
      })
    );

    for (let j = v; j <= m; j++) {
      const prev = dp[j];
      const from = dp[j - v];
      const candidate = from === INF ? INF : from + c;
      const reachable = from !== INF;
      const improved = reachable && candidate < prev;

      if (improved) {
        dp[j] = candidate;
        bestPlans[j] = [...bestPlans[j - v], { supplierIdx: i, cost: c, val: v }];
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
          minCost: INF,
          status: improved ? 'update' : 'check',
          selectedItems: [...(bestPlans[j] || [])],
          evalInfo: {
            c,
            v,
            prevVal: prev,
            candidateVal: candidate,
            reachable,
            improved,
          },
          message: improved
            ? `✨ 更新 dp[${j}] 磅花费: 从 ${prev === INF ? 'INF' : prev + '元'} 降低为 ${candidate} 元 (由 dp[${j - v}]+${c} 元转移)。`
            : `⚖️ 校验 dp[${j}] 磅: 候选花费 ${candidate === INF ? 'INF' : candidate + '元'}，未优于已有 ${prev === INF ? 'INF' : prev + '元'}。`,
          log: `eval j=${j}: ${improved ? 'updated' : 'kept'} dp[${j}]=${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }
  }

  // 3. 在达标区间 [H, m] 内检索最低花费
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

  // 4. 决策完成
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

// ============================================================================
// 顶层抽象 4 阶段全生命周期 UniversalStep 编译流水线
// ============================================================================

export function compileBuyingHaySteps(
  hTarget: number,
  cost: number[],
  val: number[],
  stage: number = 4,
  isMemo: boolean = false,
  anchorMap?: Record<string, number>,
  direction?: 'forward' | 'reverse' | string
): UniversalStep[] {
  const stageNum = typeof stage === 'number' ? stage : 4;
  if (stageNum === 1) {
    return compileBuyingHayStage1Steps(hTarget, cost, val, anchorMap);
  } else if (stageNum === 2) {
    return compileBuyingHayStage2Steps(hTarget, cost, val, anchorMap);
  } else if (stageNum === 3) {
    return compileBuyingHayStage3Steps(hTarget, cost, val, anchorMap);
  } else {
    return compileBuyingHayStage4Steps(hTarget, cost, val, anchorMap);
  }
}

// 阶段 1: 暴力递归
function compileBuyingHayStage1Steps(
  h: number,
  cost: number[],
  val: number[],
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = cost.length;
  const INF = 1_000_000_000;

  const lineEntry = anchors?.entry || 4;
  const lineDfsEntry = anchors?.dfs_entry || 6;
  const lineBaseSatisfied = anchors?.base_satisfied || 7;
  const lineBaseExhausted = anchors?.base_exhausted || 8;
  const lineBranchNotTake = anchors?.branch_not_take || 9;
  const lineBranchTake = anchors?.branch_take || 10;
  const lineCombine = anchors?.combine || 11;

  let nodeCounter = 1;
  const rootNode: UniversalTreeNode = {
    id: `node-${nodeCounter}`,
    r: 0,
    c: h,
    val: `dfs(0,${h})`,
    status: 'current',
    children: [],
  };

  const emptyGrid: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(h + 1).fill(null));
  const activeStack: string[] = [];

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 1,
      grid: JSON.parse(JSON.stringify(emptyGrid)),
      activeStack: [...activeStack],
      treeRoot: cloneTree(rootNode),
      decision: data.decision || '递归分支探索',
      log: data.log || '| 递归调用',
      msg: data.msg || data.log || '',
      line: data.line || lineDfsEntry,
      ...data,
    });
  }

  pushStep({
    type: 'entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `需求 H=${h} 磅，供货商数 n=${n}`,
    log: `| 🏁 算法入口: dfs(0, ${h}) 开始探索`,
    msg: `干草采购决策启动：目标至少 <code>${h}</code> 磅干草，共有 <code>${n}</code> 家供货商。`,
    decision: '算法启动',
  });

  function dfs(i: number, remH: number, parentNode: UniversalTreeNode, depth: number = 1): number {
    if (steps.length > 250) return INF;
    const callLabel = `dfs(${i},${remH})`;
    activeStack.push(callLabel);

    pushStep({
      type: 'dfs-entry',
      line: lineDfsEntry,
      i: Math.min(i, n),
      j: Math.max(0, Math.min(remH, h)),
      activeNodeId: parentNode.id,
      tag: `进入帧 ${callLabel}`,
      log: `| 📥 进入递归帧 ${callLabel} (剩余需求 remH=${remH})`,
      msg: `考察状态 <code>(${i}, ${remH})</code>：从供货商 #${i + 1} 开始满足剩余 <code>${remH}</code> 磅。`,
      decision: `递归探索 (${i},${remH})`,
    });

    if (remH <= 0) {
      pushStep({
        type: 'base',
        line: lineBaseSatisfied,
        i: Math.min(i, n),
        j: 0,
        activeNodeId: parentNode.id,
        tag: `达标基底 remH=${remH} <= 0 -> 0 元`,
        log: `| 🎯 需求达标！remH=${remH} <= 0，后续花费 0 元`,
        msg: `需求已完全满足 (remH=${remH} <= 0)，后续采购花费为 <strong>0 元</strong>！`,
        decision: '需求达标基底',
      });
      parentNode.status = 'target';
      parentNode.tag = '达标(0元)';
      activeStack.pop();
      return 0;
    }

    if (i === n) {
      pushStep({
        type: 'base',
        line: lineBaseExhausted,
        i: n,
        j: Math.max(0, Math.min(remH, h)),
        activeNodeId: parentNode.id,
        tag: `供货商耗尽 -> INF`,
        log: `| ⚠️ 供货商已耗尽但需求未达标，返回 INF`,
        msg: `供货商已遍历完毕，仍缺 <code>${remH}</code> 磅干草，此路不通 (INF)。`,
        decision: '不可达基底',
      });
      parentNode.status = 'base';
      parentNode.tag = '不可达(INF)';
      activeStack.pop();
      return INF;
    }

    // 分支 1: 不选供货商 i
    const childNotTake: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: i + 1,
      c: Math.max(0, remH),
      val: `dfs(${i + 1},${remH})`,
      edgeLabel: '跳过',
      status: 'current',
      children: [],
    };
    parentNode.children.push(childNotTake);

    pushStep({
      type: 'branch-call',
      line: lineBranchNotTake,
      i,
      j: Math.max(0, Math.min(remH, h)),
      activeNodeId: parentNode.id,
      tag: `跳过供货商 #${i + 1} -> dfs(${i + 1}, ${remH})`,
      log: `| ⏭️ 分支 1: 跳过供货商 #${i + 1}，深入 dfs(${i + 1}, ${remH})`,
      msg: `分支 1（跳过）：不从供货商 #${i + 1} 采购，剩余需求仍为 <code>${remH}</code> 磅，深入 <code>dfs(${i + 1}, ${remH})</code>。`,
      decision: '跳过供货商',
    });

    const notTake = dfs(i + 1, remH, childNotTake, depth + 1);

    // 分支 2: 采购供货商 i 且可无限复用
    const childTake: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: i,
      c: Math.max(0, remH - val[i]),
      val: `dfs(${i},${remH - val[i]})`,
      edgeLabel: `+${val[i]}磅(${cost[i]}元)`,
      status: 'current',
      children: [],
    };
    parentNode.children.push(childTake);

    pushStep({
      type: 'branch-call',
      line: lineBranchTake,
      i,
      j: Math.max(0, Math.min(remH, h)),
      activeNodeId: parentNode.id,
      tag: `选购供货商 #${i + 1} -> dfs(${i}, ${remH - val[i]})`,
      log: `| 🌾 分支 2: 选购供货商 #${i + 1} (${val[i]}磅/${cost[i]}元)，深入 dfs(${i}, ${remH - val[i]})`,
      msg: `分支 2（选购）：从供货商 #${i + 1} 买入 1 包（获得 <code>${val[i]}</code> 磅，花费 <code>${cost[i]}</code> 元），继续同层可复用深入 <code>dfs(${i}, ${remH - val[i]})</code>。`,
      decision: '选购供货商',
    });

    const takeSub = dfs(i, remH - val[i], childTake, depth + 1);
    const take = takeSub === INF ? INF : takeSub + cost[i];

    const ans = Math.min(notTake, take);
    pushStep({
      type: 'combine',
      line: lineCombine,
      i,
      j: Math.max(0, Math.min(remH, h)),
      activeNodeId: parentNode.id,
      tag: `聚合: min(不选=${notTake < INF ? notTake + '元' : 'INF'}, 选=${take < INF ? take + '元' : 'INF'}) => ${ans < INF ? ans + '元' : 'INF'}`,
      log: `| ⚖️ 聚合决策: dfs(${i}, ${remH}) = min(${notTake}, ${take}) => ${ans}`,
      msg: `聚合最优选择：跳过需 <code>${notTake < INF ? notTake + '元' : 'INF'}</code>，选购需 <code>${take < INF ? take + '元' : 'INF'}</code>，取最优 <strong>${ans < INF ? ans + '元' : 'INF'}</strong>。`,
      decision: `取最小值 ${ans < INF ? ans + '元' : 'INF'}`,
    });

    parentNode.status = ans < INF ? 'target' : 'base';
    parentNode.tag = ans < INF ? `${ans}元` : 'INF';
    activeStack.pop();
    return ans;
  }

  dfs(0, h, rootNode, 1);
  return steps;
}

// 阶段 2: 记忆化搜索
function compileBuyingHayStage2Steps(
  h: number,
  cost: number[],
  val: number[],
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = cost.length;
  const INF = 1_000_000_000;

  const lineEntry = anchors?.entry || 4;
  const lineDfsEntry = anchors?.dfs_entry || 7;
  const lineBaseSatisfied = anchors?.base_satisfied || 8;
  const lineBaseExhausted = anchors?.base_exhausted || 9;
  const lineCacheHit = anchors?.cache_hit || 10;
  const lineBranchNotTake = anchors?.branch_not_take || 11;
  const lineBranchTake = anchors?.branch_take || 12;
  const lineCombine = anchors?.combine || 13;
  const lineMemoStore = anchors?.memo_store || 14;

  let nodeCounter = 1;
  const rootNode: UniversalTreeNode = {
    id: `node-${nodeCounter}`,
    r: 0,
    c: h,
    val: `dfsMemo(0,${h})`,
    status: 'current',
    children: [],
  };

  const memoGrid: (number | null)[][] = Array.from({ length: n }, () => new Array(h + 1).fill(null));
  const activeStack: string[] = [];

  function pushStep(data: Partial<UniversalStep>) {
    steps.push({
      stage: 2,
      grid: JSON.parse(JSON.stringify(memoGrid)),
      activeStack: [...activeStack],
      treeRoot: cloneTree(rootNode),
      decision: data.decision || '记忆化探查',
      log: data.log || '| 记忆化搜索',
      msg: data.msg || data.log || '',
      line: data.line || lineDfsEntry,
      ...data,
    });
  }

  pushStep({
    type: 'entry',
    line: lineEntry,
    activeNodeId: rootNode.id,
    tag: `初始化 memo[${n}][${h + 1}]`,
    log: `| 📋 初始化规格为 ${n} × ${h + 1} 的记忆化缓存表`,
    msg: `建立 <code>${n} × ${h + 1}</code> 的记忆化状态表，防止完全背包重叠子状态指数级重复计算。`,
    decision: '初始化备忘录',
  });

  function dfsMemo(i: number, remH: number, parentNode: UniversalTreeNode): number {
    if (steps.length > 300) return INF;
    const callLabel = `dfsMemo(${i},${remH})`;
    activeStack.push(callLabel);

    pushStep({
      type: 'dfs-entry',
      line: lineDfsEntry,
      i: Math.min(i, n - 1),
      j: Math.max(0, Math.min(remH, h)),
      activeNodeId: parentNode.id,
      tag: `探查 memo[${i}][${remH}]`,
      log: `| 📥 进入帧 ${callLabel}，探查备忘录缓存`,
      msg: `进入递归帧 <code>${callLabel}</code>，优先检索备忘录 <code>memo[${i}][${remH}]</code>。`,
      decision: `探查状态 (${i},${remH})`,
    });

    if (remH <= 0) {
      pushStep({
        type: 'base',
        line: lineBaseSatisfied,
        i: Math.min(i, n - 1),
        j: 0,
        activeNodeId: parentNode.id,
        tag: `需求达标 -> 0 元`,
        log: `| 🎯 需求达标: remH <= 0，返回 0 元`,
        msg: `需求已达成：采购完成，后续花费为 <strong>0 元</strong>。`,
        decision: '基底达标',
      });
      parentNode.status = 'target';
      parentNode.tag = '达标(0元)';
      activeStack.pop();
      return 0;
    }

    if (i === n) {
      pushStep({
        type: 'base',
        line: lineBaseExhausted,
        i: n - 1,
        j: Math.max(0, Math.min(remH, h)),
        activeNodeId: parentNode.id,
        tag: `供货商耗尽 -> INF`,
        log: `| ⚠️ 供货商耗尽，返回 INF`,
        msg: `供货商耗尽且未达标：不可达分支 (INF)。`,
        decision: '基底耗尽',
      });
      parentNode.status = 'base';
      parentNode.tag = '不可达(INF)';
      activeStack.pop();
      return INF;
    }

    if (memoGrid[i][remH] !== null) {
      const cached = memoGrid[i][remH]!;
      pushStep({
        type: 'cache-hit',
        line: lineCacheHit,
        i,
        j: remH,
        activeNodeId: parentNode.id,
        gridHighlight: { i, j: remH },
        tag: `⚡ 命中缓存: memo[${i}][${remH}] = ${cached < INF ? cached + '元' : 'INF'}`,
        log: `| ⚡ 命中缓存: memo[${i}][${remH}] = ${cached}，剪除重复子树`,
        msg: `⚡ <strong>命中备忘录缓存</strong>！<code>memo[${i}][${remH}] = <strong>${cached < INF ? cached + '元' : 'INF'}</strong></code>，直接 O(1) 返回剪枝！`,
        decision: `命中缓存 ${cached}元`,
      });
      parentNode.status = cached < INF ? 'target' : 'base';
      parentNode.tag = `缓存(${cached}元)`;
      activeStack.pop();
      return cached;
    }

    // 分支 1: 跳过
    const childNotTake: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: i + 1,
      c: Math.max(0, remH),
      val: `dfsMemo(${i + 1},${remH})`,
      edgeLabel: '跳过',
      status: 'current',
      children: [],
    };
    parentNode.children.push(childNotTake);

    pushStep({
      type: 'branch-call',
      line: lineBranchNotTake,
      i,
      j: remH,
      activeNodeId: parentNode.id,
      tag: `跳过供货商 #${i + 1} -> dfsMemo(${i + 1}, ${remH})`,
      log: `| ⏭️ 分支 1: 跳过供货商 #${i + 1}`,
      msg: `分支 1：跳过供货商 #${i + 1}，深入 <code>dfsMemo(${i + 1}, ${remH})</code>。`,
      decision: '跳过供货商',
    });

    const notTake = dfsMemo(i + 1, remH, childNotTake);

    // 分支 2: 选购
    const nextRemH = Math.max(0, remH - val[i]);
    const childTake: UniversalTreeNode = {
      id: `node-${++nodeCounter}`,
      r: i,
      c: nextRemH,
      val: `dfsMemo(${i},${nextRemH})`,
      edgeLabel: `+${val[i]}磅`,
      status: 'current',
      children: [],
    };
    parentNode.children.push(childTake);

    pushStep({
      type: 'branch-call',
      line: lineBranchTake,
      i,
      j: remH,
      activeNodeId: parentNode.id,
      tag: `选购供货商 #${i + 1} -> dfsMemo(${i}, ${nextRemH})`,
      log: `| 🌾 分支 2: 选购供货商 #${i + 1}，深入 dfsMemo(${i}, ${nextRemH})`,
      msg: `分支 2：选购供货商 #${i + 1} 1 包（+${val[i]}磅/花费 ${cost[i]}元），深入 <code>dfsMemo(${i}, ${nextRemH})</code>。`,
      decision: '选购供货商',
    });

    const takeSub = dfsMemo(i, nextRemH, childTake);
    const take = takeSub === INF ? INF : takeSub + cost[i];

    const ans = Math.min(notTake, take);
    pushStep({
      type: 'combine',
      line: lineCombine,
      i,
      j: remH,
      activeNodeId: parentNode.id,
      tag: `聚合: min(${notTake < INF ? notTake + '元' : 'INF'}, ${take < INF ? take + '元' : 'INF'}) => ${ans < INF ? ans + '元' : 'INF'}`,
      log: `| ⚖️ 聚合结果: min(${notTake}, ${take}) => ${ans}`,
      msg: `聚合决策：最优花费为 <strong>${ans < INF ? ans + '元' : 'INF'}</strong>。`,
      decision: '聚合决策',
    });

    memoGrid[i][remH] = ans < INF ? ans : null;
    pushStep({
      type: 'memo-store',
      line: lineMemoStore,
      i,
      j: remH,
      activeNodeId: parentNode.id,
      gridHighlight: { i, j: remH },
      tag: `💾 写入 memo[${i}][${remH}] = ${ans < INF ? ans + '元' : 'INF'}`,
      log: `| 💾 写入备忘录: memo[${i}][${remH}] = ${ans}，缓存落盘`,
      msg: `💾 <strong>写入备忘录</strong>：将状态 <code>memo[${i}][${remH}] = <strong>${ans < INF ? ans + '元' : 'INF'}</strong></code> 存入表格。`,
      decision: `写入 memo[${i}][${remH}]`,
    });

    parentNode.status = ans < INF ? 'target' : 'base';
    parentNode.tag = ans < INF ? `${ans}元` : 'INF';
    activeStack.pop();
    return ans;
  }

  dfsMemo(0, h, rootNode);
  return steps;
}

// 阶段 3: 严格二维动态规划
function compileBuyingHayStage3Steps(
  h: number,
  cost: number[],
  val: number[],
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = cost.length;
  const maxv = Math.max(...val);
  const m = h + maxv;
  const INF = 1_000_000_000;

  const lineCalcBound = anchors?.calc_bound || 4;
  const lineInit = anchors?.init || 6;
  const lineBase = anchors?.base || 8;
  const lineLoopI = anchors?.loop_i || 9;
  const lineLoopJ = anchors?.loop_j || 11;
  const lineTransferSkip = anchors?.transfer_skip || 12;
  const lineTransferTake = anchors?.transfer_take || 14;
  const lineSearchMin = anchors?.search_min || 19;
  const lineReturn = anchors?.return || 20;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
  const bestPlans: HayPurchaseItem[][][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: m + 1 }, () => [])
  );

  function pushStep(data: Partial<UniversalStep>) {
    const curPlan = (data.i !== undefined && data.j !== undefined ? bestPlans[data.i]?.[data.j] : undefined) || (data as any).selectedItems;
    steps.push({
      stage: 3,
      grid: dp.map((row) => row.map((v) => (v >= INF ? null : v))),
      decision: data.decision || '二维动态规划填表',
      log: data.log || '| DP填表',
      msg: data.msg || data.log || '',
      line: data.line || lineTransferTake,
      hTarget: h,
      maxVal: maxv,
      expandedCapacity: m,
      cost: [...cost],
      val: [...val],
      selectedItems: curPlan ? [...curPlan] : [],
      ...data,
    });
  }

  pushStep({
    type: 'calc-bound',
    line: lineCalcBound,
    tag: `容量上界扩充: m = H(${h}) + maxV(${maxv}) = ${m}`,
    log: `| 📐 容量安全扩充证明: 满足至少 H=${h} 磅，扩充至 m=${m} 磅可囊括所有最优解`,
    msg: `容量安全扩充：目标 <code>H=${h}</code> 磅，单件最大包装 <code>maxVal=${maxv}</code> 磅，容量上限扩充至 <code>m = H + maxVal = <strong>${m}</strong></code> 磅！`,
    decision: '扩充容量上限',
  });

  pushStep({
    type: 'init',
    line: lineInit,
    i: 0,
    j: 0,
    tag: `初始化 dp[${n + 1}][${m + 1}] 为 INF`,
    log: `| 📋 初始化二维表规格为 ${n + 1} × ${m + 1}，默认初值 INF`,
    msg: `建立 <code>${n + 1} × ${m + 1}</code> 的二维 DP 状态表，求最小值初值全部设为无穷大。`,
    decision: '初始化 DP 矩阵',
  });

  dp[0][0] = 0;
  pushStep({
    type: 'base',
    line: lineBase,
    i: 0,
    j: 0,
    gridHighlight: { i: 0, j: 0 },
    tag: '基底: dp[0][0] = 0 元',
    log: '| 🎯 基底设置: 0 个供货商凑出 0 磅干草花费 0 元',
    msg: `基底设置：<code>dp[0][0] = <strong>0 元</strong></code>（不需要干草自然花费 0 元）。`,
    decision: '设置空基底',
  });

  for (let i = 1; i <= n; i++) {
    const c = cost[i - 1];
    const v = val[i - 1];

    for (let j = 0; j <= m; j++) {
      dp[i][j] = dp[i - 1][j];
      bestPlans[i][j] = [...bestPlans[i - 1][j]];
      const canTake = j >= v && dp[i][j - v] !== INF;

      if (canTake && dp[i][j - v] + c < dp[i][j]) {
        dp[i][j] = dp[i][j - v] + c;
        bestPlans[i][j] = [...bestPlans[i][j - v], { supplierIdx: i, cost: c, val: v }];
      }

      const valStr = dp[i][j] >= INF ? 'INF' : `${dp[i][j]} 元`;
      pushStep({
        type: canTake ? 'transfer-take' : 'transfer-skip',
        line: canTake ? lineTransferTake : lineTransferSkip,
        i,
        j,
        gridHighlight: { i, j },
        deps: canTake
          ? [
              { r: i - 1, c: j, type: 'top', label: '不选本商' },
              { r: i, c: j - v, type: 'left', label: '复选本商' },
            ]
          : [{ r: i - 1, c: j, type: 'top', label: '不选本商' }],
        tag: `dp[${i}][${j}] = ${valStr}`,
        log: `| 🌾 供货商 #${i} (v=${v}, c=${c}): dp[${i}][${j}] = ${valStr}`,
        msg: `供货商 #${i} (${v}磅/${c}元) 转移：凑出恰好 <code>${j}</code> 磅干草，最低花费为 <strong>${valStr}</strong>。`,
        decision: `计算 dp[${i}][${j}]=${valStr}`,
      });
    }
  }

  let ans = INF;
  let bestJ = h;
  for (let j = h; j <= m; j++) {
    if (dp[n][j] < ans) {
      ans = dp[n][j];
      bestJ = j;
    }
    pushStep({
      type: 'search-min',
      line: lineSearchMin,
      i: n,
      j,
      gridHighlight: { i: n, j },
      tag: `区间检索 j=${j}: ${dp[n][j] < INF ? dp[n][j] + '元' : 'INF'} (当前最低: ${ans}元)`,
      log: `| 🔍 区间检索 [${h}..${m}]: j=${j}, dp[${n}][${j}]=${dp[n][j]}, curMin=${ans}`,
      msg: `在达标区间 <code>[${h}, ${m}]</code> 磅内检索：检查重量 <code>${j}</code> 磅，当前最低总花费为 <strong>${ans} 元</strong>（在 ${bestJ} 磅达成）。`,
      decision: `达标区间检索 j=${j}`,
    });
  }

  pushStep({
    type: 'return',
    line: lineReturn,
    i: n,
    j: bestJ,
    gridHighlight: { i: n, j: bestJ },
    tag: `全局最低花费: ${ans} 元 (采购 ${bestJ} 磅)`,
    log: `| 🏆 最优解达成: 采购 ${bestJ} 磅，花费最少仅需 ${ans} 元！`,
    msg: `🎉 决策完毕！在满足不少于 <code>${h}</code> 磅的前提下，购买 <strong>${bestJ} 磅</strong>干草花费最少，仅需 <strong>${ans} 元</strong>！`,
    decision: `完成决策: ${ans}元`,
  });

  return steps;
}

// 阶段 4: 一维空间压缩
function compileBuyingHayStage4Steps(
  h: number,
  cost: number[],
  val: number[],
  anchors?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const n = cost.length;
  const maxv = Math.max(...val);
  const m = h + maxv;
  const INF = 1_000_000_000;

  const lineCalcBound = anchors?.calc_bound || 4;
  const lineInit = anchors?.init || 6;
  const lineLoopI = anchors?.loop_i || 8;
  const lineLoopJ = anchors?.loop_j || 10;
  const lineTransfer = anchors?.transfer || 12;
  const lineSearchMin = anchors?.search_min || 16;
  const lineReturn = anchors?.return || 17;

  const dp: number[] = new Array(m + 1).fill(INF);
  dp[0] = 0;
  const bestPlans: HayPurchaseItem[][] = Array.from({ length: m + 1 }, () => []);

  function pushStep(data: Partial<UniversalStep>) {
    const curPlan = (data.activeSlot !== undefined ? bestPlans[data.activeSlot] : undefined) || (data as any).selectedItems;
    steps.push({
      stage: 4,
      grid: [dp.map((v) => (v >= INF ? null : v))],
      dp1d: dp.map((v) => (v >= INF ? null : v)),
      decision: data.decision || '空间压缩正序转移',
      log: data.log || '| 空间压缩',
      msg: data.msg || data.log || '',
      line: data.line || lineTransfer,
      hTarget: h,
      maxVal: maxv,
      expandedCapacity: m,
      cost: [...cost],
      val: [...val],
      selectedItems: curPlan ? [...curPlan] : [],
      ...data,
    });
  }

  pushStep({
    type: 'calc-bound',
    line: lineCalcBound,
    grid: [new Array(m + 1).fill(null)],
    dp1d: new Array(m + 1).fill(null),
    tag: `容量安全扩充上限 m = H(${h}) + maxV(${maxv}) = ${m}`,
    log: `| 📐 计算安全扩充上限: m = ${m}`,
    msg: `空间压缩完全背包：确定容量上界 <code>m = H + maxVal = <strong>${m}</strong></code> 磅。`,
    decision: '确定容量上界',
  });

  pushStep({
    type: 'init',
    line: lineInit,
    grid: [new Array(m + 1).fill(null)],
    dp1d: new Array(m + 1).fill(null),
    activeSlot: 0,
    tag: `初始化 dp[0..${m}], dp[0]=0 其余 INF`,
    log: `| 📋 初始化一维向量 dp[0..${m}]`,
    msg: `建立长度为 <code>${m + 1}</code> 的一维滚动向量，初始 <code>dp[0]=0</code>，其余置为 <code>INF</code>。`,
    decision: '初始化一维向量',
  });

  for (let i = 0; i < n; i++) {
    const c = cost[i];
    const v = val[i];

    for (let j = v; j <= m; j++) {
      let improved = false;
      if (dp[j - v] !== INF) {
        if (dp[j - v] + c < dp[j]) {
          dp[j] = dp[j - v] + c;
          bestPlans[j] = [...bestPlans[j - v], { supplierIdx: i + 1, cost: c, val: v }];
          improved = true;
        }
      }

      const valStr = dp[j] >= INF ? 'INF' : `${dp[j]} 元`;
      pushStep({
        type: 'transfer',
        line: lineTransfer,
        activeSlot: j,
        tag: `dp[${j}] = ${valStr}`,
        log: `| 🌾 供货商 #${i + 1} (${v}磅/${c}元): dp[${j}] = ${valStr}`,
        msg: `正序转移 <code>dp[${j}] = min(dp[${j}], dp[${j - v}] + ${c}) = <strong>${valStr}</strong></code>。`,
        decision: improved ? `刷新 dp[${j}]=${valStr}` : `保持 dp[${j}]`,
      });
    }
  }

  let ans = INF;
  let bestJ = h;
  for (let j = h; j <= m; j++) {
    if (dp[j] < ans) {
      ans = dp[j];
      bestJ = j;
    }
    pushStep({
      type: 'search-min',
      line: lineSearchMin,
      activeSlot: j,
      tag: `检索 dp[${j}] = ${dp[j] < INF ? dp[j] + '元' : 'INF'} (当前最低: ${ans}元)`,
      log: `| 🔍 达标区间检索: j=${j}, dp[${j}]=${dp[j]}, 当前最低: ${ans}元`,
      msg: `在达标区间 <code>[${h}, ${m}]</code> 内检索：重量 <code>${j}</code> 磅，当前最低总花费 <strong>${ans} 元</strong>。`,
      decision: `检索区间 j=${j}`,
    });
  }

  pushStep({
    type: 'return',
    line: lineReturn,
    activeSlot: bestJ,
    tag: `最低花费: ${ans} 元 (达标总重: ${bestJ} 磅)`,
    log: `| 🏆 一维空间压缩求解完成: 最低花费 ${ans} 元`,
    msg: `🎉 求解完成！在不少于 <code>${h}</code> 磅的前提下，购买 <strong>${bestJ} 磅</strong>干草花费最少，仅需 <strong>${ans} 元</strong>！`,
    decision: `完成决策: ${ans}元`,
  });

  return steps;
}
