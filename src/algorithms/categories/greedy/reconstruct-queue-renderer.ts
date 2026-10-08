/**
 * 根据身高重建队列 (Queue Reconstruction by Height · LeetCode 406) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  RQStep,
  RECONSTRUCT_QUEUE_CODE_LINES,
  parsePeople,
  buildReconstructQueueSteps,
} from '../../../core/renderers/adapters/reconstruct-queue-step-compiler';
import {
  renderReconstructQueueCanvas,
} from '../../../core/renderers/adapters/reconstruct-queue-canvas-adapter';

export type { RQStep };
export {
  RECONSTRUCT_QUEUE_CODE_LINES,
  parsePeople,
  buildReconstructQueueSteps,
  renderReconstructQueueCanvas,
};

registerAlgorithm({
  id: 'reconstruct-queue',
  name: '根据身高重建队列',
  viewId: 'reconstruct-queue',
  category: 'greedy',
  icon: '👥',
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '掌握双维度贪心问题的排序拆解技巧，理解高维度先入队、低维度插空的经典解法与四阶段演进',
  description: '身高降序且 k 升序排序，高个子先入队确定相对骨架，矮个子直接按 k 插入槽位',
  template: `<div id="reconstruct-queue" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerReconstructQueue(): void {
  // 保持向前兼容导出
}
