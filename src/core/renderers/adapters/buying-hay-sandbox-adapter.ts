/**
 * 购买足量干草最小花费拟物沙盘适配器 (BuyingHaySandboxAdapter)
 * 遵循单一职责与深模块原则：
 *
 * 核心设计契约：
 * 1. 供货商农场货架 (Suppliers Hay Market · 7 列):
 *    - 陈列每位供货商的产品规格 (售价 Cost, 单包重量 Val, 性价比 Unit Cost)
 *    - 标注“无限供应 (Infinite Supply ∞)”特有属性
 *    - 实时高亮当前考察供货商、可购最大捆数与单包规格
 * 2. 奶牛干草粮仓与货舱 (Barn & Granary Container · 5 列):
 *    - 拟物货舱与目标/容量安全扩充双重水位表 (已达重量、目标 H 刻度线、累计花费)
 *    - 精准回溯 (Backtracking)：统计当前状态下采购的供货商捆数 (如 🏢 供货商 #1 × 2 捆)
 *    - 完全背包求最小值转移看板 (min(dp[i-1][j], dp[i][j-v] + c))
 */

import { escapeHtml } from '../../code-highlighter';
import { AlgorithmModelRepository } from '../../model-repository';
import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export interface HaySupplier {
  id: number;
  cost: number;
  val: number;
  unitCost: number;
  name: string;
}

export interface HayInventoryBundle {
  supplierId: number;
  cost: number;
  val: number;
  count: number;
  totalCost: number;
  totalVal: number;
}

export class BuyingHaySandboxAdapter {
  /**
   * 解析干草供应商列表与需求量参数
   */
  public static parseHayData(
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): { suppliers: HaySupplier[]; hTarget: number; expandedCapacity: number } {
    let rawCosts: number[] = [];
    let rawVals: number[] = [];
    let hTarget = 15;

    if (Array.isArray((step as any).cost) && Array.isArray((step as any).val)) {
      rawCosts = (step as any).cost;
      rawVals = (step as any).val;
      hTarget = Number((step as any).hTarget ?? 15);
    } else if (options.modelId && AlgorithmModelRepository.hasModel(options.modelId)) {
      const model = AlgorithmModelRepository.getModel(options.modelId);
      const params = (model.defaultParams as any) || {};
      rawCosts = params.costs || params.cost || [10, 12];
      rawVals = params.vals || params.val || [8, 16];
      hTarget = Number(params.h || params.hTarget || 15);
    } else {
      rawCosts = [10, 12];
      rawVals = [8, 16];
      hTarget = 15;
    }

    const suppliers: HaySupplier[] = rawCosts.map((c, idx) => {
      const v = rawVals[idx] || 1;
      return {
        id: idx + 1,
        cost: c,
        val: v,
        unitCost: Number((c / v).toFixed(2)),
        name: `供货商 #${idx + 1}`,
      };
    });

    const maxVal = rawVals.length > 0 ? Math.max(...rawVals) : 0;
    const expandedCapacity = (step as any).expandedCapacity || (hTarget + maxVal);

    return { suppliers, hTarget, expandedCapacity };
  }

  /**
   * 回溯当前称重 j 下最优采购的干草捆清单
   */
  public static backtrackHay(
    curI: number,
    curJ: number,
    suppliers: HaySupplier[],
    grid?: (number | null)[][],
    selectedItems?: Array<{ supplierIdx: number; cost: number; val: number }>
  ): HayInventoryBundle[] {
    const counts = new Map<number, number>();

    if (Array.isArray(selectedItems) && selectedItems.length > 0) {
      for (const it of selectedItems) {
        counts.set(it.supplierIdx, (counts.get(it.supplierIdx) || 0) + 1);
      }
    } else if (grid && Array.isArray(grid) && grid.length > 0) {
      let remJ = curJ;
      let i = Math.min(curI, grid.length - 1, suppliers.length);
      const INF = 1_000_000_000;

      while (i > 0 && remJ > 0) {
        const sup = suppliers[i - 1];
        if (!sup) {
          i--;
          continue;
        }
        const curCell = grid[i]?.[remJ];
        const skipCell = grid[i - 1]?.[remJ];
        const takeCell = remJ >= sup.val ? grid[i]?.[remJ - sup.val] : null;

        if (
          takeCell !== null &&
          takeCell !== undefined &&
          takeCell < INF &&
          curCell !== null &&
          curCell !== undefined &&
          curCell === takeCell + sup.cost
        ) {
          counts.set(sup.id, (counts.get(sup.id) || 0) + 1);
          remJ -= sup.val;
          continue;
        }

        if (
          skipCell !== null &&
          skipCell !== undefined &&
          curCell !== null &&
          curCell !== undefined &&
          curCell === skipCell
        ) {
          i--;
          continue;
        }

        i--;
      }
    }

    const inventory: HayInventoryBundle[] = [];
    for (const sup of suppliers) {
      const count = counts.get(sup.id) || 0;
      if (count > 0) {
        inventory.push({
          supplierId: sup.id,
          cost: sup.cost,
          val: sup.val,
          count,
          totalCost: sup.cost * count,
          totalVal: sup.val * count,
        });
      }
    }

    return inventory;
  }

