/**
 * 完全背包 (疯狂的采药) 拟物沙盘适配器 (UnboundedKnapsackSandboxAdapter)
 * 遵循单一职责与深模块原则：
 *
 * 核心设计契约：
 * 1. 无限草药采摘池 (Infinite Herb Pool · 7 列):
 *    - 陈列每种草药样本 (耗时/体积 W, 价值/药效 V)
 *    - 标注“无限采摘 (Infinite Quantity ∞)”特有属性
 *    - 实时高亮当前考察草药、可采摘倍数与耗时不足预警
 * 2. 真实自叠加背包容器 (Cumulative Knapsack Container · 5 列):
 *    - 拟物背包舱体与时间/容量水位表 (已用时间、剩余时间、累计药效)
 *    - 精准回溯 (Backtracking)：统计当前 dp[i][j] 状态下各草药被选株数 (如 草药 #0 × 4 株)
 *    - 完全背包同行自叠加 vs 01 背包同行比较看板 (dp[i][j-w]+v vs dp[i-1][j])
 */

import { escapeHtml } from '../../code-highlighter';
import { AlgorithmModelRepository } from '../../model-repository';
import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export interface HerbItem {
  id: number;
  weight: number;
  value: number;
  name: string;
}

export interface HerbInventoryItem {
  id: number;
  weight: number;
  value: number;
  count: number;
  totalWeight: number;
  totalValue: number;
}

export class UnboundedKnapsackSandboxAdapter {
  /**
   * 解析完全背包的物品列表与容量限制
   */
  public static parseHerbsAndCapacity(
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): { items: HerbItem[]; capacity: number } {
    let rawWeights: any[] = [];
    let rawValues: any[] = [];
    let capacity = Number(options.params?.bagWeight ?? options.params?.capacity ?? options.params?.t ?? 4);

    if (Array.isArray(step.items) && step.items.length > 0) {
      rawWeights = step.items.map((it: any) => Number(it.weight ?? it.cost ?? 0));
      rawValues = step.items.map((it: any) => Number(it.value ?? it.val ?? 0));
    } else if (options.modelId && AlgorithmModelRepository.hasModel(options.modelId)) {
      const model = AlgorithmModelRepository.getModel(options.modelId);
      const params = (model.defaultParams as any) || {};
      rawWeights = params.weights || params.costs || [1, 3, 4];
      rawValues = params.values || [15, 20, 30];
      capacity = Number(params.bagWeight ?? params.t ?? capacity);
    } else {
      rawWeights = [1, 3, 4];
      rawValues = [15, 20, 30];
    }

    const items: HerbItem[] = rawWeights.map((w, idx) => ({
      id: idx,
      weight: Number(w),
      value: Number(rawValues[idx] ?? w),
      name: `草药 #${idx}`,
    }));

    if ((step as any).capacity !== undefined) {
      capacity = Number((step as any).capacity);
    } else if (step.variables?.j !== undefined && typeof step.variables.j === 'number') {
      capacity = Math.max(capacity, step.variables.j);
    }

    return { items, capacity };
  }

  /**
   * 精准回溯完全背包当前状态下的装入清单 (支持同种草药重复累加)
   */
  public static backtrackHerbs(
    curI: number,
    curJ: number,
    items: HerbItem[],
    grid?: (number | null)[][]
  ): HerbInventoryItem[] {
    const counts = new Map<number, number>();
    if (!grid || !Array.isArray(grid) || grid.length === 0) return [];

    let remJ = curJ;
    let i = Math.min(curI, grid.length - 1, items.length - 1);

    while (i >= 0 && remJ > 0) {
      const item = items[i];
      const curCell = grid[i]?.[remJ] ?? 0;
      const prevRowCell = i > 0 ? (grid[i - 1]?.[remJ] ?? 0) : 0;

      // 如果来自当前行的同种物品自叠加：dp[i][remJ] === dp[i][remJ - w] + v
      if (remJ >= item.weight && grid[i]?.[remJ - item.weight] !== undefined) {
        const takeCell = grid[i]?.[remJ - item.weight] ?? 0;
        if (curCell === takeCell + item.value && curCell > prevRowCell) {
          counts.set(item.id, (counts.get(item.id) || 0) + 1);
          remJ -= item.weight;
          continue; // 保持在当前行 i，继续考察是否由同一物品自叠加
        }
      }

      // 否则说明来自上一行 (不选或已达本行上限)
      i--;
    }

    const inventory: HerbInventoryItem[] = [];
    for (const [id, count] of counts.entries()) {
      const item = items.find((it) => it.id === id);
      if (item && count > 0) {
        inventory.push({
          id,
          weight: item.weight,
          value: item.value,
          count,
          totalWeight: item.weight * count,
          totalValue: item.value * count,
        });
      }
    }

    return inventory;
  }

