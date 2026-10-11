/**
 * 螺旋矩阵 II — 步进推演编译器
 * LeetCode 59：四边界收缩模拟
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface SpiralStep {
  n: number;
  matrix: number[][];
  currentRow: number;
  currentCol: number;
  num: number;
  dir: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  status: 'fill' | 'turn' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
}

function clone(matrix: number[][]): number[][] {
  return matrix.map((row) => [...row]);
}

function boundaryStep(
  n: number,
  matrix: number[][],
  top: number,
  bottom: number,
  left: number,
  right: number,
  dir: string,
  log: string,
  codeLine: HighlightTarget
): SpiralStep {
  return {
    n,
    matrix: clone(matrix),
    currentRow: -1,
    currentCol: -1,
    num: 0,
    dir: '收缩边界',
    top,
    bottom,
    left,
    right,
    status: 'turn',
    message: `完成 ${dir} 方向填充，收缩边界：${log}。`,
    log: `收缩边界: ${log}`,
    codeLine,
  };
}

export function buildSpiralSteps(n: number): SpiralStep[] {
  const steps: SpiralStep[] = [];
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let top = 0,
    bottom = n - 1,
    left = 0,
    right = n - 1;
  let num = 1;

  const lines = {
    init: { java: [3, 4], cpp: [5, 6], python: [4, 5], javascript: [3, 4] },
    rightFill: { java: 6, cpp: 8, python: [7, 8, 9], javascript: 6 },
    shrinkTop: { java: 7, cpp: 9, python: 10, javascript: 7 },
    downFill: { java: 8, cpp: 10, python: [11, 12, 13], javascript: 8 },
    shrinkRight: { java: 9, cpp: 11, python: 14, javascript: 9 },
    leftFill: { java: 10, cpp: 12, python: [15, 16, 17], javascript: 10 },
    shrinkBottom: { java: 11, cpp: 13, python: 18, javascript: 11 },
    upFill: { java: 12, cpp: 14, python: [19, 20, 21], javascript: 12 },
    shrinkLeft: { java: 13, cpp: 15, python: 22, javascript: 13 },
    done: { java: 15, cpp: 17, python: 23, javascript: 15 },
  };

  steps.push({
    n,
    matrix: clone(matrix),
    currentRow: -1,
    currentCol: -1,
    num: 0,
    dir: '准备',
    top,
    bottom,
    left,
    right,
    status: 'fill',
    message: `初始化边界 top=0, bottom=${bottom}, left=0, right=${right}，准备从 (0,0) 开始顺时针填入 1 ~ ${n * n}。`,
    log: `初始化四边界：top=0, bottom=${bottom}, left=0, right=${right}`,
    codeLine: lines.init,
  });

  while (num <= n * n) {
    // 1. 向右填充 [top, left] -> [top, right]
    for (let c = left; c <= right && num <= n * n; c++) {
      matrix[top][c] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: top,
        currentCol: c,
        num,
        dir: '👉 向右',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向右填充：在 (${top}, ${c}) 写入 ${num}。`,
        log: `👉 写入 (${top},${c}) = ${num}`,
        codeLine: lines.rightFill,
      });
      num++;
    }
    top++;
    if (top <= bottom) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向右', `top 下移至 ${top}`, lines.shrinkTop));
    }

    // 2. 向下填充 [top, right] -> [bottom, right]
    for (let r = top; r <= bottom && num <= n * n; r++) {
      matrix[r][right] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: r,
        currentCol: right,
        num,
        dir: '👇 向下',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向下填充：在 (${r}, ${right}) 写入 ${num}。`,
        log: `👇 写入 (${r},${right}) = ${num}`,
        codeLine: lines.downFill,
      });
      num++;
    }
    right--;
    if (left <= right) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向下', `right 左移至 ${right}`, lines.shrinkRight));
    }

    // 3. 向左填充 [bottom, right] -> [bottom, left]
    for (let c = right; c >= left && num <= n * n; c--) {
      matrix[bottom][c] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: bottom,
        currentCol: c,
        num,
        dir: '👈 向左',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向左填充：在 (${bottom}, ${c}) 写入 ${num}。`,
        log: `👈 写入 (${bottom},${c}) = ${num}`,
        codeLine: lines.leftFill,
      });
      num++;
    }
    bottom--;
    if (top <= bottom) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向左', `bottom 上移至 ${bottom}`, lines.shrinkBottom));
    }

    // 4. 向上填充 [bottom, left] -> [top, left]
    for (let r = bottom; r >= top && num <= n * n; r--) {
      matrix[r][left] = num;
      steps.push({
        n,
        matrix: clone(matrix),
        currentRow: r,
        currentCol: left,
        num,
        dir: '👆 向上',
        top,
        bottom,
        left,
        right,
        status: 'fill',
        message: `向上填充：在 (${r}, ${left}) 写入 ${num}。`,
        log: `👆 写入 (${r},${left}) = ${num}`,
        codeLine: lines.upFill,
      });
      num++;
    }
    left++;
    if (left <= right) {
      steps.push(boundaryStep(n, matrix, top, bottom, left, right, '向上', `left 右移至 ${left}`, lines.shrinkLeft));
    }
  }

  steps.push({
    n,
    matrix: clone(matrix),
    currentRow: -1,
    currentCol: -1,
    num: n * n,
    dir: '完成',
    top,
    bottom,
    left,
    right,
    status: 'done',
    message: `🎉 螺旋矩阵 II 全部填满！已成功生成 ${n}×${n} 矩阵。`,
    log: `✓ 完成：已生成 ${n}x${n} 螺旋矩阵`,
    codeLine: lines.done,
  });

  return steps;
}
