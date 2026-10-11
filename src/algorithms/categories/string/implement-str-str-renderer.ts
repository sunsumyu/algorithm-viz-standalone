/**
 * 实现 strStr() (KMP 算法) 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 28：KMP 前缀表模式匹配
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  STR_STR_PROBLEM_HTML,
  STR_STR_ANALYSIS_HTML,
  STR_STR_CODE_LANGUAGES,
} from './implement-str-str-problem-content';
import {
  STR_STR_CODE_LINES,
  SSStep,
  computeNextArray,
  buildSSSteps,
  withMetrics,
} from './implement-str-str-step-compiler';
import { renderStrStrCanvas } from './implement-str-str-canvas-adapter';

export type { SSStep };
export {
  STR_STR_CODE_LINES,
  computeNextArray,
  buildSSSteps,
  renderStrStrCanvas,
};

registerDeclarativeAlgorithm({
  id: 'str-str',
  name: '实现strStr()（KMP算法）',
  category: 'string',
  description: '用 KMP 算法在 haystack 中查找 needle 的首次位置',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握 KMP 算法的 next 数组与状态转移',
  inputs: [
    {
      id: 'haystack',
      label: '主串 haystack',
      type: 'text',
      defaultValue: 'sadbutsad',
      placeholder: '主串',
    },
    {
      id: 'needle',
      label: '模式串 needle',
      type: 'text',
      defaultValue: 'sad',
      placeholder: '模式串',
    },
  ],
  presets: [
    { label: '示例 1: ("sadbutsad", "sad")', values: { haystack: 'sadbutsad', needle: 'sad' } },
    { label: '不匹配: ("leetcode", "leeto")', values: { haystack: 'leetcode', needle: 'leeto' } },
    { label: '经典回退: ("aabaabaafa", "aabaaf")', values: { haystack: 'aabaabaafa', needle: 'aabaaf' } },
    { label: '多重复: ("mississippi", "issip")', values: { haystack: 'mississippi', needle: 'issip' } },
  ],
  metrics: [
    { id: 'i', label: '主串指针 i', color: '#2563eb' },
    { id: 'j', label: '模式串指针 j', color: '#9333ea' },
    { id: 'match-state', label: '匹配状态', color: '#0f172a' },
    { id: 'res', label: '最终匹配下标', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '主串 i', color: '#2563eb' },
    { label: '模式串 j', color: '#9333ea' },
    { label: '匹配', color: '#10b981' },
  ],
  codeLanguages: STR_STR_CODE_LANGUAGES,
  problemHtml: STR_STR_PROBLEM_HTML,
  analysisHtml: STR_STR_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildSSSteps(
        String(inputs.haystack ?? 'sadbutsad'),
        String(inputs.needle ?? 'sad')
      )
    ),
  renderCanvas: (container, step) => renderStrStrCanvas(container, step as SSStep),
});
