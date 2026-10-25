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
    const bg = isP === true ? 'rgba(16, 185, 129, 0.15)' : isP === false ? 'rgba(239, 68, 68, 0.15)' : '#0f172a';
    const border = isP === true ? '#10b981' : isP === false ? '#ef4444' : '#1e293b';
    const color = isP === true ? '#34d399' : isP === false ? '#f87171' : '#94a3b8';
    const glow = isP === true ? 'box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);' : isP === false ? 'box-shadow: 0 0 12px rgba(239, 68, 68, 0.25);' : '';

    statusBanner.style.cssText = `padding: 12px 16px; background: ${bg}; border-radius: 8px; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: space-between; ${glow}`;
    statusBanner.innerHTML = `
      <div style="font-weight: 800; font-size: 14px; color: ${color};">
        ${isP === true ? '✅ 质数 (Prime Number)' : isP === false ? '❌ 合数 (Composite Number)' : '⏳ 正在逐步试除检测中...'}
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #38bdf8; font-weight: 700;">
        n = ${step.n}
      </div>
    `;
    root.appendChild(statusBanner);

    // 2. 已测试因子记录看板
    if (step.testedDivisors && step.testedDivisors.length > 0) {
      const card = document.createElement('div');
      card.style.cssText = 'padding: 12px 16px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;';
      const itemsHtml = step.testedDivisors.map(d => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; background: ${d.isFactor ? 'rgba(239, 68, 68, 0.2)' : '#1e293b'}; border: 1px solid ${d.isFactor ? '#ef4444' : '#334155'}; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${d.isFactor ? '#f87171' : '#94a3b8'}; font-weight: 700;">
          ${d.divisor} ${d.isFactor ? '💥 整除' : '✕'}
        </span>
      `).join(' ');

      card.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">
          🔬 试除因子检验队列:
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">${itemsHtml}</div>
      `;
      root.appendChild(card);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 10px 14px; background: #0f172a; border-radius: 6px; border-left: 3px solid #38bdf8; border: 1px solid #1e293b; border-left: 3px solid #38bdf8; font-size: 12px; color: #cbd5e1;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const smallPrime097CanvasAdapter = new SmallPrime097CanvasAdapter();
