import type { MaxProductKStep } from './maximum-product-k-parts-step-compiler';
import { renderPartitionBars } from './greedy-090-shared';

export const MAX_PRODUCT_K_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
    <h3 style="color: #0f172a; margin-top: 0;">🧠 均值不等式与均分最优性</h3>
    <p>对于 $k$ 个正实数 $x_1, x_2, \\dots, x_k$，当其和为常数 $S$ 时：</p>
    <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
      \\prod_{i=1}^k x_i \\le \\left(\\frac{S}{k}\\right)^k
    </div>
    <p>等号成立的充要条件是 $x_1 = x_2 = \\dots = x_k$。</p>
    <p>但在<b>正整数域</b>中，一般无法做到完全相等。此时极差至多为 1，即一部分数取 $\\lfloor S/k \\rfloor + 1$，其余数取 $\\lfloor S/k \\rfloor$，为离散实数均值的唯一最佳逼近！</p>
  </div>
`;

export function renderMaxProductKCanvas(container: HTMLElement, step: MaxProductKStep): void {
  renderPartitionBars(container, step.parts, step.totalN, {
    title: `📦 均分能量柱状视图 (n=${step.totalN}, k=${step.partsK})`,
    productFormula: `当前乘积: ${step.currentProduct}`,
  });

  const root = container.closest('.dsp-view-root') || document;
  const nEl = root.querySelector('#metric-total-n');
  const kEl = root.querySelector('#metric-parts-k');
  const prodEl = root.querySelector('#metric-max-prod');

  if (nEl) nEl.textContent = `${step.totalN}`;
  if (kEl) kEl.textContent = `${step.partsK} 份`;
  if (prodEl) prodEl.textContent = `${step.currentProduct}`;
}

export function renderMaxProductKCustomMetrics(container: HTMLElement, step: MaxProductKStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">当前阶段决策:</span>
        <span style="font-size: 11px; color: #0284c7; font-weight: 700;">${step.decision}</span>
      </div>
      <div style="padding: 6px 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; font-weight: 700; color: #0f172a;">
        ${step.formula}
      </div>
    </div>
  `;
}
