/**
 * DAG 最小路径覆盖 (DAG Minimum Path Cover - 网络流 / 二分图匹配) 声明式可视化器
 * 进阶网络流/二分图: 拆点 u -> u_in, u_out、二分图最大匹配、路径数 = n - 最大匹配
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MIN_PATH_COVER_CODE_LANGUAGES,
  MIN_PATH_COVER_PROBLEM_HTML,
  MIN_PATH_COVER_ANALYSIS_HTML,
} from './min-path-cover-problem-content';

export interface PathCoverStep {
  splitMatches: Array<[number, number]>;
  currentMatchingCount: number;
  minPathsCount: number;
  recoveredPaths: number[][];
  status: 'init' | 'match' | 'recover' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildMinPathCoverSteps(): PathCoverStep[] {
  const steps: PathCoverStep[] = [];

  steps.push({
    splitMatches: [],
    currentMatchingCount: 0,
    minPathsCount: 4,
    recoveredPaths: [[1], [2], [3], [4]],
    status: 'init',
    message: '1. [二分图拆点建图] 将每个点 $u$ 拆为出点 $u_{out}$ 与入点 $v_{in}$。初始 4 个点独立形成 4 条单点路径。',
    log: '拆点建图：每个点拆为 u_out 与 u_in',
    codeLine: [12, 18],
  });

  steps.push({
    splitMatches: [[1, 2]],
    currentMatchingCount: 1,
    minPathsCount: 3,
    recoveredPaths: [[1, 2], [3], [4]],
    status: 'match',
    message: '2. [匹配边 1➔2] 匹配出点 1 与入点 2，路径数减少 1 (当前 3 条路径)。',
    log: '匹配 (1_out, 2_in)：形成路径 1->2',
    codeLine: [22, 28],
  });

  steps.push({
    splitMatches: [
      [1, 2],
      [2, 3],
    ],
    currentMatchingCount: 2,
    minPathsCount: 2,
    recoveredPaths: [[1, 2, 3], [4]],
    status: 'match',
    message: '3. [匹配边 2➔3] 匹配出点 2 与入点 3，合并路径为 1 ➔ 2 ➔ 3 (当前 2 条路径)。',
    log: '匹配 (2_out, 3_in)：扩展路径 1->2->3',
    codeLine: [22, 28],
  });

  steps.push({
    splitMatches: [
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    currentMatchingCount: 3,
    minPathsCount: 1,
    recoveredPaths: [[1, 2, 3, 4]],
    status: 'done',
    message: '🎉 [最大匹配完成] 二分图最大匹配 = 3，最小不可相交路径覆盖数 = 4 - 3 = 1！单一完整路径覆盖全图！',
    log: '✓ 判定成功：最小路径覆盖数 = 4 - 3 = 1',
    codeLine: [32, 38],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PathCoverStep>({
  id: 'min-path-cover',
  name: 'DAG 最小路径覆盖 (Min Path Cover)',
  viewId: 'algo-min-path-cover-view',
  category: 'graph',
  icon: '🛣️',
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
    { label: '🟢 匹配边 / 路径段', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点 DAG 经典覆盖', values: {} },
  ],
  metrics: [
    { id: 'metric-match-count', label: '二分图匹配数', color: '#2563eb' },
    { id: 'metric-path-count', label: '最小路径覆盖数', color: '#10b981' },
  ],
  codeLanguages: MIN_PATH_COVER_CODE_LANGUAGES,
  problemHtml: MIN_PATH_COVER_PROBLEM_HTML,
  analysisHtml: MIN_PATH_COVER_ANALYSIS_HTML,
  buildSteps: () => buildMinPathCoverSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <!-- 匹配连线 -->
          ${step.splitMatches
            .map(([u, v]) => {
              const y1 = 35 + (u - 1) * 45;
              const y2 = 35 + (v - 1) * 45;
              return `<line x1="80" y1="${y1}" x2="230" y2="${y2}" stroke="#10b981" stroke-width="3" />`;
            })
            .join('')}

          <!-- 左侧出点 U_out -->
          <g><circle cx="80" cy="35" r="14" fill="#0284c7" /><text x="80" y="39" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1_out</text></g>
          <g><circle cx="80" cy="80" r="14" fill="#0284c7" /><text x="80" y="84" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2_out</text></g>
          <g><circle cx="80" cy="125" r="14" fill="#0284c7" /><text x="80" y="129" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3_out</text></g>
          <g><circle cx="80" cy="170" r="14" fill="#0284c7" /><text x="80" y="174" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4_out</text></g>

          <!-- 右侧入点 V_in -->
          <g><circle cx="230" cy="35" r="14" fill="#f59e0b" /><text x="230" y="39" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1_in</text></g>
          <g><circle cx="230" cy="80" r="14" fill="#f59e0b" /><text x="230" y="84" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2_in</text></g>
          <g><circle cx="230" cy="125" r="14" fill="#f59e0b" /><text x="230" y="129" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3_in</text></g>
          <g><circle cx="230" cy="170" r="14" fill="#f59e0b" /><text x="230" y="174" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4_in</text></g>
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色连线为匹配成功的路径段 | 每匹配一条边，全图路径总数减少 1
        </div>
      </div>
    `;

    const root = container.closest('#algo-min-path-cover-view');
    if (root) {
      const matchEl = root.querySelector('#metric-match-count');
      const pathEl = root.querySelector('#metric-path-count');

      if (matchEl) matchEl.textContent = `${step.currentMatchingCount} 条匹配`;
      if (pathEl) pathEl.textContent = `${step.minPathsCount} 条路径`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const pathList = step.recoveredPaths.map((p) => `[${p.join(' ➔ ')}]`).join(', ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>当前路径覆盖:</span>
              <strong style="color: #10b981; font-family: monospace;">${pathList}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 最小路径覆盖定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">MinPath = N - MaxMatch = 4 - ${step.currentMatchingCount} = ${step.minPathsCount}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'min-path-cover',
  name: 'DAG 最小路径覆盖 (Min Path Cover)',
  viewId: 'algo-min-path-cover-view',
  category: 'graph',
  description: '进阶网络流与二分图建模：DAG 拆点二分图最大匹配、路径数 n - 最大匹配与路径还原 (洛谷 P2764)',
  icon: '🛣️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 65,
  learningGoal: '掌握 DAG 最小路径覆盖转化为二分图最大匹配的建模技巧与路径重建算法',
});

export { Visualizer as MinPathCoverVisualizer };
