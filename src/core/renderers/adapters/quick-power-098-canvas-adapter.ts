/**
 * 二进制快速幂 (Quick Power) Canvas Adapter
 */

import { QuickPowerStep } from './quick-power-098-step-compiler';
import { renderExpBits } from '../../../algorithms/categories/math/math-098/math-098-shared';

export class QuickPower098CanvasAdapter {
  render(stageContainer: HTMLElement, step: QuickPowerStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 指数二进制分解看板
    renderExpBits(root, step.b || 0, step.bitIndex);

    // 2. 核心状态数据监控面板
    const statusBox = document.createElement('div');
    statusBox.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 12px 16px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;';
    statusBox.innerHTML = `
      <div style="padding: 10px 12px; background: #1e293b; border-radius: 6px; border: 1.5px solid #334155; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">当前底数 a</div>
        <div style="font-size: 16px; font-weight: 800; color: #f8fafc; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${step.curA}</div>
      </div>
      <div style="padding: 10px 12px; background: #1e293b; border-radius: 6px; border: 1.5px solid #334155; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">当前剩余指数 b</div>
        <div style="font-size: 16px; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${step.curB}</div>
      </div>
      <div style="padding: 10px 12px; background: rgba(16, 185, 129, 0.15); border-radius: 6px; border: 1.5px solid #10b981; text-align: center; box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);">
        <div style="font-size: 11px; color: #34d399; font-weight: 700;">累乘答案 ans</div>
        <div style="font-size: 16px; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${step.curAns}</div>
      </div>
    `;
    root.appendChild(statusBox);

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 10px 14px; background: #0f172a; border-radius: 6px; border: 1px solid #1e293b; border-left: 3px solid #38bdf8; font-size: 12px; color: #cbd5e1;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const quickPower098CanvasAdapter = new QuickPower098CanvasAdapter();
