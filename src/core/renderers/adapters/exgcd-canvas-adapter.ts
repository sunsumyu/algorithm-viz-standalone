import { ExgcdStep } from './exgcd-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderExgcdCanvas(container: HTMLElement, step: ExgcdStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
        <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;">
          🪜 ExGCD 递归栈帧调用链 (栈深度: ${step.callStack.length})
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${step.callStack.map((f, idx) => `
            <div style="background: ${f.status === 'base' ? '#fef3c7' : f.status === 'returned' ? '#ecfdf5' : '#ffffff'}; border: 1px solid ${f.status === 'base' ? '#f59e0b' : f.status === 'returned' ? '#10b981' : '#cbd5e1'}; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <span style="font-weight: 700; color: #1e293b;">Frame #${idx}: exgcd(${f.a}, ${f.b})</span>
              <span style="color: #64748b;">${f.q !== undefined ? `商 q=${f.q}` : ''}</span>
              <span style="font-weight: 700; color: #6366f1;">${f.x !== undefined ? `解 x=${f.x}, y=${f.y} (gcd=${f.gcd})` : '等待递归返回'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">特解 x</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.x !== undefined ? step.x : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">特解 y</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.y !== undefined ? step.y : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">最大公约数 gcd</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.gcd !== undefined ? step.gcd : '-'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '裴蜀等式求解进度',
        `当前层: a=${step.curA}, b=${step.curB} ${step.finalAns ? `| 最终等式: ${step.curA}*(${step.finalAns.x}) + ${step.curB}*(${step.finalAns.y}) = ${step.finalAns.gcd}` : ''}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
