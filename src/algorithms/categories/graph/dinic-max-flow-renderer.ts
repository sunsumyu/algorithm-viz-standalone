/**
 * Dinic 最大流与残量网络 (Dinic Max Flow) 声明式可视化器
 * 进阶网络流: BFS 分层网络 depth[u]、当前弧优化 cur[u]、多路增广 DFS 阻塞流 (洛谷 P3376)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type DinicStep, buildDinicSteps } from './dinic-max-flow-step-compiler';
import { DinicMaxFlowCanvasAdapter } from '../../../core/renderers/adapters/dinic-max-flow-canvas-adapter';
import {
  DINIC_MAX_FLOW_PROBLEM_HTML,
  DINIC_MAX_FLOW_ANALYSIS_HTML,
  DINIC_MAX_FLOW_CODE_LANGUAGES,
} from './dinic-max-flow-problem-content';

export type { DinicStep };
export { buildDinicSteps, DinicMaxFlowCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<DinicStep>({
  id: 'dinic-max-flow',
  name: 'Dinic 网络最大流 (Dinic Max Flow)',
  category: 'graph',
  aliases: ['dinic', 'P3376'],
  hasDeductionTree: true,
  icon: '🌊',
  difficulty: 3,
  levelOrder: 24,
  learningGoal: '掌握分层图构建思想、成对反向弧退流机制、当前弧指针优化以及阻塞流增广策略',
  badge: {
    mode: 'BFS 层次图 · 当前弧优化 · 多路增广',
    complexity: 'O(V² · E) · O(V + E)',
  },
  card1Title: '🌊 残量网络与多路增广阻塞流舱',
  card2Title: '📊 网络流状态监视器 (level[], cur[], 最大流)',
  card2Desc: '展示 BFS 层次图划分 level[u]、当前弧优化指针 cur[u] 与多路阻塞流增广全流程',
  legend: [
    { label: '🌊 已饱和满载边 (flow = cap)', state: 'swapping' },
    { label: '💧 部分载流边 (flow < cap)', state: 'scanning' },
    { label: '⚪ 零流量空载边', color: '#64748b' },
    { label: '⚡ 当前增广路径阻塞流', color: '#f59e0b' },
  ],
  presets: [
    { label: '菱形网络 (最大流 20)', values: { 'input-preset': 'diamond' } },
    { label: '交叉网络 (最大流 18)', values: { 'input-preset': 'cross' } },
  ],
  metrics: [
    { id: 'metric-dinic-level', label: '汇点层次状态', color: '#38bdf8' },
    { id: 'metric-dinic-max-flow', label: '累计最大流', color: '#10b981' },
    { id: 'metric-dinic-path', label: '当前增广路径', color: '#f59e0b' },
    { id: 'metric-dinic-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: DINIC_MAX_FLOW_CODE_LANGUAGES,
  problemHtml: DINIC_MAX_FLOW_PROBLEM_HTML,
  analysisHtml: DINIC_MAX_FLOW_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'diamond') as string;
    return buildDinicSteps(preset);
  },
  renderCanvas: (container, step) => {
    DinicMaxFlowCanvasAdapter.render(container, step as DinicStep, (s) => (Visualizer as any).renderStep?.(s));
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as DinicStep;
    const nodes = ['S', 'A', 'B', 'T'];

    const renderRow = (name: string, arr: number[], color: string) => {
      const cells = nodes
        .map((k, idx) => {
          const val = arr[idx] ?? 0;
          return `
            <div class="flex flex-col items-center justify-center min-w-[36px] h-7 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[10px] font-bold">
              <span class="text-[7.5px] text-slate-400 leading-none">${k}</span>
              <span class="leading-tight">${val}</span>
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

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          ${renderRow('depth[] (分层深度)', step.levelArray, 'text-sky-400')}
          ${renderRow('cur[] (当前弧优化)', step.curArray, 'text-amber-400')}
          <div class="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-emerald-400 font-bold">当前全网最大流:</span>
            <strong class="text-emerald-400 font-mono text-xs">${step.curMaxFlow} 单位</strong>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as DinicMaxFlowVisualizer };
