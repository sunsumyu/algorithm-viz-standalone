/**
 * 岛屿的周长 (LC 463) 可视化器 — 声明式 Thin Domain Adapter
 * 严格遵循 Matt Pocock 深模块规范与 AGENTS.md 身材红线 (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  COASTLINE_PROBLEM_HTML,
  COASTLINE_ANALYSIS_HTML,
  COASTLINE_CODE_LANGUAGES,
} from './coastline-problem-content';
import { parseBinaryGrid } from '../../../core/input-primitives';
import { BinaryGridCanvasAdapter } from '../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildCoastlineSteps,
  withCoastlineMetrics,
  type CLStep,
} from './coastline-step-compiler';

export { buildCoastlineSteps, type CLStep } from './coastline-step-compiler';

const DEFAULT_GRID = [
  [0, 1, 0, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 0],
  [1, 1, 0, 0],
];

const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典十字连通 [4×4, P=16]', grid: DEFAULT_GRID },
  ring: {
    label: '中空回字形 [4×4, P=16]',
    grid: [
      [1, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 1, 1, 1],
    ],
  },
  single: { label: '独立单块岛 [3×3, P=4]', grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
};

export function renderCoastlineCanvas(container: HTMLElement, step: CLStep): void {
  const { grid, rows, cols, currentCell, exposedEdges } = step;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '1fr',
    maxWidth: '560px',
    getCell: (r, c) => {
      const val = grid[r][c];
      const isLand = val === 1;
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
      const key = `${r},${c}`;
      const cellEdgesArr = exposedEdges[key] || [false, false, false, false];

      let bg = '#f1f5f9';
      let border = '1px solid #cbd5e1';
      let color = '#94a3b8';
      if (isLand) {
        bg = '#dcfce7';
        border = '1.5px solid #86efac';
        color = '#16a34a';
      }

      let boxShadow = 'none';
      let transform = 'none';
      if (isCurrent) {
        boxShadow = '0 0 0 3px #facc15';
        bg = '#fef9c3';
        color = '#854d0e';
        transform = 'scale(1.05)';
      }

      let edgeDoms = '';
      if (isLand) {
        if (cellEdgesArr[0])
          edgeDoms += '<div style="position: absolute; top: 0; left: 0; right: 0; height: 3.5px; background: #e11d48; border-radius: 4px 4px 0 0;"></div>';
        if (cellEdgesArr[1])
          edgeDoms += '<div style="position: absolute; top: 0; right: 0; bottom: 0; width: 3.5px; background: #e11d48; border-radius: 0 4px 4px 0;"></div>';
        if (cellEdgesArr[2])
          edgeDoms += '<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 3.5px; background: #e11d48; border-radius: 0 0 4px 4px;"></div>';
        if (cellEdgesArr[3])
          edgeDoms += '<div style="position: absolute; top: 0; left: 0; bottom: 0; width: 3.5px; background: #e11d48; border-radius: 4px 0 0 4px;"></div>';
      }

      return {
        text: isLand ? '1' : '0',
        bg,
        border,
        color,
        boxShadow,
        transform,
        extraHtml: edgeDoms,
        zIndex: isCurrent ? 10 : 1,
        fontSize: '12px',
        fontWeight: '700',
      };
    },
  });
}

registerDeclarativeAlgorithm({
  id: 'coastline',
  name: '岛屿的周长 (LC 463)',
  category: 'graph',
  description: '逐格扫描陆地并检查 4 邻域水域与越界边，实时累计岛屿海岸线周长',
  icon: '🌊',
  difficulty: 1,
  levelOrder: 15,
  learningGoal: '掌握网格 4 邻域边界判定与单格边贡献分析法',
  inputs: [
    {
      id: 'grid',
      label: '网格 (分号分行 0/1)',
      type: 'text',
      defaultValue: BinaryGridCanvasAdapter.formatGridInput(DEFAULT_GRID),
      placeholder: '如 0100; 1110',
      width: '210px',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.classic.grid) } },
    { label: PRESET_CASES.ring.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.ring.grid) } },
    { label: PRESET_CASES.single.label, values: { grid: BinaryGridCanvasAdapter.formatGridInput(PRESET_CASES.single.grid) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前格子', color: '#3b82f6' },
    { id: 'metric-cell-edges', label: '当前暴露边数', color: '#e11d48' },
    { id: 'metric-land-count', label: '陆地总数', color: '#16a34a' },
    { id: 'metric-total-perimeter', label: '累计周长', color: '#10b981' },
    { id: 'action', label: '累计公式', color: '#6366f1' },
  ],
  legend: [
    { label: '陆地 (1)', color: '#86efac' },
    { label: '水域 (0)', color: '#cbd5e1' },
    { label: '暴露周长边', color: '#e11d48' },
  ],
  codeLanguages: COASTLINE_CODE_LANGUAGES,
  problemHtml: COASTLINE_PROBLEM_HTML,
  analysisHtml: COASTLINE_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withCoastlineMetrics(buildCoastlineSteps(parseBinaryGrid(inputs?.grid, DEFAULT_GRID))),
  renderCanvas: (container, step) => renderCoastlineCanvas(container, step as CLStep),
});
