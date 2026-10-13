/**
 * 单词拆分 II (Word Break II) Canvas 适配器
 */

import { composeUnifiedCanvas } from './unified-canvas-composer';
import { type WordBreakStep } from './word-break-ii-step-compiler';

export function renderWordBreakCanvas(container: HTMLElement, step: WordBreakStep): void {
  const sentencesBoard = `
    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">
        已生成的完整句子解集 (Sentences Generated)
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${
          step.allSentences.length === 0
            ? '<span style="color: #64748b; font-size: 12px;">正在递归构建与记忆化搜索...</span>'
            : step.allSentences.map(sen => `
              <div style="
                padding: 8px 14px;
                background: rgba(52, 211, 153, 0.1);
                border: 1px solid rgba(52, 211, 153, 0.3);
                border-radius: 6px;
                font-family: monospace;
                color: #34d399;
                font-size: 13px;
                font-weight: bold;
              ">
                ✓ "${sen}"
              </div>
            `).join('')
        }
      </div>
    </div>
  `;

  composeUnifiedCanvas(container, {
    metrics: [
      {
        label: '当前匹配前缀 (Prefix)',
        value: step.matchedWord ? `"${step.matchedWord}"` : '探查中...',
        color: '#38bdf8',
      },
      {
        label: '剩余待处理后缀 (Suffix)',
        value: `"${step.remainingSuffix}"`,
        color: '#fbbf24',
      },
      {
        label: '已生成合法句子总数',
        value: `${step.allSentences.length} 组完整句子`,
        color: '#34d399',
      },
    ],
    mainBoardHtml: sentencesBoard,
    formula: {
      title: '前缀切分与记忆化回溯公理',
      equation: '针对任意后缀串，若其包含在 memo 缓存字典中则直接复用；否则从左至右枚举切分点：只要前缀在词典中合法，便深入后缀子问题求解。记忆化将原本指数级的重叠子分支彻底剪枝，优雅实现高效率的全量拓扑路径重构！',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
