/**
 * Class 188: 强连通分量与 Tarjan 缩点 (Tarjan SCC & Condensation)
 * DFN/LOW 追溯值 + 栈维护极大强连通分量 + 缩点 DAG 化 / 洛谷 P3387 【模板】缩点
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { TARJAN_SCC_CODES } from './advanced-185-190-stage-codes';
import {
  buildTarjanSCCSteps,
  TarjanSCCStep,
} from '../../../../core/renderers/adapters/tarjan-scc-condensation-188-step-compiler';
import { renderTarjanSCCCanvas } from '../../../../core/renderers/adapters/tarjan-scc-condensation-188-canvas-adapter';

export { buildTarjanSCCSteps, type TarjanSCCStep };

export const tarjanSCCVisualizer = registerDeclarativeAlgorithm<TarjanSCCStep>({
  id: 'tarjan-scc-condensation-188',
  name: '强连通分量与 Tarjan 缩点 (Class 188)',
  aliases: ['class188-code01', 'tarjan-scc-condensation-188', 'tarjan-scc'],
  category: 'graph',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 188,
  description: '左程云算法通关课 Class 188：强连通分量与 Tarjan 缩点。DFN 时间戳与 LOW 追溯值维护，弹栈识别极大 SCC 并将有向图缩点转化为 DAG 有向无环图。',
  learningGoal: '掌握 DFN 与 LOW 的精确定义、返祖边更新准则与出栈缩点消除有向环的数学原理',
  problemHtml: ADVANCED_185_190_PROBLEMS.tarjanSCC.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.tarjanSCC.html,
  inputs: [
    {
      id: 'preset',
      label: '有向图拓扑预设',
      type: 'select',
      defaultValue: 'cycle_with_tail',
      options: [
        { label: '4 点经典环带尾图 (环: 1-2-3, 尾: 3->4)', value: 'cycle_with_tail' },
      ],
    },
  ],
  codeLanguages: TARJAN_SCC_CODES,
  generateSteps: () => buildTarjanSCCSteps(),
  renderCanvas: (container, step) => renderTarjanSCCCanvas(container, step),
});
