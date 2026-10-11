/**
 * 开发商购买土地 — 步进推演编译器
 * KamaCoder 44：二维前缀和构建与子矩阵枚举
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import { parseNumericGrid } from '../../../core/input-primitives';

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
  codeLine: HighlightTarget;
}

export function parseGrid(input: string): number[][] {
  return parseNumericGrid(input, [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);
}

export function buildBuyLandSteps(grid: number[][], budget: number): BLStep[] {
  const steps: BLStep[] = [];
  const m = grid.length;
  const n = grid[0].length;
  const prefix: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  const lines = {
    init: { java: 3, cpp: 5, python: 4, javascript: 3 },
    buildPrefix: { java: [4, 5, 6], cpp: [6, 7, 8], python: [5, 6, 7], javascript: [4, 5, 6] },
    updateBest: {
      java: [13, 14, 15, 16, 17, 18],
      cpp: [15, 16, 17, 18, 19, 20],
      python: [14, 15, 16, 17, 18, 19],
      javascript: [13, 14, 15, 16, 17, 18],
    },
    done: { java: 22, cpp: 24, python: 20, javascript: 22 },
  };

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
    codeLine: lines.init,
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
        codeLine: lines.buildPrefix,
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
                codeLine: lines.updateBest,
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
    codeLine: lines.done,
  });

  return steps;
}
