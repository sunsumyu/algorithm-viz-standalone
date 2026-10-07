/**
 * 子集 GCD 为 K 的方案数 (Subset GCD K) Canvas Adapter
 */

import { SubsetGcdStep } from './subset-gcd-k-099-step-compiler';

export class SubsetGcdK099CanvasAdapter {
  render(stageContainer: HTMLElement, step: SubsetGcdStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusBox = document.createElement('div');
    statusBox.style.cssText = 'padding: 10px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;';
    statusBox.innerHTML = `
      <div style="font-weight: 700; color: #1e293b;">
        🎯 目标 GCD = <span style="color: #2563eb; font-size: 16px; font-family: monospace;">${step.k}</span>
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        输入集合: [${step.nums.join(', ')}]
      </div>
    `;
    root.appendChild(statusBox);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const subsetGcdK099CanvasAdapter = new SubsetGcdK099CanvasAdapter();
