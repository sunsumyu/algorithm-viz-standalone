/**
 * Knapsack Physical Stage Renderer (机械背包与货舱装载物理实景渲染器)
 */

import { DpThematicMeta } from './types';
import { createStageSVG, createHUDBar } from './svg-helpers';

export function renderKnapsackStageSVG(container: HTMLElement, meta?: DpThematicMeta['knapsack']): void {
  container.innerHTML = '';
  if (!meta) return;

  const capacity = Math.max(1, meta.capacity || 10);
  const curCap = meta.currentCapacity ?? 0;
  const items = meta.items || [];
  const curIdx = meta.currentItemIndex ?? -1;
  const curItem = items[curIdx];
  const action = meta.action || 'idle';
  const totalVal = meta.totalValue ?? 0;
  const totalWt = meta.totalWeight ?? 0;

  const svg = createStageSVG('0 0 840 220');

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
  svg.appendChild(defs);

  // A. 左侧：3D 机械背包 / 货舱容器
  const bagX = 40;
  const bagY = 30;
  const bagW = 200;
  const bagH = 150;
  const fillHeight = Math.min(bagH - 20, ((totalWt || curCap) / capacity) * (bagH - 20));

  const bagG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  bagG.setAttribute('class', 'thematic-knapsack-body');

  // 背包外框
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

  // 背包内部填充能量液/物品层
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

  // 标尺刻度与标题
  const bagTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  bagTitle.setAttribute('x', String(bagX + bagW / 2));
  bagTitle.setAttribute('y', String(bagY + 22));
  bagTitle.setAttribute('text-anchor', 'middle');
  bagTitle.setAttribute('font-size', '12');
  bagTitle.setAttribute('font-weight', '800');
  bagTitle.setAttribute('fill', '#f1f5f9');
  bagTitle.textContent = `🎒 机械货舱 (最大容量: ${capacity})`;
  bagG.appendChild(bagTitle);

  // 仪表盘读数
  const meterText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  meterText.setAttribute('x', String(bagX + bagW / 2));
  meterText.setAttribute('y', String(bagY + bagH - 16));
  meterText.setAttribute('text-anchor', 'middle');
  meterText.setAttribute('font-size', '11.5');
  meterText.setAttribute('font-weight', '700');
  meterText.setAttribute('fill', totalWt > capacity ? '#f87171' : '#6ee7b7');
  meterText.textContent = `当前重量: ${totalWt || curCap}/${capacity} | 价值: ${totalVal}`;
  bagG.appendChild(meterText);

  svg.appendChild(bagG);

  // B. 中间：机械臂 (Robotic Arm)
  const armG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const armTargetX = action === 'include' ? 140 : 340;

  const armPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  armPath.setAttribute('d', `M 260 20 L 290 50 L ${armTargetX} 80`);
  armPath.setAttribute('stroke', 'url(#arm-metal)');
  armPath.setAttribute('stroke-width', '6');
  armPath.setAttribute('stroke-linecap', 'round');
  armPath.setAttribute('fill', 'none');
  armG.appendChild(armPath);

  // 机械爪
  const claw = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  claw.setAttribute('cx', String(armTargetX));
  claw.setAttribute('cy', '80');
  claw.setAttribute('r', '8');
  claw.setAttribute('fill', action === 'include' ? '#10b981' : action === 'exclude' ? '#f59e0b' : '#38bdf8');
  armG.appendChild(claw);

  svg.appendChild(armG);

  // C. 右侧：传送带与待选物品晶体 (Conveyor Belt & Items)
  const beltG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const beltX = 330;
  const beltY = 135;
  const beltW = 470;

  // 传送带基座
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
  beltLabel.textContent = `📦 物品传送带 (共 ${items.length} 件待装载物品)`;
  beltG.appendChild(beltLabel);

  // 传送带上的物品晶体块
  const itemGap = Math.min(80, (beltW - 20) / Math.max(1, items.length));
  items.forEach((item, i) => {
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

  svg.appendChild(beltG);

  // D. 底部操作 HUD 徽章
  const actionText = action === 'include'
    ? `✨ 机械臂装入决策：装入【${curItem?.name || '物品'}】(重${curItem?.weight}, 值${curItem?.value})，获得更高总价值！`
    : action === 'exclude'
    ? `⏭️ 机械臂跳过决策：容量不足或不装更优，跳过【${curItem?.name || '物品'}】。`
    : curItem
    ? `🔍 正在评估物品【${curItem.name}】：对比「装入 vs 不装入」两种子状态...`
    : '🎬 传送带准备就绪，点击播放开始装载推导。';

  const hudColor = action === 'include' ? '#6ee7b7' : action === 'exclude' ? '#fde047' : '#e2e8f0';
  createHUDBar(svg, actionText, hudColor);

  container.appendChild(svg);
}
