/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph · 洛谷 P3199) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 拓扑沙盘 (无弦环与对角弦拓扑)
 * Card 2 承载 MCS 多数组 (label, peo, rankOrder, vis) 实时对齐与充要条件检验
 */

import type { ChordalStep } from '../../../algorithms/categories/graph/chordal-graph-step-compiler';

export function renderChordalGraphCanvas(container: HTMLElement, step: ChordalStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 80, y: 55 },
    2: { x: 230, y: 55 },
    3: { x: 80, y: 165 },
    4: { x: 230, y: 165 },
  };

  const svgEdges = step.edges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';
      const isChord = e.isChord;
      const isHighlight = e.highlighted;
      const color = isHighlight ? '#ef4444' : isChord ? '#facc15' : '#475569';
      const width = isHighlight ? 3.5 : isChord ? 2.5 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isHighlight ? 'stroke-dasharray="4,2"' : ''} />`;
    })
    .join('');

  const nodes = [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const inPEO = step.visArray[u];
      const isCur = step.curSelected === u;
      const bg = isCur ? '#f59e0b' : inPEO ? '#065f46' : '#1e3a8a';
      const border = isCur ? '#facc15' : inPEO ? '#10b981' : '#38bdf8';
      const weight = step.labelWeights[u] || 0;
      const rk = step.rankOrderArray[u];

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || inPEO ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 26}" fill="${inPEO ? '#34d399' : '#94a3b8'}" font-size="9" font-weight="700" text-anchor="middle">势:${weight}${rk ? `(秩${rk})` : ''}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 200">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderChordalGraphCustomMetrics(container: HTMLElement, step: ChordalStep): void {
  const renderArraySlots = (
    name: string,
    slots: any[] | Record<number, any>,
    activeCondition: (idx: number) => boolean,
    colorTheme: string
  ) => {
    const cells = [1, 2, 3, 4]
      .map((idx) => {
        const val = slots[idx];
        const isActive = activeCondition(idx);
        const displayVal = val === null || val === undefined ? '_' : typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
          <span style="font-size: 8px; color: #64748b; line-height: 1;">[${idx}]</span>
          <span style="line-height: 1.2;">${displayVal}</span>
        </div>`;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 85px; color: ${colorTheme};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const peoRow = renderArraySlots(
    'peo[]',
    step.peoArray,
    (idx) => step.activeArray === 'peo' && step.activeSlot === idx,
    '#38bdf8'
  );
  const rankRow = renderArraySlots(
    'rankOrder[]',
    step.rankOrderArray,
    (idx) => step.activeArray === 'rankOrder' && step.activeSlot === idx,
    '#a855f7'
  );
  const labelRow = renderArraySlots(
    'label[] (势)',
    step.labelWeights,
    (idx) => step.activeArray === 'label' && step.activeSlot === idx,
    '#f59e0b'
  );
  const visRow = renderArraySlots(
    'vis[] (锁定)',
    step.visArray,
    (idx) => step.activeArray === 'vis' && step.activeSlot === idx,
    '#10b981'
  );

  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${peoRow}
        ${rankRow}
        ${labelRow}
        ${visRow}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">当前执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class ChordalGraphCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: ChordalStep): void {
    renderChordalGraphCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: ChordalStep): void {
    renderChordalGraphCustomMetrics(container, step);
  }

  public dispose(): void {}
}
