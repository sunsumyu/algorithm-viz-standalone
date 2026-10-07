/**
 * 分割回文串 II (Palindrome Partitioning II) - 声明式沙盘渲染器
 * LeetCode 132 (Hard / 动态规划)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  buildPalindromePartitionSteps,
  PALINDROME_PARTITION_CODES,
  PALINDROME_PARTITION_CODE_LINES,
  type PalindromePartitionStep,
} from '../../../core/renderers/adapters/palindrome-partitioning-ii-step-compiler';
import { renderPalindromePartitionCanvas } from '../../../core/renderers/adapters/palindrome-partitioning-ii-canvas-adapter';

export type { PalindromePartitionStep };
export {
  buildPalindromePartitionSteps,
  renderPalindromePartitionCanvas,
  PALINDROME_PARTITION_CODES,
  PALINDROME_PARTITION_CODE_LINES,
};

registerDeclarativeAlgorithm({
  id: 'palindrome-partitioning-ii',
  name: '分割回文串 II',
  category: 'dynamic-programming',
  difficulty: 3,
  learningGoal: 'LeetCode 132: 将字符串分割为全回文串的最少分割次数。预处理 O(N^2) 回文判定矩阵，配合线性 DP 在 O(N^2) 内求得全局极值。',
  codeLanguages: PALINDROME_PARTITION_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.s as string | undefined;
    const s = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : 'aabcb';
    return buildPalindromePartitionSteps(s);
  },
  renderCanvas: (container: HTMLElement, step: PalindromePartitionStep) => {
    container.innerHTML = renderPalindromePartitionCanvas(step);
  },
  inputs: [
    {
      id: 's',
      label: '输入待分割字符串',
      type: 'text',
      defaultValue: 'aabcb',
      placeholder: '例如: aabcb 或 aab',
    },
  ],
});
