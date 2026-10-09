/**
 * 二分图博弈 (Game on Bipartite Graph) 声明式可视化器
 * 进阶博弈论: 必定非最大匹配点为必胜/必败态、交错轨搜索与充要条件判定 (洛谷 P4055 [JSOI2009] 游戏)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type BipartiteGameStep, buildBipartiteGameSteps } from './bipartite-game-step-compiler';
import { BipartiteGameCanvasAdapter } from '../../../core/renderers/adapters/bipartite-game-canvas-adapter';
import {
  BIPARTITE_GAME_CODE_LANGUAGES,
  BIPARTITE_GAME_PROBLEM_HTML,
  BIPARTITE_GAME_ANALYSIS_HTML,
} from './bipartite-game-problem-content';

export type { BipartiteGameStep };
export { buildBipartiteGameSteps, BipartiteGameCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<BipartiteGameStep>({
  id: 'bipartite-game',
  name: '二分图博弈 (Bipartite Graph Game)',
  category: 'graph',
  aliases: ['game-on-bipartite-graph', 'jsoi2009-game', 'P4055'],
  hasDeductionTree: true,
  icon: '♟️',
  difficulty: 3,
  levelOrder: 67,
  learningGoal: '掌握二分图博弈判定定理（属于所有最大匹配点为必胜态）、交错轨增广搜索及算法实现',
  badge: {
    mode: '匈牙利 + 交错轨判定',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '♟️ 二分图博弈拓扑与最大匹配沙盘',
  card2Title: '📊 匹配与交错轨状态监视器 (matchLeft, matchRight, canUnmatched)',
  card2Desc: '逐行追踪匈牙利增广配对、未匹配点交错轨搜索与必定属于最大匹配的先手必胜点判定',
  legend: [
    { label: '左部点 (L)', color: '#0284c7' },
    { label: '右部点 (R)', color: '#7c3aed' },
    { label: '👑 先手必胜点', color: '#f59e0b' },
    { label: '🔴 匹配边 (红实线)', color: '#f43f5e' },
    { label: '⚪ 非匹配边 (灰虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '图预设模型',
      type: 'select',
      defaultValue: 'five_nodes',
      options: [
        { label: '5 节点模型 (先手必胜点: 2)', value: 'five_nodes' },
        { label: '6 节点模型 (先手必胜点: 3)', value: 'six_nodes' },
      ],
    },
  ],
  presets: [
    { label: '5 节点模型', values: { 'input-preset': 'five_nodes' } },
    { label: '6 节点模型', values: { 'input-preset': 'six_nodes' } },
  ],
  metrics: [
    { id: 'metric-cur-start', label: '当前分析节点', color: '#f59e0b' },
    { id: 'metric-win-status', label: '先手胜负态', color: '#10b981' },
    { id: 'metric-win-set', label: '先手必胜点集', color: '#38bdf8' },
    { id: 'metric-game-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: BIPARTITE_GAME_CODE_LANGUAGES,
  problemHtml: BIPARTITE_GAME_PROBLEM_HTML,
  analysisHtml: BIPARTITE_GAME_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'five_nodes') as string;
    return buildBipartiteGameSteps(preset);
  },
  renderCanvas: (container, step) => {
    BipartiteGameCanvasAdapter.render(container, step as BipartiteGameStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as BipartiteGameStep;
    const isSixNode = step.matchRightArray.length > 5;
    const leftIndices = isSixNode ? [1, 2, 3] : [1, 2, 5];
    const rightIndices = isSixNode ? [4, 5, 6] : [3, 4];

    const renderRow = (name: string, arr: any[], indices: number[], color: string, formatVal: (v: any) => string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx];
          return `
            <div class="flex flex-col items-center justify-center min-w-[32px] h-7 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[10px] font-bold">
              <span class="text-[7.5px] text-slate-400 leading-none">[${idx}]</span>
              <span class="leading-tight">${formatVal(val)}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div class="flex items-center gap-2">
          <span class="font-mono text-[11px] font-bold w-36 ${color}">${name}:</span>
          <div class="flex gap-1">${cells}</div>
        </div>
      `;
    };

    const winSetText = step.winningStartNodes.length > 0 ? `{ ${step.winningStartNodes.join(', ')} }` : '空集 ∅';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          ${renderRow('matchLeft[] (左配右)', step.matchLeftArray, leftIndices, 'text-sky-400', (v) => (v ? `R${v}` : '未配'))}
          ${renderRow('matchRight[] (右配左)', step.matchRightArray, rightIndices, 'text-purple-400', (v) => (v ? `L${v}` : '未配'))}
          ${renderRow('canBeUnmatched (可解绑)', step.canBeUnmatchedArray, leftIndices, 'text-amber-400', (v) => (v ? 'T' : 'F'))}
          <div class="flex items-center justify-between pt-1.5 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-amber-400 font-bold">👑 先手必胜起点集:</span>
            <span class="font-mono text-emerald-400 font-bold">${winSetText}</span>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-bold">博弈胜负态:</span>
            <span class="font-bold ${step.isWinState ? 'text-emerald-400' : 'text-slate-400'}">${step.isWinState ? '✓ 存在先手必胜点' : '推导中 / 后手必胜'}</span>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as BipartiteGameVisualizer };
