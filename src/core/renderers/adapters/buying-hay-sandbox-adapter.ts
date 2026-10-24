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
        } else if (skipCell !== null && skipCell !== undefined && curCell === skipCell) {
          i--;
        } else {
          i--;
        }
      }
    }

    const inventory: HayInventoryBundle[] = [];
    for (const [id, count] of counts.entries()) {
      const sup = suppliers.find((s) => s.id === id);
      if (sup) {
        inventory.push({
          supplierId: id,
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
    container.className = 'w-full h-full flex flex-col relative z-0 bg-transparent border-0 shadow-none p-0 overflow-y-auto';
    container.style.display = 'flex';
    container.style.width = '100%';

    const { suppliers, hTarget, expandedCapacity } = this.parseHayData(step, options);

    const curI = typeof step.i === 'number' ? step.i : 0;
    const curJ = typeof step.j === 'number' ? step.j : 0;
    const activeSupplier = suppliers[Math.max(0, curI - 1)] || suppliers[0];

    const inventory = this.backtrackHay(curI, curJ, suppliers, step.grid, (step as any).selectedItems);
    const totalPounds = inventory.reduce((acc, it) => acc + it.totalVal, 0);
    const totalCost = inventory.reduce((acc, it) => acc + it.totalCost, 0);
    const isTargetMet = totalPounds >= hTarget;
    const progressPercent = Math.min(100, Math.round((totalPounds / Math.max(1, expandedCapacity)) * 100));
    const targetPercent = Math.min(100, Math.round((hTarget / Math.max(1, expandedCapacity)) * 100));

    const html = `
      <div class="buying-hay-sandbox w-full flex flex-col gap-3 p-3 font-sans select-none text-slate-800 dark:text-slate-100">
        <!-- 顶部提示横条 -->
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-emerald-500/10 border border-amber-500/20 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">🌾</span>
            <span class="font-bold text-amber-700 dark:text-amber-300">购买足量干草最小花费沙盘</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-600 dark:text-slate-300">
              约翰需求：<strong class="text-amber-600 dark:text-amber-400">至少 ${hTarget} 磅</strong> · 允许超额只要更便宜 · 安全扩充上限 <strong class="text-sky-600 dark:text-sky-400">m = ${expandedCapacity} 磅</strong>
            </span>
          </div>
          <div class="flex items-center gap-2 font-mono text-[11px]">
            <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold">考察商: #${curI}</span>
            <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-800 dark:text-sky-200 font-bold">目标称重: j = ${curJ} 磅</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 供货商货架，右 5 列: 粮仓货舱) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          <!-- 左侧：农场干草供应商货架 (7 列) -->
          <div class="lg:col-span-7 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-store text-amber-600"></i> 农场干草供应商货架 (Suppliers Hay Market)
              </span>
              <span class="text-[11px] font-mono text-slate-500">共 ${suppliers.length} 家供货商 · 无限库存 (∞)</span>
            </div>

            <!-- 供应商卡片网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-${Math.min(2, suppliers.length)} gap-3">
              ${suppliers
                .map((sup, idx) => {
                  const isCurrent = idx + 1 === curI;
                  const takenInfo = inventory.find((it) => it.supplierId === sup.id);
                  const inCartCount = takenInfo ? takenInfo.count : 0;

                  let borderCls = isCurrent
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-400/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40';

                  return `
                    <div class="relative p-3 rounded-xl border flex flex-col gap-2.5 transition-all ${borderCls}">
                      <!-- 供货商名称与标记 -->
                      <div class="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-1.5">
                        <div class="flex items-center gap-1.5">
                          <span class="text-sm">🏢</span>
                          <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100">${escapeHtml(sup.name)}</span>
                        </div>
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isCurrent
                            ? 'bg-amber-500 text-white animate-pulse'
                            : inCartCount > 0
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }">
                          ${isCurrent ? '当前考察' : inCartCount > 0 ? `已购 ×${inCartCount} 捆` : '无限供应 ∞'}
                        </span>
                      </div>

                      <!-- 规格指标卡 -->
                      <div class="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                        <div class="p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/80">
                          <div class="text-[9px] text-slate-500">单捆重量</div>
                          <div class="font-bold text-amber-600 dark:text-amber-400">${sup.val} 磅</div>
                        </div>
                        <div class="p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/80">
                          <div class="text-[9px] text-slate-500">采购售价</div>
                          <div class="font-bold text-rose-600 dark:text-rose-400">${sup.cost} 元</div>
                        </div>
                      </div>

                      <!-- 性价比与当前称重可购数 -->
                      <div class="p-2 rounded-lg bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 flex flex-col gap-1 text-[11px]">
                        <div class="flex items-center justify-between">
                          <span class="text-slate-500 text-[10px]">综合性价比:</span>
                          <span class="font-mono font-bold text-amber-600 dark:text-amber-400">
                            ${sup.unitCost} 元/磅
                          </span>
                        </div>
                        <div class="flex items-center justify-between text-[10px] text-slate-500">
                          <span>称重上限 (${curJ}磅) 最多购:</span>
                          <span class="font-mono font-semibold text-slate-700 dark:text-slate-300">
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
          <div class="lg:col-span-5 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-warehouse text-sky-600"></i> 奶牛粮仓货舱 (Barn Container)
              </span>
              <span class="text-[11px] font-mono ${isTargetMet ? 'text-emerald-500 font-bold' : 'text-amber-500'}">
                ${isTargetMet ? '✔ 已满足目标' : `还差 ${Math.max(0, hTarget - totalPounds)} 磅`}
              </span>
            </div>

            <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 flex flex-col gap-3 shadow-xs">
              
              <!-- 重量达标进度水位表 (含 H 需求目标基准线) -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">已购干草总重</span>
                  <span class="font-mono font-bold ${isTargetMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">
                    ${totalPounds} 磅 / 目标 ${hTarget} 磅 (上限 ${expandedCapacity})
                  </span>
                </div>
                
                <div class="relative w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    class="h-full rounded-full transition-all duration-300 ${
                      isTargetMet
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }"
                    style="width: ${progressPercent}%;"
                  ></div>
                  <!-- H 目标基准线 -->
                  <div
                    class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-xs"
                    style="left: ${targetPercent}%;"
                    title="目标需求线 H = ${hTarget} 磅"
                  ></div>
                </div>

                <div class="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>0 磅</span>
                  <span class="text-red-500 font-bold">H 目标 (${hTarget}磅)</span>
                  <span>安全上限 (${expandedCapacity}磅)</span>
                </div>
              </div>

              <!-- 累计采购花费统计 -->
              <div class="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div class="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80">
                  <div class="text-[10px] text-slate-500">累计花费金额</div>
                  <div class="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                    ${totalCost > 0 ? `${totalCost} 元` : '0 元 (基底)'}
                  </div>
                </div>
                <div class="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80">
                  <div class="text-[10px] text-slate-500">需求满足状态</div>
                  <div class="text-xs font-bold ${isTargetMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">
                    ${isTargetMet ? `达标 (超额 ${totalPounds - hTarget}磅)` : `未达标 (缺 ${hTarget - totalPounds}磅)`}
                  </div>
                </div>
              </div>

              <!-- 已采购干草清单 -->
              <div class="flex flex-col gap-1.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                <div class="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>📦 粮仓干草采购堆放清单</span>
                  <span class="text-[10px] font-normal text-slate-400">按供货商回溯统计</span>
                </div>

                <div class="flex flex-wrap gap-1.5 min-h-[38px] items-center">
                  ${
                    inventory.length === 0
                      ? `<span class="text-[11px] text-slate-400 italic">暂未采购任何干草 (空基底)</span>`
                      : inventory
                          .map(
                            (it) => `
                              <div class="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono">
                                <span class="font-bold text-amber-700 dark:text-amber-300">🏢 供货商 #${it.supplierId}</span>
                                <span class="text-slate-400">×</span>
                                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">${it.count} 捆</span>
                                <span class="text-[10px] text-slate-500">(${it.totalVal}磅 / ${it.totalCost}元)</span>
                              </div>
                            `
                          )
                          .join('')
                  }
                </div>
              </div>

              <!-- 决策裁决与转移看板 -->
              <div class="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 text-[11px] text-slate-700 dark:text-slate-300 flex flex-col gap-1">
                <div class="flex items-center justify-between font-bold text-sky-800 dark:text-sky-300">
                  <span>⚖️ 求最小值转移决策</span>
                  <span class="font-mono text-[10px]">dp[${curI}][${curJ}]</span>
                </div>
                <div class="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
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
