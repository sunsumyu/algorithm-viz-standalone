/**
 * 多重背包单调队列优化 (洛谷 P1776 极速最优解 / 左程云 Class 075 Code03)
 * Canvas Adapter: 同余链划分与双端单调队列滑动窗口沙盘
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
  buildBoundedKnapsackMonoQueueSteps,
  parseMonoQueueInputs,
  type BoundedKnapsackMonoQueueStep,
} from './bounded-knapsack-monotonic-queue-step-compiler';

export function renderMonoQueueSandbox(container: HTMLElement, step: BoundedKnapsackMonoQueueStep): void {
  const queueHtml = step.queue.length > 0
    ? step.queue
        .map((pos: any, idx: number) => {
          const isHead = idx === 0;
          const mVal = step.queueMetrics[idx];
          return `
            <div style="background:${isHead ? '#166534' : '#1e293b'}; border:1.5px solid ${
            isHead ? '#22c55e' : '#475569'
          }; border-radius:6px; padding:6px 10px; text-align:center; min-width:75px;">
              <div style="font-size:10.5px; color:${isHead ? '#4ade80' : '#94a3b8'}; font-weight:700;">${isHead ? '👑 队头' : `#${idx + 1}`} pos=${pos}</div>
              <div style="font-size:11.5px; color:#1e293b; margin-top:2px;">指标: <b>${mVal}</b></div>
            </div>
          `;
        })
        .join('<span style="color:#64748b; font-size:14px; align-self:center;">←</span>')
    : '<span style="color:#64748b; font-size:11px;">(队列为空)</span>';

  const itemsHtml = step.vList
    .map((val: any, idx: number) => {
      const isCur = idx === step.itemIndex;
      const w = step.wList[idx];
      const c = step.cList[idx];
      return `
        <div style="background:${isCur ? 'rgba(30, 27, 75, 0.7)' : 'rgba(241, 245, 249, 0.9)'}; border:1.5px solid ${
        isCur ? '#818cf8' : '#334155'
      }; border-radius:6px; padding:6px 10px; min-width:110px; display:flex; flex-direction:column; gap:2px;">
          <div style="font-size:11px; font-weight:700; color:${isCur ? '#818cf8' : '#cbd5e1'};">宝物 #${idx + 1}</div>
          <div style="display:flex; justify-content:space-between; font-size:10.5px;">
            <span style="color:#64748b;">单重: <b style="color:#38bdf8;">${w}</b></span>
            <span style="color:#64748b;">价值: <b style="color:#10b981;">${val}</b></span>
          </div>
          <div style="font-size:9.5px; color:#64748b;">数量: ${c} 件</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#64748b; font-weight:700;">⚡ 单调队列优化沙盘 (同余分组 mod=${step.mod >= 0 ? step.mod : '—'})</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.totalCapacity}
        </div>
      </div>

      <!-- 宝物属性列表 -->
      <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
        ${itemsHtml}
      </div>

      <!-- 双端单调队列滑动窗口 -->
      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#374151;">🪟 双端单调队列滑动窗口 (维持 val(q)=dp[q]-(q/w)*v 单调递减)</span>
          <span style="font-size:11px; color:#38bdf8;">队头始终为滑窗最大值</span>
        </div>

        <div style="display:flex; gap:8px; overflow-x:auto; background:#f1f5f9; padding:8px; border-radius:6px; align-items:center; min-height:48px;">
          ${queueHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderMonoQueueVectorMatrix(container: HTMLElement, step: BoundedKnapsackMonoQueueStep): void {
  renderKnapsackDpMatrix(container, {
    ...step,
    items: [],
    currentGroupItems: [],
    selectedItems: [],
    groupIndex: -1,
  }, `动态规划收益向量 dp[0..${step.totalCapacity}]`);
}

export function createBoundedMonoQueueStages() {
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
        const { t, vList, wList, cList } = parseMonoQueueInputs(inputs);
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
        const { t, vList, wList, cList } = parseMonoQueueInputs(inputs);
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
        const { t, vList, wList, cList } = parseMonoQueueInputs(inputs);
        return buildBoundedNaive2DSteps(t, vList, wList, cList);
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
          title: '严格二维状态表 dp[i][j]',
          dp: step.dpTable,
          curI: step.curI,
          curJ: step.curJ,
          depCells: (step.depCells || []).map((d: any) => ({ r: d.r, c: d.c })),
        }),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 单调队列优化',
      shortName: '单调队列',
      num: 4,
      timeBadge: 'O(NW) 终极极限',
      theme: 'bg-amber',
      badge: {
        mode: '多重背包 · 同余分组 + 单调队列 O(NW)',
        complexity: 'O(N · W) · O(W)',
      },
      card1Title: '⚡ 同余链划分与双端单调队列滑动窗口',
      card2Title: '📈 动态规划收益向量 dp[0..W] (滑窗高亮)',
      codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].codeLanguages,
      buildSteps: (inputs: Record<string, any>) => buildBoundedKnapsackMonoQueueSteps(inputs),
      renderCanvas: (container: HTMLElement, step: BoundedKnapsackMonoQueueStep) => renderMonoQueueSandbox(container, step),
      renderCustomMetrics: (container: HTMLElement, step: BoundedKnapsackMonoQueueStep) => renderMonoQueueVectorMatrix(container, step),
    },
  ];
}
