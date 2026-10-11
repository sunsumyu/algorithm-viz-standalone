/**
 * Class 103: Manacher 最长回文子串线性算法
 * Canvas Adapter
 */

import {
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';
import { ManacherStep } from './manacher-step-compiler';

export function renderManacherCanvas(container: HTMLElement, step: ManacherStep): void {
  const activeIndices: number[] = [];
  if (step.curI >= 0 && step.radiusArr[step.curI] > 0) {
    const rad = step.radiusArr[step.curI];
    for (let k = step.curI - rad + 1; k <= step.curI + rad - 1; k++) {
      if (k >= 0 && k < step.manacherStr.length) activeIndices.push(k);
    }
  }

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCharSequence(
        '预处理串 (含 # 占位符)',
        step.manacherStr,
        step.curI,
        activeIndices,
        step.mirrorI >= 0 ? [step.mirrorI] : [],
        -1,
        'i'
      )}

      ${renderAuxArrayTable('回文半径数组 (p 数组)', step.manacherStr, step.radiusArr, step.curI, 'p[i]')}

      ${renderFormulaCard(
        'Manacher 几何镜面对称状态',
        `当前位置 i=${step.curI} | 回文中心 C=${step.centerC} | 右边界 R=${step.rightR} | 对称点 i'=${step.mirrorI >= 0 ? step.mirrorI : '无'} | 原串最长回文: "${step.longestPalindrome || '求解中'}"`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
