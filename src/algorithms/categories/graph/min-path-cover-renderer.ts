/**
 * DAG 最小路径覆盖 (DAG Minimum Path Cover) 声明式可视化器
 * 进阶网络流/二分图: 拆点 u -> u_out, v_in、二分图最大匹配、路径数 = n - 最大匹配 (洛谷 P2764 / 左程云 class071)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type PathCoverStep, buildMinPathCoverSteps } from './min-path-cover-step-compiler';
import { renderMinPathCoverCanvas } from '../../../core/renderers/adapters/min-path-cover-canvas-adapter';
import {
  MIN_PATH_COVER_CODE_LANGUAGES,
  MIN_PATH_COVER_PROBLEM_HTML,
  MIN_PATH_COVER_ANALYSIS_HTML,
} from './min-path-cover-problem-content';

export type { PathCoverStep };
export { buildMinPathCoverSteps };

const { Visualizer } = registerDeclarativeAlgorithm<PathCoverStep>({
  id: 'min-path-cover',
  name: 'DAG 最小路径覆盖 (Min Path Cover)',
  category: 'graph',
  aliases: ['dag-path-cover', 'minimum-path-cover', 'class071', 'P2764'],
  hasDeductionTree: true,
  icon: '🛣️',
  difficulty: 3,
  levelOrder: 65,
  learningGoal: '掌握 DAG 最小路径覆盖转化为二分图最大匹配的建模技巧与路径重建算法',
  badge: {
    mode: '拆点二分图最大匹配',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🛣️ DAG 拆点二分图与路径合并沙盘',
  card2Title: '🧭 拆点匹配与路径数监视器',
  card2Desc: '二分图出点与入点匹配、当前覆盖路径集合与最小路径数公式',
  legend: [
    { label: '出点集合 (U_out)', color: '#0284c7' },
    { label: '入点集合 (V_in)', color: '#f59e0b' },
    { label: '🟢 匹配边 / 路径段', state: 'discovered' },
  ],
  presets: [
    { label: '4 节点经典 DAG (覆盖数: 1)', values: { 'input-preset': 'standard' } },
    { label: '5 节点分支 DAG (覆盖数: 2)', values: { 'input-preset': 'branching' } },
  ],
  metrics: [
    { id: 'metric-match-count', label: '二分图匹配数', color: '#2563eb' },
    { id: 'metric-path-count', label: '最小路径覆盖数', color: '#10b981' },
    { id: 'metric-cur-node', label: '当前考察节点', color: '#f59e0b' },
    { id: 'metric-path-formula', label: '定理公式', color: '#8b5cf6' },
  ],
  codeLanguages: MIN_PATH_COVER_CODE_LANGUAGES,
  problemHtml: MIN_PATH_COVER_PROBLEM_HTML,
  analysisHtml: MIN_PATH_COVER_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'standard') as string;
    return buildMinPathCoverSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderMinPathCoverCanvas(container, step as PathCoverStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as PathCoverStep;
    const pathList = step.recoveredPaths && step.recoveredPaths.length > 0
      ? step.recoveredPaths.map((p) => `<span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-[10px]">[${p.join('➔')}]</span>`).join(' ')
      : '<span class="text-slate-500 text-[10.5px]">尚未形成路径</span>';

    const n = step.currentMatchingCount + step.minPathsCount;

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-2 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] font-bold text-sky-400">当前独立路径链:</span>
            <div class="flex items-center gap-1">${pathList}</div>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-indigo-400 font-bold">👑 最小路径覆盖定理:</span>
            <span class="font-mono font-bold text-emerald-400">MinPaths = ${n} - ${step.currentMatchingCount} = ${step.minPathsCount}</span>
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

export { Visualizer as MinPathCoverVisualizer };
