/**
 * 购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S) - 声明式 4-Card 沙盘渲染器
 * 核心：容量上界扩充至 H + max(val)，求最小值的完全背包并在 [H, m] 中取全局最小
 * 架构重构：引入采购方案回溯追踪与高动态干草货舱沙盘
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  BUYING_HAY_MIN_COST_PROBLEM_HTML,
  BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  BUYING_HAY_MIN_COST_CODE_LANGUAGES,
  BUYING_HAY_STAGE1_CODE_LANGUAGES,
  BUYING_HAY_STAGE2_CODE_LANGUAGES,
  BUYING_HAY_STAGE3_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import {
  buildBuyingHayRecursionSteps,
  buildBuyingHayMemoSteps,
  buildBuyingHay2DSteps,
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../../../../core/renderers/knapsack-special-stage-evolution';

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
      minCost: INF,
      status: 'init',
      message: `🌾 初始化干草购买方案：进入 minCost 函数，最低需求 H=${h} 磅，最大单包干草 maxVal=${maxv} 磅，扩充容量上限 m=H+maxVal=${m} 磅。`,
      log: `init: H=${h}, maxv=${maxv}, m=${m}`,
      codeLine: lines.entry,
      selectedItems: [],
    })
  );

  // 2. 初始化 DP 数组
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
      message: `📊 分配 dp[0..${m}] 空间，dp[0]=0，其余初值置为 INF。准备开启完全背包试算。`,
      log: `initDp: dp[0]=0, size=${m + 1}`,
      codeLine: lines.initDp,
      selectedItems: [],
    })
  );

  if (h === 0 || n === 0) {
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
        status: 'done',
        message: '🏁 需求为 0 磅，无需采购，花费 0 元。',
        log: 'done: cost=0',
        codeLine: lines.returnAns,
        selectedItems: [],
      })
    );
    return steps;
  }

  for (let i = 0; i < n; i++) {
    const c = cost[i], v = val[i];

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

    // 正序枚举完全背包
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

  // 在 [H, m] 中逐个重量检索全局最小花费
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

function parseBuyingHayInputs(inputs: Record<string, any>) {
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

function renderBuyingHayArena(container: HTMLElement, step: BuyingHayStep) {
  const selected = step.selectedItems || [];
  const totalWeight = selected.reduce((s, it) => s + it.val, 0);
  const totalCost = selected.reduce((s, it) => s + it.cost, 0);
  const isTargetMet = totalWeight >= step.hTarget;
  const ratio = Math.min(100, Math.round((totalWeight / Math.max(1, step.hTarget)) * 100));

  const suppliersHtml = step.cost
    .map((c, idx) => {
      const v = step.val[idx];
      const isCur = step.companyIndex === idx;
      const isChosen = selected.some((it) => it.supplierIdx === idx + 1);
      const bg = isChosen
        ? 'rgba(6, 95, 70, 0.4)'
        : isCur
        ? 'rgba(30, 27, 75, 0.7)'
        : 'rgba(15, 23, 42, 0.6)';
      const border = isChosen ? '#10b981' : isCur ? '#818cf8' : '#334155';

      let badge = '<span style="color:#64748b; font-size:9.5px;">⚪ 备选供货商</span>';
      if (isChosen) {
        badge = '<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 正在采购</span>';
      } else if (isCur) {
        badge = '<span style="background:#2563eb; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 正在考察</span>';
      }

      return `
        <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:10px 14px; text-align:left; display:flex; flex-direction:column; gap:6px; box-shadow:0 1px 3px rgba(0,0,0,0.2);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; color:#f8fafc; font-size:12.5px;">🏢 供货商 #${idx + 1}</span>
            ${badge}
          </div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:2px;">
            <span style="color:#94a3b8;">售价: <strong style="color:#38bdf8;">${c}</strong> 元</span>
            <span style="color:#94a3b8;">单包重量: <strong style="color:#a78bfa;">${v}</strong> 磅</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:10.5px; color:#64748b; border-top:1px dashed #334155; padding-top:4px; margin-top:2px;">
            <span>性价比: ${(c / v).toFixed(2)} 元/磅</span>
            <span>库存: <strong>无限供应 ∞</strong></span>
          </div>
        </div>
      `;
    })
    .join('');

  const currentItemsList = selected.length === 0
    ? '<span style="color:#64748b; font-size:11px; font-style:italic;">暂未采购任何干草</span>'
    : selected
        .map(
          (it) =>
            `<span style="background:rgba(16, 185, 129, 0.15); border:1px solid #10b981; color:#34d399; padding:2px 8px; border-radius:4px; font-size:11px; font-family:monospace; display:inline-flex; align-items:center; gap:4px;">
              📦 供货商 #${it.supplierIdx} (+${it.val}磅, ${it.cost}元)
            </span>`
        )
        .join(' ');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; width:100%; height:100%; box-sizing:border-box; padding:2px 4px; flex:1; min-height:0; overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:8px 12px; border-radius:8px; border:1px solid #1e293b; flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div>
            <span style="font-size:11px; color:#94a3b8;">目标需求量 H:</span>
            <strong style="color:#38bdf8; font-size:14px; margin-left:4px;">${step.hTarget} 磅</strong>
          </div>
          <div>
            <span style="font-size:11px; color:#94a3b8;">已达总重量:</span>
            <strong style="color:${isTargetMet ? '#34d399' : '#fbbf24'}; font-size:14px; margin-left:4px;">${totalWeight} 磅</strong>
          </div>
          <div>
            <span style="font-size:11px; color:#94a3b8;">累计采购花费:</span>
            <strong style="color:#f43f5e; font-size:14px; margin-left:4px;">${totalCost} 元</strong>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:11px; color:#94a3b8;">达标进度:</span>
          <div style="width:100px; height:8px; background:#1e293b; border-radius:4px; overflow:hidden; border:1px solid #334155;">
            <div style="width:${ratio}%; height:100%; background:${isTargetMet ? '#10b981' : '#38bdf8'}; transition:width 0.3s;"></div>
          </div>
          <span style="font-size:11px; font-weight:700; color:${isTargetMet ? '#34d399' : '#38bdf8'};">${ratio}%</span>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; background:#0b1329; border:1px solid #1e293b; border-radius:8px; padding:10px 14px; flex-shrink:0;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-bottom:6px; display:flex; justify-content:space-between;">
          <span>🛒 当前最佳装载方案 (背包重量 j=${step.j >= 0 ? step.j : 0} 磅)</span>
          <span style="color:#64748b;">支持超额购买</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; min-height:24px; align-items:center;">
          ${currentItemsList}
        </div>
      </div>

      <div style="flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden;">
        <div style="font-size:11px; color:#94a3b8; font-weight:700; margin-bottom:6px; flex-shrink:0;">
          🏬 供货商货源展台 (点击或推演时高亮考察)
        </div>
        <div style="flex:1; min-height:0; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; padding-right:4px;">
          ${suppliersHtml}
        </div>
      </div>
    </div>
  `;
}

function renderBuyingHayVectorMatrix(container: HTMLElement, step: BuyingHayStep) {
  const cells = step.dp.map((val, idx) => {
    const isCur = step.j === idx;
    const isAtOrAboveTarget = idx >= step.hTarget;
    const isInf = val >= 1_000_000_000;

    let bg = '#1e293b';
    let border = '#334155';
    let textCol = '#64748b';

    if (isAtOrAboveTarget) {
      bg = '#064e3b';
      border = '#059669';
      textCol = '#34d399';
    } else if (!isInf) {
      bg = '#0c4a6e';
      border = '#0284c7';
      textCol = '#38bdf8';
    }

    if (isCur) {
      bg = '#f59e0b';
      border = '#fbbf24';
      textCol = '#0f172a';
    }

    const costDisplay = isInf ? 'INF' : `${val}元`;
    return `
      <div id="knapsack-hay-cell-${idx}" style="background:${bg}; border:1px solid ${border}; border-radius:4px; padding:3px 6px; text-align:center; min-width:54px; margin:1px; display:inline-flex; flex-direction:column; align-items:center; justify-content:center;">
        <span style="font-size:8.5px; color:${isCur ? '#0f172a' : '#94a3b8'}; font-weight:600;">${idx}磅</span>
        <strong style="font-size:10.5px; color:${textCol}; font-family:monospace; margin-top:1px;">${costDisplay}</strong>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 4px; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
      <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700; flex-shrink:0;">干草采购最小花费表 (深绿背景表示 >= H 达标区间)</div>
      <div style="display:flex; flex-wrap:wrap; align-content:flex-start; flex:1; min-height:0; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px; border:1px solid #1e293b;">
        ${cells.join('')}
      </div>
    </div>
  `;

  if (step.j >= 0) {
    const activeCell = container.querySelector(`#knapsack-hay-cell-${step.j}`) as HTMLElement | null;
    if (activeCell && typeof activeCell.scrollIntoView === 'function') {
      activeCell.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }
}

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 允许超额',
    complexity: 'O(N · (H + maxV)) · O(H + maxV)',
  },
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^N)',
      theme: 'bg-blue',
      badge: {
        mode: '完全背包 · 递归暴力搜索',
        complexity: 'O(2^N) · O(N) 栈深',
      },
      card1Title: '🌾 供货商列表与递归调用栈',
      card2Title: '📊 递归分支探索开销监控',
      codeLanguages: BUYING_HAY_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { h, cost, val } = parseBuyingHayInputs(inputs);
        return buildBuyingHayRecursionSteps(h, cost, val);
      },
      renderCanvas: (container, step) => {
        const suppliersHtml = step.cost
          .map(
            (c: number, idx: number) => `
          <div style="background:${
            step.i === idx ? 'rgba(59, 130, 246, 0.3)' : 'rgba(15, 23, 42, 0.6)'
          }; border:1px solid ${step.i === idx ? '#3b82f6' : '#334155'}; border-radius:6px; padding:6px 10px; font-family:'JetBrains Mono', monospace; font-size:11px;">
            供货商 #${idx + 1}: ${c}元 / ${step.val[idx]}磅
          </div>
        `
          )
          .join('');
        renderSpecialRecursionCard1(
          container,
          '供货商决策栈',
          step.callStack,
          `
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="font-size:11px; color:#94a3b8; font-weight:700;">供货商价目清单 (目标 H=${step.h} 磅):</div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">${suppliersHtml}</div>
          </div>
        `
        );
      },
      renderCustomMetrics: (container, step) => {
        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px; height:100%; width:100%;">
            <div style="background:rgba(30, 41, 59, 0.6); border:1px solid #334155; border-radius:8px; padding:12px;">
              <div style="font-size:11px; color:#94a3b8;">当前执行决策</div>
              <div style="font-size:14px; font-weight:700; color:#f8fafc; margin-top:2px;">${step.decision}</div>
              <div style="font-size:12px; color:#38bdf8; margin-top:4px;">${step.message}</div>
            </div>
            <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
              <div style="font-size:11px; color:#94a3b8;">超额满足机制解析</div>
              <div style="font-size:12px; color:#cbd5e1; line-height:1.6;">
                当剩余需求 <code>remH &lt;= 0</code> 时，代表已经购买了足够的干草（甚至超额）。完全背包允许超额，因此返回 0 元不再增加额外花费。
              </div>
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N·H)',
      theme: 'bg-blue',
      badge: {
        mode: '完全背包 · 记忆化搜索',
        complexity: 'O(N · H) · O(N · H) 备忘录',
      },
      card1Title: '💾 备忘录剪枝探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][remH]',
      codeLanguages: BUYING_HAY_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { h, cost, val } = parseBuyingHayInputs(inputs);
        return buildBuyingHayMemoSteps(h, cost, val);
      },
      renderCanvas: (container, step) => {
        renderSpecialMemoCard1(
          container,
          `dfsMemo(i=${step.i}, remH=${step.remH})`,
          step.cacheHit,
          step.decision,
          step.message,
          step.hitCount,
          step.missCount
        );
      },
      renderCustomMetrics: (container, step) => {
        renderSpecialMemoCard2(
          container,
          `备忘录矩阵 memo[${step.cost.length}][${step.h + 1}]`,
          step.memo,
          step.i,
          step.remH,
          step.cacheHit
        );
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N·(H+maxV))',
      theme: 'bg-emerald',
      badge: {
        mode: '完全背包 · 严格二维填表',
        complexity: 'O(N · (H + maxV)) · O(N · (H + maxV))',
      },
      card1Title: '🔗 供货商对比与转移依赖格展示',
      card2Title: '📐 二维动态规划状态表 dp[i][j]',
      codeLanguages: BUYING_HAY_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { h, cost, val } = parseBuyingHayInputs(inputs);
        return buildBuyingHay2DSteps(h, cost, val);
      },
      renderCanvas: (container, step) => {
        renderSpecial2DCard1(
          container,
          `dp[${step.i >= 0 ? step.i : '—'}][${step.j >= 0 ? step.j : '—'}]`,
          step.i >= 0 && step.j >= 0
            ? step.dp[step.i]?.[step.j] >= 1_000_000_000
              ? 'INF'
              : `${step.dp[step.i]?.[step.j]} 元`
            : '—',
          step.depCells,
          step.decision,
          step.message
        );
      },
      renderCustomMetrics: (container, step) => {
        renderSpecial2DCard2(
          container,
          `二维 DP 状态表 dp[0..${step.cost.length}][0..${step.m}]`,
          step.dp,
          step.i,
          step.j,
          step.depCells
        );
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 一维空间压缩',
      shortName: '一维优化',
      num: 4,
      timeBadge: 'O(H+maxV) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '完全背包 · 允许超额',
        complexity: 'O(N · (H + maxV)) · O(H + maxV)',
      },
      card1Title: '🌾 干草供销市场与实时采购载荷舱',
      card2Title: '📊 滚动状态向量 dp[0..m] 监视器',
      codeLanguages: BUYING_HAY_MIN_COST_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { h, cost, val } = parseBuyingHayInputs(inputs);
        return buildBuyingHayMinCostSteps(h, cost, val);
      },
      renderCanvas: (container, step) => renderBuyingHayArena(container, step),
      renderCustomMetrics: (container, step) => renderBuyingHayVectorMatrix(container, step),
    },
  ],
  card1Title: '🌾 干草供销市场与实时采购载荷舱',
  card2Title: '📊 滚动状态向量 dp[0..m] 监视器',
  card2Desc: '展示扩充容量范围 [0, H+maxV] 内寻找全局最小花费的动态规划过程',
  legend: [
    { label: '未达需求区间 (< H)', color: '#38bdf8' },
    { label: '达标合规区间 (>= H)', color: '#10b981' },
    { label: '不可达状态 (INF)', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-h',
      label: '目标需求量 H (磅)',
      type: 'number',
      defaultValue: 60,
      width: '70px',
    },
    {
      id: 'input-costs',
      label: '单价数组 costs (元)',
      type: 'text',
      defaultValue: '5, 100',
      width: '120px',
    },
    {
      id: 'input-vals',
      label: '单包磅数 vals (磅)',
      type: 'text',
      defaultValue: '10, 100',
      width: '120px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (H=60, 供货商[5元/10磅, 100元/100磅], Ans=30元)',
      values: {
        'input-h': 60,
        'input-costs': '5, 100',
        'input-vals': '10, 100',
      },
    },
    {
      label: '超额反而更省案例 (H=15, [10元/8磅, 12元/16磅], Ans=12元)',
      values: {
        'input-h': 15,
        'input-costs': '10, 12',
        'input-vals': '8, 16',
      },
    },
  ],
  metrics: [
    { id: 'metric-cur-supplier', label: '当前供货商', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前重量 j', color: '#38bdf8' },
    { id: 'metric-expanded-m', label: '扩充容量上限 m', color: '#8b5cf6' },
    { id: 'metric-min-cost', label: '最低采购总花费', color: '#10b981' },
  ],
  codeLanguages: BUYING_HAY_MIN_COST_CODE_LANGUAGES,
  problemHtml: BUYING_HAY_MIN_COST_PROBLEM_HTML,
  analysisHtml: BUYING_HAY_MIN_COST_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { h, cost, val } = parseBuyingHayInputs(inputs);
    return buildBuyingHayMinCostSteps(h, cost, val);
  },
  renderCanvas: (container, step) => renderBuyingHayArena(container, step),
  renderCustomMetrics: (container, step) => renderBuyingHayVectorMatrix(container, step),
});

export const BuyingHayMinCostVisualizer = Visualizer;

registerAlgorithm({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  viewId: 'algo-buying-hay-min-cost-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code06：洛谷 P2918 购买干草，至少 H 磅允许超额，容量上界扩充至 H + maxVal 的完全背包求极小值',
  icon: '🌾',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 89,
  learningGoal: '掌握允许超额时的容量上界安全扩充证明（H + maxVal）与求最小花费完全背包的状态转移',
});
