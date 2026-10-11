/**
 * Class 104: 扩展 KMP (Z 算法 / Z-Algorithm)
 * Canvas Adapter
 */

import {
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';
import { ZAlgorithmStep } from './z-algorithm-step-compiler';

export function renderZAlgorithmCanvas(container: HTMLElement, step: ZAlgorithmStep): void {
  const boxIndices: number[] = [];
  if (step.boxR > step.boxC) {
    for (let k = step.boxC; k < step.boxR && k < step.n; k++) {
      boxIndices.push(k);
    }
  }

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCharSequence(
        '输入字符串 (String s)',
        step.s,
        step.curI,
        boxIndices,
        [],
        -1,
        '当前后缀起点'
      )}

      ${renderAuxArrayTable('Z 数组 (各个后缀与原串的最长公共前缀 LCP)', step.s, step.zArr, step.curI, 'z[i]')}

      ${renderFormulaCard(
        'Z 盒 (Z-Box) 动态状态',
        `当前位置 i=${step.curI} | Z 盒区间: [c=${step.boxC} .. r=${step.boxR}] | 继承长度: min(r - i, z[i - c]) | 最终 z[${step.curI}] = ${step.zArr[step.curI] ?? 0}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
