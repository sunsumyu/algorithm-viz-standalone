/**
 * 划分字母区间 (Partition Labels · LeetCode 763) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  PartitionStep,
  PARTITION_LABELS_CODE_LINES,
  buildPartitionLabelsSteps,
} from '../../../core/renderers/adapters/partition-labels-step-compiler';
import {
  renderPartitionLabelsCanvas,
} from '../../../core/renderers/adapters/partition-labels-canvas-adapter';

export type { PartitionStep };
export {
  PARTITION_LABELS_CODE_LINES,
  buildPartitionLabelsSteps,
  renderPartitionLabelsCanvas,
};

registerAlgorithm({
  id: 'partition-labels',
  name: '划分字母区间',
  viewId: 'partition-labels',
  category: 'greedy',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握字符区间最远右边界贪心切分模型，熟练运用贪心寻找自然边界',
  description: '统计各字符最后出现位置，贪心更新最远覆盖边界，到达边界即刻切割',
  template: `<div id="partition-labels" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerPartitionLabels(): void {
  // 保持向前兼容导出
}