  /**
   * 渲染完整干草货栈与粮仓拟物沙盘
   */
  public static render(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    if (!container) return;

    container.innerHTML = '';
    container.className = 'buying-hay-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 0; background: transparent; overflow-y: auto; box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif;';

    const { suppliers, hTarget, expandedCapacity } = this.parseHayData(step, options);

    const curI = typeof step.i === 'number' ? step.i : 0;
    const curJ = typeof step.j === 'number' ? step.j : 0;

    const inventory = this.backtrackHay(curI, curJ, suppliers, step.grid, (step as any).selectedItems);
    const totalPounds = inventory.reduce((acc, it) => acc + it.totalVal, 0);
    const totalCost = inventory.reduce((acc, it) => acc + it.totalCost, 0);
    const isTargetMet = totalPounds >= hTarget;
    const progressPercent = Math.min(100, Math.round((totalPounds / Math.max(1, expandedCapacity)) * 100));
    const targetPercent = Math.min(100, Math.round((hTarget / Math.max(1, expandedCapacity)) * 100));

    const html = `
      <div class="buying-hay-sandbox" style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box; user-select: none; color: #f1f5f9;">
        <!-- 顶部提示横条 -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">🌾</span>
            <span style="font-weight: bold; color: #fbbf24;">购买足量干草最小花费沙盘</span>
            <span style="color: #64748b;">|</span>
            <span style="color: #cbd5e1;">
              约翰需求：<strong style="color: #fbbf24;">至少 ${hTarget} 磅</strong> · 允许超额只要更便宜 · 安全扩充上限 <strong style="color: #38bdf8;">m = ${expandedCapacity} 磅</strong>
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 11px;">
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(245, 158, 11, 0.2); color: #fde68a; font-weight: bold;">考察商: #${curI}</span>
            <span style="padding: 2px 8px; border-radius: 4px; background: rgba(56, 189, 248, 0.2); color: #7dd3fc; font-weight: bold;">目标称重: j = ${curJ} 磅</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 供货商货架，右 5 列: 粮仓货舱) -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; align-items: start; box-sizing: border-box;">
          
          <!-- 左侧：农场干草供应商货架 (7 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span style="color: #fbbf24;">🏢</span> 农场干草供应商货架 (Suppliers Hay Market)
              </span>
              <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">共 ${suppliers.length} 家供货商 · 无限库存 (∞)</span>
            </div>

            <!-- 供应商卡片网格 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
              ${suppliers
                .map((sup, idx) => {
                  const isCurrent = idx + 1 === curI;
                  const takenInfo = inventory.find((it) => it.supplierId === sup.id);
                  const inCartCount = takenInfo ? takenInfo.count : 0;

                  let borderCls = isCurrent
                    ? 'border: 2px solid #fbbf24; background: rgba(69, 26, 3, 0.4); box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);'
                    : 'border: 1px solid #334155; background: rgba(15, 23, 42, 0.6);';

                  return `
                    <div style="position: relative; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; box-sizing: border-box; ${borderCls}">
                      <!-- 供货商名称与标记 -->
                      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(100, 116, 139, 0.4); padding-bottom: 6px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 14px;">🏢</span>
                          <span style="font-weight: 800; font-size: 12px; color: #f1f5f9;">${escapeHtml(sup.name)}</span>
                        </div>
                        <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: bold; ${
                          isCurrent
                            ? 'background: #f59e0b; color: #ffffff;'
                            : inCartCount > 0
                            ? 'background: rgba(16, 185, 129, 0.2); color: #6ee7b7;'
                            : 'background: rgba(51, 65, 85, 0.6); color: #94a3b8;'
                        }">
                          ${isCurrent ? '当前考察' : inCartCount > 0 ? `已购 ×${inCartCount} 捆` : '无限供应 ∞'}
                        </span>
                      </div>

                      <!-- 规格指标卡 -->
                      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: center; font-size: 12px; font-family: monospace;">
                        <div style="padding: 6px; border-radius: 6px; background: rgba(30, 41, 59, 0.8);">
                          <div style="font-size: 9px; color: #94a3b8;">单捆重量</div>
                          <div style="font-weight: bold; color: #fbbf24;">${sup.val} 磅</div>
                        </div>
                        <div style="padding: 6px; border-radius: 6px; background: rgba(30, 41, 59, 0.8);">
                          <div style="font-size: 9px; color: #94a3b8;">采购售价</div>
                          <div style="font-weight: bold; color: #fb7185;">${sup.cost} 元</div>
                        </div>
                      </div>

                      <!-- 性价比与当前称重可购数 -->
                      <div style="padding: 8px; border-radius: 8px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                          <span style="color: #94a3b8; font-size: 10px;">综合性价比:</span>
                          <span style="font-family: monospace; font-weight: bold; color: #fbbf24;">
                            ${sup.unitCost} 元/磅
                          </span>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #94a3b8;">
                          <span>称重上限 (${curJ}磅) 最多购:</span>
                          <span style="font-family: monospace; font-weight: 600; color: #cbd5e1;">
                            ${curJ >= sup.val ? Math.floor(curJ / sup.val) : 0} 捆
                          </span>
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>

          <!-- 右侧：奶牛干草粮仓货舱 (5 列) -->
          <div style="display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: bold; color: #cbd5e1;">
              <span style="display: flex; align-items: gap: 6px;">
                <span style="color: #38bdf8;">🏠</span> 奶牛粮仓货舱 (Barn Container)
              </span>
              <span style="font-size: 11px; font-family: monospace; ${isTargetMet ? 'color: #34d399; font-weight: bold;' : 'color: #fbbf24;'}">
                ${isTargetMet ? '✔ 已满足目标' : `还差 ${Math.max(0, hTarget - totalPounds)} 磅`}
              </span>
            </div>

            <div style="padding: 14px; border-radius: 12px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.8); display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;">
              
              <!-- 重量达标进度水位表 (含 H 需求目标基准线) -->
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
                  <span style="color: #94a3b8;">已购干草总重</span>
                  <span style="font-family: monospace; font-weight: bold; color: ${isTargetMet ? '#34d399' : '#fbbf24'};">
                    ${totalPounds} 磅 / 目标 ${hTarget} 磅 (上限 ${expandedCapacity})
                  </span>
                </div>
                
                <div style="position: relative; width: 100%; height: 14px; border-radius: 9999px; background: #334155; overflow: hidden; border: 1px solid #475569; padding: 2px; box-sizing: border-box;">
                  <div
                    style="height: 100%; border-radius: 9999px; transition: width 0.3s; background: ${
                      isTargetMet
                        ? 'linear-gradient(to right, #10b981, #14b8a6)'
                        : 'linear-gradient(to right, #f59e0b, #eab308)'
                    }; width: ${progressPercent}%;"
                  ></div>
                  <!-- H 目标基准线 -->
                  <div
                    style="position: absolute; top: 0; bottom: 0; width: 2px; background: #ef4444; z-index: 10; left: ${targetPercent}%;"
                    title="目标需求线 H = ${hTarget} 磅"
                  ></div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 2px;">
                  <span>0 磅</span>
                  <span style="color: #ef4444; font-weight: bold;">H 目标 (${hTarget}磅)</span>
                  <span>安全上限 (${expandedCapacity}磅)</span>
                </div>
              </div>

