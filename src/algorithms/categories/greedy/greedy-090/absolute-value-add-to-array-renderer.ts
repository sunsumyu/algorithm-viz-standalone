/**
 * 加入差值绝对值直到长度固定 (大厂真实笔试) - 声明式教学级沙盘渲染器
 * 核心贪心与数论：更相减损术闭包——所有差值收敛为最大公约数 gcd(arr) 的倍数，终态长度为 max/g (+1 if hasZero)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  ABS_VALUE_ADD_STAGE1_CODES,
  ABS_VALUE_ADD_STAGE2_CODES,
  ABS_VALUE_ADD_STAGE3_CODES,
} from './greedy-090-stage-codes';
import {
  type AbsValueAddStep,
  parseArrayInput,
  buildAbsValueAddSteps,
} from './absolute-value-add-to-array-step-compiler';
import {
  renderAbsValueAddCanvas,
  renderAbsValueAddCustomMetrics,
  ABS_VALUE_ADD_ANALYSIS_HTML,
} from './absolute-value-add-to-array-canvas-adapter';

export type { AbsValueAddStep };
export {
  parseArrayInput,
  buildAbsValueAddSteps,
  renderAbsValueAddCanvas,
  renderAbsValueAddCustomMetrics,
};

const { template } = createDeclarativeVisualizer<AbsValueAddStep>({
  id: 'absolute-value-add-to-array',
  name: '加入差值绝对值直到长度固定',
  category: 'greedy',
  icon: '🔢',
  badge: { mode: '欧几里得GCD数论贪心', complexity: 'O(n log max) · O(1)' },
  card1Title: '🔢 差值绝对值扩散与格点沙盘',
  card2Title: '🧮 欧几里得 GCD 数论监视器',
  card2Desc: '展示两两配对作差、更相减损术生成最小公约数与格点全覆盖过程',
  legend: [
    { label: '初始/已入库元素', color: '#1e293b' },
    { label: '两数配对作差中', color: '#f59e0b' },
    { label: '新生成的有效差值', color: '#10b981' },
  ],
  inputs: [
    { id: 'input-arr', label: '非负整数数组', type: 'text', defaultValue: '3, 9', width: '180px' },
  ],
  presets: [
    { label: '简单公约数 [3, 9] (生成 3,6,9)', values: { 'input-arr': '3, 9' } },
    { label: '互质数组 [4, 6, 15] (GCD=1)', values: { 'input-arr': '4, 6, 15' } },
    { label: '含相同数生成0 [2, 6, 2]', values: { 'input-arr': '2, 6, 2' } },
    { label: '含0初始 [0, 8, 12]', values: { 'input-arr': '0, 8, 12' } },
  ],
  metrics: [
    { id: 'curr-len', label: '当前数组长度', color: '#38bdf8' },
    { id: 'gcd-val', label: '全局 GCD (g)', color: '#10b981' },
    { id: 'theory-count', label: '理论终态长度', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力集合迭代模拟扩散',
      shortName: '暴力模拟',
      card2Desc: '双重循环枚举所有两数差值，动态添加到哈希表中直到大小稳定',
      codeLanguages: ABS_VALUE_ADD_STAGE1_CODES,
      buildSteps: (inputs) => buildAbsValueAddSteps(inputs?.['input-arr'] || '3, 9', 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 欧几里得 GCD 数论贪心推演',
      shortName: 'GCD数论贪心',
      card2Desc: '更相减损术收敛到 gcd(arr)，最终正数数量精确等于 max/g',
      codeLanguages: ABS_VALUE_ADD_STAGE2_CODES,
      buildSteps: (inputs) => buildAbsValueAddSteps(inputs?.['input-arr'] || '3, 9', 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 裴蜀定理与更相减损证明',
      shortName: '贪心证明',
      card2Desc: '数学证明差值闭包在正整数域严格等价于 gcd 生成的理想格点',
      codeLanguages: ABS_VALUE_ADD_STAGE3_CODES,
      buildSteps: (inputs) => buildAbsValueAddSteps(inputs?.['input-arr'] || '3, 9', 3),
    },
  ],
  codeLanguages: ABS_VALUE_ADD_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.absoluteValueAddToArray.html,
  analysisHtml: ABS_VALUE_ADD_ANALYSIS_HTML,
  buildSteps: (inputs) => buildAbsValueAddSteps(inputs?.['input-arr'] || '3, 9', 2),
  renderCanvas: renderAbsValueAddCanvas,
  renderCustomMetrics: renderAbsValueAddCustomMetrics,
});

export const absoluteValueAddToArrayRenderer = UniversalStageVisualizer;
registerAlgorithm({
  id: 'absolute-value-add-to-array',
  name: '加入差值绝对值直到长度固定',
  viewId: 'algo-absolute-value-add-to-array-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code06：更相减损术闭包，GCD 数论极速推演与裴蜀定理证明',
  icon: '🔢',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 906,
  learningGoal: '掌握差值闭包收敛于 GCD 理想格点的数论贪心本质',
  aliases: ['class090-code06', 'absolute-value-add', 'gcd-closure-array'],
});
