/**
 * 稳定婚姻匹配 (Stable Marriage - Gale-Shapley 延迟接受算法) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 男女偏好拓扑、求婚协商与婚约沙盘
 * Card 2 承载 husband, wife, nextPropose 多数组监视器与博弈论稳定婚姻验证指标
 */

import type { MarriageStep } from '../../../algorithms/categories/graph/stable-marriage-step-compiler';

export function renderStableMarriageCanvas(container: HTMLElement, step: MarriageStep): void {
  const is4 = step.husbandArray.length === 4;
  const n = is4 ? 4 : 3;

  const leftCoords: Record<string, { x: number; y: number }> = {};
  const rightCoords: Record<string, { x: number; y: number }> = {};

  const yGap = is4 ? 40 : 55;
  const yStart = is4 ? 40 : 45;

  for (let i = 1; i <= n; i++) {
    leftCoords[`M${i}`] = { x: 75, y: yStart + (i - 1) * yGap };
    rightCoords[`W${i}`] = { x: 235, y: yStart + (i - 1) * yGap };
  }

  const engagements = step.currentEngagements;

  let svgEdges = '';
  // 绘制订婚边
  for (let w = 1; w <= n; w++) {
    const mStr = engagements[`W${w}`];
    if (mStr) {
      const p1 = leftCoords[mStr];
      const p2 = rightCoords[`W${w}`];
      if (p1 && p2) {
        svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="3" />`;
      }
    }
  }

  // 绘制当前动作边
  if (step.proposingMan && step.proposedWoman && step.status !== 'done') {
    const p1 = leftCoords[step.proposingMan];
    const p2 = rightCoords[step.proposedWoman];
    if (p1 && p2) {
      const color = step.status === 'reject' ? '#ef4444' : '#facc15';
      svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="2.5" stroke-dasharray="4,2" />`;
    }
  }

  let svgNodes = '';
  for (let i = 1; i <= n; i++) {
    const mStr = `M${i}`;
    const wStr = `W${i}`;
    const pL = leftCoords[mStr];
    const pR = rightCoords[wStr];

    const isCurM = step.proposingMan === mStr;
    const isCurW = step.proposedWoman === wStr;
    const curHusband = engagements[wStr];

    svgNodes += `
      <g>
        <circle cx="${pL.x}" cy="${pL.y}" r="15" fill="${isCurM ? '#0369a1' : '#1e3a8a'}" stroke="${isCurM ? '#38bdf8' : '#64748b'}" stroke-width="${isCurM ? 3 : 1.5}" />
        <text x="${pL.x}" y="${pL.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${mStr}</text>
      </g>
      <g>
        <circle cx="${pR.x}" cy="${pR.y}" r="15" fill="${curHusband ? '#831843' : '#4c0519'}" stroke="${isCurW ? '#facc15' : '#ec4899'}" stroke-width="${isCurW ? 3 : 1.5}" />
        <text x="${pR.x}" y="${pR.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${wStr}</text>
        <text x="${pR.x + 28}" y="${pR.y + 4}" fill="${curHusband ? '#10b981' : '#94a3b8'}" font-size="8.5" font-family="monospace" font-weight="700">${curHusband ? `💍${curHusband}` : '单身'}</text>
      </g>
    `;
  }

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 200">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderStableMarriageCustomMetrics(container: HTMLElement, step: MarriageStep): void {
  const is4 = step.husbandArray.length === 4;
  const n = is4 ? 4 : 3;
  const indices = Array.from({ length: n }, (_, i) => i);

  const renderRow = (name: string, arr: number[], activeName: string, color: string, prefix: string) => {
    const cells = indices
      .map((idx) => {
        const val = arr[idx] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const displayVal = val === 0 ? '-' : prefix === 'W' ? `M${val}` : prefix === 'M' ? `W${val}` : `${val}`;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
          <span style="font-size: 7.5px; color: #64748b; line-height: 1;">${prefix}[${idx + 1}]</span>
          <span style="line-height: 1.1;">${displayVal}</span>
        </div>`;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const husRow = renderRow('husband[] (未婚夫)', step.husbandArray, 'husband', '#ec4899', 'W');
  const wifRow = renderRow('wife[] (未婚妻)', step.wifeArray, 'wife', '#38bdf8', 'M');
  const nxtRow = renderRow('nextPropose[] (顺位)', step.nextProposeArray, 'nextPropose', '#f59e0b', 'M');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${husRow}
        ${wifRow}
        ${nxtRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">当前已缔结婚约数:</span>
          <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${Object.keys(step.currentEngagements).length} / ${n} 对</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
      </div>
    </div>
  `;
}
