/**
 * 分组背包物理沙盘领域适配器 (PartitionedKnapsackSandboxAdapter) — 职责单一深模块
 *
 * 核心设计契约：
 * 1. 实体分组物品桶 (Grouped Buckets):
 *    - 清晰展示各组物品桶 (桶 1, 桶 2, ...) 及其内部包含的候选物品三元组 [体积, 价值, 组号]
 *    - 实时呈现组内互斥规则 (Mutual Exclusion): 试选某件物品时，同桶其余物品显示互斥锁止遮罩
 *    - 智能识别试选物品 (Active Trialing)、超重物品 (Overweight) 与已装入物品 (Selected)
 * 2. 真实物理背包容器 (The Real Knapsack Bag):
 *    - 呈现拟物背包舱体与物理容积水位表 (已用体积、剩余容量、总价值)
 *    - 展示当前已装入背包的实际物品清单
 *    - 呈现试装入对比决策看板 (原价值 vs 选入新物品候选价值)
 */

import { escapeHtml } from '../../code-highlighter';
import { AlgorithmModelRepository } from '../../model-repository';
import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export interface SandboxItem {
  id: number;
  cost: number;
  val: number;
  group: number;
}

export class PartitionedKnapsackSandboxAdapter {
  /**
   * 解析物品与组别数据
   */
  public static parseItemsAndGroups(
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): { items: SandboxItem[]; groups: Map<number, SandboxItem[]>; capacity: number } {
    let rawItems: any[] = [];
    let capacity = Number(options.params?.m || (step as any).capacity || (step.variables as any)?.m || 45);

    if (Array.isArray(step.arr) && step.arr.length > 1) {
      rawItems = step.arr.slice(1);
    } else if (Array.isArray(step.items) && step.items.length > 0) {
      rawItems = step.items;
    } else if (options.modelId && AlgorithmModelRepository.hasModel(options.modelId)) {
      const model = AlgorithmModelRepository.getModel(options.modelId);
      const params = (model.defaultParams as any) || {};
      rawItems = params.items || [];
      capacity = Number(params.m || capacity);
    }

    const items: SandboxItem[] = [];
    rawItems.forEach((it: any, idx: number) => {
      if (Array.isArray(it) && it.length >= 3) {
        items.push({ id: idx + 1, cost: Number(it[0]), val: Number(it[1]), group: Number(it[2]) });
      } else if (it && typeof it === 'object') {
        items.push({
          id: idx + 1,
          cost: Number(it.cost ?? it.weight ?? 0),
          val: Number(it.val ?? it.value ?? 0),
          group: Number(it.group ?? 1),
        });
      }
    });

    if (items.length === 0) {
      items.push(
        { id: 1, cost: 10, val: 10, group: 1 },
        { id: 2, cost: 10, val: 20, group: 1 },
        { id: 3, cost: 20, val: 20, group: 2 }
      );
    }

    const groups = new Map<number, SandboxItem[]>();
    for (const item of items) {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group)!.push(item);
    }

