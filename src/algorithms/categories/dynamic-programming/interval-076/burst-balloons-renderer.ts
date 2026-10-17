/**
 * 戳气球 (LeetCode 312 / 左程云 Class 076 Code03)
 * 接入顶层抽象架构：YAML 模型 + IntervalDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildBurstBalloonsSteps,
  parseBurstBalloonsInputs,
} from '../../../../core/renderers/adapters/burst-balloons-step-compiler';

export {
  buildBurstBalloonsSteps,
  parseBurstBalloonsInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as BurstBalloonsVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'burst-balloons',
  name: '戳气球 (LeetCode 312)',
  viewId: 'burst-balloons',
  category: 'dynamic-programming',
  description: '左程云算法讲解076 Code03：LeetCode 312 戳气球，区间 DP 逆向思维之最后戳破气球模型。',
  icon: '🎈',
  aliases: ['class076-code03', 'burst-balloons-312', 'leetcode-312'],
  template: '<div id="burst-balloons" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 312,
  learningGoal: '深刻理解区间 DP 逆向思维，通过枚举最后戳破的气球消解子问题边界依赖',
});
