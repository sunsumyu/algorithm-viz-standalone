import { LinearBasisKthStep } from './linear-basis-kth-step-compiler';
import { renderLinearBasisVisual } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderLinearBasisKthCanvas(container: HTMLElement, step: LinearBasisKthStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderLinearBasisVisual(step.basis, step.curPIdx !== undefined ? step.curPIdx : -1, 0, step.ans)}

      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">
          🎚️ 重构后的紧凑基底向量组 p[] (共 ${step.p.length} 个)
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${step.p.map((val, idx) => `
            <div style="background: ${idx === step.curPIdx ? '#e0e7ff' : '#ffffff'}; border: 1px solid ${idx === step.curPIdx ? '#6366f1' : '#cbd5e1'}; border-radius: 6px; padding: 6px 10px; font-size: 11px;">
              <span style="font-weight: 700; color: #1e293b;">p[${idx}]</span>: 
              <span style="color: #6366f1; font-weight: 700;">${val}</span> 
              <span style="font-size: 9px; color: #64748b;">(0b${val.toString(2)})</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">目标查询</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">第 ${step.k} 小 (0b${step.k.toString(2)})</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前异或累积值</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.ans}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">最终第 K 小异或和</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.finalAns !== undefined ? step.finalAns : '合成中'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '第 K 小二进制映射进度',
        `K 的二进制分解: ${step.k.toString(2)} | 当前输出: ${step.ans}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
