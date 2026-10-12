import { LinearBasisStep } from './linear-basis-136-step-compiler';
import { renderLinearBasisVisual } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderLinearBasis136Canvas(container: HTMLElement, step: LinearBasisStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderLinearBasisVisual(step.basis, step.curBit, step.curNum, step.maxXor)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前被考查数值</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.curNum > 0 ? `${step.curNum} (0b${step.curNum.toString(2)})` : '查询阶段'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">已构建基向量总数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.insertedCount} 个基底</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前最大异或和</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.maxXor}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '线性基操作日志',
        `当前探测二进制位: ${step.curBit >= 0 ? `第 ${step.curBit} 位` : '无'} ${step.finalAns !== undefined ? `| 最终最大异或和 = ${step.finalAns}` : ''}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
