/**
 * 找出知晓秘密的所有专家 (Find All People With Secret - LeetCode 2092) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 专家社交网络、会议活跃连通与知密状态沙盘
 * Card 2 承载 father 指针监视器与时间切片因果扩散与撤销重置舱
 */

import type { SecretExpertStep } from '../../../algorithms/categories/graph/people-secret-step-compiler';

export function renderPeopleSecretCanvas(container: HTMLElement, step: SecretExpertStep): void {
  const n = step.n;
  const is5 = n === 5;

  const nodeCoords: Record<number, { x: number; y: number }> = is5
    ? {
        0: { x: 45, y: 75 },
        1: { x: 105, y: 45 },
        2: { x: 165, y: 75 },
        3: { x: 225, y: 45 },
        4: { x: 275, y: 75 },
      }
    : {
        0: { x: 45, y: 55 },
        1: { x: 115, y: 55 },
        2: { x: 185, y: 55 },
        3: { x: 255, y: 55 },
        4: { x: 115, y: 115 },
        5: { x: 185, y: 115 },
      };

  let svgEdges = '';
  if (step.activeMeeting) {
    const u = step.activeMeeting[0];
    const v = step.activeMeeting[1];
    const p1 = nodeCoords[u];
    const p2 = nodeCoords[v];
    if (p1 && p2) {
      svgEdges += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#facc15" stroke-width="3.5" />`;
    }
  }

  let svgNodes = '';
  for (let i = 0; i < n; i++) {
    const p = nodeCoords[i];
    if (!p) continue;
    const isKnown = step.knownExperts.includes(i);
    const isReset = step.resetNodes.includes(i);
    const isActive =
      step.activeMeeting !== null &&
      (step.activeMeeting[0] === i || step.activeMeeting[1] === i);

    const bg = isKnown ? '#065f46' : isReset ? '#831843' : '#1e293b';
    const border = isActive
      ? '#facc15'
      : isReset
        ? '#ef4444'
        : isKnown
          ? '#10b981'
          : '#475569';

    svgNodes += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isActive || isKnown ? 2.5 : 1.5}" />
        <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">E${i}</text>
        <text x="${p.x}" y="${p.y + 24}" fill="${border}" font-size="8" font-weight="700" text-anchor="middle">${isKnown ? '知密' : isReset ? '撤销' : '未知'}</text>
      </g>
    `;
  }

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 140">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderPeopleSecretCustomMetrics(container: HTMLElement, step: SecretExpertStep): void {
  const n = step.father.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
    const cells = indices
      .map((u) => {
        const val = arr[u] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === u;
        const isKnown = step.knownExperts.includes(u);
        const bg = isActive ? '#78350f' : isKnown ? 'rgba(6, 95, 70, 0.5)' : '#1e293b';
        const textCol = isActive ? '#fde047' : isKnown ? '#34d399' : '#e2e8f0';
        const border = isActive ? '2px solid #eab308' : isKnown ? '1px solid #10b981' : '1px solid #475569';

        return `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
            <span style="font-size: 8px; color: #64748b; line-height: 1;">E[${u}]</span>
            <span style="line-height: 1.1;">${val}</span>
          </div>
        `;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const fatherRow = renderRow('father[] (父指针)', step.father, 'father', '#38bdf8');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 8px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${fatherRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">当前已确认掌握秘密人数:</span>
          <strong style="color: #10b981; font-family: monospace; font-size: 12px;">${step.knownExperts.length} 人 (${step.knownExperts.map((x) => `E${x}`).join(', ')})</strong>
        </div>
      </div>

      <!-- 时序扩散与因果撤销舱 -->
      <div style="background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #1e293b;">⏳ 时序扩散与因果撤销舱</span>
          <span style="font-size: 10.5px; color: #0284c7;">当前时间切片: <b>t = ${step.curTime}</b></span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
          <div style="background: rgba(6, 95, 70, 0.15); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; display: flex; flex-direction: column; gap: 1px;">
            <span style="font-size: 9.5px; color: #065f46; font-weight: 700;">知密专家集合 (已连通 0 号):</span>
            <span style="font-size: 10.5px; color: #047857; font-family: monospace;">[${step.knownExperts.map((x) => `E${x}`).join(', ')}]</span>
          </div>

          ${
            step.resetNodes.length > 0
              ? `<div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 4px; padding: 4px 8px; display: flex; flex-direction: column; gap: 1px;">
                  <span style="font-size: 9.5px; color: #991b1b; font-weight: 700;">⏪ 本批撤销重置专家 (未连通 0):</span>
                  <span style="font-size: 10.5px; color: #b91c1c; font-family: monospace;">[${step.resetNodes.map((x) => `E${x}`).join(', ')}]</span>
                </div>`
              : ''
          }
        </div>
      </div>
    </div>
  `;
}
