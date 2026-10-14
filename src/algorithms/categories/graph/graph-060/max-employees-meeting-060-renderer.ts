/**
 * 左程云算法通关课 Class 060: 参加会议的最多员工数 (LeetCode 2127 · 内向基环树拓扑分解)
 * 拓扑排序剥离树枝统计外链深度 maxDepth，分类汇总：大小 >= 3 的独立大环 vs 大小 = 2 的互偶对挂链累加
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import { MAX_EMPLOYEES_060_CODES } from './graph-060-stage-codes';
import {
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
} from './graph-060-shared';
import {
  type MaxEmployeesStep,
  buildMaxEmployees060Steps,
} from './max-employees-meeting-060-step-compiler';

export { buildMaxEmployees060Steps, type MaxEmployeesStep };

export const maxEmployees060Visualizer = registerDeclarativeAlgorithm<MaxEmployeesStep>({
  id: 'max-employees-meeting-060',
  aliases: ['max-employees-meeting', 'leetcode-2127', 'class060-code04', 'functional-graph-rings'],
  name: '参加会议最多员工数 (LeetCode 2127 · 内向基环树) (Class 060)',
  category: 'graph',
  icon: '🪑',
  difficulty: 3,
  levelOrder: 6004,
  learningGoal: '掌握内向基环树拓扑剥离树枝方法、环路大小分类讨论与二元互偶链全量拼接机理',
  problemHtml: GRAPH_060_PROBLEMS.maxEmployees060.html,
  codeLanguages: MAX_EMPLOYEES_060_CODES,
  presets: [
    { label: '二元环链拼接', values: { preset: 'mixed_rings' } },
    { label: '3 节点大环', values: { preset: 'big_ring_3' } },
  ],
  generateSteps: (inputs) => buildMaxEmployees060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>独占大环 maxRing: <strong style="color: #6366f1;">${step.maxRing} 人</strong></span>
          <span>二元环拼接 sumTwoRing: <strong style="color: #10b981;">${step.sumTwoRing} 人</strong></span>
          <span>当前优选人数: <strong style="color: #f59e0b; font-size: 13px;">${step.finalAns} 人</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          activeEdge: step.activeEdge,
          nodeValues: step.maxDepth,
          valueLabel: '链深',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderGraph060InDegreeGrid(step.inDegree, step.curNode, undefined, '受喜欢入度表 inDegree (剥离完毕后 >0 者即为环节点)')}
        </div>
      </div>
    `;
  },
});
