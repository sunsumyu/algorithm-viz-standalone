/**
 * 平均值最小累加和 (Split Minimum Average Sum) - 声明式教学级沙盘渲染器
 * 核心贪心：升序排序后，最小 k-1 个元素各自独占一个集合，剩余大元素全部合入最后一个集合稀释
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import { SPLIT_MIN_AVG_SUM_CODES } from './greedy-091-stage-codes';
import {
  type SetGroup,
  type SplitMinAvgSumStep,
  buildSplitMinAvgSumSteps,
} from './split-min-avg-sum-step-compiler';
import { renderSplitMinAvgSumCanvas } from './split-min-avg-sum-canvas-adapter';

export type { SetGroup, SplitMinAvgSumStep };
export { buildSplitMinAvgSumSteps, renderSplitMinAvgSumCanvas };

const { template } = createDeclarativeVisualizer<SplitMinAvgSumStep>({
  id: 'split-min-avg-sum',
  name: '平均值最小累加和 (Split Minimum Average Sum)',
  category: 'greedy',
  icon: '➗',
  difficulty: 2,
  levelOrder: 914,
  learningGoal: '掌握前k-1小值独占集合与其余大数合并稀释的贪心不等式证明',
  problemHtml: GREEDY_091_PROBLEMS.splitMinAvgSum.html,
  analysisHtml: GREEDY_091_PROBLEMS.splitMinAvgSum.html,
  inputs: [
    {
      id: 'input-arr',
      label: '输入数组 arr',
      type: 'text',
      defaultValue: '9, 1, 8, 2, 7, 3, 6',
      placeholder: '9, 1, 8, 2, 7, 3, 6',
    },
    {
      id: 'input-k',
      label: '划分集合数 k',
      type: 'text',
      defaultValue: '3',
      placeholder: '如 3',
    },
  ],
  codeLanguages: SPLIT_MIN_AVG_SUM_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawArr = String(inputs?.['input-arr'] || '9, 1, 8, 2, 7, 3, 6');
    const k = Math.max(1, parseInt(String(inputs?.['input-k'] || '3'), 10) || 1);
    const arr = rawArr.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildSplitMinAvgSumSteps(arr, k);
  },
  renderCanvas: renderSplitMinAvgSumCanvas,
});

export const splitMinAvgSumVisualizer = UniversalStageVisualizer;
export const splitMinAvgSumRenderer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'split-min-avg-sum',
  name: '平均值最小累加和 (Split Minimum Average Sum)',
  viewId: 'algo-split-min-avg-sum-view',
  category: 'greedy',
  icon: '➗',
  difficulty: 2,
  levelOrder: 914,
  description: '将数组分为 k 个子集使各子集平均值之和最小，通过不等式证明前 k-1 小值独占单元素集合，其余大数合并稀释。',
  learningGoal: '掌握前k-1小值独占集合与其余大数合并稀释的贪心不等式证明',
  aliases: ['class091-code04', 'split-minimum-average-sum'],
  template,
  Visualizer: UniversalStageVisualizer,
});
