/**
 * 正则表达式匹配 (LeetCode 10) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  REGEX_MATCHING_PROBLEM_HTML,
  REGEX_MATCHING_ANALYSIS_HTML,
  REGEX_MATCHING_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  buildRegexMatchingSteps,
  parseRegexMatchingInputs,
  type RegexMatchingStep,
} from '../../../../core/renderers/adapters/regex-matching-step-compiler';
import {
  renderRegexStringMatcher,
  renderRegexDpMatrix,
  createRegexMatchingStages,
} from '../../../../core/renderers/adapters/regex-matching-canvas-adapter';

export { buildRegexMatchingSteps, parseRegexMatchingInputs };
export type { RegexMatchingStep };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'regex-matching',
  name: '正则表达式匹配 (LeetCode 10)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 斜率优化',
    complexity: 'O(N · M) · O(N · M)',
  },
  defaultStage: 'stage-4',
  stages: createRegexMatchingStages(),
  card1Title: '🔤 字符串与模式串字符指示器',
  card2Title: '📐 二维状态矩阵 dp[i][j] (自底向上填表)',
  card2Desc: '展示星号 * 如何通过完全背包斜率优化消解内层重复循环',
  legend: [
    { label: '匹配失败 (false)', color: '#334155' },
    { label: '匹配成功 (true)', color: '#10b981' },
    { label: '当前计算单元格', color: '#f59e0b' },
  ],
  inputs: [
    { id: 'input-s', label: '文本串 s', type: 'text', defaultValue: 'aab', width: '100px' },
    { id: 'input-p', label: '模式串 p (含 . *)', type: 'text', defaultValue: 'c*a*b', width: '100px' },
  ],
  presets: [
    { label: '经典星号前导案例 (s="aab", p="c*a*b", Ans=true)', values: { 'input-s': 'aab', 'input-p': 'c*a*b' } },
    { label: '点通配与星号案例 (s="ab", p=".*", Ans=true)', values: { 'input-s': 'ab', 'input-p': '.*' } },
    { label: '失配案例 (s="mississippi", p="mis*is*p*.", Ans=false)', values: { 'input-s': 'mississippi', 'input-p': 'mis*is*p*.' } },
  ],
  metrics: [
    { id: 'metric-pos-i', label: '文本指针 i', color: '#f59e0b' },
    { id: 'metric-pos-j', label: '模式指针 j', color: '#38bdf8' },
    { id: 'metric-decision', label: '当前转移决策', color: '#8b5cf6' },
    { id: 'metric-result', label: '最终匹配状态', color: '#10b981' },
  ],
  codeLanguages: REGEX_MATCHING_CODE_LANGUAGES,
  problemHtml: REGEX_MATCHING_PROBLEM_HTML,
  analysisHtml: REGEX_MATCHING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const { s, p } = parseRegexMatchingInputs(inputs);
    return buildRegexMatchingSteps(s, p);
  },
  renderCanvas: (container, step) => renderRegexStringMatcher(container, step),
  renderCustomMetrics: (container, step) => renderRegexDpMatrix(container, step),
});

export const RegexMatchingVisualizer = Visualizer;

registerAlgorithm({
  id: 'regex-matching',
  name: '正则表达式匹配 (LeetCode 10)',
  viewId: 'algo-regex-matching-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code04：LeetCode 10 正则匹配，星号 * 任意次匹配转化为完全背包斜率优化 dp[i][j] = dp[i][j+2] || (match && dp[i+1][j])',
  icon: '🔤',
  aliases: ['class074-code04', 'regex-matching-074', 'regular-expression-matching', 'leetcode-10'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 87,
  learningGoal: '掌握通配星号向完全背包模型的代数恒等变形、自底向上填表与斜率优化消除循环',
});
