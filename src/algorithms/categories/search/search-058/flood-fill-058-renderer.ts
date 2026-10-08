/**
 * Class 058: Code01 图像渲染 (Flood Fill · LeetCode 733)
 * 经典洪水填充入门模版 — 声明式 Thin Domain Adapter (LOC < 140)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SEARCH_058_PROBLEMS } from './search-058-problem-content';
import { FLOOD_FILL_058_CODES } from './search-058-stage-codes';
import { BinaryGridCanvasAdapter } from '../../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildFloodFillSteps,
  parseAndBuildFloodFillSteps,
  type FloodFillStep,
} from './flood-fill-058-step-compiler';

export { buildFloodFillSteps, parseAndBuildFloodFillSteps, type FloodFillStep };

const COLOR_PALETTE: Record<number, { bg: string; color: string; border: string }> = {
  0: { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' },
  1: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  2: { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  3: { bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  4: { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe' },
};

export function renderFloodFillCanvas(container: HTMLElement, step: FloodFillStep): void {
  const rows = step.image.length;
  const cols = step.image[0].length;

  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows,
    cols,
    cellSize: '56px',
    gap: '8px',
    maxWidth: '380px',
    getCell: (r, c) => {
      const val = step.image[r][c];
      const isCur = step.curR === r && step.curC === c;
      const isStart = step.sr === r && step.sc === c;
      const palette = COLOR_PALETTE[val] || COLOR_PALETTE[0];

      let bg = palette.bg;
      let color = palette.color;
      let border = `1.5px solid ${palette.border}`;
      let text = `${val}`;
      let boxShadow = 'none';
      let transform = 'none';

      if (isCur) {
        transform = 'scale(1.1)';
        boxShadow = '0 0 0 3px #f59e0b';
        border = '2px solid #d97706';
      } else if (isStart) {
        boxShadow = '0 0 0 2px #3b82f6';
      }

      return {
        text,
        bg,
        color,
        border,
        boxShadow,
        transform,
        zIndex: isCur ? 10 : 1,
        fontSize: '14px',
        fontWeight: '800',
        title: `(${r}, ${c}): 颜色 ${val}`,
      };
    },
  });
}

export const floodFill058Renderer = registerDeclarativeAlgorithm<FloodFillStep>({
  id: 'flood-fill-058',
  aliases: ['class058-code01', 'flood-fill-733', 'image-flood-fill', 'leetcode-733'],
  name: '图像渲染 (Flood Fill / Class 058)',
  category: 'search',
  difficulty: 'easy',
  badge: { mode: '洪水填充', complexity: 'O(M·N)' },
  description: '左程云算法通关课【必备篇】Class 058：洪水填充核心模版、四方向深度优先搜索与同色死循环防御 (LeetCode 733)',
  learningGoal: '透彻掌握 Flood Fill 连通性浸染核心哲学，深刻领悟同色防御特判在规避无限死循环中的关键价值。',
  icon: '🎨',
  inputs: [
    {
      id: 'gridStr',
      label: '图像矩阵 (各行用斜杠分隔, 逗号分隔像素)',
      type: 'text',
      defaultValue: '1, 1, 1 / 1, 1, 0 / 1, 0, 1',
      placeholder: '例如: 1, 1, 1 / 1, 1, 0 / 1, 0, 1',
    },
    {
      id: 'sr',
      label: '起始行坐标 sr',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 10,
    },
    {
      id: 'sc',
      label: '起始列坐标 sc',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 10,
    },
    {
      id: 'color',
      label: '渲染新颜色 (0~4)',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 4,
    },
  ],
  presets: [
    { label: '3x3 经典连通块渲染 (1->2)', values: { gridStr: '1, 1, 1 / 1, 1, 0 / 1, 0, 1', sr: 1, sc: 1, color: 2 } },
    { label: '3x2 拐角连通区域 (1->2)', values: { gridStr: '0, 0, 0 / 0, 1, 1', sr: 1, sc: 1, color: 1 } },
  ],
  problemContent: SEARCH_058_PROBLEMS.floodFill058,
  codeLanguages: FLOOD_FILL_058_CODES,
  generateSteps: (params) => parseAndBuildFloodFillSteps(params),
  renderCanvas: (container, step) => renderFloodFillCanvas(container, step),
});
