/**
 * 多重背包朴素枚举 (洛谷 P1776 宝物筛选) - 声明式 4-Card 沙盘渲染器
 * 核心：三重循环枚举每种物品件数 k，空间压缩倒序枚举容量 j
 * 架构重构：支持 4 语言全真代码高亮流转、动态装载方案回溯与双层交互沙盘
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';
import {
  BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
} from './knapsack-075-stage-codes';
import {
  buildBoundedNaiveRecursionSteps,
  buildBoundedNaiveMemoSteps,
  buildBoundedNaive2DSteps,
} from '../../../../core/renderers/bounded-knapsack-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../../../../core/renderers/special-stage-cards';

import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';

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
          // 替换掉该种宝物先前的选择，放入最新的 k 件
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

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'bounded-knapsack-naive',
  name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 三重循环',
    complexity: 'O(W · Σc) · O(W)',
  },
  card1Title: '📦 宝物库品类陈列与实时背包载荷舱',
  card2Title: '📈 动态规划收益向量 dp[j] 监视器',
  card2Desc: '展示三重循环朴素枚举每种宝物件数 k 状态转移过程与倒序容量空间压缩',
  legend: [
    { label: '未装入宝物', color: '#475569' },
    { label: '已入选宝物', color: '#10b981' },
    { label: '当前考察宝物', color: '#818cf8' },
  ],
  inputs: [
    { id: 'input-t', label: 't:', type: 'number', defaultValue: 10, width: '42px' },
    { id: 'input-v', label: 'v:', type: 'text', defaultValue: '3, 4, 7', width: '70px' },
    { id: 'input-w', label: 'w:', type: 'text', defaultValue: '2, 3, 5', width: '70px' },
    { id: 'input-c', label: 'c:', type: 'text', defaultValue: '2, 3, 2', width: '70px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=10, 3种宝物, Ans=14)',
      values: { 'input-t': 10, 'input-v': '3, 4, 7', 'input-w': '2, 3, 5', 'input-c': '2, 3, 2' },
    },
    {
      label: '小容量多件案例 (t=8, v=[2,3], w=[2,3], c=[3,2], Ans=8)',
      values: { 'input-t': 8, 'input-v': '2, 3', 'input-w': '2, 3', 'input-c': '3, 2' },
    },
  ],
  metrics: [
    { id: 'metric-cur-item', label: '当前宝物品类', color: '#818cf8' },
    { id: 'metric-cur-k', label: '当前尝试件数 k', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前考察容量 j', color: '#38bdf8' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].analysisHtml,
  defaultStage: 'stage-4',
  buildSteps: buildBoundedKnapsackNaiveSteps,
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(Π(c_i+1))',
      theme: 'bg-blue',
      badge: {
        mode: '多重背包 · 递归暴力搜索',
        complexity: 'O(Π(c_i+1)) · O(N) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '🌲 宝物筛选枚举递归决策树',
      codeLanguages: BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, vList, wList, cList } = parseNaiveInputs(inputs);
        return buildBoundedNaiveRecursionSteps(t, vList, wList, cList);
      },
      renderCanvas: (container, step) => {
        const infoHtml = `
          <div style="background:rgba(15, 23, 42, 0.7); border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#38bdf8;">
                ${step.i < step.n ? `正在决策宝物 #${step.i + 1} (重:${step.wList[step.i]}, 价:${step.vList[step.i]}, 上限:${step.cList[step.i]})` : '所有宝物决策完成'}
              </span>
              <span style="font-size:11px; color:#38bdf8;">剩余容量: <b>${step.remCap}</b></span>
            </div>
            <div style="font-size:11px; color:#374151;">决策: <b style="color:#f59e0b;">${step.decision}</b></div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(container, {
          title: `dfs(i=${step.i}, remCap=${step.remCap})`,
          callStack: step.callStack || [],
          customInfoHtml: infoHtml,
        });
      },
      renderCustomMetrics: (container, step) => {
        RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N·W·c)',
      theme: 'bg-blue',
      badge: {
        mode: '多重背包 · 记忆化搜索',
        complexity: 'O(N · W · c) · O(N · W) 备忘录',
      },
      card1Title: '💾 备忘录探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][remCap]',
      codeLanguages: BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, vList, wList, cList } = parseNaiveInputs(inputs);
        return buildBoundedNaiveMemoSteps(t, vList, wList, cList);
      },
      renderCanvas: (container, step) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfsMemo(i=${step.i}, remCap=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecialMemoCard2(container, {
          title: '备忘录矩阵 memo[i][remCap]',
          memo: step.memoGrid,
          curI: step.i,
          curJ: step.remCap,
        }),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N·W·c)',
      theme: 'bg-emerald',
      badge: {
        mode: '多重背包 · 严格二维表递推',
        complexity: 'O(N · W · c) · O(N · W)',
      },
      card1Title: '📐 状态转移决策推导',
      card2Title: '📊 严格二维位置依赖状态表 dp[i][j]',
      codeLanguages: BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, vList, wList, cList } = parseNaiveInputs(inputs);
        return buildBoundedNaive2DSteps(t, vList, wList, cList);
      },
      renderCanvas: (container, step) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable[step.curI]?.[step.curJ] ?? 0}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecial2DCard2(container, {
          title: '严格二维状态表 dp[i][j]',
          dp: step.dpTable,
          curI: step.curI,
          curJ: step.curJ,
          depCells: (step.depCells || []).map((d: any) => ({ r: d.r, c: d.c })),
        }),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(W) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '多重背包 · 空间压缩三重循环',
        complexity: 'O(W · Σc) · O(W)',
      },
      card1Title: '📦 宝物库品类陈列与实时背包载荷舱',
      card2Title: '📈 动态规划收益向量 dp[j] 监视器',
      codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].codeLanguages,
      buildSteps: buildBoundedKnapsackNaiveSteps,
      renderCanvas: (container, step) => {
        const selected = step.selectedTakes || [];
        const usedWeight = selected.reduce((s: any, it: any) => s + it.takeCount * it.unitWeight, 0);
        const totalVal = selected.reduce((s: any, it: any) => s + it.takeCount * it.unitVal, 0);
        const ratio = Math.min(100, Math.round((usedWeight / Math.max(1, step.totalCapacity)) * 100));

        const itemsListHtml = step.vList
          .map((val: any, idx: number) => {
            const isCur = idx === step.itemIndex;
            const w = step.wList[idx];
            const c = step.cList[idx];
            const takenPlan = selected.find((it: any) => it.itemIdx === idx + 1);
            const finalTakes = takenPlan ? takenPlan.takeCount : 0;
            const bg = finalTakes > 0
              ? 'rgba(6, 95, 70, 0.45)'
              : isCur
              ? 'rgba(30, 27, 75, 0.7)'
              : 'rgba(15, 23, 42, 0.7)';
            const border = finalTakes > 0 ? '#10b981' : isCur ? '#818cf8' : '#334155';

            let badge = '<span style="color:#64748b; font-size:9.5px;">⚪ 备选</span>';
            if (finalTakes > 0) {
              badge = `<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 6px; border-radius:3px; font-weight:bold;">✔ 装入 ${finalTakes} 件</span>`;
            } else if (isCur && step.k > 0) {
              badge = `<span style="background:#2563eb; color:#fff; font-size:9.5px; padding:1px 6px; border-radius:3px; font-weight:bold;">🔍 试算 k=${step.k}</span>`;
            }

            return `
              <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; gap:4px; transition:all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:12px; font-weight:700; color:#374151;">宝物 #${idx + 1}</span>
                  ${badge}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
                  <span style="color:#64748b;">价值: <b style="color:#10b981;">+${val}</b></span>
                  <span style="color:#64748b;">重量: <b style="color:#38bdf8;">${w}</b></span>
                </div>
                <div style="font-size:9.5px; color:#64748b;">上限: <b>${c}</b> 件</div>
              </div>
            `;
          })
          .join('');

        const slotsHtml = selected.length > 0
          ? selected.map((it: any) => `
              <div style="background:rgba(6, 95, 70, 0.35); border:1px solid #10b981; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="color:#a7f3d0; font-weight:800; font-size:11px;">宝物 #${it.itemIdx}</span>
                  <span style="font-size:10px; color:#374151; background:#065f46; padding:1px 5px; border-radius:3px;">×${it.takeCount}</span>
                </div>
                <div style="display:flex; gap:10px; font-size:11px;">
                  <span style="color:#64748b;">重:<b>${it.takeCount * it.unitWeight}</b></span>
                  <span style="color:#10b981; font-weight:700;">+${it.takeCount * it.unitVal}</span>
                </div>
              </div>
            `).join('')
          : `<div style="color:#64748b; font-size:11px; text-align:center; padding:20px 0; border:1px dashed #334155; border-radius:6px;">(背包当前为空，等待容量决策...)</div>`;

        container.innerHTML = `
          <div style="display:grid; grid-template-columns:1.35fr 1fr; gap:10px; width:100%; height:100%; box-sizing:border-box; padding:6px; min-height:0; overflow:hidden;">
            <!-- 左舱：宝物库品类陈列 -->
            <div style="display:flex; flex-direction:column; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; min-height:0; overflow:hidden;">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
                <div style="font-size:11.5px; color:#374151; font-weight:800;">📦 宝物库品类陈列</div>
                <div style="font-size:10.5px; color:#38bdf8; background:#e8f0fe; padding:2px 6px; border-radius:4px;">
                  考察容量: <b>${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
                </div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; overflow-y:auto; flex:1; align-content:start;">
                ${itemsListHtml}
              </div>
            </div>

            <!-- 右舱：实时背包载荷舱与总收益仪表 -->
            <div style="display:flex; flex-direction:column; gap:8px; background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px; min-height:0; overflow:hidden;">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
                <span style="font-size:11.5px; font-weight:800; color:#374151;">🎒 实时背包载荷舱</span>
                <span style="font-size:10.5px; color:#64748b;">已重: <b style="color:#38bdf8;">${usedWeight}</b> / ${step.totalCapacity}</span>
              </div>

              <!-- 背包负重刻度槽 -->
              <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
                <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
                  <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #3b82f6, #10b981); transition:width 0.25s ease;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:9.5px; color:#64748b;">
                  <span>0</span>
                  <span>负载: ${ratio}%</span>
                  <span>${step.totalCapacity}</span>
                </div>
              </div>

              <!-- 已装载宝物插槽清单 -->
              <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                <div style="font-size:10px; color:#64748b; font-weight:700;">已装入宝物项 (${selected.length}):</div>
                ${slotsHtml}
              </div>

              <!-- 底部累计价值大卡 -->
              <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                <span style="font-size:11px; font-weight:700; color:#a7f3d0;">背包累计价值:</span>
                <span style="font-size:15px; font-weight:900; color:#10b981; font-family:monospace;">+${totalVal}</span>
              </div>
            </div>
          </div>
        `;
      },
      renderCustomMetrics: (container, step) => {
        renderKnapsackDpMatrix(container, {
          ...step,
          items: [],
          currentGroupItems: [],
          selectedItems: [],
          groupIndex: -1,
        }, `动态规划收益向量 dp[0..${step.totalCapacity}]`);
      },
    },
  ],
  renderCanvas: (container, step) => {
    const selected = step.selectedTakes || [];
    const usedWeight = selected.reduce((s: number, it: any) => s + it.takeCount * it.unitWeight, 0);
    const totalVal = selected.reduce((s: number, it: any) => s + it.takeCount * it.unitVal, 0);
    const ratio = Math.min(100, Math.round((usedWeight / Math.max(1, step.totalCapacity)) * 100));

    const itemsListHtml = step.vList
      .map((val: any, idx: number) => {
        const isCur = idx === step.itemIndex;
        const w = step.wList[idx];
        const c = step.cList[idx];
        const takenPlan = selected.find((it: any) => it.itemIdx === idx + 1);
        const finalTakes = takenPlan ? takenPlan.takeCount : 0;
        const bg = finalTakes > 0
          ? 'rgba(6, 95, 70, 0.45)'
          : isCur
          ? 'rgba(30, 27, 75, 0.7)'
          : 'rgba(15, 23, 42, 0.7)';
        const border = finalTakes > 0 ? '#10b981' : isCur ? '#818cf8' : '#334155';

        let badge = '<span style="color:#64748b; font-size:9.5px;">⚪ 备选</span>';
        if (finalTakes > 0) {
          badge = `<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 6px; border-radius:3px; font-weight:bold;">✔ 装入 ${finalTakes} 件</span>`;
        } else if (isCur && step.k > 0) {
          badge = `<span style="background:#2563eb; color:#fff; font-size:9.5px; padding:1px 6px; border-radius:3px; font-weight:bold;">🔍 试算 k=${step.k}</span>`;
        }

        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; gap:4px; transition:all 0.2s ease;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#374151;">宝物 #${idx + 1}</span>
              ${badge}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
              <span style="color:#64748b;">价值: <b style="color:#10b981;">+${val}</b></span>
              <span style="color:#64748b;">重量: <b style="color:#38bdf8;">${w}</b></span>
            </div>
            <div style="font-size:9.5px; color:#64748b;">上限: <b>${c}</b> 件</div>
          </div>
        `;
      })
      .join('');

    const slotsHtml = selected.length > 0
      ? selected.map((it: any) => `
          <div style="background:rgba(6, 95, 70, 0.35); border:1px solid #10b981; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:#a7f3d0; font-weight:800; font-size:11px;">宝物 #${it.itemIdx}</span>
              <span style="font-size:10px; color:#374151; background:#065f46; padding:1px 5px; border-radius:3px;">×${it.takeCount}</span>
            </div>
            <div style="display:flex; gap:10px; font-size:11px;">
              <span style="color:#64748b;">重:<b>${it.takeCount * it.unitWeight}</b></span>
              <span style="color:#10b981; font-weight:700;">+${it.takeCount * it.unitVal}</span>
            </div>
          </div>
        `).join('')
      : `<div style="color:#64748b; font-size:11px; text-align:center; padding:20px 0; border:1px dashed #334155; border-radius:6px;">(背包当前为空，等待容量决策...)</div>`;

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:1.35fr 1fr; gap:10px; width:100%; height:100%; box-sizing:border-box; padding:6px; min-height:0; overflow:hidden;">
        <!-- 左舱：宝物库品类陈列 -->
        <div style="display:flex; flex-direction:column; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; min-height:0; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
            <div style="font-size:11.5px; color:#374151; font-weight:800;">📦 宝物库品类陈列</div>
            <div style="font-size:10.5px; color:#38bdf8; background:#e8f0fe; padding:2px 6px; border-radius:4px;">
              考察容量: <b>${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; overflow-y:auto; flex:1; align-content:start;">
            ${itemsListHtml}
          </div>
        </div>

        <!-- 右舱：实时背包载荷舱与总收益仪表 -->
        <div style="display:flex; flex-direction:column; gap:8px; background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px; min-height:0; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
            <span style="font-size:11.5px; font-weight:800; color:#374151;">🎒 实时背包载荷舱</span>
            <span style="font-size:10.5px; color:#64748b;">已重: <b style="color:#38bdf8;">${usedWeight}</b> / ${step.totalCapacity}</span>
          </div>

          <!-- 背包负重刻度槽 -->
          <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
            <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
              <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #3b82f6, #10b981); transition:width 0.25s ease;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:9.5px; color:#64748b;">
              <span>0</span>
              <span>负载: ${ratio}%</span>
              <span>${step.totalCapacity}</span>
            </div>
          </div>

          <!-- 已装载宝物插槽清单 -->
          <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
            <div style="font-size:10px; color:#64748b; font-weight:700;">已装入宝物项 (${selected.length}):</div>
            ${slotsHtml}
          </div>

          <!-- 底部累计价值大卡 -->
          <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
            <span style="font-size:11px; font-weight:700; color:#a7f3d0;">背包累计价值:</span>
            <span style="font-size:15px; font-weight:900; color:#10b981; font-family:monospace;">+${totalVal}</span>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
    }, `动态规划收益向量 dp[0..${step.totalCapacity}]`);
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
