/**
 * 加油站 (Gas Station · LeetCode 134) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  GasStationStep,
  GAS_STATION_CODE_LINES,
  buildGasStationSteps,
} from '../../../core/renderers/adapters/gas-station-step-compiler';
import {
  renderGasStationCanvas,
} from '../../../core/renderers/adapters/gas-station-canvas-adapter';

export type { GasStationStep };
export {
  GAS_STATION_CODE_LINES,
  buildGasStationSteps,
  renderGasStationCanvas,
};

registerAlgorithm({
  id: 'gas-station',
  name: '加油站',
  viewId: 'gas-station',
  category: 'greedy',
  icon: '⛽',
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握环形路线贪心跳跃技巧，理解局部亏空排除法与全局收支判定的协同运用，理解有限能量流动与四阶段状态机演进',
  description: '求绕环形路线行驶一周的唯一起点，累积净油量亏空即贪心将起点推进至 i + 1',
  template: `<div id="gas-station" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerGasStation(): void {
  // 保持向前兼容导出
}
