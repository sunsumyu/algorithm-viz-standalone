/**
 * 状态压缩 BFS (State Compression BFS - 获取所有钥匙的最短路径 LeetCode 864) 声明式可视化器
 * 核心：位掩码 1<<k 记录钥匙收集状态、二维坐标加钥匙状态 (r, c, mask) 三维去重、BFS 队列
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  STATE_COMPRESSION_BFS_CODE_LANGUAGES,
  STATE_COMPRESSION_BFS_PROBLEM_HTML,
  STATE_COMPRESSION_BFS_ANALYSIS_HTML,
} from './state-compression-bfs-problem-content';

export interface StateBFSItem {
  grid: string[][];
  curR: number;
  curC: number;
  keyMask: number;
  stepCount: number;
  status: 'init' | 'key_a' | 'door_a' | 'key_b' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildStateBFSSteps(): StateBFSItem[] {
  const steps: StateBFSItem[] = [];

  const grid = [
    ['@', '.', 'a'],
    ['.', '#', 'A'],
    ['b', '.', '.'],
  ];

  steps.push({
    grid,
    curR: 0,
    curC: 0,
    keyMask: 0,
    stepCount: 0,
    status: 'init',
    message: '1. [起点初始状态] 起点 (0, 0)，钥匙状态 mask = 0 (未获取任何钥匙)，入队！',
    log: '初始状态入队：(0, 0, mask: 00b), step = 0',
    codeLine: [18, 25],
  });

  steps.push({
    grid,
    curR: 0,
    curC: 2,
    keyMask: 1,
    stepCount: 2,
    status: 'key_a',
    message: '2. [拾取钥匙 a] 到达 (0, 2) 拾取钥匙 a，mask 更新为 mask | (1<<0) = 1 (01b)！',
    log: '获得钥匙 a：更新 mask = 1, 状态转移至 (0, 2, mask:1)',
    codeLine: [28, 36],
  });

  steps.push({
    grid,
    curR: 2,
    curC: 0,
    keyMask: 3,
    stepCount: 6,
    status: 'done',
    message: '🎉 [成功获取全部钥匙] 开启锁 A 并到达 (2, 0) 拾取钥匙 b，mask 达到全满 3 (11b)！最短步数 = 6！',
    log: '✓ 状态压缩 BFS 完成：集齐全部钥匙，最短步数 = 6',
    codeLine: [38, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<StateBFSItem>({
  id: 'state-compression-bfs',
  name: '状态压缩 BFS (State Compression BFS)',
  category: 'graph',
  icon: '🗝️',
  badge: {
    mode: '三维状态 (r, c, mask)',
    complexity: 'O(R · C · 2^K) · O(R · C · 2^K)',
  },
  card1Title: '🗝️ 迷宫网格与钥匙状态空间沙盘',
  card2Title: '🧭 钥匙位掩码 keyMask 与三维状态监视器',
  card2Desc: '钥匙收集位运算 (mask | 1<<k)、门禁解锁判断与最短步数',
  legend: [
    { label: '@ 起点', color: '#f59e0b' },
    { label: 'a, b 钥匙', color: '#10b981' },
    { label: 'A 门锁 (需钥匙 a)', color: '#ef4444' },
    { label: '⬛ 障碍墙壁', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '3x3 经典钥匙迷宫 (LeetCode 864)', values: {} },
  ],
  metrics: [
    { id: 'metric-state-keys', label: '钥匙收集掩码', color: '#10b981' },
    { id: 'metric-state-steps', label: '当前最短步数', color: '#2563eb' },
  ],
  codeLanguages: STATE_COMPRESSION_BFS_CODE_LANGUAGES,
  problemHtml: STATE_COMPRESSION_BFS_PROBLEM_HTML,
  analysisHtml: STATE_COMPRESSION_BFS_ANALYSIS_HTML,
  buildSteps: () => buildStateBFSSteps(),
  renderCanvas: (container, step) => {
    const rows = step.grid
      .map((row, r) => {
        const cells = row
          .map((ch, c) => {
            const isCur = step.curR === r && step.curC === c;
            const isWall = ch === '#';
            const isKey = ch === 'a' || ch === 'b';
            const isLock = ch === 'A';
            const isStart = ch === '@';
            const bg = isCur ? '#b45309' : isKey ? '#065f46' : isLock ? '#991b1b' : isWall ? '#334155' : isStart ? '#0369a1' : '#1e293b';
            const border = isCur ? '#facc15' : isKey ? '#10b981' : isLock ? '#f87171' : isWall ? '#475569' : '#38bdf8';

            return `
              <div style="width: 48px; height: 48px; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; font-family: monospace;">
                <span style="font-size: 14px; font-weight: 800;">${isWall ? '🧱' : ch}</span>
              </div>
            `;
          })
          .join('');
        return `<div style="display: flex; gap: 6px;">${cells}</div>`;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
          ${rows}
        </div>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🗝️ 状态由 $(r, c, \\text{mask})$ 三维构成 | 相同格子在持有不同钥匙时可重复访问
        </div>
      </div>
    `;

    const root = container.closest('#algo-state-compression-bfs-view');
    if (root) {
      const kEl = root.querySelector('#metric-state-keys');
      const sEl = root.querySelector('#metric-state-steps');

      if (kEl) kEl.textContent = `mask: ${step.keyMask.toString(2).padStart(2, '0')}b (${step.keyMask === 3 ? '全收集' : '部分'})`;
      if (sEl) sEl.textContent = `${step.stepCount} 步`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 状态压缩去重表:</span>
              <strong style="font-family: monospace; color: #2563eb;">visited[r][c][mask] 布尔数组管理三维状态空间</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'state-compression-bfs',
  name: '状态压缩 BFS (State Compression BFS)',
  viewId: 'algo-state-compression-bfs-view',
  category: 'graph',
  description: '左程云算法通关课核心状态扩展：(r, c, mask) 三维状态空间、位运算维护物品持有状态、分层迷宫多状态最短步数 (LeetCode 864)',
  icon: '🗝️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 22,
  learningGoal: '掌握状态压缩在广度优先搜索中的状态建模、位运算钥匙收集及门禁转移条件',
});

export { Visualizer as StateCompressionBfsVisualizer };
