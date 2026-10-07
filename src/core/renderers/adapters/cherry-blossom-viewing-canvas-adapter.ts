/**
 * 观赏樱花 (混合背包) Canvas 表现层适配器 (Stage 1-4 多阶段与樱花树林沙盘装载)
 */

import { KNAPSACK_075_PROBLEMS } from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-problem-content';
import {
  CHERRY_STAGE1_CODE_LANGUAGES,
  CHERRY_STAGE2_CODE_LANGUAGES,
  CHERRY_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-075/knapsack-075-stage-codes';
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
import { renderKnapsackDpMatrix } from '../knapsack-sandbox-stage';
import {
  buildCherryBlossomViewingSteps,
  parseCherryDerivedItems,
} from './cherry-blossom-viewing-step-compiler';

export function renderCherryTreeSvg(isChosen: boolean, isCur: boolean): string {
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
      <path d="M22 36 C22 36, 23 27, 20 24 C19 22, 19 20, 24 20 C28 20, 27 23, 26 26 C25 29, 26 36, 26 36 Z" fill="#854d0e" />
      <path d="M19 36 C21 35, 27 35, 29 36" stroke="#451a03" stroke-width="2.5" stroke-linecap="round" />
      <path d="M24 24 C26 23, 29 21, 31 23" stroke="#713f12" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="17" cy="18" r="9" fill="${canopy1}" opacity="0.88" />
      <circle cx="30" cy="18" r="8.5" fill="${canopy2}" opacity="0.88" />
      <circle cx="23.5" cy="13" r="9.5" fill="${canopy3}" opacity="0.95" />
      <circle cx="23.5" cy="16.5" r="5" fill="#ffffff" opacity="0.32" />
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

      <div style="display:flex; flex-direction:column; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px; min-height:0; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
          <span style="font-size:11.5px; font-weight:800; color:#0f172a;">🎒 实时赏花行程仓</span>
          <span style="font-size:10.5px; color:#64748b;">已用: <b style="color:#0284c7;">${usedTime}</b> / ${step.totalTime}m</span>
        </div>

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

        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:10px; color:#64748b; font-weight:700;">已排入行程项 (${selected.length}):</div>
          ${slotsHtml}
        </div>

        <div style="background:linear-gradient(135deg, #fdf2f8, #fce7f3); border:1.5px solid #f472b6; border-radius:10px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; box-shadow: 0 1px 3px rgba(236,72,153,0.15);">
          <span style="font-size:11.5px; font-weight:800; color:#831843;">累计美学价值:</span>
          <span style="font-size:17px; font-weight:900; color:#be185d; font-family:monospace;">+${totalVal}</span>
        </div>
      </div>
    </div>
  `;
}

export function createCherryBlossomStages(): any[] {
  return [
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
      renderCanvas: (container: HTMLElement, step: any) => {
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
      renderCustomMetrics: (container: HTMLElement, step: any) => {
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
      renderCanvas: (container: HTMLElement, step: any) =>
        renderSpecialMemoCard1(container, {
          stateStr: `dfsCherryMemo(idx=${step.i}, remTime=${step.remCap})`,
          cacheHit: step.memoHit,
          hitCount: step.hitCount,
          missCount: step.missCount,
          decision: step.decision,
          message: step.message,
        }),
      renderCustomMetrics: (container: HTMLElement, step: any) =>
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
      renderCanvas: (container: HTMLElement, step: any) => renderCherryGardenCanvas(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => {
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
  ];
}
