/**
 * 左程云算法通关课 Class 060: 喧闹和富有 (LeetCode 851 · 拓扑排序最值传递)
 * 建立财富流动有向图 (富 ➔ 穷)，沿拓扑序传播并更新祖先中最安静者
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import { LOUD_AND_RICH_060_CODES } from './graph-060-stage-codes';
import {
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
} from './graph-060-shared';
import {
  type LoudAndRichStep,
  buildLoudAndRich060Steps,
} from './loud-and-rich-060-step-compiler';

export { buildLoudAndRich060Steps, type LoudAndRichStep };

function renderAnsCards(ans: number[], quiet: number[], curNode: number | null): string {
  const cards = ans.map((best, idx) => {
    const isCur = curNode === idx;
    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 58px; padding: 4px 6px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: ${isCur ? '2px solid #f59e0b' : '1px solid #cbd5e1'}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 9px; color: #64748b;">人 ${idx}</span>
        <span style="font-size: 11px; font-weight: 800; color: #0f172a;">最静: <strong style="color: #6366f1;">${best}</strong></span>
        <span style="font-size: 8px; color: #10b981;">q: ${quiet[best]}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">当前推得最安静富人表 answer[]:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

export const loudAndRich060Visualizer = registerDeclarativeAlgorithm<LoudAndRichStep>({
  id: 'loud-and-rich-060',
  aliases: ['loud-and-rich', 'leetcode-851', 'class060-code02'],
  name: '喧闹和富有 (LeetCode 851 · 拓扑最值传播) (Class 060)',
  category: 'graph',
  icon: '🤫',
  difficulty: 2,
  levelOrder: 6002,
  learningGoal: '掌握有向图偏序关系建模、拓扑排序最值动态传播与安静值贪心更新机制',
  problemHtml: GRAPH_060_PROBLEMS.loudAndRich060.html,
  codeLanguages: LOUD_AND_RICH_060_CODES,
  inputs: [
    {
      id: 'preset',
      label: '人员财富网络选择',
      type: 'select',
      defaultValue: 'classic_5people',
      options: [
        { label: '5 人经典富裕图 (多前驱财富汇流)', value: 'classic_5people' },
        { label: '4 人单向链式富裕图 (线性单调递推)', value: 'linear_chain' },
      ],
    },
  ],
  presets: [
    { label: '5 人财富图', values: { preset: 'classic_5people' } },
    { label: '4 人链式图', values: { preset: 'linear_chain' } },
  ],
  generateSteps: (inputs) => buildLoudAndRich060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>当前考察人员: <strong style="color: #f59e0b;">${step.curNode !== null ? `人 ${step.curNode}` : '无'}</strong></span>
          <span>待拓展队列: <strong>${step.queue.length}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          processedNodes: step.processed,
          activeEdge: step.activeEdge,
          nodeValues: step.quiet,
          valueLabel: '静',
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderAnsCards(step.ans, step.quiet, step.curNode)}
          ${renderGraph060InDegreeGrid(step.inDegree, step.curNode, undefined, '富裕依赖入度表 inDegree')}
          ${renderGraph060QueuePills(step.queue, '入度为 0 待处理队列')}
        </div>
      </div>
    `;
  },
});
