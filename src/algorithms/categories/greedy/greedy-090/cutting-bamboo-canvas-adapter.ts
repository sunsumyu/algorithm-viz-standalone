import type { BambooStep } from './cutting-bamboo-step-compiler';
import { renderPartitionBars } from './greedy-090-shared';

export const CUTTING_BAMBOO_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
    <h3 style="color: #0f172a; margin-top: 0;">🧠 为什么贪心策略只拆 3 和 2？</h3>
    <p><b>1. 为什么不拆大于等于 5 的数？</b></p>
    <p>任何大于等于 5 的整数 $x$，都可以拆成 $2 + (x - 2)$。由于 $x \\ge 5$ 时，有：</p>
    <div style="padding: 6px 12px; background: #f1f5f9; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px;">
      2 \\times (x - 2) = 2x - 4 = x + (x - 4) > x \\quad (\\text{当 } x \\ge 5)
    </div>
    <p>所以只要出现 $\\ge 5$ 的段，拆开之后乘积一定严格变大！</p>
    
    <p><b>2. 为什么 4 要看作 2 × 2？</b></p>
    <p>因为 $4 = 2 \\times 2$，$4$ 和两个 $2$ 乘积完全一样，拆或不拆等价。</p>

    <p><b>3. 为什么 3 严格优于 2？</b></p>
    <p>相同总和 $6$ 时：拆为两个 $3$ 乘积为 $3 \\times 3 = 9$；拆为三个 $2$ 乘积为 $2 \\times 2 \\times 2 = 8$。显然 $9 > 8$，因此能拆 $3$ 绝不拆 $2$！</p>
  </div>
`;

export function renderBambooCanvas(container: HTMLElement, step: BambooStep): void {
  renderPartitionBars(container, step.parts, step.bambooLength, {
    title: `🎋 竹段切分沙盘 (总长 n=${step.bambooLength})`,
    productFormula: `当前乘积: ${step.currentProduct}`,
  });

  const root = container.closest('.dsp-view-root') || document;
  const lenEl = root.querySelector('#metric-bamboo-len');
  const countEl = root.querySelector('#metric-parts-count');
  const prodEl = root.querySelector('#metric-final-product');

  if (lenEl) lenEl.textContent = `${step.bambooLength}`;
  if (countEl) countEl.textContent = `${step.parts.length} 段`;
  if (prodEl) prodEl.textContent = `${step.currentProduct}`;
}

export function renderBambooCustomMetrics(container: HTMLElement, step: BambooStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #94a3b8;">当前决策阶段:</span>
        <span style="font-size: 11px; color: #38bdf8; font-weight: 800; background: rgba(56,189,248,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">${step.decision}</span>
      </div>
      <div style="padding: 8px 12px; background: #020617; border: 1px solid #1e293b; border-left: 3px solid #10b981; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #f8fafc;">
        ${step.formula}
      </div>
    </div>
  `;
}
