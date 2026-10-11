import {
  MAXIMAL_RECTANGLE_LINES,
} from './stack-052-stage-codes';

export interface MaximalRectangle052Step {
  matrix: number[][];
  curRow: number;
  heights: number[];
  stack: number[];
  activeRect: { left: number; right: number; height: number; area: number } | null;
  rowMaxArea: number;
  maxArea: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildMaximalRectangle052Steps(matrix: number[][]): MaximalRectangle052Step[] {
  const steps: MaximalRectangle052Step[] = [];
  const lines = MAXIMAL_RECTANGLE_LINES;
  const m = matrix.length;
  const n = m > 0 ? matrix[0].length : 0;

  if (m === 0 || n === 0) {
    steps.push({
      matrix: [],
      curRow: -1,
      heights: [],
      stack: [],
      activeRect: null,
      rowMaxArea: 0,
      maxArea: 0,
      decision: '矩阵为空，最大矩形面积为 0。',
      message: '输入规模 0。',
      log: 'empty matrix',
      codeLine: lines.returnAns,
      metrics: { '行数 M': 0, '列数 N': 0, '最大矩形面积': 0 },
    });
    return steps;
  }

  const heights = new Array(n).fill(0);
  let maxArea = 0;
  let bestRectOverall: { left: number; right: number; height: number; area: number } | null = null;

  // Step 0: 入口
  steps.push({
    matrix: matrix.map((row) => [...row]),
    curRow: -1,
    heights: [...heights],
    stack: [],
    activeRect: null,
    rowMaxArea: 0,
    maxArea: 0,
    decision: `主函数入口：开始在 ${m} × ${n} 二维矩阵中寻找只包含 1 的最大矩形。`,
    message: '核心策略：逐行扫描，将每一行向上连续 1 的高度压缩为一维柱状图，转化为 LeetCode 84 单调栈求解。',
    log: `enter maximalRectangle: ${m}x${n}`,
    codeLine: lines.entry,
    metrics: { '网格规模': `${m} × ${n}`, '当前最大面积': 0, '处理状态': '初始化' },
  });

  for (let r = 0; r < m; r++) {
    // 更新高度
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] === 1) {
        heights[c] += 1;
      } else {
        heights[c] = 0;
      }
    }

    steps.push({
      matrix: matrix.map((row) => [...row]),
      curRow: r,
      heights: [...heights],
      stack: [],
      activeRect: bestRectOverall,
      rowMaxArea: 0,
      maxArea,
      decision: `📥 扫描到第 [${r}] 行：更新连续 1 的高度柱状图 heights = [${heights.join(', ')}]。`,
      message: `当前行以行 ${r} 作为底边。矩阵中为 1 的位置高度累加，为 0 的位置连续性截断高度归 0。`,
      log: `row ${r}: updated heights=[${heights.join(', ')}]`,
      codeLine: lines.updateHeights,
      metrics: { '当前行': `行 ${r}`, '压缩高度柱': `[${heights.join(', ')}]`, '全局最大面积': maxArea },
    });

    // 基于当前 heights 执行单调栈求解最大矩形
    const stack: number[] = [];
    let rowMax = 0;

    for (let i = 0; i < n; i++) {
      const curH = heights[i];
      while (stack.length > 0 && heights[stack[stack.length - 1]] >= curH) {
        const mid = stack.pop()!;
        const midH = heights[mid];
        const left = stack.length > 0 ? stack[stack.length - 1] : -1;
        const right = i;
        const width = right - left - 1;
        const area = midH * width;

        if (area > rowMax) {
          rowMax = area;
        }
        if (area > maxArea) {
          maxArea = area;
          bestRectOverall = { left: left + 1, right: right - 1, height: midH, area };
        }

        steps.push({
          matrix: matrix.map((row) => [...row]),
          curRow: r,
          heights: [...heights],
          stack: [...stack],
          activeRect: { left: left + 1, right: right - 1, height: midH, area },
          rowMaxArea: rowMax,
          maxArea,
          decision: `🔥 第 [${r}] 行内部单调栈弹出基准柱 [${mid}] (高度 H=${midH})！矩形宽 W=${width}, 面积 = ${area}。`,
          message: `以行 ${r} 为底边，柱 ${mid} 为高向左右扩展 [${left + 1} ~ ${right - 1}]，本行最大 = ${rowMax}，全局最大 = ${maxArea}。`,
          log: `row ${r} pop bar ${mid}: area=${area}, max=${maxArea}`,
          codeLine: lines.calcHistogram,
          metrics: { '当前行': `行 ${r}`, '本行当前矩形': area, '本行最大': rowMax, '全局最大面积': maxArea },
        });
      }
      stack.push(i);
    }

    // 清算当前行栈
    while (stack.length > 0) {
      const mid = stack.pop()!;
      const midH = heights[mid];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = n;
      const width = right - left - 1;
      const area = midH * width;

      if (area > rowMax) {
        rowMax = area;
      }
      if (area > maxArea) {
        maxArea = area;
        bestRectOverall = { left: left + 1, right: right - 1, height: midH, area };
      }

      steps.push({
        matrix: matrix.map((row) => [...row]),
        curRow: r,
        heights: [...heights],
        stack: [...stack],
        activeRect: { left: left + 1, right: right - 1, height: midH, area },
        rowMaxArea: rowMax,
        maxArea,
        decision: `🧹 第 [${r}] 行清算柱 [${mid}] (高度 H=${midH})：向右延伸至边界，矩形宽 W=${width}, 面积 = ${area}。`,
        message: `本行清算阶段结算完成，本行最大矩形为 ${rowMax}，全局最大更新为 ${maxArea}。`,
        log: `row ${r} clear bar ${mid}: area=${area}, max=${maxArea}`,
        codeLine: lines.calcHistogram,
        metrics: { '当前行': `行 ${r}`, '清算矩形': area, '本行最大': rowMax, '全局最大面积': maxArea },
      });
    }
  }

  // 终结
  steps.push({
    matrix: matrix.map((row) => [...row]),
    curRow: m - 1,
    heights: [...heights],
    stack: [],
    activeRect: bestRectOverall,
    rowMaxArea: 0,
    maxArea,
    decision: `🎉 二维矩阵扫描全部完成！只包含 1 的最大矩形面积确认是 ${maxArea}。`,
    message: `成功利用二维压缩技巧与一维单调栈，将复杂度控制在 O(M × N)。`,
    log: `maximalRectangle complete: ans=${maxArea}`,
    codeLine: lines.returnAns,
    metrics: { '全局最大矩形面积': maxArea, '总行数': m, '总列数': n, '复杂度': 'O(M × N)' },
  });

  return steps;
}
