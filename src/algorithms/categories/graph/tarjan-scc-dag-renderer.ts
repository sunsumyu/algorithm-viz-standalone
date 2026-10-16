/**
 * Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & DAG Condensation) 声明式可视化器
 * 进阶图论: 时间戳 dfn[u] 与追溯值 low[u]、栈维护强连通节点、缩点重建 DAG (洛谷 P3387 / 左程云 class066)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type TarjanSCCStep, buildTarjanSCCSteps } from './tarjan-scc-dag-step-compiler';
import { TarjanSCCDagCanvasAdapter } from '../../../core/renderers/adapters/tarjan-scc-dag-canvas-adapter';
import {
  TARJAN_SCC_DAG_PROBLEM_HTML,
  TARJAN_SCC_DAG_ANALYSIS_HTML,
  TARJAN_SCC_DAG_CODE_LANGUAGES,
} from './tarjan-scc-dag-problem-content';

export type { TarjanSCCStep };
export { buildTarjanSCCSteps, TarjanSCCDagCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<TarjanSCCStep>({
  id: 'tarjan-scc-dag',
  name: 'Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC)',
  category: 'graph',
  aliases: ['tarjan-scc-dag', 'tarjan-condensation-dag', 'P3387', 'luogu-p3387'],
  hasDeductionTree: true,
  icon: '🧬',
  difficulty: 3,
  levelOrder: 62,
  learningGoal: '掌握 Tarjan 算法求强连通分量原理、dfn/low 数组性质及缩点建 DAG 方法',
  badge: {
    mode: 'Tarjan 栈深度优先 · 缩点有向无环图',
    complexity: 'O(V + E) · O(V)',
  },
  card1Title: '🧬 原图拓扑与 DAG 缩点重构舱',
  card2Title: '📊 Tarjan 状态监视器 (dfn, low, inStack, sccId)',
  card2Desc: '展示时间戳 dfn 与追溯值 low 的回溯更新、栈维护强连通节点与跨分量 DAG 缩点重建',
  legend: [
    { label: 'SCC #1 强连通分量', color: '#059669' },
    { label: 'SCC #2 强连通分量', color: '#7c3aed' },
    { label: '⚡ 当前递归节点', color: '#f59e0b' },
    { label: '📥 处于辅助栈中', color: '#38bdf8' },
  ],
  presets: [
    { label: '5 节点经典双环', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点单环出度', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-scc-count', label: '强连通分量数', color: '#10b981' },
    { id: 'metric-stack-len', label: '当前在栈节点数', color: '#38bdf8' },
    { id: 'metric-cur-node', label: '当前 DFS 节点', color: '#f59e0b' },
    { id: 'metric-tarjan-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TARJAN_SCC_DAG_CODE_LANGUAGES,
  problemHtml: TARJAN_SCC_DAG_PROBLEM_HTML,
  analysisHtml: TARJAN_SCC_DAG_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'classic_5node') as string;
    return buildTarjanSCCSteps(preset);
  },
  renderCanvas: (container, step) => {
    TarjanSCCDagCanvasAdapter.render(container, step as TarjanSCCStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as TarjanSCCStep;
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

    const sccItems = step.sccList
      .map((comp, idx) => {
        const sccNum = idx + 1;
        const col = sccNum === 1 ? 'border-emerald-500 text-emerald-400' : 'border-purple-500 text-purple-400';
        return `<span class="px-1.5 py-0.5 rounded border bg-slate-900 font-mono text-[10.5px] ${col}">SCC #${sccNum}: {${comp.join(',')}}</span>`;
      })
      .join(' ');

    const dagEdges = step.condensedEdges.length > 0
      ? step.condensedEdges.map(([fu, fv]) => `<span class="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-600 text-sky-400 font-mono text-[10.5px]">SCC #${fu} ➔ #${fv}</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">跨分量边推导中...</span>';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          ${renderRow('dfn[] (时间戳)', step.dfnMap, 'text-sky-400')}
          ${renderRow('low[] (追溯值)', step.lowMap, 'text-amber-400')}
          ${renderRow('inStack[] (在栈)', step.inStackMap, 'text-emerald-400')}
          ${renderRow('sccId[] (分量号)', step.sccIdMap, 'text-purple-400')}
          <div class="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-sky-400 font-bold">辅助栈 [栈底➔栈顶]:</span>
            <span class="font-mono text-slate-200">[ ${step.tarjanStack.join(' ➔ ') || '空'} ]</span>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="text-emerald-400 font-bold shrink-0">已结算 SCC:</span>
            <div class="flex flex-wrap gap-1">${sccItems || '<span class="text-slate-500">待结算</span>'}</div>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="text-sky-400 font-bold shrink-0">DAG 缩点边:</span>
            <div class="flex flex-wrap gap-1">${dagEdges}</div>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as TarjanSCCDAGVisualizer };
