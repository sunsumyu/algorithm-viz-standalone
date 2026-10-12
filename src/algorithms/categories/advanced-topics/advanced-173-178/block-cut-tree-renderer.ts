/**
 * Class 178: 圆方树 (Block-Cut Tree / Cactus & BCC)
 * 点双连通分量缩点 / 洛谷 P5236 【模板】静态仙人掌 / 洛谷 P4630 铁人两项
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { BLOCK_CUT_TREE_CODES } from './advanced-173-178-stage-codes';
import { buildBlockCutSteps, BlockCutStep } from '../../../../core/renderers/adapters/block-cut-tree-178-step-compiler';
import { renderBlockCutCanvas } from '../../../../core/renderers/adapters/block-cut-tree-178-canvas-adapter';

export { buildBlockCutSteps, type BlockCutStep };

export const blockCutTreeVisualizer = registerDeclarativeAlgorithm<BlockCutStep>({
  id: 'block-cut-tree-178',
  name: '圆方树 Block-Cut Tree (Class 178)',
  aliases: ['class178-code01', 'block-cut-tree-178', 'cactus-block-cut-tree'],
  category: 'graph',
  icon: '🌵',
  difficulty: 3,
  levelOrder: 178,
  description: '左程云算法通关课 Class 178：圆方树 (Block-Cut Tree)。Tarjan 点双连通分量 (BCC) 缩点成方点，割点连接多方点，将仙人掌图与无向图降维为树。',
  learningGoal: '掌握极大点双连通分量判定准则与栈内节点弹出机制，深刻理解圆方树将图上路径交集转化为树上路径的代数映射',
  problemHtml: ADVANCED_173_178_PROBLEMS.blockCutTree.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.blockCutTree.html,
  inputs: [
    {
      id: 'preset',
      label: '图拓扑预设',
      type: 'select',
      defaultValue: 'cactus_two_rings',
      options: [
        { label: '双环仙人掌图 (2 个 BCC 环交于割点 V3)', value: 'cactus_two_rings' },
      ],
    },
  ],
  codeLanguages: BLOCK_CUT_TREE_CODES,
  generateSteps: () => buildBlockCutSteps(),
  renderCanvas: (container, step) => renderBlockCutCanvas(container, step),
});
