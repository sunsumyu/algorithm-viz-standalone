/**
 * Miller-Rabin 大素数测试 Canvas Adapter
 */

import { MillerRabinStep } from './large-prime-097-step-compiler';

export class LargePrime097CanvasAdapter {
  render(stageContainer: HTMLElement, step: MillerRabinStep): void {
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
        ${isP === true ? '✅ 确定为素数 (Prime Number)' : isP === false ? '❌ 确定为合数 (Composite Number)' : '⏳ 正在进行 Miller-Rabin 基底探测...'}
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        n = ${step.n} (n-1 = ${step.d} × 2^${step.s})
      </div>
    `;
    root.appendChild(statusBanner);

    // 2. 基底测试结果卡片
    if (step.millerBases && step.millerBases.length > 0) {
      const basesCard = document.createElement('div');
      basesCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

      const chipsHtml = step.millerBases.map(b => `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: ${b.passed ? '#ecfdf5' : '#fee2e2'}; border: 1.5px solid ${b.passed ? '#10b981' : '#ef4444'}; font-family: monospace; font-size: 12px; font-weight: 700; color: ${b.passed ? '#047857' : '#b91c1c'};">
          基底 a=${b.base} ${b.passed ? '✓ 通过' : '✕ 失败'}
        </span>
      `).join(' ');

      basesCard.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          🔬 二次探测定理基底测试结果:
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">${chipsHtml}</div>
      `;
      root.appendChild(basesCard);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const largePrime097CanvasAdapter = new LargePrime097CanvasAdapter();
