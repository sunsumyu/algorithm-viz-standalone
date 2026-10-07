/**
 * 完成所有任务的最少初始能量 (LeetCode 1665) - 顶层抽象架构全功能沙盘渲染器
 * 核心贪心：按 (minimum - actual) 差值降序排序，依次贪心累加能量门槛
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import { MINIMAL_BATTERY_POWER_CODES } from './greedy-091-stage-codes';
import {
  type TaskItem,
  type MinimalBatteryPowerStep,
  buildMinimalBatteryPowerSteps,
} from './minimal-battery-power-step-compiler';
import { renderMinimalBatteryPowerCanvas } from './minimal-battery-power-canvas-adapter';

export type { TaskItem, MinimalBatteryPowerStep };
export { buildMinimalBatteryPowerSteps, renderMinimalBatteryPowerCanvas };

const { template } = createDeclarativeVisualizer<MinimalBatteryPowerStep>({
  id: 'minimum-initial-energy-to-finish-tasks',
  name: '最少初始能量 (Minimum Initial Energy)',
  category: 'greedy',
  icon: '🔋',
  difficulty: 3,
  levelOrder: 915,
  learningGoal: '掌握按 minimum - actual 差值贪心降序排序的能量消耗与逆推模拟原理',
  problemHtml: GREEDY_091_PROBLEMS.minimalBatteryPower.html,
  analysisHtml: GREEDY_091_PROBLEMS.minimalBatteryPower.html,
  inputs: [
    {
      id: 'input-tasks',
      label: '任务列表 (actual,minimum 分号隔开)',
      type: 'text',
      defaultValue: '1,2; 2,4; 4,8',
      placeholder: '1,2; 2,4; 4,8',
    },
  ],
  codeLanguages: MINIMAL_BATTERY_POWER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-tasks'] || '1,2; 2,4; 4,8');
    const tasks = raw.split(';').map(t => {
      const parts = t.trim().split(/[,，\s]+/).map(s => parseInt(s.trim(), 10));
      return [parts[0] || 0, parts[1] || 0] as [number, number];
    }).filter(([a, m]) => a > 0 || m > 0);
    return buildMinimalBatteryPowerSteps(tasks);
  },
  renderCanvas: renderMinimalBatteryPowerCanvas,
});

export const minimalBatteryPowerVisualizer = UniversalStageVisualizer;
export const minimalBatteryPowerRenderer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'minimum-initial-energy-to-finish-tasks',
  name: '最少初始能量 (Minimum Initial Energy)',
  viewId: 'algo-minimal-battery-power-view',
  category: 'greedy',
  icon: '🔋',
  difficulty: 3,
  levelOrder: 915,
  description: '每个任务包含实际消耗与启动门槛，按门槛与消耗之差降序排列，通过邻项微扰交换法证明全局最少初始能量。',
  learningGoal: '掌握按 minimum - actual 差值贪心降序排序的能量消耗与逆推模拟原理',
  aliases: ['class091-code05', 'minimal-battery-power', 'minimum-initial-energy-1665', 'leetcode-1665'],
  template,
  Visualizer: UniversalStageVisualizer,
});
