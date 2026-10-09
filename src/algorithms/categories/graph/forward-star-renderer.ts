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
      defaultValue: '1 2 5, 1 3 2, 2 4 1, 3 2 4, 3 5 3, 4 5 6',
      placeholder: '以逗号或空格分隔每条边',
    },
    {
      id: 'input-start-node',
      label: '遍历起点 u',
      type: 'number',
      defaultValue: 1,
    },
  ],
  presets: [
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
    const edgesRaw = (inputs?.['input-edges'] || '1 2 5, 1 3 2, 2 4 1, 3 2 4, 3 5 3, 4 5 6') as string;
    const startNodeRaw = String(inputs?.['input-start-node'] || '1');
    return buildForwardStarSteps(edgesRaw, startNodeRaw, mode || 'build');
  },
  renderCanvas: (container, step) => ForwardStarCanvasAdapter.render(container, step as ForwardStarStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as ForwardStarStep;
    const headChips = step.allNodes.map((u) => {
      const hVal = step.head[u] ?? -1;
      const isCur = step.curNode === u;
      const bg = isCur ? 'bg-sky-950/50 border-sky-500 text-sky-200' : 'bg-slate-900/60 border-slate-700 text-slate-300';
      return `
        <div class="flex flex-col items-center px-1.5 py-0.5 rounded border ${bg} text-xs font-mono">
          <span class="text-[9px] text-slate-400">u=${u}</span>
          <span class="font-bold">${hVal === -1 ? '-1' : `#${hVal}`}</span>
        </div>
      `;
    }).join('');

    const edgeRows = step.edges.slice(0, 5).map((ed, i) => {
      const isCur = step.curEdgeIndex === i;
      const isTraversed = step.traversedEdges.includes(i);
      const textCol = isCur ? 'text-amber-400 font-bold' : isTraversed ? 'text-emerald-400' : 'text-slate-300';
      return `
        <div class="flex justify-between items-center py-0.5 border-b border-slate-800/60 font-mono text-[11px] ${textCol}">
          <span>#${i} (${ed.u}➔${ed.to})</span>
          <span class="text-purple-400">next: ${ed.next === -1 ? '-1' : `#${ed.next}`}</span>
          <span class="text-emerald-400">w:${ed.weight}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex items-center justify-between">
          <span class="font-bold text-sky-400">head[u] 表头数组</span>
          <span class="text-[10px] text-slate-400">记录首条出边索引</span>
        </div>
        <div class="flex gap-1.5 flex-wrap">${headChips}</div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-700/60">
          <span class="font-bold text-amber-400">edge[] 结构体内存池 (前 5 条)</span>
          <span class="text-emerald-400">共 ${step.edges.length} 条</span>
        </div>
        <div class="flex flex-col">${edgeRows || '<span class="text-slate-500 py-1">内存池为空</span>'}</div>
      </div>
    `;
  },
});
