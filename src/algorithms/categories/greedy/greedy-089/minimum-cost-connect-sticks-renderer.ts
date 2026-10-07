/**
 * 连接棒材的最低费用 (LeetCode 1167 / 洛谷 P1090 合并果子) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  CONNECT_STICKS_STAGE1_CODES,
  CONNECT_STICKS_STAGE2_CODES,
  CONNECT_STICKS_STAGE3_CODES,
} from './greedy-089-stage-codes';
import {
  MergeHistoryNode,
  ConnectSticksStep,
  buildConnectSticksStage1Steps,
  buildConnectSticksStage2Steps,
  buildConnectSticksStage3Steps,
  parseConnectSticksInput,
} from './minimum-cost-connect-sticks-step-compiler';
import {
  renderConnectSticksCanvas,
  renderConnectSticksMetrics,
} from './minimum-cost-connect-sticks-canvas-adapter';
import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';

export type {
  MergeHistoryNode,
  ConnectSticksStep,
};
export {
  buildConnectSticksStage1Steps,
  buildConnectSticksStage2Steps,
  buildConnectSticksStage3Steps,
  parseConnectSticksInput,
};

const { template, Visualizer } = createDeclarativeVisualizer<ConnectSticksStep>({
  id: 'minimum-cost-connect-sticks',
  name: '连接棒材的最低费用 (Connect Sticks)',
  category: 'greedy',
  icon: '🥢',
  badge: { mode: '小根堆+哈夫曼合并', complexity: 'O(N log N) · O(N)' },
  card1Title: '🌲 哈夫曼合并生长动画与历史步骤沙盘',
  card2Title: '🌲 小根堆双形态呈现 (二叉树 + 物理数组)',
  card2Desc: '展示堆顶全局最小的两根棒材弹出合并过程',
  legend: [
    { label: '最新合并节点', color: '#3b82f6' },
    { label: '小根堆内棒材', color: '#10b981' },
    { label: '历史合并节点', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-sticks',
      label: '木棒长度数组',
      type: 'text',
      defaultValue: '2, 4, 3',
      width: '160px',
      placeholder: '以逗号分隔正整数',
    },
  ],
  presets: [
    { label: '示例 1: [2, 4, 3]', values: { 'input-sticks': '2, 4, 3' } },
    { label: '示例 2: [1, 8, 3, 5]', values: { 'input-sticks': '1, 8, 3, 5' } },
    { label: '等长棒材: [5, 5, 5, 5]', values: { 'input-sticks': '5, 5, 5, 5' } },
  ],
  metrics: [
    { id: 'total-cost', label: '累计总费用', color: '#10b981' },
    { id: 'heap-size', label: '剩余木棒数', color: '#3b82f6' },
    { id: 'last-merge', label: '最近合并开销', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力组合对比',
      shortName: '暴力穷举',
      card2Desc: '穷举卡特兰数级别的所有括号化二叉树组合，展示无堆时的巨大冗余',
      codeLanguages: CONNECT_STICKS_STAGE1_CODES,
      buildSteps: (inputs) => parseConnectSticksInput(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 小根堆贪心推演',
      shortName: '堆贪心',
      card2Desc: '小根堆每次贪心弹出最小两数合并并放回，动态呈现最优合并树',
      codeLanguages: CONNECT_STICKS_STAGE2_CODES,
      buildSteps: (inputs) => parseConnectSticksInput(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 深度加权反证',
      shortName: '贪心证明',
      card2Desc: '代数证明较深叶子权值必更小，任何逆序对深度置换必使总开销增大',
      codeLanguages: CONNECT_STICKS_STAGE3_CODES,
      buildSteps: (inputs) => parseConnectSticksInput(inputs, 3),
    },
  ],
  codeLanguages: CONNECT_STICKS_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.minimumCostConnectSticks.html,
  buildSteps: (inputs) => parseConnectSticksInput(inputs, 2),
  renderCanvas: renderConnectSticksCanvas,
  renderCustomMetrics: renderConnectSticksMetrics,
});

export const MinimumCostConnectSticksVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'minimum-cost-connect-sticks',
  name: '连接棒材的最低费用 (Connect Sticks)',
  viewId: 'algo-minimum-cost-connect-sticks-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code03：LeetCode 1167 / 洛谷 P1090 合并果子，小根堆贪心与最优哈夫曼树',
  icon: '🥢',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 896,
  learningGoal: '掌握哈夫曼树在加权路径长度最小化中的核心应用，理解小根堆合并的贪心选择性',
  aliases: ['class089-code06', 'minimum-cost-connect-sticks-1167', 'leetcode-1167', 'luogu-p1090', 'merge-fruits'],
});
