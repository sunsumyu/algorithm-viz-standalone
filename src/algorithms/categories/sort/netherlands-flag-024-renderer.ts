/**
 * Class 024: 荷兰国旗问题与三向切分 (Netherlands Flag Problem)
 * 左程云算法通关课入门篇 Class 024
 * 随机快速排序核心 Partition 原理
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  NetherlandsStep,
  NETHERLANDS_FLAG_024_CODES,
  buildNetherlands024Steps,
} from './netherlands-flag-024-step-compiler';
import { renderNetherlandsSandbox } from './netherlands-flag-024-canvas-adapter';

export type { NetherlandsStep };
export {
  NETHERLANDS_FLAG_024_CODES,
  buildNetherlands024Steps,
  renderNetherlandsSandbox,
};

export const netherlandsFlagVisualizer = registerDeclarativeAlgorithm<NetherlandsStep>({
  id: 'netherlands-flag-024',
  name: '荷兰国旗问题与三向切分 (Class 024)',
  category: 'sort',
  icon: '🇳🇱',
  difficulty: 1,
  levelOrder: 24,
  aliases: ['class024-code01', 'netherlands-flag-024', 'netherlands-flag', 'dutch-national-flag', 'sort-colors-75', 'sort-colors', '75', 'leetcode-75'],
  hasDeductionTree: true,
  learningGoal: '深刻掌握荷兰国旗小于/等于/大于三向划分算法，理解随机快速排序 Partition 核心',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程内容 (Class 024)</h3>
      <p>荷兰国旗问题由著名计算机科学家 Dijkstra 提出。给定数组和一个目标值 <code>target</code>，请在 $O(N)$ 时间复杂度与 $O(1)$ 额外空间内将数组重排为三部分：</p>
      <ul>
        <li>左部：所有 <code>&lt; target</code> 的元素</li>
        <li>中部：所有 <code>== target</code> 的元素</li>
        <li>右部：所有 <code>&gt; target</code> 的元素</li>
      </ul>
      <p>本算法是改进经典快速排序、从 $O(N^2)$ 最差退化到 $O(N \log N)$ 期望时间复杂度的核心地基。</p>
    </div>
  `,
  codeLanguages: NETHERLANDS_FLAG_024_CODES,
  inputs: [
    {
      id: 'target',
      label: '划分基准值 (Target)',
      type: 'number',
      defaultValue: 3,
    },
  ],
  generateSteps: (input) => {
    const t = Number(input.target) || 3;
    return buildNetherlands024Steps([3, 5, 2, 6, 3, 1, 7, 3, 4], t);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderNetherlandsSandbox(step)}
      </div>
    `;
  },
});
