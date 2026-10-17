/**
 * 合并石头的最低成本 (LeetCode 1000 / 左程云 Class 077 Code01)
 * 接入顶层抽象架构：YAML 模型 + IntervalDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildMergeStonesSteps,
  parseMergeStonesInputs,
} from '../../../../core/renderers/adapters/merge-stones-step-compiler';

export {
  buildMergeStonesSteps,
  parseMergeStonesInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as MergeStonesVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'merge-stones',
  name: '合并石头的最低成本 (LeetCode 1000)',
  viewId: 'merge-stones',
  category: 'dynamic-programming',
  description: '左程云算法讲解077 Code01：LeetCode 1000 合并石头的最低成本，经典相邻石子合并区间 DP。',
  icon: '🪨',
  aliases: ['class077-code01', 'merge-stones-1000', 'leetcode-1000'],
  template: '<div id="merge-stones" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 1000,
  learningGoal: '深刻掌握相邻石子合并与区间 DP 的对应关系，理解前缀和快速查询与枚举中间分割点 k 消除子问题依赖的建模方法',
});
