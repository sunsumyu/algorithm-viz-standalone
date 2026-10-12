import { LinearBasisKthStep } from './linear-basis-kth-step-compiler';
import { renderLinearBasisVisual } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderLinearBasisKthCanvas(container: HTMLElement, step: LinearBasisKthStep): void {
  const pBoardHtml = `
    <div style="margin-bottom: 4px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
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
  `;

  composeUnifiedCanvas(container, {
    metrics: [
      { label: '目标查询', value: `第 ${step.k} 小 (0b${step.k.toString(2)})`, color: '#4338ca' },
      { label: '当前异或累积值', value: step.ans, color: '#059669' },
      { label: '最终第 K 小异或和', value: step.finalAns !== undefined ? step.finalAns : '合成中', color: '#d97706' },
    ],
    mainBoardHtml: `${renderLinearBasisVisual(step.basis, step.curPIdx !== undefined ? step.curPIdx : -1, 0, step.ans)}${pBoardHtml}`,
    formula: {
      title: '第 K 小二进制映射进度',
      equation: `K 的二进制分解: ${step.k.toString(2)} | 当前输出: ${step.ans}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
