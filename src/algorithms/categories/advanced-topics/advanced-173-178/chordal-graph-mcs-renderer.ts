/**
 * Class 177: 弦图与最大势算法 MCS (Maximum Cardinality Search)
 * 完美消除序列 PEO 构造 / 洛谷 P3196 [HNOI2008] 神奇的国度
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { CHORDAL_GRAPH_MCS_CODES } from './advanced-173-178-stage-codes';
import { buildChordalMCSSteps, ChordalMCSStep } from '../../../../core/renderers/adapters/chordal-graph-mcs-177-step-compiler';
import { renderChordalMCSCanvas } from '../../../../core/renderers/adapters/chordal-graph-mcs-177-canvas-adapter';

export { buildChordalMCSSteps, type ChordalMCSStep };

export const chordalGraphMCSVisualizer = registerDeclarativeAlgorithm<ChordalMCSStep>({
  id: 'chordal-graph-mcs-177',
  name: '弦图与最大势算法 MCS (Class 177)',
  aliases: ['class177-code01', 'chordal-graph-mcs-177', 'chordal-graph'],
  category: 'graph',
  icon: '🎻',
  difficulty: 3,
  levelOrder: 177,
  description: '左程云算法通关课 Class 177：弦图与最大势算法 (MCS)。贪心构造完美消除序列 (PEO)，O(N + M) 线性求解弦图最大团、最小染色与色数。',
  learningGoal: '掌握弦图无弦环定义与完美消除序列 PEO 充要条件，深刻理解 MCS 最大势势能贪心与线性图着色',
  problemHtml: ADVANCED_173_178_PROBLEMS.chordalGraphMCS.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.chordalGraphMCS.html,
  inputs: [
    {
      id: 'preset',
      label: '图结构预设',
      type: 'select',
      defaultValue: 'chordal_5node',
      options: [
        { label: '5 节点标准弦图 (PEO: [4, 3, 2, 1, 0], 最大团: 3)', value: 'chordal_5node' },
      ],
    },
  ],
  codeLanguages: CHORDAL_GRAPH_MCS_CODES,
  generateSteps: () => buildChordalMCSSteps(),
  renderCanvas: (container, step) => renderChordalMCSCanvas(container, step),
});
