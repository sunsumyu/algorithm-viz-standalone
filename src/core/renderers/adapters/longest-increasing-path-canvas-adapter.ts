/**
 * 矩阵中的最长递增路径 (LeetCode 329) 画布适配器深模块 (LongestIncreasingPathCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一职责原则
 */

import {
  renderRecursionCard1,
  renderMemoCard1,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  DpCellDep,
} from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-shared';
import {
  LIP_STAGE1_CODE_LANGUAGES,
  LIP_STAGE2_CODE_LANGUAGES,
  LIP_STAGE3_CODE_LANGUAGES,
  LIP_STAGE4_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/dp-067/dp-067-stage-codes';
import { renderUniversalDpGrid } from '../../../algorithms/categories/dynamic-programming/dp-shared';
import {
  LipRecStep,
  LipMemoStep,
  Lip2DStep,
  LipStage4Step,
  buildLipStage1Steps,
  buildLipStage2Steps,
  buildLipStage3Steps,
  buildLipStage4Steps,
} from './longest-increasing-path-step-compiler';

export function renderMatrixTerrain(
  container: HTMLElement,
  matrix: number[][],
  activeI: number,
  activeJ: number,
  bestPath?: Array<[number, number]>
): void {
  if (!container) return;
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  let min = Infinity;
  let max = -Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] < min) min = matrix[r][c];
      if (matrix[r][c] > max) max = matrix[r][c];
    }
  }

  const activeStack = bestPath ? bestPath.map(([pr, pc]) => `${pr},${pc}`) : [];

  renderUniversalDpGrid(container, {
    title: `⛰️ 地势矩阵: ${rows} × ${cols}`,
    badgeText: bestPath ? `最长递增步数: ${bestPath.length}` : `当前坐标: (${activeI}, ${activeJ})`,
    subTitle: `地势范围 ${min} ~ ${max}`,
    grid: matrix,
    activeI,
    activeJ,
    activeStack,
    rowLabels: Array.from({ length: rows }, (_, r) => `r${r}`),
    colLabels: Array.from({ length: cols }, (_, c) => `c${c}`),
    legend: [
      { label: '探险家 🤠', color: '#2563eb' },
      { label: '最优链 👣', color: '#0284c7' },
      { label: '地势网格', color: '#059669' },
    ],
    modelId: 'longest-increasing-path',
  });
}

// Stage 1
export function renderLipStage1Canvas(container: HTMLElement, step: LipRecStep): void {
  renderRecursionCard1(
    container,
    step.currentCall,
    step.callStack,
    `<div style="font-size:12px; font-weight:700; color:#0284c7;">${step.decision}</div>
     <div style="font-size:11px; color:#64748b; margin-top:4px;">${step.message}</div>`
  );
}

export function renderLipStage1Metrics(container: HTMLElement, step: LipRecStep): void {
  renderMatrixTerrain(container, step.matrix, step.i, step.j);
}

// Stage 2
export function renderLipStage2Canvas(container: HTMLElement, step: LipMemoStep): void {
  renderMemoCard1(
    container,
    step.currentCall,
    step.memoHit,
    step.hitCount,
    step.missCount,
    step.decision,
    step.message,
    step.cachedVal
  );
}

export function renderLipStage2Metrics(container: HTMLElement, step: LipMemoStep): void {
  renderMemoGridCard(container, '路径备忘录 memo[i][j]', step.memoGrid, step.i, step.j);
}

// Stage 3
export function renderLipStage3Canvas(container: HTMLElement, step: Lip2DStep): void {
  renderDp2DCard1(
    container,
    step.currentCell,
    step.currentVal,
    step.depCells,
    step.decision,
    step.message
  );
}

export function renderLipStage3Metrics(container: HTMLElement, step: Lip2DStep): void {
  renderDp2DCard2(
    container,
    '二维状态表 dp[i][j]',
    step.dpTable,
    step.curI,
    step.curJ,
    step.depCells.map((d: DpCellDep) => ({ r: d.r, c: d.c }))
  );
}

