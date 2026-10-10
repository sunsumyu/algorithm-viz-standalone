/**
 * 网络流最大权闭合子图 (Max-Weight Closure of Directed Graph) 声明式可视化器
 * 进阶网络流: 正权点连源点 S、负权点连汇点 T、依赖边容量无穷大、最大权 = 正权和 - 最小割 (洛谷 P2762 太空飞行计划 / 左程云 class072)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type ClosureStep, buildMaxWeightClosureSteps } from './max-weight-closure-step-compiler';
import { renderMaxWeightClosureCanvas } from '../../../core/renderers/adapters/max-weight-closure-canvas-adapter';
import {
  MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
  MAX_WEIGHT_CLOSURE_PROBLEM_HTML,
  MAX_WEIGHT_CLOSURE_ANALYSIS_HTML,
} from './max-weight-closure-problem-content';

export type { ClosureStep };
export { buildMaxWeightClosureSteps };

const { Visualizer } = registerDeclarativeAlgorithm<ClosureStep>({
  id: 'max-weight-closure',
  name: '最大权闭合子图 (Max-Weight Closure)',
  category: 'graph',
  aliases: ['max-weight-closure-graph', 'space-project', 'class072', 'P2762'],
  hasDeductionTree: true,
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 87,
  learningGoal: '掌握最大权闭合子图转化为最小割的建图方法、Dinic 阻塞流增广与残量网络方案提取',
  badge: {
    mode: '最小割模型 · 正权源/负权汇 · 依赖边 inf',
    complexity: 'O(V² · E) · O(V + E)',
  },
  card1Title: '⚖️ 网络流最大权闭合子图与最小割沙盘',
  card2Title: '📊 闭合子图收益与割集监视器',
  card2Desc: '展示正权总和、最小割损失、当前割边集合与最终最大权闭合子图节点方案',
  legend: [
    { label: '🌟 超级源 S / 🏁 超级汇 T', color: '#b45309' },
    { label: '🔵 正权收益点', color: '#0369a1' },
    { label: '🔴 负权成本点', color: '#7f1d1d' },
    { label: '👑 闭合子图选中点', state: 'discovered' },
    { label: '⚡ 强依赖边 (cap=∞)', color: '#38bdf8' },
    { label: '✂️ 最小割割边', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '问题预设拓扑',
      type: 'select',
      defaultValue: 'space',
      options: [
        { label: '太空飞行计划经典案例 (收益 25, 最小割 20, 净收益 5)', value: 'space' },
        { label: '极简闭合子图拓扑 (收益 12, 最小割 9, 净收益 3)', value: 'simple' },
      ],
    },
  ],
  presets: [
    { label: '太空飞行计划 (净收益 5)', values: { 'input-preset': 'space' } },
    { label: '极简闭合子图 (净收益 3)', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-pos-weight', label: '正权收益总和', color: '#10b981' },
    { id: 'metric-min-cut-val', label: '最小割损失代价', color: '#ef4444' },
    { id: 'metric-max-profit', label: '最大净收益', color: '#38bdf8' },
    { id: 'metric-closure-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: MAX_WEIGHT_CLOSURE_CODE_LANGUAGES,
  problemHtml: MAX_WEIGHT_CLOSURE_PROBLEM_HTML,
  analysisHtml: MAX_WEIGHT_CLOSURE_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'space') as string;
    return buildMaxWeightClosureSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderMaxWeightClosureCanvas(container, step as ClosureStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as ClosureStep;
    const chosenList = step.chosenNodes.length > 0
      ? step.chosenNodes.map((n) => `<span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-[10px]">${n}</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">未选中任何节点</span>';

    const cutList = step.cutEdges.length > 0
      ? step.cutEdges.map((e) => `<span class="px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[9.5px]">(${e.u}➔${e.v})</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">尚未割边</span>';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-2 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] font-bold text-emerald-400">👑 所选闭合子图:</span>
            <div class="flex items-center gap-1">${chosenList}</div>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-rose-400 font-bold">✂️ 最小割割边集:</span>
            <div class="flex items-center gap-1">${cutList}</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-sky-400 font-bold">收益核算公式:</span>
            <span class="font-mono font-bold text-amber-400">MaxProfit = ${step.totalPositive} - ${step.minCutValue} = ${step.maxProfit}</span>
          </div>
        </div>
        <div class="flex justify-between items-center bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px]">
          <span class="text-slate-400">执行指令:</span>
          <strong class="font-mono text-sky-400">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
        </div>
      </div>
    `;
  },
});

export { Visualizer as MaxWeightClosureVisualizer };
