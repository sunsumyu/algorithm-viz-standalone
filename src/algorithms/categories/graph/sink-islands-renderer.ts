/**
 * 沉没孤岛 (LC 130) 可视化器 — 声明式 Thin Domain Adapter
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseBinaryGrid } from '../../../core/input-primitives';
import {
  SINK_ISLANDS_PROBLEM_HTML,
  SINK_ISLANDS_ANALYSIS_HTML,
  SINK_ISLANDS_CODE_LANGUAGES,
} from './sink-islands-problem-content';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildSinkSteps,
  withSinkMetrics,
  DEFAULT_SINK_GRID,
  type SinkStep,
} from './sink-islands-step-compiler';

export { buildSinkSteps, type SinkStep } from './sink-islands-step-compiler';

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典 5×5 围岛', grid: DEFAULT_SINK_GRID },
  open: { label: '开放边缘 [4×5]', grid: [[1, 1, 0, 1, 1], [1, 0, 1, 0, 1], [0, 1, 1, 1, 0], [1, 0, 1, 0, 1]] },
  allProtected: { label: '全域连通 [3×4]', grid: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]] },
};

export function renderSinkIslandsCanvas(container: HTMLElement, step: SinkStep): void {
  const { grid, rows, cols, currentCell, action } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '560px',
    getCell: (r, c) => {
      const val = grid[r][c];
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

      let bg = '#f1f5f9';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';
      let label = String(val);

      if (val === 1) {
        bg = '#dcfce7';
        border = '1.5px solid #86efac';
        color = '#16a34a';
      } else if (val === 2) {
        bg = '#e0e7ff';
        border = '1.5px solid #a5b4fc';
        color = '#4338ca';
        label = '🛡️';
      }

      if (isCurrent && action === 'sink') {
        bg = '#fee2e2';
        border = '1.5px solid #fca5a5';
        color = '#dc2626';
      }

      let boxShadow = 'none';
      let transform = 'none';
      if (isCurrent) {
        boxShadow = '0 0 0 3px #facc15';
        transform = 'scale(1.06)';
      }

      return {
        text: label,
        bg,
        border,
        color,
        boxShadow,
        transform,
        zIndex: isCurrent ? 10 : 1,
        fontSize: '12px',
        fontWeight: '700',
      };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'sink-islands',
  aliases: ['class058-code03', 'surrounded-regions-130'],
  name: '沉没孤岛 (LC 130)',
  category: 'graph',
  hasDeductionTree: true,
  description: '两阶段 DFS：从边界出发标记边缘保护区，将内部所有未相连的孤岛淹没',
  icon: '🏝️',
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握逆向思维边界保护 DFS 遍历与多状态标记法',
  inputs: [
    {
      id: 'grid',
      label: '网格 (分号分行 0/1)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(DEFAULT_SINK_GRID),
      placeholder: '如 11111; 10001',
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.open.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.open.grid) } },
    { label: PRESET_CASES.allProtected.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.allProtected.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-stage', label: '当前阶段', color: '#6366f1' },
    { id: 'metric-protected-count', label: '保护区格数', color: '#4338ca' },
    { id: 'metric-sunk-count', label: '已淹没孤岛', color: '#dc2626' },
    { id: 'action', label: '处理动作', color: '#f59e0b' },
  ],
  legend: [
    { label: '普通陆地 (1)', color: '#16a34a' },
    { label: '边缘保护区 (🛡️)', color: '#4338ca' },
    { label: '淹没孤岛 (0)', color: '#dc2626' },
    { label: '水域 (0)', color: '#94a3b8' },
  ],
  codeLanguages: SINK_ISLANDS_CODE_LANGUAGES,
  problemHtml: SINK_ISLANDS_PROBLEM_HTML,
  analysisHtml: SINK_ISLANDS_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withSinkMetrics(buildSinkSteps(parseBinaryGrid(inputs?.grid, DEFAULT_SINK_GRID))),
  renderCanvas: (container, step) => renderSinkIslandsCanvas(container, step as SinkStep),
});