              <!-- 累计采购花费统计 -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: center; font-size: 12px; font-family: monospace;">
                <div style="padding: 8px; border-radius: 8px; background: rgba(30, 41, 59, 0.8);">
                  <div style="font-size: 10px; color: #94a3b8;">累计花费金额</div>
                  <div style="font-size: 14px; font-weight: 800; color: #fb7185;">
                    ${totalCost > 0 ? `${totalCost} 元` : '0 元 (基底)'}
                  </div>
                </div>
                <div style="padding: 8px; border-radius: 8px; background: rgba(30, 41, 59, 0.8);">
                  <div style="font-size: 10px; color: #94a3b8;">需求满足状态</div>
                  <div style="font-size: 12px; font-weight: bold; color: ${isTargetMet ? '#34d399' : '#fbbf24'};">
                    ${isTargetMet ? `达标 (超额 ${totalPounds - hTarget}磅)` : `未达标 (缺 ${hTarget - totalPounds}磅)`}
                  </div>
                </div>
              </div>

              <!-- 已采购干草清单 -->
              <div style="display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px dashed rgba(100, 116, 139, 0.4);">
                <div style="font-size: 11px; font-weight: bold; color: #cbd5e1; display: flex; align-items: center; justify-content: space-between;">
                  <span>📦 粮仓干草采购堆放清单</span>
                  <span style="font-size: 10px; font-weight: normal; color: #94a3b8;">按供货商回溯统计</span>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 38px; align-items: center;">
                  ${
                    inventory.length === 0
                      ? `<span style="font-size: 11px; color: #64748b; font-style: italic;">暂未采购任何干草 (空基底)</span>`
                      : inventory
                          .map(
                            (it) => `
                              <div style="display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; font-family: monospace;">
                                <span style="font-weight: bold; color: #fde68a;">🏢 供货商 #${it.supplierId}</span>
                                <span style="color: #64748b;">×</span>
                                <span style="font-weight: 800; color: #34d399;">${it.count} 捆</span>
                                <span style="font-size: 10px; color: #94a3b8;">(${it.totalVal}磅 / ${it.totalCost}元)</span>
                              </div>
                            `
                          )
                          .join('')
                  }
                </div>
              </div>

              <!-- 决策裁决与转移看板 -->
              <div style="padding: 8px; border-radius: 8px; background: rgba(8, 47, 73, 0.4); border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; color: #cbd5e1; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; font-weight: bold; color: #7dd3fc;">
                  <span>⚖️ 求最小值转移决策</span>
                  <span style="font-family: monospace; font-size: 10px;">dp[${curI}][${curJ}]</span>
                </div>
                <div style="font-size: 10.5px; color: #94a3b8; line-height: 1.5; font-family: monospace;">
                  ${escapeHtml(step.msg || step.log || '正在推导完全背包状态转移...')}
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
