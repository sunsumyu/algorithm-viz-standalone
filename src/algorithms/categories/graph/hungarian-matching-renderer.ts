/**
 * 匈牙利算法二分图最大匹配 (Hungarian Algorithm - Maximum Bipartite Matching) 声明式可视化器
 * 进阶图论: 增广路探索、交错路寻找、协商腾位与反向边翻转、增广路定理 (洛谷 P3386 / 左程云 class069)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type HungarianStep, buildHungarianSteps } from './hungarian-matching-step-compiler';
import { HungarianMatchingCanvasAdapter } from '../../../core/renderers/adapters/hungarian-matching-canvas-adapter';
import {
  HUNGARIAN_PROBLEM_HTML,
  HUNGARIAN_ANALYSIS_HTML,
  HUNGARIAN_CODE_LANGUAGES,
} from './hungarian-matching-problem-content';

export type { HungarianStep };
export { buildHungarianSteps, HungarianMatchingCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<HungarianStep>({
  id: 'hungarian-matching',
  name: '二分图最大匹配 (Hungarian Algorithm)',
  category: 'graph',
  aliases: ['class069-code01', 'hungarian-algorithm', 'bipartite-matching', 'P3386'],
  hasDeductionTree: true,
  icon: '💘',
  difficulty: 3,
  levelOrder: 23,
  learningGoal: '深刻理解增广路定理、交错路的寻找方式以及递归协商腾位的本质机制',
  badge: {
    mode: '交错路 DFS 递归让位 · 增广路反转',
    complexity: 'O(V · E) · O(V)',
  },
  card1Title: '💘 二分图拓扑与增广交错沙盘',
  card2Title: '📊 匈牙利匹配监视器 (match, visited, 增广路)',
  card2Desc: '展示增广路交错探索、已配对节点让位腾位递归以及最大匹配对数累加',
  legend: [
    { label: '💖 已建立匹配边', color: '#10b981' },
    { label: '⚡ 当前探查增广边', color: '#f59e0b' },
    { label: '🚨 腾位冲突原配', color: '#f43f5e' },
    { label: '⚪ 未配意向边', color: '#334155' },
  ],
  presets: [
    { label: '4 节点经典图', values: { 'input-preset': 'four_nodes' } },
    { label: '3 节点轻量图', values: { 'input-preset': 'three_nodes' } },
  ],
  metrics: [
    { id: 'metric-hungarian-left', label: '当前探索左节点', color: '#38bdf8' },
    { id: 'metric-hungarian-count', label: '累计匹配对数', color: '#10b981' },
    { id: 'metric-hungarian-path', label: '当前交错增广路', color: '#f59e0b' },
    { id: 'metric-hungarian-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: HUNGARIAN_CODE_LANGUAGES,
  problemHtml: HUNGARIAN_PROBLEM_HTML,
  analysisHtml: HUNGARIAN_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'four_nodes') as string;
    return buildHungarianSteps(preset);
  },
  renderCanvas: (container, step) => {
    HungarianMatchingCanvasAdapter.render(container, step as HungarianStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as HungarianStep;
    const n = step.matchArray.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const renderRow = (name: string, arr: any[], color: string, formatVal: (v: any) => string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx];
          const displayVal = formatVal(val);
          return `
            <div class="flex flex-col items-center justify-center min-w-[32px] h-7 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[10px] font-bold">
              <span class="text-[7.5px] text-slate-400 leading-none">R[${idx}]</span>
              <span class="leading-tight">${displayVal}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div class="flex items-center gap-2">
          <span class="font-mono text-[11px] font-bold w-32 ${color}">${name}:</span>
          <div class="flex gap-1">${cells}</div>
        </div>
      `;
    };

    const pathHtml = step.curAugmentPath.length > 0
      ? step.curAugmentPath.map((node, idx) => `
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${node.startsWith('L') ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}">${node}</span>
          ${idx < step.curAugmentPath.length - 1 ? '<span class="text-amber-400 text-[10px]">➔</span>' : ''}
        `).join('')
      : '<span class="text-slate-500 text-[10.5px]">当前无活跃增广路</span>';

    const matchedPairsHtml = step.matchedEdges.length > 0
      ? step.matchedEdges.map(([lu, rv]) => `<span class="px-1.5 py-0.5 rounded border border-emerald-600 bg-emerald-950/60 text-emerald-300 font-mono text-[10.5px]">${lu} 💖 ${rv}</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">暂无匹配</span>';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          ${renderRow('match[] (右部配对)', step.matchArray, 'text-emerald-400', (v) => (v === -1 ? '未配' : `L${v}`))}
          ${renderRow('visited[] (本轮探查)', step.visitedArray, 'text-sky-400', (v) => (v ? 'T' : 'F'))}
          <div class="flex items-center gap-2 mt-1 pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-amber-400 font-bold shrink-0">当前增广路径:</span>
            <div class="flex flex-wrap items-center gap-1">${pathHtml}</div>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="text-emerald-400 font-bold shrink-0">已确立匹配:</span>
            <div class="flex flex-wrap gap-1">${matchedPairsHtml}</div>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as HungarianMatchingVisualizer };
