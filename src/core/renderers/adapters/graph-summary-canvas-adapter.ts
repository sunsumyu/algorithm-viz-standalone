/**
 * 图论总结篇 (Graph Summary) — 领域视觉适配器
 * 遵循 Matt Pocock 深模块哲学：
 * Card 1: 100% 纯 SVG 全景星系图谱沙盘 (Graph Constellation Knowledge Radar)
 * Card 2: 领域指标舱、核心算法标签与复杂度权衡诊断
 */

import type { GSStep } from '../../../algorithms/categories/graph/graph-summary-step-compiler';

export function renderGraphSummaryCanvas(container: HTMLElement, step: GSStep): void {
  const { activeCategory, categories } = step;
  const isAllActive = !activeCategory || activeCategory === 'done';

  const width = 760;
  const height = 420;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 140;

  // 5 个核心领域均匀辐射排布 (72° 间隔，顶点从 -90° 开始)
  const nodeCoords = categories.map((cat, idx) => {
    const angleDeg = -90 + idx * 72;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);
    const isActive = isAllActive || activeCategory === cat.id;
    return { ...cat, x, y, angleDeg, isActive };
  });

  // 1. 中心辐射连线与连通多边形背景
  const polygonPoints = nodeCoords.map((n) => `${n.x},${n.y}`).join(' ');

  let edgesSvg = '';
  // 外部环形网状闭包
  edgesSvg += `
    <polygon points="${polygonPoints}" fill="rgba(30, 41, 59, 0.4)" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4" />
  `;

  // 从中心核心辐射向 5 大领域的连线
  for (const node of nodeCoords) {
    const stroke = node.isActive ? node.color : '#334155';
    const strokeWidth = node.isActive ? (activeCategory === node.id ? 3 : 2) : 1;
    const opacity = node.isActive ? (activeCategory === node.id ? '1' : '0.7') : '0.25';

    edgesSvg += `
      <line x1="${centerX}" y1="${centerY}" x2="${node.x}" y2="${node.y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" />
    `;
  }

  // 2. 5 大卫星领域节点与子算法花瓣
  let nodesSvg = '';
  for (const node of nodeCoords) {
    const isSelected = activeCategory === node.id;
    const ringRadius = isSelected ? 42 : 36;
    const fillBg = isSelected ? '#1e293b' : '#0f172a';
    const borderCol = node.isActive ? node.color : '#475569';
    const borderW = isSelected ? 3 : 2;
    const glowFilter = isSelected ? `filter="url(#gs-glow-${node.id})"` : '';

    // 子算法附属小晶体 (向外辐射小圆点)
    let petalsSvg = '';
    const petalDistance = isSelected ? 52 : 46;
    node.algos.forEach((algo, aIdx) => {
      const spreadAngle = (node.angleDeg - 36 + aIdx * 24) * (Math.PI / 180);
      const px = node.x + petalDistance * Math.cos(spreadAngle);
      const py = node.y + petalDistance * Math.sin(spreadAngle);
      const pColor = node.isActive ? node.color : '#64748b';
      const pOpacity = isSelected ? '0.9' : '0.4';

      petalsSvg += `
        <line x1="${node.x}" y1="${node.y}" x2="${px}" y2="${py}" stroke="${pColor}" stroke-width="1" stroke-dasharray="2 2" opacity="${pOpacity}" />
        <circle cx="${px}" cy="${py}" r="${isSelected ? 4 : 3}" fill="${pColor}" opacity="${pOpacity}" />
        ${isSelected ? `<text x="${px}" y="${py > node.y ? py + 11 : py - 6}" fill="#f1f5f9" font-size="9" font-weight="600" text-anchor="middle" font-family="sans-serif">${algo}</text>` : ''}
      `;
    });

    nodesSvg += `
      <g class="gs-node" ${glowFilter}>
        ${petalsSvg}
        ${isSelected ? `<circle cx="${node.x}" cy="${node.y}" r="${ringRadius + 8}" fill="none" stroke="${node.color}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"><animateTransform attributeName="transform" type="rotate" from="0 ${node.x} ${node.y}" to="360 ${node.x} ${node.y}" dur="12s" repeatCount="indefinite" /></circle>` : ''}
        <circle cx="${node.x}" cy="${node.y}" r="${ringRadius}" fill="${fillBg}" stroke="${borderCol}" stroke-width="${borderW}" />
        <text x="${node.x}" y="${node.y - 4}" text-anchor="middle" font-size="${isSelected ? 20 : 17}" dominant-baseline="middle">${node.icon}</text>
        <text x="${node.x}" y="${node.y + 16}" text-anchor="middle" fill="${node.isActive ? '#f8fafc' : '#94a3b8'}" font-size="11" font-weight="700" font-family="sans-serif">${node.name}</text>
      </g>
    `;
  }

  // 3. 中心核心枢纽
  const coreHubSvg = `
    <g class="gs-core">
      <circle cx="${centerX}" cy="${centerY}" r="48" fill="#090d16" stroke="#3b82f6" stroke-width="2.5" opacity="0.95" />
      <circle cx="${centerX}" cy="${centerY}" r="54" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4 4" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 ${centerX} ${centerY}" to="360 ${centerX} ${centerY}" dur="20s" repeatCount="indefinite" />
      </circle>
      <text x="${centerX}" y="${centerY - 8}" text-anchor="middle" font-size="22" dominant-baseline="middle">🌐</text>
      <text x="${centerX}" y="${centerY + 14}" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="800" font-family="sans-serif">图论知识体系</text>
    </g>
  `;

  // 4. 发光滤镜滤镜定义
  const defsSvg = `
    <defs>
      ${categories.map((c) => `
        <filter id="gs-glow-${c.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      `).join('')}
    </defs>
  `;

  // Card 1 强制纯 SVG 渲染
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block; background:#020617;">
      ${defsSvg}
      ${edgesSvg}
      ${nodesSvg}
      ${coreHubSvg}
    </svg>
  `.trim();
}

