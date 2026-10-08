/**
 * Class 058: 洪水填充高频扩展与最大人工岛 (Making A Large Island · LeetCode 827)
 * 两次遍历染色标号与 0 点四邻桥接合并 — 声明式 Thin Domain Adapter (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SEARCH_058_PROBLEMS } from './search-058-problem-content';
import { MAKING_LARGE_ISLAND_058_CODES } from './search-058-stage-codes';
import { BinaryGridCanvasAdapter } from '../../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildLargeIsland058Steps,
  type LargeIsland058Step,
} from './making-large-island-058-step-compiler';

export { buildLargeIsland058Steps, type LargeIsland058Step };

const ISLAND_COLORS: Record<number, { bg: string; color: string; border: string }> = {
  0: { bg: '#f8fafc', color: '#94a3b8', border: '#cbd5e1' },
  1: { bg: '#ffffff', color: '#64748b', border: '#cbd5e1' },
  2: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  3: { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  4: { bg: '#faf5ff', color: '#7e22ce', border: '#d8b4fe' },
};

export function renderMakingLargeIslandCanvas(container: HTMLElement, step: LargeIsland058Step): void {
  const n = step.grid.length;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: n,
    cols: n,
    cellSize: '56px',
    gap: '8px',
    maxWidth: '380px',
    getCell: (r, c) => {
      const val = step.grid[r][c];
      const isFlipped = step.flipR === r && step.flipC === c;
      const palette = ISLAND_COLORS[val] || ISLAND_COLORS[0];

      let bg = palette.bg;
      let color = palette.color;
      let border = `1.5px solid ${palette.border}`;
      let text = val === 0 ? '0' : val === 1 ? '1' : `ID:${val}`;
      let boxShadow = 'none';
      let transform = 'none';

      if (isFlipped) {
        bg = '#fee2e2';
        color = '#dc2626';
        border = '2px solid #ef4444';
        text = '★ 桥';
        transform = 'scale(1.1)';
        boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.25)';
      }

      return {
        text,
        bg,
        color,
        border,
        boxShadow,
        transform,
        zIndex: isFlipped ? 10 : 1,
        fontSize: '12px',
        fontWeight: '800',
        title: val > 1 ? `岛屿 ID: ${val}, 面积: ${step.areaMap[val] ?? 0}` : `(${r}, ${c})`,
      };
    },
  });
}

export const makingLargeIsland058Visualizer = registerDeclarativeAlgorithm<LargeIsland058Step>({
  id: 'making-large-island-058',
  aliases: ['class058-code05', 'making-a-large-island-827', 'make-largest-island-058'],
  name: '洪水填充与最大人工岛 (Class 058)',
  category: 'search',
  difficulty: 'hard',
  problemContent: SEARCH_058_PROBLEMS.makingLargeIsland058,
  codeLanguages: MAKING_LARGE_ISLAND_058_CODES,
  generateSteps: buildLargeIsland058Steps,
  renderCanvas: (container, step) => renderMakingLargeIslandCanvas(container, step),
});
