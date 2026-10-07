/**
 * 最后一块石头的重量 II (LeetCode 1049 / 左程云 Class 073 Code04)
 * Canvas Adapter: 待粉碎石头集合与实时子集对称天平面板
 */

import { renderSpecialRecursionCard1, renderSpecialMemoCard1, renderSpecialMemoCard2, renderSpecial2DCard2 } from '../special-stage-cards';
import { renderKnapsackDpMatrix } from '../knapsack-sandbox-stage';
import {
  type LastStoneStep,
  parseLastStoneInputs,
  buildLastStoneWeightIISteps,
} from './last-stone-weight-ii-step-compiler';
import {
  buildLastStoneRecursionSteps,
  buildLastStoneMemoSteps,
  buildLastStone2DSteps,
} from '../../../algorithms/categories/dynamic-programming/knapsack-073/last-stone-stage-evolution';
import {
  LAST_STONE_STAGE1_CODE_LANGUAGES,
  LAST_STONE_STAGE2_CODE_LANGUAGES,
  LAST_STONE_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-073-templates';
import { LAST_STONE_WEIGHT_II_CODE_LANGUAGES } from '../../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-073-problem-content';

export function renderLastStoneBoard(container: HTMLElement, step: LastStoneStep): void {
  const selectedA = step.selectedStones || [];
  const weightA = selectedA.reduce((sum: number, idx: number) => sum + (step.stones[idx] || 0), 0);
  const weightB = step.sum - weightA;
  const diff = Math.abs(weightB - weightA);
  const ratio = Math.min(100, Math.round((weightA / Math.max(1, step.targetCapacity)) * 100));

  const stoneEls = step.stones
    .map((s: number, idx: number) => {
      const isCur = step.stoneIndex === idx;
      const isInA = selectedA.includes(idx);

      let bg = 'rgba(241, 245, 249, 0.9)';
      let border = '#334155';
      let badge = '<span style="color:#38bdf8; font-size:9px;">子集 B</span>';

      if (isInA) {
        bg = 'rgba(209, 250, 229, 0.9)';
        border = '#10b981';
        badge =
          '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 4px; border-radius:3px; font-weight:bold;">✔ 子集 A</span>';
      } else if (isCur) {
        bg = 'rgba(30, 58, 138, 0.5)';
        border = '#f59e0b';
        badge =
          '<span style="background:#2563eb; color:#fff; font-size:9px; padding:1px 4px; border-radius:3px; font-weight:bold;">🔍 考察中</span>';
      }

      return `
        <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:95px; text-align:center; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10.5px; color:#374151; font-weight:700;">石头 #${idx + 1}</span>
            ${badge}
          </div>
          <div style="font-size:14px; font-weight:800; color:#1e293b; margin-top:2px;">🪨 ${s} 磅</div>
        </div>
      `;
    })
    .join('');

  const chipsA = selectedA
    .map(
      (idx: number) => `
    <span style="background:rgba(209, 250, 229, 0.9); border:1px solid #10b981; border-radius:4px; padding:2px 6px; font-size:10px; color:#a7f3d0;">
      #${idx + 1} (${step.stones[idx]}磅)
    </span>
  `
    )
    .join(' ');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#64748b; font-weight:700;">待粉碎石头集合 (总重 sum=${step.sum}，目标半和上限 t=${step.targetCapacity})</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.targetCapacity}
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
        ${stoneEls}
      </div>

      <!-- 底部实时碰撞天平仓 -->
      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#374151;">⚖️ 实时子集对称天平 (两堆对消)</span>
          <div style="display:flex; gap:16px; font-size:11px;">
            <span>子集 A (靠近半和): <b style="color:#10b981;">${weightA}</b> 磅</span>
            <span>子集 B (剩余): <b style="color:#38bdf8;">${weightB}</b> 磅</span>
            <span>碰撞残留差值: <b style="color:#f59e0b;">${diff}</b> 磅</span>
          </div>
        </div>

        <div style="width:100%; height:8px; background:#e8f0fe; border-radius:4px; overflow:hidden;">
          <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); transition:width 0.25s ease;"></div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
          <span style="color:#64748b; font-size:10.5px; min-width:80px;">子集 A 石头:</span>
          ${chipsA || '<span style="color:#64748b; font-size:10.5px;">(暂未选入石头)</span>'}
        </div>
      </div>
    </div>
  `;
}

export function renderLastStoneStage1Canvas(container: HTMLElement, step: any): void {
  const infoHtml = `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px;">
      <div style="font-size:12px; font-weight:700; color:#1e293b; margin-bottom:4px;">${step.decision}</div>
      <div style="font-size:11px; color:#64748b; line-height:1.5;">${step.message}</div>
    </div>
  `;
  renderSpecialRecursionCard1(container, {
    title:
      step.i < step.n
        ? `正在决策石头 #${step.i + 1} (重:${step.stones?.[step.i] ?? '—'})`
        : '所有石头决策完成',
    callStack: step.callStack || [],
    customInfoHtml: infoHtml,
  });
}

