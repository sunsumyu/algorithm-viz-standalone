/**
 * 链式前向星 (Chained Forward Star) 声明式可视化器
 * 核心：head[] + edge[].next 静态链表数组模拟指针、头插法 O(1) 连边、空间 O(V + E)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type RawEdge,
  type EdgeStruct,
  type ForwardStarStep,
  buildForwardStarSteps,
} from './forward-star-step-compiler';
import { ForwardStarCanvasAdapter } from '../../../core/renderers/adapters/forward-star-canvas-adapter';
import {
  FORWARD_STAR_CODE_LANGUAGES,
  FORWARD_STAR_PROBLEM_HTML,
  FORWARD_STAR_ANALYSIS_HTML,
} from './forward-star-problem-content';

export type { RawEdge, EdgeStruct, ForwardStarStep };
export { buildForwardStarSteps };
export { ForwardStarCanvasAdapter };

registerDeclarativeAlgorithm<ForwardStarStep>({
  id: 'forward-star',
  name: '链式前向星 (Chained Forward Star)',
  category: 'graph',
  aliases: ['chained-forward-star', 'class059-code01'],
  hasDeductionTree: true,
  icon: '🕸️',
  difficulty: 2,
  levelOrder: 27,
  learningGoal: '掌握静态链表思想，深刻理解 head[] 与 edge[] 的头插法 O(1) 加边及出边逆序遍历机制',
  modes: [
    { id: 'build', label: '⚡ 建图加边 (addEdge)' },
    { id: 'traverse', label: '🔍 出边遍历 (Traverse)' },
  ],
  inputs: [
    {
      id: 'input-edges',
      label: '边集 (u v w)',
      type: 'text',
      defaultValue: '2 1 5, 2 3 2, 3 4 4, 2 4 9',
      placeholder: '以逗号或空格分隔每条边',
    },
    {
      id: 'input-start-node',
      label: '遍历起点 u',
      type: 'number',
      defaultValue: 2,
    },
  ],
  presets: [
    {
      label: '头插法经典案例 (4点4边)',
      values: {
        'input-edges': '2 1 5, 2 3 2, 3 4 4, 2 4 9',
        'input-start-node': 2,
      },
    },
    {
      label: '经典有向图 (6边5点)',
      values: {
        'input-edges': '1 2 5, 1 3 2, 2 4 1, 3 2 4, 3 5 3, 4 5 6',
        'input-start-node': 1,
      },
    },
    {
      label: '密集单点多出边',
      values: {
        'input-edges': '1 2 2, 1 3 4, 1 4 6, 1 5 8, 2 5 3',
        'input-start-node': 1,
      },
    },
    {
      label: '环路拓扑',
      values: {
        'input-edges': '1 2 1, 2 3 2, 3 4 3, 4 1 4, 2 4 5',
        'input-start-node': 2,
      },
    },
  ],
  metrics: [
    { id: 'cur-action', label: '当前阶段', color: '#2563eb' },
    { id: 'edge-cnt', label: '已存边数 (cnt)', color: '#10b981' },
    { id: 'cur-pointer', label: '活动指针 (e)', color: '#d97706' },
  ],
  legend: [
    { label: '正在处理/访问边', color: '#facc15' },
    { label: '头插法新边', state: 'discovered' },
    { label: '已遍历完成边', color: '#10b981' },
  ],
  codeLanguages: FORWARD_STAR_CODE_LANGUAGES,
  problemHtml: FORWARD_STAR_PROBLEM_HTML,
  analysisHtml: FORWARD_STAR_ANALYSIS_HTML,
  generateSteps: (inputs, mode) => {
    const edgesRaw = (inputs?.['input-edges'] || '2 1 5, 2 3 2, 3 4 4, 2 4 9') as string;
    const startNodeRaw = String(inputs?.['input-start-node'] || '2');
    return buildForwardStarSteps(edgesRaw, startNodeRaw, mode || 'build');
  },
  renderCanvas: (container, step) => ForwardStarCanvasAdapter.render(container, step as ForwardStarStep),
});
