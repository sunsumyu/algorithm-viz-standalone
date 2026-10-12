/**
 * Class 030: 递归子序列与去重全排列 (Subsequences & Permutations)
 * 左程云算法通关课入门篇 Class 030
 * 递归分支设计与剪枝去重技巧
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  PermStep,
  PERMUTATIONS_030_CODES,
  buildPermutation030Steps,
} from './permutations-subsequences-030-step-compiler';
import { renderPermutationSandbox } from './permutations-subsequences-030-canvas-adapter';

// 向后兼容导出
export type { PermStep };
export {
  PERMUTATIONS_030_CODES,
  buildPermutation030Steps,
  renderPermutationSandbox,
};

export const permutationsSubsequencesVisualizer = registerDeclarativeAlgorithm<PermStep>({
  id: 'permutations-subsequences-030',
  name: '递归子序列与去重全排列 (Class 030)',
  category: 'backtracking',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 30,
  learningGoal: '深刻掌握递归二分决策树生成子序列与 swap 回溯结合 visited 剪枝去重生成全排列',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程内容 (Class 030)</h3>
      <p>递归与回溯是算法思维的核心分水岭。本节包含两个最经典高频问题：</p>
      <ul>
        <li><strong>打印一个字符串的全部子序列</strong>：从左向右扫描，每个字符面临“加入当前子序列”和“不加入当前子序列”两种互斥决策。</li>
        <li><strong>打印一个字符串的全部全排列（去重）</strong>：通过位置 swap 将未确定的字符逐个移至当前位；遇到相同字符时利用 visited 集合剪枝，防止产生重复排列。</li>
      </ul>
    </div>
  `,
  codeLanguages: PERMUTATIONS_030_CODES,
  inputs: [
    {
      id: 'mode',
      label: '递归题目类型',
      type: 'select',
      defaultValue: 'subsequence',
      options: [
        { label: '全部子序列 (Subsequences)', value: 'subsequence' },
        { label: '去重全排列 (Permutations)', value: 'permutation' },
      ],
    },
  ],
  generateSteps: (input) => {
    const mode = input.mode === 'permutation' ? 'permutation' : 'subsequence';
    return buildPermutation030Steps('abc', mode);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderPermutationSandbox(step)}
      </div>
    `;
  },
});
