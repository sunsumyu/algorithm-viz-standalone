/**
 * Knapsack Stage SVG Subcomponents
 */

import { DpThematicMeta } from './types';

export function createKnapsackDefs(): SVGDefsElement {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="bag-hull-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="bag-fill-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(16, 185, 129, 0.85)" />
      <stop offset="100%" stop-color="rgba(5, 150, 105, 0.4)" />
    </linearGradient>
    <linearGradient id="arm-metal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#64748b" />
      <stop offset="50%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <filter id="knap-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  return defs;
}

export function buildBagGroup(
  capacity: number,
  curCap: number,
  totalWt: number,
  totalVal: number,
  action: string
): SVGGElement {
  const bagX = 40;
  const bagY = 30;
  const bagW = 200;
  const bagH = 150;
  const fillHeight = Math.min(bagH - 20, ((totalWt || curCap) / capacity) * (bagH - 20));

  const bagG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  bagG.setAttribute('class', 'thematic-knapsack-body');

  const bagHull = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bagHull.setAttribute('x', String(bagX));
  bagHull.setAttribute('y', String(bagY));
  bagHull.setAttribute('width', String(bagW));
  bagHull.setAttribute('height', String(bagH));
  bagHull.setAttribute('rx', '12');
  bagHull.setAttribute('fill', 'url(#bag-hull-grad)');
  bagHull.setAttribute('stroke', action === 'include' ? '#10b981' : '#38bdf8');
  bagHull.setAttribute('stroke-width', action === 'include' ? '2.5' : '1.5');
  if (action === 'include') bagHull.setAttribute('filter', 'url(#knap-glow)');
  bagG.appendChild(bagHull);

  if (fillHeight > 0) {
    const fillRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    fillRect.setAttribute('x', String(bagX + 8));
    fillRect.setAttribute('y', String(bagY + bagH - 8 - fillHeight));
    fillRect.setAttribute('width', String(bagW - 16));
    fillRect.setAttribute('height', String(fillHeight));
    fillRect.setAttribute('rx', '6');
    fillRect.setAttribute('fill', 'url(#bag-fill-grad)');
    fillRect.setAttribute('stroke', '#34d399');
    fillRect.setAttribute('stroke-width', '1');
    bagG.appendChild(fillRect);
  }

  const bagTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  bagTitle.setAttribute('x', String(bagX + bagW / 2));
  bagTitle.setAttribute('y', String(bagY + 22));
  bagTitle.setAttribute('text-anchor', 'middle');
  bagTitle.setAttribute('font-size', '12');
  bagTitle.setAttribute('font-weight', '800');
  bagTitle.setAttribute('fill', '#f1f5f9');
  bagTitle.textContent = `🎒 机械货舱 (最大容量: ${capacity})`;
  bagG.appendChild(bagTitle);

  const meterText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  meterText.setAttribute('x', String(bagX + bagW / 2));
  meterText.setAttribute('y', String(bagY + bagH - 16));
  meterText.setAttribute('text-anchor', 'middle');
  meterText.setAttribute('font-size', '11.5');
  meterText.setAttribute('font-weight', '700');
  meterText.setAttribute('fill', totalWt > capacity ? '#f87171' : '#6ee7b7');
  meterText.textContent = `当前重量: ${totalWt || curCap}/${capacity} | 价值: ${totalVal}`;
  bagG.appendChild(meterText);

  return bagG;
}

export function buildArmGroup(action: string): SVGGElement {
  const armG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const armTargetX = action === 'include' ? 140 : 340;

  const armPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  armPath.setAttribute('d', `M 260 20 L 290 50 L ${armTargetX} 80`);
  armPath.setAttribute('stroke', 'url(#arm-metal)');
  armPath.setAttribute('stroke-width', '6');
  armPath.setAttribute('stroke-linecap', 'round');
  armPath.setAttribute('fill', 'none');
  armG.appendChild(armPath);

  const claw = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  claw.setAttribute('cx', String(armTargetX));
  claw.setAttribute('cy', '80');
  claw.setAttribute('r', '8');
  claw.setAttribute('fill', action === 'include' ? '#10b981' : action === 'exclude' ? '#f59e0b' : '#38bdf8');
  armG.appendChild(claw);

  return armG;
}

export function buildBeltGroup(
  items: NonNullable<DpThematicMeta['knapsack']>['items'],
  curIdx: number,
  action: string
): SVGGElement {
  const safeItems = items ?? [];
  const beltG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const beltX = 330;
  const beltY = 135;
  const beltW = 470;

  const beltRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  beltRect.setAttribute('x', String(beltX));
  beltRect.setAttribute('y', String(beltY));
  beltRect.setAttribute('width', String(beltW));
  beltRect.setAttribute('height', '18');
  beltRect.setAttribute('rx', '9');
  beltRect.setAttribute('fill', '#0f172a');
  beltRect.setAttribute('stroke', '#334155');
  beltRect.setAttribute('stroke-width', '1.5');
  beltG.appendChild(beltRect);

  const beltLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  beltLabel.setAttribute('x', String(beltX + 10));
  beltLabel.setAttribute('y', String(beltY - 6));
  beltLabel.setAttribute('font-size', '11');
  beltLabel.setAttribute('font-weight', '700');
  beltLabel.setAttribute('fill', '#94a3b8');
  beltLabel.textContent = `📦 物品传送带 (共 ${safeItems.length} 件待装载物品)`;
  beltG.appendChild(beltLabel);

  const itemGap = Math.min(80, (beltW - 20) / Math.max(1, safeItems.length));
  safeItems.forEach((item, i) => {
    const ix = beltX + 15 + i * itemGap;
    const isCurrent = i === curIdx;
    const iy = isCurrent && action === 'include' ? 70 : isCurrent && action === 'evaluate' ? 85 : 95;

    const itemCard = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    itemCard.setAttribute('class', `thematic-item-card ${isCurrent ? 'is-selected' : ''}`);

    const cardRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    cardRect.setAttribute('x', String(ix));
    cardRect.setAttribute('y', String(iy));
    cardRect.setAttribute('width', '68');
    cardRect.setAttribute('height', '36');
    cardRect.setAttribute('rx', '7');
    cardRect.setAttribute('fill', isCurrent ? 'rgba(59, 130, 246, 0.35)' : 'rgba(15, 23, 42, 0.7)');
    cardRect.setAttribute('stroke', isCurrent ? (action === 'include' ? '#10b981' : '#60a5fa') : 'rgba(255,255,255,0.12)');
    cardRect.setAttribute('stroke-width', isCurrent ? '2' : '1');
    if (isCurrent) cardRect.setAttribute('filter', 'url(#knap-glow)');
    itemCard.appendChild(cardRect);

    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', String(ix + 34));
    nameText.setAttribute('y', String(iy + 14));
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('font-size', '10.5');
    nameText.setAttribute('font-weight', '800');
    nameText.setAttribute('fill', isCurrent ? '#93c5fd' : '#cbd5e1');
    nameText.textContent = item.name || `物品${i + 1}`;
    itemCard.appendChild(nameText);

    const detailText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    detailText.setAttribute('x', String(ix + 34));
    detailText.setAttribute('y', String(iy + 28));
    detailText.setAttribute('text-anchor', 'middle');
    detailText.setAttribute('font-size', '9.5');
    detailText.setAttribute('font-family', 'ui-monospace, monospace');
    detailText.setAttribute('fill', isCurrent ? '#34d399' : '#94a3b8');
    detailText.textContent = `w:${item.weight} v:${item.value}`;
    itemCard.appendChild(detailText);

    beltG.appendChild(itemCard);
  });

  return beltG;
}