  /**
   * 渲染完整拟物沙盘
   */
  public static render(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    if (!container) return;

    container.innerHTML = '';
    container.className = 'unbounded-knapsack-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 0; background: transparent; overflow-y: auto; box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif;';

    const { items, capacity } = this.parseHerbsAndCapacity(step, options);

    const curI = typeof step.i === 'number' ? step.i : 0;
    const curJ = typeof step.j === 'number' ? step.j : capacity;
    const curItem = items[curI] || items[0];

    // 精准回溯已采摘入包的草药
    const inventory = this.backtrackHerbs(curI, curJ, items, step.grid);
    const usedWeight = inventory.reduce((acc, it) => acc + it.totalWeight, 0);
    const totalCollectedVal = inventory.reduce((acc, it) => acc + it.totalValue, 0);
    const remCapacity = Math.max(0, capacity - usedWeight);
    const progressPercent = Math.min(100, Math.round((usedWeight / Math.max(1, capacity)) * 100));

    // 计算当前草药状态
    const isEnough = curJ >= curItem.weight;

    const html = `
      <div class="unbounded-knapsack-sandbox" style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box; user-select: none; color: #f1f5f9;">
        <!-- 顶部提示横条 -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🌿</span>
            <span style="font-weight: bold; color: #34d399;">完全背包 (疯狂的采药) 拟物沙盘</span>
            <span style="color: #64748b;">|</span>
            <span style="color: #cbd5e1;">核心特质：<strong style="color: #34d399;">每种草药有无限株可用</strong>，同行左侧转移允许在已采摘的基础上无限自叠加！</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 11px;">
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; font-weight: bold;">当前考察: 草药 #${curI}</span>
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(59, 130, 246, 0.2); color: #93c5fd; font-weight: bold;">背包容量/时间: j = ${curJ} / ${capacity}</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 无限草药池，右 5 列: 真实自叠加背包) -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; align-items: start; box-sizing: border-box;">
          
          <!-- 左侧：无限草药采摘池 (7 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #10b981;">🌱</span> 无限草药采摘池 (Infinite Herb Pool)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">共 ${items.length} 种可用药材 · 每种无限件 (∞)</span>
            </div>

            <!-- 草药卡片网格 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
              ${items
                .map((herb, idx) => {
                  const isCurrent = idx === curI;
                  const takenInfo = inventory.find((it) => it.id === idx);
                  const inBagCount = takenInfo ? takenInfo.count : 0;

                  let borderCls = isCurrent
                    ? 'border: 2px solid #10b981; background: rgba(6, 78, 59, 0.4); box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);'
                    : 'border: 1px solid #334155; background: rgba(15, 23, 42, 0.6);';

                  return `
                    <div style="position: relative; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; box-sizing: border-box; ${borderCls}">
                      <!-- 药材名称与无限标记 -->
                      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(100, 116, 139, 0.4); padding-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 14px;">🌿</span>
                          <span style="font-weight: 800; font-size: 12px; color: #f1f5f9;">草药 #${herb.id}</span>
                        </div>
                        <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: bold; ${
                          isCurrent
                            ? 'background: #10b981; color: #ffffff;'
                            : inBagCount > 0
                            ? 'background: rgba(20, 184, 166, 0.2); color: #5eead4;'
                            : 'background: rgba(51, 65, 85, 0.6); color: #94a3b8;'
                        }">
                          ${isCurrent ? '当前考察' : inBagCount > 0 ? `包内 ×${inBagCount} 株` : '无限可用 ∞'}
                        </span>
                      </div>

                      <!-- 规格指标卡 -->
                      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: center; font-size: 12px; font-family: monospace;">
                        <div style="padding: 6px; border-radius: 6px; background: rgba(30, 41, 59, 0.8);">
                          <div style="font-size: 9px; color: #94a3b8;">采药耗时</div>
                          <div style="font-weight: bold; color: #38bdf8;">${herb.weight} 时间</div>
                        </div>
                        <div style="padding: 6px; border-radius: 6px; background: rgba(30, 41, 59, 0.8);">
                          <div style="font-size: 9px; color: #94a3b8;">药用价值</div>
                          <div style="font-weight: bold; color: #fbbf24;">+${herb.value} 价值</div>
                        </div>
                      </div>

                      <!-- 完全背包特性指示卡 -->
                      <div style="padding: 8px; border-radius: 8px; background: rgba(6, 78, 59, 0.2); border: 1px solid rgba(16, 185, 129, 0.25); display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                          <span style="color: #94a3b8; font-size: 10px;">当前容量上限 (${curJ}) 最多采:</span>
                          <span style="font-family: monospace; font-weight: bold; color: #34d399;">
                            ${herb.weight > 0 ? Math.floor(curJ / herb.weight) : 0} 株
                          </span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #94a3b8;">
                          <span>同轮已选放入:</span>
                          <span style="font-family: monospace; font-weight: bold; color: #2dd4bf;">${inBagCount} 株</span>
                        </div>
                      </div>

                      <!-- 试装入状态提示 -->
                      ${
                        isCurrent
                          ? isEnough
                            ? `<div style="text-align: center; font-size: 10px; font-weight: bold; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 4px; border-radius: 4px;">
                                 ✨ 时间充足！同行左侧 dp[${curI}][${curJ - herb.weight}] 允许无限自叠加
                               </div>`
                            : `<div style="text-align: center; font-size: 10px; font-weight: bold; color: #fb7185; background: rgba(244, 63, 94, 0.15); padding: 4px; border-radius: 4px;">
                                 ⚠️ 时间不足 (需 ${herb.weight}，剩余 ${curJ})，直接继承上方旧值
                               </div>`
                          : ''
                      }
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>

          <!-- 右侧：真实自叠加背包容器 (5 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #10b981;">🧺</span> 自叠加采药背包舱 (Cumulative Knapsack)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #34d399; font-weight: 800;">
                总耗时: ${curJ} / ${capacity}
              </span>
            </div>

            <!-- 背包舱体卡片 -->
            <div style="position: relative; padding: 14px; border-radius: 16px; border: 2px solid #334155; background: linear-gradient(to bottom, #1e293b, #0f172a); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;">
              <!-- 背包提把造型 -->
              <div style="width: 64px; height: 8px; margin: 0 auto; border-radius: 9999px; background: #059669; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);"></div>

              <!-- 水位指示仪表 -->
              <div style="padding: 10px; border-radius: 12px; background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                  <span style="font-weight: bold; color: #cbd5e1;">采药时间已用配额</span>
                  <span style="font-family: monospace; font-weight: 800; color: #34d399;">
                    ${progressPercent}% (${usedWeight} / ${capacity})
                  </span>
                </div>
                <div style="width: 100%; background: #334155; height: 12px; border-radius: 9999px; overflow: hidden; padding: 2px; box-sizing: border-box;">
                  <div style="height: 100%; border-radius: 9999px; background: linear-gradient(to right, #10b981, #14b8a6); width: ${progressPercent}%; transition: width 0.3s;"></div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding-top: 4px; text-align: center;">
                  <div style="padding: 4px; border-radius: 4px; background: rgba(30, 41, 59, 0.6);">
                    <div style="font-size: 9px; color: #94a3b8;">已耗时间</div>
                    <div style="font-size: 12px; font-family: monospace; font-weight: bold; color: #f1f5f9;">${usedWeight}</div>
                  </div>
                  <div style="padding: 4px; border-radius: 4px; background: rgba(30, 41, 59, 0.6);">
                    <div style="font-size: 9px; color: #94a3b8;">剩余时间</div>
                    <div style="font-size: 12px; font-family: monospace; font-weight: bold; color: #34d399;">${remCapacity}</div>
                  </div>
                  <div style="padding: 4px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);">
                    <div style="font-size: 9px; color: #fbbf24; font-weight: bold;">总药用价值</div>
                    <div style="font-size: 14px; font-family: monospace; font-weight: 900; color: #fde68a;">${totalCollectedVal}</div>
                  </div>
                </div>
              </div>

              <!-- 背包内部装入草药清单 -->
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 12px; font-weight: bold; color: #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
                  <span>🧺 背包内当前草药陈列:</span>
                  <span style="font-size: 10px; font-family: monospace; color: #94a3b8;">${inventory.length} 种草药已装入</span>
                </div>

                <div style="min-height: 90px; padding: 8px; border-radius: 12px; background: rgba(2, 6, 23, 0.6); border: 1px dashed #334155; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
                  ${
                    inventory.length === 0
                      ? '<div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #64748b; padding: 24px 0;">背包当前为空 (尚未采摘任何草药)</div>'
                      : inventory
                          .map((it) => {
                            return `
                              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; background: #1e293b; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                  <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; font-family: monospace; font-weight: bold;">
                                    草药 #${it.id}
                                  </span>
                                  <span style="font-weight: 800; color: #2dd4bf;">× ${it.count} 株</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px; font-family: monospace;">
                                  <span style="color: #94a3b8; font-size: 11px;">耗时 ${it.totalWeight}</span>
                                  <span style="color: #fbbf24; font-weight: 800;">+${it.totalValue}</span>
                                </div>
                              </div>
                            `;
                          })
                          .join('')
                  }

                  <!-- 若当前尝试采摘，展示虚线试装卡 -->
                  ${
                    isEnough
                      ? `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; border: 2px dashed #34d399; background: rgba(16, 185, 129, 0.15); font-size: 12px;">
                      <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: #a7f3d0;">
                        <span>⚡ 正在试选放入: 草药 #${curI} (第 ${(inventory.find((x) => x.id === curI)?.count || 0) + 1} 株)</span>
                      </div>
                      <div style="font-family: monospace; font-size: 11px; display: flex; align-items: center; gap: 8px;">
                        <span style="color: #38bdf8;">需耗时: ${curItem.weight}</span>
                        <span style="color: #fbbf24; font-weight: bold;">价值: +${curItem.value}</span>
                      </div>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- 决策比较看板：完全背包同行自叠加 vs 01 背包分界机理 -->
              <div style="padding: 10px; border-radius: 12px; background: rgba(6, 78, 59, 0.25); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-weight: bold; color: #6ee7b7; display: flex; align-items: center; gap: 4px;">
                  <span style="color: #f59e0b;">⚖️</span>
                  <span>完全背包转移决策看板 (同行自叠加机制)</span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; font-family: monospace;">
                  ${escapeHtml(step.decision || step.msg || '完全背包状态转移推导中')}
                </div>
                <div style="font-size: 10px; color: #94a3b8; border-top: 1px dashed rgba(16, 185, 129, 0.3); padding-top: 4px;">
                  💡 <strong>同行转移核心铁律</strong>：<code>dp[i][j - w]</code> 来自<strong>当前行</strong>（非上一行），因此允许在此前已经选择该草药的状态上，再度追加该草药！
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}
