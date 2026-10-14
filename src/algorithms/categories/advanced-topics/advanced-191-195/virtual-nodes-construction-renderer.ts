/**
 * Class 192: 虚点优化建图与虚拟源汇 (Virtual Nodes Graph Construction)
 * 集合间中转虚点 + 边数爆炸降维 / 洛谷 P1983 车站分级
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_191_195_PROBLEMS } from './advanced-191-195-problem-content';
import { VIRTUAL_NODES_CODES } from './advanced-191-195-stage-codes';
import {
  buildVirtualNodesSteps,
  VirtualNodesStep,
} from '../../../../core/renderers/adapters/graph-construction-optimization-compiler';
import { renderVirtualNodesCanvas } from '../../../../core/renderers/adapters/graph-construction-optimization-canvas-adapter';

export { buildVirtualNodesSteps, type VirtualNodesStep };

export const virtualNodesConstructionVisualizer = registerDeclarativeAlgorithm<VirtualNodesStep>({
  id: 'virtual-nodes-construction-192',
  name: '虚点优化建图与虚拟源汇 (Class 192)',
  aliases: ['class192-code01', 'virtual-nodes-construction-192', 'virtual-nodes-graph'],
  category: 'graph',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 192,
  description: '左程云算法通关课 Class 192：虚点优化建图与虚拟源汇。集合向集合全连边引发边数爆炸，引入虚拟中转节点将 O(|A|*|B|) 边数降维为 O(|A|+|B|)。',
  learningGoal: '深刻理解中转虚点解耦两集合全连接的机制，掌握虚拟源汇在拓扑排序、网络流与最短路中的应用',
  problemHtml: ADVANCED_191_195_PROBLEMS.virtualNodesConstruction.html,
  analysisHtml: ADVANCED_191_195_PROBLEMS.virtualNodesConstruction.html,
  presets: [
    { label: 'Set A (3点) -> Set B (4点): 12边降至7边', values: { preset: 'set_3_4' } },
  ],
  codeLanguages: VIRTUAL_NODES_CODES,
  generateSteps: () => buildVirtualNodesSteps(),
  renderCanvas: (container, step) => renderVirtualNodesCanvas(container, step),
});