export function renderGraphSummaryCustomMetrics(container: HTMLElement, step: GSStep): void {
  const { activeCategory, categories, detail } = step;
  const currentCat = categories.find((c) => c.id === activeCategory);

  const chips = currentCat
    ? currentCat.algos
        .map(
          (a) =>
            `<span style="padding:2px 8px; border-radius:4px; background:rgba(30,41,59,0.8); border:1px solid ${currentCat.color}; color:${currentCat.color}; font-size:11px; font-weight:700;">${a}</span>`
        )
        .join('')
    : categories
        .map(
          (c) =>
            `<span style="padding:2px 8px; border-radius:4px; background:rgba(30,41,59,0.8); border:1px solid #334155; color:#94a3b8; font-size:11px; font-weight:600;">${c.icon} ${c.name}</span>`
        )
        .join('');

  const detailHtml = detail
    ? `<div style="font-size:11.5px; color:#cbd5e1; line-height:1.5; padding-top:6px; border-top:1px dashed #334155;">${detail}</div>`
    : `<div style="font-size:11.5px; color:#94a3b8; line-height:1.5; padding-top:6px; border-top:1px dashed #334155;">${step.message}</div>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; padding:10px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; font-weight:800; color:#38bdf8;">当前支柱:</span>
          <span style="font-size:12px; font-weight:700; color:${currentCat ? currentCat.color : '#f8fafc'};">${currentCat ? `${currentCat.icon} ${currentCat.name} (${currentCat.enName})` : '全景图谱扫描'}</span>
        </div>
        <div style="font-size:11px; font-family:monospace; color:#34d399; font-weight:700;">
          ${currentCat ? currentCat.complexity : '5 大核心领域 · 18+ 经典算法'}
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${chips}
      </div>
      ${detailHtml}
    </div>
  `.trim();
}

export class GraphSummaryCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const sStep = step as GSStep;
    if (!sStep) return;
    renderGraphSummaryCanvas(container, sStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
