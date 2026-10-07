/**
 * 阶乘逆元与组合数快速计算 (Factorial Inverses & nCr) Canvas Adapter
 */

import { FactorialStep } from './inverse-factorial-099-step-compiler';

export class InverseFactorial099CanvasAdapter {
  render(stageContainer: HTMLElement, step: FactorialStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 组合数计算公式卡片
    const card = document.createElement('div');
    card.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6;';
    card.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        📐 组合数逆元计算公式:
      </div>
      <div style="font-family: monospace; font-size: 14px; color: #1e293b; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #3b82f6; margin-bottom: 8px;">
        C(${step.n}, ${step.m}) = fact[${step.n}] × invFact[${step.m}] × invFact[${step.n - step.m}] % mod
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="padding: 4px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #3b82f6; font-family: monospace; font-size: 11px;">
          fact[${step.n}] = ${step.factN ?? '...'}
        </span>
        <span style="padding: 4px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #3b82f6; font-family: monospace; font-size: 11px;">
          invFact[${step.m}] = ${step.invFactM ?? '...'}
        </span>
        <span style="padding: 4px 8px; border-radius: 4px; background: #eff6ff; border: 1px solid #3b82f6; font-family: monospace; font-size: 11px;">
          invFact[${step.n - step.m}] = ${step.invFactNM ?? '...'}
        </span>
      </div>
    `;
    root.appendChild(card);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const inverseFactorial099CanvasAdapter = new InverseFactorial099CanvasAdapter();
