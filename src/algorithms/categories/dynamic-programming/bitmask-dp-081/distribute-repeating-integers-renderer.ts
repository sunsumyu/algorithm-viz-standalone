/**
 * 分配重复整数 (Distribute Repeating Integers / LeetCode 1655 / 左程云 Class 081 Code04)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileDistributeRepeating } from '../../../../core/strategies/bitmask-distributerepeating';

export {
  compileDistributeRepeating,
  UniversalStageVisualizer,
  UniversalStageVisualizer as DistributeRepeatingIntegersVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'distribute-repeating-integers',
  name: '分配重复整数',
  viewId: 'distribute-repeating-integers',
  category: 'dynamic-programming',
  description: '左程云算法讲解081 Code04：LeetCode 1655 分配重复整数，频次统计与子掩码高效枚举状压 DP。',
  icon: '📊',
  aliases: ['class081-code04', 'distribute-repeating-integers-1655', 'leetcode-1655'],
  template: '<div id="distribute-repeating-integers" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 8104,
  learningGoal: '掌握顾客需求子集状压与高效子掩码枚举 (sub = (sub - 1) & s) 技巧：对顾客需求数量进行状态压缩，外层枚举可用数字频次，内层通过位运算优雅遍历子掩码转移状态，大幅降低枚举复杂度。',
});
