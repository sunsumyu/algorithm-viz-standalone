import {
  COUNT_SUBMATRICES_LINES,
} from './stack-053-stage-codes';

export interface CountSubmatricesStep {
  matrix: number[][];
  curRow: number;
  heights: number[];
  stack: number[];
  curPop: { col: number; H: number; left: number; right: number; down: number; add: number } | null;
  totalSubmatrices: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildCountSubmatrices053Steps(mat: number[][]): CountSubmatricesStep[] {
  const steps: CountSubmatricesStep[] = [];
  const lines = COUNT_SUBMATRICES_LINES;
  const m = mat.length;
  const n = m > 0 ? mat[0].length : 0;

  if (m === 0 || n === 0) {
    steps.push({
      matrix: [],
      curRow: -1,
      heights: [],
      stack: [],
      curPop: null,
      totalSubmatrices: 0,
      decision: '矩阵为空，全 1 子矩形数量为 0。',
      message: '输入规模 0。',
      log: 'empty matrix',
      codeLine: lines.returnAns,
      metrics: { '规模': '0x0', '总子矩形数': 0 },
    });
    return steps;
  }

  const heights = new Array(n).fill(0);
  let totalSubmatrices = 0;

  // Step 0: 入口
  steps.push({
    matrix: mat.map((r) => [...r]),
    curRow: -1,
    heights: [...heights],
    stack: [],
    curPop: null,
    totalSubmatrices: 0,
    decision: `主函数入口：开始统计 ${m} × ${n} 矩阵中全 1 子矩形的总数量。`,
    message: '核心策略：逐行扫描并维护连续 1 高度，利用单调栈阶梯容斥公式逐段结算。',
    log: `enter numSubmat: ${m}x${n}`,
    codeLine: lines.entry,
    metrics: { '网格规模': `${m} × ${n}`, '当前总子矩阵': 0, '状态': '初始化' },
  });

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      heights[c] = mat[r][c] === 1 ? heights[c] + 1 : 0;
    }

    steps.push({
      matrix: mat.map((row) => [...row]),
      curRow: r,
      heights: [...heights],
      stack: [],
      curPop: null,
      totalSubmatrices,
      decision: `📥 扫描到第 [${r}] 行：更新各列连续 1 高度 heights = [${heights.join(', ')}]。`,
      message: `以行 ${r} 作为底边展开单调栈阶梯累计。`,
      log: `row ${r}: updated heights=[${heights.join(', ')}]`,
      codeLine: lines.updateRow,
      metrics: { '当前底行': `行 ${r}`, '高度柱': `[${heights.join(', ')}]`, '当前总子矩阵': totalSubmatrices },
    });

    const stack: number[] = [];
    for (let j = 0; j < n; j++) {
      while (stack.length > 0 && heights[stack[stack.length - 1]] >= heights[j]) {
        const cur = stack.pop()!;
        if (heights[cur] > heights[j]) {
          const left = stack.length > 0 ? stack[stack.length - 1] : -1;
          const w = j - left - 1;
          const down = Math.max(left >= 0 ? heights[left] : 0, heights[j]);
          const add = (heights[cur] - down) * ((w * (w + 1)) / 2);
          totalSubmatrices += add;

          const popInfo = { col: cur, H: heights[cur], left, right: j, down, add };

          steps.push({
            matrix: mat.map((row) => [...row]),
            curRow: r,
            heights: [...heights],
            stack: [...stack],
            curPop: popInfo,
            totalSubmatrices,
            decision: `🔥 弹出列 [${cur}] (高 H=${heights[cur]})！两侧更矮最高 down=${down}，阶梯净增 = ${add}。`,
            message: `宽度 W=${w}，贡献 = (${heights[cur]} - ${down}) × (${w}×${w + 1}/2) = ${heights[cur] - down} × ${(w * (w + 1)) / 2} = ${add}！累计总数 = ${totalSubmatrices}。`,
            log: `pop col ${cur}: H=${heights[cur]}, down=${down}, add=${add}, total=${totalSubmatrices}`,
            codeLine: lines.popCalc,
            metrics: { '结算列': `[${cur}]`, '阶梯高差': heights[cur] - down, '本次新增': add, '累计总子矩形': totalSubmatrices },
          });
        }
      }
      stack.push(j);
    }

    // 清算当前行栈
    while (stack.length > 0) {
      const cur = stack.pop()!;
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const w = n - left - 1;
      const down = left >= 0 ? heights[left] : 0;
      const add = (heights[cur] - down) * ((w * (w + 1)) / 2);
      totalSubmatrices += add;

      const popInfo = { col: cur, H: heights[cur], left, right: n, down, add };

      steps.push({
        matrix: mat.map((row) => [...row]),
        curRow: r,
        heights: [...heights],
        stack: [...stack],
        curPop: popInfo,
        totalSubmatrices,
        decision: `🧹 清算列 [${cur}] (高 H=${heights[cur]})：向右延伸至边界，阶梯净增 = ${add}。`,
        message: `宽度 W=${w}，贡献 = (${heights[cur]} - ${down}) × ${(w * (w + 1)) / 2} = ${add}！累计总数 = ${totalSubmatrices}。`,
        log: `clear col ${cur}: add=${add}, total=${totalSubmatrices}`,
        codeLine: lines.clearPop,
        metrics: { '清算列': `[${cur}]`, '阶梯高差': heights[cur] - down, '本次新增': add, '累计总子矩形': totalSubmatrices },
      });
    }
  }

  // 终结
  steps.push({
    matrix: mat.map((r) => [...r]),
    curRow: m - 1,
    heights: [...heights],
    stack: [],
    curPop: null,
    totalSubmatrices,
    decision: `🎉 统计完成！矩阵中全部由 1 组成的子矩形总数为 ${totalSubmatrices}。`,
    message: '单调栈阶梯累加精确保证每个子矩形被其最底行、最长阶梯唯一统计，时间复杂度严格 O(M × N)。',
    log: `numSubmat complete: ans=${totalSubmatrices}`,
    codeLine: lines.returnAns,
    metrics: { '全 1 子矩阵总数': totalSubmatrices, '总行数': m, '总列数': n, '复杂度': 'O(M × N)' },
  });

  return steps;
}
