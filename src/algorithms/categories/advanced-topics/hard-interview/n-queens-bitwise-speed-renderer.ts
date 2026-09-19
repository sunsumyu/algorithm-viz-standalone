/**
 * Hard 19: N 皇后极速位运算解法 (N-Queens Bitwise Acceleration)
 * LeetCode 51/52 (Hard) / 左程云大厂压轴经典
 * 核心原语：三整数位掩码 (col, leftDiag, rightDiag) + 提取最右侧 1，常数级位运算秒杀传统回溯
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

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

export function renderNQueensCanvas(container: HTMLElement, step: NQueensStep): void {
  const cellSize = 38;

  container.innerHTML = `
    <div style="display: flex; gap: 20px; width: 100%; height: 100%; padding: 4px; box-sizing: border-box; align-items: flex-start; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: auto;">
      <!-- N×N 棋盘 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); display: flex; justify-content: space-between; width: 100%;">
          <span>${step.n}×${step.n} 棋盘实时状态</span>
          <span style="font-size: 11px; color: #38bdf8;">${step.row >= step.n ? '放置完成' : `当前试探第 ${step.row} 行`}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(${step.n}, ${cellSize}px); border: 2px solid #475569; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
          ${Array.from({ length: step.n * step.n }, (_, idx) => {
            const r = Math.floor(idx / step.n);
            const c = idx % step.n;
            const isDark = (r + c) % 2 === 1;
            const hasQueen = step.board[r] === c;
            const isCurrentRow = r === step.row;

            return `
              <div style="
                width: ${cellSize}px;
                height: ${cellSize}px;
                background: ${hasQueen ? 'rgba(16, 185, 129, 0.4)' : isCurrentRow ? 'rgba(56, 189, 248, 0.18)' : isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(51, 65, 85, 0.5)'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: ${hasQueen ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.04)'};
                transition: background 0.15s ease;
              ">
                ${hasQueen ? '👑' : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 12px; font-size: 11px; color: #94a3b8;">
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: rgba(56, 189, 248, 0.4); border-radius: 2px;"></span> 当前行</span>
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: rgba(16, 185, 129, 0.6); border-radius: 2px;"></span> 已放置皇后</span>
        </div>
      </div>

      <!-- 位运算掩码控制台 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; max-width: 440px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1);">三向位掩码状态 (Bitwise Constraints)</div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(30, 41, 59, 0.4); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #94a3b8;">colMask (列冲突):</span>
            <span style="color: #f43f5e; background: rgba(244,63,94,0.15); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.colMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(30, 41, 59, 0.4); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #94a3b8;">leftDiag (左下对角线 &lt;&lt; 1):</span>
            <span style="color: #fbbf24; background: rgba(251,191,36,0.15); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.leftDiagMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(30, 41, 59, 0.4); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #94a3b8;">rightDiag (右下对角线 &gt;&gt; 1):</span>
            <span style="color: #a855f7; background: rgba(168,85,247,0.15); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.rightDiagMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #34d399; font-weight: 600;">candidates (可用候选位):</span>
            <span style="color: #34d399; background: rgba(16,185,129,0.2); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.candidatesMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>
        </div>

        <div style="font-size: 11px; color: #94a3b8; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
          公式：<code style="color: #38bdf8;">limit &amp; ~(col | left | right)</code> 取反求交，值为 1 的位表示纵向及双斜向均无皇后射程攻击威胁。
        </div>
      </div>
    </div>
  `;
}

export const nQueensBitwiseSpeedVisualizer = registerDeclarativeAlgorithm<NQueensStep>({
  id: 'n-queens-bitwise-speed',
  name: 'Hard 19: N 皇后极速位运算解法 (N-Queens Bitwise Acceleration)',
  category: 'backtracking',
  icon: '👑',
  difficulty: 3,
  levelOrder: 19,
  learningGoal: '掌握经典 N 皇后问题的列与双向对角线位掩码表达技巧，理解最右 1 提取与位移推导模型',
  metrics: [
    { id: 'currentRow', label: '当前推演行 (Row)', color: 'blue' },
    { id: 'totalSolutions', label: '累计发现解 (Solutions)', color: 'emerald' },
    { id: 'candidates', label: '候选列掩码 (Candidates)', color: 'amber' },
    { id: 'colConflict', label: '列冲突掩码 (ColMask)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 51/52 - Hard)</h3>
      <p>按照国际象棋的规则，皇后可以攻击与之处在同一行或同一列或同一斜线上的棋子。</p>
      <p>$n$ 皇后问题研究的是如何将 $n$ 个皇后放置在 $n \times n$ 的棋盘上，并且使皇后彼此之间不能相互攻击。</p>
      <ul>
        <li><strong>常规解法</strong>：数组记录列及两条对角线占用状态，递归回溯时逐一验证。</li>
        <li><strong>极速位运算解法</strong>：仅用 <code>col</code>, <code>leftDiag</code>, <code>rightDiag</code> 三个整数位掩码表示冲突，位运算提取下一个合法位置，性能极高。</li>
      </ul>
    </div>
  `,
  codeLanguages: N_QUEENS_BITWISE_CODES,
  inputs: [
    {
      id: 'n',
      label: '皇后数量 N',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: 'N = 4 (基础演示，共 2 解)', value: '4' },
        { label: 'N = 5 (进阶演示，共 10 解)', value: '5' },
      ],
    },
  ],
  generateSteps: (input) => {
    const n = Number(input.n) || 4;
    return generateNQueensSteps(n);
  },
  renderCanvas: (container, step) => {
    renderNQueensCanvas(container, step);
  },
});
