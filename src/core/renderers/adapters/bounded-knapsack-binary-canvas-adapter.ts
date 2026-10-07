/**
 * 多重背包二进制拆分 (洛谷 P1776 宝物筛选 / 左程云 Class 075 Code02)
 * Canvas Adapter: 二进制拆分衍生包货架与实时背包载荷舱
 */

import { renderKnapsackDpMatrix } from '../knapsack-sandbox-stage';
import {
  BINARY_SPLIT_STAGE1_CODE_LANGUAGES,
  BINARY_SPLIT_STAGE2_CODE_LANGUAGES,
  BINARY_SPLIT_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-stage-codes';
import { KNAPSACK_075_PROBLEMS } from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-problem-content';
import {
  buildBinarySplitRecursionSteps,
  buildBinarySplitMemoSteps,
  buildBinarySplit2DSteps,
} from '../../../algorithms/categories/dynamic-programming/knapsack-075/bounded-knapsack-stage-evolution';
import {
  renderSpecialRecursionCard1,
  renderSpecialMemoCard1,
  renderSpecialMemoCard2,
  renderSpecial2DCard1,
  renderSpecial2DCard2,
} from '../special-stage-cards';
import { RecursionTreeAdapter } from '../recursion-tree-adapter';
import {
  buildBoundedKnapsackBinarySteps,
  parseBinarySplitInputs,
  type BoundedKnapsackBinaryStep,
} from './bounded-knapsack-binary-step-compiler';

export function renderBinarySplitSandbox(container: HTMLElement, step: BoundedKnapsackBinaryStep): void {
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
            <span style="font-size:10.5px; color:#374151; font-weight:700;">#${idx + 1} (源#${item.origIndex + 1}×${item.multiplier})</span>
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
            <span>已选重量: <b style="color:#38bdf8;">${usedWeight}</b> / ${step.totalCapacity}</span>
            <span>当前价值: <b style="color:#10b981;">+${totalVal}</b></span>
          </div>
        </div>

        <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
          <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); transition:width 0.25s ease;"></div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
          <span style="color:#64748b; font-size:10.5px; min-width:80px;">已装载衍生包:</span>
          ${tagsHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderBinarySplitVectorMatrix(container: HTMLElement, step: BoundedKnapsackBinaryStep): void {
  renderKnapsackDpMatrix(container, {
    ...step,
    items: [],
    currentGroupItems: [],
    selectedItems: [],
    groupIndex: -1,
  }, `01 状态向量 dp[0..${step.totalCapacity}]`);
}

export function createBoundedBinaryStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^M)',
      theme: 'bg-blue',
      badge: {
        mode: '衍生 01 背包 · 暴力搜索',
        complexity: 'O(2^M) · O(M) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '🌲 二进制衍生包 01 递归决策树',
      codeLanguages: BINARY_SPLIT_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, derivedItems } = parseBinarySplitInputs(inputs);
        return buildBinarySplitRecursionSteps(t, derivedItems);
      },
      renderCanvas: (container: HTMLElement, step: any) => {
        const infoHtml = `
          <div style="background:rgba(15, 23, 42, 0.7); border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:12px; font-weight:700; color:#38bdf8;">
                ${step.i < step.m ? `正在决策衍生包 #${step.i + 1} (源#${step.derivedItems[step.i].origIndex + 1}×${step.derivedItems[step.i].multiplier}, 重:${step.derivedItems[step.i].weight}, 价:${step.derivedItems[step.i].val})` : '所有衍生包决策完成'}
              </span>
              <span style="font-size:11px; color:#38bdf8;">剩余容量: <b>${step.remCap}</b></span>
            </div>
            <div style="font-size:11px; color:#374151;">决策: <b style="color:#f59e0b;">${step.decision}</b></div>
            <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
          </div>
        `;
        renderSpecialRecursionCard1(container, {
          title: `dfs(idx=${step.i}, remCap=${step.remCap})`,
          callStack: step.callStack || [],
          customInfoHtml: infoHtml,
        });
      },
      renderCustomMetrics: (container: HTMLElement, step: any) => {
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
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfsMemo(idx=${step.i}, remCap=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
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
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable?.[step.curI]?.[step.curJ] ?? 0}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
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
      buildSteps: (inputs: Record<string, any>) => buildBoundedKnapsackBinarySteps(inputs),
      renderCanvas: (container: HTMLElement, step: BoundedKnapsackBinaryStep) => renderBinarySplitSandbox(container, step),
      renderCustomMetrics: (container: HTMLElement, step: BoundedKnapsackBinaryStep) => renderBinarySplitVectorMatrix(container, step),
    },
  ];
}
