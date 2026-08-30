/**
 * 开发商购买土地可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * KamaCoder 44：二维前缀和构建与子矩阵枚举
 * 遵循 Zero-Subbox 规范，扁平 2D 网格沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BUY_LAND_PROBLEM_HTML,
  BUY_LAND_ANALYSIS_HTML,
  BUY_LAND_CODE_LANGUAGES,
} from './buy-land-problem-content';

export interface BLStep {
  grid: number[][];
  budget: number;
  phase: 'prefix' | 'scan';
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  currentSum: number;
  currentArea: number;
  bestArea: number;
  bestRect: [number, number, number, number] | null;
  prefix: number[][];
  status: 'init' | 'build-prefix' | 'scan-rect' | 'update-best' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseGrid(input: string): number[][] {
  const rows = input.split(/[;；]+/).map((r) => r.trim()).filter(Boolean);
  const grid: number[][] = [];
  for (const r of rows) {
    const nums = r
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));
    if (nums.length > 0) grid.push(nums);
  }
  return grid.length > 0
    ? grid
    : [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
}

export function buildBuyLandSteps(grid: number[][], budget: number): BLStep[] {
  const steps: BLStep[] = [];
  const m = grid.length;
  const n = grid[0].length;
  const prefix: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  steps.push({
    grid,
    budget,
    phase: 'prefix',
    r1: -1,
    c1: -1,
    r2: -1,
    c2: -1,
    currentSum: 0,
    currentArea: 0,
    bestArea: 0,
    bestRect: null,
    prefix: prefix.map((r) => [...r]),
    status: 'init',
    message: `初始化 ${m}×${n} 网格，预算 budget=${budget}。首先构建二维前缀和数组。`,
    log: `初始化: 矩阵规模 ${m}×${n}, 预算 ${budget}`,
    codeLine: 3,
  });

  // 1. 构建二维前缀和
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      prefix[i + 1][j + 1] = grid[i][j] + prefix[i][j + 1] + prefix[i + 1][j] - prefix[i][j];
      steps.push({
        grid,
        budget,
        phase: 'prefix',
        r1: i,
        c1: j,
        r2: i,
        c2: j,
        currentSum: prefix[i + 1][j + 1],
        currentArea: 0,
        bestArea: 0,
        bestRect: null,
        prefix: prefix.map((r) => [...r]),
        status: 'build-prefix',
        message: `计算前缀和 prefix[${i + 1}][${j + 1}] = grid[${i}][${j}] (${grid[i][j]}) + 上 (${prefix[i][j + 1]}) + 左 (${prefix[i + 1][j]}) - 左上 (${prefix[i][j]}) = ${prefix[i + 1][j + 1]}。`,
        log: `前缀和: prefix[${i + 1}][${j + 1}] = ${prefix[i + 1][j + 1]}`,
        codeLine: [4, 5, 6],
      });
    }
  }

  // 2. 枚举所有矩形
  let maxArea = 0;
  let bestRect: [number, number, number, number] | null = null;

  for (let r1 = 0; r1 < m; r1++) {
    for (let c1 = 0; c1 < n; c1++) {
      for (let r2 = r1; r2 < m; r2++) {
        for (let c2 = c1; c2 < n; c2++) {
          const area = (r2 - r1 + 1) * (c2 - c1 + 1);
          const sum =
            prefix[r2 + 1][c2 + 1] -
            prefix[r1][c2 + 1] -
            prefix[r2 + 1][c1] +
            prefix[r1][c1];

          if (sum <= budget) {
            if (area > maxArea) {
              maxArea = area;
              bestRect = [r1, c1, r2, c2];
              steps.push({
                grid,
                budget,
                phase: 'scan',
                r1,
                c1,
                r2,
                c2,
                currentSum: sum,
                currentArea: area,
                bestArea: maxArea,
                bestRect,
                prefix: prefix.map((r) => [...r]),
                status: 'update-best',
                message: `🌟 发现更大面积！矩形 [(${r1},${c1})..(${r2},${c2})] 开销 sum=${sum} ≤ budget(${budget})，面积 ${area} > 历史最佳，更新 maxArea=${maxArea}。`,
                log: `🌟 刷新最佳：面积 ${area} (开销 ${sum} <= ${budget})`,
                codeLine: [12, 13, 14],
              });
            }
          }
        }
      }
    }
  }

  steps.push({
    grid,
    budget,
    phase: 'scan',
    r1: bestRect ? bestRect[0] : -1,
    c1: bestRect ? bestRect[1] : -1,
    r2: bestRect ? bestRect[2] : -1,
    c2: bestRect ? bestRect[3] : -1,
    currentSum: 0,
    currentArea: maxArea,
    bestArea: maxArea,
    bestRect,
    prefix: prefix.map((r) => [...r]),
    status: 'done',
    message: `🎉 矩形搜索完毕！在预算 ${budget} 下能购买的最大连续土地面积为: ${maxArea}。`,
    log: `✓ 完成：最大购买面积 = ${maxArea}`,
    codeLine: 16,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BLStep>({
  id: 'buy-land',
  name: '开发商购买土地',
  category: 'array',
  icon: '🏞️',
  badge: {
    mode: '二维前缀和·子矩阵枚举',
    complexity: 'O(m²n²) · O(mn)',
  },
  card1Title: '📊 土地价值 2D 网格与候选矩形沙盘',
  card2Title: '🧭 二维容斥公式与最大面积监视器',
  card2Desc: '当前考察矩形 [r1,c1]..[r2,c2]、开销与最佳面积',
  legend: [
    { label: '最佳购买区域', color: '#10b981' },
    { label: '当前考察矩形', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-grid',
      label: '土地价值网格',
      type: 'text',
      defaultValue: '1, 2, 3; 4, 5, 6; 7, 8, 9',
      width: '160px',
      placeholder: '行以分号隔开',
    },
    {
      id: 'input-budget',
      label: '预算 budget',
      type: 'number',
      defaultValue: 20,
      width: '45px',
    },
  ],
  presets: [
    { label: '示例 1 (budget=20)', values: { 'input-grid': '1, 2, 3; 4, 5, 6; 7, 8, 9', 'input-budget': 20 } },
    { label: '小网格 (budget=10)', values: { 'input-grid': '1, 2; 3, 4', 'input-budget': 10 } },
    { label: '大预算 (budget=50)', values: { 'input-grid': '2, 3, 1; 1, 4, 2; 3, 2, 5', 'input-budget': 50 } },
  ],
  metrics: [
    { id: 'cur-cost', label: '当前矩形开销', color: '#2563eb' },
    { id: 'cur-area', label: '当前面积', color: '#f59e0b' },
    { id: 'best-area', label: '最佳最大面积', color: '#16a34a' },
  ],
  codeLanguages: BUY_LAND_CODE_LANGUAGES,
  problemHtml: BUY_LAND_PROBLEM_HTML,
  analysisHtml: BUY_LAND_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const rawGrid = inputs['input-grid'] || '1, 2, 3; 4, 5, 6; 7, 8, 9';
    const grid = parseGrid(rawGrid);
    const budget = parseInt(inputs['input-budget'] || '20', 10);
    return buildBuyLandSteps(grid, budget);
  },
  renderCanvas: (container, step) => {
    const isDone = step.status === 'done';

    const rowsHtml = step.grid
      .map((row, r) => {
        const cellsHtml = row
          .map((val, c) => {
            const inCur =
              step.phase === 'scan' &&
              !isDone &&
              r >= step.r1 &&
              r <= step.r2 &&
              c >= step.c1 &&
              c <= step.c2;

            const inBest =
              step.bestRect &&
              r >= step.bestRect[0] &&
              r <= step.bestRect[2] &&
              c >= step.bestRect[1] &&
              c <= step.bestRect[3];

            let bg = '#ffffff';
            let border = '#e2e8f0';
            let textColor = '#0f172a';

            if (inCur) {
              bg = '#eff6ff';
              border = '#3b82f6';
              textColor = '#1d4ed8';
            } else if (inBest) {
              bg = '#f0fdf4';
              border = '#86efac';
              textColor = '#166534';
            }

            return `
              <div style="width: 38px; height: 38px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${val}
              </div>
            `;
          })
          .join('');

        return `<div style="display: flex; gap: 4px;">${cellsHtml}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 6px;">
          ${rowsHtml}
        </div>
      </div>
    `;

    const root = container.closest('#algo-buy-land-view');
    if (root) {
      const costEl = root.querySelector('#metric-cur-cost');
      const areaEl = root.querySelector('#metric-cur-area');
      const bestEl = root.querySelector('#metric-best-area');

      if (costEl) costEl.textContent = step.currentSum > 0 ? `${step.currentSum} / ${step.budget}` : '—';
      if (areaEl) areaEl.textContent = `${step.currentArea}`;
      if (bestEl) bestEl.textContent = `${step.bestArea}`;

      // 在 Card 2 中展示容斥公式与最佳矩形坐标
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>最佳土地坐标:</span>
              <strong style="color: #16a34a;">${step.bestRect ? `[(${step.bestRect[0]},${step.bestRect[1]})..(${step.bestRect[2]},${step.bestRect[3]})]` : '未找到'}</strong>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              • 二维容斥: sum = S[r2+1][c2+1] - S[r1][c2+1] - S[r2+1][c1] + S[r1][c1]
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'buy-land',
  name: '开发商购买土地',
  category: 'array',
  description: '二维前缀和构建 O(mn)，容斥原理 O(1) 快速计算任意子矩阵开销并在预算内求解最大连续面积',
  icon: '🏞️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握二维前缀和数组的容斥原理建模与高维连续子区间开销的常数级查询算法',
});