    return { items, groups, capacity };
  }

  /**
   * 从当前 DP 状态表或变量回溯出当前背包内已选择的物品列表
   */
  public static backtrackBagItems(
    curG: number,
    curJ: number,
    groups: Map<number, SandboxItem[]>,
    grid?: (number | null)[][]
  ): SandboxItem[] {
    const chosen: SandboxItem[] = [];
    if (!grid || !Array.isArray(grid) || grid.length <= 1) return chosen;

    let remJ = curJ;
    for (let g = curG; g >= 1; g--) {
      const groupItems = groups.get(g) || [];
      const curCell = grid[g]?.[remJ] ?? 0;
      const prevCell = grid[g - 1]?.[remJ] ?? 0;

      // 如果当前行值与上一行相同，说明本组未选任何物品
      if (curCell === prevCell) {
        continue;
      }

      // 在当前组寻找是哪件物品转移过来的
      let found = false;
      for (const it of groupItems) {
        if (remJ >= it.cost) {
          const fromVal = grid[g - 1]?.[remJ - it.cost] ?? 0;
          if (curCell === fromVal + it.val) {
            chosen.unshift(it);
            remJ -= it.cost;
            found = true;
            break;
          }
        }
      }
      if (!found && groupItems.length > 0) {
        // 容错降级
      }
    }
    return chosen;
  }

  /**
   * 渲染完整拟物化沙盘：真实分组物品桶 (Buckets) + 物理背包容器 (Knapsack)
   */
  public static render(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    if (!container) return;

    container.className = 'knapsack-buckets-sandbox-container';
    container.style.cssText =
      'width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; z-index: 0; background: transparent; border: 0; padding: 0; overflow-y: auto; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif;';

    const { items, groups, capacity } = this.parseItemsAndGroups(step, options);

    const curG = typeof step.i === 'number' ? step.i : 1;
    const curJ = typeof step.j === 'number' ? step.j : capacity;
    const curK = typeof step.k === 'number' ? step.k : (step.variables?.k ? Number(step.variables.k) : undefined);

    const sortedGroupKeys = Array.from(groups.keys()).sort((a, b) => a - b);

    // 寻找当前正在试选的物品
    const trialingItem = curK !== undefined ? items.find((it) => it.id === curK) : undefined;
    const isTrialStep = (step.type === 'loop-items' || step.type === 'check-fit' || step.type === 'transition') && trialingItem !== undefined;
    const canTrialFit = isTrialStep && curJ >= (trialingItem?.cost || 0);

    // 回溯当前状态已装入背包的物品 (若正在试选候选物品且能容纳，前置组在剩余容量 curJ - cost 下回溯)
    const backtrackCap = (canTrialFit && trialingItem) ? Math.max(0, curJ - trialingItem.cost) : curJ;
    const bagItems = this.backtrackBagItems(
      Math.max(0, curG - 1),
      backtrackCap,
      groups,
      step.grid
    );

    const prevCost = bagItems.reduce((acc, it) => acc + it.cost, 0);
    const prevBagVal = bagItems.reduce((acc, it) => acc + it.val, 0);
    const usedCost = prevCost + (canTrialFit && trialingItem ? trialingItem.cost : 0);
    const totalVal = prevBagVal + (canTrialFit && trialingItem ? trialingItem.val : 0);
    const fillPercent = curJ > 0 ? Math.min(100, Math.round((usedCost / curJ) * 100)) : 0;

    // 候选比较值
    const candidateVal = step.variables?.candidate !== undefined ? Number(step.variables.candidate) : undefined;
    const prevVal = step.variables?.['dp[j]'] !== undefined ? Number(step.variables['dp[j]']) : (step.variables?.dp !== undefined ? Number(step.variables.dp) : totalVal);

    const comparisonText =
      trialingItem && candidateVal !== undefined
        ? `试选桶 #${trialingItem.group} 物品 #${trialingItem.id}: 试选后总价值 <strong>${candidateVal}</strong> vs 当前最优 <strong>${prevVal}</strong> ➔ ${
            candidateVal > prevVal
              ? '<span style="color: #15803d; font-weight: 700;">✅ 价值更高，装入背包更新最优！</span>'
              : '<span style="color: #64748b; font-weight: 700;">保持当前最优</span>'
          }`
        : escapeHtml(step.decision || step.msg || step.log || '当前步状态流转稳定');

    container.innerHTML = `
      <div style="width: 100%; display: flex; flex-direction: column; gap: 10px; padding: 10px; box-sizing: border-box; user-select: none; color: #1e293b;">
        <!-- 顶部提示横条 -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: linear-gradient(to right, rgba(245, 158, 11, 0.08), rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.08)); border: 1px solid rgba(245, 158, 11, 0.25); font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🗂️</span>
            <span style="font-weight: 700; color: #b45309;">分组背包物理决策沙盘</span>
            <span style="color: #cbd5e1;">|</span>
            <span style="color: #475569;">组内互斥铁律：<strong style="color: #e11d48;">每个桶至多挑选 1 件物品</strong> 放入背包，或 1 件都不选！</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 11px;">
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: #b45309; font-weight: 700;">当前组: 桶 #${curG}</span>
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.15); color: #1d4ed8; font-weight: 700;">目标容量: ${curJ} / ${capacity}</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左: 各组物品桶，右: 实体背包) -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; align-items: start;">
          
          <!-- 左侧：多组实体存放物品的桶 (7 列) -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #334155;">
              <span style="display: flex; align-items: gap: 6px;">
                <i class="fa-solid fa-boxes-stacked" style="color: #d97706; margin-right: 4px;"></i> 分组存放物品的桶 (Buckets · 互斥候选池)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #64748b;">共 ${sortedGroupKeys.length} 个独立物品组</span>
            </div>

            <!-- 桶列表容器 -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${sortedGroupKeys.map((gNum) => {
                const groupItems = groups.get(gNum) || [];
                const isCurrentGroup = gNum === curG;
                const isPastGroup = gNum < curG;

                // 检查本桶中是否有物品已被装入背包
                const selectedInBucket = bagItems.find((it) => it.group === gNum);

                let bucketBorder = '#e2e8f0';
                let bucketBg = '#ffffff';
                let bucketBadgeBg = '#f1f5f9';
                let bucketBadgeColor = '#64748b';
                let bucketStatus = '待决策 ⏳';
                let bucketExtraStyle = '';

                if (isCurrentGroup) {
                  bucketBorder = '#f59e0b';
                  bucketBg = '#fffbeb';
                  bucketBadgeBg = '#f59e0b';
                  bucketBadgeColor = '#ffffff';
                  bucketStatus = '当前决策组 ⚡';
                  bucketExtraStyle = 'box-shadow: 0 4px 6px -1px rgba(245,158,11,0.15); border: 2px solid #f59e0b;';
                } else if (isPastGroup) {
                  bucketBorder = '#86efac';
                  bucketBg = '#f0fdf4';
                  bucketBadgeBg = '#dcfce7';
                  bucketBadgeColor = '#15803d';
                  bucketStatus = selectedInBucket ? `已选物品 #${selectedInBucket.id} ✅` : '本组未选 ⏭️';
                }

                return `
                  <div style="position: relative; padding: 10px 12px; border-radius: 12px; border: 1px solid ${bucketBorder}; background: ${bucketBg}; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s ease; ${bucketExtraStyle}">
                    <!-- 桶顶盖拟物横条 -->
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 14px;">🪣</span>
                        <span style="font-weight: 800; font-size: 12px; color: #1e293b;">桶 #${gNum} (组 ${gNum})</span>
                      </div>
                      <span style="font-size: 10px; font-family: monospace; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${bucketBadgeBg}; color: ${bucketBadgeColor};">${bucketStatus}</span>
                    </div>

                    <!-- 桶内物品卡片列表 -->
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                      ${groupItems.map((item) => {
                        const isTrialing = isCurrentGroup && curK === item.id;
                        const isOverweight = item.cost > curJ;
                        const isSelected = selectedInBucket?.id === item.id;
                        const isExcludedByMutual = isCurrentGroup && curK !== undefined && curK !== item.id;

                        let itemBorder = '#e2e8f0';
                        let itemBg = '#f8fafc';
                        let glowTag = '';
                        let extraItemStyle = '';

                        if (isTrialing) {
                          itemBorder = '#f59e0b';
                          itemBg = '#fffbeb';
                          extraItemStyle = 'box-shadow: 0 2px 4px rgba(245,158,11,0.2); transform: scale(1.02); z-index: 10; border: 1.5px solid #f59e0b;';
                          glowTag = '<span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #f59e0b; color: #ffffff; white-space: nowrap;">试装入中 ↓</span>';
                        } else if (isSelected) {
                          itemBorder = '#10b981';
                          itemBg = '#ecfdf5';
                          glowTag = '<span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #059669; color: #ffffff; white-space: nowrap;">已装入背包 ✅</span>';
                        } else if (isOverweight && isCurrentGroup) {
                          itemBorder = '#fecdd3';
                          itemBg = '#fff1f2';
                          extraItemStyle = 'opacity: 0.75;';
                          glowTag = '<span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #ffe4e6; color: #be123c; white-space: nowrap;">超重放不下 ❌</span>';
                        } else if (isExcludedByMutual) {
                          itemBorder = '#e2e8f0';
                          itemBg = '#f1f5f9';
                          extraItemStyle = 'opacity: 0.6;';
                          glowTag = '<span style="font-size: 9px; font-family: monospace; color: #64748b; white-space: nowrap;">🔒 组内互斥锁止</span>';
                        }

                        return `
                          <div style="position: relative; padding: 6px 8px; border-radius: 6px; border: 1px solid ${itemBorder}; background: ${itemBg}; display: flex; align-items: center; justify-content: space-between; gap: 6px; transition: all 0.2s ease; ${extraItemStyle}">
                            <div style="display: flex; align-items: center; gap: 6px;">
                              <span style="font-size: 11px; font-family: monospace; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: #e2e8f0; color: #1e293b;">#${item.id}</span>
                              <div style="display: flex; flex-direction: column;">
                                <span style="font-size: 11px; font-weight: 700; color: #334155;">物品 #${item.id}</span>
                                <span style="font-size: 9px; color: #64748b;">组内候选 item</span>
                              </div>
                            </div>

                            <div style="display: flex; align-items: center; gap: 6px;">
                              <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 10px; font-family: monospace;">
                                <span style="color: #0284c7; font-weight: 700;">📦 耗容量: ${item.cost}</span>
                                <span style="color: #d97706; font-weight: 700;">💎 得价值: +${item.val}</span>
                              </div>
                              ${glowTag}
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 右侧：真实物理背包容器 (5 列) -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #334155;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-bag-shopping" style="color: #2563eb; margin-right: 4px;"></i> 实体物理背包 (Knapsack Container)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #0284c7; font-weight: 800;">容量刻度: ${curJ} / ${capacity}</span>
            </div>

            <!-- 背包舱体卡片 -->
            <div style="position: relative; padding: 12px 14px; border-radius: 16px; border: 2px solid #cbd5e1; background: linear-gradient(to bottom, #f8fafc, #f1f5f9); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 10px;">
              <!-- 背包顶部皮带与提把造型 -->
              <div style="width: 64px; height: 8px; margin: 0 auto; border-radius: 9999px; background: #94a3b8; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);"></div>

              <!-- 水位指示仪表 -->
              <div style="padding: 10px; border-radius: 10px; background: #ffffff; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                  <span style="font-weight: 700; color: #475569;">背包体积填充进度</span>
                  <span style="font-family: monospace; font-weight: 800; color: ${fillPercent >= 100 ? '#e11d48' : '#2563eb'};">${fillPercent}% (${usedCost} / ${curJ})</span>
                </div>
                <div style="width: 100%; background: #e2e8f0; height: 10px; border-radius: 9999px; overflow: hidden; padding: 1px;">
                  <div style="height: 100%; border-radius: 9999px; background: linear-gradient(to right, #3b82f6, #6366f1); transition: width 0.3s ease; width: ${fillPercent}%;"></div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding-top: 4px; text-align: center;">
                  <div style="padding: 4px; border-radius: 4px; background: #f1f5f9;">
                    <div style="font-size: 9px; color: #64748b;">已占体积</div>
                    <div style="font-size: 12px; font-family: monospace; font-weight: 700; color: #1e293b;">${usedCost}</div>
                  </div>
                  <div style="padding: 4px; border-radius: 4px; background: #f1f5f9;">
                    <div style="font-size: 9px; color: #64748b;">剩余容积</div>
                    <div style="font-size: 12px; font-family: monospace; font-weight: 700; color: ${curJ >= usedCost ? '#16a34a' : '#dc2626'};">${curJ - usedCost}</div>
                  </div>
                  <div style="padding: 4px; border-radius: 4px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2);">
                    <div style="font-size: 9px; color: #d97706; font-weight: 700;">累计总收益</div>
                    <div style="font-size: 13px; font-family: monospace; font-weight: 900; color: #d97706;">${totalVal}</div>
                  </div>
                </div>
              </div>

              <!-- 背包内部装入清单 -->
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 12px; font-weight: 700; color: #334155; display: flex; align-items: center; justify-content: space-between;">
                  <span>🎒 包内当前物品陈列:</span>
                  <span style="font-size: 10px; font-family: monospace; color: #64748b;">${bagItems.length} 件物品</span>
                </div>

                <div style="min-height: 80px; padding: 8px; border-radius: 10px; background: #ffffff; border: 1px dashed #cbd5e1; display: flex; flex-direction: column; gap: 6px;">
                  ${bagItems.length === 0
                    ? '<div style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 60px; font-size: 12px; color: #94a3b8; font-style: italic;">背包当前为空 (尚未装入任何物品)</div>'
                    : bagItems.map((it) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-radius: 6px; background: #f0fdf4; border: 1px solid #bbf7d0; font-size: 11px;">
                          <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; color: #166534;">
                            <span>🪣 桶 #${it.group}</span>
                            <span style="color: #cbd5e1;">·</span>
                            <span>物品 #${it.id}</span>
                          </div>
                          <div style="font-family: monospace; font-size: 11px; display: flex; align-items: center; gap: 6px;">
                            <span style="color: #0369a1;">体积: ${it.cost}</span>
                            <span style="color: #15803d; font-weight: 700;">价值: +${it.val}</span>
                          </div>
                        </div>
                      `).join('')}

                  <!-- 若当前有试选物品，显示试装入虚线预览卡 -->
                  ${trialingItem ? `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-radius: 6px; border: 1.5px dashed #f59e0b; background: #fffbeb; font-size: 11px;">
                      <div style="display: flex; align-items: center; gap: 4px; font-weight: 700; color: #b45309;">
                        <span>⚡ 试选放入: 桶 #${trialingItem.group} · 物品 #${trialingItem.id}</span>
                      </div>
                      <div style="font-family: monospace; font-size: 11px; display: flex; align-items: center; gap: 6px;">
                        <span style="color: #0284c7;">体积: ${trialingItem.cost}</span>
                        <span style="color: #d97706; font-weight: 700;">价值: +${trialingItem.val}</span>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- 决策比较看板 -->
              <div style="padding: 10px; border-radius: 10px; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 11.5px; display: flex; flex-direction: column; gap: 4px;">
                <div style="font-weight: 700; color: #1d4ed8; display: flex; align-items: center; gap: 4px;">
                  <i class="fa-solid fa-scale-balanced" style="color: #d97706; margin-right: 4px;"></i>
                  <span>转移决策比较看板</span>
                </div>
                <div style="font-size: 11px; color: #334155; line-height: 1.4;">
                  ${comparisonText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
