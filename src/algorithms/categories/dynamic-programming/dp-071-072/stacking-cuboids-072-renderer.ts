/**
 * 左程云 Class 072 Code01: 堆叠长方体的最大高度 (Maximum Height by Stacking Cuboids · LeetCode 1691)
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 90)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  STACKING_CUBOIDS_072_CODES,
  STACKING_CUBOIDS_072_HTML,
} from './dp-071-072-problem-content';
import {
  CuboidStep,
  STACKING_CUBOIDS_PRESETS,
  buildStackingCuboids072Steps,
} from '../../../../core/renderers/adapters/stacking-cuboids-step-compiler';
import { renderStackingCuboidsCanvas } from '../../../../core/renderers/adapters/stacking-cuboids-canvas-adapter';

export type { CuboidStep };
export { buildStackingCuboids072Steps, renderStackingCuboidsCanvas };

export const stackingCuboids072Visualizer = registerDeclarativeAlgorithm<CuboidStep>({
  id: 'stacking-cuboids',
  aliases: ['class072-code01', 'stacking-cuboids-1691', 'leetcode-1691'],
  name: '堆叠长方体的最大高度 (Stacking Cuboids)',
  category: 'dynamic-programming',
  icon: '📦',
  difficulty: 3,
  levelOrder: 1691,
  learningGoal: '掌握三维偏序问题通过贪心内部排序消解自由度，并结合整体字典序排序降维至带权 LIS 的精妙思想',
  metrics: [
    { id: 'maxHeight', label: '最大堆叠高度', color: 'emerald' },
    { id: 'currentIdx', label: '底座下标 i', color: 'blue' },
  ],
  problemHtml: STACKING_CUBOIDS_072_HTML,
  codeLanguages: STACKING_CUBOIDS_072_CODES,
  presets: [
    { label: '经典三箱: 50x45x20; 95x37x53; 45x23x12', values: { cuboids: '50,45,20; 95,37,53; 45,23,12' } },
    { label: '互不相容: 38x25x45; 76x35x3', values: { cuboids: '38,25,45; 76,35,3' } },
    { label: '置换对称: 7,11,17 六种排列', values: { cuboids: '7,11,17; 7,17,11; 11,7,17; 11,17,7; 17,7,11; 17,11,7' } },
  ],
  inputs: [
    {
      id: 'cuboids',
      label: '长方体列表 [w, l, h] 分号分隔 (如: 50,45,20; 95,37,53; 45,23,12)',
      type: 'text',
      defaultValue: '50,45,20; 95,37,53; 45,23,12',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.cuboids || '50,45,20; 95,37,53; 45,23,12');
    const parsed: [number, number, number][] = raw
      .split(';')
      .map(part => {
        const dims = part.split(',').map(s => Number(s.trim()));
        if (dims.length === 3 && dims.every(d => !isNaN(d) && d > 0)) {
          return [dims[0], dims[1], dims[2]] as [number, number, number];
        }
        return null;
      })
      .filter((c): c is [number, number, number] => c !== null);

    return buildStackingCuboids072Steps(parsed.length > 0 ? parsed : STACKING_CUBOIDS_PRESETS.standard);
  },
  renderCanvas: (container, step) => {
    renderStackingCuboidsCanvas(container, step);
  },
});
