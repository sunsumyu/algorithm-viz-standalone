/**
 * 目标和 (LeetCode 494 / 左程云 Class 073 Code03)
 * Canvas Adapter: 待分配符号列表、代数归约公式仓与 dp 方案数向量面板
 */

import { renderSpecialRecursionCard1, renderSpecialMemoCard1, renderSpecialMemoCard2, renderSpecial2DCard2 } from '../special-stage-cards';
import { renderKnapsackDpMatrix } from '../knapsack-sandbox-stage';
import {
  type TargetSumStep,
  parseTargetSumInputs,
  buildTargetSumSteps,
} from './target-sum-step-compiler';
import {
  buildTargetSumRecursionSteps,
  buildTargetSumMemoSteps,
  buildTargetSum2DSteps,
} from '../../../algorithms/categories/dynamic-programming/knapsack-073/target-sum-stage-evolution';
import {
  TARGET_SUM_STAGE1_CODE_LANGUAGES,
  TARGET_SUM_STAGE2_CODE_LANGUAGES,
  TARGET_SUM_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-073-templates';
import { TARGET_SUM_CODE_LANGUAGES } from '../../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-073-problem-content';

export function renderTargetSumBoard(container: HTMLElement, step: TargetSumStep): void {
  const numBadges = step.nums
    .map((n, i) => {
      const isActive = i === step.numIndex;
      return `
        <div style="background:${isActive ? '#eff6ff' : '#f1f5f9'}; border:1.5px solid ${isActive ? '#3b82f6' : '#e2e8f0'}; border-radius:6px; padding:5px 8px; min-width:38px; text-align:center;">
          <div style="font-size:8.5px; color:#64748b;">#${i}</div>
          <div style="font-size:13px; font-weight:800; color:${isActive ? '#3b82f6' : '#1e293b'};"> ${n >= 0 ? '+' : ''}${n}</div>
        </div>
      `;
    })
    .join('');

  const dpBadges = step.dp
    .map((v, j) => {
      const isCurrent = j === step.j;
      const hasWay = v > 0;
      return `
        <div style="background:${isCurrent ? '#dbeafe' : hasWay ? '#dcfce7' : '#f1f5f9'}; border:1.5px solid ${isCurrent ? '#3b82f6' : hasWay ? '#22c55e' : '#e2e8f0'}; border-radius:5px; padding:4px 6px; min-width:34px; text-align:center;">
          <div style="font-size:8px; color:#64748b;">j=${j}</div>
          <div style="font-size:12px; font-weight:800; color:${isCurrent ? '#3b82f6' : hasWay ? '#16a34a' : '#94a3b8'};"> ${v}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#374151; font-weight:700;">待分配符号数字列表</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          等价正集容量 t: <b style="color:#10b981;">${step.requiredSum >= 0 ? step.requiredSum : '无解'}</b>
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
        ${numBadges}
      </div>

      <!-- 代数归约公式 -->
      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:11.5px; font-weight:800; color:#374151;">🎯 代数归约与实时方案仓</div>
        <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; font-size:11.5px; color:#374151; display:flex; flex-direction:column; gap:3px;">
          <div>式一：<code>sum(P) - sum(N) = target</code>（正集与负集符号差）</div>
          <div>式二：<code>sum(P) + sum(N) = sum</code>（全集总和）</div>
          <div style="color:#059669; font-weight:700; margin-top:2px;">
            两式相加：2·sum(P) = target + sum &rArr; sum(P) = (${step.target} + ${step.sum}) / 2 = ${step.requiredSum >= 0 ? step.requiredSum : '无解'}
          </div>
        </div>
        <div style="font-size:11px; color:#64748b; text-align:right;">当前方案数: <b style="color:#7c3aed; font-size:13px;">${step.ways}</b> 种</div>
      </div>

      <!-- dp 向量行 -->
      <div style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center;">
        ${dpBadges}
      </div>
    </div>
  `;
}

export function renderTargetSumStage1Canvas(container: HTMLElement, step: any): void {
  const infoHtml = `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
      <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">${step.decision}</div>
      <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
    </div>
  `;
  renderSpecialRecursionCard1(container, {
    title:
      step.i < step.n
        ? `正在决策 nums[${step.i}]=${step.nums?.[step.i] ?? '—'}`
        : '所有元素决策完成',
    callStack: step.callStack || [],
    customInfoHtml: infoHtml,
  });
}

export function renderTargetSumStage1Metrics(container: HTMLElement, step: any): void {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; height:100%; width:100%; justify-content:center; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-sizing:border-box;">
      <div style="font-size:13px; font-weight:700; color:#3b82f6;">📊 目标和暴力递归调用监控</div>
      <div style="display:flex; gap:16px; margin-top:8px;">
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前调用深度</div>
          <div style="font-size:20px; font-weight:800; color:#f59e0b;">${step.callStack?.length ?? 0}</div>
        </div>
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
          <div style="font-size:11px; color:#64748b;">剩余目标和 rem</div>
          <div style="font-size:20px; font-weight:800; color:#10b981;">${step.remCap !== undefined ? step.remCap : '—'}</div>
        </div>
      </div>
      <div style="font-size:11px; color:#64748b; text-align:center; max-width:320px; margin-top:6px;">
        每个元素分支为【+nums[i] / −nums[i]】，未缓存时产生 2^N 重叠子问题。
      </div>
    </div>
  `;
}

export function renderTargetSumStage4Metrics(container: HTMLElement, step: TargetSumStep): void {
  renderKnapsackDpMatrix(
    container,
    {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
      maxVal: step.ways,
    },
    `凑出累加和方案数向量 dp[0..${step.dp.length - 1}]`
  );
}

export function createTargetSumStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归 (+/− 分治)',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^N)',
      theme: 'bg-blue',
      badge: {
        mode: '目标和 · 暴力递归',
        complexity: 'O(2^N) · O(N) 栈深',
      },
      card1Title: '🌿 递归决策分支展开与运行时调用栈',
      card2Title: '📊 递归调用深度与累加和监控',
      codeLanguages: TARGET_SUM_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { target, nums } = parseTargetSumInputs(inputs);
        return buildTargetSumRecursionSteps(nums, target);
      },
      renderCanvas: renderTargetSumStage1Canvas,
      renderCustomMetrics: renderTargetSumStage1Metrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索 (HashMap)',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N · sum)',
      theme: 'bg-blue',
      badge: {
        mode: '目标和 · HashMap 缓存',
        complexity: 'O(N · sum) · O(N · sum)',
      },
      card1Title: '💾 HashMap 缓存探查 (Cache Hit/Miss)',
      card2Title: '🎯 方案数缓存表 memo[i][curSum]',
      codeLanguages: TARGET_SUM_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { target, nums } = parseTargetSumInputs(inputs);
        return buildTargetSumMemoSteps(nums, target);
      },
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `f(i=${step.i}, curSum=${step.curSum})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard2(container, {
          title: '方案数缓存表 memo[i][curSum]',
          memo: step.memoGrid,
          curI: step.i,
          curJ: step.curSum,
        }),
    },
    {
      id: 'stage-3',
      name: '阶段 3: offset 平移二维 DP',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(N · sum)',
      theme: 'bg-emerald',
      badge: {
        mode: '目标和 · offset 平移 DP',
        complexity: 'O(N · sum) · O(N · sum)',
      },
      card1Title: '📐 offset 平移方案数转移决策',
      card2Title: ' offset 平移二维方案数表 dp[i][j]',
      codeLanguages: TARGET_SUM_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { target, nums } = parseTargetSumInputs(inputs);
        return buildTargetSum2DSteps(nums, target);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderTargetSumBoard(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecial2DCard2(container, {
          title: 'offset 平移二维方案数表 dp[i][j]',
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
        mode: '目标和 · 一维滚动数组逆序更新',
        complexity: 'O(N · T) · O(T)',
      },
      card1Title: '待分配符号数字与正集容量达成舱',
      card2Title: '凑出累加和方案数向量 dp[0..(target+sum)/2]',
      codeLanguages: TARGET_SUM_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { target, nums } = parseTargetSumInputs(inputs);
        return buildTargetSumSteps(nums, target);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderTargetSumBoard(container, step),
      renderCustomMetrics: renderTargetSumStage4Metrics,
    },
  ];
}

