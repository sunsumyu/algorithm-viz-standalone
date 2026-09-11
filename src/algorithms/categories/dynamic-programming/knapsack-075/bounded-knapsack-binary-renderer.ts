/**
 * 多重背包二进制拆分 (洛谷 P1776 宝物筛选) - 声明式 4-Card 沙盘渲染器
 * 核心：多重背包按二进制 1, 2, 4, 8... 位权拆分为独立衍生 01 包，随后执行 01 空间压缩
 * 架构重构：引入四语言代码高亮映射、装载回溯与双层沙盘
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import { HighlightTarget } from '../../../../core/code-panel';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';
import {
  BINARY_SPLIT_STAGE1_CODE_LANGUAGES,
  BINARY_SPLIT_STAGE2_CODE_LANGUAGES,
  BINARY_SPLIT_STAGE3_CODE_LANGUAGES,
} from './knapsack-075-stage-codes';
import {
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

export interface DerivedItem {
  origIndex: number;
  multiplier: number;
  val: number;
  weight: number;
}

export interface BoundedKnapsackBinaryStep {
  curDerivedIndex: number;
  derivedItems: DerivedItem[];
  j: number;
  dp: number[];
  maxVal: number;
  totalCapacity: number;
  status: 'split' | 'dp-item' | 'check' | 'update' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  selectedDerived: DerivedItem[];
  metrics?: Record<string, any>;
}

export function parseBinarySplitInputs(inputs: Record<string, any>) {
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
  const derivedItems: DerivedItem[] = [];

  // 1. 二进制拆分阶段
  for (let i = 0; i < n; i++) {
    let cnt = cList[i];
    const val = vList[i];
    const weight = wList[i];

    for (let k = 1; k <= cnt; k <<= 1) {
      derivedItems.push({
        origIndex: i,
        multiplier: k,
        val: k * val,
        weight: k * weight,
      });
      cnt -= k;
    }
    if (cnt > 0) {
      derivedItems.push({
        origIndex: i,
        multiplier: cnt,
        val: cnt * val,
        weight: cnt * weight,
      });
    }
  }

  return { t, vList, wList, cList, n, derivedItems };
}

export function buildBoundedKnapsackBinarySteps(inputs: Record<string, any>): BoundedKnapsackBinaryStep[] {
  const { t, vList, wList, cList, n } = parseBinarySplitInputs(inputs);
  const derivedItems: DerivedItem[] = [];
  const steps: BoundedKnapsackBinaryStep[] = [];

  const lines = {
    entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
    splitTreeLoop: { java: 6, cpp: 4, python: 4, javascript: 4 },
    splitPow2: { java: 8, cpp: 6, python: 7, javascript: 6 },
    splitRemainder: { java: 12, cpp: 10, python: 11, javascript: 10 },
    initDp: { java: 16, cpp: 14, python: 13, javascript: 14 },
    derivedLoop: { java: 17, cpp: 15, python: 14, javascript: 15 },
    capLoop: { java: 18, cpp: 16, python: 15, javascript: 16 },
    updateDp: { java: 19, cpp: 17, python: 16, javascript: 17 },
    returnAns: { java: 22, cpp: 20, python: 17, javascript: 20 },
  };

  const dp = new Array(t + 1).fill(0);
  let bestDerivedForCapacity: DerivedItem[][] = Array.from({ length: t + 1 }, () => []);

  const makeStep = (data: Partial<BoundedKnapsackBinaryStep> & {
    status: BoundedKnapsackBinaryStep['status'];
    message: string;
    log: string;
  }): BoundedKnapsackBinaryStep => {
    const dIdx = data.curDerivedIndex ?? -1;
    const jVal = data.j ?? -1;
    return {
      curDerivedIndex: dIdx,
      derivedItems: [...derivedItems],
      j: jVal,
      dp: [...dp],
      maxVal: dp[t],
      totalCapacity: t,
      status: data.status,
      message: data.message,
      log: data.log,
      codeLine: data.codeLine,
      selectedDerived: data.selectedDerived ? [...data.selectedDerived] : [...(bestDerivedForCapacity[t] || [])],
      metrics: {
        'metric-orig-n': `${n} 种`,
        'metric-derived-m': `${derivedItems.length} 个`,
        'metric-cur-derived': dIdx >= 0 ? `#${dIdx + 1}` : '—',
        'metric-max-val': `${dp[t]}`,
      },
    };
  };

  // 1. 函数入口
  steps.push(
    makeStep({
      status: 'split',
      message: `🏁 多重背包二进制拆分开始：进入 computeBinary 函数，背包容量 t=${t}，共有 ${n} 种宝物。`,
      log: `init: t=${t}, n=${n}`,
      codeLine: lines.entry,
      selectedDerived: [],
    })
  );

  // 2. 逐件宝物二进制拆分 (遍历第 6~15 行)
  for (let i = 0; i < n; i++) {
    let cnt = cList[i];
    const val = vList[i];
    const weight = wList[i];

    // 2.1 循环进入宝物 i (Line 6)
    steps.push(
      makeStep({
        status: 'split',
        message: `📦 考察宝物 #${i + 1}：单件价值 ${val}，重量 ${weight}，共有数量 ${cnt} 件。`,
        log: `split loop: item #${i + 1}, cnt=${cnt}`,
        codeLine: lines.splitTreeLoop,
        selectedDerived: [],
      })
    );

    // 2.2 二进制拆分 (Line 8~11)
    for (let k = 1; k <= cnt; k <<= 1) {
      derivedItems.push({
        origIndex: i,
        multiplier: k,
        val: k * val,
        weight: k * weight,
      });

      steps.push(
        makeStep({
          curDerivedIndex: derivedItems.length - 1,
          status: 'split',
          message: `✂️ 二进制位权拆分：按位权 2^p = ${k} 打包生成衍生包 #${derivedItems.length}（×${k} 件，重量 ${k * weight}，价值 ${k * val}），剩余可用数量 ${cnt - k}。`,
          log: `split pack #${derivedItems.length}: item #${i + 1} x${k}`,
          codeLine: lines.splitPow2,
          selectedDerived: [],
        })
      );

      cnt -= k;
    }

    // 2.3 补齐余数碎片 (Line 12~14)
    if (cnt > 0) {
      derivedItems.push({
        origIndex: i,
        multiplier: cnt,
        val: cnt * val,
        weight: cnt * weight,
      });

      steps.push(
        makeStep({
          curDerivedIndex: derivedItems.length - 1,
          status: 'split',
          message: `🧩 补齐余数碎片：宝物 #${i + 1} 剩余数量 ${cnt} 打包为衍生包 #${derivedItems.length}（×${cnt} 件，重量 ${cnt * weight}，价值 ${cnt * val}）！`,
          log: `split remainder #${derivedItems.length}: item #${i + 1} x${cnt}`,
          codeLine: lines.splitRemainder,
          selectedDerived: [],
        })
      );
    }
  }

  // 2.4 拆分总结
  steps.push(
    makeStep({
      status: 'split',
      message: `✂️ 二进制拆分完毕！原始 ${n} 种多重宝物成功拆分为 ${derivedItems.length} 个独立 01 衍生包，转化为标准 01 背包！`,
      log: `split: orig_n=${n} => derived_m=${derivedItems.length}`,
      codeLine: lines.splitPow2,
      selectedDerived: [],
    })
  );

  // 3. DP 数组初始化 (Line 16)
  steps.push(
    makeStep({
      status: 'split',
      message: `📊 初始化 DP 数组：分配 dp[0..${t}] 空间，初始最大价值为 0。`,
      log: `init: dp[0..${t}] = 0`,
      codeLine: lines.initDp,
      selectedDerived: [],
    })
  );

  if (derivedItems.length === 0 || t === 0) {
    steps.push(
      makeStep({
        j: 0,
        status: 'done',
        message: '🏁 容量为 0 或无可拆选宝物，最大价值为 0。',
        log: 'done: ans=0',
        codeLine: lines.returnAns,
        selectedDerived: [],
      })
    );
    return steps;
  }

  // 2. 01 背包空间压缩推进
  for (let idx = 0; idx < derivedItems.length; idx++) {
    const item = derivedItems[idx];

    steps.push(
      makeStep({
        curDerivedIndex: idx,
        status: 'dp-item',
        message: `📦 考察衍生包 #${idx + 1} (源自宝物 #${item.origIndex + 1} × ${item.multiplier})：价值=${item.val}，重量=${item.weight}。`,
        log: `derived #${idx + 1}: val=${item.val}, weight=${item.weight}`,
        codeLine: lines.derivedLoop,
      })
    );

    const nextBest = bestDerivedForCapacity.map((list) => [...list]);

    for (let j = t; j >= item.weight; j--) {
      steps.push(
        makeStep({
          curDerivedIndex: idx,
          j,
          status: 'check',
          message: `⏳ 倒序枚举容量：当前容量 j=${j} >= 重量 ${item.weight}，准备试算。`,
          log: `cap loop: j=${j}`,
          codeLine: lines.capLoop,
        })
      );

      const candidate = dp[j - item.weight] + item.val;
      const updated = candidate > dp[j];
      if (updated) {
        dp[j] = candidate;
        nextBest[j] = [...bestDerivedForCapacity[j - item.weight], item];
      }

      steps.push(
        makeStep({
          curDerivedIndex: idx,
          j,
          status: updated ? 'update' : 'check',
          selectedDerived: [...(nextBest[t] || [])],
          message: updated
            ? `✨ 状态转移：放入衍生包 #${idx + 1} 刷新最高价值 dp[${j}]=${dp[j]}！`
            : `⏸️ 状态保持：放入衍生包后价值 ${candidate} <= 原价值 ${dp[j]}，保持原值。`,
          log: `dp[${j}] = Math.max(${dp[j]}, ${candidate}) => ${dp[j]}`,
          codeLine: lines.updateDp,
        })
      );
    }

    bestDerivedForCapacity = nextBest;
  }

  steps.push(
    makeStep({
      j: t,
      status: 'done',
      message: `🎉 01 背包求解完成！通过二进制拆分求得最大总收益为 ${dp[t]}！`,
      log: `done: ans=${dp[t]}`,
      codeLine: lines.returnAns,
      selectedDerived: [...(bestDerivedForCapacity[t] || [])],
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BoundedKnapsackBinaryStep>({
  id: 'bounded-knapsack-binary',
  name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 二进制转01',
    complexity: 'O(W · Σlog c) · O(W)',
  },
  card1Title: '✂️ 衍生商品货架与实时背包载荷舱',
  card2Title: '📈 01 背包空间压缩 DP 向量',
  card2Desc: '展示将多重背包按二进制位权拆分后，转化为标准 01 背包的倒序填表过程',
  legend: [
    { label: '未装入衍生包', color: '#475569' },
    { label: '已入选背包衍生包', color: '#10b981' },
    { label: '当前考察衍生包', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-t', label: '容量 t:', type: 'number', defaultValue: 15, width: '55px' },
    { id: 'input-v', label: '价值 v:', type: 'text', defaultValue: '3, 4, 7, 8', width: '110px' },
    { id: 'input-w', label: '重量 w:', type: 'text', defaultValue: '2, 3, 5, 6', width: '110px' },
    { id: 'input-c', label: '数量 c:', type: 'text', defaultValue: '2, 3, 2, 2', width: '110px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=15, 4种拆为8衍生包, Ans=21)',
      values: { 'input-t': 15, 'input-v': '3, 4, 7, 8', 'input-w': '2, 3, 5, 6', 'input-c': '2, 3, 2, 2' },
    },
    {
      label: '大量拆分案例 (t=25, 单宝物c=7拆为1+2+4, Ans=28)',
      values: { 'input-t': 25, 'input-v': '4, 6', 'input-w': '3, 5', 'input-c': '7, 4' },
    },
  ],
  metrics: [
    { id: 'metric-orig-n', label: '原始宝物品类', color: '#94a3b8' },
    { id: 'metric-derived-m', label: '衍生 01 包件数', color: '#8b5cf6' },
    { id: 'metric-cur-derived', label: '当前考察衍生包', color: '#f59e0b' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^M)',
      theme: 'bg-blue',
      badge: {
        mode: '衍生 01 背包 · 暴力递归',
        complexity: 'O(2^M) · O(M) 栈深',
      },
      card1Title: '🌿 衍生 01 包分治展开与调用栈',
      card2Title: '🌲 衍生 01 背包递归决策调用树',
      codeLanguages: BINARY_SPLIT_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, derivedItems } = parseBinarySplitInputs(inputs);
        return buildBinarySplitRecursionSteps(t, derivedItems);
      },
      renderCanvas: (container, step: any) => {
        const infoHtml = `
          <div style="background:rgba(15, 23, 42, 0.7); border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#38bdf8;">
                ${step.i < step.n ? `正在决策衍生包 #${step.i + 1} (权:${step.derivedItems?.[step.i]?.multiplier ?? '1'}, 重:${step.derivedItems?.[step.i]?.weight ?? '—'}, 价:${step.derivedItems?.[step.i]?.val ?? '—'})` : '所有衍生包决策完成'}
              </span>
              <span style="font-size:11px; color:#38bdf8;">剩余容量: <b>${step.remCap}</b></span>
            </div>
            <div style="font-size:11px; color:#374151;">决策: <b style="color:#f59e0b;">${step.decision}</b></div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(container, {
          title: `dfsBinary(idx=${step.i}, remCap=${step.remCap})`,
          callStack: step.callStack || [],
          customInfoHtml: infoHtml,
        });
      },
      renderCustomMetrics: (container, step: any) => {
        RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(M · W)',
      theme: 'bg-blue',
      badge: {
        mode: '衍生 01 背包 · 记忆化搜索',
        complexity: 'O(M · W) · O(M · W) 备忘录',
      },
      card1Title: '💾 衍生 01 包备忘录探查 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[idx][remCap]',
      codeLanguages: BINARY_SPLIT_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, derivedItems } = parseBinarySplitInputs(inputs);
        return buildBinarySplitMemoSteps(t, derivedItems);
      },
      renderCanvas: (container, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfsMemo(idx=${step.i}, remCap=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step: any) =>
        renderSpecialMemoCard2(container, {
          title: '衍生 01 背包备忘录 memo[idx][remCap]',
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
      timeBadge: 'O(M · W)',
      theme: 'bg-emerald',
      badge: {
        mode: '衍生 01 背包 · 严格二维 DP',
        complexity: 'O(M · W) · O(M · W)',
      },
      card1Title: '📐 01 衍生包转移决策推导',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      codeLanguages: BINARY_SPLIT_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, derivedItems } = parseBinarySplitInputs(inputs);
        return buildBinarySplit2DSteps(t, derivedItems);
      },
      renderCanvas: (container, step: any) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable?.[step.curI]?.[step.curJ] ?? 0}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container, step: any) =>
        renderSpecial2DCard2(container, {
          title: '严格二维状态表 dp[i][j] (i 对应衍生包序号)',
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
        mode: '多重背包 · 二进制拆分 + 01 空间压缩',
        complexity: 'O(W · Σlog c) · O(W)',
      },
      card1Title: '✂️ 二进制拆分衍生包货架与实时背包载荷舱',
      card2Title: '📈 01 背包空间压缩向量 dp[j] 监视器',
      codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].codeLanguages,
      buildSteps: buildBoundedKnapsackBinarySteps,
      renderCanvas: (container, step) => {
        const selected = step.selectedDerived || [];
        const usedWeight = selected.reduce((s: any, it: any) => s + it.weight, 0);
        const totalVal = selected.reduce((s: any, it: any) => s + it.val, 0);
        const ratio = Math.min(100, Math.round((usedWeight / Math.max(1, step.totalCapacity)) * 100));

        const derivedCards = step.derivedItems
          .map((item: any, idx: number) => {
            const isCur = idx === step.curDerivedIndex;
            const isChosen = selected.some((it: any) => it === item);

            let bg = 'rgba(241, 245, 249, 0.9)';
            let border = '#334155';
            let badge = '<span style="color:#64748b; font-size:9px;">备选包</span>';

            if (isChosen) {
              bg = 'rgba(209, 250, 229, 0.9)';
              border = '#10b981';
              badge = '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 已装入</span>';
            } else if (isCur) {
              bg = 'rgba(30, 58, 138, 0.5)';
              border = '#38bdf8';
              badge = '<span style="background:#2563eb; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>';
            }

            return `
              <div style="background:${bg}; border:1.5px solid ${border}; border-radius:6px; padding:6px 10px; min-width:115px; display:flex; flex-direction:column; gap:3px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:10.5px; color:#c7d2fe; font-weight:700;">#${idx + 1} (源#${item.origIndex + 1}×${item.multiplier})</span>
                  ${badge}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
                  <span style="color:#374151;">价值: <b style="color:#10b981;">+${item.val}</b></span>
                  <span style="color:#374151;">重量: <b style="color:#38bdf8;">${item.weight}</b></span>
                </div>
              </div>
            `;
          })
          .join('');

        const tagsHtml = selected.length > 0
          ? selected.map((it: any, idx: number) => `
              <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
                <span style="color:#a7f3d0; font-weight:700;">衍生包 #${idx + 1} (源#${it.origIndex + 1}×${it.multiplier})</span>
                <span style="color:#374151;">重:${it.weight}</span>
                <span style="color:#34d399; font-weight:800;">价值:+${it.val}</span>
              </div>
            `).join('')
          : `<span style="color:#64748b; font-size:11px;">(背包当前为空，等待 01 背包装入衍生包...)</span>`;

        container.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
              <div style="font-size:12px; color:#64748b; font-weight:700;">✂️ 二进制拆分衍生包货架 (位权 1, 2, 4... 无漏覆盖)</div>
              <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
                当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
              </div>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
              ${derivedCards}
            </div>

            <!-- 底部实时背包载荷舱 -->
            <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11.5px; font-weight:800; color:#374151;">🎒 实时背包载荷舱</span>
                <div style="display:flex; gap:16px; font-size:11px;">
                  <span>已占重量: <b style="color:#38bdf8;">${usedWeight}</b> / ${step.totalCapacity}</span>
                  <span>背包累计价值: <b style="color:#10b981;">${totalVal}</b></span>
                </div>
              </div>

              <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
                <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #8b5cf6, #10b981); transition:width 0.25s ease;"></div>
              </div>

              <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
                <span style="color:#64748b; font-size:10.5px; min-width:60px;">已装入衍生包:</span>
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
          itemIndex: step.curDerivedIndex,
        }, `01 背包空间压缩向量 dp[0..${step.totalCapacity}]`);
      },
    },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].analysisHtml,
  buildSteps: buildBoundedKnapsackBinarySteps,
  renderCanvas: (container, step) => {
    const selected = step.selectedDerived || [];
    const usedWeight = selected.reduce((s, it) => s + it.weight, 0);
    const totalVal = selected.reduce((s, it) => s + it.val, 0);
    const ratio = Math.min(100, Math.round((usedWeight / Math.max(1, step.totalCapacity)) * 100));

    const derivedCards = step.derivedItems
      .map((item, idx) => {
        const isCur = idx === step.curDerivedIndex;
        const isChosen = selected.some((it) => it === item);

        let bg = 'rgba(241, 245, 249, 0.9)';
        let border = '#334155';
        let badge = '<span style="color:#64748b; font-size:9px;">备选包</span>';

        if (isChosen) {
          bg = 'rgba(209, 250, 229, 0.9)';
          border = '#10b981';
          badge = '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 已装入</span>';
        } else if (isCur) {
          bg = 'rgba(30, 58, 138, 0.5)';
          border = '#38bdf8';
          badge = '<span style="background:#2563eb; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>';
        }

        return `
          <div style="background:${bg}; border:1.5px solid ${border}; border-radius:6px; padding:6px 10px; min-width:115px; display:flex; flex-direction:column; gap:3px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:10.5px; color:#c7d2fe; font-weight:700;">#${idx + 1} (源#${item.origIndex + 1}×${item.multiplier})</span>
              ${badge}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
              <span style="color:#374151;">价值: <b style="color:#10b981;">+${item.val}</b></span>
              <span style="color:#374151;">重量: <b style="color:#38bdf8;">${item.weight}</b></span>
            </div>
          </div>
        `;
      })
      .join('');

    const tagsHtml = selected.length > 0
      ? selected.map((it, idx) => `
          <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:2px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
            <span style="color:#a7f3d0; font-weight:700;">衍生包 #${idx + 1} (源#${it.origIndex + 1}×${it.multiplier})</span>
            <span style="color:#374151;">重:${it.weight}</span>
            <span style="color:#34d399; font-weight:800;">价值:+${it.val}</span>
          </div>
        `).join('')
      : `<span style="color:#64748b; font-size:11px;">(背包当前为空，等待 01 背包装入衍生包...)</span>`;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
          <div style="font-size:12px; color:#64748b; font-weight:700;">✂️ 二进制拆分衍生包货架 (位权 1, 2, 4... 无漏覆盖)</div>
          <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
            当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          ${derivedCards}
        </div>

        <!-- 底部实时背包载荷舱 -->
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11.5px; font-weight:800; color:#374151;">🎒 实时背包载荷舱</span>
            <div style="display:flex; gap:16px; font-size:11px;">
              <span>已占重量: <b style="color:#38bdf8;">${usedWeight}</b> / ${step.totalCapacity}</span>
              <span>背包累计价值: <b style="color:#10b981;">${totalVal}</b></span>
            </div>
          </div>

          <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
            <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #8b5cf6, #10b981); transition:width 0.25s ease;"></div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
            <span style="color:#64748b; font-size:10.5px; min-width:60px;">已装入衍生包:</span>
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
      itemIndex: step.curDerivedIndex,
    }, `01 背包空间压缩向量 dp[0..${step.totalCapacity}]`);
  },
});

export const BoundedKnapsackBinaryVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-binary',
  name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
  viewId: 'algo-bounded-knapsack-binary-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code02：洛谷 P1776 宝物筛选，将多重背包物品按二进制位权拆解转化为 01 背包的标准模版',
  icon: '✂️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 91,
  learningGoal: '掌握任意整数的二进制区间无缝覆盖定理、衍生小包生成算法与多重背包的最常用解法',
});
