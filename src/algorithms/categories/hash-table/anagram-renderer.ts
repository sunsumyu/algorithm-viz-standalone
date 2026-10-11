/**
 * 有效的字母异位词可视化器 — 声明式 4-Card 标准架构
 * LeetCode 242：26 字符哈希计数数组
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ANAGRAM_PROBLEM_HTML,
  ANAGRAM_ANALYSIS_HTML,
  ANAGRAM_CODE_LANGUAGES,
} from './anagram-problem-content';
import {
  AnagramStep,
  buildAnagramSteps,
  withAnagramMetrics,
} from './anagram-step-compiler';
import { renderAnagramCanvas } from './anagram-canvas-adapter';

export type { AnagramStep };
export { buildAnagramSteps, withAnagramMetrics, renderAnagramCanvas };

registerDeclarativeAlgorithm({
  id: 'anagram',
  name: '有效的字母异位词（哈希计数）',
  category: 'hash-table',
  description: '长度26数组统计频次判断异位词',
  icon: '🔤',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '用字符频次统计判断字母异位词',
  inputs: [
    {
      id: 's',
      label: 's',
      type: 'text',
      defaultValue: 'anagram',
      placeholder: '字符串 s',
      width: '75px',
    },
    {
      id: 't',
      label: 't',
      type: 'text',
      defaultValue: 'nagaram',
      placeholder: '字符串 t',
      width: '75px',
    },
  ],
  presets: [
    { label: '经典匹配: ("anagram", "nagaram")', values: { s: 'anagram', t: 'nagaram' } },
    { label: '字符失配: ("rat", "car")', values: { s: 'rat', t: 'car' } },
    { label: '长度不一致: ("ab", "a")', values: { s: 'ab', t: 'a' } },
    { label: '单词乱序: ("listen", "silent")', values: { s: 'listen', t: 'silent' } },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'char', label: '当前字符 char', color: '#9333ea' },
    { id: 'slot', label: '槽位索引 slot', color: '#f59e0b' },
    { id: 'res', label: '异位词判定', color: '#10b981' },
    { id: 'action', label: '槽位计算', color: '#2563eb' },
  ],
  legend: [
    { label: 's(+) 累加', color: '#2563eb' },
    { label: 't(-) 抵消', color: '#dc2626' },
  ],
  codeLanguages: ANAGRAM_CODE_LANGUAGES,
  problemHtml: ANAGRAM_PROBLEM_HTML,
  analysisHtml: ANAGRAM_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withAnagramMetrics(
      buildAnagramSteps(
        String(inputs.s ?? 'anagram') || 'anagram',
        String(inputs.t ?? 'nagaram') || 'nagaram'
      )
    ),
  renderCanvas: (container, step) => renderAnagramCanvas(container, step as AnagramStep),
});
