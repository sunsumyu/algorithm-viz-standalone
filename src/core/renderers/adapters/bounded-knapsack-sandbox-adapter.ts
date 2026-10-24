/**
 * 多重背包与二进制拆分拟物沙盘适配器 (BoundedKnapsackSandboxAdapter)
 * 遵循单一职责与深模块原则：
 *
 * 核心设计契约：
 * 1. 宝物货架与品类陈列 (Treasure Shelves · 7 列):
 *    - 朴素模式：陈列宝物规格 (重量 W, 价值 V, 数量限制 C), 实时高亮当前考察品类与当前尝试件数 k
 *    - 二进制拆分模式：陈列 1, 2, 4... 位权衍生包货架，展示拆分过程与当前考察衍生包
 * 2. 宝物载荷舱 (Treasure Knapsack Container · 5 列):
 *    - 载重负荷水位计 (已用载重 / 背包最大容量 W)
 *    - 累计总价值仪表 (当前达成价值)
 *    - 精准回溯 (Backtracking)：当前状态下装入的宝物件数清单 (如 📦 宝物 #1 × 2 件)
 *    - 转移决策看板 (朴素多分支枚举 vs 01 衍生包二叉决策)
 */

import { escapeHtml } from '../../code-highlighter';
import { AlgorithmModelRepository } from '../../model-repository';
import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export interface BoundedKnapsackItem {
  id: number;
  weight: number;
  value: number;
  count: number;
  name: string;
}

export interface DerivedBinaryPackage {
  id: number;
  origId: number;
  multiplier: number;
  weight: number;
  value: number;
}

export interface BoundedInventoryItem {
  id: number;
  name: string;
  unitWeight: number;
  unitValue: number;
  count: number;
  totalWeight: number;
  totalValue: number;
}

export class BoundedKnapsackSandboxAdapter {
  /**
   * 解析多重背包的基础数据与二进制衍生包
   */
  public static parseData(
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): {
    items: BoundedKnapsackItem[];
    derivedPackages: DerivedBinaryPackage[];
    capacity: number;
    isBinary: boolean;
  } {
    let rawWeights: number[] = [];
    let rawValues: number[] = [];
    let rawNums: number[] = [];
    let capacity = 10;

    const mId = options.modelId || '';
    const isBinary =
      mId === 'bounded-knapsack-binary' ||
      mId === 'bounded-knapsack-binary-075' ||
      mId === 'class075-code02' ||
      mId === 'multiple-knapsack-binary' ||
      mId === 'luogu-p1776-binary';

    if (options.modelId && AlgorithmModelRepository.hasModel(options.modelId)) {
      const model = AlgorithmModelRepository.getModel(options.modelId);
      const params = (model.defaultParams as any) || {};
      rawWeights = params.weights || [2, 3, 5];
      rawValues = params.values || [3, 4, 7];
      rawNums = params.nums || [2, 3, 2];
      capacity = Number(params.bagWeight ?? params.t ?? 10);
    } else {
      rawWeights = [2, 3, 5];
      rawValues = [3, 4, 7];
      rawNums = [2, 3, 2];
    }

    if ((step as any).totalCapacity !== undefined) {
      capacity = Number((step as any).totalCapacity);
    }

    const items: BoundedKnapsackItem[] = rawWeights.map((w, idx) => ({
      id: idx + 1,
      weight: Number(w),
      value: Number(rawValues[idx] ?? w),
      count: Number(rawNums[idx] ?? 1),
      name: `宝物 #${idx + 1}`,
    }));

    // 构建二进制衍生包
    const derivedPackages: DerivedBinaryPackage[] = [];
    let derivedId = 1;
    for (let i = 0; i < items.length; i++) {
      let cnt = items[i].count;
      const w = items[i].weight;
      const v = items[i].value;
      for (let k = 1; k <= cnt; k <<= 1) {
        derivedPackages.push({
          id: derivedId++,
          origId: items[i].id,
          multiplier: k,
          weight: k * w,
          value: k * v,
        });
        cnt -= k;
      }
      if (cnt > 0) {
        derivedPackages.push({
          id: derivedId++,
          origId: items[i].id,
          multiplier: cnt,
          weight: cnt * w,
          value: cnt * v,
        });
      }
    }

    return { items, derivedPackages, capacity, isBinary };
  }

