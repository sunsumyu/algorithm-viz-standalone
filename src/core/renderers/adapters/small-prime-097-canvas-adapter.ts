/**
 * 试除法判素数 (Small Prime) Canvas Adapter
 */

import { SmallPrimeStep } from './small-prime-097-step-compiler';

export class SmallPrime097CanvasAdapter {
  render(stageContainer: HTMLElement, step: SmallPrimeStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusBanner = document.createElement('div');
    const isP = step.isResultPrime;
    const bg = isP === true ? '#ecfdf5' : isP === false ? '#fef2f2' : '#f8fafc';
    const border = isP === true ? '#10b981' : isP === false ? '#ef4444' : '#cbd5e1';
    const color = isP === true ? '#047857' : isP === false ? '#b91c1c' : '#334155';

    statusBanner.style.cssText = `padding: 10px 16px; background: ${bg}; border-radius: 8px; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: space-between;`;
    statusBanner.innerHTML = `
      <div style="font-weight: 800; font-size: 14px; color: ${color};">
        ${isP === true ? '✅ 质数 (Prime Number)' : isP === false ? '❌ 合数 (Composite Number)' : '⏳ 正在逐步试除检测中...'}
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        n = ${step.n}
      </div>
    `;
    root.appendChild(statusBanner);

    // 2. 已测试因子记录看板
    if (step.testedDivisors && step.testedDivisors.length > 0) {
      const card = document.createElement('div');
      card.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';
      const itemsHtml = step.testedDivisors.map(d => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: ${d.isFactor ? '#fee2e2' : '#f1f5f9'}; border: 1px solid ${d.isFactor ? '#ef4444' : '#cbd5e1'}; font-family: monospace; font-size: 12px;">
          ${d.divisor} ${d.isFactor ? '💥 整除' : '✕'}
        </span>
      `).join(' ');

      card.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
          🔬 试除因子检验队列:
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">${itemsHtml}</div>
      `;
      root.appendChild(card);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const smallPrime097CanvasAdapter = new SmallPrime097CanvasAdapter();
