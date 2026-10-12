/**
 * Class 184: 整体二分 (Parallel Binary Search)
 * 批量询问分流 + 值域二分 + 树状数组区间修改 / POJ 2104 / 洛谷 P3527 [POI2011] MET-Meteors
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { PARALLEL_BINARY_SEARCH_CODES } from './advanced-179-184-stage-codes';
import {
  buildParallelBSSteps,
  ParallelBSStep,
} from '../../../../core/renderers/adapters/parallel-binary-search-184-step-compiler';
import { renderParallelBSCanvas } from '../../../../core/renderers/adapters/parallel-binary-search-184-canvas-adapter';

export { buildParallelBSSteps, type ParallelBSStep };

export const parallelBinarySearchVisualizer = registerDeclarativeAlgorithm<ParallelBSStep>({
  id: 'parallel-binary-search-184',
  name: '整体二分 (Parallel Binary Search / Class 184)',
  aliases: ['class184-code01', 'parallel-binary-search-184', 'overall-binary-search'],
  category: 'search',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 184,
  description: '左程云算法通关课 Class 184：整体二分 (Parallel Binary Search)。多询问值域二分分流，区间批量修改+树状数组撤销，O((N+Q) log V) 解决离线批量阈值查询。',
  learningGoal: '掌握批量询问值域分流、操作批量生效与精准撤销、单次分治解决整体询问的精髓',
  problemHtml: ADVANCED_179_184_PROBLEMS.parallelBinarySearch.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.parallelBinarySearch.html,
  inputs: [
    {
      id: 'preset',
      label: '流星雨与国家需求',
      type: 'select',
      defaultValue: 'queries_2',
      options: [
        { label: '2 国家陨石雨阈值判定', value: 'queries_2' },
      ],
    },
  ],
  codeLanguages: PARALLEL_BINARY_SEARCH_CODES,
  generateSteps: () => buildParallelBSSteps(),
  renderCanvas: (container, step) => renderParallelBSCanvas(container, step),
});
