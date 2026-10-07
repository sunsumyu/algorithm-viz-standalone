/**
 * IPO 项目最大化资本 (LeetCode 502) - 声明式教学级沙盘渲染器
 * 核心贪心：双堆协同——启动资金小根堆（待解锁）+ 纯利润大根堆（已解锁可选），贪心挑选最大利润滚雪球
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { GREEDY_090_PROBLEMS } from './greedy-090-problem-content';
import {
  IPO_STAGE1_CODES,
  IPO_STAGE2_CODES,
  IPO_STAGE3_CODES,
} from './greedy-090-stage-codes';
import {
  type IPOStep,
  parseProjectsInput,
  buildIPOSteps,
} from './ipo-step-compiler';
import {
  renderIPOCanvas,
  renderIPOCustomMetrics,
  IPO_ANALYSIS_HTML,
} from './ipo-canvas-adapter';

export type { IPOStep };
export {
  parseProjectsInput,
  buildIPOSteps,
  renderIPOCanvas,
  renderIPOCustomMetrics,
};

const { template } = createDeclarativeVisualizer<IPOStep>({
  id: 'ipo-max-capital',
  name: 'IPO 最大化资本',
  category: 'greedy',
  icon: '💰',
  badge: { mode: '双堆协同滚雪球', complexity: 'O(n log n) · O(n)' },
  card1Title: '💼 IPO 双堆协同资本市场沙盘',
  card2Title: '📈 资本流动与项目解锁监视器',
  card2Desc: '展示成本小根堆门槛筛选、利润大根堆利润套现与资本滚雪球过程',
  legend: [
    { label: '已解锁可投资项目 (利润大根堆)', color: '#10b981' },
    { label: '待解锁受限项目 (成本小根堆)', color: '#ef4444' },
    { label: '当前正在投资项目', color: '#f59e0b' },
  ],
  inputs: [
    { id: 'input-k', label: '最多投资轮数 k', type: 'number', defaultValue: '2', width: '90px' },
    { id: 'input-w', label: '初始资本 w', type: 'number', defaultValue: '0', width: '90px' },
    { id: 'input-profits', label: '各项目纯利润', type: 'text', defaultValue: '1, 2, 3', width: '130px' },
    { id: 'input-capital', label: '各项目启动金', type: 'text', defaultValue: '0, 1, 1', width: '130px' },
  ],
  presets: [
    {
      label: '标准用例 (w=0, k=2, profits=[1,2,3], capital=[0,1,1])',
      values: { 'input-k': '2', 'input-w': '0', 'input-profits': '1, 2, 3', 'input-capital': '0, 1, 1' },
    },
    {
      label: '递进解锁 (w=0, k=3, profits=[2,3,5], capital=[0,1,2])',
      values: { 'input-k': '3', 'input-w': '0', 'input-profits': '2, 3, 5', 'input-capital': '0, 1, 2' },
    },
    {
      label: '资本受阻 (w=1, k=3, profits=[10,1,2], capital=[100,1,2])',
      values: { 'input-k': '3', 'input-w': '1', 'input-profits': '10, 1, 2', 'input-capital': '100, 1, 2' },
    },
  ],
  metrics: [
    { id: 'capital-w', label: '当前总资本', color: '#10b981' },
    { id: 'k-left', label: '剩余投资轮数', color: '#38bdf8' },
    { id: 'unlocked-count', label: '可选项目池大小', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力排列搜索对比',
      shortName: '暴力排列',
      card2Desc: '枚举所有可能的分支排列，展示随轮数阶乘级膨胀',
      codeLanguages: IPO_STAGE1_CODES,
      buildSteps: (inputs) => {
        const k = parseInt(inputs?.['input-k'] || '2', 10);
        const w = parseInt(inputs?.['input-w'] || '0', 10);
        const p = inputs?.['input-profits'] || '1, 2, 3';
        const c = inputs?.['input-capital'] || '0, 1, 1';
        return buildIPOSteps(k, w, p, c, 1);
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 双堆协同解锁与利润最大推演',
      shortName: '双堆贪心',
      card2Desc: '成本小根堆筛选门槛，利润大根堆锁定最高回报，资本高效滚雪球',
      codeLanguages: IPO_STAGE2_CODES,
      buildSteps: (inputs) => {
        const k = parseInt(inputs?.['input-k'] || '2', 10);
        const w = parseInt(inputs?.['input-w'] || '0', 10);
        const p = inputs?.['input-profits'] || '1, 2, 3';
        const c = inputs?.['input-capital'] || '0, 1, 1';
        return buildIPOSteps(k, w, p, c, 2);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 单调资本扩张支配证明',
      shortName: '贪心证明',
      card2Desc: '由超集支配律证明当前最高纯益对未来候选集合具有严格包含优势',
      codeLanguages: IPO_STAGE3_CODES,
      buildSteps: (inputs) => {
        const k = parseInt(inputs?.['input-k'] || '2', 10);
        const w = parseInt(inputs?.['input-w'] || '0', 10);
        const p = inputs?.['input-profits'] || '1, 2, 3';
        const c = inputs?.['input-capital'] || '0, 1, 1';
        return buildIPOSteps(k, w, p, c, 3);
      },
    },
  ],
  codeLanguages: IPO_STAGE2_CODES,
  problemHtml: GREEDY_090_PROBLEMS.ipo.html,
  analysisHtml: IPO_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const k = parseInt(inputs?.['input-k'] || '2', 10);
    const w = parseInt(inputs?.['input-w'] || '0', 10);
    const p = inputs?.['input-profits'] || '1, 2, 3';
    const c = inputs?.['input-capital'] || '0, 1, 1';
    return buildIPOSteps(k, w, p, c, 2);
  },
  renderCanvas: renderIPOCanvas,
  renderCustomMetrics: renderIPOCustomMetrics,
});

export const ipoRenderer = UniversalStageVisualizer;
registerAlgorithm({
  id: 'ipo-max-capital',
  name: 'IPO 最大化资本 (LeetCode 502)',
  viewId: 'algo-ipo-max-capital-view',
  category: 'greedy',
  description: '左程云算法讲解090 Code05：启动金小根堆 + 纯利润大根堆双堆协同滚雪球',
  icon: '💰',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 905,
  learningGoal: '掌握双堆协同设计模式与超集支配单调扩张性质',
  aliases: ['class090-code05', 'ipo', 'ipo-502', 'leetcode-502'],
});
