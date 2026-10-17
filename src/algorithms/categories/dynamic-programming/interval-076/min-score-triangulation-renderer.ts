/**
 * 多边形三角剖分的最低得分 (LeetCode 1039 / 左程云 Class 076 Code01)
 * 接入顶层抽象架构：YAML 模型 + IntervalDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildMinScoreTriangulationSteps,
  parseMinScoreTriangulationInputs,
} from '../../../../core/renderers/adapters/min-score-triangulation-step-compiler';

export {
  buildMinScoreTriangulationSteps,
  parseMinScoreTriangulationInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as MinScoreTriangulationVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'min-score-triangulation',
  name: '多边形三角剖分的最低得分 (LeetCode 1039)',
  viewId: 'min-score-triangulation',
  category: 'dynamic-programming',
  description: '左程云算法讲解076 Code01：LeetCode 1039 多边形三角剖分的最低得分，凸多边形区间 DP 经典。',
  icon: '📐',
  aliases: ['class076-code01', 'min-score-triangulation-1039', 'leetcode-1039'],
  template: '<div id="min-score-triangulation" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 1039,
  learningGoal: '深刻掌握凸多边形几何划分与区间 DP 的对应关系，理解固定底边 (i, j) 枚举中间顶点 k 消除子问题依赖的建模方法',
});
