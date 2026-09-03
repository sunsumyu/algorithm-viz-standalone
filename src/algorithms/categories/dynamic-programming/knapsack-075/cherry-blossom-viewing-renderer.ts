/**
 * 观赏樱花 (洛谷 P1833 混合背包) - 声明式 4-Card 沙盘渲染器
 * 核心：统一融合 01 背包、完全背包与多重背包，完全背包视作容量上限多重背包统一拆分
 * 架构重构：引入四语言代码高亮、行程装载追踪与双层沙盘
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';

export interface CherryItem {
  cost: number;
  val: number;
  cnt: number;
  type: 'unbounded' | 'bounded' | 'zero-one';
}

export interface CherryDerivedItem {
  treeIndex: number;
  multiplier: number;
  timeCost: number;
  valEarned: number;
}

export interface CherryBlossomViewingStep {
  treeIndex: number;
  derivedIndex: number;
  j: number;
  dp: number[];
  maxVal: number;
  totalTime: number;
  trees: CherryItem[];
  derivedList: CherryDerivedItem[];
  status: 'init' | 'split' | 'tree' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedDerived: CherryDerivedItem[];
  metrics?: Record<string, any>;
}

export function buildCherryBlossomViewingSteps(inputs: Record<string, any>): CherryBlossomViewingStep[] {
  const t = Math.max(0, parseInt(inputs['input-t'], 10) || 0);
  const parseList = (str: string) =>
    (str || '')
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x));

  const costList = parseList(inputs['input-costs']);
  const valList = parseList(inputs['input-vals']);
  const cntList = parseList(inputs['input-cnts']);

  const n = Math.min(costList.length, valList.length, cntList.length);
  const steps: CherryBlossomViewingStep[] = [];

  const trees: CherryItem[] = [];
  for (let i = 0; i < n; i++) {
    const c = cntList[i];
    trees.push({
      cost: costList[i],
      val: valList[i],
      cnt: c,
      type: c === 0 ? 'unbounded' : c === 1 ? 'zero-one' : 'bounded',
    });
  }

  const lines = {
    split: { java: 6, cpp: 6, python: 6, javascript: 6 },
    initDp: { java: 19, cpp: 16, python: 18, javascript: 18 },
    derivedLoop: { java: 20, cpp: 17, python: 19, javascript: 19 },
    capLoop: { java: 21, cpp: 18, python: 20, javascript: 20 },
    updateDp: { java: 22, cpp: 19, python: 21, javascript: 21 },
    returnAns: { java: 25, cpp: 22, python: 22, javascript: 24 },
  };

  // 1. 统一二进制拆分
  const derivedList: CherryDerivedItem[] = [];
  for (let i = 0; i < n; i++) {
    const tree = trees[i];
    let c = tree.cnt === 0 ? Math.max(1, Math.floor(t / Math.max(1, tree.cost))) : tree.cnt;

    for (let k = 1; k <= c; k <<= 1) {
      derivedList.push({
        treeIndex: i,
        multiplier: k,
        timeCost: k * tree.cost,
        valEarned: k * tree.val,
      });
      c -= k;
    }
    if (c > 0) {
      derivedList.push({
        treeIndex: i,
        multiplier: c,
        timeCost: c * tree.cost,
        valEarned: c * tree.val,
      });
    }
  }

  const dp = new Array(t + 1).fill(0);
  let bestDerivedForCapacity: CherryDerivedItem[][] = Array.from({ length: t + 1 }, () => []);

  const makeStep = (data: Partial<CherryBlossomViewingStep> & {
    status: CherryBlossomViewingStep['status'];
    message: string;
    log: string;
  }): CherryBlossomViewingStep => {
    const treeIdx = data.treeIndex ?? -1;
    const jVal = data.j ?? -1;
    let typeStr = '—';
    if (treeIdx >= 0 && trees[treeIdx]) {
      const type = trees[treeIdx].type;
      typeStr = type === 'unbounded' ? '完全背包 (无限)' : type === 'zero-one' ? '01背包 (单次)' : `多重背包 (×${trees[treeIdx].cnt})`;
    }

    return {
      treeIndex: treeIdx,
      derivedIndex: data.derivedIndex ?? -1,
      j: jVal,
      dp: [...dp],
      maxVal: dp[t],
      totalTime: t,
      trees: [...trees],
      derivedList: [...derivedList],
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedDerived: data.selectedDerived ? [...data.selectedDerived] : [...(bestDerivedForCapacity[t] || [])],
      metrics: {
        'metric-total-time': `${t} min`,
        'metric-cur-tree': treeIdx >= 0 ? `树 #${treeIdx + 1}` : '—',
        'metric-tree-type': typeStr,
        'metric-max-val': `${dp[t]}`,
      },
    };
  };

  steps.push(
    makeStep({
      status: 'init',
      message: `🌸 观赏樱花开始：总可用时间 t=${t} 分钟，园内共有 ${n} 棵樱花树。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: lines.initDp,
      selectedDerived: [],
    })
  );

  steps.push(
    makeStep({
      status: 'split',
      message: `✂️ 混合拆分完成：将 ${n} 棵树（含无限完全背包与有限多重背包）统一二进制拆解为 ${derivedList.length} 个衍生观赏包！`,
      log: `split: trees=${n} => derived=${derivedList.length}`,
      codeLine: lines.split,
      selectedDerived: [],
    })
  );

  if (n === 0 || t === 0 || derivedList.length === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 可用时间为 0 或无可观赏樱花树，最大美学价值为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
        selectedDerived: [],
      })
    );
    return steps;
  }

  // 2. 01 背包空间压缩
  for (let idx = 0; idx < derivedList.length; idx++) {
    const item = derivedList[idx];
    const tree = trees[item.treeIndex];

    steps.push(
      makeStep({
        treeIndex: item.treeIndex,
        derivedIndex: idx,
        status: 'tree',
        message: `🌸 考察樱花树 #${item.treeIndex + 1} 衍生包 #${idx + 1} (×${item.multiplier})：耗时 ${item.timeCost} 分钟，收获美学价值 +${item.valEarned}。`,
        log: `derived #${idx + 1}: time=${item.timeCost}, val=${item.valEarned}`,
        codeLine: lines.derivedLoop,
      })
    );

    const nextBest = bestDerivedForCapacity.map((list) => [...list]);

    for (let j = t; j >= item.timeCost; j--) {
      steps.push(
        makeStep({
          treeIndex: item.treeIndex,
          derivedIndex: idx,
          j,
          status: 'check',
          message: `⏳ 时间倒序循环：当前可用时间 j=${j} 分钟 >= 耗时 ${item.timeCost} 分钟。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      const candidate = dp[j - item.timeCost] + item.valEarned;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        nextBest[j] = [...bestDerivedForCapacity[j - item.timeCost], item];
      }

      steps.push(
        makeStep({
          treeIndex: item.treeIndex,
          derivedIndex: idx,
          j,
          status: updated ? 'update' : 'check',
          selectedDerived: [...(nextBest[t] || [])],
          message: updated
            ? `✨ 状态更新：分配时间给樱花树 #${item.treeIndex + 1}，刷新最大美学价值 dp[${j}]=${dp[j]}！`
            : `⏸️ 状态保持：赏花收益 ${candidate} <= 原收益 ${dp[j]}，保持原行程。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }

    bestDerivedForCapacity = nextBest;
  }

  steps.push(
    makeStep({
      treeIndex: -1,
      j: t,
      status: 'done',
      message: `🎉 赏花行程规划完毕！在 ${t} 分钟时限内，最科学的赏花决策可收获最大美学价值 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: lines.returnAns,
      selectedDerived: [...(bestDerivedForCapacity[t] || [])],
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CherryBlossomViewingStep>({
  id: 'cherry-blossom-viewing',
  name: '观赏樱花 (洛谷 P1833 混合背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '混合背包 · 统一拆分',
    complexity: 'O(T · Σlog c) · O(T)',
  },
  card1Title: '🌸 樱花树林图谱与实时赏花行程仓',
  card2Title: '📈 赏花美学价值向量 dp[0..T]',
  card2Desc: '展示 01 背包、完全背包与多重背包在统一二进制拆分后的时间分配与收益演进',
  legend: [
    { label: '未观赏樱花树', color: '#475569' },
    { label: '已排入行程樱花树', color: '#ec4899' },
    { label: '当前考察樱花树', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-t', label: '可用时间 t:', type: 'number', defaultValue: 10, width: '55px' },
    { id: 'input-costs', label: '耗时 costs:', type: 'text', defaultValue: '2, 3, 5', width: '110px' },
    { id: 'input-vals', label: '美学价值 vals:', type: 'text', defaultValue: '3, 4, 10', width: '110px' },
    { id: 'input-cnts', label: '观赏限制 cnts:', type: 'text', defaultValue: '0, 2, 1', width: '110px' },
  ],
  presets: [
    {
      label: '洛谷混合案例 (t=10, 包含完全/多重/01, Ans=16)',
      values: { 'input-t': 10, 'input-costs': '2, 3, 5', 'input-vals': '3, 4, 10', 'input-cnts': '0, 2, 1' },
    },
    {
      label: '全无限观赏 (t=12, costs=[3,4], vals=[5,7], cnts=[0,0], Ans=21)',
      values: { 'input-t': 12, 'input-costs': '3, 4', 'input-vals': '5, 7', 'input-cnts': '0, 0' },
    },
  ],
  metrics: [
    { id: 'metric-total-time', label: '总可用时间', color: '#38bdf8' },
    { id: 'metric-cur-tree', label: '当前樱花树', color: '#f59e0b' },
    { id: 'metric-tree-type', label: '背包模式分类', color: '#ec4899' },
    { id: 'metric-max-val', label: '最大美学总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].analysisHtml,
  buildSteps: buildCherryBlossomViewingSteps,
  renderCanvas: (container, step) => {
    const selected = step.selectedDerived || [];
    const usedTime = selected.reduce((s, it) => s + it.timeCost, 0);
    const totalVal = selected.reduce((s, it) => s + it.valEarned, 0);
    const ratio = Math.min(100, Math.round((usedTime / Math.max(1, step.totalTime)) * 100));

    const treesHtml = step.trees
      .map((tree, idx) => {
        const isCur = idx === step.treeIndex;
        const tag = tree.type === 'unbounded' ? '♾️ 完全' : tree.type === 'zero-one' ? '🎯 01' : `📦 多重×${tree.cnt}`;
        const isChosen = selected.some((it) => it.treeIndex === idx);

        let bg = 'rgba(15, 23, 42, 0.6)';
        let border = '#334155';
        let badge = '<span style="color:#64748b; font-size:9px;">未入选</span>';

        if (isChosen) {
          bg = 'rgba(131, 24, 67, 0.35)';
          border = '#ec4899';
          badge = '<span style="background:#db2777; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 游览行程中</span>';
        } else if (isCur) {
          bg = 'rgba(30, 58, 138, 0.5)';
          border = '#38bdf8';
          badge = '<span style="background:#2563eb; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>';
        }

        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:130px; flex:1; max-width:200px; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11.5px; font-weight:700; color:#f472b6;">树 #${idx + 1}</span>
              <span style="font-size:9px; background:#831843; color:#fbcfe8; padding:1px 4px; border-radius:3px;">${tag}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
              ${badge}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
              <span style="color:#cbd5e1;">🌸 美学: <b style="color:#f472b6;">+${tree.val}</b></span>
              <span style="color:#cbd5e1;">⏱️ 耗时: <b>${tree.cost}m</b></span>
            </div>
          </div>
        `;
      })
      .join('');

    const tagsHtml = selected.length > 0
      ? selected.map((it, idx) => `
          <div style="background:rgba(131, 24, 67, 0.4); border:1px solid #ec4899; border-radius:4px; padding:2px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
            <span style="color:#fbcfe8; font-weight:700;">树 #${it.treeIndex + 1} (×${it.multiplier})</span>
            <span style="color:#cbd5e1;">耗时:${it.timeCost}m</span>
            <span style="color:#f472b6; font-weight:800;">美学:+${it.valEarned}</span>
          </div>
        `).join('')
      : `<span style="color:#64748b; font-size:11px;">(赏花行程尚未安排，等待时间分配...)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
          <div style="font-size:12px; color:#94a3b8; font-weight:700;">🌸 樱花树林图谱 (01背包 / 完全背包 / 多重背包全兼容)</div>
          <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
            当前考察时间: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.totalTime} 分钟
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
          ${treesHtml}
        </div>

        <!-- 底部实时赏花行程仓 -->
        <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🌸 实时赏花行程仓</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>已用时间: <b style="color:#38bdf8;">${usedTime}</b> / ${step.totalTime} min</span>
              <span>累计美学价值: <b style="color:#f472b6;">${totalVal}</b></span>
            </div>
          </div>

          <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #ec4899, #38bdf8); transition:width 0.25s ease;"></div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span style="color:#94a3b8; font-size:10.5px; min-width:60px;">已排行程:</span>
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
      itemIndex: step.treeIndex,
    }, `DP 时间收益矩阵 dp[0..${step.totalTime}]`);
  },
});

export const CherryBlossomViewingVisualizer = Visualizer;

registerAlgorithm({
  id: 'cherry-blossom-viewing',
  name: '观赏樱花 (洛谷 P1833 混合背包)',
  viewId: 'algo-cherry-blossom-viewing-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code03：洛谷 P1833 观赏樱花，统一融合 01 背包、完全背包与多重背包的经典混合背包模版',
  icon: '🌸',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 92,
  learningGoal: '掌握混合背包的判定边界、完全背包向上界多重背包的数学转化与统一二进制拆分',
});
