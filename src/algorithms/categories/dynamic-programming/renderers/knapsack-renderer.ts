/**
 * Knapsack Physical Stage Renderer (机械背包与货舱装载物理实景渲染器)
 */

import { DpThematicMeta } from './types';
import { createStageSVG, createHUDBar } from './svg-helpers';
import {
  createKnapsackDefs,
  buildBagGroup,
  buildArmGroup,
  buildBeltGroup,
} from './knapsack-stage-components';

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
  svg.appendChild(createKnapsackDefs());

  // A. 左侧：3D 机械背包 / 货舱容器
  svg.appendChild(buildBagGroup(capacity, curCap, totalWt, totalVal, action));

  // B. 中间：机械臂 (Robotic Arm)
  svg.appendChild(buildArmGroup(action));

  // C. 右侧：传送带与待选物品晶体 (Conveyor Belt & Items)
  svg.appendChild(buildBeltGroup(items, curIdx, action));

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
