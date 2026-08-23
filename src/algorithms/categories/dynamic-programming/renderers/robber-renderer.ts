/**
 * House Robber Physical Stage Renderer (街景神偷与防盗警报物理实景渲染器)
 */

import { DpThematicMeta } from './types';
import { createStageSVG } from './svg-helpers';

export function renderHouseRobberStageSVG(container: HTMLElement, meta?: DpThematicMeta['robber']): void {
  container.innerHTML = '';
  if (!meta) return;

  const houses = meta.houses || [
    { index: 0, val: 2 },
    { index: 1, val: 7 },
    { index: 2, val: 9 },
    { index: 3, val: 3 },
    { index: 4, val: 1 },
  ];
  const curH = meta.curHouse ?? 0;
  const robbed = meta.robbedHouses || [];
  const alarms = meta.alarmHouses || [];
  const decision = meta.decision || 'idle';
  const totalStolen = meta.totalStolen ?? 0;

  const svg = createStageSVG('0 0 840 220');

  const houseGap = Math.min(130, 760 / Math.max(1, houses.length));
  const startX = 40;
  const houseY = 60;

  houses.forEach((h, i) => {
    const x = startX + i * houseGap;
    const isCur = i === curH;
    const isRobbed = robbed.includes(i);
    const isAlarm = alarms.includes(i) || (isCur && decision === 'rob' && Math.abs(i - curH) === 1);

    const houseG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // 屋顶 (Triangle Roof)
    const roof = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    roof.setAttribute('points', `${x + 50},${houseY} ${x},${houseY + 30} ${x + 100},${houseY + 30}`);
    roof.setAttribute('fill', isRobbed ? '#10b981' : isAlarm ? '#ef4444' : '#334155');
    roof.setAttribute('stroke', isCur ? '#38bdf8' : 'rgba(255,255,255,0.15)');
    houseG.appendChild(roof);

    // 房屋主体
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    body.setAttribute('x', String(x + 10));
    body.setAttribute('y', String(houseY + 30));
    body.setAttribute('width', '80');
    body.setAttribute('height', '70');
    body.setAttribute('rx', '6');
    body.setAttribute('fill', isCur ? 'rgba(59, 130, 246, 0.25)' : 'rgba(15, 23, 42, 0.7)');
    body.setAttribute('stroke', isCur ? '#38bdf8' : 'rgba(255,255,255,0.1)');
    body.setAttribute('stroke-width', isCur ? '2' : '1');
    houseG.appendChild(body);

    // 金额窗户
    const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    valText.setAttribute('x', String(x + 50));
    valText.setAttribute('y', String(houseY + 65));
    valText.setAttribute('text-anchor', 'middle');
    valText.setAttribute('font-size', '14');
    valText.setAttribute('font-weight', '900');
    valText.setAttribute('fill', '#fde047');
    valText.textContent = `💰 ¥${h.val}`;
    houseG.appendChild(valText);

    // 门牌号
    const doorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    doorText.setAttribute('x', String(x + 50));
    doorText.setAttribute('y', String(houseY + 90));
    doorText.setAttribute('text-anchor', 'middle');
    doorText.setAttribute('font-size', '10.5');
    doorText.setAttribute('fill', '#94a3b8');
    doorText.textContent = `第 ${i} 间房`;
    houseG.appendChild(doorText);

    // 神偷站位
    if (isCur) {
      const thiefText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      thiefText.setAttribute('x', String(x + 50));
      thiefText.setAttribute('y', String(houseY - 10));
      thiefText.setAttribute('text-anchor', 'middle');
      thiefText.setAttribute('font-size', '20');
      thiefText.textContent = '🦹‍♂️';
      houseG.appendChild(thiefText);
    }

    svg.appendChild(houseG);
  });

  // 底部决策信息条
  const infoG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  infoG.innerHTML = `
    <rect x="40" y="175" width="760" height="30" rx="6" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.08)" />
    <text x="55" y="195" fill="#f1f5f9" font-size="12" font-weight="700">
      🦹‍♂️ 神偷当前决策：${decision === 'rob' ? '💎 偷窃当前房屋（触发相邻警报锁定）' : '⏭️ 跳过当前房屋（保留相邻偷窃机会）'} | 累计最高收益: ¥${totalStolen}
    </text>
  `;
  svg.appendChild(infoG);

  container.appendChild(svg);
}
