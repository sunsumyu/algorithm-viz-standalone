/**
 * Math Cut Physical Stage Renderer (激光光剑能量棒物理切割实景渲染器)
 */

import { DpThematicMeta } from './types';
import { createStageSVG } from './svg-helpers';

export function renderMathCutStageSVG(container: HTMLElement, meta?: DpThematicMeta['mathCut']): void {
  container.innerHTML = '';
  if (!meta) return;

  const total = Math.max(2, meta.totalLength || 6);
  const cut = meta.cutPoint ?? 1;
  const prod = meta.product ?? 1;

  const svg = createStageSVG('0 0 840 220');

  const rodW = 460;
  const rodX = 60;
  const rodY = 80;
  const cutX = rodX + (cut / total) * rodW;

  // 能量棒段 1 (左侧)
  const leftW = (cut / total) * rodW;
  const rod1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rod1.setAttribute('x', String(rodX));
  rod1.setAttribute('y', String(rodY));
  rod1.setAttribute('width', String(Math.max(4, leftW - 4)));
  rod1.setAttribute('height', '32');
  rod1.setAttribute('rx', '8');
  rod1.setAttribute('fill', 'linear-gradient(135deg, #3b82f6, #60a5fa)');
  rod1.setAttribute('stroke', '#38bdf8');
  rod1.setAttribute('stroke-width', '2');
  svg.appendChild(rod1);

  // 能量棒段 2 (右侧)
  const rightW = rodW - leftW;
  const rod2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rod2.setAttribute('x', String(cutX + 4));
  rod2.setAttribute('y', String(rodY));
  rod2.setAttribute('width', String(Math.max(4, rightW - 4)));
  rod2.setAttribute('height', '32');
  rod2.setAttribute('rx', '8');
  rod2.setAttribute('fill', 'linear-gradient(135deg, #10b981, #34d399)');
  rod2.setAttribute('stroke', '#6ee7b7');
  rod2.setAttribute('stroke-width', '2');
  svg.appendChild(rod2);

  // 激光切割线
  const laser = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  laser.setAttribute('x1', String(cutX));
  laser.setAttribute('y1', String(rodY - 25));
  laser.setAttribute('x2', String(cutX));
  laser.setAttribute('y2', String(rodY + 55));
  laser.setAttribute('stroke', '#ef4444');
  laser.setAttribute('stroke-width', '3');
  laser.setAttribute('stroke-dasharray', '4 2');
  svg.appendChild(laser);

  // 刀光符号
  const sword = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sword.setAttribute('x', String(cutX - 10));
  sword.setAttribute('y', String(rodY - 30));
  sword.setAttribute('font-size', '18');
  sword.textContent = '⚔️';
  svg.appendChild(sword);

  // 右侧计算看板
  const infoG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  infoG.innerHTML = `
    <text x="560" y="60" fill="#f1f5f9" font-size="14" font-weight="800">🪵 能量棒总长: N = ${total}</text>
    <text x="560" y="90" fill="#38bdf8" font-size="12">第一段长度: j = ${cut}</text>
    <text x="560" y="115" fill="#34d399" font-size="12">第二段长度: i - j = ${total - cut}</text>
    <text x="560" y="145" fill="#fde047" font-size="14" font-weight="900">✨ 当前乘积计算: ${prod}</text>
  `;
  svg.appendChild(infoG);

  container.appendChild(svg);
}
