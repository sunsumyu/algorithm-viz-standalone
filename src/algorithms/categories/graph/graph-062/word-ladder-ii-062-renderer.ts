/**
 * 左程云算法通关课 Class 062: 单词接龙 II (Word Ladder II · LeetCode 126)
 * BFS 层次最短路建图 + DFS 回溯输出全部最短路径
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import { WORD_LADDER_II_062_CODES } from './graph-062-stage-codes';
import {
  WordLadderIIStep,
  buildWordLadderII062Steps,
} from './word-ladder-ii-062-step-compiler';

export { buildWordLadderII062Steps, type WordLadderIIStep };

export const wordLadderII062Visualizer = registerDeclarativeAlgorithm<WordLadderIIStep>({
  id: 'word-ladder-ii-062',
  aliases: ['word-ladder-ii', 'word-ladder-126'],
  name: '单词接龙 II (Word Ladder II · Class 062)',
  category: 'graph',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 6206,
  learningGoal: '掌握经典大厂压轴两阶段解法：BFS分层最短路构建前驱DAG图 + DFS无损回溯输出所有最短全路径',
  problemHtml: GRAPH_062_PROBLEMS.wordLadderII062.html,
  codeLanguages: WORD_LADDER_II_062_CODES,
  presets: [
    { label: 'hit -> cog 经典双最短路', values: { preset: 'classic_hit_cog' } },
    { label: '缺少终点词不可达用例', values: { preset: 'impossible' } },
  ],
  generateSteps: (inputs) => buildWordLadderII062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const pathsHtml = step.foundPaths.length > 0
      ? step.foundPaths
          .map(
            (p, idx) => `
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                background: #ecfdf5;
                border: 1px solid #10b981;
                border-radius: 6px;
                font-family: monospace;
                font-size: 11.5px;
                font-weight: 700;
                color: #065f46;
              ">
                <span>路径 ${idx + 1}:</span>
                <span>${p.join(' ➔ ')}</span>
              </div>
            `
          )
          .join('')
      : '<span style="color: #94a3b8; font-size: 12px;">(尚未捕获到完整路径)</span>';

    const edgePills = step.dagEdges
      .slice(0, 10)
      .map(
        (e) => `
          <span style="
            padding: 3px 8px;
            background: #eff6ff;
            border: 1px solid #3b82f6;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            font-weight: 700;
            color: #1e40af;
          ">
            ${e.from} ➔ ${e.to}
          </span>
        `
      )
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; min-height: 280px; align-items: center; justify-content: center; padding: 14px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 560px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #475569; font-weight: 700;">最短路有向无环图 (DAG 有向边):</span>
            <span style="font-size: 10.5px; color: #0284c7; font-weight: 700;">累计边数: ${step.dagEdges.length}</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${edgePills || '<span style="color: #94a3b8; font-size: 11px;">等待建立最短路有向边...</span>'}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 560px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px;">
          <span style="font-size: 11px; color: #15803d; font-weight: 800;">已收集的最短转换序列 (DFS 全解):</span>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${pathsHtml}
          </div>
        </div>
      </div>
    `;
  },
});
