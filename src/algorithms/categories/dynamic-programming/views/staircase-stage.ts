import type { DpStaircaseStepInfo } from '../dp-demo-visualizer';

/**
 * 台阶物理阶梯与跳跃抛物线 SVG 渲染器 (Staircase Stage Renderer)
 * 为「爬楼梯」和「使用最小花费爬楼梯」提供自适应沉浸式台阶阶梯与起跳弧线动画
 */
export function renderStaircaseSVG(container: HTMLElement, info: DpStaircaseStepInfo): void {
  container.innerHTML = '';
  container.style.display = 'block';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.minHeight = '240px';

  const total = Math.max(1, info.totalSteps);
  const stepCount = total + 1;

  // 1. 动态自适应 ViewBox 与台阶尺寸计算
  const viewHeight = 310;
  const padLeft = 70;
  const padRight = 70;
  let stepWidth: number;
  let viewWidth: number;

  if (stepCount <= 4) {
    stepWidth = 150;
    viewWidth = Math.max(620, stepCount * stepWidth + padLeft + padRight);
  } else if (stepCount <= 7) {
    stepWidth = Math.max(100, Math.floor(780 / stepCount));
    viewWidth = stepCount * stepWidth + padLeft + padRight;
  } else {
    stepWidth = Math.max(72, Math.floor(940 / stepCount));
    viewWidth = stepCount * stepWidth + padLeft + padRight;
  }

  const usableWidth = viewWidth - padLeft - padRight;
  const actualStepWidth = Math.min(stepWidth, usableWidth / stepCount);
  const startX = padLeft + (usableWidth - actualStepWidth * stepCount) / 2;

  const groundY = 240;
  const topY = 65;
  const stepHeight = (groundY - topY) / Math.max(1, total);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'dp-staircase-svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.cssText = 'overflow: visible; display: block; width: 100%; height: 100%;';

  // 2. 定义渐变、光晕与箭头 Marker
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="stair-base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="stair-cur-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.5)" />
      <stop offset="100%" stop-color="rgba(37, 99, 235, 0.85)" />
    </linearGradient>
    <linearGradient id="stair-goal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(234, 179, 8, 0.45)" />
      <stop offset="100%" stop-color="rgba(245, 158, 11, 0.85)" />
    </linearGradient>
    <linearGradient id="ground-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(51, 65, 85, 0.6)" />
      <stop offset="100%" stop-color="rgba(15, 23, 42, 0.9)" />
    </linearGradient>
    <marker id="jump-arrow-best" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <polygon points="0 1, 8 4.5, 0 8" fill="#10b981" />
    </marker>
    <marker id="jump-arrow-alt" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <polygon points="0 1, 8 4.5, 0 8" fill="#f59e0b" />
    </marker>
    <filter id="stair-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  svg.appendChild(defs);

  // 3. 地面起点参考基底
  const groundFloor = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  groundFloor.setAttribute(
    'd',
    `M 10 ${groundY + 48} L ${viewWidth - 10} ${groundY + 48} L ${viewWidth - 10} ${groundY + 52} L 10 ${groundY + 52} Z`
  );
  groundFloor.setAttribute('fill', 'rgba(255, 255, 255, 0.08)');
  svg.appendChild(groundFloor);

  const stepCenters: Array<{ x: number; y: number; isTop: boolean }> = [];

  for (let s = 0; s <= total; s++) {
    const sx = startX + s * actualStepWidth;
    const sy = groundY - s * stepHeight;
    const isTop = s === total;
    stepCenters.push({ x: sx + actualStepWidth / 2, y: sy, isTop });

    const isCurrent = s === info.currentStep;
    const isFrom = info.fromSteps?.includes(s) ?? false;
    const isBest = s === info.bestFromStep;
    const isPast = s < (info.currentStep ?? -1);

    const stairG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    stairG.setAttribute('class', `dp-stair-step ${isCurrent ? 'is-current' : ''}`);

    let strokeColor = 'rgba(255, 255, 255, 0.16)';
    let fillColor = 'url(#stair-base-grad)';
    if (isTop) {
      strokeColor = '#eab308';
      fillColor = 'url(#stair-goal-grad)';
    } else if (isCurrent) {
      strokeColor = '#38bdf8';
      fillColor = 'url(#stair-cur-grad)';
    } else if (isBest) {
      strokeColor = '#10b981';
      fillColor = 'rgba(16, 185, 129, 0.3)';
    } else if (isFrom) {
      strokeColor = '#f59e0b';
      fillColor = 'rgba(245, 158, 11, 0.22)';
    } else if (isPast) {
      strokeColor = 'rgba(56, 189, 248, 0.35)';
    }

    // 顶踏板矩形
    const treadRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    treadRect.setAttribute('x', String(sx + 3));
    treadRect.setAttribute('y', String(sy));
    treadRect.setAttribute('width', String(actualStepWidth - 6));
    treadRect.setAttribute('height', '20');
    treadRect.setAttribute('rx', '5');
    treadRect.setAttribute('fill', fillColor);
    treadRect.setAttribute('stroke', strokeColor);
    treadRect.setAttribute('stroke-width', isCurrent || isTop ? '2.4' : '1.5');
    if (isCurrent) treadRect.setAttribute('filter', 'url(#stair-glow)');
    stairG.appendChild(treadRect);

    // 台阶下方支撑面
    const standPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${sx + 3} ${sy + 20} L ${sx + 3} ${groundY + 48} L ${sx + actualStepWidth - 3} ${groundY + 48} L ${sx + actualStepWidth - 3} ${sy + 20} Z`;
    standPath.setAttribute('d', d);
    standPath.setAttribute('fill', 'url(#ground-grad)');
    standPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.06)');
    stairG.appendChild(standPath);

    // 台阶编号与标签
    const stepLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    stepLabel.setAttribute('x', String(sx + actualStepWidth / 2));
    stepLabel.setAttribute('y', String(sy + 14));
    stepLabel.setAttribute('text-anchor', 'middle');
    stepLabel.setAttribute('font-size', '11.5');
    stepLabel.setAttribute('font-weight', '800');
    stepLabel.setAttribute('font-family', 'ui-monospace, monospace');
    stepLabel.setAttribute('fill', isCurrent ? '#f0f9ff' : isTop ? '#fef08a' : '#cbd5e1');
    stepLabel.textContent = isTop ? '🚩 楼顶平台' : `第 ${s} 阶`;
    stairG.appendChild(stepLabel);

    // 台阶固有花费 cost[s]
    if (info.costs && s < info.costs.length) {
      const costBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const costVal = info.costs[s];
      const cbY = sy + 32;

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(sx + actualStepWidth / 2 - 24));
      bg.setAttribute('y', String(cbY - 10));
      bg.setAttribute('width', '48');
      bg.setAttribute('height', '20');
      bg.setAttribute('rx', '5');
      bg.setAttribute('fill', 'rgba(15, 23, 42, 0.95)');
      bg.setAttribute('stroke', 'rgba(251, 191, 36, 0.45)');
      bg.setAttribute('stroke-width', '1.2');
      costBadge.appendChild(bg);

      const costTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      costTxt.setAttribute('x', String(sx + actualStepWidth / 2));
      costTxt.setAttribute('y', String(cbY + 4));
      costTxt.setAttribute('text-anchor', 'middle');
      costTxt.setAttribute('font-size', '10.5');
      costTxt.setAttribute('font-weight', '800');
      costTxt.setAttribute('fill', '#fde68a');
      costTxt.textContent = `⚡${costVal}`;
      costBadge.appendChild(costTxt);
      stairG.appendChild(costBadge);
    }

    // 悬浮 dp 状态值牌
    if (info.dp && s < info.dp.length && info.dp[s] !== null && info.dp[s] !== '-') {
      const dpVal = info.dp[s];
      const dpBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const hasCharOnStep = (info.characterPosition ?? -1) === s;
      const dpY = hasCharOnStep ? sy - 50 : sy - 18;

      const dpBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const bw = Math.max(54, String(dpVal).length * 9 + 28);
      dpBg.setAttribute('x', String(sx + actualStepWidth / 2 - bw / 2));
      dpBg.setAttribute('y', String(dpY - 13));
      dpBg.setAttribute('width', String(bw));
      dpBg.setAttribute('height', '22');
      dpBg.setAttribute('rx', '6');
      dpBg.setAttribute(
        'fill',
        isCurrent ? 'rgba(56, 189, 248, 0.35)' : isTop ? 'rgba(234, 179, 8, 0.35)' : 'rgba(16, 185, 129, 0.28)'
      );
      dpBg.setAttribute('stroke', isCurrent ? '#38bdf8' : isTop ? '#eab308' : '#10b981');
      dpBg.setAttribute('stroke-width', '1.4');
      if (isCurrent) dpBg.setAttribute('filter', 'url(#stair-glow)');
      dpBadge.appendChild(dpBg);

      const dpTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      dpTxt.setAttribute('x', String(sx + actualStepWidth / 2));
      dpTxt.setAttribute('y', String(dpY + 3));
      dpTxt.setAttribute('text-anchor', 'middle');
      dpTxt.setAttribute('font-size', '11');
      dpTxt.setAttribute('font-weight', '800');
      dpTxt.setAttribute('font-family', 'ui-monospace, monospace');
      dpTxt.setAttribute('fill', isCurrent ? '#bae6fd' : isTop ? '#fef08a' : '#a7f3d0');
      dpTxt.textContent = `dp=${dpVal}`;
      dpBadge.appendChild(dpTxt);
      stairG.appendChild(dpBadge);
    }

    svg.appendChild(stairG);
  }

  // 4. 绘制跳跃抛物线轨迹 (Jump Arcs)
  if (info.fromSteps && info.fromSteps.length > 0 && info.currentStep > 0) {
    const toCenter = stepCenters[info.currentStep];
    if (toCenter) {
      const hasMultipleFrom = info.fromSteps.length > 1;
      info.fromSteps.forEach((fromIdx) => {
        const fromCenter = stepCenters[fromIdx];
        if (!fromCenter) return;

        const isBest = fromIdx === info.bestFromStep;
        const jumpDistance = info.currentStep - fromIdx;
        const color = isBest ? '#10b981' : '#f59e0b';
        const markerId = isBest ? 'jump-arrow-best' : 'jump-arrow-alt';

        const landingOffsetX = hasMultipleFrom ? (jumpDistance === 1 ? -16 : 14) : 0;
        const targetX = toCenter.x + landingOffsetX;
        const targetY = toCenter.y - 6;

        const hasCharOnFrom = (info.characterPosition ?? -1) === fromIdx;
        const startXPos = fromCenter.x + (jumpDistance === 1 ? 10 : 6);
        const startYPos = fromCenter.y - (hasCharOnFrom ? 30 : 10);

        const midX = (startXPos + targetX) / 2;
        const higherY = Math.min(startYPos, targetY);
        const arcPeak = higherY - (jumpDistance >= 2 ? 70 : 40);

        const d = `M ${startXPos} ${startYPos} Q ${midX} ${arcPeak} ${targetX} ${targetY}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', isBest ? '3.5' : '2.2');
        path.setAttribute('stroke-dasharray', isBest ? 'none' : '5,4');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', `url(#${markerId})`);
        path.setAttribute('opacity', isBest ? '0.98' : '0.75');
        if (isBest) path.setAttribute('filter', 'url(#stair-glow)');
        svg.appendChild(path);

        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const txt = isBest ? `✓ 跨${jumpDistance}步 (最优)` : `跨${jumpDistance}步`;
        const tw = txt.length * 9 + 16;
        labelBg.setAttribute('x', String(midX - tw / 2));
        labelBg.setAttribute('y', String(arcPeak - 14));
        labelBg.setAttribute('width', String(tw));
        labelBg.setAttribute('height', '18');
        labelBg.setAttribute('rx', '4');
        labelBg.setAttribute('fill', 'rgba(15, 23, 42, 0.92)');
        labelBg.setAttribute('stroke', color);
        labelBg.setAttribute('stroke-width', isBest ? '1.5' : '1');
        svg.appendChild(labelBg);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', String(midX));
        label.setAttribute('y', String(arcPeak - 1));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10.5');
        label.setAttribute('font-weight', '800');
        label.setAttribute('fill', color);
        label.textContent = txt;
        svg.appendChild(label);
      });
    }
  }

  // 5. 绘制跳跃角色/起跑小人
  const charStep = info.characterPosition ?? -1;
  let charX = startX - 35;
  let charY = groundY;
  let isReadyState = false;

  if (charStep >= 0 && charStep < stepCenters.length) {
    const pos = stepCenters[charStep];
    charX = pos.x;
    charY = pos.y;
  } else {
    isReadyState = true;
  }

  const charG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  charG.setAttribute('class', 'dp-stair-character');
  charG.setAttribute('transform', `translate(${charX}, ${charY - 14})`);

  if (isReadyState) {
    charG.innerHTML = `
      <rect x="-24" y="-38" width="48" height="18" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#38bdf8" stroke-width="1" />
      <text x="0" y="-25" text-anchor="middle" font-size="10" font-weight="800" fill="#38bdf8">准备起跳</text>
      <circle cx="0" cy="-14" r="8" fill="#38bdf8" stroke="#ffffff" stroke-width="1.8" filter="url(#stair-glow)" />
      <circle cx="0" cy="-14" r="3" fill="#ffffff" />
      <path d="M 0 -6 L 0 6 M -6 -1 L 6 -1 M -5 14 L 0 6 L 5 14" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round" />
    `;
  } else {
    const isGoal = charStep === total;
    charG.innerHTML = `
      <circle cx="0" cy="-16" r="9" fill="${isGoal ? '#fbbf24' : '#38bdf8'}" stroke="#ffffff" stroke-width="2" filter="url(#stair-glow)" />
      <circle cx="0" cy="-16" r="3.5" fill="#ffffff" />
      <path d="M 0 -7 L 0 7 M -7 0 L 7 0 M -6 16 L 0 7 L 6 16" stroke="${isGoal ? '#fbbf24' : '#38bdf8'}" stroke-width="2.6" stroke-linecap="round" />
    `;
  }
  svg.appendChild(charG);

  container.appendChild(svg);
}
