/**
 * 左程云算法通关课 Class 060: 有向图中的最长颜色路径 (LeetCode 1857 · 26 维拓扑动态规划)
 * 拓扑排序出队计数拦截有向环，26 种字符颜色频次沿拓扑序松弛取 max，求全局最大颜色值
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_060_PROBLEMS } from './graph-060-problem-content';
import { LARGEST_COLOR_VALUE_060_CODES } from './graph-060-stage-codes';
import {
  renderGraph060SvgTopology,
  renderGraph060InDegreeGrid,
  renderGraph060QueuePills,
} from './graph-060-shared';
import {
  type LargestColorStep,
  buildLargestColorValue060Steps,
} from './largest-color-value-060-step-compiler';

export { buildLargestColorValue060Steps, type LargestColorStep };

function renderColorFrequencyGrid(
  dp: number[][],
  colors: string,
  curNode: number | null
): string {
  const cards = colors.split('').map((ch, idx) => {
    const isCur = curNode === idx;
    const freqs: Array<{ char: string; cnt: number }> = [];
    for (let c = 0; c < 26; c++) {
      if (dp[idx][c] > 0) {
        freqs.push({ char: String.fromCharCode(97 + c), cnt: dp[idx][c] });
      }
    }
    freqs.sort((a, b) => b.cnt - a.cnt);

    const freqStr = freqs.length > 0
      ? freqs.slice(0, 3).map((f) => `<span style="color: ${f.char === ch ? '#6366f1' : '#475569'}; font-weight: 700;">${f.char}:${f.cnt}</span>`).join(' ')
      : '<span style="color: #94a3b8;">暂无</span>';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 68px; padding: 4px 6px; background: ${isCur ? '#fef3c7' : '#ffffff'}; border: ${isCur ? '2px solid #f59e0b' : '1px solid #cbd5e1'}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 10px; color: #64748b;">Node ${idx} (${ch})</span>
        <div style="font-size: 11px; font-family: monospace; display: flex; gap: 4px;">${freqStr}</div>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">到达各节点的颜色最大频次 dp[u][char]:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

export const largestColorValue060Visualizer = registerDeclarativeAlgorithm<LargestColorStep>({
  id: 'largest-color-value-060',
  aliases: ['largest-color-value', 'largest-path-value', 'leetcode-1857', 'class060-code06'],
  name: '有向图最大颜色值 (LeetCode 1857 · 26维拓扑动规) (Class 060)',
  category: 'graph',
  icon: '🎨',
  difficulty: 3,
  levelOrder: 6006,
  learningGoal: '掌握拓扑排序出队计数判环机制、26 维颜色频次状态转移方程以及全局最值维护',
  problemHtml: GRAPH_060_PROBLEMS.largestColorValue060.html,
  codeLanguages: LARGEST_COLOR_VALUE_060_CODES,
  presets: [
    { label: '标准颜色 DAG', values: { preset: 'dag_colors' } },
    { label: '含有向环测试', values: { preset: 'cycle_colors' } },
  ],
  generateSteps: (inputs) => buildLargestColorValue060Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const n = step.colors.length;
    const dp = Array.from({ length: n }, () => new Array(26).fill(0));
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: ${step.hasCycle ? '#fee2e2' : '#f8fafc'}; border: 1px solid ${step.hasCycle ? '#f87171' : '#e2e8f0'}; padding: 6px 14px; border-radius: 6px;">
          <span>当前最大颜色值: <strong style="color: ${step.hasCycle ? '#dc2626' : '#6366f1'}; font-size: 13px;">${step.ans}</strong></span>
          <span>拓扑出队计数: <strong>${step.visitedCount} / ${step.colors.length}</strong></span>
          <span>环路状态: <strong style="color: ${step.hasCycle ? '#dc2626' : '#10b981'};">${step.hasCycle ? '🚨 存在有向环 (-1)' : '无环 DAG'}</strong></span>
        </div>
        ${renderGraph060SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          inQueueNodes: step.queue,
          activeEdge: step.activeEdge,
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 500px; flex-direction: column;">
          ${renderColorFrequencyGrid(dp, step.colors, step.curNode)}
          ${renderGraph060InDegreeGrid(step.inDegree, step.curNode, undefined, '节点入度表 inDegree (出队总数小于 n 即为有环)')}
          ${renderGraph060QueuePills(step.queue, '拓扑就绪队列')}
        </div>
      </div>
    `;
  },
});
