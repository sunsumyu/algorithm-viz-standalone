/**
 * 相邻字符不同的最长路径 (Longest Path with Different Characters / LeetCode 2246 / 左程云 Class 079 Code04)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileLongestPathDifferentCharacters } from '../../../../core/strategies/tree-longestpathdifferentcharacters';

export {
  compileLongestPathDifferentCharacters,
  UniversalStageVisualizer,
  UniversalStageVisualizer as LongestPathDifferentCharactersVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'longest-path-different-characters',
  name: '相邻字符不同的最长路径 (LeetCode 2246)',
  viewId: 'longest-path-different-characters',
  category: 'dynamic-programming',
  description: '左程云算法讲解079 Code04：LeetCode 2246 相邻字符不同的最长路径，树型 DP 经典拐点模型：后序遍历自底向上汇报单侧最长链 1 + max1，并在每个节点贪心维护最长与次长子链，拐点路径 = 1 + max1 + max2。',
  icon: '🔤',
  aliases: ['class079-code04', 'longest-path-diff-chars', 'leetcode-2246'],
  template: '<div id="longest-path-different-characters" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 7904,
  learningGoal: '掌握树型 DP 经典拐点模型：深刻理解单侧最长链自底向上汇报、相邻字符互异约束剪枝、以及局部拐点融合全局最优解的收敛机制。',
});
