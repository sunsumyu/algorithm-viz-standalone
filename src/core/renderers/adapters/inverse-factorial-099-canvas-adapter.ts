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
    // 1. 组合数计算公式卡片
    const card = document.createElement('div');
    card.style.cssText = 'padding: 12px 16px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; font-size: 13px; line-height: 1.6;';
    card.innerHTML = `
      <div style="font-weight: 700; color: #f8fafc; margin-bottom: 8px;">
        📐 组合数逆元计算公式:
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #38bdf8; background: #1e293b; padding: 10px 14px; border-radius: 6px; border-left: 3px solid #38bdf8; margin-bottom: 10px; font-weight: 700;">
        C(${step.n}, ${step.m}) = fact[${step.n}] × invFact[${step.m}] × invFact[${step.n - step.m}] % mod
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="padding: 4px 10px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f8fafc; font-weight: 700;">
          fact[${step.n}] = <b style="color: #38bdf8;">${step.factN ?? '...'}</b>
        </span>
        <span style="padding: 4px 10px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f8fafc; font-weight: 700;">
          invFact[${step.m}] = <b style="color: #38bdf8;">${step.invFactM ?? '...'}</b>
        </span>
        <span style="padding: 4px 10px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #f8fafc; font-weight: 700;">
          invFact[${step.n - step.m}] = <b style="color: #38bdf8;">${step.invFactNM ?? '...'}</b>
        </span>
      </div>
    `;
    root.appendChild(card);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 10px 14px; background: #0f172a; border-radius: 6px; border: 1px solid #1e293b; border-left: 3px solid #38bdf8; font-size: 12px; color: #cbd5e1;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const inverseFactorial099CanvasAdapter = new InverseFactorial099CanvasAdapter();
