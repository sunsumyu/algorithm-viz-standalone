/**
 * 正则表达式匹配 (LeetCode 10 / 左程云 Class 074 Code04)
 * 接入顶层抽象架构：YAML 模型 + Strategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildRegexMatchingSteps,
  parseRegexMatchingInputs,
  type RegexMatchingStep,
} from '../../../../core/renderers/adapters/regex-matching-step-compiler';

export {
  buildRegexMatchingSteps,
  parseRegexMatchingInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as RegexMatchingVisualizer,
};
export type { RegexMatchingStep };

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'regex-matching',
  name: '正则表达式匹配 (LeetCode 10)',
  viewId: 'regex-matching',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code04：LeetCode 10 正则匹配，星号 * 任意次匹配转化为完全背包斜率优化 dp[i][j] = dp[i][j+2] || (match && dp[i+1][j])',
  icon: '🔤',
  aliases: ['class074-code04', 'regex-matching-074', 'regular-expression-matching', 'leetcode-10'],
  template: '<div id="regex-matching" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 87,
  learningGoal: '掌握通配星号向完全背包模型的代数恒等变形、自底向上填表与斜率优化消除循环',
});
