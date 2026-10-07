/**
 * 多重背包朴素枚举 (洛谷 P1776 宝物筛选 / 左程云 Class 075 Code01)
 * Canvas Adapter: 宝物库品类陈列与实时背包载荷舱
 */

import { renderKnapsackDpMatrix } from '../knapsack-sandbox-stage';
import {
  BOUNDED_NAIVE_STAGE1_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE2_CODE_LANGUAGES,
  BOUNDED_NAIVE_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-stage-codes';
import { KNAPSACK_075_PROBLEMS } from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-problem-content';
import {
  buildBoundedNaiveRecursionSteps,
  buildBoundedNaiveMemoSteps,
  buildBoundedNaive2DSteps,
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
  buildBoundedKnapsackNaiveSteps,
  parseNaiveInputs,
  type BoundedKnapsackNaiveStep,
} from './bounded-knapsack-naive-step-compiler';

export function renderBoundedNaiveSandbox(container: HTMLElement, step: BoundedKnapsackNaiveStep): void {
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
}

export function renderBoundedNaiveVectorMatrix(container: HTMLElement, step: BoundedKnapsackNaiveStep): void {
  renderKnapsackDpMatrix(container, {
    ...step,
    items: [],
    currentGroupItems: [],
    selectedItems: [],
    groupIndex: -1,
  }, `动态规划收益向量 dp[0..${step.totalCapacity}]`);
}

export function createBoundedNaiveStages() {
  return [
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
      renderCanvas: (container: HTMLElement, step: any) => {
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
      renderCustomMetrics: (container: HTMLElement, step: any) => {
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
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfsMemo(i=${step.i}, remCap=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
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
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecial2DCard1(container, {
          cellName: `dp[${step.curI}][${step.curJ}]`,
          cellValStr: `${step.dpTable[step.curI]?.[step.curJ] ?? 0}`,
          depCells: step.depCells || [],
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
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
      buildSteps: (inputs: Record<string, any>) => buildBoundedKnapsackNaiveSteps(inputs),
      renderCanvas: (container: HTMLElement, step: BoundedKnapsackNaiveStep) => renderBoundedNaiveSandbox(container, step),
      renderCustomMetrics: (container: HTMLElement, step: BoundedKnapsackNaiveStep) => renderBoundedNaiveVectorMatrix(container, step),
    },
  ];
}
