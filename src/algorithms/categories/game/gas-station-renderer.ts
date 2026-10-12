/**
 * 极速加油站·环岛拉力赛 (Gas Station Rally: Greedy Circuit Runner)
 * 经典贪心算法、环形赛道与局部透支跳跃剪枝
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  GasStationVisualizer,
  GAS_STATION_TEMPLATE,
  StationData,
} from './gas-station-visualizer';

export {
  GasStationVisualizer,
  GAS_STATION_TEMPLATE,
  type StationData,
};

registerAlgorithm({
  id: 'gas-station-rally',
  name: '极速加油站·环岛拉力赛',
  viewId: 'algo-gas-station-rally-view',
  category: 'game',
  description: '经典贪心算法游戏：环形霓虹赛道、实时剩余油量表盘、局部透支跳跃剪枝与 360° 胜利巡游',
  icon: '🏎️',
  template: GAS_STATION_TEMPLATE,
  Visualizer: GasStationVisualizer,
  difficulty: 3,
  levelOrder: 6,
  learningGoal: '通过环形赛车与油量补给实战，彻底掌握贪心算法中的局部透支排除法与全局可行性充要条件',
});
