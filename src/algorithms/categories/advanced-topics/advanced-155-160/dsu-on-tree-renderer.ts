/**
 * Class 158: 树上启发式合并 (DSU on Tree)
 * CF600E Lomsat gelh / 树上重链调度与 O(N log N) 离线优雅统计
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { DSU_ON_TREE_CODES } from './advanced-155-160-stage-codes';
import { DSUStep, buildDSUSteps } from '../../../../core/renderers/adapters/dsu-on-tree-158-step-compiler';
import { renderDSUOnTree158Canvas } from '../../../../core/renderers/adapters/dsu-on-tree-158-canvas-adapter';

export type { DSUStep };
export { buildDSUSteps };

export const dsuOnTreeVisualizer = registerDeclarativeAlgorithm<DSUStep>({
  id: 'dsu-on-tree-158',
  name: '树上启发式合并 DSU on Tree (Class 158)',
  aliases: ['class158-code01', 'dsu-on-tree-158'],
  category: 'tree',
  icon: '🌳',
  difficulty: 3,
  levelOrder: 158,
  description: '左程云算法通关课 Class 158：树上启发式合并 (DSU on Tree)。轻儿子清空、重儿子保留，O(N log N) 优雅解决树上子树无修改离线统计。',
  learningGoal: '深刻理解轻重儿子差别对待调度策略，掌握重儿子保留全局桶与轻儿子暴力并入的均摊 O(N log N) 证明',
  problemHtml: ADVANCED_155_160_PROBLEMS.dsuOnTree.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.dsuOnTree.html,
  inputs: [
    {
      id: 'demoScenario',
      label: '树上启发式场景',
      type: 'select',
      defaultValue: 'standard_dsu',
      options: [
        { label: '5 节点颜色树 (轻儿子 3 清空，重儿子 2 保留)', value: 'standard_dsu' },
      ],
    },
  ],
  codeLanguages: DSU_ON_TREE_CODES,
  generateSteps: () => {
    return buildDSUSteps();
  },
  renderCanvas: renderDSUOnTree158Canvas,
});
