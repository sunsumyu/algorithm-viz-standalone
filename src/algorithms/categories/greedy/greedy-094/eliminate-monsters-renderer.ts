/**
 * 消灭怪物的最大数量 (LeetCode 1921) - 声明式教学级沙盘渲染器
 * Thin Domain Adapter (< 45 LOC)
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import {
  MonsterInfo,
  EliminateMonstersStep,
  buildEliminateMonstersSteps,
} from './eliminate-monsters-step-compiler';

export type { MonsterInfo, EliminateMonstersStep };
export { buildEliminateMonstersSteps };

const template = `<div id="algo-eliminate-monsters-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const eliminateMonstersRenderer = UniversalStageVisualizer;
export const eliminateMonstersVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'eliminate-monsters',
  name: '消灭怪物的最大数量 (Eliminate Monsters)',
  viewId: 'algo-eliminate-monsters-view',
  category: 'greedy',
  description: 'LeetCode 1921：到达时间升序排序的贪心本质与防守时机判定 (EDF 调度与桶排序)',
  icon: '👾',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 941,
  aliases: ['class094-code01', 'eliminate-monsters-1921', 'leetcode-1921', 'eliminate-maximum-monsters'],
  learningGoal: '掌握到达时间升序排序的贪心本质与防守时机判定',
});

export function registerEliminateMonsters(): void {
  // 保持向前兼容导出
}
