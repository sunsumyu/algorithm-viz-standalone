/**
 * Class 159: 莫队算法 (Mo's Algorithm) 领域视觉适配器
 * 核心：分块数组双指针沙盘、当前指针范围卡、相异种类指示卡与莫队分块引擎公式卡
 */

import { MoStep } from './mo-algorithm-step-compiler';
import { renderMoBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderMoCanvas(container: HTMLElement, step: MoStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderMoBoard(
        step.arr,
        step.blockSize,
        step.curL,
        step.curR,
        step.targetL,
        step.targetR,
        step.curAns
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前指针范围 [L, R]</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            [${step.curL}, ${step.curR}]
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">相异元素种类总数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.curAns} 种</div>
        </div>
      </div>

      ${renderFormulaCard(
        '莫队离线分块双指针引擎',
        `最优块长: B = N / sqrt(Q) | 奇偶优化: 奇数块 R 升序，偶数块 R 降序 | 总移动复杂度: O(N sqrt(Q))`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
