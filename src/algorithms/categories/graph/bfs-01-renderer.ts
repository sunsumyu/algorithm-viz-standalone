/**
 * 0-1 BFS 双端队列最短路 (0-1 BFS with Deque) 声明式可视化器
 * 核心：边权为 0 插队头 addFirst、边权为 1 插队尾 addLast、维护双段性单调队列、时间复杂度 O(V + E) (LeetCode 2290)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type BFS01Step,
  buildBFS01Steps,
} from './bfs-01-step-compiler';
import { BFS01CanvasAdapter } from '../../../core/renderers/adapters/bfs-01-canvas-adapter';
import {
  BFS_01_CODE_LANGUAGES,
  BFS_01_PROBLEM_HTML,
  BFS_01_ANALYSIS_HTML,
} from './bfs-01-problem-content';

export type { BFS01Step };
export { buildBFS01Steps };
export { BFS01CanvasAdapter };

const { Visualizer: BFS01Visualizer } = registerDeclarativeAlgorithm<BFS01Step>({
  id: 'bfs-01',
  name: '0-1 BFS 双端队列最短路 (0-1 BFS Deque)',
  category: 'graph',
  aliases: ['0-1-bfs', 'deque-shortest-path', 'bfs-deque-network'],
  hasDeductionTree: true,
  icon: '⚡',
  difficulty: 2,
  levelOrder: 25,
  learningGoal: '掌握 0-1 BFS 相比 Dijkstra 的常数与渐进复杂度优势，理解双端队列如何天然保持单调性',
  presets: [
    { label: '5 节点经典网络', values: { 'input-preset': 'classic_5node' } },
    { label: '4 节点入门网络', values: { 'input-preset': 'simple_4node' } },
  ],
  metrics: [
    { id: 'metric-bfs01-node', label: '当前考察节点', color: '#f59e0b' },
    { id: 'metric-bfs01-dist', label: '终点到达代价', color: '#10b981' },
    { id: 'metric-deque-size', label: '双端队列规模', color: '#38bdf8' },
    { id: 'metric-bfs01-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  legend: [
    { label: '🟢 0 权无损转移边 (插队头)', state: 'discovered' },
    { label: '🔵 1 权耗损转移边 (插队尾)', state: 'scanning' },
    { label: '⚡ 当前出队考察节点', color: '#f59e0b' },
    { label: '🏆 最优 0-1 最短路径', state: 'secondary' },
  ],
  codeLanguages: BFS_01_CODE_LANGUAGES,
  problemHtml: BFS_01_PROBLEM_HTML,
  analysisHtml: BFS_01_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const preset = (inputs?.['input-preset'] || 'classic_5node') as string;
    return buildBFS01Steps(preset);
  },
  renderCanvas: (container, step) => BFS01CanvasAdapter.render(container, step as BFS01Step),
  renderCustomMetrics: (container, rawStep) => {
    const step = rawStep as BFS01Step;
    const n = step.distArray.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    const cells = indices.map((idx) => {
      const val = step.distArray[idx] ?? 0;
      const isActive = step.activeArray === 'dist' && step.activeSlot === idx;
      const displayVal = val === 999 ? '∞' : `${val}`;
      const bg = isActive ? 'bg-amber-100 border-amber-500 text-amber-900' : 'bg-slate-900/60 border-slate-700 text-slate-200';

      return `
        <div class="flex flex-col items-center justify-center min-w-[34px] h-[32px] rounded border ${bg} font-mono text-[11px] font-bold">
          <span class="text-[8px] text-slate-400">N${idx + 1}</span>
          <span class="leading-tight">${displayVal}</span>
        </div>
      `;
    }).join('');

    const dqStr = step.dequeList.length > 0
      ? step.dequeList.map((x) => `N${x.u}(d:${x.dist})`).join(' ➔ ')
      : '空';

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2 text-xs text-slate-300">
        <div class="flex items-center justify-between">
          <span class="font-bold text-sky-400">distance[] 最短路状态</span>
          <span class="font-mono text-emerald-400 font-bold">[ ${dqStr} ]</span>
        </div>
        <div class="flex gap-1.5 flex-wrap">${cells}</div>
      </div>
    `;
  },
});

export { BFS01Visualizer };
