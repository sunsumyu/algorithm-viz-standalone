import { DiophantineStep } from './diophantine-equation-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderDiophantineEquationCanvas(container: HTMLElement, step: DiophantineStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
        <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
          📐 不定方程解析式: ${step.a}x + ${step.b}y = ${step.c}
        </div>
        <div style="font-size: 12px; color: #64748b;">
          ${step.gcd ? `最大公约数: gcd(${step.a}, ${step.b}) = ${step.gcd} | 整除判定: ${step.c} % ${step.gcd} = ${step.c % step.gcd}` : '待计算'}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">解的存在性</div>
          <div style="font-size: 18px; font-weight: 700; color: ${step.hasSolution ? '#059669' : '#dc2626'};">
            ${step.hasSolution ? '必定有解' : '无整数解 (-1)'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">最小正整数 x</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.minPositiveX !== undefined ? step.minPositiveX : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">通解周期 dx</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.dx !== undefined ? step.dx : '-'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '二元一次不定方程状态',
        `方程: ${step.a}x + ${step.b}y = ${step.c} ${step.minPositiveX !== undefined ? `| 最小正整数解: x=${step.minPositiveX}, y=${step.correspondingY}` : ''}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
