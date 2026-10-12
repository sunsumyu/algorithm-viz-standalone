import { Crt141Step } from './crt-141-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderCrt141Canvas(container: HTMLElement, step: Crt141Step): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <!-- 顶部核心指标 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">模数总积 M</div>
          <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">M = ${step.totalM}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前求解项</div>
          <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.curIndex >= 0 && step.curIndex < step.items.length ? `第 ${step.curIndex + 1} 组` : '完成'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前累计和 (mod M)</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.accumulatedX}</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #166534;">最小正整数解 x</div>
          <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.finalAns >= 0 ? step.finalAns : '求解中...'}</div>
        </div>
      </div>

      <!-- 同余方程构造表 -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
          📊 同余方程组与 CRT 分项构造表
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #e2e8f0; color: #334155; text-align: center;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">方程</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">模数 m_i</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">余数 a_i</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">除模积 M_i = M/m_i</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">逆元 t_i (mod m_i)</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">项加权 a_i·M_i·t_i</th>
            </tr>
          </thead>
          <tbody>
            ${step.items.map((it, idx) => {
              const isActive = idx === step.curIndex;
              return `
                <tr style="text-align: center; background: ${isActive ? '#eff6ff' : '#ffffff'}; font-weight: ${isActive ? '700' : 'normal'};">
                  <td style="padding: 8px; border: 1px solid #cbd5e1;">方程 ${idx + 1}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #0284c7;">${it.m}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #e11d48;">${it.a}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${it.Mi > 0 ? it.Mi : '-'}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; color: #8b5cf6;">${it.ti > 0 ? it.ti : '-'}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #059669;">${it.term > 0 ? it.term : '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- 决策卡片 -->
      ${renderFormulaCard(
        'CRT 构造公式',
        `x = ∑ (a_i × M_i × t_i) mod M，其中 M_i × t_i ≡ 1 (mod m_i)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
