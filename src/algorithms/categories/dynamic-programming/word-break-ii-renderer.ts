/**
 * Hard 23: 单词拆分 II (Word Break II) - 声明式沙盘渲染器
 * LeetCode 140 (Hard)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  generateWordBreakSteps,
  WORD_BREAK_CODES,
  type WordBreakStep,
} from '../../../core/renderers/adapters/word-break-ii-step-compiler';
import { renderWordBreakCanvas } from '../../../core/renderers/adapters/word-break-ii-canvas-adapter';

export type { WordBreakStep };
export { generateWordBreakSteps, renderWordBreakCanvas, WORD_BREAK_CODES };

export const wordBreakIIVisualizer = registerDeclarativeAlgorithm<WordBreakStep>({
  id: 'word-break-ii',
  name: 'Hard 23: 单词拆分 II (Word Break II)',
  category: 'dynamic-programming',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 140,
  learningGoal: '掌握记忆化回溯 (Memoized DFS) 解决全量组合路径重构的思想，理解前缀切分与后缀子问题缓存机制',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 140 - Hard)</h3>
      <p>给定一个字符串 <code>s</code> 和一个字符串字典 <code>wordDict</code> ，在 <code>s</code> 中增加空格来构建一个句子，使得句子中所有的单词都在词典中。以任意顺序返回所有这些可能的句子：</p>
      <ul>
        <li><strong>核心挑战</strong>：不仅需要判定能否拆分，更需要完整重构出所有合法的空格拆分句子。</li>
        <li><strong>记忆化优化</strong>：利用 <code>memo: Map&lt;String, List&lt;String&gt;&gt;</code> 缓存每个后缀字符串的所有合法拆解方案，避免重复展开庞大的后缀子树。</li>
      </ul>
    </div>
  `,
  codeLanguages: WORD_BREAK_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设拆分用例',
      type: 'select',
      defaultValue: 'catsanddog',
      options: [
        { label: '双解经典用例: "catsanddog" ➔ ["cats and dog", "cat sand dog"]', value: 'catsanddog' },
        { label: '多重组合用例: "pineapplepenapple"', value: 'pineapple' },
      ],
    },
  ],
  generateSteps: (input) => {
    const sc = input.scenario || 'catsanddog';
    if (sc === 'pineapple') {
      return generateWordBreakSteps('pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']);
    }
    return generateWordBreakSteps('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']);
  },
  renderCanvas: (container, step) => {
    renderWordBreakCanvas(container, step);
  },
});
