/**
 * 超级洗衣机 (LeetCode 517) - 声明式教学级沙盘渲染器
 * 核心贪心：左右净需求量与单机同时流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|))
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  MachineBottleneck,
  SuperWashingMachinesStep,
  buildSuperWashingMachinesSteps,
} from '../../../../core/renderers/adapters/super-washing-machines-093-step-compiler';

export type { MachineBottleneck, SuperWashingMachinesStep };
export { buildSuperWashingMachinesSteps };

const template = `<div id="algo-super-washing-machines-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const superWashingMachinesRenderer = UniversalStageVisualizer;
export const superWashingMachinesVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'super-washing-machines',
  name: '超级洗衣机 (Super Washing Machines)',
  viewId: 'algo-super-washing-machines-view',
  category: 'greedy',
  description: 'LeetCode 517：前缀和与单机同时双向流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|))',
  icon: '🧺',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 935,
  aliases: ['class093-code05', 'super-washing-machines-517', 'leetcode-517', 'washing-machines'],
  learningGoal: '掌握前缀和与单机同时双向流出瓶颈 max(leftNeed + rightNeed, max(|leftNeed|, |rightNeed|)) 的贪心证明',
});

export function registerSuperWashingMachines(): void {
  // 保持向前兼容导出
}
