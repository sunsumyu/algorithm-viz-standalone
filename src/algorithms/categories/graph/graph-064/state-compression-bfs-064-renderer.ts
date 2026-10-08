/**
 * 左程云算法通关课 Class 064: 访问所有节点的最短路径 (Shortest Path Visiting All Nodes · LeetCode 847)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_064_PROBLEMS } from './graph-064-problem-content';
import { STATE_COMP_064_CODES } from './graph-064-stage-codes';
import { renderGraph064PriorityQueue } from './graph-064-shared';
import {
  StateCompStep,
  buildStateComp064Steps,
} from './state-compression-bfs-064-step-compiler';

export type { StateCompStep };
export { buildStateComp064Steps };

export const stateCompressionBfs064Visualizer = registerDeclarativeAlgorithm<StateCompStep>({
  id: 'state-compression-bfs-064',
  aliases: ['state-compression-bfs', 'class064-code06', 'leetcode-847'],
  name: '访问所有节点最短路与状态压缩广搜 (Class 064)',
  category: 'graph',
  icon: '🗝️',
  difficulty: 3,
  levelOrder: 6406,
  learningGoal: '掌握状态空间扩维 (u, mask) 建模、位掩码状态压缩与多源并发广搜',
  problemHtml: GRAPH_064_PROBLEMS.stateCompressionBfs064.html,
  codeLanguages: STATE_COMP_064_CODES,
  inputs: [
    {
      id: 'preset',
      label: '图结构用例选择',
      type: 'select',
      defaultValue: 'star_4nodes',
      options: [
        { label: '4 节点星形拓扑 (中心辐射, 最短路=4)', value: 'star_4nodes' },
        { label: '3 节点三角形连通图 (最短路=2)', value: 'triangle_3nodes' },
        { label: '4 节点线性链状图 (最短路=3)', value: 'chain_4nodes' },
      ],
    },
  ],
  presets: [
    { label: '4 节点星形拓扑 (LeetCode 847)', values: { preset: 'star_4nodes' } },
    { label: '3 节点三角形', values: { preset: 'triangle_3nodes' } },
    { label: '4 节点线性链', values: { preset: 'chain_4nodes' } },
  ],
  generateSteps: (inputs) => buildStateComp064Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const nodeBadges = [];
    for (let i = 0; i < step.n; i++) {
      const isVisitedInMask = (step.curMask !== null) && ((step.curMask & (1 << i)) !== 0);
      const isCur = step.curNode === i;
      const bg = isCur ? '#fef3c7' : isVisitedInMask ? '#ecfdf5' : '#f1f5f9';
      const border = isCur ? '2.5px solid #f59e0b' : isVisitedInMask ? '1.5px solid #10b981' : '1px solid #cbd5e1';
      const textCol = isCur ? '#b45309' : isVisitedInMask ? '#047857' : '#64748b';

      nodeBadges.push(`
        <div style="
          width: 58px;
          height: 58px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${bg};
          border: ${border};
          border-radius: 50%;
          box-shadow: ${isCur ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'};
          transition: all 0.2s ease;
        ">
          <span style="font-size: 13px; font-weight: 800; color: ${textCol};">N${i}</span>
          <span style="font-size: 8px; color: ${textCol};">${isVisitedInMask ? '已点亮' : '未覆盖'}</span>
        </div>
      `);
    }

    const qItems = step.queueSnapshot.slice(0, 8).map((x) => ({
      label: `N${x.u}(0b${x.mask.toString(2).padStart(step.n, '0')})`,
      priority: `${x.dist}步`,
      highlight: step.curNode === x.u && step.curMask === x.mask,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 16px; gap: 16px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; width: 100%; max-width: 500px; box-sizing: border-box;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">节点访问状态 (位掩码点亮监控):</span>
          <div style="display: flex; gap: 16px; justify-content: center;">${nodeBadges.join('')}</div>
          <div style="margin-top: 4px; font-size: 11px; font-family: monospace; color: #6366f1;">
            当前掩码: 0b${step.curMask !== null ? step.curMask.toString(2).padStart(step.n, '0') : '0'} / 目标: 0b${step.targetMask.toString(2)}
          </div>
        </div>
        <div style="width: 100%; max-width: 500px;">
          ${renderGraph064PriorityQueue(qItems, '广搜波前队列 (按步数推进)')}
        </div>
      </div>
    `;
  },
});
