/**
 * 差分约束系统 (System of Difference Constraints) 声明式可视化器
 * 核心：不等式 x_v - x_u <= c 转化为有向带权边 u ➔ v (w=c)、超级源点连 0 权边、SPFA 负环判定 (洛谷 P5960 / 左程云 class070)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type DiffConstraintStep, buildDiffConstraintsSteps } from './diff-constraints-step-compiler';
import { DiffConstraintsCanvasAdapter } from '../../../core/renderers/adapters/diff-constraints-canvas-adapter';
import {
  DIFF_CONSTRAINTS_CODE_LANGUAGES,
  DIFF_CONSTRAINTS_PROBLEM_HTML,
  DIFF_CONSTRAINTS_ANALYSIS_HTML,
} from './diff-constraints-problem-content';

export type { DiffConstraintStep };
export { buildDiffConstraintsSteps, DiffConstraintsCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<DiffConstraintStep>({
  id: 'diff-constraints',
  name: '差分约束系统 (System of Difference Constraints)',
  category: 'graph',
  aliases: ['difference-constraints', 'system-of-difference-constraints', 'P5960', 'luogu-p5960'],
  hasDeductionTree: true,
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握差分约束系统的代数不等式转最短路建图方法，以及 SPFA 负权环无解判定',
  badge: {
    mode: '差分约束 · 三角不等式 · SPFA 负环判定',
    complexity: 'O(N · M) · O(N + M)',
  },
  card1Title: '⚖️ 差分约束图论同构与 SPFA 负环沙盘',
  card2Title: '📊 约束系统解状态监视器 (dist, count, SPFA 队列)',
  card2Desc: '展示不等式向有向边同构转化、超级源点初始化、最短路收敛解与负权环矛盾判定全流程',
  legend: [
    { label: '🌐 超级源点 (S₀=0)', color: '#a855f7' },
    { label: '🔵 变量节点 (x₁~x₃)', color: '#38bdf8' },
    { label: '⚡ 当前松弛考察边', color: '#f59e0b' },
    { label: '❌ 负权回路报警边', color: '#ef4444' },
  ],
  presets: [
    { label: '可行解约束组', values: { 'input-preset': 'feasible' } },
    { label: '负环矛盾无解', values: { 'input-preset': 'cycle' } },
  ],
  metrics: [
    { id: 'metric-diff-cycle', label: '负环判定状态', color: '#ef4444' },
    { id: 'metric-diff-sol', label: '系统解状态', color: '#10b981' },
    { id: 'metric-cur-queue', label: 'SPFA 队列', color: '#38bdf8' },
    { id: 'metric-cur-relax', label: '当前松弛边', color: '#f59e0b' },
  ],
  codeLanguages: DIFF_CONSTRAINTS_CODE_LANGUAGES,
  problemHtml: DIFF_CONSTRAINTS_PROBLEM_HTML,
  analysisHtml: DIFF_CONSTRAINTS_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'feasible') as string;
    return buildDiffConstraintsSteps(preset);
  },
  renderCanvas: (container, step) => {
    DiffConstraintsCanvasAdapter.render(container, step as DiffConstraintStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as DiffConstraintStep;
    const distItems = [0, 1, 2, 3].map((id) => {
      const d = step.distMap[id];
      const dStr = d === 1000000000 || d === Infinity ? '∞' : `${d}`;
      const cnt = step.countMap?.[id] ?? 0;
      const isSuper = id === 0;

      return `
        <div class="flex flex-col items-center justify-center min-w-[56px] h-9 bg-slate-900 border border-slate-700 rounded px-1">
          <span class="text-[8px] ${isSuper ? 'text-purple-400' : 'text-slate-400'} font-bold">${isSuper ? 'S₀' : `x${id}`} (c:${cnt})</span>
          <span class="text-[11px] font-mono font-bold ${isSuper ? 'text-purple-300' : 'text-sky-400'} leading-none">${dStr}</span>
        </div>
      `;
    }).join('');

    const solText = step.hasNegativeCycle
      ? '❌ 存在负权回路 (系统无可行解 UNSAT)'
      : step.status === 'done'
        ? `✅ 已收敛可行解: [${[1, 2, 3].map(i => `x${i}=${step.distMap[i]}`).join(', ')}]`
        : '⏳ 最短路松弛求解中...';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-2 bg-slate-950/90 p-2.5 rounded-md border border-slate-800">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[11px] font-bold text-amber-400">各节点距离与松弛计数:</span>
            <div class="flex gap-1">${distItems}</div>
          </div>
          <div class="flex items-center justify-between pt-1.5 border-t border-dashed border-slate-800 text-[11px]">
            <span class="text-slate-400 font-bold">SPFA 探索队列:</span>
            <span class="font-mono text-sky-400 font-bold">[${step.queue?.join(', ') ?? ''}]</span>
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-bold">约束判定结果:</span>
            <span class="font-bold ${step.hasNegativeCycle ? 'text-red-400' : 'text-emerald-400'} font-mono">${solText}</span>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as DiffConstraintsVisualizer };
