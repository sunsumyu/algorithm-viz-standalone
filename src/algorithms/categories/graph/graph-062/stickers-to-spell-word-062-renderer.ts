/**
 * 左程云算法通关课 Class 062: 贴纸拼词 (Stickers to Spell Word · LeetCode 691)
 * BFS 状态空间探索 + 贪心首字母剪枝消除排列冗余
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_062_PROBLEMS } from './graph-062-problem-content';
import { STICKERS_TO_SPELL_WORD_062_CODES } from './graph-062-stage-codes';
import {
  StickersStep,
  buildStickers062Steps,
} from './stickers-to-spell-word-062-step-compiler';

export { buildStickers062Steps, type StickersStep };

export const stickersToSpellWord062Visualizer = registerDeclarativeAlgorithm<StickersStep>({
  id: 'stickers-to-spell-word-062',
  aliases: ['stickers-to-spell-word', 'stickers-691', 'stickers-class065'],
  name: '贴纸拼词与状态空间广搜 (Class 062)',
  category: 'graph',
  icon: '🏷️',
  difficulty: 3,
  levelOrder: 6202,
  learningGoal: '掌握 BFS 结合贪心首字符剪枝的高效状态空间搜索，杜绝同集合贴纸的不同排列导致的指数爆炸',
  problemHtml: GRAPH_062_PROBLEMS.stickersToSpellWord062.html,
  codeLanguages: STICKERS_TO_SPELL_WORD_062_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'classic_thehat',
      options: [
        { label: '经典可拼：["with", "example", "science"] -> "thehat" (需3张)', value: 'classic_thehat' },
        { label: '缺少字母：["notice", "possible"] -> "basicbasic" (-1)', value: 'impossible' },
      ],
    },
  ],
  presets: [
    { label: 'thehat 经典用例 (需3张)', values: { preset: 'classic_thehat' } },
    { label: '缺字母不可行用例 (-1)', values: { preset: 'impossible' } },
  ],
  generateSteps: (inputs) => buildStickers062Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const stickersHtml = step.stickers
      .map((s) => {
        const isChosen = step.chosenSticker === s;
        return `
          <div style="
            display: inline-flex;
            align-items: center;
            padding: 6px 14px;
            background: ${isChosen ? '#fef3c7' : '#ffffff'};
            border: ${isChosen ? '2px solid #f59e0b' : '1px solid #cbd5e1'};
            border-radius: 8px;
            box-shadow: ${isChosen ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'};
            font-family: monospace;
            font-weight: 700;
            color: #1e293b;
          ">
            🏷️ ${s}
          </div>
        `;
      })
      .join('');

    const targetBadgeHtml = step.curTarget === ''
      ? `<span style="color: #10b981; font-weight: 800;">🎉 目标字符已全部消减完毕！</span>`
      : step.curTarget
          .split('')
          .map(
            (ch, idx) => `
              <span style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                background: ${idx === 0 ? '#fee2e2' : '#f1f5f9'};
                border: ${idx === 0 ? '2px solid #ef4444' : '1px solid #cbd5e1'};
                border-radius: 6px;
                font-family: monospace;
                font-weight: 800;
                color: ${idx === 0 ? '#b91c1c' : '#334155'};
              ">
                ${ch}
              </span>
            `
          )
          .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; min-height: 280px; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 24px; max-width: 520px; width: 100%;">
          <span style="font-size: 11px; color: #64748b; font-weight: 700;">待拼剩余目标串 (首字母红色锚定):</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
            ${targetBadgeHtml}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; width: 100%; max-width: 520px;">
          <span style="font-size: 11px; color: #64748b; font-weight: 700;">可用贴纸库:</span>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            ${stickersHtml}
          </div>
        </div>
      </div>
    `;
  },
});
