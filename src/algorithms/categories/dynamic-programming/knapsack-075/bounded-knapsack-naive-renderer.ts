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
  let bestTakesForCapacity: BoundedNaiveTake[][] = Array.from({ length: t + 1 }, () => []);

  const lines = {
    initDp: { java: 3, cpp: 3, python: 3, javascript: 3 },
    itemLoop: { java: 4, cpp: 4, python: 4, javascript: 4 },
    capLoop: { java: 5, cpp: 5, python: 5, javascript: 5 },
    countLoop: { java: 6, cpp: 6, python: 9, javascript: 6 },
    updateDp: { java: 7, cpp: 7, python: 10, javascript: 7 },
    returnAns: { java: 11, cpp: 11, python: 12, javascript: 11 },
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

  // 1. 初始化
  steps.push(
    makeStep({
      status: 'init',
      message: `🏁 初始化多重背包沙盘：背包总容量 t=${t}，共有 ${n} 种可拆选宝物。`,
      log: `init: t=${t}, n=${n}`,
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

const { template, Visualizer } = createDeclarativeVisualizer<BoundedKnapsackNaiveStep>({
  id: 'bounded-knapsack-naive',
  name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 三重循环',
    complexity: 'O(W · Σc) · O(W)',
  },
  card1Title: '📦 宝物库品类陈列与实时背包载荷舱',
  card2Title: '📈 动态规划收益向量 dp[j] 监视器',
  card2Desc: '展示三重循环枚举每件物品拿取件数 k 时，状态在倒序容量表上的更新演进',
  legend: [
    { label: '未装入宝物', color: '#475569' },
    { label: '已入选背包宝物', color: '#10b981' },
    { label: '正在试算的件数', color: '#38bdf8' },
  ],
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
  renderCanvas: (container, step) => {
    const selected = step.selectedTakes || [];
    const usedWeight = selected.reduce((s, it) => s + it.takeCount * it.unitWeight, 0);
    const totalVal = selected.reduce((s, it) => s + it.takeCount * it.unitVal, 0);
    const ratio = Math.min(100, Math.round((usedWeight / Math.max(1, step.totalCapacity)) * 100));

    const itemsHtml = step.vList
      .map((val, idx) => {
        const isCur = idx === step.itemIndex;
        const w = step.wList[idx];
        const c = step.cList[idx];
        const takenPlan = selected.find((it) => it.itemIdx === idx + 1);
        const finalTakes = takenPlan ? takenPlan.takeCount : 0;
        const bg = finalTakes > 0
          ? 'rgba(6, 95, 70, 0.4)'
          : isCur
          ? 'rgba(30, 27, 75, 0.7)'
          : 'rgba(15, 23, 42, 0.6)';
        const border = finalTakes > 0 ? '#10b981' : isCur ? '#818cf8' : '#334155';

        let badge = '<span style="color:#64748b; font-size:9.5px;">⚪ 备选</span>';
        if (finalTakes > 0) {
          badge = `<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 装入 ${finalTakes} 件</span>`;
        } else if (isCur && step.k > 0) {
          badge = `<span style="background:#2563eb; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 试算 k=${step.k}</span>`;
        }

        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:130px; flex:1; max-width:200px; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:700; color:#cbd5e1;">宝物 #${idx + 1}</span>
              ${badge}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
              <span style="color:#94a3b8;">价值: <b style="color:#10b981;">${val}</b></span>
              <span style="color:#94a3b8;">单重: <b style="color:#38bdf8;">${w}</b></span>
            </div>
            <div style="font-size:9.5px; color:#94a3b8;">可取上限: <b>${c}</b> 件</div>
          </div>
        `;
      })
      .join('');

    const tagsHtml = selected.length > 0
      ? selected.map((it) => `
          <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
            <span style="color:#a7f3d0; font-weight:700;">宝物 #${it.itemIdx}</span>
            <span style="color:#cbd5e1;">x ${it.takeCount} 件 (重:${it.takeCount * it.unitWeight})</span>
            <span style="color:#34d399; font-weight:800;">价值:+${it.takeCount * it.unitVal}</span>
          </div>
        `).join('')
      : `<span style="color:#64748b; font-size:11px;">(背包当前为空，等待容量决策...)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">📦 宝物库品类陈列 (多重背包·每种至多 c[i] 件)</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center;">
          ${itemsHtml}
        </div>

        <!-- 底部实时背包载荷舱 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🎒 实时背包载荷舱</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>已占重量: <b style="color:#38bdf8;">${usedWeight}</b> / ${step.totalCapacity}</span>
              <span>背包累计价值: <b style="color:#10b981;">${totalVal}</b></span>
            </div>
          </div>

          <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #3b82f6, #10b981); transition:width 0.25s ease;"></div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span style="color:#94a3b8; font-size:10.5px; min-width:60px;">已装入宝物:</span>
            ${tagsHtml}
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
