import type { AbsValueAddStep } from './absolute-value-add-to-array-step-compiler';
import { renderGcdDiffusionGrid } from './greedy-090-shared';

export const ABS_VALUE_ADD_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
    <h3 style="color: #0f172a; margin-top: 0;">🧠 欧几里得辗转相除与差值闭包</h3>
    <p><b>更相减损术：</b></p>
    <p>对于任意两个数 $x, y$，不断将大数减去小数 $|x - y|$，最终必然能得到二者的最大公约数 $\\gcd(x, y)$。</p>
    
    <p><b>为什么整个数组是 $g$ 的所有倍数？</b></p>
    <ul>
      <li>所有数的公约数是 $g$，任何两数之差仍然是 $g$ 的倍数，绝不可能产生不是 $g$ 的倍数的数；</li>
      <li>一旦 $g$ 被减出来，它与任意数 $k \\times g$ 相减，就能生成 $(k-1) \\times g$。如同步进游标一样，将 $[g, 2g, 3g, \\dots, \\max]$ 的所有倍数全量填满！</li>
      <li>因此，正数正好有 $\\max(arr) / g$ 个。</li>
    </ul>
  </div>
`;

export function renderAbsValueAddCanvas(container: HTMLElement, step: AbsValueAddStep): void {
  renderGcdDiffusionGrid(container, {
    currentArray: step.currentArray,
    newlyAdded: step.newlyAdded,
    comparingPair: step.comparingPair,
    diffResult: step.diffResult,
    gcdValue: step.gcdValue,
    maxVal: step.maxVal,
    theoreticalCount: step.theoreticalCount,
  });

  const root = container.closest('.dsp-view-root') || document;
  const lenEl = root.querySelector('#metric-curr-len');
  const gcdEl = root.querySelector('#metric-gcd-val');
  const theoryEl = root.querySelector('#metric-theory-count');

  if (lenEl) lenEl.textContent = `${step.currentArray.length}`;
  if (gcdEl) gcdEl.textContent = `${step.gcdValue}`;
  if (theoryEl) theoryEl.textContent = `${step.theoreticalCount}`;
}

export function renderAbsValueAddCustomMetrics(container: HTMLElement, step: AbsValueAddStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">当前数论推演:</span>
        <span style="font-size: 11px; color: #38bdf8; font-weight: 800; background: rgba(56,189,248,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">${step.decision}</span>
      </div>
      <div style="padding: 8px 12px; background: #020617; border: 1px solid #1e293b; border-left: 3px solid #10b981; border-radius: 6px; font-size: 11.5px; color: #cbd5e1; line-height: 1.5;">
        ${step.message}
      </div>
    </div>
  `;
}