export function renderLastStoneStage1Metrics(container: HTMLElement, step: any): void {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; height:100%; width:100%; justify-content:center; align-items:center; background:rgba(241, 245, 249, 0.9); border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-sizing:border-box;">
      <div style="font-size:13px; font-weight:700; color:#38bdf8;">📊 石头递归粉碎分治监控</div>
      <div style="display:flex; gap:16px; margin-top:8px;">
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前调用深度</div>
          <div style="font-size:20px; font-weight:800; color:#fbbf24;">${step.callStack?.length ?? 0}</div>
        </div>
        <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:6px; padding:10px 16px; text-align:center;">
          <div style="font-size:11px; color:#64748b;">剩余背包容量 remCap</div>
          <div style="font-size:20px; font-weight:800; color:#34d399;">${step.remCap !== undefined ? step.remCap : '—'}</div>
        </div>
      </div>
      <div style="font-size:11px; color:#64748b; text-align:center; max-width:320px; margin-top:6px;">
        在求接近 sum/2 的子集最大容量时，无备忘录会引发 2^N 重叠子问题。
      </div>
    </div>
  `;
}

export function renderLastStoneStage4Metrics(container: HTMLElement, step: LastStoneStep): void {
  renderKnapsackDpMatrix(
    container,
    {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
      maxVal: step.near,
    },
    `最接近子集和 DP 向量 dp[0..${step.dp.length - 1}]`
  );
}

export function createLastStoneStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^N)',
      theme: 'bg-blue',
      badge: {
        mode: '最后石头 · 递归分治搜索',
        complexity: 'O(2^N) · O(N) 栈深',
      },
      card1Title: '🌿 递归分支展开与运行时调用栈',
      card2Title: '📊 递归调用深度与子集和监控',
      codeLanguages: LAST_STONE_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { stones } = parseLastStoneInputs(inputs);
        return buildLastStoneRecursionSteps(stones);
      },
      renderCanvas: renderLastStoneStage1Canvas,
      renderCustomMetrics: renderLastStoneStage1Metrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N · Sum)',
      theme: 'bg-blue',
      badge: {
        mode: '最后石头 · 备忘录缓存',
        complexity: 'O(N · Sum) · O(N · Sum) 备忘录',
      },
      card1Title: '💾 备忘录探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录最大子集重矩阵 memo[i][remCap]',
      codeLanguages: LAST_STONE_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { stones } = parseLastStoneInputs(inputs);
        return buildLastStoneMemoSteps(stones);
      },
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfs(i=${step.i}, remCap=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard2(container, {
          title: '2D 备忘录最大子集重矩阵 memo[i][remCap]',
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
      timeBadge: 'O(N · Sum)',
      theme: 'bg-emerald',
      badge: {
        mode: '最后石头 · 二维状态表推导',
        complexity: 'O(N · Sum) · O(N · Sum)',
      },
      card1Title: '📐 二维最大子集和转移决策',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      codeLanguages: LAST_STONE_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { stones } = parseLastStoneInputs(inputs);
        return buildLastStone2DSteps(stones);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderLastStoneBoard(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
        renderSpecial2DCard2(container, {
          title: '二维状态表 dp[i][j]',
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
      timeBadge: 'O(Sum) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '最后石头 · 一维滚动数组逆序更新',
        complexity: 'O(N · Sum) · O(Sum)',
      },
      card1Title: '待粉碎石头与实时子集对称天平',
      card2Title: '最接近子集和 DP 向量 dp[0..sum/2]',
      codeLanguages: LAST_STONE_WEIGHT_II_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { stones } = parseLastStoneInputs(inputs);
        return buildLastStoneWeightIISteps(stones);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderLastStoneBoard(container, step),
      renderCustomMetrics: renderLastStoneStage4Metrics,
    },
  ];
}

