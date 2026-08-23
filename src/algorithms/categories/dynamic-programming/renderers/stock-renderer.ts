/**
 * Stock Trading Physical Stage Renderer (华尔街 K 线交易大师物理实景渲染器)
 */

import { DpThematicMeta } from './types';
import { createStageSVG } from './svg-helpers';

export function renderStockTradingStageSVG(container: HTMLElement, meta?: DpThematicMeta['stock']): void {
  container.innerHTML = '';
  if (!meta) return;

  const prices = meta.prices || [7, 1, 5, 3, 6, 4];
  const curDay = meta.curDay ?? 0;
  const action = meta.action || 'idle';
  const profit = meta.profit ?? 0;
  const holding = meta.holding ?? false;

  const svg = createStageSVG('0 0 840 220');

  const maxP = Math.max(...prices, 10);
  const minP = Math.min(...prices, 0);
  const stepX = Math.min(100, 520 / Math.max(1, prices.length - 1));
  const startX = 60;
  const groundY = 160;

  // 绘制价格折线
  let polyPath = '';
  const points: Array<[number, number]> = [];
  prices.forEach((p, i) => {
    const x = startX + i * stepX;
    const y = groundY - ((p - minP) / (maxP - minP || 1)) * 100;
    points.push([x, y]);
    polyPath += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  });

  const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  linePath.setAttribute('d', polyPath);
  linePath.setAttribute('fill', 'none');
  linePath.setAttribute('stroke', '#38bdf8');
  linePath.setAttribute('stroke-width', '3');
  svg.appendChild(linePath);

  // 价格节点与光标
  points.forEach(([x, y], i) => {
    const isCur = i === curDay;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', isCur ? '7' : '4');
    circle.setAttribute('fill', isCur ? (action === 'buy' ? '#10b981' : action === 'sell' ? '#ef4444' : '#38bdf8') : '#0f172a');
    circle.setAttribute('stroke', isCur ? '#f1f5f9' : '#38bdf8');
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);

    const pText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    pText.setAttribute('x', String(x));
    pText.setAttribute('y', String(y - 10));
    pText.setAttribute('text-anchor', 'middle');
    pText.setAttribute('font-size', '11');
    pText.setAttribute('font-weight', '700');
    pText.setAttribute('fill', '#cbd5e1');
    pText.textContent = `¥${prices[i]}`;
    svg.appendChild(pText);

    const dText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    dText.setAttribute('x', String(x));
    dText.setAttribute('y', String(groundY + 16));
    dText.setAttribute('text-anchor', 'middle');
    dText.setAttribute('font-size', '10');
    dText.setAttribute('fill', '#94a3b8');
    dText.textContent = `第${i}天`;
    svg.appendChild(dText);
  });

  // 右侧操盘看板
  const infoG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  infoG.innerHTML = `
    <text x="600" y="50" fill="#f1f5f9" font-size="14" font-weight="800">📊 股票操盘手·第 ${curDay} 天</text>
    <text x="600" y="80" fill="${holding ? '#34d399' : '#94a3b8'}" font-size="12" font-weight="700">
      持股状态: ${holding ? '🟢 持仓中 (In Stock)' : '⚪ 空仓观望 (Cash)'}
    </text>
    <text x="600" y="110" fill="#fde047" font-size="13" font-weight="900">
      💰 累计最大净利润: ¥${profit}
    </text>
    <text x="600" y="140" fill="#38bdf8" font-size="11">
      操作指令: ${action === 'buy' ? '🟢 买入建仓' : action === 'sell' ? '🔴 卖出清仓' : '⏳ 保持现状'}
    </text>
  `;
  svg.appendChild(infoG);

  container.appendChild(svg);
}
