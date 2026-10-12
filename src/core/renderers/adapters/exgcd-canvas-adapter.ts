import { ExgcdStep } from './exgcd-step-compiler';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderExgcdCanvas(container: HTMLElement, step: ExgcdStep): void {
  const stackBoardHtml = `
    <div style="margin-bottom: 4px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
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
  `;

  composeUnifiedCanvas(container, {
    metrics: [
      { label: '特解 x', value: step.x !== undefined ? step.x : '-', color: '#4338ca' },
      { label: '特解 y', value: step.y !== undefined ? step.y : '-', color: '#059669' },
      { label: '最大公约数 gcd', value: step.gcd !== undefined ? step.gcd : '-', color: '#d97706' },
    ],
    mainBoardHtml: stackBoardHtml,
    formula: {
      title: '裴蜀等式求解进度',
      equation: `当前层: a=${step.curA}, b=${step.curB} ${step.finalAns ? `| 最终等式: ${step.curA}*(${step.finalAns.x}) + ${step.curB}*(${step.finalAns.y}) = ${step.finalAns.gcd}` : ''}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
