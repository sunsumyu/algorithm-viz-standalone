/**
 * Hard 19: N 皇后极速位运算解法 (N-Queens Bitwise Acceleration)
 * LeetCode 51/52 (Hard) / 左程云大厂压轴经典
 * 核心原语：三整数位掩码 (col, leftDiag, rightDiag) + 提取最右侧 1，常数级位运算秒杀传统回溯
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type NQueensStep,
  N_QUEENS_BITWISE_CODES,
  generateNQueensSteps,
} from '../../../../core/renderers/adapters/n-queens-bitwise-step-compiler';
import { renderNQueensCanvas } from '../../../../core/renderers/adapters/n-queens-bitwise-canvas-adapter';

export type { NQueensStep };
export { N_QUEENS_BITWISE_CODES, generateNQueensSteps, renderNQueensCanvas };

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
