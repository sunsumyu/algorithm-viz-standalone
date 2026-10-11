/**
 * Class 100: KMP 算法核心原理与 next 数组动态递推
 * Canvas Adapter
 */

import {
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';
import { KmpStep } from './kmp-step-compiler';

export function renderKmpCanvas(container: HTMLElement, step: KmpStep): void {
  const matchStart = step.foundIndex >= 0 ? step.foundIndex : -1;
  const matchEnd = matchStart >= 0 ? matchStart + step.s2.length - 1 : -1;
  const fullMatches: number[] = [];
  if (matchStart >= 0) {
    for (let k = matchStart; k <= matchEnd; k++) fullMatches.push(k);
  }

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCharSequence(
        '主文本串 (Text s1)',
        step.s1,
        step.i1,
        fullMatches,
        step.matchIndices || [],
        step.mismatchIndex !== undefined ? step.mismatchIndex : -1,
        'i1'
      )}

      ${renderCharSequence(
        '模式串 (Pattern s2)',
        step.s2,
        step.i2,
        [],
        step.matchIndices && step.matchIndices.length > 0 ? [step.i2] : [],
        step.mismatchIndex !== undefined && step.mismatchIndex === step.i1 ? step.i2 : -1,
        'i2'
      )}

      ${renderAuxArrayTable('模式串 Next 数组 (最长相等真前后缀长度)', step.s2, step.nextArr, step.i2, 'next[i]')}

      ${renderFormulaCard(
        'KMP 核心加速状态',
        `s1[i1=${step.i1}] ${step.i1 < step.s1.length && step.i2 < step.s2.length ? (step.s1[step.i1] === step.s2[step.i2] ? '==' : '!=') : '⏹️'} s2[i2=${step.i2}] | next[${step.i2}] = ${step.nextArr[step.i2] ?? 'N/A'}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
