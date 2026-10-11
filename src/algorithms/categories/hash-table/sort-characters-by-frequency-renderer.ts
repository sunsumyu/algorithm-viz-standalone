import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  FrequencySortStep,
  FREQ_SORT_CODES,
  buildFrequencySortSteps,
} from './sort-characters-by-frequency-step-compiler';
import { renderFrequencySortCanvas } from './sort-characters-by-frequency-canvas-adapter';

export type { FrequencySortStep };
export { FREQ_SORT_CODES, buildFrequencySortSteps, renderFrequencySortCanvas };

registerDeclarativeAlgorithm({
  id: 'sort-characters-by-frequency',
  name: '大厂高频真题: 根据字符出现频率排序 (Frequency Sort)',
  category: 'hash-table',
  learningGoal: '掌握哈希词频统计与基于频次的桶排序技巧，在 O(N) 线性时间内完成字符重排',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'tree',
      placeholder: '如 tree 或 ccatbb'
    }
  ],
  codeLanguages: FREQ_SORT_CODES,
  generateSteps: (inputs) => {
    const s = String(inputs.s || 'tree');
    return buildFrequencySortSteps(s.length ? s : 'tree');
  },
  renderCanvas: (container, step) => {
    renderFrequencySortCanvas(container, step as FrequencySortStep);
  }
});
