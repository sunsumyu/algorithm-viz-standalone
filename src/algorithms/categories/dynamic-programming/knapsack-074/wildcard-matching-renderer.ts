/**
 * 通配符匹配 (LeetCode 44) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  WILDCARD_MATCHING_PROBLEM_HTML,
  WILDCARD_MATCHING_ANALYSIS_HTML,
  WILDCARD_MATCHING_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  buildWildcardMatchingSteps,
  parseWildcardMatchingInputs,
  type WildcardMatchingStep,
} from '../../../../core/renderers/adapters/wildcard-matching-step-compiler';
import {
  renderWildcardStringMatcher,
  renderWildcardDpMatrix,
  createWildcardMatchingStages,
} from '../../../../core/renderers/adapters/wildcard-matching-canvas-adapter';

export { buildWildcardMatchingSteps, parseWildcardMatchingInputs };
export type { WildcardMatchingStep };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'wildcard-matching',
  name: '通配符匹配 (LeetCode 44)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 斜率优化',
    complexity: 'O(N · M) · O(N · M)',
  },
  defaultStage: 'stage-4',
  stages: createWildcardMatchingStages(),
  card1Title: '🃏 文本串与通配符模式指示器',
  card2Title: '📐 二维通配状态矩阵 dp[i][j]',
  card2Desc: '展示星号 * 如何通过完全背包斜率优化 dp[i][j] = dp[i+1][j] || dp[i][j+1] 进行状态转移',
  legend: [
    { label: '匹配失败 (false)', color: '#334155' },
    { label: '匹配成功 (true)', color: '#10b981' },
    { label: '当前计算单元格', color: '#f59e0b' },
  ],
  inputs: [
    { id: 'input-s', label: '文本串 s', type: 'text', defaultValue: 'cb', width: '100px' },
    { id: 'input-p', label: '模式串 p (含 ? *)', type: 'text', defaultValue: '?a', width: '100px' },
  ],
  presets: [
    { label: '失配案例 (s="cb", p="?a", Ans=false)', values: { 'input-s': 'cb', 'input-p': '?a' } },
    { label: '星号通配案例 (s="adceb", p="*a*b", Ans=true)', values: { 'input-s': 'adceb', 'input-p': '*a*b' } },
    { label: '极端全星号 (s="abcde", p="*", Ans=true)', values: { 'input-s': 'abcde', 'input-p': '*' } },
  ],
  metrics: [
    { id: 'metric-pos-i', label: '文本指针 i', color: '#f59e0b' },
    { id: 'metric-pos-j', label: '模式指针 j', color: '#38bdf8' },
    { id: 'metric-decision', label: '当前转移决策', color: '#8b5cf6' },
    { id: 'metric-result', label: '最终匹配状态', color: '#10b981' },
  ],
  codeLanguages: WILDCARD_MATCHING_CODE_LANGUAGES,
  problemHtml: WILDCARD_MATCHING_PROBLEM_HTML,
  analysisHtml: WILDCARD_MATCHING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const { s, p } = parseWildcardMatchingInputs(inputs);
    return buildWildcardMatchingSteps(s, p);
  },
  renderCanvas: (container, step) => renderWildcardStringMatcher(container, step),
  renderCustomMetrics: (container, step) => renderWildcardDpMatrix(container, step),
});

export const WildcardMatchingVisualizer = Visualizer;

registerAlgorithm({
  id: 'wildcard-matching',
  name: '通配符匹配 (LeetCode 44)',
  viewId: 'algo-wildcard-matching-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code05：LeetCode 44 通配符匹配，通配符 * 可匹配任意长度序列，完全背包斜率优化 dp[i][j] = dp[i+1][j] || dp[i][j+1]',
  icon: '🃏',
  aliases: ['class074-code05', 'wildcard-matching-074', 'wildcard-matching-problem', 'leetcode-44'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 88,
  learningGoal: '掌握问号与星号通配状态转移、完全背包斜率优化消圈技巧与二维边界填表',
});
