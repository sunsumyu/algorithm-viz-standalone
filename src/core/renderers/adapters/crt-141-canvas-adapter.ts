import { Crt141Step } from './crt-141-step-compiler';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderCrt141Canvas(container: HTMLElement, step: Crt141Step): void {
  const tableBoardHtml = `
    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 4px;">
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
  `;

  composeUnifiedCanvas(container, {
    metrics: [
      { label: '模数总积 M', value: `M = ${step.totalM}`, color: '#0284c7' },
      { label: '当前求解项', value: step.curIndex >= 0 && step.curIndex < step.items.length ? `第 ${step.curIndex + 1} 组` : '完成', color: '#8b5cf6' },
      { label: '当前累计和 (mod M)', value: step.accumulatedX, color: '#059669' },
      { label: '最小正整数解 x', value: step.finalAns >= 0 ? step.finalAns : '求解中...', color: '#15803d' },
    ],
    mainBoardHtml: tableBoardHtml,
    formula: {
      title: 'CRT 构造公式',
      equation: `x = ∑ (a_i × M_i × t_i) mod M，其中 M_i × t_i ≡ 1 (mod m_i)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
