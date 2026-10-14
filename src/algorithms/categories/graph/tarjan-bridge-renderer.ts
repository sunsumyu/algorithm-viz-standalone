/**
 * 无向图割点与桥 (Tarjan Cut Vertices & Bridges) 声明式可视化器
 * 图论经典: 时间戳 dfn[u] 与追溯值 low[u]、割点判定 low[v] >= dfn[u]、桥/割边判定 low[v] > dfn[u] (洛谷 P3388 / 左程云 class068)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type BridgeStep, buildTarjanBridgeSteps } from './tarjan-bridge-step-compiler';
import { TarjanBridgeCanvasAdapter } from '../../../core/renderers/adapters/tarjan-bridge-canvas-adapter';
import {
  TARJAN_BRIDGE_PROBLEM_HTML,
  TARJAN_BRIDGE_ANALYSIS_HTML,
  TARJAN_BRIDGE_CODE_LANGUAGES,
} from './tarjan-bridge-problem-content';

export type { BridgeStep };
export { buildTarjanBridgeSteps, TarjanBridgeCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<BridgeStep>({
  id: 'tarjan-bridge',
  name: 'Tarjan 割点与桥 (Cut Vertices & Bridges)',
  category: 'graph',
  aliases: ['class068-code01', 'tarjan-bridge-cut', 'P3388', 'leetcode-1192'],
  hasDeductionTree: true,
  icon: '🌉',
  difficulty: 3,
  levelOrder: 68,
  learningGoal: '掌握无向图 DFS 生成树性质、low/dfn 判定割点与桥定理及双连通分量思想',
  badge: {
    mode: 'Tarjan 递归回溯 · 树边与返祖边判定',
    complexity: 'O(V + E) · O(V)',
  },
  card1Title: '🌉 无向图拓扑与割裂结构沙盘',
  card2Title: '📊 Tarjan 判定监视器 (dfn, low, isCut, bridges)',
  card2Desc: '展示时间戳 dfn 与追溯值 low、割点条件 low[v] >= dfn[u] 与割边桥条件 low[v] > dfn[u]',
  legend: [
    { label: '🚩 关键割点', color: '#f43f5e' },
    { label: '🌉 关键割边 (桥)', color: '#f59e0b' },
    { label: '⚡ 当前 DFS 访问节点', color: '#facc15' },
    { label: '⚪ 普通连通节点', color: '#1e293b' },
  ],
  presets: [
    { label: '5 节点环桥图', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点环桥图', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-cut-count', label: '已确认割点数', color: '#ef4444' },
    { id: 'metric-bridge-count', label: '已确认桥边数', color: '#f59e0b' },
    { id: 'metric-cur-node', label: '当前 DFS 节点', color: '#38bdf8' },
    { id: 'metric-tarjan-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TARJAN_BRIDGE_CODE_LANGUAGES,
  problemHtml: TARJAN_BRIDGE_PROBLEM_HTML,
  analysisHtml: TARJAN_BRIDGE_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'classic_5node') as string;
    return buildTarjanBridgeSteps(preset);
  },
  renderCanvas: (container, step) => {
    TarjanBridgeCanvasAdapter.render(container, step as BridgeStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as BridgeStep;
    const n = Object.keys(step.dfnMap).length;
    const indices = Array.from({ length: n }, (_, i) => i + 1);

    const renderRow = (name: string, map: Record<number, any>, color: string) => {
      const cells = indices
        .map((idx) => {
          const val = map[idx];
          const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
          return `
            <div class="flex flex-col items-center justify-center min-w-[30px] h-7 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[10px] font-bold">
              <span class="text-[7.5px] text-slate-400 leading-none">N[${idx}]</span>
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

    const cutMap: Record<number, boolean> = {};
    for (const idx of indices) cutMap[idx] = step.cutNodes.includes(idx);

    const cutBadges = step.cutNodes.length > 0
      ? step.cutNodes.map((u) => `<span class="px-1.5 py-0.5 rounded border border-rose-500 bg-rose-950/60 text-rose-300 font-mono text-[10.5px]">🚩 Node ${u}</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">未发现割点</span>';

    const bridgeBadges = step.bridgeEdges.length > 0
      ? step.bridgeEdges.map(([u, v]) => `<span class="px-1.5 py-0.5 rounded border border-amber-500 bg-amber-950/60 text-amber-300 font-mono text-[10.5px]">🌉 (${u}, ${v})</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">未发现桥边</span>';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          ${renderRow('dfn[] (时间戳)', step.dfnMap, 'text-sky-400')}
          ${renderRow('low[] (追溯值)', step.lowMap, 'text-amber-400')}
          ${renderRow('isCut[] (割点)', cutMap, 'text-rose-400')}
          <div class="flex items-center gap-2 mt-1 pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-rose-400 font-bold shrink-0">确认割点:</span>
            <div class="flex flex-wrap gap-1">${cutBadges}</div>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="text-amber-400 font-bold shrink-0">确认桥边:</span>
            <div class="flex flex-wrap gap-1">${bridgeBadges}</div>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as TarjanBridgeVisualizer };
