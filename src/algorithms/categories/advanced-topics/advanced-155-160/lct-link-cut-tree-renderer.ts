/**
 * Class 155: 动态树 Link-Cut Tree (LCT)
 * Tarjan 发明 / 洛谷 P3690 【模板】动态树 LCT
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { LCT_CODES } from './advanced-155-160-stage-codes';
import { LCTStep, buildLCTSteps } from '../../../../core/renderers/adapters/lct-step-compiler';
import { renderLCTCanvas } from '../../../../core/renderers/adapters/lct-canvas-adapter';

export type { LCTStep };
export { buildLCTSteps };

export const lctVisualizer = registerDeclarativeAlgorithm<LCTStep>({
  id: 'lct-link-cut-tree-155',
  name: '动态树 Link-Cut Tree (Class 155)',
  aliases: ['class155-code01', 'lct', 'lct-link-cut-tree-155', 'link-cut-tree'],
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 155,
  description: '左程云算法通关课 Class 155：动态树 Link-Cut Tree (LCT)。Tarjan 发明，基于实链剖分与辅助 Splay 树，支持动态加边、动态删边与路径查询。',
  learningGoal: '深刻理解 LCT 实链剖分 Preferred Path 与辅助 Splay 树的对应关系，掌握 access, makeroot, link, cut 核心四操作',
  problemHtml: ADVANCED_155_160_PROBLEMS.lct.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.lct.html,
  presets: [
    { label: '5 节点标准树 (边: 1-2, 1-3, 2-4, 2-5)', values: { preset: 'tree_5_nodes' } },
  ],
  codeLanguages: LCT_CODES,
  generateSteps: () => {
    return buildLCTSteps(5, [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 2, v: 5 },
    ]);
  },
  renderCanvas: renderLCTCanvas,
});
