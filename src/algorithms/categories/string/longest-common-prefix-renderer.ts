/**
 * 最长公共前缀可视化器 — 声明式 4-Card 标准架构
 * LeetCode 14：纵向逐列扫描
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  LONGEST_COMMON_PREFIX_PROBLEM_HTML,
  LONGEST_COMMON_PREFIX_ANALYSIS_HTML,
  LONGEST_COMMON_PREFIX_CODE_LANGUAGES,
} from './longest-common-prefix-problem-content';
import {
  LONGEST_COMMON_PREFIX_CODE_LINES,
  LCPStep,
  parseStringList,
  buildLCPSteps,
  withMetrics,
} from './longest-common-prefix-step-compiler';
import { renderLongestCommonPrefixCanvas } from './longest-common-prefix-canvas-adapter';

export type { LCPStep };
export {
  LONGEST_COMMON_PREFIX_CODE_LINES,
  parseStringList,
  buildLCPSteps,
  renderLongestCommonPrefixCanvas,
};

registerDeclarativeAlgorithm({
  id: 'longest-common-prefix',
  aliases: ['14', 'leetcode-14', 'longest-common-prefix-vertical'],
  hasDeductionTree: true,
  name: '最长公共前缀（逐列扫描）',
  category: 'string',
  description: '以第一个字符串为基准，逐列比对找公共前缀',
  icon: '📖',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解逐字符纵向比较求公共前缀的思路',
  inputs: [
    {
      id: 'strs',
      label: '字符串列表',
      type: 'text',
      defaultValue: 'flower, flow, flight',
      placeholder: '逗号分隔',
    },
  ],
  presets: [
    { label: '示例 1: (["flower","flow","flight"] -> "fl")', values: { strs: 'flower, flow, flight' } },
    { label: '示例 2: (无前缀 -> "")', values: { strs: 'dog, racecar, car' } },
    { label: '长前缀: (-> "inters")', values: { strs: 'interspecies, interstellar, interstate' } },
    { label: '全相同: (-> "prefix")', values: { strs: 'prefix, prefix, prefix' } },
  ],
  metrics: [
    { id: 'col', label: '当前列 col', color: '#2563eb' },
    { id: 'row', label: '当前行 row', color: '#9333ea' },
    { id: 'char', label: '基准字符 char', color: '#f59e0b' },
    { id: 'prefix', label: '当前前缀结果', color: '#10b981' },
    { id: 'action', label: '列比对', color: '#2563eb' },
  ],
  legend: [
    { label: '当前列 col', color: '#2563eb' },
    { label: '公共前缀', color: '#10b981' },
    { label: '失配列', color: '#ef4444' },
  ],
  codeLanguages: LONGEST_COMMON_PREFIX_CODE_LANGUAGES,
  problemHtml: LONGEST_COMMON_PREFIX_PROBLEM_HTML,
  analysisHtml: LONGEST_COMMON_PREFIX_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildLCPSteps(parseStringList(String(inputs.strs ?? 'flower, flow, flight')))),
  renderCanvas: (container, step) =>
    renderLongestCommonPrefixCanvas(container, step as LCPStep),
});
