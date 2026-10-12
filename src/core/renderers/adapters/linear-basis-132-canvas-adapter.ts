import { LinearBasis132Step } from './linear-basis-132-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderLinearBasis132Canvas(container: HTMLElement, step: LinearBasis132Step): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <!-- 指标卡 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前处理数字</div>
          <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.curNum > 0 ? step.curNum : '闲置'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前探测位 (Bit)</div>
          <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.curBit >= 0 ? `第 ${step.curBit} 位` : '无'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">基底独立向量数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.insertedCount} 个</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #166534;">当前最大异或和</div>
          <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.maxXor}</div>
        </div>
      </div>

      <!-- 线性基向量状态表 -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
          🗄️ 线性基底向量表 d[i] (最高位至最低位)
        </div>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
          ${step.basis.map((val, idx) => {
            const isActive = idx === step.curBit;
            return `
              <div style="border: 1px solid ${isActive ? '#3b82f6' : '#e2e8f0'}; background: ${isActive ? '#eff6ff' : '#ffffff'}; border-radius: 6px; padding: 8px; text-align: center;">
                <div style="font-size: 10px; color: #64748b; font-family: monospace;">d[${idx}]</div>
                <div style="font-size: 14px; font-weight: 700; color: ${val > 0 ? '#1e293b' : '#cbd5e1'}; margin-top: 2px;">
                  ${val > 0 ? val : '0'}
                </div>
                <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 2px;">
                  ${val > 0 ? '0b' + val.toString(2).padStart(6, '0') : '-'}
                </div>
              </div>
            `;
          }).reverse().join('')}
        </div>
      </div>

      <!-- 决策解析卡片 -->
      ${renderFormulaCard(
        '线性基插入与消元准则',
        `for i from 60 down to 0: if (x & (1<<i)) { if (!d[i]) { d[i] = x; break; } else x ^= d[i]; }`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

