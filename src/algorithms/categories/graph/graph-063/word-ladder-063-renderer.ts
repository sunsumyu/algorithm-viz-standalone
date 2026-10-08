/**
 * 左程云算法通关课 Class 063: 单词接龙 (Word Ladder · LeetCode 127)
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import { WORD_LADDER_063_CODES } from './graph-063-stage-codes';
import { renderBiBfsWavefront } from './graph-063-shared';
import {
  WordLadder063Step,
  buildWordLadder063Steps,
} from './word-ladder-063-step-compiler';

export type { WordLadder063Step };
export { buildWordLadder063Steps };

export const wordLadder063Visualizer = registerDeclarativeAlgorithm<WordLadder063Step>({
  id: 'word-ladder-063',
  name: '单词接龙 (双向广搜)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 063 Code01：双向广搜经典，小集合优先相向扩展，空间复杂度从 b^d 锐减至 2*b^(d/2) (LeetCode 127)',
  aliases: ['class063-code01', 'word-ladder-063', 'word-ladder-class063', 'bi-bfs-class063', 'word-ladder-127', 'leetcode-127'],
  problemHtml: GRAPH_063_PROBLEMS['word-ladder-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['word-ladder-063'].complexityHtml,
  codeLanguages: WORD_LADDER_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'hit_to_cog',
      options: [
        { label: '经典接龙 (hit -> cog, 5步)', value: 'hit_to_cog' },
        { label: '精炼接龙 (bat -> cog, 4步)', value: 'bat_to_cog' },
        { label: '无解阻断 (hit -x-> cog, 0步)', value: 'unreachable' },
      ],
    },
  ],
  presets: [
    { label: '经典接龙 (hit -> cog, 5步)', values: { preset: 'hit_to_cog' } },
    { label: '精炼接龙 (bat -> cog, 4步)', values: { preset: 'bat_to_cog' } },
    { label: '无解阻断 (hit -x-> cog, 0步)', values: { preset: 'unreachable' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildWordLadder063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: WordLadder063Step) => {
    container.innerHTML = renderBiBfsWavefront({
      smallLevel: step.smallLevel,
      bigLevel: step.bigLevel,
      visitedCount: step.visitedCount,
      curWord: step.curWord,
      nextLevel: step.nextLevel,
      meetWord: step.meetWord,
      status: step.status,
    });
  },
});
