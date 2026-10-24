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
        const fromSameRow = grid[i]?.[remJ - item.weight] ?? 0;
        if (curCell === fromSameRow + item.value && curCell > prevRowCell) {
          counts.set(i, (counts.get(i) || 0) + 1);
          remJ -= item.weight;
          // 继续停留在当前行 i 尝试是否重复选取！
          continue;
        }
      }

      // 如果第一行 i=0 且有非 0 贡献
      if (i === 0 && remJ >= item.weight && curCell > 0) {
        const takeOneFrom0 = (grid[0]?.[remJ - item.weight] ?? 0) + item.value;
        if (curCell === takeOneFrom0 || curCell === Math.floor(remJ / item.weight) * item.value) {
          counts.set(0, Math.floor(curJ / item.weight));
          break;
        }
      }

      // 否则转向上一行
      i--;
    }

    const inventory: HerbInventoryItem[] = [];
    for (const [idx, count] of counts.entries()) {
      if (count > 0 && items[idx]) {
        inventory.push({
          id: idx,
          weight: items[idx].weight,
          value: items[idx].value,
          count,
          totalWeight: items[idx].weight * count,
          totalValue: items[idx].value * count,
        });
      }
    }
    inventory.sort((a, b) => a.id - b.id);
    return inventory;
  }

  /**
   * 渲染拟物沙盘：无限草药池 + 自叠加背包
   */
  public static render(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    if (!container) return;

    container.className = 'w-full h-full flex flex-col relative z-0 bg-transparent border-0 shadow-none p-0 overflow-y-auto';
    container.style.display = 'flex';
    container.style.width = '100%';

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
    const maxMulti = curItem.weight > 0 ? Math.floor(curJ / curItem.weight) : 0;

    const html = `
      <div class="unbounded-knapsack-sandbox w-full flex flex-col gap-3 p-3 font-sans select-none text-slate-800 dark:text-slate-100">
        <!-- 顶部提示横条 -->
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">🌿</span>
            <span class="font-bold text-emerald-700 dark:text-emerald-300">完全背包 (疯狂的采药) 拟物沙盘</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-600 dark:text-slate-300">核心特质：<strong class="text-emerald-600 dark:text-emerald-400">每种草药有无限株可用</strong>，同行左侧转移允许在已采摘的基础上无限自叠加！</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-[11px]">
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold">当前考察: 草药 #${curI}</span>
            <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-200 font-bold">背包容量/时间: j = ${curJ} / ${capacity}</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左 7 列: 无限草药池，右 5 列: 真实自叠加背包) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          <!-- 左侧：无限草药采摘池 (7 列) -->
          <div class="lg:col-span-7 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-seedling text-emerald-600"></i> 无限草药采摘池 (Infinite Herb Pool)
              </span>
              <span class="text-[11px] font-mono text-slate-500">共 ${items.length} 种可用药材 · 每种无限件 (∞)</span>
            </div>

            <!-- 草药卡片网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-${Math.min(3, items.length)} gap-3">
              ${items
                .map((herb, idx) => {
                  const isCurrent = idx === curI;
                  const takenInfo = inventory.find((it) => it.id === idx);
                  const inBagCount = takenInfo ? takenInfo.count : 0;

                  let borderCls = isCurrent
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-400/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40';

                  return `
                    <div class="relative p-3 rounded-xl border flex flex-col gap-2.5 transition-all ${borderCls}">
                      <!-- 药材名称与无限标记 -->
                      <div class="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-1.5">
                        <div class="flex items-center gap-1.5">
                          <span class="text-sm">🌿</span>
                          <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100">草药 #${herb.id}</span>
                        </div>
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isCurrent
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : inBagCount > 0
                            ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }">
                          ${isCurrent ? '当前考察' : inBagCount > 0 ? `包内 ×${inBagCount} 株` : '无限可用 ∞'}
                        </span>
                      </div>

                      <!-- 规格指标卡 -->
                      <div class="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                        <div class="p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/80">
                          <div class="text-[9px] text-slate-500">采药耗时</div>
                          <div class="font-bold text-sky-600 dark:text-sky-400">${herb.weight} 时间</div>
                        </div>
                        <div class="p-1.5 rounded bg-slate-100/80 dark:bg-slate-800/80">
                          <div class="text-[9px] text-slate-500">药用价值</div>
                          <div class="font-bold text-amber-600 dark:text-amber-400">+${herb.value} 价值</div>
                        </div>
                      </div>

                      <!-- 完全背包特性指示卡 -->
                      <div class="p-2 rounded-lg bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-1 text-[11px]">
                        <div class="flex items-center justify-between">
                          <span class="text-slate-500 text-[10px]">当前容量上限 (${curJ}) 最多采:</span>
                          <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${herb.weight > 0 ? Math.floor(curJ / herb.weight) : 0} 株
                          </span>
                        </div>
                        <div class="flex items-center justify-between text-[10px] text-slate-500">
                          <span>同轮已选放入:</span>
                          <span class="font-mono font-bold text-teal-600 dark:text-teal-400">${inBagCount} 株</span>
                        </div>
                      </div>

                      <!-- 试装入状态提示 -->
                      ${
                        isCurrent
                          ? isEnough
                            ? `<div class="text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 py-1 rounded">
                                 ✨ 时间充足！同行左侧 dp[${curI}][${curJ - herb.weight}] 允许无限自叠加
                               </div>`
                            : `<div class="text-center text-[10px] font-bold text-rose-500 bg-rose-500/10 py-1 rounded">
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
          <div class="lg:col-span-5 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-basket-shopping text-emerald-600"></i> 自叠加采药背包舱 (Cumulative Knapsack)
              </span>
              <span class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                总耗时: ${curJ} / ${capacity}
              </span>
            </div>

            <!-- 背包舱体卡片 -->
            <div class="relative p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-900/90 shadow-lg flex flex-col gap-3">
              <!-- 背包提把造型 -->
              <div class="w-16 h-2 mx-auto rounded-full bg-emerald-500 dark:bg-emerald-600 shadow-inner"></div>

              <!-- 水位指示仪表 -->
              <div class="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col gap-2 shadow-2xs">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-600 dark:text-slate-300">采药时间已用配额</span>
                  <span class="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${progressPercent}% (${usedWeight} / ${capacity})
                  </span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
                  <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" style="width: ${progressPercent}%;"></div>
                </div>

                <div class="grid grid-cols-3 gap-1.5 pt-1 text-center">
                  <div class="p-1 rounded bg-slate-100 dark:bg-slate-700/60">
                    <div class="text-[9px] text-slate-500">已耗时间</div>
                    <div class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">${usedWeight}</div>
                  </div>
                  <div class="p-1 rounded bg-slate-100 dark:bg-slate-700/60">
                    <div class="text-[9px] text-slate-500">剩余时间</div>
                    <div class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">${remCapacity}</div>
                  </div>
                  <div class="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                    <div class="text-[9px] text-amber-600 dark:text-amber-400 font-bold">总药用价值</div>
                    <div class="text-sm font-mono font-black text-amber-600 dark:text-amber-300">${totalCollectedVal}</div>
                  </div>
                </div>
              </div>

              <!-- 背包内部装入草药清单 -->
              <div class="flex flex-col gap-1.5">
                <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>🧺 背包内当前草药陈列:</span>
                  <span class="text-[10px] font-mono text-slate-500">${inventory.length} 种草药已装入</span>
                </div>

                <div class="min-h-[90px] p-2 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col gap-1.5">
                  ${
                    inventory.length === 0
                      ? '<div class="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 py-6">背包当前为空 (尚未采摘任何草药)</div>'
                      : inventory
                          .map((it) => {
                            return `
                              <div class="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-emerald-500/30 text-xs shadow-2xs">
                                <div class="flex items-center gap-2">
                                  <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                                    草药 #${it.id}
                                  </span>
                                  <span class="font-extrabold text-teal-600 dark:text-teal-400">× ${it.count} 株</span>
                                </div>
                                <div class="flex items-center gap-2 font-mono">
                                  <span class="text-slate-500 text-[11px]">耗时 ${it.totalWeight}</span>
                                  <span class="text-amber-600 dark:text-amber-400 font-extrabold">+${it.totalValue}</span>
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
                    <div class="flex items-center justify-between p-2 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-500/10 text-xs animate-pulse">
                      <div class="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                        <span>⚡ 正在试选放入: 草药 #${curI} (第 ${(inventory.find((x) => x.id === curI)?.count || 0) + 1} 株)</span>
                      </div>
                      <div class="font-mono text-[11px] flex items-center gap-2">
                        <span class="text-sky-600 dark:text-sky-400">需耗时: ${curItem.weight}</span>
                        <span class="text-amber-600 dark:text-amber-400 font-bold">价值: +${curItem.value}</span>
                      </div>
                    </div>
                  `
                      : ''
                  }
                </div>
              </div>

              <!-- 决策比较看板：完全背包同行自叠加 vs 01 背包分界机理 -->
              <div class="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs flex flex-col gap-1.5">
                <div class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <i class="fa-solid fa-scale-balanced text-amber-500"></i>
                  <span>完全背包转移决策看板 (同行自叠加机制)</span>
                </div>
                <div class="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                  ${escapeHtml(step.decision || step.msg || '完全背包状态转移推导中')}
                </div>
                <div class="text-[10px] text-slate-500 border-t border-dashed border-emerald-200/60 dark:border-emerald-800/60 pt-1">
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
