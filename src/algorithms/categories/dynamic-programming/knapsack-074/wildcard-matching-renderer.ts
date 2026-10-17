/**
 * 通配符匹配 (LeetCode 44 / 左程云 Class 074 Code05)
 * 接入顶层抽象架构：YAML 模型 + Strategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildWildcardMatchingSteps,
  parseWildcardMatchingInputs,
  type WildcardMatchingStep,
} from '../../../../core/renderers/adapters/wildcard-matching-step-compiler';

export {
  buildWildcardMatchingSteps,
  parseWildcardMatchingInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as WildcardMatchingVisualizer,
};
export type { WildcardMatchingStep };

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'wildcard-matching',
  name: '通配符匹配 (LeetCode 44)',
  viewId: 'wildcard-matching',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code05：LeetCode 44 通配符匹配，通配符 * 可匹配任意长度序列，完全背包斜率优化 dp[i][j] = dp[i+1][j] || dp[i][j+1]',
  icon: '🃏',
  aliases: ['class074-code05', 'wildcard-matching-074', 'wildcard-matching-problem', 'leetcode-44'],
  template: '<div id="wildcard-matching" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 88,
  learningGoal: '掌握问号与星号通配状态转移、完全背包斜率优化消圈技巧与二维边界填表',
});
