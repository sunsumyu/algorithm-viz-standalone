/**
 * Class 102: AC 自动机多模式串匹配 (Aho-Corasick)
 * Canvas Adapter
 */

import {
  renderCharSequence,
  renderFormulaCard,
} from './string-100-105-shared';
import { ACAutomatonStep } from './ac-automaton-step-compiler';

export function renderACAutomatonCanvas(container: HTMLElement, step: ACAutomatonStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCharSequence(
        '主文本串 (Text)',
        step.text,
        step.curTextIdx,
        [],
        step.matchIndices || [],
        step.mismatchIndex !== undefined ? step.mismatchIndex : -1,
        '文本游标'
      )}

      <div style="margin-top: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
          🎯 目标模式串监控 (共 ${step.patterns.length} 个)
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${step.patterns.map((pat) => {
            const isHit = step.matchedList.includes(pat);
            return `
              <div style="padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; font-family: monospace; border: 1px solid ${isHit ? '#22c55e' : '#cbd5e1'}; background: ${isHit ? '#dcfce7' : '#ffffff'}; color: ${isHit ? '#15803d' : '#64748b'}; box-shadow: ${isHit ? '0 2px 8px rgba(34, 197, 94, 0.25)' : 'none'};">
                ${isHit ? '✓ ' : ''}${pat}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${renderFormulaCard(
        'AC 自动机状态机拓扑',
        `当前节点: #${step.activeNodeId} ('${step.activeNodeLabel}') | 主串考察字符: text[${step.curTextIdx}]='${step.text[step.curTextIdx] ?? ''}' | 已命中总数: ${step.matchedCount}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
