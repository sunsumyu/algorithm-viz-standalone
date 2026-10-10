/**
 * 有向图强连通性检测 (Kosaraju 双 DFS) 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 纯声明式元数据配置与委托挂载，身材保持在 65 行内
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  STRONGLY_CONNECTED_PROBLEM_HTML,
  STRONGLY_CONNECTED_ANALYSIS_HTML,
  STRONGLY_CONNECTED_CODE_LANGUAGES,
} from './strongly-connected-problem-content';
import {
  SCCStep,
  SCC_NODES,
  SCC_ORIGINAL_EDGES,
  SCC_POSITIONS,
  buildSCCSteps,
  withMetrics,
} from './strongly-connected-step-compiler';
import {
  renderStronglyConnectedCanvas,
  renderStronglyConnectedCustomMetrics,
} from '../../../core/renderers/adapters/strongly-connected-canvas-adapter';

registerDeclarativeAlgorithm({
  id: 'strongly-connected',
  name: '有向图强连通性检测 (Kosaraju)',
  category: 'graph',
  description: 'Kosaraju 双向 DFS 遍历：正向 DFS 验证可达全集，反向图 DFS 验证全源互通性',
  icon: '🔗',
  difficulty: 2,
  levelOrder: 25,
  learningGoal: '掌握利用有向图反转与两次 DFS 遍历高效判定强连通性的线性时间算法',
  inputs: [],
  metrics: [
    { id: 'stage', label: '当前阶段', color: '#7e22ce' },
    { id: 'cur-node', label: '当前访问节点', color: '#2563eb' },
    { id: 'visited', label: '已访问计数', color: '#22c55e' },
    { id: 'is-scc', label: '强连通判定', color: '#16a34a' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', state: 'sorted' },
    { label: '反向图边', state: 'secondary' },
  ],
  codeLanguages: STRONGLY_CONNECTED_CODE_LANGUAGES,
  problemHtml: STRONGLY_CONNECTED_PROBLEM_HTML,
  analysisHtml: STRONGLY_CONNECTED_ANALYSIS_HTML,
  generateSteps: () => withMetrics(buildSCCSteps()),
  renderCanvas: (container, step) => renderStronglyConnectedCanvas(container, step as SCCStep),
  renderCustomMetrics: (container, step) => renderStronglyConnectedCustomMetrics(container, step as SCCStep),
});

export {
  buildSCCSteps,
  type SCCStep,
  SCC_NODES,
  SCC_ORIGINAL_EDGES,
  SCC_POSITIONS,
};