// Stage 4
export function renderLipStage4Canvas(container: HTMLElement, step: LipStage4Step): void {
  renderMatrixTerrain(container, step.matrix, step.curI, step.curJ, step.bestPath);
}

export function renderLipStage4Metrics(container: HTMLElement, step: LipStage4Step): void {
  renderDp2DCard2(container, '全局最长路径矩阵 dp[i][j]', step.dpTable, step.curI, step.curJ, []);
}

export function createLipStages() {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力 DFS',
      shortName: 'DFS搜索',
      num: 1,
      timeBadge: 'O(4^(M×N))',
      theme: 'bg-blue',
      badge: {
        mode: '天然 DAG · 暴力四向探查',
        complexity: 'O(4^(M×N)) · O(M×N) 栈深',
      },
      card1Title: '🌿 递归分支展开与调用栈',
      card2Title: '⛰️ 矩阵地势高度与当前位置',
      legend: [
        { label: '当前探查 (i,j)', color: '#0284c7' },
        { label: '地势较低格', color: '#93c5fd' },
        { label: '地势较高格', color: '#1e3a8a' },
      ],
      codeLanguages: LIP_STAGE1_CODE_LANGUAGES,
      buildSteps: buildLipStage1Steps,
      renderCanvas: renderLipStage1Canvas,
      renderCustomMetrics: renderLipStage1Metrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(M×N)',
      theme: 'bg-blue',
      badge: {
        mode: '天然 DAG · 记忆化搜索',
        complexity: 'O(M×N) · O(M×N) 备忘录',
      },
      card1Title: '💾 备忘录缓存追踪 (Hit / Miss)',
      card2Title: '🎯 2D 最长路径备忘录 memo[i][j]',
      legend: [
        { label: '缓存命中 (Hit)', color: '#10b981' },
        { label: '未命中算值 (Miss)', color: '#ef4444' },
        { label: '未计算 (-1)', color: '#94a3b8' },
      ],
      codeLanguages: LIP_STAGE2_CODE_LANGUAGES,
      buildSteps: buildLipStage2Steps,
      renderCanvas: renderLipStage2Canvas,
      renderCustomMetrics: renderLipStage2Metrics,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格值拓扑序 DP',
      shortName: '拓扑序DP',
      num: 3,
      timeBadge: 'O(MN log(MN))',
      theme: 'bg-emerald',
      badge: {
        mode: '严格按值从大到小递推',
        complexity: 'O(MN log(MN)) · O(M×N)',
      },
      card1Title: '📐 偏序拓扑序状态推导',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      legend: [
        { label: '当前拓扑递推', color: '#10b981' },
        { label: '四向递增前驱', color: '#6366f1' },
        { label: '已计算', color: '#64748b' },
      ],
      codeLanguages: LIP_STAGE3_CODE_LANGUAGES,
      buildSteps: buildLipStage3Steps,
      renderCanvas: renderLipStage3Canvas,
      renderCustomMetrics: renderLipStage3Metrics,
    },
    {
      id: 'stage-4',
      name: '阶段 4: 最长路径全景沙盘',
      shortName: '最优路径',
      num: 4,
      timeBadge: 'O(M×N) 最优',
      theme: 'bg-amber',
      badge: {
        mode: '全局最长递增路径高亮',
        complexity: 'O(M×N) · O(M×N)',
      },
      card1Title: '⛰️ 矩阵地势高度图与最优路径链',
      card2Title: '📈 全局路径长度矩阵 dp[i][j]',
      legend: [
        { label: '全局最优递增链', color: '#16a34a' },
        { label: '链当前格/光标', color: '#0284c7' },
        { label: '地势基准格', color: '#94a3b8' },
      ],
      codeLanguages: LIP_STAGE4_CODE_LANGUAGES,
      buildSteps: buildLipStage4Steps,
      renderCanvas: renderLipStage4Canvas,
      renderCustomMetrics: renderLipStage4Metrics,
    },
  ];
}