  /**
   * 回溯当前容量状态下的装入清单
   */
  public static backtrack(
    curI: number,
    curJ: number,
    items: BoundedKnapsackItem[],
    derivedPackages: DerivedBinaryPackage[],
    isBinary: boolean,
    grid?: (number | null)[][],
    dp1d?: (number | null)[],
    step?: UniversalStep
  ): BoundedInventoryItem[] {
    const counts = new Map<number, number>();

    if (grid && Array.isArray(grid) && grid.length > 0) {
      let remJ = curJ;
      if (isBinary) {
        let pIdx = Math.min(curI, grid.length - 1, derivedPackages.length - 1);
        while (pIdx >= 0 && remJ > 0) {
          const pkg = derivedPackages[pIdx];
          const curCell = grid[pIdx]?.[remJ] ?? 0;
          const prevCell = pIdx > 0 ? (grid[pIdx - 1]?.[remJ] ?? 0) : 0;
          const takeCell = remJ >= pkg.weight ? (pIdx > 0 ? grid[pIdx - 1]?.[remJ - pkg.weight] ?? 0 : 0) + pkg.value : -1;

          if (takeCell === curCell && curCell > prevCell) {
            counts.set(pkg.origId, (counts.get(pkg.origId) || 0) + pkg.multiplier);
            remJ -= pkg.weight;
          }
          pIdx--;
        }
      } else {
        const trialK = typeof (step as any)?.k === 'number' ? (step as any).k : undefined;
        let i = Math.min(curI, grid.length - 1, items.length - 1);
        if (trialK !== undefined && i >= 0 && i < items.length) {
          const item = items[i];
          if (trialK > 0) {
            counts.set(item.id, trialK);
            remJ = Math.max(0, remJ - trialK * item.weight);
          }
          i--;
        }
        while (i >= 0 && remJ > 0) {
          const item = items[i];
          const curCell = grid[i]?.[remJ] ?? 0;
          let bestK = 0;

          for (let k = 1; k <= item.count && k * item.weight <= remJ; k++) {
            const prev = i > 0 ? (grid[i - 1]?.[remJ - k * item.weight] ?? 0) : 0;
            if (prev + k * item.value === curCell) {
              bestK = k;
              break;
            }
          }

          if (bestK > 0) {
            counts.set(item.id, bestK);
            remJ -= bestK * item.weight;
          }
          i--;
        }
      }
    }

    const inventory: BoundedInventoryItem[] = [];
    for (const [id, count] of counts.entries()) {
      const item = items.find((it) => it.id === id);
      if (item && count > 0) {
        inventory.push({
          id,
          name: item.name,
          unitWeight: item.weight,
          unitValue: item.value,
          count,
          totalWeight: item.weight * count,
          totalValue: item.value * count,
        });
      }
    }

    return inventory;
  }

