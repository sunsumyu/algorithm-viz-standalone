/**
 * 将数组分成几个递增序列 (LeetCode 1121) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 * 核心贪心：最高众数瓶颈判定 nums.length >= maxFreq * k
 * 挂载 UniversalStageVisualizer 顶层宿主
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  DivideArraySeqStep,
  buildDivideArraySeqSteps,
  parseDivideArraySeqInputs,
} from './divide-array-seq-step-compiler';
import { renderDivideArraySeqCanvas } from './divide-array-seq-canvas-adapter';

export type { DivideArraySeqStep };
export {
  buildDivideArraySeqSteps,
  parseDivideArraySeqInputs,
  renderDivideArraySeqCanvas,
};

const template = `<div id="algo-divide-array-seq-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const divideArraySeqRenderer = UniversalStageVisualizer;
export const divideArraySeqVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'divide-array-into-increasing-sequences',
  name: '将数组分成几个递增序列',
  viewId: 'algo-divide-array-seq-view',
  category: 'greedy',
  description: 'LeetCode 1121：基于最高频次众数瓶颈与鸽巢原理判定能否划分若干严格递增子序列',
  icon: '📊',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 925,
  learningGoal: '掌握众数频次瓶颈与鸽巢原理判定 nums.length >= maxFreq * k',
  aliases: [
    'class092-code05',
    'divide-array-increasing-1121',
    'leetcode-1121',
    'divide-array-seq',
  ],
});

export function registerDivideArraySeq(): void {
  // 保持向前兼容导出
}
