/**
 * 通用背包交互沙盘与载荷舱渲染器深模块 (KnapsackSandboxStage)
 * 深度设计原则：小接口 + 丰富内部视觉 (Small Interface, Deep Visual)
 * 
 * 职责：
 * 1. 统一渲染分组/单品货架池与多维度动态决策状态徽章
 * 2. 统一渲染 🎒 实时背包载荷舱 (容量占用进度条、已装入商品标签流、累计收益)
 * 3. 统一渲染 📊 滚动状态向量 dp[0..M] 实时监控矩阵
 */

import { KnapsackExecutionStep, KnapsackItem } from '../knapsack-execution-engine';

export interface KnapsackSandboxConfig {
  title?: string;
  groupLabelPrefix?: string;
  itemUnitLabel?: string;
  isPartitioned?: boolean;
}

/**
 * 渲染上层货架陈列与背包载荷舱
 */
export function renderKnapsackSandbox(
  container: HTMLElement,
  step: KnapsackExecutionStep,
  config: KnapsackSandboxConfig = {}
): void {
  const isPartitioned = config.isPartitioned ?? step.groupIndex >= 0;
  const selected = step.selectedItems || [];
  const usedCap = selected.reduce((sum, it) => sum + it.cost, 0);
  const totalVal = selected.reduce((sum, it) => sum + it.val, 0);
  const capMax = step.dp.length > 0 ? step.dp.length - 1 : 45;
  const ratio = Math.min(100, Math.round((usedCap / (capMax || 1)) * 100));

  let shelvesHtml = '';

  if (isPartitioned) {
    // 渲染互斥分组货架
    const groupMap: Record<number, KnapsackItem[]> = {};
    step.items.forEach((it) => {
      const g = it.group ?? 1;
      if (!groupMap[g]) groupMap[g] = [];
      groupMap[g].push(it);
    });

    shelvesHtml = Object.entries(groupMap)
      .map(([gIdStr, list]) => {
        const gId = parseInt(gIdStr, 10);
        const isCurGroup = step.groupIndex === gId;
        const bg = isCurGroup ? 'rgba(30, 27, 75, 0.7)' : 'rgba(15, 23, 42, 0.6)';
        const border = isCurGroup ? '#818cf8' : '#334155';

        const itemsBadges = list
          .map((it, idx) => renderItemCard(it, idx, step, selected))
          .join('');

        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:10px 12px; min-width:175px; flex:1; max-width:260px; box-sizing:border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:12px; font-weight:800; color:#c7d2fe;">第 ${gId} 组 (互斥)</span>
              ${isCurGroup ? '<span style="background:#f59e0b; color:#0f172a; font-size:9px; font-weight:800; padding:1px 5px; border-radius:10px;">正在决策</span>' : '<span style="color:#64748b; font-size:9.5px;">互斥至多选1</span>'}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${itemsBadges}
            </div>
          </div>
        `;
      })
      .join('');
  } else {
    // 渲染平铺物品货架 (01 背包 / 完全背包)
    const itemsBadges = step.items
      .map((it, idx) => renderItemCard(it, idx, step, selected))
      .join('');

    shelvesHtml = `
      <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; width:100%;">
        ${itemsBadges}
      </div>
    `;
  }

  // 背包已装入物品列表
  const selectedListHtml = selected.length > 0
    ? selected.map((it, idx) => `
        <div style="background:rgba(6, 95, 70, 0.4); border:1px solid #10b981; border-radius:4px; padding:3px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
          <span style="color:#a7f3d0; font-weight:700;">${it.group != null ? `第${it.group}组` : `#${idx + 1}`}</span>
          <span style="color:#cbd5e1;">消耗:${it.cost}</span>
          <span style="color:#34d399; font-weight:800;">收益:+${it.val}</span>
        </div>
      `).join('')
    : `<span style="color:#64748b; font-size:11px;">(背包目前空闲，等待决策装入商品...)</span>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#0b0f19; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <!-- 顶部标题与当前决策容量提示 -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:8px;">
        <div style="font-size:12px; color:#94a3b8; font-weight:700;">${config.title || '🗂️ 物品陈列与动态选择沙盘'}</div>
        <div style="font-size:11px; color:#e2e8f0; background:#1e293b; padding:2px 8px; border-radius:4px; border:1px solid #334155;">
          当前考察容量: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${capMax}
        </div>
      </div>

      <!-- 货架陈列 -->
      <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center; align-items:flex-start;">
        ${shelvesHtml}
      </div>

      <!-- 底部实时背包货舱装载监视器 -->
      <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#cbd5e1;">🎒 实时背包载荷舱</span>
          <div style="display:flex; gap:16px; font-size:11px;">
            <span>总占用容量: <b style="color:#38bdf8;">${usedCap}</b> / ${capMax}</span>
            <span>背包累计收益: <b style="color:#10b981;">${totalVal}</b></span>
          </div>
        </div>

        <!-- 容量进度条 -->
        <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
          <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #3b82f6, #10b981); transition:width 0.25s ease;"></div>
        </div>

        <!-- 已选装物品标签流 -->
        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
          <span style="color:#94a3b8; font-size:10.5px; min-width:60px;">已装入物品:</span>
          ${selectedListHtml}
        </div>
      </div>
    </div>
  `;
}

function renderItemCard(
  it: KnapsackItem,
  idx: number,
  step: KnapsackExecutionStep,
  selected: KnapsackItem[]
): string {
  const isSelected = selected.some(
    (s) => s.group === it.group && s.cost === it.cost && s.val === it.val
  );
  const isCurItem =
    step.itemIndex >= 0 &&
    step.items[step.itemIndex]?.group === it.group &&
    step.items[step.itemIndex]?.cost === it.cost &&
    step.items[step.itemIndex]?.val === it.val;

  let badgeHtml = '';
  let cardBg = '#1e293b';
  let cardBorder = '#475569';

  if (isSelected) {
    cardBg = 'rgba(6, 95, 70, 0.4)';
    cardBorder = '#10b981';
    badgeHtml = `<span style="background:#059669; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 已入选</span>`;
  } else if (isCurItem) {
    cardBg = 'rgba(30, 58, 138, 0.45)';
    cardBorder = '#3b82f6';
    if (step.evalInfo) {
      if (!step.evalInfo.fits) {
        badgeHtml = `<span style="background:#dc2626; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">❌ 超重无法装入</span>`;
      } else if (step.evalInfo.improved) {
        badgeHtml = `<span style="background:#16a34a; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✨ 收益更优 (+${it.val})</span>`;
      } else {
        badgeHtml = `<span style="background:#ca8a04; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">⏸ 试算无提升</span>`;
      }
    } else {
      badgeHtml = `<span style="background:#2563eb; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>`;
    }
  } else {
    badgeHtml = `<span style="color:#64748b; font-size:9.5px;">⚪ 候选待选</span>`;
  }

  return `
    <div style="background:${cardBg}; border:1.5px solid ${cardBorder}; border-radius:6px; padding:6px 10px; font-size:11px; display:flex; flex-direction:column; gap:3px; transition:all 0.2s ease;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <span style="color:#94a3b8; font-weight:700;">#${idx + 1}</span>
        ${badgeHtml}
      </div>
      <div style="display:flex; justify-content:space-between; gap:10px; margin-top:2px;">
        <span style="color:#cbd5e1;">消耗: <b style="color:#38bdf8;">${it.cost}</b></span>
        <span style="color:#cbd5e1;">价值: <b style="color:#10b981;">${it.val}</b></span>
        <span style="color:#94a3b8; font-size:9.5px;">v/c: ${(it.val / Math.max(1, it.cost)).toFixed(1)}</span>
      </div>
    </div>
  `;
}

/**
 * 渲染下层滚动收益向量 dp[0..M]
 */
export function renderKnapsackDpMatrix(
  container: HTMLElement,
  step: KnapsackExecutionStep,
  title: string = '滚动状态向量 dp[0..M]'
): void {
  const len = step.dp.length;
  const cells = step.dp.map((val, idx) => {
    const isCur = step.j === idx;
    const bg = isCur ? '#0284c7' : '#1e293b';
    const border = isCur ? '#38bdf8' : '#334155';
    const color = val > 0 ? '#10b981' : '#64748b';
    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; min-width:34px; padding:4px; margin:2px; background:${bg}; border:1px solid ${border}; border-radius:4px; transition:background 0.15s ease;">
        <span style="font-size:8.5px; color:#94a3b8;">${idx}</span>
        <span style="font-size:11px; font-weight:700; color:${color};">${val}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="width:100%; padding:4px 8px; box-sizing:border-box;">
      <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; font-weight:700;">${title} (${len} 状态)</div>
      <div style="display:flex; flex-wrap:wrap; max-height:110px; overflow-y:auto; gap:2px; background:#0b1329; padding:6px; border-radius:6px;">
        ${cells.join('')}
      </div>
    </div>
  `;
}
