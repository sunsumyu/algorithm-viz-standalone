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

    container.className = 'w-full h-full flex flex-col relative z-0 bg-transparent border-0 shadow-none p-0 overflow-y-auto';
    container.style.display = 'flex';
    container.style.width = '100%';

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

    container.innerHTML = `
      <div class="knapsack-buckets-sandbox w-full flex flex-col gap-3 p-3 font-sans select-none text-slate-800 dark:text-slate-100">
        <!-- 顶部提示横条 -->
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-emerald-500/10 border border-amber-500/20 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">🗂️</span>
            <span class="font-bold text-amber-700 dark:text-amber-300">分组背包物理决策沙盘</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-600 dark:text-slate-300">组内互斥铁律：<strong class="text-rose-600 dark:text-rose-400">每个桶至多挑选 1 件物品</strong> 放入背包，或 1 件都不选！</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-[11px]">
            <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold">当前组: 桶 #${curG}</span>
            <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-200 font-bold">目标容量: ${curJ} / ${capacity}</span>
          </div>
        </div>

        <!-- 主体区域：左右双栏布局 (左: 各组物品桶，右: 实体背包) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          <!-- 左侧：多组实体存放物品的桶 (7 列) -->
          <div class="lg:col-span-7 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-boxes-stacked text-amber-600"></i> 分组存放物品的桶 (Buckets · 互斥候选池)
              </span>
              <span class="text-[11px] font-mono text-slate-500">共 ${sortedGroupKeys.length} 个独立物品组</span>
            </div>

            <!-- 桶列表容器 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${sortedGroupKeys.map((gNum) => {
                const groupItems = groups.get(gNum) || [];
                const isCurrentGroup = gNum === curG;
                const isPastGroup = gNum < curG;

                // 检查本桶中是否有物品已被装入背包
                const selectedInBucket = bagItems.find((it) => it.group === gNum);

                let bucketBorder = 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60';
                let bucketBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-500';
                let bucketStatus = '待决策 ⏳';

                if (isCurrentGroup) {
                  bucketBorder = 'border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-400/30';
                  bucketBadge = 'bg-amber-500 text-white animate-pulse';
                  bucketStatus = '当前决策组 ⚡';
                } else if (isPastGroup) {
                  bucketBorder = 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-90';
                  bucketBadge = 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300';
                  bucketStatus = selectedInBucket ? `已选物品 #${selectedInBucket.id} ✅` : '本组未选 ⏭️';
                }

                return `
                  <div class="relative p-3 rounded-xl border flex flex-col gap-2 transition-all ${bucketBorder}">
                    <!-- 桶顶盖拟物横条 -->
                    <div class="flex items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-1.5">
                      <div class="flex items-center gap-1.5">
                        <span class="text-sm">🪣</span>
                        <span class="font-extrabold text-xs text-slate-800 dark:text-slate-100">桶 #${gNum} (组 ${gNum})</span>
                      </div>
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${bucketBadge}">${bucketStatus}</span>
                    </div>

                    <!-- 桶内物品卡片列表 -->
                    <div class="flex flex-col gap-2">
                      ${groupItems.map((item) => {
                        const isTrialing = isCurrentGroup && curK === item.id;
                        const isOverweight = item.cost > curJ;
                        const isSelected = selectedInBucket?.id === item.id;
                        const isExcludedByMutual = isCurrentGroup && curK !== undefined && curK !== item.id;

                        let itemClass = 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-2xs';
                        let glowTag = '';

                        if (isTrialing) {
                          itemClass = 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-400 scale-[1.02] z-10';
                          glowTag = '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white shadow whitespace-nowrap animate-bounce">试装入中 ↓</span>';
                        } else if (isSelected) {
                          itemClass = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-400/50';
                          glowTag = '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white whitespace-nowrap">已装入背包 ✅</span>';
                        } else if (isOverweight && isCurrentGroup) {
                          itemClass = 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 opacity-75';
                          glowTag = '<span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 whitespace-nowrap">超重放不下 ❌</span>';
                        } else if (isExcludedByMutual) {
                          itemClass = 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 opacity-60';
                          glowTag = '<span class="text-[9px] font-mono text-slate-500 whitespace-nowrap">🔒 组内互斥锁止</span>';
                        }

                        return `
                          <div class="relative p-2 rounded-lg border flex items-center justify-between gap-2 transition-all ${itemClass}">
                            <div class="flex items-center gap-2">
                              <span class="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">#${item.id}</span>
                              <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-700 dark:text-slate-200">物品 #${item.id}</span>
                                <span class="text-[10px] text-slate-500">组内候选 item</span>
                              </div>
                            </div>

                            <div class="flex items-center gap-2">
                              <div class="flex flex-col items-end text-[11px] font-mono">
                                <span class="text-sky-600 dark:text-sky-400 font-bold">📦 耗容量: ${item.cost}</span>
                                <span class="text-amber-600 dark:text-amber-400 font-bold">💎 得价值: +${item.val}</span>
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
          <div class="lg:col-span-5 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-bag-shopping text-blue-600"></i> 实体物理背包 (Knapsack Container)
              </span>
              <span class="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-extrabold">容量刻度: ${curJ} / ${capacity}</span>
            </div>

            <!-- 背包舱体卡片 -->
            <div class="relative p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-100 to-slate-200/90 dark:from-slate-800/90 dark:to-slate-900/90 shadow-lg flex flex-col gap-3">
              <!-- 背包顶部皮带与提把造型 -->
              <div class="w-16 h-2 mx-auto rounded-full bg-slate-400 dark:bg-slate-600 shadow-inner"></div>

              <!-- 水位指示仪表 -->
              <div class="p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col gap-2 shadow-2xs">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-600 dark:text-slate-300">背包体积填充进度</span>
                  <span class="font-mono font-extrabold ${fillPercent >= 100 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}">${fillPercent}% (${usedCost} / ${curJ})</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
                  <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300" style="width: ${fillPercent}%;"></div>
                </div>

                <div class="grid grid-cols-3 gap-1.5 pt-1 text-center">
                  <div class="p-1 rounded bg-slate-100 dark:bg-slate-700/60">
                    <div class="text-[9px] text-slate-500">已占体积</div>
                    <div class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">${usedCost}</div>
                  </div>
                  <div class="p-1 rounded bg-slate-100 dark:bg-slate-700/60">
                    <div class="text-[9px] text-slate-500">剩余容积</div>
                    <div class="text-xs font-mono font-bold ${curJ >= usedCost ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">${curJ - usedCost}</div>
                  </div>
                  <div class="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                    <div class="text-[9px] text-amber-600 dark:text-amber-400 font-bold">累计总收益</div>
                    <div class="text-sm font-mono font-black text-amber-600 dark:text-amber-300">${totalVal}</div>
                  </div>
                </div>
              </div>

              <!-- 背包内部装入清单 -->
              <div class="flex flex-col gap-1.5">
                <div class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>🎒 包内当前物品陈列:</span>
                  <span class="text-[10px] font-mono text-slate-500">${bagItems.length} 件物品</span>
                </div>

                <div class="min-h-[90px] p-2 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col gap-1.5">
                  ${bagItems.length === 0
                    ? '<div class="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 py-6">背包当前为空 (尚未装入任何物品)</div>'
                    : bagItems.map((it) => `
                        <div class="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                          <div class="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200">
                            <span>🪣 桶 #${it.group}</span>
                            <span class="text-slate-400">·</span>
                            <span>物品 #${it.id}</span>
                          </div>
                          <div class="font-mono text-[11px] flex items-center gap-2">
                            <span class="text-sky-700 dark:text-sky-300">体积: ${it.cost}</span>
                            <span class="text-amber-700 dark:text-amber-300 font-bold">价值: +${it.val}</span>
                          </div>
                        </div>
                      `).join('')}

                  <!-- 若当前有试选物品，显示试装入虚线预览卡 -->
                  ${trialingItem ? `
                    <div class="flex items-center justify-between p-2 rounded-lg border-2 border-dashed border-amber-400 bg-amber-500/10 text-xs animate-pulse">
                      <div class="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200">
                        <span>⚡ 试选放入: 桶 #${trialingItem.group} · 物品 #${trialingItem.id}</span>
                      </div>
                      <div class="font-mono text-[11px] flex items-center gap-2">
                        <span class="text-sky-600 dark:text-sky-400">体积: ${trialingItem.cost}</span>
                        <span class="text-amber-600 dark:text-amber-400 font-bold">价值: +${trialingItem.val}</span>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- 决策比较看板 -->
              <div class="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs flex flex-col gap-1">
                <div class="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <i class="fa-solid fa-scale-balanced text-amber-500"></i>
                  <span>转移决策比较看板</span>
                </div>
                <div class="text-[11px] text-slate-600 dark:text-slate-300">
                  ${trialingItem && candidateVal !== undefined
                    ? `试选桶 #${trialingItem.group} 物品 #${trialingItem.id}: 试选后总价值 <strong>${candidateVal}</strong> vs 当前最优 <strong>${prevVal}</strong> ➔ ${candidateVal > prevVal ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">✅ 价值更高，装入背包更新最优！</span>' : '<span class="text-slate-500 font-bold">保持当前最优</span>'}`
                    : escapeHtml(step.decision || step.msg || step.log || '当前步状态流转稳定')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
