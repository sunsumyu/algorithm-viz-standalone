/**
 * Coin Change Physical Stage Renderer (街机投币机与透明储钱罐物理实景渲染器)
 */

import { DpThematicMeta } from './types';
import { createStageSVG } from './svg-helpers';

export function renderCoinChangeStageSVG(container: HTMLElement, meta?: DpThematicMeta['coin']): void {
  container.innerHTML = '';
  if (!meta) return;

  const target = Math.max(1, meta.targetAmount || 10);
  const curAmount = meta.currentAmount ?? 0;
  const coins = meta.coins || [1, 2, 5];
  const curCoin = meta.currentCoin;
  const usedCoins = meta.usedCoins || [];

  const svg = createStageSVG('0 0 840 220');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="jar-glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.15)" />
      <stop offset="100%" stop-color="rgba(14, 165, 233, 0.05)" />
    </linearGradient>
    <linearGradient id="gold-coin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <filter id="coin-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  svg.appendChild(defs);

  // A. 左侧：透明存钱罐 (Piggy Bank / Coin Tube)
  const jarX = 60;
  const jarY = 30;
  const jarW = 190;
  const jarH = 150;

  const jarG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const jarRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  jarRect.setAttribute('x', String(jarX));
  jarRect.setAttribute('y', String(jarY));
  jarRect.setAttribute('width', String(jarW));
  jarRect.setAttribute('height', String(jarH));
  jarRect.setAttribute('rx', '14');
  jarRect.setAttribute('fill', 'url(#jar-glass)');
  jarRect.setAttribute('stroke', '#38bdf8');
  jarRect.setAttribute('stroke-width', '2');
  jarG.appendChild(jarRect);

  const jarTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  jarTitle.setAttribute('x', String(jarX + jarW / 2));
  jarTitle.setAttribute('y', String(jarY + 22));
  jarTitle.setAttribute('text-anchor', 'middle');
  jarTitle.setAttribute('font-size', '12');
  jarTitle.setAttribute('font-weight', '800');
  jarTitle.setAttribute('fill', '#f1f5f9');
  jarTitle.textContent = `🪙 存钱罐 (目标金额: ¥${target})`;
  jarG.appendChild(jarTitle);

  // 罐内堆叠的硬币
  const maxStack = Math.min(10, usedCoins.length || 1);
  for (let c = 0; c < maxStack; c++) {
    const coinVal = usedCoins[c] || curCoin || 1;
    const cy = jarY + jarH - 18 - c * 13;
    const coinEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    coinEl.setAttribute('x', String(jarX + 35));
    coinEl.setAttribute('y', String(cy));
    coinEl.setAttribute('width', '120');
    coinEl.setAttribute('height', '10');
    coinEl.setAttribute('rx', '5');
    coinEl.setAttribute('fill', 'url(#gold-coin)');
    coinEl.setAttribute('stroke', '#a16207');
    coinEl.setAttribute('stroke-width', '1');
    jarG.appendChild(coinEl);

    const coinValText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    coinValText.setAttribute('x', String(jarX + jarW / 2));
    coinValText.setAttribute('y', String(cy + 8));
    coinValText.setAttribute('text-anchor', 'middle');
    coinValText.setAttribute('font-size', '8.5');
    coinValText.setAttribute('font-weight', '900');
    coinValText.setAttribute('fill', '#713f12');
    coinValText.textContent = `¥${coinVal}`;
    jarG.appendChild(coinValText);
  }

  svg.appendChild(jarG);

  // B. 右侧：投币机面额选择托盘 (Coin Selection Rack)
  const rackG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const rackX = 300;
  const rackY = 40;

  const rackTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  rackTitle.setAttribute('x', String(rackX));
  rackTitle.setAttribute('y', String(rackY));
  rackTitle.setAttribute('font-size', '12');
  rackTitle.setAttribute('font-weight', '800');
  rackTitle.setAttribute('fill', '#94a3b8');
  rackTitle.textContent = `🎰 可选硬币面额库 (Coins Available):`;
  rackG.appendChild(rackTitle);

  coins.forEach((c, idx) => {
    const cx = rackX + idx * 110;
    const cy = rackY + 20;
    const isCur = c === curCoin;

    const coinCircleG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const coinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    coinCircle.setAttribute('cx', String(cx + 40));
    coinCircle.setAttribute('cy', String(cy + 40));
    coinCircle.setAttribute('r', isCur ? '38' : '32');
    coinCircle.setAttribute('fill', isCur ? 'url(#gold-coin)' : 'rgba(30, 41, 59, 0.8)');
    coinCircle.setAttribute('stroke', isCur ? '#ca8a04' : 'rgba(255,255,255,0.15)');
    coinCircle.setAttribute('stroke-width', isCur ? '3' : '1.5');
    if (isCur) coinCircle.setAttribute('filter', 'url(#coin-glow)');
    coinCircleG.appendChild(coinCircle);

    const valTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valTxt.setAttribute('x', String(cx + 40));
    valTxt.setAttribute('y', String(cy + 45));
    valTxt.setAttribute('text-anchor', 'middle');
    valTxt.setAttribute('font-size', isCur ? '18' : '14');
    valTxt.setAttribute('font-weight', '900');
    valTxt.setAttribute('fill', isCur ? '#713f12' : '#f1f5f9');
    valTxt.textContent = `¥${c}`;
    coinCircleG.appendChild(valTxt);

    rackG.appendChild(coinCircleG);
  });

  // 进度指示
  const curTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  curTxt.setAttribute('x', String(rackX));
  curTxt.setAttribute('y', '155');
  curTxt.setAttribute('font-size', '12');
  curTxt.setAttribute('font-weight', '700');
  curTxt.setAttribute('fill', '#38bdf8');
  curTxt.textContent = `当前凑整进度: 金额 ¥${curAmount} | 所需最少硬币数: ${usedCoins.length || '计算中'}`;
  rackG.appendChild(curTxt);

  svg.appendChild(rackG);
  container.appendChild(svg);
}
