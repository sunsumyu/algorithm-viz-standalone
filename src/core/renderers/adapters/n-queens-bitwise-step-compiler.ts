/**
 * N 皇后极速位运算解法 (LeetCode 51/52 / 大厂压轴题)
 * Step Compiler: 三整数位掩码 (col, leftDiag, rightDiag) 与最右侧 1 提取回溯编译器
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface NQueensStep extends StepBase {
  stepIndex?: number;
  n: number;
  row: number;
  board: number[]; // board[r] = c (某行摆放的列号，-1 表示未摆放)
  colMask: number;
  leftDiagMask: number;
  rightDiagMask: number;
  candidatesMask: number;
  currentPickCol: number | null;
  totalSolutions: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const N_QUEENS_BITWISE_CODES = {
  java: `public class NQueensBitwise {
    public int totalNQueens(int n) {
        if (n < 1 || n > 32) return 0;
        int limit = (1 << n) - 1; // n 个 1 的掩码
        return process(limit, 0, 0, 0);
    }

    // col: 列限制, leftDiag: 左对角线限制, rightDiag: 右对角线限制
    private int process(int limit, int col, int leftDiag, int rightDiag) {
        if (col == limit) return 1; // 所有行均摆放成功

        // 计算当前行所有可以摆放皇后的候选列 (为 1 的位置)
        int candidates = limit & (~(col | leftDiag | rightDiag));
        int count = 0;

        while (candidates != 0) {
            // 提取最右侧的 1
            int pick = candidates & (-candidates);
            candidates ^= pick; // 移除该位

            count += process(
                limit,
                col | pick,
                (leftDiag | pick) << 1,
                (rightDiag | pick) >>> 1
            );
        }
        return count;
    }
}`,
  cpp: `class Solution {
public:
    int totalNQueens(int n) {
        int limit = (1 << n) - 1;
        return dfs(limit, 0, 0, 0);
    }
    int dfs(int limit, int col, int left, int right) {
        if (col == limit) return 1;
        int candidates = limit & (~(col | left | right));
        int ans = 0;
        while (candidates) {
            int pick = candidates & (-candidates);
            candidates ^= pick;
            ans += dfs(limit, col | pick, (left | pick) << 1, (right | pick) >> 1);
        }
        return ans;
    }
};`,
  python: `class Solution:
    def totalNQueens(self, n: int) -> int:
        limit = (1 << n) - 1
        def dfs(col, left, right):
            if col == limit:
                return 1
            candidates = limit & (~(col | left | right))
            ans = 0
            while candidates:
                pick = candidates & (-candidates)
                candidates ^= pick
                ans += dfs(col | pick, (left | pick) << 1, (right | pick) >> 1)
            return ans
        return dfs(0, 0, 0)`,
  typescript: `function totalNQueens(n: number): number {
    const limit = (1 << n) - 1;
    function dfs(col: number, left: number, right: number): number {
        if (col === limit) return 1;
        let candidates = limit & (~(col | left | right));
        let ans = 0;
        while (candidates !== 0) {
            const pick = candidates & (-candidates);
            candidates ^= pick;
            ans += dfs(col | pick, (left | pick) << 1, (right | pick) >>> 1);
        }
        return ans;
    }
    return dfs(0, 0, 0);
}`
};

export const N_QUEENS_BITWISE_CODE_LINES = {
  entry: { java: 3, cpp: 3, python: 3, typescript: 2 },
  baseSuccess: { java: 10, cpp: 10, python: 6, typescript: 4 },
  calcCandidates: { java: 13, cpp: 13, python: 7, typescript: 5 },
  whileLoop: { java: 16, cpp: 16, python: 9, typescript: 7 },
  pickOne: { java: 18, cpp: 18, python: 10, typescript: 8 },
  recurse: { java: 21, cpp: 21, python: 12, typescript: 10 },
};

export function generateNQueensSteps(n: number = 4): NQueensStep[] {
  const steps: NQueensStep[] = [];
  const limit = (1 << n) - 1;
  const board = new Array(n).fill(-1);
  let totalSolutions = 0;

  const lines = N_QUEENS_BITWISE_CODE_LINES;

  const makeMetrics = (r: number, colMask: number, candMask: number, sols: number) => ({
    currentRow: r >= n ? '推演完成' : `第 ${r} 行`,
    totalSolutions: `${sols} 组`,
    candidates: candMask.toString(2).padStart(n, '0'),
    colConflict: colMask.toString(2).padStart(n, '0'),
  });
  const currentAns = (sols: number) => `${sols} 组互不冲突解`;

  // Step 0: 入口
  steps.push({
    n,
    row: 0,
    board: [...board],
    colMask: 0,
    leftDiagMask: 0,
    rightDiagMask: 0,
    candidatesMask: limit,
    currentPickCol: null,
    totalSolutions: 0,
    decision: `启动 N=${n} 皇后极速位运算求解：构造全局界限掩码 limit = (1<<${n})-1`,
    message: `limit 二进制为 ${limit.toString(2).padStart(n, '0')}，代表 ${n} 个可用列`,
    log: `Init N-Queens for N=${n}, limit=${limit.toString(2)}`,
    codeLine: lines.entry,
    statusBadge: { text: '位运算就绪', type: 'info' },
    metrics: makeMetrics(0, 0, limit, 0),
    ans: currentAns(0),
  });

  function bitToCol(pick: number): number {
    for (let i = 0; i < n; i++) {
      if ((pick & (1 << i)) !== 0) return i;
    }
    return 0;
  }

  function dfs(row: number, col: number, left: number, right: number) {
    if (col === limit) {
      totalSolutions++;
      steps.push({
        n,
        row,
        board: [...board],
        colMask: col,
        leftDiagMask: left,
        rightDiagMask: right,
        candidatesMask: 0,
        currentPickCol: null,
        totalSolutions,
        decision: `🎉 发现合法解法！全棋盘成功安放 ${n} 个互不攻击的皇后 (累积解法 #${totalSolutions})`,
        message: 'col 掩码全满 (col == limit)，返回计数 1',
        log: `Solution found #${totalSolutions}`,
        codeLine: lines.baseSuccess,
        statusBadge: { text: `解法 #${totalSolutions}`, type: 'success' },
        metrics: makeMetrics(row, col, 0, totalSolutions),
        ans: currentAns(totalSolutions),
      });
      return;
    }

    let candidates = limit & (~(col | left | right));

    steps.push({
      n,
      row,
      board: [...board],
      colMask: col,
      leftDiagMask: left,
      rightDiagMask: right,
      candidatesMask: candidates,
      currentPickCol: null,
      totalSolutions,
      decision: `第 [${row}] 行位运算计算候选位置：candidates = limit & (~(col | left | right))`,
      message: `可用位置掩码: ${candidates.toString(2).padStart(n, '0')} (为 1 的位代表绝对无冲突)`,
      log: `Row ${row}: candidates=${candidates.toString(2)}`,
      codeLine: lines.calcCandidates,
      statusBadge: { text: `第 ${row} 行候选`, type: 'info' },
      metrics: makeMetrics(row, col, candidates, totalSolutions),
      ans: currentAns(totalSolutions),
    });

    while (candidates !== 0) {
      const pick = candidates & (-candidates);
      candidates ^= pick;
      const colIdx = bitToCol(pick);
      board[row] = colIdx;

      steps.push({
        n,
        row,
        board: [...board],
        colMask: col,
        leftDiagMask: left,
        rightDiagMask: right,
        candidatesMask: candidates,
        currentPickCol: colIdx,
        totalSolutions,
        decision: `提取最右侧候选 1 (pick=${pick.toString(2)}) ➔ 在第 [${row}] 行第 [${colIdx}] 列安放皇后 👑`,
        message: `位运算提取最右 1: pick = candidates & (-candidates)，深入探索下一行`,
        log: `Row ${row} placed at col ${colIdx}`,
        codeLine: lines.pickOne,
        statusBadge: { text: `放置 (${row}, ${colIdx})`, type: 'success' },
        metrics: makeMetrics(row, col, candidates, totalSolutions),
        ans: currentAns(totalSolutions),
      });

      dfs(
        row + 1,
        col | pick,
        ((left | pick) << 1) & limit,
        (right | pick) >>> 1
      );

      // 回溯恢复
      board[row] = -1;
    }
  }

  dfs(0, 0, 0, 0);

  steps.push({
    n,
    row: n,
    board: [...board],
    colMask: limit,
    leftDiagMask: 0,
    rightDiagMask: 0,
    candidatesMask: 0,
    currentPickCol: null,
    totalSolutions,
    decision: `🎉 全部搜索空间推演完毕！${n} 皇后共有 ${totalSolutions} 种互不冲突的放置方案`,
    message: '位运算消除传统数组寻址与循环判断，运算效率飙升几十倍',
    log: `Completed. Total solutions: ${totalSolutions}`,
    codeLine: lines.baseSuccess,
    statusBadge: { text: '搜索完毕', type: 'success' },
    metrics: makeMetrics(n, limit, 0, totalSolutions),
    ans: currentAns(totalSolutions),
  });

  return steps;
}
