/**
 * 2-SAT 问题与强连通缩点 (2-Satisfiability Problem - Tarjan SCC) 声明式可视化器
 * 进阶图论: 逻辑子句 (a ∨ b) 转蕴涵有向边 (¬a ➔ b ∧ ¬b ➔ a)、Tarjan SCC 拓扑染色判定 (洛谷 P4782)
 * 架构：遵循 Matt Pocock 深模块哲学，薄领域适配器 (LOC < 120 行)，委托 step-compiler 与 canvas-adapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { type TwoSATStep, buildTwoSATSteps } from './two-sat-step-compiler';
import { TwoSATCanvasAdapter } from '../../../core/renderers/adapters/two-sat-canvas-adapter';
import {
  TWO_SAT_CODE_LANGUAGES,
  TWO_SAT_PROBLEM_HTML,
  TWO_SAT_ANALYSIS_HTML,
} from './two-sat-problem-content';

export type { TwoSATStep };
export { buildTwoSATSteps, TwoSATCanvasAdapter };

const { Visualizer } = registerDeclarativeAlgorithm<TwoSATStep>({
  id: 'two-sat-problem',
  name: '2-SAT 问题 (Two-Satisfiability)',
  category: 'graph',
  aliases: ['two-sat', 'P4782', 'two-sat-tarjan'],
  hasDeductionTree: true,
  icon: '🔀',
  difficulty: 3,
  levelOrder: 63,
  learningGoal: '掌握 2-SAT 问题转有向图建模方法、Tarjan SCC 缩点判定矛盾及解向量构造原理',
  badge: {
    mode: 'Tarjan SCC + 拓扑赋值',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🔀 2-SAT 蕴涵有向图与强连通缩点沙盘',
  card2Title: '📊 Tarjan 多数组 (dfn, low, scc, inStack) 实时监控器',
  card2Desc: '逐行对齐 Tarjan 缩点与 2-SAT 求解指令，实时跟踪时间戳 dfn[]、祖先回溯 low[] 与 SCC 分量编号',
  legend: [
    { label: '布尔正文字 (True)', state: 'scanning' },
    { label: '布尔逆文字 (False)', color: '#f43f5e' },
    { label: '⭐ 当前活跃节点', color: '#f59e0b' },
    { label: '🔴 蕴涵有向边', color: '#64748b' },
  ],
  presets: [
    { label: '可满足子句集', values: { 'input-preset': 'satisfiable' } },
    { label: '全约束矛盾子句集', values: { 'input-preset': 'unsatisfiable' } },
  ],
  metrics: [
    { id: 'metric-sat-status', label: '2-SAT 判定状态', color: '#10b981' },
    { id: 'metric-sat-assign', label: '当前求得赋值解', color: '#38bdf8' },
    { id: 'metric-cur-clause', label: '当前聚焦子句/边', color: '#f59e0b' },
    { id: 'metric-scc-count', label: '已发现 SCC 数量', color: '#a855f7' },
  ],
  codeLanguages: TWO_SAT_CODE_LANGUAGES,
  problemHtml: TWO_SAT_PROBLEM_HTML,
  analysisHtml: TWO_SAT_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'satisfiable') as string;
    return buildTwoSATSteps(preset);
  },
  renderCanvas: (container, step) => TwoSATCanvasAdapter.render(container, step as TwoSATStep),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as TwoSATStep;
    const labels = ['x1(1)', '¬x1(2)', 'x2(3)', '¬x2(4)'];

    const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
      const cells = [1, 2, 3, 4]
        .map((idx) => {
          const val = arr[idx];
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
          const bg = isActive ? 'bg-amber-950/80 border-amber-500 text-yellow-300' : 'bg-slate-900 border-slate-700 text-slate-200';
          return `
            <div class="flex flex-col items-center justify-center min-w-[38px] h-7 rounded border ${bg} font-mono text-[10px] font-bold">
              <span class="text-[7.5px] text-slate-400 leading-none">${labels[idx - 1]}</span>
              <span class="leading-tight">${displayVal}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div class="flex items-center gap-2">
          <span class="font-mono text-[11px] font-bold w-28 ${color}">${name}:</span>
          <div class="flex gap-1">${cells}</div>
        </div>
      `;
    };

    const stackStr = step.stack && step.stack.length > 0 ? step.stack.join(' ➔ ') : '空';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex flex-col gap-1.5 bg-slate-950/90 p-2 rounded-md border border-slate-800">
          ${renderRow('dfn[] (访问序)', step.dfnArray, 'dfn', 'text-sky-400')}
          ${renderRow('low[] (回溯祖先)', step.lowArray, 'low', 'text-amber-400')}
          ${renderRow('scc[] (分量号)', step.sccArray, 'scc', 'text-purple-400')}
          ${renderRow('inStack[] (在栈)', step.inStackArray, 'inStack', 'text-emerald-400')}
          <div class="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-slate-800 text-[10.5px]">
            <span class="text-slate-400">Tarjan 辅助栈 st:</span>
            <strong class="text-sky-400 font-mono">[ ${stackStr} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

export { Visualizer as TwoSATVisualizer };