  /**
   * 渲染完整多重背包拟物沙盘
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

    const { items, derivedPackages, capacity, isBinary } = this.parseData(step, options);

    const curI = typeof step.i === 'number' ? step.i : 0;
    const curJ = typeof step.j === 'number' ? step.j : capacity;

    const inventory = this.backtrack(curI, curJ, items, derivedPackages, isBinary, step.grid, step.dp1d, step);
    const usedWeight = inventory.reduce((acc, it) => acc + it.totalWeight, 0);
    const totalVal = inventory.reduce((acc, it) => acc + it.totalValue, 0);
    const progressPercent = Math.min(100, Math.round((usedWeight / Math.max(1, capacity)) * 100));

    const html = `
      <div class="bounded-knapsack-sandbox w-full flex flex-col gap-3 p-3 font-sans select-none text-slate-800 dark:text-slate-100">
        <!-- 顶部提示横条 -->
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r ${
          isBinary ? 'from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20' : 'from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/20'
        } text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">${isBinary ? '✂️' : '📦'}</span>
            <span class="font-bold ${isBinary ? 'text-purple-700 dark:text-purple-300' : 'text-amber-700 dark:text-amber-300'}">
              ${isBinary ? '多重背包二进制拆分沙盘' : '多重背包朴素枚举沙盘'}
            </span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-600 dark:text-slate-300">
              ${
                isBinary
                  ? '将每种数量为 c[i] 的宝物按 <strong>1, 2, 4, ...</strong> 二进制拆分转化为 01 背包，时间复杂度 O(W · Σlog c)'
                  : '每种宝物拥有<strong>数量上限 c[i]</strong>，状态转移时枚举放入 k 件 (0 <= k <= c[i])'
              }
            </span>
          </div>
          <div class="flex items-center gap-2 font-mono text-[11px]">
            <span class="px-2 py-0.5 rounded ${isBinary ? 'bg-purple-500/20 text-purple-800 dark:text-purple-200' : 'bg-amber-500/20 text-amber-800 dark:text-amber-200'} font-bold">
              ${isBinary ? `衍生包 #${curI + 1}` : `宝物 #${curI + 1}`}
            </span>
            <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-200 font-bold">
              容量: j = ${curJ} / ${capacity}
            </span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 货架，右 5 列: 载荷舱) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          <!-- 左侧：宝物陈列货架 (7 列) -->
          <div class="lg:col-span-7 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-boxes-stacked ${isBinary ? 'text-purple-600' : 'text-amber-600'}"></i>
                ${isBinary ? '二进制拆分衍生 01 物品货架' : '宝物库品类与件数限制货架'}
              </span>
              <span class="text-[11px] font-mono text-slate-500">
                ${isBinary ? `原 ${items.length} 种宝物 → 拆分为 ${derivedPackages.length} 件衍生包` : `共 ${items.length} 种宝物`}
              </span>
            </div>

            <!-- 卡片网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-${Math.min(3, isBinary ? derivedPackages.length : items.length)} gap-3">
              ${
                isBinary
                  ? derivedPackages
                      .map((pkg, idx) => {
                        const isCur = idx === curI;
                        let borderCls = isCur
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-md ring-2 ring-purple-400/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40';

                        return `
                          <div class="relative p-2.5 rounded-xl border flex flex-col gap-2 transition-all ${borderCls}">
                            <div class="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                              <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100">衍生包 #${pkg.id}</span>
                              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                isCur ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }">
                                源宝物 #${pkg.origId} × ${pkg.multiplier}
                              </span>
                            </div>
                            <div class="grid grid-cols-2 gap-1.5 text-center text-xs font-mono">
                              <div class="p-1 rounded bg-slate-100/80 dark:bg-slate-800/80">
                                <div class="text-[9px] text-slate-500">重量</div>
                                <div class="font-bold text-sky-600 dark:text-sky-400">${pkg.weight}</div>
                              </div>
                              <div class="p-1 rounded bg-slate-100/80 dark:bg-slate-800/80">
                                <div class="text-[9px] text-slate-500">价值</div>
                                <div class="font-bold text-amber-600 dark:text-amber-400">+${pkg.value}</div>
                              </div>
                            </div>
                          </div>
                        `;
                      })
                      .join('')
                  : items
                      .map((it, idx) => {
                        const isCur = idx === curI;
                        const takenInfo = inventory.find((inv) => inv.id === it.id);
                        const takenCount = takenInfo ? takenInfo.count : 0;

                        let borderCls = isCur
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-400/40'
                          : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40';

                        return `
                          <div class="relative p-3 rounded-xl border flex flex-col gap-2.5 transition-all ${borderCls}">
                            <div class="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-1.5">
                              <div class="flex items-center gap-1.5">
                                <span class="text-sm">💎</span>
                                <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100">${escapeHtml(it.name)}</span>
                              </div>
                              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                isCur
                                  ? 'bg-amber-500 text-white animate-pulse'
                                  : takenCount > 0
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }">
                                ${
                                  isCur && typeof (step as any)?.k === 'number'
                                    ? ((step as any).k > 0 ? `正在尝试 ×${(step as any).k} 件` : '尝试不选 (0件)')
                                    : takenCount > 0
                                    ? `已装 ×${takenCount} 件`
                                    : `限 ${it.count} 件`
                                }
                              </span>
                            </div>

                            <div class="grid grid-cols-3 gap-1 text-center text-xs font-mono">
                              <div class="p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/80">
                                <div class="text-[9px] text-slate-500">单件重量</div>
                                <div class="font-bold text-sky-600 dark:text-sky-400">${it.weight}</div>
                              </div>
                              <div class="p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/80">
                                <div class="text-[9px] text-slate-500">单件价值</div>
                                <div class="font-bold text-amber-600 dark:text-amber-400">${it.value}</div>
                              </div>
                              <div class="p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/80">
                                <div class="text-[9px] text-slate-500">可用上限</div>
                                <div class="font-bold text-purple-600 dark:text-purple-400">${it.count} 件</div>
                              </div>
                            </div>
                          </div>
                        `;
                      })
                      .join('')
              }
            </div>
          </div>

          <!-- 右侧：宝物载荷舱 (5 列) -->
          <div class="lg:col-span-5 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-sack-dollar text-emerald-600"></i> 背包载荷舱 (Knapsack Container)
              </span>
              <span class="text-[11px] font-mono text-slate-500">剩余容量: ${Math.max(0, capacity - usedWeight)}</span>
            </div>

            <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 flex flex-col gap-3 shadow-xs">
              
              <!-- 重量载荷条 -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">载重使用率</span>
                  <span class="font-mono font-bold text-sky-600 dark:text-sky-400">
                    ${usedWeight} / ${capacity} (${progressPercent}%)
                  </span>
                </div>
                
                <div class="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div
                    class="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-sky-500 to-indigo-500"
                    style="width: ${progressPercent}%;"
                  ></div>
                </div>
              </div>

              <!-- 价值与状态 -->
              <div class="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div class="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80">
                  <div class="text-[10px] text-slate-500">累计宝物价值</div>
                  <div class="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    ${totalVal} 价值
                  </div>
                </div>
                <div class="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80">
                  <div class="text-[10px] text-slate-500">算法求解模式</div>
                  <div class="text-xs font-bold ${isBinary ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'}">
                    ${isBinary ? '二进制拆分 01 转化' : '朴素三重循环枚举'}
                  </div>
                </div>
              </div>

              <!-- 装入清单 -->
              <div class="flex flex-col gap-1.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                <div class="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>💎 包内宝物清单</span>
                  <span class="text-[10px] font-normal text-slate-400">回溯统计</span>
                </div>

                <div class="flex flex-wrap gap-1.5 min-h-[38px] items-center">
                  ${
                    inventory.length === 0
                      ? `<span class="text-[11px] text-slate-400 italic">背包空空如也 (价值 0)</span>`
                      : inventory
                          .map(
                            (it) => `
                              <div class="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono">
                                <span class="font-bold text-amber-700 dark:text-amber-300">${escapeHtml(it.name)}</span>
                                <span class="text-slate-400">×</span>
                                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">${it.count} 件</span>
                                <span class="text-[10px] text-slate-500">(重${it.totalWeight}, 价${it.totalValue})</span>
                              </div>
                            `
                          )
                          .join('')
                  }
                </div>
              </div>

              <!-- 决策看板 -->
              <div class="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 flex flex-col gap-1">
                <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>⚖️ 状态转移决策</span>
                  <span class="font-mono text-[10px]">dp[${curI}][${curJ}]</span>
                </div>
                <div class="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                  ${escapeHtml(step.msg || step.log || '正在推导多重背包状态转移...')}
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
