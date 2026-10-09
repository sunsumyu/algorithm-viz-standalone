import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type ProvincesStep,
  NUMBER_OF_PROVINCES_CODES,
  buildProvincesSteps
} from './number-of-provinces-step-compiler';
import { renderProvincesCanvas } from '../../../core/renderers/adapters/number-of-provinces-canvas-adapter';

export type { ProvincesStep };
export { NUMBER_OF_PROVINCES_CODES, buildProvincesSteps };
export { renderProvincesCanvas };

const PRESET_MATRICES: Record<string, number[][]> = {
  case1: [
    [1, 1, 0],
    [1, 1, 0],
    [0, 0, 1]
  ],
  case2: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ],
  case3: [
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 1, 1, 1],
    [0, 0, 1, 1]
  ]
};

registerDeclarativeAlgorithm({
  id: 'number-of-provinces',
  name: '大厂高频真题: 省份数量 (Number of Provinces)',
  category: 'graph',
  aliases: ['leetcode-547', 'lc-547', 'friend-circles', 'class056-code02'],
  hasDeductionTree: true,
  learningGoal: '掌握并查集（Union-Find）在连通分量与网络合并中的核心应用，理解路径压缩优化机制',
  inputs: [
    {
      id: 'matrixPreset',
      label: '图预设用例',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '用例 1: 3城市 2省份 ([[1,1,0],[1,1,0],[0,0,1]])', value: 'case1' },
        { label: '用例 2: 3城市 3省份 (孤立三省份)', value: 'case2' },
        { label: '用例 3: 4城市 1省份 (链式全连通)', value: 'case3' }
      ]
    }
  ],
  presets: [
    { label: '用例 1: 3城市 2省份 (经典合并)', values: { matrixPreset: 'case1' } },
    { label: '用例 2: 3城市 3省份 (孤立自成省)', values: { matrixPreset: 'case2' } },
    { label: '用例 3: 4城市 1省份 (链式全连通)', values: { matrixPreset: 'case3' } }
  ],
  codeLanguages: NUMBER_OF_PROVINCES_CODES,
  generateSteps: (inputs) => {
    const presetKey = String(inputs.matrixPreset || 'case1');
    const matrix = PRESET_MATRICES[presetKey] || PRESET_MATRICES.case1;
    return buildProvincesSteps(matrix);
  },
  renderCanvas: (container, step) => {
    renderProvincesCanvas(container, step as ProvincesStep);
  },
  renderCustomMetrics: (container, rawStep) => {
    const s = rawStep as ProvincesStep;
    const parentChips = s.parent.map((p, i) => {
      const isCur = i === s.currentI || i === s.currentJ;
      const border = isCur ? 'border-pink-500 bg-pink-950/40 text-pink-300' : 'border-slate-700 bg-slate-900/60 text-slate-300';
      return `<div class="flex flex-col items-center px-2 py-1 rounded border ${border} text-xs">
        <span class="font-bold text-sm">${p}</span>
        <span class="text-[10px] text-slate-400">C${i}</span>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div class="flex flex-col gap-2 p-2">
        <div class="flex items-center justify-between text-xs text-slate-300">
          <span>并查集父指针 parent[i]</span>
          <span class="font-bold text-emerald-400">独立省份: ${s.provincesCount}</span>
        </div>
        <div class="flex flex-wrap gap-1.5">${parentChips}</div>
      </div>
    `;
  }
});
