/**
 * Class 180: 动态点分治 / 点分树 (Dynamic Centroid Tree)
 * 重心树父子关系 + 树高 O(log N) 倍增上跳 + 容斥修正 / 洛谷 P6329 【模板】点分树
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { DYNAMIC_CENTROID_TREE_CODES } from './advanced-179-184-stage-codes';
import {
  buildDynamicCentroidSteps,
  DynamicCentroidStep,
} from '../../../../core/renderers/adapters/dynamic-centroid-tree-180-step-compiler';
import { renderDynamicCentroidCanvas } from '../../../../core/renderers/adapters/dynamic-centroid-tree-180-canvas-adapter';

export { buildDynamicCentroidSteps, type DynamicCentroidStep };

export const dynamicCentroidTreeVisualizer = registerDeclarativeAlgorithm<DynamicCentroidStep>({
  id: 'dynamic-centroid-tree-180',
  name: '动态点分治 / 点分树 (Dynamic Centroid Tree / Class 180)',
  aliases: ['class180-code01', 'dynamic-centroid-tree-180', 'point-divide-tree'],
  category: 'tree',
  icon: '🌳',
  difficulty: 3,
  levelOrder: 180,
  description: '左程云算法通关课 Class 180：动态点分治 (点分树)。将点分治构建为树高不超过 O(log N) 的重构树，向上容斥支持动态单点修改与邻域点权和查询。',
  learningGoal: '掌握点分树父子拓扑维护、两层动态数据结构容斥抵消与 O(log^2 N) 向上逐层上跳',
  problemHtml: ADVANCED_179_184_PROBLEMS.dynamicCentroidTree.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.dynamicCentroidTree.html,
  presets: [
    { label: '单点修改 update(3, +10) -> 邻域查询 query(5, k=2)', values: { preset: 'update3_query5' } },
  ],
  codeLanguages: DYNAMIC_CENTROID_TREE_CODES,
  generateSteps: () => buildDynamicCentroidSteps(),
  renderCanvas: (container, step) => renderDynamicCentroidCanvas(container, step),
});
