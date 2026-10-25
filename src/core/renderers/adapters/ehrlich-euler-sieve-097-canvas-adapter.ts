/**
 * 欧拉线性筛法 (Euler Sieve) Canvas Adapter
 */

import { EulerSieveStep } from './ehrlich-euler-sieve-097-step-compiler';
import { renderSieveGrid } from '../../../algorithms/categories/math/math-097/math-097-shared';

export class EhrlichEulerSieve097CanvasAdapter {
  render(stageContainer: HTMLElement, step: EulerSieveStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 百数网格展示
    renderSieveGrid(root, step.sieveGrid || [], step.curTesting, `欧拉筛数表网格 (2 ~ ${step.n})`);

    // 2. 已收录质数序列卡片
    const primesCard = document.createElement('div');
    primesCard.style.cssText = 'padding: 12px 16px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; font-size: 13px; line-height: 1.6; color: #cbd5e1;';

    const primesHtml = (step.primesFound && step.primesFound.length > 0)
      ? step.primesFound.map(p => `
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #34d399;">
            ${p}
          </span>
        `).join(' ')
      : '<span style="color: #64748b;">暂无质数</span>';

    primesCard.innerHTML = `
      <div style="font-weight: 700; color: #f8fafc; margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span>📜 已收集质数队列 (共 ${(step.primesFound || []).length} 个):</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">${primesHtml}</div>
      <div style="padding: 10px 14px; background: #1e293b; border-radius: 6px; border-left: 3px solid #38bdf8; font-size: 12px; color: #cbd5e1;">
        ${step.decision}
      </div>
    `;
    root.appendChild(primesCard);

    stageContainer.appendChild(root);
  }
}

export const ehrlichEulerSieve097CanvasAdapter = new EhrlichEulerSieve097CanvasAdapter();
