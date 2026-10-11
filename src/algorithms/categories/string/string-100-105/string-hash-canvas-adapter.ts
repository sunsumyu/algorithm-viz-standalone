/**
 * Class 105: 字符串哈希与滚动哈希 (Rolling Hash & 双哈希)
 * Canvas Adapter
 */

import {
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';
import { StringHashStep } from './string-hash-step-compiler';

export function renderStringHashCanvas(container: HTMLElement, step: StringHashStep): void {
  const sub1Indices: number[] = [];
  for (let k = step.queryL1; k <= step.queryR1 && k < step.n; k++) sub1Indices.push(k);
  const sub2Indices: number[] = [];
  for (let k = step.queryL2; k <= step.queryR2 && k < step.n; k++) sub2Indices.push(k);

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCharSequence(
        '字符串与子串 1 高亮 [l1..r1]',
        step.s,
        -1,
        sub1Indices,
        [],
        -1,
        ''
      )}

      ${renderCharSequence(
        '字符串与子串 2 高亮 [l2..r2]',
        step.s,
        -1,
        sub2Indices,
        [],
        -1,
        ''
      )}

      ${renderAuxArrayTable('前缀哈希模数截取 H[i] (Base=131, Mod=10^9+7)', '∅' + step.s, step.hashArr, -1, 'H[i]')}

      ${renderFormulaCard(
        'O(1) 子串哈希提取公式',
        `Hash(l..r) = (H[r] - H[l-1] * P^(r-l+1)) % MOD | Hash1: ${step.hashVal1} | Hash2: ${step.hashVal2}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
