/**
 * Class 132: 线性基与异或空间基底 (Linear Basis)
 * 洛谷 P3812 【模板】线性基
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  LinearBasis132Step,
  LINEAR_BASIS_132_CODES,
  LINEAR_BASIS_132_CODE_LINES,
  buildLinearBasis132Steps,
} from '../../../../core/renderers/adapters/linear-basis-132-step-compiler';
import { renderLinearBasis132Canvas } from '../../../../core/renderers/adapters/linear-basis-132-canvas-adapter';

export type { LinearBasis132Step };
export { LINEAR_BASIS_132_CODES, LINEAR_BASIS_132_CODE_LINES, buildLinearBasis132Steps, renderLinearBasis132Canvas };

export const linearBasis132Visualizer = registerDeclarativeAlgorithm<LinearBasis132Step>({
  id: 'linear-basis-132',
  name: '线性基与异或空间基底 (Class 132)',
  aliases: ['class132-code01', 'linear-basis', 'linear-basis-132', 'xor-basis'],
  category: 'math',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 132,
  learningGoal: '深刻理解线性基向量张成空间、高位消元插入机制与贪心异或最大值推导',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定 <code>n</code> 个整数，求在这些数中选取任意个（可以为 0 个）数进行异或运算所能得到的<strong>最大值</strong>。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例输入：</strong>[11, 9, 5, 7]<br/>
        <strong>样例输出：</strong>15<br/>
        <strong>解释：</strong>11 ^ 5 ^ 7 = 15 为最大异或和。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '正整数序列 (逗号分隔)',
      type: 'text',
      defaultValue: '11, 9, 5, 7',
      placeholder: '请输入正整数列表',
    },
  ],
  codeLanguages: LINEAR_BASIS_132_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '11, 9, 5, 7');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildLinearBasis132Steps(nums.length > 0 ? nums : [11, 9, 5, 7], 5);
  },
  renderCanvas: (container, step) => {
    renderLinearBasis132Canvas(container, step);
  },
});
