/**
 * 左程云算法通关课 Class 061: SPFA 算法 (Shortest Path Faster Algorithm · 队列优化的 Bellman-Ford)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import { SPFA_061_CODES } from './graph-061-stage-codes';
import { renderGraph061SvgTopology, renderGraph061DistGrid } from './graph-061-shared';
import { SpfaStep, buildSpfa061Steps } from './spfa-061-step-compiler';

export type { SpfaStep };
export { buildSpfa061Steps };

export const spfa061Visualizer = registerDeclarativeAlgorithm<SpfaStep>({
  id: 'spfa-061',
  aliases: ['spfa', 'class061-code04', 'queue-bellman-ford'],
  name: 'SPFA 队列优化最短路算法 (Class 061)',
  category: 'graph',
  icon: '🚀',
  difficulty: 2,
  levelOrder: 6104,
  learningGoal: '掌握队列维护活跃松弛顶点机制、inQueue 标志位管理与平均 O(k·E) 运行效率',
  problemHtml: GRAPH_061_PROBLEMS.spfa061.html,
  codeLanguages: SPFA_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'negative_chain',
      options: [
        { label: '负权链式图 (5 节点 · 负权边传播)', value: 'negative_chain' },
        { label: '稠密正权图 (4 节点 · 队列去重测试)', value: 'dense_positive' },
      ],
    },
  ],
  presets: [
    { label: '负权链式图', values: { preset: 'negative_chain' } },
    { label: '稠密正权图', values: { preset: 'dense_positive' } },
  ],
  generateSteps: (inputs) => buildSpfa061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const queueBadges = step.queue.map((nodeId, idx) => `
      <span style="padding: 2px 8px; background: ${idx === 0 ? '#ecfdf5' : '#f1f5f9'}; border: 1px solid ${idx === 0 ? '#10b981' : '#cbd5e1'}; border-radius: 4px; font-size: 11px; font-weight: 700; color: ${idx === 0 ? '#047857' : '#334155'}; font-family: monospace;">
        ${idx === 0 ? '队头: ' : ''}Node ${nodeId}
      </span>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 500px; align-items: center;">
          ${renderGraph061DistGrid(step.dist, step.inQueue, step.curNode, '全网节点距离表 dist[] (绿色代表在队中)')}
          <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; width: 100%; box-sizing: border-box; flex-wrap: wrap;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">SPFA 待松弛队列:</span>
            ${queueBadges || '<span style="font-size: 11px; color: #94a3b8; font-family: monospace;">[ 空队列 ]</span>'}
          </div>
        </div>
      </div>
    `;
  },
});
