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
import {
  CHERRY_STAGE1_CODE_LANGUAGES,
  CHERRY_STAGE2_CODE_LANGUAGES,
  CHERRY_STAGE3_CODE_LANGUAGES,
} from './knapsack-075-stage-codes';
import {
  DerivedItem,
  buildBinarySplitRecursionSteps,
  buildBinarySplitMemoSteps,
  buildBinarySplit2DSteps,
} from '../../../../core/renderers/bounded-knapsack-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../../../../core/renderers/special-stage-cards';

import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';

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

export function parseCherryDerivedItems(inputs: Record<string, any>): {
  t: number;
  costList: number[];
  valList: number[];
  cntList: number[];
  n: number;
  derivedItems: DerivedItem[];
} {
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
  const derivedItems: DerivedItem[] = [];

  for (let i = 0; i < n; i++) {
    const cost = costList[i];
    const val = valList[i];
    const origCnt = cntList[i];
    let c = origCnt === 0 ? Math.max(1, Math.floor(t / Math.max(1, cost))) : origCnt;

    for (let k = 1; k <= c; k <<= 1) {
      derivedItems.push({
        origIndex: i,
        multiplier: k,
        weight: k * cost,
        val: k * val,
      });
      c -= k;
    }
    if (c > 0) {
      derivedItems.push({
        origIndex: i,
        multiplier: c,
        weight: c * cost,
        val: c * val,
      });
    }
  }

  return { t, costList, valList, cntList, n, derivedItems };
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
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    splitTreeLoop: { java: 6, cpp: 4, python: 4, javascript: 4 },
    splitConvert: { java: 7, cpp: 5, python: 5, javascript: 5 },
    splitPow2: { java: 8, cpp: 6, python: 7, javascript: 6 },
    splitRemainder: { java: 12, cpp: 10, python: 11, javascript: 10 },
    initDp: { java: 16, cpp: 14, python: 13, javascript: 14 },
    derivedLoop: { java: 17, cpp: 15, python: 14, javascript: 15 },
    capLoop: { java: 18, cpp: 16, python: 15, javascript: 16 },
    updateDp: { java: 19, cpp: 17, python: 16, javascript: 17 },
    returnAns: { java: 22, cpp: 20, python: 17, javascript: 20 },
  };

  const derivedList: CherryDerivedItem[] = [];
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

  // Step 1: 算法入口与初始化
  steps.push(
    makeStep({
      status: 'init',
      message: `🌸 观赏樱花开始：进入 computeCherry 函数，总可用时间 t=${t} 分钟，园内共有 ${n} 棵樱花树。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: lines.entry,
      selectedDerived: [],
    })
  );

  // Step 2: 细粒度逐树二进制拆分推演 (遍历第 6~15 行)
  for (let i = 0; i < n; i++) {
    const tree = trees[i];
    const isUnbounded = tree.cnt === 0;
    let c = isUnbounded ? Math.max(1, Math.floor(t / Math.max(1, tree.cost))) : tree.cnt;

    // 2.1 循环进入第 i 棵树 (Line 6)
    steps.push(
      makeStep({
        treeIndex: i,
        status: 'split',
        message: `🌳 考察樱花树 #${i + 1}：${isUnbounded ? '完全背包（无限次观赏）' : tree.cnt === 1 ? '01 背包（单次）' : `多重背包（限观赏 ${tree.cnt} 次）`}，耗时 ${tree.cost}m，美学价值 +${tree.val}。`,
        log: `split loop: tree #${i + 1}, cnt=${tree.cnt}`,
        codeLine: lines.splitTreeLoop,
        selectedDerived: [],
      })
    );

    // 2.2 完全背包有界化 (Line 7)
    if (isUnbounded) {
      steps.push(
        makeStep({
          treeIndex: i,
          status: 'split',
          message: `🔄 完全背包转化：樱花树 #${i + 1} 虽可无限观赏，但受时限 t=${t}m 制约，最多观赏 floor(${t}/${tree.cost})=${c} 次，无损转为多重背包 (c=${c})！`,
          log: `unbounded convert: tree #${i + 1} => c=${c}`,
          codeLine: lines.splitConvert,
          selectedDerived: [],
        })
      );
    }

    // 2.3 二进制位权 1, 2, 4... 拆分 (Line 8~11)
    for (let k = 1; k <= c; k <<= 1) {
      derivedList.push({
        treeIndex: i,
        multiplier: k,
        timeCost: k * tree.cost,
        valEarned: k * tree.val,
      });

      steps.push(
        makeStep({
          treeIndex: i,
          derivedIndex: derivedList.length - 1,
          status: 'split',
          message: `📦 二进制位权拆分：为树 #${i + 1} 按位权 2^p = ${k} 打包生成衍生包 #${derivedList.length}（×${k} 件，耗时 ${k * tree.cost}m，美学 +${k * tree.val}），剩余可用拆分量 c=${c - k}。`,
          log: `split pack #${derivedList.length}: tree #${i + 1} x${k}`,
          codeLine: lines.splitPow2,
          selectedDerived: [],
        })
      );

      c -= k;
    }

    // 2.4 补齐余数碎片 (Line 12~14)
    if (c > 0) {
      derivedList.push({
        treeIndex: i,
        multiplier: c,
        timeCost: c * tree.cost,
        valEarned: c * tree.val,
      });

      steps.push(
        makeStep({
          treeIndex: i,
          derivedIndex: derivedList.length - 1,
          status: 'split',
          message: `🧩 补齐余数碎片：树 #${i + 1} 剩余不可被二进制幂整除的余量 c=${c}，打包为衍生包 #${derivedList.length}（×${c} 件，耗时 ${c * tree.cost}m，美学 +${c * tree.val}）！`,
          log: `split remainder #${derivedList.length}: tree #${i + 1} x${c}`,
          codeLine: lines.splitRemainder,
          selectedDerived: [],
        })
      );
    }
  }

  // 2.5 拆分总结
  steps.push(
    makeStep({
      status: 'split',
      message: `✂️ 混合二进制拆分完毕！原始 ${n} 棵树全部拆解为 ${derivedList.length} 个独立 01 衍生包，混合背包模型统一转化为标准 01 背包！`,
      log: `split all done: trees=${n} => derived=${derivedList.length}`,
      codeLine: lines.splitPow2,
      selectedDerived: [],
    })
  );

  // 3. DP 数组初始化 (Line 16)
  steps.push(
    makeStep({
      status: 'split',
      message: `📊 初始化 DP 数组：分配 dp[0..${t}] 空间，初始最大美学价值为 0。`,
      log: `init: dp[0..${t}] = 0`,
      codeLine: lines.initDp,
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

function renderCherryTreeSvg(isChosen: boolean, isCur: boolean): string {
  const canopy1 = isChosen ? '#f472b6' : isCur ? '#38bdf8' : '#ec4899';
  const canopy2 = isChosen ? '#fb7185' : isCur ? '#60a5fa' : '#f43f5e';
  const canopy3 = isChosen ? '#fbcfe8' : isCur ? '#bae6fd' : '#f9a8d4';
  const glow = isChosen
    ? 'rgba(236,72,153,0.6)'
    : isCur
    ? 'rgba(56,189,248,0.6)'
    : 'rgba(0,0,0,0.25)';

  return `
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style="flex-shrink:0; filter: drop-shadow(0 2px 5px ${glow});">
      <!-- 樱花树干与粗壮根基 -->
      <path d="M22 36 C22 36, 23 27, 20 24 C19 22, 19 20, 24 20 C28 20, 27 23, 26 26 C25 29, 26 36, 26 36 Z" fill="#854d0e" />
      <path d="M19 36 C21 35, 27 35, 29 36" stroke="#451a03" stroke-width="2.5" stroke-linecap="round" />
      <path d="M24 24 C26 23, 29 21, 31 23" stroke="#713f12" stroke-width="1.8" stroke-linecap="round" />
      <!-- 繁茂樱花树冠群 -->
      <circle cx="17" cy="18" r="9" fill="${canopy1}" opacity="0.88" />
      <circle cx="30" cy="18" r="8.5" fill="${canopy2}" opacity="0.88" />
      <circle cx="23.5" cy="13" r="9.5" fill="${canopy3}" opacity="0.95" />
      <circle cx="23.5" cy="16.5" r="5" fill="#ffffff" opacity="0.32" />
      <!-- 飘落樱花瓣 -->
      <circle cx="35" cy="25" r="2" fill="#fbcfe8" opacity="0.9" />
      <circle cx="13" cy="27" r="1.6" fill="#fbcfe8" opacity="0.8" />
      <circle cx="31" cy="32" r="1.4" fill="#f472b6" opacity="0.75" />
    </svg>
  `;
}

export function renderCherryGardenCanvas(container: HTMLElement, step: any): void {
  const selected = step.selectedDerived || [];
  const usedTime = selected.reduce((s: number, it: any) => s + it.timeCost, 0);
  const totalVal = selected.reduce((s: number, it: any) => s + it.valEarned, 0);
  const ratio = Math.min(100, Math.round((usedTime / Math.max(1, step.totalTime)) * 100));

  const treesListHtml = (step.trees || [])
    .map((tree: any, idx: number) => {
      const isCur = idx === step.treeIndex;
      const tag = tree.type === 'unbounded' ? '♾️ 完全' : tree.type === 'zero-one' ? '🎯 01' : `📦 多重×${tree.cnt}`;
      const isChosen = selected.some((it: any) => it.treeIndex === idx);

      let bg = '#ffffff';
      let border = '#e2e8f0';
      let badge = '<span style="color:#64748b; background:#f1f5f9; padding:1px 5px; border-radius:3px; font-size:9px;">⚪ 待定</span>';

      if (isChosen) {
        bg = '#fdf2f8';
        border = '#ec4899';
        badge = '<span style="background:#db2777; color:#fff; font-size:9px; padding:1px 6px; border-radius:3px; font-weight:bold;">✔ 游览中</span>';
      } else if (isCur) {
        bg = '#f0f9ff';
        border = '#38bdf8';
        badge = '<span style="background:#0284c7; color:#fff; font-size:9px; padding:1px 6px; border-radius:3px; font-weight:bold;">🔍 决策中</span>';
      }

      return `
        <div style="background:${bg}; border:1.5px solid ${border}; border-radius:10px; padding:8px 10px; display:flex; gap:8px; align-items:center; box-shadow: 0 1px 2px rgba(0,0,0,0.04); transition:all 0.2s ease;">
          ${renderCherryTreeSvg(isChosen, isCur)}
          <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:3px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#0f172a;">树 #${idx + 1}</span>
              <span style="font-size:9px; background:#fdf2f8; color:#db2777; border:1px solid #fbcfe8; padding:1px 5px; border-radius:3px; font-weight:600;">${tag}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
              ${badge}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-top:2px;">
              <span style="color:#475569;">美学: <b style="color:#db2777;">+${tree.val}</b></span>
              <span style="color:#475569;">耗时: <b>${tree.cost}m</b></span>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const slotsHtml = selected.length > 0
    ? selected.map((it: any) => `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:12px;">🌸</span>
            <span style="color:#0f172a; font-weight:800; font-size:11px;">树 #${it.treeIndex + 1}</span>
            <span style="font-size:10px; color:#db2777; background:#fdf2f8; border:1px solid #fbcfe8; padding:1px 5px; border-radius:3px;">×${it.multiplier}</span>
          </div>
          <div style="display:flex; gap:10px; font-size:11px;">
            <span style="color:#64748b;">耗时:<b>${it.timeCost}m</b></span>
            <span style="color:#db2777; font-weight:700;">+${it.valEarned}</span>
          </div>
        </div>
      `).join('')
    : `<div style="color:#94a3b8; font-size:11px; text-align:center; padding:20px 0; border:1px dashed #cbd5e1; border-radius:8px;">(当前行程为空，等待状态转移决策...)</div>`;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1.35fr 1fr; gap:10px; width:100%; height:100%; box-sizing:border-box; padding:4px; min-height:0; overflow:hidden;">
      <!-- 左舱：樱花树林待选品类陈列 -->
      <div style="display:flex; flex-direction:column; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px; min-height:0; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
          <div style="font-size:11.5px; color:#0f172a; font-weight:800; display:flex; align-items:center; gap:5px;">
            <span>🌸</span> 樱花树林待选品类
          </div>
          <div style="font-size:10.5px; color:#0284c7; background:#e0f2fe; border:1px solid #bae6fd; padding:2px 6px; border-radius:4px; font-weight:600;">
            考察时间: <b>${step.j >= 0 ? step.j : '—'}</b> / ${step.totalTime}m
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:8px; overflow-y:auto; flex:1; align-content:start;">
          ${treesListHtml}
        </div>
      </div>

      <!-- 右舱：实时赏花行程舱与总收益仪表 -->
      <div style="display:flex; flex-direction:column; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px; min-height:0; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
          <span style="font-size:11.5px; font-weight:800; color:#0f172a;">🎒 实时赏花行程仓</span>
          <span style="font-size:10.5px; color:#64748b;">已用: <b style="color:#0284c7;">${usedTime}</b> / ${step.totalTime}m</span>
        </div>

        <!-- 时间占用刻度槽 -->
        <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
          <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #ec4899, #0284c7); transition:width 0.25s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:9.5px; color:#64748b;">
            <span>0m</span>
            <span>负载: ${ratio}%</span>
            <span>${step.totalTime}m</span>
          </div>
        </div>

        <!-- 已排行程插槽清单 -->
        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:10px; color:#64748b; font-weight:700;">已排入行程项 (${selected.length}):</div>
          ${slotsHtml}
        </div>

        <!-- 底部累计美学价值大卡 -->
        <div style="background:linear-gradient(135deg, #fdf2f8, #fce7f3); border:1.5px solid #f472b6; border-radius:10px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow: 0 1px 3px rgba(236,72,153,0.15);">
          <span style="font-size:11.5px; font-weight:800; color:#831843;">累计美学价值:</span>
          <span style="font-size:17px; font-weight:900; color:#be185d; font-family:monospace;">+${totalVal}</span>
        </div>
      </div>
    </div>
  `;
}

const { template, Visualizer } = createDeclarativeVisualizer<CherryBlossomViewingStep | any>({
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
    { id: 'input-t', label: 't:', type: 'number', defaultValue: 10, width: '42px' },
    { id: 'input-costs', label: 'costs:', type: 'text', defaultValue: '2, 3, 5', width: '70px' },
    { id: 'input-vals', label: 'vals:', type: 'text', defaultValue: '3, 4, 10', width: '70px' },
    { id: 'input-cnts', label: 'cnts:', type: 'text', defaultValue: '0, 2, 1', width: '70px' },
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
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^M) 爆搜',
      theme: 'bg-rose',
      badge: {
        mode: '衍生 01 背包 · 暴力递归',
        complexity: 'O(2^M) · O(M) 栈空间',
      },
      card1Title: '🌿 樱花衍生分治展开与调用栈',
      card2Title: '🌲 观赏樱花递归决策调用树',
      codeLanguages: CHERRY_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, derivedItems } = parseCherryDerivedItems(inputs);
        return buildBinarySplitRecursionSteps(t, derivedItems);
      },
      renderCanvas: (container, step) => {
        const infoHtml = `
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:10px 14px; display:flex; flex-direction:column; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#db2777;">
                ${step.i < step.n ? `正在决策衍生樱花树 #${step.i + 1}` : '所有衍生樱花决策完毕'}
              </span>
              <span style="font-size:11px; color:#0284c7; font-weight:600;">剩余时间: <b>${step.remCap}m</b></span>
            </div>
            <div style="font-size:11.5px; color:#0f172a; font-weight:700;">决策: <span style="color:#d97706;">${step.decision}</span></div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(container, {
          title: `dfsCherry(idx=${step.i}, remTime=${step.remCap})`,
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
      timeBadge: 'O(M · T)',
      theme: 'bg-blue',
      badge: {
        mode: '衍生 01 背包 · 记忆化搜索',
        complexity: 'O(M · T) · O(M · T) 备忘录',
      },
      card1Title: '💾 观赏樱花备忘录探查 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[idx][remTime]',
      codeLanguages: CHERRY_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, derivedItems } = parseCherryDerivedItems(inputs);
        return buildBinarySplitMemoSteps(t, derivedItems);
      },
      renderCanvas: (container, step) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfsCherryMemo(idx=${step.i}, remTime=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecialMemoCard2(container, {
          title: '观赏樱花备忘录 memo[idx][remTime]',
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
      timeBadge: 'O(M · T)',
      theme: 'bg-emerald',
      badge: {
        mode: '衍生 01 背包 · 严格二维 DP',
        complexity: 'O(M · T) · O(M · T)',
      },
      card1Title: '📐 观赏樱花转移决策推导',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      codeLanguages: CHERRY_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, derivedItems } = parseCherryDerivedItems(inputs);
        return buildBinarySplit2DSteps(t, derivedItems);
      },
      renderCanvas: (container, step) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable?.[step.curI]?.[step.curJ] ?? 0}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step) =>
        renderSpecial2DCard2(container, {
          title: '严格二维状态表 dp[i][j] (i 对应衍生樱花树)',
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
      timeBadge: 'O(T) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '混合背包 · 统一二进制拆分 + 01 空间压缩',
        complexity: 'O(T · Σlog c) · O(T)',
      },
      card1Title: '🌸 樱花树林图谱与实时赏花行程仓',
      card2Title: '📈 赏花美学价值向量 dp[0..T]',
      codeLanguages: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].codeLanguages,
      buildSteps: buildCherryBlossomViewingSteps,
      renderCanvas: (container, step) => renderCherryGardenCanvas(container, step),
      renderCustomMetrics: (container, step) => {
        renderKnapsackDpMatrix(container, {
          ...step,
          items: [],
          currentGroupItems: [],
          selectedItems: [],
          groupIndex: -1,
          itemIndex: step.treeIndex,
          totalCapacity: step.totalTime,
        }, `DP 时间收益矩阵 dp[0..${step.totalTime}]`);
      },
    },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].analysisHtml,
  buildSteps: buildCherryBlossomViewingSteps,
  renderCanvas: (container, step) => renderCherryGardenCanvas(container, step),
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
      itemIndex: step.treeIndex,
      totalCapacity: step.totalTime,
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
