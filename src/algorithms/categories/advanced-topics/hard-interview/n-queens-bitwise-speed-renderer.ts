/**
 * Hard 19: N 皇后极速位运算解法 (N-Queens Bitwise Acceleration)
 * LeetCode 51/52 (Hard) / 左程云大厂压轴经典
 * 核心原语：三整数位掩码 (col, leftDiag, rightDiag) + 提取最右侧 1，常数级位运算秒杀传统回溯
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

export function generateNQueensSteps(n: number = 4): NQueensStep[] {
  const steps: NQueensStep[] = [];
  const limit = (1 << n) - 1;
  const board = new Array(n).fill(-1);
  let totalSolutions = 0;

  const lines = {
    entry: 3,
    baseSuccess: 10,
    calcCandidates: 13,
    whileLoop: 16,
    pickOne: 18,
    recurse: 21,
  };

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
  });

  return steps;
}

export function renderNQueensCanvas(container: HTMLElement, step: NQueensStep): void {
  const cellSize = 36;
  const boardPx = step.n * cellSize;

  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">累计发现解法总数</div>
          <div style="font-size: 24px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${step.totalSolutions} 组
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前推演行 (Row)</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            第 ${step.row} 行 ${step.currentPickCol !== null ? `(试探列 ${step.currentPickCol})` : ''}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">候选位掩码 (Candidates)</div>
          <div style="font-size: 16px; font-family: monospace; color: #fbbf24; margin-top: 6px;">
            ${step.candidatesMask.toString(2).padStart(step.n, '0')}
          </div>
        </div>
      </div>

      <!-- 棋盘与位掩码并排沙盘 -->
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 20px; margin-bottom: 16px; align-items: center;">
        <!-- N×N 棋盘 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; display: inline-block;">
          <div style="display: grid; grid-template-columns: repeat(${step.n}, ${cellSize}px); border: 2px solid #64748b; border-radius: 4px; overflow: hidden;">
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
                  background: ${hasQueen ? '#065f46' : isCurrentRow ? 'rgba(56, 189, 248, 0.15)' : isDark ? '#1e293b' : '#334155'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 18px;
                  border: ${hasQueen ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.03)'};
                ">
                  ${hasQueen ? '👑' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 位运算掩码控制台 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1;">三大位掩码状态 (二进制位)</div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: monospace;">
            <span style="color: #94a3b8;">colMask (列冲突):</span>
            <span style="color: #f43f5e; background: rgba(244,63,94,0.1); padding: 2px 8px; border-radius: 4px;">
              ${step.colMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: monospace;">
            <span style="color: #94a3b8;">leftDiag (左下对角线):</span>
            <span style="color: #fbbf24; background: rgba(251,191,36,0.1); padding: 2px 8px; border-radius: 4px;">
              ${step.leftDiagMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; font-family: monospace;">
            <span style="color: #94a3b8;">rightDiag (右下对角线):</span>
            <span style="color: #a855f7; background: rgba(168,85,247,0.1); padding: 2px 8px; border-radius: 4px;">
              ${step.rightDiagMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="margin-top: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #34d399;">
            公式：~(col | left | right) 取反求交，为 1 的位表示三向均无任何皇后射程威胁！
          </div>
        </div>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        'N 皇后位运算加速核心原理',
        '左对角线在下一行相当于左移 1 位 (<< 1)，右对角线在下一行相当于右移 1 位 (>> 1)。使用 candidates & (-candidates) 提取最低位 1，彻底抛弃传统遍历检验！空间仅需 3 个整数位掩码，运算速度逼近 CPU 硬件极限！',
        step.decision,
        step.statusBadge
      )}
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
