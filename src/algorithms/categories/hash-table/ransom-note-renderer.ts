/**
 * 赎金信可视化器 — 声明式 4-Card 标准架构
 * LeetCode 383：26 字符哈希库存数组
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RANSOM_NOTE_PROBLEM_HTML,
  RANSOM_NOTE_ANALYSIS_HTML,
  RANSOM_NOTE_CODE_LANGUAGES,
} from './ransom-note-problem-content';
import {
  RansomNoteStep,
  buildRansomNoteSteps,
  withRansomNoteMetrics,
} from './ransom-note-step-compiler';
import { renderRansomNoteCanvas } from './ransom-note-canvas-adapter';

export type { RansomNoteStep };
export { buildRansomNoteSteps, withRansomNoteMetrics, renderRansomNoteCanvas };

registerDeclarativeAlgorithm({
  id: 'ransom-note',
  name: '赎金信（字符计数）',
  category: 'hash-table',
  description: '用字符频率表判断赎金信能否由杂志构造',
  icon: '📰',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握用 Map 统计字符频率的方法',
  inputs: [
    {
      id: 'ransomNote',
      label: 'ransomNote',
      type: 'text',
      defaultValue: 'aa',
      width: '50px',
    },
    {
      id: 'magazine',
      label: 'magazine',
      type: 'text',
      defaultValue: 'aab',
      width: '60px',
    },
  ],
  presets: [
    { label: '示例 1: ("a" / "b" ➔ false)', values: { ransomNote: 'a', magazine: 'b' } },
    { label: '示例 2: ("aa" / "ab" ➔ false)', values: { ransomNote: 'aa', magazine: 'ab' } },
    { label: '示例 3: ("aa" / "aab" ➔ true)', values: { ransomNote: 'aa', magazine: 'aab' } },
    { label: '多字符匹配: ("secret" / "recreates")', values: { ransomNote: 'secret', magazine: 'recreates' } },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#3b82f6' },
    { id: 'char', label: '当前字符', color: '#a855f7' },
    { id: 'stock', label: '剩余库存量', color: '#f59e0b' },
    { id: 'res', label: '判定结果', color: '#10b981' },
  ],
  legend: [
    { label: 'magazine(+) 进库', color: '#2563eb' },
    { label: 'ransomNote(-) 消耗', color: '#dc2626' },
  ],
  codeLanguages: RANSOM_NOTE_CODE_LANGUAGES,
  problemHtml: RANSOM_NOTE_PROBLEM_HTML,
  analysisHtml: RANSOM_NOTE_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withRansomNoteMetrics(
      buildRansomNoteSteps(
        String(inputs.ransomNote ?? 'aa') || 'aa',
        String(inputs.magazine ?? 'aab') || 'aab'
      )
    ),
  renderCanvas: (container, step) => renderRansomNoteCanvas(container, step as RansomNoteStep),
});
