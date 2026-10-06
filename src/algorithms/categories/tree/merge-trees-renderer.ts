/**
 * 合并二叉树轻量领域适配器 (Thin Domain Adapter · LeetCode 617)
 * 遵循 Matt Pocock 深模块规范 (LOC < 150 行)，推演编译与画布呈现委托至统一深模块：
 *   - MergeTreesStepCompiler (推演步进编译器)
 *   - MergeTreesCanvasAdapter (三树沙盘与辅助动态适配器)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MERGE_TREES_STAGE1_CODES,
  MERGE_TREES_STAGE2_CODES,
} from './merge-trees-stage-codes';
import {
  MERGE_TREES_PROBLEM_HTML,
  MERGE_TREES_ANALYSIS_HTML,
} from './merge-trees-problem-content';
import {
  MergeTreesStepCompiler,
  MergeTreesStep,
  buildMergeTreesDfsSteps,
  buildMergeTreesBfsSteps,
  buildMergeTreesSteps,
  parseTreeInput,
  collectAllTreeVals,
} from '../../../core/renderers/adapters/merge-trees-step-compiler';
import {
  MergeTreesCanvasAdapter,
  renderMiniTreeSVG,
  renderMergeTreesCanvas,
  renderMergeTreesCard2,
} from '../../../core/renderers/adapters/merge-trees-canvas-adapter';

// 向后兼容导出
export type { MergeTreesStep };
export {
  MergeTreesStepCompiler,
  buildMergeTreesDfsSteps,
  buildMergeTreesBfsSteps,
  buildMergeTreesSteps,
  parseTreeInput,
  collectAllTreeVals,
  MergeTreesCanvasAdapter,
  renderMiniTreeSVG,
  renderMergeTreesCanvas,
  renderMergeTreesCard2,
};

function enrich(steps: MergeTreesStep[], isBfs = false): MergeTreesStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-val1': s.val1 !== null ? String(s.val1) : '-',
      'metric-val2': s.val2 !== null ? String(s.val2) : '-',
      'metric-sum': s.sum !== null ? String(s.sum) : '-',
      'metric-depth': String(isBfs ? (s.queueState?.length ?? 0) : s.depth),
    },
  }));
}

function parseInputs(inputs: Record<string, any>) {
  const t1 = parseTreeInput(inputs?.tree1, [1, 3, 2, 5]);
  const t2 = parseTreeInput(inputs?.tree2, [2, 1, 3, null, 4, null, 7]);
  return { t1, t2 };
}

export const mergeTreesVisualizer = registerDeclarativeAlgorithm<MergeTreesStep>({
  id: 'merge-trees',
  name: '合并二叉树',
  category: 'tree',
  description: '合并两棵二叉树：对应重叠节点值相加，单边存在节点直接继承',
  icon: '🤝',
  difficulty: 1,
  levelOrder: 617,
  aliases: ['leetcode-617', 'merge-two-binary-trees'],
  learningGoal: '掌握双树同步遍历递归模型 (Simultaneous DFS) 与广度优先队列迭代合并两大工业范式',
  inputs: [
    { id: 'tree1', label: '树 1 层序数组', type: 'text', defaultValue: '1, 3, 2, 5', placeholder: '以逗号分隔，如 1, 3, 2, 5' },
    { id: 'tree2', label: '树 2 层序数组', type: 'text', defaultValue: '2, 1, 3, null, 4, null, 7', placeholder: '以逗号分隔，如 2, 1, 3, null, 4, null, 7' },
  ],
  presets: [
    { label: '经典案例 [1,3,2,5] + [2,1,3,null,4,null,7]', values: { tree1: '1, 3, 2, 5', tree2: '2, 1, 3, null, 4, null, 7' } },
    { label: '单节点与多层树 [1] + [1, 2, 3]', values: { tree1: '1', tree2: '1, 2, 3' } },
    { label: '互补左右斜树 [1,2,null,3] + [1,null,2,null,3]', values: { tree1: '1, 2, null, 3', tree2: '1, null, 2, null, 3' } },
    { label: '一侧为空树 [1, 2, 3] + []', values: { tree1: '1, 2, 3', tree2: '' } },
  ],
  metrics: [
    { id: 'metric-val1', label: '树 1 节点值', color: '#0284c7' },
    { id: 'metric-val2', label: '树 2 节点值', color: '#9333ea' },
    { id: 'metric-sum', label: '合并计算和', color: '#eab308' },
    { id: 'metric-depth', label: '递归深度/对数', color: '#16a34a' },
  ],
  legend: [
    { label: '树 1 节点', color: '#0284c7' },
    { label: '树 2 节点', color: '#9333ea' },
    { label: '合并完成', color: '#16a34a' },
    { label: '单边继承', color: '#7e22ce' },
  ],
  stages: [
    {
      id: 'stage-1-recursive',
      name: 'Stage 1: 递归 DFS 同步下潜',
      shortName: '递归 DFS',
      num: 1,
      timeBadge: 'O(min(M,N))',
      codeLanguages: MERGE_TREES_STAGE1_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t1, t2 } = parseInputs(inputs);
        return enrich(buildMergeTreesDfsSteps(t1, t2), false);
      },
      renderCanvas: renderMergeTreesCanvas,
      auxiliaryVisual: { title: '节点推导与推演动态', render: renderMergeTreesCard2 },
      renderCustomMetrics: renderMergeTreesCard2,
    },
    {
      id: 'stage-2-queue-bfs',
      name: 'Stage 2: 迭代 BFS 队列同步合并',
      shortName: '迭代 BFS 队列',
      num: 2,
      timeBadge: 'O(min(M,N))',
      codeLanguages: MERGE_TREES_STAGE2_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t1, t2 } = parseInputs(inputs);
        return enrich(buildMergeTreesBfsSteps(t1, t2), true);
      },
      renderCanvas: renderMergeTreesCanvas,
      auxiliaryVisual: { title: '节点推导与队列状态', render: renderMergeTreesCard2 },
      renderCustomMetrics: renderMergeTreesCard2,
    },
  ],
  problemHtml: MERGE_TREES_PROBLEM_HTML,
  analysisHtml: MERGE_TREES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const { t1, t2 } = parseInputs(inputs);
    return enrich(buildMergeTreesDfsSteps(t1, t2), false);
  },
  renderCanvas: (container, step) => renderMergeTreesCanvas(container, step as MergeTreesStep),
  renderCustomMetrics: (container, step) => renderMergeTreesCard2(container, step as MergeTreesStep),
});
