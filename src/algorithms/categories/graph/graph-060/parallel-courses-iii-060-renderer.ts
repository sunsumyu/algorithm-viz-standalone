/**
 * 左程云算法通关课 Class 060: 并行课程 III (LeetCode 2050 · DAG 关键路径 CPM)
 * 求所有课程并行开展情况下的全局最早完工总月份数，状态转移：cost[v] = max(cost[v], cost[u] + time[v])
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import { PARALLEL_COURSES_060_CODES } from './graph-060-stage-codes';
import {
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
} from './graph-060-shared';
import {
  type ParallelCoursesStep,
  buildParallelCourses060Steps,
} from './parallel-courses-iii-060-step-compiler';

export { buildParallelCourses060Steps, type ParallelCoursesStep };

function renderCourseCostGrid(cost: number[], time: number[], curNode: number | null): string {
  const cards = time.map((t, idx) => {
    const courseId = idx + 1;
    const isCur = curNode === courseId;
    const c = cost[courseId];

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 62px; padding: 4px 6px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: ${isCur ? '2px solid #f59e0b' : '1px solid #cbd5e1'}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 9px; color: #64748b;">课程 ${courseId} (需${t}月)</span>
        <span style="font-size: 12px; font-weight: 800; color: #6366f1; font-family: monospace;">完工: ${c === 0 ? '-' : `${c}月`}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">各课程最早完工用时表 cost[]:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

export const { Visualizer: ParallelCourses060Visualizer } = createDeclarativeVisualizer<ParallelCoursesStep>({
  id: 'parallel-courses-iii-060',
  aliases: ['parallel-courses-iii', 'leetcode-2050', 'class060-code03', 'topo-dp-cpm'],
  name: '并行课程 III (LeetCode 2050 · DAG 关键路径 CPM) (Class 060)',
  category: 'graph',
  icon: '⏱️',
  difficulty: 3,
  levelOrder: 6003,
  learningGoal: '掌握 DAG 关键路径最长路动态规划方程、并行化前驱瓶颈分析与拓扑更新准则',
  problemHtml: GRAPH_060_PROBLEMS.parallelCourses060.html,
  codeLanguages: PARALLEL_COURSES_060_CODES,
  presets: [
    { label: '5 门课程依赖图', values: { preset: 'classic_5courses' } },
    { label: '4 门课程菱形图', values: { preset: 'diamond_4courses' } },
  ],
  generateSteps: (inputs) => buildParallelCourses060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>当前全局最长路径用时: <strong style="color: #6366f1; font-size: 13px;">${step.total} 月</strong></span>
          <span>当前开课队列: <strong>${step.queue.length}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          processedNodes: step.processed,
          activeEdge: step.activeEdge,
          nodeValues: step.cost,
          valueLabel: '完工',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderCourseCostGrid(step.cost, step.time, step.curNode)}
          ${renderGraph060InDegreeGrid(step.inDegree.slice(1), step.curNode !== null ? step.curNode - 1 : null, undefined, '课程先修入度表 (归零即开课)')}
          ${renderGraph060QueuePills(step.queue, '已满足先修开课队列')}
        </div>
      </div>
    `;
  },
});
