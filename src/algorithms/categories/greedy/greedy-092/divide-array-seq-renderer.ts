/**
 * 将数组分成几个递增序列 (LeetCode 1121) - 声明式教学级沙盘渲染器
 * 核心贪心：最高众数瓶颈判定 nums.length >= maxFreq * k
 * Thin Domain Adapter (< 60 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import { DIVIDE_ARRAY_SEQ_CODES } from './greedy-092-stage-codes';
import {
  DivideArraySeqStep,
  buildDivideArraySeqSteps,
  parseDivideArraySeqInputs,
} from './divide-array-seq-step-compiler';
import { renderDivideArraySeqCanvas } from './divide-array-seq-canvas-adapter';

export type { DivideArraySeqStep };
export { buildDivideArraySeqSteps, renderDivideArraySeqCanvas };

export const divideArraySeqVisualizer = registerDeclarativeAlgorithm<DivideArraySeqStep>({
  id: 'divide-array-into-increasing-sequences',
  name: '将数组分成几个递增序列 (Divide Array Sequences)',
  category: 'greedy',
  icon: '📊',
  difficulty: 3,
  levelOrder: 925,
  aliases: ['class092-code05', 'divide-array-increasing-1121', 'leetcode-1121', 'divide-array-seq'],
  learningGoal: '掌握众数频次瓶颈与鸽巢原理判定 nums.length >= maxFreq * k',
  problemHtml: GREEDY_092_PROBLEMS.divideArraySeq.html,
  analysisHtml: GREEDY_092_PROBLEMS.divideArraySeq.html,
  inputs: [
    {
      id: 'input-nums',
      label: '非递减数组 nums',
      type: 'text',
      defaultValue: '1, 2, 2, 3, 3, 4, 4',
      placeholder: '1, 2, 2, 3, 3, 4, 4',
    },
    {
      id: 'input-k',
      label: '子序列最小长度 k',
      type: 'number',
      defaultValue: 3,
      placeholder: '如 3',
    },
  ],
  codeLanguages: DIVIDE_ARRAY_SEQ_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const { nums, k } = parseDivideArraySeqInputs(inputs);
    return buildDivideArraySeqSteps(nums, k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: DivideArraySeqStep) => {
    renderDivideArraySeqCanvas(stageContainer, step);
  },
});

export function registerDivideArraySeq(): void {
  // 保持向前兼容导出
}
