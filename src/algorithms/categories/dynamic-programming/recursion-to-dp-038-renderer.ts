/**
 * Class 038: 经典递归向记忆化搜索与动态规划初步转换 (Recursion to DP Evolution)
 * 左程云算法通关课入门篇 Class 038
 * 动态规划四阶段演化：暴力递归 ➔ 记忆化搜索 ➔ 严格表依赖 ➔ 空间压缩优化
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  generateRecursionToDpSteps,
  RECURSION_TO_DP_038_CODES,
  type RecursionToDpStep,
} from '../../../core/renderers/adapters/recursion-to-dp-038-step-compiler';
import { renderRecursionToDpCanvas } from '../../../core/renderers/adapters/recursion-to-dp-038-canvas-adapter';

export type { RecursionToDpStep };
export { generateRecursionToDpSteps, renderRecursionToDpCanvas, RECURSION_TO_DP_038_CODES };

export const recursionToDp038Visualizer = registerDeclarativeAlgorithm<RecursionToDpStep>({
  id: 'recursion-to-dp-038',
  name: 'Class 038: 经典递归向记忆化搜索与动态规划初步转换 (Recursion to DP)',
  category: 'dynamic-programming',
  icon: '📈',
  difficulty: 2,
  levelOrder: 38,
  learningGoal: '掌握经典暴力递归向记忆化搜索、严格表依赖与空间压缩的四段式蜕变全流程与设计思维',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 038)</h3>
      <p>动态规划的核心思维跃迁：</p>
      <ul>
        <li><strong>阶段 1: 暴力递归</strong>：自顶向下拆分子问题，存在大量重复计算（指数级爆炸）。</li>
        <li><strong>阶段 2: 记忆化搜索</strong>：挂载备忘录，遇到已计算状态直接取值，消除重复分支。</li>
        <li><strong>阶段 3: 严格表依赖</strong>：梳理状态依赖关系，摆脱递归栈开销，自底向上迭代填表。</li>
        <li><strong>阶段 4: 空间压缩</strong>：仅保存计算当前状态所需的有限前序变量，实现 $O(1)$ 极致空间节省。</li>
      </ul>
    </div>
  `,
  codeLanguages: RECURSION_TO_DP_038_CODES,
  inputs: [
    {
      id: 'stage',
      label: '演化阶段',
      type: 'select',
      defaultValue: 'tab',
      options: [
        { label: '阶段 1: 暴力递归 (Brute-force)', value: 'brute' },
        { label: '阶段 2: 记忆化搜索 (Memoization)', value: 'memo' },
        { label: '阶段 3: 严格表依赖 (Tabulation)', value: 'tab' },
        { label: '阶段 4: 空间压缩优化 (Rolling)', value: 'rolling' },
      ],
    },
    {
      id: 'n',
      label: '目标规模 N',
      type: 'number',
      defaultValue: 6,
    },
  ],
  generateSteps: (input) => {
    const stage = (input.stage || 'tab') as 'brute' | 'memo' | 'tab' | 'rolling';
    const n = Number(input.n) || 6;
    return generateRecursionToDpSteps(n, stage);
  },
  renderCanvas: (container, step) => {
    renderRecursionToDpCanvas(container, step);
  },
});
