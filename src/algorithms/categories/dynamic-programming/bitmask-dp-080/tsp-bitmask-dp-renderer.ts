/**
 * 旅行商问题 (Travelling Salesman Problem / TSP / 左程云 Class 080 Code04)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileTsp } from '../../../../core/strategies/bitmask-tsp';

export {
  compileTsp,
  UniversalStageVisualizer,
  UniversalStageVisualizer as TspBitmaskDpVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'tsp-bitmask-dp',
  name: '旅行商问题 (TSP)',
  viewId: 'tsp-bitmask-dp',
  category: 'dynamic-programming',
  description: '左程云算法讲解080 Code04：经典旅行商问题 (TSP)，状压DP求经过所有城市恰好一次并返回起点的最短哈密顿回路。',
  icon: '🗺️',
  aliases: ['class080-code04', 'tsp-bitmask', 'traveling-salesperson'],
  template: '<div id="tsp-bitmask-dp" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 8004,
  learningGoal: '掌握状态压缩动态规划求解 NP-Hard 最优哈密顿回路的经典范式：二进制掩码表示已访问城市集合，维度递推保证拓扑有序，最终闭环回到起点。',
});
