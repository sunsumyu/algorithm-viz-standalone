/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF SPFA) 声明式可视化器
 * 进阶网络流: 残量网络连续最短路增广 (EK/SPFA)、反向弧费用相反、最大化流的同时最小化费用 (洛谷 P3381 / 左程云 class072)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type MCMFStep, buildMCMFSteps } from './min-cost-max-flow-step-compiler';
import { MinCostMaxFlowCanvasAdapter } from '../../../core/renderers/adapters/min-cost-max-flow-canvas-adapter';
import {
  MCMF_CODE_LANGUAGES,
  MCMF_PROBLEM_HTML,
  MCMF_ANALYSIS_HTML,
} from './min-cost-max-flow-problem-content';

export type { MCMFStep };
export { buildMCMFSteps, MinCostMaxFlowCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<MCMFStep>({
  id: 'min-cost-max-flow',
  name: '最小费用最大流 (Minimum Cost Maximum Flow)',
  category: 'graph',
  aliases: ['mcmf', 'minimum-cost-maximum-flow', 'class072-code01', 'P3381'],
  hasDeductionTree: true,
  icon: '🌊',
  difficulty: 3,
  levelOrder: 88,
  learningGoal: '掌握费用流连续最短路算法设计、残量网络成对反向弧流量更新与负费用退流机制',
  badge: {
    mode: '连续最短路 · SPFA 寻费 · 成对反向弧退流',
    complexity: 'O(F · E · V) · O(V + E)',
  },
  card1Title: '🌊 残量网络与连续最短路增广沙盘',
  card2Title: '📊 费用流状态监视器 (dist, 流量, 累积费用)',
  card2Desc: '展示残量网络弧容量/流量、单位费用、SPFA 最短路径以及累积费用核算全过程',
  legend: [
    { label: '🚀 源点 S / 🏁 汇点 T', color: '#a855f7' },
    { label: '🔵 网络中继节点', color: '#0369a1' },
    { label: '🟢 当前增广路径', color: '#10b981' },
    { label: '🧱 满流饱和弧', color: '#ef4444' },
    { label: '⚡ 未饱和可行弧', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设网络结构',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '经典 4 点 5 边网络 (最大流 5, 最小费 17)', value: 'standard' },
        { label: '极简 3 边入门网络 (最大流 2, 最小费 6)', value: 'simple' },
      ],
    },
  ],
  presets: [
    { label: '经典 4 点网络 (流5, 费17)', values: { 'input-preset': 'standard' } },
    { label: '极简入门网络 (流2, 费6)', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-mcmf-flow', label: '当前最大总流量', color: '#10b981' },
    { id: 'metric-mcmf-cost', label: '累计最少总费用', color: '#f59e0b' },
    { id: 'metric-mcmf-path', label: '当前最短费用路径', color: '#38bdf8' },
    { id: 'metric-mcmf-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: MCMF_CODE_LANGUAGES,
  problemHtml: MCMF_PROBLEM_HTML,
  analysisHtml: MCMF_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'standard') as string;
    return buildMCMFSteps(preset);
  },
  renderCanvas: (container, step) => {
    MinCostMaxFlowCanvasAdapter.render(container, step as MCMFStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as MCMFStep;
    const nodes = ['S', 'A', 'B', 'T'];

    const distBadges = nodes.map((id) => {
      const d = step.distMap?.[id];
      const dStr = d === Infinity || d === undefined ? '∞' : `${d}`;
      const isEndpoint = id === 'S' || id === 'T';
      return `
        <div class="flex flex-col items-center justify-center min-w-[36px] h-7 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[10px] font-bold">
          <span class="text-[7.5px] ${isEndpoint ? 'text-purple-400' : 'text-sky-400'} leading-none">${id}</span>
          <span class="leading-tight">${dStr}</span>
        </div>
      `;
    }).join('');

    const pathStr = step.activePath && step.activePath.length > 0
      ? step.activePath.map(n => `<span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-[10px]">${n}</span>`).join('<span class="text-amber-400 text-[10px]">➔</span>')
      : '<span class="text-slate-500 text-[10.5px]">当前无活跃路径</span>';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-2 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] font-bold text-sky-400">各节点费用距离 dist[]:</span>
            <div class="flex gap-1">${distBadges}</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-amber-400 font-bold">当前增广路径:</span>
            <div class="flex items-center gap-1">${pathStr}</div>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-bold">累积求解结果:</span>
            <span class="font-mono font-bold text-emerald-400">总流量: ${step.totalFlow} | 总费用: ¥${step.totalCost}</span>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as MinCostMaxFlowVisualizer };
