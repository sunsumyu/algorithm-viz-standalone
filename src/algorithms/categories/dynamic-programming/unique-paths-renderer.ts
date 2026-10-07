/**
 * 动态规划四阶段全演化可视化画板 (Unique Paths Renderer)
 * 支持「不同路径」(LeetCode 62)、「不同路径 II」(LeetCode 63)
 */

import { registerAlgorithm } from '../../../core/registry';
import {
  UniversalStageVisualizer,
  UniquePathsVisualizer,
} from '../../../core/renderers/adapters/universal-stage-visualizer';

export { UniversalStageVisualizer, UniquePathsVisualizer };

// 3. 不同路径 (LeetCode 62)
registerAlgorithm({
  id: 'unique-paths',
  name: '不同路径',
  viewId: 'unique-paths',
  category: 'dynamic-programming',
  description: '网格路径数（LeetCode 62）：从左上角到右下角，只能向下或向右移动，空间复杂度优化至一维 O(n)。',
  icon: '🧭',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握二维网格路径模型与一维空间压缩优化技巧',
  template: '<div id="unique-paths" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
});

// 4. 不同路径 II (LeetCode 63)
registerAlgorithm({
  id: 'unique-paths-ii',
  name: '不同路径 II',
  viewId: 'unique-paths-ii',
  category: 'dynamic-programming',
  description: '带障碍网格路径数（LeetCode 63）：网格中存在障碍物（值为 1），遇到障碍物时路径数为 0，空间复杂度优化至一维 O(n)。',
  icon: '🚧',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握带障碍物的网格路径动态规划与状态阻断边界处理技巧',
  template: '<div id="unique-paths-ii" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
});
