/**
 * 左程云算法通关课 Class 062: 地图分析 (As Far from Land as Possible · LeetCode 1162)
 * 多源 BFS 波前同心圆扩散求最大曼哈顿距离 — 声明式 Thin Domain Adapter (LOC < 120)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import { AS_FAR_FROM_LAND_062_CODES } from './graph-062-stage-codes';
import { BinaryGridCanvasAdapter } from '../../../../core/renderers/adapters/binary-grid-canvas-adapter';
import {
  buildAsFarFromLand062Steps,
  type AsFarFromLandStep,
} from './as-far-from-land-062-step-compiler';

export { buildAsFarFromLand062Steps, type AsFarFromLandStep };

export function renderAsFarFromLandCanvas(container: HTMLElement, step: AsFarFromLandStep): void {
  const n = step.grid.length;
  BinaryGridCanvasAdapter.renderGridCanvas(container, {
    rows: n,
    cols: n,
    cellSize: '56px',
    gap: '8px',
    maxWidth: '380px',
    getCell: (r, c) => {
      const isCur = step.curCoord && step.curCoord[0] === r && step.curCoord[1] === c;
      const d = step.distMap[r][c];

      let bg = '#f1f5f9';
      let color = '#64748b';
      let border = '1.5px solid #cbd5e1';
      let text = '🌊 海';
      let boxShadow = 'none';
      let transform = 'none';

      if (d === 0) {
        bg = '#dcfce7';
        color = '#15803d';
        border = '1.5px solid #86efac';
        text = '🏝️ 陆';
      } else if (d > 0) {
        text = `🌊 ${d}`;
        color = '#0369a1';
        bg = d === 1 ? '#e0f2fe' : d === 2 ? '#bae6fd' : d === 3 ? '#7dd3fc' : '#38bdf8';
        border = '1.5px solid #38bdf8';
      }

      if (isCur) {
        transform = 'scale(1.08)';
        boxShadow = '0 0 0 3px #f59e0b';
        border = '2px solid #d97706';
      }

      return {
        text,
        bg,
        color,
        border,
        boxShadow,
        transform,
        zIndex: isCur ? 10 : 1,
        fontSize: '13px',
        fontWeight: '800',
      };
    },
  });
}

export const asFarFromLand062Visualizer = registerDeclarativeAlgorithm<AsFarFromLandStep>({
  id: 'as-far-from-land-062',
  aliases: ['as-far-from-land', 'map-analysis-1162', 'leetcode-1162'],
  name: '地图分析与多源广搜 (Class 062)',
  category: 'graph',
  hasDeductionTree: true,
  icon: '🗺️',
  difficulty: 2,
  levelOrder: 6201,
  learningGoal: '掌握多源 BFS 逆向思维：将所有陆地并发入队，通过波前扩散在 O(N²) 线性时间内求解全局最大最短距离',
  problemHtml: GRAPH_062_PROBLEMS.asFarFromLand062.html,
  codeLanguages: AS_FAR_FROM_LAND_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '地形用例选择',
      type: 'select',
      defaultValue: 'classic_3x3',
      options: [
        { label: '3x3 四角陆地中心水域 (距离=2)', value: 'classic_3x3' },
        { label: '3x3 左上角单点陆地 (距离=4)', value: 'corner_land' },
        { label: '2x2 全海洋特判用例 (-1)', value: 'all_sea' },
      ],
    },
  ],
  presets: [
    { label: '3x3 四角陆地中心水域 (经典)', values: { preset: 'classic_3x3' } },
    { label: '3x3 单角陆地扩散', values: { preset: 'corner_land' } },
    { label: '全海洋特判用例', values: { preset: 'all_sea' } },
  ],
  generateSteps: (inputs) => buildAsFarFromLand062Steps(inputs?.preset),
  renderCanvas: (container, step) => renderAsFarFromLandCanvas(container, step),
});
