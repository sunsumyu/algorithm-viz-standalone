/**
 * 情侣牵手 (Couples Holding Hands · LeetCode 765) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 置换环拓扑与情侣对连通沙盘
 * Card 2 承载沙发就坐席位卡片、parent 代表元监视器与置换环分解理论结算舱
 */

import type { CouplesStep } from '../../../algorithms/categories/graph/couples-holding-hands-step-compiler';

export function renderCouplesHoldingHandsCanvas(container: HTMLElement, step: CouplesStep): void {
  const n = step.parentArray.length;
  const cx = 210;
  const cy = 110;
  const r = 72;

  const nodeCoords: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    nodeCoords.push({
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    });
  }

  // 绘制沙发连边 (置换环边)
  let svgEdges = '';
  const couchesLimit = step.status === 'done' ? n : Math.min(n, step.currentCouch + 1);

  for (let k = 0; k < couchesLimit; k++) {
    const p1 = step.row[k * 2];
    const p2 = step.row[k * 2 + 1];
    const c1 = Math.floor(p1 / 2);
    const c2 = Math.floor(p2 / 2);

    const isCur = step.currentCouch === k && step.status !== 'done';
    const strokeColor = isCur ? '#facc15' : c1 === c2 ? '#10b981' : '#38bdf8';
    const strokeWidth = isCur ? 3.5 : 2;

    if (c1 === c2) {
      // 自环/已成对
      const p = nodeCoords[c1];
      if (p) {
        svgEdges += `<circle cx="${p.x}" cy="${p.y}" r="25" fill="none" stroke="${strokeColor}" stroke-dasharray="3,3" stroke-width="1.5" />`;
      }
    } else {
      const pA = nodeCoords[c1];
      const pB = nodeCoords[c2];
      if (pA && pB) {
        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;
        svgEdges += `
          <g>
            <line x1="${pA.x}" y1="${pA.y}" x2="${pB.x}" y2="${pB.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
            <rect x="${midX - 14}" y="${midY - 8}" width="28" height="16" rx="4" fill="#0f172a" stroke="${strokeColor}" stroke-width="1" />
            <text x="${midX}" y="${midY + 3.5}" fill="${strokeColor}" font-size="8.5" font-family="monospace" font-weight="700" text-anchor="middle">S${k}</text>
          </g>
        `;
      }
    }
  }

  // 绘制节点
  let svgNodes = '';
  for (let i = 0; i < n; i++) {
    const p = nodeCoords[i];
    let root = i;
    while (step.parentArray[root] !== root) root = step.parentArray[root];

    const isCurrentActive =
      step.status !== 'done' &&
      (step.couchCouples[0] === i || step.couchCouples[1] === i);

    const isRoot = step.parentArray[i] === i;
    const bg = isCurrentActive ? '#78350f' : isRoot ? '#1e3a8a' : '#1e293b';
    const border = isCurrentActive ? '#facc15' : isRoot ? '#60a5fa' : '#64748b';

    svgNodes += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="18" fill="${bg}" stroke="${border}" stroke-width="${isCurrentActive ? 2.5 : 1.8}" />
        <text x="${p.x}" y="${p.y + 4.5}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">C${i}</text>
        <text x="${p.x}" y="${p.y + 30}" fill="${border}" font-size="8.5" font-weight="600" text-anchor="middle">根: C${root}</text>
      </g>
    `;
  }

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 220px;" viewBox="0 0 420 220">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderCouplesHoldingHandsCustomMetrics(container: HTMLElement, step: CouplesStep): void {
  const n = step.parentArray.length;

  // 1. 沙发就坐人员卡片
  const couchBoxes = Array.from({ length: n }, (_, i) => {
    const p1 = step.row[i * 2];
    const p2 = step.row[i * 2 + 1];
    const c1 = Math.floor(p1 / 2);
    const c2 = Math.floor(p2 / 2);
    const isCur = step.currentCouch === i && step.status !== 'done';
    const isMatched = c1 === c2;

    const border = isCur ? '2px solid #facc15' : isMatched ? '2px solid #10b981' : '1px solid #475569';
    const bg = isCur ? '#422006' : isMatched ? 'rgba(6, 95, 70, 0.3)' : '#1e293b';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; background: ${bg}; border: ${border}; border-radius: 6px; padding: 5px 8px; gap: 3px; min-width: 88px;">
        <span style="font-size: 8.5px; color: #94a3b8; font-weight: 700;">🛋️ 沙发 #${i}</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 10.5px; font-weight: 800; color: #38bdf8; font-family: monospace;">${p1} <sub style="color:#f59e0b;">(C${c1})</sub></span>
          <span style="color: ${isMatched ? '#34d399' : '#64748b'}; font-size: 9px;">${isMatched ? '❤️' : '⚡'}</span>
          <span style="font-size: 10.5px; font-weight: 800; color: #38bdf8; font-family: monospace;">${p2} <sub style="color:#f59e0b;">(C${c2})</sub></span>
        </div>
        <span style="font-size: 8px; color: ${isMatched ? '#34d399' : '#94a3b8'}; font-weight: 600;">
          ${isMatched ? '✔ 已成对' : `连边 C${c1}↔C${c2}`}
        </span>
      </div>
    `;
  }).join('');

  // 2. parent[] 监视器
  const indices = Array.from({ length: n }, (_, i) => i);
  const parentCells = indices
    .map((idx) => {
      const val = step.parentArray[idx] ?? 0;
      const isActive = step.activeArray === 'parent' && step.activeSlot === idx;
      const bg = isActive ? '#78350f' : '#1e293b';
      const textCol = isActive ? '#fde047' : '#e2e8f0';
      const border = isActive ? '2px solid #eab308' : '1px solid #475569';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10.5px; font-weight: 700;">
          <span style="font-size: 7.5px; color: #64748b; line-height: 1;">C[${idx}]</span>
          <span style="line-height: 1.1;">${val}</span>
        </div>
      `;
    })
    .join('');

  // 3. 置换环结构统计
  const cycleMap = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    let r = i;
    while (step.parentArray[r] !== r) r = step.parentArray[r];
    if (!cycleMap.has(r)) cycleMap.set(r, []);
    cycleMap.get(r)!.push(i);
  }

  const cyclesHtml = Array.from(cycleMap.entries()).map(([root, members]) => {
    const k = members.length;
    const needSwaps = k - 1;
    const isSingle = k === 1;
    const bg = isSingle ? 'rgba(6, 95, 70, 0.3)' : 'rgba(30, 41, 59, 0.7)';
    const border = isSingle ? '#10b981' : '#38bdf8';

    return `
      <div style="background:${bg}; border:1px solid ${border}; border-radius:6px; padding:5px 8px; display:flex; flex-direction:column; gap:2px; min-width:96px;">
        <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700;">
          <span style="color:#38bdf8;">环根 C${root}</span>
          <span style="color:#a7f3d0;">k=${k}</span>
        </div>
        <div style="font-size:8.5px; color:#94a3b8; font-family:monospace;">
          [${members.map((c) => `C${c}`).join(', ')}]
        </div>
        <div style="font-size:8px; color:#f59e0b; font-weight:600;">
          需交换: <b>${needSwaps} 次</b>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 6px; box-sizing: border-box;">
      <!-- 沙发席位 -->
      <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
        <span style="font-size: 10px; color: #94a3b8; font-weight: 700;">🛋️ 沙发席位排布舱</span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${couchBoxes}
        </div>
      </div>

      <!-- parent[] 数组与置换环统计 -->
      <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 10.5px; font-weight: 700; width: 110px; color: #0284c7;">parent[] 代表元:</span>
          <div style="display: flex; gap: 3px;">${parentCells}</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #059669; font-size: 10px; font-weight: 700;">置换环连通块数:</span>
          <strong style="color: #059669; font-family: monospace; font-size: 11.5px;">${step.disjointSetCount} 个独立环</strong>
        </div>
      </div>

      <!-- 置换环理论结算舱 -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10.5px; font-weight: 800; color: #1e3a8a;">🔄 置换环分解与理论交换舱</span>
          <div style="font-size: 10px; color: #1e40af;">
            定理: <b>最少交换 = N - Sets = ${n} - ${step.disjointSetCount} = ${step.minSwaps} 次</b>
          </div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${cyclesHtml}
        </div>
      </div>
    </div>
  `;
}
