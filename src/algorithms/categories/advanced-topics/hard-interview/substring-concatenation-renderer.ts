/**
 * Hard 15: 串联所有单词的子串 (Substring with Concatenation of All Words)
 * LeetCode 30 经典大厂高频双指针滑动窗口难题
 * 步长分组滑动窗口：枚举 0..wordLen-1 偏移量，利用单词频次哈希表实现 O(N) 线性窗口匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  SubstringStep,
  SUBSTRING_CONCATENATION_CODES,
  generateSubstringSteps,
} from '../../../../core/renderers/adapters/substring-concatenation-step-compiler';
import { renderSubstringCanvas } from '../../../../core/renderers/adapters/substring-concatenation-canvas-adapter';

export type { SubstringStep };
export { SUBSTRING_CONCATENATION_CODES, generateSubstringSteps, renderSubstringCanvas };

export const substringConcatenationVisualizer = registerDeclarativeAlgorithm<SubstringStep>({
  id: 'substring-concatenation-words',
  name: '大厂高频真题: 串联所有单词的子串 (Substring with Concatenation of All Words)',
  category: 'two-pointers',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 30,
  learningGoal: '透彻掌握按定长单词步长分组滑动窗口优化技巧，将指数级回溯匹配降维至严格 O(N) 线性哈希欠账模型',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 30)</h3>
      <p>给定一个字符串 <code>s</code> 和一个字符串数组 <code>words</code>。<code>words</code> 中所有字符串 <strong>长度相同</strong>：</p>
      <ul>
        <li><code>s</code> 中的 <strong>串联子串</strong> 是指一个包含 <code>words</code> 中所有字符串以任意顺序排列连接起来的子串。</li>
        <li>返回所有串联子串在 <code>s</code> 中的开始索引。你可以按 <strong>任意顺序</strong> 返回答案。</li>
        <li><strong>破局思考</strong>：无需枚举每个字符为起点，只需按 <code>0..wordLen - 1</code> 为起点，每次前进一个 <code>wordLen</code>，完美转化为单序列滑动窗口！</li>
      </ul>
    </div>
  `,
  metrics: [
    { id: 'currentWord', label: '当前截取单词', color: '#0284c7' },
    { id: 'matchCount', label: '有效单词数', color: '#16a34a' },
    { id: 'windowRange', label: '当前窗口区间', color: '#d97706' },
    { id: 'matchedIndices', label: '已命中起始下标', color: '#9333ea' },
  ],
  codeLanguages: SUBSTRING_CONCATENATION_CODES,
  inputs: [
    {
      id: 's',
      label: '主字符串 (s)',
      type: 'text',
      defaultValue: 'barfoothefoobarman',
    },
    {
      id: 'words',
      label: '目标单词 (以逗号分隔)',
      type: 'text',
      defaultValue: 'foo, bar',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || 'barfoothefoobarman');
    const rawWords = String(input.words || 'foo, bar');
    const words = rawWords.split(',').map(w => w.trim()).filter(Boolean);
    return generateSubstringSteps(s, words.length > 0 ? words : ['foo', 'bar']);
  },
  renderCanvas: (container, step) => {
    renderSubstringCanvas(container, step);
  },
});
